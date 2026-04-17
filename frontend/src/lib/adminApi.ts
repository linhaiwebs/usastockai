/**
 * Admin API Helper Functions
 */

import { API_BASE } from './config'

export async function apiCall(endpoint: string, options: any = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null

  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_BASE}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_username')
        if (!window.location.pathname.includes('/adsadmin/login')) {
          window.location.href = '/adsadmin/login?expired=true'
        }
      }
      throw new Error('Token expired or invalid')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(error.detail || 'Request failed')
    }

    return response.json()
  } catch (error: any) {
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
