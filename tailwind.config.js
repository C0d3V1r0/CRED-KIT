/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./toolkit/**/*.{js,jsx,ts,tsx}",
    "./core/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./entities/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          // Основные
          black: '#05050a',
          dark: '#0a0a14',
          panel: '#11111b',
          surface: '#161625',
          gray: '#2a2a3d',
          // Акценты
          accent: '#ff2a2a',
          neon: '#ff3366',
          orange: '#ff6b35',
          yellow: '#ffcc00',
          cyan: '#00f0ff',
          green: '#00ff88',
          purple: '#a855f7',
          // Текст
          text: '#e6e6f0',
          muted: '#8e8ea8',
          dim: '#3a3a4f'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Manrope', 'Segoe UI', 'Inter', 'system-ui', 'sans-serif'],
        orbitron: ['Russo One', 'Manrope', 'sans-serif'],
        rajdhani: ['Manrope', 'sans-serif']
      },
      fontSize: {
        'xs': ['0.7rem', { lineHeight: '1' }],
        '2xs': ['0.6rem', { lineHeight: '1' }]
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'flicker': 'flicker 0.5s infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 1s infinite',
        'float': 'float 6s ease-in-out infinite',
        'typing': 'typing 1.4s infinite'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #ff2a2a, 0 0 10px #ff2a2a' },
          '100%': { boxShadow: '0 0 20px #ff2a2a, 0 0 30px #ff2a2a' }
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        typing: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        }
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, #1a1a24 1px, transparent 1px), linear-gradient(to bottom, #1a1a24 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'scanlines': 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)'
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.cyber.accent"), 0 0 10px theme("colors.cyber.accent")',
        'neon-cyan': '0 0 5px theme("colors.cyber.cyan"), 0 0 10px theme("colors.cyber.cyan")',
        'neon-green': '0 0 5px theme("colors.cyber.green"), 0 0 10px theme("colors.cyber.green")'
      }
    },
  },
  plugins: [],
}
