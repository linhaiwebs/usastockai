/**
 * API 服务层 - 封装所有后端API调用
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * 搜索股票
 */
export async function searchStocks(query: string) {
  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('Failed to search stocks')
  return res.json()
}

/**
 * 获取热门股票
 */
export async function getHotStocks() {
  const res = await fetch(`${API_BASE}/api/stocks/hot`)
  if (!res.ok) throw new Error('Failed to get hot stocks')
  return res.json()
}

/**
 * 获取股票详情
 */
export async function getStockDetail(symbol: string) {
  const res = await fetch(`${API_BASE}/api/stocks/${symbol}`)
  if (!res.ok) throw new Error('Failed to get stock detail')
  return res.json()
}

/**
 * 获取分流链接信息
 */
export async function getRedirectInfo(id: number) {
  const res = await fetch(`${API_BASE}/api/redirects/${id}/info`)
  if (!res.ok) throw new Error('Failed to get redirect info')
  return res.json()
}

/**
 * 记录分流点击
 */
export async function recordRedirectClick(id: number) {
  const res = await fetch(`${API_BASE}/api/redirects/${id}/click`, { 
    method: 'POST' 
  })
  if (!res.ok) throw new Error('Failed to record click')
  return res.json()
}

/**
 * 获取AI分析流式URL
 */
export function getAnalyzeStreamUrl(query: string) {
  return `${API_BASE}/api/analyze?q=${encodeURIComponent(query)}`
}

/**
 * 获取股票分析流式URL
 */
export function getStockAnalyzeStreamUrl(symbol: string) {
  return `${API_BASE}/api/analyze/${symbol}`
}
