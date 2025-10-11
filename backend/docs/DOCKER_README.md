# Browser.autos Docker 部署指南

## 快速开始

### 开发环境

```bash
# 1. 启动 Redis（开发环境）
docker-compose up -d redis

# 2. 运行开发服务器（本地）
npm install
npm run dev
```

### 生产环境

```bash
# 1. 复制环境变量文件
cp .env.production.example .env.production

# 2. 修改 .env.production
# 特别注意修改以下内容：
#   - JWT_SECRET: 设置为强随机字符串
#   - REDIS_PASSWORD: 设置 Redis 密码
#   - GRAFANA_ADMIN_PASSWORD: 设置 Grafana 管理员密码

# 3. 构建并启动所有服务
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 4. 查看日志
docker-compose -f docker-compose.prod.yml logs -f api

# 5. 检查服务状态
docker-compose -f docker-compose.prod.yml ps
```

## 服务说明

### API 服务
- **端口**: 3001
- **健康检查**: http://localhost:3001/health
- **Metrics**: http://localhost:3001/metrics

### Redis
- **端口**: 6379
- **用途**: 任务队列和缓存

### Prometheus
- **端口**: 9090
- **UI**: http://localhost:9090

### Grafana
- **端口**: 3000
- **UI**: http://localhost:3000
- **默认账号**: admin / admin

## Docker 命令

### 构建镜像

```bash
# 构建 API 镜像
docker build -t browser-autos-api:latest .

# 构建时指定平台（如需跨平台）
docker build --platform linux/amd64 -t browser-autos-api:latest .
```

### 运行容器

```bash
# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 启动特定服务
docker-compose -f docker-compose.prod.yml up -d api redis

# 停止所有服务
docker-compose -f docker-compose.prod.yml down

# 停止并删除卷
docker-compose -f docker-compose.prod.yml down -v
```

### 查看日志

```bash
# 查看所有日志
docker-compose -f docker-compose.prod.yml logs

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs api

# 实时跟踪日志
docker-compose -f docker-compose.prod.yml logs -f api
```

### 执行命令

```bash
# 进入 API 容器
docker-compose -f docker-compose.prod.yml exec api sh

# 进入 Redis 容器
docker-compose -f docker-compose.prod.yml exec redis sh

# 执行 Redis 命令
docker-compose -f docker-compose.prod.yml exec redis redis-cli
```

## 镜像优化

### 多阶段构建

Dockerfile 使用多阶段构建来优化镜像大小：

1. **Builder Stage**: 安装依赖并构建 TypeScript
2. **Production Stage**: 仅复制必要的文件和生产依赖

### 镜像大小对比

- 未优化: ~1.5GB
- 优化后: ~500MB

## 资源限制

### API 容器默认限制

- **CPU Limit**: 2 cores
- **Memory Limit**: 2GB
- **CPU Reservation**: 0.5 cores
- **Memory Reservation**: 512MB

可以通过环境变量调整：

```env
API_CPU_LIMIT=4
API_MEMORY_LIMIT=4G
API_CPU_RESERVATION=1
API_MEMORY_RESERVATION=1G
```

## 健康检查

### API 健康检查

- **间隔**: 30s
- **超时**: 10s
- **启动期**: 40s
- **重试次数**: 3

### Redis 健康检查

- **间隔**: 10s
- **超时**: 3s
- **重试次数**: 3

## 持久化数据

### 数据卷

- `redis-data`: Redis 持久化数据
- `prometheus-data`: Prometheus 指标数据
- `grafana-data`: Grafana 配置和仪表板

### 备份数据

```bash
# 备份 Redis 数据
docker-compose -f docker-compose.prod.yml exec redis redis-cli SAVE
docker cp browser-autos-redis:/data/dump.rdb ./backup/

# 备份 Prometheus 数据
docker run --rm -v browser-autos_prometheus-data:/data -v $(pwd)/backup:/backup alpine tar czf /backup/prometheus-backup.tar.gz /data

# 备份 Grafana 数据
docker run --rm -v browser-autos_grafana-data:/data -v $(pwd)/backup:/backup alpine tar czf /backup/grafana-backup.tar.gz /data
```

## 生产环境建议

### 安全性

1. **修改默认密码**
   - JWT_SECRET
   - REDIS_PASSWORD
   - GRAFANA_ADMIN_PASSWORD

2. **使用反向代理**
   ```bash
   # 使用 Nginx 或 Traefik
   # 配置 HTTPS
   # 添加请求限制
   ```

3. **限制网络访问**
   ```yaml
   # 仅暴露必要端口
   # 使用 Docker 内部网络
   # 配置防火墙规则
   ```

### 监控

1. **设置告警规则**
   - CPU 使用率 > 80%
   - 内存使用率 > 85%
   - 队列任务失败率 > 10%

2. **配置 Grafana 仪表板**
   - API 性能监控
   - 浏览器池状态
   - 队列任务统计

### 日志管理

1. **日志驱动配置**
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

2. **集中日志收集**
   - 使用 ELK Stack
   - 或 Loki + Grafana

### 自动扩展

1. **水平扩展**
   ```bash
   # 增加 API 实例
   docker-compose -f docker-compose.prod.yml up -d --scale api=3
   ```

2. **负载均衡**
   - 使用 Nginx
   - 或 HAProxy
   - 或 Traefik

## 故障排除

### API 容器启动失败

```bash
# 检查日志
docker-compose -f docker-compose.prod.yml logs api

# 常见问题：
# 1. Redis 连接失败 - 检查 REDIS_URL
# 2. 端口被占用 - 修改 PORT 配置
# 3. Chrome 启动失败 - 检查系统依赖
```

### Redis 连接问题

```bash
# 测试 Redis 连接
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping

# 检查密码
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a <password> ping
```

### 内存不足

```bash
# 查看容器资源使用
docker stats

# 增加资源限制
# 修改 .env.production 中的:
# API_MEMORY_LIMIT=4G
```

## 更新部署

### 更新代码

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker-compose -f docker-compose.prod.yml build api

# 3. 重启服务（零停机）
docker-compose -f docker-compose.prod.yml up -d --no-deps api
```

### 更新配置

```bash
# 1. 修改 .env.production

# 2. 重新创建容器
docker-compose -f docker-compose.prod.yml up -d --force-recreate api
```

## 性能调优

### Chrome 优化

```env
# 减少浏览器资源占用
BROWSER_POOL_MAX=5
MAX_MEMORY_PER_BROWSER=256
MAX_CPU_PER_BROWSER=30
```

### 队列优化

```env
# 调整并发数
QUEUE_MAX_CONCURRENT=10

# 减少超时时间
QUEUE_TIMEOUT=60000
```

### 会话优化

```env
# 减少会话超时
SESSION_TIMEOUT=180000

# 减少最大持续时间
MAX_SESSION_DURATION=1800000
```

## 支持

如有问题，请查看：
- GitHub Issues
- 文档: CLAUDE.MD
- 日志: `docker-compose logs`
