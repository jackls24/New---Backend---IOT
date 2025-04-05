/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ], theme: {
    extend: {
      // ...altre estensioni
      animation: {
        'fade-in': 'fadeIn 0.7s ease-in-out forwards',
        'fade-in-delay': 'fadeIn 0.7s ease-in-out 0.5s forwards',
        'slide-up': 'slideUp 0.7s ease-in-out 0.3s forwards',
        'slide-down': 'slideDown 0.7s ease-in-out 0.1s forwards',
        'slide-left': 'slideLeft 0.7s ease-in-out 0.5s forwards',
        'slide-right': 'slideRight 0.7s ease-in-out 0.2s forwards',
        'scale-up': 'scaleUp 0.7s ease-in-out 0.6s forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 6s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(50px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-50px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(50px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-50px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
};
