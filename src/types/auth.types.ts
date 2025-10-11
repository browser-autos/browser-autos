/**
 * 认证相关类型定义
 */

/**
 * 用户角色
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  SERVICE = 'service',
}

/**
 * 用户接口
 */
export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  apiKeys: ApiKey[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * API Key 接口
 */
export interface ApiKey {
  id: string;
  key: string;
  name: string;
  userId: string;
  permissions: string[];
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  enabled: boolean;
}

/**
 * JWT Payload
 */
export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

/**
 * Token 响应
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * 认证请求
 */
export interface AuthRequest {
  username: string;
  password: string;
}

/**
 * 刷新 Token 请求
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * 创建 API Key 请求
 */
export interface CreateApiKeyRequest {
  name: string;
  permissions?: string[];
  expiresIn?: number; // 天数
}

/**
 * API Key 响应
 */
export interface ApiKeyResponse {
  id: string;
  key: string;
  name: string;
  permissions: string[];
  expiresAt?: string;
  createdAt: string;
}

/**
 * 认证上下文 (添加到 FastifyRequest)
 */
export interface AuthContext {
  user: User;
  apiKey?: ApiKey;
}
