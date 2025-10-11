import { FastifyInstance } from 'fastify';
import { moduleLogger } from '../../utils/logger';
import { randomUUID } from 'crypto';
import puppeteer, { Browser } from 'puppeteer-core';
import { config, getChromeArgs } from '../../config';
import * as http from 'http';
import * as net from 'net';
import { URL } from 'url';

const logger = moduleLogger('proxy-route');

// 存储活跃的浏览器会话
const activeSessions = new Map<string, Browser>();

/**
 * 注册 WebSocket Proxy 路由
 *
 * 使用 HTTP upgrade 机制直接代理 WebSocket 连接到 Chrome
 * 这比消息级别的转发更高效且更可靠
 */
export async function registerProxyRoutes(server: FastifyInstance) {
  // 注册一个 GET /ws 路由来防止 Fastify 返回 404
  // 实际的 WebSocket 连接会被 upgrade 事件处理
  server.get('/ws', async (request, reply) => {
    // 这个处理器通常不会被调用，因为 upgrade 事件会先处理
    // 但如果有人直接访问 /ws 而不是 WebSocket 连接，返回信息
    return reply.code(426).send({
      success: false,
      error: {
        code: 'UPGRADE_REQUIRED',
        message: 'This endpoint requires WebSocket protocol',
      },
    });
  });

  // 获取底层 HTTP 服务器
  const httpServer = server.server;

  // 监听 HTTP upgrade 事件 (WebSocket 握手)
  httpServer.on('upgrade', async (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    const url = request.url || '';

    // 只处理 /ws 路径的 upgrade 请求
    if (!url.startsWith('/ws')) {
      socket.destroy();
      return;
    }

    const sessionId = randomUUID();
    const clientIp = request.headers['x-forwarded-for'] || request.socket.remoteAddress;

    logger.info({
      sessionId,
      clientIp,
      userAgent: request.headers['user-agent'],
    }, 'WebSocket upgrade request received');

    try {
      // TODO: 认证检查 (从 query 或 header 获取 token/apiKey)

      // 启动专属的 Chrome 实例
      logger.info({ sessionId }, 'Launching Chrome instance');

      const browser = await puppeteer.launch({
        executablePath: config.chromeExecutablePath || undefined,
        headless: true,
        args: getChromeArgs(),
      });

      const wsEndpoint = browser.wsEndpoint();
      logger.info({ sessionId, wsEndpoint }, 'Chrome launched');

      // 保存会话以便后续清理
      activeSessions.set(sessionId, browser);

      // 解析 Chrome WebSocket URL
      const targetUrl = new URL(wsEndpoint);

      // 创建到 Chrome 的 TCP 连接
      const proxySocket = net.connect({
        host: targetUrl.hostname,
        port: parseInt(targetUrl.port),
      });

      // 等待代理 socket 连接
      await new Promise<void>((resolve, reject) => {
        proxySocket.once('connect', () => {
          logger.info({ sessionId }, 'Connected to Chrome WebSocket');
          resolve();
        });
        proxySocket.once('error', reject);
      });

      // 移除错误监听器
      proxySocket.removeAllListeners('error');

      // 构造 WebSocket upgrade 请求转发到 Chrome
      const upgradeRequest = [
        `GET ${targetUrl.pathname} HTTP/1.1`,
        `Host: ${targetUrl.host}`,
        `Upgrade: websocket`,
        `Connection: Upgrade`,
        `Sec-WebSocket-Key: ${request.headers['sec-websocket-key']}`,
        `Sec-WebSocket-Version: ${request.headers['sec-websocket-version']}`,
        ``,
        ``
      ].join('\r\n');

      proxySocket.write(upgradeRequest);

      // 等待 Chrome 的 upgrade 响应
      let upgradeComplete = false;
      proxySocket.once('data', (data: Buffer) => {
        upgradeComplete = true;

        // 将 Chrome 的 upgrade 响应转发给客户端
        socket.write(data);

        // 现在开始双向数据转发
        proxySocket.pipe(socket);
        socket.pipe(proxySocket);

        logger.info({ sessionId }, 'WebSocket tunnel established');
      });

      // 清理函数
      const cleanup = async () => {
        try {
          socket.destroy();
          proxySocket.destroy();

          const browser = activeSessions.get(sessionId);
          if (browser) {
            activeSessions.delete(sessionId);
            await browser.close();
            logger.info({ sessionId }, 'Chrome instance closed');
          }
        } catch (error) {
          logger.error({ error, sessionId }, 'Error during cleanup');
        }
      };

      // 处理连接错误和关闭
      socket.on('error', (error) => {
        logger.error({ error: error.message, sessionId }, 'Client socket error');
        cleanup();
      });

      socket.on('close', () => {
        logger.info({ sessionId }, 'Client disconnected');
        cleanup();
      });

      proxySocket.on('error', (error) => {
        logger.error({ error: error.message, sessionId }, 'Chrome socket error');
        cleanup();
      });

      proxySocket.on('close', () => {
        logger.info({ sessionId }, 'Chrome connection closed');
        cleanup();
      });

    } catch (error) {
      logger.error({
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
        } : error,
        sessionId,
      }, 'Failed to establish WebSocket proxy');

      socket.destroy();
    }
  });

  logger.info('WebSocket proxy (HTTP upgrade) routes registered');
}
