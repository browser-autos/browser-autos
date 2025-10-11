# Browser.autos - Debian Slim + Playwright 版本

## 🎯 概述

本项目已从 Alpine 迁移到 **Debian Bookworm Slim + Playwright Chromium**，提供更好的稳定性和兼容性。

### 为什么选择 Debian + Playwright？

| 优势 | 说明 |
|------|------|
| ✅ **官方支持** | Playwright 官方推荐和测试的平台 |
| ✅ **完美兼容** | 所有 npm 包和 native 依赖都能正常工作 |
| ✅ **及时更新** | Playwright 每 1-2 周发布新版本，Chromium 保持最新 |
| ✅ **稳定可靠** | Debian 作为服务器标准，经过大量生产环境验证 |
| ✅ **社区支持** | 问题更容易找到解决方案 |

## 🚀 快速开始

### 1. 构建镜像

```bash
cd backend
docker build -t browser-autos:latest .
```

**预计时间**：首次构建 ~5-8 分钟（包含下载 Chromium）

### 2. 运行容器

```bash
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-key-change-in-production \
  -e ENABLE_QUEUE=false \
  --shm-size=2gb \
  --memory=4g \
  --cpus=2 \
  browser-autos:latest
```

**重要参数**：
- `--shm-size=2gb` - **必须**，Chromium 需要共享内存
- `--memory=4g` - 推荐 4GB，支持多个浏览器实例
- `--cpus=2` - 推荐 2 核 CPU

### 3. 验证服务

```bash
# 健康检查
curl http://localhost:3001/health

# 测试截图
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  -o test.png
```

## 📦 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: ./backend
    image: browser-autos:latest
    container_name: browser-autos
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - ENABLE_QUEUE=false
    shm_size: '2gb'
    mem_limit: 4g
    cpus: 2
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

启动：
```bash
docker-compose up -d
```

## 🔧 配置说明

### 环境变量

```bash
# .env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# 认证
JWT_SECRET=your-secret-key

# Chromium 配置
MAX_CONCURRENT_SESSIONS=5
# CHROME_EXECUTABLE_PATH 留空，Playwright 自动检测

# 浏览器池
BROWSER_POOL_MIN=2
BROWSER_POOL_MAX=10
BROWSER_MAX_AGE=3600000

# 队列（可选）
ENABLE_QUEUE=false
# REDIS_URL=redis://redis:6379

# 日志
LOG_LEVEL=info
```

### Chromium 路径

**无需配置** `CHROME_EXECUTABLE_PATH`！

Playwright 会自动使用安装的 Chromium：
- 路径：`/ms-playwright/chromium-*/chrome-linux/chrome`
- 版本：随 Playwright 版本自动更新

### Puppeteer 兼容

Puppeteer 会自动使用 Playwright 安装的 Chromium：

```javascript
const puppeteer = require('puppeteer-core');

const browser = await puppeteer.launch({
  // executablePath 留空，自动检测
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

## 📊 镜像信息

| 项目 | 详情 |
|------|------|
| **基础镜像** | `node:20-bookworm-slim` |
| **Chromium** | Playwright 官方（最新稳定版） |
| **大小** | ~1.5GB |
| **架构** | amd64 (x86_64) |
| **用户** | browserautos (UID 1001, 非 root) |

### 镜像层次

```
├── node:20-bookworm-slim      (~200MB)
├── 系统依赖                    (~50MB)
├── 字体                       (~100MB)
├── Node.js 依赖               (~300MB)
├── Playwright Chromium        (~400MB)
└── 应用代码                    (~50MB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: ~1.5GB
```

## 🔄 版本更新

### Playwright 自动更新

Dependabot 会每周检查更新并创建 PR：

```json
// package.json
{
  "dependencies": {
    "playwright": "^1.56.0"  // 自动跟随 minor 版本
  }
}
```

### 手动更新

```bash
# 1. 更新 Playwright
cd backend
npm update playwright

# 2. 重新构建镜像
docker build -t browser-autos:latest .

# 3. 重启容器
docker-compose down
docker-compose up -d
```

### 查看版本

```bash
# Playwright 版本
docker run --rm browser-autos:latest npx playwright --version

# Chromium 版本
docker run --rm browser-autos:latest \
  /ms-playwright/chromium-*/chrome-linux/chrome --version
```

## 🐛 故障排除

### 1. Chromium 启动失败

```bash
# 检查共享内存
docker inspect browser-autos | grep -i shm

# 应该看到
"ShmSize": 2147483648  # 2GB
```

**解决方案**：
```bash
docker run --shm-size=2gb ...
```

### 2. 内存不足

**症状**：容器频繁重启或 OOM killed

**解决方案**：
```bash
# 增加内存限制
docker run --memory=4g ...
```

### 3. Playwright 安装失败

**症状**：构建时提示 "Failed to install browsers"

**解决方案**：
```bash
# 清理 Docker 缓存重新构建
docker builder prune -a
docker build --no-cache -t browser-autos:latest .
```

### 4. 健康检查失败

```bash
# 查看日志
docker logs browser-autos

# 手动测试
docker exec browser-autos wget -O- http://localhost:3001/health
```

## 📈 性能优化

### 1. 并发优化

```bash
# 增加最大并发会话数
-e MAX_CONCURRENT_SESSIONS=10
-e BROWSER_POOL_MAX=10

# 相应增加资源
--memory=8g
--cpus=4
```

### 2. 内存优化

```bash
# Node.js 堆内存
-e NODE_OPTIONS="--max-old-space-size=4096"

# 浏览器池配置
-e BROWSER_POOL_MIN=1
-e BROWSER_POOL_MAX=5
-e BROWSER_MAX_AGE=1800000  # 30分钟
```

### 3. 网络优化

```bash
# 使用 Docker 网络
docker network create browser-autos-net

docker run --network browser-autos-net ...
```

## 🔒 安全加固

### 1. 非 root 用户

✅ 已默认配置：
- 用户：`browserautos`
- UID：1001
- GID：1001

### 2. 资源限制

```bash
# CPU 限制
--cpus=2
--cpu-shares=1024

# 内存限制
--memory=4g
--memory-swap=4g

# 进程数限制
--pids-limit=500
```

### 3. 只读文件系统（可选）

```bash
docker run \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid \
  --tmpfs /home/browserautos/.cache:rw \
  ...
```

## 📚 相关文档

- [Dockerfile 迁移指南](./DOCKERFILE_MIGRATION.md)
- [浏览器说明文档](./BROWSER_CLARIFICATION.md)
- [Playwright 官方文档](https://playwright.dev/docs/docker)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)

## ⚡ 快速命令

```bash
# 构建
docker build -t browser-autos:latest ./backend

# 运行（最小配置）
docker run -d --name browser-autos -p 3001:3001 \
  -e JWT_SECRET=secret --shm-size=2gb browser-autos:latest

# 查看日志
docker logs -f browser-autos

# 重启
docker restart browser-autos

# 停止并删除
docker stop browser-autos && docker rm browser-autos

# 清理镜像
docker rmi browser-autos:latest

# 进入容器
docker exec -it browser-autos bash

# 查看资源使用
docker stats browser-autos
```

---

**版本**: Debian Slim + Playwright
**最后更新**: 2025-10-11
**维护**: Browser.autos Team
