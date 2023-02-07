<!--
 * @Author: your name
 * @Date: 2021-04-14 13:47:31
 * @LastEditTime: 2021-05-14 17:02:34
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/views/third/production/components/info.vue
-->
<template>
  <!--   -->
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="700px"
    append-to-body
    top="3vh"
    :close-on-click-modal="false"
  >
    <div class="post-form model-wrap margin-top">
      <div class="model-wrap-style">
        <div class="title" style="padding-left: 3px">
          <div><i class="mr10 margin-left-xs"></i>{{ title }}</div>
        </div>
      </div>
      <div class="model-content" style="padding: 30px 40px">
        <div v-html="htmlcomp(conent)"></div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: ["title", "conent"],
  data() {
    return {
      dialogVisible: false,
      // 查询参数
      queryParams: {
        p: 1,
        l: 1000,
        key: undefined,
      },
    };
  },
  mounted() {},
  methods: {
    htmlcomp(data) {
      let obj = {
        report: "结果",
        time: "老化时间",
        lineNo: "线号",
        name: "员工姓名",
        no: "员工编号",
        pucsNo: "pucs编号",
        report: "测试报告",
        createTime: "创建时间",
      };
      let html = "";

      for (let key in obj) {
        if (data[key]) {
          html += ` <div   class="margin-bottom-xs">
            ${obj[key]}：
            <span class="gray">${data[key]}</span>
          </div>`;
        }
      }
      return `   <div class=" col-row-style">${html}</div>`;
    },
    changeTargetIdType(val) {
      this.form.targetId = this.form.updateCondition == 4 ? [] : "";
      this.form = Object.assign({}, this.form);
    },
  },
};
</script>

<style lang="scss">
.style-upload {
  .el-upload-dragger {
    width: 100%;
  }
}
.col-row-style {
  display: flex;
  flex-flow: row wrap;
  > div {
    width: 50%;
  }
}
</style>

