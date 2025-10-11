# Browser.autos - 部署指南

## 快速开始

### 1. 环境准备

确保已安装以下软件：
- Docker 20.10+
- Docker Compose 2.0+

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，修改以下配置：
# - JWT_SECRET: 改为随机强密码（必须修改）
# - GRAFANA_PASSWORD: Grafana 管理员密码
# - NEXT_PUBLIC_API_URL: 生产环境请改为实际域名
```

### 3. 一键启动

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 访问服务

启动成功后，可访问以下服务：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:3000 | Web 界面和 API Playground |
| 后端 API | http://localhost:3001 | REST API 服务 |
| API 文档 | http://localhost:3001/docs | Swagger 文档 |
| Prometheus | http://localhost:9090 | 监控指标查询 |
| Grafana | http://localhost:3002 | 可视化仪表板（默认密码：admin） |
| Redis | localhost:6379 | 任务队列 |

## 服务说明

### 1. Redis (任务队列)
- 持久化存储任务数据
- 自动健康检查
- 数据卷：`redis-data`

### 2. API (后端服务)
- 基于 Fastify 的高性能 API
- 内置浏览器池管理
- 支持 Screenshot、PDF、Content、Scrape 等功能
- 资源限制：4GB 内存，2 核 CPU

### 3. Frontend (前端应用)
- Next.js 14 应用
- 交互式 API Playground
- 多语言支持（中文/英文）
- 资源限制：1GB 内存，1 核 CPU

### 4. Prometheus (监控)
- 收集系统和业务指标
- 配置文件：`backend/prometheus.yml`
- 数据卷：`prometheus-data`

### 5. Grafana (可视化)
- 监控仪表板
- 首次登录：admin / `${GRAFANA_PASSWORD}`
- 数据卷：`grafana-data`

## 常用命令

### 查看服务状态
```bash
docker-compose ps
```

### 查看实时日志
```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker-compose logs -f api
docker-compose logs -f frontend
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart api
```

### 停止服务
```bash
# 停止但保留数据
docker-compose stop

# 停止并删除容器（保留数据卷）
docker-compose down

# 停止并删除所有数据
docker-compose down -v
```

### 更新服务
```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

## 健康检查

所有服务都配置了健康检查：

```bash
# 查看健康状态
docker-compose ps

# 手动检查 API
curl http://localhost:3001/health

# 手动检查前端
curl http://localhost:3000/
```

## 性能调优

### 浏览器池配置

编辑 `docker-compose.yml` 中的环境变量：

```yaml
environment:
  - BROWSER_POOL_MIN=2          # 最小实例数
  - BROWSER_POOL_MAX=10         # 最大实例数
  - BROWSER_MAX_AGE=3600000     # 实例最大存活时间（毫秒）
```

### 队列配置

```yaml
environment:
  - QUEUE_MAX_CONCURRENT=5      # 最大并发任务数
  - QUEUE_TIMEOUT=120000        # 任务超时时间（毫秒）
  - QUEUE_RETRIES=3             # 失败重试次数
```

### 资源限制

根据服务器配置调整资源限制：

```yaml
deploy:
  resources:
    limits:
      memory: 4G
      cpus: '2.0'
    reservations:
      memory: 2G
      cpus: '1.0'
```

## 生产环境配置

### 1. 安全配置

**必须修改的配置：**
```env
# .env 文件
JWT_SECRET=<使用强随机字符串>
GRAFANA_PASSWORD=<强密码>
```

**CORS 配置：**
```yaml
# docker-compose.yml
environment:
  - CORS_ORIGIN=https://your-domain.com  # 改为实际域名
  - CORS_CREDENTIALS=true
```

### 2. 域名配置

如果使用域名，需要配置：

```env
# .env 文件
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### 3. HTTPS 配置

推荐使用 Nginx 反向代理 + Let's Encrypt：

```nginx
# /etc/nginx/sites-available/browser-autos
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. 防火墙配置

