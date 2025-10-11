# Browser.autos 开发进度

## 项目概述

Browser.autos 是一个基于 Playwright Chromium 的生产级浏览器自动化 API 平台，提供 REST API 和 WebSocket CDP 代理服务。

---

## 最新进度（v1.0.1 - 2025-10-11）

### 🎯 v1.0.1 主要变更

#### 1. **架构重构**
- ✅ 前后端仓库完全分离
  - 后端 API：`browser-autos/browser-autos`（本仓库）
  - 前端网站：`browser-autos/site`（独立仓库）
- ✅ 扁平化项目结构
  - 移除 `backend/` 嵌套层级
  - 所有代码直接在根目录：`src/`, `docs/`, `docker/`, `tests/`
  - 符合单一职责原则

#### 2. **品牌化凭据系统**
- ✅ 环境变量配置凭据，避免硬编码
  - 默认管理员：`browserautos` / `browser.autos`
  - 默认 API 用户：`api-user` / `browser.autos`
- ✅ 启动时在日志中显示凭据
- ✅ 创建 `scripts/get-token.sh` 快速获取 token
- ✅ 新增 `docs/CREDENTIALS_GUIDE.md` 完整凭据管理指南

#### 3. **文档完善**
- ✅ 更新所有文档的 Docker 示例（添加凭据环境变量）
- ✅ README 恢复 logo 和完整内容
- ✅ 删除冗余的 README_OLD.md
- ✅ 所有路径引用更新（`backend/` → 根目录）

#### 4. **用户体验优化**
- ✅ 前端网站添加 Token 获取指南
  - 显示默认凭据
  - 提供查看日志命令
  - 提供登录 API 示例

---

## 已完成功能（v1.0.0）

### 核心 API 服务
- ✅ **Screenshot API** - 网页截图（PNG、JPEG、WebP）
- ✅ **PDF Generation API** - PDF 生成（多种页面格式）
- ✅ **Content Extraction API** - 内容提取（HTML、文本、元数据）
- ✅ **Scrape API** - 数据抓取（CSS 选择器）
- ✅ **WebSocket CDP Proxy** - 直接 CDP 协议访问

### 核心组件
- ✅ **Browser Pool** - 浏览器实例池（性能提升 85%）
- ✅ **Session Manager** - 会话管理（超时、清理、追踪）
- ✅ **Queue Manager** - 任务队列（Redis + Bull）
- ✅ **Authentication** - JWT + API Key 双重认证
- ✅ **Prometheus Metrics** - 监控指标

### 部署和文档
- ✅ **Docker 支持** - 多架构镜像（AMD64 + ARM64）
- ✅ **Docker Compose** - 完整部署配置
- ✅ **API 文档** - Swagger/OpenAPI
- ✅ **测试套件** - 单元测试 + 集成测试

---

## 项目结构

```
browser-autos/
├── src/                    # 源代码
│   ├── api/               # API 路由
│   │   ├── rest/         # REST API 端点
│   │   └── websocket/    # WebSocket 代理
│   ├── core/             # 核心业务逻辑
│   │   ├── browser/      # 浏览器池
│   │   ├── session/      # 会话管理
│   │   └── queue/        # 队列管理
│   ├── services/         # 业务服务
│   ├── middleware/       # 中间件
│   ├── types/            # TypeScript 类型
│   └── utils/            # 工具函数
│
├── docs/                  # 文档
│   ├── CREDENTIALS_GUIDE.md
│   ├── DOCKER_README.md
│   └── ...
│
├── docker/                # Docker 配置
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── tests/                 # 测试代码
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/               # 工具脚本
│   └── get-token.sh
│
├── README.md              # 英文文档
├── README_CN.md           # 中文文档
└── package.json
```

---

## 环境变量配置

### 必需配置
```bash
JWT_SECRET=your-secret-key    # JWT 签名密钥（必需）
```

### 可选配置（凭据）
```bash
# 管理员凭据
DEFAULT_ADMIN_USERNAME=browserautos
DEFAULT_ADMIN_PASSWORD=browser.autos
DEFAULT_ADMIN_EMAIL=admin@browser.autos

# API 用户凭据
DEFAULT_API_USERNAME=api-user
DEFAULT_API_PASSWORD=browser.autos
DEFAULT_API_EMAIL=api@browser.autos
```

### 其他配置
```bash
# 认证
TOKEN_EXPIRY=30d
REQUIRE_AUTH=true

# 浏览器池
BROWSER_POOL_MIN=1
BROWSER_POOL_MAX=5

# 队列系统
ENABLE_QUEUE=false
REDIS_URL=redis://localhost:6379
```

---

## 快速开始

### Docker 部署
```bash
docker run -d -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  -e DEFAULT_ADMIN_USERNAME=browserautos \
  -e DEFAULT_ADMIN_PASSWORD=browser.autos \
  --shm-size=2gb \
  browserautos/browser-autos:latest
```

### 获取 Token
```bash
# 方式 1：使用脚本
./scripts/get-token.sh

# 方式 2：查看日志
docker logs browser-autos | grep "Default credentials"

# 方式 3：直接登录
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "browserautos", "password": "browser.autos"}'
```

---

## 性能指标

| 操作 | 冷启动 | 使用浏览器池 | 提升 |
|------|--------|-------------|------|
| 截图 | 7.6秒 | 1.2秒 | **85%** ↑ |
| PDF | 8.0秒 | 2.0秒 | **75%** ↑ |
| 内容提取 | 4.5秒 | 1.5秒 | **67%** ↑ |

