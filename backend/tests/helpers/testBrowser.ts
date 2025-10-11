/**
 * Test Browser Helper
 *
 * Provides mock browser instances for testing without actual browser launches.
 */

import { Browser, Page } from 'puppeteer-core';

/**
 * Creates a mock browser instance for testing
 */
export function createMockBrowser(): Browser {
  const mockPage = {
    goto: jest.fn().mockResolvedValue(null),
    screenshot: jest.fn().mockResolvedValue(Buffer.from('fake-screenshot')),
    pdf: jest.fn().mockResolvedValue(Buffer.from('fake-pdf')),
    content: jest.fn().mockResolvedValue('<html><body>Test</body></html>'),
    evaluate: jest.fn().mockResolvedValue({ text: 'Test content' }),
    setViewport: jest.fn().mockResolvedValue(undefined),
    waitForSelector: jest.fn().mockResolvedValue(null),
    close: jest.fn().mockResolvedValue(undefined),
    $$eval: jest.fn().mockResolvedValue([]),
    $eval: jest.fn().mockResolvedValue(null),
  } as unknown as Page;

  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn().mockResolvedValue(undefined),
    isConnected: jest.fn().mockReturnValue(true),
    pages: jest.fn().mockResolvedValue([mockPage]),
    version: jest.fn().mockResolvedValue('Chrome/120.0.0.0'),
    wsEndpoint: jest.fn().mockReturnValue('ws://localhost:9222/devtools/browser/test'),
  } as unknown as Browser;

  return mockBrowser;
}

/**
 * Creates a mock page instance for testing
 */
export function createMockPage(): Page {
  return {
    goto: jest.fn().mockResolvedValue(null),
    screenshot: jest.fn().mockResolvedValue(Buffer.from('fake-screenshot')),
    pdf: jest.fn().mockResolvedValue(Buffer.from('fake-pdf')),
    content: jest.fn().mockResolvedValue('<html><body>Test</body></html>'),
    evaluate: jest.fn().mockResolvedValue({ text: 'Test content' }),
    setViewport: jest.fn().mockResolvedValue(undefined),
    waitForSelector: jest.fn().mockResolvedValue(null),
    close: jest.fn().mockResolvedValue(undefined),
    $$eval: jest.fn().mockResolvedValue([]),
    $eval: jest.fn().mockResolvedValue(null),
    url: jest.fn().mockReturnValue('https://example.com'),
  } as unknown as Page;
}

/**
 * Waits for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}
