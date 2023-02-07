<template>
  <!--   -->
  <el-dialog
    :close-on-click-modal="false"
    title="申请列表"
    :visible.sync="dialogVisible"
    append-to-body
    width="80%"
  >
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
      <el-tab-pane
        :label="item.label"
        :name="item.label"
        v-for="(item, index) in tabsList"
        :key="index"
      >
        <CompTable
          :total="total"
          :applyList="applyList"
          :queryParams="queryParams"
          @change="handleAuthChange"
          @delete="handleDelete"
          :state="item.value"
        />
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.p"
          :limit.sync="queryParams.l"
          @pagination="getList"
        />
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
import {
  sampleApplyList,
  sampleApplyState,
  sampleApplyAuth,
} from "@/api/third/sample";
import CompTable from "./table";
export default {
  components: { CompTable },
  data() {
    return {
      dialogVisible: false,
      activeName: "申请中",
      tabsList: [
        { label: "申请中", value: 0 },
        { label: "已拒绝", value: 2 },
      ],

      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,

      applyList: [],

      queryParams: {
        p: 1,
        l: 50,
        state: 0,
      },
    };
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.queryParams.state = 0;
        this.getList();
      }
    },
    form(val) {
      if (val) {
        this.active = val.state;
      }
    },
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      sampleApplyList(this.queryParams).then((res) => {
        let { list, total } = res.data;
        for (let key of list) {
          key.baseModel = key.baseModel.split(",");
        }
        this.applyList = list;
        this.total = total;
        this.loading = false;
        if (this.queryParams.state == 0) {
          this.$emit("applyTotal", total);
        }
      });
    },
    handleClick(e) {
      if (e.name == "申请中") {
        this.queryParams.state = 0;
      } else if (e.name == "已审核") {
        this.queryParams.state = 1;
      } else if (e.name == "已拒绝") {
        this.queryParams.state = 2;
      }
      this.getList();
    },
    handleDelete(data) {
      this.$confirm("此操作将进行删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        sampleApplyAuth(data).then((res) => {
          this.getList();
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        });
      });
    },
    handleAuthChange(params) {
      sampleApplyState(params).then((res) => {
        if (res.code == 200) {
          this.msgSuccess("操作成功！");
          this.getList();
          this.$parent.getList();
        }
      });
    },
  },
};
</script>

<style lang="scss" scope>
.style-reset {
  display: flex;
  flex-flow: column wrap;
  .el-form-item__label {
    white-space: nowrap;
    padding-left: 0;
  }
}
.step-wrap {
  .title-top {
    position: absolute;
    top: -38px;
    left: 0;
    width: 100%;
    height: 38px;
  }
  .wrap-click {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 24px;
    z-index: 10;
    cursor: pointer;
  }

  .el-step__description {
    padding-top: 15px;
  }
}
</style>

