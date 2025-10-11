import { Browser, Page } from 'puppeteer-core';
import { PdfRequest } from '../types';
import { moduleLogger } from '../utils/logger';
import { browserPool } from '../core/browser/BrowserPool';

const logger = moduleLogger('pdf-service');

/**
 * PDF 服务
 * 功能：网页转 PDF + 浏览器池复用
 */
export class PdfService {
  /**
   * 生成 PDF
   */
  async generate(options: PdfRequest): Promise<Buffer> {
    const startTime = Date.now();
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      logger.info({ url: options.url }, 'Starting PDF generation');

      // 从浏览器池获取浏览器
      browser = await browserPool.acquire();
      page = await browser.newPage();

      // 访问网页
      const navigationOptions = {
        waitUntil: (options.waitUntil || 'networkidle2') as
          | 'load'
          | 'domcontentloaded'
          | 'networkidle0'
          | 'networkidle2',
        timeout: options.timeout || 30000,
      };

      await page.goto(options.url, navigationOptions);

      // PDF 生成选项
      const pdfOptions: any = {
        format: options.format || 'A4',
        printBackground: options.printBackground !== false,
        landscape: options.landscape || false,
        displayHeaderFooter: options.displayHeaderFooter || false,
      };

      // 边距设置
      if (options.margin) {
        pdfOptions.margin = {
          top: options.margin.top || '1cm',
          right: options.margin.right || '1cm',
          bottom: options.margin.bottom || '1cm',
          left: options.margin.left || '1cm',
        };
      }

      // 缩放比例
      if (options.scale) {
        pdfOptions.scale = options.scale;
      }

      // 页眉页脚模板
      if (options.headerTemplate) {
        pdfOptions.headerTemplate = options.headerTemplate;
      }
      if (options.footerTemplate) {
        pdfOptions.footerTemplate = options.footerTemplate;
      }

      // 生成 PDF
      const pdf = await page.pdf(pdfOptions);

      // 关闭页面并释放浏览器
      await page.close();
      await browserPool.release(browser);

      const duration = Date.now() - startTime;
      logger.info({ url: options.url, duration, size: pdf.length }, 'PDF generated successfully');

      return pdf as Buffer;
    } catch (error) {
      logger.error({ error, url: options.url }, 'Failed to generate PDF');

      // 清理资源
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          logger.error({ error: closeError }, 'Failed to close page');
        }
      }

      if (browser) {
        try {
          await browserPool.release(browser);
        } catch (releaseError) {
          logger.error({ error: releaseError }, 'Failed to release browser');
        }
      }

      throw error;
    }
  }
}

// 导出单例
export const pdfService = new PdfService();
