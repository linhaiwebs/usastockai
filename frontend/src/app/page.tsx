'use client'

import { useState } from 'react'
import { HeroSection } from '@/components/HeroSection'
import { SearchBox } from '@/components/SearchBox'
import { StockGrid } from '@/components/StockGrid'
import { BrandSection } from '@/components/BrandSection'
import { FeatureGrid } from '@/components/FeatureGrid'
import { CTAButton } from '@/components/CTAButton'
import { Footer } from '@/components/Footer'
import { AnalysisModal } from '@/components/AnalysisModal'

/**
 * 主页面
 */
export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const [analyzeQuery, setAnalyzeQuery] = useState('')

  const handleAnalyze = (query: string) => {
    setAnalyzeQuery(query)
    setModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-[480px] mx-auto px-4">
        <HeroSection />
        <SearchBox onAnalyze={handleAnalyze} />
        <StockGrid onStockClick={handleAnalyze} />
        <BrandSection />
        <FeatureGrid />
        <CTAButton onClick={() => handleAnalyze('当前市场趋势分析')} />
        <Footer />
        
        {/* AI 分析弹窗 */}
        <AnalysisModal
          query={analyzeQuery}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </main>
  )
}
