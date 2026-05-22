<template>
  <div class="customer-requirement-container app-container flex-app-container"> 
    <!-- 搜索区域 -->
    <div class="search-toolbar">

      <el-form :model="searchForm" ref="searchForm" inline class="search-form">
        <el-form-item label="客户名称" prop="customer">
          <select-loadMore
            v-model="searchForm.customer"
            style="width: 150px"
            :data="customerData.data"
            :page="customerData.page"
            :hasMore="customerData.more"
            dictLabel="name"
            dictValue="name"
            :request="getCustomerData"
            placeholder="请选择客户名称"
            size="mini"
            @change="handleSearch">
          </select-loadMore>
        </el-form-item>
        
        <el-form-item label="品类" prop="category">
          <select-loadMore
            v-model="searchForm.category"
            style="width: 150px"
            :data="categoryData.data"
            :page="categoryData.page"
            :hasMore="categoryData.more"
            dictLabel="name"
            dictValue="id"
            :request="getCategoryData"
            placeholder="请选择品类"
            size="mini"
            @change="handleSearch">
          </select-loadMore>
        </el-form-item>
        
        <el-form-item label="项目负责人" prop="projectManager">
              <el-select 
                  v-model="searchForm.projectManager"
                placeholder="请选择项目负责人" 
                filterable 
                clearable
                :disabled="isView"
                style="width: 150px"
                @change="handleSearch">
                <el-option 
                  v-for="user in userOptions" 
                  :key="user.dictValue" 
                  :label="user.dictLabel || user.dictLabel" 
                  :value="user.dictLabel">
                </el-option>
              </el-select>
        </el-form-item>
        
 
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
 
        </el-form-item>
      </el-form>
      <div class="action-button">
            <el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['customer:requirement:add']">新增</el-button>
          </div>
    </div>


      <!-- 表格区域 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        :height="tableHeight()"
        class="customer-requirement-table table-section"
        :header-cell-style="getHeaderCellStyle"
      >
        <!-- 客户名称 -->
        <el-table-column prop="customer" label="客户名称" align="center" width="120" fixed="left">
          <template slot-scope="scope">
            <span class="customer-name">{{ scope.row.customer || '--' }}</span>
          </template>
        </el-table-column>
        
        <!-- 类别 -->
        <!-- <el-table-column prop="customerClass" label="客户类别" align="center" width="80">
          <template slot-scope="scope">
            <el-tag :type="getClassTagType(getCustomerTypeLabel(scope.row.customerClass))" size="small">
              {{ getCustomerTypeLabel(scope.row.customerClass) }}
            </el-tag>
          </template>
        </el-table-column>
         -->
        <!-- 关联机型 -->
        <el-table-column prop="modelType" label="机型型号" align="center" width="150">
            <template slot-scope="scope">
              <div v-if="scope.row.requirementInfoList && scope.row.requirementInfoList.length > 0" class="model-list">
                <div v-for="(item, index) in scope.row.requirementInfoList" :key="index" class="model-item">
                  <span class="model-name">{{ getCategoryName(item.category) || '--' }}</span>
                </div>
              </div>
              <span v-else>--</span>
            </template>
          </el-table-column>
        <!-- 客户要求（标准） -->
        <el-table-column label="客户出货方" prop="customerDelivery" align="center" width="220" >
          <template slot-scope="scope">
            <div class="requirement-container">
              <div class="requirement-scroll-area">
                <div v-html="scope.row.customerDelivery"></div>
              </div>
            </div>
          </template>
        </el-table-column>
          <el-table-column label="客户要求（标准）" align="center" >
    
          
          <el-table-column prop="productCertification" label="产品认证" align="center" >
            <template slot-scope="scope">
              <div class="requirement-container">
                <div class="requirement-scroll-area">
                  <div v-html="scope.row.productCertification" class="requirement-text rich-text-content"></div>
                </div>

                <!-- 产品认证附件下载 -->
                <div v-if="hasFieldAttachments(scope.row, 'certificationAttachment')" class="attachment-fixed-right">
                  <el-popover
                    placement="right"
                    width="300"
                    trigger="click"
                    title="附件">

                    <!-- 文件表格 -->
                    <el-table
                      :data="getFieldAttachments(scope.row, 'certificationAttachment')"
                      size="mini"
                      :show-header='false'
                      max-height="300">
                      <el-table-column property="name" label="文件名" min-width="200">
                        <template slot-scope="fileScope">
                          <div class="file-name-cell">
                            <i :class="getFileIcon(fileScope.row.extension)" class="file-icon-small"></i>
                            <span :title="fileScope.row.name">{{ fileScope.row.name }}</span>
                          </div>
                        </template>
                      </el-table-column>

                      <el-table-column label="操作" width="60" align="center">
                        <template slot-scope="fileScope">
                          <el-button
                            type="text"
                            size="mini"
                            icon="el-icon-download"
                            @click="downloadFile(fileScope.row)"
                            title="下载">
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>

                    <el-button
                      slot="reference"
                      type="text"
                      size="mini"
                      icon="el-icon-paperclip"
                      class="attachment-btn">
                    ({{ getFieldAttachments(scope.row, 'certificationAttachment').length }})
                    </el-button>
                  </el-popover>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="environmentalRequirements" label="环保要求" align="center"  >
            <template slot-scope="scope">
              <div class="requirement-container">
                <div class="requirement-scroll-area">
                  <div v-html="scope.row.environmentalRequirements" class="requirement-text rich-text-content"></div>
                </div>

                <!-- 环保要求附件下载 -->
                <div v-if="hasFieldAttachments(scope.row, 'environmentalAttachment')" class="attachment-fixed-right">
                  <el-popover
                    placement="right"
                    width="300"
                    trigger="click"
                    title="附件">

                    <!-- 文件表格 -->
                    <el-table
                      :data="getFieldAttachments(scope.row, 'environmentalAttachment')"
                      size="mini"
                      :show-header='false'
                      max-height="300">
                      <el-table-column property="name" label="文件名" min-width="200">
                        <template slot-scope="fileScope">
                          <div class="file-name-cell">
                            <i :class="getFileIcon(fileScope.row.extension)" class="file-icon-small"></i>
                            <span :title="fileScope.row.name">{{ fileScope.row.name }}</span>
                          </div>
                        </template>
                      </el-table-column>

                      <el-table-column label="操作" width="60" align="center">
                        <template slot-scope="fileScope">
                          <el-button
                            type="text"
                            size="mini"
                            icon="el-icon-download"
                            @click="downloadFile(fileScope.row)"
                            title="下载">
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>

                    <el-button
                      slot="reference"
                      type="text"
                      size="mini"
                      icon="el-icon-paperclip"
                      class="attachment-btn">
                      ({{ getFieldAttachments(scope.row, 'environmentalAttachment').length }})
                    </el-button>
                  </el-popover>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="validationStandard" label="其他要求" align="center" >
            <template slot-scope="scope">
              <div class="requirement-container">
                <div class="requirement-scroll-area">
                  <div v-html="scope.row.validationStandard" class="requirement-text rich-text-content"></div>
                </div>

                <!-- 校验标准附件下载 -->
                <div v-if="hasFieldAttachments(scope.row, 'validationAttachment')" class="attachment-fixed-right">
                  <el-popover
                    placement="right"
                    width="300"
                    trigger="click"
                    title="附件">

                    <!-- 文件表格 -->
                    <el-table
                      :data="getFieldAttachments(scope.row, 'validationAttachment')"
                      size="mini"
                      :show-header='false'
                      max-height="300">
                      <el-table-column property="name" label="文件名" min-width="200">
                        <template slot-scope="fileScope">
                          <div class="file-name-cell">
                            <i :class="getFileIcon(fileScope.row.extension)" class="file-icon-small"></i>
                            <span :title="fileScope.row.name">{{ fileScope.row.name }}</span>
                          </div>
                        </template>
                      </el-table-column>

                      <el-table-column label="操作" width="60" align="center">
                        <template slot-scope="fileScope">
                          <el-button
                            type="text"
                            size="mini"
                            icon="el-icon-download"
                            @click="downloadFile(fileScope.row)"
                            title="下载">
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>

                    <el-button
                      slot="reference"
                      type="text"
                      size="mini"
                      icon="el-icon-paperclip"
                      class="attachment-btn">
                      ({{ getFieldAttachments(scope.row, 'validationAttachment').length }})
                    </el-button>
                  </el-popover>
                </div>
              </div>
            </template>
          </el-table-column>
 
          <el-table-column prop="qualityInfo" label="质量协议" align="center"  >
            <template slot-scope="scope">
              <div class="requirement-container">
                <div class="requirement-scroll-area">
                  <div v-html="scope.row.qualityInfo" class="requirement-text rich-text-content"></div>
                </div>

                <!-- 质量协议附件下载 -->
                <div v-if="hasFieldAttachments(scope.row, 'qualityAgreement')" class="attachment-fixed-right">
                  <el-popover
                    placement="right"
                    width="300"
                    trigger="click"
                    title="附件">

                    <!-- 文件表格 -->
                    <el-table
                      :data="getFieldAttachments(scope.row, 'qualityAgreement')"
                      size="mini"
                      :show-header='false'
                      max-height="300">
                      <el-table-column property="name" label="文件名" min-width="200">
                        <template slot-scope="fileScope">
                          <div class="file-name-cell">
                            <i :class="getFileIcon(fileScope.row.extension)" class="file-icon-small"></i>
                            <span :title="fileScope.row.name">{{ fileScope.row.name }}</span>
                          </div>
                        </template>
                      </el-table-column>

                      <el-table-column label="操作" width="60" align="center">
                        <template slot-scope="fileScope">
                          <el-button
                            type="text"
                            size="mini"
                            icon="el-icon-download"
                            @click="downloadFile(fileScope.row)"
                            title="下载">
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>

                    <el-button
                      slot="reference"
                      type="text"
                      size="mini"
                      icon="el-icon-paperclip"
                      class="attachment-btn">
                      ({{ getFieldAttachments(scope.row, 'qualityAgreement').length }})
                    </el-button>
                  </el-popover>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table-column>
        
 
        <el-table-column label="保障措施" align="center" > 
            <template slot-scope="scope">
              <div class="requirement-container">
                <div class="requirement-scroll-area">
                  <div v-html="scope.row.aqlStandard" class="requirement-text rich-text-content"></div>
                </div>

                <!-- AQL标准附件下载 -->
                <div v-if="hasFieldAttachments(scope.row, 'aqlAttachment')" class="attachment-fixed-right">
                  <el-popover
                    placement="right"
                    width="300"
                    trigger="click"
                    title="附件">

                    <!-- 文件表格 -->
                    <el-table
                      :data="getFieldAttachments(scope.row, 'aqlAttachment')"
                      size="mini"
                      :show-header='false'
                      max-height="300">
                      <el-table-column property="name" label="文件名" min-width="200">
                        <template slot-scope="fileScope">
                          <div class="file-name-cell">
                            <i :class="getFileIcon(fileScope.row.extension)" class="file-icon-small"></i>
                            <span :title="fileScope.row.name">{{ fileScope.row.name }}</span>
                          </div>
                        </template>
                      </el-table-column>

                      <el-table-column label="操作" width="60" align="center">
                        <template slot-scope="fileScope">
                          <el-button
                            type="text"
                            size="mini"
                            icon="el-icon-download"
                            @click="downloadFile(fileScope.row)"
                            title="下载">
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>

                    <el-button
                      slot="reference"
                      type="text"
                      size="mini"
                      icon="el-icon-paperclip"
                      class="attachment-btn">
                      ({{ getFieldAttachments(scope.row, 'aqlAttachment').length }})
                    </el-button>
                  </el-popover>
                </div>
              </div>
            </template>
        </el-table-column>
        <!-- 市场负责人 -->
        <el-table-column label="市场负责人" align="center" width="95" class-name="market-manager-column">
          <template slot-scope="scope">
            <span>{{ scope.row.marketManager || '--' }}</span>
          </template>
        </el-table-column>
        
        <!-- 质量负责人 -->
        <el-table-column label="质量负责人" align="center" width="95" class-name="quality-manager-column">
          <template slot-scope="scope">
            <span>{{ scope.row.qualityManager || '--' }}</span>
          </template>
        </el-table-column>
        
        <!-- 项目负责人 -->
        <el-table-column prop="projectManager" label="项目负责人" align="center" width="95" class-name="project-manager-column">
          <template slot-scope="scope">
            <span>{{ scope.row.projectManager || '--' }}</span>
          </template>
        </el-table-column>



        <!-- 操作 -->
        <el-table-column label="操作" align="center" width="150">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)" v-hasPermi="['customer:requirement:query']">查看</el-button>
            <el-button type="text" size="small" @click="handleEdit(scope.row)" v-hasPermi="['customer:requirement:edit']">编辑</el-button>
            <el-button type="text" size="small" class="danger-text" @click="handleDelete(scope.row)" v-hasPermi="['customer:requirement:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      

      <!-- 分页组件 -->
      <div class="pagination-section">
        <el-pagination
        style ="margin-top: 0px;"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.current"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total">
        </el-pagination>
      </div>

    <!-- 添加/编辑对话框 -->
    <AddRequirementDialog
      :visible.sync="dialogVisible"
      :form-data="currentRow"
      :is-edit="isEdit"
      :is-view="isView"
      :category-all-data="categoryAllData"
      @success="handleDialogSuccess"
    />
    
    <!-- 查看对话框 -->
    <ViewRequirementDialog
     v-if="viewDialogVisible"
      :visible.sync="viewDialogVisible"
      :form-data="currentRow"
      @edit="handleViewEdit"
    />
  </div>
