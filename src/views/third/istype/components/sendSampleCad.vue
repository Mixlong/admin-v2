<template>
  <!-- 送样软件数据 -->
  <el-drawer
    ref="elDrawerRef"
    :visible.sync="isDrawer"
    size="80%"
    :withHeader="false"
  >
    <div class="padding">
      <el-form :model="queryParams" ref="queryForm">
        <el-form-item class="fr">
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">
            搜索
          </el-button>
        </el-form-item>
      </el-form>
      <el-table
        id="cad-file-sampleTable"
        ref="elTable"
        v-loading="loading"
        :data="brandList"
        :row-key="getRowKeys"
        :height="tableHeight()"
        :row-class-name="tableRowClassName"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column
          type="selection"
          width="55"
          align="center"
          :reserve-selection="true"
        />
        <el-table-column label="品类" prop="category" align="center" />
        <el-table-column label="送样单号" prop="number" align="center">
          <span slot-scope="{ row }" v-NoData="row.number"></span>
        </el-table-column>
        <el-table-column label="客户" prop="customerName" align="center" />
        <el-table-column label="属性" prop="typeName" align="center" />
        <el-table-column label="属性描述" prop="content" align="center">
          <span slot-scope="{ row }" v-NoData="row.content"></span>
        </el-table-column>
        <el-table-column label="创建人" align="center" prop="updateBy">
          <span slot-scope="{ row }" v-NoData="row.updateBy"></span>
        </el-table-column>
        <el-table-column label="创建时间" align="center" width="140">
          <span slot-scope="{ row }" v-NoData="row.updateTime"></span>
        </el-table-column>
        <el-table-column
          label="产品状态"
          prop="computerStatus"
          align="center"
          width="100"
        >
          <template slot-scope="{ row }">
            <el-tag :type="isComputerStatus(row.computerStatus)">
              {{ row.computerStatus ? "禁用" : "启用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" align="center" width="100">
          <template slot-scope="scope">
            <el-tag :type="isCheckType(scope.row)">
              {{ statusOptions[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-button style="width: 100%" size="mini" @click="handleSubmit">
        确认
      </el-button>

      <pagination
        v-if="total > 0"
        :total="total"
        :ls="[20, 50, 100, 300, 500]"
        :page.sync="queryParams.p"
        :limit.sync="queryParams.l"
        @pagination="getList"
      />
    </div>
  </el-drawer>
</template>

<script>
import { sampleSoftList } from "@/api/third/fileConfig";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      loading: false,
      isDrawer: false,
      fileType: null,
      selectedFile: "",
      total: 0,
      brandList: [],
      ids: [],
      statusOptions: {
        0: "待上传",
        1: "待初审",
        2: "已审核",
        3: "未通过",
        4: "审核通过",
      },
      queryParams: {
        p: 1,
        l: 100,
        categoryName: undefined,
        status: undefined,
        customerName: undefined,
        number: undefined,
      },
      bootFileType: [
        "boot_file_1",
        "boot_file_2",
        "boot_file_3",
        "boot_file_4",
      ],
      appFileType: ["app_file_1", "app_file_2", "app_file_3", "app_file_4"],
      uiFileType: ["ui_data_txt"],
      configFileType: ["config_file"],
    };
  },
  computed: {
    ...mapGetters("commonData", ["isCheckType"]),
    isComputerStatus() {
      return (status) => {
        return status ? "danger" : "success";
      };
    },
  },
  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    getList() {
      this.loading = true;
      sampleSoftList(this.queryParams)
        .then((res) => {
          let { list, total } = res.data;
          let fileTypeData = [];
          list = list.filter((item) => item.status !== 0 && item.status !== 3);

          switch (this.fileType) {
            case 0:
              fileTypeData = this.bootFileType;
              break;
            case 1:
              fileTypeData = this.appFileType;
              break;
            case 2:
              fileTypeData = this.uiFileType;
              break;
            case 3:
              fileTypeData = this.configFileType;
              break;
          }

          list = list.filter((item) => fileTypeData.includes(item.type));

          this.brandList = list;
          this.total = total;

          // 回显
          if (this.selectedFile) {
            this.brandList.forEach((item) => {
              if (item.url === this.selectedFile) {
                this.$refs.elTable.toggleRowSelection(item, true);
              }
            });
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getRowKeys(row) {
      return row.id;
    },
    tableRowClassName({ row }) {
      if (row.computerStatus) {
        return "disabled";
      }
    },
    // 选中数据
    handleSelectionChange(selection) {
      if (selection.length > 1) {
        let del_row = selection.shift();
        this.$refs.elTable.toggleRowSelection(del_row, false); // 用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
      }

      this.ids = selection;
    },
    handleSubmit() {
      if (!this.ids.length) {
        this.msgWarning("至少选择一项");
        return;
      }

      console.log(this.ids);
      this.isDrawer = false;

      this.$emit("handleSendFile", {
        fileUrl: this.ids[0].url,
        fileType: this.fileType,
      });
    },
  },
};
</script>
<style lang="scss">
#cad-file-sampleTable {
  .el-table__header-wrapper .el-checkbox {
    display: none;
  }
}
</style>