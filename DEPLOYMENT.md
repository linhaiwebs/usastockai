# 部署指南

本文档介绍如何将项目部署到生产环境。

## 部署方式

项目支持两种部署方式：

### 方式一：同域名部署（推荐）

前后端使用同一个域名，通过 nginx 反向代理的路径区分。

**优点：**
- 无跨域问题
- 配置简单
- 只需要一个域名和一张 SSL 证书
- 更安全（API 不直接暴露）

**架构：**
```
yourdomain.com           → 前端 (Next.js on port 3000)
yourdomain.com/api/*     → 后端 (FastAPI on port 8000)
yourdomain.com/docs      → API 文档
yourdomain.com/health    → 健康检查
```

**nginx 配置：**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # 后端 API - 优先匹配 /api/ 路径
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE 支持（AI 分析流式响应）
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        chunked_transfer_encoding on;
    }
    
    # 后端文档和健康检查
    location ~ ^/(docs|redoc|health)$ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    # 前端 - 其他所有路径
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**环境变量配置：**
```bash
# .env 文件
SILICONFLOW_API_KEY=your_api_key_here

# 不设置 NEXT_PUBLIC_API_URL，前端自动使用相对路径
```

### 方式二：跨域部署

前后端使用不同的域名。

**架构：**
```
yourdomain.com       → 前端 (Next.js on port 3000)
api.yourdomain.com   → 后端 (FastAPI on port 8000)
```

**nginx 配置：**
```nginx
# 前端
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}

# 后端
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        
        # SSE 支持
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

**环境变量配置：**
```bash
# .env 文件
SILICONFLOW_API_KEY=your_api_key_here
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 部署步骤

### 1. 准备服务器

确保服务器已安装：
- Docker
- Docker Compose
- nginx（可选，用于反向代理）

### 2. 克隆项目

```bash
git clone <your-repo-url>
cd usastockai
```

### 3. 配置环境变量

```bash
cp .env.example .env
nano .env
```

编辑 `.env` 文件，至少设置：
- `SILICONFLOW_API_KEY`：你的 AI API 密钥
- `NEXT_PUBLIC_API_URL`：根据部署方式决定是否设置

### 4. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 5. 配置 nginx 反向代理

将 `nginx.conf.example` 中的配置复制到你的 nginx 配置中：

```bash
# 复制配置（根据你的部署方式选择）
sudo cp nginx.conf.example /etc/nginx/sites-available/stockai
sudo ln -s /etc/nginx/sites-available/stockai /etc/nginx/sites-enabled/

# 修改域名
sudo nano /etc/nginx/sites-enabled/stockai
# 将 yourdomain.com 替换为你的实际域名

# 测试配置
sudo nginx -t

# 重载 nginx
sudo nginx -s reload
```

### 6. 配置 HTTPS（推荐）

使用 Let's Encrypt 免费证书：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com
# 如果使用跨域部署，还需要：
# sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

## 验证部署

### 检查服务状态

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f frontend
docker-compose logs -f backend
```

### 测试访问

```bash
# 测试前端
curl http://yourdomain.com

# 测试后端健康检查
curl http://yourdomain.com/health

# 测试 API（同域名部署）
curl http://yourdomain.com/api/stocks/hot

# 测试 API（跨域部署）
curl http://api.yourdomain.com/api/stocks/hot
```

## 常见问题

### 1. 前端无法访问后端 API

**同域名部署：**
- 检查 nginx 配置是否正确代理 `/api/` 路径
- 确保没有设置 `NEXT_PUBLIC_API_URL` 环境变量

**跨域部署：**
- 检查 `NEXT_PUBLIC_API_URL` 是否设置正确
- 检查后端 CORS 配置（已在代码中配置为允许所有来源）
- 检查 nginx 是否正确代理后端域名

### 2. SSE 流式响应中断

确保 nginx 配置包含以下设置：
```nginx
proxy_buffering off;
proxy_read_timeout 86400s;
proxy_send_timeout 86400s;
chunked_transfer_encoding on;
```

### 3. WebSocket 连接失败

确保 nginx 配置包含 WebSocket 升级头：
```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
```

## 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 清理旧镜像
docker image prune -f
```

## 备份和恢复

### 备份数据库

```bash
# 创建备份
docker exec stockai-db-1 pg_dump -U stockai stockai > backup_$(date +%Y%m%d).sql

# 恢复备份
cat backup_20240101.sql | docker exec -i stockai-db-1 psql -U stockai stockai
```

## 监控和日志

### 查看实时日志

```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 日志持久化

日志已配置为自动轮转。如需自定义日志配置，可修改 `docker-compose.yml` 中的日志驱动设置。

## 安全建议

1. **使用 HTTPS**：生产环境务必启用 HTTPS
2. **修改默认密码**：修改数据库密码
3. **限制端口访问**：使用防火墙限制直接访问容器端口
4. **定期备份**：定期备份数据库
5. **监控日志**：定期检查异常访问日志
