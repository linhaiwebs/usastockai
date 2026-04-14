'use client'

import { useEffect, useRef, useCallback } from 'react'

const SYMBOLS = ['$', '↗', '↘', 'AAPL', 'BTC', 'NVDA', 'ETH', 'TSLA']

export default function HomePage() {
  const isAnalyzingRef = useRef(false)

  const createFloatingSymbols = useCallback(() => {
    const container = document.getElementById('symbol-container')
    if (!container) return
    container.innerHTML = ''
    for (let i = 0; i < 20; i++) {
      const sym = document.createElement('div')
      sym.innerText = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      sym.className = 'absolute text-primary/30 font-mono text-xs pointer-events-none animate-float-symbol'
      sym.style.left = Math.random() * 100 + '%'
      sym.style.top = Math.random() * 100 + '%'
      sym.style.animationDelay = Math.random() * 4 + 's'
      sym.style.fontSize = (Math.random() * 12 + 8) + 'px'
      container.appendChild(sym)
    }
  }, [])

  const openModal = useCallback(() => {
    const modal = document.getElementById('oracle-modal')
    const eyeL = document.getElementById('eye-l')
    const eyeR = document.getElementById('eye-r')
    const eyeLGlow = document.getElementById('eye-l-glow')
    const eyeRGlow = document.getElementById('eye-r-glow')
    const halo = document.getElementById('modal-halo')
    const submitBtn = document.getElementById('modal-submit-btn')
    if (!modal) return

    modal.classList.add('active')

    if (submitBtn) {
      submitBtn.classList.add('grayscale', 'opacity-30')
      submitBtn.classList.remove('animate-btn-activate', 'bg-primary', 'text-background', 'grayscale-0', 'opacity-100')
    }

    setTimeout(() => {
      if (eyeLGlow) eyeLGlow.style.opacity = '1'
      if (eyeRGlow) eyeRGlow.style.opacity = '1'
      if (eyeL) eyeL.classList.add('eye-glow-active')
      if (eyeR) eyeR.classList.add('eye-glow-active')
      if (halo) halo.classList.add('opacity-100')

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.classList.remove('grayscale', 'opacity-30')
          submitBtn.classList.add('animate-btn-activate', 'bg-primary', 'text-background', 'grayscale-0', 'opacity-100')
        }
      }, 1200)
    }, 300)
  }, [])

  const closeModal = useCallback(() => {
    const modal = document.getElementById('oracle-modal')
    const mask = document.getElementById('global-mask')
    const halo = document.getElementById('modal-halo')
    if (modal) modal.classList.remove('active')
    if (mask) mask.classList.remove('active')
    if (halo) halo.classList.remove('opacity-100')
    const container = document.getElementById('symbol-container')
    if (container) container.innerHTML = ''
  }, [])

  const animateBars = useCallback((btn: HTMLElement, originalText: string, icon: HTMLElement | null) => {
    const duration = 2500
    const start = Date.now()

    function update() {
      const now = Date.now()
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)

      const prog1 = document.getElementById('prog-1')
      const prog1Val = document.getElementById('prog-1-val')
      if (prog1) prog1.style.width = (progress * 100) + '%'
      if (prog1Val) prog1Val.innerText = Math.round(progress * 100) + '%'

      const p2 = Math.min(progress * 1.2, 1)
      const prog2 = document.getElementById('prog-2')
      const prog2Val = document.getElementById('prog-2-val')
      if (prog2) prog2.style.width = (p2 * 100) + '%'
      if (prog2Val) prog2Val.innerText = Math.round(p2 * 100) + '%'

      const p3 = Math.max(0, (progress - 0.2) * 1.25)
      const prog3 = document.getElementById('prog-3')
      const prog3Val = document.getElementById('prog-3-val')
      if (prog3) prog3.style.width = (Math.min(p3, 1) * 100) + '%'
      if (prog3Val) prog3Val.innerText = Math.round(Math.min(p3, 1) * 100) + '%'

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        setTimeout(() => {
          const diagnosticOverlay = document.getElementById('diagnostic-overlay')
          if (diagnosticOverlay) diagnosticOverlay.style.display = 'none'
          btn.classList.remove('primary-btn-centering')
          const textTarget = btn.querySelector('.btn-text') || btn
          textTarget.textContent = originalText
          if (icon) icon.style.opacity = '1'
          openModal()
          isAnalyzingRef.current = false
        }, 400)
      }
    }
    update()
  }, [openModal])

  const handlePrimaryClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isAnalyzingRef.current) return
    isAnalyzingRef.current = true

    const btn = e.currentTarget
    const mask = document.getElementById('global-mask')
    const diagnosticOverlay = document.getElementById('diagnostic-overlay')
    if (mask) mask.classList.add('active')
    createFloatingSymbols()

    btn.classList.add('primary-btn-centering')
    const originalText = btn.querySelector('.btn-text')?.textContent || btn.textContent || ''
    const textTarget = btn.querySelector('.btn-text') || btn
    const icon = btn.querySelector('.btn-icon') as HTMLElement | null

    if (textTarget) textTarget.textContent = 'CALIBRATING...'
    if (icon) icon.style.opacity = '0'

    setTimeout(() => {
      if (diagnosticOverlay) diagnosticOverlay.style.display = 'flex'
      animateBars(btn, originalText, icon)
    }, 100)
  }, [createFloatingSymbols, animateBars])

  useEffect(() => {
    const handleScroll = () => {
      const cta = document.getElementById('sticky-cta')
      if (!cta) return
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      if (scrollPercent > 70) {
        cta.classList.add('visible')
      } else {
        cta.classList.remove('visible')
      }
    }
    window.addEventListener('scroll', handleScroll)

    const mask = document.getElementById('global-mask')
    if (mask) mask.addEventListener('click', closeModal)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (mask) mask.removeEventListener('click', closeModal)
    }
  }, [closeModal])

  return (
    <>
      {/* Global Overlay Mask */}
      <div className="screen-mask" id="global-mask">
        <div className="absolute inset-0 pointer-events-none" id="symbol-container"></div>
      </div>

      {/* Diagnostic Overlay */}
      <div className="flex flex-col gap-4" id="diagnostic-overlay">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-primary/70 font-bold">
            <span>Neural Scan</span>
            <span id="prog-1-val">59%</span>
          </div>
          <div className="progress-bar-container"><div className="progress-bar-fill" id="prog-1" style={{ width: '59.12%' }}></div></div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-primary/70 font-bold">
            <span>Ether Sentiment</span>
            <span id="prog-2-val">71%</span>
          </div>
          <div className="progress-bar-container"><div className="progress-bar-fill" id="prog-2" style={{ width: '70.944%' }}></div></div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-primary/70 font-bold">
            <span>Kinetic Analysis</span>
            <span id="prog-3-val">49%</span>
          </div>
          <div className="progress-bar-container"><div className="progress-bar-fill" id="prog-3" style={{ width: '48.9%' }}></div></div>
        </div>
      </div>

      {/* Interactive Modal */}
      <div className="modal-container" id="oracle-modal">
        <div className="relative pt-24">
          {/* Robot Overlay */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 z-20 pointer-events-none">
            <div className="robot-body-wrapper relative flex flex-col items-center">
              <div className="w-32 h-32 bg-surface-container-highest rounded-full border-2 border-primary/40 relative overflow-hidden z-10 flex items-center justify-center">
                <div className="absolute inset-x-0 top-0 h-8 bg-primary/10"></div>
                <div className="flex gap-10 justify-center">
                  <div className="w-6 h-3 bg-[#0a0f1d] rounded-full relative overflow-hidden transition-all duration-700" id="eye-l">
                    <div className="absolute inset-0 bg-primary/80 blur-sm opacity-0" id="eye-l-glow" style={{ opacity: 0 }}></div>
                  </div>
                  <div className="w-6 h-3 bg-[#0a0f1d] rounded-full relative overflow-hidden transition-all duration-700" id="eye-r">
                    <div className="absolute inset-0 bg-primary/80 blur-sm opacity-0" id="eye-r-glow" style={{ opacity: 0 }}></div>
                  </div>
                </div>
              </div>
              <div className="robot-hands-grip">
                <div className="hand"></div>
                <div className="hand"></div>
              </div>
            </div>
          </div>
          {/* Modal Box */}
          <div className="glass-panel border border-primary/30 rounded-[2.5rem] p-5 shadow-[0_0_50px_rgba(153,247,255,0.15)] relative overflow-hidden bloom-effect">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[40px] opacity-0 transition-opacity duration-1000 z-0" id="modal-halo"></div>
            <div className="relative z-10">
              <div className="flex flex-col items-center mb-4">
                <button className="absolute top-0 right-0 p-2 text-on-surface-variant hover:text-primary transition-colors" onClick={closeModal}>
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
                <span className="text-xs font-headline font-bold text-primary tracking-[0.4em] uppercase text-center w-full mt-2">Celestial Signal</span>
              </div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-3 tracking-tight text-center">PROBABILISTIC OUTPUT</h3>
              <div className="flex flex-col gap-2 mb-4 items-center">
                <div className="flex justify-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[10px] bg-primary/10 p-1 rounded-md border border-primary/20">description</span>
                  <span className="material-symbols-outlined text-primary text-[10px] bg-primary/10 p-1 rounded-md border border-primary/20">description</span>
                  <span className="material-symbols-outlined text-primary text-[10px] bg-primary/10 p-1 rounded-md border border-primary/20">description</span>
                  <span className="material-symbols-outlined text-primary text-[10px] bg-primary/10 p-1 rounded-md border border-primary/20">description</span>
                </div>
                <span className="text-[8px] font-label text-on-surface-variant uppercase tracking-widest font-bold">2026 Temporal Reports Ready</span>
              </div>
              <div className="h-40 overflow-y-auto mb-4 pr-1 bg-black/40 rounded-xl p-3 font-mono text-[10px] leading-snug text-primary/80 border border-primary/10 hide-scroll">
                <p className="mb-1 text-secondary">&gt; INITIATING DEEP NEURAL SYNTHESIS...</p>
                <p className="mb-1 text-primary">SCANNING TEMPORAL ARCHIVES [Sector 7G]</p>
                <p className="mb-1">&gt; Matching patterns found: 0.984 correlation.</p>
                <p className="mb-1 text-secondary">&gt; CALCULATING DELTA VECTORS...</p>
                <p className="mb-1">Vector Alpha: +4.2% [Confirmed]</p>
                <p className="mb-1 text-primary">&gt; LIQUIDITY KINETIC HEATMAP GENERATED.</p>
                <p className="mb-1">Capital singularity detected at $235.10.</p>
                <p className="mb-1 text-on-surface-variant">System note: Entropy levels rising.</p>
                <p className="text-primary font-bold">PROBABILITY SCORE: 94.2% Bullish bias.</p>
              </div>
              <button className="w-full py-3.5 rounded-full bg-primary/30 text-background/50 font-headline font-black text-[10px] tracking-[0.3em] uppercase border border-primary/20 flex items-center justify-center gap-2 transition-all duration-1000 grayscale opacity-30" id="modal-submit-btn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.031 2c-5.517 0-9.997 4.48-9.997 9.997 0 1.765.459 3.424 1.266 4.872l-1.301 4.745 4.856-1.274c1.404.767 3.007 1.205 4.71 1.205 5.517 0 9.996-4.479 9.996-9.997 0-5.517-4.479-9.997-9.996-9.997zm6.394 14.161c-.266.75-1.547 1.365-2.127 1.458-.58.094-1.121.134-3.15-.658-2.6-1.015-4.275-3.664-4.405-3.837-.13-.173-1.055-1.405-1.055-2.677 0-1.271.65-1.897.881-2.157.231-.26.505-.325.674-.325.169 0 .338.001.485.008.151.007.354-.057.555.43.201.487.688 1.674.748 1.795.061.121.101.261.02.423-.081.162-.121.261-.242.401-.12.14-.253.313-.362.42-.119.117-.243.245-.104.482.139.237.618 1.02 1.327 1.65.912.81 1.682 1.061 1.919 1.179.237.118.376.098.515-.061.139-.159.595-.694.754-.925.159-.231.318-.195.536-.115.218.08 1.385.654 1.623.773.238.118.397.177.456.277.059.1.059.578-.207 1.328z"></path>
                </svg>
                <span className="btn-text">COMMIT TO LEDGER</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#070d1f]/60 backdrop-blur-xl border-b border-primary/5">
        <div className="flex justify-between items-center px-6 py-5 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" data-icon="flare">flare</span>
            <span className="text-xl font-bold tracking-[0.2em] text-primary font-headline">COSMIC INTEL</span>
          </div>
          <button className="primary-trigger bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest text-primary hover:bg-primary/20 transition-all uppercase" onClick={handlePrimaryClick}>SRA</button>
        </div>
      </header>

      <main className="pt-24 pb-0 px-6 cosmic-gradient">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <span className="text-secondary font-headline text-xs tracking-[0.3em] uppercase">Neural Integrity: Optimal</span>
              <h1 className="text-4xl font-headline font-bold text-on-surface leading-tight tracking-tighter">
                Decipher the <br /><span className="text-primary">Digital Ether.</span>
              </h1>
            </div>
            <div className="relative shrink-0 w-24 h-24 group">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 overflow-hidden shadow-[0_0_20px_rgba(153,247,255,0.2)] bg-surface-container-highest transition-transform duration-500 group-hover:scale-110 group-hover:border-primary/60 animate-eye-pulse">
                <img alt="Futuristic Robot" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAb621x0F_AWoLHGgVY45TVoXWwHKXvvglMoG48kgm37_AW1Tx6IyJMlG6ITVLBooN-6_so7OGCA7uQS5U6oePjnXzWAnF_qYVK4DhNFGnsksIjSaADQOAoHWF3j5ZjZhE8kOLGcTmx1rzjVAItQzeOc1hnbH4tcKjqpXjUYzoiFODIxj9lWEJULTtYrnJnqTZRTArSbGUjvfd6Cg9o4x7xOTRprsHUTIWDlkxH-3uWWMa_At6MHSEmIRay43rBQWoUjOivw_WE2oxl" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-40"></div>
              </div>
              <div className="absolute -inset-1 bg-primary/10 rounded-full blur-md -z-10 group-hover:bg-primary/20 transition-all"></div>
            </div>
          </div>
        </section>

        {/* Prediction CTA */}
        <section className="mb-12">
          <button className="primary-trigger w-full py-5 rounded-full bg-surface-container-lowest border-2 border-primary/50 animate-glow-pulse mb-8 flex items-center justify-center gap-3 group transition-all hover:scale-[1.02] hover:border-primary" id="main-prediction-btn" onClick={handlePrimaryClick}>
            <span className="btn-text text-primary font-headline font-black tracking-[0.3em] uppercase text-sm">SYNCHRONIZE WITH THE ORACLE</span>
            <span className="material-symbols-outlined text-primary group-hover:rotate-180 transition-transform btn-icon" data-icon="bolt" style={{ opacity: 1 }}>bolt</span>
          </button>
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-label text-on-surface-variant uppercase tracking-[0.3em] px-2">Temporal Flux Patterns</h4>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scroll">
              <div className="shrink-0 w-40 glass-panel p-4 rounded-3xl border border-outline-variant/20">
                <div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold text-on-surface">S&amp;P 500</span><span className="text-[10px] text-primary">+12.4%</span></div>
                <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 30"><path d="M0,25 L10,22 L20,24 L30,18 L40,20 L50,12 L60,15 L70,8 L80,10 L90,2 L100,5" fill="none" stroke="#99f7ff" strokeWidth="1.5"></path></svg>
                <p className="text-[8px] text-on-surface-variant mt-2 uppercase tracking-tighter text-center">Quantum Delta</p>
              </div>
              <div className="shrink-0 w-40 glass-panel p-4 rounded-3xl border border-outline-variant/20">
                <div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold text-on-surface">NASDAQ</span><span className="text-[10px] text-primary">+18.2%</span></div>
                <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 30"><path d="M0,28 L20,20 L40,25 L60,10 L80,15 L100,2" fill="none" stroke="#99f7ff" strokeWidth="1.5"></path></svg>
                <p className="text-[8px] text-on-surface-variant mt-2 uppercase tracking-tighter text-center">Kinetic Momentum</p>
              </div>
            </div>
          </div>
        </section>

        {/* Deep Insight */}
        <section className="mb-12">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
            <button className="primary-trigger relative w-full bg-surface-container-lowest py-6 rounded-full flex items-center justify-center gap-3 border border-outline-variant/30" onClick={handlePrimaryClick}>
              <span className="btn-text text-primary font-headline font-bold tracking-[0.2em] uppercase text-sm">Initiate Deep Neural Synthesis</span>
              <span className="material-symbols-outlined text-primary btn-icon" data-icon="auto_awesome">auto_awesome</span>
            </button>
          </div>
          <p className="text-center mt-6 text-on-surface-variant text-[10px] uppercase tracking-widest px-8">Unveil advanced neurological pattern recognition for 500+ global entities.</p>
        </section>

        {/* Oracle Chart */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-headline font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Probabilistic Quantum Projection
            </h3>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Neural Link: Active</span>
          </div>
          <div className="bg-surface-container-low rounded-[2.5rem] p-1 border border-outline-variant/10 mb-6">
            <div className="h-64 relative rounded-[2.3rem] overflow-hidden bg-surface-container-lowest">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#41475b 1px, transparent 1px), linear-gradient(90deg, #41475b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-x-0 bottom-12 h-32">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                  <defs>
                    <linearGradient id="line-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#99f7ff" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#99f7ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,80 Q50,20 100,50 T200,30 T300,70 T400,10" fill="none" stroke="#99f7ff" strokeWidth="2" />
                  <path d="M0,80 Q50,20 100,50 T200,30 T300,70 T400,10 V100 H0 Z" fill="url(#line-gradient)" />
                </svg>
              </div>
              <div className="absolute top-4 left-6 flex flex-col gap-1">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">Projection: Bullish</span>
                <span className="text-xs text-on-surface-variant">Confidence Factor: 94.2%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Historical Stock Data Carousel */}
        <section className="w-full relative overflow-hidden h-[400px] border-t border-primary/10 bg-black/20">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent z-10 h-20"></div>
          <div className="animate-scroll-vertical flex flex-col gap-6 py-8 px-4" id="stock-ticker">
            <div className="flex flex-col gap-4">
              <div className="glass-panel rounded-2xl p-4 border border-outline-variant/20 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-on-surface font-headline">AAPL: Apple Inc.</span>
                  <span className="text-[10px] text-on-surface-variant font-label tracking-widest uppercase">Historical Session Q3</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">$189.22</p>
                  <p className="text-[10px] font-bold text-primary">+2.4%</p>
                </div>
              </div>
              <div className="glass-panel rounded-2xl p-4 border border-outline-variant/20 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-on-surface font-headline">TSLA: Tesla Motors</span>
                  <span className="text-[10px] text-on-surface-variant font-label tracking-widest uppercase">After Hours Delta</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-secondary">$238.45</p>
                  <p className="text-[10px] font-bold text-secondary">-1.2%</p>
                </div>
              </div>
              <div className="glass-panel rounded-2xl p-4 border border-outline-variant/20 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-on-surface font-headline">BTC: Bitcoin Core</span>
                  <span className="text-[10px] text-on-surface-variant font-label tracking-widest uppercase">Institutional Ledger</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">$64,201.12</p>
                  <p className="text-[10px] font-bold text-primary">+5.8%</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="glass-panel rounded-2xl p-4 border border-outline-variant/20 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-on-surface font-headline">NVDA: NVIDIA Corp</span>
                  <span className="text-[10px] text-on-surface-variant font-label tracking-widest uppercase">AI Compute Volume</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">$892.45</p>
                  <p className="text-[10px] font-bold text-primary">+12.4%</p>
                </div>
              </div>
              <div className="glass-panel rounded-2xl p-4 border border-outline-variant/20 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-on-surface font-headline">ETH: Ethereum</span>
                  <span className="text-[10px] text-on-surface-variant font-label tracking-widest uppercase">Node Verification</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-secondary">$3,421.15</p>
                  <p className="text-[10px] font-bold text-secondary">-0.8%</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background w-full py-12 px-8 border-t border-outline-variant/15 pb-32">
        <div className="flex flex-col items-center gap-8 w-full max-w-screen-2xl mx-auto">
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg font-black text-primary font-headline tracking-tighter text-center">COSMIC INTELLIGENCE</span>
            <p className="text-on-background/50 font-body text-[10px] uppercase tracking-[0.2em] text-center">© 2026 ALL RIGHTS OBSERVED.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            <a className="text-on-background/50 hover:text-primary font-body text-xs uppercase tracking-widest transition-all" href="#">TERMINAL</a>
            <a className="text-on-background/50 hover:text-primary font-body text-xs uppercase tracking-widest transition-all" href="#">ORACLE FEED</a>
            <a className="text-on-background/50 hover:text-primary font-body text-xs uppercase tracking-widest transition-all" href="#">NEURAL MAP</a>
          </nav>
        </div>
      </footer>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-8 left-0 right-0 z-[60] px-6" id="sticky-cta">
        <button className="primary-trigger w-full bg-primary text-background py-5 rounded-full font-headline font-black text-sm tracking-[0.3em] uppercase shadow-[0_10px_30px_rgba(153,247,255,0.4)] border border-white/20 transition-transform active:scale-95" onClick={handlePrimaryClick}>
          <span className="btn-text">UNLOCK FULL ANALYSIS</span>
        </button>
      </div>
    </>
  )
}
