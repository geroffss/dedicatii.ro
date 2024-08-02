/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'rxs': '320px', // Custom screen size for extra small devices
        'sm': '640px',  // Small devices
        'md': '768px',  // Medium devices63a1fa
        'lg': '1024px', // Large devices
      },
      colors: {
        'dedicatii-bg':'#120E18',
        'dedicatii-bg2':'#1A1423',
        'dedicatii-button1': '#de3c4b',
        'dedicatii-button2': '#63a1fa',
        'dedicatii-button3': '#a658f7',
      }
    },
  },
  plugins: [],
}