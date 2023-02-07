/* eslint-disable */
import { saveAs } from 'file-saver';
// import XLSX from 'xlsx';
import XLSX from 'xlsx-style';

function generateArray(table) {
  var out = [];
  var rows = table.querySelectorAll('tr');
  var ranges = [];
  for (var R = 0; R < rows.length; ++R) {
    var outRow = [];
    var row = rows[R];
    var columns = row.querySelectorAll('td');
    for (var C = 0; C < columns.length; ++C) {
      var cell = columns[C];
      var colspan = cell.getAttribute('colspan');
      var rowspan = cell.getAttribute('rowspan');
      var cellValue = cell.innerText;
      if (cellValue !== '' && cellValue == +cellValue) cellValue = +cellValue;
      //Skip ranges
      ranges.forEach(function (range) {
        if (
          R >= range.s.r &&
          R <= range.e.r &&
          outRow.length >= range.s.c &&
          outRow.length <= range.e.c
        ) {
          for (var i = 0; i <= range.e.c - range.s.c; ++i)
            outRow.push(null);
        }
      });

      //Handle Row Span
      if (rowspan || colspan) {
        rowspan = rowspan || 1;
        colspan = colspan || 1;
        ranges.push({
          s: {
            r: R,
            c: outRow.length,
          },
          e: {
            r: R + rowspan - 1,
            c: outRow.length + colspan - 1,
          },
        });
      }
      //Handle Value
      outRow.push(cellValue !== '' ? cellValue : null);
      //Handle Colspan
      if (colspan) for (var k = 0; k < colspan - 1; ++k) outRow.push(null);
    }
    out.push(outRow);
  }
  return [out, ranges];
}

function datenum(v, date1904) {
  if (date1904) v += 1462;
  var epoch = Date.parse(v);
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data, oldData) {
  var ws = {};
  var range = {
    s: {
      c: 10000000,
      r: 10000000,
    },
    e: {
      c: 0,
      r: 0,
    },
  };

  for (var R = 0; R != data.length; ++R) {
    for (var C = 0; C != data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;
      var cell = {
        v: data[R][C],
      };
      if (cell.v == null) {
        cell.v = '';
      }
      var cell_ref = XLSX.utils.encode_cell({
        c: C,
        r: R,
      });
      if (typeof cell.v === 'number') cell.t = 'n';
      else if (typeof cell.v === 'boolean') cell.t = 'b';
      else if (cell.v instanceof Date) {
        cell.t = 'n';
        cell.z = XLSX.SSF._table[14];
        cell.v = datenum(cell.v);
      } else cell.t = 's';
      let fill = '';
      cell.s = {
        fill: fill,
        font: {
          name: '宋体',
          sz: 12,
          color: { rgb: "00000" },
        },

        alignment: {
          horizontal: 'center',
          vertical: 'center',
          wrapText: true,
        },
        border: {
          // 设置边框
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        },
      };
      //标题背景色
      if (R == 0) {
        cell.s.fill = {
          fgColor: {
            rgb: 'd2dee8',
          },
        };
      }
      //送样日期颜色
      else if (C == 6) {
        cell.s.font.color = {
          rgb: oldData[R - 1] ? oldData[R - 1].sendTimeColor : '00000'

        }
        cell.s.font.bold = true
      }
      //富文本内容居左
      else if (R > 0 && (C == 3 || C == 4)) {
        cell.s.alignment.horizontal = "top"
      }
      else if (R > 0 && (C == 8)) {
        let color = ''
        switch (oldData[R - 1].state) {
          case 0:
            color = "0081ff";
            break;
          case 1:
            color = "";
            break;
          case 2:
            color = "f37b1d";
            break;
          case 3:
            color = "fbbd08";
            break;
          case 4:
            color = "";
            break;
          case 5:
            color = "";
            break;

        }
        cell.s.font.color = {
          rgb: color
        }

      }
      if (R > 0 && oldData[R - 1].state == 5) {
        cell.s.fill = {
          fgColor: {
            rgb: '74c37f',
          },
        };
      }
      ws[cell_ref] = cell;
    }
  }
  if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);

  return ws;
}

