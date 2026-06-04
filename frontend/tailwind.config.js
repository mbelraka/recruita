/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  // Avoid resetting Material / existing global styles (see src/styles.scss).
  corePlugins: {
    preflight: false,
  },
  theme: {
    screens: {
      sm: '600px',
      md: '960px',
      lg: '1280px',
    },
    extend: {
      fontFamily: {
        // Match --app-font-family / Figma (`@fontsource/manrope`).
        sans: ['Manrope', 'sans-serif'],
      },
      colors: {
        // Theme tokens from src/app/styles/theme (_theming.scss)
        secondary: 'var(--color-secondary)',
        'surface-container-low': 'var(--color-surface-container-low)',
      },
    },
  },
  plugins: [],
};
