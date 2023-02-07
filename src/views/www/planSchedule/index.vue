<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属品类" prop="categoryId">
        <el-select
          size="small"
          filterable
          allow-create
          clearable
          v-model="queryParams.categoryId"
          @change="changeCategory"
          placeholder="请选择"
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
          size="small"
          :loading="isCLoading"
          filterable
          remote
          clearable
          v-model="queryParams.computerId"
          placeholder="请选择"
          @change="changeComputer"
          :remote-method="getComputerNameList"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.model"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="生产日期">
        <el-date-picker
          v-model="dateRange"
          style="width: 250px"
          value-format="timestamp"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleQuery"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="生产流程" prop="operation">
        <el-select
          style="width: 150px"
          v-model="queryParams.operation"
          placeholder="请选择产线"
          clearable
          @change="handleQuery"
        >
          <el-option
            v-for="(item, index) in operationList"
            :key="index"
            :label="item.dictLabel"
            :value="item.dictLabel"
          >
          </el-option>
        </el-select>
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
      <el-row :gutter="10" class="fr mt5">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
          >
            新增
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      border
      v-loading="loading"
      :height="tableHeight()"
      :data="list"
      id="printMe"
    >
      <el-table-column label="序号" width="60" type="index" align="center">
        <template slot-scope="scope">
          <span>{{
            (queryParams.p - 1) * queryParams.l + scope.$index + 1
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="产品品类" align="center" prop="categoryName" />
      <el-table-column label="产品型号" align="center" prop="computerName" />
      <el-table-column label="生产地点" align="center" prop="address" />
      <el-table-column label="生产日期" align="center" prop="date">
        <template slot-scope="{ row }">
          {{ parseTime(row.date, "{y}-{m}-{d}") }}
          <br />
          <span class="text-red" v-show="isDisabled(row.date)">（已过期）</span>
        </template>
      </el-table-column>
      <el-table-column label="生产流程" align="center" prop="process" />
      <el-table-column
        label="方案版本"
        align="center"
        prop="schemeVersionName"
      />
      <el-table-column label="数量" align="center" prop="num" />
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="{ row }">
          {{ parseTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120">
        <div class="flex flex-direction" slot-scope="{ row }">
          <el-button
            :disabled="isDisabled(row.date)"
            :class="[isDisabled(row.date) ? 'text-gray' : 'text-blue']"
            type="text"
            @click="handleUpdate(row)"
          >
            编辑
          </el-button>
          <el-button
            class="mlZero text-red"
            type="text"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
          <el-button
            v-show="row.qrCode && row.process === 'SMT'"
            class="mlZero"
            type="text"
            @click="handleQrCode(row)"
          >
            任务令
          </el-button>
        </div>
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
      :title="title"
      :dictList="dictList"
      :modelList="modelList"
      :operationList="operationList"
    />
    <el-dialog
      title="任务令"
      :visible.sync="isQrCode"
      width="350px"
      center
      :close-on-click-modal="false"
    >
      <el-card shadow="hover">
        <div class="flex flex-direction">
          <vue-qr :text="qrCodeObj.qrCode" :size="200"></vue-qr>
          <span class="margin-bottom-xs">
            产品品类：<el-tag>{{ qrCodeObj.categoryName }}</el-tag>
          </span>
          <span>
            产品型号：<el-tag>{{ qrCodeObj.computerName }}</el-tag>
          </span>
        </div>
      </el-card>
    </el-dialog>
  </div>
</template>

<script>
import { schedulingList, schedulingDel } from "@/api/www/planSchedule";
import { typeCategory } from "@/api/third/category";
import { listComputer, computerName } from "@/api/third/computer";
import CompUpdate from "./components/update";
import { computerNameList, categoryComputerDict } from "@/api/third/fileConfig";
import VueQr from "vue-qr";

export default {
  components: { VueQr, CompUpdate },
  data() {
    return {
      listId: "",
      // 遮罩层
      loading: true,
      isCLoading: false,
      isQrCode: false,
      qrCodeObj: {},
      title: "",
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 产品品类
      dictList: [],
      // 型号
      modelList: [],
      computerOptions: [],
      operationList: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        categoryId: "",
        computerId: "",
        startDate: "",
        endDate: "",
        operation: "",
      },
    };
  },
  computed: {
    tagType() {
      return (status) => {
        switch (status) {
          case 0:
            return "info";
          case 1:
            return "primary";
          case 2:
            return "success";
        }
      };
    },
    isDisabled() {
      return (date) => {
        return date < +new Date();
      };
    },
  },
  watch: {
    "queryParams.categoryId"(id) {
      if (id) {
        this.queryParams.computerId = "";
        this.getlistComputer(id);
      }
    },
  },
  created() {
    const { id } = this.$route.query;
    if (id) {
      this.queryParams.salesOrderNo = id;
    }
    const { listId } = this.$route.params;
    if (listId) {
      this.listId = listId;
    }
    this.getList();
    // this.getTypeCategory();
    this.getOperationList();
  },
  mounted() {
    categoryComputerDict().then((response) => {
      this.dictList = response.data;
      let type = this.$route.query.type;
      if (type) {
        this.queryParams.type = type;
      }
      let { categoryId, status } = this.$route.query;

      if (categoryId) {
        this.queryParams.categoryId = categoryId;
        this.changeCategory(categoryId);
        let computerId = this.$route.query.model;
        if (computerId) {
          this.queryParams.computerId = computerId;
        }
      }
      if (status) {
        this.queryParams.status = status;
      }
      this.getList();
    });
  },
  methods: {
    changeCategory(val) {
      if (!val) return;
      this.queryParams.computerId = "";
      this.getList();
      return new Promise((resove) => {
        this.computerOptions = this.dictList.filter(
          (item) => item.id === val
        )[0].computerList;
        resove();
      });
    },
    changeComputer(val) {
      this.getList();
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
    // 获取品类字典
    getTypeCategory() {
      typeCategory().then((res) => {
        this.dictList = res.data;
      });
    },
    // 获取型号字典
    getlistComputer(key) {
      listComputer({ key }).then((res) => {
        const { list } = res.data;
        this.modelList = list;
      });
    },
    // 型号
    getComputer(name) {
      if (name) {
        computerName(name).then((res) => {
          this.modelList = res.data.map((item) => {
            return { name: item.name, id: item.model };
          });
        });
      }
    },
    // 生产流程
    getOperationList() {
      this.getDicts("process").then((response) => {
        this.operationList = response.data;
      });
    },
    getList() {
      this.loading = true;
      schedulingList(
        this.addDateRange(this.queryParams, this.dateRange, {
          begin: "startDate",
          end: "endDate",
        })
      ).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
        if (this.listId) {
          this.list = this.list.filter((item) => item.id === this.listId);
        }
      });
    },
    handleAdd() {
      this.title = "新增计划";
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
    },
    handleUpdate(row) {
      this.title = "编辑计划";
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.form = Object.assign(
        {},
        { ...row, dateRange: [row.startTime, row.endTime] }
      );
      this.$refs.compUpdate.dialogVisible = true;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.listId = this.listId && "";
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.listId = this.listId && "";
      this.dateRange = [];
      this.modelList = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 删除
    handleDelete(row) {
      this.$confirm("确定要删除此项吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return schedulingDel(row.id);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(() => {
          this.msgError("删除失败");
        });
    },
    // 查看任务令
    handleQrCode(row) {
      this.isQrCode = true;
      this.qrCodeObj = row;
    },
  },
};
</script>

<style>
</style>