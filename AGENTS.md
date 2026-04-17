# Planet Discovery — USA Stock AI Diagnostic System

## Project Overview
AI-powered US stock sentiment analysis platform. Frontend redesigned with Stitch "AI Stock Analyzer" project theme (The Obsidian Ledger — Neon Cyber-Editorial design system).

## Architecture
- **Frontend**: Next.js 14 (App Router) + TailwindCSS + TypeScript
- **Backend**: FastAPI (Python) + SQLAlchemy + MySQL
- **AI Model**: Qwen2.5-7B-Instruct (via vLLM)
- **Design System**: The Obsidian Ledger Dark Theme (#a1faff primary/cyan, #c3f400 secondary/lime, #9cff93 tertiary/green, #0e0e0f obsidian background)

## Frontend Design — The Obsidian Ledger
- Dark mode with `#a1faff` Electric Cyan accent, `#c3f400` Neon Lime secondary, `#9cff93` Emerald tertiary
- Fonts: Space Grotesk (headlines), Inter (body), Material Symbols Outlined (icons)
- Brand: STOCK_INTEL (uppercase tracking)
- Sections: TopAppBar → TickerBar → Hero (search + DIAGNOSE CTA) → StockData → BentoGrid → Stats → SectorIntelligence → Capabilities → CTA → Footer
- Diagnostic modal: Full-screen glass overlay with loading sequence → result state
- Loading sequence: Progress bar animation (25%→55%→85%→100%) with status text
- Scroll-triggered FAB (fixed bottom CTA appears after 70% scroll)
- Google Analytics integration via backend API
- Redirect system `/r/[id]` for WhatsApp CTA
- Footer links to /privacy, /terms, /contact (all complete pages)

## Key Files
- `frontend/src/app/page.tsx` — Main landing page
- `frontend/src/app/privacy/page.tsx` — Privacy policy page
- `frontend/src/app/terms/page.tsx` — Terms of service page
- `frontend/src/app/contact/page.tsx` — Contact page
- `frontend/src/lib/api.ts` — Backend API client with caching
- `frontend/src/lib/config.ts` — API base URL configuration
- `frontend/src/lib/adminApi.ts` — Admin API client
- `backend/app/models.py` — SQLAlchemy models
- `init.sql` — Database schema

## Stitch Project Reference
- **Project**: AI Stock Analyzer (ID: 16232264983721036923)
- **Design System**: The Obsidian Ledger
- **Theme**: DARK, VIBRANT, customColor #00F5FF
- **Font**: SPACE_GROTESK (headline + label), INTER (body)
- **API Key**: Set `STITCH_API_KEY` env var for Stitch CLI access

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
