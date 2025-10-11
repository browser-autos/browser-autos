# Browser.autos - Browser Automation API

🚀 **browser.autos** - Production-ready browser automation API powered by Playwright Chromium. Provides WebSocket CDP proxy and REST APIs for screenshots, PDF generation, content extraction, and web scraping.

> **Official Docker Image**: `browserautos/chromium` - Multiple versions available for different use cases.

## Quick Start

```bash
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  --shm-size=2gb \
  --memory=4g \
  browserautos/browserautos:latest
```

Test the service:
```bash
curl http://localhost:3001/health
```

## Features

**browser.autos** provides enterprise-grade browser automation capabilities:

- **Screenshot API** - Full page or element screenshots (PNG, JPEG, WebP)
- **PDF Generation** - Convert web pages to PDF with custom styling
- **Content Extraction** - Extract HTML, text, and metadata intelligently
- **Web Scraping** - CSS selector-based data extraction
- **WebSocket Proxy** - Direct CDP protocol access for Puppeteer/Playwright
- **Browser Pool** - Automatic browser instance reuse for optimal performance
- **Prometheus Metrics** - Built-in monitoring and observability
- **JWT + API Key Auth** - Secure, flexible authentication

## Screenshot Example

```bash
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "fullPage": true}' \
  -o screenshot.png
```

## PDF Generation

```bash
curl -X POST http://localhost:3001/pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "format": "A4"}' \
  -o document.pdf
```

## Web Scraping

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

## Puppeteer Integration

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

## Playwright Integration

```javascript
const { chromium } = require('playwright');

const browser = await chromium.connect({
  wsEndpoint: 'ws://localhost:3001/ws'
});

const page = await browser.newPage();
await page.goto('https://example.com');
await browser.close();
```

## Environment Variables

```bash
# Required
JWT_SECRET=your-secret-key

# Optional
ENABLE_QUEUE=false
REDIS_URL=redis://redis:6379
BROWSER_POOL_MIN=2
BROWSER_POOL_MAX=10
LOG_LEVEL=info
```

## Resource Requirements

**Minimum:**
- Memory: 2GB
- CPU: 1 core
- Shared memory: 2GB (--shm-size=2gb) **Required**

**Recommended:**
- Memory: 4GB
- CPU: 2 cores
- Shared memory: 2GB

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /health | GET | Health check |
| /screenshot | POST | Generate screenshot |
| /pdf | POST | Generate PDF |
| /content | POST | Extract content |
| /scrape | POST | Scrape data |
| /ws | WebSocket | CDP proxy |
| /metrics | GET | Prometheus metrics |

## Authentication

Default users:
- Admin: `admin` / `admin123`
- API User: `api-user` / `apiuser123`

Login to get access token:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Use with API Key:
```bash
curl -X POST http://localhost:3001/screenshot \
  -H "X-API-Key: your-api-key" \
  -d '{"url": "https://example.com"}'
```

## Docker Compose

