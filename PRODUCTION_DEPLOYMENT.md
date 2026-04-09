# 生产环境部署指南

本文档提供详细的生产环境部署说明，确保系统安全、稳定、高性能运行。

## 📋 部署前检查清单

### 1. 服务器要求

- **操作系统**: Linux (Ubuntu 20.04+ 或 CentOS 7+)
- **内存**: 至少 4GB RAM
- **CPU**: 至少 2 核
- **存储**: 至少 20GB 可用空间
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

### 2. 域名和网络

- ✅ 已注册域名
- ✅ DNS 已解析到服务器 IP
- ✅ 防火墙已开放 80 和 443 端口
- ✅ 服务器可访问外网（用于拉取镜像）

### 3. 安全准备

- ✅ SSH 密钥认证已配置
- ✅ root 登录已禁用
- ✅ 防火墙已配置（ufw 或 iptables）
- ✅ 系统已更新到最新版本

## 🚀 部署步骤

### 步骤 1: 克隆代码

```bash
# 创建应用目录
mkdir -p /opt/stockai
cd /opt/stockai

# 克隆仓库
git clone https://github.com/linhaiwebs/usastockai.git .
git checkout feature/stock-ai-diagnostic-system
```

### 步骤 2: 配置环境变量

```bash
# 复制生产环境配置模板
cp .env.production .env

# 编辑配置文件
nano .env
```

**必须修改的配置项**:

```bash
# 数据库密码（强密码）
DB_PASSWORD=YourSecurePassword123!@#

# SiliconFlow API Key
SILICONFLOW_API_KEY=sk-your-api-key-here

# 后端 API 地址（您的域名）
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# 默认语言
DEFAULT_LOCALE=en
```

### 步骤 3: 配置 SSL 证书

#### 方式一：使用 Let's Encrypt（推荐）

```bash
# 安装 Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# 证书路径
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

#### 方式二：使用自定义证书

将证书文件放置到：
- `/opt/stockai/ssl/cert.pem`
- `/opt/stockai/ssl/key.pem`

### 步骤 4: 配置 Nginx 反向代理

```bash
# 安装 Nginx
sudo apt install nginx

# 创建配置文件
sudo nano /etc/nginx/sites-available/stockai
```

**Nginx 配置内容**:

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# 前端 HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com;
    
    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 前端代理
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}

# 后端 API HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.yourdomain.com;
    
    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # API 代理
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # SSE 支持（AI 分析流式响应）
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        chunked_transfer_encoding on;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/stockai /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 步骤 5: 启动服务

```bash
# 进入项目目录
cd /opt/stockai

# 拉取最新镜像
docker-compose -f docker-compose.prod.yml pull

# 构建并启动服务
docker-compose -f docker-compose.prod.yml up -d --build

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

### 步骤 6: 验证部署

```bash
# 检查服务状态
docker-compose -f docker-compose.prod.yml ps

# 检查健康状态
curl http://localhost:8000/health
curl http://localhost:3000

# 检查日志
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
```

## 🔒 安全加固

### 1. 防火墙配置

```bash
# 使用 UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 或使用 iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

### 2. 数据库安全

```bash
# 不要暴露数据库端口到外网
# 在 docker-compose.prod.yml 中已注释掉 DB_PORT

# 使用强密码
DB_PASSWORD=$(openssl rand -base64 32)

# 定期备份
pg_dump -U stockai stockai > backup_$(date +%Y%m%d).sql
```

### 3. 定期更新

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 更新 Docker 镜像
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 监控和日志

### 1. 日志管理

生产环境已配置日志轮转：
- 最大文件大小：10MB
- 保留文件数：3 个
- 自动清理旧日志

```bash
# 查看日志
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 2. 性能监控

```bash
# 查看资源使用
docker stats

# 查看容器状态
docker-compose -f docker-compose.prod.yml ps
```

### 3. 健康检查

所有服务都配置了健康检查：
- Frontend: 每 30 秒检查一次
- Backend: 每 30 秒检查一次
- Database: 每 10 秒检查一次
- Redis: 每 10 秒检查一次
- Finance Query: 每 30 秒检查一次

## 🔄 维护操作

### 更新代码

```bash
cd /opt/stockai
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

### 重启服务

```bash
# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 重启单个服务
docker-compose -f docker-compose.prod.yml restart backend
```

### 备份数据

```bash
# 备份数据库
docker-compose -f docker-compose.prod.yml exec db pg_dump -U stockai stockai > backup_$(date +%Y%m%d).sql

# 备份 Redis
docker-compose -f docker-compose.prod.yml exec redis redis-cli BGSAVE
docker cp stockai-redis:/data/dump.rdb redis_backup_$(date +%Y%m%d).rdb
```

### 恢复数据

```bash
# 恢复数据库
cat backup_20240101.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U stockai stockai

# 恢复 Redis
docker cp redis_backup_20240101.rdb stockai-redis:/data/dump.rdb
docker-compose -f docker-compose.prod.yml restart redis
```

## 🆘 故障排除

### 问题 1: 服务无法启动

```bash
# 检查日志
docker-compose -f docker-compose.prod.yml logs

# 检查端口占用
sudo netstat -tulpn | grep LISTEN

# 检查资源
df -h  # 磁盘
free -m  # 内存
```

### 问题 2: 数据库连接失败

```bash
# 检查数据库状态
docker-compose -f docker-compose.prod.yml ps db

# 检查数据库日志
docker-compose -f docker-compose.prod.yml logs db

# 测试连接
docker-compose -f docker-compose.prod.yml exec db psql -U stockai -d stockai
```

### 问题 3: SSL 证书过期

```bash
# 自动续期（Let's Encrypt）
sudo certbot renew

# 重启 Nginx
sudo systemctl restart nginx
```

## 📞 技术支持

- **GitHub**: https://github.com/linhaiwebs/usastockai
- **文档**: 查看 README.md 和其他文档文件
- **问题反馈**: GitHub Issues

## 🎯 性能优化建议

1. **启用 HTTP/2**: 已在 Nginx 配置中启用
2. **启用 Gzip 压缩**: Nginx 自动处理
3. **启用浏览器缓存**: 配置适当的缓存头
4. **CDN 加速**: 建议使用 CloudFlare 等 CDN 服务
5. **数据库优化**: 定期执行 VACUUM 和 ANALYZE
6. **Redis 优化**: 已配置内存限制和淘汰策略

## ✅ 部署完成检查

- [ ] 所有服务正常运行
- [ ] HTTPS 证书有效
- [ ] 前端页面可访问
- [ ] API 接口可访问
- [ ] 数据库连接正常
- [ ] Redis 连接正常
- [ ] 日志正常记录
- [ ] 监控配置完成
- [ ] 备份计划设置
- [ ] 防火墙配置正确

完成以上检查后，您的生产环境部署就完成了！🎉
