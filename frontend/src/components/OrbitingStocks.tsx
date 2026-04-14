'use client'

const STOCKS = ['AAPL', 'TSLA', 'NVDA', 'AMZN', 'GOOG', 'META', 'MSFT']

export default function OrbitingStocks() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {STOCKS.map((ticker, i) => {
        const angle = (i / STOCKS.length) * 360
        const delay = i * -3.5
        return (
          <div
            key={ticker}
            className="absolute"
            style={{
              '--start-angle': `${angle}deg`,
              '--orbit-radius': '140px',
              animation: `orbit-stock 25s linear ${delay}s infinite`,
              opacity: 0.25 + (i % 3) * 0.05,
            } as React.CSSProperties}
          >
            <span
              className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-white/30 whitespace-nowrap"
              style={{ textShadow: '0 0 8px rgba(79,142,255,0.3)' }}
            >
              {ticker}
            </span>
          </div>
        )
      })}
    </div>
  )
}
