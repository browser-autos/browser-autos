# Browser.autos 快速开始 🚀

## 一键启动 (推荐)

### 最简单的启动方式

**只需要一个环境变量 - JWT_SECRET**:

```bash
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-token-here \
  --shm-size=2gb \
  browser-autos:alpine
```

**就这么简单！** 🎉

---

## 验证服务

### 1. 健康检查

```bash
curl http://localhost:3001/health
```

应该返回:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0"
  }
}
```

### 2. API 文档

浏览器打开:
```
http://localhost:3001/docs
```

### 3. 测试截图 API

```bash
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "fullPage": true}' \
  --output screenshot.png
```

---

## 环境变量说明

### 必需变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `JWT_SECRET` | JWT 密钥 (必需) | `your-secret-token` |

### 可选变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | `3001` |
| `MAX_CONCURRENT_SESSIONS` | 最大并发会话数 | `10` |
| `LOG_LEVEL` | 日志级别 | `info` |

### Redis 队列 (可选功能)

如果需要使用队列功能，需要额外配置:

```bash
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-token \
  -e ENABLE_QUEUE=true \
  -e REDIS_URL=redis://redis:6379 \
  --shm-size=2gb \
  browser-autos:alpine
```

**注意**: 默认情况下队列功能是**禁用**的，核心 API 功能不需要 Redis。

---

## 完整配置示例

如果需要更多自定义配置:

```bash
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  --restart unless-stopped \
  \
  # 必需配置
  -e JWT_SECRET=$(openssl rand -base64 32) \
  \
  # 性能配置
  -e MAX_CONCURRENT_SESSIONS=20 \
  -e BROWSER_POOL_MAX=15 \
  \
  # 可选: 队列功能
  -e ENABLE_QUEUE=false \
  \
  # 日志配置
  -e LOG_LEVEL=info \
  \
  # 资源限制 (重要!)
  --shm-size=2gb \
  --memory=2g \
  --cpus=2 \
  \
  browser-autos:alpine
```

---

## Browserless 兼容模式

如果你之前使用 browserless，可以直接替换:

**Browserless 命令**:
```bash
docker run -d \
  -p 3000:3000 \
  -e "TOKEN=my-token" \
  -e "CONCURRENT=10" \
  browserless/chromium
```

**Browser.autos 等效命令**:
```bash
docker run -d \
  -p 3001:3001 \
  -e JWT_SECRET=my-token \
  -e MAX_CONCURRENT_SESSIONS=10 \
  --shm-size=2gb \
  browser-autos:alpine
```

---

## Docker Compose

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  browser-autos:
    image: browser-autos:alpine
    container_name: browser-autos
    ports:
      - "3001:3001"
    environment:
      - JWT_SECRET=your-secret-token
      - MAX_CONCURRENT_SESSIONS=10
      - LOG_LEVEL=info
    shm_size: '2gb'
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2'
        reservations:
          memory: 1G
          cpus: '1'
```

启动:
```bash
docker-compose up -d
```

---

## 启动选项对比

### 基础模式 (推荐)

✅ **优点**:
- 最简单，只需要 JWT_SECRET
- 无需 Redis
- 启动即用

❌ **限制**:
- 无队列功能（直接处理请求）

**适用场景**: 大多数使用场景，小到中等规模部署

### 完整模式 (带 Redis 队列)

✅ **优点**:
- 支持队列管理
- 支持任务重试
- 支持优先级队列
- 更好的并发控制

❌ **需要**:
- Redis 服务器
- 额外配置

**适用场景**: 大规模部署，需要精细的任务管理

---

## 重要注意事项

### 1. `--shm-size=2gb` 是必需的！

Chromium 需要足够的共享内存，否则会崩溃:

```bash
# ✅ 正确
docker run --shm-size=2gb ...

# ❌ 错误 (可能导致 Chrome 崩溃)
docker run ...
```

### 2. JWT_SECRET 安全性

生产环境请使用安全的随机密钥:

```bash
# 生成安全的密钥
JWT_SECRET=$(openssl rand -base64 32)
echo $JWT_SECRET

# 使用生成的密钥
docker run -e JWT_SECRET=$JWT_SECRET ...
```

### 3. 端口映射

默认端口是 `3001`，可以映射到其他端口:

```bash
# 映射到本地 8080
docker run -p 8080:3001 ...

# 访问
curl http://localhost:8080/health
```

---

## 常见问题

### Q: 是否必须使用 Redis?
**A**: 不需要！默认情况下 Redis 是**可选**的。只有当你需要队列功能时才需要配置 Redis。

### Q: 和 browserless 有什么不同?
**A**: Browser.autos 提供更多功能（完整 REST API、认证、监控）同时镜像更小（1.07GB vs 1.5GB）。

### Q: 如何启用队列功能?
**A**: 设置 `ENABLE_QUEUE=true` 和 `REDIS_URL=redis://...`

### Q: Chrome 为什么崩溃?
**A**: 确保设置了 `--shm-size=2gb`

### Q: 支持哪些 API?
**A**:
- Screenshot (截图)
- PDF Generation (PDF 生成)
- Content Extraction (内容提取)
- Data Scraping (数据抓取)
- WebSocket CDP (Chrome DevTools Protocol)

### Q: 如何查看 API 文档?
**A**: 访问 `http://localhost:3001/docs`

---

## 下一步

- 📖 查看 [API 文档](http://localhost:3001/docs)
- 🔧 查看 [完整配置选项](./BROWSERLESS_COMPATIBILITY.md)
- 🐳 查看 [Docker 部署指南](./DOCKER_ALPINE.md)
- 🧪 查看 [测试报告](./DOCKER_ALPINE_TEST_REPORT.md)

---

**祝你使用愉快！** 🎉

如有问题，请查看文档或提交 Issue。
