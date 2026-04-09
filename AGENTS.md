# Stock AI Diagnostic System - Project Memory

## Project Overview

This is a production-grade stock AI diagnostic landing page system built with Next.js (frontend) and FastAPI (backend), featuring real-time stock data, AI-powered analysis, and intelligent redirect link management.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
├─────────────────────────────────────────────────────────┤
│  Frontend (Next.js:3000)                                │
│  ├─ App Router with TypeScript                          │
│  ├─ TailwindCSS for styling                             │
│  └─ SSE for streaming AI responses                      │
│                                                          │
│  Backend (FastAPI:8000)                                 │
│  ├─ Yahoo Finance API (free, unlimited)                 │
│  ├─ SiliconFlow DeepSeek R1 (AI analysis)               │
│  └─ PostgreSQL database                                  │
│                                                          │
│  Database (PostgreSQL:5432)                             │
│  └─ Redirect link management with weighted allocation   │
└─────────────────────────────────────────────────────────┘
```

## Key Technologies

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom color palette
- **Features**: 
  - Real-time stock search with debouncing (300ms)
  - SSE streaming for AI analysis
  - Responsive mobile-first design (max-width: 480px)

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy async
- **AI**: SiliconFlow DeepSeek R1 model (OpenAI-compatible API)
- **Data Source**: Yahoo Finance API (no API key required)
- **Real-time**: WebSocket for live stock updates

## Project Structure

```
usastockai/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Main landing page
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── globals.css           # Global styles
│   │   │   └── r/[id]/page.tsx       # Redirect intermediate page
│   │   ├── components/
│   │   │   ├── HeroSection.tsx       # Hero with gradient title
│   │   │   ├── SearchBox.tsx         # Search with autocomplete
│   │   │   ├── StockCard.tsx         # Stock display card
│   │   │   ├── StockGrid.tsx         # Hot stocks grid
│   │   │   ├── AnalysisModal.tsx     # AI analysis modal (SSE)
│   │   │   └── ...other components
│   │   └── lib/
│   │       └── api.ts                # API service layer
│   ├── Dockerfile                    # Multi-stage build
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── stocks.py             # Stock data endpoints
│   │   │   ├── analyze.py            # AI analysis (SSE)
│   │   │   ├── redirects.py          # Redirect link management
│   │   │   └── websocket.py          # Real-time updates
│   │   ├── services/
│   │   │   ├── stock_service.py      # Yahoo Finance integration
│   │   │   └── ai_service.py         # DeepSeek R1 integration
│   │   ├── models/
│   │   │   └── redirect.py           # SQLAlchemy model
│   │   └── core/
│   │       ├── config.py             # Pydantic settings
│   │       └── database.py           # Async database setup
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml                # Multi-service orchestration
├── init.sql                          # Database initialization
├── .env.example                      # Environment template
└── start.sh                          # Quick start script
```

## API Endpoints

### Stock Data
- `GET /api/search?q={query}` - Search stocks with autocomplete
- `GET /api/stocks/hot` - Get hot stocks list
- `GET /api/stocks/{symbol}` - Get stock detail

### AI Analysis (SSE Streaming)
- `GET /api/analyze?q={query}` - Stream AI analysis for query
- `GET /api/analyze/{symbol}` - Stream AI analysis for specific stock

### Redirect Links
- `GET /api/redirects` - List all redirect links
- `POST /api/redirects` - Create redirect link
- `PUT /api/redirects/{id}` - Update redirect link
- `DELETE /api/redirects/{id}` - Delete redirect link
- `GET /api/redirects/assign` - Weighted random selection
- `GET /api/redirects/{id}/info` - Get link info for intermediate page
- `POST /api/redirects/{id}/click` - Record click and redirect

### WebSocket
- `WS /ws/stocks` - Real-time stock updates (30s interval)

## Key Features

### 1. Stock Search with Debouncing
- 300ms debounce delay
- Yahoo Finance API integration
- Symbol and name search
- Exchange filtering

### 2. AI Analysis with SSE
- DeepSeek R1 reasoning model
- Supports `<think/>` tags for reasoning process
- Real-time streaming output
- Error handling and retry

### 3. Redirect Link Management
- Weighted random allocation algorithm
- Intermediate page with countdown
- Click count tracking
- PostgreSQL persistence

### 4. Responsive Design
- Mobile-first (480px max-width)
- Gradient hero title
- Hover animations
- Loading skeletons

## Environment Variables

Required:
- `SILICONFLOW_API_KEY` - Get from https://siliconflow.cn/

Optional:
- `SILICONFLOW_BASE_URL` - Default: https://api.siliconflow.cn/v1
- `DATABASE_URL` - Default: postgresql+asyncpg://stockai:stockai123@db:5432/stockai

## Quick Start

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env and add SILICONFLOW_API_KEY

# 2. Start with Docker
docker-compose up -d

# 3. Access services
# Frontend: http://localhost:3000
# Backend API docs: http://localhost:8000/docs
```

## Development Commands

```bash
# Backend (without Docker)
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (without Docker)
cd frontend
npm install
npm run dev
```

## Color Palette

```css
background: #0A0E1A    /* Dark navy background */
surface: #141925       /* Card background */
primary: #3B82F6       /* Blue accent */
secondary: #8B5CF6     /* Purple accent */
accent: #06B6D4        /* Cyan accent */
profit: #10B981        /* Green for gains */
loss: #EF4444          /* Red for losses */
```

## Important Notes

1. **Stock Data Source**: Uses Yahoo Finance API (free, no API key required, unlimited calls)
2. **AI Model**: DeepSeek R1 is a reasoning model that includes `<think/>` tags in responses
3. **Database**: PostgreSQL required for redirect link management
4. **SSE vs WebSocket**: SSE for AI analysis (one-way stream), WebSocket for real-time stock updates (bidirectional)
5. **Deployment**: Production deployment requires configuring CORS origins in backend/app/main.py

## Known Limitations

1. Yahoo Finance API may have rate limits on rapid successive calls
2. DeepSeek R1 model has longer response time due to reasoning process
3. WebSocket connections need proper cleanup on client disconnect

## Future Enhancements

- User authentication system
- Stock watchlist/favorites
- Historical analysis records
- Custom hot stocks list
- Internationalization (i18n)
- Mobile app optimization
