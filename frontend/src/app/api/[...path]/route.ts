import { NextRequest, NextResponse } from 'next/server'

/**
 * API Proxy Route Handler
 * 
 * Proxies all /api/* requests to the backend server.
 * Reads the backend URL from environment variables set by docker-compose:
 *   - NEXT_PUBLIC_API_URL_INTERNAL (Docker): http://backend:8000
 *   - NEXT_PUBLIC_API_PORT (local dev): 8000
 *   - Fallback: http://localhost:8000
 * 
 * This works reliably in ALL deployment modes (standalone, dev, production).
 */

function getBackendURL(): string {
  const internalUrl = process.env.NEXT_PUBLIC_API_URL_INTERNAL
  const apiPort = process.env.NEXT_PUBLIC_API_PORT
  if (internalUrl) return internalUrl
  if (apiPort) return `http://localhost:${apiPort}`
  return 'http://localhost:8000'
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const backendURL = getBackendURL()
  const search = request.nextUrl.search
  const targetURL = `${backendURL}/api/${path}${search}`

  try {
    const res = await fetch(targetURL, {
      headers: {
        'Accept': 'application/json',
        ...Object.fromEntries(request.headers.entries()),
      },
    })
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

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const backendURL = getBackendURL()
  const search = request.nextUrl.search
  const targetURL = `${backendURL}/api/${path}${search}`

  try {
    const body = await request.text()
    const res = await fetch(targetURL, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
        'Accept': 'application/json',
      },
      body,
    })
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
