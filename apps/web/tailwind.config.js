/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#19381F',
          dark: '#122814',
          light: '#234C2C',
        },
        sage: {
          DEFAULT: '#7D9D85',
          light: '#EEF3EF',
          border: '#D5E0D7',
          dark: '#476550',
        },
        charcoal: {
          DEFAULT: '#1C1F1D',
          muted: '#59605A',
        },
        warm: {
          canvas: '#F8FAF6',
          panel: '#FFFFFF',
          border: '#E2E5E1',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Public Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
      },
    },
  },
  plugins: [],
};
