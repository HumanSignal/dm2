module.exports = function override(config, env) {
  if (process.env.BUILD_NO_MINIMIZATION) {
    config.optimization.minimizer = undefined;
    const rules = config.module.rules.find((rule) => rule.oneOf);
    if (rules) {
      const jsRule = rules.oneOf.find((rule) =>
        String(rule.test).includes("jsx")
      );
      if (jsRule) {
        const options = jsRule.options;
        options.compact = false;
        options.cacheCompression = false;
      }
    }
  }

  if (process.env.BUILD_NO_CHUNKS) {
    config.optimization.runtimeChunk = false;
    config.optimization.splitChunks = {
      cacheGroups: {
        default: false,
      },
    };
  }

  if (process.env.BUILD_NO_HASH) {
    config.output.filename = "static/js/[name].js";
    config.output.chunkFilename = "static/js/[name].chunk.js";
    const CssPlugin = config.plugins.find((p) =>
      p.constructor.name.includes("Css")
    );
    if (CssPlugin) {
      CssPlugin.options.filename = "static/css/[name].css";
      CssPlugin.options.chunkFilename =
        "static/css/[name].[contenthash:8].chunk.css";
    }
  }

  if (process.env.BUILD_MODULE) {
    config.output.library = "DataManager";
    config.output.libraryExport = "default";
    config.output.libraryTarget = "commonjs";
  }

  const rule = config.module.rules.find((r) => !!r.oneOf);
  rule.oneOf.push({
    test: /\.webm$/i,
    use: [
      {
        loader: require.resolve("url-loader"),
        options: {
          limit: 200000,
          encoding: "base64",
        },
      },
    ],
  });

  // const f = false;
  // config.module.rules.forEach(r => {
  //   if (r.oneOf) {
  //     r.oneOf.forEach(or => console.log(or))
  //   } else {
  //     console.log(r);
  //   }
  // });
  // if (!f) throw Error("Fail");

  return config;
};
