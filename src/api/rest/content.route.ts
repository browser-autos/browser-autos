import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { contentService } from '../../services/content.service';
import { ContentRequest } from '../../types';
import { moduleLogger } from '../../utils/logger';
import { auth, requirePermission } from '../../middleware/auth.middleware';
import { config } from '../../config';

const logger = moduleLogger('content-route');

/**
 * Content 请求验证 Schema
 */
const contentRequestSchema = z.object({
  url: z.string().url('Invalid URL'),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).optional(),
  timeout: z.number().min(1000).max(60000).optional(),
  includeHtml: z.boolean().optional().default(true),
  includeText: z.boolean().optional().default(true),
  includeMetadata: z.boolean().optional().default(true),
});

/**
 * 注册 Content 路由
 */
export async function registerContentRoutes(server: FastifyInstance) {
  /**
   * POST /content
   * 抓取网页内容
   */
  server.post(
    '/content',
    {
      preHandler: config.requireAuth ? [auth, requirePermission('content', '*')] : [],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // 验证请求参数
      const body = contentRequestSchema.parse(request.body);

      logger.info({ url: body.url }, 'Received content fetch request');

      // 抓取内容
      const content = await contentService.fetch(body as ContentRequest);

      return reply.send({
        success: true,
        data: content,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Content fetch request failed');

      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request parameters',
            details: error.errors,
          },
          timestamp: new Date().toISOString(),
        });
      }

      return reply.status(500).send({
        success: false,
        error: {
          code: 'CONTENT_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch content',
        },
        timestamp: new Date().toISOString(),
      });
    }
    }
  );

  logger.info('Content routes registered');
}
