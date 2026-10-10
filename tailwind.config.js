/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './themes/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Drafting sheet palette: cool paper, navy ink, and the red of a dimension line
        paper: '#F3F6F8',
        sheet: '#FFFFFF',
        ink: '#14233B',
        muted: '#55657A',
        rule: '#D5DEE6',
        dim: '#C43D3A',
      },
      fontFamily: {
        sans: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
        display: ['var(--font-barlow-semi)', 'var(--font-barlow)', 'system-ui', 'sans-serif'],
        label: ['var(--font-barlow-cond)', 'var(--font-barlow)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
