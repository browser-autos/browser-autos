import { startServer } from './server';
import { logger } from './utils/logger';
import { config } from './config';
import { initializeQueue, shutdownQueue } from './core/queue';

/**
 * 应用入口
 */
async function main() {
  try {
    logger.info(
      {
        version: '1.0.0',
        nodeEnv: config.nodeEnv,
        port: config.port,
        queueEnabled: config.enableQueue,
      },
      'Starting Browser.autos API Server'
    );

    // 初始化队列系统 (如果启用)
    if (config.enableQueue) {
      if (!config.redisUrl) {
        logger.warn('Queue is enabled but REDIS_URL is not set. Queue functionality will be disabled.');
      } else {
        initializeQueue();
        logger.info('Queue system initialized');
      }
    } else {
      logger.info('Queue system disabled (ENABLE_QUEUE=false)');
    }

    // 启动服务器
    const server = await startServer();

    // 优雅关闭处理
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Received shutdown signal');

      try {
        // 关闭队列系统 (如果启用)
        if (config.enableQueue && config.redisUrl) {
          await shutdownQueue();
        }

        // 关闭服务器
        await server.close();
        logger.info('Server closed successfully');
        process.exit(0);
      } catch (error) {
        logger.error({ error }, 'Error during shutdown');
        process.exit(1);
      }
    };

    // 监听关闭信号
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // 未捕获异常处理
    process.on('unhandledRejection', (reason, promise) => {
      logger.error(
        {
          reason,
          promise,
        },
        'Unhandled Promise Rejection'
      );
    });

    process.on('uncaughtException', (error) => {
      logger.error({ error }, 'Uncaught Exception');
      shutdown('UNCAUGHT_EXCEPTION');
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// 启动应用
main();
