<template>
  <div>
    <!-- 主编辑对话框 -->
    <el-dialog 
      title="编辑包装信息" 
      :visible.sync="dialogVisible" 
      width="99%" 
      top="0vh"
      :close-on-click-modal="false"
      append-to-body
      custom-class="packaging-dialog"
      @close="handleClose"
    >
      <!-- 复制包装信息按钮 -->
      <div class="copy-btn-area">
        <el-button 
          type="primary" 
          icon="el-icon-document-copy" 
          size="small"
          @click="copyDialogVisible = true"
        >
          从其他型号复制包装信息
        </el-button>
      </div>

      <div class="packaging-form">
        <!-- 使用 el-table 标准多级表头 - 完全从配置文件渲染 -->
        <el-table 
          :data="tableData" 
          border 
          size="small"
          style="width: 100%"
          class="packaging-table-vertical-top no-hover-table"
          :cell-style="cellStyle"
          :row-style="rowStyle"
          :row-class-name="getRowClassName"
        >
          <!-- 遍历配置文件中的所有分组 -->
          <template v-for="(groupConfig, groupKey) in PACKAGING_FIELDS">
            <!-- 情况1: 解件出库方式 - 有多个子列 -->
            <el-table-column 
              v-if="groupConfig.formType !== 'select-with-richtext'"
              :key="`multi-${groupKey}`"
              :label="groupConfig.displayName" 
              align="center"
            >
              <!-- 遍历该分组下的所有字段 -->
              <el-table-column 
                v-for="(fieldConfig, fieldKey) in groupConfig.fields"
                :key="fieldKey"
                :label="fieldConfig.displayName"
                :width="fieldConfig.width"
                :min-width="fieldConfig.minWidth"
                header-align="center"
              >
                <template slot-scope="scope">
                  <!-- select 类型 -->
                  <div v-if="fieldConfig.formType === 'select'" class="simple-select-cell">
                    <el-select 
                      v-model="formData[groupKey][fieldKey]" 
                      placeholder="请选择" 
                      size="small"
                      style="width: 100%"
                    >
                      <el-option 
                        v-for="opt in fieldConfig.options"
                        :key="opt.value"
                        :label="opt.label" 
                        :value="opt.value" 
                      />
                    </el-select>
                  </div>
                  
                  <!-- richtext 类型 -->
                  <div v-else-if="fieldConfig.formType === 'richtext'" class="rich-text-cell full-height-cell">
                    <Editor 
                      v-if="dialogVisible"
                      :key="`editor-${groupKey}-${fieldKey}-${editorKey}`"
                      v-model="formData[groupKey][fieldKey]" 
                      :min-height="fieldConfig.minHeight || 284"
                      placeholder="请输入其它附件要求，可使用工具栏的图片按钮上传图片或文件"
                      :toolbar="customToolbar"
                    />
                  </div>
                </template>
              </el-table-column>
            </el-table-column>
            
            <!-- 情况2: 下拉框+富文本类型（附件装箱方式、箱唛要求、检验报告要求） -->
            <el-table-column 
              v-else
              :key="`single-${groupKey}`"
              :label="groupConfig.displayName" 
              :min-width="groupConfig.minWidth"
              header-align="center"
            >
              <template slot-scope="scope">
                <div class="select-with-rich-cell">
                  <!-- 下拉框 -->
                  <el-select 
                    v-model="formData[groupKey].value" 
                    placeholder="请选择" 
                    size="small"
                    style="width: 100%; margin-bottom: 10px;"
                    @change="handleSelectChange(groupKey)"
                  >
                    <el-option 
                      v-for="opt in groupConfig.fields.value.options"
                      :key="opt.value"
                      :label="opt.label" 
                      :value="opt.value" 
                    />
                  </el-select>
                  
                  <!-- 富文本（条件显示） -->
                  <div v-if="shouldShowEditorByConfig(groupKey)" class="admin-editor-wrapper">
                    <div class="admin-editor-box">
                      <Editor 
                        v-if="dialogVisible"
                        :key="`editor-${groupKey}-admin-${editorKey}`"
                        v-model="formData[groupKey].administrator" 
                        :min-height="groupConfig.fields.administrator.minHeight || 230"
                        placeholder="可使用工具栏的图片按钮上传多张图片或其它文件，支持在线查看和下载"
                        :toolbar="customToolbar"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
          </template>
        </el-table>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose" size="small">取 消</el-button>
        <el-button type="primary" @click="handleSave" size="small" :loading="saving">保 存</el-button>
      </div>
    </el-dialog>

    <!-- 复制包装信息对话框 -->
    <el-dialog
      title="从其他型号复制包装信息"
      :visible.sync="copyDialogVisible"
      width="90%"
      top="0vh"
      :close-on-click-modal="false"
      append-to-body
      @open="handleCopyDialogOpen"
    >
      <div class="copy-dialog-content">
        <!-- 搜索表单 -->
        <el-form :inline="true" size="small" class="copy-search-form">
          <el-form-item label="所属品类">
            <el-select 
              v-model="copySearch.categoryId" 
              @change="handleCategoryChange"
              filterable 
              clearable 
              placeholder="请选择品类" 
              style="width: 180px;"
            >
              <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="仪表型号">
            <el-select 
              v-model="copySearch.computerId" 
              :loading="isCLoading"
              filterable 
              remote 
              clearable 
              placeholder="请输入仪表型号搜索"
              style="width: 200px;"
              :remote-method="handleRemoteSearchComputer"
            >
              <el-option v-for="item in computerOptions" :key="item.model" :label="item.name" :value="item.model" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleSearchCopy" :loading="copySearchLoading">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="handleResetCopySearch">重置</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 搜索结果列表 -->
        <el-table 
          v-loading="copySearchLoading"
          :data="copySearchResults" 
          border 
          size="small"
          height="58vh"
          highlight-current-row
        >
        <el-table-column label="品类" prop="category" width="80">
            <template slot-scope="{ row }">
              {{ row.category || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="型号" prop="computerName" min-width="120" fixed="left">
            <template slot-scope="{ row }">
              {{ row.computerName || '--' }}
            </template>
          </el-table-column>
 
          <el-table-column label="客户" prop="customerName" width="100">
            <template slot-scope="{ row }">
              {{ row.customerName || '--' }}
            </template>
          </el-table-column>
          
          <!-- 包装信息 -->
          <el-table-column label="包装信息" align="center">
            <el-table-column label="附件出货方式" align="center">
              <el-table-column label="支架螺丝" align="center" width="120">
                <template slot-scope="{ row }">
                  <span v-NoData="getPackagingPreviewValue(row, '解件出库方式', '支架螺丝')"></span>
                </template>
              </el-table-column>
              <el-table-column label="按键螺丝" align="center" width="120">
                <template slot-scope="{ row }">
                  <span v-NoData="getPackagingPreviewValue(row, '解件出库方式', '按键螺丝')"></span>
                </template>
              </el-table-column>
              <el-table-column label="硅胶垫片" align="center" width="120">
                <template slot-scope="{ row }">
                  <span v-NoData="getPackagingPreviewValue(row, '解件出库方式', '硅胶垫片')"></span>
                </template>
              </el-table-column>
              <el-table-column label="其它附件要求" header-align="center" align="left" min-width="180" class-name="rich-text-cell-column">
                <template slot-scope="{ row }">
                  <div 
                    v-html="getPackagingPreviewValue(row, '解件出库方式', '其它附件要求')" 
                    class="rich-text-content"
                  ></div>
                </template>
              </el-table-column>
            </el-table-column>

            <el-table-column label="附件装箱方式" header-align="center" align="left" min-width="180" class-name="rich-text-cell-column">
              <template slot-scope="{ row }">
                <div>
                  <div class="select-value-text">{{ getPackagingPreviewValue(row, '附件装箱方式', 'value') }}</div>
                  <div v-if="shouldShowAdministrator(getPackagingPreviewValue(row, '附件装箱方式', 'value')) && getPackagingPreviewValue(row, '附件装箱方式', 'administrator')" 
                       v-html="getPackagingPreviewValue(row, '附件装箱方式', 'administrator')" 
                       class="rich-text-content text-muted"></div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="箱唛要求" header-align="center" align="left" min-width="180" class-name="rich-text-cell-column">
              <template slot-scope="{ row }">
                <div>
                  <div class="select-value-text">{{ getPackagingPreviewValue(row, '箱唛要求', 'value') }}</div>
                  <div v-if="shouldShowAdministrator(getPackagingPreviewValue(row, '箱唛要求', 'value')) && getPackagingPreviewValue(row, '箱唛要求', 'administrator')" 
                       v-html="getPackagingPreviewValue(row, '箱唛要求', 'administrator')" 
                       class="rich-text-content text-muted"></div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="检验报告要求" header-align="center" align="left" min-width="180" class-name="rich-text-cell-column">
              <template slot-scope="{ row }">
                <div>
                  <div class="select-value-text">{{ getPackagingPreviewValue(row, '检验报告要求', 'value') }}</div>
                  <div v-if="shouldShowAdministrator(getPackagingPreviewValue(row, '检验报告要求', 'value')) && getPackagingPreviewValue(row, '检验报告要求', 'administrator')" 
                       v-html="getPackagingPreviewValue(row, '检验报告要求', 'administrator')" 
                       class="rich-text-content text-muted"></div>
                </div>
              </template>
            </el-table-column>
          </el-table-column>
          
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template slot-scope="{ row }">
              <el-button 
                type="primary" 
                size="mini" 
                icon="el-icon-document-copy"
                :disabled="!row.packagingInfo"
                @click="handleCopyPackaging(row)"
              >
                复制
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <el-pagination
          v-if="copyTotal > 0"
          style="margin-top: 15px; text-align: right;"
          @size-change="handleCopySizeChange"
          @current-change="handleCopyPageChange"
          :current-page="copySearch.p"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="copySearch.l"
          :total="copyTotal"
          layout="total, sizes, prev, pager, next, jumper"
        >
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Editor from '@/components/Editor'
import { 
  PACKAGING_FIELDS, 
  getFieldValue, 
  normalizePackagingData,
  getGroupFieldKeys,
  shouldShowRichtext
} from '@/config/fieldConfigs/packaging'
import { categoryComputerDict, computerNameList } from '@/api/third/fileConfig'
import { modelConfigList } from '@/api/third/testApi'

export default {
  name: 'PackagingInfoEdit',
  components: {
    Editor
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    packagingInfo: {
      type: [String, Object, Array],
      default: null
    }
  },
  data() {
    return {
      // 暴露配置给 template 使用
      PACKAGING_FIELDS,
      saving: false,
      tableData: [{}], // 只有一行数据
      // 自定义工具栏：只保留加粗、字体大小、颜色、链接、文件上传
      customToolbar: [
        [{ size: ['small', false, 'large', 'huge'] }],  // 字体大小
        [{ color: [] }],                                 // 字体颜色
        ['link']                                         // 链接（文件上传按钮会自动添加，支持所有类型包括图片和PDF）
      ],
      // 使用配置文件初始化表单数据 - 集中管理，易于维护
      formData: this.initFormData(),
      // 编辑器key，用于强制重新渲染
      editorKey: Date.now(),
      
      // ========== 复制包装信息功能相关 ==========
      copyDialogVisible: false, // 复制对话框可见性
      copySearch: {
        p: 1,
        l: 20,
        categoryId: '',
        computerId: ''
      },
      copySearchLoading: false,
      copySearchResults: [], // 搜索结果
      copyTotal: 0, // 总数
      categoryList: [], // 品类列表
      computerOptions: [], // 型号列表
      isCLoading: false // 型号加载状态
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
    }
  },
  watch: {
    visible(val) {
      if (val) {
        console.log('👁️ 弹窗打开，准备加载数据')
        // 更新编辑器key，强制重新渲染所有编辑器
        this.editorKey = Date.now()
        // 先重置表单，避免显示旧数据
        this.resetForm()
        // 使用 nextTick 确保 packagingInfo prop 已更新
        this.$nextTick(() => {
          this.loadData()
          this.disableTableHover()
        })
      } else {
        console.log('👁️ 弹窗关闭')
      }
    },
    packagingInfo: {
      handler(newVal, oldVal) {
        console.log('🔔 packagingInfo 发生变化')
        console.log('  - 旧值:', oldVal)
        console.log('  - 新值:', newVal)
        console.log('  - 弹窗可见:', this.visible)
        
        // 当 packagingInfo 变化且弹窗可见时，重新加载数据
        if (this.visible && newVal !== undefined) {
          console.log('🔄 触发重新加载数据')
          this.$nextTick(() => {
            this.loadData()
          })
        }
      },
      immediate: false
    }
  },
  mounted() {
    this.disableTableHover()
    this.loadCategoryList()
  },
  methods: {
    // ========== 复制包装信息功能方法 ==========
    
    /**
     * 加载品类列表
     */
    async loadCategoryList() {
      try {
        const res = await categoryComputerDict()
        if (res.code === 200) {
          this.categoryList = res.data || []
        }
      } catch (error) {
        console.error('加载品类列表失败:', error)
      }
    },
    
    /**
     * 复制对话框打开时 - 默认加载列表数据
     */
    handleCopyDialogOpen() {
      // 默认加载第一页数据
      this.handleSearchCopy()
    },
    
    /**
     * 品类改变时 - 完全复制主表格的逻辑
     */
    handleCategoryChange(val) {
      // 清空型号选择
      this.copySearch.computerId = ''
      
      if (val) {
        // 完全按照主表格的方式过滤
        this.computerOptions = this.categoryList.filter(
          (item) => item.id === val
        )[0]?.computerList || []
      } else {
        this.computerOptions = []
      }
    },
    
    /**
     * 远程搜索型号 - 完全复制主表格的逻辑
     */
    handleRemoteSearchComputer(name) {
      if (name) {
        this.isCLoading = false
        computerNameList({
          name,
          categoryId: this.copySearch.categoryId
        }).then((res) => {
          this.computerOptions = res.data
        })
      } else {
        this.computerOptions = []
      }
    },
    
    /**
     * 搜索可复制的包装信息 - 使用与主表格完全相同的API
     */
    async handleSearchCopy() {
      this.copySearchLoading = true
      
      try {
        // 使用与主表格相同的参数格式
        const params = {
          p: this.copySearch.p,
          l: this.copySearch.l
        }
        
        if (this.copySearch.categoryId) {
          params.categoryId = this.copySearch.categoryId
        }
        
        if (this.copySearch.computerId) {
          params.computerId = this.copySearch.computerId
        }
        
        // 使用与主表格相同的API
        const res = await modelConfigList(params)
        
        if (res.code === 200) {
          // 按包装信息配置状态排序
          this.copySearchResults = (res.data.list || []).sort((a, b) => {
            if (a.packagingInfo && !b.packagingInfo) return -1
            if (!a.packagingInfo && b.packagingInfo) return 1
            return 0
          })
          this.copyTotal = res.data.total || 0
        }
      } catch (error) {
        console.error('搜索失败:', error)
        this.$message.error('搜索失败，请重试')
      } finally {
        this.copySearchLoading = false
      }
    },
    
    /**
     * 分页大小改变
     */
    handleCopySizeChange(val) {
      this.copySearch.l = val
      this.copySearch.p = 1
      this.handleSearchCopy()
    },
    
    /**
     * 页码改变
     */
    handleCopyPageChange(val) {
      this.copySearch.p = val
      this.handleSearchCopy()
    },
    
    /**
     * 重置搜索
     */
    handleResetCopySearch() {
      this.copySearch = {
        p: 1,
        l: 20,
        categoryId: '',
        computerId: ''
      }
      this.computerOptions = []
      this.handleSearchCopy()
    },
    
    /**
     * 复制包装信息到当前表单
     */
    handleCopyPackaging(row) {
      this.$confirm(`确定要复制型号"${row.computerName}"的包装信息吗？当前表单内容将被覆盖。`, '提示', {
        confirmButtonText: '确定复制',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        try {
          // 解析并加载包装信息
          let packagingData = row.packagingInfo
          
          if (typeof packagingData === 'string' && packagingData.trim()) {
            packagingData = JSON.parse(packagingData)
          }
          
          if (packagingData && typeof packagingData === 'object') {
            // 使用标准的加载方法
            if (Array.isArray(packagingData)) {
              this.loadOldFormat(packagingData)
            } else {
              this.loadNewFormat(packagingData)
            }
            
            this.$message.success(`已成功复制"${row.computerName}"的包装信息`)
            
            // 关闭复制对话框
            this.copyDialogVisible = false
          } else {
            this.$message.warning('该型号的包装信息格式不正确')
          }
        } catch (error) {
          console.error('复制包装信息失败:', error)
          this.$message.error('复制失败，请重试')
        }
      }).catch(() => {
        // 用户取消
      })
    },
    
    /**
     * 获取包装信息预览值（用于复制对话框中的包装信息显示）
     */
    getPackagingPreviewValue(row, groupName, fieldName) {
      if (!row.packagingInfo) return '';
      
      try {
        let packagingData = row.packagingInfo;
        
        // 如果是字符串，先解析
        if (typeof packagingData === 'string') {
          packagingData = JSON.parse(packagingData);
        }
        
        // 处理新格式数据
        if (typeof packagingData === 'object' && !Array.isArray(packagingData)) {
          // 使用配置文件的工具函数获取字段值
          return getFieldValue(packagingData, groupName, fieldName);
        }
        
        // 处理旧格式数据
        if (Array.isArray(packagingData)) {
          const mapping = {
            '支架螺丝': 'ditaiStandardNoLockAttachment',
            '按键螺丝': 'customerSpecifiedNoLock', 
            '硅胶垫片': 'customerSpecifiedNormalLock'
          };
          
          if (groupName === '解件出库方式' && mapping[fieldName]) {
            const item = packagingData.find(item => item.checkItemId === mapping[fieldName]);
            if (item) {
              return this.convertOldContentId(item.contentId);
            }
          }
          
          // 其他字段的旧格式处理
          const fieldMapping = {
            '附件装箱方式': 'accessoryPackingRequirements',
            '箱唛要求': 'boxMarkRequirements', 
            '检验报告要求': 'inspectionReportRequirements'
          };
          
          if (fieldName === 'value' && fieldMapping[groupName]) {
            const item = packagingData.find(item => item.checkItemId === fieldMapping[groupName]);
            if (item) {
              return this.convertOldContentId(item.contentId);
            }
          }
        }
        
        return '';
      } catch (error) {
        console.error('解析包装信息预览失败:', error);
        return '';
      }
    },
    
    // ========== 数据初始化方法（使用配置文件） ==========
    
    /**
     * 初始化表单数据（完全从配置文件读取）
     * 优势：默认值在配置文件定义，这里无需硬编码
     */
    initFormData() {
      const formData = {}
      
      Object.keys(PACKAGING_FIELDS).forEach(groupKey => {
        formData[groupKey] = {}
        const fields = PACKAGING_FIELDS[groupKey].fields
        
        Object.keys(fields).forEach(fieldKey => {
          // 直接使用配置文件的 defaultValue
          const fieldConfig = fields[fieldKey]
          formData[groupKey][fieldKey] = fieldConfig.defaultValue !== undefined 
            ? fieldConfig.defaultValue 
            : ''
        })
      })
      
      return formData
    },
    
    // ========== 表格样式方法 ==========
    
    // 表格行样式
    rowStyle() {
      return {
        'background-color': '#ffffff !important'
      }
    },
    
    // 表格单元格样式
    cellStyle() {
      return {
        'vertical-align': 'top',
        'background-color': '#ffffff !important'
      }
    },
    
    // 表格行类名
    getRowClassName() {
      return 'custom-no-hover-row'
    },
    
    // 禁用表格hover效果
    disableTableHover() {
      this.$nextTick(() => {
        const table = this.$el.querySelector('.no-hover-table')
        if (table) {
          const rows = table.querySelectorAll('.el-table__body tr')
          rows.forEach(row => {
            row.addEventListener('mouseenter', (e) => {
              const cells = row.querySelectorAll('td')
              cells.forEach(cell => {
                cell.style.backgroundColor = '#ffffff'
              })
            })
          })
        }
      })
    },
    
    handleSelectChange(fieldName) {
      // 下拉框改变时的回调
      console.log(`${fieldName} 选择了:`, this.formData[fieldName].value)
      
      // 所有选项都显示富文本，不需要清空内容
    },
    
    /**
     * 基于配置文件判断是否显示富文本编辑器
     * 修改为：所有下拉框字段都显示富文本编辑器
     */
    shouldShowEditorByConfig(groupKey) {
      const groupConfig = PACKAGING_FIELDS[groupKey]
      
      if (!groupConfig || !groupConfig.fields.administrator) {
        return false
      }
      
      // 始终显示富文本编辑器
      return true
    },
    
    // 兼容旧方法名（如果其他地方还在用）
    shouldShowEditor(fieldName) {
      return this.shouldShowEditorByConfig(fieldName)
    },
    
    /**
     * 判断是否应该显示附件内容（administrator字段）
     * 用于复制对话框中的包装信息显示
     */
    shouldShowAdministrator(value) {
      // 始终显示富文本内容（只要选择了值）
      return true;
    },
    
    loadData() {
      console.log('🔄 开始加载包装信息数据...')
      console.log('📦 原始 packagingInfo:', this.packagingInfo)
      
      if (!this.packagingInfo) {
        console.log('⚠️ packagingInfo 为空，重置表单')
        this.resetForm()
        return
      }

      let processedData = this.packagingInfo

      if (typeof this.packagingInfo === 'string' && this.packagingInfo.trim()) {
        console.log('🔍 检测到字符串格式，开始解析...')
        try {
          processedData = JSON.parse(this.packagingInfo)
          console.log('✅ 解析成功:', processedData)
        } catch (error) {
          console.error('❌ 解析包装信息失败:', error)
          this.resetForm()
          return
        }
      }

      if (Array.isArray(processedData)) {
        console.log('📋 检测到旧格式（数组），使用旧格式加载器')
        this.loadOldFormat(processedData)
      } else if (typeof processedData === 'object') {
        console.log('📋 检测到新格式（对象），使用新格式加载器')
        this.loadNewFormat(processedData)
      } else {
        console.error('❌ 未知的数据格式:', typeof processedData)
      }
    },

    loadOldFormat(oldData) {
      console.log('📥 加载旧格式数据:', oldData)
      
      const mapping = {
        'ditaiStandardNoLockAttachment': { group: '解件出库方式', field: '支架螺丝' },
        'accessoryPackingRequirements': { group: '附件装箱方式', field: 'value' },
        'packagingRequirementsCardboardWaterproofBag': { group: '箱唛要求', field: 'value' },
        'boxMarkRequirements': { group: '箱唛要求', field: 'value' },
        'inspectionReportRequirements': { group: '检验报告要求', field: 'value' }
      }

      oldData.forEach(item => {
        const map = mapping[item.checkItemId]
        if (map) {
          if (map.group === '解件出库方式') {
            this.formData[map.group][map.field] = this.convertOldContentId(item.contentId)
          } else {
            this.formData[map.group].value = this.convertOldContentId(item.contentId)
          }
          
          if (item.details && map.group !== '解件出库方式') {
            this.formData[map.group].administrator = item.details
          }
        }
      })
    },

    convertOldContentId(contentId) {
      const mapping = {
        'ditaiStandardNoLockAttachment': '不锁，以附件出货',
        'customerSpecifiedNoLock': '不锁，以附件出货',
        'customerSpecifiedNormalLock': '锁上出货',
        'ditaiStandardAllAccessoriesUnifiedTailNumber': '放置尾数箱',
        'customerSpecified': '客户模板（参考附件，内容根据订单内容做修改）',
        'accordingToBOM': '迪太模板',
        'ditaiTemplate': '迪太模板',
        'ditaiEnglishIndicators': '迪太模板'
      }
      return mapping[contentId] || contentId
    },

    /**
     * 加载新格式数据（使用配置文件自动处理兼容性）
     * 优势：自动处理历史字段名，无需手动写映射代码
     */
    loadNewFormat(newData) {
      console.log('📥 加载新格式数据:', newData)
      
      // 使用配置文件的工具函数自动标准化数据（自动处理历史别名）
      const normalized = normalizePackagingData(newData)
      console.log('🔄 标准化后的数据:', normalized)
      
      // 将标准化后的数据填充到 formData
      Object.keys(PACKAGING_FIELDS).forEach(groupKey => {
        if (!normalized[groupKey]) return
        
        const fieldKeys = getGroupFieldKeys(groupKey)
        
        fieldKeys.forEach(fieldKey => {
          const value = normalized[groupKey][fieldKey]
          if (value !== undefined) {
            this.$set(this.formData[groupKey], fieldKey, value)
          }
        })
        
        console.log(`✅ ${groupKey} 加载完成:`, this.formData[groupKey])
      })
      
      console.log('✅ 所有数据加载完成，当前formData:', JSON.parse(JSON.stringify(this.formData)))
    },

    /**
     * 重置表单（使用配置文件初始化）
     * 优势：字段修改只需改配置文件，这里无需修改
     */
    resetForm() {
      console.log('🔄 重置表单数据')
      this.formData = this.initFormData()
      // 强制刷新视图，确保富文本编辑器也重置
      this.$nextTick(() => {
        this.$forceUpdate()
      })
    },

    handleSave() {
      const newFormatData = this.convertToNewFormat()
      console.log('💾 保存新格式数据:', newFormatData)
      
      this.$emit('save', newFormatData)
      this.dialogVisible = false
    },

    /**
     * 转换为新格式保存（使用配置文件遍历）
     * 优势：新增字段只需修改配置文件，这里自动处理
     */
    convertToNewFormat() {
      const result = {}

      // 遍历所有分组（从配置文件读取）
      Object.keys(PACKAGING_FIELDS).forEach(groupKey => {
        const fieldKeys = getGroupFieldKeys(groupKey)
        const groupData = {}
        
        fieldKeys.forEach(fieldKey => {
          const value = this.formData[groupKey]?.[fieldKey]
          if (value !== undefined && value !== '') {
            groupData[fieldKey] = value
          }
        })
        
        // 只保存有数据的分组
        if (Object.keys(groupData).length > 0) {
          // 对于 value/administrator 结构，统一保存为对象
          if (fieldKeys.includes('value') && fieldKeys.includes('administrator')) {
            result[groupKey] = {
              value: groupData.value || '',
              administrator: groupData.administrator || ''
            }
          } else {
            result[groupKey] = groupData
          }
        }
      })

      return result
    },

    handleClose() {
      this.dialogVisible = false
      // 关闭时重置表单，避免下次打开显示旧数据
      this.$nextTick(() => {
        this.resetForm()
      })
    }
  }
}
</script>

<style scoped lang="scss">
.packaging-dialog {
  :deep(.el-dialog__body) {
    padding: 15px;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }
}

/* 复制包装信息按钮区域 */
.copy-btn-area {
  margin-bottom: 15px;
  padding: 10px 15px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  text-align: center;
}

/* 复制对话框内容 */
.copy-dialog-content {
  .copy-search-form {
    padding: 15px 15px 0 15px;
    background: #F8F9FA;
    border-radius: 8px;
    margin-bottom: 15px;
  }
  
  /* 包装信息预览样式 */
  .packaging-preview {
    .packaging-item {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      font-size: 12px;
      line-height: 1.4;
      
      .label {
        color: #606266;
        font-weight: 500;
        min-width: 60px;
        margin-right: 6px;
        flex-shrink: 0;
      }
      
      .value {
        color: #303133;
        flex: 1;
        word-break: break-all;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .text-muted {
    color: #C0C4CC;
    font-style: italic;
  }
  
  /* 复制对话框表格样式 - 与主表格保持一致 */
  .el-table {
 

    /* 针对包含富文本内容的td单元格，强制顶部对齐 */
    ::v-deep .el-table__body td:has(.rich-text-content),
    ::v-deep .el-table__body td:has(.text-muted) {
      vertical-align: top !important;
    }
 
    /* 使用 class-name 精确定位富文本列的单元格 - 最强优先级 */
    ::v-deep .rich-text-cell-column {
      vertical-align: top !important;
    }

    ::v-deep .el-table__body .rich-text-cell-column {
      vertical-align: top !important;
    }

    ::v-deep td.rich-text-cell-column {
      vertical-align: top !important;
    }

    ::v-deep .el-table__body-wrapper .el-table__body td.rich-text-cell-column {
      vertical-align: top !important;
    }

    /* 针对富文本列的 cell 容器 - 覆盖 Element UI 默认居中 */
    ::v-deep td.rich-text-cell-column .cell {
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      justify-content: flex-start !important;
      padding-top: 8px !important;
    }

    /* 表格单元格内的富文本容器 - 确保正确换行和左对齐 */
    ::v-deep .el-table__body-wrapper .el-table__body td {
      .rich-text-content,
      .text-muted {
        text-align: left !important;
        display: block;
      }
      
      /* 确保富文本容器的父级也左对齐、顶部对齐 */
      & > .cell {
        text-align: left;
        vertical-align: top;
      }
    }

    /* 富文本内容样式 - 与主表格保持一致 */
    ::v-deep .rich-text-content {
      max-height: 100px;
      overflow-y: auto;
      font-size: 12px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-word;
      text-align: left;
      padding: 4px 8px;
    }

    /* 下拉框选择值文本样式 - 与主表格保持一致 */
    ::v-deep .select-value-text {
      padding: 4px 0 10px 0;
      margin-bottom: 10px;
      border-bottom: 1px dashed #DCDFE6;
      font-size: 13px;
      color: #303133;
      font-weight: 500;
      width: 100%;
    }
  }
}

.packaging-form {
  :deep(.el-table) {
    border: 1px solid #EBEEF5;
    border-radius: 8px;
    overflow: hidden;
    
    .el-table__header {
      th {
        background: linear-gradient(180deg, #F8F9FA 0%, #F0F2F5 100%);
        color: #303133;
        font-weight: 600;
        border-bottom: 2px solid #E4E7ED;
        padding: 14px 10px;
        font-size: 13px;
      }
    }
    
    .el-table__body {
      tr:hover > td {
        background-color: transparent !important;
      }
    }
    
 
  }
}

// 针对特定表格的垂直对齐样式
.packaging-dialog {
  background: #F8F9FA;
  
  // 禁用hover背景色 - 终极解决方案
  ::v-deep .no-hover-table {
    .el-table__body {
      tr.custom-no-hover-row {
        &:hover > td,
        &:hover > td.el-table__cell {
          background-color: #ffffff !important;
        }
      }
      
      tr:hover > td,
      tr:hover > td.el-table__cell {
        background-color: #ffffff !important;
      }
    }
    
    &.el-table--enable-row-hover .el-table__body tr:hover > td {
      background-color: #ffffff !important;
    }
  }
}

// 简单下拉框单元格
.simple-select-cell {
  display: block;
}

// 富文本单元格（直接显示）
.rich-text-cell {
  padding: 8px 10px;
  height: auto;
  min-height: auto;
  
  &.pink-cell {
    background: linear-gradient(135deg, #FFF9FA 0%, #FFEFF5 100%);
  }
  
  // 100%高度占满容器
  &.full-height-cell {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0;
    
    :deep(.editor) {
      height: 100%;
      display: flex;
      flex-direction: column;
      
      .ql-toolbar {
        flex-shrink: 0;
        padding: 6px 8px;
        min-height: 32px;
        border-radius: 0;
        margin: 0;
      }
      
      .ql-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        .ql-editor {
          flex: 1;
          min-height: 0 !important;
          padding: 8px 10px;
          font-size: 13px;
          line-height: 1.4;
          overflow-y: auto;
          
          &.ql-blank::before {
            font-size: 12px;
            color: #C0C4CC;
          }
        }
      }
      
      // 工具栏按钮更小
      .ql-toolbar .ql-formats {
        margin-right: 10px;
      }
      
      .ql-toolbar button {
        width: 24px;
        height: 24px;
        padding: 2px;
      }
    }
  }
  
  // 让编辑器更紧凑（非全高度模式）
  :deep(.editor) {
    .ql-toolbar {
      padding: 6px 8px;
      min-height: 32px;
      border-radius: 4px 4px 0 0;
    }
    
    .ql-container {
      .ql-editor {
        min-height: 40px !important;
        padding: 8px 10px;
        font-size: 13px;
        line-height: 1.4;
        
        &.ql-blank::before {
          font-size: 12px;
          color: #C0C4CC;
        }
      }
    }
    
    // 工具栏按钮更小
    .ql-toolbar .ql-formats {
      margin-right: 10px;
    }
    
    .ql-toolbar button {
      width: 24px;
      height: 24px;
      padding: 2px;
    }
  }
}

// 下拉框+富文本单元格
.select-with-rich-cell {
  &.pink-cell {
    background: linear-gradient(135deg, #FFF9FA 0%, #FFEFF5 100%);
  }
  
  :deep(.el-select) {
    width: 100%;
    
    .el-input__inner {
      border-radius: 6px;
      border: 1px solid #DCDFE6;
      transition: all 0.3s;
      height: 32px;
      
      &:hover {
        border-color: #C0C4CC;
      }
      
      &:focus {
        border-color: #409EFF;
      }
    }
  }
  
  .admin-editor-wrapper {
    margin-top: 8px;
  }
  
  .admin-editor-box {
    background: #FFF;
    border-radius: 4px;
    border: 1px solid #E4E7ED;
    
    // 让编辑器更紧凑
    :deep(.editor) {
      .ql-toolbar {
        padding: 6px 8px;
        min-height: 32px;
        border-radius: 4px 4px 0 0;
      }
      
      .ql-container {
        .ql-editor {
          min-height: 40px !important;
          padding: 8px 10px;
          font-size: 13px;
          line-height: 1.4;
          
          &.ql-blank::before {
            font-size: 12px;
            color: #C0C4CC;
          }
        }
      }
      
      // 工具栏按钮更小
      .ql-toolbar .ql-formats {
        margin-right: 10px;
      }
      
      .ql-toolbar button {
        width: 24px;
        height: 24px;
        padding: 2px;
      }
    }
  }
}

// 编辑器标签样式
.editor-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 14px;
    background: linear-gradient(180deg, #FF6B9D 0%, #FFA8C5 100%);
    border-radius: 2px;
    margin-right: 6px;
  }
}

.dialog-footer {
  text-align: right;
  border-top: 1px solid #EBEEF5;
  padding-top: 15px;
  margin-top: 20px;
}

:deep(.editor) {
  .ql-toolbar {
    background: linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%);
    border: 1px solid #E4E7ED;
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    padding: 8px 10px;
    
    .ql-stroke {
      stroke: #606266;
    }
    
    .ql-fill {
      fill: #606266;
    }
    
    button:hover {
      .ql-stroke {
        stroke: #409EFF;
      }
      
      .ql-fill {
        fill: #409EFF;
      }
    }
  }
  
  .ql-container {
    border: 1px solid #E4E7ED;
    border-radius: 0 0 6px 6px;
    font-size: 13px;
    line-height: 1.6;
    
    .ql-editor {
      min-height: 180px;
      padding: 12px 15px;
      
      &.ql-blank::before {
        color: #C0C4CC;
        font-style: normal;
        font-size: 13px;
      }
    }
  }
  
  // 确保编辑器内容区域有足够高度
  .ql-editor {
    overflow-y: auto;
  }
}
</style>

<style lang="scss">
/* 全局样式 - 强制禁用包装信息表格的hover效果 */
.packaging-dialog .no-hover-table.el-table tbody tr:hover > td {
  background-color: #ffffff !important;
}

.packaging-dialog .no-hover-table.el-table--enable-row-hover tbody tr:hover > td {
  background-color: #ffffff !important;
}

.packaging-dialog .no-hover-table .custom-no-hover-row:hover > td {
  background-color: #ffffff !important;
}

.packaging-dialog .no-hover-table .el-table__body tr:hover {
  background-color: #ffffff !important;
}
</style>

