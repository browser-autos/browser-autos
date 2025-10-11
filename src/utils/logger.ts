import pino from 'pino';
import type { Logger as PinoLogger } from 'pino';

/**
 * Logger 配置选项
 */
interface LoggerOptions {
  level?: string;
  pretty?: boolean;
  name?: string;
}

/**
 * 创建日志记录器实例
 * @param options 日志配置选项
 * @returns Pino Logger 实例
 */
export function createLogger(options: LoggerOptions = {}): PinoLogger {
  const {
    level = process.env.LOG_LEVEL || 'info',
    pretty = process.env.NODE_ENV !== 'production',
    name = 'browser-autos-api',
  } = options;

  const config: pino.LoggerOptions = {
    level,
    name,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  // 开发环境使用 pretty 格式
  if (pretty) {
    return pino(
      config,
      pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      })
    );
  }

  // 生产环境使用 JSON 格式
  return pino(config);
}

/**
 * 默认 Logger 实例
 */
export const logger = createLogger();

/**
 * 创建子 Logger
 * @param bindings 绑定的上下文信息
 * @returns 子 Logger 实例
 */
export function childLogger(bindings: Record<string, unknown>): PinoLogger {
  return logger.child(bindings);
}

/**
 * 创建带模块名称的 Logger
 * @param moduleName 模块名称
 * @returns Logger 实例
 */
export function moduleLogger(moduleName: string): PinoLogger {
  return childLogger({ module: moduleName });
}

export default logger;
