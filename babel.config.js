/*
 * @Author: your name
 * @Date: 2021-04-14 13:47:31
 * @LastEditTime: 2021-05-19 14:18:57
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/babel.config.js
 */
module.exports = {
  presets: [
    // https://github.com/vuejs/vue-cli/tree/master/packages/@vue/babel-preset-app
    '@vue/cli-plugin-babel/preset'
  ],
  'env': {
    'development': {
      // babel-plugin-dynamic-import-node plugin only does one thing by converting all import() to require().
      // This plugin can significantly increase the speed of hot updates, when you have a large number of pages.
      'plugins': ['dynamic-import-node']
    }
  },
  plugins: [
    ['import', {
      libraryName: 'vant',
      libraryDirectory: 'es',
      style: true
    }, 'vant']
  ]
}
