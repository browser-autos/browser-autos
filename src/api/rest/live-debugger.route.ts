import { FastifyInstance } from 'fastify';
import { moduleLogger } from '../../utils/logger';
import path from 'path';
import fs from 'fs';

const logger = moduleLogger('live-debugger');

/**
 * Register Live Debugger Routes
 *
 * Provides a lightweight, custom debugger with:
 * - Code editor (simple textarea, not Monaco)
 * - CDP Screencast live preview
 * - Console output
 * - Screenshot functionality
 */
export async function registerLiveDebuggerRoutes(server: FastifyInstance) {
  // Serve the live debugger HTML
  server.get('/debug/live', async (request, reply) => {
    try {
      const htmlPath = path.join(__dirname, '../../../public/live-debugger.html');

      if (!fs.existsSync(htmlPath)) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'Live debugger HTML not found',
          },
        });
      }

      const html = fs.readFileSync(htmlPath, 'utf-8');

      reply
        .type('text/html')
        .send(html);

    } catch (error) {
      logger.error({ error }, 'Failed to serve live debugger');

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load live debugger',
        },
      });
    }
  });

  logger.info('Live debugger routes registered at /debug/live');
}
