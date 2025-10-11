# Browser.autos Docker 部署指南

## 📦 镜像特点

Browser.autos 提供企业级的 Docker 镜像，与 browserless 功能相似但有我们自己的特色：

### 🎯 核心优势

| 特性 | Browser.autos | browserless |
|------|--------------|-------------|
| **基础镜像** | Debian Bookworm Slim | Ubuntu 24.04 |
| **镜像大小** | ~450MB | ~1.5GB |
| **浏览器** | 系统 Chromium | Playwright Chromium |
| **用户 UID/GID** | 1001:1001 | 999:999 |
| **字体支持** | 完整中日韩+emoji | 完整国际化 |
| **认证方式** | JWT + API Key | Token |
| **监控** | Prometheus + Grafana | 内置 |
| **队列** | Bull + Redis | 内置 |
| **架构** | TypeScript + Fastify | TypeScript + 自研 |

### ✨ 独特功能

1. **更小的镜像体积** - 450MB vs 1.5GB（70%减少）
2. **双重认证机制** - JWT Token 和 API Key 都支持
3. **完整的 REST API** - 除了 WebSocket CDP，还有截图、PDF、抓取等 REST 端点
4. **Swagger 文档** - 内置交互式 API 文档 `/docs`
5. **中文优化** - 完整的中文字体和时区支持
6. **现代化技术栈** - Fastify（比 Express 快 2 倍）

---

## 🚀 快速开始

### 方式 1: 单容器运行（快速测试）

```bash
# 构建镜像
docker build -t browser-autos:latest .

# 运行容器
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=my-secret-key \
  --memory=2g \
  --cpus=2 \
  browser-autos:latest

# 查看日志
docker logs -f browser-autos

# 测试 API
curl http://localhost:3001/health
curl http://localhost:3001/docs
```

### 方式 2: Docker Compose（生产环境）

```bash
# 1. 复制环境变量配置
cp .env.production.example .env.production

# 2. 编辑配置（必须修改 JWT_SECRET！）
nano .env.production

# 3. 启动所有服务
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 4. 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 5. 查看 API 日志
docker-compose -f docker-compose.prod.yml logs -f api
```

---

## 📋 环境变量配置

### 必须配置

```bash
# JWT Secret（必须设置！）
JWT_SECRET=your-random-secret-key

# 生成随机 secret 的方法
openssl rand -base64 32
```

### 推荐配置

```bash
# 浏览器池
BROWSER_POOL_MIN=2
BROWSER_POOL_MAX=10

# 并发控制
MAX_CONCURRENT_SESSIONS=10
QUEUE_MAX_CONCURRENT=5

# 资源限制
API_CPU_LIMIT=4
API_MEMORY_LIMIT=4G
```

### 完整配置参考

查看 `.env.production.example` 文件获取所有可配置选项。

---

## 🔗 访问服务

启动后可以通过以下地址访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| **API 服务** | http://localhost:3001 | 主服务 |
| **API 文档** | http://localhost:3001/docs | Swagger UI |
| **健康检查** | http://localhost:3001/health | 健康状态 |
| **Prometheus** | http://localhost:9090 | 指标采集 |
| **Grafana** | http://localhost:3000 | 监控面板 (admin/admin) |

---

## 🛠️ 使用示例

### 1. WebSocket CDP 连接（Puppeteer）

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

### 2. REST API - 截图

```bash
# 使用 API Key
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "url": "https://example.com",
    "fullPage": true
  }' \
  --output screenshot.png

# 使用 JWT Token
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "url": "https://example.com"
  }' \
  --output screenshot.png
```

### 3. REST API - PDF 生成

```bash
curl -X POST http://localhost:3001/pdf \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "url": "https://example.com",
    "format": "A4"
  }' \
  --output document.pdf
```

### 4. REST API - 数据抓取

```bash
curl -X POST http://localhost:3001/scrape \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "url": "https://example.com",
    "elements": [
      {"selector": "h1", "property": "textContent"},
      {"selector": "p", "property": "textContent", "multiple": true}
    ]
  }'
```

---

## 🔐 认证方式

Browser.autos 支持两种认证方式：

### 1. JWT Token（推荐用于前端应用）

```bash
# 登录获取 Token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# 使用 Token
curl -H "Authorization: Bearer <token>" http://localhost:3001/api
```

### 2. API Key（推荐用于服务端）

```bash
# 创建 API Key
curl -X POST http://localhost:3001/auth/api-keys \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "My API Key",
    "permissions": ["screenshot", "pdf"]
  }'

# 使用 API Key
curl -H "X-API-Key: <api-key>" http://localhost:3001/api
```

