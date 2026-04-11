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
        // Airtable Design System - Haas font family
        sans: ['Haas', '-apple-system', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Haas Groot Disp', 'Haas', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'monospace'],
      },
      colors: {
        // Airtable Design System Colors
        background: '#ffffff',
        surface: '#f8fafc',
        'surface-elevated': '#ffffff',
        
        // Primary Brand - Airtable Blue
        'airtable-blue': '#1b61c9',
        'mid-blue': '#254fad',
        
        // Primary Text - Deep Navy
        'deep-navy': '#181d26',
        
        // Semantic Colors
        'success-green': '#006400',
        'text-weak': 'rgba(4, 14, 32, 0.69)',
        'text-secondary': '#333333',
        'secondary-active': 'rgba(7, 12, 20, 0.82)',
        
        // Borders
        'border-default': '#e0e2e6',
        'border-light': '#f0f1f3',
        
        // Shadows
        'shadow-ambient': 'rgba(15, 48, 106, 0.05)',
        
        // Spotlight
        'spotlight': 'rgba(249, 252, 255, 0.97)',
        
        // Semantic
        'positive-green': '#008a05',
        'danger-red': '#c13515',
        
        // Legacy compatibility
        primary: '#1b61c9',
        secondary: '#333333',
        accent: '#1b61c9',
        text: '#181d26',
        'text-body': '#333333',
        profit: '#008a05',
        loss: '#c13515',
        
        // Legacy Airbnb colors for compatibility
        'rausch': '#1b61c9',
        'rausch-deep': '#254fad',
        'text-primary': '#181d26',
      },
      fontSize: {
        // Airtable Typography System - Mobile-first with positive letter-spacing
        'display-hero': ['1.75rem', { lineHeight: '1.15', letterSpacing: '0', fontWeight: '400' }],
        'display-bold': ['1.75rem', { lineHeight: '1.50', letterSpacing: '0', fontWeight: '900' }],
        'section-heading': ['1.5rem', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '400' }],
        'sub-heading': ['1.25rem', { lineHeight: '1.20', letterSpacing: '0', fontWeight: '400' }],
        'card-title': ['1.125rem', { lineHeight: '1.25', letterSpacing: '0.12px', fontWeight: '400' }],
        'feature': ['0.9375rem', { lineHeight: '1.375', letterSpacing: '0.1px', fontWeight: '400' }],
        'body': ['0.875rem', { lineHeight: '1.35', letterSpacing: '0.18px', fontWeight: '400' }],
        'body-medium': ['0.8125rem', { lineHeight: '1.30', letterSpacing: '0.12px', fontWeight: '500' }],
        'button': ['0.8125rem', { lineHeight: '1.275', letterSpacing: '0.08px', fontWeight: '500' }],
        'caption': ['0.75rem', { lineHeight: '1.30', letterSpacing: '0.18px', fontWeight: '400' }],
        'small': ['0.6875rem', { lineHeight: '1.25', letterSpacing: '0.08px', fontWeight: '400' }],
        
        // UI sizes
        'ui-medium': ['0.875rem', { lineHeight: '1.25', letterSpacing: '0.08px', fontWeight: '500' }],
        'ui-semibold': ['0.875rem', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '600' }],
      },
      borderRadius: {
        'subtle': '2px',
        'standard': '12px',
        'relaxed': '16px',
        'card': '20px',
        'section': '24px',
        'large': '32px',
        'circle': '50%',
      },
      boxShadow: {
        // Airtable blue-tinted multi-layer shadow system
        'card': 'rgba(0, 0, 0, 0.32) 0px 0px 1px, rgba(0, 0, 0, 0.08) 0px 0px 2px, rgba(45, 127, 249, 0.28) 0px 1px 3px, rgba(0, 0, 0, 0.06) 0px 0px 0px 0.5px inset',
        'hover': 'rgba(0, 0, 0, 0.32) 0px 0px 1px, rgba(0, 0, 0, 0.08) 0px 0px 2px, rgba(45, 127, 249, 0.35) 0px 2px 6px',
        'ambient': 'rgba(15, 48, 106, 0.05) 0px 0px 20px',
        'focus-ring': '0 0 0 2px #1b61c9',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #1b61c9 0%, #254fad 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      spacing: {
        '11': '2.75rem',
        '15': '3.75rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
export default config
