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
        studio: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          card: 'var(--color-card)',
          border: 'var(--color-border)',
          accent: 'var(--color-accent)',
          accentHover: 'var(--color-accent-hover)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          darkBg: '#000F13',
          darkSurface: '#092328',
          darkBorder: '#27555C',
          darkAccent: '#50E2E5',
          darkText: '#F6FAFA',
          darkMuted: '#AEC5C7',
          lightBg: '#F1F8F8',
          lightSurface: '#FFFFFF',
          lightBorder: '#C6DFE2',
          lightAccent: '#006A70',
          lightText: '#102B30',
          lightMuted: '#395F65',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Roboto', 'sans-serif'],
        script: ['Dancing Script', 'cursive'],
      }
    },
  },
  plugins: [],
}

