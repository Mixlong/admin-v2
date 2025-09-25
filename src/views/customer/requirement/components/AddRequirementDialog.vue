<template>
  <el-dialog
    :title="isView ? '查看' : (isEdit ? '编辑' : '新增')"
    :visible.sync="dialogVisible"
    width="1200px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
    top="0vh"
    class="dialog-scroll"
  >
    <el-form
      :model="localFormData"
      :rules="dynamicRules"
      ref="form"
      label-width="120px"
      class="requirement-form"
    >
      <!-- 基本信息 -->
      <fieldset class="form-fieldset">
        <legend>基本信息</legend>
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customer">
              <select-loadMore
                v-model="localFormData.customer"
                style="width: 100%"
                :data="customerData.data"
                :page="customerData.page"
                :hasMore="customerData.more"
                dictLabel="name"
                dictValue="name"
                :request="getCustomerData"
                placeholder="请选择客户名称"
                size="mini"
                :disabled="isView">
              </select-loadMore>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="客户类别" prop="customerClass">
              <el-select 
                v-model="localFormData.customerClass" 
                placeholder="请选择类别" 
                clearable
                :disabled="isView"
                style="width: 100%">
                <el-option
                  v-for="item in customerTypeOptions"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="项目负责人" prop="projectManager">
              <select-loadMore
                v-model="localFormData.projectManager"
                style="width: 100%"
                :data="userProjectData.data"
                :page="userProjectData.page"
                :hasMore="userProjectData.more"
                dictLabel="displayName"
                dictValue="displayName"
                :request="getUserProjectData"
                placeholder="请选择项目负责人"
                size="mini"
                :disabled="isView">
              </select-loadMore>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="市场负责人" prop="marketManager">
              <select-loadMore
                v-model="localFormData.marketManager"
                style="width: 100%"
                :data="userMarketData.data"
                :page="userMarketData.page"
                :hasMore="userMarketData.more"
                dictLabel="dictLabel"
                dictValue="dictLabel"
                :request="getUserMarketData"
                placeholder="请选择市场负责人"
                size="mini"
                :disabled="isView">
              </select-loadMore>
            </el-form-item>
          </el-col>
        </el-row>
      </fieldset>

      <!-- 机型配置 -->
      <fieldset class="form-fieldset" style="position: relative;">
        <legend>机型配置</legend>
        <div class="model-config-section">
          <div class="section-header">
            <span></span> <!-- 占位元素 -->
            <el-button type="text" v-if="!isView"   size="small" @click="addModelConfig">
              <i class="el-icon-plus"></i> 添加机型配置
            </el-button>
          </div>

          <div v-if="localFormData.requirementInfoList.length === 0" class="empty-hint">
            暂无机型配置，请点击"添加机型配置"按钮添加
          </div>

          <div v-for="(item, index) in localFormData.requirementInfoList" :key="item.id || index" class="model-config-item">
            <!-- 删除按钮 - 右上角x -->
            <el-button v-if="index > 0"
                       class="delete-button"
                       type="text"
                       size="mini"
                       @click="removeModelConfig(index)">
              <i class="el-icon-close"></i>
            </el-button>
            
            <el-row :gutter="30">
              <el-col :span="12">
                <el-form-item :label="`机型型号${index + 1}`" :prop="`requirementInfoList.${index}.category`">
                  <select-loadMore
                    v-model="item.category"
                    style="width: 100%"
                    :data="categoryData.data"
                    :page="categoryData.page"
                    :hasMore="categoryData.more"
                    dictLabel="name"
                    dictValue="id"
                    :request="getCategoryList"
                    placeholder="请选择品类"
                    size="mini"
                    :disabled="isView">
                  </select-loadMore>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="`机型配置${index + 1}`" :prop="`requirementInfoList.${index}.modelConfig`">
                  <el-input v-model="item.modelConfig" placeholder="请输入机型配置" :disabled="isView" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
      </fieldset>
      
      <!-- 客户要求（标准） -->
      <fieldset class="form-fieldset">
        <legend>客户要求（标准）</legend>
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="校验标准" prop="validationStandard">
              <Editor 
                v-model="localFormData.validationStandard" 
                :min-height="120"
                placeholder="请输入校验标准..."
                :disabled="isView"
                :config="{
                  height: 120,
                  menubar: false,
                  toolbar: 'bold italic underline | bullist numlist | removeformat',
                  plugins: 'lists',
                  statusbar: false,
                  resize: false,
                  branding: false
                }" />
            </el-form-item>
            <el-form-item label="校验标准附件">
              <MyUpload 
                v-model="localFormData.validationAttachment"
                :multiple="true"
                :limit="10"
                :disabled="isView"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="产品认证" prop="productCertification">
              <Editor 
                v-model="localFormData.productCertification" 
                :min-height="120"
                placeholder="请输入产品认证要求..."
                :disabled="isView"
                :config="{
                  height: 120,
                  menubar: false,
                  toolbar: 'bold italic underline | bullist numlist | removeformat',
                  plugins: 'lists',
                  statusbar: false,
                  resize: false,
                  branding: false
                }" />
            </el-form-item>
            <el-form-item label="产品认证附件">
              <MyUpload 
                v-model="localFormData.certificationAttachment"
                :multiple="true"
                :limit="10"
                :disabled="isView"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="环保要求" prop="environmentalRequirements">
              <Editor 
                v-model="localFormData.environmentalRequirements" 
                :min-height="120"
                placeholder="请输入环保要求..."
                :disabled="isView"
                :config="{
                  height: 120,
                  menubar: false,
                  toolbar: 'bold italic underline | bullist numlist | removeformat',
                  plugins: 'lists',
                  statusbar: false,
                  resize: false,
                  branding: false
                }" />
            </el-form-item>
            <el-form-item label="环保要求附件">
              <MyUpload 
                v-model="localFormData.environmentalAttachment"
                :multiple="true"
                :limit="10"
                :disabled="isView"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="AQL标准" prop="aqlStandard">
              <Editor 
                v-model="localFormData.aqlStandard" 
                :min-height="120"
                placeholder="请输入AQL标准..."
                :disabled="isView"
                :config="{
                  height: 120,
                  menubar: false,
                  toolbar: 'bold italic underline | bullist numlist | removeformat',
                  plugins: 'lists',
                  statusbar: false,
                  resize: false,
                  branding: false
                }" />
            </el-form-item>
            <el-form-item label="AQL标准附件">
              <MyUpload 
                v-model="localFormData.aqlAttachment"
                :multiple="true"
                :limit="10"
                :disabled="isView"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="质量协议" prop="qualityInfo">
              <Editor 
                v-model="localFormData.qualityInfo" 
                :min-height="120"
                placeholder="请输入质量协议..."
                :disabled="isView"
                :config="{
                  height: 120,
                  menubar: false,
                  toolbar: 'bold italic underline | bullist numlist | removeformat',
                  plugins: 'lists',
                  statusbar: false,
                  resize: false,
                  branding: false
                }" />
            </el-form-item>
            <el-form-item label="质量协议附件">
              <MyUpload 
                v-model="localFormData.qualityAgreement"
                :multiple="true"
                :limit="10"
                :disabled="isView"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <!-- 预留位置，可以添加其他字段 -->
          </el-col>
        </el-row>
      </fieldset>
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ isView ? '关闭' : '取消' }}</el-button>
      <el-button v-if="!isView" type="primary" @click="handleSubmit" :loading="submitLoading">
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addCustomerRequirement, updateCustomerRequirement } from '@/api/customer/requirement'
import { afterCategoryList } from '@/api/third/sale'
import { getCategoryList } from '@/api/quote-management/quotation'
import { getCustomerList } from '@/api/order'
import { getDicts } from '@/api/system/dict/data'
import { dictUserList } from '@/api/system/user'
  import { dictPmProject, dictMkProject  } from '@/api/third/project'
