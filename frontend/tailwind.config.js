// tailwind.config.js
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050508',
        surface: {
          light: '#1a1a24',
          DEFAULT: '#0d0d1a',
          dark: '#08080f',
        },
        primary: {
          light: '#c4b5fd',
          DEFAULT: '#7c3aed',
          dark: '#6d28d9',
        },
        secondary: {
          light: '#99f6ff',
          DEFAULT: '#0ea5e9',
          dark: '#0284c7',
        },
        accent: {
          light: '#f5d0fe',
          DEFAULT: '#d946ef',
          dark: '#c026d3',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 0 50px -12px rgba(124, 58, 237, 0.25)',
        'glow': '0 0 20px -5px rgba(124, 58, 237, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [forms, typography],
}

