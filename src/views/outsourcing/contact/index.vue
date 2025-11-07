<template>
  <div class="company-contact-container  ">
    <!-- 搜索区域 -->
    <IntelligentSearchForm
      ref="searchForm"
      :searchForm="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
      :defaultVisibleCount="4"
      @filters-cleared="handleReset"
    >
      <!-- 公司名称自定义字段 -->
      <template #field-companyName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select
            v-model="searchForm[field.key]"
            placeholder="请选择公司名称"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="(item, index) in productAddressList"
              :key="index"
              :label="item.dictLabel"
              :value="item.dictLabel"
            />
          </el-select>
        </el-form-item>
      </template>

      <!-- 生产产品自定义字段 -->
      <template #field-productType="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select
            v-model="searchForm[field.key]"
            placeholder="请选择生产产品"
            clearable
            style="width: 200px"
          >
            <el-option label="PCB板" value="PCB板" />
            <el-option label="贴片厂" value="贴片厂" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 联系人类型自定义字段 -->
      <template #field-contactType="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select
            v-model="searchForm[field.key]"
            placeholder="请选择联系人类型"
            clearable
            style="width: 200px"
          >
            <el-option label="主送" :value="1" />
            <el-option label="抄送" :value="2" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 页面操作按钮 -->
      <template #page-actions>
        <el-button 
          type="primary" 
          icon="el-icon-plus" 
          size="mini" 
          @click="handleAdd"
          v-hasPermi="['company:contact:add']"
        >
          新增
        </el-button>
      </template>
    </IntelligentSearchForm>

    <!-- 表格区域 -->
    <el-table
      :data="tableData"
      v-loading="loading"
      border
      style="width: 100%"
      row-key="id"
      :height="tableHeight"
    >
      <!-- 公司名称 -->
      <el-table-column 
        prop="companyName" 
        label="公司名称" 
        align="center" 
        width="200"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.companyName || '--' }}</span>
        </template>
      </el-table-column>

      <!-- 邮箱 -->
      <el-table-column 
        prop="email" 
        label="邮箱" 
        align="center" 
        width="200"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.email || '--' }}</span>
        </template>
      </el-table-column>

      <!-- 联系人 -->
      <el-table-column 
        prop="contactPerson" 
        label="联系人" 
        align="center" 
        width="120"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.contactPerson || '--' }}</span>
        </template>
      </el-table-column>

      <!-- 联系人类型 -->
      <el-table-column 
        prop="contactType" 
        label="联系人类型" 
        align="center" 
        width="120"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.contactType == 1" size="small" type="primary">
            主送
          </el-tag>
          <el-tag v-else-if="scope.row.contactType == 2" size="small" type="info">
            抄送
          </el-tag>
          <span v-else>--</span>
        </template>
      </el-table-column>

      <!-- 生产产品 -->
      <el-table-column 
        prop="productType" 
        label="生产产品" 
        align="center" 
        width="150"
      >
        <template slot-scope="scope">
          <el-tag size="small" type="success">
            {{ scope.row.productType || '--' }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 备注 -->
      <el-table-column 
        prop="remark" 
        label="备注" 
        align="center" 
        min-width="200"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.remark || '--' }}</span>
        </template>
      </el-table-column>

      <!-- 创建人 -->
      <el-table-column 
        prop="createBy" 
        label="创建人" 
        align="center" 
        width="100"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.createBy || '--' }}</span>
        </template>
      </el-table-column>

      <!-- 创建时间 -->
      <el-table-column 
        prop="createTime" 
        label="创建时间" 
        align="center" 
        width="160"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') || '--' }}</span>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column 
        label="操作" 
        align="center" 
        width="180"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['company:contact:update']"
          >
            编辑
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            class="text-red"
            @click="handleDelete(scope.row)"
            v-hasPermi="['company:contact:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-section">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
      top='0'
      append-to-body
    >
      <el-form
        ref="companyForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="公司名称" prop="companyName">
          <el-select
            v-model="formData.companyName"
            placeholder="请选择公司名称"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option
              v-for="(item, index) in productAddressList"
              :key="index"
              :label="item.dictLabel"
              :value="item.dictLabel"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="联系人" prop="contactPerson">
          <el-input
            v-model="formData.contactPerson"
            placeholder="请输入联系人"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="联系人类型" prop="contactType">
          <el-select
            v-model="formData.contactType"
            placeholder="请选择联系人类型"
            style="width: 100%"
            clearable
          >
            <el-option label="主送" :value="1" />
            <el-option label="抄送" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="生产产品" prop="productType">
          <el-select
            v-model="formData.productType"
            placeholder="请选择生产产品"
            style="width: 100%"
            clearable
          >
            <el-option label="PCB板" value="PCB板" />
            <el-option label="贴片厂" value="贴片厂" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getCompanyContactList, 
  addCompanyContact, 
  updateCompanyContact, 
  deleteCompanyContact 
} from '@/api/company/contact'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
export default {
  name: 'CompanyContact',
  components: {
    IntelligentSearchForm
  },
  props: {
    // 是否为嵌入模式（在对话框中显示）
    embedded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        companyName: '',
        email: '',
        contactPerson: '',
        contactType: undefined,
        productType: ''
      },
      // 搜索字段配置
      searchFields: [
        {
          key: 'companyName',
          label: '公司名称',
          component: 'custom',
          sort: 1
        },
        {
          key: 'email',
          label: '邮箱',
          component: 'el-input',
          props: {
            placeholder: '请输入邮箱',
            clearable: true
          },
          sort: 2
        },
        {
          key: 'contactPerson',
          label: '联系人',
          component: 'el-input',
          props: {
            placeholder: '请输入联系人',
            clearable: true
          },
          sort: 3
        },
        {
          key: 'contactType',
          label: '联系人类型',
          component: 'custom',
          sort: 4
        },
        {
          key: 'productType',
          label: '生产产品',
          component: 'custom',
          sort: 5
        }
      ],
      // 表格数据
      tableData: [],
      loading: false,
      // 分页
      pagination: {
        current: 1,
        size: 20,
        total: 0
      },
      // 对话框
      dialogVisible: false,
      dialogTitle: '新增公司联系信息',
      isEdit: false,
      submitLoading: false,
      // 表单数据
      formData: {
        id: null,
        companyName: '',
        email: '',
        contactPerson: '',
        contactType: undefined,
        productType: '',
        remark: ''
      },
      // 表单验证规则
      // 生产地点列表（字典数据）
      productAddressList: [],
      formRules: {
        companyName: [
          { required: true, message: '请选择公司名称', trigger: 'change' }
        ],
        email: [
          { 
            pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
            message: '请输入有效的邮箱地址', 
            trigger: 'blur' 
          },
          { max: 100, message: '邮箱不能超过100个字符', trigger: 'blur' }
        ],
        contactPerson: [
          { max: 50, message: '联系人不能超过50个字符', trigger: 'blur' }
        ],
        contactType: [
          { required: true, message: '请选择联系人类型', trigger: 'change' }
        ],
        productType: [
          { max: 100, message: '生产产品不能超过100个字符', trigger: 'blur' }
        ],
        remark: [
          { max: 500, message: '备注不能超过500个字符', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.getProductAddress()
    this.fetchData()
  },
  methods: {
    /** 获取生产地点字典数据 */
    getProductAddress() {
      this.getDicts('product_address').then((response) => {
        this.productAddressList = response.data || []
      })
    },

    /** 获取列表数据 */
    fetchData() {
      this.loading = true
      const params = {
        p: this.pagination.current,
        l: this.pagination.size,
        ...this.searchForm
      }
      
      getCompanyContactList(params).then(response => {
        if (response.code === 200 && response.data) {
          this.tableData = response.data.list || []
          this.pagination.total = response.data.total || 0
        } else {
          this.tableData = []
          this.pagination.total = 0
        }
      }).finally(() => {
        this.loading = false
      })
    },

    /** 搜索 */
    handleSearch() {
      this.pagination.current = 1
      this.fetchData()
    },

    /** 重置 */
    handleReset() {
      this.searchForm = {
        companyName: '',
        email: '',
        contactPerson: '',
        productType: ''
      }
      this.pagination.current = 1
      this.fetchData()
    },

    /** 新增 */
    handleAdd() {
      this.isEdit = false
      this.dialogTitle = '新增公司联系信息'
      this.resetForm()
      this.dialogVisible = true
    },

    /** 编辑 */
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑公司联系信息'
      this.formData = {
        id: row.id,
        companyName: row.companyName,
        email: row.email,
        contactPerson: row.contactPerson,
        contactType: row.contactType,
        productType: row.productType,
        remark: row.remark
      }
      this.dialogVisible = true
    },

    /** 删除 */
    handleDelete(row) {
      this.$confirm(`确定要删除公司"${row.companyName}"的联系信息吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCompanyContact([row.id]).then(response => {
          if (response.code === 200) {
            this.$message.success('删除成功')
            this.fetchData()
          }
        })
      }).catch(() => {
        // 用户取消删除
      })
    },

    /** 提交表单 */
    handleSubmit() {
      this.$refs.companyForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          const apiMethod = this.isEdit ? updateCompanyContact : addCompanyContact
          
          apiMethod(this.formData).then(response => {
            if (response.code === 200) {
              this.$message.success(this.isEdit ? '修改成功' : '新增成功')
              this.dialogVisible = false
              this.fetchData()
            }
          }).finally(() => {
            this.submitLoading = false
          })
        }
      })
    },

    /** 对话框关闭 */
    handleDialogClose() {
      this.resetForm()
    },

    /** 重置表单 */
    resetForm() {
      this.formData = {
        id: null,
        companyName: '',
        email: '',
        contactPerson: '',
        contactType: undefined,
        productType: '',
        remark: ''
      }
      this.$nextTick(() => {
        if (this.$refs.companyForm) {
          this.$refs.companyForm.clearValidate()
        }
      })
    },

    /** 分页大小改变 */
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.current = 1
      this.fetchData()
    },

    /** 当前页改变 */
    handleCurrentChange(val) {
      this.pagination.current = val
      this.fetchData()
    },

    /** 计算表格高度 */
    tableHeight(offset = 0) {
      return window.innerHeight - 300 - offset
    }
  },
  computed: {
    /** 计算表格高度 */
    tableHeight() {
      if (this.embedded) {
        // 嵌入模式：使用固定高度，支持滚动
        return '480px'
      } else {
        // 独立页面模式：使用视口高度计算
        return window.innerHeight - 300
      }
    }
  }
}
</script>

<style scoped>
.company-contact-container {
  padding: 20px;
}

.pagination-section {
  margin-top: 20px;
  text-align: right;
}

.text-red {
  color: #f56c6c;
}

.dialog-footer {
  text-align: right;
}
</style>
