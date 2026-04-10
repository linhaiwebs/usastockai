/**
 * API 服务层 - 封装所有后端API调用
 */

import { getApiBase } from './config'

/**
 * 搜索股票
 */
export async function searchStocks(query: string) {
  const apiBase = getApiBase()
  const res = await fetch(`${apiBase}/api/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('Failed to search stocks')
  return res.json()
}

/**
 * 获取热门股票
 */
export async function getHotStocks() {
  const apiBase = getApiBase()
  const res = await fetch(`${apiBase}/api/stocks/hot`)
  if (!res.ok) throw new Error('Failed to get hot stocks')
  return res.json()
}

/**
 * 获取股票详情
 */
export async function getStockDetail(symbol: string) {
  const apiBase = getApiBase()
  const res = await fetch(`${apiBase}/api/stocks/${symbol}`)
  if (!res.ok) throw new Error('Failed to get stock detail')
  return res.json()
}

/**
 * 获取分流链接信息
 */
export async function getRedirectInfo(id: number) {
  const apiBase = getApiBase()
  const res = await fetch(`${apiBase}/api/redirects/${id}/info`)
  if (!res.ok) throw new Error('Failed to get redirect info')
  return res.json()
}

/**
 * 记录分流点击
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
 * 获取分配的分流链接
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
