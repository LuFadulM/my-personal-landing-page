import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#09090b',
        card: '#111114',
        border: '#1c1c22',
        fg: '#eaeaf0',
        muted: '#5a5a6e',
        accent: '#6366f1',
        accent2: '#a78bfa',
        healthy: '#10b981',
        attention: '#f59e0b',
        risk: '#ef4444',
        newrole: '#3b82f6',
        flagPA: '#f59e0b',
        flagSR: '#ef4444',
        flagBL: '#8b5cf6',
      },
      fontFamily: {
        sans: ["'Grift'", "'Grift Variable'", "'Outfit'", 'system-ui', 'sans-serif'],
        display: ["'Grift'", "'Grift Variable'", "'Fraunces'", 'Georgia', 'serif'],
        body: ["'Grift'", "'Grift Variable'", "'Outfit'", 'system-ui', 'sans-serif'],
        mono: ["'IBM Plex Mono'", 'ui-monospace', 'monospace'],
      },
      // Tuned down so the ~12px base feels proportional everywhere.
      fontSize: {
        '2xs': ['9px', '1.3'],
        'xs': ['10px', '1.4'],
        'sm': ['11px', '1.5'],
        'base': ['12px', '1.5'],
        'md': ['13px', '1.5'],
        'lg': ['14px', '1.4'],
        'xl': ['16px', '1.3'],
        '2xl': ['18px', '1.25'],
        '3xl': ['22px', '1.2'],
        '4xl': ['28px', '1.1'],
      },
    },
  },
  plugins: [],
};

export default config;
