<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="品类" prop="categoryName">
        <el-select v-model="queryParams.categoryName" placeholder="请选择品类" clearable style="max-width: 140px"
          @change="changeCategory">
          <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="型号" prop="computerName">
        <el-select v-model="queryParams.computerName" clearable placeholder="请选择型号" @change="getList"
          style="width: 160px">
          <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="整机SN" prop="sn">
        <el-input v-model="queryParams.sn" placeholder="请输入整机SN" clearable style="max-width: 130px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="工单号" prop="orderCode">
        <el-input v-model="queryParams.orderCode" placeholder="请选择工单号" clearable style="max-width: 130px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery"> 重置 </el-button>
        <el-button type="success" icon="el-icon-download" @click="handleExport">
          导出
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="brandList" :height="tableHeight()" border>
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="品类" prop="categoryName" align="center" />
      <el-table-column label="型号" prop="computerName" align="center" />
      <el-table-column label="工单号" prop="orderCode" align="center" />
      <el-table-column label="工单类型" prop="typeName" align="center" />
      <el-table-column label="整机 SN" prop="sn" align="center" />
      <el-table-column label="批次号" prop="batchNumber" align="center" />
      <el-table-column label="创建时间" prop="createTime" align="center" width="135" />
    </el-table>

    <pagination v-if="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />
  </div>
</template>

<script>
import { categoryComputerDict, partList, partExport } from "@/api/third/fileConfig";

export default {
  name: "Parts",
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
      allComputerOptions: [], // 存储所有型号选项
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        categoryName: "",
        computerName: "",
        sn: "",
        orderCode: "",
        batchNumber: "",
        type: "",
      },
    };
  },
  watch: {
    queryParams: {
      handler(newVal) {
        if (newVal) {
          this.getList();
        }
      },
      deep: true,
      immediate: true
    },
  },
  created() {
    this.getDicts("sys_parts_name").then((res) => {
      this.partsList = res.data;
    });
  },
  activated() {
    const { recordId, sn } = this.$route.query;
    this.queryParams.recordId = recordId;
    this.queryParams.sn = sn;
  },
  mounted() {
    this.loadCategoryAndComputerOptions();

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
    // 加载品类和型号选项
    async loadCategoryAndComputerOptions() {
      try {
        const response = await categoryComputerDict();

        if (response.code === 200) {
          const rawData = response.data;

          if (Array.isArray(rawData) && rawData.length > 0) {
            this.dictList = rawData;

            // 提取所有型号选项
            const allComputers = [];
            rawData.forEach(category => {
              if (category.computerList && Array.isArray(category.computerList)) {
                category.computerList.forEach(computer => {
                  allComputers.push({
                    ...computer,
                    categoryName: category.name
                  });
                });
              }
            });
            this.allComputerOptions = allComputers;
            this.computerOptions = allComputers;
          } else {
            this.dictList = [];
            this.computerOptions = [];
            this.allComputerOptions = [];
          }
        } else {
          this.dictList = [];
          this.computerOptions = [];
          this.allComputerOptions = [];
        }
      } catch (error) {
        this.dictList = [];
        this.computerOptions = [];
        this.allComputerOptions = [];
      }
    },

    changeCategory(categoryName) {
      if (!categoryName) {
        this.computerOptions = this.allComputerOptions || [];
        this.queryParams.computerName = "";
        this.getList();
        return;
      }

      this.queryParams.computerName = "";
      this.getList();

      // 根据品类过滤型号
      const selectedCategory = this.dictList.find(item => item.name === categoryName);
      if (selectedCategory && selectedCategory.computerList) {
        this.computerOptions = selectedCategory.computerList;
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
      this.queryParams.recordId = "";
      this.queryParams.sn = "";
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$modal.confirm('是否确认导出所有配件记录数据项?').then(() => {
        this.loading = true;
        return partExport(this.queryParams);
      }).then(response => {
        if (response.code === 200 && response.msg) {
          this.download(response.msg);
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    }
  },
};
</script>