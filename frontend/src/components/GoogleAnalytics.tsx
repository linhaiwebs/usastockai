'use client'

import { useEffect } from 'react'

interface GoogleAnalyticsConfig {
  ads_tracking_id: string | null
  ga4_property_id: string | null
  conversion_id: string | null
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
        
        // Get the first config (usually only one config)
        const config = configs[0]
        
        // Determine the primary tracking ID for gtag.js
        // Priority: Ads Tracking ID > GA4 Property ID
        const primaryId = config.ads_tracking_id || config.ga4_property_id
        
        if (!primaryId) return
        
        // Inject gtag.js script
        const script = document.createElement('script')
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=${primaryId}`
        document.head.appendChild(script)
        
        // Create inline script for gtag configuration
        const inlineScript = document.createElement('script')
        
        // Build gtag config calls
        const configCalls = []
        if (config.ads_tracking_id) {
          configCalls.push(`gtag('config', '${config.ads_tracking_id}');`)
        }
        if (config.ga4_property_id) {
          configCalls.push(`gtag('config', '${config.ga4_property_id}');`)
        }
        
        // Build conversion function if conversion_id exists
        let conversionFunction = ''
        if (config.conversion_id) {
          conversionFunction = `
    function gtag_report_conversion(url) {
        var callback = function () {
            if (typeof url !== 'undefined') {
                window.location = url;
            }
        };
        gtag('event', 'Add');
        gtag('event', 'conversion', {
            'send_to': '${config.conversion_id}',
            'transaction_id': '',
            'event_callback': callback
        });
        return false;
    }`
        }
        
        inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    ${configCalls.join('\n    ')}${conversionFunction}
`
        document.head.appendChild(inlineScript)
        
        console.log('Google Analytics loaded:', {
          ads_tracking_id: config.ads_tracking_id,
          ga4_property_id: config.ga4_property_id,
          conversion_id: config.conversion_id
        })
      } catch (error) {
        console.error('Failed to load Google Analytics:', error)
      }
    }
    
    loadGoogleAnalytics()
  }, [])
  
  return null
}
