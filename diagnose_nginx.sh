#!/bin/bash
# Nginx 404 问题诊断脚本
# 使用方法：chmod +x diagnose_nginx.sh && ./diagnose_nginx.sh

echo "================================"
echo "Nginx 404 问题诊断"
echo "================================"

echo -e "\n【1】检查 Docker 容器状态"
echo "--------------------------------"
docker-compose ps

echo -e "\n【2】检查端口监听"
echo "--------------------------------"
echo "检查 3000 端口（前端）："
sudo netstat -tlnp | grep :3000 || echo "❌ 3000 端口未监听"
echo "检查 8000 端口（后端）："
sudo netstat -tlnp | grep :8000 || echo "❌ 8000 端口未监听"

echo -e "\n【3】测试后端直接访问（绕过 nginx）"
echo "--------------------------------"
echo "测试健康检查："
curl -s http://localhost:8000/health && echo " ✅" || echo " ❌ 失败"

echo "测试 API 端点："
curl -s http://localhost:8000/api/stocks/hot | head -c 200 && echo " ✅" || echo " ❌ 失败"

echo -e "\n【4】测试前端直接访问"
echo "--------------------------------"
curl -s http://localhost:3000 | head -c 200 && echo " ✅" || echo " ❌ 失败"

echo -e "\n【5】检查 Nginx 配置"
echo "--------------------------------"
echo "测试 nginx 配置语法："
sudo nginx -t

echo -e "\n查找域名配置："
sudo nginx -T 2>&1 | grep -A 30 "server_name.*egfjp.com" | head -40

echo -e "\n【6】查看最近的 Nginx 错误日志"
echo "--------------------------------"
sudo tail -20 /var/log/nginx/error.log 2>/dev/null || echo "无法读取日志"

echo -e "\n【7】查看后端日志"
echo "--------------------------------"
docker-compose logs --tail=20 backend

echo -e "\n================================"
echo "诊断完成"
echo "================================"
echo -e "\n请将以上输出发送给技术支持进行分析。"
