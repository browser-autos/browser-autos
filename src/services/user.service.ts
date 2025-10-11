import { randomBytes } from 'crypto';
import { moduleLogger } from '../utils/logger';
import { User, UserRole, ApiKey, CreateApiKeyRequest, ApiKeyResponse } from '../types/auth.types';
import { authService } from './auth.service';

const logger = moduleLogger('user-service');

/**
 * 用户服务
 * 功能：用户和 API Key 管理（内存存储）
 *
 * 注意：这是简化的内存实现，生产环境应使用数据库
 */
export class UserService {
  private users: Map<string, User> = new Map();
  private apiKeys: Map<string, ApiKey> = new Map();
  private usersByUsername: Map<string, User> = new Map();

  constructor() {
    // 初始化默认管理员用户
    this.initializeDefaultUsers();
  }

  /**
   * 初始化默认用户
   */
  private initializeDefaultUsers() {
    // 默认管理员
    const adminUser: User = {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@browser.autos',
      role: UserRole.ADMIN,
      apiKeys: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(adminUser.id, adminUser);
    this.usersByUsername.set(adminUser.username, adminUser);

    // 默认 API 用户
    const apiUser: User = {
      id: 'user-001',
      username: 'api-user',
      email: 'api@browser.autos',
      role: UserRole.USER,
      apiKeys: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(apiUser.id, apiUser);
    this.usersByUsername.set(apiUser.username, apiUser);

    // 为 API 用户创建默认 API Key
    const defaultApiKey = this.createApiKey(apiUser.id, {
      name: 'Default API Key',
      permissions: ['*'],
    });

    logger.info(
      {
        users: this.users.size,
        apiKeys: this.apiKeys.size,
      },
      'Default users initialized'
    );

    // 在开发环境下输出默认 API Key
    if (process.env.NODE_ENV === 'development') {
      logger.info(
        {
          apiKey: defaultApiKey.key,
          username: apiUser.username,
        },
        'Default API key created for development'
      );
    }
  }

  /**
   * 根据用户名查找用户
   */
  findByUsername(username: string): User | null {
    return this.usersByUsername.get(username) || null;
  }

  /**
   * 根据 ID 查找用户
   */
  findById(userId: string): User | null {
    return this.users.get(userId) || null;
  }

  /**
   * 验证用户密码
   * 注意：简化实现，生产环境应使用 bcrypt 等加密库
   */
  validatePassword(username: string, password: string): User | null {
    const user = this.findByUsername(username);
    if (!user) {
      logger.warn({ username }, 'User not found');
      return null;
    }

    // 简化的密码验证（开发环境）
    // 生产环境应使用 bcrypt.compare(password, user.passwordHash)
    const validPasswords: Record<string, string> = {
      admin: 'admin123',
      'api-user': 'apiuser123',
    };

    if (validPasswords[username] === password) {
      logger.info({ userId: user.id, username }, 'User authenticated successfully');
      return user;
    }

    logger.warn({ username }, 'Invalid password');
    return null;
  }

  /**
   * 创建 API Key
   */
  createApiKey(userId: string, request: CreateApiKeyRequest): ApiKeyResponse {
    const user = this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const apiKey: ApiKey = {
      id: `key-${randomBytes(8).toString('hex')}`,
      key: authService.generateApiKey(),
      name: request.name,
      userId,
      permissions: request.permissions || ['*'],
      expiresAt: request.expiresIn
        ? new Date(Date.now() + request.expiresIn * 24 * 60 * 60 * 1000)
        : undefined,
      createdAt: new Date(),
      enabled: true,
    };

    this.apiKeys.set(apiKey.key, apiKey);
    user.apiKeys.push(apiKey);

    logger.info({ userId, keyId: apiKey.id, keyName: apiKey.name }, 'API key created');

    return {
      id: apiKey.id,
      key: apiKey.key,
      name: apiKey.name,
      permissions: apiKey.permissions,
      expiresAt: apiKey.expiresAt?.toISOString(),
      createdAt: apiKey.createdAt.toISOString(),
    };
  }

  /**
   * 验证 API Key
   */
  validateApiKey(key: string): { user: User; apiKey: ApiKey } | null {
    const apiKey = this.apiKeys.get(key);
    if (!apiKey) {
      logger.warn('Invalid API key');
      return null;
    }

    // 检查是否启用
    if (!apiKey.enabled) {
      logger.warn({ keyId: apiKey.id }, 'API key is disabled');
      return null;
    }

    // 检查是否过期
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      logger.warn({ keyId: apiKey.id }, 'API key has expired');
      return null;
    }

    const user = this.findById(apiKey.userId);
    if (!user) {
      logger.error({ keyId: apiKey.id, userId: apiKey.userId }, 'User not found for API key');
      return null;
    }

    // 更新最后使用时间
    apiKey.lastUsedAt = new Date();

    logger.debug({ userId: user.id, keyId: apiKey.id }, 'API key validated successfully');

    return { user, apiKey };
  }

  /**
   * 获取用户的所有 API Keys
   */
  getUserApiKeys(userId: string): ApiKey[] {
    const user = this.findById(userId);
    if (!user) {
      return [];
    }

    return user.apiKeys;
  }

  /**
   * 撤销 API Key
   */
  revokeApiKey(userId: string, keyId: string): boolean {
    const user = this.findById(userId);
    if (!user) {
      return false;
    }

    const apiKey = user.apiKeys.find((k) => k.id === keyId);
    if (!apiKey) {
      return false;
    }

    apiKey.enabled = false;
    logger.info({ userId, keyId }, 'API key revoked');

    return true;
  }

  /**
   * 删除 API Key
   */
  deleteApiKey(userId: string, keyId: string): boolean {
    const user = this.findById(userId);
    if (!user) {
      return false;
    }

    const index = user.apiKeys.findIndex((k) => k.id === keyId);
    if (index === -1) {
      return false;
    }

    const apiKey = user.apiKeys[index];
    user.apiKeys.splice(index, 1);
    this.apiKeys.delete(apiKey.key);

    logger.info({ userId, keyId }, 'API key deleted');

    return true;
  }

  /**
   * 获取所有用户（仅管理员）
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalUsers: this.users.size,
      totalApiKeys: this.apiKeys.size,
      activeApiKeys: Array.from(this.apiKeys.values()).filter((k) => k.enabled).length,
    };
  }
}

// 导出单例
export const userService = new UserService();
