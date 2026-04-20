'use client'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white px-3 pt-6 pb-4 border-b border-gray-100">
        <div className="max-w-sm mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-pink-500 text-sm">AI Stock Diagnosis</Link>
          <Link href="/" className="text-[10px] text-gray-500 hover:text-gray-900 transition">&larr; Back</Link>
        </div>
      </header>
      <main className="max-w-sm mx-auto px-3 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Contact &amp; Support</h1>
        <div className="space-y-4 text-gray-600 text-xs leading-relaxed">
          <section className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100">
            <h2 className="font-bold text-gray-900 text-sm mb-2">Get in Touch</h2>
            <p>Have questions about our AI stock diagnosis platform? Need technical support? We are here to help.</p>
          </section>
          <section className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-pink-500 text-base">mail</span>
              <div>
                <p className="text-[10px] text-gray-500">Email</p>
                <p className="text-gray-900 font-medium">support@aistockdiagnosis.com</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-green-600 text-base">forum</span>
              <div>
                <p className="text-[10px] text-gray-500">WhatsApp</p>
                <p className="text-gray-900 font-medium">Available for instant support</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-gray-500 text-base">schedule</span>
              <div>
                <p className="text-[10px] text-gray-500">Response Time</p>
                <p className="text-gray-900 font-medium">Within 24 hours on business days</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
