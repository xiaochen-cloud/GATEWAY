#!/bin/bash
# WSL 下安装 Docker 并启动 Redis、PostgreSQL
set -e

echo "=== 1. 更新并安装 Docker 依赖 ==="
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

echo "=== 2. 添加 Docker 官方 GPG 并安装 Docker ==="
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "=== 3. 启动 Docker 服务 ==="
sudo service docker start

echo "=== 4. 拉取并运行 Redis (端口 6379) ==="
sudo docker run -d --name redis -p 6379:6379 --restart unless-stopped redis:latest

echo "=== 5. 拉取并运行 PostgreSQL (端口 5432) ==="
# 密码可改为你的环境变量或 .env 中的值
sudo docker run -d --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:latest

echo ""
echo "=== 完成 ==="
echo "Redis:    localhost:6379 (无密码)"
echo "PostgreSQL: localhost:5432  user=postgres  password=postgres  db=postgres"
echo ""
echo "常用命令:"
echo "  查看容器: docker ps"
echo "  停止 Redis: docker stop redis"
echo "  停止 PostgreSQL: docker stop postgres"
echo "  启动: docker start redis postgres"
