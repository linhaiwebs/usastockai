'use client'

import { useState, useEffect } from 'react'

const reviews = [
  {
    id: 1,
    name: 'Sarah M.',
    avatar: '👩‍💼',
    role: 'Software Engineer',
    state: 'California',
    review: 'Finally, a tool that explains stock movements in plain English. Saved me hours of research.',
    rating: 5
  },
  {
    id: 2,
    name: 'James T.',
    avatar: '👨‍💻',
    role: 'Product Manager',
    state: 'New York',
    review: 'The AI diagnosis is surprisingly accurate. It caught a trend I completely missed.',
    rating: 5
  },
  {
    id: 3,
    name: 'Emily R.',
    avatar: '👩‍🔬',
    role: 'Data Analyst',
    state: 'Texas',
    review: 'Love how fast I can analyze multiple stocks. The free tier is perfect for getting started.',
    rating: 5
  },
  {
    id: 4,
    name: 'Michael K.',
    avatar: '👨‍🏫',
    role: 'Finance Teacher',
    state: 'Florida',
    review: 'I recommend this to all my students. It teaches technical analysis without the complexity.',
    rating: 5
  },
  {
    id: 5,
    name: 'Lisa W.',
    avatar: '👩‍⚕️',
    role: 'Physician',
    state: 'Washington',
    review: 'As a busy professional, I need quick insights. This tool delivers exactly that.',
    rating: 5
  }
]

/**
 * Social Proof Component - Airbnb style review carousel
 * Shows user testimonials with avatar, role, and state
 */
export function SocialProof() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const handlePrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  const currentReview = reviews[currentIndex]

  return (
    <div className="mb-12">
      <h2 
        className="text-section-heading text-text-primary mb-6 text-center"
        style={{ fontFeatureSettings: '"salt"' }}
      >
        Trusted by thousands of investors
      </h2>

      <div className="relative bg-white rounded-card shadow-card p-6 overflow-hidden">
        {/* Review content */}
        <div className="text-center">
          {/* Stars */}
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(currentReview.rating)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-rausch" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Review text */}
          <p 
            className="text-body-medium text-text-primary mb-6 max-w-md mx-auto leading-relaxed"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            "{currentReview.review}"
          </p>

          {/* User info */}
          <div className="flex items-center justify-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-circle bg-surface flex items-center justify-center text-xl">
              {currentReview.avatar}
            </div>
            
            <div className="text-left">
              <p 
                className="text-ui-medium text-text-primary"
                style={{ fontFeatureSettings: '"salt"' }}
              >
                {currentReview.name}
              </p>
              <p 
                className="text-small text-text-secondary"
                style={{ fontFeatureSettings: '"salt"' }}
              >
                {currentReview.role} • {currentReview.state}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 circular-btn"
          aria-label="Previous review"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 circular-btn"
          aria-label="Next review"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false)
                setCurrentIndex(index)
              }}
              className={`h-1.5 rounded-standard transition-all ${
                index === currentIndex 
                  ? 'bg-rausch w-4' 
                  : 'bg-border-default hover:bg-rausch opacity-30 w-1.5'
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
