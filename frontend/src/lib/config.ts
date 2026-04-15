/**
 * Frontend API Configuration
 * 
 * Client-side: ALWAYS uses relative "/api" path.
 * All /api/* requests are proxied by the Route Handler (src/app/api/[...path]/route.ts),
 * which reads API_URL_INTERNAL / API_PORT from env at RUNTIME.
 * 
 * This works reliably in ALL modes: standalone, dev, production.
 * Changing BACKEND_PORT in .env takes effect after docker-compose up -d,
 * no frontend rebuild needed.
 */

export const API_BASE = '/api'
