/**
 * Test Authentication Helper
 *
 * Provides utilities for authentication in tests.
 */

import { AuthService } from '../../src/services/auth.service';
import { UserService } from '../../src/services/user.service';
import { User, UserRole } from '../../src/types/auth.types';

const authService = new AuthService();
const userService = new UserService();

/**
 * Creates a test user and returns auth tokens
 * Note: Uses existing users since UserService doesn't have createUser method
 */
export async function createTestUser(
  role: UserRole = UserRole.USER
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const users = userService.getAllUsers();
  let user = users.find((u) => u.role === role);

  // If no user with requested role, use first available user
  if (!user) {
    user = users[0];
  }

  const accessToken = authService.generateAccessToken(user);
  const refreshToken = authService.generateRefreshToken(user);

  return { user, accessToken, refreshToken };
}

/**
 * Creates a test admin user with tokens
 */
export async function createTestAdmin(): Promise<{
  user: User;
  accessToken: string;
  refreshToken: string;
}> {
  return createTestUser(UserRole.ADMIN);
}

/**
 * Gets the default admin user credentials
 */
export function getDefaultAdminCredentials(): { username: string; password: string } {
  return {
    username: 'admin',
    password: 'admin123',
  };
}

/**
 * Generates an authorization header with Bearer token
 */
export function getBearerHeader(token: string): { authorization: string } {
  return {
    authorization: `Bearer ${token}`,
  };
}

/**
 * Generates an API key header
 */
export function getApiKeyHeader(apiKey: string): { 'x-api-key': string } {
  return {
    'x-api-key': apiKey,
  };
}

/**
 * Creates a test API key for a user
 */
export async function createTestApiKey(userId: string): Promise<string> {
  const apiKey = userService.createApiKey(userId, {
    name: 'Test API Key',
    permissions: ['screenshot', 'pdf', 'content', 'scrape'],
  });
  return apiKey.key;
}
