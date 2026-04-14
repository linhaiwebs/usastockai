'use client'

import { useState, useRef } from 'react'
import { Navbar } from '@/components/Navbar'
import { HeroSection } from '@/components/HeroSection'
import { FeatureGrid } from '@/components/FeatureGrid'
import { HowItWorks } from '@/components/HowItWorks'
import { SearchBox, SearchBoxRef } from '@/components/SearchBox'
import { CTASection } from '@/components/CTASection'
import { Footer } from '@/components/Footer'
import { AnalysisModal } from '@/components/AnalysisModal'

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const [analyzeQuery, setAnalyzeQuery] = useState('')
  const searchBoxRef = useRef<SearchBoxRef>(null)

  const handleAnalyze = (query: string) => {
    setAnalyzeQuery(query)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    searchBoxRef.current?.clearAndFocus()
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeatureGrid />
      <HowItWorks />
      <SearchBox ref={searchBoxRef} onAnalyze={handleAnalyze} />
      <CTASection />
      <Footer />
      <AnalysisModal query={analyzeQuery} isOpen={modalOpen} onClose={handleModalClose} />
    </main>
  )
}
