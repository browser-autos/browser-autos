import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { screenshotService } from '../../services/screenshot.service';
import { ScreenshotRequest } from '../../types';
import { moduleLogger } from '../../utils/logger';
import { auth, requirePermission } from '../../middleware/auth.middleware';
import { config } from '../../config';

const logger = moduleLogger('screenshot-route');

/**
 * Screenshot 请求验证 Schema
 */
const screenshotRequestSchema = z.object({
  url: z.string().url('Invalid URL'),
  fullPage: z.boolean().optional().default(true),
  viewport: z
    .object({
      width: z.number().min(100).max(3840),
      height: z.number().min(100).max(2160),
    })
    .optional(),
  format: z.enum(['png', 'jpeg', 'webp']).optional().default('png'),
  quality: z.number().min(0).max(100).optional(),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).optional(),
  timeout: z.number().min(1000).max(60000).optional(),
  delay: z.number().min(0).max(10000).optional(),
  selector: z.string().optional(),
});

/**
 * 注册 Screenshot 路由
 */
export async function registerScreenshotRoutes(server: FastifyInstance) {
  /**
   * POST /screenshot
   * 生成网页截图
   */
  server.post(
    '/screenshot',
    {
      preHandler: config.requireAuth ? [auth, requirePermission('screenshot', '*')] : [],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // 验证请求参数
      const body = screenshotRequestSchema.parse(request.body);

      logger.info({ url: body.url }, 'Received screenshot request');

      // 生成截图
      const screenshot = await screenshotService.capture(body as ScreenshotRequest);

      // 设置响应头
      const contentType =
        body.format === 'jpeg'
          ? 'image/jpeg'
          : body.format === 'webp'
          ? 'image/webp'
          : 'image/png';

      reply.header('Content-Type', contentType);
      reply.header('Content-Disposition', `inline; filename="screenshot.${body.format}"`);

      return reply.send(screenshot);
    } catch (error) {
      logger.error({ error }, 'Screenshot request failed');

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
          code: 'SCREENSHOT_FAILED',
          message: error instanceof Error ? error.message : 'Failed to capture screenshot',
        },
        timestamp: new Date().toISOString(),
      });
    }
    }
  );

  logger.info('Screenshot routes registered');
}
