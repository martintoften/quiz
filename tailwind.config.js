/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'retro-black': '#0a0a0a',
        'retro-dark': '#1a1a2e',
        'retro-purple': '#16213e',
        'retro-cyan': '#00fff5',
        'retro-magenta': '#ff00ff',
        'retro-yellow': '#ffff00',
        'retro-green': '#00ff00',
        'retro-green-dark': '#00aa00',
        'retro-orange': '#ff6600',
        'retro-red': '#ff0040',
        'retro-gray': '#4a4a4a',
        'retro-white': '#e0e0e0',
        // Christmas colors
        'xmas-red': '#ff1a1a',
        'xmas-green': '#00cc44',
        'xmas-gold': '#ffd700',
        'xmas-snow': '#ffffff',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'retro': ['VT323', 'monospace'],
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'pulse-neon': 'pulse-neon 1.5s ease-in-out infinite',
        'float-pixel': 'float-pixel 3s steps(4) infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'grid-move': 'grid-move 20s linear infinite',
        'snowfall': 'snowfall linear infinite',
        'sway': 'sway ease-in-out infinite',
        'xmas-lights': 'xmas-lights 1.5s ease-in-out infinite',
        'xmas-glow': 'xmas-glow 2s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glow: {
          '0%, 100%': { 'box-shadow': '0 0 5px currentColor' },
          '50%': { 'box-shadow': '0 0 20px currentColor, 0 0 30px currentColor' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
        },
        'float-pixel': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'twinkle': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'grid-move': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(50px)' },
        },
        'snowfall': {
          '0%': { transform: 'translateY(-10px)', opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0.3' },
        },
        'sway': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(20px)' },
        },
        'xmas-lights': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1.2)' },
          '50%': { opacity: '0.6', filter: 'brightness(0.8)' },
        },
        'xmas-glow': {
          '0%, 100%': {
            textShadow: '0 0 10px #ff1a1a, 0 0 20px #ff1a1a, 0 0 30px #ff1a1a',
            filter: 'brightness(1)'
          },
          '50%': {
            textShadow: '0 0 15px #00cc44, 0 0 25px #00cc44, 0 0 35px #00cc44',
            filter: 'brightness(1.1)'
          },
        },
        'sparkle': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '0.8' },
        },
      },
      boxShadow: {
        'pixel': '4px 4px 0 #000',
        'pixel-lg': '8px 8px 0 #000',
        'neon-cyan': '0 0 10px #00fff5, 0 0 20px #00fff5',
        'neon-magenta': '0 0 10px #ff00ff, 0 0 20px #ff00ff',
        'neon-green': '0 0 10px #00ff00, 0 0 20px #00ff00',
        'neon-red': '0 0 10px #ff0040, 0 0 20px #ff0040',
        'neon-yellow': '0 0 10px #ffff00, 0 0 20px #ffff00',
        'xmas-glow': '0 0 10px #ff1a1a, 0 0 20px #00cc44',
      },
    },
  },
  plugins: [],
}
