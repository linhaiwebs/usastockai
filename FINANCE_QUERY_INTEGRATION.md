# Finance Query 集成指南

本项目已集成 [finance-query](https://github.com/Verdenroz/finance-query) 作为股票数据源，解决了 Yahoo Finance API 的速率限制问题。

## 方案选择

### 方案一：使用托管版本（推荐）✅

**优点**：
- ✅ 免费使用
- ✅ 无需部署和维护
- ✅ 性能更好
- ✅ 更可靠的数据源
- ✅ 支持 WebSocket 实时流
- ✅ 支持 GraphQL 查询

**配置**：
```bash
# .env
FINANCE_QUERY_URL=https://finance-query.com
```

**默认已启用**，无需额外配置即可使用。

### 方案二：自部署版本

适用于需要完全控制数据源的场景。

#### 1. 克隆并编译

```bash
# 安装 Rust（如果还没有）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 克隆仓库
git clone https://github.com/Verdenroz/finance-query.git
cd finance-query

# 编译并运行
make serve
```

服务将在 `http://localhost:8002` 启动。

#### 2. Docker 部署

```bash
# 构建 Docker 镜像
docker build -t finance-query-server -f server/Dockerfile .

# 运行容器
docker run -p 8002:8000 finance-query-server
```

#### 3. Docker Compose 部署

创建 `finance-query.yml`：

```yaml
version: '3.8'

services:
  finance-query:
    build: https://github.com/Verdenroz/finance-query.git#master:server
    ports:
      - "8002:8000"
    environment:
      - RUST_LOG=info
      - RATE_LIMIT_PER_MINUTE=60
    restart: unless-stopped
```

启动：
```bash
docker-compose -f finance-query.yml up -d
```

#### 4. 配置使用自部署版本

```bash
# .env
FINANCE_QUERY_URL=http://localhost:8002
```

## API 端点对比

| 功能 | 旧版 Yahoo Finance | 新版 Finance Query |
|------|-------------------|-------------------|
| 搜索股票 | `/v1/finance/search` | `/v2/search` |
| 单个报价 | `/v7/finance/quote` | `/v2/quote/{symbol}` |
| 批量报价 | 需逐个请求 | `/v2/quotes?symbols=A,B,C` |
| WebSocket | ❌ 不支持 | ✅ `/v2/stream` |
| GraphQL | ❌ 不支持 | ✅ `/graphql` |
| 速率限制 | 严格（易触发429） | 宽松（60次/分钟） |

## 数据格式

### 搜索结果

```json
{
  "quotes": [
    {
      "symbol": "AAPL",
      "shortname": "Apple Inc.",
      "quoteType": "EQUITY",
      "exchange": "NMS"
    }
  ]
}
```

### 股票报价

```json
{
  "symbol": "AAPL",
  "shortName": "Apple Inc.",
  "regular_market_price": {
    "raw": 175.43,
    "fmt": "175.43"
  },
  "regular_market_change": {
    "raw": 2.15,
    "fmt": "2.15"
  },
  "regular_market_change_percent": {
    "raw": 1.24,
    "fmt": "1.24%"
  },
  "regular_market_volume": {
    "raw": 52345678,
    "fmt": "52.35M"
  }
}
```

## 性能对比

### Yahoo Finance（旧版）
- ❌ 速率限制：严格，容易触发 429 错误
- ❌ 并发限制：最多 2 个并发请求
- ❌ 延迟：每次请求间隔至少 0.5 秒
- ❌ 缓存：本地内存缓存 60 秒

### Finance Query（新版）
- ✅ 速率限制：宽松，60 次/分钟
- ✅ 并发支持：最多 5 个并发请求
- ✅ 延迟：每次请求间隔 0.3 秒
- ✅ 缓存：支持 Redis（自部署）或本地缓存
- ✅ 批量请求：一次请求获取多个股票

## 高级功能

### 1. WebSocket 实时流

```python
# 后端可以添加 WebSocket 支持
import websockets

async def stream_stock_prices(symbols):
    uri = "wss://finance-query.com/v2/stream"
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({"symbols": symbols}))
        while True:
            data = await websocket.recv()
            print(json.loads(data))
```

### 2. GraphQL 查询

访问 `https://finance-query.com/graphql` 使用交互式查询界面。

示例查询：
```graphql
query {
  quote(symbol: "AAPL") {
    symbol
    shortName
    regularMarketPrice {
      raw
      fmt
    }
  }
}
```

### 3. 技术指标

```bash
# 获取技术指标
curl "https://finance-query.com/v2/indicators/AAPL"
```

## 迁移完成

已更新的文件：
- ✅ `backend/app/services/stock_service.py` - 使用 finance-query API
- ✅ `backend/app/core/config.py` - 添加 FINANCE_QUERY_URL 配置
- ✅ `.env.example` - 添加配置说明

## 测试验证

```bash
# 测试搜索
curl "http://localhost:8000/api/search?q=AAPL"

# 测试报价
curl "http://localhost:8000/api/stocks/AAPL"

# 测试热门股票
curl "http://localhost:8000/api/stocks/hot"
```

## 故障排除

### 问题1：连接超时

**症状**：`Request error: Connection timeout`

**解决**：
```bash
# 检查网络连接
curl https://finance-query.com/v2/quote/AAPL

# 如果网络不通，考虑自部署
```

### 问题2：速率限制

**症状**：`Rate limited, waiting before retry...`

**解决**：
- 托管版本：等待 1 秒后自动重试
- 自部署版本：调整 `RATE_LIMIT_PER_MINUTE` 环境变量

### 问题3：数据格式错误

**症状**：`Parse quote error`

**解决**：
- 检查日志中的详细错误信息
- 确认 finance-query 服务版本兼容
- 系统会自动降级到模拟数据

## 成本说明

- **托管版本**：完全免费，无需 API Key
- **自部署版本**：
  - 服务器成本：约 $5-10/月（基础 VPS）
  - Redis（可选）：约 $5/月
  - 带宽：通常在免费额度内

## 下一步

1. **验证功能**：测试所有股票相关接口
2. **监控性能**：观察 API 响应时间
3. **优化配置**：根据使用情况调整缓存和速率限制
4. **添加功能**：考虑使用 WebSocket 实现实时股价推送

## 参考链接

- [Finance Query 官网](https://finance-query.com)
- [GitHub 仓库](https://github.com/Verdenroz/finance-query)
- [API 文档](https://verdenroz.github.io/finance-query/server/api-reference/)
- [WebSocket 文档](https://verdenroz.github.io/finance-query/server/websocket-api-reference/)
