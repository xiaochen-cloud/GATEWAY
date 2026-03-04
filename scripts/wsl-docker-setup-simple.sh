#!/bin/bash
# WSL 下安装 Docker (apt docker.io) 并启动 Redis、PostgreSQL
set -e

echo "=== 1. 更新并安装 Docker ==="
sudo apt-get update
sudo apt-get install -y docker.io

echo "=== 2. 启动 Docker 服务 ==="
sudo service docker start

echo "=== 3. 拉取并运行 Redis (端口 6379) ==="
sudo docker run -d --name redis -p 6379:6379 --restart unless-stopped redis:latest

echo "=== 4. 拉取并运行 PostgreSQL (端口 5432) ==="
sudo docker run -d --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:latest

echo ""
echo "=== 完成 ==="
echo "Redis:       localhost:6379 (无密码)"
echo "PostgreSQL:  localhost:5432  user=postgres  password=postgres  db=postgres"
echo ""
echo "常用: docker ps | docker stop redis postgres | docker start redis postgres"
