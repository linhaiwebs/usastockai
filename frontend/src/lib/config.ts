/**
 * 前端配置管理
 * 统一管理API地址配置，支持多项目部署
 */

/**
 * 获取 API 基础 URL
 * - 服务器端：使用 Docker 内部网络地址
 * - 客户端：
 *   - 如果配置了 NEXT_PUBLIC_API_URL，使用配置的地址（跨域访问）
 *   - 否则使用相对路径（同域名部署，通过nginx反向代理）
 */
export function getApiBase(): string {
  // 服务器端渲染时使用内部网络地址
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL_INTERNAL || 'http://backend:8000'
  }
  
  // 客户端：优先使用环境变量（用于跨域访问）
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    return apiUrl
  }
  
  // 同域名部署：使用空字符串，让浏览器自动使用当前域名
  // 前端访问 /api/* 会通过nginx反向代理到后端
  return ''
}

