/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — Apothecary Editorial
        cream:   '#F8F4ED',  // background dominante
        parch:   '#EEE6D8',  // pergaminho (cards secundários, divisores)
        ink:     '#1A1614',  // tinta (texto principal, preto quente)
        mute:    '#6B5D52',  // texto secundário (cinza quente)
        wine: {
          50:  '#FBF2F3',
          100: '#F5DCDF',
          200: '#E8B2B8',
          300: '#D77F88',
          400: '#B83E4A',
          500: '#A11D2B',
          600: '#8B1A24',  // PRINCIPAL — vinho FTG
          700: '#73151D',
          800: '#5A1018',
          900: '#3D0A10',
        },
        gold: {
          400: '#E0B14A',
          500: '#C8932E',  // ouro velho
          600: '#A87819',
          700: '#856014',
        },
        // legacy aliases (compatibilidade)
        red:    { 700: '#8B1A24', 800: '#73151D', 900: '#5A1018' },
        yellow: { 400: '#E0B14A', 500: '#C8932E' },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans:    ['"Manrope"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern':  'linear-gradient(135deg, #F8F4ED 0%, #EEE6D8 100%)',
        'wine-pattern':  'linear-gradient(135deg, #73151D 0%, #8B1A24 60%, #A11D2B 100%)',
        'grain':         "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      opacity: {
        4: '0.04', 6: '0.06', 8: '0.08', 12: '0.12', 18: '0.18', 22: '0.22',
        45: '0.45', 55: '0.55', 65: '0.65', 85: '0.85',
      },
      borderOpacity: {
        4: '0.04', 6: '0.06', 8: '0.08', 12: '0.12', 18: '0.18',
      },
      textOpacity: {
        45: '0.45', 55: '0.55', 65: '0.65', 85: '0.85',
      },
      backgroundOpacity: {
        4: '0.04', 6: '0.06', 8: '0.08', 12: '0.12', 18: '0.18',
      },
    },
  },
  plugins: [],
}
