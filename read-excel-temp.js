const XLSX = require('xlsx');
const path = require('path');

// 读取 Excel 文件
const filePath = path.join(__dirname, '副本【迪太生产】未出货订单明细表.xlsx');
const workbook = XLSX.readFile(filePath);

// 获取第一个工作表
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// 转换为 JSON
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// 输出前10行数据（包括表头）
console.log('===== Excel 文件内容 =====');
console.log('工作表名称:', sheetName);
console.log('\n表头（第一行）:');
console.log(JSON.stringify(data[0], null, 2));
console.log('\n总行数:', data.length);
console.log('\n前5行数据:');
data.slice(0, 6).forEach((row, index) => {
  console.log(`\n第 ${index + 1} 行:`, JSON.stringify(row, null, 2));
});

// 输出列信息
if (data.length > 0) {
  console.log('\n===== 列信息 =====');
  data[0].forEach((col, index) => {
    console.log(`列 ${index + 1}: ${col}`);
  });
}

