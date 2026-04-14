/**
 * Frontend API Configuration
 * 
 * API Base URL resolution strategy:
 * 1. Production (nginx proxy): relative path "/api" — nginx routes to backend
 * 2. Docker (no nginx): NEXT_PUBLIC_API_URL_INTERNAL env var — Next.js rewrite proxies to backend
 * 3. Development: fallback to http://localhost:8000 — Next.js rewrite proxies to local backend
 * 
 * The client always uses relative "/api" path.
 * The server-side rewrite in next.config.js handles the actual proxy destination.
 */

function getAPIBaseURL(): string {
  // Client-side: always use relative path (nginx or Next.js rewrite handles routing)
  if (typeof window !== 'undefined') {
    return '/api'
  }

  // Server-side (SSR): use internal URL if available, otherwise relative
  const internalUrl = process.env.NEXT_PUBLIC_API_URL_INTERNAL
  if (internalUrl) {
    return `${internalUrl}/api`
  }

  // Fallback for local development
  return 'http://localhost:8000/api'
}

export const API_BASE = getAPIBaseURL()
