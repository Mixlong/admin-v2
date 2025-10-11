<template>
  <div class="customer-selector">
    <el-select
      :value="modelValue"
      placeholder="请选择客户"
      size="small"
      filterable
      remote
      reserve-keyword
      :remote-method="remoteSearchCustomer"
      :loading="loading"
      style="width: 100%"
      @change="handleChange"
    >
      <el-option
        v-for="customer in customerOptions"
        :key="customer.id"
        :label="customer.name"
        :value="customer.id"
      >
        <div class="customer-option">
          <div class="customer-info">
            <el-avatar :size="24" icon="el-icon-user-solid" class="mr-2" />
            <div>
              <div class="customer-name">{{ customer.name }}</div>
              <div class="customer-code">{{ customer.code }}</div>
            </div>
          </div>
          <el-tag
            :type="getStatusType(customer.status)"
            size="small"
          >
            {{ getStatusText(customer.status) }}
          </el-tag>
        </div>
      </el-option>
    </el-select>

    <!-- 快速添加客户 -->
    <el-button
      v-if="showAddBtn"
      type="text"
      size="small"
      icon="el-icon-plus"
      @click="handleAddCustomer"
      class="mt-2"
    >
      添加新客户
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'CustomerSelector',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    showAddBtn: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      customerOptions: [],
      loading: false
    }
  },
  mounted() {
    this.getCustomerList()
  },
  methods: {
    async getCustomerList(keyword = '') {
      this.loading = true
      try {
        // 模拟API调用
        const mockData = [
          {
            id: '1',
            name: '帆软简道云',
            code: 'C001',
            status: 'active'
          },
          {
            id: '2',
            name: '某科技公司',
            code: 'C002',
            status: 'potential'
          },
          {
            id: '3',
            name: '创新企业',
            code: 'C003',
            status: 'closed'
          }
        ].filter(item =>
          !keyword ||
          item.name.includes(keyword) ||
          item.code.includes(keyword)
        )

        this.customerOptions = mockData
      } finally {
        this.loading = false
      }
    },

    remoteSearchCustomer(query) {
      if (query) {
        this.getCustomerList(query)
      } else {
        this.getCustomerList()
      }
    },

    handleChange(value) {
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    },

    handleAddCustomer() {
      this.$router.push('/crm/customer/add')
    },

    getStatusType(status) {
      const statusMap = {
        active: 'success',
        potential: 'warning',
        closed: 'info',
        lost: 'danger'
      }
      return statusMap[status] || ''
    },

    getStatusText(status) {
      const statusMap = {
        active: '活跃',
        potential: '潜在',
        closed: '成交',
        lost: '流失'
      }
      return statusMap[status] || status
    }
  }
}
</script>

<style scoped>
.customer-selector {
  width: 100%;
}

.customer-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.customer-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.customer-name {
  font-weight: 500;
  color: #303133;
}

.customer-code {
  font-size: 12px;
  color: #909399;
}
</style>