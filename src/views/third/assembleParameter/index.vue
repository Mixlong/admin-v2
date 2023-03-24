<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
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
      <el-form-item label="物料类别" prop="type">
        <el-select
          size="small"
          placeholder="请选择物料类别"
          v-model="queryParams.type"
          @change="handleQuery"
        >
          <el-option
            v-for="(item, index) in materialTypeList"
            :key="index"
            :label="item.dictLabel"
            :value="item.dictValue"
          ></el-option>
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
            @click="handleAdd('compUpdate', '新增组装料')"
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
        label="产品品类"
        prop="categoryName"
        align="center"
        width="90"
      />
      <el-table-column
        label="物料类别"
        prop="materialType"
        align="center"
        width="100"
      />
      <el-table-column
        label="物料信息"
        align="left"
        header-align="center"
        prop="standards"
        width="250"
      >
        <template slot-scope="{ row }">
          <p v-show="row.version">版本：{{ row.version }};</p>
          <p v-show="row.erpCode">ERP编码：{{ row.erpCode }};</p>
          <p v-show="row.bluetooth">蓝牙：{{ row.bluetooth }};</p>
          <p v-show="row.mcu">MCU：{{ row.mcu }};</p>
          <p v-show="row.factory">厂家：{{ row.factory }}</p>
        </template>
      </el-table-column>
      <el-table-column
        label="目标库存"
        align="center"
        prop="expectationInventory"
        width="100"
      />
      <el-table-column
        label="当前库存"
        align="center"
        prop="realInventory"
        width="100"
      />
      <el-table-column
        label="存放位置"
        align="center"
        prop="address"
        width="180"
      />
      <el-table-column label="备注" align="center" prop="remark">
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
            >入库</el-button
          >
          <el-button
            class="mlZero"
            type="text"
            :class="{ 'text-gray': !scope.row.realInventory }"
            v-if="checkRole(['sale', 'admin'])"
            :disabled="!scope.row.realInventory"
            @click="handleAction('2', scope.row)"
            >出库</el-button
          >
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
      :dictList="dictList"
      :materialTypeList="materialTypeList"
    />

    <Return ref="return" :sampleTypeOptions="sampleTypeOptions" />
    <Log ref="log" />
  </div>
</template>

<script>
import { material_list } from "@/api/third/sample";
import { typeCategory } from "@/api/third/category";
import CompUpdate from "./components/Update";

import Return from "./components/DReturn";
import Log from "./components/Log";

export default {
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
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        name: "",
        type: "",
      },

      sampleTypeOptions: [],
      // 物料类别
      materialTypeList: [],
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
    this.getDicts("materialType").then((res) => {
      this.materialTypeList = res.data;
    });
    this.getTypeCategory();
  },
  methods: {
    // 获取品类字典
    getTypeCategory() {
      typeCategory().then((res) => {
        this.dictList = res.data;
      });
    },
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      material_list(this.queryParams).then((response) => {
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
      this.$refs["compUpdate"].title = "修改组装料";
      if (row) {
        this.$refs["compUpdate"].form = Object.assign({}, row);
        this.$refs["compUpdate"].showName = name;
      }
    },
    cellClassName({ row, column, rowIndex, columnIndex }) {
      let half = row.expectationInventory / 2;
      if (columnIndex == 5) {
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
