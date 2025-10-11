import { EventEmitter } from 'events';
import { Browser } from 'puppeteer-core';
import {
  Session,
  SessionConfig,
  SessionStatus,
  SessionStats,
  SessionEvent,
  SessionEventData,
} from '../../types/session.types';
import { browserPool } from '../browser/BrowserPool';
import { moduleLogger } from '../../utils/logger';
import { recordSessionCreated, recordSessionDuration, updateSessionMetrics } from '../../utils/metrics';
import { randomUUID } from 'crypto';

const logger = moduleLogger('session-manager');

/**
 * Session Manager
 * 功能：管理 WebSocket 会话的生命周期
 */
export class SessionManager extends EventEmitter {
  private sessions = new Map<string, Session>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private stats = {
    totalCreated: 0,
    peakSessions: 0,
  };

  constructor(
    private readonly defaultTimeout: number = 300000, // 5 分钟
    private readonly maxDuration: number = 3600000 // 1 小时
  ) {
    super();
    this.startCleanupTask();
  }

  /**
   * 创建新会话
   */
  async createSession(config: Partial<SessionConfig>): Promise<Session> {
    const sessionId = config.id || randomUUID();
    const userId = config.userId || 'anonymous';

    logger.info({ sessionId, userId }, 'Creating new session');

    try {
      // 从浏览器池获取浏览器实例
      const browser = await browserPool.acquire();

      // 创建会话对象
      const session: Session = {
        id: sessionId,
        userId,
        browser,
        pages: new Map(),
        createdAt: new Date(),
        lastActivityAt: new Date(),
        config: {
          id: sessionId,
          userId,
          maxDuration: config.maxDuration || this.maxDuration,
          timeout: config.timeout || this.defaultTimeout,
          browserArgs: config.browserArgs,
          viewport: config.viewport,
          userAgent: config.userAgent,
          proxy: config.proxy,
        },
        status: SessionStatus.ACTIVE,
      };

      // 存储会话
      this.sessions.set(sessionId, session);
      this.stats.totalCreated++;

      // 更新峰值统计
      if (this.sessions.size > this.stats.peakSessions) {
        this.stats.peakSessions = this.sessions.size;
      }

      // 记录指标
      recordSessionCreated();
      this.updateMetrics();

      // 触发事件
      this.emitEvent({
        sessionId,
        userId,
        event: SessionEvent.CREATED,
        timestamp: new Date(),
      });

      logger.info(
        {
          sessionId,
          userId,
          totalSessions: this.sessions.size,
        },
        'Session created successfully'
      );

      return session;
    } catch (error) {
      logger.error({ error, sessionId, userId }, 'Failed to create session');
      throw error;
    }
  }

