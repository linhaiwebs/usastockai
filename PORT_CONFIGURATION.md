# 自定义端口配置指南

## 问题描述

如果您使用自定义端口映射（如前端在 59877 端口，后端在 51915 端口），需要正确配置 API 地址，否则前端无法连接后端。

## 原因分析

前端代码在**浏览器中执行**，无法访问 Docker 内部网络地址（如 `http://backend:8000`）。必须使用浏览器可访问的外部地址。

## 解决方案

### 方案一：使用环境变量（推荐）

1. 创建或编辑 `.env` 文件：

```bash
# 后端 API 地址（浏览器访问）
# 如果后端映射到 51915 端口
NEXT_PUBLIC_API_URL=http://localhost:51915

# 或者使用服务器IP
# NEXT_PUBLIC_API_URL=http://your-server-ip:51915

# SiliconFlow API Key
SILICONFLOW_API_KEY=your_api_key_here
```

2. 修改 `docker-compose.yml` 端口映射：

```yaml
services:
  frontend:
    ports:
      - "59877:3000"  # 前端映射到 59877
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_API_URL_INTERNAL=http://backend:8000
  
  backend:
    ports:
      - "51915:8000"  # 后端映射到 51915
```

3. 重启服务：

```bash
docker-compose down
docker-compose up -d
```

### 方案二：自动检测（无需配置）

代码已支持自动检测后端地址，逻辑如下：

1. 如果设置了 `NEXT_PUBLIC_API_URL` 环境变量，使用该值
2. 否则，自动构建地址：`http://[当前主机]:8000`

**注意**：自动检测仅在以下情况有效：
- 前端和后端在同一主机
- 后端使用标准 8000 端口（或已配置反向代理）

### 方案三：使用反向代理（生产环境推荐）

使用 Nginx 反向代理，统一入口：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

配置环境变量：

```bash
NEXT_PUBLIC_API_URL=http://yourdomain.com
# 或使用相对路径
NEXT_PUBLIC_API_URL=http://yourdomain.com/api
```

## 验证配置

### 1. 检查后端 API 是否可访问

```bash
# 使用实际的端口
curl http://localhost:51915/health
# 或
curl http://your-server-ip:51915/health
```

应该返回：
```json
{"status":"healthy"}
```

### 2. 检查前端配置

打开浏览器开发者工具（F12），查看控制台：

- ✅ 正确：请求地址为 `http://localhost:51915/api/...`
- ❌ 错误：请求地址为 `http://backend:8000/api/...` 或 `http://localhost:8000/api/...`

### 3. 检查环境变量

```bash
# 进入前端容器
docker-compose exec frontend sh

# 查看环境变量
env | grep NEXT_PUBLIC
```

应该看到：
```
NEXT_PUBLIC_API_URL=http://localhost:51915
```

## 常见问题

### Q1: 前端显示 "Failed to fetch" 错误

**原因**：前端无法连接到后端 API

**解决**：
1. 确认后端正在运行：`docker-compose ps`
2. 测试后端连接：`curl http://localhost:51915/health`
3. 检查环境变量配置：`NEXT_PUBLIC_API_URL`
4. 确认防火墙允许访问

### Q2: 修改端口后仍然使用旧地址

**原因**：环境变量未生效或浏览器缓存

**解决**：
```bash
# 1. 清理并重新构建
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d

# 2. 清除浏览器缓存
# Chrome: Ctrl+Shift+Delete
# 或使用无痕模式测试
```

### Q3: CORS 错误

**症状**：
```
Access to fetch at 'http://localhost:51915/api/search' from origin 'http://localhost:59877' 
has been blocked by CORS policy
```

**解决**：后端已配置允许所有来源，如需限制：

编辑 `backend/app/main.py`：
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:59877",  # 前端地址
        "http://yourdomain.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Q4: 服务器端渲染无法获取数据

**症状**：页面加载时数据为空，刷新后才有数据

**原因**：服务器端无法访问 Docker 内部网络

**解决**：确保配置了 `NEXT_PUBLIC_API_URL_INTERNAL`：

```yaml
environment:
  - NEXT_PUBLIC_API_URL_INTERNAL=http://backend:8000
```

## 配置示例

### 开发环境（本地）

```bash
# .env
NEXT_PUBLIC_API_URL=http://localhost:8000
SILICONFLOW_API_KEY=your_key
```

```yaml
# docker-compose.yml
services:
  frontend:
    ports:
      - "3000:3000"
  backend:
    ports:
      - "8000:8000"
```

### 测试环境（自定义端口）

```bash
# .env
NEXT_PUBLIC_API_URL=http://localhost:51915
SILICONFLOW_API_KEY=your_key
```

```yaml
# docker-compose.yml
services:
  frontend:
    ports:
      - "59877:3000"
  backend:
    ports:
      - "51915:8000"
```

### 生产环境（反向代理）

```bash
# .env
NEXT_PUBLIC_API_URL=https://yourdomain.com
SILICONFLOW_API_KEY=your_key
```

```yaml
# docker-compose.yml
services:
  frontend:
    ports:
      - "3000:3000"
  backend:
    ports:
      - "8000:8000"
```

配合 Nginx 反向代理使用。

## 总结

关键点：
1. ✅ `NEXT_PUBLIC_API_URL` 必须是浏览器可访问的外部地址
2. ✅ 不要使用 Docker 内部网络地址（如 `http://backend:8000`）
3. ✅ 确保端口映射正确
4. ✅ 检查防火墙和网络配置
5. ✅ 生产环境推荐使用反向代理

配置完成后，重启服务即可正常使用！
