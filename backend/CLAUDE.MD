# Browser.autos Backend - 开发文档

## 项目概述

Browser.autos 是一个基于 Chrome DevTools Protocol (CDP) 的浏览器自动化 API 服务。

**技术栈**：
- Node.js + TypeScript
- Fastify (Web 框架)
- Puppeteer (浏览器控制)
- Bull + Redis (任务队列)
- Prometheus (监控指标)
- Pino (日志)

## 已实现功能

### 1. Screenshot API (截图服务)
**文件**: `src/api/rest/screenshot.route.ts`, `src/services/screenshot.service.ts`

**功能**:
- 全页面截图
- 选择器截图
- 自定义视口
- 多种格式 (PNG, JPEG, WebP)
- 质量控制

**端点**: `POST /screenshot`

### 2. PDF API (PDF 生成)
**文件**: `src/api/rest/pdf.route.ts`, `src/services/pdf.service.ts`

**功能**:
- 网页转 PDF
- 自定义页面大小
- 横向/纵向
- 打印背景
- 页边距设置

**端点**: `POST /pdf`

### 3. Content API (内容提取)
**文件**: `src/api/rest/content.route.ts`, `src/services/content.service.ts`

**功能**:
- HTML 提取
- 纯文本提取
- 链接提取
- 图片提取
- 元数据提取

**端点**: `POST /content`

### 4. Scrape API (数据爬取)
**文件**: `src/api/rest/scrape.route.ts`, `src/services/scrape.service.ts`

**功能**:
- CSS 选择器爬取
- 批量元素提取
- 自定义等待
- 超时控制

**端点**: `POST /scrape`

### 5. Browser Pool (浏览器池)
**文件**: `src/core/browser/BrowserPool.ts`

**功能**:
- 浏览器实例池化
- 自动启动/关闭
- 资源复用
- 健康检查
- 最大存活时间控制

**特性**:
- 最小实例数：1-2
- 最大实例数：10
- 最大存活时间：1小时

### 6. Prometheus Metrics (监控指标)
**文件**: `src/utils/metrics.ts`

**指标**:
- HTTP 请求统计
- 浏览器池状态
- 任务执行时间
- 会话统计
- 队列统计

**端点**: `GET /metrics`

### 7. WebSocket Proxy (WebSocket 代理)
**文件**: `src/api/websocket/proxy.route.ts`

**功能**:
- CDP WebSocket 代理
- 会话管理集成
- 双向消息转发
- 自动清理

**端点**: `GET /ws`

### 8. Session Manager (会话管理)
**文件**: `src/core/session/SessionManager.ts`

**功能**:
- 会话生命周期管理
- 自动超时清理（5分钟空闲）
- 最大持续时间控制（1小时）
- 事件系统
- 统计信息

**端点**:
- `GET /sessions` - 获取所有会话
- `GET /sessions/:id` - 获取会话详情
- `DELETE /sessions/:id` - 关闭会话
- `GET /sessions/stats` - 获取统计信息

**特性**:
- 每 30 秒自动清理空闲会话
- 集成 Prometheus 监控
- EventEmitter 事件系统

### 9. Queue Manager (队列管理器)
**文件**:
- `src/core/queue/QueueManager.ts`
- `src/core/queue/TaskProcessor.ts`
- `src/api/rest/queue.route.ts`

**功能**:
- 异步任务处理
- 优先级队列（CRITICAL, HIGH, NORMAL, LOW）
- 自动重试（指数退避）
- 并发控制（默认 5）
- 任务生命周期管理
- 事件系统
- Prometheus 集成

**端点**:
- `POST /queue/tasks` - 添加任务
- `GET /queue/tasks/:id` - 获取任务状态
- `DELETE /queue/tasks/:id` - 取消任务
- `POST /queue/tasks/:id/retry` - 重试任务
- `GET /queue/stats` - 队列统计
- `GET /queue/status` - 队列状态
- `GET /queue/tasks` - 任务列表
- `POST /queue/pause` - 暂停队列
- `POST /queue/resume` - 恢复队列
- `DELETE /queue/clean` - 清理队列

