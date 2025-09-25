#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🔍 开始分析打包体积...');

// 临时启用Bundle Analyzer
const vueConfigPath = path.resolve(__dirname, '../vue.config.js');
const fs = require('fs');

// 读取vue.config.js
let config = fs.readFileSync(vueConfigPath, 'utf8');

// 启用Bundle Analyzer
config = config.replace(
  '// new BundleAnalyzerPlugin(),', 
  'new BundleAnalyzerPlugin({ analyzerMode: "static", openAnalyzer: false }),'
);

// 写入临时配置
fs.writeFileSync(vueConfigPath, config);

// 执行打包
exec('npm run build', (error, stdout, stderr) => {
  // 恢复配置
  let originalConfig = fs.readFileSync(vueConfigPath, 'utf8');
  originalConfig = originalConfig.replace(
    'new BundleAnalyzerPlugin({ analyzerMode: "static", openAnalyzer: false }),',
    '// new BundleAnalyzerPlugin(),'
  );
  fs.writeFileSync(vueConfigPath, originalConfig);
  
  if (error) {
    console.error('❌ 打包失败:', error);
    return;
  }
  
  console.log('✅ 打包完成!');
  console.log('\n📊 体积分析报告已生成: dist/report.html');
  console.log('💡 使用浏览器打开查看详细分析');
  
  // 简单的文件大小统计
  const distPath = path.resolve(__dirname, '../dist');
  exec(`find ${distPath} -name "*.js" -exec ls -lh {} \\; | sort -k5 -hr`, (err, output) => {
    if (!err) {
      console.log('\n📦 JavaScript文件大小排序:');
      console.log(output);
    }
  });
});