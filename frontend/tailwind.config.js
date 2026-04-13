/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#FFD700',
          dark: '#B8960C',
          glow: 'rgba(212,175,55,0.3)',
        },
        app: {
          bg: '#0B0B0F',
          card: '#13131A',
          border: '#1E1E2A',
          surface: '#1A1A24',
          muted: '#2A2A3A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #B8960C 100%)',
        'gold-radial': 'radial-gradient(ellipse at center, rgba(212,175,55,0.15) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(180deg, transparent 0%, rgba(11,11,15,0.9) 100%)',
        'hero-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212,175,55,0.4)',
        'gold-sm': '0 0 10px rgba(212,175,55,0.25)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'glow': '0 0 40px rgba(212,175,55,0.2)',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in-up': 'fadeInUp 0.3s ease-out both',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1) both',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(212,175,55,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(212,175,55,0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      scale: {
        '98': '0.98',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
