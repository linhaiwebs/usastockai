# Planet Discovery — USA Stock AI Diagnostic System

## Project Overview
AI-powered US stock sentiment analysis platform. Frontend built with Stitch "阿东qstockl.com" project theme (QStock — The Analytical Luminary Light design system).

## Architecture
- **Frontend**: Next.js 14 (App Router) + TailwindCSS + TypeScript
- **Backend**: FastAPI (Python) + SQLAlchemy + MySQL
- **AI Model**: Qwen2.5-7B-Instruct (via vLLM)
- **Design System**: QStock Light Theme (#493ee5 primary/electric-indigo, #635bff primary-container, #faf8ff background/cool-white)

## Frontend Design — QStock (阿东qstockl.com)
- LIGHT mode with `#493EE5` Electric Indigo primary, `#635BFF` Primary Container, `#006A2D` Tertiary (growth green), `#BA1A1A` Error
- Background: `#FAF8FF` Cool Tinted White, Surface: `#FAF8FF`, Surface Container Low: `#F2F3FF`, Surface Container Highest: `#DAE2FD`
- Fonts: Plus Jakarta Sans (headlines), Inter (body), Space Grotesk (labels), Material Symbols Outlined (icons)
- Brand: QStock (tracking-tight, deep navy)
- Key CSS: `.diag-mask`, `.diag-panel`, `.pulse-active`, `.no-scrollbar`, `.font-label`
- Sections: TopAppBar (analytics icon + QStock + Beta badge) → Hero ("Intelligent Stock Analysis" + AI subtitle + trust badges) → Search Section (glassmorphic input + "Analyze with AI" indigo gradient CTA) → Trending Today (2x2 grid cards with symbol + price + trend badge) → Data Sources (dark navy banner: NASDAQ/NYSE/S&P 500/YAHOO!) → Features (4 items: Real-time Data, AI Analysis, Technical Charts, Risk Metrics) → Bottom CTA ("Connect with AI Agent") → Footer (dark navy)
- Diagnosis panel: Light card with QStock color scheme
  - Analyzing: indigo spinner + gradient progress bar + "Synthesizing Alpha..."
  - Report: light header with change% badge, Valuation/Sentiment/Risk 3-col grid, AI Executive Summary, WhatsApp green CTA (#25D366)
- Scroll-triggered CTA: "ANALYZE NOW" indigo gradient button
- Google Analytics integration via backend API
- Redirect system `/r/[id]` for WhatsApp CTA
- CTA text: "Get the report for free via WhatsApp"
- Footer links to /privacy, /terms, /contact
- Search dropdown: inside relative wrapper, z-[60], no overflow clipping

## Font Performance Optimization
- **Self-hosted woff2 fonts** — no Google CDN dependency
- **Font files**: `frontend/public/fonts/` (12 woff2 files)
  - Plus Jakarta Sans: 5 weights (400/500/600/700/800)
  - Inter: 3 weights (400/500/600)
  - Space Grotesk: 4 weights (400/500/600/700)
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
- **Project**: 阿东qstockl.com (ID: 8006256767682905895)
- **Design System**: The Analytical Luminary
- **Theme**: LIGHT, customColor #635BFF
- **Font**: PLUS_JAKARTA_SANS (headline), INTER (body), SPACE_GROTESK (label)
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
