/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: { colors: { accent: { DEFAULT: '#7c3aed', light:'#a78bfa' } },},
  },
  plugins: [],
};

// Added custom accent via script
