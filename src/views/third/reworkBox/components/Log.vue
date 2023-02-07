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
        <el-table-column prop="num" align="center" label="数量" />
        <el-table-column prop="action" align="center" label="类型" width="100">
          <el-tag
            :type="row.action === 1 ? 'success' : 'danger'"
            slot-scope="{ row }"
            >{{ row.action === 1 ? "入库" : "出库" }}</el-tag
          >
        </el-table-column>
        <el-table-column prop="remark" align="center" label="备注" />
        <el-table-column
          prop="createBy"
          align="center"
          width="120"
          label="操作人"
        ></el-table-column>
        <el-table-column
          prop="createTime"
          align="center"
          width="170"
          label="操作时间"
        ></el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.p"
        :limit.sync="queryParams.l"
        @pagination="getList"
      />
    </el-dialog>
  </div>
</template>
<script>
import { material_log } from "@/api/third/sample";
export default {
  data() {
    return {
      activeName: "first",
      dialogVisible: false,
      tabsList: [
        {
          name: "first",
          label: "入库",
        },
        {
          name: "second",
          label: "出库",
        },
      ],
      total: 0,
      // 是否显示弹出层
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
      },
      list: [],
      // 表单参数
      form: {},
      // 表单校验
    };
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.reset();
        this.resetForm("form");
        this.activeName = "first";
        this.getList();
      }
    },
  },
  mounted() {},
  methods: {
    getList(action) {
      // if (typeof (action) === 'object') {
      //   const { page, limit } = action
      //   this.queryParams.p = page
      //   this.queryParams.l = limit
      // } else {
      //   this.queryParams.action = action
      // }
      material_log(this.form.id, this.queryParams).then((res) => {
        this.list = res.data.list;
        this.total = res.data.total;
      });
    },

    handleClick(tag) {
      let type = tag.name == "first" ? "1" : "2";
      this.reset();
      this.getList(type);
    },
    reset() {
      this.queryParams = {
        p: 1,
        l: 50,
      };
    },
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