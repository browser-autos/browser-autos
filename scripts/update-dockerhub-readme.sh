#!/bin/bash

# ================================================================================
# Docker Hub README 更新脚本
# ================================================================================
# 自动将本地 README 上传到 Docker Hub 仓库
#
# 使用方法:
#   ./scripts/update-dockerhub-readme.sh
#
# 环境变量:
#   DOCKERHUB_USERNAME - Docker Hub 用户名
#   DOCKERHUB_PASSWORD - Docker Hub 密码（或 Access Token）
#   DOCKERHUB_REPOSITORY - 仓库名称（例如：browser-autos）
# ================================================================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
README_FILE="${README_FILE:-./DOCKER_HUB_README.md}"
DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-}"
DOCKERHUB_PASSWORD="${DOCKERHUB_PASSWORD:-}"
DOCKERHUB_REPOSITORY="${DOCKERHUB_REPOSITORY:-browser-autos}"

# 检查必需的环境变量
if [ -z "$DOCKERHUB_USERNAME" ]; then
  echo -e "${RED}错误: DOCKERHUB_USERNAME 环境变量未设置${NC}"
  echo "使用方法: DOCKERHUB_USERNAME=username DOCKERHUB_PASSWORD=password $0"
  exit 1
fi

if [ -z "$DOCKERHUB_PASSWORD" ]; then
  echo -e "${RED}错误: DOCKERHUB_PASSWORD 环境变量未设置${NC}"
  echo "提示: 推荐使用 Access Token 而不是密码"
  echo "获取 Token: https://hub.docker.com/settings/security"
  exit 1
fi

# 检查 README 文件
if [ ! -f "$README_FILE" ]; then
  echo -e "${RED}错误: README 文件不存在: $README_FILE${NC}"
  exit 1
fi

echo -e "${GREEN}=== Docker Hub README 更新工具 ===${NC}"
echo "仓库: $DOCKERHUB_USERNAME/$DOCKERHUB_REPOSITORY"
echo "README: $README_FILE"
echo ""

# 获取 JWT Token
echo -e "${YELLOW}[1/3] 登录 Docker Hub...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST \
  https://hub.docker.com/v2/users/login/ \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$DOCKERHUB_USERNAME\", \"password\": \"$DOCKERHUB_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}错误: 登录失败${NC}"
  echo "响应: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ 登录成功${NC}"

# 读取 README 内容并转义为 JSON
echo -e "${YELLOW}[2/3] 准备 README 内容...${NC}"
README_CONTENT=$(cat "$README_FILE" | jq -Rs .)

# 构建请求体
REQUEST_BODY=$(jq -n \
  --arg full_description "$README_CONTENT" \
  '{full_description: $full_description}')

# 更新仓库 README
echo -e "${YELLOW}[3/3] 上传 README 到 Docker Hub...${NC}"
UPDATE_RESPONSE=$(curl -s -X PATCH \
  "https://hub.docker.com/v2/repositories/$DOCKERHUB_USERNAME/$DOCKERHUB_REPOSITORY/" \
  -H "Authorization: JWT $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_BODY")

# 检查是否成功
if echo "$UPDATE_RESPONSE" | grep -q "full_description"; then
  echo -e "${GREEN}✓ README 更新成功!${NC}"
  echo ""
  echo "查看仓库: https://hub.docker.com/r/$DOCKERHUB_USERNAME/$DOCKERHUB_REPOSITORY"
else
  echo -e "${RED}错误: README 更新失败${NC}"
  echo "响应: $UPDATE_RESPONSE"
  exit 1
fi
