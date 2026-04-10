/**
 * 前端配置管理
 * 统一管理所有API地址和端口配置
 */

/**
 * 配置接口
 */
interface AppConfig {
  // API配置
  apiUrl: string
  apiUrlInternal: string
  
  // 默认端口
  defaultApiPort: number
  defaultFrontendPort: number
  
  // 其他配置
  defaultLocale: string
}

/**
 * 获取配置值
 */
function getConfig(): AppConfig {
  return {
    // API URL (客户端使用)
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
    
    // API URL Internal (服务器端渲染使用)
    apiUrlInternal: process.env.NEXT_PUBLIC_API_URL_INTERNAL || '',
    
    // 默认端口
    defaultApiPort: parseInt(process.env.NEXT_PUBLIC_DEFAULT_API_PORT || '8000', 10),
    defaultFrontendPort: parseInt(process.env.NEXT_PUBLIC_DEFAULT_FRONTEND_PORT || '3000', 10),
    
    // 默认语言
    defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en',
  }
}

/**
 * 获取 API 基础 URL
 * - 服务器端：使用 Docker 内部网络地址
 * - 客户端：使用外部可访问地址或相对路径
 */
export function getApiBase(): string {
  const config = getConfig()
  
  // 服务器端渲染时使用内部网络地址
  if (typeof window === 'undefined') {
    return config.apiUrlInternal || `http://backend:${config.defaultApiPort}`
  }
  
  // 客户端使用外部可访问地址
  if (config.apiUrl) {
    return config.apiUrl
  }
  
  // 如果没有配置，尝试使用当前页面的主机地址
  const protocol = window.location.protocol
  const host = window.location.hostname
  const port = window.location.port
  
  // 智能判断后端端口
  if (port && port !== String(config.defaultApiPort)) {
    // 前端使用自定义端口，后端应该在默认API端口
    return `${protocol}//${host}:${config.defaultApiPort}`
  } else if (port === String(config.defaultApiPort)) {
    // 如果前端就在API端口，说明可能使用了反向代理
    return `${protocol}//${host}${port ? ':' + port : ''}`
  } else {
    // 默认情况，使用配置的API端口
    return `${protocol}//${host}:${config.defaultApiPort}`
  }
}

/**
 * 导出配置实例
 */
export const appConfig = getConfig()