</template>

<script>
import { getCustomerRequirementList, deleteCustomerRequirement } from '@/api/customer/requirement'
import { listCategory } from "@/api/third/category";
import { getDicts } from '@/api/system/dict/data'
import { getCustomerList } from '@/api/order'
import AddRequirementDialog from './components/AddRequirementDialog'
import ViewRequirementDialog from './components/ViewRequirementDialog'
import { dictPmProject as dictUserList } from '@/api/third/project'
import cloneDeep from 'lodash/cloneDeep'
import { categoryComputerDict } from '@/api/third/fileConfig'
export default {
  name: 'CustomerRequirement',
  components: {
    AddRequirementDialog,
    ViewRequirementDialog
  },
  data() {
    return {
      userOptions: [], // 用户选项
      loading: false,
      searchForm: {
        customer: '',
        category: '',
        projectManager: '',
        startDate: '',
        endDate: ''
      },
      dateRange: [],
      categoryOptions: [],
      categoryAllData: [], // 全部品类数据（从 categoryComputerDict 接口获取）
      categoryData: {
        data: [],
        page: 1,
        more: true,
      },
      customerData: {
        data: [],
        page: 1,
        more: true,
      },
      customerTypeDict: [], // 客户类型字典
      tableData: [],
      pagination: {
        current: 1,
        size: 20,
        total: 0
      },
      dialogVisible: false,
      viewDialogVisible: false,
      isEdit: false,
      isView: false,
      currentRow: null
    }
  },
  async mounted() {
    // 优先加载全部品类数据（因为这个接口响应较慢，提前加载供编辑时使用）
    this.loadAllCategoryData()
    
    // 先加载品类数据，确保表格显示时能正确回显
    await Promise.all([
      this.getCategoryData({ page: 1 }),
      this.loadCategoryOptions()
    ])
    
    // 并行加载其他数据
    this.loadCustomerTypeDict()
    this.loadUserOptions()
    this.getCustomerData({ page: 1 })
    
    // 最后加载表格数据
    this.fetchData()
  },
  methods: {
    // 加载全部品类数据（供编辑对话框使用）
    async loadAllCategoryData() {
      try {
        console.log('开始加载全部品类数据...')
        const res = await categoryComputerDict()
        console.log('全部品类数据API响应:', res)
        
        if (res.code === 200 && res.data) {
          // 处理数据格式，确保包含 id 和 name 字段
          if (Array.isArray(res.data)) {
            this.categoryAllData = res.data.map(item => ({
              id: item.id || item.categoryId,
              name: item.name || item.categoryName || item.label,
              ...item // 保留其他字段
            }))
          } else if (res.data.list) {
            this.categoryAllData = res.data.list.map(item => ({
              id: item.id || item.categoryId,
              name: item.name || item.categoryName || item.label,
              ...item // 保留其他字段
            }))
          }
          console.log('全部品类数据加载成功:', this.categoryAllData.length, '条')
        } else {
          console.error('获取全部品类数据失败:', res.msg)
          this.categoryAllData = []
        }
      } catch (error) {
        console.error('加载全部品类数据异常:', error)
        this.categoryAllData = []
      }
    },
    
    // 获取客户数据 (用于 select-loadMore 组件)
    getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getCustomerList({
          p: page,
          pageSize: 20,
          name: keyword,
        }).then((res) => {
          if (res.code === 200) {
            let list = [];
            // 处理不同的数据结构
            if (res.data && res.data.list) {
              list = res.data.list.map(item => ({
                id: item.id,
                name: item.name || item.customerName || item.companyName
              }));
            } else if (res.data && Array.isArray(res.data)) {
              list = res.data.map(item => ({
                id: item.id,
                name: item.name || item.customerName || item.companyName
              }));
            }

            if (more) {
              this.customerData.data = [...this.customerData.data, ...list];
            } else {
              this.customerData.data = list;
            }

            // 计算是否还有更多数据
            const { total, pageNum, pageSize } = res.data || {};
            this.customerData.more = total ? pageNum * pageSize < total : list.length >= 20;
            this.customerData.page = pageNum || page;
          } else {
            console.error('获取客户数据失败:', res.msg);
          }
          resolve();
        }).catch(error => {
          console.error('获取客户数据异常:', error);
          resolve();
        });
      });
    },

    // 获取品类数据 (用于 select-loadMore 组件)
    getCategoryData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        listCategory({
          p: page,
          l: 20,
          key: keyword,
        }).then((res) => {
          if (res.code === 200 && res.data) {
            const list = res.data.list || [];

            if (more) {
              this.categoryData.data = [...this.categoryData.data, ...list];
            } else {
              this.categoryData.data = list;
            }

            // 计算是否还有更多数据
            const { total, pageNum, pageSize } = res.data || {};
            this.categoryData.more = total ? pageNum * pageSize < total : list.length >= 20;
            this.categoryData.page = pageNum || page;
          } else {
            console.error('获取品类数据失败:', res.msg);
          }
          resolve();
        }).catch(error => {
          console.error('获取品类数据异常:', error);
          resolve();
        });
      });
    },

    // 加载用户选项
    async loadUserOptions() {
      try {
        const res = await dictUserList()
        console.log('用户API响应:', res)
        
        if (res && res.data) {
          // 对数据进行去重处理，避免重复键值问题
          const uniqueUsers = []
          const userNameSet = new Set()
          this.userOptions = res.data
        } else {
          this.userOptions = []
        }
        
        if (this.userOptions.length === 0) {
          this.$message.warning('暂无用户数据')
        }
        
      } catch (error) {
        console.error('获取用户数据失败:', error)
        this.userOptions = []
        this.$message.error('获取用户数据失败: ' + (error.message || '未知错误'))
      }
    },
    // 加载品类选项
    async loadCategoryOptions() {
      try {
        const res = await listCategory({ p: 1, l: 100 })
        if (res.code === 200 && res.data) {
          this.categoryOptions = res.data.list || []
        }
      } catch (error) {
        console.error('获取品类数据失败:', error)
      }
    },
    
    // 加载客户类型字典
    async loadCustomerTypeDict() {
      try {
        const res = await getDicts('customer_type_enum')
        if (res.code === 200 && res.data) {
          this.customerTypeDict = res.data.filter(item => item.status === '0') // 只显示启用的字典项
        }
      } catch (error) {
        console.error('获取客户类型字典失败:', error)
      }
    },
    
    // 获取列表数据
    async fetchData() {
      this.loading = true
      try {
        const params = {
          p: this.pagination.current,
          l: this.pagination.size,
          customer: this.searchForm.customer,
          category: this.searchForm.category,
          projectManager: this.searchForm.projectManager,
          startDate: this.searchForm.startDate,
          endDate: this.searchForm.endDate
        }
        
        const response = await getCustomerRequirementList(params)
        
        if (response.code === 200 && response.data) {
          this.tableData = response.data.list || []
          this.pagination.total = response.data.total || 0
        } else {
          this.$message.warning(response.msg || '获取数据失败')
          this.tableData = []
          this.pagination.total = 0
        }
      } catch (error) {
        console.error('获取客户要求列表失败:', error)
        this.$message.error('获取数据失败')
        this.tableData = []
        this.pagination.total = 0
      } finally {
        this.loading = false
      }
    },
    
    // 处理日期范围变化
    handleDateRangeChange(dateRange) {
      if (dateRange && dateRange.length === 2) {
        this.searchForm.startDate = dateRange[0]
        this.searchForm.endDate = dateRange[1]
      } else {
        this.searchForm.startDate = ''
        this.searchForm.endDate = ''
      }
    },
    
    // 搜索
    handleSearch() {
      this.pagination.current = 1
      this.fetchData()
    },
    
    // 重置
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.dateRange = []
      this.searchForm = {
        customer: '',
        category: '',
        projectManager: '',
        startDate: '',
        endDate: ''
      }
      this.pagination.current = 1
      this.fetchData()
    },
    
    // 新增
    handleAdd() {
      this.currentRow = null
      this.isEdit = false
      this.isView = false
      this.dialogVisible = true
    },
    
    // 查看
    handleView(row) {
      // 深拷贝，避免修改原数据
      this.currentRow = cloneDeep(row)
      this.viewDialogVisible = true
    },
    
    // 编辑
    handleEdit(row) {
      // 深拷贝，避免修改原数据
      this.currentRow = cloneDeep(row)
      this.isEdit = true
      this.isView = false
      this.dialogVisible = true
    },
    
    // 删除
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该客户要求吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await deleteCustomerRequirement(row.id)
        
        if (response.code === 200) {
          this.$message.success('删除成功')
          this.fetchData()
        } else {
          this.$message.error(response.msg || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除客户要求失败:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.current = 1
      this.fetchData()
    },
    
    // 当前页改变
    handleCurrentChange(val) {
      this.pagination.current = val
      this.fetchData()
    },
    
    // 对话框成功回调
    handleDialogSuccess() {
      this.dialogVisible = false
      this.fetchData()
    },
    
    // 从查看组件跳转到编辑
    handleViewEdit(row) {
      // 深拷贝，避免修改原数据
      this.currentRow = extend(row)
      this.isEdit = true
      this.isView = false
      this.dialogVisible = true
    },
    
    // 获取类别标签类型
    getClassTagType(classType) {
      const typeMap = {
        'A类': 'success',
        'B类': 'warning', 
        'C类': 'info',
        'A': 'success',
        'B': 'warning',
        'C': 'info'
      }
      return typeMap[classType] || 'info'
    },
    
    // 获取客户类型标签文本
    getCustomerTypeLabel(value) {
      if (!value) return '--'
      const dictItem = this.customerTypeDict.find(item => item.dictValue === value)
      return dictItem ? dictItem.dictLabel : value
    },

    // 根据品类ID获取品类名称
    getCategoryName(categoryId) {
      if (!categoryId) return '--'
      // 优先从 categoryData 中查找，如果没找到再从 categoryOptions 中查找
      // 使用 == 比较，处理字符串和数字类型不一致的情况
      const category = this.categoryData.data.find(item => item.id == categoryId) || 
                      this.categoryOptions.find(item => item.id == categoryId)
      return category ? category.name : categoryId
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return '--'
      return new Date(date).toLocaleDateString('zh-CN')
    },

    // 检查指定字段是否有附件
    hasFieldAttachments(row, fieldName) {
      if (!row) return false

      // 检查指定字段是否有附件数据
      return !!(row[fieldName] && row[fieldName].trim())
    },

    // 获取指定字段的附件列表
    getFieldAttachments(row, fieldName) {
      if (!row || !row[fieldName]) return []

      return this.parseAttachmentUrls(row[fieldName], this.getFieldDisplayName(fieldName))
    },

    // 获取字段显示名称
    getFieldDisplayName(fieldName) {
      const fieldMap = {
        'validationAttachment': '校验标准',
        'certificationAttachment': '产品认证',
        'environmentalAttachment': '环保要求',
        'aqlAttachment': 'AQL标准'
      }
      return fieldMap[fieldName] || '附件'
    },

    // 解析附件URL字符串
    parseAttachmentUrls(urlString, source = '附件') {
      if (!urlString) return []

      const urls = urlString.split(',').filter(url => url.trim())
      return urls.map((url, index) => {
        const fileName = this.getFileNameFromUrl(url) || `${source}${index + 1}`
        const extension = this.getFileExtension(fileName)

        return {
          name: fileName,
          url: url.trim(),
          extension: extension.toLowerCase(),
          source: source
        }
      })
    },

    // 从URL中提取文件名
    getFileNameFromUrl(url) {
      if (!url) return ''

      try {
        const decodedUrl = decodeURIComponent(url)
        const parts = decodedUrl.split('/')
        let fileName = parts[parts.length - 1] || ''
        fileName = fileName.split('?')[0]

        if (fileName.length > 30) {
          const extension = this.getFileExtension(fileName)
          const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.') || fileName.length)
          const truncatedName = nameWithoutExt.substring(0, 25) + '...'
          fileName = extension ? `${truncatedName}.${extension}` : truncatedName
        }

        return fileName || '附件'
      } catch (error) {
        return '附件'
      }
    },

    // 获取文件扩展名
    getFileExtension(fileName) {
      const parts = fileName.split('.')
      return parts.length > 1 ? parts[parts.length - 1] : ''
    },

    // 获取文件图标
    getFileIcon(extension) {
      const iconMap = {
        // 图片
        'jpg': 'el-icon-picture',
        'jpeg': 'el-icon-picture',
        'png': 'el-icon-picture',
        'gif': 'el-icon-picture',
        'bmp': 'el-icon-picture',
        'webp': 'el-icon-picture',
        'svg': 'el-icon-picture',

        // 文档
        'pdf': 'el-icon-document',
        'doc': 'el-icon-document',
        'docx': 'el-icon-document',
        'xls': 'el-icon-s-grid',
        'xlsx': 'el-icon-s-grid',
        'ppt': 'el-icon-document',
        'pptx': 'el-icon-document',
        'txt': 'el-icon-document',

        // 压缩包
        'zip': 'el-icon-folder-opened',
        'rar': 'el-icon-folder-opened',
        '7z': 'el-icon-folder-opened',

        // 视频
        'mp4': 'el-icon-video-camera',
        'avi': 'el-icon-video-camera',
        'mov': 'el-icon-video-camera',

        // 音频
        'mp3': 'el-icon-service',
        'wav': 'el-icon-service'
      }

      return iconMap[extension] || 'el-icon-document'
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes) return '--'

      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    },

    // 下载文件
    downloadFile(file) {
      if (!file.url) {
        this.$message.warning('文件链接无效')
        return
      }

      try {
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = file.url
        link.download = file.name || 'download'
        link.target = '_blank'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        this.$message.success('开始下载文件')
      } catch (error) {
        console.error('下载文件失败:', error)
        this.$message.error('下载失败，请重试')
      }
    },

    // 表头样式处理
    getHeaderCellStyle({ row, column, rowIndex, columnIndex }) {
      // 所有列使用统一的样式
      return {
        background: '#f5f7fa',
        color: '#606266',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    }
  }
}
</script>

