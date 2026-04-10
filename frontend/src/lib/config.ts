/**
 * 前端配置管理
 * 统一管理API地址配置，支持多项目部署
 */

/**
 * 获取 API 基础 URL
 * - 服务器端：使用 Docker 内部网络地址
 * - 客户端：使用外部可访问地址
 */
export function getApiBase(): string {
  // 服务器端渲染时使用内部网络地址
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL_INTERNAL || 'http://backend:8000'
  }
  
  // 客户端：优先使用环境变量，否则使用当前主机
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    return apiUrl
  }
  
  // 自动推断：使用当前主机的默认端口8000
  const protocol = window.location.protocol
  const host = window.location.hostname
  return `${protocol}//${host}:8000`
}
