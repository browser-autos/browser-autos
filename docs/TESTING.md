# Browser.autos Testing Guide

## Overview

This document describes the testing strategy and practices for the Browser.autos backend API.

## Test Structure

```
tests/
├── setup.ts              # Jest setup and global configuration
├── helpers/              # Test helper utilities
│   ├── testServer.ts     # Server lifecycle management
│   ├── testAuth.ts       # Authentication helpers
│   └── testBrowser.ts    # Mock browser helpers
├── unit/                 # Unit tests
│   ├── auth.service.test.ts
│   └── user.service.test.ts
├── integration/          # Integration tests
│   ├── auth.api.test.ts
│   └── health.api.test.ts
└── e2e/                  # End-to-end tests
    └── authentication-flow.test.ts
```

## Test Types

### Unit Tests

Unit tests focus on individual functions, methods, and classes in isolation. They mock external dependencies and test business logic.

**Location**: `tests/unit/`

**Example**:
```typescript
describe('AuthService', () => {
  test('should generate access token', () => {
    const token = authService.generateAccessToken(user);
    expect(token).toBeTruthy();
  });
});
```

**What to test**:
- Service methods
- Utility functions
- Data transformations
- Edge cases and error handling

### Integration Tests

Integration tests verify that different parts of the system work together correctly. They test API endpoints with real request/response cycles.

**Location**: `tests/integration/`

**Example**:
```typescript
describe('Auth API', () => {
  test('should login with valid credentials', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { username: 'admin', password: 'admin123' },
    });
    expect(response.statusCode).toBe(200);
  });
});
```

**What to test**:
- API endpoints
- Request/response handling
- Middleware behavior
- Authentication/authorization
- Error responses

### E2E Tests

End-to-end tests simulate real user workflows across multiple API calls and system components.

**Location**: `tests/e2e/`

**Example**:
```typescript
test('Complete authentication flow', async () => {
  // 1. Login
  // 2. Create API key
  // 3. Use API key
  // 4. Refresh token
  // 5. Revoke key
});
```

**What to test**:
- Complete user journeys
- Multi-step workflows
- Critical business flows
- Happy path and failure scenarios

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- tests/unit/auth.service.test.ts
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should generate"
```

## Test Configuration

### Jest Configuration
Located in `jest.config.js`:
- Uses `ts-jest` for TypeScript support
- Collects coverage from `src/**/*.ts`
- Excludes type definitions and index files
- Sets coverage thresholds to 70%

### Test Environment Variables
Set in `tests/setup.ts`:
```typescript
process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.LOG_LEVEL = 'error';
process.env.JWT_SECRET = 'test-jwt-secret';
```

## Test Helpers

### Server Helpers
```typescript
import { createTestServer, closeTestServer } from '../helpers/testServer';

let server: FastifyInstance;

beforeAll(async () => {
  server = await createTestServer();
});

afterAll(async () => {
  await closeTestServer(server);
});
```

### Authentication Helpers
```typescript
import {
  createTestUser,
  createTestAdmin,
  getBearerHeader,
  getApiKeyHeader,
  createTestApiKey,
} from '../helpers/testAuth';

// Create test user with tokens
const { user, accessToken, refreshToken } = await createTestUser();

// Get authorization headers
const headers = getBearerHeader(accessToken);
const apiHeaders = getApiKeyHeader(apiKey);
```

### Browser Helpers
```typescript
import { createMockBrowser, createMockPage } from '../helpers/testBrowser';

const mockBrowser = createMockBrowser();
const mockPage = createMockPage();
```

## Writing Good Tests

### Test Naming
Use descriptive test names that explain what is being tested:
```typescript
// ✅ Good
test('should return 401 when login credentials are invalid', () => {});

// ❌ Bad
test('login test', () => {});
```

### Test Structure
Follow the Arrange-Act-Assert (AAA) pattern:
```typescript
test('should create API key', async () => {
  // Arrange
  const { accessToken } = await createTestUser();
  const payload = { name: 'Test Key', permissions: ['screenshot'] };

  // Act
  const response = await server.inject({
    method: 'POST',
    url: '/auth/api-keys',
    headers: getBearerHeader(accessToken),
    payload,
  });

  // Assert
  expect(response.statusCode).toBe(201);
  expect(JSON.parse(response.body).name).toBe('Test Key');
});
```

### Test Independence
Each test should be independent and not rely on other tests:
```typescript
// ✅ Good - creates its own data
test('should delete API key', async () => {
  const { user, accessToken } = await createTestUser();
  const apiKey = await createTestApiKey(user.id);
  // ... test deletion
});

// ❌ Bad - relies on data from previous test
test('should delete API key', async () => {
  // Assumes API key exists from previous test
});
```

### Mocking
Mock external dependencies to isolate tests:
```typescript
// Mock browser for screenshot service tests
jest.mock('puppeteer-core', () => ({
  launch: jest.fn(() => createMockBrowser()),
}));
```

## Coverage Requirements

Minimum coverage thresholds (configured in `jest.config.js`):
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

View coverage report after running:
```bash
npm run test:coverage
open coverage/index.html
```

## Testing Best Practices

### 1. Test Behavior, Not Implementation
Focus on what the code does, not how it does it.

### 2. Keep Tests Simple
Each test should verify one thing. Split complex tests into multiple smaller tests.

### 3. Use Descriptive Assertions
```typescript
// ✅ Good
expect(user.role).toBe(UserRole.ADMIN);

// ❌ Bad
expect(user).toBeTruthy();
```

### 4. Clean Up Resources
Always clean up resources in `afterEach` or `afterAll`:
```typescript
afterAll(async () => {
  await closeTestServer(server);
});
```

### 5. Test Edge Cases
Don't just test the happy path:
- Empty inputs
- Invalid data
- Boundary conditions
- Error scenarios

### 6. Avoid Test Interdependence
Tests should pass regardless of execution order.

### 7. Use Test Data Builders
Create helper functions for common test data:
```typescript
function createTestUserData(overrides = {}) {
  return {
    username: 'testuser',
    password: 'password123',
    role: UserRole.USER,
    ...overrides,
  };
}
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Pre-deployment checks

GitHub Actions workflow (`.github/workflows/test.yml`):
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Debugging Tests

### Run Tests with Debugging
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### View Verbose Output
```bash
npm test -- --verbose
```

### Run Single Test
Add `.only` to focus on one test:
```typescript
test.only('should test this one thing', () => {
  // ...
});
```

### Skip Tests
Use `.skip` to temporarily disable tests:
```typescript
test.skip('will fix this later', () => {
  // ...
});
```

## Common Testing Patterns

### Testing Async Code
```typescript
test('should handle async operations', async () => {
  await expect(asyncFunction()).resolves.toBe(expected);
  await expect(failingFunction()).rejects.toThrow();
});
```

### Testing Errors
```typescript
test('should throw error for invalid input', () => {
  expect(() => {
    functionThatThrows();
  }).toThrow('Expected error message');
});
```

### Testing Timers
```typescript
jest.useFakeTimers();

test('should execute after timeout', () => {
  const callback = jest.fn();
  setTimeout(callback, 1000);

  jest.advanceTimersByTime(1000);
  expect(callback).toHaveBeenCalled();
});
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [Fastify Testing](https://www.fastify.io/docs/latest/Guides/Testing/)

---

**Last Updated**: 2025-10-11
**Maintainer**: Browser.autos Team
