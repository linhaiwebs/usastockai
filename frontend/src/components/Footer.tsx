export function Footer() {
  return (
    <footer className="bg-text-primary text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold">Planet Discovery</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              AI-powered stock intelligence platform. Get real-time sentiment analysis from thousands of news sources, delivered instantly.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#analyze" className="text-gray-300 hover:text-white transition-colors">Analyze Stock</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-gray-300">Privacy Policy</span></li>
              <li><span className="text-gray-300">Terms of Service</span></li>
              <li><span className="text-gray-300">Contact</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Planet Discovery. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            For educational purposes only. Not investment advice. Data sourced from public financial news.
          </p>
        </div>
      </div>
    </footer>
  )
}
