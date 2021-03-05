const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        orange: colors.orange,
        teal: colors.teal,
        lightBlue: colors.lightBlue,
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active'],
      borderWidth: ['last'],
      margin: ['last'],
    },
  },
  purge: {
    content: ['./src/webview-ui/**/*.svelte'],
    enabled: process.env.NODE_ENV !== 'development',
  },
};
