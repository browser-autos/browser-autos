# browser.autos

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./logo_white.png">
  <source media="(prefers-color-scheme: light)" srcset="./logo_black.png">
  <img alt="browser.autos logo" src="./logo.png" width="200">
</picture>

**Production-ready browser automation API powered by Playwright Chromium**

[![Docker Image](https://img.shields.io/badge/docker-browserautos%2Fchromium-blue?logo=docker)](https://hub.docker.com/r/browserautos/chromium)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/browser-autos/browser-autos?style=social)](https://github.com/browser-autos/browser-autos)

[🇨🇳 中文文档](./README_CN.md) | [🐳 Docker Hub](https://hub.docker.com/r/browserautos/chromium)

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

## 🐳 Quick Start

### Using Docker (Recommended)

```bash
# Pull the latest image
docker pull browserautos/chromium:latest

# Run the container
docker run -d \
  --name chromium \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  --shm-size=2gb \
  --memory=4g \
  browserautos/chromium:latest

# Test the service
curl http://localhost:3001/health
```

### Local Development

```bash
# Clone the repository
git clone git@github.com:browser-autos/browser-autos.git
cd browser-autos

# Install dependencies
npm install

# Start Redis (required for queue)
docker run -d -p 6379:6379 redis:7-alpine

# Configure environment
cp .env.example .env

# Start development server
npm run dev

# API available at http://localhost:3001
```

---

## 📚 API Examples

### Screenshot

```bash
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "fullPage": true}' \
  -o screenshot.png
```

### PDF Generation

```bash
curl -X POST http://localhost:3001/pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "format": "A4"}' \
  -o document.pdf
```

### Web Scraping

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

---

## ✨ Features

### Core Capabilities

- **📸 Screenshot API** - Full page or element screenshots (PNG, JPEG, WebP)
- **📄 PDF Generation** - Convert web pages to PDF with custom styling
- **🔍 Content Extraction** - Extract HTML, text, and metadata
- **🕷️ Web Scraping** - CSS selector-based data extraction
- **🔌 WebSocket CDP Proxy** - Direct Puppeteer/Playwright integration
- **⚡ Browser Pool** - 85% faster with automatic reuse
- **🔒 Authentication** - JWT + API Key support
- **📊 Monitoring** - Prometheus metrics built-in

### Enterprise Features

- **Multi-Architecture**: AMD64 and ARM64 support (Apple Silicon, AWS Graviton)
- **Queue System**: Redis-backed async processing with priority and retry
- **Session Management**: Auto-cleanup, timeout controls, lifecycle tracking
- **API Documentation**: Interactive Swagger/OpenAPI docs at `/docs`
- **Production Ready**: Non-root execution, health checks, resource limits

---

## 🔌 Integration

### Puppeteer

```javascript
const puppeteer = require('puppeteer-core');

const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://localhost:3001/ws'
});

const page = await browser.newPage();
await page.goto('https://example.com');
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

## 📊 Performance

*Tested on 4 vCPU, 8GB RAM*

| Operation | Cold Start | With Browser Pool | Improvement |
|-----------|-----------|-------------------|-------------|
| Screenshot | 7.6s | 1.2s | **85% faster** |
| PDF | 8.0s | 2.0s | **75% faster** |
| Content | 4.5s | 1.5s | **67% faster** |

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
┌───────────────▼─────────────────────────┐
│         Business Logic                   │
│  ┌────────┐  ┌────────┐  ┌──────────┐  │
│  │Browser │  │Session │  │  Queue   │  │
│  │  Pool  │  │Manager │  │ Manager  │  │
│  └────────┘  └────────┘  └──────────┘  │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│       Chrome Instance Pool               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │Chrome│ │Chrome│ │Chrome│ │Chrome│  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
└──────────────────────────────────────────┘
```

---

## 📖 Documentation

- [Docker Deployment Guide](./docs/DOCKER_README.md) - Docker deployment guide
- [Testing Guide](./docs/TESTING.md) - Testing strategies and examples
- [Queue System](./docs/QUEUE_README.md) - Queue system documentation
- [Swagger UI](http://localhost:3001/docs) - Interactive API documentation

---

## 🌟 Use Cases

- 🧪 **CI/CD Testing** - Visual regression testing in your pipeline
- 📝 **Report Generation** - HTML to PDF conversion at scale
- 👀 **Web Monitoring** - Track content changes and get alerts
- 📊 **Data Collection** - Scrape structured data efficiently
- ✅ **E2E Testing** - Full browser automation for QA
- 🖼️ **Thumbnails** - Batch webpage screenshot generation
- 🔍 **SEO Audits** - Page analysis and crawling

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

MIT License - Free for commercial use.

---

## 🔗 Links

- 🌐 **Website**: https://browser.autos
- 📁 **GitHub**: https://github.com/browser-autos/browser-autos
- 🐳 **Docker Hub**: https://hub.docker.com/r/browserautos/chromium
- 🐛 **Issues**: https://github.com/browser-autos/browser-autos/issues

---

**Built with ❤️ by the browser.autos team**

**Version:** 1.0.0 | **Last Updated:** 2025-10-11
