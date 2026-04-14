const API_BASE = '/api'

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

async function fetchAPI<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(endpoint, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const data = await fetchAPI<{ stocks: StockQuote[] } | StockQuote>(`${API_BASE}/stocks/${encodeURIComponent(symbol)}`)
  // Handle both direct object and wrapped response
  if ('symbol' in data) return data
  throw new Error('Stock not found')
}

export async function getHotStocks(): Promise<StockQuote[]> {
  const data = await fetchAPI<{ stocks: StockQuote[] }>(`${API_BASE}/stocks/hot`)
  return data.stocks || []
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  const data = await fetchAPI<{ results: SearchResult[] }>(`${API_BASE}/search`, { q: query })
  return data.results || []
}
