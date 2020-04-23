const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const devConfig = {
  entry: './examples/index.tsx',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        include: [path.resolve(__dirname, 'examples'), path.resolve(__dirname, 'src')],
        loader: require.resolve('babel-loader'),
        options: {
          presets: [require.resolve('babel-preset-react-app')],
        },
      },
    ],
  },
  devServer: {
    contentBase: './dist',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [new HtmlWebpackPlugin()],
  resolve: {
    extensions: ['tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: false,
  },
};

const buildConfig = {
  mode: 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    libraryTarget: 'umd',
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externals: {
    react: 'react',
    'event-emitter': 'event-emitter',
  },
  optimization: {
    minimize: false,
  },
};

module.exports = process.env.NODE_ENV === 'development' ? devConfig : buildConfig;
