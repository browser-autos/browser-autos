# Live Debugger Guide

Browser.autos 的轻量级自定义调试器 - 基于 CDP Screencast 技术实现实时预览。

---

## 概述

Live Debugger 是一个极简、高性能的浏览器调试工具，专为快速开发和实时预览设计。

### 特性对比

| 功能 | Browserless Debugger | Live Debugger |
|------|---------------------|---------------|
| **代码编辑器** | Monaco Editor (VS Code) | Simple Textarea |
| **实时预览** | ✅ CDP Screencast | ✅ CDP Screencast |
| **控制台输出** | ✅ | ✅ |
| **截图功能** | ✅ | ✅ |
| **加载时间** | ~3秒 | <500ms |
| **文件大小** | 52MB (195 files) | <10KB (1 file) |
| **外部依赖** | 多个 (TypeScript Worker 等) | 零依赖 |
| **CDP 集成** | 间接 (需要 browserless.io API) | 直接 (原生 WebSocket) |
| **代码执行** | ❌ (需要后端支持) | ⚠️ (需要进一步集成) |

---

## 快速开始

### 1. 访问调试器

打开浏览器访问：

```
http://localhost:3001/debug/live
```

### 2. 连接到浏览器

点击顶部的 **"Connect"** 按钮，调试器会：

1. 连接到 WebSocket CDP 代理 (`ws://localhost:3001/ws`)
2. 启动新的 Chrome 浏览器实例
3. 开始 CDP Screencast 视频流
4. 在右侧画布上显示实时预览

**状态指示器：**
- 🔴 **Disconnected** - 未连接
- 🟢 **Connected** - 已连接，实时预览运行中

### 3. 查看实时预览

连接成功后，右侧的预览面板会显示：

- 📺 **实时画面**：浏览器当前页面的实时截图（JPEG 格式，80% 质量）
- 📐 **分辨率**：显示当前预览的分辨率（如 `1280×720`）
- ⚡ **帧率**：约 10-15 FPS（根据网络和 CPU 自动调整）

### 4. 编写代码

在左侧的代码编辑器中编写 Puppeteer 代码：

```typescript
// Navigate to a webpage
await page.goto('https://example.com');

// Wait for the page to load
await page.waitForLoadState('domcontentloaded');

// Get page title
const title = await page.title();
console.log('Page title:', title);

// Take a screenshot
await page.screenshot({ path: '/tmp/screenshot.png' });
console.log('Screenshot saved!');
```

**快捷键：**
- `Ctrl+Enter` - 运行代码
- `Tab` - 插入 2 个空格

### 5. 查看控制台

底部的控制台面板显示：

- 📝 **日志消息**（`console.log`）
- ⚠️ **警告**（`console.warn`）
- ❌ **错误**（`console.error`）
- 💡 **信息**（`console.info`）

每条日志都带有时间戳和颜色标识。

### 6. 截图

点击顶部的 **"📸 Screenshot"** 按钮：

- 发送 CDP `Page.captureScreenshot` 命令
- 截图保存到后端（检查日志获取路径）

### 7. 断开连接

点击 **"Disconnect"** 按钮关闭 WebSocket 连接并清理资源。

---

## 技术原理

### CDP Screencast 工作流程

```
┌─────────────┐
│   Browser   │
│  (Chromium) │
└─────┬───────┘
      │
      │ 1. Page.startScreencast
      │    { format: 'jpeg', quality: 80, maxWidth: 1280 }
      │
      ▼
┌─────────────┐
│ CDP Server  │  ← Chrome DevTools Protocol
└─────┬───────┘
      │
      │ 2. Page.screencastFrame (每帧)
      │    { data: base64, sessionId, metadata }
      │
      ▼
┌─────────────┐
│  WebSocket  │
│    Proxy    │  ← /ws endpoint
└─────┬───────┘
      │
      │ 3. 转发到前端
      │
      ▼
┌─────────────┐
│   Browser   │
│  (Frontend) │
└─────┬───────┘
      │
      │ 4. 解码 base64 → Canvas
      │    ctx.drawImage(img, 0, 0)
      │
      ▼
┌─────────────┐
│  <canvas>   │  ← 实时预览
│   element   │
└─────────────┘
```

