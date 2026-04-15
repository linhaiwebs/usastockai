'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiCall, isAuthenticated, logout } from '@/lib/adminApi'

interface Redirect {
  id: number
  name: string
  url: string
  suffix: string | null
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

  const [showRedirectForm, setShowRedirectForm] = useState(false)
  const [editingRedirectId, setEditingRedirectId] = useState<number | null>(null)
  const [redirectFormData, setRedirectFormData] = useState({
    name: '', url: '', suffix: '', weight: 1, is_active: true
  })

  const [showAnalyticsForm, setShowAnalyticsForm] = useState(false)
  const [editingAnalyticsId, setEditingAnalyticsId] = useState<number | null>(null)
  const [analyticsFormData, setAnalyticsFormData] = useState({
    ads_tracking_id: '', ga4_property_id: '', conversion_id: '', is_enabled: true
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
      const data = await apiCall('/admin/redirects')
      setRedirects(data.redirects)
    } catch (err: any) {
      setError(err.message || '加载分流链接失败')
    }
  }

  const loadAnalytics = async () => {
    try {
      const data = await apiCall('/admin/google-analytics')
      setAnalyticsConfigs(data.analytics)
    } catch (err: any) {
      setError(err.message || '加载谷歌统计配置失败')
    }
  }

  const handleRedirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingRedirectId) {
        await apiCall(`/admin/redirects/${editingRedirectId}`, {
          method: 'PUT', body: JSON.stringify(redirectFormData)
        })
      } else {
        await apiCall('/admin/redirects', {
          method: 'POST', body: JSON.stringify(redirectFormData)
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
      name: redirect.name, url: redirect.url, suffix: redirect.suffix || '',
      weight: redirect.weight, is_active: redirect.is_active
    })
    setEditingRedirectId(redirect.id)
    setShowRedirectForm(true)
  }

  const handleDeleteRedirect = async (id: number) => {
    if (!confirm('Are you sure you want to delete this redirect?')) return
    try {
      await apiCall(`/admin/redirects/${id}`, { method: 'DELETE' })
      loadRedirects()
    } catch (err: any) {
      setError(err.message || 'Failed to delete redirect')
    }
  }

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
        await apiCall(`/admin/google-analytics/${editingAnalyticsId}`, {
          method: 'PUT', body: JSON.stringify(payload)
        })
      } else {
        await apiCall('/admin/google-analytics', {
          method: 'POST', body: JSON.stringify(payload)
        })
      }
      setAnalyticsFormData({ ads_tracking_id: '', ga4_property_id: '', conversion_id: '', is_enabled: true })
      setShowAnalyticsForm(false)
      setEditingAnalyticsId(null)
      loadAnalytics()
    } catch (err: any) {
      setError(err.message || '保存谷歌统计配置失败')
    }
  }

  const handleEditAnalytics = (config: GoogleAnalyticsConfig) => {
    setAnalyticsFormData({
      ads_tracking_id: config.ads_tracking_id || '',
      ga4_property_id: config.ga4_property_id || '',
      conversion_id: config.conversion_id || '',
      is_enabled: config.is_enabled
    })
    setEditingAnalyticsId(config.id)
    setShowAnalyticsForm(true)
  }

  const handleDeleteAnalytics = async (id: number) => {
    if (!confirm('确定要删除此谷歌统计配置吗？')) return
    try {
      await apiCall(`/admin/google-analytics/${id}`, { method: 'DELETE' })
      loadAnalytics()
    } catch (err: any) {
      setError(err.message || '删除谷歌统计配置失败')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070d1f]">
        <div className="text-[#99f7ff]">Loading...</div>
      </div>
    )
  }

  const inputCls = "w-full px-4 py-2 bg-[#0c1326] border border-[#41475b] rounded-lg text-[#dfe4fe] focus:outline-none focus:border-[#99f7ff]"

  return (
    <div className="min-h-screen bg-[#070d1f] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#99f7ff]">Admin Dashboard</h1>
            <p className="text-[#a5aac2] mt-1">Manage your system</p>
          </div>
          <button onClick={logout}
            className="px-4 py-2 bg-[#ff716c]/20 text-[#ff716c] rounded-lg hover:bg-[#ff716c]/30 transition-colors">
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-[#ff716c]/10 border border-[#ff716c]/30 rounded-lg text-[#ff716c]">
            {error}
          </div>
        )}

        <div className="mb-6 border-b border-[#41475b]">
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('redirects')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'redirects' ? 'text-[#99f7ff] border-b-2 border-[#99f7ff]' : 'text-[#a5aac2] hover:text-[#dfe4fe]'
              }`}>
              Redirect Management
            </button>
            <button onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'analytics' ? 'text-[#99f7ff] border-b-2 border-[#99f7ff]' : 'text-[#a5aac2] hover:text-[#dfe4fe]'
              }`}>
              Google Analytics
            </button>
          </div>
        </div>

        {activeTab === 'redirects' && (
          <>
            <button onClick={() => { setShowRedirectForm(!showRedirectForm); setEditingRedirectId(null); setRedirectFormData({ name: '', url: '', suffix: '', weight: 1, is_active: true }) }}
              className="mb-6 px-4 py-2 bg-[#99f7ff] text-[#070d1f] rounded-lg hover:bg-[#00e2ee] transition-colors">
              {showRedirectForm ? 'Cancel' : '+ Add New Redirect'}
            </button>

            {showRedirectForm && (
              <div className="mb-6 p-6 glass-panel border border-[#99f7ff]/20 rounded-lg">
                <h2 className="text-xl font-semibold text-[#99f7ff] mb-4">
                  {editingRedirectId ? 'Edit Redirect' : 'Add New Redirect'}
                </h2>
                <form onSubmit={handleRedirectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#a5aac2] mb-2">Name</label>
                    <input type="text" value={redirectFormData.name} onChange={(e) => setRedirectFormData({ ...redirectFormData, name: e.target.value })}
                      className={inputCls} placeholder="e.g., WhatsApp Support" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#a5aac2] mb-2">URL</label>
                    <input type="url" value={redirectFormData.url} onChange={(e) => setRedirectFormData({ ...redirectFormData, url: e.target.value })}
                      className={inputCls} placeholder="https://wa.me/1234567890?text=" required />
                    <p className="text-xs text-[#a5aac2] mt-1">基础URL，可包含查询参数</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#a5aac2] mb-2">自定义后缀 (Suffix)</label>
                    <input type="text" value={redirectFormData.suffix} onChange={(e) => setRedirectFormData({ ...redirectFormData, suffix: e.target.value })}
                      className={inputCls} placeholder="我是自定义后缀文案" />
                    <p className="text-xs text-[#a5aac2] mt-1">可选。将拼接在URL后面</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#a5aac2] mb-2">Weight</label>
                    <input type="number" min="1" max="100" value={redirectFormData.weight}
                      onChange={(e) => setRedirectFormData({ ...redirectFormData, weight: parseInt(e.target.value) })} className={inputCls} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="redirect_is_active" checked={redirectFormData.is_active}
                      onChange={(e) => setRedirectFormData({ ...redirectFormData, is_active: e.target.checked })} className="w-4 h-4" />
                    <label htmlFor="redirect_is_active" className="text-sm text-[#a5aac2]">Active</label>
                  </div>
                  <button type="submit" className="px-6 py-2 bg-[#99f7ff] text-[#070d1f] font-semibold rounded-lg hover:opacity-90">
                    {editingRedirectId ? 'Update' : 'Create'}
                  </button>
                </form>
              </div>
            )}

            <div className="glass-panel border border-[#41475b] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#0c1326]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#99f7ff]">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#99f7ff]">URL</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#99f7ff]">Suffix</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#99f7ff]">Weight</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#99f7ff]">状态</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#99f7ff]">Clicks</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#99f7ff]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {redirects.map((redirect) => (
                    <tr key={redirect.id} className="border-t border-[#41475b]">
                      <td className="px-4 py-3 text-[#dfe4fe]">{redirect.name}</td>
                      <td className="px-4 py-3 text-[#a5aac2] text-sm max-w-xs truncate">{redirect.url}</td>
                      <td className="px-4 py-3 text-[#a5aac2] text-sm max-w-xs truncate">{redirect.suffix || '-'}</td>
                      <td className="px-4 py-3 text-[#dfe4fe] text-center">{redirect.weight}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          redirect.is_active ? 'bg-[#99f7ff]/10 text-[#99f7ff]' : 'bg-[#ff716c]/20 text-[#ff716c]'
                        }`}>
                          {redirect.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#dfe4fe] text-center">{redirect.click_count}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleEditRedirect(redirect)} className="px-3 py-1 text-sm text-[#99f7ff] hover:underline mr-2">编辑</button>
                        <button onClick={() => handleDeleteRedirect(redirect.id)} className="px-3 py-1 text-sm text-[#ff716c] hover:underline">删除</button>
                      </td>
                    </tr>
                  ))}
                  {redirects.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-[#a5aac2]">No redirects found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <button onClick={() => { setShowAnalyticsForm(!showAnalyticsForm); setEditingAnalyticsId(null); setAnalyticsFormData({ ads_tracking_id: '', ga4_property_id: '', conversion_id: '', is_enabled: true }) }}
              className="mb-6 px-4 py-2 bg-[#99f7ff] text-[#070d1f] rounded-lg hover:bg-[#00e2ee] transition-colors">
              {showAnalyticsForm ? '取消' : '+ 添加谷歌统计'}
            </button>

            {showAnalyticsForm && (
              <div className="mb-6 p-6 glass-panel border border-[#99f7ff]/20 rounded-lg">
                <h2 className="text-xl font-semibold text-[#99f7ff] mb-4">
                  {editingAnalyticsId ? 'Edit Google Analytics' : 'Add Google Analytics'}
                </h2>
                <form onSubmit={handleAnalyticsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#a5aac2] mb-2">Google Ads Tracking ID</label>
                    <input type="text" value={analyticsFormData.ads_tracking_id}
                      onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, ads_tracking_id: e.target.value })}
                      className={inputCls} placeholder="e.g., AW-17303658824" />
                    <p className="text-xs text-[#a5aac2] mt-1">Google Ads转化跟踪ID（以AW-开头）</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#a5aac2] mb-2">GA4 Property ID</label>
                    <input type="text" value={analyticsFormData.ga4_property_id}
                      onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, ga4_property_id: e.target.value })}
                      className={inputCls} placeholder="e.g., G-BDPP2WPMQR" />
                    <p className="text-xs text-[#a5aac2] mt-1">Google Analytics 4媒体资源ID（以G-开头）</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#a5aac2] mb-2">Conversion ID</label>
                    <input type="text" value={analyticsFormData.conversion_id}
                      onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, conversion_id: e.target.value })}
                      className={inputCls} placeholder="e.g., AW-17303658824/KrXGCNHaoZQcEMjCg7tA" />
                    <p className="text-xs text-[#a5aac2] mt-1">完整的转化ID（用于转化跟踪）</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="analytics_is_enabled" checked={analyticsFormData.is_enabled}
                      onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, is_enabled: e.target.checked })} className="w-4 h-4" />
                    <label htmlFor="analytics_is_enabled" className="text-sm text-[#a5aac2]">启用</label>
                  </div>
                  <button type="submit" className="px-6 py-2 bg-[#99f7ff] text-[#070d1f] font-semibold rounded-lg hover:opacity-90">
                    {editingAnalyticsId ? 'Update' : 'Create'}
                  </button>
                </form>
              </div>
            )}

            <div className="glass-panel border border-[#41475b] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#0c1326]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#99f7ff]">Ads Tracking ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#99f7ff]">GA4 Property ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#99f7ff]">Conversion ID</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#99f7ff]">状态</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#99f7ff]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsConfigs.map((config) => (
                    <tr key={config.id} className="border-t border-[#41475b]">
                      <td className="px-4 py-3 text-[#dfe4fe] font-mono">{config.ads_tracking_id || '-'}</td>
                      <td className="px-4 py-3 text-[#dfe4fe] font-mono">{config.ga4_property_id || '-'}</td>
                      <td className="px-4 py-3 text-[#a5aac2] font-mono">{config.conversion_id || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          config.is_enabled ? 'bg-[#99f7ff]/10 text-[#99f7ff]' : 'bg-[#ff716c]/20 text-[#ff716c]'
                        }`}>
                          {config.is_enabled ? '启用' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleEditAnalytics(config)} className="px-3 py-1 text-sm text-[#99f7ff] hover:underline mr-2">编辑</button>
                        <button onClick={() => handleDeleteAnalytics(config.id)} className="px-3 py-1 text-sm text-[#ff716c] hover:underline">删除</button>
                      </td>
                    </tr>
                  ))}
                  {analyticsConfigs.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[#a5aac2]">No Google Analytics configurations found.</td></tr>
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
