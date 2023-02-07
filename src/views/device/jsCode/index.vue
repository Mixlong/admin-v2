<template>
  <div @click="closePopover" class="app-container" style="padding: 0">
    <el-container class="bg-white">
      <el-aside width="520px">
        <el-card>
          <h4 class="flex justify-between align-center margin-0">
            <span>基础函数区</span>
            <el-button
              @click="handleAddBase"
              icon="el-icon-plus"
              type="primary"
              size="small"
              plain
            ></el-button>
          </h4>
          <div class="content-scroll">
            <el-select
              v-model="queryParams.pucsType"
              placeholder="请选择"
              class="margin-tb-xs"
              style="width: 100%"
              @change="getList(1)"
            >
              <el-option
                v-for="item in pucsTypeList"
                :key="item.dictValue"
                :label="item.dictLabel"
                :value="item.dictValue"
              >
              </el-option>
            </el-select>
            <el-cascader-panel
              :key="cascaderKey"
              ref="cascader"
              class="cust-el-cascader-panel"
              @expand-change="changeCascader"
              v-model="selectValue"
              :options="baseList"
              :props="{ label: 'name', value: 'id', children: 'pucsFuncs' }"
            >
              <template slot-scope="{ data }">
                <div v-if="data.status != undefined" class="flex align-center">
                  <i class="el-icon-edit" @click.stop="handleAddBase(data, true)"></i>
                  <span @click="selectCascader(data)" class="flex-sub">{{ data.name }}</span>
                </div>
                <div v-else>
                  <i v-if="curIdAll.indexOf(data.id) > -1" class="el-icon-edit" @click.stop="handleEditClass(data)"></i>
                  <span> {{ data.name }}</span>
                </div>
              </template>
            </el-cascader-panel>
          </div>
        </el-card>
        <el-card class="margin-top-xs">
          <h4 class="flex justify-between align-center margin-0">
            <span class="margin-right">公共函数区</span>
            <el-button
              @click="handleAddComm"
              icon="el-icon-plus"
              type="primary"
              size="small"
              plain
            ></el-button>
          </h4>
          <div class="content-scroll padding-top-xs">
            <el-table border max-height="230" :data="commList">
              <el-table-column
                fixed
                prop="title"
                label="函数名"
                align="center"
                >
              </el-table-column>
              <el-table-column
                prop="desc"
                label="注释"
                align="center"
                >
              </el-table-column>
              <el-table-column
                label="操作"
                align="center"
                >
                <template slot-scope="{ row }">
                  <el-button type="text" @click="addJsCode(row, 0)">执行</el-button>
                  <el-button type="text" class="text-center text-blue" @click="handelUpdate(row, 2)">编辑</el-button>
                  <el-button type="text" class="text-center text-red" @click="handleDelete(row, 2)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-aside>
      <el-container>
        <el-main style="padding-left: 0">
          <el-card :body-style="{ padding: '0px' }">
            <div id="main_container">
              <div id="core" class="core core_margin1">
                <div class="editorSet clearfix">
                  <div class="flex">
                    <div class="editor">
                      <div class="flex justify-between">
                        <span class="label"> </span>
                        <div class="operating padding-right">
                          <el-button
                            size="small"
                            class="text-blue"
                            @click="download"
                          >
                            <img src="@/assets/image/xiazai.png" alt="" />
                          </el-button>
                          <el-button
                            size="small"
                            icon="el-icon-caret-right"
                            class="text-green"
                            @click="submit"
                          ></el-button>
                        </div>
                      </div>
                      <pre id="editor3" class="edit-area"></pre>
                    </div>
                    <div class="editor2 flex-sub">
                      <iframe
                        style="top: 0"
                        class="edit-area"
                        id="preview"
                        frameborder="0"
                        srcdoc='<!DOCTYPE html><html><head><meta charset="utf-8" /><title>代码测试</title><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/><meta name="format-detection" content="telephone=no" /><meta name="apple-mobile-web-app-status-bar-style" content="black" /><meta name="apple-mobile-web-app-capable" content="yes" /><meta http-equiv="X-UA-Compatible" content="chrome=1,IE=edge"/><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0"/><style type="text/css"></style><script type="text/javascript" src="https://cdn.bootcss.com/vConsole/3.2.0/vconsole.min.js"></script><script type="text/javascript">new window.VConsole();</script></head><body><script type="text/javascript"></script></body></html>'
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
    <leftMain
      ref="leftMain"
      @success="getList(1)"
      :pucsTypeList="pucsTypeList"
    ></leftMain>
    <topMain ref="topMain" @success="getList(2)"> </topMain>
    <code-type-dialog
      :visible.sync="dialogVisible"
      title="下载文件"
      :show-file-name="showFileName"
      @confirm="generate"
    />
  </div>
</template>

