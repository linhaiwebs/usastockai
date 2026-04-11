import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['sohne-var', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['sohne-var', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['SourceCodePro', 'SFMono-Regular', 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'monospace'],
      },
      colors: {
        // Stripe Design System Colors
        background: '#ffffff',
        surface: '#f7fafc',
        'surface-elevated': '#ffffff',
        
        // Primary Brand - Stripe Purple
        'stripe-purple': '#533afd',
        'purple-hover': '#4434d4',
        'purple-deep': '#2e2b8c',
        'purple-light': '#b9b9f9',
        'purple-mid': '#665efd',
        'purple-soft': '#d6d9fc',
        
        // Headings - Deep Navy
        'deep-navy': '#061b31',
        'dark-navy': '#0d253d',
        
        // Brand Dark
        'brand-dark': '#1c1e54',
        
        // Text colors
        'label-text': '#273951',
        'body-text': '#64748d',
        
        // Accent colors - Ruby & Magenta (decorative only)
        'ruby': '#ea2261',
        'magenta': '#f96bee',
        'magenta-light': '#ffd7ef',
        
        // Semantic
        'positive-green': '#15be53',
        'positive-text': '#108c3d',
        'danger-red': '#ea2261',
        'warning-lemon': '#9b6829',
        
        // Borders
        'border-default': '#e5edf5',
        'border-purple': '#b9b9f9',
        'border-magenta': '#ffd7ef',
        'border-dashed': '#362baa',
        
        // Neutral
        gray: '#64748d',
        
        // Legacy compatibility
        primary: '#533afd',
        secondary: '#64748d',
        accent: '#533afd',
        text: '#061b31',
        'text-secondary': '#64748d',
        profit: '#15be53',
        loss: '#ea2261',
      },
      fontSize: {
        // Display sizes - Stripe style with weight 300
        'display-hero': ['3.50rem', { lineHeight: '1.03', letterSpacing: '-1.4px', fontWeight: '300' }],
        'display-large': ['3.00rem', { lineHeight: '1.15', letterSpacing: '-0.96px', fontWeight: '300' }],
        'section-heading': ['2.00rem', { lineHeight: '1.10', letterSpacing: '-0.64px', fontWeight: '300' }],
        'sub-heading-large': ['1.63rem', { lineHeight: '1.12', letterSpacing: '-0.26px', fontWeight: '300' }],
        'sub-heading': ['1.38rem', { lineHeight: '1.10', letterSpacing: '-0.22px', fontWeight: '300' }],
        'body-large': ['1.13rem', { lineHeight: '1.40', letterSpacing: '0', fontWeight: '300' }],
        'body': ['1.00rem', { lineHeight: '1.40', letterSpacing: '0', fontWeight: '300' }],
        'button': ['1.00rem', { lineHeight: '1.00', letterSpacing: '0', fontWeight: '400' }],
        'button-small': ['0.88rem', { lineHeight: '1.00', letterSpacing: '0', fontWeight: '400' }],
        'link': ['0.88rem', { lineHeight: '1.00', letterSpacing: '0', fontWeight: '400' }],
        'caption': ['0.81rem', { lineHeight: '1.33', letterSpacing: '0', fontWeight: '400' }],
        'caption-small': ['0.75rem', { lineHeight: '1.33', letterSpacing: '0', fontWeight: '300' }],
        'caption-tabular': ['0.75rem', { lineHeight: '1.33', letterSpacing: '-0.36px', fontWeight: '300' }],
        'micro': ['0.63rem', { lineHeight: '1.15', letterSpacing: '0.1px', fontWeight: '300' }],
      },
      borderRadius: {
        'micro': '1px',
        'standard': '4px',
        'comfortable': '5px',
        'relaxed': '6px',
        'large': '8px',
      },
      boxShadow: {
        // Stripe blue-tinted multi-layer shadows
        'ambient': 'rgba(23,23,23,0.06) 0px 3px 6px',
        'standard': 'rgba(23,23,23,0.08) 0px 15px 35px',
        'elevated': 'rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px',
        'deep': 'rgba(3,3,39,0.25) 0px 14px 21px -14px, rgba(0,0,0,0.1) 0px 8px 17px -8px',
        'focus-ring': '0 0 0 2px #533afd',
        'card': 'rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #ea2261 0%, #f96bee 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
