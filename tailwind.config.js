/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#06060e',
        panel: '#0c0c18',
        'panel-border': '#1a1a30',
        text: {
          DEFAULT: '#c8c8d8',
          dim: '#666680',
          bright: '#e8e8f0',
        },
        accent: '#ffd700',
        swordsman: {
          DEFAULT: '#8b1a2b',
          stroke: '#e94560',
        },
        mage: {
          DEFAULT: '#3b2d7a',
          stroke: '#7b68ee',
        },
        'first-person': {
          DEFAULT: '#6b5a00',
          stroke: '#ffd700',
        },
        shared: {
          DEFAULT: '#0a4a5c',
          stroke: '#00d9ff',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
