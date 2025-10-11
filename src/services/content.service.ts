import { Browser, Page } from 'puppeteer-core';
import { ContentRequest, ContentResponse } from '../types';
import { moduleLogger } from '../utils/logger';
import { browserPool } from '../core/browser/BrowserPool';

const logger = moduleLogger('content-service');

/**
 * Content 服务
 * 功能：网页内容抓取 + 元数据提取
 */
export class ContentService {
  /**
   * 抓取网页内容
   */
  async fetch(options: ContentRequest): Promise<ContentResponse> {
    const startTime = Date.now();
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      logger.info({ url: options.url }, 'Starting content fetch');

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

      // 初始化响应对象
      const response: ContentResponse = {
        url: options.url,
      };

      // 抓取 HTML
      if (options.includeHtml !== false) {
        response.html = await page.content();
      }

      // 抓取纯文本
      if (options.includeText !== false) {
        response.text = await page.evaluate(() => document.body.innerText);
      }

      // 抓取元数据
      if (options.includeMetadata !== false) {
        response.metadata = await this.extractMetadata(page);
      }

      // 关闭页面并释放浏览器
      await page.close();
      await browserPool.release(browser);

      const duration = Date.now() - startTime;
      logger.info(
        {
          url: options.url,
          duration,
          htmlLength: response.html?.length,
          textLength: response.text?.length,
        },
        'Content fetched successfully'
      );

      return response;
    } catch (error) {
      logger.error({ error, url: options.url }, 'Failed to fetch content');

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

  /**
   * 提取页面元数据
   */
  private async extractMetadata(page: Page): Promise<ContentResponse['metadata']> {
    return await page.evaluate(() => {
      const result: Record<string, any> = {};

      // 标题
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      const metaTitle = document.querySelector('meta[name="title"]');
      result.title =
        (ogTitle && ogTitle.getAttribute('content')) ||
        (twitterTitle && twitterTitle.getAttribute('content')) ||
        (metaTitle && metaTitle.getAttribute('content')) ||
        document.title;

      // 描述
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      const metaDesc = document.querySelector('meta[name="description"]');
      result.description =
        (ogDesc && ogDesc.getAttribute('content')) ||
        (twitterDesc && twitterDesc.getAttribute('content')) ||
        (metaDesc && metaDesc.getAttribute('content')) ||
        undefined;

      // 关键词
      const keywordsEl = document.querySelector('meta[name="keywords"]');
      if (keywordsEl) {
        const keywordsStr = keywordsEl.getAttribute('content');
        if (keywordsStr) {
          result.keywords = keywordsStr.split(',').map(k => k.trim());
        }
      }

      // 作者
      const authorEl = document.querySelector('meta[name="author"]');
      result.author = (authorEl && authorEl.getAttribute('content')) || undefined;

      // 图片
      const ogImage = document.querySelector('meta[property="og:image"]');
      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      const metaImage = document.querySelector('meta[name="image"]');
      result.image =
        (ogImage && ogImage.getAttribute('content')) ||
        (twitterImage && twitterImage.getAttribute('content')) ||
        (metaImage && metaImage.getAttribute('content')) ||
        undefined;

      return result;
    });
  }
}

// 导出单例
export const contentService = new ContentService();
