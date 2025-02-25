<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="类型" prop="typeName">
        <el-select
          size="small"
          placeholder="请选择类型"
          clearable
          v-model="queryParams.typeName"
          @change="handleQuery"
        >
          <el-option
            v-for="(item, index) in sampleTypeList"
            :key="index"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="产品品类" prop="name">
        <el-select
          v-model="queryParams.name"
          placeholder="请选择产品品类"
          clearable
          filterable
          @change="getList"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="产品型号" prop="computerName">
        <el-select
          v-model="queryParams.computerName"
          placeholder="请选择产品型号"
          clearable
          filterable
          @change="getList"
        >
          <el-option
            v-for="dict in modelList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="ERP编码" prop="code">
        <el-input
          size="small"
          placeholder="请输入ERP编码"
          clearable
          v-model.trim="queryParams.code"
          @change="handleQuery"
        >
        </el-input>
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

      <el-row :gutter="10" class="mt5 fr">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            v-if="checkRole(['sale', 'admin'])"
            @click="handleAdd('compUpdate', '新增样品')"
            >新增</el-button
          >
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      :height="tableHeight()"
      border
      :cell-class-name="cellClassName"
      @cell-click="cellClick"
      :cell-style="cellStyle"
    >
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          <span>{{
            (queryParams.p - 1) * queryParams.l + scope.$index + 1
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="类型"
        prop="type"
        align="center"
        width="60"
        show-overflow-tooltip
      />
      <el-table-column
        label="产品品类"
        prop="name"
        align="center"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        label="产品型号"
        prop="computerName"
        align="center"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column label="ERP编码" prop="code" align="center" width="120" show-overflow-tooltip />
      <el-table-column
        label="配置信息"
        prop="code"
        align="left"
        header-align="center"
        width="200"
      >
        <template slot-scope="{ row }">
          <p v-show="row.bluetooth">蓝牙：{{ row.bluetooth }}</p>
          <p v-show="row.hardVersion">硬件版本：{{ row.hardVersion }}</p>
          <p v-show="row.mcu">主芯片：{{ row.mcu }}</p>
          <p v-show="row.controllerHead">
            控制器接头：{{ row.controllerHead }}
          </p>
          <p v-show="row.controllerLine">
            控制器出线线长(不含头)：{{ row.controllerLine }}
          </p>
          <p v-show="row.keyCode">按键型号：{{ row.keyCode }}</p>
          <p v-show="row.keyLine">按键线长：{{ row.keyLine }}</p>
        </template>
      </el-table-column>
      <el-table-column
        label="生产时间"
        prop="productionTime"
        align="center"
        width="140"
      />
      <el-table-column
        label="生产来源"
        prop="productionSource"
        align="center"
        width="90"
      />
      <el-table-column
        label="对应客户"
        prop="customerName"
        align="center"
        width="80"
      />
      <el-table-column
        label="目标库存"
        align="center"
        prop="expectationInventory"
        width="80"
      />
      <el-table-column
        label="当前库存"
        align="center"
        prop="realInventory"
        width="80"
      />
      <el-table-column
        label="存放位置"
        align="center"
        prop="address"
        width="80"
      />
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
        min-width="200"
      >
        <template slot-scope="scope">
          <div class="text-left" v-html="scope.row.remark"></div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="100"
      >
        <div class="flex flex-direction" slot-scope="scope">
          <el-button
            type="text"
            v-if="checkRole(['sale', 'admin'])"
            @click="handleUpdate(scope.row)"
            >编辑</el-button
          >
          <el-button
            class="mlZero"
            type="text"
            v-if="checkRole(['sale', 'admin'])"
            @click="handleAction('1', scope.row)"
            >入库
          </el-button>
          <el-button
            class="mlZero"
            type="text"
            :class="{ 'text-gray': !scope.row.realInventory }"
            v-if="checkRole(['sale', 'admin'])"
            :disabled="!scope.row.realInventory"
            @click="handleAction('2', scope.row)"
            >出库
          </el-button>
          <el-button class="mlZero" type="text" @click="handleLog(scope.row)"
            >日志</el-button
          >
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
      :sampleTypeList="sampleTypeList"
      :dictList="dictList"
      :modelList="modelList"
    />

    <Return ref="return" :sampleTypeOptions="sampleTypeOptions" />
    <Log ref="log" />
  </div>
</template>

<script>
import { specification_list } from "@/api/third/sample";
import { typeCategory } from "@/api/third/category";
import { listModelDict } from "@/api/third/computer";
import CompUpdate from "./components/Update";
import Return from "./components/DReturn";
import Log from "./components/Log";

export default {
  name: 'SampleLedgerOther',
  components: {
    Log,
    Return,
    CompUpdate,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      list: [],
      // 弹出层标题
      title: "",
      // 产品品类
      dictList: [],
      // 型号
      modelList: [],
      // 台账类型
      partsTypeList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        typeName: "",
        name: "",
        computerName: "",
        code: "",
      },
      sampleTypeOptions: [],
      // 样品类型
      sampleTypeList: ["定制", "通用"],
    };
  },

  mounted() {
    // if (this.$route.name == "SampleLedgerOther") {
    //   this.queryParams.type = 0;
    // }
    this.getTypeCategory();
    this.getListModelDict();
    this.getDicts("sample_type").then((response) => {
      if (response.code === 200) {
        if (this.$route.name == "SampleLedger") {
          response.data = response.data.slice(0, 2);
        } else {
          response.data = response.data.slice(2);
        }

        this.sampleTypeOptions = response.data;
      }
      this.getList();
    });
  },
  methods: {
    // 获取品类字典
    getTypeCategory() {
      typeCategory().then((res) => {
        this.dictList = res.data;
      });
    },
    // 获取型号字典
    getListModelDict() {
      listModelDict().then((res) => {
        this.modelList = res.data;
      });
    },
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      specification_list(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    handleAction(type, row) {
      row.action = type;
      let params = Object.assign({}, row);
      this.handleAdd("return", "", params);
    },
    cellClick(row, column, cell, event) {
      switch (column.label) {
        case "备注":
          this.handleUpdate(row, "remark");
          break;
        default:
          break;
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (column.label == "备注") {
        return `cursor: pointer;`;
      } else {
        return ``;
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

    handleAdd(form, title, row) {
      this.$refs[form].dialogVisible = true;
      this.$refs[form].title = title;
      this.$refs[form].form = {};

      if (row) {
        this.$refs[form].form.id = row.id;

        if (row.action) {
          delete this.$refs[form].form.id;
          this.$refs[form].form.action = row.action;
          this.$refs[form].form.sampleSpecificationId = row.id;
        }
      }
      if (form == "compUpdate") {
        this.$refs[form].showName = "";
      }
    },
    handleUpdate(row, name) {
      this.$refs["compUpdate"].dialogVisible = true;
      this.$refs["compUpdate"].title = "修改样品";
      if (row) {
        this.$refs["compUpdate"].form = Object.assign({}, row);
        this.$refs["compUpdate"].showName = name;
      }
    },
    cellClassName({ row, column, rowIndex, columnIndex }) {
      let half = row.expectationInventory / 2;
      if (columnIndex == 16) {
        if (row.expectationInventory <= row.realInventory) {
          return "bg-green";
        } else if (half <= row.realInventory) {
          return "bg-yellow";
        } else {
          return "bg-red";
        }
      }
    },
    // typeName(row) {
    //   let { sampleTypeOptions } = this;
    //   let idx = sampleTypeOptions.findIndex(
    //     (item) => item.dictLabel == row.type
    //   );
    //   if (idx > -1) {
    //     return sampleTypeOptions[idx].dictValue;
    //   }
    //   return "";
    // },
    handleLog(row) {
      let params = Object.assign({}, row);
      this.handleAdd("log", "", params);
    },
  },
};
</script>
<style scoped></style>
