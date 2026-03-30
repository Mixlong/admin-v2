import { saveAs } from 'file-saver'
import XLSX from 'xlsx-style'

function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook()
  this.SheetNames = []
  this.Sheets = {}
}

function s2ab(s) {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i !== s.length; ++i) {
    view[i] = s.charCodeAt(i) & 0xff
  }
  return buf
}

function getCellStyle(isHeader) {
  return {
    fill: {
      fgColor: {
        rgb: isHeader ? 'D9D9D9' : 'FFFFFF'
      }
    },
    font: {
      name: '宋体',
      sz: 12,
      bold: isHeader
    },
    alignment: {
      horizontal: 'center',
      vertical: 'center',
      wrapText: true
    },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    }
  }
}

function sheetFromArrayOfArrays(data) {
  const ws = {}
  const range = {
    s: { c: 10000000, r: 10000000 },
    e: { c: 0, r: 0 }
  }

  for (let rowIndex = 0; rowIndex !== data.length; ++rowIndex) {
    for (let colIndex = 0; colIndex !== data[rowIndex].length; ++colIndex) {
      if (range.s.r > rowIndex) range.s.r = rowIndex
      if (range.s.c > colIndex) range.s.c = colIndex
      if (range.e.r < rowIndex) range.e.r = rowIndex
      if (range.e.c < colIndex) range.e.c = colIndex

      const value = data[rowIndex][colIndex]
      const cell = {
        v: value == null ? '' : value,
        t: typeof value === 'number' ? 'n' : 's',
        s: getCellStyle(rowIndex <= 1)
      }

      const cellRef = XLSX.utils.encode_cell({ c: colIndex, r: rowIndex })
      ws[cellRef] = cell
    }
  }

  if (range.s.c < 10000000) {
    ws['!ref'] = XLSX.utils.encode_range(range)
  }

  return ws
}

function buildCols(data) {
  const colWidth = data.map(row =>
    row.map(value => {
      if (value == null || value === '') {
        return { wch: 10 }
      }
      const cellValue = String(value)
      if (cellValue.length > 50) {
        return { wch: 30 }
      }
      if (cellValue.charCodeAt(0) > 255) {
        return { wch: Math.max(cellValue.length * 2, 10) }
      }
      return { wch: Math.max(cellValue.length + 2, 10) }
    })
  )

  const result = colWidth[0] || []
  for (let rowIndex = 1; rowIndex < colWidth.length; rowIndex += 1) {
    for (let colIndex = 0; colIndex < colWidth[rowIndex].length; colIndex += 1) {
      if (!result[colIndex] || result[colIndex].wch < colWidth[rowIndex][colIndex].wch) {
        result[colIndex] = colWidth[rowIndex][colIndex]
      }
    }
  }
  return result
}

export function export_json_to_excel({
  multiHeader = [],
  data = [],
  filename = 'excel-list',
  bookType = 'xlsx',
  myMerges = []
} = {}) {
  const exportData = [...data]
  for (let index = multiHeader.length - 1; index >= 0; index -= 1) {
    exportData.unshift(multiHeader[index])
  }

  const wsName = 'SheetJS'
  const wb = new Workbook()
  const ws = sheetFromArrayOfArrays(exportData)
  ws['!cols'] = buildCols(exportData)
  ws['!merges'] = myMerges.map(item => XLSX.utils.decode_range(item))

  wb.SheetNames.push(wsName)
  wb.Sheets[wsName] = ws

  const wbout = XLSX.write(wb, {
    bookType,
    bookSST: false,
    type: 'binary'
  })

  saveAs(
    new Blob([s2ab(wbout)], {
      type: 'application/octet-stream'
    }),
    `${filename}.${bookType}`
  )
}
