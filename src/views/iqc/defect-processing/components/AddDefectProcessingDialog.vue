<template>
  <el-dialog 
    :title="isView ? '查看' : (editData ? '编辑' : '新增')"
    :visible.sync="dialogVisible" 
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
    top="0vh">
    
    <div class="dialog-content">
      <el-form 
        ref="form" 
        :model="form" 
        :rules="rules" 
        label-width="100px"
        :disabled="isView"
        size="mini">
        
        <!-- 基本信息区域 -->
        <fieldset class="form-fieldset">
          <legend>基本信息</legend>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="MRB编号" prop="ecn">
                <el-input 
                  v-model="form.ecn" 
                  placeholder="系统自动生成"
                  readonly
                  class='no-border'
                  prefix-icon="el-icon-document-copy">
                </el-input>
              </el-form-item>

            </el-col>
            <el-col :span="12">
            <el-form-item label="来料记录" prop="inventoryInfoId">
                <select-loadMore
                  v-model="form.inventoryInfoId"
                  style="width: 100%"
                  :data="inventoryData.data"
                  :page="inventoryData.page"
                  :hasMore="inventoryData.more"
                  dictLabel="id"
                  dictValue="id"
                  :request="getInventoryList"
                  placeholder="请选择来料记录"
                  size="mini"
                  :disabled="!!form.id">
                </select-loadMore>

     
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
                        <!-- 来料详细信息展示 -->
                        <div v-if="selectedInventoryInfo && selectedInventoryInfo.invCode" class="inventory-info">
                  <div class="info-item">
                    <span class="label">物料名称:</span>
                    <span class="value">{{ selectedInventoryInfo.invName || '--' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">规格1:</span>
                    <span class="value">{{ selectedInventoryInfo.englishName || '--' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">规格2:</span>
                    <span class="value">{{ selectedInventoryInfo.invStd || '--' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">供应商:</span>
                    <span class="value">{{ selectedInventoryInfo.invDefine || '--' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">到料数量:</span>
                    <span class="value">{{ (selectedInventoryInfo && selectedInventoryInfo.arrivalQuantity) || '--' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">抽检数量:</span>
                    <span class="value">{{ (selectedInventoryInfo && selectedInventoryInfo.samplingQuantity) || '--' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">不良数量:</span>
                    <span class="value">{{ (selectedInventoryInfo && selectedInventoryInfo.defectiveQuantity) || '--' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">不良率:</span>
                    <span class="value">{{ (selectedInventoryInfo && selectedInventoryInfo.defectiveRate) || '--' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">检验结果:</span>
                    <span class="value" :style="{'color':selectedInventoryInfo.testResult=='NG'?'red':'green'}">{{ (selectedInventoryInfo && selectedInventoryInfo.testResult) || '--' }}</span>
                  </div>
                </div>
          </el-row>
        </fieldset>

        <!-- 变更涉及领域 -->
        <fieldset class="form-fieldset">
          <legend>变更涉及领域</legend>
          <!-- 隐藏的全局部门验证项 -->
          <el-form-item prop="departmentValidation" style="display: none;">
            <el-input v-model="form.departmentValidation" />
          </el-form-item>

          <div class="department-grid">
            <!-- 采购部门 (field: 2) -->
            <div class="department-card">
              <div class="department-header">
                <i class="el-icon-shopping-cart-2 department-icon purchase-icon"></i>
                <span class="department-name">采购</span>
              </div>
              <div class="department-content">
                <el-form-item prop="selBuyerData" label="负责人员">
                  <el-select 
                    v-model="form.selBuyerData" 
                    placeholder="请选择采购人员" 
                    filterable 
                    clearable
                    multiple 
                    :loading="buyerData.length === 0" 
                    @change="(val) => handleMultiSelectChange('采购', val)">
                    <el-option 
                      v-for="item in buyerData" 
                      :label="item.personnel" 
                      :value="item.personnel"
                      :key="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <!-- 品质部门 (field: 3) -->
            <div class="department-card">
              <div class="department-header">
                <i class="el-icon-s-check department-icon quality-icon"></i>
                <span class="department-name">品质</span>
              </div>
              <div class="department-content">
                <el-form-item prop="selQualityData" label="负责人员">
                  <el-select 
                    v-model="form.selQualityData" 
                    placeholder="请选择品质人员" 
                    filterable 
                    clearable
                    multiple 
                    :loading="qualityData.length === 0" 
                    @change="(val) => handleMultiSelectChange('品质', val)">
                    <el-option 
                      v-for="item in qualityData" 
                      :label="item.personnel" 
                      :value="item.personnel"
                      :key="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <!-- 生产部门 (field: 4) -->
            <div class="department-card">
              <div class="department-header">
                <i class="el-icon-s-operation department-icon production-icon"></i>
                <span class="department-name">生产</span>
              </div>
              <div class="department-content">
                <el-form-item prop="selProductionData" label="负责人员">
                  <el-select 
                    v-model="form.selProductionData" 
                    placeholder="请选择生产人员" 
                    filterable 
                    clearable
                    multiple 
                    :loading="productionData.length === 0" 
                    @change="(val) => handleMultiSelectChange('生产', val)">
                    <el-option 
                      v-for="item in productionData" 
                      :label="item.personnel" 
                      :value="item.personnel"
                      :key="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <!-- 工程部门 (field: 5) -->
            <div class="department-card">
              <div class="department-header">
                <i class="el-icon-cpu department-icon engineering-icon"></i>
                <span class="department-name">工程</span>
              </div>
              <div class="department-content">
                <el-form-item prop="selEngineeringData" label="负责人员">
                  <el-select 
                    v-model="form.selEngineeringData" 
                    placeholder="请选择工程人员" 
                    filterable 
                    clearable
                    multiple 
                    :loading="engineeringData.length === 0" 
                    @change="(val) => handleMultiSelectChange('工程', val)">
                    <el-option 
                      v-for="item in engineeringData" 
                      :label="item.personnel" 
                      :value="item.personnel"
                      :key="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <!-- 研发部门 (field: 6) -->
            <div class="department-card">
              <div class="department-header">
                <i class="el-icon-cpu department-icon rd-icon"></i>
                <span class="department-name">研发</span>
              </div>
              <div class="department-content">
                <el-form-item prop="selResearchData" label="负责人员">
                  <el-select 
                    v-model="form.selResearchData" 
                    placeholder="请选择研发人员" 
                    filterable 
                    clearable
                    multiple 
                    :loading="researchData.length === 0" 
                    @change="(val) => handleMultiSelectChange('研发', val)">
                    <el-option 
                      v-for="item in researchData" 
                      :label="item.personnel" 
                      :value="item.personnel"
                      :key="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <!-- 仓库部门 (field: 7) -->
            <div class="department-card">
              <div class="department-header">
                <i class="el-icon-box department-icon warehouse-icon"></i>
                <span class="department-name">仓库</span>
              </div>
              <div class="department-content">
                <el-form-item prop="selWarehouseData" label="负责人员">
                  <el-select 
                    v-model="form.selWarehouseData" 
                    placeholder="请选择仓库人员" 
                    filterable 
                    clearable
                    multiple 
                    :loading="warehouseData.length === 0" 
                    @change="(val) => handleMultiSelectChange('仓库', val)">
                    <el-option 
                      v-for="item in warehouseData" 
                      :label="item.personnel" 
                      :value="item.personnel"
                      :key="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <!-- 市场部门 (field: 8) -->
            <div class="department-card">
              <div class="department-header">
                <i class="el-icon-s-marketing department-icon market-icon"></i>
                <span class="department-name">市场</span>
              </div>
              <div class="department-content">
                <el-form-item prop="selMarketerData" label="负责人员">
                  <el-select 
                    v-model="form.selMarketerData" 
                    placeholder="请选择市场人员" 
                    filterable 
                    clearable
                    multiple 
                    :loading="marketerData.length === 0" 
                    @change="(val) => handleMultiSelectChange('市场', val)">
                    <el-option 
                      v-for="item in marketerData" 
                      :label="item.personnel" 
                      :value="item.personnel"
                      :key="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>
            </div>
          </div>
        </fieldset>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer" v-if="!isView">
      <el-button @click="handleClose" size="mini">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading" size="mini">
        {{ editData ? '更 新' : '保 存' }}
      </el-button>
    </div>

    <!-- 来料选择对话框 -->
    <el-dialog
      title="选择来料信息"
      :visible.sync="inventorySelectVisible"
      width="80%"
      :close-on-click-modal="false"
      top="0"
      append-to-body>
      
      <!-- 搜索区域 -->
      <el-form :inline="true" class="search-form" size="mini">
        <el-form-item label="物料编码">
          <el-input v-model="inventorySearchForm.invCode" placeholder="请输入物料编码" clearable style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input v-model="inventorySearchForm.invName" placeholder="请输入物料名称" clearable style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleInventorySearch" icon="el-icon-search">搜索</el-button>
          <el-button @click="handleInventoryReset" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 来料列表 -->
      <el-table 
        :data="inventoryTableData" 
        v-loading="inventoryLoading" 
        border
        style="width: 100%"
        height="60vh"
        @row-click="handleInventoryRowClick"
        close-on-click-modal="false"
        highlight-current-row>
        
        <el-table-column prop="invCode" label="物料编码" align="center" width="140">
          <template slot-scope="scope">
            <span>{{ scope.row.invCode || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="invName" label="物料名称" align="center" width="170">
          <template slot-scope="scope">
            <span>{{ scope.row.invName || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="categoryName" label="品类" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.categoryName || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="arrivalQuantity" label="到料数量" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.arrivalQuantity || 0 }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="samplingQuantity" label="抽检数量" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.samplingQuantity || 0 }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="defectiveQuantity" label="不良数量" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.defectiveQuantity || 0 }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="testInfo" label="规格测量数据" align="center" width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-if="scope.row.testInfo" v-html="scope.row.testInfo"></div>
            <span v-else>--</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="defectiveDesc" label="不良描述" align="center" width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-if="scope.row.defectiveDesc" v-html="scope.row.defectiveDesc"></div>
            <span v-else>--</span>
          </template>
        </el-table-column>
        
 
        <el-table-column prop="createTime" label="创建时间" align="center"  >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleSelectInventoryRow(scope.row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section" style="margin-top: 20px; text-align: right;">
        <el-pagination
          @size-change="handleInventorySizeChange"
          @current-change="handleInventoryCurrentChange"
          :current-page="inventoryPagination.current"
          :page-sizes="[10, 20, 50]"
          :page-size="inventoryPagination.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="inventoryPagination.total">
        </el-pagination>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { 
  addIqcDefectProcessing, 
  updateIqcDefectProcessing, 
  getDefectHandlerPersonnelList
} from '@/api/iqc/defectProcessing'
import { getIqcInspectionDataList } from '@/api/iqc/inspectionData'
import { dictUserList } from '@/api/system/user'
import { afterCategoryList } from '@/api/third/sale'
import { mapGetters } from "vuex";
export default {
  name: 'AddDefectProcessingDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    isView: {
      type: Boolean,
      default: false
    },
    basicInfoId: {
      type: [String, Number],
      default: null
    },
    inspectionDataId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      dialogVisible: this.visible,
      submitLoading: false,
      editData: null,
      form: {
        basicInfoId: '',
        inspectionDataId: '',
        ecn: '',
        handlerPerson: '', // 处理人
        category: '', // 分类ID
        // 来料信息
        inventoryInfoId: '',
        invCode: '',
        invName: '',
        englishName: '',
        invStd: '',
        invDefine: '',
        // 部门人员数据
        selBuyerData: [],
        selQualityData: [],
        selProductionData: [],
        selEngineeringData: [],
        selResearchData: [],
        selWarehouseData: [],
        selMarketerData: [],
        // 部门验证字段
        departmentValidation: ''
      },
      // 人员数据
      buyerData: [],            // 采购人员 (field: 2)
      qualityData: [],          // 品质人员 (field: 3)
      productionData: [],       // 生产人员 (field: 4)
      engineeringData: [],      // 工程人员 (field: 5)
      researchData: [],         // 研发人员 (field: 6)
      warehouseData: [],        // 仓库人员 (field: 7)
      marketerData: [],         // 市场人员 (field: 8)
      allPersonnelData: [],     // 所有人员数据（用于处理人选择）
      // 品类数据
      categoryData: {
        data: [],
        page: 1,
        more: true,
      },
      // 来料编码数据
      inventoryData: {
        data: [],
        page: 1,
        more: true,
      },
      // 来料选择相关
      inventorySelectVisible: false,
      inventoryLoading: false,
      inventoryTableData: [],
      inventorySearchForm: {
        invCode: '',
        invName: ''
      },
      inventoryPagination: {
        current: 1,
        size: 10,
        total: 0
      },
      // 独立存储的来料详细信息（不在form中提交）
      selectedInventoryInfo: null,
      rules: {
        ecn: [
          { required: true, message: 'ECN编号不能为空', trigger: 'blur' }
        ],
        inventoryInfoId: [
          { required: true, message: '来料记录不能为空', trigger: 'blur' }
        ],
        handlerPerson: [
          { required: true, message: '处理人不能为空', trigger: 'blur' }
        ],
        departmentValidation: [
          {
            validator: this.validateDepartments,
            trigger: 'change'
          }
        ],
        category: [
          { required: true, message: '品类不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
 

    // 加载全部用户用于处理人选择
    this.loadAllUsers()
  },
  watch: {
    visible(val) {
      console.log(val,123)
      this.dialogVisible = val
      if (val) {
        // 先初始化表单
        this.initForm()
        // 然后加载人员数据（新增模式下会自动设置默认用户）
        this.loadPersonnelData()
        // 编辑模式下预加载来料数据
        if (this.editData && this.editData.inventoryInfoId) {
          this.getInventoryList()
        }
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    },
    // 监听部门字段变化，触发全局部门验证
    'form.selBuyerData'() {
      this.triggerDepartmentValidation()
    },
    'form.selQualityData'() {
      this.triggerDepartmentValidation()
    },
    'form.selProductionData'() {
      this.triggerDepartmentValidation()
    },
    'form.selEngineeringData'() {
      this.triggerDepartmentValidation()
    },
    'form.selResearchData'() {
      this.triggerDepartmentValidation()
    },
    'form.selWarehouseData'() {
      this.triggerDepartmentValidation()
    },
    'form.selMarketerData'() {
      this.triggerDepartmentValidation()
    },
    // 监听来料记录ID变化
    'form.inventoryInfoId'(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.handleInventoryChange(newVal)
      }
    }
  },
  computed: {
    ...mapGetters(["userId","nickName"]),
  },
  methods: {
    // 打开对话框 - 兼容原有调用方式
    openDialog(editData = null, inventoryInfoId = null) {
      this.editData = editData
      this.dialogVisible = true

      // 先初始化表单
      this.initForm()

      // 如果有来料记录ID，设置到表单中
      if (inventoryInfoId && !editData) {
        this.form.inventoryInfoId = inventoryInfoId
        // 加载来料数据以便回显
        this.getInventoryList().then(() => {
          // 延迟触发来料变化事件以确保数据已加载
          this.$nextTick(() => {
            this.handleInventoryChange(inventoryInfoId)
          })
        })
      }

      // 编辑模式下，确保来料数据已加载
      if (editData && editData.inventoryInfoId) {
        this.getInventoryList().then(() => {
          // 确保来料数据加载完成后，验证选中值是否正确
          this.$nextTick(() => {
            this.form.inventoryInfoId = editData.inventoryInfoId
          })
        })
      }

      // 然后加载人员数据（新增模式下会自动设置默认用户）
      this.loadPersonnelData()
    },
    // 获取结果类型
    getResultType(result) {
      const resultMap = {
        'PASS': 'success',
        'FAIL': 'danger',
        'PENDING': 'warning'
      }
      return resultMap[result] || 'info'
    },
    // 获取品类列表 - 与主页面保持一致
    getCategoryList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        afterCategoryList({
          p: page,
          key: keyword
        }).then((res) => {
          if (res.code === 200 && res.data) {
            const { list, total, pageNum, pageSize } = res.data
            if (more) {
              this.categoryData.data = [...this.categoryData.data, ...list]
            } else {
              this.categoryData.data = list || []
            }
            this.categoryData.more = pageNum * pageSize < total
            this.categoryData.page = pageNum
          } else {
            this.categoryData.data = []
            this.categoryData.more = false
          }
          resolve()
        }).catch((error) => {
          console.error('获取品类数据失败:', error)
          this.categoryData.data = []
          this.categoryData.more = false
          resolve()
        })
      })
    },
    // 获取来料编码列表
    getInventoryList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        const params = {
          p: page,
          l: 10,
          inspectionResult:'NG',
          isEcn:0
        }

        if (keyword) {
          params.id = keyword
        }

        getIqcInspectionDataList(params).then((res) => {
          if (res.code === 200 && res.data) {
            const { list, total } = res.data
            const pageSize = 10

            let processedList = list || []

            // 编辑模式下，确保当前编辑的来料信息在选项中
            if (this.editData && this.editData.inventoryInfoId && !more) {
              const currentItem = processedList.find(item => item.id === this.editData.inventoryInfoId)
              if (!currentItem) {
                // 如果当前编辑的来料不在列表中，则添加进去
                processedList.unshift({
                  id: this.editData.inventoryInfoId,
                  invCode: this.editData.invCode || '',
                  invName: this.editData.invName || '',
                  englishName: this.editData.englishName || '',
                  invStd: this.editData.invStd || '',
                  invDefine: this.editData.invDefine || '',
                  arrivalQuantity: this.editData.arrivalQuantity || 0,
                  samplingQuantity: this.editData.samplingQuantity || 0,
                  defectiveQuantity: this.editData.defectiveQuantity || 0,
                  defectiveRate: this.editData.defectiveRate || '',
                  inspectionResult: this.editData.inspectionResult || 'NG'
                })
              }
            }

            if (more) {
              this.inventoryData.data = [...this.inventoryData.data, ...processedList]
            } else {
              this.inventoryData.data = processedList
            }
            this.inventoryData.more = page * pageSize < total
            this.inventoryData.page = page
          } else {
            this.inventoryData.data = []
            this.inventoryData.more = false
          }
          resolve()
        }).catch((error) => {
          console.error('获取来料数据失败:', error)
          this.inventoryData.data = []
          this.inventoryData.more = false
          resolve()
        })
      })
    },
    // 处理来料编码变化
    handleInventoryChange(value) {
      console.log('handleInventoryChange 调用，参数:', value, typeof value)

      // 根据选中的ID，从inventoryData中找到对应的完整信息
      const selectedItem = this.inventoryData.data.find(item => item.id === value)
      console.log('找到的选中项:', selectedItem)
      if (selectedItem) {
 
        // 更新基本字段到form
        this.form.invName = selectedItem.invName || ''
        this.form.englishName = selectedItem.englishName || ''
        this.form.invStd = selectedItem.invStd || ''
        this.form.invDefine = selectedItem.invDefine || ''
        this.form.inventoryInfoId = selectedItem.id || ''

        // 更新来料详细信息到独立变量
        this.selectedInventoryInfo = selectedItem
      } else {
        // 清空相关字段
        this.form.invName = ''
        this.form.englishName = ''
        this.form.invStd = ''
        this.form.invDefine = ''
        this.form.inventoryInfoId = ''

        // 清空来料详细信息
        this.selectedInventoryInfo = null
      }
    },
    // 加载人员数据
    async loadPersonnelData() {
      try {
        await Promise.all([
          this.getPeopleList(2), // 采购
          this.getPeopleList(3), // 品质
          this.getPeopleList(4), // 生产
          this.getPeopleList(5), // 工程
          this.getPeopleList(6), // 研发
          this.getPeopleList(7), // 仓库
          this.getPeopleList(8)  // 市场
        ])
        
        // 新增模式下，默认选中每个部门的第一个用户
        if (!this.editData) {
          this.setDefaultDepartmentUsers()
        }
      } catch (error) {
        console.error('加载人员数据失败:', error)
      }
    },

    // 设置默认部门用户（新增模式下默认选中每个部门的第一个用户）
    setDefaultDepartmentUsers() {
      // 采购部门 - 默认选中第一个用户
      if (this.buyerData.length > 0) {
        this.form.selBuyerData = [this.buyerData[0].personnel]
      }
      
      // 品质部门 - 默认选中第一个用户
      if (this.qualityData.length > 0) {
        this.form.selQualityData = [this.qualityData[0].personnel]
      }
      
      // 生产部门 - 默认选中第一个用户
      if (this.productionData.length > 0) {
        this.form.selProductionData = [this.productionData[0].personnel]
      }
      
      // 工程部门 - 默认选中第一个用户
      if (this.engineeringData.length > 0) {
        this.form.selEngineeringData = [this.engineeringData[0].personnel]
      }
      
      // 研发部门 - 默认选中第一个用户
      if (this.researchData.length > 0) {
        this.form.selResearchData = [this.researchData[0].personnel]
      }
      
      // 仓库部门 - 默认选中第一个用户
      if (this.warehouseData.length > 0) {
        this.form.selWarehouseData = [this.warehouseData[0].personnel]
      }
      
      // 市场部门 - 默认选中第一个用户
      if (this.marketerData.length > 0) {
        this.form.selMarketerData = [this.marketerData[0].personnel]
      }
      
      // 触发部门验证，确保验证通过
      this.triggerDepartmentValidation()
    },

    // 加载全部系统用户
    async loadAllUsers() {
      try {
        const res = await dictUserList()
        if (res.code === 200 && res.data) {
          // 对数据进行去重处理，避免重复用户
          const uniqueUsers = []
          const userNameSet = new Set()
          
          res.data.forEach(user => {
            if (!userNameSet.has(user.userName)) {
              userNameSet.add(user.userName)
              uniqueUsers.push({
                id: user.userId || user.id,
                personnel: user.userName,
                nickName: user.nickName
              })
            }
          })
          
          this.allPersonnelData = uniqueUsers
        }
      } catch (error) {
        console.error('加载全部用户失败:', error)
      }
    },


    // 获取人员列表
    getPeopleList(type) {
      return getDefectHandlerPersonnelList({ type, p: 1, l: 50 }).then((res) => {
        const { list } = res.data
        switch (type) {
          case 2:
            this.buyerData = list
            break
          case 3:
            this.qualityData = list
            break
          case 4:
            this.productionData = list
            break
          case 5:
            this.engineeringData = list
            break
          case 6:
            this.researchData = list
            break
          case 7:
            this.warehouseData = list
            break
          case 8:
            this.marketerData = list
            break
        }
      }).catch((error) => {
        console.error(`加载人员数据失败(type: ${type}):`, error)
      })
    },

    // 验证部门信息
    validateDepartments(rule, value, callback) {
      const departments = ['selBuyerData', 'selQualityData', 'selProductionData', 'selEngineeringData', 'selResearchData', 'selWarehouseData', 'selMarketerData']
      const hasCompleteDepart = departments.some(dept => {
        return this.form[dept] && this.form[dept].length > 0
      })

      if (!hasCompleteDepart) {
        callback(new Error('请至少选择一个部门的负责人员'))
        return
      }
      callback()
    },

    // 触发部门验证
    triggerDepartmentValidation() {
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.validateField('departmentValidation')
        }
      })
    },

    // 处理多选字段变化
    handleMultiSelectChange(fieldType, selectedValues) {
      console.log(`${fieldType} 多选变化:`, selectedValues)
      this.triggerDepartmentValidation()
    },

    // 生成流程编号
    generateProcessCode() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const time = String(now.getHours()).padStart(2, '0') + 
                   String(now.getMinutes()).padStart(2, '0') + 
                   String(now.getSeconds()).padStart(2, '0')
      return `MRB${year}${month}${day}${time}`
    },

    // 初始化表单
    initForm() {
      if (this.editData) {
        // 编辑模式，填充数据
        this.form = {
          id: this.editData.id,
          basicInfoId: this.editData.basicInfoId || this.basicInfoId,
          inspectionDataId: this.editData.inspectionDataId || this.inspectionDataId,
          ecn: this.editData.ecn || '',
          handlerPerson: this.editData.handlerPerson || '', // 处理人
          // 来料信息
          inventoryInfoId: this.editData.inventoryInfoId || '',
          invCode: this.editData.invCode || '',
          invName: this.editData.invName || '',
          englishName: this.editData.englishName || '',
          invStd: this.editData.invStd || '',
          invDefine: this.editData.invDefine || '',
          // 部门人员数据
          selBuyerData: [],
          selQualityData: [],
          selProductionData: [],
          selEngineeringData: [],
          selResearchData: [],
          selWarehouseData: [],
          selMarketerData: [],
          departmentValidation: ''
        }

        // 映射部门字段数据
        this.mapDepartmentFieldsWithIds(this.editData.list || [])

        // 设置来料详细信息（编辑回显）
        this.selectedInventoryInfo = this.editData

        // 编辑模式下需要预加载来料数据以确保下拉选项中有当前选中的项
        this.getInventoryList().then(() => {
          // 确保来料数据加载完成后，再次设置选中值
          if (this.editData.inventoryInfoId) {
            this.form.inventoryInfoId = this.editData.inventoryInfoId
          }
        })
      } else {
        // 新增模式，生成流程编号
        this.form = {
          basicInfoId: this.basicInfoId,
          inspectionDataId: this.inspectionDataId,
          ecn: this.generateProcessCode(),
          handlerPerson: '', // 处理人
          // 来料信息
          inventoryInfoId: '',
          invCode: '',
          invName: '',
          englishName: '',
          invStd: '',
          supplier: '',
          // 部门人员数据
          selBuyerData: [],
          selQualityData: [],
          selProductionData: [],
          selEngineeringData: [],
          selResearchData: [],
          selWarehouseData: [],
          selMarketerData: [],
          departmentValidation: ''
        }

        // 新增模式下清空来料详细信息
        this.selectedInventoryInfo = null
      }
      
      // 清除验证错误
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },

    // 映射部门字段数据和ID
    mapDepartmentFieldsWithIds(listData) {
      const fieldMap = {}
      listData.forEach(item => {
        if (!fieldMap[item.field]) fieldMap[item.field] = []
        fieldMap[item.field].push(item)
      })

      // 采购数据 (field: 2)
      if (fieldMap[2] && fieldMap[2].length > 0) {
        const buyerNames = fieldMap[2].map(item => item.fieldName)
        this.form.selBuyerData = buyerNames
      }

      // 品质数据 (field: 3)
      if (fieldMap[3] && fieldMap[3].length > 0) {
        const qualityNames = fieldMap[3].map(item => item.fieldName)
        this.form.selQualityData = qualityNames
      }

      // 生产数据 (field: 4)
      if (fieldMap[4] && fieldMap[4].length > 0) {
        const productionNames = fieldMap[4].map(item => item.fieldName)
        this.form.selProductionData = productionNames
      }

      // 工程数据 (field: 5)
      if (fieldMap[5] && fieldMap[5].length > 0) {
        const engineeringNames = fieldMap[5].map(item => item.fieldName)
        this.form.selEngineeringData = engineeringNames
      }

      // 研发数据 (field: 6)
      if (fieldMap[6] && fieldMap[6].length > 0) {
        const researchNames = fieldMap[6].map(item => item.fieldName)
        this.form.selResearchData = researchNames
      }

      // 仓库数据 (field: 7)
      if (fieldMap[7] && fieldMap[7].length > 0) {
        const warehouseNames = fieldMap[7].map(item => item.fieldName)
        this.form.selWarehouseData = warehouseNames
      }

      // 市场数据 (field: 8)
      if (fieldMap[8] && fieldMap[8].length > 0) {
        const marketerNames = fieldMap[8].map(item => item.fieldName)
        this.form.selMarketerData = marketerNames
      }
    },

    // 构建提交数据
    buildSubmitData() {
      const submitData = { ...this.form }
      
      // 构建部门字段列表
      const list = []
      
      // 采购数据 (field: 2)
      if (this.form.selBuyerData && this.form.selBuyerData.length > 0) {
        this.form.selBuyerData.forEach((name) => {
          const buyerItem = {
            field: 2,
            fieldName: name,
            programme: '',
            isCorrelation: 1,
            isComplete: 1,
            bomChangeType: 4 // 来料不良记录
          }
          const selectedUser = this.buyerData.find(user => user.personnel === name)
          if (selectedUser) {
            buyerItem.bomChangeId = selectedUser.id
          }
          list.push(buyerItem)
        })
      }
      
      // 品质数据 (field: 3)
      if (this.form.selQualityData && this.form.selQualityData.length > 0) {
        this.form.selQualityData.forEach((name) => {
          const qualityItem = {
            field: 3,
            fieldName: name,
            programme: '',
            isCorrelation: 1,
            isComplete: 1,
            bomChangeType: 4
          }
          const selectedUser = this.qualityData.find(user => user.personnel === name)
          if (selectedUser) {
            qualityItem.bomChangeId = selectedUser.id
          }
          list.push(qualityItem)
        })
      }
      
      // 生产数据 (field: 4)
      if (this.form.selProductionData && this.form.selProductionData.length > 0) {
        this.form.selProductionData.forEach((name) => {
          const productionItem = {
            field: 4,
            fieldName: name,
            programme: '',
            isCorrelation: 1,
            isComplete: 1,
            bomChangeType: 4
          }
          const selectedUser = this.productionData.find(user => user.personnel === name)
          if (selectedUser) {
            productionItem.bomChangeId = selectedUser.id
          }
          list.push(productionItem)
        })
      }
      
      // 工程数据 (field: 5)
      if (this.form.selEngineeringData && this.form.selEngineeringData.length > 0) {
        this.form.selEngineeringData.forEach((name) => {
          const engineeringItem = {
            field: 5,
            fieldName: name,
            programme: '',
            isCorrelation: 1,
            isComplete: 1,
            bomChangeType: 4
          }
          const selectedUser = this.engineeringData.find(user => user.personnel === name)
          if (selectedUser) {
            engineeringItem.bomChangeId = selectedUser.id
          }
          list.push(engineeringItem)
        })
      }
      
      // 研发数据 (field: 6)
      if (this.form.selResearchData && this.form.selResearchData.length > 0) {
        this.form.selResearchData.forEach((name) => {
          const researchItem = {
            field: 6,
            fieldName: name,
            programme: '',
            isCorrelation: 1,
            isComplete: 1,
            bomChangeType: 4
          }
          const selectedUser = this.researchData.find(user => user.personnel === name)
          if (selectedUser) {
            researchItem.bomChangeId = selectedUser.id
          }
          list.push(researchItem)
        })
      }
      
      // 仓库数据 (field: 7)
      if (this.form.selWarehouseData && this.form.selWarehouseData.length > 0) {
        this.form.selWarehouseData.forEach((name) => {
          const warehouseItem = {
            field: 7,
            fieldName: name,
            programme: '',
            isCorrelation: 1,
            isComplete: 1,
            bomChangeType: 4
          }
          const selectedUser = this.warehouseData.find(user => user.personnel === name)
          if (selectedUser) {
            warehouseItem.bomChangeId = selectedUser.id
          }
          list.push(warehouseItem)
        })
      }
      
      // 市场数据 (field: 8)
      if (this.form.selMarketerData && this.form.selMarketerData.length > 0) {
        this.form.selMarketerData.forEach((name) => {
          const marketerItem = {
            field: 8,
            fieldName: name,
            programme: '',
            isCorrelation: 1,
            isComplete: 1,
            bomChangeType: 4
          }
          const selectedUser = this.marketerData.find(user => user.personnel === name)
          if (selectedUser) {
            marketerItem.bomChangeId = selectedUser.id
          }
          list.push(marketerItem)
        })
      }
      
      submitData.list = list
      return submitData
    },

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          
          // 构建提交数据
          const submitData = this.buildSubmitData()
          if(!this.editData){
            submitData.handlerPerson = this.nickName
          }
          // 调用对应的API
          const apiCall = this.editData 
            ? updateIqcDefectProcessing(submitData)
            : addIqcDefectProcessing(submitData)
          
          apiCall.then((res) => {
            if (res.code === 200) {
              this.$message.success(this.editData ? '更新成功' : '新增成功')
              this.handleClose()
              this.$emit('success')
            } else {
              this.$message.error(res.msg || '操作失败')
            }
          }).catch((error) => {
            console.error('提交失败:', error)
            this.$message.error('操作失败')
          }).finally(() => {
            this.submitLoading = false
          })
        }
      })
    },

    // 关闭对话框
    handleClose() {
      this.dialogVisible = false
      // 重置表单
      this.$refs.form && this.$refs.form.resetFields()
    },

    // ============ 来料选择相关方法 ============
    
    // 打开来料选择对话框
    handleSelectInventory() {
      if (this.isView) return
      this.inventorySelectVisible = true
      this.fetchInventoryData()
    },

    // 获取来料数据
    fetchInventoryData() {
      this.inventoryLoading = true
      
      const params = {
        p: this.inventoryPagination.current,
        l: this.inventoryPagination.size
      }
      
      if (this.inventorySearchForm.inventoryInfoId) params.inventoryInfoId = this.inventorySearchForm.inventoryInfoId
      if (this.inventorySearchForm.invName) params.invName = this.inventorySearchForm.invName

      getIqcInspectionDataList(params).then((res) => {
        if (res.code === 200) {
          this.inventoryTableData = res.data?.list || []
          this.inventoryPagination.total = res.data?.total || 0
        } else {
          this.$message.error(res.msg || '获取来料数据失败')
          this.inventoryTableData = []
          this.inventoryPagination.total = 0
        }
      }).catch((error) => {
        console.error('获取来料数据失败:', error)
        this.$message.error('获取来料数据失败')
        this.inventoryTableData = []
        this.inventoryPagination.total = 0
      }).finally(() => {
        this.inventoryLoading = false
      })
    },

    // 搜索来料
    handleInventorySearch() {
      this.inventoryPagination.current = 1
      this.fetchInventoryData()
    },

    // 重置搜索
    handleInventoryReset() {
      this.inventorySearchForm = {
        invCode: '',
        invName: ''
      }
      this.inventoryPagination.current = 1
      this.fetchInventoryData()
    },

    // 点击行选择来料
    handleInventoryRowClick(row) {
      this.handleSelectInventoryRow(row)
    },

    // 选择来料
    handleSelectInventoryRow(row) {
      this.form.inventoryInfoId = row.invCode || ''
      this.form.invName = row.invName || ''
      this.form.englishName = row.englishName || ''
      this.form.invStd = row.invStd || ''
      this.form.supplier = row.invDefine || ''
      this.form.inventoryInfoId = row.id || ''
      this.inventorySelectVisible = false
      
      // 清除验证错误
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate(['inventoryInfoId'])
        }
      })
    },

    // 分页大小变化
    handleInventorySizeChange(val) {
      this.inventoryPagination.size = val
      this.fetchInventoryData()
    },

    // 当前页变化
    handleInventoryCurrentChange(val) {
      this.inventoryPagination.current = val
      this.fetchInventoryData()
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style scoped lang="scss">
.no-border{
  ::v-deep input{
    border: none;
  }
}
.dialog-content {
  max-height: 70vh;
  overflow-y: auto;
}

.form-fieldset {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
}

.form-fieldset legend {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  padding: 0 10px;
  border: none;
  width: auto;
}

.dialog-footer {
  text-align: right;
  padding: 10px 20px 0;
  border-top: 1px solid #e8eaec;
}

/* 部门网格布局 */
.department-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

/* 部门卡片样式 */
.department-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

/* 部门头部样式 */
.department-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
}

.department-icon {
  font-size: 16px;
  margin-right: 8px;
}

.purchase-icon {
  color: #f39c12;
}

.quality-icon {
  color: #e74c3c;
}

.production-icon {
  color: #27ae60;
}

.engineering-icon {
  color: #3498db;
}

.rd-icon {
  color: #9b59b6;
}

.warehouse-icon {
  color: #34495e;
}

.market-icon {
  color: #1abc9c;
}

.department-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

/* 部门内容样式 */
.department-content {
  padding: 16px;
}

.department-content .el-form-item {
  margin-bottom: 8px;
}

.department-content .el-select {
  width: 100%;
}

/* 只读输入框样式 */
.el-input.is-disabled .el-input__inner,
.el-input__inner[readonly] {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .department-grid {
    grid-template-columns: 1fr;
  }
}

/* 来料选择对话框样式 */
.search-form {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.search-form .el-form-item {
  margin-bottom: 0;
  margin-right: 16px;
}

.pagination-section {
  border-top: 1px solid #e8eaec;
  padding-top: 16px;
}

/* 来料信息显示样式 */
.inventory-info {
  margin-top: 8px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 12px;
}

.inventory-info .info-item {
  display: flex;
  margin-bottom: 4px;
}

.inventory-info .info-item:last-child {
  margin-bottom: 0;
}

.inventory-info .label {
  width: 60px;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
}

.inventory-info .value {
  color: #333;
  flex: 1;
}
</style>
