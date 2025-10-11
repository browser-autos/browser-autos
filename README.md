# browser.autos

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./logo_white.png">
  <source media="(prefers-color-scheme: light)" srcset="./logo_black.png">
  <img alt="browser.autos logo" src="./logo.png" width="200">
</picture>

**Production-ready browser automation API powered by Playwright Chromium**

[![Docker Image](https://img.shields.io/badge/docker-browserautos%2Fchromium-blue?logo=docker)](https://hub.docker.com/r/browserautos/chromium)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![GitHub](https://img.shields.io/github/stars/browser-autos/browser-autos?style=social)](https://github.com/browser-autos/browser-autos)

[🇨🇳 中文文档](./README_CN.md) | [📖 Documentation](./backend/README.md) | [🐳 Docker Hub](https://hub.docker.com/r/browserautos/chromium)

---

## 🚀 What is browser.autos?

**browser.autos** is an enterprise-grade browser automation platform that provides:

- **REST APIs** for screenshots, PDF generation, content extraction, and web scraping
- **WebSocket CDP Proxy** for direct Puppeteer/Playwright integration
- **Browser Pool** with automatic instance reuse for optimal performance
- **Queue Management** with Redis-backed async task processing
- **Authentication** via JWT tokens and API keys
- **Monitoring** with built-in Prometheus metrics

Perfect for CI/CD testing, report generation, web monitoring, data collection, and E2E testing.

---

## ✨ Features

### Core Capabilities

| Feature | Description |
|---------|-------------|
| 📸 **Screenshot API** | Full page or element screenshots in PNG, JPEG, WebP |
| 📄 **PDF Generation** | Convert web pages to PDF with custom styling |
| 🔍 **Content Extraction** | Extract HTML, text, and metadata intelligently |
| 🕷️ **Web Scraping** | CSS selector-based data extraction |
| 🔌 **WebSocket Proxy** | Direct CDP protocol access for automation libraries |
| ⚡ **Browser Pool** | Automatic browser instance reuse (85% faster) |
| 📊 **Prometheus Metrics** | Built-in monitoring and observability |
| 🔒 **Secure Auth** | JWT + API Key authentication |

### Enterprise Features

- **Multi-Architecture**: AMD64 and ARM64 support (Apple Silicon, AWS Graviton)
- **Queue System**: Redis-backed async task processing with priority and retry
- **Session Management**: Auto-cleanup, timeout controls, lifecycle tracking
- **API Documentation**: Interactive Swagger/OpenAPI docs at `/docs`
- **Production Ready**: Non-root execution, health checks, resource limits

---

## 🐳 Quick Start

### Using Docker (Recommended)

```bash
# Pull the latest image
docker pull browserautos/chromium:latest

# Run the container
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  --shm-size=2gb \
  --memory=4g \
  browserautos/chromium:latest

# Test the service
curl http://localhost:3001/health
```

**Available Tags:**
- `latest` - Most recent stable version (Recommended)
- `1.0.0` - Version-pinned for production
- `debian` - Debian Bookworm baseline
- `alpine` - Lightweight variant (Coming Soon)

---

## 📚 API Examples

### 1. Screenshot API

```bash
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "fullPage": true}' \
  -o screenshot.png
```

### 2. PDF Generation

```bash
curl -X POST http://localhost:3001/pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "format": "A4"}' \
  -o document.pdf
```

### 3. Web Scraping

```bash
curl -X POST http://localhost:3001/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "elements": [
      {"selector": "h1", "property": "textContent"},
      {"selector": ".price", "property": "textContent"}
    ]
  }'
```

### 4. Content Extraction

```bash
curl -X POST http://localhost:3001/content \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com", "includeMetadata": true}'
```

---

## 🔌 Integration Examples

### Puppeteer

```javascript
const puppeteer = require('puppeteer-core');

const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://localhost:3001/ws'
});

const page = await browser.newPage();
await page.goto('https://example.com');
const screenshot = await page.screenshot();
await browser.close();
```

### Playwright

```javascript
const { chromium } = require('playwright');

const browser = await chromium.connect({
  wsEndpoint: 'ws://localhost:3001/ws'
});

const page = await browser.newPage();
await page.goto('https://example.com');
await browser.close();
```

---

## 🔒 Authentication

### Get Access Token

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Use API Key

```bash
curl -X POST http://localhost:3001/screenshot \
  -H "X-API-Key: your-api-key" \
  -d '{"url": "https://example.com"}'
```

**Default Users:**
- Admin: `admin` / `admin123`
- API User: `api-user` / `apiuser123`

---

## 📦 Docker Compose Setup

```yaml
version: '3.8'

services:
  browser-autos:
    image: browserautos/chromium:latest
    ports:
      - "3001:3001"
    environment:
      - JWT_SECRET=your-secret-key
      - ENABLE_QUEUE=true
      - REDIS_URL=redis://redis:6379
    shm_size: '2gb'
    mem_limit: 4g
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

---

## 📊 Performance Benchmarks

| Operation | Cold Start | With Browser Pool | Improvement |
|-----------|-----------|-------------------|-------------|
| Screenshot | 7.6s | 1.2s | **85% faster** |
| PDF Generation | 8.0s | 2.0s | **75% faster** |
| Content Extraction | 4.5s | 1.5s | **67% faster** |

*Environment: 4 vCPU, 8GB RAM, local development*

---

## 🛠️ Development

### Prerequisites

- Node.js 20+
- Docker (for Redis)
- Git

### Setup

```bash
# Clone the repository
git clone git@github.com:browser-autos/browser-autos.git
cd browser-autos

# Install backend dependencies
cd backend
npm install

# Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Start development server
npm run dev

# API will be available at http://localhost:3001
```

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 📖 Documentation

- [Backend Documentation](./backend/README.md) - Complete API reference
- [Docker Deployment](./backend/DOCKER_README.md) - Production deployment guide
- [Testing Guide](./backend/TESTING.md) - Testing strategies and examples
- [Queue System](./backend/QUEUE_README.md) - Async task processing
- [API Documentation](http://localhost:3001/docs) - Interactive Swagger UI

---

## 🌟 Use Cases

**browser.autos** powers diverse automation workflows:

- 🧪 **CI/CD Testing** - Visual regression testing in your pipeline
- 📝 **Report Generation** - HTML to PDF conversion at scale
- 👀 **Web Monitoring** - Track content changes and get alerts
- 📊 **Data Collection** - Scrape structured data efficiently
- ✅ **E2E Testing** - Full browser automation for QA
- 🖼️ **Thumbnail Creation** - Batch webpage screenshot generation
- 🔍 **SEO Audits** - Crawl and analyze web pages
- ✓ **Content Verification** - Automated page validation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Client Layer                   │
│  Puppeteer / Playwright / REST API      │
└───────────────┬─────────────────────────┘
                │
                │ HTTP / WebSocket
                │
┌───────────────▼─────────────────────────┐
│           API Gateway                    │
│  ┌──────────┐      ┌─────────────┐     │
│  │ REST API │      │ WebSocket   │     │
│  │ Routes   │      │ CDP Proxy   │     │
│  └──────────┘      └─────────────┘     │
└───────────────┬─────────────────────────┘
                │
                │
┌───────────────▼─────────────────────────┐
│         Business Logic                   │
│  ┌────────┐  ┌────────┐  ┌──────────┐  │
│  │Browser │  │Session │  │  Queue   │  │
│  │  Pool  │  │Manager │  │ Manager  │  │
│  └────────┘  └────────┘  └──────────┘  │
└───────────────┬─────────────────────────┘
                │
                │
┌───────────────▼─────────────────────────┐
│       Chrome Instance Pool               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │Chrome│ │Chrome│ │Chrome│ │Chrome│  │
│  │  #1  │ │  #2  │ │  #3  │ │  #4  │  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
└──────────────────────────────────────────┘
```

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - Free for commercial use. See [LICENSE](./LICENSE) for details.

---

## 🔗 Links

- 🌐 **Website**: https://browser.autos
- 📁 **GitHub**: https://github.com/browser-autos/browser-autos
- 🐳 **Docker Hub**: https://hub.docker.com/r/browserautos/chromium
- 🐛 **Issues**: https://github.com/browser-autos/browser-autos/issues

---

## ⭐ Support

If you find **browser.autos** useful, please consider:

- ⭐ Starring the [GitHub repository](https://github.com/browser-autos/browser-autos)
- 🐛 Reporting bugs and feature requests
- 📖 Contributing to documentation
- 💬 Sharing your experience

---

**Built with ❤️ by the browser.autos team**

**Version:** 1.0.0 | **Last Updated:** 2025-10-11
