/**
 * Admin API Helper Functions
 */

import { getApiBase } from './config'

export async function apiCall(endpoint: string, options: any = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const apiBase = getApiBase()
  const url = `${apiBase}${endpoint}`
  
  console.log(`[Admin API] ${options.method || 'GET'} ${url}`)
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',  // 明确指定CORS模式
    })
    
    console.log(`[Admin API] Response status: ${response.status}`)
    
    // 处理401未授权错误
    if (response.status === 401) {
      // Token失效，清除本地存储并跳转到登录页
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_username')
        
        // 如果当前不在登录页，跳转到登录页
        if (!window.location.pathname.includes('/adsadmin/login')) {
          console.log('[Admin API] Token expired, redirecting to login')
          window.location.href = '/adsadmin/login?expired=true'
        }
      }
      throw new Error('Token expired or invalid')
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      console.error('[Admin API] Error:', error)
      throw new Error(error.detail || 'Request failed')
    }
    
    return response.json()
  } catch (error: any) {
    console.error('[Admin API] Fetch error:', error)
    throw error
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('admin_token')
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
    window.location.href = '/adsadmin/login'
  }
}
