import { Browser, Page } from 'puppeteer-core';
import { ScrapeRequest, ScrapeResponse, ScrapeResult } from '../types';
import { moduleLogger } from '../utils/logger';
import { browserPool } from '../core/browser/BrowserPool';

const logger = moduleLogger('scrape-service');

/**
 * Scrape 服务
 * 功能：结构化数据抓取，支持 CSS 选择器
 */
export class ScrapeService {
  /**
   * 抓取网页数据
   */
  async scrape(options: ScrapeRequest): Promise<ScrapeResponse> {
    const startTime = Date.now();
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      logger.info({ url: options.url }, 'Starting scrape');

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

      // 等待特定选择器（如果指定）
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: options.timeout || 30000,
        });
      }

      // 额外延迟（如果指定）
      if (options.delay) {
        await new Promise((resolve) => setTimeout(resolve, options.delay));
      }

      // 抓取数据
      const results: ScrapeResult[] = [];

      for (const element of options.elements) {
        const result = await this.extractElement(page, element);
        results.push(result);
      }

      // 关闭页面并释放浏览器
      await page.close();
      await browserPool.release(browser);

      const duration = Date.now() - startTime;
      logger.info(
        {
          url: options.url,
          duration,
          elementCount: options.elements.length,
        },
        'Scrape completed successfully'
      );

      return {
        url: options.url,
        data: results,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error({ error, url: options.url }, 'Failed to scrape');

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
   * 提取单个元素数据
   */
  private async extractElement(page: Page, element: import('../types').ScrapeElement): Promise<ScrapeResult> {
    const { selector, property = 'textContent', attribute, multiple = false } = element;

    try {
      if (multiple) {
        // 提取多个元素
        const values = await page.evaluate(
          (sel, prop, attr) => {
            const elements = document.querySelectorAll(sel);
            const results: (string | null)[] = [];

            elements.forEach((el) => {
              if (attr) {
                // 获取属性值
                results.push(el.getAttribute(attr));
              } else {
                // 获取属性
                const htmlEl = el as HTMLElement;
                switch (prop) {
                  case 'textContent':
                    results.push(el.textContent);
                    break;
                  case 'innerText':
                    results.push(htmlEl.innerText);
                    break;
                  case 'innerHTML':
                    results.push(htmlEl.innerHTML);
                    break;
                  case 'value':
                    results.push((el as HTMLInputElement).value || null);
                    break;
                  case 'href':
                    results.push((el as HTMLAnchorElement).href || null);
                    break;
                  case 'src':
                    results.push((el as HTMLImageElement).src || null);
                    break;
                  default:
                    results.push(el.textContent);
                }
              }
            });

            return results;
          },
          selector,
          property,
          attribute
        );

        return {
          selector,
          value: values.filter((v) => v !== null) as string[],
        };
      } else {
        // 提取单个元素
        const value = await page.evaluate(
          (sel, prop, attr) => {
            const el = document.querySelector(sel);
            if (!el) return null;

            if (attr) {
              // 获取属性值
              return el.getAttribute(attr);
            }

            // 获取属性
            const htmlEl = el as HTMLElement;
            switch (prop) {
              case 'textContent':
                return el.textContent;
              case 'innerText':
                return htmlEl.innerText;
              case 'innerHTML':
                return htmlEl.innerHTML;
              case 'value':
                return (el as HTMLInputElement).value || null;
              case 'href':
                return (el as HTMLAnchorElement).href || null;
              case 'src':
                return (el as HTMLImageElement).src || null;
              default:
                return el.textContent;
            }
          },
          selector,
          property,
          attribute
        );

        return {
          selector,
          value,
        };
      }
    } catch (error) {
      logger.warn({ error, selector }, 'Failed to extract element');
      return {
        selector,
        value: null,
      };
    }
  }
}

// 导出单例
export const scrapeService = new ScrapeService();
