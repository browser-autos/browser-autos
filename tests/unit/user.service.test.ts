/**
 * Unit Tests for UserService
 */

import { UserService } from '../../src/services/user.service';
import { UserRole } from '../../src/types/auth.types';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('User Management', () => {
    test('should find user by ID', () => {
      const users = userService.getAllUsers();
      const firstUser = users[0];
      const user = userService.findById(firstUser.id);

      expect(user).toBeTruthy();
      expect(user?.id).toBe(firstUser.id);
    });

    test('should find user by username', () => {
      const user = userService.findByUsername('admin');

      expect(user).toBeTruthy();
      expect(user?.username).toBe('admin');
      expect(user?.role).toBe(UserRole.ADMIN);
    });

    test('should return null for non-existent user', () => {
      const user = userService.findById('non-existent-id');
      expect(user).toBeNull();
    });

    test('should get all users', () => {
      const users = userService.getAllUsers();

      expect(users).toBeTruthy();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(2); // At least admin and api-user
    });

    test('should validate correct password', () => {
      const user = userService.validatePassword('admin', 'admin123');

      expect(user).toBeTruthy();
      expect(user?.username).toBe('admin');
    });

    test('should reject invalid password', () => {
      const user = userService.validatePassword('admin', 'wrong-password');
      expect(user).toBeNull();
    });

    test('should reject non-existent user', () => {
      const user = userService.validatePassword('nonexistent', 'password');
      expect(user).toBeNull();
    });
  });

  describe('API Key Management', () => {
    test('should create API key for user', () => {
      const users = userService.getAllUsers();
      const user = users[0];

      const apiKey = userService.createApiKey(user.id, {
        name: 'Test API Key',
        permissions: ['screenshot', 'pdf'],
      });

      expect(apiKey).toBeTruthy();
      expect(apiKey.id).toBeTruthy();
      expect(apiKey.key).toMatch(/^ba_test_/);
      expect(apiKey.name).toBe('Test API Key');
      expect(apiKey.permissions).toEqual(['screenshot', 'pdf']);
    });

    test('should create API key with expiration', () => {
      const users = userService.getAllUsers();
      const user = users[0];

      const apiKey = userService.createApiKey(user.id, {
        name: 'Expiring Key',
        permissions: ['screenshot'],
        expiresIn: 7, // 7 days
      });

      expect(apiKey.expiresAt).toBeTruthy();
      if (apiKey.expiresAt) {
        const expiresAt = new Date(apiKey.expiresAt);
        const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        expect(daysUntilExpiry).toBe(7);
      }
    });

    test('should throw error for non-existent user', () => {
      expect(() => {
        userService.createApiKey('non-existent-user', {
          name: 'Test Key',
          permissions: ['screenshot'],
        });
      }).toThrow('User not found');
    });

    test('should validate active API key', () => {
      const users = userService.getAllUsers();
      const user = users[0];

      const apiKey = userService.createApiKey(user.id, {
        name: 'Valid Key',
        permissions: ['screenshot'],
      });

      const validation = userService.validateApiKey(apiKey.key);

      expect(validation).toBeTruthy();
      expect(validation?.user.id).toBe(user.id);
      expect(validation?.apiKey.id).toBe(apiKey.id);
    });

    test('should reject invalid API key', () => {
      const validation = userService.validateApiKey('invalid-key');
      expect(validation).toBeNull();
    });

    test('should reject disabled API key', () => {
      const users = userService.getAllUsers();
      const user = users[0];

      const apiKey = userService.createApiKey(user.id, {
        name: 'To Disable',
        permissions: ['screenshot'],
      });

      userService.revokeApiKey(user.id, apiKey.id);

      const validation = userService.validateApiKey(apiKey.key);
      expect(validation).toBeNull();
    });

    test('should reject expired API key', () => {
      const users = userService.getAllUsers();
      const user = users[0];

      const apiKey = userService.createApiKey(user.id, {
        name: 'Expired Key',
        permissions: ['screenshot'],
        expiresIn: -1, // Already expired
      });

      const validation = userService.validateApiKey(apiKey.key);
      expect(validation).toBeNull();
    });

    test('should get user API keys', () => {
      const users = userService.getAllUsers();
      const user = users[0];

      const apiKey = userService.createApiKey(user.id, {
        name: 'Test Key',
        permissions: ['screenshot'],
      });

      const keys = userService.getUserApiKeys(user.id);
      expect(keys.length).toBeGreaterThan(0);
      expect(keys.some((k) => k.id === apiKey.id)).toBe(true);
    });

    test('should revoke API key', () => {
      const users = userService.getAllUsers();
      const user = users[0];

      const apiKey = userService.createApiKey(user.id, {
        name: 'To Revoke',
        permissions: ['screenshot'],
      });

      const revoked = userService.revokeApiKey(user.id, apiKey.id);
      expect(revoked).toBe(true);

      const validation = userService.validateApiKey(apiKey.key);
      expect(validation).toBeNull();
    });

    test('should delete API key', () => {
      const users = userService.getAllUsers();
      const user = users[0];

      const apiKey = userService.createApiKey(user.id, {
        name: 'To Delete',
        permissions: ['screenshot'],
      });

      const deleted = userService.deleteApiKey(user.id, apiKey.id);
      expect(deleted).toBe(true);

      const keys = userService.getUserApiKeys(user.id);
      expect(keys.find((k) => k.id === apiKey.id)).toBeUndefined();
    });

    test('should return false when revoking non-existent key', () => {
      const users = userService.getAllUsers();
      const user = users[0];

      const revoked = userService.revokeApiKey(user.id, 'non-existent-key');
      expect(revoked).toBe(false);
    });

    test('should return false when deleting non-existent key', () => {
      const users = userService.getAllUsers();
      const user = users[0];

      const deleted = userService.deleteApiKey(user.id, 'non-existent-key');
      expect(deleted).toBe(false);
    });
  });

  describe('Statistics', () => {
    test('should get statistics', () => {
      const stats = userService.getStats();

      expect(stats).toBeTruthy();
      expect(stats.totalUsers).toBeGreaterThanOrEqual(2);
      expect(stats.totalApiKeys).toBeGreaterThanOrEqual(1);
      expect(typeof stats.activeApiKeys).toBe('number');
    });
  });
});
