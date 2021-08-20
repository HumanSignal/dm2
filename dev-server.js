const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const path = require('path');

const config = require('./webpack.config-builder')({
  withDevServer: true
});

const port = 5000;

const options = {
  compress: true,
  hot: true,
  inline: true,
  quiet: false,
  noInfo: true,
  public: `http://localhost:${port}`,
  contentBase: path.join(__dirname, "public"),
  historyApiFallback: {
    index: "./public/index.html",
  },
};

config.entry.app.unshift(
  `webpack-dev-server/client?http://localhost:${port}/`,
  `webpack/hot/dev-server`
);

const compiler = webpack(config);
const server = new WebpackDevServer(compiler, config.devServer);

server.listen(port, 'localhost', () => {
  console.log(`dev server listening on port ${port}`);
});
