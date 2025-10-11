import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { scrapeService } from '../../services/scrape.service';
import { ScrapeRequest } from '../../types';
import { moduleLogger } from '../../utils/logger';
import { auth, requirePermission } from '../../middleware/auth.middleware';
import { config } from '../../config';

const logger = moduleLogger('scrape-route');

/**
 * Scrape Element 验证 Schema
 */
const scrapeElementSchema = z.object({
  selector: z.string().min(1, 'Selector cannot be empty'),
  property: z
    .enum(['textContent', 'innerText', 'innerHTML', 'value', 'href', 'src'])
    .optional()
    .default('textContent'),
  attribute: z.string().optional(),
  multiple: z.boolean().optional().default(false),
});

/**
 * Scrape 请求验证 Schema
 */
const scrapeRequestSchema = z.object({
  url: z.string().url('Invalid URL'),
  elements: z.array(scrapeElementSchema).min(1, 'At least one element is required'),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).optional(),
  timeout: z.number().min(1000).max(60000).optional(),
  waitForSelector: z.string().optional(),
  delay: z.number().min(0).max(10000).optional(),
});

/**
 * 注册 Scrape 路由
 */
export async function registerScrapeRoutes(server: FastifyInstance) {
  /**
   * POST /scrape
   * 抓取结构化数据
   */
  server.post(
    '/scrape',
    {
      preHandler: config.requireAuth ? [auth, requirePermission('scrape', '*')] : [],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // 验证请求参数
      const body = scrapeRequestSchema.parse(request.body);

      logger.info({ url: body.url, elementCount: body.elements.length }, 'Received scrape request');

      // 抓取数据
      const result = await scrapeService.scrape(body as ScrapeRequest);

      return reply.send({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Scrape request failed');

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
          code: 'SCRAPE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to scrape data',
        },
        timestamp: new Date().toISOString(),
      });
    }
    }
  );

  logger.info('Scrape routes registered');
}
