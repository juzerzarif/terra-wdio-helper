const sveltePreprocess = require('svelte-preprocess');
const tailwind = require('tailwindcss');
const postcssNested = require('postcss-nested');

module.exports = {
  preprocess: sveltePreprocess({
    postcss: {
      plugins: [tailwind, postcssNested],
    },
  }),
};
