const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  devtool: "cheap-module-source-map",
  devServer: {
    compress: true,
    hot: true,
    port: 9000,
    contentBase: path.join(__dirname, "public"),
    historyApiFallback: {
      index: "./public/index.html",
    },
  },
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "main.js",
  },
  plugins: [
    new Dotenv(),
    new MiniCssExtractPlugin(),
    new HtmlWebPackPlugin({ filename: "public/index.html" }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV,
      USE_LSB: true,
      SC_DISABLE_SPEEDY: false,
      GATEWAY_API: false,
      HTX_ACCESS_TOKEN: "---",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/i,
        enforce: "pre",
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      browsers: ["last 2 Chrome versions"],
                    },
                  },
                ],
                "@babel/preset-react",
              ],
              plugins: [
                "@babel/plugin-proposal-class-properties",
                "@babel/plugin-proposal-optional-chaining",
                "@babel/plugin-proposal-nullish-coalescing-operator",
              ],
            },
          },
          "source-map-loader",
        ],
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.styl$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              modules: {
                localIdentName: "dm-[local]",
              },
            },
          },
          {
            loader: "stylus-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
};