```yaml
version: '3.8'

services:
  chromium:
    image: browserautos/chromium:latest
    ports:
      - "3001:3001"
    environment:
      - JWT_SECRET=your-secret-key
      - ENABLE_QUEUE=false
    shm_size: '2gb'
    mem_limit: 4g
    cpus: 2
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

## Use Cases

**browser.autos** powers diverse automation workflows:

- **CI/CD Testing** - Visual regression testing in your pipeline
- **Report Generation** - HTML to PDF conversion at scale
- **Web Monitoring** - Track content changes and get alerts
- **Data Collection** - Scrape structured data efficiently
- **E2E Testing** - Full browser automation for QA
- **Thumbnail Creation** - Batch webpage screenshot generation
- **SEO Audits** - Crawl and analyze web pages
- **Content Verification** - Automated page validation

## Tech Stack

**browser.autos** is built with modern, proven technologies:

- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Fastify (high-performance HTTP server)
- **Browser**: Playwright Chromium 141.0.7390.37
- **Base Image**: Debian Bookworm Slim
- **Queue**: Bull + Redis (optional, for async tasks)
- **Monitoring**: Prometheus (metrics and observability)
- **Auth**: JWT + API Key (flexible authentication)
- **Architecture**: Multi-platform (AMD64 + ARM64)

## Troubleshooting

**Chromium fails to start:**
```bash
# Ensure sufficient shared memory
docker run --shm-size=2gb ...
```

**Out of memory:**
```bash
# Increase memory limit
docker run --memory=4g ...
```

**Check logs:**
```bash
docker logs chromium
```

## Performance

Environment: 4 vCPU, 8GB RAM

| Task | Average Time |
|------|--------------|
| Simple Screenshot | 2.3s |
| Complex Page | 4.6s |
| PDF Generation | 3.8s |
| Content Extraction | 1.5s |
| Web Scraping | 2.1s |

## Security

- Non-root user execution (UID 1001)
- JWT token authentication
- API key authorization
- Rate limiting
- CORS configuration
- Resource limits

## Available Versions

**browser.autos** provides multiple image versions to suit different needs:

| Tag | Base Image | Chromium Version | Size | Use Case |
|-----|-----------|------------------|------|----------|
| `latest` | Debian Bookworm Slim | 141.0.7390.37 | ~1.4GB | Production (Recommended) |
| `debian` | Debian Bookworm Slim | 141.0.7390.37 | ~1.4GB | Stable baseline |
| `alpine` | Alpine Linux | Latest | ~800MB | Lightweight (Coming Soon) |
| `1.0.0` | Debian Bookworm Slim | 141.0.7390.37 | ~1.4GB | Version pinned |

**Multi-Architecture Support:**
- ✅ `linux/amd64` - Intel/AMD 64-bit
- ✅ `linux/arm64` - Apple Silicon, AWS Graviton, Azure ARM

Pull specific version:
```bash
# Latest stable (recommended)
docker pull browserautos/chromium:latest

# Specific version (production lock)
docker pull browserautos/chromium:1.0.0

# Debian baseline
docker pull browserautos/chromium:debian
```

## Updates & Versioning

**browser.autos** follows semantic versioning and updates Chromium regularly:

- **Chromium Updates**: Every 1-2 weeks via Playwright releases
- **Security Patches**: Critical updates within 48 hours
- **Version Tags**: All releases are tagged (e.g., `1.0.0`, `1.1.0`)
- **Latest Tag**: Always points to the most recent stable version

Subscribe to releases:
```bash
# Watch for updates
docker pull browserautos/chromium:latest

# Check current version
docker run --rm browserautos/chromium:latest node -e "console.log(require('./package.json').version)"
```

## Support

**browser.autos** - Official Support Channels:

- 🌐 Website: https://browser.autos
- 📁 GitHub: https://github.com/browser-autos/browser-autos
- 🐛 Issues: https://github.com/browser-autos/browser-autos/issues
- 📖 Documentation: https://github.com/browser-autos/browser-autos

## License

MIT License - Free for commercial use

---

## About browser.autos

**browser.autos** is an open-source browser automation platform designed for developers, testers, and businesses. Our mission is to provide reliable, scalable, and easy-to-use browser automation infrastructure.

### Why browser.autos?

- 🎯 **Production-Ready**: Battle-tested in high-traffic environments
- 🚀 **High Performance**: Browser pooling and smart resource management
- 🔒 **Secure**: JWT + API Key authentication, non-root execution
- 📊 **Observable**: Built-in Prometheus metrics and monitoring
- 🌍 **Multi-Platform**: AMD64 and ARM64 architecture support
- 📦 **Easy Deploy**: Single Docker image, works out of the box

---

**Maintained by the browser.autos Team**

**Current Version:** 1.0.0
**Base Image:** Debian Bookworm Slim
**Chromium Version:** 141.0.7390.37 (via Playwright)
**Image Name:** `browserautos/chromium` _(unchanged, stable identifier)_
**Last Updated:** 2025-10-11

---

**⭐ If you find browser.autos useful, please star our [GitHub repository](https://github.com/browser-autos/browser-autos)!**
