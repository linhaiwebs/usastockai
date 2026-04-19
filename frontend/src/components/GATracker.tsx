'use client'

import Script from 'next/script'

const GA_ADS_ID = 'AW-17303658824'
const GA4_ID = 'G-BDPP2WPMQR'
const CONVERSION_SEND_TO = 'AW-17303658824/KrXGCNHaoZQcEMjCg7tA'

export default function GATracker() {
  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_ADS_ID}');
          gtag('config', '${GA4_ID}');

          function gtag_report_conversion(url) {
            var callback = function () {
              if (typeof url !== 'undefined') {
                window.location = url;
              }
            };
            gtag('event', 'Add');
            gtag('event', 'conversion', {
              'send_to': '${CONVERSION_SEND_TO}',
              'transaction_id': '',
              'event_callback': callback
            });
            return false;
          }
        `}
      </Script>
    </>
  )
}
