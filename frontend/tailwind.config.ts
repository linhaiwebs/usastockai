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
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'monospace'],
      },
      colors: {
        // Wise Design System Colors
        background: '#ffffff',
        surface: '#e8ebe6',
        'surface-light': '#f5f7f3',
        
        // Primary Brand
        'near-black': '#0e0f0c',
        'wise-green': '#9fe870',
        'dark-green': '#163300',
        'light-mint': '#e2f6d5',
        'pastel-green': '#cdffad',
        
        // Semantic
        'positive-green': '#054d28',
        'danger-red': '#d03238',
        'warning-yellow': '#ffd11a',
        'bright-orange': '#ffc091',
        
        // Neutral
        'warm-dark': '#454745',
        gray: '#868685',
        'light-surface': '#e8ebe6',
        
        // Legacy compatibility
        primary: '#9fe870',
        secondary: '#868685',
        accent: '#9fe870',
        text: '#0e0f0c',
        'text-secondary': '#868685',
        profit: '#054d28',
        loss: '#d03238',
      },
      fontSize: {
        // Display sizes
        'display-mega': ['7.88rem', { lineHeight: '0.85', letterSpacing: 'normal', fontWeight: '900' }],
        'display-hero': ['6.00rem', { lineHeight: '0.85', letterSpacing: 'normal', fontWeight: '900' }],
        'section-heading': ['4.00rem', { lineHeight: '0.85', letterSpacing: 'normal', fontWeight: '900' }],
        'sub-heading': ['2.50rem', { lineHeight: '0.85', letterSpacing: 'normal', fontWeight: '900' }],
        'card-title': ['1.62rem', { lineHeight: '1.23', letterSpacing: '-0.39px', fontWeight: '600' }],
        'feature-title': ['1.38rem', { lineHeight: '1.25', letterSpacing: '-0.396px', fontWeight: '600' }],
        'body': ['1.13rem', { lineHeight: '1.44', letterSpacing: '0.18px', fontWeight: '400' }],
        'body-semibold': ['1.13rem', { lineHeight: '1.44', letterSpacing: '-0.108px', fontWeight: '600' }],
        'button': ['1.13rem', { lineHeight: '1.44', letterSpacing: '-0.108px', fontWeight: '600' }],
        'caption': ['0.88rem', { lineHeight: '1.50', letterSpacing: '-0.084px', fontWeight: '400' }],
        'small': ['0.75rem', { lineHeight: '1.00', letterSpacing: '-0.084px', fontWeight: '400' }],
      },
      borderRadius: {
        'card': '16px',
        'card-medium': '20px',
        'card-large': '30px',
        'card-section': '40px',
        'pill': '9999px',
      },
      boxShadow: {
        'ring': 'rgba(14,15,12,0.12) 0px 0px 0px 1px',
        'inset-focus': 'rgb(134,134,133) 0px 0px 0px 1px inset',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'scale-hover': 'scaleHover 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleHover: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
