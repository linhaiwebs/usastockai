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

interface GoogleAnalyticsConfig {
  id: number
  tracking_id: string
  conversion_label: string | null
  is_enabled: boolean
  created_at: string
  updated_at: string
}

type TabType = 'redirects' | 'analytics'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('redirects')
  const [redirects, setRedirects] = useState<Redirect[]>([])
  const [analyticsConfigs, setAnalyticsConfigs] = useState<GoogleAnalyticsConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  // Redirect form state
  const [showRedirectForm, setShowRedirectForm] = useState(false)
  const [editingRedirectId, setEditingRedirectId] = useState<number | null>(null)
  const [redirectFormData, setRedirectFormData] = useState({
    name: '',
    url: '',
    weight: 1,
    is_active: true
  })

  // Analytics form state
  const [showAnalyticsForm, setShowAnalyticsForm] = useState(false)
  const [editingAnalyticsId, setEditingAnalyticsId] = useState<number | null>(null)
  const [analyticsFormData, setAnalyticsFormData] = useState({
    tracking_id: '',
    conversion_label: '',
    is_enabled: true
  })

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/adsadmin/login')
      return
    }
    
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      await Promise.all([loadRedirects(), loadAnalytics()])
    } finally {
      setLoading(false)
    }
  }

  const loadRedirects = async () => {
    try {
      const data = await apiCall('/api/admin/redirects')
      setRedirects(data.redirects)
    } catch (err: any) {
      setError(err.message || 'Failed to load redirects')
    }
  }

  const loadAnalytics = async () => {
    try {
      const data = await apiCall('/api/admin/google-analytics')
      setAnalyticsConfigs(data.analytics)
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics')
    }
  }

  // Redirect handlers
  const handleRedirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingRedirectId) {
        await apiCall(`/api/admin/redirects/${editingRedirectId}`, {
          method: 'PUT',
          body: JSON.stringify(redirectFormData)
        })
      } else {
        await apiCall('/api/admin/redirects', {
          method: 'POST',
          body: JSON.stringify(redirectFormData)
        })
      }
      
      setRedirectFormData({ name: '', url: '', weight: 1, is_active: true })
      setShowRedirectForm(false)
      setEditingRedirectId(null)
      loadRedirects()
    } catch (err: any) {
      setError(err.message || 'Failed to save redirect')
    }
  }

  const handleEditRedirect = (redirect: Redirect) => {
    setRedirectFormData({
      name: redirect.name,
      url: redirect.url,
      weight: redirect.weight,
      is_active: redirect.is_active
    })
    setEditingRedirectId(redirect.id)
    setShowRedirectForm(true)
  }

  const handleDeleteRedirect = async (id: number) => {
    if (!confirm('Are you sure you want to delete this redirect?')) return
    
    try {
      await apiCall(`/api/admin/redirects/${id}`, { method: 'DELETE' })
      loadRedirects()
    } catch (err: any) {
      setError(err.message || 'Failed to delete redirect')
    }
  }

  // Analytics handlers
  const handleAnalyticsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        tracking_id: analyticsFormData.tracking_id,
        conversion_label: analyticsFormData.conversion_label || null,
        is_enabled: analyticsFormData.is_enabled
      }
      
      if (editingAnalyticsId) {
        await apiCall(`/api/admin/google-analytics/${editingAnalyticsId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
      } else {
        await apiCall('/api/admin/google-analytics', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
      }
      
      setAnalyticsFormData({ tracking_id: '', conversion_label: '', is_enabled: true })
      setShowAnalyticsForm(false)
      setEditingAnalyticsId(null)
      loadAnalytics()
    } catch (err: any) {
      setError(err.message || 'Failed to save analytics configuration')
    }
  }

  const handleEditAnalytics = (config: GoogleAnalyticsConfig) => {
    setAnalyticsFormData({
      tracking_id: config.tracking_id,
      conversion_label: config.conversion_label || '',
      is_enabled: config.is_enabled
    })
    setEditingAnalyticsId(config.id)
    setShowAnalyticsForm(true)
  }

  const handleDeleteAnalytics = async (id: number) => {
    if (!confirm('Are you sure you want to delete this Google Analytics configuration?')) return
    
    try {
      await apiCall(`/api/admin/google-analytics/${id}`, { method: 'DELETE' })
      loadAnalytics()
    } catch (err: any) {
      setError(err.message || 'Failed to delete analytics configuration')
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
            <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
            <p className="text-text-secondary mt-1">Manage your system</p>
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

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('redirects')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'redirects'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              Redirect Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              Google Analytics
            </button>
          </div>
        </div>

        {/* Redirect Management Tab */}
        {activeTab === 'redirects' && (
          <>
            <button
              onClick={() => {
                setShowRedirectForm(!showRedirectForm)
                setEditingRedirectId(null)
                setRedirectFormData({ name: '', url: '', weight: 1, is_active: true })
              }}
              className="mb-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              {showRedirectForm ? 'Cancel' : '+ Add New Redirect'}
            </button>

            {showRedirectForm && (
              <div className="mb-6 p-6 bg-surface border border-gray-700 rounded-lg">
                <h2 className="text-xl font-semibold text-text mb-4">
                  {editingRedirectId ? 'Edit Redirect' : 'Add New Redirect'}
                </h2>
                <form onSubmit={handleRedirectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={redirectFormData.name}
                      onChange={(e) => setRedirectFormData({ ...redirectFormData, name: e.target.value })}
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
                      value={redirectFormData.url}
                      onChange={(e) => setRedirectFormData({ ...redirectFormData, url: e.target.value })}
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
                      value={redirectFormData.weight}
                      onChange={(e) => setRedirectFormData({ ...redirectFormData, weight: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-text focus:outline-none focus:border-primary"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="redirect_is_active"
                      checked={redirectFormData.is_active}
                      onChange={(e) => setRedirectFormData({ ...redirectFormData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="redirect_is_active" className="text-sm text-text-secondary">
                      Active
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    className="px-6 py-2 bg-hero-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {editingRedirectId ? 'Update' : 'Create'}
                  </button>
                </form>
              </div>
            )}

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
                          onClick={() => handleEditRedirect(redirect)}
                          className="px-3 py-1 text-sm text-primary hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRedirect(redirect.id)}
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
          </>
        )}

        {/* Google Analytics Tab */}
        {activeTab === 'analytics' && (
          <>
            <button
              onClick={() => {
                setShowAnalyticsForm(!showAnalyticsForm)
                setEditingAnalyticsId(null)
                setAnalyticsFormData({ tracking_id: '', conversion_label: '', is_enabled: true })
              }}
              className="mb-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              {showAnalyticsForm ? 'Cancel' : '+ Add Google Analytics'}
            </button>

            {showAnalyticsForm && (
              <div className="mb-6 p-6 bg-surface border border-gray-700 rounded-lg">
                <h2 className="text-xl font-semibold text-text mb-4">
                  {editingAnalyticsId ? 'Edit Google Analytics' : 'Add Google Analytics'}
                </h2>
                <form onSubmit={handleAnalyticsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Tracking ID
                    </label>
                    <input
                      type="text"
                      value={analyticsFormData.tracking_id}
                      onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, tracking_id: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-text focus:outline-none focus:border-primary"
                      placeholder="e.g., AW-17303658824, G-BDPP2WPMQR"
                      required
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      Examples: AW-17303658824 (Google Ads), G-BDPP2WPMQR (GA4)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Conversion Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={analyticsFormData.conversion_label}
                      onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, conversion_label: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-text focus:outline-none focus:border-primary"
                      placeholder="e.g., KrXGCNHaoZQcEMjCg7tA"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      For Google Ads conversion tracking: AW-17303658824/KrXGCNHaoZQcEMjCg7tA
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="analytics_is_enabled"
                      checked={analyticsFormData.is_enabled}
                      onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, is_enabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="analytics_is_enabled" className="text-sm text-text-secondary">
                      Enabled
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    className="px-6 py-2 bg-hero-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {editingAnalyticsId ? 'Update' : 'Create'}
                  </button>
                </form>
              </div>
            )}

            <div className="bg-surface border border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-background">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text">Tracking ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text">Conversion Label</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-text">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsConfigs.map((config) => (
                    <tr key={config.id} className="border-t border-gray-700">
                      <td className="px-4 py-3 text-text font-mono">{config.tracking_id}</td>
                      <td className="px-4 py-3 text-text-secondary font-mono">
                        {config.conversion_label || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          config.is_enabled 
                            ? 'bg-profit/20 text-profit' 
                            : 'bg-loss/20 text-loss'
                        }`}>
                          {config.is_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleEditAnalytics(config)}
                          className="px-3 py-1 text-sm text-primary hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAnalytics(config.id)}
                          className="px-3 py-1 text-sm text-loss hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {analyticsConfigs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                        No Google Analytics configurations found. Click "Add Google Analytics" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
