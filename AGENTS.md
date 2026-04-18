# Planet Discovery — USA Stock AI Diagnostic System

## Project Overview
AI-powered US stock sentiment analysis platform. Frontend built with Stitch "adongxin" project theme (Sovereign Insight — Editorial Precision Light design system).

## Architecture
- **Frontend**: Next.js 14 (App Router) + TailwindCSS + TypeScript
- **Backend**: FastAPI (Python) + SQLAlchemy + MySQL
- **AI Model**: Qwen2.5-7B-Instruct (via vLLM)
- **Design System**: Sovereign Insight Light Theme (#000f22 primary/navy, #505f76 secondary/slate, #6bff8f tertiary/green, #f7f9fb background/white)

## Frontend Design — Sovereign Insight (adongxin)
- LIGHT mode with `#000F22` Deep Navy primary, `#505F76` Slate secondary, `#6BFF8F` Emerald Green tertiary
- Background: `#F7F9FB` Off-White, Surface: `#F7F9FB`
- Fonts: Manrope (headlines), Inter (body, labels), Material Symbols Outlined (icons)
- Brand: SOVEREIGN (uppercase tracking-tighter, navy)
- Key CSS: `.glass-panel`, `.glass-bar`, `.carousel-track`, `.carousel-item`
- Sections: TopAppBar (insights icon + SOVEREIGN + Analyze Now CTA) → Hero (AI-Powered Alpha badge + "Sovereign Investor" headline + pill search + trending tickers) → Bento Grid (4 feature cards) → Three Steps to Insight (numbered) → Testimonials Carousel (3 quotes, auto-play) → Footer
- Diagnosis modal: Sovereign style — navy header with grade badge, Valuation/Sentiment/Risk grid, AI executive summary, WhatsApp green CTA (#25D366)
- Loading state: "Synthesizing Alpha..." spinner + progress bar
- Scroll-triggered CTA (fixed bottom "ANALYZE NOW" button)
- Google Analytics integration via backend API
- Redirect system `/r/[id]` for WhatsApp CTA
- CTA text: "Get the report for free via WhatsApp"
- Footer: Privacy/Terms/Support + legal disclaimer
- Glass panel: rgba(255,255,255,0.7) + blur(20px)

## Font Performance Optimization
- **Self-hosted woff2 fonts** — no Google CDN dependency
- **Font files**: `frontend/public/fonts/` (10 woff2 files)
  - Manrope: 6 weights (300/400/500/600/700/800)
  - Inter: 3 weights (400/500/600)
  - Material Symbols Outlined: 1 weight (400)
- **Preload hints** in `layout.tsx <head>` for critical fonts
- **@font-face declarations** in `globals.css` with font-display: swap/block
- **font-feature-settings**: 'rlig' 1, 'liga' 1 on `.material-symbols-outlined` for icon ligatures

## Key Files
- `frontend/src/app/page.tsx` — Main landing page
- `frontend/src/app/privacy/page.tsx` — Privacy policy page
- `frontend/src/app/terms/page.tsx` — Terms of service page
- `frontend/src/app/contact/page.tsx` — Contact & support page
- `frontend/src/lib/api.ts` — Backend API client
- `frontend/src/lib/config.ts` — API base URL configuration
- `frontend/src/lib/adminApi.ts` — Admin API client
- `frontend/src/components/GATracker.tsx` — Google Analytics component
- `backend/app/models.py` — SQLAlchemy models
- `init.sql` — Database schema

## Stitch Project Reference
- **Project**: adongxin (ID: 5201221791069068131)
- **Design System**: Sovereign Insight
- **Theme**: LIGHT, customColor #0A2540
- **Font**: MANROPE (headline), INTER (body, label)
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
