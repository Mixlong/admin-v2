
/*
 * @Author: your name
 * @Date: 2021-05-07 11:29:30
 * @LastEditTime: 2021-05-08 11:37:59
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/views/third/ecn/export.js
 */
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

function sheet_from_array_of_arrays(data, opts) {
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
            if (cell.v == '进行中(紧急)') {
                fill = {
                    fgColor: {
                        rgb: 'ff0000',
                    },
                };
            } else if (cell.v == '进行中(风险)') {
                fill = {
                    fgColor: {
                        rgb: 'e6a23c',
                    },
                };
            } else if (cell.v == '已暂停') {
                fill = {
                    fgColor: {
                        rgb: '409EFF',
                    },
                };
            } else if (cell.v == '未启动') {
                fill = {
                    fgColor: {
                        rgb: '606266',
                    },
                };
            } else if (cell.v == '已完成') {
                fill = {
                    fgColor: {
                        rgb: '67C23A',
                    },
                };
            }

            if (R == 0) {
                fill = {
                    fgColor: {
                        rgb: '909399',
                    },
                };
            }
            cell.s = {
                fill: fill,
                font: {
                    name: '宋体',
                    sz: 14,
                },
                alignment: {
                    horizontal: 'top',
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
        filename,
        merges = [],
        autoWidth = true,
        bookType = 'xlsx',
        myMerges
    } = {}
) {

    let style = {
        "fill": {
            "fgColor": {
                "rgb": "ffffff"
            }
        },
        "font": {
            "name": "宋体",
            "sz": 13
        },
        "alignment": {
            "horizontal": "center",
            "vertical": "center",
            "wrapText": true
        },
        "border": {
            "top": {
                "style": "thin"
            },
            "bottom": {
                "style": "thin"
            },
            "left": {
                "style": "thin"
            },
            "right": {
                "style": "thin"
            }
        }
    }
    let bgColor = {
        "fill": {
            "fgColor": {
                "rgb": "cccccc"
            }
        },
        "font": {
            "name": "宋体",
            "sz": 13
        },
        "alignment": {
            "horizontal": "center",
            "vertical": "center",
            "wrapText": true
        },
        "border": {
            "top": {
                "style": "thin"
            },
            "bottom": {
                "style": "thin"
            },
            "left": {
                "style": "thin"
            },
            "right": {
                "style": "thin"
            }
        }
    }

    let EN = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    let leng = 40
    let SheetJS = {}
    let cols = []
    for (let i = 0; i < leng; i++) {
        for (let y = 0; y < EN.length; y++) {

            SheetJS[EN[y] + (i + 1)] = {
                "v": "",
                "t": "n",
                "s": style
            }
        }
    }
    for (let key of EN) {
        cols.push({
            "wch": 15
        })
    }

    SheetJS['A1'].v = "仪表BOM变更通知"
    //
    SheetJS['A3'].v = "项目名称"
    SheetJS['A3'].s = bgColor
    SheetJS['B3'].v = "BN130"
    SheetJS['F3'].v = "产品代号"
    SheetJS['F3'].s = bgColor
    SheetJS['G3'].v = "BN130"
    SheetJS['I3'].v = "ECN编号"
    SheetJS['I3'].s = bgColor
    SheetJS['J3'].v = "DT-BOM-ECN-21-002-20210430"
    //
    SheetJS['A4'].v = "申请单位"
    SheetJS['A4'].s = bgColor
    SheetJS['B4'].v = "研发部"
    SheetJS['F4'].v = "申请人/日期"
    SheetJS['F4'].s = bgColor
    SheetJS['G4'].v = data.updateBy ? data.updateBy : data.createBy
    SheetJS['H4'].v = data.updateTime ? data.updateTime : data.createTime
    SheetJS['I4'].v = "部门负责人/日期"
    SheetJS['I4'].s = bgColor
    SheetJS['J4'].v = (data.updateBy ? data.updateBy : data.createBy) + "/" + (data.updateTime ? data.updateTime : data.createTime)
    //
    SheetJS['A5'].v = "变更分类"
    SheetJS['A5'].s = bgColor
    SheetJS['B5'].v = data.changeCause
    //
    SheetJS['A7'].v = "变更内容"
    SheetJS['A7'].s = bgColor

    //
    SheetJS['A8'].v = "变更前BOM版本"
    SheetJS['A8'].s = bgColor
    SheetJS['C8'].v = "变更原因"
    SheetJS['C8'].s = bgColor
    SheetJS['F8'].v = "变更内容"
    SheetJS['F8'].s = bgColor
    SheetJS['I8'].v = "变更结果"
    SheetJS['I8'].s = bgColor
    //
    SheetJS['A9'].v = data.beforeVersion || ""
    SheetJS['C9'].v = data.changeCauseNote || ""
    SheetJS['F9'].v = data.changeContent || ""

    SheetJS['I9'].v = data.afterVersion || ""

    //
    SheetJS['A19'].v = "变更涉及领域"
    SheetJS['A19'].s = bgColor
    SheetJS['B19'].v = data.involveUnit

    SheetJS['A21'].v = "导入时间"
    SheetJS['A21'].s = bgColor
    SheetJS['B21'].v = data.importType == 1 ? " ■立即导入，导入时间：" + data.importTime : " □立即导入，导入时间："
    SheetJS['B21'].s = {
        "alignment": {
            "horizontal": "left",
            "vertical": "center",
            "wrapText": true
        },
    }

    SheetJS['F21'].v = data.importType == 2 ? " ■自然导入，导入时间：" + data.importTime : '□自然导入，导入时间：'
    SheetJS['F21'].s = {
        "alignment": {
            "horizontal": "left",
            "vertical": "center",
            "wrapText": true
        },
    }

    SheetJS['A22'].v = "评审意见"

    SheetJS['B22'].v = "部门1"
    SheetJS['C22'].v = "研发部"
    SheetJS['F22'].v = `□同意             □不同意，理由：                      
    签名：                   日期  `
    SheetJS['B25'].v = "部门2"
    SheetJS['C25'].v = "产品部"
    SheetJS['F25'].v = `□同意             □不同意，理由：                      
    签名：                   日期  `
    SheetJS['B28'].v = "部门3"
    SheetJS['C28'].v = "工程部"
    SheetJS['F28'].v = `□同意             □不同意，理由：                      
    签名：                   日期  `
    SheetJS['B31'].v = "部门4"
    SheetJS['C31'].v = "品质部"
    SheetJS['F31'].v = `□同意             □不同意，理由：                      
    签名：                   日期  `

    SheetJS['B34'].v = "部门5"
    SheetJS['C34'].v = "采购部"
    SheetJS['F34'].v = `□同意             □不同意，理由：                      
    签名：                   日期  `
    SheetJS['B37'].v = "部门6"
    SheetJS['C37'].v = "设计部"
    SheetJS['F37'].v = `□同意             □不同意，理由：                      
    签名：                   日期  `

    SheetJS['A40'].v = "备注"
    SheetJS['B40'].v = ""
    let wb = {
        "SheetNames": [
            "SheetJS"
        ],
        "Sheets": {

            "SheetJS": {
                "!merges": [
                    { "s": { "r": 0, "c": 0 }, "e": { "r": 1, "c": 9 } },
                    { "s": { "r": 2, "c": 1 }, "e": { "r": 2, "c": 4 } },
                    { "s": { "r": 2, "c": 6 }, "e": { "r": 2, "c": 9 } },
                    { "s": { "r": 3, "c": 1 }, "e": { "r": 3, "c": 4 } },
                    { "s": { "r": 4, "c": 0 }, "e": { "r": 5, "c": 0 } },
                    { "s": { "r": 4, "c": 1 }, "e": { "r": 5, "c": 9 } },
                    { "s": { "r": 6, "c": 0 }, "e": { "r": 6, "c": 9 } },
                    { "s": { "r": 7, "c": 0 }, "e": { "r": 7, "c": 1 } },
                    { "s": { "r": 7, "c": 2 }, "e": { "r": 7, "c": 4 } },
                    { "s": { "r": 7, "c": 5 }, "e": { "r": 7, "c": 7 } },
                    { "s": { "r": 7, "c": 8 }, "e": { "r": 7, "c": 9 } },

                    { "s": { "r": 8, "c": 0 }, "e": { "r": 17, "c": 1 } },
                    { "s": { "r": 8, "c": 2 }, "e": { "r": 17, "c": 4 } },
                    { "s": { "r": 8, "c": 5 }, "e": { "r": 17, "c": 7 } },
                    { "s": { "r": 8, "c": 8 }, "e": { "r": 17, "c": 9 } },

                    { "s": { "r": 18, "c": 0 }, "e": { "r": 19, "c": 0 } },
                    { "s": { "r": 18, "c": 1 }, "e": { "r": 19, "c": 9 } },


                    { "s": { "r": 20, "c": 1 }, "e": { "r": 20, "c": 4 } },
                    { "s": { "r": 20, "c": 5 }, "e": { "r": 20, "c": 9 } },



                    { "s": { "r": 21, "c": 0 }, "e": { "r": 38, "c": 0 } },
                    { "s": { "r": 21, "c": 1 }, "e": { "r": 23, "c": 1 } },
                    { "s": { "r": 21, "c": 2 }, "e": { "r": 23, "c": 4 } },
                    { "s": { "r": 21, "c": 5 }, "e": { "r": 23, "c": 9 } },
                    { "s": { "r": 24, "c": 1 }, "e": { "r": 26, "c": 1 } },
                    { "s": { "r": 24, "c": 2 }, "e": { "r": 26, "c": 4 } },
                    { "s": { "r": 24, "c": 5 }, "e": { "r": 26, "c": 9 } },
                    { "s": { "r": 27, "c": 1 }, "e": { "r": 29, "c": 1 } },
                    { "s": { "r": 27, "c": 2 }, "e": { "r": 29, "c": 4 } },
                    { "s": { "r": 27, "c": 5 }, "e": { "r": 29, "c": 9 } },
                    { "s": { "r": 30, "c": 1 }, "e": { "r": 32, "c": 1 } },
                    { "s": { "r": 30, "c": 2 }, "e": { "r": 32, "c": 4 } },
                    { "s": { "r": 30, "c": 5 }, "e": { "r": 32, "c": 9 } },
                    { "s": { "r": 33, "c": 1 }, "e": { "r": 35, "c": 1 } },
                    { "s": { "r": 33, "c": 2 }, "e": { "r": 35, "c": 4 } },
                    { "s": { "r": 33, "c": 5 }, "e": { "r": 35, "c": 9 } },
                    { "s": { "r": 36, "c": 1 }, "e": { "r": 38, "c": 1 } },
                    { "s": { "r": 36, "c": 2 }, "e": { "r": 38, "c": 4 } },
                    { "s": { "r": 36, "c": 5 }, "e": { "r": 38, "c": 9 } },
                    { "s": { "r": 39, "c": 0 }, "e": { "r": 39, "c": 0 } },
                    { "s": { "r": 39, "c": 1 }, "e": { "r": 39, "c": 9 } },
                ],
                "!ref": "A1:J" + leng,
            }
        }
    }
    wb.Sheets.SheetJS = Object.assign(wb.Sheets.SheetJS, SheetJS, { "!cols": cols })
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
