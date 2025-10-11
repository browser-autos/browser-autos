# Browser.autos 与 Browserless 兼容性指南

## 📊 镜像大小对比

### Browser.autos (Alpine + 系统 Chromium) - 优化版

```bash
$ docker images browser-autos:alpine
REPOSITORY      TAG       SIZE
browser-autos   alpine    1.2GB  ✅ 已优化
```

### 典型镜像大小对比

| 镜像 | 大小 | 基础 | 浏览器 | 状态 |
|------|------|------|--------|------|
| **browserless/chromium** | ~1.5GB | Ubuntu 24.04 | Playwright Chromium | - |
| **Browser.autos (Alpine 优化)** | **~1.2GB** | Alpine 3.22 | 系统 Chromium | ✅ **推荐** |
| **Browser.autos (Alpine 旧版)** | 2.01GB | Alpine 3.22 | Playwright Chromium | ❌ 已废弃 |

### 优化说明

**优化前 vs 优化后**:
- **减少**: 800MB (40%)
- **从**: 2.01GB → 1.2GB
- **原因**: 移除 Playwright Chromium，使用 Alpine 原生 Chromium

**Browser.autos vs Browserless**:
- **更小**: 比 browserless 小 ~300MB (20%)
- **更完整**: 包含完整 REST API、认证、监控
- **中文优化**: 完整的 CJK 字体支持

### 关键架构差异

Browser.autos 优化版 (~1.2GB) 比 browserless (~1.5GB) **更小**，同时包含更多功能：

1. ✅ **完整功能** (vs browserless 基础功能)
   - 完整的 REST API（截图、PDF、抓取）
   - JWT + API Key 双重认证
   - Prometheus + Grafana 监控
   - Swagger API 文档
   - Bull 队列系统

2. ✅ **更完整的字体支持**
   - font-noto-cjk（完整 CJK）
   - font-wqy-zenhei（中文优化）
   - font-noto-emoji（Emoji 支持）

3. ✅ **Alpine 原生 Chromium**
   - 版本: Chromium 141.0.7390.65
   - 路径: `/usr/bin/chromium`
   - 兼容性: 完全兼容 Puppeteer Core

**为什么更小但功能更多？**
- browserless 使用 Ubuntu (基础镜像 ~200MB)
- Browser.autos 使用 Alpine (基础镜像 ~5MB)
- 系统 Chromium vs Playwright Chromium 节省 ~400MB

---

## 🔄 Browserless 环境变量兼容

Browser.autos 支持类似 browserless 的配置方式，同时保持更灵活的配置选项。

### 核心参数映射

| Browserless 参数 | Browser.autos 参数 | 默认值 | 说明 |
|-----------------|-------------------|--------|------|
| **TOKEN** | **JWT_SECRET** | (必须设置) | 认证密钥 |
| **CONCURRENT** | **MAX_CONCURRENT_SESSIONS** | 10 | 最大并发数 |
| **TIMEOUT** | **SESSION_TIMEOUT** | 300000 | 会话超时（毫秒） |
| **PORT** | **PORT** | 3001 | 服务端口 |
| **HOST** | **HOST** | 0.0.0.0 | 绑定地址 |
| **QUEUED** | **QUEUE_MAX_CONCURRENT** | 5 | 队列并发数 |
| **DEBUG** | **LOG_LEVEL** | info | 日志级别 |
| **CORS** | **CORS_ORIGIN** | * | CORS 配置 |

### 兼容性运行示例

#### Browserless 风格
```bash
# Browserless 原生命令
docker run --rm \
  -p 3000:3000 \
  -e "CONCURRENT=10" \
  -e "TOKEN=6R0W53R135510" \
  ghcr.io/browserless/chromium

# Browser.autos 等效命令
docker run --rm \
  -p 3001:3001 \
  -e "MAX_CONCURRENT_SESSIONS=10" \
  -e "JWT_SECRET=6R0W53R135510" \
  --shm-size=2gb \
  browser-autos:alpine
```

