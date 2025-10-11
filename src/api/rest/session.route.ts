import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { sessionManager } from '../../core/session/SessionManager';
import { moduleLogger } from '../../utils/logger';
import { auth, requireRole } from '../../middleware/auth.middleware';
import { config } from '../../config';
import { UserRole } from '../../types/auth.types';

const logger = moduleLogger('session-route');

/**
 * 注册 Session 管理路由
 */
export async function registerSessionRoutes(server: FastifyInstance) {
  /**
   * GET /sessions
   * 获取所有活跃会话列表
   */
  server.get(
    '/sessions',
    { preHandler: config.requireAuth ? [auth, requireRole(UserRole.ADMIN, UserRole.USER)] : [] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const sessions = sessionManager.getActiveSessions();

        const sessionsData = sessions.map((session) => ({
          id: session.id,
          userId: session.userId,
          status: session.status,
          createdAt: session.createdAt,
          lastActivityAt: session.lastActivityAt,
          age: Date.now() - session.createdAt.getTime(),
          idleTime: Date.now() - session.lastActivityAt.getTime(),
          pageCount: session.pages.size,
        }));

        return reply.send({
          success: true,
          data: {
            sessions: sessionsData,
            total: sessionsData.length,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get sessions');
        return reply.status(500).send({
          success: false,
          error: {
            code: 'SESSIONS_FETCH_FAILED',
            message: error instanceof Error ? error.message : 'Failed to fetch sessions',
          },
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * GET /sessions/:id
   * 获取指定会话详情
   */
  server.get(
    '/sessions/:id',
    { preHandler: config.requireAuth ? [auth] : [] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const session = sessionManager.getSession(id);

        if (!session) {
          return reply.status(404).send({
            success: false,
            error: {
              code: 'SESSION_NOT_FOUND',
              message: `Session ${id} not found`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        return reply.send({
          success: true,
          data: {
            id: session.id,
            userId: session.userId,
            status: session.status,
            createdAt: session.createdAt,
            lastActivityAt: session.lastActivityAt,
            age: Date.now() - session.createdAt.getTime(),
            idleTime: Date.now() - session.lastActivityAt.getTime(),
            pageCount: session.pages.size,
            config: {
              maxDuration: session.config.maxDuration,
              timeout: session.config.timeout,
              viewport: session.config.viewport,
              userAgent: session.config.userAgent,
            },
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get session');
        return reply.status(500).send({
          success: false,
          error: {
            code: 'SESSION_FETCH_FAILED',
            message: error instanceof Error ? error.message : 'Failed to fetch session',
          },
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * DELETE /sessions/:id
   * 关闭指定会话
   */
  server.delete(
    '/sessions/:id',
    { preHandler: config.requireAuth ? [auth] : [] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const session = sessionManager.getSession(id);

        if (!session) {
          return reply.status(404).send({
            success: false,
            error: {
              code: 'SESSION_NOT_FOUND',
              message: `Session ${id} not found`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        logger.info({ sessionId: id }, 'Closing session via API');
        await sessionManager.closeSession(id, 'api_request');

        return reply.send({
          success: true,
          data: {
            message: `Session ${id} closed successfully`,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error({ error }, 'Failed to close session');
        return reply.status(500).send({
          success: false,
          error: {
            code: 'SESSION_CLOSE_FAILED',
            message: error instanceof Error ? error.message : 'Failed to close session',
          },
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * GET /sessions/stats
   * 获取会话统计信息
   */
  server.get(
    '/sessions/stats',
    { preHandler: config.requireAuth ? [auth] : [] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const stats = sessionManager.getStats();

        return reply.send({
          success: true,
          data: stats,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get session stats');
        return reply.status(500).send({
          success: false,
          error: {
            code: 'STATS_FETCH_FAILED',
            message: error instanceof Error ? error.message : 'Failed to fetch stats',
          },
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  logger.info('Session routes registered');
}
