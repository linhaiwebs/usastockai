/**
 * Frontend API Configuration
 * 
 * Client-side: ALWAYS uses relative "/api" path.
 * All /api/* requests are proxied by the Route Handler (src/app/api/[...path]/route.ts),
 * which reads NEXT_PUBLIC_API_URL_INTERNAL / NEXT_PUBLIC_API_PORT from env.
 * 
 * This works reliably in ALL modes: standalone, dev, production.
 */

export const API_BASE = '/api'