function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i)
    view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

export function export_table_to_excel(id) {
  var theTable = document.getElementById(id);
  var oo = generateArray(theTable);
  var ranges = oo[1];
  /* original data */
  var data = oo[0];
  var ws_name = 'SheetJS';

  var wb = new Workbook(), ws = sheet_from_array_of_arrays(data);

  /* add ranges to worksheet */
  // ws['!cols'] = ['apple', 'banan'];

  ws['!merges'] = ranges;

  /* add worksheet to workbook */
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;

  var wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    bookSST: false,
    type: 'binary',
  });

  saveAs(
    new Blob([s2ab(wbout)], {
      type: 'application/octet-stream',
    }),
    'test.xlsx'
  );
}

export function export_json_to_excel(
  {
    multiHeader = [],
    header,
    data,
    oldData,
    filename,
    merges = [],
    autoWidth = true,
    bookType = 'xlsx',
    myMerges
  } = {}
) {

  /* original data */
  filename = filename || 'excel-list';
  data = [...data];
  data.unshift(header);
  for (let i = multiHeader.length - 1; i > -1; i--) {
    data.unshift(multiHeader[i]);
  }

  var ws_name = 'SheetJS';
  var wb = new Workbook(), ws = sheet_from_array_of_arrays(data, oldData);

  if (merges.length > 0) {
    if (!ws['!merges']) ws['!merges'] = [];
    merges.forEach(item => {
      ws['!merges'].push(XLSX.utils.decode_range(item));
    });
  }

  if (autoWidth) {
    /*设置worksheet每列的最大宽度*/
    const colWidth = data.map(row =>
      row.map((val, index) => {
        /*先判断是否为null/undefined*/

        if (val == null) {
          return {
            wch: 10,
          };
        } else if (val.toString().length > 100) {
          return {
            wch: 30,
          };
        } else if (val.toString().charCodeAt(0) > 255) {
          /*再判断是否为中文*/
          return {
            wch: val.toString().length * 2 > 10
              ? val.toString().length * 1
              : 10,
          };
        } else {
          return {
            wch: val.toString().length > 60 ? 60 : val.toString().length,
          };
        }
      })
    );
    /*以第一行为初始值*/
    let result = colWidth[0];
    // for (let k = 0; k < colWidth.length; k++) {
    //   for (let j = 0; j < colWidth[k].length; j++) {
    //     if (result[j]['wch'] < colWidth[k][j]['wch']) {
    //       result[j]['wch'] = colWidth[k][j]['wch']
    //     }
    //   }
    // }

    result[0].wch = 10
    result[1].wch = 10
    result[2].wch = 5
    result[6].wch = 13
    ws['!cols'] = result;

    let colHeight = data.map(row => row.map(val => {
      /*先判断是否为null/undefined*/
      return {
        'hpx': 55
      };
      if (val == null) {
        return {
          'hpx': 40
        };
      }
      /*再判断是否为中文*/
      else if (val.toString().length * 2 > 40) {
        return {
          'hpx': val.toString().length * 2 > 100 ? 100 : val.toString().length * 2
        };
      } else {
        return {
          'hpx': 40
        };
      }
    }))
    let result1 = []
    for (let i = 1; i < colHeight.length; i++) {


      for (let j = 0; j < colHeight[i].length; j++) {

        result1.push(colHeight[i][j])
      }
    }
    result1[0].hpx = 30
    ws['!rows'] = result1;

  }


  ws['!merges'] = myMerges;
  /* add worksheet to workbook */
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;
  var wbout = XLSX.write(wb, {
    bookType: bookType,
    bookSST: false,
    type: 'binary',
  });
  saveAs(
    new Blob([s2ab(wbout)], {
      type: 'application/octet-stream',
    }),
    `${filename}.${bookType}`
  );
}
