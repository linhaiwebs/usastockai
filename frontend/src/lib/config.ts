/**
 * 前端配置管理
 * 统一管理API地址配置，支持多项目部署
 */

/**
 * 获取 API 基础 URL
 * - 服务器端：使用 Docker 内部网络地址
 * - 客户端：
 *   - 如果配置了 NEXT_PUBLIC_API_URL，使用配置的地址（跨域访问）
 *   - 否则使用当前域名 + 配置的端口（同域名部署）
 */
export function getApiBase(): string {
  // 服务器端渲染时使用内部网络地址
  if (typeof window === 'undefined') {
    const internalUrl = process.env.NEXT_PUBLIC_API_URL_INTERNAL || 'http://backend:8000'
    console.log('[Server] API Internal URL:', internalUrl)
    return internalUrl
  }
  
  // 客户端：优先使用环境变量（用于跨域访问）
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    console.log('[Client] API URL from env:', apiUrl)
    return apiUrl
  }
  
  // 同域名部署：使用当前域名 + 配置的端口
  // 如果配置了API端口，则使用当前域名+端口
  const apiPort = process.env.NEXT_PUBLIC_API_PORT
  if (apiPort) {
    const url = `${window.location.protocol}//${window.location.hostname}:${apiPort}`
    console.log('[Client] API URL with port:', url)
    return url
  }
  
  // 完全同域名部署（通过nginx反向代理）：使用相对路径
  console.log('[Client] API URL: relative path (same domain)')
  return ''
}

