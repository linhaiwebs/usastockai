# Planet Discovery — USA Stock AI Diagnostic System

## Project Overview
AI-powered US stock sentiment analysis platform. Frontend built with Stitch "1:1 Scale Replica" project theme (MarketPulse AI — Neon Lime Dark design system).

## Architecture
- **Frontend**: Next.js 14 (App Router) + TailwindCSS + TypeScript
- **Backend**: FastAPI (Python) + SQLAlchemy + MySQL
- **AI Model**: Qwen2.5-7B-Instruct (via vLLM)
- **Design System**: MarketPulse AI Dark Theme (#e2fe4c primary/neon-lime, #ff7351 error/red-CTA, #0e0e0e background/true-black)

## Frontend Design — MarketPulse AI (1:1 Scale Replica)
- DARK mode with `#E2FE4C` Neon Lime primary, `#E4E2E1` Warm White secondary, `#FF716B` Coral tertiary, `#B92902→#FF7351` Red gradient CTA
- Background: `#0E0E0E` True Black, Surface: `#0E0E0E`, Surface Container High: `#201F1F`
- Fonts: Manrope (headlines), Inter (body, labels), Material Symbols Outlined (icons)
- Brand: MarketPulse AI (uppercase tracking-tighter, neon lime)
- Key CSS: `.diag-mask`, `.diag-panel`, `.pulse-active`, `.no-scrollbar`
- Sections: TopAppBar (analytics icon filled + MarketPulse AI + Beta badge) → Hero ("What's the news saying about your stock?" + AI scans subtitle) → Search Section (search icon + rounded input + "Scan Now" red gradient CTA + trending tickers $GME/$AMC/$TSLA/$BBBY) → Hot Stocks Carousel (snap-scroll cards with $symbol + trending badge) → Trusted Sources (Reuters/Bloomberg/CNBC/Benzinga) → Footer
- Diagnosis panel: Dark card with MarketPulse color scheme
  - Analyzing: neon lime spinner + progress bar + "Synthesizing Alpha..."
  - Report: dark header with change% badge, Valuation/Sentiment/Risk 3-col grid, AI Executive Summary, WhatsApp green CTA (#25D366)
- Scroll-triggered CTA: "SCAN NOW" red gradient button
- Google Analytics integration via backend API
- Redirect system `/r/[id]` for WhatsApp CTA
- CTA text: "Get the report for free via WhatsApp"
- Footer links to /privacy, /terms, /contact
- Search dropdown: inside relative wrapper, z-[60], no overflow clipping

## Font Performance Optimization
- **Self-hosted woff2 fonts** — no Google CDN dependency
- **Font files**: `frontend/public/fonts/` (10 woff2 files)
  - Manrope: 6 weights (300/400/500/600/700/800)
  - Inter: 3 weights (400/500/600)
  - Material Symbols Outlined: 1 weight (400)
- **Preload hints** in `layout.tsx <head>` for critical fonts

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
- **Project**: 1:1 Scale Replica (ID: 7340148393844825097)
- **Design System**: MarketPulse AI
- **Theme**: DARK, customColor #E3FF4D
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
