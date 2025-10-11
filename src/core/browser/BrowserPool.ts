import puppeteer, { Browser } from 'puppeteer-core';
import { BrowserInstance, BrowserStatus, BrowserPoolConfig, BrowserPoolStats } from '../../types';
import { config, getChromeArgs } from '../../config';
import { moduleLogger } from '../../utils/logger';

const logger = moduleLogger('browser-pool');

/**
 * 浏览器池管理器 (MVP 版本)
 * 功能：
 * - 浏览器实例复用
 * - 自动创建和销毁
 * - 简单的生命周期管理
 */
export class BrowserPool {
  private instances: Map<string, BrowserInstance> = new Map();
  private config: BrowserPoolConfig;
  private isShuttingDown = false;

  constructor(poolConfig?: Partial<BrowserPoolConfig>) {
    this.config = {
      minInstances: poolConfig?.minInstances ?? config.browserPoolMin,
      maxInstances: poolConfig?.maxInstances ?? config.browserPoolMax,
      maxAge: poolConfig?.maxAge ?? config.browserMaxAge,
      launchOptions: {
        executablePath: config.chromeExecutablePath,
        headless: true,
        args: getChromeArgs(),
        ...(poolConfig?.launchOptions || {}),
      },
    };

    logger.info(
      {
        min: this.config.minInstances,
        max: this.config.maxInstances,
        maxAge: this.config.maxAge,
      },
      'Browser pool initialized'
    );
  }

  /**
   * 获取一个可用的浏览器实例
   */
  async acquire(): Promise<Browser> {
    if (this.isShuttingDown) {
      throw new Error('Browser pool is shutting down');
    }

    // 查找空闲的浏览器
    const idleInstance = this.findIdleBrowser();
    if (idleInstance) {
      idleInstance.status = BrowserStatus.BUSY;
      idleInstance.lastUsedAt = new Date();
      idleInstance.useCount++;

      logger.debug(
        {
          browserId: idleInstance.id,
          useCount: idleInstance.useCount,
          age: Date.now() - idleInstance.createdAt.getTime(),
        },
        'Reusing existing browser'
      );

      return idleInstance.browser;
    }

    // 如果没有空闲浏览器且未达到最大数量，创建新的
    if (this.instances.size < this.config.maxInstances) {
      const instance = await this.createBrowser();
      return instance.browser;
    }

    // 达到最大数量，等待并重试
    logger.warn({ poolSize: this.instances.size }, 'Browser pool at capacity, waiting...');
    await this.waitForAvailableBrowser();
    return this.acquire();
  }

  /**
   * 释放浏览器实例
   */
  async release(browser: Browser): Promise<void> {
    const instance = Array.from(this.instances.values()).find((i) => i.browser === browser);

    if (!instance) {
      logger.warn('Attempted to release unknown browser');
      return;
    }

    // 检查浏览器是否仍然连接
    if (!browser.connected) {
      logger.warn({ browserId: instance.id }, 'Browser disconnected, removing from pool');
      this.instances.delete(instance.id);
      return;
    }

    // 检查是否超过最大年龄
    const age = Date.now() - instance.createdAt.getTime();
    if (age > this.config.maxAge) {
      logger.info(
        { browserId: instance.id, age, maxAge: this.config.maxAge },
        'Browser exceeded max age, closing'
      );
      await this.closeBrowser(instance);
      return;
    }

    // 标记为空闲
    instance.status = BrowserStatus.IDLE;
    instance.lastUsedAt = new Date();

    logger.debug({ browserId: instance.id, useCount: instance.useCount }, 'Browser released');
  }

  /**
   * 关闭所有浏览器
   */
  async drain(): Promise<void> {
    this.isShuttingDown = true;
    logger.info({ poolSize: this.instances.size }, 'Draining browser pool');

    const closePromises = Array.from(this.instances.values()).map((instance) =>
      this.closeBrowser(instance)
    );

    await Promise.all(closePromises);
    this.instances.clear();

    logger.info('Browser pool drained');
  }

  /**
   * 获取池统计信息
   */
  getStats(): BrowserPoolStats {
    const instances = Array.from(this.instances.values());

    return {
      total: instances.length,
      idle: instances.filter((i) => i.status === BrowserStatus.IDLE).length,
      busy: instances.filter((i) => i.status === BrowserStatus.BUSY).length,
      launching: instances.filter((i) => i.status === BrowserStatus.LAUNCHING).length,
      closed: instances.filter((i) => i.status === BrowserStatus.CLOSED).length,
      error: instances.filter((i) => i.status === BrowserStatus.ERROR).length,
      totalUseCount: instances.reduce((sum, i) => sum + i.useCount, 0),
      averageAge:
        instances.length > 0
          ? instances.reduce((sum, i) => sum + (Date.now() - i.createdAt.getTime()), 0) /
            instances.length
          : 0,
    };
  }

  /**
   * 创建新的浏览器实例
   */
  private async createBrowser(): Promise<BrowserInstance> {
    const id = `browser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const instance: BrowserInstance = {
      id,
      browser: null as any,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      useCount: 0,
      status: BrowserStatus.LAUNCHING,
    };

    this.instances.set(id, instance);

    try {
      logger.info({ browserId: id }, 'Launching new browser');

      const browser = await puppeteer.launch(this.config.launchOptions);

      instance.browser = browser;
      instance.status = BrowserStatus.BUSY;
      instance.useCount = 1;

      // 监听浏览器断开事件
      browser.on('disconnected', () => {
        logger.warn({ browserId: id }, 'Browser disconnected unexpectedly');
        instance.status = BrowserStatus.CLOSED;
        this.instances.delete(id);
      });

      logger.info({ browserId: id }, 'Browser launched successfully');

      return instance;
    } catch (error) {
      instance.status = BrowserStatus.ERROR;
      this.instances.delete(id);
      logger.error({ error, browserId: id }, 'Failed to launch browser');
      throw error;
    }
  }

  /**
   * 关闭浏览器实例
   */
  private async closeBrowser(instance: BrowserInstance): Promise<void> {
    try {
      instance.status = BrowserStatus.CLOSING;

      if (instance.browser && instance.browser.connected) {
        await instance.browser.close();
      }

      instance.status = BrowserStatus.CLOSED;
      this.instances.delete(instance.id);

      logger.info(
        { browserId: instance.id, useCount: instance.useCount },
        'Browser closed successfully'
      );
    } catch (error) {
      logger.error({ error, browserId: instance.id }, 'Failed to close browser');
      instance.status = BrowserStatus.ERROR;
      this.instances.delete(instance.id);
    }
  }

  /**
   * 查找空闲的浏览器
   */
  private findIdleBrowser(): BrowserInstance | null {
    for (const instance of this.instances.values()) {
      if (instance.status === BrowserStatus.IDLE && instance.browser.connected) {
        return instance;
      }
    }
    return null;
  }

  /**
   * 等待可用的浏览器
   */
  private async waitForAvailableBrowser(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.findIdleBrowser() || this.instances.size < this.config.maxInstances) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // 最多等待 30 秒
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 30000);
    });
  }
}

// 导出单例
export const browserPool = new BrowserPool();
