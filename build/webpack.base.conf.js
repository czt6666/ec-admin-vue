"use strict";
const path = require("path");
const utils = require("./utils");
const config = require("../config");
const vueLoaderConfig = require("./vue-loader.conf");

function resolve(dir) {
  return path.join(__dirname, "..", dir);
}

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: "eslint-loader",
  enforce: "pre",
  include: [resolve("src"), resolve("test")],
  options: {
    formatter: require("eslint-friendly-formatter"),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
});

module.exports = {
  context: path.resolve(__dirname, "../"),
  entry: {
    app: ["classlist-polyfill", "./src/main.js"]
  },
  output: {
    path: config.build.assetsRoot,
    filename: "[name].js",
    publicPath:
      process.env.NODE_ENV === "production"
        ? config.build.assetsPublicPath
        : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: [".js", ".vue", ".json"],
    alias: {
      vue$: "vue/dist/vue.esm.js",
      "@": resolve("src")
    }
  },
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.wasm/,
        loader: "wasm-loader",
        include: [
          // resolve("node_modules/tesseract.js"),
          // resolve("node_modules/tesseract.js-core")
        ]
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [
          resolve("src"),
          resolve("test"),
          resolve("node_modules/webpack-dev-server/client"),
          // 2023.8.23 Lyh add: 兼容IE11 如果后续添加了别的库要同步添加这里
          resolve("node_modules/element-ui/packages"),
          resolve("node_modules/element-ui/src"),
          resolve("node_modules/js-cookie/src"),
          resolve("node_modules/nprogress"),
          resolve("node_modules/axios"),
          resolve("node_modules/normalize.css"),
          resolve("node_modules/postcss-px2rem"),
          resolve("node_modules/screenfult"),
          resolve("node_modules/vue-Ts"),
          resolve("node_modules/px2rem-loader"),
          resolve("node_modules/vue-istree"),
          resolve("node_modules/tesseract.js"),
          resolve("node_modules/tesseract.js-core")
        ]
      },
      {
        test: /\.svg$/,
        loader: "svg-sprite-loader",
        include: [resolve("src/icons")],
        options: {
          symbolId: "icon-[name]"
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
        loader: "url-loader",
        exclude: [resolve("src/icons")],
        options: {
          limit: 10000,
          name: utils.assetsPath("img/[name].[hash:7].[ext]")
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: utils.assetsPath("media/[name].[hash:7].[ext]")
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 100000,
          name: utils.assetsPath("fonts/[name].[hash:7].[ext]")
        }
      }
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: "empty",
    fs: "empty",
    net: "empty",
    tls: "empty",
    child_process: "empty"
  }
};
