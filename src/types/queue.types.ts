/**
 * Queue 相关类型定义
 */

/**
 * 任务优先级
 */
export enum TaskPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 20,
}

/**
 * 任务状态
 */
export enum TaskStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
}

/**
 * 任务类型
 */
export enum TaskType {
  SCREENSHOT = 'screenshot',
  PDF = 'pdf',
  CONTENT = 'content',
  SCRAPE = 'scrape',
  CUSTOM = 'custom',
}

/**
 * 任务配置
 * 使用索引签名允许任务类型特定的配置属性
 */
export interface TaskConfig {
  id?: string;
  type: TaskType;
  priority?: TaskPriority;
  timeout?: number;
  retries?: number;
  maxRetries?: number;
  delay?: number;
  attempts?: number;
  backoff?: BackoffConfig;

  // 任务类型特定的配置（使用索引签名允许任意额外属性）
  [key: string]: any;
}

/**
 * 退避配置
 */
export interface BackoffConfig {
  type: 'fixed' | 'exponential';
  delay: number;
}

/**
 * 任务数据
 */
export interface Task<T = unknown> {
  id: string;
  type: TaskType;
  data?: T;
  config: TaskConfig;
  userId?: string;
  priority?: TaskPriority;
  attempts?: number;
  progress?: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: TaskStatus;
  result?: unknown;
  error?: TaskError | string;
}

/**
 * 任务错误
 */
export interface TaskError {
  message: string;
  code: string;
  stack?: string;
  recoverable: boolean;
}

/**
 * 队列统计信息
 */
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
  totalProcessed: number;
  totalCompleted: number;
  totalFailed: number;
}

/**
 * 队列状态
 */
export interface QueueStatus {
  name: string;
  isPaused: boolean;
  isHealthy: boolean;
  stats: QueueStats;
  workers?: number;
}

/**
 * 队列事件
 */
export enum QueueEvent {
  TASK_ADDED = 'queue:task:added',
  TASK_STARTED = 'queue:task:started',
  TASK_COMPLETED = 'queue:task:completed',
  TASK_FAILED = 'queue:task:failed',
  TASK_RETRY = 'queue:task:retry',
  QUEUE_PAUSED = 'queue:paused',
  QUEUE_RESUMED = 'queue:resumed',
}
