import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authService } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import { moduleLogger } from '../../utils/logger';
import { jwtAuth, auth, requireRole } from '../../middleware/auth.middleware';
import { UserRole } from '../../types/auth.types';

const logger = moduleLogger('auth-route');

/**
 * 登录请求 Schema
 */
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

/**
 * 刷新 Token 请求 Schema
 */
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

/**
 * 创建 API Key 请求 Schema
 */
const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).optional(),
  expiresIn: z.number().min(1).max(365).optional(),
});

/**
 * 认证路由
 */
export async function authRoutes(fastify: FastifyInstance) {
  /**
   * POST /auth/login
   * 用户登录
   */
  fastify.post('/auth/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body);

      logger.info({ username: body.username }, 'Login attempt');

      // 验证用户凭证
      const user = userService.validatePassword(body.username, body.password);

      if (!user) {
        logger.warn({ username: body.username }, 'Login failed - invalid credentials');
        return reply.status(401).send({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password.',
          },
          timestamp: new Date().toISOString(),
        });
      }

      // 生成 tokens
      const tokens = authService.generateTokens(user);

      logger.info({ userId: user.id, username: user.username }, 'Login successful');

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
          ...tokens,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn({ errors: error.errors }, 'Login validation failed');
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: error.errors,
          },
          timestamp: new Date().toISOString(),
        });
      }

      logger.error({ error }, 'Login failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Login failed.',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * POST /auth/refresh
   * 刷新访问令牌
   */
  fastify.post('/auth/refresh', async (request, reply) => {
    try {
      const body = refreshTokenSchema.parse(request.body);

      logger.debug('Token refresh attempt');

      // 验证刷新令牌
      const payload = authService.verifyRefreshToken(body.refreshToken);

      // 获取用户
      const user = userService.findById(payload.userId);
      if (!user) {
        logger.warn({ userId: payload.userId }, 'User not found for refresh token');
        return reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid refresh token.',
          },
          timestamp: new Date().toISOString(),
        });
      }

      // 生成新的 tokens
      const tokens = authService.generateTokens(user);

      logger.info({ userId: user.id }, 'Token refreshed successfully');

      return reply.send({
        success: true,
        data: tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: error.errors,
          },
          timestamp: new Date().toISOString(),
        });
      }

      logger.warn({ error }, 'Token refresh failed');
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: error instanceof Error ? error.message : 'Token refresh failed.',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * GET /auth/me
   * 获取当前用户信息
   */
  fastify.get('/auth/me', { preHandler: auth }, async (request, reply) => {
    try {
      const user = request.auth!.user;

      return reply.send({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Get current user failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get user information.',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * GET /auth/api-keys
   * 获取当前用户的 API Keys
   */
  fastify.get('/auth/api-keys', { preHandler: jwtAuth }, async (request, reply) => {
    try {
      const user = request.auth!.user;
      const apiKeys = userService.getUserApiKeys(user.id);

      return reply.send({
        success: true,
        data: apiKeys.map((key) => ({
          id: key.id,
          name: key.name,
          permissions: key.permissions,
          enabled: key.enabled,
          expiresAt: key.expiresAt?.toISOString(),
          lastUsedAt: key.lastUsedAt?.toISOString(),
          createdAt: key.createdAt.toISOString(),
          // 不返回实际的 key
        })),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Get API keys failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get API keys.',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * POST /auth/api-keys
   * 创建新的 API Key
   */
  fastify.post('/auth/api-keys', { preHandler: jwtAuth }, async (request, reply) => {
    try {
      const body = createApiKeySchema.parse(request.body);
      const user = request.auth!.user;

      logger.info({ userId: user.id, keyName: body.name }, 'Creating API key');

      const apiKey = userService.createApiKey(user.id, {
        name: body.name,
        permissions: body.permissions,
        expiresIn: body.expiresIn,
      });

      return reply.status(201).send({
        success: true,
        data: apiKey,
        message: 'API key created successfully. Please save the key, it will not be shown again.',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: error.errors,
          },
          timestamp: new Date().toISOString(),
        });
      }

      logger.error({ error }, 'Create API key failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create API key.',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * DELETE /auth/api-keys/:keyId
   * 删除 API Key
   */
  fastify.delete('/auth/api-keys/:keyId', { preHandler: jwtAuth }, async (request, reply) => {
    try {
      const { keyId } = request.params as { keyId: string };
      const user = request.auth!.user;

      logger.info({ userId: user.id, keyId }, 'Deleting API key');

      const deleted = userService.deleteApiKey(user.id, keyId);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found.',
          },
          timestamp: new Date().toISOString(),
        });
      }

      return reply.send({
        success: true,
        data: {
          message: 'API key deleted successfully.',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Delete API key failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete API key.',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * POST /auth/api-keys/:keyId/revoke
   * 撤销 API Key
   */
  fastify.post('/auth/api-keys/:keyId/revoke', { preHandler: jwtAuth }, async (request, reply) => {
    try {
      const { keyId } = request.params as { keyId: string };
      const user = request.auth!.user;

      logger.info({ userId: user.id, keyId }, 'Revoking API key');

      const revoked = userService.revokeApiKey(user.id, keyId);

      if (!revoked) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found.',
          },
          timestamp: new Date().toISOString(),
        });
      }

      return reply.send({
        success: true,
        data: {
          message: 'API key revoked successfully.',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Revoke API key failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to revoke API key.',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * GET /auth/users
   * 获取所有用户（仅管理员）
   */
  fastify.get(
    '/auth/users',
    {
      preHandler: [jwtAuth, requireRole(UserRole.ADMIN)],
    },
    async (request, reply) => {
      try {
        const users = userService.getAllUsers();

        return reply.send({
          success: true,
          data: users.map((user) => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            apiKeysCount: user.apiKeys.length,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          })),
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error({ error }, 'Get users failed');
        return reply.status(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to get users.',
          },
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  logger.info('Auth routes registered');
}
