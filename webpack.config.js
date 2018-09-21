const webpack = require('webpack')
const webpackStripLoader = require('strip-loader')
const path = require('path')
const dev = process.env.NODE_ENV === 'development'
// const rollupCommonjsPlugin = require('rollup-plugin-commonjs')

const config = module.exports = {
  devtool: dev ? 'cheap-inline-source-map' : undefined,
  entry: './src/index.js',
  output: {
    pathinfo: true,
    // filename: path.join(__dirname, 'build', 'index.js'),
    path: path.resolve(__dirname, './dist'),
    filename: `./functional-promise${dev ? '' : '.min'}.js`,
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: webpackStripLoader
          .loader('debug', 'console.log', 'console.warn', 'console.error'),
      },
    ],
    rules: [
      // {
      //   test: /\.js$/,
      //   loader: 'rollup-loader',
      //   // options: [/* custom rollup plugins */]
      //   // or directly pass rollup options
      //   // options: { plugins: [] }
      // },
      // {
      //   test: /src\/index.js$/,
      //   use: [{
      //     loader: 'webpack-rollup-loader',
      //     options: {
      //       // OPTIONAL: any rollup options (except `entry`)
      //       // e.g.
      //       plugins: [rollupCommonjsPlugin()],
      //       // external: ['moment']
      //     },
      //   }]
      // },
      { test: /\.js$/, use: 'babel-loader' },
      { test: /\.css$/, use: 'css-loader' },
    ],
  },
}



if (!dev) {
  config.plugins = config.plugins || []
  // config.plugins.push(new webpack.optimize.UglifyJsPlugin({
  //   compress: {
  //     warnings: false,
  //     drop_console: false,
  //   },
  // }))
}