<script>
import remoteLoad from "@/utils/remoteLoad";
import leftMain from "./components/leftMain";
import topMain from "./components/topMain";
import CodeTypeDialog from "./components/CodeTypeDialog";
import { funcList, funcDelete, funcBaseList, funcBaseDir } from "@/api/js";
import { typeDict } from "@/api/pucs/type";
import { saveAs } from "file-saver";
export default {
  components: {
    topMain,
    leftMain,
    CodeTypeDialog,
  },
  data() {
    return {
      cascaderKey: 0,
      curIdAll: [],
      dialogVisible: false,
      showFileName: false,
      pucsTypeList: [],
      baseList: [],
      commList: [],
      selectValue: [],
      queryParams: {
        pucsType: "",
      },
      jsMyFnContent: "",
    };
  },
  watch: {
    baseList(newVal) {
      this.cascaderKey ++
    }
  },
  async created() {
    await remoteLoad("http://udot.oss-cn-shenzhen.aliyuncs.com/js/ace.js");
    await remoteLoad(
      "https://udot.oss-cn-shenzhen.aliyuncs.com/js/ext-language_tools.min.js"
    );

    typeDict().then((response) => {
      let { data } = response;
      if (data.length) {
        this.pucsTypeList = data;
        this.queryParams.pucsType = data[0].dictValue;
        this.getList(1);
      }
    });
    this.init();
  },
  methods: {
    init() {
      this.editor = ace.edit("editor3", {
        theme: "ace/theme/monokai",
        mode: "ace/mode/javascript",
        autoScrollEditorIntoView: true,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
      });
      this.submit();
      this.getList(2);
    },
    getList(jsType) {
      if (jsType == 1) {
        funcBaseList({
          p: 1,
          l: 1000,
          pucsType: this.queryParams.pucsType,
        }).then((res) => {
          let { data } = res;
          for (let key of data.list) {
            key.visible = false;
          }
          this.baseList = data.list;
        });
      } else {
        funcList({
          p: 1,
          l: 1000,
        }).then((res) => {
          let { data } = res;
          this.commList = data.list;
        });
      }
    },

    myCreatFn(key) {
      let { baseList } = this;
      let jsContent = "";
      let returnData = null;
      returnData = key.res == "true" || key.res == "false" ? key.res : `'${key.res}'`;
      jsContent += `function ${key.funcName}(){
            console.log('函数:${key.funcName},回调:${key.res}');
            return ${returnData}
            };\n`;

      this.jsMyFnContent += jsContent;
    },
    submit() {
      var jsValue = this.editor.getValue();
      let css = `.vc-mask,.vc-panel{
                    min-height:100%!important;
                display: block!important;
                    }
        .vc-mask{
                  background: rgba(0,0,0,.7)!important;
            }
            .vc-tabbar,.vc-topbar,.vc-toolbar,.vc-cmd-input-wrap,.vc-cmd{
                 display: none!important;
                 opacity: 0;
            }
            #__vconsole .vc-panel{
                transform: translate(0)!important;
            }
            #__vconsole .vc-content{
                height:100%;
                top:0!important;
            }
            `;

      var htmlStr =
        "<!DOCTYPE html>" +
        "<html>" +
        "<head>" +
        '<meta charset="utf-8" />' +
        "<title>代码测试</title>" +
        '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>' +
        '<meta name="format-detection" content="telephone=no" />' +
        '<meta name="apple-mobile-web-app-status-bar-style" content="black" />' +
        '<meta name="apple-mobile-web-app-capable" content="yes" />' +
        '<meta http-equiv="X-UA-Compatible" content="chrome=1,IE=edge"/>' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0"/>' +
        '<style type="text/css">' +
        css +
        "</style>" +
        '<script type="text/javascript" src="https://cdn.bootcss.com/vConsole/3.1.0/vconsole.min.js">' +
        "</" +
        "script>" +
        '<script type="text/javascript">' +
        "var vConsole = new VConsole(); " +
        "</" +
        "script>" +
        "</head>" +
        "<body>" +
        '<script type="text/javascript">' +
        this.jsMyFnContent +
        jsValue +
        ";\nconsole.log(" +
        '"运行成功!"' +
        ")" +
        "</" +
        "script>" +
        "</body>" +
        "</html>";
      document.getElementById("preview").srcdoc = htmlStr;
    },
    selectCascader(val) {
      // let { baseList } = this;
      this.myCreatFn(val);
      return this.addJsCode(val, 1);
      // this.findIndex(baseList, val[2]);
    },
    changeCascader(val) {
      this.curIdAll = val;
    },
    findIndex(data, id) {
      for (let key of data) {
        if (key.pucsFuncs) {
          this.findIndex(key.pucsFuncs, id);
        } else if (key.id == id) {
          return this.addJsCode(key, 1);
        }
      }
    },
    handleAddComm() {
      this.$refs.topMain.dialogFormVisible = true;
      this.$refs.topMain.form = {};
    },
    handleAddBase(value, bool) {
      this.$refs.leftMain.dialogFormVisible = true;
      this.$refs.leftMain.form = Object.assign({}, value, { isDisable: bool });
    },
    handleEditClass(data) {
      this.$prompt(data.name, "修改分类", {
        confirmButtonText: "修改",
        cancelButtonText: "取消",
      }).then(({ value }) => {
        funcBaseDir({
          id: data.id,
          name: value,
        }).then((res) => {
          this.getList(1);
        });
      });
    },
    handelUpdate(row, type) {
      if (type == 1) {
        this.$refs.leftMain.dialogFormVisible = true;
        if (row.param) {
          this.$refs.leftMain.paramsList = JSON.parse(row.param);
        }
        this.$refs.leftMain.form = Object.assign({}, row);
      } else {
        this.$refs.topMain.dialogFormVisible = true;
        this.$refs.topMain.form = Object.assign({}, row);
      }
      this.closePopover();
    },

    addJsCode(item, jsType) {
      let params = "";
      let exegesis = "";
      if (jsType == 1) {
        if (item.param) {
          let data = JSON.parse(item.param);
          let i = 0;

          for (let key of data) {
            i += 1;
            params += `,`;
            exegesis += `${key.key},`;
          }
          exegesis = exegesis.slice(0, -1);
          exegesis = `//${item.name}(${exegesis})`;
          params = params.slice(0, -1);
        }
        this.editor.insert(`\n${item.funcName}(${params});${exegesis}`);
      } else {
        this.editor.insert(`\n//${item.desc}\n${item.code}`);
      }
    },
    rightClick(row, event) {
      this.closePopover();
      event.preventDefault(); //关闭浏览器右键默认事件
      row.visible = true;
    },
    handleDelete(row, type) {
      funcDelete([{ id: row.id, status: 1 }]).then((res) => {
        if (res.code == 200) {
          this.msgSuccess("删除成功！");
          this.getList(type);
        }
      });
    },
    closePopover() {
      let { baseList, commList } = this;
      for (let key of baseList) {
        key.visible = false;
      }
      for (let key of commList) {
        key.visible = false;
      }
    },
    download() {
      this.dialogVisible = true;
      this.showFileName = true;
      this.operationType = "download";
    },
    generate(data) {
      let jsValue = this.editor.getValue();
      if (!jsValue) {
        return this.msgError("下载内容不能为空!");
      }
      const blob = new Blob([jsValue], { type: "text/plain;charset=utf-8" });
      saveAs(blob, data.fileName + ".js");
    },
  },
};
</script>

