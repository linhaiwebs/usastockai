# 1Panel 部署配置指南

## 1Panel 简介

1Panel是一个现代化的Linux服务器运维管理面板，提供了可视化的网站和Docker管理功能。

## 部署步骤

### 第一步：在1Panel中部署Docker容器

#### 方法1：使用1Panel的应用商店

1. 登录1Panel管理面板
2. 进入 **容器** → **编排**
3. 点击 **创建编排**
4. 上传或粘贴 `docker-compose.yml` 文件内容
5. 点击 **部署**

#### 方法2：使用命令行（推荐）

```bash
# SSH连接到服务器
cd /opt/1panel/apps  # 或您选择的项目目录

# 上传项目文件
# 创建docker-compose.yml和.env文件

# 启动容器
docker-compose up -d
```

### 第二步：在1Panel中创建网站

1. 登录1Panel管理面板
2. 进入 **网站** → **网站列表**
3. 点击 **创建网站**
4. 选择 **反向代理**
5. 填写以下信息：
   - **域名：** `egfjp.com`（您的域名）
   - **代理地址：** `http://127.0.0.1:3000`（前端地址）
   - **启用HTTPS：** 根据需要选择

### 第三步：配置反向代理（关键步骤）

在1Panel中配置API反向代理有两种方法：

#### 方法A：使用1Panel可视化界面（推荐）

1. 进入 **网站** → 找到您的网站 → 点击 **设置**
2. 选择 **反向代理** 标签
3. 点击 **添加反向代理**
4. 填写配置：
   - **代理目录：** `/api`
   - **目标URL：** `http://127.0.0.1:8000`
   - **启用WebSocket：** ✅ 开启
   - **启用SSE：** ✅ 开启（重要！用于AI流式响应）

5. 添加额外的反向代理（可选）：
   - **代理目录：** `/health`
   - **目标URL：** `http://127.0.0.1:8000`

#### 方法B：手动编辑Nginx配置

1. 进入 **网站** → 找到您的网站 → 点击 **设置**
2. 选择 **配置文件** 标签
3. 在现有的 `server` 块中，**在 `location /` 之前**添加以下配置：

```nginx
# 后端 API 代理
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
    
    # SSE 支持（AI分析流式响应）
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
```

4. 点击 **保存**
5. 点击 **重载配置**

### 第四步：配置HTTPS（可选但推荐）

1. 在网站设置中，选择 **HTTPS** 标签
2. 点击 **申请证书**
3. 选择 **Let's Encrypt**
4. 填写邮箱并验证域名
5. 申请成功后，**强制HTTPS**选项

### 第五步：验证配置

1. 检查容器状态：
   - 进入 **容器** → **容器列表**
   - 确认 `frontend` 和 `backend` 容器都在运行

2. 测试API：
```bash
# SSH到服务器
curl http://localhost:8000/health
curl http://localhost:8000/api/stocks/hot

# 测试通过nginx代理
curl http://egfjp.com/api/stocks/hot
curl https://egfjp.com/api/stocks/hot
```

## 常见问题排查

### 问题1：API返回404

**原因：** 反向代理配置未生效

**解决方案：**
1. 检查网站配置中是否添加了 `/api/` 的反向代理
2. 确保 `/api/` 配置在 `/` 配置之前
3. 重载nginx配置

### 问题2：无法连接到后端

**原因：** Docker容器未正常运行或端口映射错误

**解决方案：**
1. 进入 **容器** → **容器列表**，检查容器状态
2. 点击容器名称，查看日志
3. 确认端口映射：`0.0.0.0:8000->8000/tcp`

### 问题3：SSE流式响应中断

**原因：** nginx缓冲未关闭

**解决方案：**
在反向代理配置中添加：
```nginx
proxy_buffering off;
proxy_read_timeout 86400s;
proxy_send_timeout 86400s;
chunked_transfer_encoding on;
```

### 问题4：WebSocket连接失败

**原因：** WebSocket升级头未设置

**解决方案：**
在反向代理配置中添加：
```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
```

## 1Panel配置示例

### 完整的网站配置文件

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name egfjp.com www.egfjp.com;
    
    # SSL证书（由1Panel自动管理）
    ssl_certificate /opt/1panel/ssl/egfjp.com/fullchain.pem;
    ssl_certificate_key /opt/1panel/ssl/egfjp.com/privkey.pem;
    
    # 后端 API 代理
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

## 1Panel快速配置清单

- [ ] 上传docker-compose.yml到服务器
- [ ] 创建.env文件并配置环境变量
- [ ] 启动Docker容器
- [ ] 在1Panel中创建反向代理网站
- [ ] 配置 `/api/` 反向代理到后端
- [ ] 配置 `/health` 反向代理到后端（可选）
- [ ] 申请并配置SSL证书
- [ ] 测试API访问
- [ ] 测试前端访问

## 验证配置成功的标志

1. ✅ 容器状态：两个容器都在运行
2. ✅ API测试：`curl https://egfjp.com/api/stocks/hot` 返回JSON数据
3. ✅ 前端测试：访问 `https://egfjp.com` 能看到页面
4. ✅ 健康检查：`curl https://egfjp.com/health` 返回 `{"status": "healthy"}`
5. ✅ 浏览器控制台：没有404错误

## 获取帮助

如果按照以上步骤仍无法解决，请提供：

1. 容器日志截图（1Panel → 容器 → 容器详情 → 日志）
2. 网站配置文件（1Panel → 网站 → 设置 → 配置文件）
3. Nginx错误日志（1Panel → 容器 → OpenResty → 日志）
4. 具体的错误信息截图
