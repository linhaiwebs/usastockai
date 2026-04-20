'use client'

import { useEffect, useState } from 'react'
import { fetchGAConfig, GAConfig } from '../lib/api'

export default function GATracker() {
  const [injected, setInjected] = useState(false)

  useEffect(() => {
    if (injected) return

    fetchGAConfig()
      .then(gaData => {
        if (!gaData || gaData.length === 0) return

        const adsId = gaData.find(c => c.ads_tracking_id)?.ads_tracking_id ?? null
        const ga4Id = gaData.find(c => c.ga4_property_id)?.ga4_property_id ?? null
        const convId = gaData.find(c => c.conversion_id)?.conversion_id ?? null

        if (!adsId && !ga4Id) return

        const primaryId = adsId || ga4Id!

        // Build gtag('config', ...) lines
        const cfgLines: string[] = []
        if (adsId) cfgLines.push(`  gtag('config', '${adsId}');`)
        if (ga4Id && ga4Id !== adsId) cfgLines.push(`  gtag('config', '${ga4Id}');`)

        // Build conversion function block
        const convBlock = convId
          ? `
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
  }`
          : ''

        // Inject <!-- Google tag (gtag.js) --> comment
        const comment = document.createComment(' Google tag (gtag.js) ')
        document.head.appendChild(comment)

        // Inject async gtag.js script: <script async src="..."></script>
        const gtagScript = document.createElement('script')
        gtagScript.async = true
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${primaryId}`
        document.head.appendChild(gtagScript)

        // Inject inline gtag init script
        const initScript = document.createElement('script')
        initScript.textContent = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
${cfgLines.join('\n')}
${convBlock}
`
        document.head.appendChild(initScript)

        setInjected(true)
      })
      .catch(() => {})
  }, [injected])

  return null
}
