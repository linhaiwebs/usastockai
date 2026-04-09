'use client'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  change_percent: number
  volume: number
}

interface StockCardProps {
  stock: StockData
  onClick?: () => void
  compact?: boolean
}

/**
 * 股票卡片组件
 */
export function StockCard({ stock, onClick, compact = false }: StockCardProps) {
  const isProfit = stock.change >= 0
  const changeColor = isProfit ? 'text-profit' : 'text-loss'
  const changeSymbol = isProfit ? '+' : ''

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) {
      return `${(vol / 1000000).toFixed(1)}M`
    } else if (vol >= 1000) {
      return `${(vol / 1000).toFixed(1)}K`
    }
    return vol.toString()
  }

  if (compact) {
    // 紧凑版本
    return (
      <button
        onClick={onClick}
        className="w-full p-3 bg-surface border border-gray-700 rounded-lg hover:border-primary hover:shadow-md transition-all text-left group"
      >
        {/* 股票代码和价格 */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-primary group-hover:text-accent transition-colors">
            {stock.symbol}
          </h3>
          <p className="text-lg font-bold text-text">
            ${stock.price.toFixed(2)}
          </p>
        </div>

        {/* 涨跌幅 */}
        <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
          <span>{isProfit ? '▲' : '▼'}</span>
          <span className="font-medium">
            {changeSymbol}{stock.change.toFixed(2)}
          </span>
          <span>
            ({changeSymbol}{stock.change_percent.toFixed(2)}%)
          </span>
        </div>
      </button>
    )
  }

  // 完整版本
  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-surface border border-gray-700 rounded-xl hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all text-left group"
    >
      {/* 股票代码和名称 */}
      <div className="mb-2">
        <h3 className="text-lg font-bold text-primary group-hover:text-accent transition-colors">
          {stock.symbol}
        </h3>
        <p className="text-sm text-text-secondary truncate">{stock.name}</p>
      </div>

      {/* 价格 */}
      <div className="mb-2">
        <p className="text-2xl font-bold text-text">
          ${stock.price.toFixed(2)}
        </p>
      </div>

      {/* 涨跌幅 */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 ${changeColor}`}>
          <span className="text-lg">
            {isProfit ? '▲' : '▼'}
          </span>
          <span className="font-semibold">
            {changeSymbol}{stock.change.toFixed(2)}
          </span>
          <span className="text-sm">
            ({changeSymbol}{stock.change_percent.toFixed(2)}%)
          </span>
        </div>

        {/* 成交量 */}
        <div className="text-xs text-text-secondary">
          Vol: {formatVolume(stock.volume)}
        </div>
      </div>
    </button>
  )
}
