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
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: '#137fec',
        'brand-dark': '#0d5fb8',
        'brand-light': '#e8f2fd',
        surface: '#ffffff',
        'surface-alt': '#f7f9fc',
        'surface-muted': '#eef2f7',
        'text-primary': '#1a1d23',
        'text-secondary': '#5f6b7a',
        'text-muted': '#8c96a6',
        'border-default': '#e2e8f0',
        'border-light': '#f0f3f7',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        'card-blue': '#e8f2fd',
        'card-green': '#ecfdf5',
        'card-purple': '#f3e8ff',
        'card-amber': '#fffbeb',
      },
      borderRadius: {
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        nav: '0 1px 3px rgba(0,0,0,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
