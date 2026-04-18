import { API_ENDPOINT } from './config'

export interface StockInfo {
  symbol: string
  name: string
  price: number
  change: number
  change_percent: number
  volume: number
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

export interface StockSearchResult {
  symbol: string
  name: string
  type: string
  exchange: string
}

export interface StockSearchResponse {
  results: StockSearchResult[]
  total: number
  page: number
  limit: number
}

export interface GAConfig {
  ads_tracking_id: string | null
  ga4_property_id: string | null
  conversion_id: string | null
}

async function requestAPI<T>(path: string, qs?: Record<string, string>): Promise<T> {
  const params = qs ? '?' + new URLSearchParams(qs).toString() : ''
  const resp = await fetch(`${API_ENDPOINT}${path}${params}`)
  if (!resp.ok) throw new Error(`API error ${resp.status}`)
  return resp.json()
}

export async function fetchStockQuote(ticker: string): Promise<StockInfo> {
  const res = await requestAPI<{ stocks: StockInfo[] } | StockInfo>(`/stocks/${encodeURIComponent(ticker)}`)
  if ('symbol' in res) return res
  throw new Error('Stock not found')
}

export async function fetchHotStocks(): Promise<StockInfo[]> {
  const res = await requestAPI<{ stocks: StockInfo[] }>('/stocks/hot')
  return res.stocks || []
}

export async function fetchSearchResults(term: string, pg: number = 1, lim: number = 5): Promise<StockSearchResponse> {
  return requestAPI<StockSearchResponse>('/search', { q: term, page: String(pg), limit: String(lim) })
}

export async function fetchGAConfig(): Promise<GAConfig[]> {
  const res = await requestAPI<{ analytics: GAConfig[] }>('/admin/public/google-analytics')
  return res.analytics || []
}
