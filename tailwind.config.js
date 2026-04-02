/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f13',
        'bg-card': '#1a1a24',
        'bg-hover': '#252533',
        accent: '#7C3AED',
        'accent-light': '#8B5CF6',
        'accent-dim': '#6D28D9',
      },
    },
  },
  plugins: [],
};
