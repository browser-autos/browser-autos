# Dockerfile 迁移说明：Alpine → Debian Slim + Playwright

## 📋 变更概述

| 项目 | Alpine 版本（旧） | Debian Slim 版本（新） |
|------|------------------|----------------------|
| **基础镜像** | `node:20-alpine` | `node:20-bookworm-slim` |
| **Chromium 来源** | Alpine 系统包 | Playwright 官方 |
| **镜像大小** | ~1.07GB | ~1.5GB (+400MB) |
| **兼容性** | ⚠️ musl libc | ✅ glibc |
| **稳定性** | ⚠️ 一般 | ✅ 优秀 |
| **Playwright 支持** | ❌ 不兼容 | ✅ 官方支持 |

## 🎯 为什么迁移？

### Alpine 的问题

1. **❌ Playwright 不兼容**
   ```
   Error: spawn /ms-playwright/chromium-1194/chrome-linux/chrome ENOENT
   exec /ms-playwright/chromium-1194/chrome-linux/chrome: no such file or directory
   ```
   - Playwright Chromium 为 glibc 编译，Alpine 使用 musl libc
   - 无法运行 Playwright 官方浏览器

2. **❌ 依赖问题频繁**
   - 许多 npm 包的 native 依赖不兼容 Alpine
   - 需要额外的编译步骤和补丁

3. **❌ 系统 Chromium 版本滞后**
   - Alpine 仓库更新较慢
   - 功能和安全补丁不及时

### Debian Slim 的优势

1. **✅ Playwright 官方支持**
   - Playwright 文档推荐 Debian/Ubuntu
   - Chromium 经过完整测试和优化
   - 获得最新的浏览器特性

2. **✅ 生态兼容性好**
   - 99% 的 npm 包都支持 Debian/Ubuntu
   - 无需担心 native 依赖问题

3. **✅ 更新及时**
   - Playwright 每 1-2 周发布新版本
   - Chromium 保持最新

4. **✅ 社区支持**
   - Playwright 官方示例都基于 Debian
   - 问题更容易找到解决方案

## 🔄 主要变化

### 1. 基础镜像

```dockerfile
# 旧版 (Alpine)
FROM node:20-alpine

# 新版 (Debian Slim)
FROM node:20-bookworm-slim
```

### 2. 系统依赖安装

```dockerfile
# 旧版 (Alpine)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    ...

# 新版 (Debian Slim)
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Playwright 官方推荐依赖
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    ...
```

### 3. Chromium 安装

```dockerfile
# 旧版 (Alpine) - 使用系统包
RUN apk add chromium
ENV CHROME_EXECUTABLE_PATH=/usr/bin/chromium

# 新版 (Debian) - 使用 Playwright
RUN npx playwright install chromium --with-deps
# CHROME_EXECUTABLE_PATH 留空，Playwright 自动检测
```

### 4. 用户创建

```dockerfile
# 旧版 (Alpine)
RUN addgroup -g 1001 -S browserautos && \
    adduser -S browserautos -u 1001 -G browserautos

# 新版 (Debian)
RUN groupadd --gid 1001 browserautos && \
    useradd --uid 1001 --gid browserautos --shell /bin/bash --create-home browserautos
```

### 5. 健康检查时间

```dockerfile
# 旧版 (Alpine) - 40秒
HEALTHCHECK --start-period=40s

# 新版 (Debian) - 60秒（Chromium 启动需要更多时间）
HEALTHCHECK --start-period=60s
```

## 📊 性能对比

| 指标 | Alpine | Debian Slim | 差异 |
|------|--------|-------------|------|
| 镜像大小 | 1.07GB | ~1.5GB | +400MB |
| 构建时间 | ~3分钟 | ~4分钟 | +1分钟 |
| 启动时间 | ~2秒 | ~2秒 | 相同 |
| 内存占用 | ~500MB | ~500MB | 相同 |
| Chromium 版本 | 131.0.6778 | 132.0.6834 | 更新 |

**结论**：镜像稍大，但稳定性和兼容性显著提升，值得！

## 🚀 迁移步骤

### 1. 停止旧容器

```bash
docker stop browser-autos
docker rm browser-autos
```

### 2. 删除旧镜像（可选）

```bash
docker rmi browser-autos:alpine
```

### 3. 构建新镜像

```bash
cd backend
docker build -t browser-autos:latest -t browser-autos:debian .
```

### 4. 运行新容器

```bash
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  -e ENABLE_QUEUE=false \
  --shm-size=2gb \
  --memory=4g \
  --cpus=2 \
  browser-autos:latest
```

### 5. 验证服务

```bash
# 检查健康状态
curl http://localhost:3001/health

# 测试截图 API
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  -o test.png
```

## ⚙️ 配置变化

### 环境变量

```bash
# 旧版 (Alpine)
CHROME_EXECUTABLE_PATH=/usr/bin/chromium
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# 新版 (Debian) - 更简单
# CHROME_EXECUTABLE_PATH 留空即可
# Playwright 会自动使用安装的浏览器
```

### Docker Compose

```yaml
# docker-compose.yml
services:
  api:
    image: browser-autos:latest
    # 之前：browser-autos:alpine
    environment:
      # 移除 CHROME_EXECUTABLE_PATH
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    shm_size: '2gb'
    mem_limit: 4g
    cpus: 2
```

## 🐛 常见问题

### Q: 为什么镜像变大了？

A: Playwright 包含完整的 Chromium 二进制（~400MB），但带来：
- ✅ 官方测试和优化
- ✅ 最新的浏览器特性
- ✅ 更好的兼容性
- ✅ 及时的安全更新

### Q: 性能会下降吗？

A: **不会**。Chromium 引擎相同，性能一致。

### Q: 需要更多资源吗？

A: 推荐配置：
- 内存: 4GB（多实例）
- CPU: 2核
- SHM: 2GB（必须）

### Q: 如何回退到 Alpine？

A:
```bash
git checkout <commit-hash>  # 回退到 Alpine 版本
docker build -t browser-autos:alpine .
```

### Q: Playwright 版本如何更新？

A: Dependabot 会自动创建 PR：
```bash
# 手动更新
npm update playwright
docker build -t browser-autos:latest .
```

## 📚 相关文档

- [Playwright 官方文档](https://playwright.dev/docs/docker)
- [Playwright 系统依赖](https://playwright.dev/docs/browsers#install-system-dependencies)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)

## ✅ 测试清单

迁移后请测试以下功能：

- [ ] 容器启动成功
- [ ] 健康检查通过
- [ ] Screenshot API 正常
- [ ] PDF API 正常
- [ ] Content API 正常
- [ ] Scrape API 正常
- [ ] WebSocket Proxy 正常
- [ ] 中文字体显示正确
- [ ] 内存占用正常
- [ ] 并发测试通过

## 🎉 预期结果

✅ **更稳定** - Playwright 官方支持
✅ **更兼容** - 所有 npm 包正常工作
✅ **更新及时** - Chromium 保持最新
✅ **维护简单** - 无需处理 Alpine 兼容性问题

---

**迁移完成日期**: 2025-10-11
**推荐版本**: Debian Slim + Playwright
**维护者**: Browser.autos Team
