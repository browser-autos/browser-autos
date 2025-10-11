<div align="center">

<img src="./assets/logo_github.png" alt="browser.autos logo" width="100%">

# browser.autos

**Cloud-Native Headless Browser Automation API**

[![Docker](https://img.shields.io/badge/docker-browserautos%2Fbrowser--autos-blue?logo=docker)](https://hub.docker.com/r/browserautos/browser-autos)
[![Stars](https://img.shields.io/github/stars/browser-autos/browser-autos?style=social)](https://github.com/browser-autos/browser-autos)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[🌐 Website](https://browser.autos) | [📘 Documentation](./README.md) | [🐳 Docker Hub](https://hub.docker.com/r/browserautos/browser-autos) | [🇨🇳 中文文档](./README_CN.md)

</div>

---

## ⚡ Quick Start

### Using Docker (Recommended)

```bash
docker run -d -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  -e DEFAULT_ADMIN_USERNAME=browserautos \
  -e DEFAULT_ADMIN_PASSWORD=browser.autos \
  --shm-size=2gb \
  browserautos/browser-autos:latest

# Test it
curl http://localhost:3001/health

# Check logs to see default credentials
docker logs browser-autos | grep "Default credentials"
```

### From Source

```bash
# Clone repository
git clone git@github.com:browser-autos/browser-autos.git
cd browser-autos

# Install dependencies
npm install

# Start development server
npm run dev

# API available at http://localhost:3001
```

---

## 🎯 What is browser.autos?

**browser.autos** is a cloud-native headless browser platform that provides:

- **REST APIs** - Screenshots, PDFs, content extraction, web scraping
- **WebSocket Proxy** - Full CDP protocol access for Puppeteer/Playwright
- **Browser Pool** - 85% faster with automatic instance reuse
- **Queue System** - Redis-backed async processing
- **Multi-Arch** - AMD64 + ARM64 (Apple Silicon, AWS Graviton)
- **Production Ready** - JWT auth, Prometheus metrics, health checks

---

## 🚀 Use Cases

- 📸 **Screenshot Service** - Visual regression testing, thumbnails
- 📄 **PDF Generator** - Reports, invoices at scale
- 🕷️ **Web Scraper** - Price monitoring, content aggregation
- 🧪 **Testing Platform** - E2E tests, CI/CD integration
- 👀 **Monitoring System** - Change detection, uptime checks

---

## 📚 Documentation

- **[API Documentation](./docs/)** - Complete API reference
- **[Docker Deployment](./docs/DOCKER_README.md)** - Production deployment guide
- **[Credentials Guide](./docs/CREDENTIALS_GUIDE.md)** - Authentication setup
- **[API Examples](./docs/)** - Code examples and tutorials

---

## 🏗️ Architecture

```
Your Code → REST/WebSocket → browser.autos → Chromium Pool → Web
```

**Simple. Scalable. Reliable.**

---

## 🤝 Contributing

We welcome contributions! See our [contributing guidelines](./CONTRIBUTING.md) for details.

---

## 📄 License

MIT License - Free for commercial use.

---

<div align="center">

**Built with ❤️ by the browser.autos team**

[Website](https://browser.autos) · [Docker Hub](https://hub.docker.com/r/browserautos/browser-autos) · [Documentation](./docs/)

</div>
