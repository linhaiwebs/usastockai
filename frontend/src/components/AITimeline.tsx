'use client'

const timelineSteps = [
  {
    step: '01',
    title: 'Data Collection',
    description: 'Real-time market data from multiple exchanges'
  },
  {
    step: '02',
    title: 'Pattern Analysis',
    description: 'AI identifies technical patterns and trends'
  },
  {
    step: '03',
    title: 'Risk Assessment',
    description: 'Evaluate potential risks and opportunities'
  },
  {
    step: '04',
    title: 'AI Insights',
    description: 'Generate actionable investment recommendations'
  }
]

/**
 * AI Timeline Component - Revolut style horizontal timeline
 * Shows the AI diagnostic process in a clean, flat design
 */
export function AITimeline() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 
          className="text-display-large font-medium text-revolut-dark mb-4 text-center"
          style={{ 
            lineHeight: '1.21',
            letterSpacing: '-0.48px'
          }}
        >
          How AI Analysis Works
        </h2>
        <p 
          className="text-body-large text-mid-slate mb-16 text-center"
          style={{ letterSpacing: '-0.09px' }}
        >
          Our advanced AI processes data through four key stages
        </p>
        
        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gray-tone"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {timelineSteps.map((item, index) => (
              <div key={index} className="relative text-center md:text-left">
                {/* Step Circle */}
                <div className="relative z-10 w-24 h-24 rounded-full bg-revolut-dark text-white flex items-center justify-center text-card-title font-medium mx-auto md:mx-0 mb-6">
                  {item.step}
                </div>
                
                {/* Content */}
                <h3 
                  className="text-feature-title font-medium text-revolut-dark mb-3"
                >
                  {item.title}
                </h3>
                <p 
                  className="text-body text-mid-slate"
                  style={{ letterSpacing: '0.24px' }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
