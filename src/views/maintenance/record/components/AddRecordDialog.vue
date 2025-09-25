<template>
  <div>
    <el-dialog 
      :visible.sync="dialogVisible" 
      :title="editMode ? '编辑' : '新增'"
      width="750px" 
      :close-on-click-modal="false" 
      @close="handleClose"
      top='0vh'
      class="add-record-dialog">
    
    <el-form 
      :model="form" 
      :rules="rules" 
      ref="form" 
      label-width="90px" 
      class="record-form"
      @submit.native.prevent>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排产单号" prop="schedulingNo">
            <el-input 
              v-model="form.schedulingNo" 
              placeholder="请扫码任务令或手动输入排产单号，扫码后按回车确认" 
              clearable
              style="width: 100%;"
              @keyup.enter.native="handleScanEnter">
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="PCBA SN" prop="pcbaSn">
            <el-input 
              v-model="form.pcbaSn" 
              placeholder="请输入PCBA SN 或整机SN" 
              clearable
              style="width: 100%;">
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="不良描述" prop="defectReason">
            <el-input 
              v-model="form.defectReason" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入不良描述" 
              clearable>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <template   >
 
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="维修方案" prop="repairMethod">
            <el-input 
              v-model="form.repairMethod" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入维修方案" 
              show-word-limit>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="维修结果" prop="repairTestResult">
            <el-input 
              v-model="form.repairTestResult" 
              type="textarea"
              :rows="3"
              placeholder="请输入维修结果" 
              show-word-limit>
            </el-input>
          </el-form-item>
        </el-col>
        
        <el-col :span="24">
          <el-form-item label="责任判定" prop="responsibilityResult">
            <el-input 
              v-model="form.responsibilityResult" 
              type="textarea"
              :rows="3"
              placeholder="请输入责任判定" 
              show-word-limit>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
 
  
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="损耗物料" prop="consumedMaterials">
            <el-input 
              v-model="form.consumedMaterials" 
              type="textarea"
              :rows="3"
              placeholder="请输入损耗物料" 
              show-word-limit>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="不良照片" prop="defectiveImg">
            <el-upload-sortable
              v-model="form.defectiveImg"
              :img-w="100"
              :img-h="100"
              accept="image/*"
              :multiple="true"
              :sortable="false"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">
        {{ editMode ? '更新' : '保存' }}
      </el-button>
    </div>
  </el-dialog>

  <!-- 扫码获取弹窗 -->
  <el-dialog
    :visible.sync="scanDialogVisible"
    title="扫码获取"
    width="400px"
    :close-on-click-modal="false"
    class="scan-dialog">
    
    <el-form :model="scanForm" ref="scanForm" label-width="80px" @submit.native.prevent>
      <el-form-item label="扫码结果" prop="scanResult">
        <el-input
          v-model="scanForm.scanResult"
          placeholder="请扫码"
          clearable
          style="width: 100%;"
          autofocus>
        </el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelScan">取消</el-button>
      <el-button type="primary" @click="saveScanResult">保存</el-button>
    </div>
  </el-dialog>
  </div>
</template>

<script>
import { 
  addMaintenanceRecord, 
  updateMaintenanceRecord 
} from '@/api/maintenance/record'
import { getDicts } from '@/api/system/dict/data'
import { dictUserList } from '@/api/system/user'
import { getSchedulingByCode } from '@/api/production/scheduling'
import TypedSelectLoadMore from '@/components/TypedSelectLoadMore'
import ElUploadSortable from '@/components/el-upload-sortable'

