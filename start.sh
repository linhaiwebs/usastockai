#!/bin/bash

# 股票AI诊断系统 - 快速启动脚本

echo "🚀 启动股票AI诊断系统..."
echo ""

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件"
    echo "📝 正在从 .env.example 创建 .env ..."
    cp .env.example .env
    echo ""
    echo "⚠️  请编辑 .env 文件，填入您的 SILICONFLOW_API_KEY"
    echo "   获取 API Key: https://siliconflow.cn/"
    echo ""
    read -p "按 Enter 继续（请确保已配置 SILICONFLOW_API_KEY）..."
fi

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 未安装 Docker，请先安装 Docker"
    echo "   安装指南: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 未安装 Docker Compose，请先安装"
    echo "   安装指南: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 停止旧容器
echo "🧹 清理旧容器..."
docker-compose down 2>/dev/null

# 构建并启动
echo "🏗️  构建并启动服务..."
docker-compose up -d --build

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo ""
echo "📊 服务状态:"
docker-compose ps

echo ""
echo "✅ 启动完成!"
echo ""
echo "🌐 访问地址:"
echo "   前端: http://localhost:3000"
echo "   后端 API 文档: http://localhost:8000/docs"
echo "   健康检查: http://localhost:8000/health"
echo ""
echo "📝 查看日志: docker-compose logs -f"
echo "🛑 停止服务: docker-compose down"
echo ""
