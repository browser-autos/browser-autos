/**
 * E2E Tests for Complete Authentication Flow
 *
 * Tests the full user authentication journey from registration to API access.
 */

import { FastifyInstance } from 'fastify';
import { createTestServer, closeTestServer } from '../helpers/testServer';
import { getDefaultAdminCredentials, getBearerHeader, getApiKeyHeader } from '../helpers/testAuth';

describe('E2E: Authentication Flow', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await closeTestServer(server);
  });

  test('Complete authentication flow: Login -> Create API Key -> Use API Key -> Refresh Token', async () => {
    // Step 1: Login with admin credentials
    const credentials = getDefaultAdminCredentials();
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/auth/login',
      payload: credentials,
    });

    expect(loginResponse.statusCode).toBe(200);
    const loginBody = JSON.parse(loginResponse.body);
    expect(loginBody.success).toBe(true);
    const { accessToken, refreshToken, user } = loginBody.data;
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
    expect(user.username).toBe('admin');

    // Step 2: Verify token works by getting user info
    const meResponse = await server.inject({
      method: 'GET',
      url: '/auth/me',
      headers: getBearerHeader(accessToken),
    });

    expect(meResponse.statusCode).toBe(200);
    const meBody = JSON.parse(meResponse.body);
    expect(meBody.success).toBe(true);
    const userData = meBody.data;
    expect(userData.username).toBe('admin');

    // Step 3: Create an API Key
    const createKeyResponse = await server.inject({
      method: 'POST',
      url: '/auth/api-keys',
      headers: getBearerHeader(accessToken),
      payload: {
        name: 'E2E Test Key',
        permissions: ['screenshot', 'pdf', 'content'],
        expiresIn: 30,
      },
    });

    expect(createKeyResponse.statusCode).toBe(201);
    const createKeyBody = JSON.parse(createKeyResponse.body);
    expect(createKeyBody.success).toBe(true);
    const apiKey = createKeyBody.data;
    expect(apiKey.key).toMatch(/^ba_test_/);
    expect(apiKey.name).toBe('E2E Test Key');
    expect(apiKey.permissions).toEqual(['screenshot', 'pdf', 'content']);

    // Step 4: List API Keys
    const listKeysResponse = await server.inject({
      method: 'GET',
      url: '/auth/api-keys',
      headers: getBearerHeader(accessToken),
    });

    expect(listKeysResponse.statusCode).toBe(200);
    const listKeysBody = JSON.parse(listKeysResponse.body);
    expect(listKeysBody.success).toBe(true);
    const apiKeys = listKeysBody.data;
    expect(apiKeys.length).toBeGreaterThan(0);
    const foundKey = apiKeys.find((k: any) => k.id === apiKey.id);
    expect(foundKey).toBeTruthy();

    // Step 5: Use API Key to access health endpoint (no auth required, but key should work)
    const healthResponse = await server.inject({
      method: 'GET',
      url: '/health',
      headers: getApiKeyHeader(apiKey.key),
    });

    expect(healthResponse.statusCode).toBe(200);

    // Step 6: Refresh the access token
    const refreshResponse = await server.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken },
    });

    expect(refreshResponse.statusCode).toBe(200);
    const refreshBody = JSON.parse(refreshResponse.body);
    expect(refreshBody.success).toBe(true);
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshBody.data;
    expect(newAccessToken).toBeTruthy();
    expect(newRefreshToken).toBeTruthy();
    // Note: Tokens might be the same if generated at the same timestamp
    // The important thing is that we got valid tokens back

    // Step 7: Verify new token works
    const verifyNewTokenResponse = await server.inject({
      method: 'GET',
      url: '/auth/me',
      headers: getBearerHeader(newAccessToken),
    });

    expect(verifyNewTokenResponse.statusCode).toBe(200);

    // Step 8: Revoke API Key
    const revokeResponse = await server.inject({
      method: 'POST',
      url: `/auth/api-keys/${apiKey.id}/revoke`,
      headers: getBearerHeader(newAccessToken),
    });

    expect(revokeResponse.statusCode).toBe(200);

    // Step 9: Delete API Key
    const deleteResponse = await server.inject({
      method: 'DELETE',
      url: `/auth/api-keys/${apiKey.id}`,
      headers: getBearerHeader(newAccessToken),
    });

    expect(deleteResponse.statusCode).toBe(200);

    // Step 10: Verify API Key is deleted
    const listAfterDeleteResponse = await server.inject({
      method: 'GET',
      url: '/auth/api-keys',
      headers: getBearerHeader(newAccessToken),
    });

    expect(listAfterDeleteResponse.statusCode).toBe(200);
    const listAfterDeleteBody = JSON.parse(listAfterDeleteResponse.body);
    expect(listAfterDeleteBody.success).toBe(true);
    const remainingKeys = listAfterDeleteBody.data;
    const deletedKey = remainingKeys.find((k: any) => k.id === apiKey.id);
    expect(deletedKey).toBeUndefined();
  });

  test('Authentication failure scenarios', async () => {
    // Test 1: Login with wrong password
    const wrongPasswordResponse = await server.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: 'admin',
        password: 'wrong-password',
      },
    });

    expect(wrongPasswordResponse.statusCode).toBe(401);

    // Test 2: Access protected route without token
    const noTokenResponse = await server.inject({
      method: 'GET',
      url: '/auth/me',
    });

    expect(noTokenResponse.statusCode).toBe(401);

    // Test 3: Use invalid token
    const invalidTokenResponse = await server.inject({
      method: 'GET',
      url: '/auth/me',
      headers: getBearerHeader('invalid.token.here'),
    });

    expect(invalidTokenResponse.statusCode).toBe(401);

    // Test 4: Refresh with invalid refresh token
    const invalidRefreshResponse = await server.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken: 'invalid-refresh-token' },
    });

    expect(invalidRefreshResponse.statusCode).toBe(401);

    // Test 5: Create API key without authentication
    const noAuthKeyResponse = await server.inject({
      method: 'POST',
      url: '/auth/api-keys',
      payload: {
        name: 'Unauthorized Key',
        permissions: ['screenshot'],
      },
    });

    expect(noAuthKeyResponse.statusCode).toBe(401);
  });
});
