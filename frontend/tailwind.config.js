/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003466',
          container: '#1a4b84',
        },
        secondary: {
          DEFAULT: '#006970',
          container: '#8df2fc',
        },
        tertiary: {
          DEFAULT: '#522900',
          container: '#733c00',
        },
        surface: {
          DEFAULT: '#f8f9fa',
          lowest: '#ffffff',
          low: '#f3f4f5',
          high: '#e7e8e9',
          highest: '#e1e3e4',
          dim: '#d9dadb',
          bright: '#f8f9fa',
        },
        on: {
          surface: '#191c1d',
          background: '#191c1d',
          primary: '#ffffff',
        },
        outline: {
          DEFAULT: '#737781',
          variant: '#c3c6d1',
        }
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '8': '0.5rem', // ROUND_EIGHT
        'xl': '1.5rem',
      },
      boxShadow: {
        'ambient': '0px 20px 40px rgba(25, 28, 29, 0.06)',
      }
    },
  },
  plugins: [],
}
