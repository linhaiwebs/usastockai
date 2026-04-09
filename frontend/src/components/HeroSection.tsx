'use client'

/**
 * Hero 区域 - 蓝色渐变标题
 */
export function HeroSection() {
  return (
    <div className="pt-12 pb-8 text-center">
      {/* 主标题 */}
      <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-hero-gradient">
        AI 驱动的股票诊断
      </h1>
      
      {/* 副标题 */}
      <p className="text-text-secondary text-base leading-relaxed">
        实时行情 · 智能分析 · 投资决策
      </p>
      
      {/* 装饰元素 */}
      <div className="mt-6 flex justify-center gap-2">
        <div className="w-12 h-1 bg-primary rounded-full" />
        <div className="w-3 h-1 bg-secondary rounded-full" />
        <div className="w-2 h-1 bg-accent rounded-full" />
      </div>
    </div>
  )
}
