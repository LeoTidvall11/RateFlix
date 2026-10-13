/** @type {import('tailwindcss').Config} */
const colors = require('./theme/colors');

module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './screens/**/*.{js,ts,tsx}',
    './theme/**/*.js',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: { colors },
  },
  plugins: [],
};
