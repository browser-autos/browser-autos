# CDP 远程连接使用指南

Browser.autos 提供了类似 browserless 的 WebSocket CDP 代理功能，允许你通过 Puppeteer/Playwright 远程连接到托管的浏览器实例。

## 认证方式

支持以下三种认证方式:

### 1. JWT Token (推荐用于用户)

```javascript
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://localhost:3001/ws?token=YOUR_JWT_TOKEN'
});
```

### 2. API Key (推荐用于服务)

```javascript
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://localhost:3001/ws?apiKey=YOUR_API_KEY'
});
```

### 3. 匿名连接 (开发测试)

```javascript
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://localhost:3001/ws'
});
```

## 完整示例

### 获取认证 Token

#### 方式 1: 使用用户登录获取 JWT

```bash
# 登录获取 access token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# 响应示例
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "admin-001",
      "username": "admin",
      "role": "admin"
    }
  }
}
```

#### 方式 2: 创建 API Key (长期使用)

```bash
# 先登录获取 JWT
TOKEN="your_access_token_here"

# 创建 API Key
curl -X POST http://localhost:3001/auth/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "My CDP Connection Key",
    "permissions": ["*"],
    "expiresIn": 90
  }'

# 响应示例
{
  "success": true,
  "data": {
    "id": "key-001",
    "key": "ba_live_xxxxxxxxxx",
    "name": "My CDP Connection Key",
    "permissions": ["*"],
    "expiresAt": "2025-04-11T00:00:00.000Z"
  }
}
```

### Puppeteer 完整示例

```javascript
import puppeteer from 'puppeteer-core';

async function main() {
  // 方式 1: 使用 JWT Token
  const token = 'your_jwt_token_here';
  const browser = await puppeteer.connect({
    browserWSEndpoint: `ws://localhost:3001/ws?token=${token}`
  });

  // 方式 2: 使用 API Key (推荐)
  // const apiKey = 'ba_live_xxxxxxxxxx';
  // const browser = await puppeteer.connect({
  //   browserWSEndpoint: `ws://localhost:3001/ws?apiKey=${apiKey}`
  // });

  // 使用浏览器
  const page = await browser.newPage();
  await page.goto('https://example.com');

  // 截图
  await page.screenshot({ path: 'screenshot.png' });

  // 提取内容
  const title = await page.title();
  console.log('Page title:', title);

  // 关闭连接
  await browser.close();
}

main().catch(console.error);
```

### Playwright 示例

```javascript
import { chromium } from 'playwright-core';

async function main() {
  const apiKey = 'ba_live_xxxxxxxxxx';

  const browser = await chromium.connectOverCDP(
    `ws://localhost:3001/ws?apiKey=${apiKey}`
  );

  const context = browser.contexts()[0];
  const page = await context.newPage();

  await page.goto('https://example.com');
  await page.screenshot({ path: 'screenshot.png' });

  await browser.close();
}

main().catch(console.error);
```

### Python 示例 (使用 pyppeteer)

```python
import asyncio
from pyppeteer import connect

async def main():
    api_key = 'ba_live_xxxxxxxxxx'
    browser = await connect(
        browserWSEndpoint=f'ws://localhost:3001/ws?apiKey={api_key}'
    )

    page = await browser.newPage()
    await page.goto('https://example.com')
    await page.screenshot({'path': 'screenshot.png'})

    await browser.close()

asyncio.get_event_loop().run_until_complete(main())
```

## 认证方式对比

| 方式 | 适用场景 | 有效期 | 安全性 | 使用便捷性 |
|------|---------|-------|--------|-----------|
| JWT Token | 用户交互式操作 | 30天 | 高 | 中 (需要定期刷新) |
| API Key | 服务端自动化任务 | 自定义 (建议90天) | 高 | 高 (长期有效) |
| 匿名连接 | 开发测试 | - | 低 | 高 |

## 生产环境配置

### 使用 HTTPS/WSS

```javascript
const browser = await puppeteer.connect({
  browserWSEndpoint: 'wss://api.your-domain.com/ws?apiKey=YOUR_API_KEY'
});
```

### Header 认证 (更安全)

Puppeteer 不直接支持 WebSocket header,需要通过代理或包装器实现。推荐使用 query 参数方式。

## 功能特性

### 1. 自动会话管理
- 连接建立时自动创建浏览器会话
- 连接断开时自动清理资源
- 支持会话超时和最大持续时间限制

### 2. 完整的 CDP 协议支持
- 所有 Chrome DevTools Protocol 命令
- 实时双向通信
- 支持多页面、多 Tab

### 3. 监控与日志
- 记录所有连接和认证事件
- Prometheus 指标集成
- 详细的错误日志

### 4. 安全特性
- API Key 权限控制
- 请求速率限制
- IP 访问控制 (可选)
- 会话隔离

## 高级用法

### 设置自定义 User-Agent

```javascript
const browser = await puppeteer.connect({
  browserWSEndpoint: `ws://localhost:3001/ws?apiKey=${apiKey}`
});

