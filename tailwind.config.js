/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/*.js",
  ],
  theme: {
    extend: {
      colors: {
        'spotify-bg': '#121212',
        'spotify-component': '#212121',
        'spotify-search': '#b3b3b3'
      }
    },
  },
  plugins: [],
}

