/**
 * Integration Tests for Auth API
 */

import { FastifyInstance } from 'fastify';
import { createTestServer, closeTestServer } from '../helpers/testServer';
import { getDefaultAdminCredentials, createTestUser, getBearerHeader } from '../helpers/testAuth';
import { UserRole } from '../../src/types/auth.types';

describe('Auth API Integration Tests', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await closeTestServer(server);
  });

  describe('POST /auth/login', () => {
    test('should login with valid credentials', async () => {
      const credentials = getDefaultAdminCredentials();

      const response = await server.inject({
        method: 'POST',
        url: '/auth/login',
        payload: credentials,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.accessToken).toBeTruthy();
      expect(body.data.refreshToken).toBeTruthy();
      expect(body.data.user).toBeTruthy();
      expect(body.data.user.username).toBe(credentials.username);
    });

    test('should reject invalid credentials', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          username: 'admin',
          password: 'wrong-password',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    test('should reject missing credentials', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          username: 'admin',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /auth/me', () => {
    test('should return current user with valid token', async () => {
      const { accessToken, user } = await createTestUser();

      const response = await server.inject({
        method: 'GET',
        url: '/auth/me',
        headers: getBearerHeader(accessToken),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(user.id);
      expect(body.data.username).toBe(user.username);
    });

    test('should reject request without token', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/auth/me',
      });

      expect(response.statusCode).toBe(401);
    });

    test('should reject invalid token', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/auth/me',
        headers: getBearerHeader('invalid-token'),
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    test('should refresh access token with valid refresh token', async () => {
      const { refreshToken } = await createTestUser();

      const response = await server.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.accessToken).toBeTruthy();
      expect(body.data.refreshToken).toBeTruthy();
    });

    test('should reject invalid refresh token', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken: 'invalid-token' },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /auth/api-keys', () => {
    test('should create API key', async () => {
      const { accessToken } = await createTestUser();

      const response = await server.inject({
        method: 'POST',
        url: '/auth/api-keys',
        headers: getBearerHeader(accessToken),
        payload: {
          name: 'Test API Key',
          permissions: ['screenshot', 'pdf'],
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBeTruthy();
      expect(body.data.key).toMatch(/^ba_test_/);
      expect(body.data.name).toBe('Test API Key');
      expect(body.data.permissions).toEqual(['screenshot', 'pdf']);
    });

    test('should create API key with expiration', async () => {
      const { accessToken } = await createTestUser();

      const response = await server.inject({
        method: 'POST',
        url: '/auth/api-keys',
        headers: getBearerHeader(accessToken),
        payload: {
          name: 'Expiring Key',
          permissions: ['screenshot'],
          expiresIn: 7,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.expiresAt).toBeTruthy();
    });

    test('should reject unauthorized request', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/auth/api-keys',
        payload: {
          name: 'Test API Key',
          permissions: ['screenshot'],
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /auth/api-keys', () => {
    test('should list user API keys', async () => {
      const { accessToken } = await createTestUser();

      // Create an API key first
      await server.inject({
        method: 'POST',
        url: '/auth/api-keys',
        headers: getBearerHeader(accessToken),
        payload: {
          name: 'Test Key',
          permissions: ['screenshot'],
        },
      });

      const response = await server.inject({
        method: 'GET',
        url: '/auth/api-keys',
        headers: getBearerHeader(accessToken),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /auth/api-keys/:id', () => {
    test('should delete API key', async () => {
      const { accessToken } = await createTestUser();

      // Create an API key
      const createResponse = await server.inject({
        method: 'POST',
        url: '/auth/api-keys',
        headers: getBearerHeader(accessToken),
        payload: {
          name: 'To Delete',
          permissions: ['screenshot'],
        },
      });

      const createBody = JSON.parse(createResponse.body);
      const apiKey = createBody.data;

      // Delete it
      const response = await server.inject({
        method: 'DELETE',
        url: `/auth/api-keys/${apiKey.id}`,
        headers: getBearerHeader(accessToken),
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /auth/users', () => {
    test('should list all users for admin', async () => {
      const credentials = getDefaultAdminCredentials();

      // Login as admin
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/auth/login',
        payload: credentials,
      });

      const loginBody = JSON.parse(loginResponse.body);
      const { accessToken } = loginBody.data;

      // Get users
      const response = await server.inject({
        method: 'GET',
        url: '/auth/users',
        headers: getBearerHeader(accessToken),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(2);
    });

    test('should reject non-admin user', async () => {
      const { accessToken } = await createTestUser(UserRole.USER);

      const response = await server.inject({
        method: 'GET',
        url: '/auth/users',
        headers: getBearerHeader(accessToken),
      });

      expect(response.statusCode).toBe(403);
    });
  });
});
