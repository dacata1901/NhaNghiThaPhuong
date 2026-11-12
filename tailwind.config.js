/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          ivory: '#F8F5EF',
          'ivory-white': '#FFFDF8',
          cream: '#EFE8DA',
          beige: '#E3D6BD',
          wood: '#4A3426',
          'wood-deep': '#30251F',
        },
        text: {
          primary: '#30251F',
          secondary: '#6E5F52',
          muted: '#9A8B7C',
          'on-dark': '#F8F5EF',
        },
        brand: {
          gold: '#B69A68',
          'gold-light': '#E6D8B8',
          'gold-dark': '#8C7348',
          champagne: '#EADFC4',
        },
        border: {
          default: '#E0D5C2',
          strong: '#C9B895',
        },
        state: {
          success: '#4F7A5A',
          warning: '#C48A2B',
          danger: '#A8493D',
          info: '#5B7287',
        },
      },
      fontFamily: {
        serif: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        classic: '14px',
        card: '18px',
      },
      boxShadow: {
        luxury: '0 8px 30px rgba(48, 37, 31, 0.06)',
        'luxury-lg': '0 16px 48px rgba(48, 37, 31, 0.12)',
      },
    },
  },
  plugins: [],
};
