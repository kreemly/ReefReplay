/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'black-abs': '#000000',
        'dark-gray': '#0a0d14',
        'card-gray': '#111522',
        'accent-gold': '#f59e0b',
        'accent-green': '#10b981',
        'accent-red': '#f43f5e',
        'accent-purple': '#a855f7',
        'accent-blue': '#0ea5e9',
      },
      fontFamily: {
        title: ['Outfit', 'Geist', 'sans-serif'],
        body: ['Geist', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        '3d-neon-blue': '0 0 20px rgba(14, 165, 233, 0.15), 0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        '3d-neon-red': '0 0 20px rgba(244, 63, 94, 0.15), 0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        '3d-neon-green': '0 0 20px rgba(16, 185, 129, 0.15), 0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        '3d-neon-purple': '0 0 20px rgba(168, 85, 247, 0.15), 0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
}
