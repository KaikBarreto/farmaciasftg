/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        red: {
          50:  '#fff1f1',
          100: '#ffe0e0',
          200: '#ffc6c6',
          300: '#ff9d9d',
          400: '#ff6464',
          500: '#ff2929',
          600: '#e60000',
          700: '#cc0000',
          800: '#a80000',
          900: '#8a0000',
          950: '#4d0000',
        },
        yellow: {
          400: '#FFD700',
          500: '#F5C800',
          600: '#E0B800',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': 'linear-gradient(to bottom right, #cc0000 0%, #cc0000 100%)',
        'promo-pattern': 'linear-gradient(135deg, #8a0000 0%, #cc0000 100%)',
      },
    },
  },
  plugins: [],
}
