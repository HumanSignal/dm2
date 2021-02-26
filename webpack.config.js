const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

const LOCAL_ENV = {
  NODE_ENV: process.env.NODE_ENV,
  CSS_PREFIX: "dm-",
  USE_LSB: true,
  SC_DISABLE_SPEEDY: false,
  GATEWAY_API: false,
  HTX_ACCESS_TOKEN: "---",
};

const babelLoader = {
  loader: "babel-loader",
  options: {
    presets: [
      "@babel/preset-react",
      "@babel/preset-typescript",
      [
        "@babel/preset-env",
        {
          targets: {
            browsers: ["last 2 Chrome versions"],
          },
        },
      ],
    ],
    plugins: [
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-optional-chaining",
      "@babel/plugin-proposal-nullish-coalescing-operator",
    ],
  },
};

const cssLoader = (withLocalIdent = true) => {
  const rules = [MiniCssExtractPlugin.loader];

  const localIdent = withLocalIdent
    ? LOCAL_ENV.CSS_PREFIX + "[local]"
    : "[local]";

  const cssLoader = {
    loader: "css-loader",
    options: {
      sourceMap: true,
      modules: {
        localIdentName: localIdent,
      },
    },
  };

  const stylusLoader = {
    loader: "stylus-loader",
    options: {
      sourceMap: true,
      stylusOptions: {
        import: [path.resolve(__dirname, "./src/themes/default/colors.styl")],
      },
    },
  };

  rules.push(cssLoader, stylusLoader);

  return rules;
};

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
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new Dotenv(),
    new MiniCssExtractPlugin(),
    new HtmlWebPackPlugin({ filename: "public/index.html" }),
    new webpack.EnvironmentPlugin(LOCAL_ENV),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        enforce: "pre",
        exclude: /node_modules/,
        use: [babelLoader, "source-map-loader"],
      },
      {
        test: /\.tsx?$/i,
        enforce: "pre",
        exclude: /node_modules/,
        use: [babelLoader, "source-map-loader"],
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.styl$/i,
        oneOf: [
          {
            test: /global\.styl$/,
            use: cssLoader(false),
          },
          {
            use: cssLoader(),
          },
        ],
      },
    ],
  },
};
