const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin');

const svelteConfig = require('./svelte.config');

module.exports = (env, argv) => {
  const webviewTest = !!env.WEBVIEW_TEST;
  const development = argv.mode === 'development';

  return {
    target: 'web',
    entry: {
      bundle: webviewTest ? ['./webview-test/webviewTest.ts'] : ['./src/webview-ui/main.ts'],
    },
    resolve: {
      extensions: ['.svelte', '.ts', '.js'],
    },
    output: {
      path: path.join(__dirname, 'resources', 'dist'),
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'bundle.css',
        ignoreOrder: false,
      }),
    ],
    optimization: {
      minimizer: [new CSSMinimizerPlugin(), '...'],
    },
    devtool: development && 'inline-cheap-module-source-map',
    module: {
      rules: [
        {
          test: /\.svelte$/,
          exclude: /node_modules/,
          use: {
            loader: 'svelte-loader',
            options: {
              compilerOptions: {
                dev: development,
              },
              emitCss: true,
              hotReload: development,
              ...svelteConfig,
            },
          },
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: 'ts-loader',
        },
      ],
    },
    devServer: {
      static: { directory: path.join(__dirname, 'webview-test') },
    },
  };
};
