import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import createVitePlugins from './vite/plugins'

const baseUrl = 'http://localhost:8080' // 后端接口

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  const { VITE_APP_ENV } = env
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    // 例如 https://www.ruoyi.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.ruoyi.vip/admin/，则设置 baseUrl 为 /admin/。
    // V3 作为主应用部署在根路径，使用绝对路径
    base: '/',
    plugins: createVitePlugins(env, command === 'build'),
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        '~': path.resolve(__dirname, './'),
        // 设置别名
        '@': path.resolve(__dirname, './src'),
        // 解决 @form-create/element-ui 的 Vue 导入问题
        'vue': 'vue/dist/vue.esm-bundler.js'
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      // 去重 redi 依赖，防止多次加载
      dedupe: ['@wendellhu/redi']
    },
    // 打包配置
    build: {
      // https://vite.dev/config/build-options.html
      sourcemap: command === 'build' ? false : 'inline',
      outDir: 'dist',
      assetsDir: 'static',
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            // 图片资源
            if (/\.(png|jpe?g|gif|svg|ico|webp)$/i.test(assetInfo.name)) {
              return 'static/img/[name]-[hash][extname]'
            }
            // CSS 资源
            if (/\.css$/i.test(assetInfo.name)) {
              return 'static/css/[name]-[hash][extname]'
            }
            // 字体资源
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return 'static/fonts/[name]-[hash][extname]'
            }
            // 其他资源
            return 'static/[name]-[hash][extname]'
          },
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // 所有 UI 相关库放一起，避免循环依赖
              if (id.includes('vxe-table') || id.includes('xe-utils') || 
                  id.includes('/vue/') || id.includes('/vue@') || 
                  id.includes('pinia') || id.includes('vue-router') ||
                  id.includes('@vue/') || id.includes('element-plus') || 
                  id.includes('@element-plus')) {
                return 'vendor'
              }
              if (id.includes('quill') || id.includes('@vueup/vue-quill')) {
                return 'quill'
              }
              if (id.includes('exceljs')) {
                return 'exceljs'
              }
            }
          }
        }
      }
    },
    // vite 相关配置
    server: {
      port: 3002,
      host: '0.0.0.0', // 允许外部访问
      open: false,
      // 允许跨域访问
      cors: true,
      // 配置 headers 允许被嵌入
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      },
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        '/dev-api': {
          target: baseUrl,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/dev-api/, '')
        },
        // springdoc proxy
        '^/v3/api-docs/(.*)': {
          target: baseUrl,
          changeOrigin: true,
        }
      }
    },
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove()
                }
              }
            }
          }
        ]
      }
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: [
        'vue', 
        'element-plus',
        '@form-create/element-ui',
        '@form-create/core'
      ]
    }
  }
})
