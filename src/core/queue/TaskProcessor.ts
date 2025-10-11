import { Task, TaskType } from '../../types/queue.types';
import { moduleLogger } from '../../utils/logger';
import { recordTask } from '../../utils/metrics';
import { screenshotService } from '../../services/screenshot.service';
import { pdfService } from '../../services/pdf.service';
import { contentService } from '../../services/content.service';
import { scrapeService } from '../../services/scrape.service';

const logger = moduleLogger('task-processor');

/**
 * Task Processor
 * 功能：处理不同类型的任务
 */
export class TaskProcessor {
  /**
   * 处理任务
   */
  async processTask(task: Task): Promise<any> {
    const startTime = Date.now();
    logger.info({ taskId: task.id, type: task.type }, 'Processing task');

    try {
      let result: any;

      switch (task.type) {
        case TaskType.SCREENSHOT:
          result = await this.processScreenshotTask(task);
          break;

        case TaskType.PDF:
          result = await this.processPdfTask(task);
          break;

        case TaskType.CONTENT:
          result = await this.processContentTask(task);
          break;

        case TaskType.SCRAPE:
          result = await this.processScrapeTask(task);
          break;

        case TaskType.CUSTOM:
          result = await this.processCustomTask(task);
          break;

        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      const duration = (Date.now() - startTime) / 1000;
      recordTask(task.type, duration, true);

      logger.info(
        { taskId: task.id, type: task.type, duration },
        'Task processed successfully'
      );

      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      recordTask(task.type, duration, false);

      logger.error(
        { error, taskId: task.id, type: task.type, duration },
        'Task processing failed'
      );

      throw error;
    }
  }

  /**
   * 处理截图任务
   */
  private async processScreenshotTask(task: Task): Promise<any> {
    logger.debug({ taskId: task.id }, 'Processing screenshot task');

    const result = await screenshotService.capture({
      url: task.config.url!,
      fullPage: task.config.fullPage,
      viewport: task.config.viewport,
      selector: task.config.selector,
      quality: task.config.quality,
      format: task.config.format,
    });

    return {
      taskId: task.id,
      type: task.type,
      data: result,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * 处理 PDF 任务
   */
  private async processPdfTask(task: Task): Promise<any> {
    logger.debug({ taskId: task.id }, 'Processing PDF task');

    const result = await pdfService.generate({
      url: task.config.url!,
      format: task.config.pdfFormat,
      landscape: task.config.landscape,
      printBackground: task.config.printBackground,
      scale: task.config.scale,
      margin: task.config.margin,
    });

    return {
      taskId: task.id,
      type: task.type,
      data: result,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * 处理内容提取任务
   */
  private async processContentTask(task: Task): Promise<any> {
    logger.debug({ taskId: task.id }, 'Processing content task');

    const result = await contentService.fetch({
      url: task.config.url!,
      includeHtml: task.config.includeHtml,
      includeText: task.config.includeText,
      includeMetadata: task.config.includeMetadata,
    });

    return {
      taskId: task.id,
      type: task.type,
      data: result,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * 处理爬取任务
   */
  private async processScrapeTask(task: Task): Promise<any> {
    logger.debug({ taskId: task.id }, 'Processing scrape task');

    const result = await scrapeService.scrape({
      url: task.config.url!,
      elements: task.config.elements || [],
      waitForSelector: task.config.waitForSelector,
      timeout: task.config.timeout,
    });

    return {
      taskId: task.id,
      type: task.type,
      data: result,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * 处理自定义任务
   */
  private async processCustomTask(task: Task): Promise<any> {
    logger.debug({ taskId: task.id }, 'Processing custom task');

    // 自定义任务处理逻辑
    // 可以通过 task.config.customHandler 来执行自定义处理函数

    if (task.config.customHandler) {
      const result = await task.config.customHandler(task);
      return {
        taskId: task.id,
        type: task.type,
        data: result,
        completedAt: new Date().toISOString(),
      };
    }

    throw new Error('Custom task handler not provided');
  }
}

// 导出单例
export const taskProcessor = new TaskProcessor();
