# 快速部署指南

## 📋 前置要求

- Docker 和 Docker Compose 已安装
- 域名已解析到服务器（生产环境）
- SiliconFlow API Key

## 🚀 快速开始

### 1. 配置环境变量

```bash
# 复制配置模板
cp .env.example .env

# 编辑配置文件
nano .env
```

**必须配置**：
```bash
# SiliconFlow API Key
SILICONFLOW_API_KEY=your_api_key_here

# 后端 API 地址（生产环境改为您的域名）
NEXT_PUBLIC_API_URL=http://localhost:8000  # 开发环境
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com  # 生产环境
```

**可选配置**：
```bash
# 前端端口（默认 3000）
FRONTEND_PORT=3000

# 默认语言（默认英语）
DEFAULT_LOCALE=en  # 或 ja
```

### 2. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

### 3. 访问应用

- **前端**: http://localhost:3000
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

## 🌐 生产环境部署（使用 Nginx）

### 架构说明

```
用户
 ↓
Nginx (反向代理)
 ├─→ yourdomain.com      → Frontend (3000)
 └─→ api.yourdomain.com  → Backend (8000)
```

### 1. 配置环境变量

```bash
# .env 文件
SILICONFLOW_API_KEY=your_api_key_here
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 2. Nginx 配置示例

```nginx
# /etc/nginx/sites-available/stockai

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# 后端 API
server {
    listen 80;
    server_name api.yourdomain.com;
    
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
    }
}
```

### 3. 启用配置

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/stockai /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 4. SSL 配置（推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

## 🔧 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend

# 更新代码并重启
git pull && docker-compose up -d --build

# 进入容器
docker-compose exec backend sh
```

## 🔒 安全建议

1. **使用强密码**: 修改数据库密码
   ```bash
   # .env
   DB_PASSWORD=your_strong_password_here
   ```

2. **配置防火墙**: 只开放必要端口
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

3. **启用 HTTPS**: 使用 Let's Encrypt 免费证书

4. **定期备份**: 备份数据库数据
   ```bash
   docker-compose exec db pg_dump -U stockai stockai > backup.sql
   ```

## 📊 端口说明

| 服务 | 容器端口 | 宿主机端口 | 说明 |
|------|---------|-----------|------|
| Frontend | 3000 | 可自定义 (FRONTEND_PORT) | 前端应用 |
| Backend | 8000 | 8000 (固定) | 后端 API |
| DB | 5432 | 不暴露 | PostgreSQL（内部访问） |
| Finance Query | 8000 | 不暴露 | 股票数据服务（内部访问） |
| Redis | 6379 | 不暴露 | 缓存服务（内部访问） |

## 🆘 故障排除

### 前端无法连接后端

**问题**: 前端页面正常，但无法加载数据

**解决**:
1. 检查 `NEXT_PUBLIC_API_URL` 配置是否正确
2. 确认后端服务正常: `curl http://localhost:8000/health`
3. 检查浏览器控制台错误信息

### 服务无法启动

```bash
# 查看日志
docker-compose logs

# 重新构建
docker-compose down
docker-compose up -d --build
```

### 数据库连接失败

```bash
# 检查数据库状态
docker-compose ps db

# 查看数据库日志
docker-compose logs db
```

## 📞 技术支持

- **GitHub**: https://github.com/linhaiwebs/usastockai
- **问题反馈**: GitHub Issues

## ✅ 部署检查清单

- [ ] Docker 和 Docker Compose 已安装
- [ ] .env 文件已配置
- [ ] SILICONFLOW_API_KEY 已填写
- [ ] NEXT_PUBLIC_API_URL 已正确设置
- [ ] 服务成功启动 (`docker-compose ps`)
- [ ] 前端页面可访问
- [ ] API 接口可访问
- [ ] （生产环境）Nginx 已配置
- [ ] （生产环境）SSL 证书已配置

完成以上检查后，您的系统就可以正常运行了！🎉
