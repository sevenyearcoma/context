import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ghost: {
          DEFAULT: '#F0EBE0',
          muted: 'rgba(240, 235, 224, 0.45)',
          dim: 'rgba(240, 235, 224, 0.22)',
          trace: 'rgba(240, 235, 224, 0.1)',
        },
        signal: {
          red: '#FF3C3C',
          amber: '#FF9E3D',
          green: '#32DC78',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.25em',
        wider: '0.15em',
        tracked: '0.06em',
      },
    },
  },
  plugins: [],
}

export default config
