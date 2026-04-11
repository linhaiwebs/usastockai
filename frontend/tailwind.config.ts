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
        // BMW Type System - fallback to Helvetica/Arial
        sans: ['BMWTypeNextLatin', 'Helvetica', 'Arial', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', 'sans-serif'],
        display: ['BMWTypeNextLatin', 'Helvetica', 'Arial', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'monospace'],
      },
      colors: {
        // BMW Design System Colors
        background: 'var(--bg-primary)',
        surface: 'var(--bg-secondary)',
        'surface-elevated': '#ffffff',
        
        // Primary Brand - BMW Blue (interactive only)
        'bmw-blue': '#1c69d4',
        'bmw-blue-focus': '#0653b6',
        'bmw-blue-hover': '#1479e0',
        
        // Text Scale - BMW Near Black & Gray
        'text-primary': '#262626',
        'text-secondary': '#757575',
        'text-muted': '#bbbbbb',
        'text-disabled': 'rgba(0, 0, 0, 0.24)',
        
        // Semantic
        'positive-green': '#008a05',
        'danger-red': '#c13515',
        
        // Borders - Sharp corners, minimal borders
        'border-default': '#dddddd',
        'border-light': '#ebebeb',
        
        // Legacy compatibility
        primary: '#1c69d4',
        secondary: '#757575',
        accent: '#1c69d4',
        text: '#262626',
        'text-body': '#757575',
        profit: '#008a05',
        loss: '#c13515',
      },
      fontSize: {
        // BMW Typography System - Tight line-heights (1.15-1.30)
        'display-hero': ['3.75rem', { lineHeight: '1.30', letterSpacing: '0', fontWeight: '300' }], // 60px
        'section-heading': ['2.00rem', { lineHeight: '1.30', letterSpacing: '0', fontWeight: '400' }], // 32px
        'nav-emphasis': ['1.13rem', { lineHeight: '1.30', letterSpacing: '0', fontWeight: '900' }], // 18px
        'body': ['1.00rem', { lineHeight: '1.15', letterSpacing: '0', fontWeight: '400' }], // 16px
        'button-bold': ['1.00rem', { lineHeight: '1.20', letterSpacing: '0', fontWeight: '700' }], // 16px
        'button': ['1.00rem', { lineHeight: '1.15', letterSpacing: '0', fontWeight: '400' }], // 16px
        'small': ['0.875rem', { lineHeight: '1.15', letterSpacing: '0', fontWeight: '400' }], // 14px
        'caption': ['0.75rem', { lineHeight: '1.15', letterSpacing: '0', fontWeight: '400' }], // 12px
      },
      borderRadius: {
        // BMW - ZERO border-radius
        'none': '0px',
        'subtle': '0px',
        'standard': '0px',
        'badge': '0px',
        'card': '0px',
        'large': '0px',
        'circle': '50%',
      },
      boxShadow: {
        // BMW - Minimal shadows, depth through contrast
        'card': 'none',
        'hover': 'none',
        'focus-ring': '0 0 0 2px #0653b6',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-bmw': 'linear-gradient(135deg, #1c69d4 0%, #0653b6 100%)',
        'rainbow-header': 'linear-gradient(90deg, #ff6b6b, #ffa500, #ffd700, #4ade80, #06b6d4, #8b5cf6, #ec4899)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'ticker': 'ticker 30s linear infinite',
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
      },
      spacing: {
        // BMW 8px base unit system
        '11': '2.75rem',
        '15': '3.75rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
export default config
