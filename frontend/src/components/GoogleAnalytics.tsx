'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { getGoogleAnalyticsConfig, GoogleAnalyticsConfig } from '../lib/api'

export default function GoogleAnalytics() {
  const [configs, setConfigs] = useState<GoogleAnalyticsConfig[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getGoogleAnalyticsConfig()
      .then(data => {
        setConfigs(data)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  // Don't inject anything until loaded and config exists
  if (!loaded || configs.length === 0) return null

  const adsId = configs.find(c => c.ads_tracking_id)?.ads_tracking_id
  const ga4Id = configs.find(c => c.ga4_property_id)?.ga4_property_id
  const conversionId = configs.find(c => c.conversion_id)?.conversion_id

  // Need at least one tracking ID to inject scripts
  if (!adsId && !ga4Id) return null

  // Use adsId as primary gtag.js source (standard practice), fallback to ga4Id
  const primaryId = adsId || ga4Id!

  // Build gtag config lines
  const configLines: string[] = []
  if (adsId) configLines.push(`gtag('config', '${adsId}');`)
  if (ga4Id && ga4Id !== adsId) configLines.push(`gtag('config', '${ga4Id}');`)

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${configLines.join('\n')}
          ${conversionId ? `
          function gtag_report_conversion(url) {
            var callback = function () {
              if (typeof url !== 'undefined') {
                window.location = url;
              }
            };
            gtag('event', 'Add');
            gtag('event', 'conversion', {
              'send_to': '${conversionId}',
              'transaction_id': '',
              'event_callback': callback
            });
            return false;
          }` : ''}
        `}
      </Script>
    </>
  )
}