import Editor from '@/components/Editor'
import MyUpload from '@/components/MyUpload'

export default {
  name: 'AddRequirementDialog',
  components: {
    Editor,
    MyUpload
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    isView: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 品类数据
      categoryData: {
        data: [],
        page: 1,
        more: true,
      },
      submitLoading: false,
      categoryOptions: [],
      customerOptions: [],
      customerData: {
        data: [],
        page: 1,
        more: true,
      },
      customerTypeOptions: [],
      userOptions: [], // 用户选项
      userProjectData: {
        data: [],
        page: 1,
        more: true,
      },
      userMarketData: {
        data: [],
        page: 1,
        more: true,
      },
      localFormData: {
        customer: '',
        customerClass: '',
        projectManager: '',
        marketManager: '', // 市场负责人
        projectStartTime: '',
        massProductionTime: '',
        validationStandard: '',
        productCertification: '',
        environmentalRequirements: '',
        aqlStandard: '',
        qualityInfo: '', // 质量协议
        validationAttachment: '',
        certificationAttachment: '',
        environmentalAttachment: '',
        aqlAttachment: '',
        qualityAgreement: '', // 质量协议附件
        requirementInfoList: []
      },
      formRules: {
        customer: [
          { required: true, message: '请输入客户名称', trigger: 'blur' }
        ],
        customerClass: [
          { required: true, message: '请选择客户类别', trigger: 'change' }
        ],
        projectManager: [
          { required: true, message: '请选择项目负责人', trigger: 'change' }
        ],
        marketManager: [
          { required: true, message: '请选择市场负责人', trigger: 'change' }
        ],
    
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },

    // 动态验证规则
    dynamicRules() {
      const rules = { ...this.formRules }

      // // 为每个机型配置添加验证规则
      // this.localFormData.requirementInfoList.forEach((_, index) => {
      //   rules[`requirementInfoList.${index}.category`] = [
      //     { required: true, message: '请选择机型型号', trigger: 'change' }
      //   ]
      //   rules[`requirementInfoList.${index}.modelConfig`] = [
      //     { required: true, message: '请输入机型配置', trigger: 'blur' }
      //   ]
      // })

      return rules
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initDialog()
        // 监听对话框打开，防止自动滚动
        this.$nextTick(() => {
          this.preventAutoScroll()
        })
      }
    },
    formData: {
      handler(newVal) {
        if (newVal) {
          this.localFormData = {
            ...newVal,
            requirementInfoList: newVal.requirementInfoList || []
          }
        } else {
          this.localFormData = {
            customer: '',
            customerClass: '',
            projectManager: '',
            marketManager: '',
            projectStartTime: '',
            massProductionTime: '',
            validationStandard: '',
            productCertification: '',
            environmentalRequirements: '',
            aqlStandard: '',
            qualityInfo: '', // 质量协议
            validationAttachment: '',
            certificationAttachment: '',
            environmentalAttachment: '',
            aqlAttachment: '',
            qualityAgreement: '', // 质量协议附件
            requirementInfoList: []
          }
          // 如果是新增模式，默认添加一个机型配置
          if (!this.isEdit && !this.isView) {
            this.addModelConfig()
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 初始化对话框
    async initDialog() {
      // 记录当前滚动位置
      const dialogContent = document.querySelector('.el-dialog__body')
      const initialScrollTop = dialogContent ? dialogContent.scrollTop : 0

      await Promise.all([
        this.loadCategoryOptions(),
        this.loadCustomerOptions(),
        this.loadCustomerTypeOptions(),
        this.loadUserOptions()
      ])

      // 确保 categoryData 初始化，为 select-loadMore 提供数据
      if (this.categoryData.data.length === 0) {
        await this.getCategoryList(1)
      }

      // 确保 customerData 初始化，为 select-loadMore 提供数据
      if (this.customerData.data.length === 0) {
        await this.getCustomerData({ page: 1 })
      }

      // 确保用户数据初始化，为 select-loadMore 提供数据
      if (this.userProjectData.data.length === 0) {
        await this.getUserProjectData({ page: 1 })
      }
      if (this.userMarketData.data.length === 0) {
        await this.getUserMarketData({ page: 1 })
      }

      // 如果是编辑模式，确保加载足够的品类数据以便正确回显
      if ((this.isEdit || this.isView) && this.localFormData.requirementInfoList) {
        const existingCategoryIds = this.localFormData.requirementInfoList
          .map(item => item.category)
          .filter(id => id)
        
        // 检查现有的品类ID是否都在当前数据中
        const missingIds = existingCategoryIds.filter(id => 
          !this.categoryData.data.some(item => item.id === id)
        )
        
        if (missingIds.length > 0) {
          // 如果有缺失的品类ID，尝试加载更多数据
          console.log('检测到缺失的品类ID，尝试加载更多数据:', missingIds)
          for (let page = 2; page <= 5; page++) {
            await this.getCategoryList(page)
            const stillMissing = missingIds.filter(id => 
              !this.categoryData.data.some(item => item.id === id)
            )
            if (stillMissing.length === 0) break
          }
        }
      }

      // 如果是新增模式且没有机型配置，添加一个默认的
      if (!this.isEdit && !this.isView && this.localFormData.requirementInfoList.length === 0) {
        this.addModelConfig()
      }
      
      // 重置表单验证并防止自动滚动
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
        
        // 恢复滚动位置到顶部，防止自动滚动到底部
        if (dialogContent) {
          dialogContent.scrollTop = 0
        }
      })
    },

    // 添加机型配置
    addModelConfig() {
      // 记录当前滚动位置
      const dialogContent = document.querySelector('.el-dialog__body')
      const currentScrollTop = dialogContent ? dialogContent.scrollTop : 0
      
      const newConfig = {
        id: null,
        category: '',
        modelConfig: '',
        requirementId: null
      }
      this.localFormData.requirementInfoList.push(newConfig)

      // 清除表单验证，避免在添加新配置时触发验证
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
        
        // 恢复滚动位置，防止自动滚动到底部
        if (dialogContent) {
          dialogContent.scrollTop = currentScrollTop
        }
      })
    },

    // 删除机型配置
    removeModelConfig(index) {
      this.$confirm('确定要删除这个机型配置吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.localFormData.requirementInfoList.splice(index, 1)
        // 清除对应的表单验证
        this.$nextTick(() => {
          if (this.$refs.form) {
            this.$refs.form.clearValidate()
          }
        })
      }).catch(() => {
        // 用户取消删除
      })
    },

    // 为 select-loadMore 组件提供的分页加载方法
    async getCategoryList(params = {}, pageSize = 20) {
      try {
        // 处理参数，如果第一个参数是对象，则从中提取页码
        const currentPage = typeof params === 'object' && params.page ? params.page : (typeof params === 'number' ? params : 1)
        console.log(`获取品类列表 - 页码: ${currentPage}, 每页数量: ${pageSize}`)

        // 首先尝试主API
        let res = await afterCategoryList({ p: currentPage, pageSize })
        console.log('品类API响应 (afterCategoryList):', res)

        if (res.code === 200 && res.data) {
          // 处理不同的数据结构
          if (res.data.list && res.data.list.length > 0) {
            const formattedData = res.data.list.map(item => ({
              id: item.id,
              name: item.name || item.categoryName || item.label
            }))

            // 更新 categoryData 用于组件状态管理
            if (currentPage === 1) {
              this.categoryData.data = formattedData
            } else {
              this.categoryData.data = [...this.categoryData.data, ...formattedData]
            }
            this.categoryData.page = currentPage
            this.categoryData.more = res.data.list.length === pageSize

            return {
              data: formattedData,
              hasMore: res.data.list.length === pageSize
            }
          } else if (Array.isArray(res.data) && res.data.length > 0) {
            const formattedData = res.data.map(item => ({
              id: item.id,
              name: item.name || item.categoryName || item.label
            }))

            if (currentPage === 1) {
              this.categoryData.data = formattedData
            } else {
              this.categoryData.data = [...this.categoryData.data, ...formattedData]
            }
            this.categoryData.page = currentPage
            this.categoryData.more = res.data.length === pageSize

            return {
              data: formattedData,
              hasMore: res.data.length === pageSize
            }
          }
        }

        // 如果主API没有数据，尝试备用API
        console.log('主API无数据，尝试备用API...')
        const { getCategoryList: getCategoryListAPI } = await import('@/api/quote-management/quotation')
        res = await getCategoryListAPI()
        console.log('品类API响应 (getCategoryListAPI):', res)

        if (res.code === 200 && res.data) {
          let formattedData = []
          if (Array.isArray(res.data)) {
            formattedData = res.data.map(item => ({
              id: item.id,
              name: item.name || item.categoryName || item.label
            }))
          } else if (res.data.list) {
            formattedData = res.data.list.map(item => ({
              id: item.id,
              name: item.name || item.categoryName || item.label
            }))
          }

          if (currentPage === 1) {
            this.categoryData.data = formattedData
          } else {
            this.categoryData.data = [...this.categoryData.data, ...formattedData]
          }
          this.categoryData.page = currentPage
          this.categoryData.more = false // 备用API通常返回全部数据

          return {
            data: formattedData,
            hasMore: false
          }
        }

        console.error('所有API都无数据')
        return {
          data: [],
          hasMore: false
        }

      } catch (error) {
        console.error('获取品类数据失败:', error)
        this.$message.error('获取品类数据失败: ' + (error.message || '未知错误'))
        return {
          data: [],
          hasMore: false
        }
      }
    },
    
    // 加载品类选项
    async loadCategoryOptions() {
      try {
        // 首先尝试主API
        let res = await afterCategoryList({ p: 1, pageSize: 100 })
        console.log('品类API响应 (afterCategoryList):', res)
        
        if (res.code === 200 && res.data) {
          // 处理不同的数据结构
          if (res.data.list && res.data.list.length > 0) {
            this.categoryOptions = res.data.list
            console.log('品类选项加载成功 (afterCategoryList):', this.categoryOptions.length, '条')
            return
          } else if (Array.isArray(res.data) && res.data.length > 0) {
            this.categoryOptions = res.data
            console.log('品类选项加载成功 (afterCategoryList):', this.categoryOptions.length, '条')
            return
          }
        }
        
        // 如果主API没有数据，尝试备用API
        console.log('主API无数据，尝试备用API...')
        res = await getCategoryList()
        console.log('品类API响应 (getCategoryList):', res)
        
        if (res.code === 200 && res.data) {
          if (Array.isArray(res.data)) {
            this.categoryOptions = res.data.map(item => ({
              id: item.id,
              name: item.name || item.categoryName || item.label
            }))
          } else if (res.data.list) {
            this.categoryOptions = res.data.list.map(item => ({
              id: item.id,
              name: item.name || item.categoryName || item.label
            }))
          }
          console.log('品类选项加载成功 (getCategoryList):', this.categoryOptions.length, '条')
        } else {
          console.error('备用API也无数据')
          this.categoryOptions = []
        }
        
        if (this.categoryOptions.length === 0) {
          this.$message.warning('暂无品类数据')
        }
        
      } catch (error) {
        console.error('获取品类数据失败:', error)
        this.categoryOptions = []
        this.$message.error('获取品类数据失败: ' + (error.message || '未知错误'))
      }
    },
    
    // 加载客户选项 (保留原有方法作为备用)
    async loadCustomerOptions() {
      try {
        const res = await getCustomerList({ p: 1, pageSize: 100 })
        console.log('客户API响应:', res)
        
        if (res.code === 200) {
          // 处理不同的数据结构
          if (res.data && res.data.list) {
            this.customerOptions = res.data.list.map(item => ({
              id: item.id,
              name: item.name || item.customerName || item.companyName
            }))
          } else if (res.data && Array.isArray(res.data)) {
            this.customerOptions = res.data.map(item => ({
              id: item.id,
              name: item.name || item.customerName || item.companyName
            }))
          } else {
            console.warn('意外的客户数据结构:', res.data)
            this.customerOptions = []
          }
          console.log('客户选项加载成功:', this.customerOptions.length, '条')
        } else {
          console.error('客户API返回错误:', res.msg)
          this.customerOptions = []
        }
        
        if (this.customerOptions.length === 0) {
          this.$message.warning('暂无客户数据')
        }
        
      } catch (error) {
        console.error('获取客户数据失败:', error)
        this.customerOptions = []
        this.$message.error('获取客户数据失败: ' + (error.message || '未知错误'))
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
    
    // 加载客户类型选项
    async loadCustomerTypeOptions() {
      try {
        const res = await getDicts('customer_type_enum')
        console.log('客户类型字典API响应:', res)
        
        if (res.code === 200 && res.data) {
          this.customerTypeOptions = res.data.filter(item => item.status === '0') // 只显示启用的字典项
          console.log('客户类型选项加载成功:', this.customerTypeOptions.length, '条')
        } else {
          console.error('客户类型字典API返回错误:', res.msg)
          this.customerTypeOptions = []
        }
        
        if (this.customerTypeOptions.length === 0) {
          this.$message.warning('暂无客户类型数据')
        }
        
      } catch (error) {
        console.error('获取客户类型字典失败:', error)
        this.customerTypeOptions = []
        this.$message.error('获取客户类型字典失败: ' + (error.message || '未知错误'))
      }
    },

    // 获取项目负责人数据 (用于 select-loadMore 组件)
    getUserProjectData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        // 字典接口，获取所有数据，无分页
        dictPmProject().then((res) => {
          if (res && res.data) {
            let list = [];
            // 处理不同的数据结构
            if (Array.isArray(res.data)) {
              list = res.data.map(item => ({
                id: item.id || item.dictValue,
                userName: item.dictValue || item.userName || item.name,
                displayName: item.dictLabel || item.nickName || item.userName || item.name
              }));
            } else if (res.data.list) {
              list = res.data.list.map(item => ({
                id: item.id || item.dictValue,
                userName: item.dictValue || item.userName || item.name,
                displayName: item.dictLabel || item.nickName || item.userName || item.name
              }));
            }

            // 如果有关键字，进行客户端过滤
            if (keyword) {
              list = list.filter(item => 
                item.displayName.includes(keyword) || 
                item.userName.includes(keyword)
              );
            }

            // 去重处理
            const uniqueUsers = [];
            const userNameSet = new Set();
            list.forEach(user => {
              if (!userNameSet.has(user.userName)) {
                userNameSet.add(user.userName);
                uniqueUsers.push(user);
              }
            });

            // 字典接口返回所有数据，不需要分页
            this.userProjectData.data = uniqueUsers;
            this.userProjectData.more = false; // 没有更多数据
            this.userProjectData.page = 1;
          } else {
            console.error('获取项目负责人数据失败:', res?.msg);
          }
          resolve();
        }).catch(error => {
          console.error('获取项目负责人数据异常:', error);
          resolve();
        });
      });
    },

    // 获取市场负责人数据 (用于 select-loadMore 组件)
    getUserMarketData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        // 字典接口，获取所有数据，无分页
        dictMkProject().then((res) => {
          if (res && res.data) {
            let list = [];
            // 处理不同的数据结构
            if (Array.isArray(res.data)) {
              list = res.data.map(item => ({
                id: item.id || item.dictValue,
                userName: item.dictValue || item.userName || item.name,
                displayName: item.dictLabel || item.nickName || item.userName || item.name
              }));
            } else if (res.data.list) {
              list = res.data.list.map(item => ({
                id: item.id || item.dictValue,
                userName: item.dictValue || item.userName || item.name,
                displayName: item.dictLabel || item.nickName || item.userName || item.name
              }));
            }

            // 如果有关键字，进行客户端过滤
            if (keyword) {
              list = list.filter(item => 
                item.displayName.includes(keyword) || 
                item.userName.includes(keyword)
              );
            }

            // 去重处理
            const uniqueUsers = [];
            const userNameSet = new Set();
            list.forEach(user => {
              if (!userNameSet.has(user.userName)) {
                userNameSet.add(user.userName);
                uniqueUsers.push(user);
              }
            });

            // 字典接口返回所有数据，不需要分页
            this.userMarketData.data = uniqueUsers;
            this.userMarketData.more = false; // 没有更多数据
            this.userMarketData.page = 1;
          } else {
            console.error('获取市场负责人数据失败:', res?.msg);
          }
          resolve();
        }).catch(error => {
          console.error('获取市场负责人数据异常:', error);
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
          
          res.data.forEach(user => {
            if (!userNameSet.has(user.userName)) {
              userNameSet.add(user.userName)
              uniqueUsers.push(user)
            }
          })
          
          this.userOptions = uniqueUsers
          console.log('用户选项加载成功:', this.userOptions.length, '条')
        } else {
          console.error('用户API返回错误:', res?.msg)
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
    
    // 提交表单
    async handleSubmit() {
      try {
        await this.$refs.form.validate()

        // 验证至少有一个机型配置
        if (this.localFormData.requirementInfoList.length === 0) {
          this.$message.error('请至少添加一个机型配置')
          return
        }
        
        this.submitLoading = true
        
        const submitData = {
          ...this.localFormData
        }

        // 格式化日期字段，添加时分秒
        if (submitData.projectStartTime) {
          submitData.projectStartTime = submitData.projectStartTime + ' 00:00:00'
        }
        if (submitData.massProductionTime) {
          submitData.massProductionTime = submitData.massProductionTime + ' 00:00:00'
        }

        // 处理机型配置列表，移除空的配置项
        submitData.requirementInfoList = submitData.requirementInfoList.filter(item =>
          item.category && item.modelConfig
        ).map(item => ({
          ...item,
          requirementId: this.isEdit ? this.localFormData.id : null
        }))
        
        let response
        if (this.isEdit) {
          response = await updateCustomerRequirement(submitData)
        } else {
          response = await addCustomerRequirement(submitData)
        }
        
        if (response.code === 200) {
          this.$message.success(this.isEdit ? '更新成功' : '创建成功')
          this.$emit('success')
        } else {
          this.$message.error(response.msg || (this.isEdit ? '更新失败' : '创建失败'))
        }
      } catch (error) {
        if (error !== false) { // 表单验证失败时不显示错误消息
          console.error('提交客户要求失败:', error)
          this.$message.error(this.isEdit ? '更新失败' : '创建失败')
        }
      } finally {
        this.submitLoading = false
      }
    },
    
    // 防止自动滚动的方法
    preventAutoScroll() {
      const dialogContent = document.querySelector('.el-dialog__body')
      if (!dialogContent) return

      // 只在对话框刚打开时设置滚动位置为顶部
      dialogContent.scrollTop = 0

      // 监听富文本编辑器的初始化事件，防止编辑器导致的自动滚动
      this.$nextTick(() => {
        const editors = document.querySelectorAll('.tox-edit-area iframe')
        editors.forEach(editor => {
          editor.addEventListener('load', () => {
            setTimeout(() => {
              // 只有当滚动位置接近底部时才重置到顶部（防止编辑器初始化导致的滚动）
              if (dialogContent && dialogContent.scrollTop > dialogContent.scrollHeight - dialogContent.clientHeight - 100) {
                dialogContent.scrollTop = 0
              }
            }, 100)
          })
        })
      })
    },

    // 关闭对话框
    handleClose() {
      this.$emit('update:visible', false)
      
      
      // 重置选项列表
      this.customerOptions = []
      this.categoryOptions = []
      this.customerTypeOptions = []
      
      // 重置 select-loadMore 数据
      this.customerData = {
        data: [],
        page: 1,
        more: true,
      }
      this.userProjectData = {
        data: [],
        page: 1,
        more: true,
      }
      this.userMarketData = {
        data: [],
        page: 1,
        more: true,
      }
      
      // 重置表单
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.resetFields()
          this.$refs.form.clearValidate()
        }
      })
    }
  }
}
</script>

