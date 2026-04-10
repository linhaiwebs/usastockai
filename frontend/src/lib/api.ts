/**
 * API 服务层 - 封装所有后端API调用，带缓存和性能优化
 */

import { getApiBase } from './config'

// 简单的内存缓存
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30000 // 30秒缓存

/**
 * 带缓存的fetch封装
 */
async function cachedFetch(url: string, options?: RequestInit) {
  const cacheKey = `${url}-${JSON.stringify(options)}`
  const cached = cache.get(cacheKey)
  
  // 如果缓存有效，直接返回
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  
  // 否则发起请求
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  
  const data = await res.json()
  
  // 缓存结果
  cache.set(cacheKey, { data, timestamp: Date.now() })
  
  return data
}

/**
 * 搜索股票
 */
export async function searchStocks(query: string) {
  const apiBase = getApiBase()
  return cachedFetch(`${apiBase}/api/search?q=${encodeURIComponent(query)}`)
}

/**
 * 获取热门股票
 */
export async function getHotStocks() {
  const apiBase = getApiBase()
  return cachedFetch(`${apiBase}/api/stocks/hot`)
}

/**
 * 获取股票详情
 */
export async function getStockDetail(symbol: string) {
  const apiBase = getApiBase()
  return cachedFetch(`${apiBase}/api/stocks/${symbol}`)
}

/**
 * 获取分流链接信息
 */
export async function getRedirectInfo(id: number) {
  const apiBase = getApiBase()
  return cachedFetch(`${apiBase}/api/redirects/${id}/info`)
}

/**
 * 记录分流点击（不缓存）
 */
export async function recordRedirectClick(id: number) {
  const apiBase = getApiBase()
  const res = await fetch(`${apiBase}/api/redirects/${id}/click`, { 
    method: 'POST' 
  })
  if (!res.ok) throw new Error('Failed to record click')
  return res.json()
}

/**
 * 获取分配的分流链接（不缓存）
 */
export async function assignRedirect() {
  const apiBase = getApiBase()
  const res = await fetch(`${apiBase}/api/redirects/assign`)
  if (!res.ok) throw new Error('Failed to assign redirect')
  return res.json()
}

/**
 * Check if query is a stock symbol (1-5 uppercase letters)
 */
function isStockSymbol(query: string): boolean {
  const symbolPattern = /^[A-Z]{1,5}$/
  return symbolPattern.test(query.trim().toUpperCase())
}

/**
 * Get AI analysis stream URL - intelligently choose endpoint
 * - Stock symbol (e.g., AAPL, TSLA) → /api/analyze/{symbol}
 * - General query → /api/analyze?q=...
 */
export function getAnalyzeStreamUrl(query: string) {
  const apiBase = getApiBase()
  const trimmedQuery = query.trim().toUpperCase()
  
  // If it's a stock symbol, use the stock analysis endpoint
  if (isStockSymbol(query)) {
    return `${apiBase}/api/analyze/${trimmedQuery}`
  }
  
  // Otherwise, use the general query endpoint
  return `${apiBase}/api/analyze?q=${encodeURIComponent(query)}`
}

/**
 * 获取股票分析流式URL
 */
export function getStockAnalyzeStreamUrl(symbol: string) {
  const apiBase = getApiBase()
  return `${apiBase}/api/analyze/${symbol}`
}

/**
 * 获取通用分析流式URL
 */
export function getGeneralAnalyzeStreamUrl(stockName: string, price: number) {
  const apiBase = getApiBase()
  return `${apiBase}/api/analyze-general/${encodeURIComponent(stockName)}?price=${price}`
}
