'use strict'
const utils = require('./utils')
const config = require('../config')
const px2rem = require('postcss-px2rem')
const postcss = px2rem({
  remUnit: 16
})
const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = isProduction
  ? config.build.productionSourceMap
  : config.dev.cssSourceMap

module.exports = {
  lintOnSave: true,
  css: {
    loaderOptions: {
      postcss: {
        Plugins: [
          postcss
        ]
      }
    }

  },
  loaders: utils.cssLoaders({
    sourceMap: sourceMapEnabled,
    extract: isProduction
  }),
  cssSourceMap: sourceMapEnabled,
  cacheBusting: config.dev.cacheBusting,
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