**任务类型**:
- SCREENSHOT - 截图任务
- PDF - PDF 生成任务
- CONTENT - 内容提取任务
- SCRAPE - 数据爬取任务
- CUSTOM - 自定义任务

**文档**:
- `QUEUE_README.md` - 完整文档
- `QUEUE_TESTING.md` - 测试指南

### 10. Authentication System (认证系统)
**文件**:
- `src/services/auth.service.ts` - JWT token 服务
- `src/services/user.service.ts` - 用户和 API Key 管理
- `src/middleware/auth.middleware.ts` - 认证中间件
- `src/api/rest/auth.route.ts` - 认证 API
- `src/types/auth.types.ts` - 认证类型定义

**功能**:
- JWT Token 认证（Access Token + Refresh Token）
- API Key 认证
- 用户角色管理（Admin, User, Service）
- API Key 权限控制
- Token 自动刷新
- 多种认证方式组合

**端点**:
- `POST /auth/login` - 用户登录
- `POST /auth/refresh` - 刷新 Token
- `GET /auth/me` - 获取当前用户信息
- `GET /auth/api-keys` - 获取 API Keys
- `POST /auth/api-keys` - 创建 API Key
- `DELETE /auth/api-keys/:id` - 删除 API Key
- `POST /auth/api-keys/:id/revoke` - 撤销 API Key
- `GET /auth/users` - 获取所有用户（管理员）

**认证方式**:
1. **JWT Token** - Bearer Token 在 Authorization header
   ```bash
   curl -H "Authorization: Bearer <token>" http://localhost:3001/api
   ```

2. **API Key** - 通过 X-API-Key header 或 query 参数
   ```bash
   curl -H "X-API-Key: <api-key>" http://localhost:3001/api
   # 或
   curl http://localhost:3001/api?apiKey=<api-key>
   ```

**默认用户**:
- **管理员**: `admin` / `admin123`
- **API 用户**: `api-user` / `apiuser123`

**特性**:
- Access Token 有效期：30天
- Refresh Token 有效期：90天
- API Key 格式：`ba_test_*` (开发) / `ba_live_*` (生产)
- 支持自定义权限和过期时间
- 集成 Prometheus 监控

### 11. Docker Deployment (Docker 部署) ✨ 最新实现
**文件**:
- `Dockerfile` - 多阶段构建配置
- `docker-compose.prod.yml` - 生产环境编排
- `.dockerignore` - Docker 忽略文件
- `prometheus.yml` - Prometheus 配置
- `.env.production.example` - 生产环境变量模板

**功能**:
- 多阶段构建优化镜像大小（~500MB）
- 完整的生产环境编排
- 健康检查和自动重启
- 资源限制配置
- 数据持久化

**服务组件**:
- **API 服务**: 主应用服务
- **Redis**: 任务队列和缓存
- **Prometheus**: 指标收集
- **Grafana**: 监控可视化

**快速开始**:
```bash
# 1. 复制环境变量模板
cp .env.production.example .env.production

# 2. 修改必要的配置（JWT_SECRET, 密码等）
nano .env.production

# 3. 启动所有服务
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 4. 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 5. 查看日志
docker-compose -f docker-compose.prod.yml logs -f api
```

**特性**:
- 非 root 用户运行（安全）
- 自动健康检查
- 资源限制（CPU/Memory）
- 持久化数据卷
- 完整监控栈

**文档**:
- `DOCKER_README.md` - 完整Docker 部署指南

### 12. API Documentation (API 文档) ✨ 最新实现
**文件**:
- `src/config/swagger.ts` - Swagger/OpenAPI 配置
- `src/server.ts` - Swagger 插件集成

**功能**:
- 交互式 API 文档
- OpenAPI 3.x 规范
- 完整的 API 端点文档
- 请求/响应模式定义
- 在线 API 测试

**端点**: `GET /docs` - Swagger UI 交互式文档

**特性**:
- **API 分类**: 8 个 API 标签分类
  - Health - 健康检查和系统信息
  - Auth - 认证和授权
  - Screenshot - 截图操作
  - PDF - PDF 生成
  - Content - 内容提取
  - Scrape - 数据爬取
  - Sessions - 会话管理
  - Queue - 队列管理

