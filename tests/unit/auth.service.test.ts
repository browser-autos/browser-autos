/**
 * Unit Tests for AuthService
 */

import { AuthService } from '../../src/services/auth.service';
import { User, UserRole } from '../../src/types/auth.types';

describe('AuthService', () => {
  let authService: AuthService;
  let testUser: User;

  beforeEach(() => {
    authService = new AuthService();
    testUser = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      role: UserRole.USER,
      apiKeys: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('Token Generation', () => {
    test('should generate access token', () => {
      const token = authService.generateAccessToken(testUser);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should generate refresh token', () => {
      const token = authService.generateRefreshToken(testUser);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    test('should generate tokens with correct payload', () => {
      const token = authService.generateAccessToken(testUser);
      const payload = authService.verifyAccessToken(token);

      expect(payload.userId).toBe(testUser.id);
      expect(payload.username).toBe(testUser.username);
      expect(payload.role).toBe(testUser.role);
      expect(payload.type).toBe('access');
    });

    test('should generate different tokens for different users', () => {
      const user2 = { ...testUser, id: 'user-456', username: 'testuser2' };

      const token1 = authService.generateAccessToken(testUser);
      const token2 = authService.generateAccessToken(user2);

      expect(token1).not.toBe(token2);
    });
  });

  describe('Token Verification', () => {
    test('should verify valid access token', () => {
      const token = authService.generateAccessToken(testUser);
      const payload = authService.verifyAccessToken(token);

      expect(payload).toBeTruthy();
      expect(payload.userId).toBe(testUser.id);
      expect(payload.type).toBe('access');
    });

    test('should verify valid refresh token', () => {
      const token = authService.generateRefreshToken(testUser);
      const payload = authService.verifyRefreshToken(token);

      expect(payload).toBeTruthy();
      expect(payload.userId).toBe(testUser.id);
      expect(payload.type).toBe('refresh');
    });

    test('should throw error for invalid token', () => {
      expect(() => {
        authService.verifyAccessToken('invalid-token');
      }).toThrow();
    });

    test('should throw error for wrong token type', () => {
      const refreshToken = authService.generateRefreshToken(testUser);

      expect(() => {
        authService.verifyAccessToken(refreshToken);
      }).toThrow('Invalid token type');
    });

    test('should throw error for malformed token', () => {
      expect(() => {
        authService.verifyAccessToken('not.a.valid.jwt.token');
      }).toThrow();
    });

    test('should verify refresh token has correct type', () => {
      const accessToken = authService.generateAccessToken(testUser);

      expect(() => {
        authService.verifyRefreshToken(accessToken);
      }).toThrow('Invalid token type');
    });
  });

  describe('API Key Generation', () => {
    test('should generate API key with correct format', () => {
      const apiKey = authService.generateApiKey();

      expect(apiKey).toBeTruthy();
      expect(typeof apiKey).toBe('string');
      expect(apiKey).toMatch(/^ba_(test|live)_[a-z0-9]{32}$/);
    });

    test('should generate API key with test prefix in test environment', () => {
      const apiKey = authService.generateApiKey();
      expect(apiKey).toMatch(/^ba_test_/);
    });

    test('should generate unique API keys', () => {
      const key1 = authService.generateApiKey();
      const key2 = authService.generateApiKey();
      const key3 = authService.generateApiKey();

      expect(key1).not.toBe(key2);
      expect(key2).not.toBe(key3);
      expect(key1).not.toBe(key3);
    });

    test('should generate keys with correct length', () => {
      const apiKey = authService.generateApiKey();
      // Format: ba_test_ (8 chars) + 32 random chars = 40 total
      expect(apiKey.length).toBe(40);
    });
  });

  describe('Token Payload Extraction', () => {
    test('should extract correct user information from access token', () => {
      const adminUser = {
        ...testUser,
        role: UserRole.ADMIN,
        username: 'admin',
      };

      const token = authService.generateAccessToken(adminUser);
      const payload = authService.verifyAccessToken(token);

      expect(payload.userId).toBe(adminUser.id);
      expect(payload.username).toBe('admin');
      expect(payload.role).toBe(UserRole.ADMIN);
    });

    test('should extract correct user information from refresh token', () => {
      const token = authService.generateRefreshToken(testUser);
      const payload = authService.verifyRefreshToken(token);

      expect(payload.userId).toBe(testUser.id);
      expect(payload.username).toBe(testUser.username);
      expect(payload.role).toBe(testUser.role);
    });
  });
});
