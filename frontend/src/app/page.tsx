'use client'

import { useState, useRef } from 'react'
import { HeroSection } from '@/components/HeroSection'
import { SearchBox, SearchBoxRef } from '@/components/SearchBox'
import { UsageStatsBar, useFreeCount } from '@/components/FreemiumHook'
import { ComparisonMatrix } from '@/components/ComparisonMatrix'
import { TrustSection } from '@/components/TrustSection'
import { FixedBottomBar } from '@/components/ContextualCTA'
import { Footer } from '@/components/Footer'
import { AnalysisModal } from '@/components/AnalysisModal'

/**
 * Main Page - Mobile-first design with Airbnb style
 * Clean white background, Rausch Red accents, three-layer shadows
 */
export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const [analyzeQuery, setAnalyzeQuery] = useState('')
  const { freeCount, decrementCount } = useFreeCount()
  const searchBoxRef = useRef<SearchBoxRef>(null)

  const handleAnalyze = (query: string) => {
    if (freeCount > 0) {
      decrementCount()
      setAnalyzeQuery(query)
      setModalOpen(true)
    }
  }

  const handleNewDiagnosis = () => {
    // Clear input and focus using ref method
    searchBoxRef.current?.clearAndFocus()
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Main container with generous padding */}
      <div className="max-w-[520px] mx-auto px-5 py-8">
        {/* Module 1: Hero Section with value proposition */}
        <HeroSection />
        
        {/* Module 1: Search Box with example pills and validation */}
        <SearchBox ref={searchBoxRef} onAnalyze={handleAnalyze} />
        
        {/* Module 2: Usage Stats Bar */}
        <UsageStatsBar />
        
        {/* Module 3: Comparison Matrix */}
        <ComparisonMatrix />
        
        {/* Module 4: Trust Section */}
        <TrustSection />
        
        <Footer />
        
        {/* AI Analysis Modal */}
        <AnalysisModal
          query={analyzeQuery}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>

      {/* Module 5: Fixed Bottom Bar */}
      <FixedBottomBar onNewDiagnosis={handleNewDiagnosis} />
    </main>
  )
}