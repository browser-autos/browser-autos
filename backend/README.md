# Browser.autos API Backend

浏览器自动化 CDP API 服务后端

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 到 `.env` 并根据需要修改配置：

```bash
cp .env.example .env
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
backend/
├── src/
│   ├── api/              # API 路由和控制器
│   ├── core/             # 核心业务逻辑
│   ├── services/         # 业务服务
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript 类型定义
│   ├── config/           # 配置管理
│   ├── index.ts          # 应用入口
│   └── server.ts         # 服务器配置
├── tests/                # 测试文件
├── .env                  # 环境变量配置
├── package.json
├── tsconfig.json
└── README.md
```

## 开发进度

### ✅ 已完成

- [x] 项目初始化和目录结构
- [x] TypeScript 配置
- [x] 环境变量配置
- [x] Logger 工具类
- [x] 配置管理模块
- [x] 类型定义文件
- [x] 基础服务器框架

### 🚧 进行中

- [ ] Browser Pool 实现
- [ ] Session Manager 实现
- [ ] Queue Manager 实现
- [ ] REST API 端点实现
- [ ] WebSocket 代理实现

### 📋 待开发

- [ ] 监控和指标
- [ ] 测试用例
- [ ] Docker 部署
- [ ] 文档完善

## API 端点

### 健康检查

```bash
GET /health
```

### 截图 API

```bash
POST /screenshot
Content-Type: application/json

{
  "url": "https://example.com",
  "fullPage": true,
  "format": "png"
}
```

## 环境变量

详见 `.env.example` 文件

## 技术栈

- **运行时**: Node.js 20+
- **语言**: TypeScript 5+
- **框架**: Fastify 4
- **浏览器**: Puppeteer Core
- **队列**: Bull + Redis
- **日志**: Pino
- **监控**: Prometheus

## 许可证

MIT
