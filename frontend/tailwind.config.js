/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Quantis Technologies Brand Colors
        granite: {
          // Rich Black theme
          50: '#f5f5f5',
          100: '#e9e9e9',
          200: '#d3d3d3',
          300: '#bdbdbd',
          400: '#a7a7a7',
          500: '#919191',
          600: '#7b7b7b',
          700: '#656565',
          800: '#101820', // Rich Black
          900: '#0c1319',
          primary: '#101820', // Rich Black primary
        },
        crimson: {
          // Crimson Red theme
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#A4193D', // Crimson Red
          primary: '#A4193D',
        },
        peach: {
          // Peach theme
          50: '#fffef7',
          100: '#fffbeb',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#fcd34d',
          500: '#fbbf24',
          600: '#f59e0b',
          700: '#d97706',
          800: '#b45309',
          900: '#FFDFB9', // Peach
          primary: '#FFDFB9',
        },
        jungle: {
          // Deep Jungle Green theme
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#07563B', // Deep Jungle Green
          primary: '#07563B',
        },
        olive: {
          // Light Olive Green theme
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#CED46A', // Light Olive Green
          primary: '#CED46A',
        },
        yellow: {
          // Vivid Yellow theme
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#FEE715', // Vivid Yellow
          primary: '#FEE715',
        },
        // Primary brand combination (Rich Black + Crimson)
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#A4193D', // Crimson Red
          600: '#8b1538',
          700: '#731133',
          800: '#5a0d2e',
          900: '#101820', // Rich Black
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'spin-slow-reverse': 'spin 12s linear infinite reverse',
        'spin-reverse': 'spin 2s linear infinite reverse',
        'shake': 'shake 0.5s ease-in-out',
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
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}