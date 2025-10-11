#!/bin/bash

# 批量为 API 路由添加认证保护的脚本

set -e

echo "开始为 API 路由添加认证保护..."

# Content API
echo "更新 Content API..."
cat > /tmp/content.imports.txt << 'EOF'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { contentService } from '../../services/content.service';
import { ContentRequest } from '../../types';
import { moduleLogger } from '../../utils/logger';
import { auth, requirePermission } from '../../middleware/auth.middleware';
import { config } from '../../config';
EOF

# Scrape API
echo "更新 Scrape API..."
cat > /tmp/scrape.imports.txt << 'EOF'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { scrapeService } from '../../services/scrape.service';
import { ScrapeRequest } from '../../types';
import { moduleLogger } from '../../utils/logger';
import { auth, requirePermission } from '../../middleware/auth.middleware';
import { config } from '../../config';
EOF

# Session API
echo "更新 Session API..."
cat > /tmp/session.imports.txt << 'EOF'
import { FastifyInstance } from 'fastify';
import { sessionManager } from '../../core/session/SessionManager';
import { moduleLogger } from '../../utils/logger';
import { auth } from '../../middleware/auth.middleware';
import { config } from '../../config';
EOF

# Queue API
echo "更新 Queue API..."
cat > /tmp/queue.imports.txt << 'EOF'
import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { queueManager } from '../../core/queue';
import { TaskType, TaskPriority } from '../../types/queue.types';
import { moduleLogger } from '../../utils/logger';
import { auth, requirePermission } from '../../middleware/auth.middleware';
import { config } from '../../config';
EOF

echo "✅ 认证导入文件已生成"
echo "📝 接下来需要手动更新每个路由的 server.post/get/delete 调用，添加 preHandler"
