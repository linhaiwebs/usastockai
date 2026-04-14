# Planet Discovery — USA Stock AI Diagnostic System

## Project Overview
AI-powered US stock sentiment analysis platform. Frontend redesigned with Stitch "Planet Discovery Home" project theme.

## Architecture
- **Frontend**: Next.js 14 (App Router) + TailwindCSS + TypeScript
- **Backend**: FastAPI (Python) + SQLAlchemy + MySQL
- **AI Model**: Qwen2.5-7B-Instruct (via vLLM)
- **Design System**: Planet Discovery Light Theme (#137fec brand, Inter font, 8px border-radius)

## Frontend Design
- Light mode with `#137fec` brand blue accent
- Sections: Navbar → Hero → FeatureGrid → HowItWorks → SearchBox → CTASection → Footer
- AnalysisModal opens as overlay when user clicks "Scan Now"
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
