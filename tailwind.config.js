/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3f0ff',
          100: '#e9e3ff',
          200: '#d4c9ff',
          300: '#b49dff',
          400: '#9061ff',
          500: '#7C3AED',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b0f7a',
        },
        surface: {
          DEFAULT: '#0c0c10',
          card: '#141419',
          hover: '#1c1c24',
          border: '#26262f',
          'border-light': '#35354a',
        },
      },
    },
  },
  plugins: [],
};
