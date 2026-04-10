# 后端 Dockerfile - Python FastAPI
FROM python:3.11-slim as builder

WORKDIR /app

# 安装编译依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# 运行阶段
FROM python:3.11-slim

WORKDIR /app

# 安装 curl 用于健康检查
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖
COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

# 暴露端口 (默认 8000，可通过 PORT 环境变量覆盖)
EXPOSE ${PORT:-8000}

# 使用启动脚本支持动态端口
RUN chmod +x start.sh
CMD ["./start.sh"]
