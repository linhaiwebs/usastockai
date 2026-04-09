# 股票AI诊断落地页系统

基于 Next.js + FastAPI 的智能股票分析系统，集成 SiliconFlow DeepSeek R1 AI 模型。

## 🎯 功能特性

- ✅ **股票搜索自动补全** - 实时搜索股票代码和名称
- ✅ **流式AI分析** - DeepSeek R1 推理模型，支持 `<think/>` 推理过程展示
- ✅ **热门股票展示** - 实时行情数据，无 API 调用限制
- ✅ **分流链接管理** - 中间页跳转 + 权重分配算法
- ✅ **Docker 一键部署** - 前后端分离架构，开箱即用

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **样式**: TailwindCSS
- **语言**: TypeScript

### 后端
- **框架**: FastAPI
- **数据库**: PostgreSQL 15
- **AI**: SiliconFlow DeepSeek R1
- **数据源**: Yahoo Finance API (免费、无限制)

### 部署
- **容器化**: Docker + Docker Compose
- **架构**: 前后端分离

## 📦 快速启动

### 1. 克隆项目

```bash
git clone <repo_url>
cd usastockai
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入 SiliconFlow API Key
nano .env
```

必需的环境变量：
```bash
SILICONFLOW_API_KEY=your_api_key_here
```

### 3. 一键启动

```bash
docker-compose up -d
```

### 4. 访问服务

- **前端**: http://localhost:3000
- **后端 API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

## 🔧 开发指南

### 本地开发（不使用 Docker）

#### 后端

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn app.main:app --reload --port 8000
```

#### 前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建 Docker 镜像

```bash
# 构建所有服务
docker-compose build

# 单独构建
docker-compose build frontend
docker-compose build backend
```

## 📊 API 文档

### 股票数据

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/search?q={query}` | GET | 搜索股票 |
| `/api/stocks/hot` | GET | 热门股票列表 |
| `/api/stocks/{symbol}` | GET | 股票详情 |

### AI 分析

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/analyze?q={query}` | GET (SSE) | 流式AI分析 |
| `/api/analyze/{symbol}` | GET (SSE) | 股票AI分析 |

### 分流链接

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/redirects` | GET | 获取所有链接 |
| `/api/redirects` | POST | 创建链接 |
| `/api/redirects/{id}` | PUT | 更新链接 |
| `/api/redirects/{id}` | DELETE | 删除链接 |
| `/api/redirects/assign` | GET | 按权重分配 |
| `/api/redirects/{id}/info` | GET | 链接信息 |
| `/api/redirects/{id}/click` | POST | 记录点击 |

### 实时通信

| 端点 | 协议 | 描述 |
|------|------|------|
| `/ws/stocks` | WebSocket | 实时股票推送 |

## 🗂️ 项目结构

```
usastockai/
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # React 组件
│   │   └── lib/            # 工具库
│   ├── Dockerfile
│   └── package.json
├── backend/                 # 后端项目
│   ├── app/
│   │   ├── api/            # API 路由
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   └── core/           # 核心配置
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml       # Docker Compose 配置
├── init.sql                # 数据库初始化脚本
└── .env.example            # 环境变量模板
```

## 🔑 环境变量

| 变量名 | 说明 | 必填 | 默认值 |
|--------|------|------|--------|
| `SILICONFLOW_API_KEY` | SiliconFlow API 密钥 | ✅ | - |
| `SILICONFLOW_BASE_URL` | SiliconFlow API 地址 | ❌ | https://api.siliconflow.cn/v1 |
| `DATABASE_URL` | 数据库连接字符串 | ❌ | postgresql+asyncpg://stockai:stockai123@db:5432/stockai |
| `POSTGRES_USER` | 数据库用户名 | ❌ | stockai |
| `POSTGRES_PASSWORD` | 数据库密码 | ❌ | stockai123 |
| `POSTGRES_DB` | 数据库名称 | ❌ | stockai |

## 🚀 部署到生产环境

### 1. 配置生产环境变量

创建 `.env.production` 文件：

```bash
SILICONFLOW_API_KEY=your_production_api_key
DATABASE_URL=postgresql+asyncpg://prod_user:prod_pass@prod_db:5432/stockai
```

### 2. 构建并启动

```bash
docker-compose -f docker-compose.yml up -d --build
```

### 3. 配置反向代理 (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

## 📝 开发路线图

- [ ] 用户认证系统
- [ ] 股票收藏功能
- [ ] 历史分析记录
- [ ] 自定义热门股票列表
- [ ] 移动端适配优化
- [ ] 国际化支持

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [SiliconFlow](https://siliconflow.cn/)
- [Yahoo Finance API](https://finance.yahoo.com/)

---

**⚠️ 免责声明**: 本系统仅供学习和研究使用，不构成任何投资建议。投资有风险，入市需谨慎。
