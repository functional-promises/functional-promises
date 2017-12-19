const webpack = require('webpack')
const path = require('path')
const dev = process.env.NODE_ENV === 'development'

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: './index.js',
  output: {
    pathinfo: true,
    // filename: path.join(__dirname, 'build', 'index.js'),
    path: path.resolve(__dirname, './dist'),
    filename: './bundle.js',
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        // warnings: false,
        drop_console: false,
      }
    }),
  ],
  module: {
    rules: [
      {test: /\.js$/, use: 'babel-loader'},
      {test: /\.css$/, use: 'css-loader'},
    ],
  },
}
