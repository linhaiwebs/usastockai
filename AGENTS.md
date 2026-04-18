# Planet Discovery — USA Stock AI Diagnostic System

## Project Overview
AI-powered US stock sentiment analysis platform. Frontend built with Stitch "ai.jsads.live灰灰3" project theme (InsightLedger — Cyan-Gold Glass Dark design system).

## Architecture
- **Frontend**: Next.js 14 (App Router) + TailwindCSS + TypeScript
- **Backend**: FastAPI (Python) + SQLAlchemy + MySQL
- **AI Model**: Qwen2.5-7B-Instruct (via vLLM)
- **Design System**: InsightLedger Dark Theme (#abe5ff/#40cfff primary/cyan, #b3cad6 secondary/blue-gray, #ffd5a1/#feb138 tertiary/amber, #0c1321 deep navy background)

## Frontend Design — InsightLedger (ai.jsads.live灰灰3)
- Dark mode with `#ABE5FF`/`#40CFFF` Cyan primary, `#B3CAD6` Muted Blue-Gray secondary, `#FFD5A1`/`#FEB138` Amber tertiary
- Background: `#0C1321` Deep Navy, Surface: `#0C1321`
- Fonts: Manrope (headlines), Inter (body, labels), Material Symbols Outlined (icons)
- Brand: InsightLedger (extrabold, cyan glow drop-shadow)
- Key CSS: `.text-gradient`, `.glass-panel`, `.glass-bar`, `.glass-surface`, `.bg-gradient-primary`, `.glow-primary`
- Sections: TopAppBar (analytics icon + InsightLedger glow + search) → Hero (radial gradient glow + "Predict with Clarity" gradient text + search portal + "Get Smart Analysis" CTA) → Stats Grid (2x2/4-col) → Sector Intelligence (stock rows with Vol/Cap/P/E) → Smarter Data Processing (3 glass feature cards) → Information Cards (2 overlay cards) → Bottom CTA ("Ready for Smarter Insights?") → Footer
- Diagnostic panel: Full-screen glass overlay with AI Diagnosis loading → report state
- Loading sequence: Progress bar animation (25%→55%→85%→100%) with status text
- Scroll-triggered CTA (fixed bottom button appears after 70% scroll)
- Google Analytics integration via backend API
- Redirect system `/r/[id]` for WhatsApp CTA
- CTA text: "Get the report for free via WhatsApp"
- Footer links to /privacy, /terms, /contact (all complete pages)
- Glassmorphism: rgba(25,32,46,0.6) + backdrop-blur-[20px] + ghost borders (outline-variant/20)

## Font Performance Optimization
- **Self-hosted woff2 fonts** — no Google CDN dependency
- **Font files**: `frontend/public/fonts/` (10 woff2 files)
  - Manrope: 6 weights (300/400/500/600/700/800)
  - Inter: 3 weights (400/500/600)
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
- **Project**: ai.jsads.live灰灰3 (ID: 12563742871718521421)
- **Design System**: InsightLedger
- **Theme**: DARK, customColor #1368f1
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
