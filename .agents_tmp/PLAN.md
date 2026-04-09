# 1. OBJECTIVE

构建一个生产级「股票AI诊断落地页系统」，包含：
- **前端**：基于 Next.js + TailwindCSS 的现代金融科技风格落地页，支持流式AI输出
- **后端**：基于 finance-query 开源库构建股票API体系，支持分流链接管理系统
- **部署**：Docker 一键部署，前后端分离架构

# 2. CONTEXT SUMMARY

## 技术栈
- **Frontend**: Next.js 14 (App Router) + TailwindCSS + TypeScript
- **Backend**: Python FastAPI + finance-query 库 (本地部署版)
- **Database**: PostgreSQL 15 (生产级)
- **AI**: SiliconFlow DeepSeek-R1-0528-Qwen3-8B (兼容 OpenAI API)
- **实时通信**: Server-Sent Events (SSE) + WebSocket

## AI 服务配置
- **Provider**: SiliconFlow (https://siliconflow.cn)
- **Model**: deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- **API Base**: https://api.siliconflow.cn/v1
- **兼容性**: OpenAI API 格式，可直接使用 openai SDK

## 依赖库
- **finance-query** (https://github.com/Verdenroz/finance-query): 本地部署版
  - 提供股票实时报价、历史数据、搜索功能
  - 本地部署，无 API 调用限制
  - 支持多种数据源配置

## 核心功能
1. 股票搜索自动补全
2. 流式AI分析输出 (DeepSeek R1 推理模型)
3. 热门股票展示（实时数据，无限制）
4. 分流链接管理（中间页跳转 + 权重分配）

# 3. APPROACH OVERVIEW

## 架构设计

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Docker Compose                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   Frontend  │  │     Backend     │  │         Database            │  │
│  │  (Next.js)  │  │    (FastAPI)    │  │       (PostgreSQL)          │  │
│  │   :3000     │  │      :8000      │  │          :5432              │  │
│  └─────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│         │                 │                         │                    │
│         │         ┌───────┴───────┐                │                    │
│         │         │               │                │                    │
│         │    ┌────▼────┐   ┌──────▼─────┐         │                    │
│         │    │ finance │   │  SiliconFlow│         │                    │
│         │    │ -query  │   │  DeepSeek   │         │                    │
│         │    │ (本地)   │   │   AI API    │         │                    │
│         │    └─────────┘   └────────────┘         │                    │
│         │                                        │                    │
│         └────────────────────────────────────────┘                    │
│                      Internal Network                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 选择理由
1. **FastAPI**: 原生支持 SSE、异步、自动文档，与 finance-query (Python库) 无缝集成
2. **PostgreSQL**: 生产级数据库，支持高并发，ACID 事务保证分流计数准确性
3. **SSE vs WebSocket**: SSE 更适合单向流式输出 (AI分析)，WebSocket 用于实时股票更新
4. **SiliconFlow DeepSeek R1**: 国产推理模型，中文友好，成本低于 OpenAI o1

## 数据流设计

### AI 分析流程
```
用户输入 → /api/analyze (SSE) → DeepSeek R1 推理 → 流式返回
                                    ↓
                            包含 <think/> 推理过程
                                    ↓
                            实时展示分析结果
```

### 分流跳转流程
```
用户访问 /r/{id} → 显示中间页 (目标URL预览) → 用户确认 → 跳转 + 计数+1
```

### 权重分配算法
```python
# 加权随机选择
def select_redirect_by_weight(links):
    total_weight = sum(link.weight for link in links)
    random_val = random.uniform(0, total_weight)
    cumulative = 0
    for link in links:
        cumulative += link.weight
        if random_val <= cumulative:
            return link
```

# 4. IMPLEMENTATION STEPS

## Phase 1: 项目初始化 (步骤 1-4)

### Step 1: 创建项目目录结构
**目标**: 建立清晰的 monorepo 结构
**方法**: 创建 frontend/ 和 backend/ 目录，配置 Docker Compose

```
usastockai/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # 主页
│   │   │   ├── r/[id]/page.tsx   # 分流中间页
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── SearchBox.tsx
│   │   │   ├── StockCard.tsx
│   │   │   ├── StockGrid.tsx
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── FeatureGrid.tsx
│   │   │   ├── BrandSection.tsx
│   │   │   ├── CTAButton.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── AnalysisModal.tsx
│   │   │   └── RedirectPage.tsx  # 分流中间页
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── hooks/
│   │   └── styles/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── stocks.py
│   │   │   ├── analyze.py
│   │   │   ├── redirects.py
│   │   │   └── websocket.py
│   │   ├── models/
│   │   │   └── redirect.py
│   │   ├── services/
│   │   │   ├── stock_service.py
│   │   │   └── ai_service.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml
├── .env.example
└── README.md
```

### Step 2: 配置 Docker 环境
**目标**: 实现一键部署
**方法**: 创建多服务 Docker Compose

**文件**: `docker-compose.yml`
```yaml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on: [backend]
    
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/stockai
      - SILICONFLOW_API_KEY=${SILICONFLOW_API_KEY}
      - SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
    depends_on: [db]
    
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: stockai
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

### Step 3: 初始化后端项目
**目标**: 搭建 FastAPI 基础框架
**方法**: 
- 安装依赖: fastapi, uvicorn, finance-query, sqlalchemy, asyncpg, openai
- 创建 FastAPI 应用入口
- 配置 CORS 中间件
- 设置 PostgreSQL 连接

**文件**: `backend/requirements.txt`
```
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sqlalchemy>=2.0.0
asyncpg>=0.29.0
openai>=1.10.0
finance-query>=0.1.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
python-dotenv>=1.0.0
sse-starlette>=1.8.0
websockets>=12.0
```

### Step 4: 配置 PostgreSQL 数据库
**目标**: 初始化数据库结构和连接
**方法**: 创建 SQLAlchemy 模型和初始化脚本

**文件**: `backend/app/core/database.py`
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+asyncpg://user:pass@db:5432/stockai"
engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
```

**文件**: `init.sql`
```sql
CREATE TABLE IF NOT EXISTS redirect_links (
    id SERIAL PRIMARY KEY,
    url VARCHAR(2048) NOT NULL,
    call_count INTEGER DEFAULT 0,
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_weight ON redirect_links(weight);
```

---

## Phase 2: 后端核心功能 (步骤 5-9)

### Step 5: 集成 finance-query 本地部署
**目标**: 实现无限制的股票数据查询服务
**方法**: 配置并封装 finance-query

**文件**: `backend/app/services/stock_service.py`
```python
from finance_query import FinanceQuery

# 本地部署配置 - 无 API 限制
fq = FinanceQuery(
    cache_enabled=True,
    cache_ttl=60,  # 60秒缓存
    rate_limit=None  # 无限制
)

async def search_stocks(query: str) -> list[dict]:
    """股票搜索自动补全"""
    results = await fq.search(query)
    return [{"symbol": r.symbol, "name": r.name, "type": r.type} for r in results]

async def get_quote(symbol: str) -> dict:
    """获取实时报价"""
    quote = await fq.get_quote(symbol)
    return {
        "symbol": symbol,
        "price": quote.price,
        "change": quote.change,
        "change_percent": quote.change_percent,
        "volume": quote.volume
    }

async def get_hot_stocks() -> list[dict]:
    """获取热门股票列表"""
    # 默认热门股票或自定义列表
    hot_symbols = ["SPY", "QQQ", "AAPL", "MSFT", "TSLA", "NVDA", "AMZN", "GOOGL"]
    quotes = await asyncio.gather(*[get_quote(s) for s in hot_symbols])
    return quotes
```

### Step 6: 实现股票 API 端点
**目标**: 提供前端所需的 RESTful API
**方法**: 创建 API 路由

**端点列表**:
| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/search` | GET | 股票搜索自动补全 |
| `/api/stocks/hot` | GET | 获取热门股票 |
| `/api/stocks/{symbol}` | GET | 获取单只股票详情 |
| `/api/stocks/{symbol}/history` | GET | 获取历史数据 |

**文件**: `backend/app/api/stocks.py`

### Step 7: 实现流式 AI 分析 (SiliconFlow DeepSeek R1)
**目标**: 支持 SSE 流式输出推理结果
**方法**: 使用 OpenAI SDK 连接 SiliconFlow

**文件**: `backend/app/services/ai_service.py`
```python
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key=settings.SILICONFLOW_API_KEY,
    base_url="https://api.siliconflow.cn/v1"
)

async def analyze_stock_stream(query: str):
    """流式分析股票"""
    response = await client.chat.completions.create(
        model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
        messages=[
            {"role": "system", "content": "你是专业的股票分析师..."},
            {"role": "user", "content": query}
        ],
        stream=True
    )
    
    async for chunk in response:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
```

**端点**: `/api/analyze` (SSE)
```python
from sse_starlette.sse import EventSourceResponse

@router.get("/analyze")
async def analyze(query: str):
    async def event_generator():
        async for content in analyze_stock_stream(query):
            yield {"data": json.dumps({"content": content, "done": False})}
        yield {"data": json.dumps({"content": "", "done": True})}
    
    return EventSourceResponse(event_generator())
```

### Step 8: 实现分流链接系统
**目标**: 支持权重分配 + 中间页跳转
**方法**: 创建数据库模型和 CRUD API

**数据模型**: `backend/app/models/redirect.py`
```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

class RedirectLink(Base):
    __tablename__ = "redirect_links"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    url = Column(String(2048), nullable=False)
    call_count = Column(Integer, default=0)
    weight = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

**API 端点**:
| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/redirects` | GET | 获取所有分流链接 |
| `/api/redirects` | POST | 创建新分流链接 |
| `/api/redirects/{id}` | PUT | 更新分流链接 |
| `/api/redirects/{id}` | DELETE | 删除分流链接 |
| `/api/redirects/assign` | GET | 获取按权重分配的链接 |
| `/api/redirects/{id}/info` | GET | 获取链接信息(中间页使用) |
| `/api/redirects/{id}/click` | POST | 记录点击并返回目标URL |

**文件**: `backend/app/api/redirects.py`
```python
@router.get("/assign")
async def assign_redirect():
    """按权重分配链接"""
    links = await get_all_links()
    if not links:
        raise HTTPException(404, "No redirect links available")
    
    # 加权随机选择
    total_weight = sum(l.weight for l in links)
    random_val = random.uniform(0, total_weight)
    cumulative = 0
    for link in links:
        cumulative += link.weight
        if random_val <= cumulative:
            return {"id": link.id, "url": link.url}
    return {"id": links[0].id, "url": links[0].url}

@router.post("/{id}/click")
async def record_click(id: int, db: AsyncSession = Depends(get_db)):
    """记录点击并返回目标URL"""
    link = await db.get(RedirectLink, id)
    if not link:
        raise HTTPException(404, "Link not found")
    
    link.call_count += 1
    await db.commit()
    
    return {"url": link.url}
```

### Step 9: 添加 WebSocket 实时推送
**目标**: 支持热门股票实时更新
**方法**: FastAPI WebSocket 端点

**端点**: `/ws/stocks`
```python
@router.websocket("/ws/stocks")
async def stocks_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # 每5秒推送一次热门股票数据
            hot_stocks = await get_hot_stocks()
            await websocket.send_json(hot_stocks)
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        pass
```

**文件**: `backend/app/api/websocket.py`

---

## Phase 3: 前端开发 (步骤 10-17)

### Step 10: 初始化 Next.js 项目
**目标**: 搭建前端开发环境
**方法**: 
- 创建 Next.js 14 项目 (App Router)
- 配置 TailwindCSS
- 设置路径别名 (@/components, @/lib)

**文件**: `frontend/package.json`
```json
{
  "dependencies": {
    "next": "14.1.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "tailwindcss": "3.4.0",
    "clsx": "^2.1.0"
  }
}
```

### Step 11: 创建全局样式和主题
**目标**: 实现金融科技视觉风格
**方法**: TailwindCSS 配置自定义主题

**文件**: `frontend/tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FA',
        primary: {
          500: '#3B82F6',
          600: '#2563EB',
          gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        },
        success: '#10B981',
        danger: '#EF4444',
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
        }
      },
      borderRadius: {
        card: '16px',
        button: '24px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.08)',
        button: '0 4px 14px rgba(59, 130, 246, 0.4)',
      }
    }
  }
}
```

### Step 12: 创建 HeroSection 组件
**目标**: 实现顶部英雄区
**方法**: 创建响应式布局组件

**组件**: `frontend/src/components/HeroSection.tsx`
```tsx
export function HeroSection() {
  return (
    <section className="text-center py-16 px-4">
      <h1 className="text-5xl font-bold leading-tight">
        Enhance your<br />
        <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          trading strategies
        </span>
      </h1>
      <p className="text-2xl text-gray-500 mt-4">with AI</p>
      <p className="text-gray-400 mt-6 max-w-md mx-auto leading-relaxed">
        Harness the power of artificial intelligence to analyze stocks,
        identify trends, and make informed trading decisions.
      </p>
    </section>
  )
}
```

### Step 13: 创建 SearchBox 组件
**目标**: 实现核心搜索输入框
**方法**: 
- Debounce 输入 (300ms)
- Autocomplete 下拉建议
- 触发 AI 分析按钮

**组件**: `frontend/src/components/SearchBox.tsx`
```tsx
'use client'
import { useState, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export function SearchBox({ onAnalyze }: { onAnalyze: (query: string) => void }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const debouncedSearch = useDebouncedCallback(async (q: string) => {
    if (q.length < 2) return
    const results = await searchStocks(q)
    setSuggestions(results)
    setShowSuggestions(true)
  }, 300)

  return (
    <div className="relative max-w-lg mx-auto">
      <div className="bg-white rounded-full shadow-card px-6 py-4 flex items-center gap-4">
        <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
          AI-Powered
        </span>
        <input
          type="text"
          placeholder="Ask anything..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); debouncedSearch(e.target.value) }}
          className="flex-1 outline-none text-gray-700"
        />
        <button 
          onClick={() => onAnalyze(query)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium shadow-button transition-all"
        >
          Ask AI →
        </button>
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg overflow-hidden z-10">
          {suggestions.map((s) => (
            <button
              key={s.symbol}
              onClick={() => { setQuery(s.symbol); setShowSuggestions(false) }}
              className="w-full px-6 py-3 text-left hover:bg-gray-50 flex justify-between"
            >
              <span className="font-medium">{s.symbol}</span>
              <span className="text-gray-400">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Step 14: 创建 StockCard 和 StockGrid 组件
**目标**: 展示热门股票数据
**方法**: 
- 2列 Grid 布局
- 卡片包含: 代码、类型、价格、涨跌幅
- 颜色区分涨跌

**组件**: `frontend/src/components/StockCard.tsx`
```tsx
interface StockCardProps {
  symbol: string
  type: string
  price: number
  change: number
  changePercent: number
}

export function StockCard({ symbol, type, price, change, changePercent }: StockCardProps) {
  const isPositive = change >= 0
  
  return (
    <div className="bg-white rounded-card shadow-card p-5 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">{symbol}</h3>
          <span className="text-xs text-gray-400 uppercase">{type}</span>
        </div>
      </div>
      <div className="text-2xl font-bold">${price.toFixed(2)}</div>
      <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-success' : 'text-danger'}`}>
        <span>{isPositive ? '↑' : '↓'}</span>
        <span>${Math.abs(change).toFixed(2)}</span>
        <span>({changePercent.toFixed(2)}%)</span>
      </div>
    </div>
  )
}
```

### Step 15: 创建 FeatureCard 和 FeatureGrid 组件
**目标**: 展示痛点模块
**方法**: 2x2 Grid 布局

**组件**: `frontend/src/components/FeatureCard.tsx`
```tsx
interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-card shadow-card p-6 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
```

### Step 16: 创建 Modal 和 AI 分析流式输出
**目标**: 实现流式 AI 分析展示
**方法**: 
- SSE 连接后端
- 实时渲染 Markdown 内容
- 支持 DeepSeek R1 的 `<think/>` 推理过程展示

**组件**: `frontend/src/components/AnalysisModal.tsx`
```tsx
'use client'
import { useState, useEffect } from 'react'

export function AnalysisModal({ query, onClose }: { query: string; onClose: () => void }) {
  const [content, setContent] = useState('')
  const [thinking, setThinking] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const eventSource = new EventSource(`/api/analyze?q=${encodeURIComponent(query)}`)
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setIsLoading(false)
      
      if (data.done) {
        eventSource.close()
        return
      }
      
      // 处理 DeepSeek R1 的 <think/> 标签
      if (data.content.includes('<think/>')) {
        const parts = data.content.split('<think/>')
        setThinking(prev => prev + parts[0])
        if (parts[1]) setContent(prev => prev + parts[1])
      } else {
        setContent(prev => prev + data.content)
      }
    }
    
    return () => eventSource.close()
  }, [query])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="font-bold text-xl">AI Analysis: {query}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <span className="text-gray-400">Analyzing...</span>
            </div>
          ) : (
            <>
              {thinking && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-500 italic">
                  💭 {thinking}
                </div>
              )}
              <div className="prose prose-sm">
                {content}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Step 17: 创建分流中间页
**目标**: 实现跳转确认页面
**方法**: 创建独立路由页面

**文件**: `frontend/src/app/r/[id]/page.tsx`
```tsx
'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function RedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [linkInfo, setLinkInfo] = useState<{ url: string; callCount: number } | null>(null)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // 获取链接信息
    fetch(`/api/redirects/${params.id}/info`)
      .then(res => res.json())
      .then(setLinkInfo)
  }, [params.id])

  useEffect(() => {
    // 倒计时自动跳转
    if (countdown <= 0) {
      handleRedirect()
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleRedirect = async () => {
    const res = await fetch(`/api/redirects/${params.id}/click`, { method: 'POST' })
    const data = await res.json()
    window.location.href = data.url
  }

  if (!linkInfo) return <div className="text-center py-20">Loading...</div>

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          🔗
        </div>
        <h1 className="text-2xl font-bold mb-4">You are being redirected</h1>
        <p className="text-gray-400 mb-6 break-all">{linkInfo.url}</p>
        
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border rounded-full hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRedirect}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            Continue ({countdown}s)
          </button>
        </div>
        
        <p className="text-xs text-gray-400 mt-4">
          This link has been visited {linkInfo.callCount} times
        </p>
      </div>
    </div>
  )
}
```

---

## Phase 4: 整合与完善 (步骤 18-20)

### Step 18: 创建中间品牌区和 CTA
**目标**: 完成页面结构
**方法**: 

**组件**: `frontend/src/components/BrandSection.tsx`
```tsx
export function BrandSection() {
  return (
    <section className="text-center py-20 px-4">
      <h2 className="text-4xl font-bold mb-6">
        The Market Never Sleeps.<br />
        Neither Should Your Intelligence.
      </h2>
      <p className="text-gray-400 max-w-2xl mx-auto">
        Our AI agents work 24/7 to analyze market trends, monitor your portfolio,
        and deliver actionable insights right when you need them.
      </p>
    </section>
  )
}
```

**组件**: `frontend/src/components/CTAButton.tsx`
```tsx
export function CTAButton() {
  return (
    <div className="text-center py-10">
      <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-4 rounded-button text-lg font-semibold shadow-button hover:shadow-xl transition-all">
        Meet Your AI Agent Team →
      </button>
    </div>
  )
}
```

### Step 19: 组装主页面
**目标**: 完成落地页整体布局
**方法**: 按顺序组装所有组件

**文件**: `frontend/src/app/page.tsx`
```tsx
import { HeroSection } from '@/components/HeroSection'
import { SearchBox } from '@/components/SearchBox'
import { StockGrid } from '@/components/StockGrid'
import { BrandSection } from '@/components/BrandSection'
import { FeatureGrid } from '@/components/FeatureGrid'
import { CTAButton } from '@/components/CTAButton'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-[480px] mx-auto px-4">
        <HeroSection />
        <SearchBox />
        <StockGrid />
        <BrandSection />
        <FeatureGrid />
        <CTAButton />
        <Footer />
      </div>
    </main>
  )
}
```

### Step 20: 添加 API 服务层
**目标**: 封装前端 API 调用
**方法**: 创建 API 服务模块

**文件**: `frontend/src/lib/api.ts`
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function searchStocks(query: string) {
  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`)
  return res.json()
}

export async function getHotStocks() {
  const res = await fetch(`${API_BASE}/api/stocks/hot`)
  return res.json()
}

export async function getRedirectInfo(id: number) {
  const res = await fetch(`${API_BASE}/api/redirects/${id}/info`)
  return res.json()
}

export async function recordRedirectClick(id: number) {
  const res = await fetch(`${API_BASE}/api/redirects/${id}/click`, { method: 'POST' })
  return res.json()
}

export function getAnalyzeStreamUrl(query: string) {
  return `${API_BASE}/api/analyze?q=${encodeURIComponent(query)}`
}
```

---

## Phase 5: Docker 部署配置 (步骤 21-23)

### Step 21: 创建后端 Dockerfile
**目标**: 构建 Python 后端镜像
**方法**: 多阶段构建

**文件**: `backend/Dockerfile`
```dockerfile
FROM python:3.11-slim as builder

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.11-slim

WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 22: 创建前端 Dockerfile
**目标**: 构建 Next.js 生产镜像
**方法**: 多阶段构建 (安装 → 构建 → 运行)

**文件**: `frontend/Dockerfile`
```dockerfile
# Stage 1: 依赖安装
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: 构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: 运行
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

### Step 23: 配置 Docker Compose 生产版
**目标**: 一键启动所有服务
**方法**: 创建完整 docker-compose.yml

**文件**: `docker-compose.yml`
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - stockai-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://stockai:stockai123@db:5432/stockai
      - SILICONFLOW_API_KEY=${SILICONFLOW_API_KEY}
      - SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - stockai-network

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: stockai
      POSTGRES_PASSWORD: stockai123
      POSTGRES_DB: stockai
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U stockai"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - stockai-network

volumes:
  postgres_data:

networks:
  stockai-network:
    driver: bridge
```

---

## Phase 6: 测试与文档 (步骤 24-26)

### Step 24: 后端单元测试
**目标**: 确保核心功能正确性
**方法**: pytest 测试框架

**文件**: `backend/tests/`
```
tests/
├── conftest.py           # 测试配置和fixtures
├── test_stocks.py        # 测试股票 API
├── test_redirects.py     # 测试分流链接
├── test_analyze.py       # 测试 AI 分析
└── test_weight_assign.py # 测试权重分配算法
```

### Step 25: 前端组件测试
**目标**: 确保组件正确渲染
**方法**: Jest + React Testing Library

**文件**: `frontend/src/__tests__/`
```
__tests__/
├── HeroSection.test.tsx
├── SearchBox.test.tsx
├── StockCard.test.tsx
└── RedirectPage.test.tsx
```

### Step 26: 创建部署文档
**目标**: 提供完整部署指南
**方法**: 编写 README.md

**文件**: `README.md`
```markdown
# 股票AI诊断落地页系统

## 快速启动

1. 克隆项目
2. 配置环境变量
3. 一键启动

## 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| SILICONFLOW_API_KEY | SiliconFlow API密钥 | ✅ |

## API 文档

启动后访问 http://localhost:8000/docs

## 分流链接管理

...
```

# 5. TESTING AND VALIDATION

## 功能验证清单

### 前端验证
- [ ] Hero 区域正确显示蓝色渐变标题
- [ ] 搜索框 debounce 300ms 生效
- [ ] Autocomplete 正确显示建议
- [ ] 点击搜索按钮打开 AnalysisModal
- [ ] 流式 AI 输出实时显示 (支持 DeepSeek R1 <think/> 标签)
- [ ] 热门股票卡片显示涨跌颜色 (绿/红)
- [ ] 卡片 Hover 动画正常
- [ ] 响应式布局在 480px 正常显示
- [ ] 分流中间页显示目标URL和倒计时
- [ ] 点击确认后正确跳转并计数

### 后端验证
- [ ] `/api/search` 返回正确搜索结果
- [ ] `/api/stocks/hot` 返回热门股票
- [ ] `/api/analyze` SSE 流式输出正常
- [ ] DeepSeek R1 模型正确响应
- [ ] 分流链接 CRUD 正常
- [ ] 权重分配算法正确 (加权随机)
- [ ] 调用计数正确递增
- [ ] PostgreSQL 数据持久化正常

### Docker 部署验证
- [ ] `docker-compose up` 一键启动
- [ ] 所有服务健康检查通过
- [ ] 前端访问 http://localhost:3000 正常
- [ ] 后端 API 文档 http://localhost:8000/docs 访问正常
- [ ] PostgreSQL 容器正常运行
- [ ] 数据持久化正常 (重启后数据保留)

### 性能验证
- [ ] 首屏加载 < 3s
- [ ] API 响应 < 500ms
- [ ] SSE 连接稳定
- [ ] 无内存泄漏

### AI 模型验证
- [ ] SiliconFlow API 连接成功
- [ ] DeepSeek R1 模型返回推理结果
- [ ] 流式输出延迟 < 1s
- [ ] 错误处理和重试机制正常

---

## 环境变量配置

创建 `.env` 文件：
```bash
# SiliconFlow AI 配置
SILICONFLOW_API_KEY=your_api_key_here
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1

# 数据库配置
POSTGRES_USER=stockai
POSTGRES_PASSWORD=stockai123
POSTGRES_DB=stockai

# 后端配置
DATABASE_URL=postgresql+asyncpg://stockai:stockai123@db:5432/stockai
```

---

## 快速启动命令

```bash
# 1. 克隆项目
git clone <repo_url>
cd usastockai

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 SILICONFLOW_API_KEY

# 3. 一键启动
docker-compose up -d

# 4. 查看日志
docker-compose logs -f

# 5. 访问服务
# 前端: http://localhost:3000
# 后端API文档: http://localhost:8000/docs
```

---

## API 端点总览

### 股票数据
| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/search?q={query}` | GET | 搜索股票 |
| `/api/stocks/hot` | GET | 热门股票 |
| `/api/stocks/{symbol}` | GET | 股票详情 |
| `/api/stocks/{symbol}/history` | GET | 历史数据 |

### AI 分析
| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/analyze?q={query}` | GET (SSE) | 流式AI分析 |

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
