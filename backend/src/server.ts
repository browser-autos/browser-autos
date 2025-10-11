import Fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { logger } from './utils/logger';

// 扩展 FastifyRequest 类型以包含 startTime
declare module 'fastify' {
  interface FastifyRequest {
    startTime?: number;
  }
}

/**
 * 创建并配置 Fastify 服务器
 */
export async function createServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: logger as any,
    disableRequestLogging: true,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
  });

  // 注册插件
  await registerPlugins(server);

  // 注册中间件
  await registerMiddleware(server);

  // 注册路由
  await registerRoutes(server);

  // 错误处理
  server.setErrorHandler((error, request, reply) => {
    logger.error(
      {
        error,
        requestId: request.id,
        url: request.url,
        method: request.method,
      },
      'Request error'
    );

    reply.status(error.statusCode || 500).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Internal server error',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // 404 处理
  server.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method}:${request.url} not found`,
      },
      timestamp: new Date().toISOString(),
    });
  });

  return server;
}

/**
 * 注册 Fastify 插件
 */
async function registerPlugins(server: FastifyInstance) {
  // Swagger/OpenAPI (需要先注册，在路由之前)
  const swagger = await import('@fastify/swagger');
  const swaggerUi = await import('@fastify/swagger-ui');
  const { swaggerConfig, swaggerUiConfig } = await import('./config/swagger');

  await server.register(swagger.default, swaggerConfig);
  await server.register(swaggerUi.default, swaggerUiConfig);

  // CORS
  await server.register(cors, {
    origin: config.corsOrigin,
    credentials: config.corsCredentials,
  });

  // Security headers (disabled CSP for Swagger UI)
  await server.register(helmet, {
    contentSecurityPolicy: false,
    global: true,
  });

  // Rate limiting (暂时禁用 Redis，先用内存模式)
  await server.register(rateLimit, {
    max: config.rateLimitMax,
    timeWindow: config.rateLimitWindow,
  });

  // 注意: WebSocket 连接通过 HTTP upgrade 事件手动处理
  // 不使用 @fastify/websocket 插件以避免冲突
}

/**
 * 注册中间件
 */
async function registerMiddleware(server: FastifyInstance) {
  // Prometheus 指标收集中间件
  server.addHook('onRequest', async (request, reply) => {
    request.startTime = Date.now();
  });

  server.addHook('onResponse', async (request, reply) => {
    const { recordHttpRequest } = await import('./utils/metrics');
    const duration = (Date.now() - (request.startTime || Date.now())) / 1000;

    // 简化路径以减少基数
    let path = request.url;
    if (path === '/') path = '/';
    else if (path.startsWith('/auth')) path = '/auth';
    else if (path.startsWith('/screenshot')) path = '/screenshot';
    else if (path.startsWith('/pdf')) path = '/pdf';
    else if (path.startsWith('/content')) path = '/content';
    else if (path.startsWith('/scrape')) path = '/scrape';
    else if (path.startsWith('/ws')) path = '/ws';
    else if (path.startsWith('/health')) path = '/health';
    else if (path.startsWith('/metrics')) path = '/metrics';
    else path = '/other';

    recordHttpRequest(request.method, path, reply.statusCode, duration);
  });
}

/**
 * 注册路由
 */
async function registerRoutes(server: FastifyInstance) {
  // Metrics endpoint
  server.get('/metrics', async (request, reply) => {
    const { register, updateBrowserPoolMetrics, updateQueueMetrics } = await import('./utils/metrics');
    const { browserPool } = await import('./core/browser/BrowserPool');

    // 更新浏览器池指标
    const poolStats = browserPool.getStats();
    updateBrowserPoolMetrics(poolStats);

    // 更新队列指标 (如果启用)
    if (config.enableQueue && config.redisUrl) {
      const { queueManager } = await import('./core/queue');
      const queueStats = await queueManager.getStats();
      updateQueueMetrics(queueStats);
    }

    reply.header('Content-Type', register.contentType);
    return register.metrics();
  });

  // Health check
  server.get('/health', async (request, reply) => {
    const { browserPool } = await import('./core/browser/BrowserPool');
    const { sessionManager } = await import('./core/session/SessionManager');
    const poolStats = browserPool.getStats();
    const sessionStats = sessionManager.getStats();

    // 队列统计 (如果启用)
    let queueStats = null;
    if (config.enableQueue && config.redisUrl) {
      const { queueManager } = await import('./core/queue');
      queueStats = await queueManager.getStats();
    }

    return {
      success: true,
      data: {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        browserPool: poolStats,
        sessions: sessionStats,
        queue: queueStats || {
          enabled: false,
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
        },
      },
    };
  });

  // API info
  server.get('/', async (request, reply) => {
    return {
      success: true,
      data: {
        name: 'Browser.autos API',
        version: '1.0.0',
        description: 'Browser automation CDP API service',
        endpoints: {
          health: '/health',
          auth: '/auth',
          screenshot: '/screenshot',
          pdf: '/pdf',
          content: '/content',
          scrape: '/scrape',
          sessions: '/sessions',
          queue: '/queue',
          ws: '/ws',
          metrics: '/metrics',
          docs: '/docs',
        },
      },
    };
  });

  // 注册 Auth API
  const { authRoutes } = await import('./api/rest/auth.route');
  await server.register(authRoutes);

  // 注册 Screenshot API
  const { registerScreenshotRoutes } = await import('./api/rest/screenshot.route');
  await registerScreenshotRoutes(server);

  // 注册 PDF API
  const { registerPdfRoutes } = await import('./api/rest/pdf.route');
  await registerPdfRoutes(server);

  // 注册 Content API
  const { registerContentRoutes } = await import('./api/rest/content.route');
  await registerContentRoutes(server);

  // 注册 Scrape API
  const { registerScrapeRoutes } = await import('./api/rest/scrape.route');
  await registerScrapeRoutes(server);

  // 注册 Session API
  const { registerSessionRoutes } = await import('./api/rest/session.route');
  await registerSessionRoutes(server);

  // 注册 WebSocket Proxy
  const { registerProxyRoutes } = await import('./api/websocket/proxy.route');
  await registerProxyRoutes(server);

  // 注册 Queue API (如果启用)
  if (config.enableQueue && config.redisUrl) {
    const { registerQueueRoutes } = await import('./api/rest/queue.route');
    await registerQueueRoutes(server);
  } else {
    logger.info({ module: 'queue-route' }, 'Queue routes skipped (queue disabled)');
  }
}

/**
 * 启动服务器
 */
export async function startServer(): Promise<FastifyInstance> {
  const server = await createServer();

  try {
    await server.listen({
      port: config.port,
      host: config.host,
    });

    logger.info(
      {
        port: config.port,
        host: config.host,
      },
      'Server started successfully'
    );

    return server;
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    throw error;
  }
}
