const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  // 输出目录配置
  outputDir: process.env.NODE_ENV === 'development' ? 'dist' : 'admin-v2',
  
  // 公共路径配置 - 部署到服务器的访问路径
  publicPath:'./',
  
  // 关闭生产环境的source map以减少内存使用
  productionSourceMap: false,
  
  // 关闭eslint检查以加快构建速度
  lintOnSave: false,
  
  // 开发服务器配置
  devServer: {
    port: 2025,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    // 添加CORS支持
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    // 代理配置，如果需要访问其他端口的服务
    proxy: {
      '/api': {
        target: 'http://192.168.2.2:2031',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  configureWebpack: {
    // 减少内存使用的优化
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          elementUI: {
            name: 'chunk-elementUI',
            priority: 20,
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve('src'),
        './cptable': 'xlsx-style/dist/cpexcel.js'
      }
    }
  },
  
  chainWebpack(config) {
    // 禁用预加载
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
    
    // svg处理
    config.module
      .rule('svg')
      .exclude.add(resolve('src/assets/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  }
}