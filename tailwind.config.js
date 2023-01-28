/** @type {import('tailwindcss').Config} */
const konstaConfig = require('konsta/config');
module.exports = konstaConfig({})
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', 
  'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  'node_modules/@headlessui/react/**/*.{js,jsx,ts,tsx}',
  'node_modules/@headlessui/tailwindcss/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [
    require('flowbite/plugin'),
    require('@headlessui/react'),
    require('@headlessui/tailwindcss'),
  ]
}