- **认证方案**:
  - Bearer Auth (JWT Token)
  - API Key (X-API-Key header)

- **通用模式**:
  - SuccessResponse - 成功响应格式
  - ErrorResponse - 错误响应格式
  - 各 API 的请求/响应模式

- **UI 配置**:
  - 文档展开模式
  - 深度链接支持
  - 请求时长显示
  - 过滤功能
  - 在线测试功能

**访问方式**:
```bash
# 浏览器访问
open http://localhost:3001/docs

# 获取 OpenAPI JSON 规范
curl http://localhost:3001/docs/json
```

### 13. Testing Suite (测试套件)
**文件**:
- `jest.config.js` - Jest 测试配置
- `tests/setup.ts` - 测试环境设置
- `tests/helpers/` - 测试辅助函数
  - `testServer.ts` - 服务器测试辅助
  - `testAuth.ts` - 认证测试辅助
  - `testBrowser.ts` - 浏览器 mock 辅助
- `tests/unit/` - 单元测试
  - `auth.service.test.ts` - AuthService 单元测试
  - `user.service.test.ts` - UserService 单元测试
- `tests/integration/` - 集成测试
  - `auth.api.test.ts` - 认证 API 集成测试
  - `health.api.test.ts` - 健康检查 API 集成测试
- `tests/e2e/` - 端到端测试
  - `authentication-flow.test.ts` - 完整认证流程 E2E 测试

**功能**:
- 单元测试（Service 层）
- 集成测试（API 端点）
- E2E 测试（完整业务流程）
- 测试覆盖率报告
- 自动化测试运行

**测试框架**:
- **Jest**: 测试运行器
- **ts-jest**: TypeScript 支持
- **Supertest**: HTTP 断言

**运行测试**:
```bash
# 运行所有测试
npm test

# Watch 模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

**覆盖率要求**:
- 分支覆盖率: ≥70%
- 函数覆盖率: ≥70%
- 行覆盖率: ≥70%
- 语句覆盖率: ≥70%

**测试类型**:
1. **单元测试**: 测试独立的函数和类
2. **集成测试**: 测试 API 端点和路由
3. **E2E 测试**: 测试完整的用户流程

**特性**:
- 自动 mock 浏览器实例
- 测试数据构建器
- 认证测试辅助函数
- 测试服务器生命周期管理
- 覆盖率阈值检查

**文档**:
- `TESTING.md` - 完整测试指南

## Docker 服务搭建

### Redis (队列所需)

Queue Manager 需要 Redis 来存储任务队列。

**方式 1: Docker 运行**
```bash
# 启动 Redis
docker run -d \
  --name browser-autos-redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine redis-server --appendonly yes

# 停止
docker stop browser-autos-redis

# 删除
docker rm browser-autos-redis
```

**方式 2: Docker Compose**

创建 `docker-compose.yml`:
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: browser-autos-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  redis-data:
```

启动服务:
```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f redis

# 停止
docker-compose down

# 停止并删除数据
docker-compose down -v
```

**验证 Redis 运行**:
```bash
# 测试连接
redis-cli ping
# 应该返回: PONG

# 或使用 Docker
docker exec -it browser-autos-redis redis-cli ping
```

### 未来可能需要的服务

#### PostgreSQL (如果需要持久化存储)
```yaml
  postgres:
    image: postgres:15-alpine
    container_name: browser-autos-postgres
    environment:
      POSTGRES_DB: browser_autos
      POSTGRES_USER: browser_autos
      POSTGRES_PASSWORD: your_password_here
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
```

#### Prometheus (监控)
```yaml
  prometheus:
    image: prom/prometheus:latest
    container_name: browser-autos-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    restart: unless-stopped
```

`prometheus.yml`:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'browser-autos'
    static_configs:
      - targets: ['host.docker.internal:3001']
```

#### Grafana (监控可视化)
```yaml
  grafana:
    image: grafana/grafana:latest
    container_name: browser-autos-grafana
    ports:
      - "3000:3000"
    environment:
      - GFX_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
    restart: unless-stopped
