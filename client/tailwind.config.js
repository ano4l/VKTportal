/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'virtukey': {
          'dark': '#2d2d2d',
          'light': '#f5f5f5',
          'accent-red': '#dc2626',
          'accent-purple': '#9333ea',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

