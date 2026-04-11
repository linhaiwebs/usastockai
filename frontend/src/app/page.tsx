'use client'

import { useState, useRef } from 'react'
import { HeroSection } from '@/components/HeroSection'
import { SearchBox, SearchBoxRef } from '@/components/SearchBox'
import { NotificationBar } from '@/components/NotificationBar'
import { ComparisonMatrix } from '@/components/ComparisonMatrix'
import { FixedBottomBar } from '@/components/ContextualCTA'
import { Footer } from '@/components/Footer'
import { AnalysisModal } from '@/components/AnalysisModal'

/**
 * Main Page - ClickHouse Design System
 * Pure black canvas, Neon Volt accents, charcoal borders
 * Module-based layout with max-width 1200px
 */
export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const [analyzeQuery, setAnalyzeQuery] = useState('')
  const [hasCompletedDiagnosis, setHasCompletedDiagnosis] = useState(false)
  const searchBoxRef = useRef<SearchBoxRef>(null)

  const handleAnalyze = (query: string) => {
    setAnalyzeQuery(query)
    setModalOpen(true)
    setHasCompletedDiagnosis(false)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setHasCompletedDiagnosis(true)
  }

  const handleNewDiagnosis = () => {
    // Clear input and focus using ref method
    searchBoxRef.current?.clearAndFocus()
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Main container with max-width 1200px */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Module 1: Top Brand Bar */}
        <HeroSection />
        
        {/* Module 2: Central Input Area */}
        <SearchBox ref={searchBoxRef} onAnalyze={handleAnalyze} />
        
        {/* Module 3: Real-time Sentiment Indicators */}
        <NotificationBar />
        
        {/* Module 4: News Source Trust Badges */}
        <ComparisonMatrix />
        
        {/* Footer */}
        <Footer />
        
        {/* AI Analysis Modal */}
        <AnalysisModal
          query={analyzeQuery}
          isOpen={modalOpen}
          onClose={handleModalClose}
        />
      </div>

      {/* Module 5: Fixed Bottom Bar */}
      <FixedBottomBar 
        onNewDiagnosis={handleNewDiagnosis} 
        hasCompletedDiagnosis={hasCompletedDiagnosis}
        lastDiagnosis={analyzeQuery}
      />
    </main>
  )
}