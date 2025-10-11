# Browser.autos 凭据管理指南

## 📋 概述

Browser.autos 使用**环境变量配置的凭据系统**，完全避免硬编码，支持灵活定制。

## 🔑 默认凭据

### 开箱即用的凭据

如果不设置任何环境变量，系统使用以下品牌化的默认凭据：

**管理员账户：**
- 用户名：`browserautos`
- 密码：`browser.autos`
- 邮箱：`admin@browser.autos`
- 角色：`admin`

**API 用户账户：**
- 用户名：`api-user`
- 密码：`browser.autos`
- 邮箱：`api@browser.autos`
- 角色：`user`

### 为什么选择这些默认值？

1. ✅ **品牌一致性** - 与 browser.autos 品牌名称一致
2. ✅ **易于记忆** - 简单直观的命名
3. ✅ **专业性** - 符合行业惯例的凭据格式
4. ✅ **可配置** - 生产环境可轻松覆盖

## 🚀 快速开始

### 方式 1：使用默认凭据（开发环境）

```bash
# 1. 启动容器（使用默认凭据）
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  -e DEFAULT_ADMIN_USERNAME=browserautos \
  -e DEFAULT_ADMIN_PASSWORD=browser.autos \
  --shm-size=2gb \
  browserautos/browser-autos:latest

# 2. 查看日志确认凭据
docker logs browser-autos | grep "Default credentials"

# 输出:
# 🔑 Default credentials (configure via environment variables)
#     adminUsername: "browserautos"
#     adminPassword: "browser.autos"
#     apiUsername: "api-user"
#     apiPassword: "browser.autos"

# 3. 获取访问令牌
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "browserautos", "password": "browser.autos"}' \
  | jq -r '.data.accessToken')

echo "Token: $TOKEN"

# 4. 使用令牌调用 API
curl -X POST http://localhost:3001/screenshot \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  -o screenshot.png
```

### 方式 2：自定义凭据（生产环境）

```bash
# 1. 启动容器（自定义凭据）
docker run -d \
  --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=your-production-secret \
  -e DEFAULT_ADMIN_USERNAME=mycompany_admin \
  -e DEFAULT_ADMIN_PASSWORD='SecureP@ssw0rd!123' \
  -e DEFAULT_ADMIN_EMAIL=admin@mycompany.com \
  -e DEFAULT_API_USERNAME=api_service \
  -e DEFAULT_API_PASSWORD='ApiP@ssw0rd!456' \
  -e DEFAULT_API_EMAIL=api@mycompany.com \
  --shm-size=2gb \
  browserautos/browser-autos:latest

# 2. 使用自定义凭据登录
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "mycompany_admin", "password": "SecureP@ssw0rd!123"}' \
  | jq -r '.data.accessToken')
```

### 方式 3：使用快速脚本（推荐）

我们提供了一个便捷脚本来快速获取 token：

```bash
# 使用默认凭据
./scripts/get-token.sh

# 使用自定义凭据
./scripts/get-token.sh mycompany_admin 'SecureP@ssw0rd!123'

# 输出：
# ================================================
#   Browser.autos - Getting Access Token
# ================================================
#
# API URL:  http://localhost:3001
# Username: browserautos
#
# ✓ Login successful!
#
# Access Token:
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Export to environment:
#   export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
#
# ✓ Token saved to: /tmp/browser-autos-token.txt
```

## 🔧 环境变量配置

### 完整环境变量列表

```bash
# ========================================
# 认证相关
# ========================================
JWT_SECRET=your-secret-key                      # 必需：JWT 签名密钥
TOKEN_EXPIRY=30d                                 # 可选：Token 过期时间（默认 30 天）
REQUIRE_AUTH=true                                # 可选：是否要求认证（默认 true）

# ========================================
# 默认管理员凭据
# ========================================
DEFAULT_ADMIN_USERNAME=browserautos              # 默认：browserautos
DEFAULT_ADMIN_PASSWORD=browser.autos             # 默认：browser.autos
DEFAULT_ADMIN_EMAIL=admin@browser.autos          # 默认：admin@browser.autos

# ========================================
# 默认 API 用户凭据
# ========================================
DEFAULT_API_USERNAME=api-user                    # 默认：api-user
DEFAULT_API_PASSWORD=browser.autos               # 默认：browser.autos
DEFAULT_API_EMAIL=api@browser.autos              # 默认：api@browser.autos
```

### Docker Compose 示例

