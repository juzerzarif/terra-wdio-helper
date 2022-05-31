const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lightBlue: colors.sky,
      },
    },
  },
  content: ['./src/webview-ui/**/*.svelte'],
};
