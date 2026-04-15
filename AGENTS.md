# Planet Discovery — USA Stock AI Diagnostic System

## Project Overview
AI-powered US stock sentiment analysis platform. Frontend redesigned with Stitch "InsightLedger" project theme (Neon Cyber-Editorial design system).

## Architecture
- **Frontend**: Next.js 14 (App Router) + TailwindCSS + TypeScript
- **Backend**: FastAPI (Python) + SQLAlchemy + MySQL
- **AI Model**: Qwen2.5-7B-Instruct (via vLLM)
- **Design System**: InsightLedger Dark Theme (#38bdf8 sky-blue primary, #818cf8 indigo secondary, #c084fc violet tertiary, #0f172a background)

## Frontend Design
- Dark mode with `#38bdf8` sky-blue accent, `#818cf8` indigo, `#c084fc` violet
- Fonts: Space Grotesk (headlines), Inter (body), Material Symbols Outlined (icons)
- Sections: TickerBar → Navbar → Hero (search + CTA) → StockData → Features → Stats → SectorIntelligence → Capabilities → CTA → Footer
- Diagnostic modal opens as overlay when user clicks "Get Smart Analysis"
- Marquee ticker bar with real-time stock data
- Scroll-triggered FAB (fixed bottom CTA appears after 70% scroll)
- Google Analytics integration via backend API
- Redirect system `/r/[id]` for WhatsApp CTA

## Key Files
- `frontend/src/app/page.tsx` — Main landing page
- `frontend/src/components/` — All UI components
- `frontend/src/lib/api.ts` — Backend API client with caching
- `frontend/src/lib/config.ts` — API base URL configuration
- `frontend/src/lib/adminApi.ts` — Admin API client
- `backend/app/models.py` — SQLAlchemy models
- `init.sql` — Database schema

## Commands
```bash
# Frontend dev
cd frontend && npm run dev

# Frontend build
cd frontend && npm run build

# Backend (Docker)
docker-compose up
```

## API Endpoints
- `GET /api/analyze/{symbol}` — SSE stream for stock analysis
- `GET /api/analyze?q=...` — SSE stream for general query
- `GET /api/search?q=...` — Stock search
- `GET /api/stocks/hot` — Hot stocks
- `GET /api/redirects/assign` — Assign redirect link
- `POST /api/redirects/{id}/click` — Record redirect click
- Admin endpoints under `/api/admin/`
