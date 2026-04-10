# Nginx 反向代理 404 错误诊断和修复指南

## 问题描述

访问 `https://egfjp.com/api/stocks/hot` 返回 404 错误。

## 可能的原因

1. 后端服务没有正常运行
2. Nginx 配置不正确
3. 端口映射问题
4. Docker 网络配置问题

## 诊断步骤

### 1. 检查后端服务状态

```bash
# 检查 Docker 容器是否运行
docker-compose ps

# 查看后端日志
docker-compose logs backend

# 检查后端健康状态
curl http://localhost:8000/health
```

### 2. 检查端口监听

```bash
# 检查 8000 端口是否被监听
sudo netstat -tlnp | grep :8000

# 或者使用 ss 命令
sudo ss -tlnp | grep :8000
```

### 3. 测试后端直接访问

```bash
# 测试后端 API（绕过 nginx）
curl http://localhost:8000/api/stocks/hot

# 如果上面失败，尝试使用 Docker 内部网络
docker exec -it stockai-frontend-1 curl http://backend:8000/api/stocks/hot
```

### 4. 检查 Nginx 配置

```bash
# 测试 nginx 配置语法
sudo nginx -t

# 查看 nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 查看 nginx 访问日志
sudo tail -f /var/log/nginx/access.log
```

## 修复方案

### 方案一：确认后端服务运行正常

```bash
# 重启所有服务
docker-compose restart

# 查看服务状态
docker-compose ps

# 确保后端健康检查通过
docker-compose logs backend | grep "healthy"
```

### 方案二：修正 Nginx 配置

创建正确的 nginx 配置文件：

```nginx
# /etc/nginx/sites-available/egfjp
server {
    listen 80;
    listen [::]:80;
    server_name egfjp.com www.egfjp.com;
    
    # 后端 API - 必须在 / 之前匹配
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # SSE 支持
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        chunked_transfer_encoding on;
    }
    
    # 健康检查端点
    location = /health {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    # API 文档（可选）
    location ~ ^/(docs|redoc)$ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    # 前端 - 其他所有路径
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 方案三：检查 Docker Compose 配置

确保 `docker-compose.yml` 中的端口映射正确：

```yaml
services:
  frontend:
    ports:
      - "3000:3000"  # 映射到宿主机
    # ...
  
  backend:
    ports:
      - "8000:8000"  # 映射到宿主机
    # ...
```

### 方案四：应用正确的 Nginx 配置

```bash
# 1. 创建 nginx 配置
sudo nano /etc/nginx/sites-available/egfjp

# 2. 创建符号链接
sudo ln -sf /etc/nginx/sites-available/egfjp /etc/nginx/sites-enabled/

# 3. 删除默认配置（可选）
sudo rm -f /etc/nginx/sites-enabled/default

# 4. 测试配置
sudo nginx -t

# 5. 重载 nginx
sudo nginx -s reload
```

## 快速诊断脚本

创建一个诊断脚本来快速定位问题：

```bash
#!/bin/bash
# 保存为 diagnose.sh

echo "=== 1. 检查 Docker 容器状态 ==="
docker-compose ps

echo -e "\n=== 2. 检查端口监听 ==="
sudo netstat -tlnp | grep -E ':(3000|8000)'

echo -e "\n=== 3. 测试后端健康检查 ==="
curl -s http://localhost:8000/health || echo "后端健康检查失败"

echo -e "\n=== 4. 测试后端 API ==="
curl -s http://localhost:8000/api/stocks/hot | head -c 200

echo -e "\n=== 5. 测试前端 ==="
curl -s http://localhost:3000 | head -c 200

echo -e "\n=== 6. 查看 Nginx 配置 ==="
sudo nginx -T 2>&1 | grep -A 20 "server_name egfjp.com"

echo -e "\n=== 7. 最近 Nginx 错误日志 ==="
sudo tail -20 /var/log/nginx/error.log

echo -e "\n=== 诊断完成 ==="
```

运行诊断：
```bash
chmod +x diagnose.sh
./diagnose.sh
```

## 常见问题和解决方案

### 问题1：后端服务未启动

**症状：** `curl http://localhost:8000/health` 无响应

**解决：**
```bash
# 查看后端日志
docker-compose logs backend

# 重启后端
docker-compose restart backend

# 如果还是失败，重建容器
docker-compose up -d --force-recreate backend
```

### 问题2：端口冲突

**症状：** 端口已被占用

**解决：**
```bash
# 查看占用端口的进程
sudo lsof -i :8000

# 修改 docker-compose.yml 使用不同端口
# 然后相应修改 nginx 配置
```

### 问题3：Nginx 配置顺序错误

**症状：** API 请求被前端处理

**解决：** 确保 `location /api/` 在 `location /` 之前定义

### 问题4：防火墙问题

**症状：** 本地可以访问，远程无法访问

**解决：**
```bash
# 检查防火墙规则
sudo ufw status

# 开放端口（如果需要）
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## 验证修复

修复后，按顺序测试：

```bash
# 1. 测试后端直接访问
curl http://localhost:8000/health
curl http://localhost:8000/api/stocks/hot

# 2. 测试 nginx 代理
curl http://egfjp.com/health
curl http://egfjp.com/api/stocks/hot

# 3. 在浏览器中测试
# 访问 https://egfjp.com
# 打开开发者工具查看网络请求
```

## 需要提供的诊断信息

如果以上步骤都无法解决问题，请提供：

1. Docker 容器状态：`docker-compose ps`
2. 后端日志：`docker-compose logs backend | tail -50`
3. Nginx 配置：`sudo nginx -T | grep -A 30 "server_name egfjp.com"`
4. Nginx 错误日志：`sudo tail -50 /var/log/nginx/error.log`
5. 端口监听状态：`sudo netstat -tlnp | grep -E ':(3000|8000)'`

这些信息将帮助快速定位问题。
