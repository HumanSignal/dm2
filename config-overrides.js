const pluginFinder = (name, invert = false) => (p) => {
  const found = p.constructor.name.includes(name);
  return invert ? !found : found;
};

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
    const CssPlugin = config.plugins.find(pluginFinder("Css"));
    if (CssPlugin) {
      CssPlugin.options.filename = "static/css/[name].css";
      CssPlugin.options.chunkFilename =
        "static/css/[name].[contenthash:8].chunk.css";
    }
  }

  if (process.env.BUILD_MODULE) {
    Object.assign(config.output, {
      library: "DataManager",
      libraryExport: "default",
      libraryTarget: "commonjs",
    });

    const rules = [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ];

    config.module.rules.push(...rules);

    config.plugins = config.plugins.filter(pluginFinder("Css", true));
  }

  return config;
};
