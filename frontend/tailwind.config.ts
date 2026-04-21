import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // AI Stock Diagnosis — Stitch ai.stockainow.com Design System
        brand: {
          orange: '#F05D23',
          dark: '#1C1C1C',
          gray: '#F3F4F6',
          lightGray: '#E5E7EB',
        },
        'surface': '#FFFFFF',
        'surface-dim': '#F2F2F2',
        'surface-container': '#F9FAFB',
        'on-surface': '#1C1C1C',
        'on-surface-variant': '#6B7280',
        'on-surface-muted': '#9CA3AF',
        'primary': '#F05D23',
        'primary-dim': '#D4520F',
        'on-primary': '#FFFFFF',
        'secondary': '#1C1C1C',
        'on-secondary': '#FFFFFF',
        'outline': '#E5E7EB',
        'outline-variant': '#D1D5DB',
        'error': '#EF4444',
        'success': '#22C55E',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      animation: {
        'loading-bar': 'loadingProgress 1.5s ease-in-out forwards',
        'btn-activate': 'btn-activate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        'loadingProgress': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'btn-activate': {
          '0%': { opacity: '0.3', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
