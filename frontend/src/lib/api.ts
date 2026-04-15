import { API_BASE } from './config'

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  change_percent: number
  volume: number
  // 扩展字段
  market_cap?: number
  pe_ratio?: number | null
  dividend_yield?: number | null
  fifty_two_week_high?: number | null
  fifty_two_week_low?: number | null
  beta?: number | null
  sector?: string
  industry?: string
  day_high?: number | null
  day_low?: number | null
  open?: number | null
  prev_close?: number | null
  avg_volume?: number | null
  eps?: number | null
  target_mean_price?: number | null
  currency?: string
  exchange?: string
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
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  const url = `${API_BASE}${endpoint}${query}`
  const res = await fetch(url)
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