---

## 📊 监控和运维

### 健康检查

```bash
# 检查服务健康状态
curl http://localhost:3001/health | jq

# Docker 健康检查
docker inspect --format='{{.State.Health.Status}}' browser-autos-api
```

### Prometheus 指标

```bash
# 查看所有指标
curl http://localhost:3001/metrics

# 关键指标
browser_autos_http_requests_total       # HTTP 请求总数
browser_autos_browser_pool_size         # 浏览器池大小
browser_autos_sessions{status}          # 活跃会话数
browser_autos_queue_tasks{status}       # 队列任务数
```

### 日志查看

```bash
# 查看实时日志
docker logs -f browser-autos-api

# 查看最近 100 行
docker logs --tail 100 browser-autos-api

# Docker Compose
docker-compose -f docker-compose.prod.yml logs -f api
```

### 资源监控

```bash
# 查看资源使用
docker stats browser-autos-api

# 查看所有容器资源
docker-compose -f docker-compose.prod.yml ps
docker stats
```

---

## 🔧 故障排查

### 1. 容器无法启动

```bash
# 查看详细日志
docker logs browser-autos-api

# 检查配置
docker inspect browser-autos-api

# 常见问题
# - JWT_SECRET 未设置
# - Redis 连接失败
# - 端口被占用
```

### 2. Chrome 启动失败

```bash
# 检查共享内存
# 确保 /dev/shm 足够大（至少 2GB）
df -h /dev/shm

# 增加共享内存
docker run --shm-size=2g ...
```

### 3. 内存不足

```bash
# 增加容器内存限制
docker run --memory=4g ...

# 或修改 docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 4G
```

### 4. Redis 连接失败

```bash
# 检查 Redis 状态
docker logs browser-autos-redis

# 测试 Redis 连接
docker exec -it browser-autos-redis redis-cli ping
```

---

## 🏗️ 生产部署建议

### 1. 安全加固

```bash
# 修改默认密码
GRAFANA_ADMIN_PASSWORD=strong-password
REDIS_PASSWORD=another-strong-password

# 限制 CORS
CORS_ORIGIN=https://yourdomain.com

# 使用强随机 JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
```

### 2. 资源配置

推荐配置（基于负载）：

| 场景 | CPU | 内存 | 并发 |
|------|-----|------|------|
| **轻度使用** | 2 核 | 2GB | 5 |
| **中度使用** | 4 核 | 4GB | 10 |
| **重度使用** | 8 核 | 8GB | 20 |

### 3. 数据备份

```bash
# 备份 Redis 数据
docker exec browser-autos-redis redis-cli BGSAVE
docker cp browser-autos-redis:/data/dump.rdb ./backup/

# 备份 Grafana 配置
docker cp browser-autos-grafana:/var/lib/grafana ./backup/

# 定期备份脚本
0 2 * * * /path/to/backup-script.sh
```

### 4. 日志管理

```bash
# 配置日志轮转（docker-compose.prod.yml 已包含）
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 5. 反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket 支持
    location /ws {
        proxy_pass http://localhost:3001/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
    }
}
```

---

## 🆚 与 browserless 对比

### 相同点
- ✅ 支持 WebSocket CDP 连接
- ✅ 支持 Puppeteer / Playwright
- ✅ 基于 Docker 容器化
- ✅ 完整的浏览器自动化功能
- ✅ 并发控制和队列管理

### 我们的优势
- ✅ **镜像更小** - 450MB vs 1.5GB
- ✅ **双重认证** - JWT + API Key
- ✅ **REST API** - 内置截图、PDF、抓取端点
- ✅ **Swagger 文档** - 交互式 API 文档
- ✅ **现代化框架** - Fastify (性能更好)
- ✅ **中文优化** - 时区、字体、文档
- ✅ **开源免费** - MIT 协议

### 架构差异

```
Browser.autos:
用户 → Nginx → Fastify → CDP Proxy → Chrome
                    ↓
                  Redis (Queue)
                    ↓
              Prometheus + Grafana

browserless:
用户 → WebSocket → 自研框架 → Chrome
```

---

## 📚 更多资源

- **API 文档**: http://localhost:3001/docs
- **健康检查**: http://localhost:3001/health
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000

---

## 🤝 支持

遇到问题？

1. 查看日志: `docker logs -f browser-autos-api`
2. 检查健康状态: `curl http://localhost:3001/health`
3. 查看文档: http://localhost:3001/docs

---

**版本**: 1.0.0
**最后更新**: 2025-10-11
**许可证**: MIT
