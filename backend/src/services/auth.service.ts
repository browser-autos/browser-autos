import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { moduleLogger } from '../utils/logger';
import { JwtPayload, TokenResponse, User, UserRole } from '../types/auth.types';

const logger = moduleLogger('auth-service');

/**
 * 认证服务
 * 功能：JWT token 生成和验证
 */
export class AuthService {
  /**
   * 生成访问令牌
   */
  generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      type: 'access',
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.tokenExpiry as any,
      issuer: 'browser-autos',
      audience: 'browser-autos-api',
    });

    logger.debug({ userId: user.id }, 'Access token generated');
    return token;
  }

  /**
   * 生成刷新令牌
   */
  generateRefreshToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      type: 'refresh',
    };

    const options: SignOptions = {
      expiresIn: '90d', // 刷新令牌有效期 90 天
      issuer: 'browser-autos',
      audience: 'browser-autos-api',
    };
    const token = jwt.sign(payload, config.jwtSecret, options);

    logger.debug({ userId: user.id }, 'Refresh token generated');
    return token;
  }

  /**
   * 生成令牌对（访问令牌 + 刷新令牌）
   */
  generateTokens(user: User): TokenResponse {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // 解析过期时间（秒）
    const decoded = jwt.decode(accessToken) as any;
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * 验证并解析 JWT token
   */
  verifyToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, config.jwtSecret, {
        issuer: 'browser-autos',
        audience: 'browser-autos-api',
      }) as JwtPayload;

      logger.debug({ userId: payload.userId, type: payload.type }, 'Token verified successfully');
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Token expired');
        throw new Error('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.warn({ error: error.message }, 'Invalid token');
        throw new Error('Invalid token');
      } else {
        logger.error({ error }, 'Token verification failed');
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * 验证访问令牌
   */
  verifyAccessToken(token: string): JwtPayload {
    const payload = this.verifyToken(token);

    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return payload;
  }

  /**
   * 验证刷新令牌
   */
  verifyRefreshToken(token: string): JwtPayload {
    const payload = this.verifyToken(token);

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return payload;
  }

  /**
   * 解码 token（不验证）
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      return decoded;
    } catch (error) {
      logger.error({ error }, 'Failed to decode token');
      return null;
    }
  }

  /**
   * 检查 token 是否即将过期
   * @param token JWT token
   * @param thresholdSeconds 阈值（秒），默认 5 分钟
   */
  isTokenExpiringSoon(token: string, thresholdSeconds: number = 300): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = (decoded as any).exp;

    return expiresAt - now < thresholdSeconds;
  }

  /**
   * 生成 API Key
   */
  generateApiKey(): string {
    // 生成格式: ba_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    const prefix = config.nodeEnv === 'production' ? 'ba_live' : 'ba_test';
    const randomPart = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 36).toString(36)
    ).join('');

    return `${prefix}_${randomPart}`;
  }

  /**
   * 验证 API Key 格式
   */
  isValidApiKeyFormat(key: string): boolean {
    const regex = /^ba_(live|test)_[a-z0-9]{32}$/;
    return regex.test(key);
  }
}

// 导出单例
export const authService = new AuthService();
