<template>
  <div class="app-container">
    <!-- 智能搜索区域 -->
    <IntelligentSearchForm 
      :searchForm="searchForm" 
      :fields="searchFields" 
      @search="handleSearch"
      :defaultVisibleCount="3" 
      @reset="handleReset" 
      @field-change="handleFieldChange">

      <!-- 自定义客户名称选择器字段 -->
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
            placeholder="请选择客户" 
            clearable
            @getChange="handleSearch"
            style="width: 100%;"
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
      <el-table
        v-loading="loading"
        :data="filteredCustomers"
        style="width: 100%"
        @sort-change="handleSortChange"
        row-key="id"
        class="crm-customer-table"
        :scroll="{ x: 4000, y: 600 }"
        border
        :height="tableHeight(30)"
        size="small"
      >

        <el-table-column
          prop="name"
          label="客户名称"
          align="center"
          fixed="left"
        >
        </el-table-column>

        <el-table-column prop="no" label="客户编号" width="120" align="center" />

        <el-table-column prop="customerBrand" label="客户品牌" width="120" align="center" />
        <el-table-column prop="customerAttribute" label="客户属性" width="120" align="center">
          <template slot-scope="{ row }">
            {{ getDictLabel('customer_attribute_enum', row.customerAttribute) || row.customerAttribute || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="country" label="所属国家" width="100" align="center">
          <template slot-scope="{ row }">
            {{ getDictLabel('country_origin', row.country) || row.country || '--' }}
          </template>
        </el-table-column>


      

        
 
 

        <el-table-column prop="electricalSupplier" label="现有电控供应商" width="120" align="center" />

        <el-table-column prop="instrumentSupplier" label="现有仪表供应商" width="120" align="center" />

        <el-table-column prop="assemblyFactory" label="组装工厂" width="120" align="center" />

        <el-table-column prop="annualShipments" label="年出货量" width="120" align="center" />
        <el-table-column prop="backgroundCheck" label="背景调查" width="200" show-overflow-tooltip align="center" />
        <el-table-column prop="customerLevel" label="客户级别" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="getLevelType(row.customerLevel)" size="small" v-if="row.customerLevel">
              {{ getDictLabel('customer_type_enum', row.customerLevel) || row.customerLevel }}
            </el-tag>
            <div v-else>
              --
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="customerSource" label="客户来源" width="100" align="center" />


        <el-table-column prop="productIntent" label="产品意向" width="200" show-overflow-tooltip align="center">
          <template slot-scope="{ row }">
            {{ getDictLabel('product_intention', row.productIntent) || row.productIntent }}
          </template>
        </el-table-column>

 
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip align="center" />

        <el-table-column prop="paymentTerm" label="结算期限" width="120" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="getPaymentTermType(row.paymentTerm)" size="small">
              {{ getSettlementPeriodLabel(row.paymentTerm) || '--' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="invoiceTitle" label="发票抬头" width="150" show-overflow-tooltip align="center" />

        <el-table-column prop="invoiceTaxNo" label="税号" width="180" show-overflow-tooltip align="center" />

        <el-table-column prop="taxType" label="发票类型" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="getTaxTypeColor(row.taxType)">
              {{ getDictLabel('tax_type', row.taxType) || row.taxType }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="vatRate" label="税率" width="80" align="center" />

        <el-table-column prop="bankName" label="开户银行" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="getBankColor(row.bankName)">
              {{ getDictLabel('bank_account', row.bankName) || row.bankName }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="bankAccount" label="银行账号" width="180" show-overflow-tooltip align="center" />

        <el-table-column prop="bankPhone" label="开户电话" width="130" align="center" />

        <el-table-column prop="salesLeader" label="销售负责人" width="120" align="center">
          <template slot-scope="{ row }">
            <div class="flex items-center justify-center space-x-1">
              <span>{{ row.salesLeader }}</span>
            </div>
          </template>
        </el-table-column>


        <el-table-column prop="createBy" label="创建人" width="120" align="center">
          <template slot-scope="{ row }">
            <div class="flex items-center justify-center space-x-1">
              <span>{{ row.createBy }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="100" align="center" >
          <template slot-scope="{ row }">
            {{ parseTime(row.createTime,"{y}-{m}-{d}") }}
          </template>
        </el-table-column>


        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template slot-scope="{ row }">
            <el-button
              type="text"
              size="small"
              icon="el-icon-view"
              @click="handleView(row)"
              v-hasPermi="['crm:customer:query']"
            >
              查看
            </el-button>
            <el-button
              type="text"
              size="small"
              icon="el-icon-edit"
              @click="handleEdit(row)"
              v-hasPermi="['crm:customer:edit']"
            >
              编辑
            </el-button>
   
            <el-button
              type="text"
              size="small"
              icon="el-icon-delete"
              style="color: #f56c6c"
              @click="handleDelete(row)"
              v-hasPermi="['crm:customer:remove']"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt10 flex justify-end">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          size="small"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

    <!-- 客户详情弹框 -->
    <CustomerDetailModal
      :visible.sync="detailVisible"
      :customer="currentCustomer"
      @refresh="getCustomerList"
    />

    <!-- 客户新建/编辑弹框 -->
    <CustomerFormModal
      :visible.sync="formVisible"
      :customer="currentCustomer"
      @refresh="getCustomerList"
    />

    <!-- 跟进记录弹框 -->
    <FollowUpModal
      :visible.sync="followUpVisible"
      :customer="currentCustomer"
      @refresh="getCustomerList"
    />
  </div>
</template>

<script>
import CustomerDetailModal from './components/CustomerDetailModal.vue'
import CustomerFormModal from './components/CustomerFormModal.vue'
import FollowUpModal from './components/FollowUpModal.vue'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import { getSoCustomerList, deleteSoCustomer } from '@/api/crm/soCustomer'

export default {
  name: 'CrmCustomer',
  dicts: ['customer_type_enum', 'control_type', 'product_intention', 'settlement_period', 'tax_type', 'bank_account', 'country_origin'],
  components: {
    CustomerDetailModal,
    CustomerFormModal,
    FollowUpModal,
    IntelligentSearchForm
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
        more: true
      },

      // 搜索表单
      searchForm: {
        name: '',
        no: '',
      },

      // 搜索字段配置
      searchFields: [
        { 
          key: 'name', 
          label: '客户名称', 
          component: 'el-select', 
          width: '200px', 
          sort: 1, 
          autoSearch: false,
          props: {
            placeholder: '请选择客户名称',
            clearable: true,
            filterable: true,
            options: []
          }
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
      pageSize: 20,
      total: 0
    }
  },
  computed: {
    // 直接使用从API获取的customers数据
    filteredCustomers() {
      return this.customers
    }
  },

  methods: {
    async getCustomerList() {
      this.loading = true
      try {
        // 调用真实的客户API
        const response = await this.fetchCustomersFromAPI()
        this.customers = response.list || []
        this.total = response.total || 0
      } catch (error) {
        console.error('获取客户列表失败:', error)
        this.$message.error('获取客户列表失败')
        this.customers = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    async fetchCustomersFromAPI() {
      try {
        // 构建API参数
        const params = {
          p: this.currentPage,
          l: this.pageSize
        }

        // 添加搜索参数
        if (this.searchForm.name) {
          params.name = this.searchForm.name
        }
        if (this.searchForm.no) {
          params.no = this.searchForm.no
        }

        console.log('客户搜索参数:', params)

        const response = await getSoCustomerList(params)
        
        console.log('客户API响应数据:', response)
        
        if (response.code === 200 && response.data) {
          const customers = response.data.list || []
          console.log('客户列表数据:', customers)
          if (customers.length > 0) {
            console.log('第一个客户数据结构:', customers[0])
          }
          
          return {
            list: customers,
            total: response.data.total || 0,
            pageNum: response.data.pageNum || 1,
            pageSize: response.data.pageSize || this.pageSize
          }
        }
        
        return { list: [], total: 0 }
      } catch (error) {
        console.error('API调用失败:', error)
        return { list: [], total: 0 }
      }
    },

    handleAdd() {
      this.currentCustomer = null
      this.formVisible = true
    },

    handleEdit(row) {
      console.log('编辑客户数据:', row)
      this.currentCustomer = row
      this.formVisible = true
    },

    handleView(row) {
      this.currentCustomer = row
      this.detailVisible = true
    },


    async handleDelete(row) {
      try {
        await this.$confirm(
          `确定要删除客户"${row.name}"吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        // TODO: 调用删除API
        this.$message.success('删除成功')
        this.getCustomerList()
      } catch {
        // 用户取消删除
      }
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // IntelligentSearchForm 事件处理
    handleSearch(searchForm) {
      console.log('执行搜索:', searchForm)
      this.currentPage = 1
      // 调用服务端搜索
      this.getCustomerList()
    },

    handleReset() {
      console.log('重置搜索表单')
      this.currentPage = 1
      // 搜索表单会自动重置为初始值，重新加载数据
      this.getCustomerList()
    },

    handleFieldChange(fieldKey, value) {
      console.log(`字段 ${fieldKey} 变化为:`, value)
      
      // 对于有autoSearch设置的字段，自动触发搜索
      const field = this.searchFields.find(f => f.key === fieldKey)
      if (field && field.autoSearch) {
        console.log('自动搜索字段变化，触发搜索:', fieldKey, value)
        this.currentPage = 1
        this.getCustomerList()
      }
    },

    handleSortChange({ prop, order }) {
      // TODO: 处理排序
    },

    handleExport() {
      this.$message.info('导出功能开发中')
    },

    handleSizeChange(size) {
      this.pageSize = size
      this.getCustomerList()
    },

    handleCurrentChange(page) {
      this.currentPage = page
      this.getCustomerList()
    },

    // 辅助函数
    // 获取字典标签
    getDictLabel(dictType, value) {
      if (!value || !this.dict || !this.dict.type || !this.dict.type[dictType]) {
        return value
      }
      const dict = this.dict.type[dictType].find(item => item.value === value)
      return dict ? dict.label : value
    },

    getStatusType(customerStatus) {
      const statusMap = {
        '潜在客户': '',
        '意向客户': 'warning',
        '成交客户': 'success',
        '流失客户': 'danger'
      }
      return statusMap[customerStatus] || ''
    },

    getStatusText(customerStatus) {
      const statusMap = {
        '潜在客户': '潜在客户',
        '意向客户': '意向客户',
        '成交客户': '成交客户',
        '流失客户': '流失客户'
      }
      return statusMap[customerStatus] || ''
    },

    getLevelType(level) {
      const typeMap = {
        '重要客户': 'danger',
        'VIP客户': 'warning',
        '普通客户': 'success',
        '潜在客户': 'info'
      }
      return typeMap[level] || ''
    },

    getPaymentTermType(value) {
      const item = this.settlementPeriodItem(value)
      const label = item ? item.label : value
      const typeMap = {
        '月结': 'warning',
        '现金': 'success',
        '季结': 'info',
        '半年结': 'primary',
        '年结': 'success'
      }
      return typeMap[label] || ''
    },

    settlementPeriodItem(value) {
      const list = (this.dict && this.dict.type && this.dict.type.settlement_period) || []
      return list.find(item => String(item.raw?.dictCode) === String(value) || String(item.value) === String(value)) || null
    },

    // 获取结算期限显示文本（与 CustomerDetailModal 保持一致）
    getSettlementPeriodLabel(value) {
      const item = this.settlementPeriodItem(value)
      return item ? (item.label || item.dictLabel) : value
    },

    getTaxTypeColor(type) {
      const typeMap = {
        '纸质专票': 'danger',
        '电子专票': 'info',
        '普通发票': 'success'
      }
      return typeMap[type] || ''
    },

    getBankColor(bankName) {
      const typeMap = {
        '建设银行': 'success',
        '工商银行': 'danger',
        '农业银行': 'info',
        '中国银行': 'warning'
      }
      return typeMap[bankName] || ''
    },

    getFollowUpClass(date) {
      const today = new Date()
      const followUpDate = new Date(date)
      const diffDays = Math.ceil((followUpDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

      if (diffDays < 0) return 'text-red-500' // 已过期
      if (diffDays <= 3) return 'text-orange-500' // 即将到期
      return 'text-green-500' // 正常
    },

    // 获取客户数据（用于搜索选择器）
    getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getSoCustomerList({
          p: page,
          name: keyword,
        }).then((res) => {
          if (res.code === 200 && res.data) {
            const { list, total, pageNum, pageSize } = res.data;
            const filteredList = list || [];

            if (more) {
              this.customerData.data = [...this.customerData.data, ...filteredList];
            } else {
              this.customerData.data = filteredList;
            }

            this.customerData.page = pageNum;
            this.customerData.more = this.customerData.data.length < total;
          }
          resolve();
        }).catch(() => {
          resolve();
        });
      });
    },

    // 初始化字典选项
    initDictOptions() {
      // 客户等级选项
      const customerLevelField = this.searchFields.find(field => field.key === 'customerLevel')
      if (customerLevelField && this.dict && this.dict.type && this.dict.type.customer_type_enum) {
        customerLevelField.props.options = this.dict.type.customer_type_enum.map(dict => ({
          label: dict.label,
          value: dict.value
        }))
      }
    }
  },

  mounted() {
    this.getCustomerList()
    // 初始化字典选项
    this.$nextTick(() => {
      this.initDictOptions()
    })
  }
}
</script>

<style scoped>
.crm-customer-table :deep(.el-table__row) {
  cursor: pointer;
}

.crm-customer-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}
</style>
