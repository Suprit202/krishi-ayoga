// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This tells Tailwind to scan all JS/JSX files in src/
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce4bc',
          300: '#90cf90',
          400: '#5cb45c',
          500: '#2c6e49',
          600: '#1e4e34',
          700: '#153e28',
          800: '#0f2d1d',
          900: '#0a1f14',
        },
        secondary: {
          50: '#f6f8f7',
          100: '#e8efeb',
          200: '#d1dfd6',
          300: '#acc6b6',
          400: '#80a58f',
          500: '#4c956c',
          600: '#3a7a57',
          700: '#306248',
          800: '#2a4f3b',
          900: '#244132',
        }
      },
    },
  },
  plugins: [],
}