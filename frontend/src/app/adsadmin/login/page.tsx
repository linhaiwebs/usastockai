'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiCall } from '@/lib/adminApi'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await apiCall('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })
      localStorage.setItem('admin_token', data.access_token)
      localStorage.setItem('admin_username', data.username)
      router.push('/adsadmin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Admin Login</h1>
          <p className="text-text-secondary mt-2">Planet Discovery Admin</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-default shadow-card p-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-2">Username</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-alt border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-brand" placeholder="Enter username" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-alt border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-brand" placeholder="Enter password" required />
          </div>
          {error && <p className="text-error text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
