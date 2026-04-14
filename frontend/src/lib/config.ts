/**
 * Frontend API Configuration
 * 
 * API Base URL resolution — reads from .env → docker-compose → process.env:
 * 
 * Client-side (browser):
 *   1. NEXT_PUBLIC_API_URL set  → use it (e.g. https://api.example.com/api)
 *   2. NEXT_PUBLIC_API_PORT set → http://当前域名:PORT/api
 *   3. Default                  → relative "/api" (nginx proxy)
 * 
 * Server-side (SSR / Next.js rewrite):
 *   1. NEXT_PUBLIC_API_URL_INTERNAL set → http://backend:8000/api (Docker)
 *   2. NEXT_PUBLIC_API_PORT set         → http://localhost:PORT/api
 *   3. Default                          → http://localhost:8000/api
 * 
 * Config flow: .env (BACKEND_PORT) → docker-compose → NEXT_PUBLIC_API_PORT
 */

function getAPIBaseURL(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const apiPort = process.env.NEXT_PUBLIC_API_PORT
  const internalUrl = process.env.NEXT_PUBLIC_API_URL_INTERNAL

  // Client-side (browser)
  if (typeof window !== 'undefined') {
    // Cross-domain: explicit API URL
    if (apiUrl) return `${apiUrl}/api`
    // Same domain, different port
    if (apiPort) return `${window.location.origin}:${apiPort}/api`
    // Same domain, nginx proxy (default)
    return '/api'
  }

  // Server-side (SSR / Next.js rewrite)
  if (internalUrl) return `${internalUrl}/api`
  if (apiPort) return `http://localhost:${apiPort}/api`
  return 'http://localhost:8000/api'
}

export const API_BASE = getAPIBaseURL()