```yaml
version: '3.8'

services:
  browser-autos:
    image: browserautos/browser-autos:latest
    ports:
      - "3001:3001"
    environment:
      # 必需配置
      - JWT_SECRET=${JWT_SECRET}

      # 自定义管理员凭据（生产环境强烈推荐）
      - DEFAULT_ADMIN_USERNAME=${ADMIN_USERNAME}
      - DEFAULT_ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - DEFAULT_ADMIN_EMAIL=${ADMIN_EMAIL}

      # 自定义 API 用户凭据
      - DEFAULT_API_USERNAME=${API_USERNAME}
      - DEFAULT_API_PASSWORD=${API_PASSWORD}
      - DEFAULT_API_EMAIL=${API_EMAIL}

      # 可选配置
      - REQUIRE_AUTH=true
      - TOKEN_EXPIRY=30d
    shm_size: '2gb'
    mem_limit: 4g
    restart: unless-stopped
```

对应的 `.env` 文件：

```bash
# .env
JWT_SECRET=your-production-secret-change-this

# 管理员凭据
ADMIN_USERNAME=mycompany_admin
ADMIN_PASSWORD=SecureP@ssw0rd!123
ADMIN_EMAIL=admin@mycompany.com

# API 用户凭据
API_USERNAME=api_service
API_PASSWORD=ApiP@ssw0rd!456
API_EMAIL=api@mycompany.com
```

## 📝 最佳实践

### 🔒 生产环境

1. **强制设置自定义凭据**
   ```bash
   # ❌ 不推荐：使用默认凭据
   -e DEFAULT_ADMIN_PASSWORD=browser.autos

   # ✅ 推荐：使用强密码
   -e DEFAULT_ADMIN_PASSWORD='MyStr0ng!P@ssw0rd#2025'
   ```

2. **使用 Docker Secrets 或环境变量**
   ```bash
   # 从文件读取敏感信息
   docker run -d \
     --env-file /secure/browser-autos.env \
     browserautos/browser-autos:latest
   ```

3. **定期轮换凭据**
   - 建议每 90 天更换一次密码
   - 重启容器时使用新的环境变量

4. **限制访问**
   - 仅在内网暴露 API 端口
   - 使用反向代理（Nginx, Traefik）添加额外的安全层

### 🧪 开发/测试环境

1. **使用默认凭据快速启动**
   ```bash
   docker run -d -p 3001:3001 \
     -e JWT_SECRET=dev-secret \
     -e DEFAULT_ADMIN_USERNAME=browserautos \
     -e DEFAULT_ADMIN_PASSWORD=browser.autos \
     --shm-size=2gb \
     browserautos/browser-autos:latest
   ```

2. **禁用认证（仅限本地开发）**
   ```bash
   docker run -d -p 3001:3001 \
     -e JWT_SECRET=dev-secret \
     -e REQUIRE_AUTH=false \
     --shm-size=2gb \
     browserautos/browser-autos:latest
   ```

   ⚠️ **警告：** 禁用认证会暴露所有 API，切勿在生产环境使用！

## 🆘 故障排查

### 问题 1：忘记了自定义密码

**解决方案：**
```bash
# 1. 查看容器环境变量
docker exec browser-autos env | grep DEFAULT_ADMIN

# 2. 或者重新启动容器并重新设置凭据
docker stop browser-autos
docker rm browser-autos

# 3. 使用新凭据启动
docker run -d --name browser-autos \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret \
  -e DEFAULT_ADMIN_PASSWORD=new-password \
  --shm-size=2gb \
  browserautos/browser-autos:latest
```

### 问题 2：登录失败 401 Unauthorized

**可能原因：**
1. 凭据输入错误
2. 环境变量未正确设置
3. 容器未重启应用新凭据

**排查步骤：**
```bash
# 1. 检查日志中的默认凭据
docker logs browser-autos | grep "Default credentials"

# 2. 验证登录请求
curl -v -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "browserautos", "password": "browser.autos"}'

# 3. 检查环境变量
docker exec browser-autos env | grep DEFAULT
```

### 问题 3：Token 过期

**解决方案：**
```bash
# 1. 调整 Token 过期时间
docker run -d \
  -e TOKEN_EXPIRY=7d \  # 7 天过期
  ...

# 2. 或重新获取 Token
./scripts/get-token.sh
```

## 📚 相关文档

- [API 认证文档](./API_AUTH.md)
- [Docker 部署指南](./DOCKER_DEPLOYMENT.md)
- [安全最佳实践](./SECURITY_BEST_PRACTICES.md)

## 🔐 安全建议

1. ✅ **生产环境必须使用强密码**
2. ✅ **使用 HTTPS/TLS 加密传输**
3. ✅ **启用 REQUIRE_AUTH=true**
4. ✅ **定期轮换 JWT_SECRET**
5. ✅ **使用防火墙限制访问**
6. ✅ **监控登录失败次数**
7. ❌ **切勿在日志中打印生产凭据**（仅开发环境）

---

**最后更新：** 2025-10-11
**维护者：** Browser.autos Team
