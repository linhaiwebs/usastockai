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
  const response = await fetch(`${apiBase}${endpoint}`, {
    ...options,
    headers
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || 'Request failed')
  }
  
  return response.json()
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
