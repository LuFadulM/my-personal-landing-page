import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
      },
      fontFamily: {
        display: ["'Outfit'", 'system-ui', 'sans-serif'],
        body: ["'DM Sans'", 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['12px', '1.4'],
        sm: ['13px', '1.5'],
        base: ['15px', '1.5'],
        md: ['16px', '1.5'],
        lg: ['18px', '1.4'],
        xl: ['20px', '1.3'],
        '2xl': ['24px', '1.25'],
        '3xl': ['30px', '1.2'],
        '4xl': ['36px', '1.1'],
      },
      maxWidth: { content: '1200px' },
    },
  },
  plugins: [],
};

export default config;
