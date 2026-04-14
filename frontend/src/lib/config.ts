/**
 * Frontend API Configuration
 * 
 * Client-side: ALWAYS uses relative "/api" path.
 * The routing is handled by the proxy layer:
 *   - Production: nginx proxies /api/ → backend
 *   - Docker (no nginx): Next.js rewrites proxy /api/ → backend
 *   - Dev: Next.js rewrites proxy /api/ → localhost:BACKEND_PORT
 * 
 * Server-side (SSR): reads env vars to reach backend directly.
 * 
 * Config flow: .env (BACKEND_PORT) → docker-compose → env vars
 * - NEXT_PUBLIC_API_URL_INTERNAL → Docker internal URL (http://backend:8000)
 * - NEXT_PUBLIC_API_PORT         → local dev port (8000)
 */

function getAPIBaseURL(): string {
  // Client-side: always relative path — proxy handles routing
  if (typeof window !== 'undefined') {
    return '/api'
  }

  // Server-side (SSR / Next.js rewrite)
  const internalUrl = process.env.NEXT_PUBLIC_API_URL_INTERNAL
  const apiPort = process.env.NEXT_PUBLIC_API_PORT
  if (internalUrl) return `${internalUrl}/api`
  if (apiPort) return `http://localhost:${apiPort}/api`
  return 'http://localhost:8000/api'
}

export const API_BASE = getAPIBaseURL()
