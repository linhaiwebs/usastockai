# 多项目部署配置说明

## 快速开始

```bash
# 1. 复制配置文件
cp .env.example .env

# 2. 编辑必需配置
vim .env
# 设置 SILICONFLOW_API_KEY=your_key
# 设置 NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. 启动服务
docker-compose up -d
```

## 多项目部署

在同一台服务器上部署多个项目实例时，需要修改端口和数据库名避免冲突：

```bash
# 项目1（默认配置）
BACKEND_PORT=8000
FRONTEND_PORT=3000
DB_NAME=stockai

# 项目2（避免冲突）
BACKEND_PORT=9000
FRONTEND_PORT=3001
DB_NAME=stockai2
NEXT_PUBLIC_API_URL=http://localhost:9000
```

## 配置项说明

### 必需配置
- `SILICONFLOW_API_KEY` - AI API密钥
- `NEXT_PUBLIC_API_URL` - 后端API地址（浏览器访问）

### 多项目部署配置
- `BACKEND_PORT` - 后端端口（默认8000）
- `FRONTEND_PORT` - 前端端口（默认3000）
- `DB_NAME` - 数据库名（默认stockai）

### 可选配置
- `DEFAULT_LOCALE` - 默认语言（en/ja）
- `FINANCE_QUERY_URL` - 股票数据API

## 示例：部署第二个项目

```bash
# 创建新的配置文件
cp .env.example .env.project2

# 编辑配置
vim .env.project2
```

内容：
```bash
SILICONFLOW_API_KEY=your_key
NEXT_PUBLIC_API_URL=http://localhost:9000
BACKEND_PORT=9000
FRONTEND_PORT=3001
DB_NAME=stockai2
```

启动：
```bash
docker-compose --env-file .env.project2 up -d
```

