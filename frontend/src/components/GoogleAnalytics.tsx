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

  if (!loaded || configs.length === 0) return null

  const ga4Id = configs.find(c => c.ga4_property_id)?.ga4_property_id
  const adsId = configs.find(c => c.ads_tracking_id)?.ads_tracking_id
  const conversionId = configs.find(c => c.conversion_id)?.conversion_id

  return (
    <>
      {/* GA4 */}
      {ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}');
            `}
          </Script>
        </>
      )}

      {/* Google Ads Conversion Tracking */}
      {adsId && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
          strategy="afterInteractive"
        />
      )}

      {/* Ads + Conversion config when both GA4 and Ads exist */}
      {adsId && ga4Id && adsId !== ga4Id && (
        <Script id="ads-ga4-config" strategy="afterInteractive">
          {`
            gtag('config', '${adsId}');
          `}
        </Script>
      )}

      {/* Only Ads (no GA4) */}
      {adsId && !ga4Id && (
        <Script id="ads-only-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${adsId}');
          `}
        </Script>
      )}

      {/* Conversion tracking */}
      {conversionId && (
        <Script id="conversion-config" strategy="afterInteractive">
          {`
            gtag('event', 'conversion', {'send_to': '${conversionId}'});
          `}
        </Script>
      )}
    </>
  )
}
