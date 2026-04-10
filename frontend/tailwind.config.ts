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
        // Revolut uses Aeonik Pro for display, Inter for body
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['SourceCodePro', 'SFMono-Regular', 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'monospace'],
      },
      colors: {
        // Revolut Design System Colors
        background: '#ffffff',
        surface: '#f4f4f4',
        'surface-elevated': '#ffffff',
        
        // Revolut Primary - Near-black
        'revolut-dark': '#191c1f',
        'revolut-dark-hover': 'rgba(25, 28, 31, 0.85)',
        
        // Brand / Interactive
        'revolut-blue': '#494fdf',
        'action-blue': '#4f55f1',
        'blue-text': '#376cd5',
        
        // Semantic Colors
        'danger': '#e23b4a',
        'deep-pink': '#e61e49',
        'warning': '#ec7e00',
        'yellow': '#b09000',
        'teal': '#00a87e',
        'light-green': '#428619',
        'green-text': '#006400',
        'light-blue': '#007bc2',
        'brown': '#936d62',
        'red-text': '#8b0000',
        
        // Neutral Scale
        'mid-slate': '#505a63',
        'cool-gray': '#8d969e',
        'gray-tone': '#c9c9cd',
        
        // Legacy compatibility
        'brand-dark': '#191c1f',
        'body-text': '#505a63',
        'border-default': '#c9c9cd',
        
        // Legacy compatibility
        primary: '#191c1f',
        secondary: '#505a63',
        accent: '#494fdf',
        text: '#191c1f',
        'text-secondary': '#505a63',
        profit: '#00a87e',
        loss: '#e23b4a',
      },
      fontSize: {
        // Revolut Typography Scale
        'display-mega': ['8.50rem', { lineHeight: '1.00', letterSpacing: '-2.72px', fontWeight: '500' }],
        'display-hero': ['5.00rem', { lineHeight: '1.00', letterSpacing: '-0.8px', fontWeight: '500' }],
        'display-large': ['3.00rem', { lineHeight: '1.21', letterSpacing: '-0.48px', fontWeight: '500' }],
        'section-heading': ['2.50rem', { lineHeight: '1.20', letterSpacing: '-0.4px', fontWeight: '500' }],
        'card-title': ['2.00rem', { lineHeight: '1.19', letterSpacing: '-0.32px', fontWeight: '500' }],
        'feature-title': ['1.50rem', { lineHeight: '1.33', letterSpacing: '0', fontWeight: '400' }],
        'nav-ui': ['1.25rem', { lineHeight: '1.40', letterSpacing: '0', fontWeight: '500' }],
        'body-large': ['1.13rem', { lineHeight: '1.56', letterSpacing: '-0.09px', fontWeight: '400' }],
        'body': ['1.00rem', { lineHeight: '1.50', letterSpacing: '0.24px', fontWeight: '400' }],
        'body-semibold': ['1.00rem', { lineHeight: '1.50', letterSpacing: '0.16px', fontWeight: '600' }],
        'body-bold': ['1.00rem', { lineHeight: '1.50', letterSpacing: '0.24px', fontWeight: '700' }],
        'button': ['1.25rem', { lineHeight: '1.00', letterSpacing: '0', fontWeight: '500' }],
        'button-small': ['0.88rem', { lineHeight: '1.00', letterSpacing: '0', fontWeight: '500' }],
        'caption': ['0.81rem', { lineHeight: '1.33', letterSpacing: '0', fontWeight: '400' }],
        'caption-small': ['0.75rem', { lineHeight: '1.33', letterSpacing: '0', fontWeight: '400' }],
      },
      borderRadius: {
        'standard': '12px',
        'card': '20px',
        'pill': '9999px',
      },
      boxShadow: {
        // Revolut uses ZERO shadows - only focus rings
        'focus-ring': '0 0 0 0.125rem #191c1f',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #494fdf 0%, #4f55f1 100%)',
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
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
    },
  },
  plugins: [],
}
export default config
