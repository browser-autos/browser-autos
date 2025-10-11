# browser.autos

<div align="center">
  <img src="https://raw.githubusercontent.com/browser-autos/browser-autos/main/logo.png" alt="browser.autos logo" width="200">

  <h3>🚀 Production-ready browser automation platform</h3>

  <p>
    <strong>Enterprise-grade browser automation API powered by Playwright Chromium</strong>
  </p>

  <p>
    <a href="https://hub.docker.com/r/browserautos/chromium"><img src="https://img.shields.io/badge/docker-browserautos%2Fchromium-blue?logo=docker" alt="Docker Image"></a>
    <a href="https://github.com/browser-autos/browser-autos"><img src="https://img.shields.io/github/stars/browser-autos/browser-autos?style=social" alt="GitHub Stars"></a>
    <a href="https://github.com/browser-autos/browser-autos/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License"></a>
  </p>
</div>

---

## 💫 What We Build

**browser.autos** provides a complete browser automation solution for developers, QA teams, and businesses:

- 📸 **Screenshot API** - Capture full pages or specific elements
- 📄 **PDF Generation** - Convert web pages to PDF documents
- 🔍 **Content Extraction** - Extract HTML, text, and metadata
- 🕷️ **Web Scraping** - CSS selector-based data extraction
- 🔌 **WebSocket CDP Proxy** - Direct integration with Puppeteer/Playwright
- ⚡ **Browser Pool** - Automatic instance reuse (85% faster)
- 📊 **Monitoring** - Built-in Prometheus metrics
- 🔒 **Security** - JWT + API Key authentication

---

## 🎯 Quick Start

```bash
# Pull from Docker Hub
docker pull browserautos/chromium:latest

# Or pull from GitHub Container Registry
docker pull ghcr.io/browser-autos/browser-autos:latest

# Run the service
docker run -d -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  --shm-size=2gb \
  browserautos/chromium:latest

# Test it out
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  -o screenshot.png
```

---

## 🌟 Key Features

### Core Capabilities
- **REST APIs** for all common browser automation tasks
- **WebSocket Proxy** for CDP protocol access
- **Browser Pool** with smart instance management
- **Queue System** with Redis-backed async processing

### Enterprise Ready
- **Multi-Architecture**: AMD64 + ARM64 (Apple Silicon, AWS Graviton)
- **Production Tested**: Non-root execution, health checks, resource limits
- **Observable**: Prometheus metrics, structured logging
- **Documented**: Interactive Swagger/OpenAPI documentation

---

## 📦 Our Repositories

- **[browser-autos/browser-autos](https://github.com/browser-autos/browser-autos)** - Main API platform (TypeScript + Fastify)

## 🐳 Docker Images

- **[Docker Hub](https://hub.docker.com/r/browserautos/chromium)** - `browserautos/chromium:latest`
- **[GitHub Container Registry](https://github.com/orgs/browser-autos/packages/container/package/browser-autos)** - `ghcr.io/browser-autos/browser-autos:latest`

---

## 🏗️ Built With

- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Fastify (high-performance HTTP)
- **Browser**: Playwright Chromium
- **Queue**: Bull + Redis
- **Monitoring**: Prometheus
- **Container**: Docker (multi-arch)

---

## 💡 Use Cases

Perfect for:

- 🧪 CI/CD visual regression testing
- 📝 Automated report generation
- 👀 Web content monitoring
- 📊 Data collection and scraping
- ✅ End-to-end testing
- 🖼️ Batch thumbnail generation
- 🔍 SEO audits and analysis

---

## 📊 Performance

| Operation | Cold Start | With Browser Pool | Improvement |
|-----------|-----------|-------------------|-------------|
| Screenshot | 7.6s | 1.2s | **85% faster** |
| PDF | 8.0s | 2.0s | **75% faster** |
| Extraction | 4.5s | 1.5s | **67% faster** |

---

## 🤝 Get Involved

We welcome contributions from the community!

- 🐛 [Report bugs](https://github.com/browser-autos/browser-autos/issues)
- 💡 [Suggest features](https://github.com/browser-autos/browser-autos/issues)
- 📖 [Improve docs](https://github.com/browser-autos/browser-autos/pulls)
- ⭐ [Star our repo](https://github.com/browser-autos/browser-autos)

---

## 🔗 Links

- 🌐 **Website**: [browser.autos](https://browser.autos)
- 📖 **Documentation**: [GitHub](https://github.com/browser-autos/browser-autos)
- 🐳 **Docker Hub**: [browserautos/chromium](https://hub.docker.com/r/browserautos/chromium)
- 📦 **GitHub Container Registry**: [browser-autos](https://github.com/orgs/browser-autos/packages/container/package/browser-autos)
- 💬 **Issues**: [GitHub Issues](https://github.com/browser-autos/browser-autos/issues)

---

## 📄 License

All projects are released under the MIT License - free for commercial use.

---

<div align="center">
  <strong>Built with ❤️ by the browser.autos team</strong>
  <br><br>
  <sub>Making browser automation accessible to everyone</sub>
</div>