### 关键代码片段

**后端 WebSocket 代理** (`proxy.route.ts:40-50`):

```typescript
// 支持根路径和 /ws 路径的 WebSocket 连接
const isWsEndpoint = url.startsWith('/ws');
const isRootEndpoint = url === '/' || url.startsWith('/?');

if (!isWsEndpoint && !isRootEndpoint) {
  return;
}
```

**前端 CDP 通信** (`live-debugger.html:~line 400`):

```javascript
// 发送 CDP 命令
function sendCDP(method, params = {}) {
  const message = {
    id: cdpId++,
    method,
    params
  };
  ws.send(JSON.stringify(message));
}

// 启动 screencast
sendCDP('Page.startScreencast', {
  format: 'jpeg',
  quality: 80,
  maxWidth: 1280,
  maxHeight: 720
});
```

**Canvas 渲染** (`live-debugger.html:~line 500`):

```javascript
function renderFrame(base64Data, metadata) {
  img.onload = () => {
    previewCanvas.width = img.width;
    previewCanvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };
  img.src = 'data:image/jpeg;base64,' + base64Data;
}
```

---

## 架构设计

### 文件结构

```
backend/
├── public/
│   └── live-debugger.html      # 单文件调试器 (< 10KB)
│
└── src/
    └── api/
        └── rest/
            └── live-debugger.route.ts   # 路由注册
```

### 路由端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/debug/live` | GET | 返回 Live Debugger HTML 页面 |
| `/ws` | WebSocket | CDP 代理（支持 screencast） |

### 依赖关系

```
Live Debugger (HTML)
  ↓
WebSocket (/ws)
  ↓
Browser Pool
  ↓
Chromium Instance
  ↓
CDP (Chrome DevTools Protocol)
```

---

## 使用场景

### ✅ 适合的场景

1. **快速测试和调试**
   - 需要查看页面实时状态
   - 验证 CSS 和 JavaScript 效果
   - 调试网络请求和渲染问题

2. **轻量级开发环境**
   - 不需要完整 IDE
   - 快速迭代和验证
   - 简单的自动化脚本

3. **教学和演示**
   - 实时展示浏览器自动化
   - 教学 Puppeteer 基础
   - 调试 CDP 命令

### ❌ 不适合的场景

1. **复杂代码编写**
   - 缺少代码补全和语法高亮
   - 没有 TypeScript 类型检查
   - 不支持多文件项目

2. **生产环境调试**
   - 应使用 Chrome DevTools
   - 或者使用 Debug Session API

3. **自动化测试**
   - 应使用 Puppeteer/Playwright 脚本
   - 或者通过 REST API

---

## 性能优化

### Screencast 参数调整

```javascript
// 高质量 (更大带宽)
sendCDP('Page.startScreencast', {
  format: 'jpeg',
  quality: 100,  // ← 提高质量
  maxWidth: 1920,
  maxHeight: 1080
});

// 低带宽优化
sendCDP('Page.startScreencast', {
  format: 'jpeg',
  quality: 60,   // ← 降低质量
  maxWidth: 800,
  maxHeight: 600
});
```

### 帧率控制

CDP Screencast 不支持直接设置帧率，但可以通过以下方式优化：

1. **降低分辨率**：减少每帧数据量
2. **降低质量**：减少 JPEG 压缩率
3. **网络优化**：使用本地 WebSocket（避免远程连接）

### 性能指标

| 配置 | 分辨率 | 质量 | 帧率 | 带宽 |
|------|--------|------|------|------|
| **默认** | 1280×720 | 80% | ~15 FPS | ~500 KB/s |
| **高质量** | 1920×1080 | 100% | ~10 FPS | ~1 MB/s |
| **低带宽** | 800×600 | 60% | ~20 FPS | ~200 KB/s |

---

## 故障排除

### 问题 1: "WebSocket connection failed"

**原因：**
- 后端服务未启动
- WebSocket 代理未正确配置
- 端口被占用

