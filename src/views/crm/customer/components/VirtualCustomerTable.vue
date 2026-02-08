<template>
  <VirtualTable
    ref="virtualTable"
    :data="data"
    :columns="tableColumns"
    :loading="loading"
    :height="height"
    :row-config="{ keyField: rowKey, isHover: true, height: 36 }"
    @filter-change="handleFilterChange"
    @sort-change="handleSortChange"
  >
    <!-- 客户级别 - 自定义插槽 -->
    <template #customerLevel="{ row }">
      <el-tag
        v-if="row.customerLevel"
        :type="getLevelType(row.customerLevel)"
        size="small"
      >
        {{ row.customerLevel }}
      </el-tag>
      <div v-else>--</div>
    </template>

    <!-- 合作状态 - 自定义插槽 -->
    <template #customerStatus="{ row }">
      <el-tag
        v-if="row.customerStatus"
        size="mini"
        :type="getCustomerStatusType(row.customerStatus)"
      >
        {{ row.customerStatus }}
      </el-tag>
    </template>

    <!-- 操作列 - 自定义插槽 -->
    <template #action="{ row }">
      <el-button
        type="text"
        size="small"
        icon="el-icon-view"
        @click="$emit('view', row)"
        v-hasPermi="['crm:customer:query']"
      >
        查看
      </el-button>
      <el-button
        type="text"
        size="small"
        icon="el-icon-edit"
        @click="$emit('edit', row)"
        v-hasPermi="['crm:customer:edit']"
      >
        编辑
      </el-button>
      <el-button
        type="text"
        size="small"
        icon="el-icon-delete"
        style="color: #f56c6c"
        @click="$emit('delete', row)"
        v-hasPermi="['crm:customer:remove']"
      >
        删除
      </el-button>
    </template>
  </VirtualTable>
</template>

<script>
import VirtualTable from "@/components/VirtualTable";

export default {
  name: "VirtualCustomerTable",

  components: {
    VirtualTable,
  },

  props: {
    data: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    height: {
      type: [Number, String],
      default: 400,
    },
    rowKey: {
      type: String,
      default: "id",
    },
    customerAttributeFilters: {
      type: Array,
      default: () => [],
    },
    customerLevelFilters: {
      type: Array,
      default: () => [],
    },
    customerStatusFilters: {
      type: Array,
      default: () => [],
    },
    countryFilters: {
      type: Array,
      default: () => [],
    },
    customerSourceFilters: {
      type: Array,
      default: () => [],
    },
    getDictLabel: {
      type: Function,
      required: true,
    },
    getLevelType: {
      type: Function,
      required: true,
    },
    getCustomerStatusType: {
      type: Function,
      required: true,
    },
  },

  computed: {
    // 表格列配置
    tableColumns() {
      return [
        {
          field: "name",
          title: "客户简称",
          width: 140,
          align: "center",
          fixed: "left",
          useTooltip: true,
        },
        {
          field: "customerAttribute",
          title: "客户属性",
          width: 120,
          align: "center",
          filters: this.customerAttributeFilters,
          filterMultiple: false,
          useTooltip: true,
          formatter: (row) => {
            return (
              this.getDictLabel(
                "customer_attribute_enum",
                row.customerAttribute
              ) ||
              row.customerAttribute ||
              "--"
            );
          },
        },
        {
          field: "country",
          title: "所属国家",
          width: 100,
          align: "center",
          filters: this.countryFilters,
          filterMultiple: false,
          useTooltip: true,
          formatter: (row) => {
            return (
              this.getDictLabel("country_origin", row.country) ||
              row.country ||
              "--"
            );
          },
        },
        {
          field: "electricalSupplier",
          title: "电控供应商",
          width: 120,
          align: "center",
          useTooltip: true,
        },
        {
          field: "instrumentSupplier",
          title: "仪表供应商",
          width: 120,
          align: "center",
          useTooltip: true,
        },
        {
          field: "assemblyFactory",
          title: "组装工厂",
          width: 120,
          align: "center",
          useTooltip: true,
        },
        {
          field: "annualShipments",
          title: "年出货量",
          width: 120,
          align: "center",
          useTooltip: true,
        },
        {
          field: "backgroundCheck",
          title: "背景调查",
          width: 200,
          align: "left",
          headerAlign: "center",
          useTooltip: true,
        },
        {
          field: "address",
          title: "客户网址",
          minWidth: 200,
          align: "left",
          headerAlign: "center",
          useTooltip: true,
        },
        {
          field: "customerLevel",
          title: "客户级别",
          width: 100,
          align: "center",
          filters: this.customerLevelFilters,
          filterMultiple: false,
          slotName: "customerLevel",
        },
        {
          field: "customerStatus",
          title: "合作状态",
          width: 100,
          align: "center",
          filters: this.customerStatusFilters,
          filterMultiple: false,
          slotName: "customerStatus",
        },
        {
          field: "customerSource",
          title: "客户来源",
          width: 100,
          align: "center",
          filters: this.customerSourceFilters,
          filterMultiple: false,
          useTooltip: true,
        },
        {
          field: "productIntent",
          title: "产品意向",
          width: 200,
          align: "center",
          useTooltip: true,
          formatter: (row) => {
            return (
              this.getDictLabel("product_intention", row.productIntent) ||
              row.productIntent ||
              "--"
            );
          },
        },
        {
          field: "salesLeader",
          title: "销售经理",
          width: 120,
          align: "center",
          useTooltip: true,
        },
        {
          title: "操作",
          width: 200,
          align: "center",
          fixed: "right",
          slotName: "action",
        },
      ];
    },
  },

  methods: {
    clearAllFilters() {
      if (this.$refs.virtualTable) {
        this.$refs.virtualTable.clearAllFilters();
      }
    },

    handleFilterChange(params) {
      this.$emit("filter-change", params);
    },

    handleSortChange(params) {
      this.$emit("sort-change", params);
    },
  },
};
</script>
