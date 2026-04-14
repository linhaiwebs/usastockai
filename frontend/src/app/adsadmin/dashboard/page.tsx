'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiCall, isAuthenticated, logout } from '@/lib/adminApi'

interface Redirect {
  id: number
  name: string
  url: string
  suffix: string | null  // 添加suffix字段
  weight: number
  is_active: boolean
  click_count: number
  created_at: string
}

interface GoogleAnalyticsConfig {
  id: number
  ads_tracking_id: string | null
  ga4_property_id: string | null
  conversion_id: string | null
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
    suffix: '',  // 添加suffix字段
    weight: 1,
    is_active: true
  })

  // Analytics form state
  const [showAnalyticsForm, setShowAnalyticsForm] = useState(false)
  const [editingAnalyticsId, set编辑ingAnalyticsId] = useState<number | null>(null)
  const [analyticsFormData, setAnalyticsFormData] = useState({
    ads_tracking_id: '',
    ga4_property_id: '',
    conversion_id: '',
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
      setError(err.message || '加载分流链接失败')
    }
  }

  const loadAnalytics = async () => {
    try {
      const data = await apiCall('/api/admin/google-analytics')
      setAnalyticsConfigs(data.analytics)
    } catch (err: any) {
      setError(err.message || '加载谷歌统计配置失败')
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
      
      setRedirectFormData({ name: '', url: '', suffix: '', weight: 1, is_active: true })
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
      suffix: redirect.suffix || '',  // 添加suffix字段
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
        ads_tracking_id: analyticsFormData.ads_tracking_id || null,
        ga4_property_id: analyticsFormData.ga4_property_id || null,
        conversion_id: analyticsFormData.conversion_id || null,
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
      
      setAnalyticsFormData({ ads_tracking_id: '', ga4_property_id: '', conversion_id: '', is_enabled: true })
      setShowAnalyticsForm(false)
      set编辑ingAnalyticsId(null)
      loadAnalytics()
    } catch (err: any) {
      setError(err.message || '保存谷歌统计配置失败')
    }
  }

  const handle编辑Analytics = (config: GoogleAnalyticsConfig) => {
    setAnalyticsFormData({
      ads_tracking_id: config.ads_tracking_id || '',
      ga4_property_id: config.ga4_property_id || '',
      conversion_id: config.conversion_id || '',
      is_enabled: config.is_enabled
    })
    set编辑ingAnalyticsId(config.id)
    setShowAnalyticsForm(true)
  }

  const handle删除Analytics = async (id: number) => {
    if (!confirm('确定要删除此谷歌统计配置吗？')) return
    
    try {
      await apiCall(`/api/admin/google-analytics/${id}`, { method: 'DELETE' })
      loadAnalytics()
    } catch (err: any) {
      setError(err.message || '删除谷歌统计配置失败')
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt">
        <div className="text-text-brand">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-alt p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-brand">Admin Dashboard</h1>
            <p className="text-text-secondary mt-1">Manage your system</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-error/20 text-error rounded-lg hover:bg-error/30 transition-colors"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-error/10 border border-loss/30 rounded-lg text-error">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-border-default">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('redirects')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'redirects'
                  ? 'text-brand border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              Redirect Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-brand border-b-2 border-primary'
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
                setRedirectFormData({ name: '', url: '', suffix: '', weight: 1, is_active: true })
              }}
              className="mb-6 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/80 transition-colors"
            >
              {showRedirectForm ? 'Cancel' : '+ Add New Redirect'}
            </button>

            {showRedirectForm && (
              <div className="mb-6 p-6 bg-white border border-border-default rounded-lg">
                <h2 className="text-xl font-semibold text-text-brand mb-4">
                  {editingRedirectId ? '编辑 Redirect' : 'Add New Redirect'}
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
                      className="w-full px-4 py-2 bg-surface-alt border border-border-default rounded-lg text-text-brand focus:outline-none focus:border-brand"
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
                      className="w-full px-4 py-2 bg-surface-alt border border-border-default rounded-lg text-text-brand focus:outline-none focus:border-brand"
                      placeholder="https://wa.me/1234567890?text="
                      required
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      基础URL，可包含查询参数，例如: https://wa.me/1234567890?text=
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      自定义后缀 (Suffix)
                    </label>
                    <input
                      type="text"
                      value={redirectFormData.suffix}
                      onChange={(e) => setRedirectFormData({ ...redirectFormData, suffix: e.target.value })}
                      className="w-full px-4 py-2 bg-surface-alt border border-border-default rounded-lg text-text-brand focus:outline-none focus:border-brand"
                      placeholder="我是自定义后缀文案"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      可选。将拼接在URL后面。示例：URL填写 https://wa.me/1234567890?text=，后缀填写 "你好"，最终链接为 https://wa.me/1234567890?text=你好
                    </p>
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
                      className="w-full px-4 py-2 bg-surface-alt border border-border-default rounded-lg text-text-brand focus:outline-none focus:border-brand"
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
                    className="px-6 py-2 bg-brand text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {editingRedirectId ? 'Update' : 'Create'}
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white border border-border-default rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-surface-alt">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-brand">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-brand">URL</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-brand">Suffix</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-text-brand">Weight</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-text-brand">状态</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-text-brand">Clicks</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-text-brand">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {redirects.map((redirect) => (
                    <tr key={redirect.id} className="border-t border-border-default">
                      <td className="px-4 py-3 text-text-brand">{redirect.name}</td>
                      <td className="px-4 py-3 text-text-secondary text-sm max-w-xs truncate">
                        {redirect.url}
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-sm max-w-xs truncate">
                        {redirect.suffix || '-'}
                      </td>
                      <td className="px-4 py-3 text-text-brand text-center">{redirect.weight}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          redirect.is_active 
                            ? 'bg-success/10 text-success' 
                            : 'bg-error/20 text-error'
                        }`}>
                          {redirect.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-brand text-center">{redirect.click_count}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleEditRedirect(redirect)}
                          className="px-3 py-1 text-sm text-brand hover:underline mr-2"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteRedirect(redirect.id)}
                          className="px-3 py-1 text-sm text-error hover:underline"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {redirects.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
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
                set编辑ingAnalyticsId(null)
                setAnalyticsFormData({ ads_tracking_id: '', ga4_property_id: '', conversion_id: '', is_enabled: true })
              }}
              className="mb-6 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/80 transition-colors"
            >
              {showAnalyticsForm ? '取消' : '+ 添加谷歌统计'}
            </button>

            {showAnalyticsForm && (
              <div className="mb-6 p-6 bg-white border border-border-default rounded-lg">
                <h2 className="text-xl font-semibold text-text-brand mb-4">
                  {editingAnalyticsId ? '编辑 Google Analytics' : 'Add Google Analytics'}
                </h2>
                <form onSubmit={handleAnalyticsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Google Ads Tracking ID
                    </label>
                    <input
                      type="text"
                      value={analyticsFormData.ads_tracking_id}
                      onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, ads_tracking_id: e.target.value })}
                      className="w-full px-4 py-2 bg-surface-alt border border-border-default rounded-lg text-text-brand focus:outline-none focus:border-brand"
                      placeholder="e.g., AW-17303658824"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      Google Ads转化跟踪ID（以AW-开头）
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      GA4 Property ID
                    </label>
                    <input
                      type="text"
                      value={analyticsFormData.ga4_property_id}
                      onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, ga4_property_id: e.target.value })}
                      className="w-full px-4 py-2 bg-surface-alt border border-border-default rounded-lg text-text-brand focus:outline-none focus:border-brand"
                      placeholder="e.g., G-BDPP2WPMQR"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      Google Analytics 4媒体资源ID（以G-开头）
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Conversion ID
                    </label>
                    <input
                      type="text"
                      value={analyticsFormData.conversion_id}
                      onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, conversion_id: e.target.value })}
                      className="w-full px-4 py-2 bg-surface-alt border border-border-default rounded-lg text-text-brand focus:outline-none focus:border-brand"
                      placeholder="e.g., AW-17303658824/KrXGCNHaoZQcEMjCg7tA"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      完整的转化ID（用于转化跟踪）
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
                      启用
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brand text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {editingAnalyticsId ? 'Update' : 'Create'}
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white border border-border-default rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-surface-alt">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-brand">Ads Tracking ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-brand">GA4 Property ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-brand">Conversion ID</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-text-brand">状态</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-text-brand">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsConfigs.map((config) => (
                    <tr key={config.id} className="border-t border-border-default">
                      <td className="px-4 py-3 text-text-brand font-mono">{config.ads_tracking_id || '-'}</td>
                      <td className="px-4 py-3 text-text-brand font-mono">{config.ga4_property_id || '-'}</td>
                      <td className="px-4 py-3 text-text-secondary font-mono">
                        {config.conversion_id || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          config.is_enabled 
                            ? 'bg-success/10 text-success' 
                            : 'bg-error/20 text-error'
                        }`}>
                          {config.is_enabled ? '启用' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handle编辑Analytics(config)}
                          className="px-3 py-1 text-sm text-brand hover:underline mr-2"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handle删除Analytics(config.id)}
                          className="px-3 py-1 text-sm text-error hover:underline"
                        >
                          删除
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
