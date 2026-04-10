'use client'

const testimonials = [
  {
    name: 'Michael Chen',
    role: 'Individual Investor',
    content: 'The AI analysis helped me identify a great entry point for NVDA. Up 40% in just 2 months!',
    avatar: 'MC'
  },
  {
    name: 'Sarah Johnson',
    role: 'Portfolio Manager',
    content: 'Real-time data and technical indicators are incredibly accurate. This platform has become essential for my daily analysis.',
    avatar: 'SJ'
  },
  {
    name: 'David Park',
    role: 'Day Trader',
    content: 'The risk assessment feature saved me from several bad trades. Highly recommend for serious investors.',
    avatar: 'DP'
  }
]

/**
 * Testimonials Section - Revolut style compact horizontal cards
 * User reviews displayed in a clean, flat design
 */
export function TestimonialsSection() {
  return (
    <section className="py-10 px-4 bg-surface">
      <div className="max-w-6xl mx-auto">
        <h2 
          className="text-display-large font-medium text-revolut-dark mb-2 text-center"
          style={{ 
            lineHeight: '1.21',
            letterSpacing: '-0.32px'
          }}
        >
          What our users say
        </h2>
        <p 
          className="text-body text-mid-slate mb-6 text-center"
        >
          Join thousands of investors who trust our platform
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-5 bg-white border-2 border-gray-tone rounded-card hover:border-revolut-dark transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-revolut-dark text-white flex items-center justify-center text-caption font-medium mb-4">
                {testimonial.avatar}
              </div>
              
              {/* Content */}
              <p 
                className="text-body text-mid-slate mb-4"
                style={{ letterSpacing: '0.16px' }}
              >
                "{testimonial.content}"
              </p>
              
              {/* Author */}
              <div>
                <p className="text-caption font-medium text-revolut-dark">
                  {testimonial.name}
                </p>
                <p className="text-caption-small text-mid-slate">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
