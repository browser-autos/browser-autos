import { Browser } from 'puppeteer-core';
import { WebSocket } from 'ws';
import { moduleLogger } from '../utils/logger';
import { browserPool } from '../core/browser/BrowserPool';

const logger = moduleLogger('websocket-proxy');

/**
 * WebSocket Proxy 服务
 * 功能：代理 CDP 协议，允许 Puppeteer/Playwright 客户端连接
 */
export class WebSocketProxyService {
  private connections = new Map<string, ProxyConnection>();

  /**
   * 创建新的代理连接
   */
  async createConnection(clientWs: WebSocket, connectionId: string): Promise<void> {
    let browser: Browser | null = null;
    let browserWs: WebSocket | null = null;

    try {
      logger.info({ connectionId }, 'Creating new WebSocket proxy connection');

      // 从浏览器池获取浏览器实例
      browser = await browserPool.acquire();

      // 获取浏览器的 WebSocket 端点
      const wsEndpoint = browser.wsEndpoint();
      logger.info({ connectionId, wsEndpoint }, 'Browser WebSocket endpoint obtained');

      // 创建到浏览器的 WebSocket 连接
      browserWs = new WebSocket(wsEndpoint);

      // 存储连接信息
      const connection: ProxyConnection = {
        id: connectionId,
        clientWs,
        browserWs,
        browser,
        createdAt: new Date(),
        messageCount: 0,
      };

      this.connections.set(connectionId, connection);

      // 设置浏览器 WebSocket 连接处理
      await this.setupBrowserWebSocket(connection);

      // 设置客户端 WebSocket 连接处理
      this.setupClientWebSocket(connection);

      logger.info({ connectionId }, 'WebSocket proxy connection established');
    } catch (error) {
      logger.error({ error, connectionId }, 'Failed to create WebSocket proxy connection');

      // 清理资源
      if (browserWs) {
        browserWs.close();
      }

      if (browser) {
        await browserPool.release(browser);
      }

      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(1011, 'Failed to establish proxy connection');
      }

      throw error;
    }
  }

  /**
   * 设置浏览器 WebSocket 连接
   */
  private async setupBrowserWebSocket(connection: ProxyConnection): Promise<void> {
    const { browserWs, clientWs, id } = connection;

    return new Promise((resolve, reject) => {
      // 如果已经是 OPEN 状态，直接 resolve
      if (browserWs.readyState === WebSocket.OPEN) {
        logger.debug({ connectionId: id }, 'Browser WebSocket already open');
        resolve();
      }

      browserWs.on('open', () => {
        logger.debug({ connectionId: id }, 'Browser WebSocket opened');
        resolve();
      });

      browserWs.on('message', (data: Buffer) => {
        connection.messageCount++;
        logger.debug({ connectionId: id, messageLength: data.length }, 'Browser message received');

        // 将浏览器消息转发给客户端
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(data);
          logger.debug({ connectionId: id }, 'Message forwarded to client');
        } else {
          logger.warn({ connectionId: id, clientWsState: clientWs.readyState }, 'Client WebSocket not open');
        }
      });

      browserWs.on('error', (error) => {
        logger.error({ error, connectionId: id }, 'Browser WebSocket error');
        reject(error);
        this.closeConnection(id);
      });

      browserWs.on('close', () => {
        logger.info({ connectionId: id }, 'Browser WebSocket closed');
        this.closeConnection(id);
      });

      // 超时处理
      setTimeout(() => {
        if (browserWs.readyState !== WebSocket.OPEN) {
          reject(new Error('Browser WebSocket connection timeout'));
        }
      }, 10000);
    });
  }

  /**
   * 设置客户端 WebSocket 连接
   */
  private setupClientWebSocket(connection: ProxyConnection): void {
    const { clientWs, browserWs, id } = connection;

    clientWs.on('message', (data: Buffer) => {
      connection.messageCount++;
      logger.debug({ connectionId: id, messageLength: data.length }, 'Client message received');

      // 将客户端消息转发给浏览器
      if (browserWs.readyState === WebSocket.OPEN) {
        browserWs.send(data);
        logger.debug({ connectionId: id }, 'Message forwarded to browser');
      } else {
        logger.warn({ connectionId: id, browserWsState: browserWs.readyState }, 'Browser WebSocket not open');
      }
    });

    clientWs.on('error', (error) => {
      logger.error({ error, connectionId: id }, 'Client WebSocket error');
      this.closeConnection(id);
    });

    clientWs.on('close', () => {
      logger.info({ connectionId: id }, 'Client WebSocket closed');
      this.closeConnection(id);
    });
  }

  /**
   * 关闭连接
   */
  private async closeConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    logger.info(
      {
        connectionId,
        messageCount: connection.messageCount,
        duration: Date.now() - connection.createdAt.getTime(),
      },
      'Closing WebSocket proxy connection'
    );

    // 关闭 WebSocket 连接
    if (connection.clientWs.readyState === WebSocket.OPEN) {
      connection.clientWs.close();
    }

    if (connection.browserWs.readyState === WebSocket.OPEN) {
      connection.browserWs.close();
    }

    // 释放浏览器实例
    if (connection.browser) {
      try {
        await browserPool.release(connection.browser);
      } catch (error) {
        logger.error({ error, connectionId }, 'Failed to release browser');
      }
    }

    // 从连接映射中删除
    this.connections.delete(connectionId);
  }

  /**
   * 获取活跃连接数
   */
  getActiveConnections(): number {
    return this.connections.size;
  }

  /**
   * 获取连接统计信息
   */
  getConnectionStats(): ConnectionStats {
    const connections = Array.from(this.connections.values());

    return {
      total: connections.length,
      totalMessages: connections.reduce((sum, conn) => sum + conn.messageCount, 0),
      avgMessageCount: connections.length > 0
        ? Math.round(connections.reduce((sum, conn) => sum + conn.messageCount, 0) / connections.length)
        : 0,
      oldestConnectionAge: connections.length > 0
        ? Math.max(...connections.map(conn => Date.now() - conn.createdAt.getTime()))
        : 0,
    };
  }

  /**
   * 关闭所有连接
   */
  async closeAllConnections(): Promise<void> {
    logger.info({ count: this.connections.size }, 'Closing all WebSocket proxy connections');

    const closePromises = Array.from(this.connections.keys()).map((id) =>
      this.closeConnection(id)
    );

    await Promise.all(closePromises);
  }
}

/**
 * 代理连接信息
 */
interface ProxyConnection {
  id: string;
  clientWs: WebSocket;
  browserWs: WebSocket;
  browser: Browser;
  createdAt: Date;
  messageCount: number;
}

/**
 * 连接统计信息
 */
interface ConnectionStats {
  total: number;
  totalMessages: number;
  avgMessageCount: number;
  oldestConnectionAge: number;
}

// 导出单例
export const webSocketProxyService = new WebSocketProxyService();
