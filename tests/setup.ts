/**
 * Jest Setup File
 *
 * This file runs before each test suite.
 * It configures the test environment and provides global utilities.
 */

// Increase timeout for browser operations
jest.setTimeout(30000);

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.LOG_LEVEL = 'error';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.TOKEN_EXPIRY = '1h';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.ENABLE_METRICS = 'false';

// Suppress console output during tests (optional)
global.console = {
  ...console,
  log: jest.fn(), // Suppress console.log
  debug: jest.fn(), // Suppress console.debug
  info: jest.fn(), // Suppress console.info
  // Keep error and warn for debugging
  error: console.error,
  warn: console.warn,
};

// Clean up after all tests
afterAll(async () => {
  // Give time for async cleanup
  await new Promise((resolve) => setTimeout(resolve, 500));
});
