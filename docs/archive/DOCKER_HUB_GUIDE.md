# Docker Hub 发布指南

本指南介绍如何将 Browser.autos 镜像发布到 Docker Hub 并更新 README。

---

## 📋 目录

1. [准备工作](#准备工作)
2. [创建 Docker Hub 仓库](#创建-docker-hub-仓库)
3. [上传 README（3种方法）](#上传-readme)
4. [推送镜像](#推送镜像)
5. [自动化 CI/CD](#自动化-cicd)

---

## 准备工作

### 1. 注册 Docker Hub 账号

访问 https://hub.docker.com/ 注册账号。

### 2. 获取 Access Token（推荐）

**为什么使用 Token？**
- ✅ 更安全（可随时撤销）
- ✅ 支持细粒度权限
- ✅ 不会暴露密码

**获取步骤：**
1. 登录 Docker Hub
2. 访问 https://hub.docker.com/settings/security
3. 点击 "New Access Token"
4. 输入描述（如：`browser-autos-ci`）
5. 选择权限：**Read, Write, Delete**
6. 复制生成的 Token（只显示一次！）

### 3. 登录 Docker

```bash
# 使用 Access Token 登录（推荐）
docker login -u your-username

# 输入密码时粘贴 Access Token
```

---

## 创建 Docker Hub 仓库

### 方法 1: Web UI

1. 访问 https://hub.docker.com/
2. 点击 "Create Repository"
3. 填写信息：
   - **Name**: `browser-autos`
   - **Description**: Browser Automation API with Playwright
   - **Visibility**: Public 或 Private
4. 点击 "Create"

### 方法 2: 命令行（首次推送自动创建）

```bash
# 标记镜像
docker tag browser-autos:latest your-username/browser-autos:latest

# 推送（自动创建仓库）
docker push your-username/browser-autos:latest
```

---

## 上传 README

我们提供了 **3 种方法**，选择最适合你的：

### 方法 1: Web UI（最简单）⭐

**适合**: 偶尔更新、不需要自动化

**步骤**:
1. 登录 Docker Hub
2. 访问你的仓库页面：`https://hub.docker.com/r/your-username/browser-autos`
3. 点击 "Description" 标签
4. 复制 `DOCKER_HUB_README.md` 的内容
5. 粘贴到编辑器中
6. 点击 "Update" 保存

**优点**: 简单直观，无需工具
**缺点**: 手动操作，无法自动化

---

### 方法 2: 自动化脚本（推荐）⭐⭐⭐

**适合**: 频繁更新、自动化部署

**准备**:

我们已经创建了自动化脚本：`scripts/update-dockerhub-readme.sh`

**使用步骤**:

1. **设置环境变量**:

```bash
export DOCKERHUB_USERNAME="your-username"
export DOCKERHUB_PASSWORD="your-access-token"  # 使用 Access Token
export DOCKERHUB_REPOSITORY="browser-autos"
```

或创建 `.env.dockerhub` 文件：
```bash
# .env.dockerhub
DOCKERHUB_USERNAME=your-username
DOCKERHUB_PASSWORD=dckr_pat_xxxxxxxxxxxxx
DOCKERHUB_REPOSITORY=browser-autos
```

2. **加载环境变量**:
```bash
source .env.dockerhub
```

3. **运行脚本**:
```bash
cd backend
./scripts/update-dockerhub-readme.sh
```

**输出示例**:
```
=== Docker Hub README 更新工具 ===
仓库: your-username/browser-autos
README: ./DOCKER_HUB_README.md

[1/3] 登录 Docker Hub...
✓ 登录成功
[2/3] 准备 README 内容...
[3/3] 上传 README 到 Docker Hub...
✓ README 更新成功!

查看仓库: https://hub.docker.com/r/your-username/browser-autos
```

**优点**:
- ✅ 完全自动化
- ✅ 可集成到 CI/CD
- ✅ 支持批量更新

**缺点**: 需要保存 Access Token

---

### 方法 3: Docker Hub CLI（官方工具）⭐⭐

**适合**: 喜欢官方工具、多个仓库管理

**安装**:

```bash
# macOS
brew install docker/hub-tool/hub-tool

# Linux
curl -fsSL https://github.com/docker/hub-tool/releases/download/v0.4.6/hub-tool-linux-amd64.tar.gz | tar -xz
sudo mv hub-tool /usr/local/bin/

# Windows
# 下载：https://github.com/docker/hub-tool/releases
```

**使用**:

```bash
# 登录
hub-tool login

# 更新 README
hub-tool repo update \
  --description "Browser Automation API" \
  --readme DOCKER_HUB_README.md \
  your-username/browser-autos
```

**优点**: 官方工具，功能丰富
**缺点**: 需要额外安装

---

## 推送镜像

### 1. 标记镜像

```bash
# 替换 your-username 为你的 Docker Hub 用户名
docker tag browser-autos:latest your-username/browser-autos:latest
docker tag browser-autos:latest your-username/browser-autos:1.0.0
docker tag browser-autos:latest your-username/browser-autos:debian
```

### 2. 推送到 Docker Hub

```bash
# 推送所有标签
docker push your-username/browser-autos:latest
docker push your-username/browser-autos:1.0.0
docker push your-username/browser-autos:debian

# 或一次性推送所有
docker push --all-tags your-username/browser-autos
```

### 3. 验证

访问 Docker Hub 查看镜像：
```
https://hub.docker.com/r/your-username/browser-autos/tags
```

---

## 自动化 CI/CD

### GitHub Actions 示例

创建 `.github/workflows/docker-publish.yml`:

```yaml
name: Publish Docker Image

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

env:
  IMAGE_NAME: browser-autos

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ secrets.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=semver,pattern={{major}}
            type=raw,value=latest

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Update Docker Hub README
        uses: peter-evans/dockerhub-description@v4
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
          repository: ${{ secrets.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}
          readme-filepath: ./backend/DOCKER_HUB_README.md
```

### 配置 GitHub Secrets

在 GitHub 仓库中设置以下 Secrets：

1. 访问仓库的 Settings → Secrets and variables → Actions
2. 添加以下 Secrets：
   - `DOCKERHUB_USERNAME`: 你的 Docker Hub 用户名
   - `DOCKERHUB_TOKEN`: Docker Hub Access Token

### 触发构建

```bash
# 创建版本标签
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions 自动构建并推送
```

---

## 📝 完整工作流示例

### 本地开发 → Docker Hub 发布

```bash
# 1. 构建镜像
cd backend
docker build -t browser-autos:latest .

# 2. 测试镜像
docker run -d --name test -p 3001:3001 \
  -e JWT_SECRET=test --shm-size=2gb browser-autos:latest
curl http://localhost:3001/health
docker stop test && docker rm test

# 3. 标记镜像
docker tag browser-autos:latest your-username/browser-autos:latest
docker tag browser-autos:latest your-username/browser-autos:1.0.0

# 4. 推送镜像
docker push your-username/browser-autos:latest
docker push your-username/browser-autos:1.0.0

# 5. 更新 README
export DOCKERHUB_USERNAME="your-username"
export DOCKERHUB_PASSWORD="your-token"
./scripts/update-dockerhub-readme.sh

# 6. 验证
open https://hub.docker.com/r/your-username/browser-autos
```

---

## 🔒 安全最佳实践

### 1. 使用 Access Token

❌ **不要使用密码**:
```bash
docker login -u username -p password  # 不安全！
```

✅ **使用 Access Token**:
```bash
docker login -u username
# 输入 Access Token（而非密码）
```

### 2. 保护 Token

```bash
# .gitignore
.env.dockerhub
.env.production
*.token
```

### 3. CI/CD 中使用 Secrets

```yaml
# GitHub Actions
- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}  # 使用 Secrets
```

### 4. 定期轮换 Token

- 每 3-6 个月更新一次 Access Token
- 如有泄露立即撤销

---

## 📊 监控和维护

### 查看下载统计

访问 Docker Hub 查看：
- Pull 次数
- Star 数量
- 镜像大小
- 安全扫描结果

### 自动化构建（Docker Hub Automated Builds）

连接 GitHub 仓库实现自动构建：
1. Docker Hub 仓库页面 → Builds
2. 连接 GitHub 账号
3. 选择仓库和分支
4. 配置构建规则

---

## 🐛 常见问题

### Q1: 推送失败 "denied: requested access to the resource is denied"

**原因**: 未登录或权限不足

**解决**:
```bash
docker logout
docker login -u your-username
# 输入 Access Token
```

### Q2: README 更新脚本失败 "401 Unauthorized"

**原因**: Token 过期或权限不足

**解决**:
1. 访问 https://hub.docker.com/settings/security
2. 重新生成 Access Token
3. 确保权限包含 "Read, Write"

### Q3: 镜像推送很慢

**解决**:
```bash
# 使用镜像加速器
# ~/.docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn"
  ]
}
```

### Q4: README 中的图片不显示

**原因**: 使用了相对路径

**解决**: 使用绝对 URL
```markdown
# ❌ 错误
![logo](./logo.png)

# ✅ 正确
![logo](https://raw.githubusercontent.com/username/repo/main/logo.png)
```

---

## 📚 相关资源

- [Docker Hub 官方文档](https://docs.docker.com/docker-hub/)
- [Docker Hub API 文档](https://docs.docker.com/docker-hub/api/latest/)
- [GitHub Actions Docker 文档](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images)
- [Docker Hub CLI](https://github.com/docker/hub-tool)

---

## 🎯 快速参考

```bash
# 登录
docker login -u username

# 标记镜像
docker tag local-image:tag username/repo:tag

# 推送镜像
docker push username/repo:tag

# 更新 README（使用我们的脚本）
export DOCKERHUB_USERNAME="username"
export DOCKERHUB_PASSWORD="token"
./scripts/update-dockerhub-readme.sh

# 查看镜像
open https://hub.docker.com/r/username/repo
```

---

**维护者**: Browser.autos Team
**最后更新**: 2025-10-11
