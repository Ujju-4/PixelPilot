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
        },
        border: {
          DEFAULT: '#E7E5E4',
          dark: '#27272A',
        },
        ink: {
          DEFAULT: '#18181B',
          secondary: '#71717A',
          dark: '#FAFAFA',
          'dark-secondary': '#A1A1AA',
        },
        accent: {
          DEFAULT: '#6D5BD0',
          hover: '#5C4CB8',
          subtle: '#EEEAFB',
          'subtle-dark': '#2A2440',
        },
        success: {
          DEFAULT: '#16A34A',
          subtle: '#E9F8EF',
        },
        danger: {
          DEFAULT: '#DC2626',
          subtle: '#FDECEC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '20px',
        full: '9999px',
      },
      spacing: {
        '0.5': '4px',
        '1': '8px',
        '1.5': '12px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '8': '64px',
        '10': '80px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(15, 15, 16, 0.06), 0 4px 16px -4px rgba(15, 15, 16, 0.10)',
        card: '0 0 0 1px rgba(15, 15, 16, 0.06), 0 2px 8px -2px rgba(15, 15, 16, 0.08)',
        ring: '0 0 0 3px rgba(109, 91, 208, 0.25)',
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
      },
      animation: {
        scanline: 'scanline 1.8s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
