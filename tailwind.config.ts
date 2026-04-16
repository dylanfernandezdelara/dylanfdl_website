import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg0Hard: 'var(--bg0-hard)',
        bg0: 'var(--bg0)',
        bg1: 'var(--bg1)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        bg4: 'var(--bg4)',
        fg0: 'var(--fg0)',
        fg1: 'var(--fg1)',
        fg2: 'var(--fg2)',
        fg3: 'var(--fg3)',
        fg4: 'var(--fg4)',
        red: 'var(--red)',
        green: 'var(--green)',
        yellow: 'var(--yellow)',
        blue: 'var(--blue)',
        purple: 'var(--purple)',
        aqua: 'var(--aqua)',
        orange: 'var(--orange)',
        gray: 'var(--gray)',
        border: 'var(--border-color)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          '-apple-system',
          'BlinkMacSystemFont',
          'IBM Plex Sans',
          "'Segoe UI'",
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      maxWidth: {
        reading: '65ch',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
