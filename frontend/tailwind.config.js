/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#EDEDF0',
          dark: '#08080A',       // deeper dark from the new design
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#18181B',
          'dark-2': '#1C1C1F',
          sunken: '#F5F5F7',
        },
        border: {
          DEFAULT: '#DCDBDF',
          dark: '#27272A',
        },
        ink: {
          DEFAULT: '#18181B',
          secondary: '#71717A',
          tertiary: '#A1A1AA',
          dark: '#EDEDEF',
          'dark-secondary': '#96979C',
          'dark-tertiary': '#6C6D72',
        },
        accent: {
          DEFAULT: '#4C51BF',
          hover: '#3F44A6',
          pressed: '#33378C',
          subtle: '#EEF0FC',
          'subtle-dark': '#14152B',
          glow: 'rgba(76,81,191,0.18)',
          border: '#C7CBF0',
          selection: '#DEE1F8',
          'gradient-to': '#6B70D6',
        },
        success: {
          DEFAULT: '#16A34A',
          subtle: '#E9F8EF',
        },
        danger: {
          DEFAULT: '#DC2626',
          subtle: '#FDECEC',
        },
        stage: {
          DEFAULT: '#E1E2E6',
          dark: '#08080A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        xs: ['11px', { lineHeight: '1.5' }],
        sm: ['12px', { lineHeight: '1.5' }],
        base: ['13px', { lineHeight: '1.6' }],
        md: ['14px', { lineHeight: '1.5' }],
        lg: ['16px', { lineHeight: '1.4' }],
        xl: ['18px', { lineHeight: '1.35' }],
        '2xl': ['22px', { lineHeight: '1.25' }],
        '3xl': ['28px', { lineHeight: '1.2' }],
      },
      borderRadius: {
        sm: '5px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        full: '9999px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(15,15,16,0.06), 0 4px 16px -4px rgba(15,15,16,0.10)',
        card: '0 0 0 1px rgba(15,15,16,0.06), 0 2px 8px -2px rgba(15,15,16,0.08)',
        // Light-mode ambient elevation
        ambient: '0 1px 2px rgba(10,16,14,0.28), 0 24px 48px -20px rgba(10,16,14,0.40), 0 0 0 1px rgba(0,0,0,0.04)',
        // Dark-mode glass float: inner white shimmer + deep outer drop
        'glass-panel': '0 1px 1px rgba(255,255,255,0.05) inset, 0 30px 60px -22px rgba(0,0,0,0.80), 0 0 0 1px rgba(255,255,255,0.00)',
        ring: '0 0 0 3px rgba(76,81,191,0.28)',
        'canvas-image': '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        'sidebar-active': '0 0 0 1px rgba(76,81,191,0.20), inset 0 0 0 1px rgba(76,81,191,0.08)',
      },
      backdropBlur: {
        glass: '18px',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.045)', opacity: '0.85' },
        },
        'ring-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(76,81,191,0.0)' },
          '50%': { boxShadow: '0 0 0 6px rgba(76,81,191,0.10)' },
        },
      },
      animation: {
        scanline: 'scanline 1.8s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-up': 'fade-up 0.25s ease-out',
        'slide-in-right': 'slide-in-right 0.2s ease-out',
        breathe: 'breathe 3.6s ease-in-out infinite',
        'ring-pulse': 'ring-pulse 3.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
