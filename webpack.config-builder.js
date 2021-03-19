const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const DEFAULT_NODE_ENV = process.env.BUILD_MODULE ? 'production' : (process.env.NODE_ENV || 'development')

const isDevelopment = DEFAULT_NODE_ENV !== "production";

const BUILD = {
  NO_MINIMIZE: isDevelopment || !!process.env.BUILD_NO_MINIMIZATION,
  NO_CHUNKS: isDevelopment || !!process.env.BUILD_NO_CHUNKS,
  NO_HASH: isDevelopment || process.env.BUILD_NO_HASH,
  MODULE: !isDevelopment && !!process.env.BUILD_MODULE,
};

const dirPrefix = {
  js: isDevelopment ? "" : "static/js/",
  css: isDevelopment ? "" : "static/css/",
};

const LOCAL_ENV = {
  NODE_ENV: DEFAULT_NODE_ENV,
  CSS_PREFIX: "dm-",
  API_GATEWAY: "http://localhost:8081/api/dm",
  LS_ACCESS_TOKEN: "",
};

const babelOptimizeOptions = () => {
  return BUILD.NO_MINIMIZE
    ? {
      compact: false,
      cacheCompression: false,
    }
    : {
      compact: true,
      cacheCompression: true,
    };
};

const optimizer = () => {
  const result = {};

  result.minimize = BUILD.NO_MINIMIZE ? false : true;

  result.minimizer = BUILD.NO_MINIMIZE
    ? undefined
    : [new TerserPlugin(), new CssMinimizerPlugin()];

  result.runtimeChunk = BUILD.NO_CHUNKS ? false : true;
  result.splitChunks = {
    cacheGroups: {
      default: BUILD.NO_CHUNKS ? false : true,
    },
  };

  return result;
};

const output = () => {
  const result = {
    filename: "[name]-[contenthash].js",
    chunkFilename: "[name]-[contenthash]-[id].chunk.js",
  };

  if (BUILD.NO_HASH) {
    result.filename = "[name].js";
    result.chunkFilename = "[name].chunk.js";
  }

  if (BUILD.MODULE) {
    result.library = "DataManager";
    result.libraryExport = "default";
    result.libraryTarget = "commonjs";
  }

  result.filename = dirPrefix.js + result.filename;
  result.chunkFilename = dirPrefix.js + result.chunkFilename;

  return result;
};

const cssOutput = () => {
  const result = {
    filename: "[name]-[contenthash].css",
    chunkFilename: "[name]-[contenthash]-[id].chunk.css",
  };

  if (BUILD.NO_HASH) {
    result.filename = "[name].css";
    result.chunkFilename = "[name].[contenthash:8].chunk.css";
  }

  result.filename = dirPrefix.css + result.filename;
  result.chunkFilename = dirPrefix.css + result.chunkFilename;

  return result;
};

const babelLoader = {
  loader: "babel-loader",
  options: {
    presets: [
      ["@babel/preset-react", {
        "runtime": "automatic"
      }],
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
      "react-hot-loader/babel",
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-optional-chaining",
      "@babel/plugin-proposal-nullish-coalescing-operator",
    ],
    ...babelOptimizeOptions(),
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

const devServer = () => {
  return process.env.NODE_ENV === 'development' ? {
    devServer: {
      compress: true,
      hot: true,
      port: 9000,
      contentBase: path.join(__dirname, "public"),
      historyApiFallback: {
        index: "./public/index.html",
      },
    }
  } : {};
};

const plugins = [
  new Dotenv({
    path: './.env',
    safe: true,
    allowEmptyValues: true,
    defaults: "./.env.defaults",
  }),
  new MiniCssExtractPlugin({
    ...cssOutput(),
  }),
  new webpack.EnvironmentPlugin(LOCAL_ENV),
];

if (isDevelopment) {
  plugins.push( new HtmlWebPackPlugin({
    title: "Heartex DataManager 2.0",
    template: "public/index.html",
  }));
}

const sourceMap = isDevelopment ? "cheap-module-source-map" : "source-map";

module.exports = ({withDevServer = true} = {}) => ({
  mode: process.env.NODE_ENV || "development",
  devtool: sourceMap,
  ...(withDevServer ? devServer() : {}),
  entry: path.resolve(__dirname, "src/index.js"),
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "main.js",
    ...output(),
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: plugins,
  optimization: optimizer(),
  performance: {
    maxEntrypointSize: Infinity,
    maxAssetSize: 1000000,
  },
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
      {
        test: /\.(webm|mov)$/i,
        use: [
          {
            loader: require.resolve("url-loader"),
            options: {
              limit: 200000,
              encoding: "base64",
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [{
          loader: '@svgr/webpack',
          options: {
            ref: true,
          },
        }],
      },
    ],
  },
});
