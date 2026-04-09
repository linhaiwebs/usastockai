'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiCall, isAuthenticated, logout } from '@/lib/adminApi'

interface Redirect {
  id: number
  name: string
  url: string
  weight: number
  is_active: boolean
  click_count: number
  created_at: string
}

export default function DashboardPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    weight: 1,
    is_active: true
  })

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/adsadmin/login')
      return
    }
    
    loadRedirects()
  }, [router])

  const loadRedirects = async () => {
    try {
      const data = await apiCall('/api/admin/redirects')
      setRedirects(data.redirects)
    } catch (err: any) {
      setError(err.message || 'Failed to load redirects')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        await apiCall(`/api/admin/redirects/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        })
      } else {
        await apiCall('/api/admin/redirects', {
          method: 'POST',
          body: JSON.stringify(formData)
        })
      }
      
      // Reset form and reload
      setFormData({ name: '', url: '', weight: 1, is_active: true })
      setShowForm(false)
      setEditingId(null)
      loadRedirects()
    } catch (err: any) {
      setError(err.message || 'Failed to save redirect')
    }
  }

  const handleEdit = (redirect: Redirect) => {
    setFormData({
      name: redirect.name,
      url: redirect.url,
      weight: redirect.weight,
      is_active: redirect.is_active
    })
    setEditingId(redirect.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this redirect?')) return
    
    try {
      await apiCall(`/api/admin/redirects/${id}`, { method: 'DELETE' })
      loadRedirects()
    } catch (err: any) {
      setError(err.message || 'Failed to delete redirect')
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Redirect Management</h1>
            <p className="text-text-secondary mt-1">Manage your redirect links</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-loss/20 text-loss rounded-lg hover:bg-loss/30 transition-colors"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-loss/10 border border-loss/30 rounded-lg text-loss">
            {error}
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ name: '', url: '', weight: 1, is_active: true })
          }}
          className="mb-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add New Redirect'}
        </button>

        {/* Form */}
        {showForm && (
          <div className="mb-6 p-6 bg-surface border border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold text-text mb-4">
              {editingId ? 'Edit Redirect' : 'Add New Redirect'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-text focus:outline-none focus:border-primary"
                  placeholder="e.g., WhatsApp Support"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-text focus:outline-none focus:border-primary"
                  placeholder="https://wa.me/1234567890"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Weight (for random allocation)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-text focus:outline-none focus:border-primary"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm text-text-secondary">
                  Active
                </label>
              </div>
              
              <button
                type="submit"
                className="px-6 py-2 bg-hero-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        )}

        {/* Redirects Table */}
        <div className="bg-surface border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">URL</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-text">Weight</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-text">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-text">Clicks</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {redirects.map((redirect) => (
                <tr key={redirect.id} className="border-t border-gray-700">
                  <td className="px-4 py-3 text-text">{redirect.name}</td>
                  <td className="px-4 py-3 text-text-secondary text-sm max-w-xs truncate">
                    {redirect.url}
                  </td>
                  <td className="px-4 py-3 text-text text-center">{redirect.weight}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      redirect.is_active 
                        ? 'bg-profit/20 text-profit' 
                        : 'bg-loss/20 text-loss'
                    }`}>
                      {redirect.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text text-center">{redirect.click_count}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEdit(redirect)}
                      className="px-3 py-1 text-sm text-primary hover:underline mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(redirect.id)}
                      className="px-3 py-1 text-sm text-loss hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              
              {redirects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                    No redirects found. Click "Add New Redirect" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
