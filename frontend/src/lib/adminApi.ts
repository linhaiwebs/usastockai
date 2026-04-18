/**
 * Admin panel API utilities
 */
import { API_ENDPOINT } from './config'

export async function apiCall(endpoint: string, opts: any = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const hdrs: any = { 'Content-Type': 'application/json', ...opts.headers }
  if (token) hdrs['Authorization'] = `Bearer ${token}`

  try {
    const resp = await fetch(`${API_ENDPOINT}${endpoint}`, { ...opts, headers: hdrs })
    if (resp.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_username')
        if (!window.location.pathname.includes('/adsadmin/login')) {
          window.location.href = '/adsadmin/login?expired=true'
        }
      }
      throw new Error('Session expired')
    }
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(err.detail || 'Request failed')
    }
    return resp.json()
  } catch (e: any) { throw e }
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

export const adminFetch = apiCall
export const checkAdminAuth = isAuthenticated
export const clearAdminSession = logout
