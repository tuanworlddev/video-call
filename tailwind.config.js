/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      aspectRatio: {
        '4x3': '4 / 3'
      }
    },
  },
  plugins: [],
}