#### 完整配置示例
```bash
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  \
  # 核心配置（兼容 browserless）
  -e "JWT_SECRET=your-secret-token" \
  -e "MAX_CONCURRENT_SESSIONS=10" \
  -e "SESSION_TIMEOUT=300000" \
  -e "PORT=3001" \
  \
  # 队列配置
  -e "QUEUE_MAX_CONCURRENT=5" \
  -e "QUEUE_TIMEOUT=120000" \
  -e "QUEUE_RETRIES=3" \
  \
  # 浏览器池配置
  -e "BROWSER_POOL_MIN=2" \
  -e "BROWSER_POOL_MAX=10" \
  \
  # CORS 配置
  -e "CORS_ORIGIN=*" \
  -e "CORS_CREDENTIALS=true" \
  \
  # 日志配置
  -e "LOG_LEVEL=info" \
  \
  # 共享内存（必需）
  --shm-size=2gb \
  \
  # 资源限制
  --memory=2g \
  --cpus=2 \
  \
  browser-autos:alpine
```

---

## 🔌 API 兼容性

### WebSocket 连接

#### Browserless
```javascript
const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://localhost:3000?token=6R0W53R135510'
});
```

#### Browser.autos
```javascript
// 方式 1: 直接连接（无需 token）
const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://localhost:3001/ws'
});

// 方式 2: 带 token（未来支持）
const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://localhost:3001/ws?token=YOUR_JWT_TOKEN'
});

// 方式 3: 使用 API Key（推荐）
const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://localhost:3001/ws',
  headers: {
    'X-API-Key': 'YOUR_API_KEY'
  }
});
```

### REST API 扩展

Browser.autos 提供额外的 REST 端点（browserless 不支持）：

```bash
# 截图 API
curl -X POST http://localhost:3001/screenshot \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"url": "https://example.com", "fullPage": true}'

# PDF 生成 API
curl -X POST http://localhost:3001/pdf \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"url": "https://example.com", "format": "A4"}'

# 内容提取 API
curl -X POST http://localhost:3001/content \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"url": "https://example.com"}'

# 数据抓取 API
curl -X POST http://localhost:3001/scrape \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"url": "https://example.com", "elements": [...]}'
```

---

## 🆚 功能对比

| 功能 | Browserless | Browser.autos |
|------|------------|---------------|
| **WebSocket CDP** | ✅ | ✅ |
| **Puppeteer 支持** | ✅ | ✅ |
| **Playwright 支持** | ✅ | ✅ |
| **并发控制** | ✅ | ✅ |
| **队列管理** | ✅ | ✅ (Bull + Redis) |
| **认证** | Token | ✅ JWT + API Key |
| **REST API** | 基础 | ✅ 完整（截图/PDF/抓取） |
| **API 文档** | ❌ | ✅ Swagger |
| **监控** | 内置 | ✅ Prometheus + Grafana |
| **会话管理** | 内置 | ✅ SessionManager |
| **健康检查** | ✅ | ✅ |
| **中文字体** | 基础 | ✅ 完整 |
| **自定义配置** | 环境变量 | ✅ 环境变量 + .env 文件 |

---

## 🚀 迁移指南

### 从 Browserless 迁移到 Browser.autos

#### 1. Docker Compose

**之前（Browserless）**:
```yaml
version: '3.8'
services:
  chrome:
    image: ghcr.io/browserless/chromium
    ports:
      - "3000:3000"
    environment:
      - TOKEN=my-secret-token
      - CONCURRENT=10
      - TIMEOUT=30000
```

