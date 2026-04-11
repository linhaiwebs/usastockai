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
 * Main Page - BMW Design System
 * Sharp corners, tight line-heights, BMW Blue accents
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
      {/* Main container with generous padding */}
      <div className="max-w-[520px] mx-auto px-5 py-8">
        {/* Module 1: Hero Section with brand and input */}
        <HeroSection />
        
        {/* Module 1: Search Box with validation */}
        <SearchBox ref={searchBoxRef} onAnalyze={handleAnalyze} />
        
        {/* Module 2: Notification Bar */}
        <NotificationBar />
        
        {/* Module 3: Comparison Matrix */}
        <ComparisonMatrix />
        
        <Footer />
        
        {/* AI Analysis Modal */}
        <AnalysisModal
          query={analyzeQuery}
          isOpen={modalOpen}
          onClose={handleModalClose}
        />
      </div>

      {/* Module 4: Fixed Bottom Bar */}
      <FixedBottomBar 
        onNewDiagnosis={handleNewDiagnosis} 
        hasCompletedDiagnosis={hasCompletedDiagnosis}
        lastDiagnosis={analyzeQuery}
      />
    </main>
  )
}