export default {
  name: 'AddRecordDialog',
  components: {
    TypedSelectLoadMore,
    ElUploadSortable
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: null
    },
    categoryOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      batchPcbaSn: '', // 批量PCBA SN输入
      // 扫码弹窗相关
      scanDialogVisible: false,
      scanForm: {
        scanResult: ''
      },
      // 字典数据
      productionLineOptions: [], // 生产线选项
      repairPersonOptions: [], // 维修员选项
      form: {
        id: '',
        schedulingNo: '',
        pcbaSn: '', // PCBA SN字段
        category: '',
        discoverWorkstation: '',
        repairPerson: '',
        defectReason: '',
        repairMethod: '',
        repairTestResult: '',
        responsibilityResult: '',
        defectiveImg: '',
        consumedMaterials: '',
        repairTime: '',
        createBy: '',
        list: [] // 用于批量创建时的PCBA SN列表
      },
      rules: {
        schedulingNo: [
          { required: true, message: '请扫码任务令或手动输入排产单号', trigger: 'blur' }
        ],
      }
    }
  },
  computed: {
    // 是否为编辑模式
    editMode() {
      return this.editData !== null
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.initForm()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  created() {
    this.loadDictData()
  },
  methods: {
    // 加载字典数据
    async loadDictData() {
      try {
        const productionLineRes = await getDicts('sop_line') // 生产线字典
        this.productionLineOptions = productionLineRes.data || []
        
        // 单独加载用户列表作为维修员选项
        this.loadRepairPersonOptions()
      } catch (error) {
        console.error('加载字典数据失败:', error)
        this.$message.error('加载字典数据失败')
      }
    },

    // 加载维修员选项
    loadRepairPersonOptions() {
      dictUserList().then(res => {
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

          this.repairPersonOptions = uniqueUsers
          console.log('维修员选项:', this.repairPersonOptions)
        } else {
          this.repairPersonOptions = []
        }
      }).catch(error => {
        console.error('获取维修员列表失败:', error)
        this.$message.error('获取维修员列表失败')
        this.repairPersonOptions = []
      })
    },

    // 初始化表单
    initForm() {
      if (this.editData) {
        // 编辑模式，加载现有数据
        this.form = {
           ...this.editData
        }
        this.batchPcbaSn = ''
      } else {
        // 新增模式，设置默认值
        const currentUser = this.$store.state.user
        const currentTime = this.formatDateTime(new Date())

        this.form = {
          id: '',
          schedulingNo: '',
          pcbaSn: '', // PCBA SN字段
          category: '',
          discoverWorkstation: '',
          repairPerson: currentUser?.name || currentUser?.userName || '', // 维修员等于当前用户
          defectReason: '',
          repairMethod: '',
          repairTestResult: '',
          responsibilityResult: '',
          defectiveImg: '',
          consumedMaterials: '',
          repairTime: currentTime, // 维修时间默认为当前时间
          createBy: currentUser?.name || currentUser?.userName || '',
          list: []
        }
        this.batchPcbaSn = ''
      }
      
      // 清除表单验证
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },



    // 处理批量PCBA SN输入变化
    handleBatchPcbaSnChange(value) {
      if (!value) {
        this.form.list = []
        return
      }
      
      // 解析批量输入的PCBA SN
      const pcbaSnList = value
        .split(/[\n,，]/) // 支持换行符、英文逗号、中文逗号分隔
        .map(sn => sn.trim()) // 去除首尾空格
        .filter(sn => sn.length > 0) // 过滤空字符串
      
      this.form.list = pcbaSnList
      
      // 如果只有一个SN，同时设置到单个字段
      if (pcbaSnList.length === 1) {
        this.form.schedulingNo = pcbaSnList[0]
      } else if (pcbaSnList.length > 1) {
        this.form.schedulingNo = '' // 多个SN时清空单个字段
      }
    },

    // 取消
    handleCancel() {
      this.dialogVisible = false
    },

    // 确定提交
    handleConfirm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true
          
          if (this.editMode) {
            // 编辑模式
            this.updateRecord()
          } else {
            // 新增模式
            this.createRecord()
          }
        }
      })
    },

    // 创建记录
    createRecord() {
      // 获取当前用户信息
      const currentUser = this.$store.state.user

      // 准备提交数据 - 根据TRepairRecordEntity结构
      const submitData = {
        schedulingNo: this.form.schedulingNo || '',
        pcbaSn: this.form.pcbaSn || '',
        category: this.form.category || '',
        discoverWorkstation: this.form.discoverWorkstation || '',
        repairPerson: this.form.repairPerson || '',
        defectReason: this.form.defectReason || '',
        repairMethod: this.form.repairMethod || '',
        repairTestResult: this.form.repairTestResult || '',
        responsibilityResult: this.form.responsibilityResult || '',
        defectiveImg: this.form.defectiveImg || '',
        consumedMaterials: this.form.consumedMaterials || '',
        repairTime: this.form.repairTime || '',
        createBy: this.form.createBy || '',
        ...this.form
      }
      
      console.log('提交的数据:', submitData)
      console.log('不良照片数据:', this.form.defectiveImg)
      
      // 如果有批量PCBA SN，需要循环创建多条记录
      if (this.form.list && this.form.list.length > 1) {
        this.createBatchRecords()
        return
      } else if (this.form.list && this.form.list.length === 1) {
        submitData.pcbaSn = this.form.list[0]
      }
      
      addMaintenanceRecord(submitData).then(res => {
        console.log('新增API返回:', res)
        if (res.code === 200) {
          this.$message.success('创建成功')
          this.dialogVisible = false
          this.$emit('success')
        } else {
          this.$message.error(res.msg || '创建失败')
        }
      }).catch((error) => {
        console.error('新增API调用失败:', error)
      }).finally(() => {
        this.loading = false
      })
    },
    
    // 批量创建记录
    async createBatchRecords() {
      try {
        let successCount = 0
        let errorCount = 0

        // 获取当前用户信息
        const currentUser = this.$store.state.user

        for (const pcbaSn of this.form.list) {
          const submitData = {
            pcbaSn: pcbaSn,
            category: this.form.category || '',
            productionLine: this.form.productionLine || '',
            defectLabel: this.form.defectLabel || '',
            defectReason: this.form.defectReason || '',
            repairMethod: this.form.repairMethod || '',
            repairTestResult: this.form.repairTestResult || '',
            productDestination: this.form.productDestination || '',
            repairPerson: currentUser?.name || currentUser?.userName || '', // 维修员等于当前用户
            defectAttribution: this.form.defectAttribution || '',
            consumedMaterials: this.form.consumedMaterials || '',
            repairTime: this.formatDateTime(new Date()), // 维修时间为当前时间
            marketManager: this.form.marketManager || ''
          }
          
          try {
            const res = await addMaintenanceRecord(submitData)
            if (res.code === 200) {
              successCount++
            } else {
              errorCount++
            }
          } catch (error) {
            errorCount++
          }
        }
        
        if (successCount > 0) {
          this.$message.success(`成功创建 ${successCount} 条记录${errorCount > 0 ? `，失败 ${errorCount} 条` : ''}`)
          this.dialogVisible = false
          this.$emit('success')
        } else {
          this.$message.error('创建失败')
        }
      } catch (error) {
        this.$message.error('创建失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    // 更新记录
    updateRecord() {
      const submitData = {
        id: this.form.id,
        schedulingNo: this.form.schedulingNo || '',
        pcbaSn: this.form.pcbaSn || '',
        category: this.form.category || '',
        discoverWorkstation: this.form.discoverWorkstation || '',
        repairPerson: this.form.repairPerson || '',
        defectReason: this.form.defectReason || '',
        repairMethod: this.form.repairMethod || '',
        repairTestResult: this.form.repairTestResult || '',
        responsibilityResult: this.form.responsibilityResult || '',
        defectiveImg: this.form.defectiveImg || '',
        consumedMaterials: this.form.consumedMaterials || '',
        repairTime: this.form.repairTime || '',
        createBy: this.form.createBy || '',
        updateTime: this.formatDateTime(new Date())
      }
      
      console.log('更新的数据:', submitData)
      if(!submitData.category){
        this.$message.error('请扫码任务令')
        return
      }
      updateMaintenanceRecord(submitData).then(res => {
        if (res.code === 200) {
          this.$message.success('更新成功')
          this.dialogVisible = false
          this.$emit('success')
        } else {
          this.$message.error(res.msg || '更新失败')
        }
      }).catch((error) => {
        console.error('更新API调用失败:', error)
        this.$message.error('更新失败，请稍后重试')
      }).finally(() => {
        this.loading = false
      })
    },

    // 关闭弹窗
    handleClose() {
      this.$refs.form.resetFields()
      this.batchPcbaSn = ''
      this.form.list = []
    },

    // 处理回车键扫码逻辑
    async handleScanEnter() {
      console.log('回车键被触发，开始处理扫码逻辑')
      const code = this.form.schedulingNo?.trim()
      try {
        // 调用接口获取排产信息
        const res = await getSchedulingByCode(code)
        
        if (res.code === 200 && res.data && res.data.no) {
          // 将排产信息填入表单 - 使用接口返回的 no 字段作为排产单号
          this.form.schedulingNo = res.data.no || code
          this.$message.success('任务令信息已获取并填入表单')
        } else {
          this.$message.error('未找到对应的排产信息')
        }
      } catch (error) {
        console.error('获取排产信息失败:', error)
        this.$message.error('获取排产信息失败，请检查任务令是否正确')
      }
    },

    // 打开扫码弹窗
    openScanDialog() {
      this.scanDialogVisible = true
      this.scanForm.scanResult = ''
      // 弹窗打开后自动聚焦到输入框
      this.$nextTick(() => {
        if (this.$refs.scanForm) {
          const input = this.$refs.scanForm.$el.querySelector('input')
          if (input) {
            input.focus()
          }
        }
      })
    },

    // 取消扫码
    cancelScan() {
      this.scanDialogVisible = false
      this.scanForm.scanResult = ''
    },

    // 保存扫码结果
    async saveScanResult() {
      if (!this.scanForm.scanResult.trim()) {
        this.$message.warning('请输入排产单号')
        return
      }
      
      const code = this.scanForm.scanResult.trim()
      
      try {
        // 调用接口获取排产信息
        const res = await getSchedulingByCode(code)
        
        if (res.code === 200 && res.data &&res.data.no) {
          // 将排产信息填入表单 - 使用接口返回的 no 字段作为排产单号
          this.form.schedulingNo = res.data.no || code
          
          // 如果接口返回了其他相关信息，也可以填入表单
          if (res.data.categoryId) {
            this.form.category = res.data.categoryId
          }
          if (res.data.computerName) {
            this.form.discoverWorkstation = res.data.computerName
          }
          
          this.scanDialogVisible = false
          this.scanForm.scanResult = ''
          this.$message.success('排产单号信息已获取并填入表单')
        } else {
          this.$message.error( '未找到对应的排产信息')
        }
      } catch (error) {
        console.error('获取排产信息失败:', error)
        this.$message.error('获取排产信息失败，请检查排产单号是否正确')
      }
    },

    // 格式化日期时间为后端期望的格式
    formatDateTime(date) {
      if (!date) return ''
      
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
  }
}
</script>

<style scoped lang="scss">
.add-record-dialog {
  .batch-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
  }
  
  .batch-tip i {
    margin-right: 4px;
    color: #409eff;
  }
  
  .dialog-footer {
    text-align: right;
  }
}

/* 深度选择器样式 */
:deep(.el-dialog__header) {
  padding: 15px 20px 10px;
  border-bottom: 1px solid #ebeef5;
  background: #f8f9fa;
}

:deep(.el-dialog__body) {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}
</style>