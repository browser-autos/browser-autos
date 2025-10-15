# Contributing to Browser.autos

Thank you for your interest in contributing to Browser.autos! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and professional in all interactions.

---

## Getting Started

### Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **Git**: Latest version
- **Docker**: (Optional) For containerized development
- **VS Code**: (Recommended) With Dev Container support

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/browser-autos.git
   cd browser-autos
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/browser-autos/browser-autos.git
   ```

---

## Development Setup

### Option 1: Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright Chromium:
   ```bash
   npx playwright install chromium
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env and set JWT_SECRET
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Option 2: Dev Container (Recommended)

1. Install [VS Code Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open project in VS Code
3. Press F1 → "Dev Containers: Reopen in Container"
4. Wait for container to build and initialize

Benefits:
- ✅ Isolated environment with all dependencies
- ✅ Chromium and system dependencies pre-installed
- ✅ Automatic .env configuration
- ✅ Consistent development environment across team

---

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes

### 2. Make Changes

- Write clear, self-documenting code
- Add comments for complex logic
- Follow the [Code Standards](#code-standards) below

### 3. Test Your Changes

```bash
# Run unit tests
npm test

# Run specific test file
npm test -- src/core/browser/pool.test.ts

# Run with coverage
npm run test:coverage

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check
```

### 4. Commit Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
git commit -m "feat: add new screenshot option"
git commit -m "fix: resolve browser pool memory leak"
git commit -m "docs: update API documentation"
```

Commit types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style/formatting (no logic change)
- `refactor:` - Code refactoring
- `test:` - Test additions or fixes
- `chore:` - Build process, dependencies, etc.

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Code Standards

### TypeScript

- Use **TypeScript** for all code (strict mode enabled)
- Explicit types for function parameters and return values
- Avoid `any` - use `unknown` or proper typing
- Use interfaces for object shapes
- Use type aliases for unions/intersections

### Code Style

- **Indentation**: 2 spaces (enforced by Prettier)
- **Line length**: Max 100 characters
- **Quotes**: Single quotes (except in JSON)
- **Semicolons**: Required
- **Trailing commas**: Yes (multi-line)

### File Organization

```
src/
├── api/                 # API routes
│   ├── rest/           # REST endpoints
│   └── websocket/      # WebSocket routes
├── core/               # Core business logic
│   ├── browser/        # Browser pool management
│   ├── session/        # Session management
│   └── queue/          # Queue management
├── services/           # Business services
├── middleware/         # Express/Fastify middleware
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (no `I` prefix)
- **Types**: `PascalCase`

### Comments

- Use JSDoc for functions and classes:
  ```typescript
  /**
   * Takes a screenshot of the specified URL
   * @param url - Target URL
   * @param options - Screenshot options
   * @returns Base64-encoded screenshot data
   */
  async function takeScreenshot(url: string, options: ScreenshotOptions): Promise<string> {
    // ...
  }
  ```

- Inline comments for complex logic:
  ```typescript
  // Use page-level CDP endpoint instead of browser-level for full functionality
  const wsEndpoint = browserWSEndpoint.replace(/\/devtools\/browser\/[^/]+$/, `/devtools/page/${targetId}`);
  ```

---

## Testing

### Test Structure

```
tests/
├── unit/              # Unit tests (isolated, fast)
├── integration/       # Integration tests (multiple components)
└── e2e/              # End-to-end tests (full workflows)
```

### Writing Tests

Use **Jest** framework:

```typescript
import { BrowserPool } from '@/core/browser/pool';

describe('BrowserPool', () => {
  let pool: BrowserPool;

  beforeEach(() => {
    pool = new BrowserPool({ min: 1, max: 5 });
  });

  afterEach(async () => {
    await pool.destroy();
  });

  it('should acquire browser from pool', async () => {
    const browser = await pool.acquire();
    expect(browser).toBeDefined();
    await pool.release(browser);
  });

  it('should reuse browser instances', async () => {
    const browser1 = await pool.acquire();
    await pool.release(browser1);
    const browser2 = await pool.acquire();
    expect(browser2).toBe(browser1);
  });
});
```

### Test Coverage

- Aim for **>80% coverage** on core modules
- All new features must include tests
- All bug fixes must include regression tests

---

## Pull Request Process

### Before Submitting

1. ✅ All tests pass (`npm test`)
2. ✅ No linting errors (`npm run lint`)
3. ✅ Type check passes (`npm run type-check`)
4. ✅ Code builds successfully (`npm run build`)
5. ✅ Commit messages follow conventions
6. ✅ Branch is up-to-date with `main`

### PR Template

Your PR should include:

- **Title**: Clear, concise description (follows commit conventions)
- **Description**: What changes were made and why
- **Related Issues**: Link to related issues (#123)
- **Testing**: How you tested the changes
- **Screenshots**: (If applicable) Visual changes

Example:
```markdown
## Summary
Add support for custom viewport sizes in screenshot API

## Changes
- Added `viewport` option to `ScreenshotOptions` interface
- Updated screenshot service to apply viewport before capture
- Added validation for viewport dimensions

## Testing
- Added unit tests for viewport validation
- Added integration test for custom viewport screenshot
- Manual testing with various viewport sizes

## Related Issues
Closes #45

## Screenshots
![Screenshot](https://example.com/screenshot.png)
```

### Review Process

1. CI/CD checks must pass (automated tests, build)
2. At least one maintainer review required
3. Address all review comments
4. Maintainer will merge when approved

---

## Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** (v2.0.0): Breaking changes
- **MINOR** (v1.1.0): New features (backwards-compatible)
- **PATCH** (v1.0.1): Bug fixes (backwards-compatible)

### Release Checklist

1. **Update version in `package.json`**:
   ```bash
   npm version patch  # or minor/major
   ```

2. **Update `CHANGELOG.md`**:
   - Add release section with changes
   - Categorize: Features, Fixes, Docs, etc.

3. **Update documentation**:
   - README.md (if needed)
   - API docs (if needed)
   - Migration guides (for breaking changes)

4. **Commit and tag**:
   ```bash
   git add .
   git commit -m "chore: release v1.0.3"
   git tag v1.0.3
   ```

5. **Push to GitHub**:
   ```bash
   git push origin main
   git push origin v1.0.3
   ```

6. **GitHub Actions triggers automatically**:
   - Builds multi-arch Docker images
   - Pushes to Docker Hub and GHCR
   - Updates `latest` tag
   - Updates Docker Hub README

7. **Verify deployment**:
   ```bash
   docker pull browserautos/browser-autos:latest
   docker run -d -p 3001:3001 browserautos/browser-autos:latest
   curl http://localhost:3001/health
   ```

8. **Create GitHub Release**:
   - Go to GitHub Releases page
   - Draft new release from tag
   - Copy CHANGELOG content
   - Publish release

---

## Questions?

- **Documentation**: See [docs/](./docs/) directory
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Email**: contact@browser.autos

---

**Thank you for contributing to Browser.autos!**
