# Planet Discovery — USA Stock AI Diagnostic System

## Project Overview
AI-powered US stock sentiment analysis platform. Frontend built with Stitch "huihui2" project theme (Luminescent Ledger — Indigo-Purple Dark design system).

## Architecture
- **Frontend**: Next.js 14 (App Router) + TailwindCSS + TypeScript
- **Backend**: FastAPI (Python) + SQLAlchemy + MySQL
- **AI Model**: Qwen2.5-7B-Instruct (via vLLM)
- **Design System**: Luminescent Ledger Dark Theme (#a3a6ff primary/indigo, #c180ff secondary/purple, #ffa5d9 tertiary/pink, #0b0e14 deep navy background)

## Frontend Design — Luminescent Ledger (huihui2)
- Dark mode with `#A3A6FF` Lavender Indigo accent, `#C180FF` Ethereal Purple secondary, `#FFA5D9` Nebula Pink tertiary
- Background: `#0B0E14` Deep Navy, Surface: `#0B0E14`
- Fonts: Inter (headlines, body, labels), Material Symbols Outlined (icons)
- Brand: Luminescent Ledger (gradient from primary-dim to secondary)
- Key CSS: `.text-gradient`, `.glass-surface`, `.glass-bar`
- Sections: TopAppBar (avatar + Luminescent Ledger + notifications) → Hero (gradient headline + search portal + Start AI Diagnosis CTA) → Hot Stocks (2x2 grid) → Data Sources (pills) → Core Features (2x2 cards) → Bottom CTA → Footer
- Diagnostic panel: Full-screen glass overlay with AI Diagnosis loading → report state
- Loading sequence: Progress bar animation (25%→55%→85%→100%) with status text
- Scroll-triggered CTA (fixed bottom button appears after 70% scroll)
- Google Analytics integration via backend API
- Redirect system `/r/[id]` for WhatsApp CTA
- CTA text: "Get the report for free via WhatsApp"
- Footer links to /privacy, /terms, /contact (all complete pages)
- Glassmorphism: bg-surface-container/80 + backdrop-blur-[16px] + ghost borders (outline-variant/15)

## Font Performance Optimization
- **Self-hosted woff2 fonts** — no Google CDN dependency
- **Font files**: `frontend/public/fonts/` (6 woff2 files)
  - Inter: 5 weights (400/500/600/700/800)
  - Material Symbols Outlined: 1 weight (400), ~309KB
- **Preload hints** in `layout.tsx <head>` for critical fonts
- **@font-face declarations** in `globals.css` with font-display: swap/block
- **font-feature-settings**: 'rlig' 1, 'liga' 1 on `.material-symbols-outlined` for icon ligatures

## Key Files
- `frontend/src/app/page.tsx` — Main landing page
- `frontend/src/app/privacy/page.tsx` — Privacy policy page
- `frontend/src/app/terms/page.tsx` — Terms of service page
- `frontend/src/app/contact/page.tsx` — Contact page
- `frontend/src/lib/api.ts` — Backend API client
- `frontend/src/lib/config.ts` — API base URL configuration
- `frontend/src/lib/adminApi.ts` — Admin API client
- `frontend/src/components/GATracker.tsx` — Google Analytics component
- `backend/app/models.py` — SQLAlchemy models
- `init.sql` — Database schema

## Stitch Project Reference
- **Project**: huihui2 (ID: 766944256798124710)
- **Design System**: Luminescent Ledger
- **Theme**: DARK, customColor #0d7cf2
- **Font**: INTER (headline, body, label)
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