const page = await browser.newPage();
await page.setUserAgent('Custom User Agent');
```

### 使用代理

```javascript
const browser = await puppeteer.connect({
  browserWSEndpoint: `ws://localhost:3001/ws?apiKey=${apiKey}`
});

const page = await browser.newPage();
await page.authenticate({
  username: 'proxy_user',
  password: 'proxy_pass'
});
```

### 多页面并发

```javascript
const browser = await puppeteer.connect({
  browserWSEndpoint: `ws://localhost:3001/ws?apiKey=${apiKey}`
});

// 创建多个页面并发执行
const urls = [
  'https://example.com',
  'https://example.org',
  'https://example.net'
];

const results = await Promise.all(
  urls.map(async (url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const title = await page.title();
    await page.close();
    return { url, title };
  })
);

console.log(results);
await browser.close();
```

## 故障排查

### 连接被拒绝

```
Error: connect ECONNREFUSED
```

**解决方案**:
1. 确认后端服务运行在 `http://localhost:3001`
2. 检查防火墙设置
3. 验证 WebSocket 端口未被占用

### 认证失败

```
WebSocket closed with code 1008: Invalid or expired token
```

**解决方案**:
1. 检查 token 或 API key 是否正确
2. 验证 token 是否过期
3. 确认 API key 具有必要权限

### 超时错误

```
Error: Navigation timeout
```

**解决方案**:
```javascript
const page = await browser.newPage();
await page.goto(url, {
  waitUntil: 'networkidle2',
  timeout: 60000 // 增加超时时间
});
```

## 性能优化建议

### 1. 复用连接

```javascript
// 好的做法: 复用同一个 browser 实例
const browser = await puppeteer.connect({ ... });

for (const url of urls) {
  const page = await browser.newPage();
  await page.goto(url);
  // 处理页面...
  await page.close();
}

await browser.close();
```

### 2. 限制并发

```javascript
const pLimit = require('p-limit');
const limit = pLimit(5); // 最多 5 个并发

const tasks = urls.map(url =>
  limit(async () => {
    const page = await browser.newPage();
    // 处理页面...
    await page.close();
  })
);

await Promise.all(tasks);
```

### 3. 设置合理的超时

```javascript
await page.goto(url, {
  waitUntil: 'domcontentloaded', // 而不是 'networkidle0'
  timeout: 30000
});
```

## API 限制

- 默认每个用户最多 5 个并发会话
- 单个会话最大持续时间: 1 小时
- 空闲超时: 5 分钟
- 速率限制: 100 请求/15分钟

## 与 browserless 对比

| 功能 | Browser.autos | browserless |
|------|--------------|-------------|
| WebSocket CDP | ✅ | ✅ |
| Token 认证 | ✅ JWT + API Key | ✅ |
| 会话管理 | ✅ | ✅ |
| REST API | ✅ | ✅ |
| 监控指标 | ✅ Prometheus | ✅ |
| 队列系统 | ✅ Bull | ✅ |
| 开源 | ✅ MIT | ❌ 商业 |
| 自托管 | ✅ | ✅ |

## 获取帮助

- API 文档: http://localhost:3001/docs
- 健康检查: http://localhost:3001/health
- 监控指标: http://localhost:3001/metrics
- GitHub Issues: https://github.com/your-org/browser.autos/issues

## 示例代码仓库

完整的示例代码可以在这里找到:
- Puppeteer 示例: `/examples/puppeteer-cdp`
- Playwright 示例: `/examples/playwright-cdp`
- Python 示例: `/examples/python-cdp`
