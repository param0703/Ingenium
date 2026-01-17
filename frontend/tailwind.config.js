/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uber: {
          black: '#000000',
          white: '#FFFFFF',
          green: '#06C167',
          gray: {
            100: '#F6F6F6',
            200: '#E2E2E2',
            300: '#CBCBCB',
            800: '#292929',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
