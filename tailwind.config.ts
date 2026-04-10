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
        display: ["'Fraunces'", 'Georgia', 'serif'],
        body: ["'Outfit'", 'system-ui', 'sans-serif'],
        mono: ["'IBM Plex Mono'", 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