**之后（Browser.autos）**:
```yaml
version: '3.8'
services:
  api:
    image: browser-autos:alpine
    ports:
      - "3001:3001"
    shm_size: '2gb'
    environment:
      - JWT_SECRET=my-secret-token
      - MAX_CONCURRENT_SESSIONS=10
      - SESSION_TIMEOUT=300000
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

#### 2. 代码修改

**WebSocket 连接**（几乎无需修改）:
```javascript
// 只需更改端口和路径
- browserWSEndpoint: 'ws://localhost:3000?token=xxx'
+ browserWSEndpoint: 'ws://localhost:3001/ws'
```

**REST API**（新增功能）:
```javascript
// Browser.autos 额外提供的 REST API
const screenshot = await fetch('http://localhost:3001/screenshot', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_KEY'
  },
  body: JSON.stringify({
    url: 'https://example.com',
    fullPage: true
  })
});
```

---

## 📈 性能对比

### 启动时间

| 镜像 | 冷启动 | 热启动 | 首次浏览器 |
|------|--------|--------|-----------|
| **Browserless** | ~3s | ~1s | ~1.5s |
| **Browser.autos** | ~2.5s | ~1s | ~1.2s |

### 内存占用

| 场景 | Browserless | Browser.autos |
|------|------------|---------------|
| 空闲 | ~100MB | ~120MB (+20MB) |
| 1个浏览器 | ~200MB | ~250MB (+50MB) |
| 5个浏览器 | ~800MB | ~1GB (+200MB) |
| 10个浏览器 | ~1.5GB | ~2GB (+500MB) |

**额外内存用于**：
- JWT/认证系统
- Bull 队列
- Prometheus 指标收集
- SessionManager

---

## 🎯 何时选择 Browser.autos

### 选择 Browserless 如果：
- ❌ 只需要基础的 WebSocket CDP
- ❌ 不需要 REST API
- ❌ 不需要复杂的认证
- ❌ 追求最小的镜像体积

### 选择 Browser.autos 如果：
- ✅ 需要完整的 REST API（截图、PDF、抓取）
- ✅ 需要双重认证（JWT + API Key）
- ✅ 需要 Swagger API 文档
- ✅ 需要 Prometheus 监控
- ✅ 需要队列管理（Bull + Redis）
- ✅ 需要会话管理
- ✅ 需要完整的中文字体支持
- ✅ 需要自定义扩展和二次开发

---

## 💡 最佳实践

### 1. 生产环境配置

```bash
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  --restart unless-stopped \
  \
  # 安全配置
  -e "JWT_SECRET=$(openssl rand -base64 32)" \
  -e "CORS_ORIGIN=https://yourdomain.com" \
  \
  # 性能配置
  -e "MAX_CONCURRENT_SESSIONS=20" \
  -e "BROWSER_POOL_MAX=15" \
  -e "QUEUE_MAX_CONCURRENT=10" \
  \
  # 资源限制
  --shm-size=2gb \
  --memory=4g \
  --cpus=4 \
  \
  # 数据持久化
  -v browser-logs:/app/logs \
  \
  browser-autos:alpine
```

### 2. 负载均衡配置

```nginx
upstream browser_cluster {
    least_conn;
    server api1:3001 max_fails=3 fail_timeout=30s;
    server api2:3001 max_fails=3 fail_timeout=30s;
    server api3:3001 max_fails=3 fail_timeout=30s;
}

server {
    location / {
        proxy_pass http://browser_cluster;
        proxy_http_version 1.1;

        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时配置
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

### 3. 监控配置

```yaml
# Prometheus 告警规则
groups:
  - name: browser_autos
    rules:
      - alert: HighConcurrency
        expr: browser_autos_sessions{status="active"} > 15
        for: 5m

      - alert: HighMemory
        expr: container_memory_usage_bytes > 3e9
        for: 5m

      - alert: QueueBacklog
        expr: browser_autos_queue_tasks{status="waiting"} > 50
        for: 2m
```

---

## 📚 更多资源

- **Browserless 文档**: https://docs.browserless.io/
- **Browser.autos 文档**: [DOCKER_ALPINE.md](./DOCKER_ALPINE.md)
- **API 文档**: http://localhost:3001/docs
- **健康检查**: http://localhost:3001/health
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000

---

**版本**: 1.0.0
**最后更新**: 2025-10-11
**兼容性**: Browserless v2.x API
