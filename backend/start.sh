#!/bin/bash
# 后端启动脚本 - 支持动态端口配置

# 默认端口
PORT=${PORT:-8000}
HOST=${HOST:-0.0.0.0}

echo "Starting backend server on $HOST:$PORT"

# 启动 uvicorn
exec uvicorn app.main:app --host "$HOST" --port "$PORT"
