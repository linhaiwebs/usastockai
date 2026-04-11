'use client'

import { useState, useRef } from 'react'
import { TopNavigation } from '@/components/TopNavigation'
import { HeroSection } from '@/components/HeroSection'
import { SearchBox } from '@/components/SearchBox'
import { SocialProof } from '@/components/SocialProof'
import { FeatureGrid } from '@/components/FeatureGrid'
import { StickyFooter } from '@/components/StickyFooter'
import { Footer } from '@/components/Footer'
import { AnalysisModal } from '@/components/AnalysisModal'
import { useFreeCount } from '@/components/FreemiumHook'

/**
 * Main Page - Airtable style landing page
 * Clean white background, Deep Navy text, Airtable Blue accents
 */
export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const [analyzeQuery, setAnalyzeQuery] = useState('')
  const { freeCount, decrementCount } = useFreeCount()
  const searchBoxRef = useRef<HTMLDivElement>(null)

  const handleAnalyze = (query: string) => {
    if (freeCount > 0) {
      decrementCount()
      setAnalyzeQuery(query)
      setModalOpen(true)
    }
  }

  const handleNewDiagnosis = () => {
    // Clear input and focus on search box
    if (searchBoxRef.current) {
      const input = searchBoxRef.current.querySelector('input')
      if (input) {
        input.value = ''
        input.focus()
      }
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Main container with generous padding - offset for fixed nav */}
      <div className="max-w-[520px] mx-auto px-5 pt-16 pb-24">
        {/* 1. Hero Section with value proposition */}
        <HeroSection />
        
        {/* 2. Search Box with validation states */}
        <div ref={searchBoxRef}>
          <SearchBox onAnalyze={handleAnalyze} />
        </div>
        
        {/* 3. Social Proof Bar */}
        <SocialProof />
        
        {/* 4. Feature Grid (2x2) */}
        <FeatureGrid />
        
        {/* Footer */}
        <Footer />
        
        {/* AI Analysis Modal */}
        <AnalysisModal
          query={analyzeQuery}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
      
      {/* 5. Sticky Footer CTA */}
      <StickyFooter onNewDiagnosis={handleNewDiagnosis} />
    </main>
  )
}
