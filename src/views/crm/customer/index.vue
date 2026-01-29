<template>
  <div class="app-container">
    <!-- 智能搜索区域 -->
    <IntelligentSearchForm
      :searchForm="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      :defaultVisibleCount="3"
      @reset="handleReset"
      @field-change="handleFieldChange"
    >
      <!-- 自定义客户简称选择器字段 -->
      <template #field-name="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <SelectLoadMore
            v-model="searchForm[field.key]"
            :data="customerData.data"
            :page="customerData.page"
            :hasMore="customerData.more"
            dictLabel="name"
            dictValue="name"
            :request="getCustomerData"
            size="mini"
            placeholder="请选择"
            clearable
            @getChange="handleSearch"
            style="width: 100%"
          />
        </el-form-item>
      </template>

      <!-- 自定义国家选择器字段 -->
      <template #field-country="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <SelectLoadMore
            v-model="searchForm[field.key]"
            :data="countryData.data"
            :page="countryData.page"
            :hasMore="countryData.more"
            dictLabel="name"
            dictValue="value"
            :request="getCountryData"
            size="mini"
            placeholder="请选择32国家"
            clearable
            @getChange="handleSearch"
            style="width: 100%"
          />
        </el-form-item>
      </template>
      <!-- 页面操作按钮 -->
      <template #page-actions>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="handleAdd"
          v-hasPermi="['crm:customer:add']"
        >
          新建客户
        </el-button>
      </template>
    </IntelligentSearchForm>
    <!-- 客户表格 -->
    <VirtualCustomerTable
      ref="customerTable"
      :data="filteredCustomers"
      :loading="loading"
      :height="tableHeight(60)"
      :customerAttributeFilters="customerAttributeFilters"
      :customerLevelFilters="customerLevelFilters"
      :customerStatusFilters="customerStatusFilters"
      :countryFilters="countryFilters"
      :customerSourceFilters="customerSourceFilters"
      :getDictLabel="getDictLabel"
      :getLevelType="getLevelType"
      :getCustomerStatusType="getCustomerStatusType"
      @sort-change="handleSortChange"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- 分页 -->
    <div
      class="mt10 flex items-center justify-end space-x-2 text-sm text-gray-600 customer-table-footer"
    >
      <span class="mr-2">共 {{ total }} 条</span>
      <span class="mr-2">每次加载</span>
      <el-select
        v-model="pageSize"
        size="mini"
        style="width: 100px"
        class="mx-1"
        @change="handleSizeChange"
      >
        <el-option
          v-for="size in pageSizeOptions"
          :key="size"
          :label="size"
          :value="size"
        />
      </el-select>
      <span class="ml-2">条</span>
    </div>

    <!-- 客户详情弹框 -->
    <CustomerDetailModal
      :visible.sync="detailVisible"
      :customer="currentCustomer || {}"
      @refresh="getCustomerList"
    />

    <!-- 客户新建/编辑弹框 -->
    <CustomerFormModal
      :visible.sync="formVisible"
      :customer="currentCustomer || {}"
      @refresh="getCustomerList"
    />

    <!-- 跟进记录弹框 -->
    <FollowUpModal
      :visible.sync="followUpVisible"
      :customer="currentCustomer || {}"
      @refresh="getCustomerList"
    />
  </div>
</template>

<script>
import CustomerDetailModal from "./components/CustomerDetailModal.vue";
import CustomerFormModal from "./components/CustomerFormModal.vue";
import FollowUpModal from "./components/FollowUpModal.vue";
import VirtualCustomerTable from "./components/VirtualCustomerTable.vue";
import IntelligentSearchForm from "@/components/IntelligentSearchForm";
import SelectLoadMore from "@/components/selectLoadMore";
import { getSoCustomerList, deleteSoCustomer } from "@/api/crm/soCustomer";

