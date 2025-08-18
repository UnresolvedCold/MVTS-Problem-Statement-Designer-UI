/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      width: {
        '50': '200px',
        '75': '300px',
        '150': '600px',
      },
      spacing: {
        '0.5': '2px',
      }
    },
  },
  plugins: [],
}
