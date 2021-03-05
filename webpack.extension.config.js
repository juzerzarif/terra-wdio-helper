const path = require('path');

module.exports = (env, argv) => {
  const development = argv.mode === 'development';

  return {
    target: 'node',
    entry: './src/extension.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'extension.js',
      libraryTarget: 'commonjs2',
    },
    externals: {
      vscode: 'commonjs vscode',
    },
    resolve: {
      extensions: ['.ts', '.js', '.json'],
    },
    devtool: development && 'cheap-module-source-map',
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
            },
          ],
        },
        {
          test: /\.template\.html$/,
          type: 'asset/source',
        },
      ],
    },
  };
};
