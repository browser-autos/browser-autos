import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { moduleLogger } from '../utils/logger';
import { AuthContext, UserRole } from '../types/auth.types';

const logger = moduleLogger('auth-middleware');

/**
 * 扩展 FastifyRequest 类型，添加认证上下文
 */
declare module 'fastify' {
  interface FastifyRequest {
    auth?: AuthContext;
  }
}

/**
 * 从请求中提取 Bearer Token
 */
function extractBearerToken(request: FastifyRequest): string | null {
  const authorization = request.headers.authorization;

  if (!authorization) {
    return null;
  }

  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * 从请求中提取 API Key
 */
function extractApiKey(request: FastifyRequest): string | null {
  // 优先从 header 获取
  const headerKey = request.headers['x-api-key'] as string;
  if (headerKey) {
    return headerKey;
  }

  // 其次从 query 获取
  const queryKey = (request.query as any)?.apiKey;
  if (queryKey) {
    return queryKey;
  }

  return null;
}

/**
 * JWT 认证中间件
 * 验证 JWT token 并设置用户上下文
 */
export async function jwtAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = extractBearerToken(request);

    if (!token) {
      logger.warn({ path: request.url }, 'No bearer token provided');
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please provide a valid bearer token.',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 验证 token
    const payload = authService.verifyAccessToken(token);

    // 获取用户信息
    const user = userService.findById(payload.userId);
    if (!user) {
      logger.warn({ userId: payload.userId }, 'User not found for token');
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found.',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 设置认证上下文
    request.auth = { user };

    logger.debug({ userId: user.id, username: user.username }, 'JWT authentication successful');
  } catch (error) {
    logger.warn({ error }, 'JWT authentication failed');
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: error instanceof Error ? error.message : 'Invalid or expired token.',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * API Key 认证中间件
 * 验证 API Key 并设置用户上下文
 */
export async function apiKeyAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const apiKey = extractApiKey(request);

    if (!apiKey) {
      logger.warn({ path: request.url }, 'No API key provided');
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please provide a valid API key.',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 验证 API Key 格式
    if (!authService.isValidApiKeyFormat(apiKey)) {
      logger.warn({ apiKey: apiKey.substring(0, 10) + '...' }, 'Invalid API key format');
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid API key format.',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 验证 API Key
    const result = userService.validateApiKey(apiKey);
    if (!result) {
      logger.warn({ apiKey: apiKey.substring(0, 10) + '...' }, 'Invalid or expired API key');
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired API key.',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 设置认证上下文
    request.auth = {
      user: result.user,
      apiKey: result.apiKey,
    };

    logger.debug(
      { userId: result.user.id, keyId: result.apiKey.id },
      'API key authentication successful'
    );
  } catch (error) {
    logger.error({ error }, 'API key authentication failed');
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication failed.',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * 可选认证中间件
 * 尝试认证但不强制要求
 */
export async function optionalAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = extractBearerToken(request);
  const apiKey = extractApiKey(request);

  try {
    // 优先尝试 JWT
    if (token) {
      const payload = authService.verifyAccessToken(token);
      const user = userService.findById(payload.userId);
      if (user) {
        request.auth = { user };
        logger.debug({ userId: user.id }, 'Optional JWT auth successful');
        return;
      }
    }

    // 其次尝试 API Key
    if (apiKey && authService.isValidApiKeyFormat(apiKey)) {
      const result = userService.validateApiKey(apiKey);
      if (result) {
        request.auth = {
          user: result.user,
          apiKey: result.apiKey,
        };
        logger.debug({ userId: result.user.id }, 'Optional API key auth successful');
        return;
      }
    }

    // 认证失败但不阻止请求
    logger.debug('Optional auth - no valid credentials provided');
  } catch (error) {
    // 认证失败但不阻止请求
    logger.debug({ error }, 'Optional auth failed');
  }
}

/**
 * 组合认证中间件
 * 支持 JWT 或 API Key 认证
 */
export async function auth(request: FastifyRequest, reply: FastifyReply) {
  const token = extractBearerToken(request);
  const apiKey = extractApiKey(request);

  // 如果提供了 JWT，使用 JWT 认证
  if (token) {
    return jwtAuth(request, reply);
  }

  // 如果提供了 API Key，使用 API Key 认证
  if (apiKey) {
    return apiKeyAuth(request, reply);
  }

  // 都没有提供
  logger.warn({ path: request.url }, 'No authentication credentials provided');
  return reply.status(401).send({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Please provide a bearer token or API key.',
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * 角色验证中间件工厂
 * 检查用户是否具有指定角色
 */
export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.auth) {
      logger.warn({ path: request.url }, 'No auth context in role check');
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (!roles.includes(request.auth.user.role)) {
      logger.warn(
        { userId: request.auth.user.id, userRole: request.auth.user.role, requiredRoles: roles },
        'Insufficient permissions'
      );
      return reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions.',
        },
        timestamp: new Date().toISOString(),
      });
    }

    logger.debug({ userId: request.auth.user.id, role: request.auth.user.role }, 'Role check passed');
  };
}

/**
 * 权限验证中间件工厂
 * 检查 API Key 是否具有指定权限
 */
export function requirePermission(...permissions: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.auth) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 如果没有使用 API Key，直接通过（JWT 用户默认有所有权限）
    if (!request.auth.apiKey) {
      return;
    }

    const apiKey = request.auth.apiKey;

    // 检查是否有通配符权限
    if (apiKey.permissions.includes('*')) {
      return;
    }

    // 检查是否有任一所需权限
    const hasPermission = permissions.some((perm) => apiKey.permissions.includes(perm));

    if (!hasPermission) {
      logger.warn(
        {
          keyId: apiKey.id,
          requiredPermissions: permissions,
          keyPermissions: apiKey.permissions,
        },
        'Insufficient API key permissions'
      );
      return reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'API key does not have sufficient permissions.',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };
}
