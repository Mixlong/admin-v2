<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="类型" prop="type">
        <el-select
          size="small"
          placeholder="请选择类型"
          clearable
          v-model="queryParams.type"
          @change="handleQuery"
        >
          <el-option
            v-for="(item, index) in cableTypeList"
            :key="index"
            :label="item.dictLabel"
            :value="item.dictValue"
          ></el-option>
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
      <el-form-item label="厂家" prop="product">
        <el-select
          v-model="queryParams.product"
          filterable
          clearable
          placeholder="请选择厂家"
          @change="handleQuery"
        >
          <el-option
            v-for="item in productList"
            :key="item.dictLabel"
            :disabled="item.disabled"
            :label="item.dictValue"
            :value="item.dictValue"
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

      <el-row :gutter="10" class="mt5 fr">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            v-if="checkRole(['sale', 'admin'])"
            @click="handleAdd('compUpdate', '新增线缆')"
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
      <el-table-column label="通用常规物料信息" align="center">
        <el-table-column label="类型" prop="type" align="center" width="80" />
        <el-table-column
          label="ERP编码"
          prop="erpCode"
          align="center"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column label="规格" align="center" prop="standards">
          <template slot-scope="scope">
            <div class="text-left" v-html="scope.row.standards"></div>
          </template>
        </el-table-column>
        <el-table-column
          label="厂家"
          prop="product"
          align="center"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column
          label="线缆"
          prop="lineCore"
          align="center"
          width="90"
          show-overflow-tooltip
        />
        <el-table-column
          label="防水头型号"
          prop="headModel"
          align="center"
          width="90"
          show-overflow-tooltip
        />
        <el-table-column
          label="线长MM(不含头)"
          prop="lineLength"
          align="center"
          width="80"
          show-overflow-tooltip
        />
      </el-table-column>
      <el-table-column label="库存数据信息" align="center">
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
      </el-table-column>
      <el-table-column label="其它信息" align="center">
        <el-table-column
          label="对应客户 "
          prop="customerName"
          align="center"
          width="80"
          show-overflow-tooltip
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
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="100"
      >
        <template slot-scope="scope">
          <div class="flex flex-direction">
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
      :cableTypeList="cableTypeList"
      :productList="productList"
    />

    <Return ref="return" :sampleTypeOptions="sampleTypeOptions" />
    <Log ref="log" />
  </div>
</template>

<script>
import { sampleCable_list } from "@/api/third/sample";
import CompUpdate from "./components/Update";

import Return from "./components/DReturn";
import Log from "./components/Log";

export default {
  name: 'LineParameter',
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
      // 台账类型
      partsTypeList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        code: "",
        type: "",
        product: "",
      },
      sampleTypeOptions: [],
      // 线缆类型
      cableTypeList: [],
      // 厂家
      productList: [],
    };
  },

  mounted() {
    // if (this.$route.name == "SampleLedgerOther") {
    //   this.queryParams.type = 0;
    // }

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
    this.getDicts("cableType").then((res) => {
      this.cableTypeList = res.data;
    });
    this.getDicts("productType").then((res) => {
      this.productList = res.data;
    });
  },
  methods: {
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      sampleCable_list(this.queryParams).then((response) => {
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
      this.$refs["compUpdate"].title = "修改线缆";
      if (row) {
        this.$refs["compUpdate"].form = Object.assign({}, row);
        this.$refs["compUpdate"].showName = name;
      }
    },
    cellClassName({ row, column, rowIndex, columnIndex }) {
      let half = row.expectationInventory / 2;
      if (columnIndex == 10) {
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