<style scoped>
.requirement-cell {
  padding: 4px;
}

/* 新的容器样式 */
.requirement-container {
  position: relative;
  padding: 4px;
  max-height: 100px;
  min-height: 40px;
  display: flex;
  align-items: flex-start;
}

.requirement-scroll-area {
  flex: 1;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 50px; /* 为右侧固定附件按钮留出空间 */
  box-sizing: border-box;
}

/* 美化滚动条 */
.requirement-scroll-area::-webkit-scrollbar {
  width: 4px;
}

.requirement-scroll-area::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.requirement-scroll-area::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.requirement-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* 保留旧的flex样式以防兼容性问题 */
.requirement-cell-flex {
  padding: 4px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  min-height: 40px;
  width: 100%;
  overflow: hidden;
}

.requirement-text {
  text-align: left;
  font-size: 12px;
  line-height: 1.4;
  min-height: 20px;
  width: 100%;
  word-wrap: break-word;
  word-break: break-word;
}

.rich-text-content {
  max-width: 100%;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.4;
  text-align: left;
}

.rich-text-content p {
  margin: 0;
  padding: 1px 0;
  font-size: 12px;
}
.pagination-section {
  text-align: right;
}
.rich-text-content ul, .rich-text-content ol {
  margin: 0;
  padding-left: 15px;
  font-size: 12px;
}