export default {
  name: "CrmCustomer",
  dicts: [
    "customer_type_enum",
    "customer_attribute_enum",
    "customer_source",
    "control_type",
    "product_intention",
    "settlement_period",
    "tax_type",
    "bank_account",
    "country_origin",
  ],
  components: {
    CustomerDetailModal,
    CustomerFormModal,
    FollowUpModal,
    VirtualCustomerTable,
    IntelligentSearchForm,
    SelectLoadMore,
  },
  data() {
    return {
      // 响应式数据
      loading: false,
      customers: [],
      selectedRows: [],

      // 客户数据（用于搜索选择器）
      customerData: {
        data: [],
        page: 1,
        more: true,
      },

      // 国家数据（用于搜索选择器）
      countryData: {
        data: [],
        page: 1,
        more: true,
      },

      // 搜索表单
      searchForm: {
        name: "",
        no: "",
        country: "",
      },

      // 搜索字段配置
      searchFields: [
        {
          key: "name",
          label: "客户简称",
          component: "el-select",
          width: "200px",
          sort: 1,
          autoSearch: false,
          props: {
            placeholder: "请选择客户简称",
            clearable: true,
            filterable: true,
            options: [],
          },
        },
        {
          key: "country",
          label: "所属国家",
          component: "custom",
          width: "150px",
          sort: 2,
          autoSearch: false,
        },
      ],

      // 弹框控制
      detailVisible: false,
      formVisible: false,
      followUpVisible: false,
      importVisible: false,
      currentCustomer: null,

      // 分页
      currentPage: 1,
      pageSize: 10000,
      pageSizeOptions: [1000, 3000, 5000, 10000],
      total: 0,
    };
  },
  computed: {
    // 直接使用从API获取的customers数据
    filteredCustomers() {
      return this.customers;
    },

    // 客户属性筛选选项（使用中文标签作为筛选值）
    customerAttributeFilters() {
      if (
        !this.dict ||
        !this.dict.type ||
        !this.dict.type.customer_attribute_enum
      ) {
        return [];
      }
      return this.dict.type.customer_attribute_enum.map((item) => ({
        label: item.label,
        value: item.label, // 使用 label（中文）作为筛选值
      }));
    },

    // 客户级别筛选选项（使用字典value作为筛选值，因为数据库存储的是value）
    customerLevelFilters() {
      if (!this.dict || !this.dict.type || !this.dict.type.customer_type_enum) {
        return [];
      }
      return this.dict.type.customer_type_enum.map((item) => ({
        label: item.label, // 显示中文标签
        value: item.value, // 使用 value（如 "2"）作为筛选值，匹配数据库存储
      }));
    },

    // 合作状态筛选选项（固定的几个选项）
    customerStatusFilters() {
      return [
        { label: "潜在客户", value: "潜在客户" },
        { label: "意向客户", value: "意向客户" },
        { label: "送样客户", value: "送样客户" },
        { label: "成交客户", value: "成交客户" },
        { label: "流失客户", value: "流失客户" },
      ];
    },

    // 所属国家筛选选项（使用中文标签作为筛选值）
    countryFilters() {
      if (!this.dict || !this.dict.type || !this.dict.type.country_origin) {
        return [];
      }
      return this.dict.type.country_origin.map((item) => ({
        label: item.label,
        value: item.label, // 使用 label（中文）作为筛选值
      }));
    },

    // 客户来源筛选选项（使用中文标签作为筛选值）
    customerSourceFilters() {
      if (!this.dict || !this.dict.type || !this.dict.type.customer_source) {
        return [];
      }
      return this.dict.type.customer_source.map((item) => ({
        label: item.label,
        value: item.label, // 使用 label（中文）作为筛选值
      }));
    },
  },

  methods: {
    async getCustomerList() {
      this.loading = true;
      try {
        // 调用真实的客户API
        const response = await this.fetchCustomersFromAPI();
        this.customers = response.list || [];
        this.total = response.total || 0;
      } catch (error) {
        console.error("获取客户列表失败:", error);
        // 全局 API 拦截器已处理错误消息，无需重复提示
        this.customers = [];
        this.total = 0;
      } finally {
        this.loading = false;
      }
    },

    async fetchCustomersFromAPI() {
      try {
        // 构建API参数
        const params = {
          p: this.currentPage,
          l: this.pageSize,
        };

        // 添加搜索参数
        if (this.searchForm.name) {
          params.name = this.searchForm.name;
        }
        if (this.searchForm.no) {
          params.no = this.searchForm.no;
        }
        if (this.searchForm.country) {
          params.country = this.searchForm.country;
        }

        console.log("客户搜索参数:", params);

        const response = await getSoCustomerList(params);

        console.log("客户API响应数据:", response);

        if (response.code === 200 && response.data) {
          const customers = response.data.list || [];
          console.log("客户列表数据:", customers);
          if (customers.length > 0) {
            console.log("第一个客户数据结构:", customers[0]);
          }

          return {
            list: customers,
            total: response.data.total || 0,
            pageNum: response.data.pageNum || 1,
            pageSize: response.data.pageSize || this.pageSize,
          };
        }

        return { list: [], total: 0 };
      } catch (error) {
        console.error("API调用失败:", error);
        return { list: [], total: 0 };
      }
    },

    handleAdd() {
      this.currentCustomer = null;
      this.formVisible = true;
    },

    handleEdit(row) {
      console.log("编辑客户数据:", row);
      this.currentCustomer = row;
      this.formVisible = true;
    },

    handleView(row) {
      this.currentCustomer = row;
      this.detailVisible = true;
    },

    async handleDelete(row) {
      try {
        await this.$confirm(`确定要删除客户"${row.name}"吗？`, "确认删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });

        // 调用删除API
        const response = await deleteSoCustomer(row.id);
        if (response.code === 200) {
          this.$message.success("删除成功");
          this.getCustomerList();
        } else {
          this.$message.error(response.msg || "删除失败");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除客户失败:", error);
          this.$message.error("删除失败，请稍后重试");
        }
      }
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    // IntelligentSearchForm 事件处理
    handleSearch(searchForm) {
      console.log("执行搜索:", searchForm);
      this.currentPage = 1;
      // 调用服务端搜索
      this.getCustomerList();
    },

    handleReset() {
      console.log("重置搜索表单");
      this.currentPage = 1;
      if (this.$refs.customerTable) {
        this.$refs.customerTable.clearAllFilters();
      }
      // 搜索表单会自动重置为初始值，重新加载数据
      this.getCustomerList();
    },

    handleFieldChange(fieldKey, value) {
      console.log(`字段 ${fieldKey} 变化为:`, value);

      // 对于有autoSearch设置的字段，自动触发搜索
      const field = this.searchFields.find((f) => f.key === fieldKey);
      if (field && field.autoSearch) {
        console.log("自动搜索字段变化，触发搜索:", fieldKey, value);
        this.currentPage = 1;
        this.getCustomerList();
      }
    },

    handleSortChange(params = {}) {
      void params;
      // TODO: 处理排序
    },

    handleExport() {
      this.$message.info("导出功能开发中");
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.getCustomerList();
    },

    handleCurrentChange(page) {
      this.currentPage = page;
      this.getCustomerList();
    },

    // 辅助函数
    // 获取字典标签
    getDictLabel(dictType, value) {
      if (
        !value ||
        !this.dict ||
        !this.dict.type ||
        !this.dict.type[dictType]
      ) {
        return value;
      }
      const dict = this.dict.type[dictType].find(
        (item) => item.value === value
      );
      return dict ? dict.label : value;
    },

    getStatusType(customerStatus) {
      const statusMap = {
        潜在客户: "",
        意向客户: "warning",
        成交客户: "success",
        流失客户: "danger",
      };
      return statusMap[customerStatus] || "";
    },

    // 获取合作状态颜色类型
    getCustomerStatusType(customerStatus) {
      const statusMap = {
        潜在客户: "info", // 灰色 - 表示未开发
        意向客户: "warning", // 橙色 - 表示有意向
        送样客户: "primary", // 蓝色 - 表示已送样
        成交客户: "success", // 绿色 - 表示成功
        流失客户: "danger", // 红色 - 表示失败
      };
      // 如果找不到匹配的状态，返回默认颜色 'info'（灰色）
      // 这样即使新增了状态但忘记配置颜色，也会有默认显示
      return statusMap[customerStatus] || "info";
    },

    getStatusText(customerStatus) {
      const statusMap = {
        潜在客户: "潜在客户",
        意向客户: "意向客户",
        成交客户: "成交客户",
        流失客户: "流失客户",
      };
      return statusMap[customerStatus] || "";
    },

    getLevelType(level) {
      const typeMap = {
        重要客户: "danger",
        VIP客户: "warning",
        普通客户: "success",
        潜在客户: "info",
      };
      return typeMap[level] || "";
    },

    getPaymentTermType(value) {
      const item = this.settlementPeriodItem(value);
      const label = item ? item.label : value;
      const typeMap = {
        月结: "warning",
        现金: "success",
        季结: "info",
        半年结: "primary",
        年结: "success",
      };
      return typeMap[label] || "";
    },

    settlementPeriodItem(value) {
      const list =
        (this.dict && this.dict.type && this.dict.type.settlement_period) || [];
      return (
        list.find(
          (item) =>
            String(item.raw?.dictCode) === String(value) ||
            String(item.value) === String(value)
        ) || null
      );
    },

    // 获取结算期限显示文本（与 CustomerDetailModal 保持一致）
    getSettlementPeriodLabel(value) {
      const item = this.settlementPeriodItem(value);
      return item ? item.label || item.dictLabel : value;
    },

    getTaxTypeColor(type) {
      const typeMap = {
        纸质专票: "danger",
        电子专票: "info",
        普通发票: "success",
      };
      return typeMap[type] || "";
    },

    getBankColor(bankName) {
      const typeMap = {
        建设银行: "success",
        工商银行: "danger",
        农业银行: "info",
        中国银行: "warning",
      };
      return typeMap[bankName] || "";
    },

    getFollowUpClass(date) {
      const today = new Date();
      const followUpDate = new Date(date);
      const diffDays = Math.ceil(
        (followUpDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
      );

      if (diffDays < 0) return "text-red-500"; // 已过期
      if (diffDays <= 3) return "text-orange-500"; // 即将到期
      return "text-green-500"; // 正常
    },

    // 获取客户数据（用于搜索选择器）
    getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getSoCustomerList({
          p: page,
          name: keyword,
        })
          .then((res) => {
            if (res.code === 200 && res.data) {
              const { list, total, pageNum, pageSize } = res.data;
              const filteredList = list || [];

              if (more) {
                this.customerData.data = [
                  ...this.customerData.data,
                  ...filteredList,
                ];
              } else {
                this.customerData.data = filteredList;
              }

              this.customerData.page = pageNum;
              this.customerData.more = this.customerData.data.length < total;
            }
            resolve();
          })
          .catch(() => {
            resolve();
          });
      });
    },

    // 获取国家字典数据（用于搜索选择器）
    getCountryData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        // 从字典数据中获取国家列表
        if (!this.dict || !this.dict.type || !this.dict.type.country_origin) {
          resolve();
          return;
        }

        let countryList = this.dict.type.country_origin || [];

        // 如果有搜索关键词，进行筛选
        if (keyword && keyword.trim()) {
          const keywordLower = keyword.toLowerCase();
          countryList = countryList.filter((item) => {
            const label = (item.label || item.dictLabel || "").toLowerCase();
            const value = (item.value || item.dictValue || "").toLowerCase();
            return label.includes(keywordLower) || value.includes(keywordLower);
          });
        }

        // 分页处理（每页20条）
        const pageSize = 20;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedList = countryList.slice(startIndex, endIndex);

        // 转换为 SelectLoadMore 需要的格式
        const formattedList = paginatedList.map((item) => ({
          id: item.value || item.dictValue,
          value: item.value || item.dictValue,
          name: item.label || item.dictLabel,
        }));

        if (more) {
          this.countryData.data = [...this.countryData.data, ...formattedList];
        } else {
          this.countryData.data = formattedList;
        }

        this.countryData.page = page;
        this.countryData.more = endIndex < countryList.length;

        resolve();
      });
    },

    // 初始化字典选项
    initDictOptions() {
      // 客户等级选项
      const customerLevelField = this.searchFields.find(
        (field) => field.key === "customerLevel"
      );
      if (
        customerLevelField &&
        this.dict &&
        this.dict.type &&
        this.dict.type.customer_type_enum
      ) {
        customerLevelField.props.options =
          this.dict.type.customer_type_enum.map((dict) => ({
            label: dict.label,
            value: dict.value,
          }));
      }
    },

    // 表格筛选方法
    filterCustomerAttribute(value, row) {
      // 直接比较中文值
      return row.customerAttribute === value;
    },

    filterCustomerLevel(value, row) {
      // 直接比较中文值
      return row.customerLevel === value;
    },

    filterCustomerStatus(value, row) {
      return row.customerStatus === value;
    },

    filterCountry(value, row) {
      // 直接比较中文值
      return row.country === value;
    },

    filterCustomerSource(value, row) {
      // 直接比较中文值
      return row.customerSource === value;
    },
  },

  mounted() {
    this.getCustomerList();
    // 初始化字典选项
    this.$nextTick(() => {
      this.initDictOptions();
    });
  },
};
</script>

<style scoped>
.crm-customer-table :deep(.vxe-body--row) {
  cursor: pointer;
}

.crm-customer-table :deep(.vxe-body--row:hover) {
  background-color: #f5f7fa;
}

.customer-table-footer {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  min-height: 32px;
  line-height: 1;
  span {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }
}
</style>
