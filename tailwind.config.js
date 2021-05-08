const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lightBlue: colors.lightBlue,
      },
    },
  },
  purge: ['./src/webview-ui/**/*.svelte']
};
