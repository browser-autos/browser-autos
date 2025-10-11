import { EventEmitter } from 'events';
import Queue from 'bull';
import {
  Task,
  TaskConfig,
  TaskPriority,
  TaskStatus,
  TaskType,
  QueueStats,
  QueueStatus,
  QueueEvent,
  BackoffConfig,
} from '../../types/queue.types';
import { moduleLogger } from '../../utils/logger';
import { config } from '../../config';
import { randomUUID } from 'crypto';

const logger = moduleLogger('queue-manager');

/**
 * Queue Manager
 * 功能：管理任务队列、调度和执行
 */
export class QueueManager extends EventEmitter {
  private queue: Queue.Queue<Task>;
  private activeTasks = new Map<string, Task>();
  private stats = {
    totalProcessed: 0,
    totalFailed: 0,
    totalCompleted: 0,
  };

  constructor(
    private readonly redisUrl: string = config.redisUrl || 'redis://localhost:6379',
    private readonly concurrency: number = 5
  ) {
    super();

    // 初始化 Bull 队列
    this.queue = new Queue('browser-tasks', this.redisUrl, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100, // 保留最近 100 个完成的任务
        removeOnFail: 500, // 保留最近 500 个失败的任务
      },
      settings: {
        maxStalledCount: 3, // 最多重试 3 次停滞任务
        stalledInterval: 30000, // 每 30 秒检查停滞任务
      },
    });

    this.setupQueueHandlers();
    logger.info({ redisUrl: this.redisUrl, concurrency }, 'Queue manager initialized');
  }

  /**
   * 添加任务到队列
   */
  async addTask(config: TaskConfig): Promise<Task> {
    const taskId = config.id || randomUUID();

    const task: Task = {
      id: taskId,
      type: config.type,
      config,
      status: TaskStatus.WAITING,
      priority: config.priority || TaskPriority.NORMAL,
      createdAt: new Date(),
      attempts: 0,
    };

    logger.info({ taskId, type: config.type }, 'Adding task to queue');

    try {
      // 添加到 Bull 队列
      const job = await this.queue.add(task, {
        jobId: taskId,
        priority: this.getPriorityValue(task.priority),
        attempts: config.maxRetries || 3,
        backoff: config.backoff ? {
          type: config.backoff.type,
          delay: config.backoff.delay,
        } : undefined,
        timeout: config.timeout,
      });

      logger.info({ taskId, jobId: job.id }, 'Task added to queue');

      this.emit('task:added', task);

      return task;
    } catch (error) {
      logger.error({ error, taskId }, 'Failed to add task to queue');
      throw error;
    }
  }

  /**
   * 获取任务状态
   */
  async getTask(taskId: string): Promise<Task | null> {
    try {
      const job = await this.queue.getJob(taskId);
      if (!job) {
        return null;
      }

      const task: Task = {
        ...job.data,
        status: await this.getJobStatus(job),
        attempts: job.attemptsMade,
        progress: job.progress(),
        result: job.returnvalue,
        error: job.failedReason,
        startedAt: job.processedOn ? new Date(job.processedOn) : undefined,
        completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
      };

      return task;
    } catch (error) {
      logger.error({ error, taskId }, 'Failed to get task');
      return null;
    }
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<boolean> {
    try {
      const job = await this.queue.getJob(taskId);
      if (!job) {
        return false;
      }

      await job.remove();
      logger.info({ taskId }, 'Task cancelled');

      this.emit('task:cancelled', { id: taskId });

      return true;
    } catch (error) {
      logger.error({ error, taskId }, 'Failed to cancel task');
      return false;
    }
  }

  /**
   * 重试失败的任务
   */
  async retryTask(taskId: string): Promise<boolean> {
    try {
      const job = await this.queue.getJob(taskId);
      if (!job) {
        return false;
      }

      await job.retry();
      logger.info({ taskId }, 'Task retried');

      this.emit('task:retried', { id: taskId });

      return true;
    } catch (error) {
      logger.error({ error, taskId }, 'Failed to retry task');
      return false;
    }
  }

  /**
   * 获取队列统计信息
   */
  async getStats(): Promise<QueueStats> {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.queue.getWaitingCount(),
        this.queue.getActiveCount(),
        this.queue.getCompletedCount(),
        this.queue.getFailedCount(),
        this.queue.getDelayedCount(),
      ]);

      return {
        waiting,
        active,
        completed,
        failed,
        delayed,
        total: waiting + active + completed + failed + delayed,
        totalProcessed: this.stats.totalProcessed,
        totalCompleted: this.stats.totalCompleted,
        totalFailed: this.stats.totalFailed,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get queue stats');
      throw error;
    }
  }

  /**
   * 获取队列状态
   */
  async getStatus(): Promise<QueueStatus> {
    try {
      const isPaused = await this.queue.isPaused();
      const stats = await this.getStats();

      return {
        name: this.queue.name,
        isPaused,
        isHealthy: true, // TODO: 实现健康检查逻辑
        stats,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get queue status');
      throw error;
    }
  }

  /**
   * 暂停队列
   */
  async pause(): Promise<void> {
    await this.queue.pause();
    logger.info('Queue paused');
    this.emit('queue:paused');
  }

  /**
   * 恢复队列
   */
  async resume(): Promise<void> {
    await this.queue.resume();
    logger.info('Queue resumed');
    this.emit('queue:resumed');
  }

  /**
   * 清空队列
   */
  async empty(): Promise<void> {
    await this.queue.empty();
    logger.info('Queue emptied');
    this.emit('queue:emptied');
  }

  /**
   * 清理已完成和失败的任务
   */
  async clean(grace: number = 0): Promise<void> {
    await Promise.all([
      this.queue.clean(grace, 'completed'),
      this.queue.clean(grace, 'failed'),
    ]);
    logger.info({ grace }, 'Queue cleaned');
    this.emit('queue:cleaned');
  }

  /**
   * 获取所有等待中的任务
   */
  async getWaitingTasks(): Promise<Task[]> {
    const jobs = await this.queue.getWaiting();
    return jobs.map(job => this.jobToTask(job));
  }

  /**
   * 获取所有活跃任务
   */
  async getActiveTasks(): Promise<Task[]> {
    const jobs = await this.queue.getActive();
    return jobs.map(job => this.jobToTask(job));
  }

  /**
   * 获取所有失败任务
   */
  async getFailedTasks(): Promise<Task[]> {
    const jobs = await this.queue.getFailed();
    return jobs.map(job => this.jobToTask(job));
  }

  /**
   * 设置任务处理器
   */
  process(processor: (task: Task) => Promise<any>): void {
    this.queue.process(this.concurrency, async (job) => {
      const task = job.data;

      logger.info({ taskId: task.id, type: task.type }, 'Processing task');

      this.activeTasks.set(task.id, task);
      this.emit('task:started', task);

      try {
        const result = await processor(task);

        this.stats.totalProcessed++;
        this.stats.totalCompleted++;
        this.activeTasks.delete(task.id);

        logger.info({ taskId: task.id, type: task.type }, 'Task completed');
        this.emit('task:completed', { ...task, result });

        return result;
      } catch (error) {
        this.stats.totalProcessed++;
        this.stats.totalFailed++;
        this.activeTasks.delete(task.id);

        logger.error({ error, taskId: task.id, type: task.type }, 'Task failed');
        this.emit('task:failed', { ...task, error });

        throw error;
      }
    });

    logger.info({ concurrency: this.concurrency }, 'Task processor registered');
  }

  /**
   * 销毁队列管理器
   */
  async destroy(): Promise<void> {
    logger.info('Destroying queue manager');

    await this.queue.close();
    this.activeTasks.clear();
    this.removeAllListeners();

    logger.info('Queue manager destroyed');
  }

  /**
   * 设置队列事件处理器
   */
  private setupQueueHandlers(): void {
    // 任务完成
    this.queue.on('completed', (job, result) => {
      logger.debug({ jobId: job.id, result }, 'Job completed');
    });

    // 任务失败
    this.queue.on('failed', (job, err) => {
      logger.warn({ jobId: job.id, error: err.message }, 'Job failed');
    });

    // 任务进度更新
    this.queue.on('progress', (job, progress) => {
      logger.debug({ jobId: job.id, progress }, 'Job progress');
      this.emit('task:progress', { id: job.id, progress });
    });

    // 任务停滞
    this.queue.on('stalled', (job) => {
      logger.warn({ jobId: job.id }, 'Job stalled');
      this.emit('task:stalled', { id: job.id });
    });

    // 队列错误
    this.queue.on('error', (error) => {
      logger.error({ error }, 'Queue error');
      this.emit('queue:error', error);
    });

    // 队列清理
    this.queue.on('cleaned', (jobs, type) => {
      logger.info({ count: jobs.length, type }, 'Jobs cleaned');
    });

    logger.info('Queue event handlers registered');
  }

  /**
   * 获取任务优先级数值
   */
  private getPriorityValue(priority: TaskPriority): number {
    const priorityMap = {
      [TaskPriority.LOW]: 10,
      [TaskPriority.NORMAL]: 5,
      [TaskPriority.HIGH]: 2,
      [TaskPriority.CRITICAL]: 1,
    };
    return priorityMap[priority];
  }

  /**
   * 获取 Job 状态
   */
  private async getJobStatus(job: Queue.Job): Promise<TaskStatus> {
    const state = await job.getState();

    const stateMap: Record<string, TaskStatus> = {
      'waiting': TaskStatus.WAITING,
      'active': TaskStatus.ACTIVE,
      'completed': TaskStatus.COMPLETED,
      'failed': TaskStatus.FAILED,
      'delayed': TaskStatus.DELAYED,
    };

    return stateMap[state] || TaskStatus.WAITING;
  }

  /**
   * 转换 Job 为 Task
   */
  private jobToTask(job: Queue.Job<Task>): Task {
    return {
      ...job.data,
      attempts: job.attemptsMade,
      progress: job.progress(),
      result: job.returnvalue,
      error: job.failedReason,
      startedAt: job.processedOn ? new Date(job.processedOn) : undefined,
      completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
    };
  }
}