<style scoped>
.requirement-form {
  padding: 0 20px;
}

/* fieldset样式 */
.form-fieldset {
  border: 1px solid #dcdfe6;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-fieldset legend {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  padding: 0 10px;
}

.dialog-footer {
  text-align: right;
  padding: 0 20px;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

/* 表单项间距优化 */
.requirement-form .el-form-item {
  margin-bottom: 18px;
}

.requirement-form .el-form-item:last-child {
  margin-bottom: 0;
}

/* 文本域样式 */
.requirement-form .el-textarea__inner {
  resize: vertical;
  min-height: 80px;
}

/* 上传组件样式 */
.requirement-form .el-upload-list {
  margin-top: 10px;
}

/* 表单布局优化 */
.requirement-form .el-select,
.requirement-form .el-date-picker {
  width: 100%;
}

/* 查看模式样式 */
.requirement-form .el-input.is-disabled .el-input__inner,
.requirement-form .el-select.is-disabled .el-input__inner,
.requirement-form .el-date-editor.is-disabled .el-input__inner {
  background-color: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #606266 !important;
}

.requirement-form .el-textarea.is-disabled .el-textarea__inner {
  background-color: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #606266 !important;
}

/* 机型配置样式 */
.model-config-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  background: #fff;
  position: absolute;
    top:-25px;
    right:20px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.empty-hint {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 40px 0;
  background-color: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}

.model-config-item {
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 15px;
  background-color: #fafbfc;
}

.model-config-item:last-child {
  margin-bottom: 0;
}

/* 删除按钮样式 */
.delete-button {
  position: absolute;
  top: -12px;
  right: -10px;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
  background-color: #f56c6c;
  color: white;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background-color: #e54545;
  transform: scale(1.1);
}

.delete-button i {
  font-size: 12px;
  font-weight: bold;
}

.config-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.config-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

/* 优化对话框滚动行为 */
::v-deep .el-dialog__body {
  scroll-behavior: smooth;
}
 
 
</style>
