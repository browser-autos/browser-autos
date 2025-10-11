import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { queueManager } from '../../core/queue';
import { TaskType, TaskPriority } from '../../types/queue.types';
import { moduleLogger } from '../../utils/logger';
import { auth, requirePermission } from '../../middleware/auth.middleware';
import { config } from '../../config';

const logger = moduleLogger('queue-route');

/**
 * 添加任务请求 Schema
 */
const addTaskSchema = z.object({
  type: z.nativeEnum(TaskType),
  url: z.string().url().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  maxRetries: z.number().min(0).max(10).optional(),
  timeout: z.number().min(1000).optional(),

  // Screenshot 选项
  fullPage: z.boolean().optional(),
  selector: z.string().optional(),
  quality: z.number().min(0).max(100).optional(),
  format: z.enum(['png', 'jpeg', 'webp']).optional(),

  // PDF 选项
  pdfFormat: z.string().optional(),
  landscape: z.boolean().optional(),
  printBackground: z.boolean().optional(),
  scale: z.number().min(0.1).max(2).optional(),

  // Content 选项
  extractHtml: z.boolean().optional(),
  extractText: z.boolean().optional(),
  extractLinks: z.boolean().optional(),
  extractImages: z.boolean().optional(),
  extractMetadata: z.boolean().optional(),

  // Scrape 选项
  selectors: z.record(z.string(), z.string()).optional(),

  // 通用选项
  viewport: z.object({
    width: z.number().min(1),
    height: z.number().min(1),
  }).optional(),
  waitFor: z.union([
    z.number(),
    z.string(),
  ]).optional(),
});

type AddTaskInput = z.infer<typeof addTaskSchema>;

/**
 * 注册队列管理路由
 */
export async function registerQueueRoutes(server: FastifyInstance) {
  /**
   * POST /queue/tasks
   * 添加任务到队列
   */
  server.post(
    '/queue/tasks',
    async (request: FastifyRequest<{ Body: AddTaskInput }>, reply: FastifyReply) => {
      try {
        const input = addTaskSchema.parse(request.body);

        logger.info({ type: input.type }, 'Received add task request');

        const task = await queueManager.addTask(input);

        return reply.status(201).send({
          success: true,
          data: {
            taskId: task.id,
            type: task.type,
            status: task.status,
            priority: task.priority,
            createdAt: task.createdAt,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error({ error }, 'Add task request failed');

        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input',
              details: error.errors,
            },
            timestamp: new Date().toISOString(),
          });
        }

        return reply.status(500).send({
          success: false,
          error: {
            code: 'TASK_ADD_FAILED',
            message: error instanceof Error ? error.message : 'Failed to add task',
          },
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * GET /queue/tasks/:id
   * 获取任务详情
   */
  server.get(
    '/queue/tasks/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const task = await queueManager.getTask(id);

        if (!task) {
          return reply.status(404).send({
            success: false,
            error: {
              code: 'TASK_NOT_FOUND',
              message: `Task ${id} not found`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        return reply.send({
          success: true,
          data: task,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error({ error }, 'Get task request failed');
        return reply.status(500).send({
          success: false,
          error: {
            code: 'TASK_FETCH_FAILED',
            message: error instanceof Error ? error.message : 'Failed to fetch task',
          },
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * DELETE /queue/tasks/:id
   * 取消任务
   */
  server.delete(
    '/queue/tasks/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const success = await queueManager.cancelTask(id);

        if (!success) {
          return reply.status(404).send({
            success: false,
            error: {
              code: 'TASK_NOT_FOUND',
              message: `Task ${id} not found`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        return reply.send({
          success: true,
          data: {
            message: `Task ${id} cancelled successfully`,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error({ error }, 'Cancel task request failed');
        return reply.status(500).send({
          success: false,
          error: {
            code: 'TASK_CANCEL_FAILED',
            message: error instanceof Error ? error.message : 'Failed to cancel task',
          },
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * POST /queue/tasks/:id/retry
   * 重试失败的任务
   */
  server.post(
    '/queue/tasks/:id/retry',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const success = await queueManager.retryTask(id);

        if (!success) {
          return reply.status(404).send({
            success: false,
            error: {
              code: 'TASK_NOT_FOUND',
              message: `Task ${id} not found`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        return reply.send({
          success: true,
          data: {
            message: `Task ${id} retried successfully`,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error({ error }, 'Retry task request failed');
        return reply.status(500).send({
          success: false,
          error: {
            code: 'TASK_RETRY_FAILED',
            message: error instanceof Error ? error.message : 'Failed to retry task',
          },
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * GET /queue/stats
   * 获取队列统计信息
   */
  server.get('/queue/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await queueManager.getStats();

      return reply.send({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Get queue stats failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'STATS_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch stats',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * GET /queue/status
   * 获取队列状态
   */
  server.get('/queue/status', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const status = await queueManager.getStatus();

      return reply.send({
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Get queue status failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'STATUS_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch status',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * POST /queue/pause
   * 暂停队列
   */
  server.post('/queue/pause', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await queueManager.pause();

      return reply.send({
        success: true,
        data: {
          message: 'Queue paused successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Pause queue failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'PAUSE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to pause queue',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * POST /queue/resume
   * 恢复队列
   */
  server.post('/queue/resume', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await queueManager.resume();

      return reply.send({
        success: true,
        data: {
          message: 'Queue resumed successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Resume queue failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'RESUME_FAILED',
          message: error instanceof Error ? error.message : 'Failed to resume queue',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * DELETE /queue/clean
   * 清理已完成和失败的任务
   */
  server.delete('/queue/clean', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await queueManager.clean();

      return reply.send({
        success: true,
        data: {
          message: 'Queue cleaned successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Clean queue failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'CLEAN_FAILED',
          message: error instanceof Error ? error.message : 'Failed to clean queue',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * GET /queue/tasks
   * 获取任务列表
   */
  server.get('/queue/tasks', async (request: FastifyRequest<{
    Querystring: { status?: string }
  }>, reply: FastifyReply) => {
    try {
      const { status } = request.query;
      let tasks: any[] = [];

      switch (status) {
        case 'waiting':
          tasks = await queueManager.getWaitingTasks();
          break;
        case 'active':
          tasks = await queueManager.getActiveTasks();
          break;
        case 'failed':
          tasks = await queueManager.getFailedTasks();
          break;
        default:
          // 返回所有任务
          const [waiting, active, failed] = await Promise.all([
            queueManager.getWaitingTasks(),
            queueManager.getActiveTasks(),
            queueManager.getFailedTasks(),
          ]);
          tasks = [...waiting, ...active, ...failed];
      }

      return reply.send({
        success: true,
        data: {
          tasks,
          total: tasks.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Get tasks failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'TASKS_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch tasks',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  logger.info('Queue routes registered');
}
