/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FAFAF9',
          dark: '#0F0F10',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#18181B',
          'dark-2': '#1C1C1F',
        },
        border: {
          DEFAULT: '#E7E5E4',
          dark: '#27272A',
        },
        ink: {
          DEFAULT: '#18181B',
          secondary: '#71717A',
          tertiary: '#A1A1AA',
          dark: '#FAFAFA',
          'dark-secondary': '#A1A1AA',
          'dark-tertiary': '#71717A',
        },
        accent: {
          DEFAULT: '#6D5BD0',
          hover: '#5C4CB8',
          subtle: '#EEEAFB',
          'subtle-dark': '#2A2440',
          glow: 'rgba(109,91,208,0.15)',
        },
        success: {
          DEFAULT: '#16A34A',
          subtle: '#E9F8EF',
        },
        danger: {
          DEFAULT: '#DC2626',
          subtle: '#FDECEC',
        },
        // Dedicated canvas-stage dark bg
        stage: {
          DEFAULT: '#111113',
          dark: '#0A0A0C',
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
        soft: '0 1px 3px rgba(15, 15, 16, 0.06), 0 4px 16px -4px rgba(15, 15, 16, 0.10)',
        card: '0 0 0 1px rgba(15, 15, 16, 0.06), 0 2px 8px -2px rgba(15, 15, 16, 0.08)',
        ring: '0 0 0 3px rgba(109, 91, 208, 0.25)',
        'canvas-image': '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        'sidebar-active': '0 0 0 1px rgba(109,91,208,0.25), inset 0 0 0 1px rgba(109,91,208,0.08)',
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
      },
      animation: {
        scanline: 'scanline 1.8s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-up': 'fade-up 0.25s ease-out',
        'slide-in-right': 'slide-in-right 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