  /**
   * 获取会话
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * 更新会话活动时间
   */
  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivityAt = new Date();
      if (session.status === SessionStatus.IDLE) {
        session.status = SessionStatus.ACTIVE;
      }
    }
  }

  /**
   * 关闭会话
   */
  async closeSession(sessionId: string, reason?: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      logger.warn({ sessionId }, 'Session not found');
      return;
    }

    logger.info({ sessionId, reason }, 'Closing session');

    try {
      session.status = SessionStatus.CLOSING;

      // 关闭所有页面
      for (const [pageId, page] of session.pages) {
        try {
          await page.close();
          logger.debug({ sessionId, pageId }, 'Page closed');
        } catch (error) {
          logger.warn({ error, sessionId, pageId }, 'Failed to close page');
        }
      }
      session.pages.clear();

      // 释放浏览器实例
      if (session.browser) {
        await browserPool.release(session.browser);
      }

      session.status = SessionStatus.CLOSED;

      // 触发事件
      this.emitEvent({
        sessionId: session.id,
        userId: session.userId,
        event: SessionEvent.CLOSED,
        timestamp: new Date(),
        metadata: { reason },
      });

      // 从映射中删除
      this.sessions.delete(sessionId);

      // 记录会话持续时间
      const duration = (Date.now() - session.createdAt.getTime()) / 1000;
      recordSessionDuration(duration);
      this.updateMetrics();

      logger.info(
        {
          sessionId,
          duration,
          totalSessions: this.sessions.size,
        },
        'Session closed successfully'
      );
    } catch (error) {
      session.status = SessionStatus.ERROR;
      logger.error({ error, sessionId }, 'Failed to close session');

      // 触发错误事件
      this.emitEvent({
        sessionId: session.id,
        userId: session.userId,
        event: SessionEvent.ERROR,
        timestamp: new Date(),
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });

      throw error;
    }
  }

  /**
   * 关闭所有会话
   */
  async closeAllSessions(): Promise<void> {
    logger.info({ count: this.sessions.size }, 'Closing all sessions');

    const closePromises = Array.from(this.sessions.keys()).map((sessionId) =>
      this.closeSession(sessionId, 'shutdown')
    );

    await Promise.allSettled(closePromises);
  }

  /**
   * 清理空闲和超时会话
   */
  async cleanupIdleSessions(): Promise<void> {
    const now = Date.now();
    const sessionsToClose: string[] = [];

    for (const [sessionId, session] of this.sessions) {
      const age = now - session.createdAt.getTime();
      const idleTime = now - session.lastActivityAt.getTime();

      // 检查是否超过最大存活时间
      if (age > session.config.maxDuration) {
        logger.info(
          { sessionId, age, maxDuration: session.config.maxDuration },
          'Session exceeded max duration'
        );
        sessionsToClose.push(sessionId);
        continue;
      }

      // 检查是否空闲超时
      if (idleTime > session.config.timeout) {
        logger.info(
          { sessionId, idleTime, timeout: session.config.timeout },
          'Session idle timeout'
        );
        session.status = SessionStatus.IDLE;
        sessionsToClose.push(sessionId);
        continue;
      }
    }

    // 关闭需要清理的会话
    for (const sessionId of sessionsToClose) {
      const session = this.sessions.get(sessionId);
      if (session) {
        this.emitEvent({
          sessionId: session.id,
          userId: session.userId,
          event: SessionEvent.TIMEOUT,
          timestamp: new Date(),
        });

        await this.closeSession(sessionId, 'timeout');
      }
    }

    if (sessionsToClose.length > 0) {
      logger.info({ count: sessionsToClose.length }, 'Cleaned up idle sessions');
    }
  }

  /**
   * 获取所有活跃会话
   */
  getActiveSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.status === SessionStatus.ACTIVE
    );
  }

  /**
   * 获取会话统计
   */
  getStats(): SessionStats {
    const sessions = Array.from(this.sessions.values());
    const activeSessions = sessions.filter((s) => s.status === SessionStatus.ACTIVE);
    const idleSessions = sessions.filter((s) => s.status === SessionStatus.IDLE);

    const totalDuration = sessions.reduce((sum, session) => {
      return sum + (Date.now() - session.createdAt.getTime());
    }, 0);

    return {
      totalSessions: this.sessions.size,
      activeSessions: activeSessions.length,
      idleSessions: idleSessions.length,
      averageDuration: sessions.length > 0 ? totalDuration / sessions.length : 0,
      peakSessions: this.stats.peakSessions,
    };
  }

  /**
   * 启动清理任务
   */
  private startCleanupTask(): void {
    // 每30秒检查一次
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleSessions().catch((error) => {
        logger.error({ error }, 'Cleanup task failed');
      });
    }, 30000);

    logger.info('Session cleanup task started');
  }

  /**
   * 停止清理任务
   */
  stopCleanupTask(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info('Session cleanup task stopped');
    }
  }

  /**
   * 触发会话事件
   */
  private emitEvent(data: SessionEventData): void {
    this.emit(data.event, data);
    this.emit('event', data);
  }

  /**
   * 更新监控指标
   */
  private updateMetrics(): void {
    const stats = this.getStats();
    updateSessionMetrics({
      activeSessions: stats.activeSessions,
      idleSessions: stats.idleSessions,
    });
  }

  /**
   * 销毁管理器
   */
  async destroy(): Promise<void> {
    logger.info('Destroying session manager');
    this.stopCleanupTask();
    await this.closeAllSessions();
    this.removeAllListeners();
  }
}

// 导出单例
export const sessionManager = new SessionManager();
