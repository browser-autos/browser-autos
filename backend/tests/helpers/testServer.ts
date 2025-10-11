/**
 * Test Server Helper
 *
 * Provides utilities for creating and managing test server instances.
 */

import { FastifyInstance } from 'fastify';
import { createServer } from '../../src/server';

export class TestServer {
  private server: FastifyInstance | null = null;

  async start(): Promise<FastifyInstance> {
    this.server = await createServer();
    await this.server.ready();
    return this.server;
  }

  async stop(): Promise<void> {
    if (this.server) {
      await this.server.close();
      this.server = null;
    }
  }

  get instance(): FastifyInstance {
    if (!this.server) {
      throw new Error('Server not started. Call start() first.');
    }
    return this.server;
  }
}

/**
 * Creates a test server instance for a single test
 */
export async function createTestServer(): Promise<FastifyInstance> {
  const server = await createServer();
  await server.ready();
  return server;
}

/**
 * Closes a test server instance
 */
export async function closeTestServer(server: FastifyInstance): Promise<void> {
  await server.close();
}
