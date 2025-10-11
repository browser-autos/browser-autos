import { Browser, Page } from 'puppeteer-core';
import { ScreenshotRequest } from '../types';
import { moduleLogger } from '../utils/logger';
import { browserPool } from '../core/browser/BrowserPool';

const logger = moduleLogger('screenshot-service');

/**
 * Screenshot 服务 (优化版本 - 使用浏览器池)
 * 功能：基础截图功能 + 浏览器池复用
 */
export class ScreenshotService {
  /**
   * 生成网页截图
   */
  async capture(options: ScreenshotRequest): Promise<Buffer> {
    const startTime = Date.now();
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      logger.info({ url: options.url }, 'Starting screenshot capture');

      // 从浏览器池获取浏览器
      browser = await browserPool.acquire();
      page = await browser.newPage();

      // 设置视口
      if (options.viewport) {
        await page.setViewport(options.viewport);
      } else {
        await page.setViewport({ width: 1920, height: 1080 });
      }

      // 访问网页
      const navigationOptions = {
        waitUntil: (options.waitUntil || 'networkidle2') as 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2',
        timeout: options.timeout || 30000,
      };

      await page.goto(options.url, navigationOptions);

      // 额外延迟
      if (options.delay) {
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }

      // 截图选项
      const screenshotOptions: any = {
        type: options.format || 'png',
        fullPage: options.fullPage !== false,
      };

      // 质量设置（仅对 jpeg/webp 有效）
      if (options.quality && (options.format === 'jpeg' || options.format === 'webp')) {
        screenshotOptions.quality = options.quality;
      }

      // 选择器截图
      if (options.selector) {
        const element = await page.$(options.selector);
        if (!element) {
          throw new Error(`Element not found: ${options.selector}`);
        }
        const screenshot = await element.screenshot(screenshotOptions);

        // 关闭页面并释放浏览器
        await page.close();
        await browserPool.release(browser);

        const duration = Date.now() - startTime;
        logger.info({ url: options.url, duration }, 'Screenshot captured successfully');

        return Buffer.from(screenshot as string | Buffer);
      }

      // 整页截图
      const screenshot = await page.screenshot(screenshotOptions);

      // 关闭页面并释放浏览器
      await page.close();
      await browserPool.release(browser);

      const duration = Date.now() - startTime;
      logger.info({ url: options.url, duration }, 'Screenshot captured successfully');

      return Buffer.from(screenshot as string | Buffer);
    } catch (error) {
      logger.error({ error, url: options.url }, 'Failed to capture screenshot');

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
export const screenshotService = new ScreenshotService();
