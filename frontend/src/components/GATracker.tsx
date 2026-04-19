'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { fetchGAConfig, GAConfig } from '../lib/api'

export default function GATracker() {
  const [gaData, setGaData] = useState<GAConfig[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetchGAConfig()
      .then(d => { setGaData(d); setReady(true) })
      .catch(() => setReady(true))
  }, [])

  if (!ready || gaData.length === 0) return null

  const adsId = gaData.find(c => c.ads_tracking_id)?.ads_tracking_id
  const ga4Id = gaData.find(c => c.ga4_property_id)?.ga4_property_id
  const convId = gaData.find(c => c.conversion_id)?.conversion_id

  if (!adsId && !ga4Id) return null

  const primaryId = adsId || ga4Id!
  const cfgLines: string[] = []
  if (adsId) cfgLines.push(`gtag('config', '${adsId}');`)
  if (ga4Id && ga4Id !== adsId) cfgLines.push(`gtag('config', '${ga4Id}');`)

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${cfgLines.join('\n')}
          ${convId ? `
          function gtag_report_conversion(url) {
            var callback = function () {
              if (typeof url !== 'undefined') { window.location = url; }
            };
            gtag('event', 'Add');
            gtag('event', 'conversion', {
              'send_to': '${convId}',
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
