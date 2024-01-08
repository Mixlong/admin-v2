<!--
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2024-01-02 09:50:18
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2024-01-05 18:41:59
 * @FilePath: \FILECONF-UI\src\views\www\prodData\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="app-container">
    <transition name="fade-transform-tb">
      <el-form ref="queryForm" :model="queryParams" :inline="true">
        <el-form-item label="客户" prop="customerName">
          <el-autocomplete
            v-model="queryParams.customerName"
            clearable
            :fetch-suggestions="querySearchAsync"
            placeholder="请选择客户"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="所属品类" prop="categoryId">
          <el-select
            v-model="queryParams.categoryId"
            @change="changeCategory"
            filterable
            allow-create
            clearable
            placeholder="请选择品类"
            style="width: 150px"
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
            :loading="isCLoading"
            filterable
            remote
            clearable
            v-model="queryParams.computerId"
            placeholder="请选择仪表型号"
            :remote-method="getComputerNameList"
            style="width: 150px"
          >
            <el-option
              v-for="dict in computerOptions"
              :key="dict.model"
              :label="dict.name"
              :value="dict.model"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生产阶段" prop="process">
          <el-select
            v-model="queryParams.process"
            placeholder="请选择生产阶段"
            style="width: 120px"
            clearable
          >
            <el-option label="SMT" value="SMT"></el-option>
            <el-option label="组装" value="组装"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划日期">
          <el-date-picker
            v-model="dateRange"
            style="width: 250px"
            value-format="timestamp"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="handleQuery"
          >
            搜 索
          </el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
            重 置
          </el-button>
        </el-form-item>
      </el-form>
    </transition>

    <el-table
      v-loading="loading"
      :data="tableData"
      :height="isTestTabHeight"
      :header-cell-class-name="getHeaderCellClassName"
      :cell-class-name="getCellClassName"
      @cell-click="onCellClick"
    >
      <!-- <el-table-column
        label="每日生产计划资料审核"
        label-class-name="font20"
        align="center"
      > -->
      <el-table-column prop="date" label="计划日期" align="center" width="90">
        <template slot-scope="{ row }">
          {{ parseTime(row.date, "{y}-{m}-{d}") }}
        </template>
      </el-table-column>
      <el-table-column
        prop="customerName"
        label="客户"
        align="center"
        width="120"
      />
      <el-table-column
        prop="categoryName"
        label="品类"
        align="center"
        width="140"
      />
      <el-table-column
        prop="computerName"
        label="型号"
        align="center"
        width="140"
      />
      <el-table-column
        prop="process"
        label="生产阶段"
        align="center"
        width="90"
      />
      <el-table-column label="SMT资料" align="center">
        <!-- <el-table-column
            prop="pcbaStatus"
            label="PCBA资料"
            align="center"
            width="90"
          >
            <template slot-scope="{ row }">
              <ColumnState :state="row.pcbaStatus" />
            </template>
          </el-table-column> -->
        <el-table-column
          prop="pucsStatus"
          label="PUCS资料"
          align="center"
          width="90"
        >
          <template slot-scope="{ row }">
            <ColumnState :state="row.pucsStatus" />
          </template>
        </el-table-column>
        <el-table-column
          prop="hardStatus"
          label="硬件资料"
          align="center"
          width="90"
        >
          <template slot-scope="{ row }">
            <ColumnState :state="row.hardStatus" />
          </template>
        </el-table-column>
        <el-table-column
          prop="softStatus"
          label="软件资料"
          align="center"
          width="90"
        >
          <template slot-scope="{ row }">
            <ColumnState :state="row.softStatus" />
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="组装资料" align="center">
        <el-table-column
          prop="configStatus"
          label="配置文件"
          align="center"
          width="90"
        >
          <template slot-scope="{ row }">
            <ColumnState :state="row.configStatus" />
          </template>
        </el-table-column>
        <el-table-column
          prop="testStatus"
          label="测试上位机"
          align="center"
          width="90"
        >
          <template slot-scope="{ row }">
            <ColumnState :state="row.testStatus" />
          </template>
        </el-table-column>
        <!-- <el-table-column
            prop="stsStatus"
            label="STS系统"
            align="center"
            width="90"
          >
            <template slot-scope="{ row }">
              <ColumnState :state="row.stsStatus" />
            </template>
          </el-table-column> -->
        <el-table-column
          prop="snStatus"
          label="SN规则"
          align="center"
          width="90"
        >
          <template slot-scope="{ row }">
            <ColumnState :state="row.snStatus" />
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        prop="prodStage"
        label="期望日期"
        align="center"
        width="120"
      >
        <template slot-scope="{ row }">
          <span>{{ parseTime(row.hopeDate, "{y}/{m}/{d} {h}:{i}") }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" align="center">
        <template slot-scope="{ row }">
          <div v-html="row.remark"></div>
        </template>
      </el-table-column>
      <!-- </el-table-column> -->
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <el-dialog
      :title="isTitle"
      :width="isDiaWidth"
      :visible.sync="isShow"
      center
    >
      <el-form ref="form" :model="form" :rules="rules">
        <el-form-item prop="hopeDate" v-if="isType === 1">
          <el-date-picker
            style="width: 100%"
            v-model="form.hopeDate"
            type="datetime"
            placeholder="选择日期时间"
            value-format="timestamp"
            :default-time="defaultTime"
            :picker-options="pickerOptions"
            clearable
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="remark" v-if="isType === 2">
          <tinymce v-if="isShow" v-model="form.remark" :height="350"> </tinymce>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="handleCancel">取 消</el-button>
        <el-button
          size="small"
          type="primary"
          @click="handleOk"
          :loading="confirmLoading"
        >
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { categoryComputerDict } from "@/api/third/fileConfig";
import { listCustomer } from "@/api/third/sample";
import { materialList, materialUpdate } from "@/api/third/prodData";
import tinymce from "@/views/components/Editor";

export default {
  components: {
    tinymce,
    ColumnState: () => import("./columnState"),
  },
  data() {
    return {
      dateRange: [],
      isShow: false,
      loading: false,
      isCLoading: false,
      confirmLoading: false,
      isType: 0,
      isTitle: "",
      tableData: [],
      total: 0,
      dictList: [],
      computerOptions: [],
      materialData: {},
      form: {
        hopeDate: "",
        remark: "",
      },
      defaultTime: this.moment().format("HH:mm:ss"),
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 24 * 3650 * 1000;
        },
      },
      rules: {
        hopeDate: [
          { required: true, message: "期望日期不能为空", trigger: "change" },
        ],
        remark: [
          { required: true, message: "备注不能为空", trigger: "change" },
        ],
      },
      queryParams: {
        p: 1,
        l: 20,
        customerName: "",
        categoryId: "",
        computerId: "",
        process: "",
      },
    };
  },
  computed: {
    isDiaWidth() {
      return this.isType === 1 ? "350px" : "650px";
    },
    isTestTabHeight() {
      return "calc(100vh - 250px)";
    },
  },
  watch: {
    isShow(bool) {
      if (!bool) {
        this.reset();
      }
    },
    "form.remark"(remark) {
      if (remark !== "") {
        this.clearValidateItem("form", "remark");
      }
    },
  },
  created() {
    this.getCategoryComputerDicts();
    this.getList();
  },
  methods: {
    querySearchAsync(queryString, cb) {
      listCustomer({ key: queryString || "" }).then((res) => {
        cb(
          res.data.map((item) => {
            return {
              value: item.name,
            };
          })
        );
      });
    },
    getCategoryComputerDicts() {
      categoryComputerDict().then((res) => {
        this.dictList = res.data;
      });
    },
    changeCategory(categoryId) {
      this.queryParams.computerId = "";
      if (categoryId) {
        this.computerOptions = this.dictList.filter(
          (item) => item.id === categoryId
        )[0].computerList;
      }
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
    getList() {
      this.loading = true;
      materialList(
        this.addDateRange(this.queryParams, this.dateRange, {
          begin: "startTime",
          end: "endTime",
        })
      )
        .then((res) => {
          const { list, total } = res.data;
          this.tableData = list;
          this.total = total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getHeaderCellClassName({ column }) {
      // switch (column.label) {
      //   case "SMT资料":
      //     return "bg-header-lightBlue";
      //   case "组装资料":
      //     return "bg-header-deepBlue";
      // }
    },
    getCellClassName({ row, column }) {
      const {
        PCBAState,
        pucsStatus,
        hardStatus,
        softStatus,
        configStatus,
        testStatus,
        stsState,
        snStatus,
      } = row;
      const { label } = column;
      switch (label) {
        // case "PCBA资料":
        //   return this.getDataState(PCBAState);
        case "PUCS资料":
          return this.getDataState(pucsStatus);
        case "硬件资料":
          return this.getDataState(hardStatus);
        case "软件资料":
          return this.getDataState(softStatus);
        case "配置文件":
          return this.getDataState(configStatus);
        case "测试上位机":
          return this.getDataState(testStatus);
        // case "STS系统":
        //   return this.getDataState(stsState);
        case "SN规则":
          return this.getDataState(snStatus);
        case "期望日期":
        //   if (isSure === 0) {
        //     return "bg-yellow pointer";
        //   }
        //   break;
        case "备注":
          return "pointer";
      }
    },
    getDataState(state) {
      switch (state) {
        case 0:
          return "bg-danger pointer";
        case 1:
          return "bg-warning pointer";
        case 4:
          return "bg-primary pointer";
        case 2:
          return "bg-success";
      }
    },
    onCellClick(row, column, cell, event) {
      switch (column.label) {
        // case "PCBA资料":
        //   this.onCellStateClick(row);
        //   break;
        case "PUCS资料":
          this.onCellStateClick(row, row.pucsStatus);
          break;
        case "硬件资料":
          this.onCellStateClick(row, row.hardStatus);
          break;
        case "软件资料":
          this.onCellStateClick(row, row.softStatus);
          break;
        case "配置文件":
          this.onCellStateClick(row, row.configStatus);
          break;
        case "测试上位机":
          this.onCellStateClick(row, row.testStatus);
          break;
          // case "STS系统":
          //   this.onCellStateClick(row);
          break;
        case "SN规则":
          this.onCellStateClick(row, row.snStatus);
          break;
        case "期望日期":
          this.onShowDia(row, 1);
          break;
        case "备注":
          this.onShowDia(row, 2);
          break;
      }
    },
    onCellStateClick({ categoryId, computerId }, status) {
      // /device/productData/fileConfig
      if (status !== 2) {
        this.$router.push(
          `/productData/fileConfig?categoryId=${categoryId}&computerId=${computerId}&status=${status}`
        );
      }
    },
    onShowDia(row, type) {
      this.isTitle = type === 1 ? "期望日期" : "备注";
      this.isType = type;
      this.isShow = true;
      this.form = Object.assign({}, row);
    },
    reset() {
      this.form = {
        hopeDate: "",
        remark: "",
      };
      this.resetForm("form");
    },
    handleCancel() {
      this.isShow = false;
    },
    handleOk() {
      this.$refs["form"].validate(async (valid) => {
        if (valid) {
          this.confirmLoading = true;

          if (this.form.schedulingId) {
            try {
              materialUpdate(this.form)
                .then(() => {
                  this.getList();
                  this.msgSuccess("操作成功");
                })
                .finally(() => {
                  this.isShow = false;
                  this.confirmLoading = false;
                });

              await materialUpdate(this.form);
              
            } catch (error) {
              console.error(error);
            }
          }
        }
      });
    },
  },
};
</script>

<style lang="scss">
.bg-success {
  background-color: #c6efce !important;
}
.bg-primary {
  background-color: #00b0f0 !important;
}
.bg-warning {
  background-color: #ffc000 !important;
}
.bg-danger {
  background-color: #f00 !important;
}
.bg-yellow {
  background-color: yellow !important;
}
.bg-header-lightBlue {
  background-color: #92cddc !important;
}
.bg-header-deepBlue {
  background-color: #00b0f0 !important;
}
.font-black {
  color: #000;
}
.font-correct {
  color: #007b74;
}
</style>
