# browser.autos

> **Official Docker Image:** `browserautos/browser-autos`

Production-ready browser automation API powered by Playwright Chromium. Provides REST APIs and WebSocket CDP proxy for screenshots, PDF generation, content extraction, and web scraping.

[![GitHub](https://img.shields.io/github/stars/browser-autos/browser-autos?style=social)](https://github.com/browser-autos/browser-autos)

---

## Quick Start

```bash
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  --shm-size=2gb \
  --memory=4g \
  browserautos/browser-autos:latest

# Test it
curl http://localhost:3001/health
```

---

## Features

- **📸 Screenshot API** - PNG, JPEG, WebP formats
- **📄 PDF Generation** - Custom page sizes and styling
- **🔍 Content Extraction** - HTML, text, and metadata
- **🕷️ Web Scraping** - CSS selector-based
- **🔌 WebSocket CDP** - Direct Puppeteer/Playwright integration
- **⚡ Browser Pool** - 85% faster with automatic reuse
- **🔒 Authentication** - JWT tokens and API keys
- **📊 Monitoring** - Prometheus metrics built-in

---

## REST API Examples

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

### Content Extraction

```bash
curl -X POST http://localhost:3001/content \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "includeMetadata": true}'
```

---

## Integration

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

## Authentication

**Default Users:**
- Admin: `admin` / `admin123`
- API User: `api-user` / `apiuser123`

**Get Access Token:**

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Use Token:**

```bash
# With JWT
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/screenshot

# With API Key
curl -H "X-API-Key: YOUR_KEY" http://localhost:3001/screenshot
```

---

## Docker Compose

```yaml
version: '3.8'

services:
  browser-autos:
    image: browserautos/browser-autos:latest
    ports:
      - "3001:3001"
    environment:
      - JWT_SECRET=your-secret-key
      - ENABLE_QUEUE=false
    shm_size: '2gb'
    mem_limit: 4g
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

---

## Configuration

**Required Environment Variables:**

```bash
JWT_SECRET=your-secret-key    # Required for authentication
```

**Optional Settings:**

```bash
# Queue System
ENABLE_QUEUE=false
REDIS_URL=redis://redis:6379

# Browser Pool
BROWSER_POOL_MIN=2
BROWSER_POOL_MAX=10

# Logging
LOG_LEVEL=info
```

**Resource Requirements:**

| | Minimum | Recommended |
|---|---------|-------------|
| Memory | 2GB | 4GB |
| CPU | 1 core | 2 cores |
| Shared Memory | 2GB (required) | 2GB |

> **Important:** Always set `--shm-size=2gb` for Chromium stability

---

## Available Versions

**browser.autos** provides multiple tags for different use cases:

| Tag | Base Image | Size | Use Case |
|-----|-----------|------|----------|
| `latest` | Debian Bookworm | ~1.4GB | **Recommended for production** |
| `1.0.0` | Debian Bookworm | ~1.4GB | Version locked |
| `debian` | Debian Bookworm | ~1.4GB | Stable baseline |
| `alpine` | Alpine Linux | ~800MB | Lightweight (coming soon) |

**Multi-Architecture:**
- ✅ `linux/amd64` - Intel/AMD
- ✅ `linux/arm64` - Apple Silicon, AWS Graviton, Azure ARM

```bash
# Pull specific version
docker pull browserautos/browser-autos:latest
docker pull browserautos/browser-autos:1.0.0
docker pull browserautos/browser-autos:debian
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check and system info |
| `/screenshot` | POST | Generate screenshot |
| `/pdf` | POST | Generate PDF |
| `/content` | POST | Extract page content |
| `/scrape` | POST | Scrape data with selectors |
| `/ws` | WebSocket | CDP protocol proxy |
| `/metrics` | GET | Prometheus metrics |
| `/docs` | GET | Interactive API documentation |

---

## Performance

*Tested on 4 vCPU, 8GB RAM*

| Operation | Cold Start | With Pool | Improvement |
|-----------|-----------|-----------|-------------|
| Screenshot | 7.6s | 1.2s | **85% faster** |
| PDF | 8.0s | 2.0s | **75% faster** |
| Content | 4.5s | 1.5s | **67% faster** |

---

## Use Cases

**browser.autos** powers diverse automation workflows:

- 🧪 **CI/CD Testing** - Visual regression testing
- 📝 **Report Generation** - HTML to PDF at scale
- 👀 **Web Monitoring** - Content change tracking
- 📊 **Data Collection** - Efficient web scraping
- ✅ **E2E Testing** - Full browser automation
- 🖼️ **Thumbnails** - Batch screenshot generation
- 🔍 **SEO Audits** - Page analysis and crawling

---

## Troubleshooting

**Chromium won't start:**
```bash
# Ensure shared memory is set
docker run --shm-size=2gb browserautos/browser-autos:latest
```

**Out of memory:**
```bash
# Increase memory limit
docker run --memory=4g browserautos/browser-autos:latest
```

**Check logs:**
```bash
docker logs browser-autos
docker logs -f browser-autos  # Follow mode
```

**Authentication errors:**
```bash
# Disable auth for testing (not recommended for production)
docker run -e REQUIRE_AUTH=false browserautos/browser-autos:latest
```

---

## Tech Stack

- **Runtime:** Node.js 20 + TypeScript
- **Framework:** Fastify
- **Browser:** Playwright Chromium 141.0.7390.37
- **Queue:** Bull + Redis (optional)
- **Monitoring:** Prometheus
- **Base:** Debian Bookworm Slim

---

## Security

- Non-root execution (UID 1001)
- JWT + API Key authentication
- Rate limiting
- CORS protection
- Resource limits
- Regular security updates

---

## Updates & Versioning

**browser.autos** follows semantic versioning:

- **Chromium:** Updated every 1-2 weeks via Playwright
- **Security:** Critical patches within 48 hours
- **Versions:** All releases tagged (1.0.0, 1.1.0, etc.)
- **Latest:** Always points to newest stable

**Check version:**
```bash
docker run --rm browserautos/browser-autos:latest \
  node -e "console.log(require('./package.json').version)"
```

---

## Support & Links

- 🌐 **Website:** https://browser.autos
- 📁 **GitHub:** https://github.com/browser-autos/browser-autos
- 🐛 **Issues:** https://github.com/browser-autos/browser-autos/issues
- 📖 **Documentation:** https://github.com/browser-autos/browser-autos

---

## About browser.autos

**browser.autos** is an open-source browser automation platform for developers, testers, and businesses.

**Why browser.autos?**

- 🎯 Production-ready and battle-tested
- 🚀 High performance with browser pooling
- 🔒 Secure by default
- 📊 Observable with Prometheus
- 🌍 Multi-platform support
- 📦 Easy deployment

---

**Maintained by the browser.autos Team**

**Image:** `browserautos/browser-autos` _(stable, unchanged)_
**Version:** 1.0.0
**Chromium:** 141.0.7390.37 (Playwright)
**Updated:** 2025-10-11

**⭐ Star us on [GitHub](https://github.com/browser-autos/browser-autos)!**

---

**MIT License** - Free for commercial use