```

## 环境变量配置

创建 `.env` 文件:

```env
# 服务配置
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info

# 认证配置
JWT_SECRET=your-secret-key-change-in-production
TOKEN_EXPIRY=30d

# Chrome 配置
MAX_CONCURRENT_SESSIONS=5
SESSION_TIMEOUT=300000
MAX_SESSION_DURATION=3600000
# CHROME_EXECUTABLE_PATH=/path/to/chrome

# 浏览器池配置
BROWSER_POOL_MIN=2
BROWSER_POOL_MAX=10
BROWSER_MAX_AGE=3600000

# Redis 配置
REDIS_URL=redis://localhost:6379

# 队列配置
QUEUE_NAME=browser-tasks
QUEUE_MAX_CONCURRENT=5
QUEUE_TIMEOUT=120000
QUEUE_RETRIES=3

# 监控配置
ENABLE_METRICS=true
METRICS_PORT=9090

# 资源限制
MAX_MEMORY_PER_BROWSER=512
MAX_CPU_PER_BROWSER=50

# 速率限制
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# CORS 配置
CORS_ORIGIN=*
CORS_CREDENTIALS=true
```

## 开发流程

### 1. 启动依赖服务

```bash
# 启动 Redis
docker-compose up -d redis

# 验证 Redis
docker-compose ps
docker-compose logs redis
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 验证服务

```bash
# 健康检查
curl http://localhost:3001/health

# API 信息
curl http://localhost:3001/

# Prometheus 指标
curl http://localhost:3001/metrics
```

## API 测试

### 认证 API 测试

```bash
# 1. 用户登录
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# 2. 获取当前用户信息（使用 JWT）
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer <access_token>"

# 3. 创建 API Key
curl -X POST http://localhost:3001/auth/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "name": "My API Key",
    "permissions": ["screenshot", "pdf"],
    "expiresIn": 30
  }'

# 4. 使用 API Key 访问 API
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <api_key>" \
  -d '{
    "url": "https://example.com",
    "fullPage": true
  }' \
  --output screenshot.png

# 5. 刷新 Token
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token>"
  }'

# 6. 获取所有 API Keys
curl http://localhost:3001/auth/api-keys \
  -H "Authorization: Bearer <access_token>"
```

### 队列 API 测试

```bash
# 1. 添加截图任务
curl -X POST http://localhost:3001/queue/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "type": "screenshot",
    "url": "https://example.com",
    "priority": 5,
    "fullPage": true,
    "format": "png"
  }'

# 2. 查看队列统计
curl http://localhost:3001/queue/stats

# 3. 查看活跃任务
curl http://localhost:3001/queue/tasks?status=active

# 4. 查看队列状态
curl http://localhost:3001/queue/status
```

### 会话 API 测试

```bash
# 查看所有会话
curl http://localhost:3001/sessions

# 查看会话统计
curl http://localhost:3001/sessions/stats
```

### 截图 API 测试

```bash
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "fullPage": true
  }' \
  --output screenshot.png
```

## 项目结构

```
backend/
├── src/
│   ├── api/
│   │   ├── rest/           # REST API 路由
│   │   │   ├── auth.route.ts
│   │   │   ├── screenshot.route.ts
│   │   │   ├── pdf.route.ts
│   │   │   ├── content.route.ts
│   │   │   ├── scrape.route.ts
│   │   │   ├── session.route.ts
│   │   │   └── queue.route.ts
│   │   └── websocket/      # WebSocket 路由
│   │       └── proxy.route.ts
│   ├── config/             # 配置管理
│   │   └── index.ts
│   ├── core/               # 核心功能
│   │   ├── browser/
│   │   │   └── BrowserPool.ts
│   │   ├── session/
│   │   │   └── SessionManager.ts
│   │   └── queue/
│   │       ├── QueueManager.ts
│   │       ├── TaskProcessor.ts
│   │       └── index.ts
│   ├── middleware/         # 中间件
│   │   └── auth.middleware.ts
│   ├── services/           # 业务服务
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── screenshot.service.ts
│   │   ├── pdf.service.ts
│   │   ├── content.service.ts
│   │   └── scrape.service.ts
│   ├── types/              # 类型定义
│   │   ├── auth.types.ts
│   │   ├── session.types.ts
│   │   └── queue.types.ts
│   ├── utils/              # 工具函数
│   │   ├── logger.ts
│   │   └── metrics.ts
│   ├── index.ts            # 应用入口
│   └── server.ts           # 服务器配置
├── docker-compose.yml      # Docker 编排
├── QUEUE_README.md         # 队列文档
├── QUEUE_TESTING.md        # 队列测试指南
└── CLAUDE.MD              # 本文档
```

