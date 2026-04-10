/**
 * 前端配置管理
 * 统一管理API地址配置，支持多项目部署
 */

/**
 * 获取 API 基础 URL
 * - 服务器端：使用 Docker 内部网络地址
 * - 客户端：
 *   - 如果配置了 NEXT_PUBLIC_API_URL，使用配置的地址（跨域访问）
 *   - 如果是nginx反向代理（同域名同端口），使用相对路径
 *   - 否则使用当前域名 + 配置的端口（同域名不同端口）
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
  
  // 检查是否是nginx反向代理场景（同域名同端口）
  // 如果当前访问的端口是80或443（默认HTTP/HTTPS端口），使用相对路径
  const currentPort = window.location.port
  const isDefaultPort = !currentPort || currentPort === '80' || currentPort === '443'
  
  if (isDefaultPort) {
    // nginx反向代理场景：使用相对路径，nginx会将/api代理到后端
    console.log('[Client] API URL: relative path (nginx proxy, default port)')
    return ''
  }
  
  // 同域名不同端口（开发/测试环境）
  // 用户通过非默认端口访问前端（如 http://localhost:3000）
  // 需要调用后端的不同端口（如 http://localhost:8000）
  const apiPort = process.env.NEXT_PUBLIC_API_PORT
  if (apiPort) {
    const url = `${window.location.protocol}//${window.location.hostname}:${apiPort}`
    console.log('[Client] API URL with port:', url)
    return url
  }
  
  // 默认：使用相对路径
  console.log('[Client] API URL: relative path (default)')
  return ''
}

