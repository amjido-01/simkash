/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{html,js,jsx,ts,tsx}',
    './src/core-components/**/**/*.{html,js,jsx,ts,tsx}',
    './src/components/**/*.{html,js,jsx,ts,tsx,mdx}',
    './src/hooks/**/*.{html,js,jsx,ts,tsx,mdx}',
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        manroperegular: "ManropeMedium",
        manropesemibold: "ManropeSemiBold"
      }
    },
  },
  plugins: [],
};
