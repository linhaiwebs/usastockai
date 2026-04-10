# 同域名部署更新说明

## 更新概述

本次更新支持前后端使用同一个域名部署，通过 nginx 反向代理的路径区分前后端。

## 主要变更

### 1. nginx 配置 (`nginx.conf.example`)

**新增方案一（推荐）：同域名部署**
- 前端：`yourdomain.com`
- 后端：`yourdomain.com/api/`
- 通过路径区分，无跨域问题

**保留方案二：跨域部署**
- 前端：`yourdomain.com`
- 后端：`api.yourdomain.com`

### 2. 前端配置 (`frontend/src/lib/config.ts`)

更新了 `getApiBase()` 函数：
- **服务器端渲染**：使用内部网络地址 `http://backend:8000`
- **客户端（同域名部署）**：返回空字符串，使用相对路径 `/api/*`
- **客户端（跨域部署）**：使用环境变量 `NEXT_PUBLIC_API_URL`

### 3. Docker Compose 配置 (`docker-compose.yml`)

更新了前端环境变量：
- `NEXT_PUBLIC_API_URL` 默认为空，支持同域名部署
- 添加了详细的注释说明两种部署方式

### 4. 环境变量示例 (`.env.example`)

添加了两种部署方式的说明：
- 方式一：同域名部署（推荐）
- 方式二：跨域部署

### 5. 新增部署指南 (`DEPLOYMENT.md`)

完整的部署文档，包括：
- 两种部署方式的详细说明
- 部署步骤
- nginx 配置
- HTTPS 配置
- 常见问题解决

## 使用方法

### 同域名部署（推荐）

1. **不设置** `NEXT_PUBLIC_API_URL` 环境变量
2. 配置 nginx 反向代理：
   - `/api/*` → 后端
   - `/*` → 前端
3. 前端自动使用相对路径访问后端

**优点：**
- 无跨域问题
- 配置简单
- 只需要一个域名和 SSL 证书

### 跨域部署

1. 设置 `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
2. 配置两个 nginx server block
3. 需要两个域名或子域名

## 兼容性

- 完全向后兼容现有部署
- 现有跨域部署无需修改
- 新部署推荐使用同域名方式

## 测试

部署后可通过以下方式验证：

```bash
# 测试前端
curl https://yourdomain.com

# 测试后端健康检查
curl https://yourdomain.com/health

# 测试 API（同域名部署）
curl https://yourdomain.com/api/stocks/hot
```
