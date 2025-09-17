/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",        // App router
    "./pages/**/*.{js,ts,jsx,tsx}",      // Pages router
    "./components/**/*.{js,ts,jsx,tsx}", // Components folder
    "./dashboard/**/*.{js,ts,jsx,tsx}"   
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
