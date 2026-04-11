'use client'

import { useState } from 'react'
import { HeroSection } from '@/components/HeroSection'
import { SearchBox } from '@/components/SearchBox'
import { StockGrid } from '@/components/StockGrid'
import { SocialProof } from '@/components/SocialProof'
import { FreemiumHook, useFreeCount } from '@/components/FreemiumHook'
import { ComparisonMatrix } from '@/components/ComparisonMatrix'
import { ContextualCTA } from '@/components/ContextualCTA'
import { Footer } from '@/components/Footer'
import { AnalysisModal } from '@/components/AnalysisModal'

/**
 * Main Page - Airbnb style landing page
 * Clean white background, Rausch Red accents, three-layer shadows
 */
export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const [analyzeQuery, setAnalyzeQuery] = useState('')
  const [hasCompletedDiagnosis, setHasCompletedDiagnosis] = useState(false)
  const { freeCount, decrementCount } = useFreeCount()

  const handleAnalyze = (query: string) => {
    if (freeCount > 0) {
      decrementCount()
      setAnalyzeQuery(query)
      setModalOpen(true)
      setHasCompletedDiagnosis(true)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Main container with generous padding */}
      <div className="max-w-[520px] mx-auto px-5 py-8">
        {/* 1. Hero Section with value proposition */}
        <HeroSection />
        
        {/* 2. Search Box with compliance text */}
        <SearchBox onAnalyze={handleAnalyze} />
        
        {/* 5. Freemium Hook - Free diagnosis banner */}
        <FreemiumHook onUpgrade={() => {/* Handle upgrade */}} />
        
        {/* 3. Hot Stocks Grid */}
        <StockGrid onStockClick={handleAnalyze} />
        
        {/* 4. Social Proof - User testimonials */}
        <SocialProof />
        
        {/* 6. Comparison Matrix */}
        <ComparisonMatrix />
        
        {/* 7. Contextual CTA - Dynamic based on user behavior */}
        <ContextualCTA 
          hasCompletedDiagnosis={hasCompletedDiagnosis}
          onUpgrade={() => {/* Handle upgrade */}}
        />
        
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
