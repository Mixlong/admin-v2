<template>
  <div class="app-container">
    <!-- 智能搜索区域 -->
    <IntelligentSearchForm 
      ref="intelligentSearchForm"
      :searchForm="searchForm" 
      :fields="searchFields" 
      @search="handleSearch"
      :defaultVisibleCount="4" 
      @reset="handleReset" 
      @field-change="handleFieldChange"
    >
      <!-- 自定义客户选择器字段 -->
      <template #field-customerId="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <SelectLoadMore 
            v-model="searchForm[field.key]" 
            :data="customerData.data" 
            :page="customerData.page"
            :hasMore="customerData.more" 
            dictLabel="name" 
            dictValue="id" 
            :request="getCustomerData"
            size="mini" 
            placeholder="请选择客户" 
            clearable
            @getChange="handleSearch"
            style="width: 150px;"
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
          v-hasPermi="['crm:customer:address:add']"
        >
          新增收货地址
        </el-button>
      </template>
    </IntelligentSearchForm>

    <!-- 收货地址表格 -->
    <el-table
      v-loading="loading"
      :data="addressList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      row-key="id"
      border
      :height="tableHeight(10)"
      class="crm-address-table"
    >
      <el-table-column
        prop="customerName"
        label="客户名称"
        width="180"
        align="center"
        show-overflow-tooltip
      />

      <el-table-column
        label="收货地址"
        align="left"
        min-width="400"
        show-overflow-tooltip
      >
        <template slot-scope="{ row }">
          <div class="address-info">
            <span v-if="row.contactName || row.contactPhone">
              <span v-if="row.contactName">{{ row.contactName }}</span>
              <span v-if="row.contactName && row.contactPhone"> / </span>
              <span 
                v-if="row.contactPhone" 
                class="cursor-pointer text-blue-600" 
                @click="handleCall(row.contactPhone)"
              >
                {{ row.contactPhone }}
              </span>
              <span v-if="(row.contactName || row.contactPhone) && row.address"> - </span>
            </span>
            <span>{{ row.address || '--' }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="remark"
        label="备注"
        align="center"
        min-width="180"
        show-overflow-tooltip
      />

      <el-table-column
        prop="createTime"
        label="创建时间"
        width="160"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="150"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['crm:customer:address:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['crm:customer:address:delete']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="mt-5 flex justify-end" style="margin-top: 10px;">
      <el-pagination
        :current-page="searchForm.p"
        :page-size="searchForm.l"
        :total="total"
        :page-sizes="[10, 20, 30, 50, 100]"
        size="small"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 收货地址表单弹窗 -->
    <CustomerAddressFormDialog
      :visible.sync="formDialogVisible"
      :mode="dialogMode"
      :customerAddress="currentCustomerAddress"
      @refresh="getList"
    />
  </div>
</template>

<script>
import {
  listCustomerAddress,
  deleteCustomerAddress
} from '@/api/crm/customerAddress'
import { getCustomerList } from '@/api/order'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import SelectLoadMore from '@/components/selectLoadMore'
import CustomerAddressFormDialog from './components/CustomerAddressFormDialog.vue'
import dynamicTableHeightMixin from '@/mixins/dynamicTableHeight'

export default {
  name: 'CustomerAddress',
  components: {
    IntelligentSearchForm,
    SelectLoadMore,
    CustomerAddressFormDialog
  },
  mixins: [dynamicTableHeightMixin],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 收货地址表格数据
      addressList: [],
      // 弹框控制
      formDialogVisible: false,
      dialogMode: 'add', // 'add' | 'edit'
      currentCustomerAddress: null,
      
      // 智能搜索表单
      searchForm: {
        p: 1,
        l: 30,
        customerId: null,
        contactName: null,
        contactPhone: null
      },
      
      // 搜索字段配置
      searchFields: [
        {
          key: 'customerId',
          label: '客户',
          type: 'custom', // 自定义客户选择器
          placeholder: '请选择客户'
        },
        {
          key: 'contactName',
          label: '联系人',
          type: 'text',
          placeholder: '请输入联系人'
        },
        {
          key: 'contactPhone',
          label: '联系方式',
          type: 'text',
          placeholder: '请输入联系方式'
        }
      ],
      
      // 客户数据（用于SelectLoadMore）
      customerData: {
        data: [],
        page: 1,
        more: true
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询收货地址列表 */
    getList() {
      this.loading = true
      const params = { ...this.searchForm }
      listCustomerAddress(params).then(response => {
        this.addressList = response.data.list || []
        this.total = response.data.total || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    /** 获取客户数据（SelectLoadMore，用于搜索表单）*/
    getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getCustomerList({
          p: page,
          l: 20,
          name: keyword,
        }).then((res) => {
          const { list, total } = res.data;
          const filteredList = list.filter((item) => item.status === 0);

          if (more) {
            this.customerData.data = [...this.customerData.data, ...filteredList];
          } else {
            this.customerData.data = filteredList;
          }

          this.customerData.page = page;
          this.customerData.more = this.customerData.data.length < total;
          
          resolve({
            data: this.customerData.data.map(item => ({ id: item.id, name: item.customerName })),
            hasMore: this.customerData.more
          });
        }).catch(() => {
          resolve({
            data: [],
            hasMore: false
          });
        });
      });
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.dialogMode = 'add'
      this.currentCustomerAddress = null
      this.formDialogVisible = true
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.dialogMode = 'edit'
      this.currentCustomerAddress = { ...row }
      this.formDialogVisible = true
    },

    /** 智能搜索 */
    handleSearch() {
      this.searchForm.p = 1
      this.getList()
    },

    /** 重置搜索 */
    handleReset() {
      this.searchForm = {
        p: 1,
        l: 30,
        customerId: null,
        contactName: null,
        contactPhone: null
      }
      this.getList()
    },

    /** 字段变化 */
    handleFieldChange(field, value) {
      this.searchForm[field.key] = value
    },

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.dialogMode = 'add'
      this.currentCustomerAddress = null
      this.formDialogVisible = true
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.dialogMode = 'edit'
      this.currentCustomerAddress = { ...row }
      this.formDialogVisible = true
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id
      this.$confirm('是否确认删除该客户收货地址？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteCustomerAddress(ids)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(() => {})
    },

    /** 拨打电话 */
    handleCall(phone) {
      window.location.href = `tel:${phone}`
    },

    /** 分页大小改变 */
    handleSizeChange(val) {
      this.searchForm.l = val
      this.searchForm.p = 1
      this.getList()
    },

    /** 当前页改变 */
    handleCurrentChange(val) {
      this.searchForm.p = val
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.crm-address-table {
  margin-top: 16px;
  
  .cursor-pointer {
    cursor: pointer;
  }
  
  .text-blue-600 {
    color: #409eff;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

