/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Microsoft YaHei"', 'PingFang SC', 'Hiragino Sans GB', 'system-ui', 'sans-serif'],
        display: ['"Microsoft YaHei"', 'PingFang SC', 'system-ui', 'sans-serif'],
        title: ['"Microsoft YaHei"', 'PingFang SC', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Professional Grey & White palette
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',  // Main accent grey-blue
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Surface - Pure Grey tones
        surface: {
          50: '#fafafa',   // Near white
          100: '#f5f5f5',  // Very light grey
          200: '#e5e5e5',  // Light grey
          300: '#d4d4d4',  // Medium light grey
          400: '#a3a3a3',  // Medium grey
          500: '#737373',  // Grey
          600: '#525252',  // Dark grey
          700: '#404040',  // Darker grey
          800: '#262626',  // Very dark grey
          900: '#171717',  // Near black
        },
        // Semantic colors - Clean minimalist
        background: '#ffffff',
        foreground: '#171717',
        muted: '#f5f5f5',
        border: '#e5e5e5',
        accent: '#475569',
      },
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in-down': 'fadeInDown 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
