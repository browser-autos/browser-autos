import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

// 加载环境变量
dotenv.config();

/**
 * 自动检测 Playwright Chromium 路径
 */
function detectPlaywrightChromium(): string | undefined {
  const playwrightPath = process.env.PLAYWRIGHT_BROWSERS_PATH || '/ms-playwright';

  if (!existsSync(playwrightPath)) {
    return undefined;
  }

  try {
    // 查找 chromium-* 目录
    const dirs = readdirSync(playwrightPath);
    const chromiumDir = dirs.find(dir => dir.startsWith('chromium-'));

    if (!chromiumDir) {
      return undefined;
    }

    // 构建 chrome 可执行文件路径
    const chromePath = join(playwrightPath, chromiumDir, 'chrome-linux', 'chrome');

    if (existsSync(chromePath)) {
      logger.info({ chromePath }, 'Auto-detected Playwright Chromium');
      return chromePath;
    }
  } catch (error) {
    logger.warn({ error }, 'Failed to auto-detect Playwright Chromium');
  }

  return undefined;
}

/**
 * 配置验证 Schema
 */
const configSchema = z.object({
  // 服务配置
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().min(1).max(65535).default(3000),
  host: z.string().default('0.0.0.0'),
  logLevel: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // 认证配置
  jwtSecret: z.string().min(1),
  tokenExpiry: z.string().default('30d'),
  requireAuth: z.coerce.boolean().default(true), // 是否要求认证（生产环境应该为 true）

  // 默认用户凭据配置
  defaultAdminUsername: z.string().default('browserautos'),
  defaultAdminPassword: z.string().default('browser.autos'),
  defaultAdminEmail: z.string().email().default('admin@browser.autos'),
  defaultApiUsername: z.string().default('api-user'),
  defaultApiPassword: z.string().default('browser.autos'),
  defaultApiEmail: z.string().email().default('api@browser.autos'),

  // Chrome 配置
  maxConcurrentSessions: z.coerce.number().min(1).max(100).default(10),
  sessionTimeout: z.coerce.number().min(1000).default(300000),
  maxSessionDuration: z.coerce.number().min(1000).default(3600000),
  chromeExecutablePath: z.string().optional(),

  // 浏览器池配置
  browserPoolMin: z.coerce.number().min(0).max(50).default(2),
  browserPoolMax: z.coerce.number().min(1).max(100).default(10),
  browserMaxAge: z.coerce.number().min(60000).default(3600000),

  // 队列配置 (可选 - Redis)
  redisUrl: z.string().url().optional(),
  queueName: z.string().default('browser-tasks'),
  queueMaxConcurrent: z.coerce.number().min(1).max(50).default(5),
  queueTimeout: z.coerce.number().min(1000).default(120000),
  queueRetries: z.coerce.number().min(0).max(10).default(3),
  enableQueue: z.coerce.boolean().default(false), // 默认禁用队列

  // 监控配置
  enableMetrics: z.coerce.boolean().default(true),
  metricsPort: z.coerce.number().min(1).max(65535).default(9090),

  // 资源限制
  maxMemoryPerBrowser: z.coerce.number().min(128).max(8192).default(512),
  maxCpuPerBrowser: z.coerce.number().min(10).max(100).default(50),

  // 速率限制
  rateLimitWindow: z.coerce.number().min(1000).default(900000),
  rateLimitMax: z.coerce.number().min(1).default(100),

  // CORS 配置
  corsOrigin: z.string().default('*'),
  corsCredentials: z.coerce.boolean().default(true),
});

/**
 * 配置类型
 */
export type Config = z.infer<typeof configSchema>;

/**
 * 加载并验证配置
 */
