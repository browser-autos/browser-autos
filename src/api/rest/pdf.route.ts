import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { pdfService } from '../../services/pdf.service';
import { PdfRequest } from '../../types';
import { moduleLogger } from '../../utils/logger';
import { auth, requirePermission } from '../../middleware/auth.middleware';
import { config } from '../../config';

const logger = moduleLogger('pdf-route');

/**
 * PDF 请求验证 Schema
 */
const pdfRequestSchema = z.object({
  url: z.string().url('Invalid URL'),
  format: z.enum(['A4', 'A3', 'Letter', 'Legal']).optional().default('A4'),
  printBackground: z.boolean().optional().default(true),
  landscape: z.boolean().optional().default(false),
  margin: z
    .object({
      top: z.string().optional(),
      right: z.string().optional(),
      bottom: z.string().optional(),
      left: z.string().optional(),
    })
    .optional(),
  scale: z.number().min(0.1).max(2).optional(),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).optional(),
  timeout: z.number().min(1000).max(60000).optional(),
  headerTemplate: z.string().optional(),
  footerTemplate: z.string().optional(),
  displayHeaderFooter: z.boolean().optional().default(false),
});

/**
 * 注册 PDF 路由
 */
export async function registerPdfRoutes(server: FastifyInstance) {
  /**
   * POST /pdf
   * 生成 PDF
   */
  server.post(
    '/pdf',
    {
      preHandler: config.requireAuth ? [auth, requirePermission('pdf', '*')] : [],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // 验证请求参数
      const body = pdfRequestSchema.parse(request.body);

      logger.info({ url: body.url }, 'Received PDF generation request');

      // 生成 PDF
      const pdf = await pdfService.generate(body as PdfRequest);

      // 设置响应头
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', 'inline; filename="document.pdf"');
      reply.header('Content-Length', pdf.length);

      return reply.send(pdf);
    } catch (error) {
      logger.error({ error }, 'PDF generation request failed');

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
          code: 'PDF_GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to generate PDF',
        },
        timestamp: new Date().toISOString(),
      });
    }
    }
  );

  logger.info('PDF routes registered');
}