## 性能指标

### 浏览器池
- 实例复用率: 高
- 启动时间: ~1秒
- 最大并发: 10

### 任务处理
- 截图平均时间: 1-3秒
- PDF 生成时间: 2-5秒
- 内容提取时间: 1-2秒
- 数据爬取时间: 1-3秒

### 队列
- 默认并发: 5
- 自动重试: 3次
- 退避策略: 指数（2秒起）

## 监控

### Prometheus 指标

**HTTP 请求**:
- `browser_autos_http_requests_total`
- `browser_autos_http_request_duration_seconds`

**浏览器池**:
- `browser_autos_browser_pool_size{state}`
- `browser_autos_browser_pool_use_count_total`

**任务**:
- `browser_autos_task_duration_seconds`
- `browser_autos_task_total`

**会话**:
- `browser_autos_sessions{status}`
- `browser_autos_session_duration_seconds`
- `browser_autos_session_total`

**队列**:
- `browser_autos_queue_tasks{status}`
- `browser_autos_queue_length`

## 下一步开发计划

根据项目规划，接下来需要实现：

### 1. 性能优化 ⬅️ 下一步
- 缓存策略
- 连接池优化
- 并发控制优化
- 响应时间优化

### 2. 生产环境监控
- Grafana 仪表板配置
- 告警规则设置
- 性能基准测试

## 常见问题

### Q: Redis 连接失败
**A**: 确保 Redis 正在运行：
```bash
docker-compose ps
redis-cli ping
```

### Q: 浏览器启动失败
**A**: 检查系统依赖（macOS 通常自带 Chrome）

### Q: 端口被占用
**A**: 修改 `.env` 中的 `PORT` 配置

### Q: 队列任务不执行
**A**:
1. 检查 Redis 连接
2. 查看 `/queue/status`
3. 检查队列是否暂停

## 开发规范

### 代码风格
- TypeScript strict mode
- ESLint + Prettier
- 函数式编程优先
- 完整的类型定义

### 日志规范
- 使用 Pino 结构化日志
- 包含必要的上下文信息
- 区分日志级别

### 错误处理
- 使用 try-catch
- 记录详细错误信息
- 返回统一的错误格式

### 测试
- 单元测试覆盖率 > 80%
- 关键路径集成测试
- API 端到端测试

## 参考资料

- [Fastify 文档](https://www.fastify.io/)
- [Puppeteer 文档](https://pptr.dev/)
- [Bull 队列文档](https://github.com/OptimalBits/bull)
- [Prometheus 文档](https://prometheus.io/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)

---

**最后更新**: 2025-10-11
**当前版本**: 1.0.0
**开发状态**: ✅ API 文档已完成

## 已完成功能清单

- [x] Screenshot API - 截图服务
- [x] PDF API - PDF 生成
- [x] Content API - 内容提取
- [x] Scrape API - 数据爬取
- [x] Browser Pool - 浏览器池管理
- [x] Prometheus Metrics - 监控指标
- [x] WebSocket Proxy - WebSocket 代理
- [x] Session Manager - 会话管理
- [x] Queue Manager - 队列管理器
- [x] Authentication System - 认证系统（JWT + API Key）
- [x] Docker Deployment - Docker 部署
- [x] Testing Suite - 测试套件（Jest + Unit + Integration + E2E）
- [x] API Documentation - API 文档（Swagger/OpenAPI）