**解决方案：**

```bash
# 检查服务状态
curl http://localhost:3001/health

# 检查 WebSocket 端点
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://localhost:3001/ws

# 重启服务
npm run dev
```

### 问题 2: "Preview not showing"

**原因：**
- Screencast 未启动
- Canvas 渲染失败
- Base64 数据损坏

**解决方案：**

1. 打开浏览器开发者工具
2. 检查 Console 是否有 JavaScript 错误
3. 检查 Network 标签，确认 WebSocket 消息正常
4. 尝试断开并重新连接

### 问题 3: "Run button does nothing"

**原因：**
- 代码执行功能尚未完全实现
- 需要后端支持

**解决方案：**

目前 Live Debugger 的代码执行功能需要进一步集成。推荐使用：

1. **Debug Session API**：创建独立会话执行代码
2. **REST API**：使用 `/screenshot` 等端点
3. **本地脚本**：将代码保存为 `.js` 文件并使用 Node.js 运行

---

## 未来增强

### 短期计划

- [ ] 完整的代码执行支持（通过 Debug Session API）
- [ ] 网络监控面板（显示请求和响应）
- [ ] 性能分析工具
- [ ] 元素选择器（点击页面获取 CSS 选择器）

### 长期计划

- [ ] 移动设备模拟
- [ ] 多标签页支持
- [ ] 录制和回放功能
- [ ] 代码片段库
- [ ] 协作调试（多人同时查看）

---

## 与其他工具的集成

### 1. 与 Browserless Debugger 配合

```
┌────────────────────┐
│ Browserless       │  ← 复杂项目，完整 IDE
│ Debugger          │    (Monaco Editor)
└────────────────────┘

┌────────────────────┐
│ Live Debugger     │  ← 快速测试，实时预览
│ (本工具)          │    (Lightweight)
└────────────────────┘

┌────────────────────┐
│ Debug Session API │  ← 自动化脚本，远程调试
│ + Chrome DevTools │    (Production)
└────────────────────┘
```

### 2. 与 REST API 配合

```javascript
// 在 Live Debugger 中开发和测试
// ...

// 验证通过后，转换为 REST API 调用
const response = await fetch('http://localhost:3001/screenshot', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com',
    fullPage: true
  })
});

const { screenshot } = await response.json();
```

---

## API 参考

### WebSocket CDP 命令

Live Debugger 支持以下 CDP 命令（通过 `sendCDP` 函数）：

#### Page.startScreencast

开始屏幕录制

```javascript
sendCDP('Page.startScreencast', {
  format: 'jpeg',       // 或 'png'
  quality: 80,          // 1-100 (仅 JPEG)
  maxWidth: 1280,       // 最大宽度
  maxHeight: 720        // 最大高度
});
```

#### Page.stopScreencast

停止屏幕录制

```javascript
sendCDP('Page.stopScreencast');
```

#### Page.captureScreenshot

截图（不使用 screencast）

```javascript
sendCDP('Page.captureScreenshot', {
  format: 'png',        // 或 'jpeg'
  quality: 100,         // 仅 JPEG
  fromSurface: true     // 从表面捕获（包括滚动内容）
});
```

#### Runtime.enable

启用 Runtime 域（用于 console 事件）

```javascript
sendCDP('Runtime.enable');
```

#### Page.enable

启用 Page 域（用于页面事件）

```javascript
sendCDP('Page.enable');
```

---

## 示例代码

### 示例 1: 基础导航

```javascript
// 连接 WebSocket
// (点击 "Connect" 按钮)

// 发送 CDP 命令导航到页面
sendCDP('Page.navigate', {
  url: 'https://example.com'
});

// 查看实时预览更新
```

### 示例 2: 控制台监听

```javascript
// 启用 Runtime 域
sendCDP('Runtime.enable');

// 前端会自动监听 Runtime.consoleAPICalled 事件
// 并在控制台面板显示
```

### 示例 3: 截图

```javascript
// 点击 "📸 Screenshot" 按钮
// 或者手动发送命令
sendCDP('Page.captureScreenshot', {
  format: 'png',
  quality: 100
});
```

