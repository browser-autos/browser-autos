# Docker Hub 快速上手指南 ⚡

**目标**: 5 分钟内将镜像和 README 发布到 Docker Hub

---

## 📋 准备清单

- [ ] Docker Hub 账号
- [ ] Docker Hub Access Token
- [ ] 本地镜像已构建

---

## 🚀 三步发布

### Step 1: 获取 Access Token (2分钟)

1. 访问 https://hub.docker.com/settings/security
2. 点击 **"New Access Token"**
3. 名称：`browser-autos`
4. 权限：**Read, Write, Delete**
5. 复制 Token（例如：`dckr_pat_xxxxxxxxxxxxx`）

### Step 2: 登录并推送镜像 (2分钟)

```bash
# 登录（粘贴 Access Token 作为密码）
docker login -u your-username

# 标记镜像
docker tag browser-autos:latest your-username/browser-autos:latest

# 推送
docker push your-username/browser-autos:latest
```

### Step 3: 上传 README (1分钟)

**选择一种方法：**

#### 方法 A: 网页操作（最简单）

1. 访问 https://hub.docker.com/r/your-username/browser-autos
2. 点击 **"Description"** 标签
3. 粘贴 `DOCKER_HUB_README.md` 内容
4. 点击 **"Update"**

#### 方法 B: 自动化脚本（推荐）

```bash
# 配置
export DOCKERHUB_USERNAME="your-username"
export DOCKERHUB_PASSWORD="dckr_pat_xxxxxxxxxxxxx"

# 运行脚本
cd backend
./scripts/update-dockerhub-readme.sh
```

---

## ✅ 验证

访问你的仓库：
```
https://hub.docker.com/r/your-username/browser-autos
```

应该看到：
- ✅ 镜像已上传
- ✅ README 已显示
- ✅ Tags 列表正确

---

## 🎯 完整命令速查

```bash
# 1. 登录
docker login -u your-username

# 2. 标记多个版本
docker tag browser-autos:latest your-username/browser-autos:latest
docker tag browser-autos:latest your-username/browser-autos:1.0.0
docker tag browser-autos:latest your-username/browser-autos:debian

# 3. 推送所有标签
docker push --all-tags your-username/browser-autos

# 4. 更新 README
export DOCKERHUB_USERNAME="your-username"
export DOCKERHUB_PASSWORD="your-token"
cd backend && ./scripts/update-dockerhub-readme.sh
```

---

## 🤖 自动化（可选）

### GitHub Actions 自动发布

1. **添加 Secrets**：
   - 仓库 Settings → Secrets → Actions
   - 添加 `DOCKERHUB_USERNAME` 和 `DOCKERHUB_TOKEN`

2. **创建 Git Tag**：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **自动构建**：GitHub Actions 自动推送镜像和 README

---

## 📚 详细文档

- 📖 [完整指南](./DOCKER_HUB_GUIDE.md) - 所有方法的详细说明
- 🐳 [Docker Hub README](./DOCKER_HUB_README.md) - 发布到 Hub 的内容
- ⚙️ [更新脚本](./scripts/update-dockerhub-readme.sh) - 自动化工具

---

## 🆘 常见问题

**Q: 推送失败 "denied: requested access"**
```bash
# 重新登录
docker logout
docker login -u your-username
```

**Q: README 脚本失败 "401"**
```bash
# 检查 Token 权限，需要包含 "Write"
# 重新生成：https://hub.docker.com/settings/security
```

**Q: 如何更新 README？**
```bash
# 编辑 DOCKER_HUB_README.md 后重新运行脚本
./scripts/update-dockerhub-readme.sh
```

---

## 🎉 完成！

你的 Docker 镜像现在可以被全世界使用了：

```bash
docker pull your-username/browser-autos:latest
```

---

**需要帮助？** 查看 [完整指南](./DOCKER_HUB_GUIDE.md)
