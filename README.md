<!--
 * @Author: your name
 * @Date: 2021-04-14 13:47:31
 * @LastEditTime: 2021-05-24 09:38:24
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/README.md
-->
## 开发

```bash
# 克隆项目
git clone https://gitee.com/y_project/RuoYi-Vue

# 进入项目目录
cd ruoyi-ui

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

# 启动服务
npm run dev
```

浏览器访问 http://localhost:80

## 发布

```bash
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```

# 倒计时插件
https://www.codeleading.com/article/80044092213/
```

# 每次更新包需要修改node_modules包下的xlsx-style插件
找到 xlsx.js文件下的    write_ws_xml_data  替换下面的代码

var DEF_PPI = 96, PPI = DEF_PPI;
function px2pt(px) { return px * 96 / PPI; }
function pt2px(pt) { return pt * PPI / 96; }
function write_ws_xml_data(ws, opts, idx, wb) {
	var o = [], r = [], range = safe_decode_range(ws['!ref']), cell="", ref, rr = "", cols = [], R=0, C=0, rows = ws['!rows'];
	var dense = Array.isArray(ws);
	var params = ({r:rr}), row, height = -1;
	for(C = range.s.c; C <= range.e.c; ++C) cols[C] = encode_col(C);
	for(R = range.s.r; R <= range.e.r; ++R) {
		r = [];
		rr = encode_row(R);
		for(C = range.s.c; C <= range.e.c; ++C) {
			ref = cols[C] + rr;
			var _cell = dense ? (ws[R]||[])[C]: ws[ref];
			if(_cell === undefined) continue;
			if((cell = write_ws_xml_cell(_cell, ref, ws, opts, idx, wb)) != null) r.push(cell);
		}
		if(r.length > 0 || (rows && rows[R])) {
			params = ({r:rr});
			if(rows && rows[R]) {
				row = rows[R];
				if(row.hidden) params.hidden = 1;
				height = -1;
				if (row.hpx) height = px2pt(row.hpx);
				else if (row.hpt) height = row.hpt;
				if (height > -1) { params.ht = height; params.customHeight = 1; }
				if (row.level) { params.outlineLevel = row.level; }
			}
			o[o.length] = (writextag('row', r.join(""), params));
		}
	}
	if(rows) for(; R < rows.length; ++R) {
		if(rows && rows[R]) {
			params = ({r:R+1});
			row = rows[R];
			if(row.hidden) params.hidden = 1;
			height = -1;
			if (row.hpx) height = px2pt(row.hpx);
			else if (row.hpt) height = row.hpt;
			if (height > -1) { params.ht = height; params.customHeight = 1; }
			if (row.level) { params.outlineLevel = row.level; }
			o[o.length] = (writextag('row', "", params));
		}
	}
	return o.join("");
}

 