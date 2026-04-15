# USA Stock AI Diagnostic System

AI驱动的美股诊断系统，支持智能分析和谷歌统计集成。

## 快速开始

### 1. 环境配置

```bash
# 复制环境配置文件
cp .env.example .env

# 编辑配置文件
nano .env
```

**必需配置：**
- `SILICONFLOW_API_KEY` - SiliconFlow AI API密钥

**多项目部署配置：**
- `PROJECT_NAME` - 项目名称（默认：stockai）
- `NETWORK_NAME` - 网络名称（默认：stockai-network）
- `BACKEND_PORT` - 后端端口（默认：8000）
- `FRONTEND_PORT` - 前端端口（默认：3000）

### 2. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 3. 访问应用

- 前端：http://localhost:3000
- 后端API：http://localhost:8000/docs
- 管理后台：http://localhost:3000/adsadmin

## Nginx反向代理配置

### 同域名部署（推荐）

前端：`yourdomain.com`
后端：`yourdomain.com/api/`

Nginx配置：
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # 后端API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE支持
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
    
    # 前端
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 谷歌统计配置

### 配置字段

1. **Google Ads Tracking ID** - Google Ads转化跟踪ID（如：AW-17303658824）
2. **GA4 Property ID** - GA4媒体资源ID（如：G-BDPP2WPMQR）
3. **Conversion ID** - 完整转化ID（如：AW-17303658824/KrXGCNHaoZQcEMjCg7tA）

### 配置步骤

1. 访问管理后台：`https://yourdomain.com/adsadmin`
2. 登录后选择"谷歌统计"标签
3. 填写三个配置字段
4. 启用并保存

### 事件追踪

- **Start AI Diagnosis按钮**会自动触发 `gtag('event', 'Bdd')` 事件
- 转化函数 `gtag_report_conversion(url)` 自动注入到页面

## 多项目部署

在同一服务器部署多个项目时，修改以下配置：

```bash
# 项目2配置
PROJECT_NAME=stockai2
NETWORK_NAME=stockai2-network
BACKEND_PORT=8001
FRONTEND_PORT=3001
DB_NAME=stockai2
```

### 端口说明

**必须修改的端口（会冲突）：**
- `BACKEND_PORT` - 后端API端口（默认8000）
- `FRONTEND_PORT` - 前端页面端口（默认3000）

**不需要修改的端口（自动隔离）：**
- Redis端口 - 默认不暴露，在Docker网络内部隔离
- PostgreSQL端口 - 默认不暴露，在Docker网络内部隔离

**可选：外部访问Redis/PostgreSQL**

如果需要从宿主机访问Redis或PostgreSQL（如调试、监控），在.env中添加：

```bash
# 项目1
REDIS_PORT=6379
DB_PORT=5432

# 项目2
REDIS_PORT=6380
DB_PORT=5433
```

**注意：** 不配置这些端口时，Redis和PostgreSQL完全隔离，不会冲突。

## 技术栈

- **前端**：Next.js 14, React, TypeScript, TailwindCSS
- **后端**：FastAPI, Python 3.11
- **数据库**：PostgreSQL 15
- **缓存**：Redis 7
- **容器**：Docker, Docker Compose

## 许可证

MIT License
