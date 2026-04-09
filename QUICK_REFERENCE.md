# 快速参考卡片

## 🎯 一键启动

```bash
# 1. 配置 API Key
echo "SILICONFLOW_API_KEY=your_key_here" > .env

# 2. 启动
docker-compose up -d

# 3. 访问
# 前端: http://localhost:3000
# API:  http://localhost:8000/docs
```

## 📦 服务端口

| 服务 | 端口 | 用途 |
|------|------|------|
| Frontend | 3000 | Next.js 应用 |
| Backend | 8000 | FastAPI 应用 |
| Database | 5432 | PostgreSQL |

## 🔧 常用命令

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 进入容器
docker-compose exec backend bash

# 清理所有数据（危险！）
docker-compose down -v
```

## 🌐 API 端点速查

### 股票数据
```
GET /api/search?q=AAPL           # 搜索股票
GET /api/stocks/hot               # 热门股票
GET /api/stocks/AAPL              # 股票详情
```

### AI 分析 (SSE)
```
GET /api/analyze?q=AAPL           # AI 分析
GET /api/analyze/AAPL             # 股票分析
```

### 分流链接
```
GET    /api/redirects             # 列表
POST   /api/redirects             # 创建
GET    /api/redirects/assign      # 权重分配
GET    /api/redirects/1/info      # 链接信息
POST   /api/redirects/1/click     # 记录点击
```

### WebSocket
```
WS /ws/stocks                     # 实时股票
```

## 🎨 设计系统

### 颜色
```
背景:   #0A0E1A (深蓝黑)
卡片:   #141925 (表面色)
主色:   #3B82F6 (蓝色)
次色:   #8B5CF6 (紫色)
涨:     #10B981 (绿色)
跌:     #EF4444 (红色)
```

### 布局
```
最大宽度: 480px (移动端优先)
内边距:   16px
圆角:     12px-16px
```

## 🐛 故障排查

### 前端无法访问后端
```bash
# 检查后端是否启动
curl http://localhost:8000/health

# 检查网络
docker network ls
docker network inspect usastockai_stockai-network
```

### 数据库连接失败
```bash
# 检查数据库状态
docker-compose ps db

# 查看数据库日志
docker-compose logs db

# 重启数据库
docker-compose restart db
```

### AI 分析无响应
```bash
# 检查 API Key
docker-compose exec backend env | grep SILICONFLOW

# 测试 API
curl -H "Authorization: Bearer $SILICONFLOW_API_KEY" \
  https://api.siliconflow.cn/v1/models
```

## 📚 相关文档

- **Next.js**: https://nextjs.org/docs
- **FastAPI**: https://fastapi.tiangolo.com/
- **TailwindCSS**: https://tailwindcss.com/docs
- **SiliconFlow**: https://siliconflow.cn/docs

## 💡 提示

1. **首次启动**需要拉取镜像，可能需要 5-10 分钟
2. **AI 分析**需要有效的 SiliconFlow API Key
3. **股票数据**来自 Yahoo Finance，免费无限制
4. **数据库**数据持久化在 Docker volume 中

## 🔐 安全建议

生产环境请务必：
- ✅ 修改默认数据库密码
- ✅ 配置防火墙规则
- ✅ 启用 HTTPS
- ✅ 设置 CORS 白名单
- ✅ 定期备份数据库
