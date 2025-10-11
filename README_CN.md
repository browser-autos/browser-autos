<div align="center">

# browser.autos

<img src="./assets/logo_github.png" alt="browser.autos logo" width="100%">

<h3>基于 Playwright Chromium 的生产级浏览器自动化 API</h3>

</div>

[![Docker Image](https://img.shields.io/badge/docker-browserautos%2Fbrowser--autos-blue?logo=docker)](https://hub.docker.com/r/browserautos/browser-autos)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/browser-autos/browser-autos?style=social)](https://github.com/browser-autos/browser-autos)

[🇺🇸 English](./README.md) | [🐳 Docker Hub](https://hub.docker.com/r/browserautos/browser-autos)

---

## 🚀 什么是 browser.autos?

**browser.autos** 是一个企业级浏览器自动化平台，提供：

- **REST API** 实现截图、PDF 生成、内容提取和网页爬取
- **WebSocket CDP 代理** 直接集成 Puppeteer/Playwright
- **浏览器池** 自动实例复用，性能提升 85%
- **队列管理** 基于 Redis 的异步任务处理
- **身份认证** 支持 JWT Token 和 API Key
- **监控指标** 内置 Prometheus 监控

完美适用于 CI/CD 测试、报告生成、网页监控、数据采集和端到端测试。

---

## ✨ 功能特性

### 核心能力

| 功能 | 描述 |
|------|------|
| 📸 **截图 API** | 全页或元素截图，支持 PNG、JPEG、WebP |
| 📄 **PDF 生成** | 网页转 PDF，自定义样式 |
| 🔍 **内容提取** | 智能提取 HTML、文本和元数据 |
| 🕷️ **网页爬取** | 基于 CSS 选择器的数据提取 |
| 🔌 **WebSocket 代理** | 直接访问 CDP 协议用于自动化库 |
| ⚡ **浏览器池** | 自动浏览器实例复用（性能提升 85%）|
| 📊 **Prometheus 指标** | 内置监控和可观测性 |
| 🔒 **安全认证** | JWT + API Key 双重认证 |

### 企业级特性

- **多架构支持**：AMD64 和 ARM64（Apple Silicon、AWS Graviton）
- **队列系统**：基于 Redis 的异步任务处理，支持优先级和重试
- **会话管理**：自动清理、超时控制、生命周期追踪
- **API 文档**：交互式 Swagger/OpenAPI 文档（`/docs`）
- **生产就绪**：非 root 执行、健康检查、资源限制

---

## 🐳 快速开始

### 使用 Docker（推荐）

**方式 1: Docker Hub**

```bash
# 拉取最新镜像
docker pull browserautos/browser-autos:latest

# 运行容器
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  --shm-size=2gb \
  --memory=4g \
  browserautos/browser-autos:latest

# 测试服务
curl http://localhost:3001/health
```

**方式 2: GitHub Container Registry**

```bash
# 从 GHCR 拉取
docker pull ghcr.io/browser-autos/browser-autos:latest

# 运行容器
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  --shm-size=2gb \
  --memory=4g \
  ghcr.io/browser-autos/browser-autos:latest
```

**可用标签：**
- `latest` - 最新稳定版本（推荐）
- `1.0.0` - 版本锁定，适合生产环境
- `debian` - Debian Bookworm 基础镜像
- `alpine` - 轻量级版本（即将推出）

---

## 📚 API 示例

### 1. 截图 API

```bash
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "fullPage": true}' \
  -o screenshot.png
```

### 2. PDF 生成

```bash
curl -X POST http://localhost:3001/pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "format": "A4"}' \
  -o document.pdf
```

### 3. 网页爬取

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

### 4. 内容提取

```bash
curl -X POST http://localhost:3001/content \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com", "includeMetadata": true}'
```

---

## 🔌 集成示例

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

## 🔒 身份认证

### 获取访问令牌

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 使用 API Key

```bash
curl -X POST http://localhost:3001/screenshot \
  -H "X-API-Key: your-api-key" \
  -d '{"url": "https://example.com"}'
```

**默认用户：**
- 管理员：`admin` / `admin123`
- API 用户：`api-user` / `apiuser123`

---

## 📦 Docker Compose 配置

```yaml
version: '3.8'

services:
  browser-autos:
    image: browserautos/browser-autos:latest
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

## 📊 性能基准

| 操作 | 冷启动 | 使用浏览器池 | 性能提升 |
|------|--------|------------|---------|
| 截图 | 7.6秒 | 1.2秒 | **快 85%** |
| PDF 生成 | 8.0秒 | 2.0秒 | **快 75%** |
| 内容提取 | 4.5秒 | 1.5秒 | **快 67%** |

*测试环境：4 核 CPU，8GB 内存，本地开发*

---

## 🛠️ 开发

### 环境要求

- Node.js 20+
- Docker（用于 Redis）
- Git

### 设置步骤

```bash
# 克隆仓库
git clone git@github.com:browser-autos/browser-autos.git
cd browser-autos

# 安装依赖
npm install

# 启动 Redis
docker run -d -p 6379:6379 redis:7-alpine

# 启动开发服务器
npm run dev

# API 地址: http://localhost:3001
```

### 测试

```bash
# 运行所有测试
npm test

# 监视模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

---

## 📖 文档

- [Docker 部署指南](./docs/DOCKER_README.md) - 生产环境部署指南
- [测试指南](./docs/TESTING.md) - 测试策略和示例
- [队列系统](./docs/QUEUE_README.md) - 异步任务处理
- [API 文档](http://localhost:3001/docs) - 交互式 Swagger UI

---

## 🌟 使用场景

**browser.autos** 支持多种自动化工作流：

- 🧪 **CI/CD 测试** - 在流水线中进行视觉回归测试
- 📝 **报告生成** - 大规模 HTML 转 PDF
- 👀 **网页监控** - 追踪内容变化并发送告警
- 📊 **数据采集** - 高效爬取结构化数据
- ✅ **端到端测试** - QA 的完整浏览器自动化
- 🖼️ **缩略图生成** - 批量生成网页截图
- 🔍 **SEO 审计** - 爬取和分析网页
- ✓ **内容验证** - 自动化页面验证

---

## 🏗️ 架构

```
┌─────────────────────────────────────────┐
│           客户端层                        │
│  Puppeteer / Playwright / REST API      │
└───────────────┬─────────────────────────┘
                │
                │ HTTP / WebSocket
                │
┌───────────────▼─────────────────────────┐
│           API 网关                        │
│  ┌──────────┐      ┌─────────────┐     │
│  │ REST API │      │ WebSocket   │     │
│  │ 路由     │      │ CDP 代理    │     │
│  └──────────┘      └─────────────┘     │
└───────────────┬─────────────────────────┘
                │
                │
┌───────────────▼─────────────────────────┐
│         业务逻辑层                        │
│  ┌────────┐  ┌────────┐  ┌──────────┐  │
│  │浏览器  │  │会话    │  │  队列    │  │
│  │  池    │  │管理器  │  │ 管理器   │  │
│  └────────┘  └────────┘  └──────────┘  │
└───────────────┬─────────────────────────┘
                │
                │
┌───────────────▼─────────────────────────┐
│       Chrome 实例池                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │Chrome│ │Chrome│ │Chrome│ │Chrome│  │
│  │  #1  │ │  #2  │ │  #3  │ │  #4  │  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
└──────────────────────────────────────────┘
```

---

## 🤝 贡献

我们欢迎贡献！请查看我们的贡献指南。

1. Fork 本仓库
2. 创建特性分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m '添加新功能'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 开启 Pull Request

---

## 📄 许可证

MIT License - 可免费用于商业用途。

---

## 🔗 链接

- 🌐 **官网**：https://browser.autos
- 📁 **GitHub**：https://github.com/browser-autos/browser-autos
- 🐳 **Docker Hub**：https://hub.docker.com/r/browserautos/browser-autos
- 📦 **GitHub 容器镜像**：https://github.com/orgs/browser-autos/packages/container/package/browser-autos
- 🐛 **问题反馈**：https://github.com/browser-autos/browser-autos/issues

---

## ⭐ 支持

如果你觉得 **browser.autos** 有用，请考虑：

- ⭐ 给 [GitHub 仓库](https://github.com/browser-autos/browser-autos) 加星
- 🐛 报告 bug 和功能请求
- 📖 贡献文档
- 💬 分享你的使用体验

---

**browser.autos 团队用 ❤️ 打造**

**版本：** 1.0.0 | **最后更新：** 2025-10-11
