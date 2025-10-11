# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2025-10-11

### 🏗️ Architecture

#### Changed
- **前后端仓库完全分离**
  - 后端 API 仓库：`browser-autos/browser-autos`（本仓库）
  - 前端网站仓库：`browser-autos/site`（新建独立仓库）
- **扁平化项目结构**
  - 移除 `backend/` 嵌套层级
  - 所有代码直接在根目录：`src/`, `docs/`, `docker/`, `tests/`
  - 符合单一职责原则，简化项目结构

### 🔑 Security & Authentication

#### Added
- **品牌化凭据配置系统**
  - 默认管理员凭据：`browserautos` / `browser.autos`
  - 默认 API 用户凭据：`api-user` / `browser.autos`
  - 支持通过环境变量完全自定义凭据
  - 启动时在日志中显示默认凭据（方便开发）

#### Changed
- 所有凭据从硬编码改为环境变量配置
- 新增 6 个环境变量：
  - `DEFAULT_ADMIN_USERNAME`
  - `DEFAULT_ADMIN_PASSWORD`
  - `DEFAULT_ADMIN_EMAIL`
  - `DEFAULT_API_USERNAME`
  - `DEFAULT_API_PASSWORD`
  - `DEFAULT_API_EMAIL`

### 📚 Documentation

#### Added
- `docs/CREDENTIALS_GUIDE.md` - 完整凭据管理指南
- `scripts/get-token.sh` - Token 快速获取脚本
- `CLAUDE.MD` - 项目开发进度文档
- `CHANGELOG.md` - 版本变更日志

#### Changed
- 更新所有文档的 Docker 示例（添加凭据环境变量）
- 恢复 README.md 的 logo 和完整内容
- 更新所有路径引用（`backend/` → 根目录）

#### Removed
- 删除冗余的 `README_OLD.md`

### ✨ User Experience

#### Changed
- **前端网站改进**（`browser-autos/site`）
  - "One Command to Start" 部分添加 Token 获取指南
  - 显示默认凭据信息
  - 提供查看日志命令
  - 提供登录 API 示例

### 🔧 Improvements

#### Changed
- 优化项目结构，移除不必要的嵌套目录
- 统一文档路径引用
- 改进新用户上手体验

---

## [1.0.0] - 2025-10-10

### 🎉 Initial Release

#### Added - Core API Services
- **Screenshot API** - 网页截图服务
  - 支持 PNG, JPEG, WebP 格式
  - 全页或元素截图
  - 自定义视口和等待策略

- **PDF Generation API** - PDF 生成服务
  - 多种页面格式（A4, A3, Letter, Legal）
  - 横向/纵向布局
  - 自定义边距和页眉页脚

- **Content Extraction API** - 内容提取服务
  - HTML 完整内容提取
  - 纯文本提取
  - Open Graph 和 Twitter Cards 元数据

- **Scrape API** - 数据抓取服务
  - CSS 选择器支持
  - 多种属性提取
  - 单个/多个元素抓取

- **WebSocket CDP Proxy** - CDP 协议代理
  - 支持 Puppeteer 直接连接
  - 支持 Playwright 直接连接
  - 完整的 CDP 协议透传

#### Added - Core Components

- **Browser Pool** - 浏览器实例池
  - 自动创建和复用浏览器实例
  - 性能提升 85%（7.6s → 1.2s）
  - 状态跟踪和资源清理
  - 最大年龄自动清理

- **Session Manager** - 会话管理器
  - 会话生命周期管理
  - 自动超时清理（空闲 5 分钟）
  - 最大存活时间控制（1 小时）
  - 事件系统支持

- **Queue Manager** - 队列管理器
  - 基于 Bull + Redis
  - 支持优先级和重试
  - 异步任务处理

#### Added - Security & Monitoring

- **JWT Authentication**
  - Token 签名和验证
  - 30 天默认过期时间
  - 支持 API Key 认证

- **Prometheus Metrics**
  - 默认系统指标（CPU, 内存）
  - HTTP 请求指标
  - 浏览器池状态指标
  - 任务执行指标

#### Added - Deployment

- **Docker Support**
  - 多架构镜像（AMD64 + ARM64）
  - Debian Bookworm 基础镜像
  - 非 root 用户执行
  - 健康检查配置

- **Docker Compose**
  - 完整部署配置
  - Redis 集成
  - Prometheus 监控

#### Added - Documentation

- 完整的 API 文档（Swagger/OpenAPI）
- Docker 部署指南
- 测试指南
- 队列系统文档

#### Added - Testing

- 单元测试（Jest）
- 集成测试
- E2E 测试
- 测试覆盖率报告

---

## Links

- **Homepage:** https://browser.autos
- **GitHub:** https://github.com/browser-autos/browser-autos
- **Docker Hub:** https://hub.docker.com/r/browserautos/browser-autos
- **Issues:** https://github.com/browser-autos/browser-autos/issues

---

**Note:** For the full list of changes, please refer to the [commit history](https://github.com/browser-autos/browser-autos/commits/main).