.rich-text-content li {
  margin: 1px 0;
  font-size: 12px;
}

.rich-text-content strong {
  font-weight: bold;
  font-size: 12px;
}

.rich-text-content em {
  font-style: italic;
  font-size: 12px;
}

.attachment-info {
  margin-top: 4px;
  color: #409eff;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attachment-info i {
  margin-right: 2px;
}

.customer-name {
  font-weight: 500;
  color: #303133;
}

.danger-text {
  color: #f56c6c;
}

.danger-text:hover {
  color: #f78989;
}

/* 机型配置列表样式 - 统一标签风格 */
.model-list, .config-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 20px;
  align-items: flex-start;
}

.model-item, .config-item {
  display: inline-block;
  padding: 4px 10px;
  background-color: #f0f2f5;
  border-radius: 5px;
  font-size: 12px;
  line-height: 1.4;
  border: 1px solid #d9d9d9;
  white-space: nowrap;
  margin: 2px;
  transition: all 0.2s ease;
}

.model-name, .config-name {
  color: #303133;
  font-weight: 500;
}

/* 附件下载popover样式 */
.attachment-download-list {
  max-height: 400px;
  overflow-y: auto;
}

.no-files {
  text-align: center;
  color: #909399;
  padding: 20px;
  font-size: 14px;
}

