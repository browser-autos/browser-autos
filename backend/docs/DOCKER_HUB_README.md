# Browser.autos - Browser Automation API

[![Docker Image](https://img.shields.io/docker/v/username/browser-autos?sort=semver)](https://hub.docker.com/r/username/browser-autos)
[![Docker Pulls](https://img.shields.io/docker/pulls/username/browser-autos)](https://hub.docker.com/r/username/browser-autos)
[![Image Size](https://img.shields.io/docker/image-size/username/browser-autos/latest)](https://hub.docker.com/r/username/browser-autos)

Production-ready browser automation API service powered by Playwright Chromium. Provides WebSocket CDP proxy and REST APIs for screenshots, PDF generation, content extraction, and web scraping.

## 🚀 Quick Start

```bash
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  --shm-size=2gb \
  --memory=4g \
  username/browser-autos:latest
```

**Test the service:**
```bash
curl http://localhost:3001/health
```

## 📋 Features

- 🎨 **Screenshot API** - Full page or element screenshots (PNG, JPEG, WebP)
- 📄 **PDF Generation** - Convert web pages to PDF with custom options
- 🔍 **Content Extraction** - Extract HTML, text, links, images, and metadata
- 🕷️ **Web Scraping** - CSS selector-based data extraction
- 🔌 **WebSocket Proxy** - CDP protocol for Puppeteer/Playwright
- 🏊 **Browser Pool** - Automatic browser instance reuse
- 📊 **Prometheus Metrics** - Built-in monitoring
- 🔒 **JWT + API Key Auth** - Secure authentication

## 🐳 Docker Tags

| Tag | Description | Size |
|-----|-------------|------|
| `latest` | Latest stable release | ~1.4GB |
| `1.0.0` | Specific version | ~1.4GB |
| `debian` | Debian Slim + Playwright | ~1.4GB |

## ⚙️ Configuration

### Essential Environment Variables

```bash
# Authentication (required)
JWT_SECRET=your-secret-key-change-in-production

# Queue (optional)
ENABLE_QUEUE=false
REDIS_URL=redis://redis:6379

# Browser pool
BROWSER_POOL_MIN=2
BROWSER_POOL_MAX=10

# Logging
LOG_LEVEL=info
```

### Resource Requirements

**Minimum:**
- Memory: 2GB
- CPU: 1 core
- Shared memory: 2GB (`--shm-size=2gb`)

**Recommended:**
- Memory: 4GB
- CPU: 2 cores
- Shared memory: 2GB

## 📖 API Endpoints

### REST APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check and system status |
| `/screenshot` | POST | Generate webpage screenshot |
| `/pdf` | POST | Convert webpage to PDF |
| `/content` | POST | Extract page content and metadata |
| `/scrape` | POST | Scrape data with CSS selectors |
| `/auth/login` | POST | User authentication |
| `/metrics` | GET | Prometheus metrics |

### WebSocket

- `/ws` - CDP WebSocket proxy for Puppeteer/Playwright

## 🔐 Authentication

**Default users:**
- Admin: `browserautos` / `browser.autos`
- API User: `api-user` / `browser.autos`

**Get access token:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "browserautos", "password": "browser.autos"}'
```

**Use API Key:**
```bash
curl -X POST http://localhost:3001/screenshot \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 📸 Screenshot Example

```bash
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "fullPage": true,
    "format": "png",
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  }' \
  -o screenshot.png
```

## 📄 PDF Generation Example

```bash
curl -X POST http://localhost:3001/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "format": "A4",
    "landscape": false,
    "printBackground": true
  }' \
  -o document.pdf
```

## 🕷️ Web Scraping Example

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

## 🔌 Puppeteer/Playwright Integration

**Puppeteer:**
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

**Playwright:**
```javascript
const { chromium } = require('playwright');

const browser = await chromium.connect({
  wsEndpoint: 'ws://localhost:3001/ws'
});

const page = await browser.newPage();
await page.goto('https://example.com');
const screenshot = await page.screenshot();
await browser.close();
```

## 🐳 Docker Compose

```yaml
version: '3.8'

services:
  api:
    image: username/browser-autos:latest
    container_name: browser-autos
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - ENABLE_QUEUE=false
    shm_size: '2gb'
    mem_limit: 4g
    cpus: 2
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: browser-autos-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
```

## 🎯 Use Cases

- 📸 **Automated Screenshots** - CI/CD visual regression testing
- 📊 **Report Generation** - Convert HTML reports to PDF
- 🔍 **Web Monitoring** - Track content changes on websites
- 🕷️ **Data Collection** - Scrape structured data from web pages
- 🤖 **E2E Testing** - Browser automation with Puppeteer/Playwright
- 📱 **Social Media** - Generate preview images dynamically

## 📊 Monitoring

Access Prometheus metrics:
```bash
curl http://localhost:3001/metrics
```

**Available metrics:**
- HTTP request count and duration
- Browser pool status
- Task execution time
- Active sessions
- Queue statistics

## 🔒 Security

- ✅ Non-root user execution
- ✅ JWT token authentication
- ✅ API key authorization
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Resource limits

## 🛠️ Tech Stack

- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Fastify
- **Browser**: Playwright Chromium 141.x
- **Base Image**: Debian Bookworm Slim
- **Queue**: Bull + Redis (optional)
- **Monitoring**: Prometheus

## 📚 Documentation

- [GitHub Repository](https://github.com/username/browser-autos)
- [API Documentation](https://github.com/username/browser-autos#api-documentation)
- [Configuration Guide](https://github.com/username/browser-autos/blob/main/backend/README_DEBIAN.md)
- [Migration Guide](https://github.com/username/browser-autos/blob/main/backend/DOCKERFILE_MIGRATION.md)

## 🐛 Troubleshooting

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

**Health check fails:**
```bash
# Check logs
docker logs browser-autos

# Manual test
docker exec browser-autos wget -O- http://localhost:3001/health
```

## 📝 License

MIT License

## 🙏 Support

- 🐛 [Report Issues](https://github.com/username/browser-autos/issues)
- 💬 [Discussions](https://github.com/username/browser-autos/discussions)
- 📖 [Documentation](https://github.com/username/browser-autos)

---

**Maintained by Browser.autos Team**
**Version**: 1.0.0 (Debian Slim + Playwright)
**Updated**: 2025-10-11
