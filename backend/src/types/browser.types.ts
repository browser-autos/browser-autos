import type { Browser } from 'puppeteer-core';

/**
 * Browser Pool 相关类型定义
 */

/**
 * 浏览器池配置
 */
export interface BrowserPoolConfig {
  minInstances: number;
  maxInstances: number;
  maxAge: number;
  launchOptions: BrowserLaunchOptions;
  idleTimeout?: number;
  retryDelay?: number;
  maxRetries?: number;
}

/**
 * 浏览器启动选项
 */
export interface BrowserLaunchOptions {
  executablePath?: string;
  args?: string[];
  headless?: boolean;
  devtools?: boolean;
  dumpio?: boolean;
  env?: Record<string, string>;
  ignoreHTTPSErrors?: boolean;
  defaultViewport?: {
    width: number;
    height: number;
  };
}

/**
 * 浏览器实例元数据
 */
export interface BrowserInstance {
  id: string;
  browser: Browser;
  createdAt: Date;
  lastUsedAt: Date;
  useCount: number;
  status: BrowserStatus;
  pid?: number;
}

/**
 * 浏览器状态
 */
export enum BrowserStatus {
  LAUNCHING = 'launching',
  IDLE = 'idle',
  BUSY = 'busy',
  CLOSING = 'closing',
  CLOSED = 'closed',
  ERROR = 'error',
}

/**
 * 浏览器池统计信息
 */
export interface BrowserPoolStats {
  total: number;
  idle: number;
  busy: number;
  launching: number;
  closed: number;
  error: number;
  totalUseCount: number;
  averageAge: number;
}

/**
 * 浏览器资源使用情况
 */
export interface BrowserResourceUsage {
  id: string;
  pid: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpu: {
    user: number;
    system: number;
    percent: number;
  };
}

/**
 * 浏览器事件
 */
export enum BrowserEvent {
  LAUNCHED = 'browser:launched',
  ACQUIRED = 'browser:acquired',
  RELEASED = 'browser:released',
  CLOSED = 'browser:closed',
  ERROR = 'browser:error',
  TIMEOUT = 'browser:timeout',
}
