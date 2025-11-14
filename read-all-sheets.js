const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

try {
  const filePath = path.join(__dirname, '副本【迪太生产】未出货订单明细表.xlsx');
  
  if (!fs.existsSync(filePath)) {
    console.error('文件不存在:', filePath);
    process.exit(1);
  }
  
  const workbook = XLSX.readFile(filePath);
  
  console.log('===== Excel 文件信息 =====');
  console.log('工作表数量:', workbook.SheetNames.length);
  console.log('工作表列表:', workbook.SheetNames);
  console.log('\n');
  
  // 读取每个工作表
  const allSheetsData = {};
  
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n===== 工作表 ${index + 1}: ${sheetName} =====`);
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    
    console.log('行数:', jsonData.length);
    if (jsonData.length > 0) {
      console.log('列名:', Object.keys(jsonData[0]));
      console.log('前3行数据:');
      console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));
    }
    
    allSheetsData[sheetName] = {
      totalRows: jsonData.length,
      columns: jsonData.length > 0 ? Object.keys(jsonData[0]) : [],
      sampleData: jsonData.slice(0, 5),
      allData: jsonData
    };
  });
  
  // 输出完整数据到文件
  fs.writeFileSync(
    path.join(__dirname, 'excel-all-sheets.json'),
    JSON.stringify(allSheetsData, null, 2),
    'utf8'
  );
  
  console.log('\n\n完整数据已保存到: excel-all-sheets.json');
  
} catch (error) {
  console.error('读取失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}

