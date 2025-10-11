import type { Browser, Page } from 'puppeteer-core';

/**
 * Session 相关类型定义
 */

/**
 * Session 配置
 */
export interface SessionConfig {
  id: string;
  userId: string;
  maxDuration: number;
  timeout: number;
  browserArgs?: string[];
  viewport?: {
    width: number;
    height: number;
  };
  userAgent?: string;
  proxy?: ProxyConfig;
}

/**
 * 代理配置
 */
export interface ProxyConfig {
  server: string;
  username?: string;
  password?: string;
}

/**
 * Session 实例
 */
export interface Session {
  id: string;
  userId: string;
  browser: Browser;
  pages: Map<string, Page>;
  createdAt: Date;
  lastActivityAt: Date;
  config: SessionConfig;
  status: SessionStatus;
}

/**
 * Session 状态
 */
export enum SessionStatus {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  IDLE = 'idle',
  CLOSING = 'closing',
  CLOSED = 'closed',
  ERROR = 'error',
}

/**
 * Session 统计信息
 */
export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  idleSessions: number;
  averageDuration: number;
  peakSessions: number;
}

/**
 * Session 事件
 */
export enum SessionEvent {
  CREATED = 'session:created',
  CLOSED = 'session:closed',
  TIMEOUT = 'session:timeout',
  ERROR = 'session:error',
  PAGE_CREATED = 'session:page:created',
  PAGE_CLOSED = 'session:page:closed',
}

/**
 * Session 事件数据
 */
export interface SessionEventData {
  sessionId: string;
  userId: string;
  event: SessionEvent;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
