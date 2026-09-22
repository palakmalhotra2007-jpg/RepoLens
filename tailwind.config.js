/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-base': '#0B0D10',
        'bg-surface': '#14171B',
        'bg-surface-2': '#1B1F24',
        'border-default': '#262B31',
        'border-strong': '#383F47',
        'text-primary': '#E8EAED',
        'text-secondary': '#9AA1AA',
        'text-tertiary': '#676E77',
        accent: {
          DEFAULT: '#4FA3D9',
          hover: '#6BB4E0',
        },
        'status-good': '#4C9A6A',
        'status-warn': '#C99A3C',
        'status-critical': '#B54A4A',
        // Map legacy aliases strictly to design tokens
        background: '#0B0D10',
        surface: '#14171B',
        'surface-elevated': '#1B1F24',
        'surface-overlay': '#262B31',
        border: {
          DEFAULT: '#262B31',
          subtle: '#262B31',
          strong: '#383F47',
          accent: '#4FA3D9',
        },
        primary: {
          500: '#4FA3D9',
          600: '#6BB4E0',
        },
        status: {
          danger: '#B54A4A',
          success: '#4C9A6A',
          warning: '#C99A3C',
          info: '#4FA3D9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        badge: '4px',
        card: '6px',
        modal: '8px',
      }
    },
  },
  plugins: [],
}
