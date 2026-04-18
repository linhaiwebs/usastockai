# Planet Discovery — USA Stock AI Diagnostic System

## Project Overview
AI-powered US stock sentiment analysis platform. Frontend built with Stitch "ayuan2" project theme (Terminal Sovereign — Neural Alpha Cyber-Terminal design system).

## Architecture
- **Frontend**: Next.js 14 (App Router) + TailwindCSS + TypeScript
- **Backend**: FastAPI (Python) + SQLAlchemy + MySQL
- **AI Model**: Qwen2.5-7B-Instruct (via vLLM)
- **Design System**: Terminal Sovereign Dark Theme (#00ffa3 primary/mint, #7701d0 secondary/violet, #bc2b00 tertiary/alert, #020408 obsidian background)

## Frontend Design — Terminal Sovereign (Neural Alpha)
- Dark mode with `#00FFA3` Mint Green accent, `#7701D0` Neural Violet secondary, `#BC2B00` Alert Red tertiary
- Background: `#020408` Deep Obsidian, Surface: `#101419`
- Fonts: Space Grotesk (headlines + labels), Inter (body), Material Symbols Outlined (icons)
- Brand: NEURAL ALPHA (uppercase tracking)
- Key CSS: `.liquid-silver-gradient`, `.cta-gradient`, `.glass-panel`, `.neural-glow`, `.pulse-dot`
- Sections: TopAppBar (analytics icon + NEURAL ALPHA + LIVE DATA pulse) → Hero (liquid-silver headline + terminal search + RUN AI DIAGNOSIS CTA) → StockData → TrendingAlphaPulse (4-card grid) → BentoGrid → CTA → Footer
- Diagnostic modal: Full-screen glass overlay with Neural Scan loading → Alpha Reveal result
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
- **Project**: ayuan2 (ID: 1673477709255042816)
- **Design System**: Terminal Sovereign
- **Theme**: DARK, FIDELITY, customColor #00FFA3
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
