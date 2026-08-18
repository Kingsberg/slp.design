/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx,json}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        display: ['Google Sans Flex', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        brand: { lime: '#c1ff72' },
        neutral: {
          350: '#b8b8b8',
          450: '#8a8a8a',
          550: '#676767',
          750: '#303030',
          850: '#202020',
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'clip-in': 'clipIn 1.2s cubic-bezier(0.25, 1, 0.5, 1) both',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0%)' }, '100%': { transform: 'translateX(-50%)' } },
        clipIn: { '0%': { opacity: '0', clipPath: 'inset(0 0 100% 0)' }, '100%': { opacity: '1', clipPath: 'inset(0 0 0 0)' } },
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
};
