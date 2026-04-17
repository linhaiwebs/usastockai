'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getHotStocks, StockQuote } from '../../lib/api'

function formatPrice(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatNumber(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}

export default function MarketDataPage() {
  const [hotStocks, setHotStocks] = useState<StockQuote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHotStocks()
      .then(data => setHotStocks(data))
      .catch(() => setHotStocks([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#070d1f] cosmic-gradient">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#070d1f]/80 backdrop-blur-lg border-b border-[#41475b]/30">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-[#99f7ff] font-headline tracking-tighter">STOCK AI</Link>
          <Link href="/" className="text-xs text-[#a5aac2] hover:text-[#99f7ff] uppercase tracking-widest transition-colors">← Back Home</Link>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6 max-w-screen-xl mx-auto">
        {/* Hero */}
        <div className="mb-12">
          <span className="text-[10px] text-[#a5aac2] uppercase tracking-[0.3em] font-label">AI Engine / Market Data</span>
          <h1 className="text-3xl font-headline font-bold text-white mt-2 tracking-tight">Market Data</h1>
          <p className="text-[#a5aac2] text-sm mt-3 max-w-xl leading-relaxed">
            Real-time market data powered by finance-query APIs. Access stock quotes, volume data,
            and price changes for major US equities and ETFs.
          </p>
        </div>

        {/* Data Sources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: 'database', title: 'Real-Time Quotes', desc: 'Live price data with change and volume metrics, refreshed every 5 minutes via server-side caching.' },
            { icon: 'search', title: 'Symbol Search', desc: 'Autocomplete stock search with symbol, name, type, and exchange information for quick navigation.' },
            { icon: 'local_fire_department', title: 'Hot Stocks', desc: 'Top 10 trending US equities including SPY, QQQ, AAPL, MSFT, TSLA, NVDA, AMZN, GOOGL, META, AMD.' },
          ].map((item) => (
            <div key={item.title} className="glass-panel rounded-2xl border border-[#41475b]/30 p-6">
              <div className="w-10 h-10 rounded-xl bg-[#99f7ff]/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#99f7ff] text-xl">{item.icon}</span>
              </div>
              <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider mb-2">{item.title}</h3>
              <p className="text-[#a5aac2] text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Hot Stocks Table */}
        <div className="mb-12">
          <h2 className="text-lg font-headline font-bold text-white mb-6 uppercase tracking-wider">Hot Stocks Live</h2>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#99f7ff]/30 border-t-[#99f7ff] rounded-full animate-spin"></div>
            </div>
          ) : hotStocks.length > 0 ? (
            <div className="glass-panel rounded-2xl border border-[#41475b]/30 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#41475b]/30">
                    <th className="text-left px-5 py-3 text-[9px] text-[#a5aac2] uppercase tracking-widest font-bold">Symbol</th>
                    <th className="text-left px-5 py-3 text-[9px] text-[#a5aac2] uppercase tracking-widest font-bold">Name</th>
                    <th className="text-right px-5 py-3 text-[9px] text-[#a5aac2] uppercase tracking-widest font-bold">Price</th>
                    <th className="text-right px-5 py-3 text-[9px] text-[#a5aac2] uppercase tracking-widest font-bold">Change</th>
                    <th className="text-right px-5 py-3 text-[9px] text-[#a5aac2] uppercase tracking-widest font-bold">Change %</th>
                    <th className="text-right px-5 py-3 text-[9px] text-[#a5aac2] uppercase tracking-widest font-bold">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {hotStocks.map((stock) => (
                    <tr key={stock.symbol} className="border-b border-[#41475b]/10 hover:bg-[#99f7ff]/5 transition-colors">
                      <td className="px-5 py-3 text-sm font-headline font-bold text-white">{stock.symbol}</td>
                      <td className="px-5 py-3 text-xs text-[#a5aac2]">{stock.name}</td>
                      <td className="px-5 py-3 text-sm font-headline font-bold text-white text-right">${formatPrice(stock.price)}</td>
                      <td className={`px-5 py-3 text-sm font-bold text-right ${stock.change >= 0 ? 'text-[#99f7ff]' : 'text-[#ff6b6b]'}`}>
                        {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${stock.change_percent >= 0 ? 'bg-[#99f7ff]/10 text-[#99f7ff]' : 'bg-[#ff6b6b]/10 text-[#ff6b6b]'}`}>
                          {stock.change_percent >= 0 ? '▲' : '▼'} {Math.abs(stock.change_percent).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#a5aac2] text-right">{formatNumber(stock.volume)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-[#41475b]/30 p-12 text-center">
              <p className="text-[#a5aac2] text-sm">Market data temporarily unavailable. Please try again later.</p>
            </div>
          )}
        </div>

        {/* API Reference */}
        <div className="mb-12">
          <h2 className="text-lg font-headline font-bold text-white mb-6 uppercase tracking-wider">API Endpoints</h2>
          <div className="flex flex-col gap-3">
            {[
              { method: 'GET', path: '/api/stocks/{symbol}', desc: 'Get real-time quote for a specific stock symbol' },
              { method: 'GET', path: '/api/stocks/hot', desc: 'Get top 10 hot stocks with live data' },
              { method: 'GET', path: '/api/search?q=...', desc: 'Search stocks by symbol or company name' },
            ].map((ep) => (
              <div key={ep.path} className="glass-panel rounded-xl border border-[#41475b]/30 p-4 flex items-center gap-4">
                <span className="text-[9px] px-2 py-1 rounded bg-[#99f7ff]/10 text-[#99f7ff] font-bold uppercase tracking-wider shrink-0">{ep.method}</span>
                <code className="text-xs text-white font-mono shrink-0">{ep.path}</code>
                <span className="text-[#a5aac2] text-xs ml-auto">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#99f7ff] text-[#070d1f] font-headline font-bold rounded-full text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-base">bolt</span>
          Start Diagnosis
        </Link>
      </main>
    </div>
  )
}
