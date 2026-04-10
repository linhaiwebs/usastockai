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
 * Main Page - Stripe style landing page
 * Clean white background, blue-tinted shadows, purple accents
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
      {/* Main container with generous padding */}
      <div className="max-w-[520px] mx-auto px-5 py-8">
        <HeroSection />
        <SearchBox onAnalyze={handleAnalyze} />
        <StockGrid onStockClick={handleAnalyze} />
        <BrandSection />
        <FeatureGrid />
        <CTAButton />
        <Footer />
        
        {/* AI Analysis Modal */}
        <AnalysisModal
          query={analyzeQuery}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </main>
  )
}
