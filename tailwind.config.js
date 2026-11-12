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
          'ivory-white': '#FFFDF9',
          cream: '#EFE8DA',
          beige: '#E3D6BD',
          wood: '#4A3426',
          'wood-deep': '#2B201A',
        },
        text: {
          primary: '#221813',
          secondary: '#4A3B31',
          muted: '#6E5D4F',
          'on-dark': '#FFFDF9',
        },
        brand: {
          gold: '#B69A68',
          'gold-light': '#EFE2C6',
          'gold-dark': '#856B3E',
          champagne: '#EADFC4',
        },
        border: {
          default: '#DCD0BA',
          strong: '#C2B08E',
        },
        state: {
          success: '#2E6F40',
          warning: '#B8791A',
          danger: '#A8382B',
          info: '#3B607A',
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
        luxury: '0 8px 30px rgba(48, 37, 31, 0.07)',
        'luxury-lg': '0 16px 48px rgba(48, 37, 31, 0.14)',
      },
    },
  },
  plugins: [],
};
