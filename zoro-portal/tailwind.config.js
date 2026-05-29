/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f13',
        card: '#1a1a24',
        primary: '#7c3aed',
        secondary: '#06b6d4',
      },
    },
  },
  plugins: [],
}