<template>
  <!-- 软件数据 -->
  <el-drawer
    ref="elDrawerRef"
    :visible.sync="isDrawer"
    size="80%"
    :withHeader="false"
  >
    <div class="padding">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <!-- <el-form-item label="所属品类" prop="categoryId">
          <el-select
            v-model="queryParams.categoryId"
            filterable
            allow-create
            clearable
            placeholder="请选择品类"
            style="width: 160px"
            @change="changeCategory"
            @focus="getCategoryData"
          >
            <el-option
              v-for="dict in dictList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="仪表型号" prop="computerId">
          <el-select
            v-model="queryParams.computerId"
            :loading="isCLoading"
            filterable
            remote
            clearable
            placeholder="请选择仪表型号"
            :remote-method="getComputerNameList"
            style="width: 160px"
            @change="getList"
          >
            <el-option
              v-for="dict in computerOptions"
              :key="dict.model"
              :label="dict.name"
              :value="dict.model"
            />
          </el-select>
        </el-form-item> -->
        <!-- <el-form-item label="审核状态" prop="status">
          <el-select
            style="width: 140px"
            clearable
            v-model="queryParams.status"
            placeholder="请选择审核状态"
            @change="getList"
          >
            <el-option
              v-for="(value, key) in statusOptions"
              :key="key"
              :label="value"
              :value="key"
            />
          </el-select>
        </el-form-item> -->

        <!-- <el-form-item label="ERP编码" prop="erp">
          <el-input
            v-model="queryParams.erp"
            placeholder="请输入ERP编码"
            clearable
            @keyup.enter.native="getList"
            style="width: 140px"
          />
        </el-form-item> -->

        <el-form-item class="fr">
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">
            搜索
          </el-button>
          <!-- <el-button icon="el-icon-refresh" @click="resetQuery">
            重置
          </el-button> -->
        </el-form-item>
      </el-form>

      <el-table
        id="cad-file-table"
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
        <!-- :selectable="checkSelectable" -->
        <el-table-column label="序号" width="58" type="index" align="center" />
        <el-table-column
          label="品类"
          prop="category"
          align="center"
          width="150"
        />
        <el-table-column
          label="型号"
          prop="computer"
          align="center"
          width="150"
        />
        <el-table-column label="ERP编码" prop="erp" align="center" width="130">
          <span slot-scope="scope" v-NoData="scope.row.erp"></span>
        </el-table-column>
        <el-table-column label="属性" prop="typeName" align="center" />
        <el-table-column label="属性描述" prop="content" align="center">
          <template slot-scope="{ row }">
            <!-- PC上位机 -->
            <template v-if="row.dataType === 1">
              {{ row.content || "- - -" }}
            </template>

            <!-- STS网页 -->
            <span
              v-if="isStsType(row.type) && row.stsContent && row.dataType === 2"
            >
              STS: {{ row.stsContent }}
            </span>

            <!-- STS程序脚本 -->
            <span v-if="row.dataType === 3" class="text-green">
              STS脚本： {{ row.jsContent }}
            </span>
          </template>
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
        <el-table-column label="审核状态" align="center" width="105">
          <template slot-scope="scope">
            <el-tag :type="isCheckType(scope.row)">
              {{ statusOptions[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="创建人"
          align="center"
          prop="createBy"
          width="120"
        >
          <span
            slot-scope="scope"
            v-NoData="scope.row.createBy || scope.row.updateBy"
          ></span>
        </el-table-column>
        <el-table-column label="创建时间" align="center" width="140">
          <span slot-scope="scope" v-NoData="scope.row.updateTime"></span>
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
import {
  listFileConfig,
  categoryComputerDict,
  computerNameList,
  fileConfigSn,
} from "@/api/third/fileConfig";
import { commonStatusList } from "@/utils/commonData";
import { mapGetters, mapState } from "vuex";

export default {
  data() {
    return {
      commonStatusList,
      isCLoading: false,
      isDrawer: false,
      form: {},
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 用户表格数据
      brandList: [],
      // 弹出层标题
      // 是否显示弹出层
      // 日期范围
      dateRange: [],
      dictList: [],
      computerOptions: [],
      fileTypeList: [],
      fileListCover: [],
      createTaskData: {},
      // 查询参数
      queryParams: {
        p: 1,
        l: 100,
        key: undefined,
        status: undefined,
        type: undefined,
        computerId: undefined,
        categoryId: undefined,
        erp: undefined,
      },
      fileType: null,
      selectedFile: "",
      // appFileType: [
      //   {
      //     label: "APP固件(STM32)",
      //     value: "app_file_1",
      //   },
      //   {
      //     label: "APP固件(AT32)",
      //     value: "app_file_2",
      //   },
      //   {
      //     label: "APP固件(N32)",
      //     value: "app_file_3",
      //   },
      //   {
      //     label: "APP固件(GD32)",
      //     value: "app_file_4",
      //   }
      // ],
      bootFileType: [
        "boot_file_1",
        "boot_file_2",
        "boot_file_3",
        "boot_file_4",
      ],
      appFileType: ["app_file_1", "app_file_2", "app_file_3", "app_file_4"],
      uiFileType: ["ui_data_txt"],
      configFileType: ["config_file"],
      // uiFileType: [
      //   {
      //     label: "UI升级文件",
      //     value: "ui_data_txt",
      //   },
      // ],
      // configFileType: [
      //   {
      //     label: "配置文件",
      //     value: "config_file",
      //   },
      // ],
    };
  },
  computed: {
    ...mapState({
      statusOptions: (state) => state.commonData.statusOptions,
    }),
    ...mapGetters("commonData", ["isCheckType"]),
    isComputerStatus() {
      return (status) => {
        return status ? "danger" : "success";
      };
    },
    isStsType() {
      return (type) => {
        const typeList = [
          "iqc_tool",
          "fqc_tool_soft",
          "oqc_tool_soft",
          "config_tools",
          "pack_file",
          "update_file",
          "maintenance_file",
        ];

        return typeList.includes(type);
      };
    },
  },
  methods: {
    // 获取品类数据
    getCategoryData() {
      categoryComputerDict().then((response) => {
        this.dictList = response.data;
      });
    },
    // 型号
    changeCategory(val) {
      if (!val) return;
      this.queryParams.computerId = "";
      this.computerOptions = [];
      this.computerOptions = this.dictList.filter(
        (item) => item.id === val
      )[0].computerList;
    },
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      listFileConfig({
        ...this.queryParams,
        computerStatus: 0,
      })
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

          console.log("this.brandList", this.brandList);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    tableRowClassName({ row }) {
      if (row.computerStatus) {
        return "disabled";
      }
    },
    // checkSelectable(row) {
    //   if (row.computerStatus) {
    //     return false;
    //   } else if (
    //     this.checkRole(["f_test"]) ||
    //     (this.checkRole(["fo_test"]) && row.status === 4)
    //   ) {
    //     return true;
    //   }
    // },
    getRowKeys(row) {
      return row.id;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.fileConfigSnData = {};
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
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
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = false;
        computerNameList({
          name,
          categoryId: this.queryParams.categoryId,
        }).then((res) => {
          this.computerOptions = res.data;
        });
      } else {
        this.computerOptions = [];
      }
    },
  },
};
</script>
<style lang="scss">
#cad-file-table {
  .el-table__header-wrapper .el-checkbox {
    display: none;
  }
}
</style>
  