<style lang='scss' scope>
#editor3 {
  margin: 0;
}
.el-aside {
  padding: 20px;
  background: #fff;
}
.ace-monokai {
  background-color: #262626;
}
.ace-monokai .ace_print-margin {
  display: none;
}
.edit-area {
  height: calc(100% - 77px) !important;
  &::after {
    display: block;
    content: "";
    width: 41px;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
    background: #2b2d2f;
  }
}
.ace_content {
  padding-right: 41px;
  // width: 100%!important;
}
.operating {
  .el-button {
    border: 0;
    background: transparent;
    padding: 5px;
    i {
      font-size: 28px;
    }
  }
  img {
    height: 20px;
  }
}
.popover-coust-hover {
  > div {
    height: 30px;
    line-height: 30px;
    &:hover {
      background: rgba(110, 154, 255, 0.5);
    }
  }
}
.content-scroll {
  height: calc(50vh - 143px);
  overflow-y: scroll;
  overflow-x: hidden;
}
@media screen and (min-width: 960px) {
  .editorSet {
    width: 100%;
  }
  .ace-monokai .ace_gutter {
    background: #2b2d2f;
    color: #8f908a;
  }
  .editorSet .editor {
    height: calc(100vh - 140px);
    width: 70%;
    overflow-y: hidden;
    background-color: #353739;
    float: left;
  }
}

@media screen and (max-width: 959px) {
  .editorSet {
    width: 100%;
  }

  .editorSet .editor {
    height: 450px;
    width: 100%;
    overflow-y: hidden;
    background-color: rgb(44, 52, 55);
  }
}

.NightTheme .editorSet .editor {
  -webkit-box-shadow: inset 0 1px 3px rgb(22, 26, 27);
  -moz-box-shadow: inset 0 1px 3px rgb(22, 26, 27);
  box-shadow: inset 0 1px 3px rgb(22, 26, 27);
}

.editor2 {
  background: #fff;
  iframe {
    border: 0 !important;
    min-height: 100px;
    min-width: 100px;
    height: 100%;
    width: 100%;
  }
}

.submit-btn {
  color: #fff;
  background-color: #67c23a;
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid #67c23a;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: 0.1s;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;
  margin-bottom: 2px;
}

.edit-area {
  height: 90%;
}
.cust-el-cascader-panel {
  .el-scrollbar__wrap {
    // border-bottom: solid 1px #dfe4ed;
  }
  // &.el-cascader-panel.is-bordered,
  // .el-cascader-menu {
  //   border: none;
  // }
  .el-cascader-menu {
    min-width: 50%;
  }
  .el-cascader-menu__wrap {
    // height: auto;
  }
  .el-cascader-menu__list {
    // border-bottom: solid 1px #dfe4ed;
  }
}
</style>