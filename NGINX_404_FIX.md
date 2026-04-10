# Nginx 404 错误快速修复指南

## 问题现象

访问 `https://egfjp.com/api/stocks/hot` 返回 404 错误。

## 快速诊断步骤

### 步骤1: 在服务器上运行诊断脚本

```bash
cd /path/to/usastockai
chmod +x diagnose_nginx.sh
./diagnose_nginx.sh
```

### 步骤2: 手动检查关键点

```bash
# 1. 检查后端服务是否正常运行
curl http://localhost:8000/health

# 2. 检查后端API是否正常
curl http://localhost:8000/api/stocks/hot

# 3. 检查nginx配置
sudo nginx -t

# 4. 查看nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

## 最可能的原因和解决方案

### 原因1: Nginx配置文件位置错误

**症状:** nginx配置测试通过，但API仍然404

**检查方法:**
```bash
# 查看nginx主配置文件
sudo nginx -T | grep -A 30 "server_name.*egfjp.com"
```

**解决方案:**

1. 创建正确的nginx配置文件:

```bash
sudo nano /etc/nginx/sites-available/egfjp
```

2. 粘贴以下配置:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name egfjp.com www.egfjp.com;
    
    # 后端 API - 必须在 location / 之前
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
    
    # 健康检查
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
    
    # 前端
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

3. 启用配置:

```bash
# 创建符号链接
sudo ln -sf /etc/nginx/sites-available/egfjp /etc/nginx/sites-enabled/

# 删除默认配置（可选，如果有冲突）
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重载nginx
sudo nginx -s reload
```

### 原因2: Docker端口映射问题

**症状:** localhost:8000 无法访问

**检查方法:**
```bash
# 检查Docker容器状态
docker-compose ps

# 检查端口监听
sudo netstat -tlnp | grep :8000
```

**解决方案:**

1. 确认docker-compose.yml中的端口映射:

```yaml
services:
  backend:
    ports:
      - "8000:8000"  # 必须映射到宿主机
```

2. 重启Docker服务:

```bash
docker-compose down
docker-compose up -d
```

### 原因3: 后端服务未启动

**症状:** 容器状态显示 unhealthy 或 exited

**解决方案:**

```bash
# 查看后端日志
docker-compose logs backend

# 重启后端
docker-compose restart backend

# 如果失败，重建容器
docker-compose up -d --force-recreate backend
```

### 原因4: Nginx location 顺序错误

**症状:** API请求被前端处理，返回前端404页面

**解决方案:** 

确保nginx配置中 `location /api/` 在 `location /` 之前定义。

## 验证修复

修复后，依次测试:

```bash
# 1. 测试后端直接访问
curl http://localhost:8000/api/stocks/hot

# 2. 测试nginx代理
curl http://egfjp.com/api/stocks/hot

# 3. 测试HTTPS
curl https://egfjp.com/api/stocks/hot
```

## HTTPS配置（如果使用HTTPS）

如果您的域名使用了HTTPS，需要额外配置:

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name egfjp.com www.egfjp.com;
    
    ssl_certificate /etc/letsencrypt/live/egfjp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/egfjp.com/privkey.pem;
    
    # ... 其他配置同上 ...
}

# HTTP重定向到HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name egfjp.com www.egfjp.com;
    return 301 https://$server_name$request_uri;
}
```

## 完整的配置示例

参考项目中的 `nginx.conf.example` 文件，里面包含了HTTP和HTTPS的完整配置示例。

## 需要帮助？

如果以上步骤都无法解决问题，请提供以下信息:

1. 诊断脚本的输出
2. 后端日志: `docker-compose logs backend | tail -50`
3. Nginx配置: `sudo nginx -T | grep -A 30 "server_name"`
4. Nginx错误日志: `sudo tail -50 /var/log/nginx/error.log`

这些信息将帮助快速定位问题。
