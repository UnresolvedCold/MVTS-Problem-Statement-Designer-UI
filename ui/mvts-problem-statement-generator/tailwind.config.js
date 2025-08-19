/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      width: {
        '30': '120px',
        '50': '200px',
        '62': '250px',
        '75': '300px',
        '150': '600px',
      },
      height: {
        '15': '60px',
        '75': '300px',
      },
      spacing: {
        '0.5': '2px',
      }
    },
  },
  plugins: [],
}
