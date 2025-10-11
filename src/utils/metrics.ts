import { Registry, Counter, Gauge, Histogram, collectDefaultMetrics } from 'prom-client';
import { moduleLogger } from './logger';

const logger = moduleLogger('metrics');

/**
 * Prometheus 指标注册表
 */
export const register = new Registry();

/**
 * 收集默认指标（CPU, 内存等）
 */
collectDefaultMetrics({
  register,
  prefix: 'browser_autos_',
});

/**
 * HTTP 请求总数
 */
export const httpRequestsTotal = new Counter({
  name: 'browser_autos_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

/**
 * HTTP 请求持续时间
 */
export const httpRequestDuration = new Histogram({
  name: 'browser_autos_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

/**
 * 浏览器池大小
 */
export const browserPoolSize = new Gauge({
  name: 'browser_autos_browser_pool_size',
  help: 'Number of browser instances in the pool',
  labelNames: ['state'], // idle, busy, launching, closed, error
  registers: [register],
});

/**
 * 浏览器池使用计数
 */
export const browserPoolUseCount = new Counter({
  name: 'browser_autos_browser_pool_use_count_total',
  help: 'Total number of browser pool acquisitions',
  registers: [register],
});

/**
 * 任务执行持续时间
 */
export const taskDuration = new Histogram({
  name: 'browser_autos_task_duration_seconds',
  help: 'Task execution duration in seconds',
  labelNames: ['task_type'], // screenshot, pdf, content, scrape
  buckets: [0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
});

/**
 * 任务执行总数
 */
export const taskTotal = new Counter({
  name: 'browser_autos_task_total',
  help: 'Total number of tasks executed',
  labelNames: ['task_type', 'status'], // success, error
  registers: [register],
});

/**
 * 活跃会话数量
 */
export const activeSessions = new Gauge({
  name: 'browser_autos_active_sessions',
  help: 'Number of active browser sessions',
  registers: [register],
});

/**
 * 队列长度
 */
export const queueLength = new Gauge({
  name: 'browser_autos_queue_length',
  help: 'Number of tasks in queue',
  registers: [register],
});

/**
 * 会话指标
 */
export const sessionGauge = new Gauge({
  name: 'browser_autos_sessions',
  help: 'Number of sessions by status',
  labelNames: ['status'], // active, idle
  registers: [register],
});

export const sessionDuration = new Histogram({
  name: 'browser_autos_session_duration_seconds',
  help: 'Session duration in seconds',
  buckets: [10, 30, 60, 300, 600, 1800, 3600],
  registers: [register],
});

export const sessionTotal = new Counter({
  name: 'browser_autos_session_total',
  help: 'Total number of sessions created',
  registers: [register],
});

/**
 * 更新浏览器池指标
 */
export function updateBrowserPoolMetrics(stats: {
  idle: number;
  busy: number;
  launching: number;
  closed: number;
  error: number;
}) {
  browserPoolSize.set({ state: 'idle' }, stats.idle);
  browserPoolSize.set({ state: 'busy' }, stats.busy);
  browserPoolSize.set({ state: 'launching' }, stats.launching);
  browserPoolSize.set({ state: 'closed' }, stats.closed);
  browserPoolSize.set({ state: 'error' }, stats.error);
}

/**
 * 记录任务执行
 */
export function recordTask(taskType: string, durationSeconds: number, success: boolean) {
  taskDuration.observe({ task_type: taskType }, durationSeconds);
  taskTotal.inc({ task_type: taskType, status: success ? 'success' : 'error' });
}

/**
 * 记录 HTTP 请求
 */
export function recordHttpRequest(method: string, path: string, status: number, durationSeconds: number) {
  httpRequestsTotal.inc({ method, path, status: status.toString() });
  httpRequestDuration.observe({ method, path, status: status.toString() }, durationSeconds);
}

/**
 * 更新会话指标
 */
export function updateSessionMetrics(stats: {
  activeSessions: number;
  idleSessions: number;
}) {
  sessionGauge.set({ status: 'active' }, stats.activeSessions);
  sessionGauge.set({ status: 'idle' }, stats.idleSessions);
  activeSessions.set(stats.activeSessions);
}

/**
 * 记录会话创建
 */
export function recordSessionCreated() {
  sessionTotal.inc();
}

/**
 * 记录会话持续时间
 */
export function recordSessionDuration(durationSeconds: number) {
  sessionDuration.observe(durationSeconds);
}

/**
 * 更新队列指标
 */
export function updateQueueMetrics(stats: {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}) {
  queueLength.set(stats.waiting);
  queueGauge.set({ status: 'active' }, stats.active);
  queueGauge.set({ status: 'completed' }, stats.completed);
  queueGauge.set({ status: 'failed' }, stats.failed);
  queueGauge.set({ status: 'delayed' }, stats.delayed);
}

/**
 * 队列指标
 */
export const queueGauge = new Gauge({
  name: 'browser_autos_queue_tasks',
  help: 'Number of tasks in queue by status',
  labelNames: ['status'], // waiting, active, completed, failed, delayed
  registers: [register],
});

logger.info('Prometheus metrics initialized');
