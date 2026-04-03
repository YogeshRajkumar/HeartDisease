/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        card: '0 6px 20px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
