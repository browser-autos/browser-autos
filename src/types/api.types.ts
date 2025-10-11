/**
 * API 请求和响应类型定义
 */

/**
 * 通用 API 响应
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

/**
 * API 错误
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

/**
 * 截图请求参数
 */
export interface ScreenshotRequest {
  url: string;
  fullPage?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  timeout?: number;
  delay?: number;
  selector?: string;
}

/**
 * PDF 生成请求参数
 */
export interface PdfRequest {
  url: string;
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';
  printBackground?: boolean;
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  scale?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  timeout?: number;
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter?: boolean;
}

/**
 * 内容抓取请求参数
 */
export interface ContentRequest {
  url: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  timeout?: number;
  includeHtml?: boolean;
  includeText?: boolean;
  includeMetadata?: boolean;
}

/**
 * 内容抓取响应
 */
export interface ContentResponse {
  url: string;
  html?: string;
  text?: string;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    author?: string;
    image?: string;
  };
}

/**
 * 数据抓取请求参数
 */
export interface ScrapeRequest {
  url: string;
  elements: ScrapeElement[];
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  timeout?: number;
  waitForSelector?: string;
  delay?: number;
}

/**
 * 抓取元素定义
 */
export interface ScrapeElement {
  selector: string;
  property?: 'textContent' | 'innerText' | 'innerHTML' | 'value' | 'href' | 'src';
  attribute?: string;
  multiple?: boolean;
}

/**
 * 数据抓取响应
 */
export interface ScrapeResponse {
  url: string;
  data: ScrapeResult[];
  timestamp: string;
}

/**
 * 抓取结果
 */
export interface ScrapeResult {
  selector: string;
  value: string | string[] | null;
}

/**
 * 健康检查响应
 */
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  timestamp: string;
  services: {
    redis: ServiceStatus;
    browserPool: ServiceStatus;
  };
  stats: {
    activeSessions: number;
    queueLength: number;
    browserPool: {
      active: number;
      idle: number;
      max: number;
    };
  };
}

/**
 * 服务状态
 */
export interface ServiceStatus {
  status: 'up' | 'down';
  latency?: number;
  error?: string;
}
