'use client'

import { useEffect } from 'react'

interface GoogleAnalyticsConfig {
  tracking_id: string
  conversion_label: string | null
}

export default function GoogleAnalytics() {
  useEffect(() => {
    const loadGoogleAnalytics = async () => {
      try {
        // Fetch enabled Google Analytics configurations
        const response = await fetch('/api/admin/public/google-analytics')
        if (!response.ok) return
        
        const data = await response.json()
        const configs: GoogleAnalyticsConfig[] = data.analytics || []
        
        if (configs.length === 0) return
        
        // Group configs by tracking_id
        const trackingIds = new Set<string>()
        const conversionLabels: { [key: string]: string } = {}
        
        configs.forEach(config => {
          trackingIds.add(config.tracking_id)
          if (config.conversion_label) {
            conversionLabels[config.tracking_id] = config.conversion_label
          }
        })
        
        // Inject gtag.js script
        const script = document.createElement('script')
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=${Array.from(trackingIds)[0]}`
        document.head.appendChild(script)
        
        // Create inline script for gtag configuration
        const inlineScript = document.createElement('script')
        const configCalls = Array.from(trackingIds).map(id => `gtag('config', '${id}');`).join('\n    ')
        
        let conversionFunction = ''
        const conversionsWithLabels = Object.entries(conversionLabels)
        
        if (conversionsWithLabels.length > 0) {
          const conversionConfigs = conversionsWithLabels.map(([trackingId, label]) => {
            return `gtag('event', 'conversion', {
            'send_to': '${trackingId}/${label}',
            'transaction_id': '',
            'event_callback': callback
        });`
          }).join('\n        ')
          
          conversionFunction = `
    function gtag_report_conversion(url) {
        var callback = function () {
            if (typeof url !== 'undefined') {
                window.location = url;
            }
        };
        gtag('event', 'Add');
        ${conversionConfigs}
        return false;
    }`
        }
        
        inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    ${configCalls}${conversionFunction}
`
        document.head.appendChild(inlineScript)
        
        console.log('Google Analytics loaded:', Array.from(trackingIds))
      } catch (error) {
        console.error('Failed to load Google Analytics:', error)
      }
    }
    
    loadGoogleAnalytics()
  }, [])
  
  return null
}
