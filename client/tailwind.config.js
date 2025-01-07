/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'slack': {
          'purple': '#611f69',
          'aubergine': '#4A154B',
          'green': '#007a5a',
          'blue': '#1264a3',
        }
      }
    },
  },
  plugins: [],
} 