.no-files i {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: #e9ecef;
  border-color: #409eff;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 18px;
  color: #409eff;
  margin-right: 8px;
  min-width: 18px;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.file-source {
  font-size: 11px;
  color: #909399;
}

.download-btn {
  padding: 4px 8px !important;
  font-size: 12px;
  margin-left: 8px;
}

.download-btn:hover {
  color: #409eff;
}

.no-attachment {
  color: #c0c4cc;
  font-size: 12px;
}

/* 字段级附件下载样式 */
.attachment-section {
  margin-top: 8px;
  text-align: center;
}

/* 固定在右侧的附件按钮 */
.attachment-fixed-right {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 3px;
  padding: 2px;
  z-index: 10;
}

/* 保留旧的样式以防兼容性问题 */
.attachment-section-right {
  display: flex;
  align-items: center;
  margin-left: 8px;
  flex-shrink: 0;
  min-width: 60px;
  width: auto;
}

.attachment-btn {
  font-size: 11px !important;
  padding: 2px 6px !important;
  color: #409eff !important;
  border: 1px solid #409eff;
  border-radius: 3px;
  background: #f0f9ff;
  transition: all 0.2s ease;
}

.attachment-btn:hover {
  background: #409eff !important;
  color: white !important;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.file-icon-small {
  font-size: 14px;
  color: #409eff;
  min-width: 14px;
}

.file-size-text {
  color: #909399;
  font-size: 11px;
}
 
</style>
