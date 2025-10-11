/**
 * Integration Tests for Health API
 */

import { FastifyInstance } from 'fastify';
import { createTestServer, closeTestServer } from '../helpers/testServer';

describe('Health API Integration Tests', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await closeTestServer(server);
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('healthy');
      expect(body.data.uptime).toBeTruthy();
      expect(typeof body.data.uptime).toBe('number');
    });
  });

  describe('GET /', () => {
    test('should return API information', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Browser.autos API');
      expect(body.data.version).toBeTruthy();
      expect(body.data.endpoints).toBeTruthy();
      expect(body.data.endpoints.health).toBe('/health');
      expect(body.data.endpoints.auth).toBe('/auth');
    });
  });

  describe('GET /metrics', () => {
    test('should return Prometheus metrics', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.body).toContain('browser_autos');
    });
  });
});
