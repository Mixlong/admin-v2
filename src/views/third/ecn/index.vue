<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="ECN编号" prop="ecn">
        <el-input
          size="small"
          v-model="queryParams.ecn"
          placeholder="请输入ECN编号"
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>

      <el-form-item label="项目名称" prop="projectName">
        <el-input
          size="small"
          v-model="queryParams.projectName"
          placeholder="请输入项目名称"
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item label="产品代号" prop="productCode">
        <el-input
          size="small"
          v-model="queryParams.productCode"
          placeholder="请输入产品代号"
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
      <el-row :gutter="20" class="fr mt5 flex align-center">
        <el-col :span="1.5">
          <el-button
            v-if="checkPermi(['ecn:add', '*:*:*'])"
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            >新增</el-button
          >
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      border
      @cell-click="cellClick"
      :cell-style="cellStyle"
    >
      <el-table-column label="序号" type="index" width="50" align="center">
        <template slot-scope="scope">
          <span>{{
            (queryParams.p - 1) * queryParams.l + scope.$index + 1
          }}</span>
        </template>
      </el-table-column>

      <el-table-column label="ECN编号" prop="ecn" align="center" width="120" />

      <el-table-column
        label="项目名称"
        prop="projectName"
        align="center"
        width="100"
      />

      <el-table-column
        label="产品代号"
        prop="productCode"
        align="center"
        width="100"
      />
      <el-table-column
        label="变更前BOM版本"
        prop="beforeVersion"
        align="center"
      />

      <el-table-column label="变更原因" prop="changeCauseNote" align="center" />
      <el-table-column label="变更内容" prop="changeContent" align="center" />
      <el-table-column label="变更结果" prop="afterVersion" align="center" />
      <el-table-column
        label="创建人"
        prop="createBy"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.updateBy">{{ scope.row.updateBy }}</span>
          <span v-else>{{ scope.row.createBy }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="导出时间"
        prop="importTime"
        align="center"
        width="120"
      />

      <el-table-column
        label="操作"
        align="center"
        width="120"
        fixed="right"
        class-name="small-padding fixed-width  "
      >
        <template slot-scope="scope">
          <div style="padding-left: 8px" class="text-left">
            <Tooltip
              v-if="checkPermi(['ecn:update', '*:*:*'])"
              icon="el-icon-edit"
              content="编辑"
              @click="handleUpdate(scope.row)"
            />

            <el-tooltip
              class="item"
              effect="dark"
              content="详情"
              placement="top-end"
            >
              <el-button
                icon="el-icon-view"
                type="text"
                class="text-green"
                @click="handleDetail(scope.row, 3)"
              ></el-button>
            </el-tooltip>
            <Tooltip
              :className="['text-orange']"
              icon="el-icon-folder"
              content="导出"
              @click="handleExport(scope.row)"
            />
            <Tooltip
              v-if="checkPermi(['ecn:delete', '*:*:*'])"
              icon="el-icon-delete"
              :class="['text-red']"
              content="删除"
              @click="handleDelete(scope.row)"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />
    <CompUpdate
      ref="compUpdate"
      :classifyList="classifyList"
      :involveUnitList="involveUnitList"
    />
    <CompDetail
      ref="compDetail"
      :classifyList="classifyList"
      :involveUnitList="involveUnitList"
    />
  </div>
</template>

<script>
import { bomList, bomAuth } from "@/api/third/ecn";
import CompUpdate from "./components/update";
import CompDetail from "./components/detail";
import { mapGetters } from "vuex";
export default {
  components: {
    CompUpdate,
    CompDetail,
  },

  filters: {},
  data() {
    return {
      open: false,
      // 遮罩层
      loading: true,
      authDialogVisible: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      brandList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
      },
      detailData: {},
      classifyList: [],
      involveUnitList: [],
    };
  },
  computed: {
    ...mapGetters(["userId"]),
  },
  async mounted() {
    await this.getDicts("ecn_classify_name").then((res) => {
      this.classifyList = res.data;
    });
    await this.getDicts("ecn_involveUnit").then((res) => {
      this.involveUnitList = res.data;
    });
    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      let params = Object.assign({}, this.queryParams);
      bomList(params).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },

    handleAdd() {
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.showName = "";
      this.$refs.compUpdate.title = "添加ECN";
    },
 

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },

    handleUpdate(row, showName, title) {
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
      let params = Object.assign({}, row);
      params.changeCause = params.changeCause.split(",");
      params.involveUnit = params.involveUnit.split(",");
      this.$refs.compUpdate.form = params;
      this.$refs.compUpdate.showName = showName;
      this.$refs.compUpdate.title = title == undefined ? "修改ECN" : title;
    },
    cellClick(row, column, cell, event) {
      switch (column.label) {
        case "实现方案":
          if (row.principal == this.userId || this.checkRole(["admin"]))
            this.handleUpdate(row, "scheme", "实现方案");
          break;
        case "导入计划":
          if (row.principal == this.userId || this.checkRole(["admin"]))
            this.handleUpdate(row, "plan", "");
          break;
        default:
          break;
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (
        (column.label == "实现方案" || column.label == "导入计划") &&
        (row.principal == this.userId || this.checkRole(["admin"]))
      ) {
        return `cursor: pointer;`;
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm("是否确认删除?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return bomAuth([{ id: row.id, status: 1 }]);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },

    handleExport(row) {
      let parmas = Object.assign({}, row);
      parmas = this.handleforData(parmas);
      import("./js/export").then((excel) => {
        excel.export_json_to_excel({
          header: [], //表头 必填
          data: parmas, //具体数据 必填
          filename: row.projectName, //非必填
          autoWidth: true, //非必填
          bookType: "xlsx", //非必填
        });
      });
    },
    handleforData(parmas) {
      let classifyName = "";
      let involveName = "";
      let involveUnit = parmas.involveUnit.split(",");
      let changeCause = parmas.changeCause.split(",");
      //分类
      for (let key of this.classifyList) {
        let findVal = changeCause.findIndex((item) => item == key.dictValue);

        classifyName +=
          (findVal > -1 ? "■" : "□") + key.dictLabel + "         ";
      }
      //涉及领域
      for (let key of this.involveUnitList) {
        let findVal = involveUnit.findIndex((item) => item == key.dictValue);
        involveName +=
          (findVal > -1 ? "■" : "□") + key.dictLabel + "                 ";
      }

      parmas.involveUnit = involveName;
      parmas.changeCause = classifyName;
      return parmas;
    },
    handleDetail(row) {
      this.$refs.compDetail.reset();
      this.$refs.compDetail.dialogVisible = true;
      let params = Object.assign({}, row);
      params.changeCause = params.changeCause.split(",");
      params.involveUnit = params.involveUnit.split(",");
      this.$refs.compDetail.form = params;
      this.$refs.compDetail.showName = showName;
      this.$refs.compDetail.title = title == undefined ? "" : title;
    },
  },
};
</script>
<style lang="scss"  scope >
.auth {
  text-align: center;
  margin-bottom: 10px;
}
.finish-row td,
.finish-row:hover td {
  background-color: rgba(155, 216, 148, 0.3) !important;
}
.mask-layer {
  position: relative;
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
}
.open-detail-style {
  div {
    > span {
      &:first-child {
        color: #666;
        margin-right: 10px;
      }
    }
  }
}
</style>
