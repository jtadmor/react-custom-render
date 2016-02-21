// webpack.config.js
module.exports = {
  entry: './src/CustomRender.js',
  output: {
    path: './build',
    filename: 'CustomRender.js'       
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react', 'stage-0']
        }
      }
    ]
  },
  resolve: {
    modulesDirectories: ['node_modules','src'],
    extensions: ['', '.js', '.json']
  }
};
