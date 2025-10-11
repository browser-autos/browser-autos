# ================================================================================
# Browser.autos - Production Docker Image (Debian Slim + Playwright)
# ================================================================================
# 稳定的浏览器自动化 CDP API 服务
#
# 特性:
# - Debian Bookworm Slim 基础（官方支持，兼容性好）
# - Playwright 官方 Chromium（经过优化和测试）
# - 完整的中日韩文字体和 emoji 支持
# - PDF 生成支持
# - 非 root 用户运行（安全加固）
# - 内置健康检查和优雅关闭
# ================================================================================

# ================================================================================
# Stage 1: 依赖构建阶段
# ================================================================================
FROM node:24-bookworm-slim AS builder

# 安装构建依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /build

# 仅复制 package 文件（利用 Docker 缓存）
COPY package*.json ./

# 安装所有依赖（包括 devDependencies）
RUN npm ci --include=dev

# 复制源代码和配置
COPY tsconfig.json ./
COPY src ./src

# 构建 TypeScript
RUN npm run build

# 移除开发依赖，只保留生产依赖
RUN npm prune --production

# ================================================================================
# Stage 2: 运行时镜像（Debian Slim + Playwright Chromium）
# ================================================================================
FROM node:24-bookworm-slim

# 镜像元数据（OCI 标准）
LABEL maintainer="Browser.autos Team" \
      org.opencontainers.image.title="Browser.autos API Server" \
      org.opencontainers.image.description="Browser automation API with Playwright Chromium, CDP WebSocket and REST endpoints" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.vendor="Browser.autos" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.base.name="docker.io/library/node:20-bookworm-slim"

# 环境变量配置
ENV NODE_ENV=production \
    PORT=3001 \
    HOST=0.0.0.0 \
    # Playwright 配置
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    # Puppeteer 配置（与 Playwright 共享浏览器）
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    # Node.js 内存优化
    NODE_OPTIONS="--max-old-space-size=2048" \
    # 时区
    TZ=Asia/Shanghai \
    # 日志配置
    LOG_LEVEL=info

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    # 基础工具
    curl \
    wget \
    ca-certificates \
    tzdata \
    dumb-init \
    # Playwright Chromium 依赖（官方推荐）
    # https://playwright.dev/docs/browsers#install-system-dependencies
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libxshmfence1 \
    # 字体支持
    fonts-liberation \
    fonts-noto-color-emoji \
    fonts-noto-cjk \
    fonts-wqy-zenhei \
    && fc-cache -f \
    && rm -rf /var/lib/apt/lists/* /tmp/*

# 创建应用用户
RUN groupadd --gid 1001 browserautos && \
    useradd --uid 1001 --gid browserautos --shell /bin/bash --create-home browserautos && \
    mkdir -p /home/browserautos/Downloads /app /app/logs /ms-playwright && \
    chown -R browserautos:browserautos /home/browserautos /app /ms-playwright

# 设置工作目录
WORKDIR /app

# 从构建阶段复制编译产物
COPY --from=builder --chown=browserautos:browserautos /build/dist ./dist
COPY --from=builder --chown=browserautos:browserautos /build/node_modules ./node_modules
COPY --from=builder --chown=browserautos:browserautos /build/package*.json ./

# 安装 Playwright Chromium 浏览器
# 系统依赖已作为 root 安装，这里只安装浏览器二进制文件
USER browserautos
RUN npx playwright install chromium

# 验证安装
RUN npx playwright --version && \
    ls -la /ms-playwright/chromium-*/chrome-linux/chrome

# 暴露端口（API 服务端口）
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# 使用 dumb-init 作为 PID 1（已切换为非 root 用户）
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# 启动应用
CMD ["node", "dist/index.js"]

# ================================================================================
# 构建和运行说明
# ================================================================================
#
# 构建镜像:
#   docker build -t browser-autos:latest -t browser-autos:debian .
#
# 运行容器:
#   docker run -d \
#     --name browser-autos \
#     -p 3001:3001 \
#     -e JWT_SECRET=your-secret-key \
#     -e REDIS_URL=redis://redis:6379 \
#     -e ENABLE_QUEUE=false \
#     --shm-size=2gb \
#     --memory=4g \
#     --cpus=2 \
#     browser-autos:latest
#
# 重要参数说明:
#   --shm-size=2gb    *** 必须 *** Chromium 需要足够的共享内存
#   --memory=4g       推荐 4GB 内存（多个浏览器实例）
#   --cpus=2          推荐 2 核 CPU
#
# 查看日志:
#   docker logs -f browser-autos
#
# 健康检查:
#   docker inspect --format='{{.State.Health.Status}}' browser-autos
#
# 镜像特点:
#   - 基于 Debian Bookworm Slim（稳定可靠）
#   - Playwright 官方 Chromium（经过优化测试）
#   - 完整中文字体（Noto CJK + WQY Zenhei）
#   - 非 root 用户运行
#   - 预估大小: ~1.5GB
#
# ================================================================================
