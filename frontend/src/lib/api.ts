/**
 * API 服务层 - 封装所有后端API调用
 */

/**
 * 获取 API 基础 URL
 * - 服务器端：使用 Docker 内部网络地址 (http://backend:8000)
 * - 客户端：使用外部可访问地址或相对路径
 */
function getApiBase(): string {
  // 服务器端渲染时使用内部网络地址
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL_INTERNAL || 'http://backend:8000'
  }
  
  // 客户端使用外部可访问地址
  // 优先使用环境变量，否则使用当前页面的主机地址
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  
  if (apiUrl) {
    return apiUrl
  }
  
  // 如果没有配置，尝试使用当前页面的主机地址
  // 支持自定义端口
  const protocol = window.location.protocol // http: or https:
  const host = window.location.hostname
  const port = window.location.port
  
  // 如果前端和后端使用不同端口，后端默认使用 8000
  // 如果使用反向代理，可能使用相同端口
  if (port && port !== '8000') {
    // 前端使用自定义端口，后端应该在 8000 端口
    return `${protocol}//${host}:8000`
  } else if (port === '8000') {
    // 如果前端就在 8000 端口，说明可能使用了反向代理
    return `${protocol}//${host}${port ? ':' + port : ''}`
  } else {
    // 默认情况，使用 8000 端口
    return `${protocol}//${host}:8000`
  }
}

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
 * 获取AI分析流式URL
 */
export function getAnalyzeStreamUrl(query: string) {
  const apiBase = getApiBase()
  return `${apiBase}/api/analyze?q=${encodeURIComponent(query)}`
}

/**
 * 获取股票分析流式URL
 */
export function getStockAnalyzeStreamUrl(symbol: string) {
  const apiBase = getApiBase()
  return `${apiBase}/api/analyze/${symbol}`
}