---

## 技术栈

- **Runtime:** Node.js 20 + TypeScript
- **Framework:** Fastify
- **Browser:** Playwright Chromium 141.0.7390.37
- **Queue:** Bull + Redis
- **Monitoring:** Prometheus
- **Testing:** Jest
- **Container:** Docker (Multi-arch)

---

## 相关仓库

- **后端 API:** https://github.com/browser-autos/browser-autos
- **前端网站:** https://github.com/browser-autos/site
- **Docker Hub:** https://hub.docker.com/r/browserautos/browser-autos

---

## 版本历史

### v1.0.1 (2025-10-11)
- 🏗️ 架构重构：前后端仓库分离，扁平化项目结构
- 🔑 品牌化凭据系统：环境变量配置，启动日志显示
- 📚 文档完善：更新所有路径引用，添加凭据管理指南
- ✨ 用户体验：前端添加 Token 获取指南

### v1.0.0 (2025-10-10)
- 🎉 初始版本发布
- ✅ 核心 API 服务（Screenshot, PDF, Content, Scrape）
- ✅ WebSocket CDP 代理
- ✅ Browser Pool 和 Session Manager
- ✅ JWT 认证和 Prometheus 监控
- ✅ Docker 多架构支持

---

## CI/CD 和 Docker 自动化

### GitHub Actions 工作流

项目使用 GitHub Actions 自动构建和发布 Docker 镜像。

#### 触发条件
- 推送版本标签（`v*`）
- 发布 Release
- 手动触发（workflow_dispatch）

#### 自动化流程

```yaml
# .github/workflows/docker-publish.yml
tags: |
  type=semver,pattern={{version}}       # 1.0.1
  type=semver,pattern={{major}}.{{minor}} # 1.0
  type=semver,pattern={{major}}          # 1
  type=raw,value=latest,enable={{is_default_branch}}  # latest（自动更新）
  type=raw,value=debian                  # debian
```

#### 标签策略

当推送 `v1.0.1` 标签到 `main` 分支时，会自动创建以下 Docker 镜像标签：

**Docker Hub:**
- `browserautos/browser-autos:1.0.1` （完整版本）
- `browserautos/browser-autos:1.0` （主版本 + 次版本）
- `browserautos/browser-autos:1` （主版本）
- `browserautos/browser-autos:latest` ✅（自动更新）
- `browserautos/browser-autos:debian` （基础镜像标识）

**GitHub Container Registry:**
- `ghcr.io/browser-autos/browser-autos:latest`
- `ghcr.io/browser-autos/browser-autos:1.0.1`
- 等等

#### 多架构支持
- **平台:** `linux/amd64`, `linux/arm64`
- **构建工具:** Docker Buildx
- **QEMU 支持:** 跨平台构建

#### 自动化功能
1. ✅ 多架构镜像构建（AMD64 + ARM64）
2. ✅ 自动推送到 Docker Hub 和 GHCR
3. ✅ 自动更新 `latest` 标签（从 main 分支）
4. ✅ 自动更新 Docker Hub README
5. ✅ 构建缓存优化（GitHub Actions Cache）

### 发布流程

```bash
# 1. 更新版本号
npm version patch  # 或 minor/major

# 2. 创建版本标签
git tag v1.0.1

# 3. 推送到 GitHub
git push origin main
git push origin v1.0.1

# 4. GitHub Actions 自动执行
# - 构建多架构 Docker 镜像
# - 推送到 Docker Hub 和 GHCR
# - 更新 latest 标签
# - 更新 Docker Hub README

# 5. 验证发布
docker pull browserautos/browser-autos:latest
docker images browserautos/browser-autos
```

### 常见问题

#### Q: v1.0.1 会自动更新 latest 标签吗？
**A:** ✅ 会！只要版本标签是从 `main` 分支推送的，GitHub Actions 会自动更新 `latest` 标签指向最新版本。

#### Q: 如何验证 latest 是否已更新？
**A:** 访问 Docker Hub 查看标签页面：
```
https://hub.docker.com/r/browserautos/browser-autos/tags
```
检查 `latest` 标签的 IMAGE ID 是否与 `1.0.1` 相同。

#### Q: 构建需要多长时间？
**A:** 通常 10-15 分钟（因为需要构建 AMD64 和 ARM64 两个架构）。

---

## 开发笔记

### 2025-10-11 - Docker 标签自动化说明

**问题：** 用户询问推送 `v1.0.1` 标签后，`latest` 标签是否会自动更新。

**答案：** 会自动更新。GitHub Actions 的 `docker/metadata-action` 配置了：
```yaml
type=raw,value=latest,enable={{is_default_branch}}
```
这意味着从 `main` 分支推送的版本标签会自动触发 `latest` 标签的更新。

**工作流程：**
1. 开发者推送 `v1.0.1` 标签
2. GitHub Actions 自动触发构建
3. 构建多架构镜像（amd64 + arm64）
4. 自动创建多个语义化版本标签
5. 自动更新 `latest` 标签
6. 推送到 Docker Hub 和 GHCR
7. 更新 Docker Hub README

**验证方式：**
- 查看 GitHub Actions 运行状态
- 检查 Docker Hub 标签页面
- 本地拉取 `latest` 标签验证

---

**最后更新：** 2025-10-11
**当前版本：** v1.0.1
**维护者：** Browser.autos Team
