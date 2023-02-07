<!--
 * @Author: your name
 * @Date: 2021-04-14 13:47:31
 * @LastEditTime: 2021-05-13 16:02:39
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/views/third/testTool/components/Log.vue
-->
<template>
  <div>
    <el-dialog
      :close-on-click-modal="false"
      title="日志"
      :visible.sync="dialogVisible"
      width="70%"
      top="5vh"
      append-to-body
    >
      <el-table :data="list" border>
        <el-table-column prop="action" align="center" width="180" label="动作">
          <template slot-scope="scope">
            <div>
              {{ scope.row.action == 1 ? "借出" : "归还" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="remark" align="center" label="说明">
          <template slot-scope="scope">
            <div v-html="scope.row.remark" class="text-left"></div>
          </template>
        </el-table-column>
        <el-table-column
          prop="createBy"
          align="center"
          width="120"
          label="操作人"
        ></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      dialogVisible: false,
      total: 0,
      // 是否显示弹出层
      // 查询参数
      queryParams: {
        p: 1,
        l: 1000,
        key: undefined,
      },
      list: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        lendAddr: [
          { required: true, message: "请输入借调地址", trigger: "change" },
        ],
        principal: [{ required: true, message: "请选择", trigger: "change" }],
      },
    };
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.resetForm("form");
      }
    },
  },

  methods: {
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          toolLend(this.form).then((response) => {
            if (response.code === 200) {
              this.msgSuccess("借出成功");
              this.$parent.getList();
              this.dialogVisible = false;
            }
          });
        }
      });
    },
  },
};
</script>