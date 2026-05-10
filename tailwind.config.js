/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        mocha: {
          50:  "#fdf8f3",
          100: "#f7ead9",
          200: "#efd4b3",
          300: "#e2b580",
          400: "#d4904d",
          500: "#c67332",
          600: "#a85926",
          700: "#8a4220",
          800: "#6b3019",
          900: "#4a2010",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
