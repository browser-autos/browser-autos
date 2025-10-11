import { moduleLogger } from '../../utils/logger';

const logger = moduleLogger('queue');

// 懒加载队列管理器和任务处理器（避免在导入时立即连接 Redis）
let _queueManager: any = null;
let _taskProcessor: any = null;

function getQueueManager() {
  if (!_queueManager) {
    const { QueueManager } = require('./QueueManager');
    _queueManager = new QueueManager();
  }
  return _queueManager;
}

function getTaskProcessor() {
  if (!_taskProcessor) {
    const { TaskProcessor } = require('./TaskProcessor');
    _taskProcessor = new TaskProcessor();
  }
  return _taskProcessor;
}

/**
 * 初始化队列系统
 */
export function initializeQueue(): void {
  try {
    logger.info('Initializing queue system');

    const queueManager = getQueueManager();
    const taskProcessor = getTaskProcessor();

    // 注册任务处理器
    queueManager.process(async (task: any) => {
      return await taskProcessor.processTask(task);
    });

    // 监听队列事件
    queueManager.on('task:started', (task: any) => {
      logger.debug({ taskId: task.id, type: task.type }, 'Task started');
    });

    queueManager.on('task:completed', (task: any) => {
      logger.info({ taskId: task.id, type: task.type }, 'Task completed');
    });

    queueManager.on('task:failed', (task: any) => {
      logger.error({ taskId: task.id, type: task.type, error: task.error }, 'Task failed');
    });

    queueManager.on('task:progress', (data: any) => {
      logger.debug({ taskId: data.id, progress: data.progress }, 'Task progress');
    });

    queueManager.on('task:stalled', (data: any) => {
      logger.warn({ taskId: data.id }, 'Task stalled');
    });

    queueManager.on('queue:error', (error: any) => {
      logger.error({ error }, 'Queue error');
    });

    logger.info('Queue system initialized successfully');
  } catch (error) {
    logger.warn({ error }, 'Failed to initialize queue system - Redis may not be available. Queue features will be disabled.');
  }
}

/**
 * 关闭队列系统
 */
export async function shutdownQueue(): Promise<void> {
  if (!_queueManager) {
    logger.info('Queue system not initialized, skipping shutdown');
    return;
  }

  logger.info('Shutting down queue system');
  await _queueManager.destroy();
  logger.info('Queue system shut down');
}

/**
 * 导出队列管理器（懒加载）
 */
export const queueManager = new Proxy({} as any, {
  get(target, prop) {
    return getQueueManager()[prop];
  }
});

/**
 * 导出任务处理器（懒加载）
 */
export const taskProcessor = new Proxy({} as any, {
  get(target, prop) {
    return getTaskProcessor()[prop];
  }
});

// 重新导出类和类型（使用 type-only exports 避免触发模块加载）
export { QueueManager } from './QueueManager';
export { TaskProcessor } from './TaskProcessor';
