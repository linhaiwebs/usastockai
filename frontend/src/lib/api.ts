import { API_BASE } from './config'

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  change_percent: number
  volume: number
}

export interface SearchResult {
  symbol: string
  name: string
  type: string
  exchange: string
}

export interface GoogleAnalyticsConfig {
  ads_tracking_id: string | null
  ga4_property_id: string | null
  conversion_id: string | null
}

async function fetchAPI<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}${endpoint}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const data = await fetchAPI<{ stocks: StockQuote[] } | StockQuote>(`/stocks/${encodeURIComponent(symbol)}`)
  if ('symbol' in data) return data
  throw new Error('Stock not found')
}

export async function getHotStocks(): Promise<StockQuote[]> {
  const data = await fetchAPI<{ stocks: StockQuote[] }>(`/stocks/hot`)
  return data.stocks || []
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  const data = await fetchAPI<{ results: SearchResult[] }>(`/search`, { q: query })
  return data.results || []
}

export async function getGoogleAnalyticsConfig(): Promise<GoogleAnalyticsConfig[]> {
  const data = await fetchAPI<{ analytics: GoogleAnalyticsConfig[] }>(`/admin/public/google-analytics`)
  return data.analytics || []
}
