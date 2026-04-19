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
      const data = await apiCall('/admin/login', {
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
    <div className="min-h-screen flex items-center justify-center bg-[#070d1f] px-4">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#99f7ff] font-headline">Admin Login</h1>
          <p className="text-[#a5aac2] mt-2">Cosmic Intel Administration</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl border border-[#99f7ff]/20 p-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#a5aac2] mb-2">Username</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0c1326] border border-[#41475b] rounded-lg text-[#dfe4fe] focus:outline-none focus:border-[#99f7ff]" placeholder="Enter username" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#a5aac2] mb-2">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0c1326] border border-[#41475b] rounded-lg text-[#dfe4fe] focus:outline-none focus:border-[#99f7ff]" placeholder="Enter password" required />
          </div>
          {error && <p className="text-[#ff716c] text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#99f7ff] text-[#070d1f] font-semibold rounded-lg hover:bg-[#00e2ee] transition-colors disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
