const { resolve } = require('path')

// vue.config.js
module.exports = {
  // 选项...
  publicPath: '',
  outputDir: 'dist',
  configureWebpack() {
    return {
      resolve: {
        alias: {
          '@': resolve('src')
        }
      }
    }
  }
}