/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
      extend: {
        fontFamily: {
          chineseArtWord: ["ZCOOL QingKe HuangYou", "sans-serif"], // Adds a new `font-display` class
        }
      }
    }
  }