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
import { TestimonialsSection } from '@/components/TestimonialsSection'
import { AITimeline } from '@/components/AITimeline'

/**
 * Main Page - Revolut style landing page
 * Clean design with alternating dark/light sections, no shadows
 * Complete layout restructuring with new components
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
      {/* Hero Section - Full viewport height */}
      <HeroSection />
      
      {/* Search Box - Light gray background section */}
      <SearchBox onAnalyze={handleAnalyze} />
      
      {/* Trending Stocks - White background */}
      <StockGrid onStockClick={handleAnalyze} />
      
      {/* AI Timeline - New horizontal timeline component */}
      <AITimeline />
      
      {/* Brand Section - Dark background */}
      <BrandSection />
      
      {/* Feature Grid - Light gray background, horizontal layout */}
      <FeatureGrid />
      
      {/* Testimonials - New user reviews section */}
      <TestimonialsSection />
      
      {/* CTA Section - White background */}
      <CTAButton />
      
      {/* Footer */}
      <Footer />
      
      {/* AI Analysis Modal */}
      <AnalysisModal
        query={analyzeQuery}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  )
}
