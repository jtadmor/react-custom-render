// webpack.config.js
module.exports = {
  entry: './src/PropExtender.js',
  output: {
    path: './build',
    filename: 'PropExtender.js'       
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
