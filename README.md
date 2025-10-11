<div align="center">

<img src="./assets/logo_github.png" alt="browser.autos logo" width="100%">

# Cloud-Native Headless Browser Platform

**Write code. Run anywhere. Scrape everything.**

[![Docker](https://img.shields.io/badge/docker-browserautos%2Fbrowser--autos-blue?logo=docker)](https://hub.docker.com/r/browserautos/browser-autos)
[![Stars](https://img.shields.io/github/stars/browser-autos/browser-autos?style=social)](https://github.com/browser-autos/browser-autos)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[🌐 Website](https://browser.autos) | [📘 Docs](./backend/README.md) | [🐳 Docker Hub](https://hub.docker.com/r/browserautos/browser-autos) | [🇨🇳 中文文档](./README_CN.md)

</div>

---

## 📁 Repository Structure

```
browser.autos/
├── backend/          # API Server (Node.js + TypeScript + Fastify)
│   ├── src/          # Source code
│   ├── docker/       # Docker configurations
│   ├── docs/         # API documentation
│   └── tests/        # Test suites
│
├── frontend/         # Landing Page (Next.js + TypeScript)
│   ├── app/          # Next.js app directory
│   └── components/   # React components
│
└── assets/           # Shared assets (logos, images)
```

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
# Backend API
cd backend
npm install
npm run dev

# Frontend Landing Page
cd frontend
npm install
npm run dev
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

- **[Backend API Documentation](./backend/README.md)** - Full API reference
- **[Frontend Landing Page](./frontend/README.md)** - Website documentation
- **[Docker Deployment](./backend/docs/DOCKER_README.md)** - Production deployment guide
- **[API Examples](./backend/docs/)** - Code examples and tutorials

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

[Website](https://browser.autos) · [GitHub](https://github.com/browser-autos) · [Docker Hub](https://hub.docker.com/r/browserautos/browser-autos)

<sub>Making browser automation accessible to everyone, everywhere</sub>

</div>
