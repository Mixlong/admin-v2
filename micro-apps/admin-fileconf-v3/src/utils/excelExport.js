/**
 * Excel 导出工具类
 * 支持分组表头、样式设置等
 */

/**
 * 导出 VXE Grid 数据到 Excel
 * @param {Object} options 导出配置
 * @param {Array} options.columns - 列配置（支持 children 分组）
 * @param {Array} options.data - 数据数组
 * @param {String} options.filename - 文件名（不含扩展名）
 * @param {String} options.sheetName - 工作表名称
 */
export async function exportVxeGridToExcel(options) {
  const {
    columns = [],
    data = [],
    filename = '导出数据',
    sheetName = 'Sheet1'
  } = options

  try {
    // 动态导入 ExcelJS 和 file-saver
    const ExcelJS = await import('exceljs')
    const { saveAs } = await import('file-saver')

    // 创建工作簿
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(sheetName)

    // 扁平化列配置（处理分组列）
    const { flatColumns, headerRow1, headerRow2, merges } = flattenColumns(columns)

    // 添加一级表头
    worksheet.addRow(headerRow1)
    
    // 添加二级表头
    worksheet.addRow(headerRow2)

    // 合并单元格
    merges.forEach(merge => {
      if (merge.rowSpan) {
        // 纵向合并（普通列）
        worksheet.mergeCells(1, merge.col, 2, merge.col)
      } else {
        // 横向合并（分组列）
        worksheet.mergeCells(merge.row, merge.startCol, merge.row, merge.endCol)
      }
    })

    // 添加数据
    data.forEach(row => {
      const rowData = flatColumns.map(col => {
        const value = row[col.field]
        // 处理布尔值
        if (value === true) return '是'
        if (value === false) return '否'
        if (value === null || value === undefined) return ''
        return value
      })
      worksheet.addRow(rowData)
    })

    // 设置列宽
    worksheet.columns = flatColumns.map(col => ({
      width: (col.width || 120) / 8
    }))

    // 设置表头样式和边框
    styleHeaderRow(worksheet.getRow(1), 'FFE6F7FF')
    styleHeaderRow(worksheet.getRow(2), 'FFF5F7FA')
    
    // 为所有单元格添加边框
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
        }
        
        // 数据行居中对齐
        if (rowNumber > 2) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
        }
      })
    })

    // 导出文件
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    
    const timestamp = new Date().toISOString().split('T')[0]
    saveAs(blob, `${filename}_${timestamp}.xlsx`)

    return { success: true, message: '导出成功' }
  } catch (error) {
    console.error('❌ Excel 导出失败:', error)
    return { success: false, message: error.message }
  }
}

/**
 * 扁平化列配置，处理分组列
 * @param {Array} columns - 列配置数组
 * @returns {Object} { flatColumns, headerRows }
 */
function flattenColumns(columns) {
  const flatColumns = []
  const headerRow1 = [] // 一级表头
  const headerRow2 = [] // 二级表头
  const merges = [] // 需要合并的单元格

  let colIndex = 0

  columns.forEach(col => {
    // 跳过序号列等特殊列
    if (col.type === 'seq' || col.type === 'checkbox') {
      return
    }

    if (col.children && col.children.length > 0) {
      // 分组列
      const startCol = colIndex
      
      // 一级表头：分组标题
      headerRow1.push(col.title)
      
      // 处理子列
      col.children.forEach((child, idx) => {
        if (child.field) {
          flatColumns.push(child)
          // 二级表头：子列标题
          headerRow2.push(child.title)
          
          // 一级表头后续列填空（用于合并）
          if (idx > 0) {
            headerRow1.push('')
          }
          
          colIndex++
        }
      })
      
      const endCol = colIndex - 1
      
      // 记录需要合并的单元格（横向合并一级表头）
      if (startCol < endCol) {
        merges.push({
          row: 1,
          startCol: startCol + 1, // Excel 列从 1 开始
          endCol: endCol + 1
        })
      }
    } else if (col.field) {
      // 普通列（纵向跨两行）
      flatColumns.push(col)
      headerRow1.push(col.title)
      headerRow2.push(col.title)
      
      // 记录需要合并的单元格（纵向合并）
      merges.push({
        row: 1,
        col: colIndex + 1, // Excel 列从 1 开始
        rowSpan: 2
      })
      
      colIndex++
    }
  })

  return { flatColumns, headerRow1, headerRow2, merges }
}

/**
 * 设置表头行样式
 * @param {Object} row - ExcelJS 行对象
 * @param {String} bgColor - 背景色（ARGB 格式）
 */
function styleHeaderRow(row, bgColor) {
  row.font = { bold: true }
  row.alignment = { horizontal: 'center', vertical: 'middle' }
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: bgColor }
  }
}
