# 浏览器说明：Chromium vs Chrome

## 🎯 明确说明

本项目使用的是 **Chromium**（开源版本），**不是** Google Chrome（专有版本）。

### Chromium vs Chrome 对比

| 特性 | Chromium | Google Chrome |
|------|----------|---------------|
| **类型** | 开源项目 | 专有软件 |
| **许可证** | BSD License | 专有许可证 |
| **开发者** | Chromium Project | Google |
| **更新方式** | 社区驱动 | Google 官方 |
| **功能** | 核心功能 | 核心功能 + Google 服务 |
| **品牌** | 无品牌元素 | Google 品牌 |
| **隐私** | 无 Google 追踪 | 包含 Google 服务 |

### 我们使用 Chromium 的原因

1. **✅ 开源** - 完全开源，可审计代码
2. **✅ 无隐私问题** - 不包含 Google 追踪服务
3. **✅ 许可证友好** - BSD 许可证，适合商业使用
4. **✅ 功能完整** - 包含所有 CDP (Chrome DevTools Protocol) 功能
5. **✅ 包管理器支持** - Alpine/Debian 等都提供官方包
6. **✅ 更新及时** - Alpine 仓库及时跟进上游更新

## 📦 不同部署方式使用的浏览器

### 1. Docker (Debian Slim + Playwright) 镜像 - **推荐** ⭐

```dockerfile
# 使用 Playwright 官方 Chromium
RUN npx playwright install chromium

# 版本示例
Chromium 132.0.6834.83 (Playwright 1.56.0)
```

**特点**：
- ✅ Playwright 官方支持和测试
- ✅ 最新的 Chromium 版本
- ✅ 完美兼容性（glibc）
- ✅ 及时的安全更新
- 📦 镜像大小：~1.5GB

### 2. 开发环境 (macOS/Linux)

```bash
# macOS
brew install chromium

# Ubuntu/Debian
apt-get install chromium-browser

# Arch Linux
pacman -S chromium
```

### 3. ~~Alpine 系统 Chromium（已弃用）~~

```bash
# Alpine 原生 Chromium
apk add chromium
```

**注意**：
- ❌ 已弃用，不推荐使用
- ❌ Playwright 不兼容（musl libc）
- ⚠️ 依赖问题频繁

## 🔄 Chromium 版本更新策略

### 自动更新机制

我们通过以下方式确保 Chromium 保持最新：

#### 1. **Dependabot** - Node.js 依赖
- 自动更新 `playwright`、`puppeteer-core`
- 每周一检查更新
- 自动创建 PR

#### 2. **GitHub Actions** - Chromium 版本检查
- 每周检查 Alpine 仓库中的 Chromium 版本
- 版本变化时自动创建 Issue
- 文件：`.github/workflows/chromium-version-check.yml`

#### 3. **Docker Base Image 更新**
- Dependabot 自动检查 `alpine:3.22` 更新
- 每周二检查
- Base image 更新会带来新版本 Chromium

### 手动检查版本

```bash
# 检查 Alpine 仓库中的 Chromium 版本
docker run --rm alpine:3.22 sh -c "apk info chromium"

# 检查当前镜像中的版本
docker run --rm browser-autos:alpine chromium --version

# 检查 Playwright Chromium 版本
npx playwright --version
```

## 📊 版本追踪

### 当前版本（示例）

| 组件 | 版本 | 更新日期 | 来源 |
|------|------|----------|------|
| Alpine Chromium | 131.0.6778.204 | 2024-12-15 | Alpine 3.22 |
| Playwright | 1.56.0 | 2024-12-10 | npm registry |
| Puppeteer Core | 23.10.4 | 2024-12-05 | npm registry |

### 版本同步

```bash
# package.json 中的版本
"playwright": "^1.56.0"           # 自动跟随 minor 版本
"puppeteer-core": "^23.10.4"      # 自动跟随 minor 版本

# Dockerfile 中使用系统包
RUN apk add --no-cache chromium   # 始终安装最新稳定版
```

## 🚀 升级指南

### 升级 Alpine Chromium

```bash
# 1. 重新构建 Docker 镜像（自动获取最新版本）
docker build -t browser-autos:alpine ./backend

# 2. 验证版本
docker run --rm browser-autos:alpine chromium --version

# 3. 运行测试
npm test
```

### 升级 Playwright/Puppeteer

```bash
# 1. 更新依赖（或等待 Dependabot PR）
cd backend
npm update playwright puppeteer-core

# 2. 测试兼容性
npm test

# 3. 提交更新
git add package.json package-lock.json
git commit -m "chore: update playwright and puppeteer"
```

## ⚠️ 重要说明

### 为什么不使用 Google Chrome？

1. **许可证限制** - Chrome 的许可证不适合开源项目分发
2. **隐私考虑** - Chrome 包含 Google 服务和追踪
3. **包管理** - Chrome 不在 Alpine 官方仓库中
4. **功能相同** - Chromium 提供相同的 CDP 功能

### CDP (Chrome DevTools Protocol) 支持

**所有 CDP 功能在 Chromium 中完全可用**：

```javascript
// Puppeteer
const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',  // ✅ 完全兼容
});

// Playwright
const browser = await playwright.chromium.launch({
  executablePath: '/usr/bin/chromium',  // ✅ 完全兼容
});
```

## 📚 相关资源

### 官方链接

- **Chromium 项目**: https://www.chromium.org/
- **Chromium Blog**: https://blog.chromium.org/
- **Alpine Chromium 包**: https://pkgs.alpinelinux.org/package/edge/community/x86_64/chromium
- **CDP 文档**: https://chromedevtools.github.io/devtools-protocol/

### 版本发布

- **Chromium Releases**: https://chromiumdash.appspot.com/releases
- **Playwright Releases**: https://github.com/microsoft/playwright/releases
- **Puppeteer Releases**: https://github.com/puppeteer/puppeteer/releases

## 🔍 常见问题

### Q: Chromium 和 Chrome 功能有差异吗？

A: 在自动化场景下，**没有差异**。所有 CDP 功能、JavaScript API、WebDriver 支持完全相同。

### Q: Chromium 更新频率如何？

A:
- **Alpine 仓库**：通常在上游发布后 1-2 周内更新
- **Playwright/Puppeteer**：每 1-2 周发布新版本
- **本项目**：Dependabot 每周自动检查

### Q: 如何确保使用最新的 Chromium？

A:
1. 定期重新构建 Docker 镜像
2. 启用 Dependabot 和 GitHub Actions
3. 订阅 Chromium 发布通知

### Q: 性能有差异吗？

A: **没有**。Chromium 和 Chrome 使用相同的 Blink 引擎和 V8 JavaScript 引擎。

---

**最后更新**: 2025-10-11
**维护者**: Browser.autos Team
