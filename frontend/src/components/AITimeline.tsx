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
 * AI Timeline Component - Revolut style compact horizontal timeline
 * Shows the AI diagnostic process in a clean, flat design
 */
export function AITimeline() {
  return (
    <section className="py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 
          className="text-display-large font-medium text-revolut-dark mb-2 text-center"
          style={{ 
            lineHeight: '1.21',
            letterSpacing: '-0.32px'
          }}
        >
          How AI Analysis Works
        </h2>
        <p 
          className="text-body text-mid-slate mb-8 text-center"
        >
          Our advanced AI processes data through four key stages
        </p>
        
        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5 bg-gray-tone"></div>
          
          <div className="grid grid-cols-2 gap-4">
            {timelineSteps.map((item, index) => (
              <div key={index} className="relative text-center">
                {/* Step Circle */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-revolut-dark text-white flex items-center justify-center text-card-title font-medium mx-auto mb-4">
                  {item.step}
                </div>
                
                {/* Content */}
                <h3 
                  className="text-caption font-medium text-revolut-dark mb-1"
                >
                  {item.title}
                </h3>
                <p 
                  className="text-caption-small text-mid-slate"
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
