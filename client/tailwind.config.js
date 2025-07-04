/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#db2b2e",
        yellowAccent: "#f3eb4b",
        black: "#000000",
        white: "#ffffff",
      },
      fontFamily: {
        nt: ["'NT Voice'", "sans-serif"],
        instrument: ["'Instrument Serif'", "serif"],
        amiri: ["'Amiri'", "serif"],
        noto: ["'Noto Sans Arabic'", "sans-serif"],
      },
      fontWeight: {
        light: '300',
        regular: '400',
        bold: '700',
      },
    },
  },
  plugins: [],
};