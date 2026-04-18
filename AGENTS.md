# Planet Discovery — USA Stock AI Diagnostic System

## Project Overview
AI-powered US stock sentiment analysis platform. Frontend built with Stitch "ayuan2" project theme (Ethereal Intelligence — Ethereal AI Deep Space design system).

## Architecture
- **Frontend**: Next.js 14 (App Router) + TailwindCSS + TypeScript
- **Backend**: FastAPI (Python) + SQLAlchemy + MySQL
- **AI Model**: Qwen2.5-7B-Instruct (via vLLM)
- **Design System**: Ethereal Intelligence Dark Theme (#99f7ff primary/cyan, #ac89ff secondary/purple, #d674ff tertiary/magenta, #0a0e18 deep navy background)

## Frontend Design — Ethereal Intelligence (Ethereal AI)
- Dark mode with `#99F7FF` Electric Cyan accent, `#AC89FF` Ethereal Purple secondary, `#D674FF` Nebula Magenta tertiary
- Background: `#0A0E18` Deep Navy, Surface: `#0A0E18`
- Fonts: Space Grotesk (headlines + labels), Manrope (body), Material Symbols Outlined (icons)
- Brand: ETHEREAL AI (uppercase tracking, cyan color)
- Key CSS: `.text-gradient`, `.glass-surface`, `.glass-bar`, `.deep-glow`, `.glow-dot`
- Sections: TopAppBar (font_download + ETHEREAL AI + info) → Trust Badge → Hero (gradient headline + search portal + ⚡ Free AI Diagnosis CTA) → Market Pulse (horizontal scroll cards) → Trending AI Analysis (left-accent cards) → Footer
- Diagnostic panel: Full-screen glass overlay with AI Diagnosis loading → report state
- Loading sequence: Progress bar animation (25%→55%→85%→100%) with status text
- Scroll-triggered CTA (fixed bottom button appears after 70% scroll)
- Google Analytics integration via backend API
- Redirect system `/r/[id]` for WhatsApp CTA
- CTA text: "Get the report for free via WhatsApp"
- Footer links to /privacy, /terms, /contact (all complete pages)
- Glassmorphism: bg-white/[0.05] + backdrop-blur-[16px] + ghost borders (white/[0.05])
- Floating glow orbs: secondary-container/15, primary-container/10, primary/5 (fixed, blurred)
- Decorative glass cards: animate-float, float-delayed, float-slow

## Font Performance Optimization
- **Self-hosted woff2 fonts** — no Google CDN dependency
- **Font files**: `frontend/public/fonts/` (9 woff2 files)
  - Space Grotesk: 4 weights (400/500/600/700), ~105KB
  - Manrope: 4 weights (300/400/500/600), ~119KB
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
- **Project**: ayuan2 (ID: 5711603179151818050)
- **Design System**: Ethereal Intelligence
- **Theme**: DARK, VIBRANT, customColor #00F2FF
- **Font**: SPACE_GROTESK (headline + label), MANROPE (body)
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