function loadConfig(): Config {
  try {
    const rawConfig = {
      // 服务配置
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      host: process.env.HOST,
      logLevel: process.env.LOG_LEVEL,

      // 认证配置
      jwtSecret: process.env.JWT_SECRET,
      tokenExpiry: process.env.TOKEN_EXPIRY,
      requireAuth: process.env.REQUIRE_AUTH,

      // 默认用户凭据配置
      defaultAdminUsername: process.env.DEFAULT_ADMIN_USERNAME,
      defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD,
      defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL,
      defaultApiUsername: process.env.DEFAULT_API_USERNAME,
      defaultApiPassword: process.env.DEFAULT_API_PASSWORD,
      defaultApiEmail: process.env.DEFAULT_API_EMAIL,

      // Chrome 配置
      maxConcurrentSessions: process.env.MAX_CONCURRENT_SESSIONS,
      sessionTimeout: process.env.SESSION_TIMEOUT,
      maxSessionDuration: process.env.MAX_SESSION_DURATION,
      chromeExecutablePath: process.env.CHROME_EXECUTABLE_PATH,

      // 浏览器池配置
      browserPoolMin: process.env.BROWSER_POOL_MIN,
      browserPoolMax: process.env.BROWSER_POOL_MAX,
      browserMaxAge: process.env.BROWSER_MAX_AGE,

      // 队列配置 (可选)
      redisUrl: process.env.REDIS_URL,
      enableQueue: process.env.ENABLE_QUEUE,
      queueName: process.env.QUEUE_NAME,
      queueMaxConcurrent: process.env.QUEUE_MAX_CONCURRENT,
      queueTimeout: process.env.QUEUE_TIMEOUT,
      queueRetries: process.env.QUEUE_RETRIES,

      // 监控配置
      enableMetrics: process.env.ENABLE_METRICS,
      metricsPort: process.env.METRICS_PORT,

      // 资源限制
      maxMemoryPerBrowser: process.env.MAX_MEMORY_PER_BROWSER,
      maxCpuPerBrowser: process.env.MAX_CPU_PER_BROWSER,

      // 速率限制
      rateLimitWindow: process.env.RATE_LIMIT_WINDOW,
      rateLimitMax: process.env.RATE_LIMIT_MAX,

      // CORS 配置
      corsOrigin: process.env.CORS_ORIGIN,
      corsCredentials: process.env.CORS_CREDENTIALS,
    };

    const config = configSchema.parse(rawConfig);

    // 如果未设置 chromeExecutablePath，自动检测 Playwright Chromium
    if (!config.chromeExecutablePath) {
      const detected = detectPlaywrightChromium();
      if (detected) {
        config.chromeExecutablePath = detected;
      }
    }

    // 验证浏览器池配置逻辑
    if (config.browserPoolMin > config.browserPoolMax) {
      throw new Error('BROWSER_POOL_MIN cannot be greater than BROWSER_POOL_MAX');
    }

    logger.info(
      {
        nodeEnv: config.nodeEnv,
        port: config.port,
        host: config.host,
        maxConcurrentSessions: config.maxConcurrentSessions,
      },
      'Configuration loaded successfully'
    );

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error({ errors: error.errors }, 'Configuration validation failed');
      throw new Error(`Invalid configuration: ${error.errors.map((e) => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * 全局配置实例
 */
export const config = loadConfig();

/**
 * 获取 Chrome 启动参数
 */
export function getChromeArgs(): string[] {
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-software-rasterizer',
    `--max-old-space-size=${config.maxMemoryPerBrowser}`,
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-component-extensions-with-background-pages',
    '--disable-extensions',
    '--disable-features=TranslateUI',
    '--disable-ipc-flooding-protection',
    '--disable-renderer-backgrounding',
    '--enable-features=NetworkService,NetworkServiceInProcess',
    '--force-color-profile=srgb',
    '--hide-scrollbars',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-zygote',
  ];

  return args;
}

/**
 * 判断是否为生产环境
 */
export function isProduction(): boolean {
  return config.nodeEnv === 'production';
}

/**
 * 判断是否为开发环境
 */
export function isDevelopment(): boolean {
  return config.nodeEnv === 'development';
}

/**
 * 判断是否为测试环境
 */
export function isTest(): boolean {
  return config.nodeEnv === 'test';
}

export default config;
