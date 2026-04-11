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
        // Airbnb Cereal VF - warm, rounded terminals
        sans: ['Airbnb Cereal VF', 'Circular', '-apple-system', 'system-ui', 'Roboto', 'Helvetica Neue', 'sans-serif'],
        display: ['Airbnb Cereal VF', 'Circular', '-apple-system', 'system-ui', 'Roboto', 'Helvetica Neue', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'monospace'],
      },
      colors: {
        // Airbnb Design System Colors
        background: '#ffffff',
        surface: '#f7f7f7',
        'surface-elevated': '#ffffff',
        
        // Primary Brand - Rausch Red
        'rausch': '#ff385c',
        'rausch-deep': '#e00b41',
        
        // Premium Tiers
        'luxe-purple': '#460479',
        'plus-magenta': '#92174d',
        
        // Text Scale - Warm near-black
        'text-primary': '#222222',
        'text-focused': '#3f3f3f',
        'text-secondary': '#6a6a6a',
        'text-disabled': 'rgba(0, 0, 0, 0.24)',
        'link-disabled': '#929292',
        
        // Interactive
        'legal-blue': '#428bff',
        'border-gray': '#c1c1c1',
        'light-surface': '#f2f2f2',
        
        // Semantic
        'positive-green': '#008a05',
        'danger-red': '#c13515',
        'danger-dark': '#b32505',
        
        // Borders
        'border-default': '#dddddd',
        'border-light': '#ebebeb',
        
        // Legacy compatibility
        primary: '#ff385c',
        secondary: '#6a6a6a',
        accent: '#ff385c',
        text: '#222222',
        'text-body': '#6a6a6a',
        profit: '#008a05',
        loss: '#c13515',
      },
      fontSize: {
        // Airbnb Typography - weights 500-700
        'section-heading': ['1.75rem', { lineHeight: '1.43', letterSpacing: '0', fontWeight: '700' }],
        'card-heading': ['1.38rem', { lineHeight: '1.18', letterSpacing: '-0.44px', fontWeight: '600' }],
        'card-heading-medium': ['1.38rem', { lineHeight: '1.18', letterSpacing: '-0.44px', fontWeight: '500' }],
        'sub-heading': ['1.31rem', { lineHeight: '1.43', letterSpacing: '0', fontWeight: '700' }],
        'feature-title': ['1.25rem', { lineHeight: '1.20', letterSpacing: '-0.18px', fontWeight: '600' }],
        'ui-medium': ['1.00rem', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '500' }],
        'ui-semibold': ['1.00rem', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '600' }],
        'button': ['1.00rem', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '500' }],
        'body': ['0.88rem', { lineHeight: '1.43', letterSpacing: '0', fontWeight: '400' }],
        'body-medium': ['0.88rem', { lineHeight: '1.29', letterSpacing: '0', fontWeight: '500' }],
        'caption-salt': ['0.88rem', { lineHeight: '1.43', letterSpacing: '0', fontWeight: '600' }],
        'small': ['0.81rem', { lineHeight: '1.23', letterSpacing: '0', fontWeight: '400' }],
        'tag': ['0.75rem', { lineHeight: '1.33', letterSpacing: '0', fontWeight: '400' }],
        'badge': ['0.69rem', { lineHeight: '1.18', letterSpacing: '0', fontWeight: '600' }],
        'micro-uppercase': ['0.50rem', { lineHeight: '1.25', letterSpacing: '0.32px', fontWeight: '700' }],
        
        // Hero sizes
        'display-hero': ['3.00rem', { lineHeight: '1.1', letterSpacing: '-0.44px', fontWeight: '700' }],
        'display-large': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.44px', fontWeight: '700' }],
      },
      borderRadius: {
        'subtle': '4px',
        'standard': '8px',
        'badge': '14px',
        'card': '20px',
        'large': '32px',
        'circle': '50%',
      },
      boxShadow: {
        // Airbnb three-layer shadow system
        'card': 'rgba(0, 0, 0, 0.02) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 2px 6px, rgba(0, 0, 0, 0.1) 0px 4px 8px',
        'hover': 'rgba(0, 0, 0, 0.08) 0px 4px 12px',
        'focus-ring': '0 0 0 2px #222222',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #ff385c 0%, #e00b41 100%)',
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
        '11': '2.75rem',
        '15': '3.75rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
export default config