仅开放必要端口：
```bash
# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 可选：允许直接访问监控服务（不推荐公网暴露）
# sudo ufw allow 9090/tcp  # Prometheus
# sudo ufw allow 3002/tcp  # Grafana
```

## 监控告警

### Grafana 配置

1. 访问 http://localhost:3002
2. 登录（admin / `${GRAFANA_PASSWORD}`）
3. 添加 Prometheus 数据源：
   - URL: `http://prometheus:9090`
   - Access: Server (default)
4. 导入仪表板或创建自定义面板

### 关键指标

- `browser_pool_size`: 浏览器池大小
- `browser_pool_idle`: 空闲浏览器数
- `task_queue_size`: 队列长度
- `task_duration_seconds`: 任务执行时间
- `api_request_duration_seconds`: API 响应时间
- `api_requests_total`: API 请求总数

## 故障排查

### 服务无法启动

1. 检查端口占用：
```bash
lsof -i :3000  # 前端
lsof -i :3001  # API
lsof -i :6379  # Redis
```

2. 查看详细日志：
```bash
docker-compose logs api
```

3. 检查磁盘空间：
```bash
df -h
```

### API 无响应

1. 检查健康状态：
```bash
curl http://localhost:3001/health
```

2. 检查 Redis 连接：
```bash
docker-compose exec redis redis-cli ping
```

3. 重启 API 服务：
```bash
docker-compose restart api
```

### 浏览器启动失败

1. 检查共享内存：
```bash
docker-compose exec api df -h /dev/shm
```

2. 增加共享内存（如果需要）：
```yaml
# docker-compose.yml
shm_size: '2gb'
```

### 内存不足

1. 查看资源使用：
```bash
docker stats
```

2. 降低浏览器池大小：
```yaml
environment:
  - BROWSER_POOL_MAX=5  # 从 10 降至 5
```

3. 限制并发任务：
```yaml
environment:
  - QUEUE_MAX_CONCURRENT=3  # 从 5 降至 3
```

## 备份与恢复

### 备份数据

```bash
# 备份 Redis 数据
docker-compose exec redis redis-cli SAVE
docker cp browser-autos-redis:/data/dump.rdb ./backup/

# 备份 Grafana 配置
docker cp browser-autos-grafana:/var/lib/grafana ./backup/grafana-data

# 备份 Prometheus 数据
docker cp browser-autos-prometheus:/prometheus ./backup/prometheus-data
```

### 恢复数据

```bash
# 停止服务
docker-compose down

# 恢复 Redis
docker cp ./backup/dump.rdb browser-autos-redis:/data/

# 恢复 Grafana
docker cp ./backup/grafana-data/. browser-autos-grafana:/var/lib/grafana

# 恢复 Prometheus
docker cp ./backup/prometheus-data/. browser-autos-prometheus:/prometheus

# 启动服务
docker-compose up -d
```

## 升级指南

### 版本升级

```bash
# 1. 备份数据（见上文）

# 2. 拉取最新代码
git pull origin main

# 3. 停止服务
docker-compose down

# 4. 重新构建
docker-compose build --no-cache

# 5. 启动服务
docker-compose up -d

# 6. 验证服务
docker-compose ps
curl http://localhost:3001/health
```

### 回滚版本

```bash
# 切换到旧版本
git checkout <previous-commit>

# 重新构建并启动
docker-compose down
docker-compose up -d --build
```

## API 使用示例

### 截图 API

```bash
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "fullPage": true}' \
  --output screenshot.png
```

### PDF API

```bash
curl -X POST http://localhost:3001/pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "format": "A4"}' \
  --output document.pdf
```

### 内容提取 API

```bash
curl -X POST http://localhost:3001/content \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "includeMetadata": true}'
```

## 获取帮助

- GitHub Issues: https://github.com/your-org/browser.autos/issues
- API 文档: http://localhost:3001/docs
- 项目文档: [README.md](./README.md)

## 许可证

MIT License - 详见 [LICENSE](./LICENSE)
