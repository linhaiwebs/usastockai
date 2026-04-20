import { NextRequest, NextResponse } from 'next/server'

/**
 * API Proxy Route Handler
 * 
 * Proxies all /api/* requests to the backend server.
 * Reads the backend URL from environment variables set by docker-compose:
 *   - API_URL_INTERNAL (Docker): http://backend:8201
 *   - API_PORT (local dev): 8201
 *   - Fallback: http://localhost:8000
 * 
 * NOTE: Uses non-NEXT_PUBLIC_ prefix so values are read at RUNTIME,
 * not inlined at build time. This ensures BACKEND_PORT changes in .env
 * take effect without rebuilding the frontend image.
 * 
 * Supports: GET, POST, PUT, DELETE, OPTIONS
 * Forwards all headers including Authorization for admin API.
 * SSE streaming supported for /api/analyze/* endpoints.
 */

function getBackendURL(): string {
  // Server-only env vars — read at runtime, NOT inlined at build time
  const internalUrl = process.env.API_URL_INTERNAL
  const apiPort = process.env.API_PORT
  // Fallback to NEXT_PUBLIC_ vars for local dev convenience
  const publicUrl = process.env.NEXT_PUBLIC_API_URL_INTERNAL
  const publicPort = process.env.NEXT_PUBLIC_API_PORT
  
  if (internalUrl) return internalUrl
  if (publicUrl) return publicUrl
  if (apiPort) return `http://localhost:${apiPort}`
  if (publicPort) return `http://localhost:${publicPort}`
  return 'http://localhost:8000'
}

/** Forward relevant request headers, dropping hop-by-hop headers */
function getProxyHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {}
  const skip = new Set(['host', 'connection', 'keep-alive', 'transfer-encoding', 'upgrade'])
  request.headers.forEach((value, key) => {
    if (!skip.has(key.toLowerCase())) {
      headers[key] = value
    }
  })
  headers['Accept'] = headers['Accept'] || 'application/json'
  return headers
}

/** Check if path is an SSE streaming endpoint */
function isSSEPath(path: string[]): boolean {
  return path.length >= 1 && path[0] === 'analyze'
}

async function proxyRequest(
  method: string,
  request: NextRequest,
  params: { path: string[] }
): Promise<NextResponse> {
  const path = params.path.join('/')
  const backendURL = getBackendURL()
  const search = request.nextUrl.search
  const targetURL = `${backendURL}/api/${path}${search}`

  try {
    const fetchOpts: RequestInit = {
      method,
      headers: getProxyHeaders(request),
    }

    // Forward body for methods that have one
    if (method !== 'GET' && method !== 'HEAD') {
      fetchOpts.body = await request.text()
    }

    const res = await fetch(targetURL, fetchOpts)

    // SSE streaming: pipe chunks directly without buffering
    if (isSSEPath(params.path)) {
      const stream = new ReadableStream({
        async start(controller) {
          const reader = res.body?.getReader()
          if (!reader) {
            controller.close()
            return
          }
          const decoder = new TextDecoder()
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              controller.enqueue(value)
            }
          } catch {
            // Client disconnected
          } finally {
            controller.close()
          }
        },
      })

      return new NextResponse(stream, {
        status: res.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Non-streaming: buffer full response
    const data = await res.text()
    return new NextResponse(data, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Backend unreachable', detail: String(error) },
      { status: 502 }
    )
  }
}

export async function GET(request: NextRequest, ctx: { params: { path: string[] } }) {
  return proxyRequest('GET', request, ctx.params)
}

export async function POST(request: NextRequest, ctx: { params: { path: string[] } }) {
  return proxyRequest('POST', request, ctx.params)
}

export async function PUT(request: NextRequest, ctx: { params: { path: string[] } }) {
  return proxyRequest('PUT', request, ctx.params)
}

export async function DELETE(request: NextRequest, ctx: { params: { path: string[] } }) {
  return proxyRequest('DELETE', request, ctx.params)
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