---

## 常见问题 (FAQ)

### Q: Live Debugger 和 Browserless Debugger 有什么区别？

**A:**

- **Live Debugger**: 轻量、快速、直接集成 CDP，适合快速测试
- **Browserless Debugger**: 完整 IDE、Monaco 编辑器、代码补全，适合复杂开发

### Q: 为什么没有代码自动补全？

**A:** 为了保持轻量级，Live Debugger 使用简单的 `<textarea>` 而不是 Monaco Editor。如果需要代码补全，请使用 `/debugger` 端点的 Browserless Debugger。

### Q: 如何执行 Puppeteer 代码？

**A:** 当前版本的 "Run" 按钮是占位符。推荐方式：

1. 使用 Debug Session API 创建会话
2. 使用 Puppeteer 连接到 `wsEndpoint`
3. 执行代码

或者将代码保存为本地脚本并使用 Node.js 运行。

### Q: Live Debugger 可以用于生产环境吗？

**A:** 不推荐。Live Debugger 是开发工具，缺少身份验证、日志记录和生产级错误处理。生产环境请使用：

- REST API (`/screenshot`, `/pdf` 等)
- Debug Session API (带 JWT 认证)
- Chrome DevTools (通过 `chrome://inspect`)

### Q: 如何提高预览质量？

**A:** 修改 `Page.startScreencast` 参数：

```javascript
sendCDP('Page.startScreencast', {
  format: 'jpeg',
  quality: 100,      // ← 提高到 100
  maxWidth: 1920,    // ← 提高分辨率
  maxHeight: 1080
});
```

注意：更高的质量会增加带宽和 CPU 使用。

---

## 开发者笔记

### 贡献指南

想要改进 Live Debugger？

1. **编辑 HTML**：`backend/public/live-debugger.html`
2. **修改路由**：`backend/src/api/rest/live-debugger.route.ts`
3. **测试**：`/tmp/test-live-debugger.sh`

### 代码结构

```javascript
// live-debugger.html 结构

// 1. HTML 布局
<div class="container">
  <div class="header">...</div>        // 顶部工具栏
  <div class="editor-panel">...</div>  // 代码编辑器
  <div class="preview-panel">...</div> // 实时预览
  <div class="console-panel">...</div> // 控制台
</div>

// 2. 样式
<style>...</style>                     // CSS Grid 布局

// 3. JavaScript
<script>
  // 状态管理
  let ws, isConnected, cdpId;

  // 核心函数
  function connect() {...}             // 连接 WebSocket
  function sendCDP(method, params) {...} // 发送 CDP 命令
  function handleCDPMessage(event) {...} // 处理 CDP 消息
  function renderFrame(base64, meta) {...} // 渲染 Canvas
</script>
```

---

## 相关文档

- [Debugger Guide](./DEBUGGER_GUIDE.md) - Browserless Debugger 完整指南
- [Debugger Configuration](./DEBUGGER_CONFIGURATION.md) - 配置和限制说明
- [Debug Session API](./DEBUGGER_GUIDE.md#debug-session-api) - 调试会话 API
- [WebSocket Proxy](../README.md#websocket-cdp-proxy) - WebSocket 代理说明
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) - 官方 CDP 文档

---

## 总结

Live Debugger 是一个极简、高性能的浏览器调试工具：

- ✅ **轻量**：单文件 (<10KB)，无外部依赖
- ✅ **快速**：加载 <500ms，直接 CDP 集成
- ✅ **实时**：CDP Screencast 实时预览
- ✅ **开源**：完全可定制和扩展

**适合场景**：快速测试、实时预览、轻量级开发

**不适合场景**：复杂项目、生产环境、自动化测试

**推荐工作流**：

```
Live Debugger (快速测试)
  ↓
Browserless Debugger (复杂开发)
  ↓
Debug Session API (生产调试)
  ↓
REST API (自动化部署)
```

---

**最后更新**: 2025-10-14
**版本**: v1.0.0
**维护者**: Browser.autos Team
