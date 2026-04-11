import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // ClickHouse Type System - Inter with full weight spectrum
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Inconsolata', 'Fira Mono', 'monospace'],
      },
      colors: {
        // ClickHouse Design System - Pure Black Canvas
        background: '#000000',
        surface: '#141414',
        'surface-elevated': '#1a1a1a',
        
        // Neon Volt - Primary Accent
        'neon-volt': '#faff69',
        'neon-volt-hover': '#f4f692',
        
        // Forest Green - Secondary CTA
        'forest-green': '#166534',
        'dark-forest': '#14572f',
        
        // Text Scale
        'text-primary': '#ffffff',
        'text-secondary': '#a0a0a0',
        'text-muted': '#585858',
        'text-disabled': 'rgba(255, 255, 255, 0.28)',
        
        // Charcoal Borders
        'charcoal': 'rgba(65, 65, 65, 0.8)',
        'deep-charcoal': '#343434',
        'hover-gray': '#3a3a3a',
        
        // Semantic
        'positive-green': '#008a05',
        'danger-red': '#c13515',
        
        // Borders - ClickHouse charcoal
        'border-default': 'rgba(65, 65, 65, 0.8)',
        'border-light': 'rgba(65, 65, 65, 0.5)',
        
        // Legacy compatibility
        primary: '#faff69',
        secondary: '#a0a0a0',
        accent: '#faff69',
        text: '#ffffff',
        'text-body': '#a0a0a0',
        profit: '#008a05',
        loss: '#c13515',
      },
      fontSize: {
        // ClickHouse Typography System - Weight IS hierarchy
        'display-mega': ['6rem', { lineHeight: '1.00', letterSpacing: '0', fontWeight: '900' }], // 96px
        'display-hero': ['4.5rem', { lineHeight: '1.00', letterSpacing: '0', fontWeight: '700' }], // 72px
        'feature-heading': ['2.25rem', { lineHeight: '1.30', letterSpacing: '0', fontWeight: '600' }], // 36px
        'sub-heading': ['1.5rem', { lineHeight: '1.17', letterSpacing: '0', fontWeight: '600' }], // 24px
        'feature-title': ['1.25rem', { lineHeight: '1.40', letterSpacing: '0', fontWeight: '600' }], // 20px
        'body-large': ['1.13rem', { lineHeight: '1.56', letterSpacing: '0', fontWeight: '400' }], // 18px
        'body': ['1rem', { lineHeight: '1.50', letterSpacing: '0', fontWeight: '400' }], // 16px
        'caption': ['0.875rem', { lineHeight: '1.43', letterSpacing: '0', fontWeight: '400' }], // 14px
        'uppercase-label': ['0.875rem', { lineHeight: '1.43', letterSpacing: '0.0875rem', fontWeight: '600' }], // 14px, 1.4px tracking
        'code': ['1rem', { lineHeight: '1.50', letterSpacing: '0', fontWeight: '600' }], // 16px
        'small': ['0.75rem', { lineHeight: '1.33', letterSpacing: '0', fontWeight: '500' }], // 12px
        'micro': ['0.7rem', { lineHeight: '1.79', letterSpacing: '0', fontWeight: '500' }], // 11.2px
      },
      borderRadius: {
        // ClickHouse - Sharp geometry (4px/8px)
        'none': '0px',
        'sharp': '4px',
        'comfortable': '8px',
        'pill': '9999px',
        'circle': '50%',
      },
      boxShadow: {
        // ClickHouse - Subtle shadows on black
        'subtle': '0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
        'elevated': '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
        'inset': 'rgba(0,0,0,0.06) 0px 4px 4px, rgba(0,0,0,0.14) 0px 4px 25px inset',
        'focus-ring': '0 0 0 2px #faff69',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'ticker': 'ticker 30s linear infinite',
        'data-refresh': 'dataRefresh 5s ease-in-out infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        dataRefresh: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      spacing: {
        // ClickHouse 8px base unit system
        '11': '2.75rem',
        '15': '3.75rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
export default config
