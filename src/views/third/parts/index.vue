<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          placeholder="请选择品类"
          clearable
          style="max-width: 140px"
          @change="changeCategory"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="型号" prop="computerName">
        <el-select
          v-model="queryParams.computerName"
          clearable
          placeholder="请选择型号"
          @change="getList"
          style="width: 160px"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="整机SN" prop="sn">
        <el-input
          v-model="queryParams.sn"
          placeholder="请输入整机SN"
          clearable
          style="max-width: 130px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="配置名称" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择配置名称"
          clearable
          style="max-width: 140px"
        >
          <el-option
            v-for="dict in partsList"
            :key="dict.dictCode"
            :label="dict.dictValue"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery"> 重置 </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      border
    >
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="品类" prop="categoryName" align="center" />
      <el-table-column label="型号" prop="computerName" align="center" />
      <el-table-column label="PCBA SN" prop="pcbaSn" align="center" />
      <el-table-column label="整机 SN" prop="sn" align="center" />
      <el-table-column label="配件名称" prop="type" align="center" />
      <el-table-column label="批次号" prop="no" align="center" />
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="135"
      />
    </el-table>

    <pagination
      v-if="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />
  </div>
</template>

<script>
import {
  categoryComputerDict,
  partList,
} from "@/api/third/fileConfig";

export default {
  name: "BikeFileConfig",
  data() {
    return {
      ditailShow: false,
      form: {},
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      dictList: [],
      brandList: [],
      partsList: [],
      computerOptions: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        categoryName: "",
        computerName: "",
        sn: "",
        type: ""
      }
    };
  },
  created() {
    const { recordId,sn } = this.$route.query;
    if (recordId) {
      this.queryParams.recordId = recordId;
      this.queryParams.sn = sn;
    }
    this.getDicts('sys_parts_name').then(res => {
      this.partsList = res.data
    })
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
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      partList(this.queryParams).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    changeCategory(categoryName) {
      if(!categoryName) return;
      this.queryParams.computerName = "";
      this.getList();
      this.computerOptions = this.dictList.filter(item => item.name === categoryName)[0].computerList
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.recordId = "";
      this.queryParams.sn = "";
      this.resetForm("queryForm");
      this.handleQuery();
    }
  },
};
</script>