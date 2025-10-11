<template>
  <el-dialog 
    :visible.sync="dialogVisible" 
    :title="getDialogTitle()"
    width="1000px" 
    :close-on-click-modal="false" 
    @close="handleClose"
    @open="handleDialogOpen"
    class="add-issue-dialog"
    top="0vh">
    
    <el-form 
      :model="form" 
      :rules="rules" 
      ref="form" 
      label-width="90px" 
      class="issue-form">
      
      <!-- 基本信息 -->
      <fieldset class="form-fieldset">
        <legend class="fieldset-legend">基本信息</legend>
        <div class="fieldset-content">
          <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="订单号" prop="orderNo">
              <select-loadMore 
                v-model="form.orderNo" 
                :data="orderData.data" 
                :page="orderData.page"
                :hasMore="orderData.more" 
                dictLabel="salesOrderNo" 
                dictValue="salesOrderNo" 
                :request="getOrderData"
                placeholder="请选择或输入订单号"
                :disabled="isView"
                style="width: 100%">
                <template v-slot="{ proOption }">
                  <span style="float: left">{{ proOption.salesOrderNo }}</span>
                </template>
              </select-loadMore>
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="线号" prop="productionLine">
              <el-select 
                v-model="form.productionLine" 
                placeholder="请选择线号" 
                clearable
                style="width: 100%"
                :disabled="isView">
                <el-option
                  v-for="dict in sopLineOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictLabel">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="日期" prop="issueDate">
              <el-date-picker
                v-model="form.issueDate"
                type="date"
                placeholder="请选择日期"
                :disabled="isView"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="不良数量" prop="defectQuantity">
              <el-input-number 
                v-model="form.defectQuantity" 
                :min="0" 
                :disabled="isView"
                placeholder="请输入不良数量"
                style="width: 100%">
              </el-input-number>
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="生产数量" prop="productionQuantity">
              <el-input-number 
                v-model="form.productionQuantity" 
                :min="0" 
                :disabled="isView"
                placeholder="请输入生产数量"
                style="width: 100%">
              </el-input-number>
            </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="责任部门" prop="responsibility">
                <treeselect 
                  v-model="form.responsibilityDeptId" 
                  :options="deptOptions" 
                  :disable-branch-nodes="true"
                  placeholder="请选择责任部门" 
                  :clearable="true" 
                  :searchable="true" 
                  :disabled="isView"
                  @input="handleDeptChange"
                  :loading="deptLoading" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </fieldset>
      
      <!-- 问题分析 -->
      <fieldset class="form-fieldset">
        <legend class="fieldset-legend">问题分析</legend>
        <div class="fieldset-content">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="问题描述" prop="problemDescription">
                <Editor 
                  v-model="form.problemDescription" 
                  :min-height="150" 
                  :read-only="isView"
                  placeholder="请详细描述遇到的质量问题，包括现象、影响范围等信息"
                  :config="editorConfig">
                </Editor>
              </el-form-item>
            </el-col>
          </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="原因分析" prop="causeAnalysis">
              <Editor 
                v-model="form.causeAnalysis" 
                :min-height="150" 
                :read-only="isView"
                placeholder="请分析问题产生的根本原因，可从人员、设备、方法、材料、环境等方面进行分析"
                :config="editorConfig">
              </Editor>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="临时措施" prop="temporaryMeasures">
              <Editor 
                v-model="form.temporaryMeasures" 
                :min-height="150" 
                :read-only="isView"
                placeholder="请输入针对问题采取的临时处理措施"
                :config="editorConfig">
              </Editor>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="长期措施" prop="longTermImprovement">
              <Editor 
                v-model="form.longTermImprovement" 
                :min-height="150" 
                :read-only="isView"
                placeholder="请输入防止问题再次发生的长期改善措施"
                :config="editorConfig">
              </Editor>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="效果确认" prop="effectConfirmation">
              <Editor 
                v-model="form.effectConfirmation" 
                :min-height="150" 
                :read-only="isView"
                placeholder="请输入措施实施后的效果确认情况"
                :config="editorConfig">
              </Editor>
            </el-form-item>
          </el-col>
        </el-row>
        
        </div>
      </fieldset>
      
      
      <!-- 确认信息与附件 -->
      <fieldset class="form-fieldset">
        <legend class="fieldset-legend">图片</legend>
        <div class="fieldset-content">
          <el-row :gutter="20">
 
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="问题图片" prop="problemImages">
              <div class="upload-section">
                <ImageUpload 
                  v-model="form.problemImages" 
                  :multiple="true" 
                  :disabled="isView"
                  class="image-upload-container">
                </ImageUpload>
              </div>
            </el-form-item>
          </el-col>
          </el-row>
        </div>
      </fieldset>
    </el-form>
    
    <div slot="footer" class="dialog-footer" v-if="!isView">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">
        {{ editMode ? '更新' : '保存' }}
      </el-button>
    </div>
    
    <div slot="footer" class="dialog-footer" v-else>
      <el-button @click="handleCancel">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { 
  addQualityIssue, 
  updateQualityIssue,
  getOrderList 
} from '@/api/base/qualityIssue'
import { listDept } from '@/api/system/dept'
import { getDicts } from '@/api/system/dict/data'
import { dictUserList } from '@/api/system/user'
import { getToken } from '@/utils/auth'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import Editor from '@/components/Editor'
import ImageUpload from '@/components/el-upload-sortable/index.vue'
import { mapGetters } from "vuex";
export default {
  name: 'AddIssueDialog',
  components: {
    Treeselect,
    Editor,
    ImageUpload
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
    isView: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      deptOptions: [],
      deptLoading: false,
      // 线号字典选项
      sopLineOptions: [],
      // 用户列表选项
      userListOptions: [],
      orderData: {
        data: [],
        page: 1,
        more: true
      },
      // 富文本编辑器配置 - 简洁版
      editorConfig: {
        height: 150,
        menubar: false,
        toolbar: 'bold italic underline | bullist numlist | removeformat',
        plugins: 'lists',
        statusbar: false,
        resize: false,
        branding: false
      },
      form: {
        id: '',
        orderNo: '',
        productionLine: '',
        issueDate: '',
        problemDescription: '',
        defectQuantity: 0,
        productionQuantity: 0,
        exceptionStatus: 1,
        responsibility: '',
        responsibilityDeptId: null,
        causeAnalysis: '',
        confirmer: '',
        effectConfirmation: '',
        problemImages: '',
        temporaryMeasures: '',
        longTermImprovement: '',
        isClosed: 0
      },
      rules: {
        orderNo: [
          { required: true, message: '请输入订单号', trigger: 'blur' }
        ],
        productionLine: [
          { required: true, message: '请输入线号', trigger: 'blur' }
        ],
        issueDate: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        problemDescription: [
          { required: true, message: '请输入问题描述', trigger: 'blur' }
        ],
        defectQuantity: [
          { required: true, message: '请输入不良数量', trigger: 'blur' },
          { type: 'number', min: 0, message: '不良数量不能小于0', trigger: 'blur' }
        ],
        productionQuantity: [
          { required: true, message: '请输入生产数量', trigger: 'blur' },
          { type: 'number', min: 0, message: '生产数量不能小于0', trigger: 'blur' }
        ],
        exceptionStatus: [
          { required: true, message: '请选择异常状态', trigger: 'change' }
        ],
        responsibility: [
          { required: true, message: '请选择责任归属部门', trigger: 'change' }
        ],
        confirmer:[
          { required: true, message: '请选择确认人', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(["userId","nickName"]),
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
        this.loadDictData()
        this.loadUserList()
        // 先加载部门数据，然后在回调中设置部门回显
        this.getTreeselect().then(() => {
          // 部门数据加载完成后，设置编辑模式下的部门回显
          if (this.editData && this.editData.responsibility) {
            this.setDeptFromName(this.editData.responsibility)
          }
        })
        // 重置滚动条到顶部
        this.$nextTick(() => {
          const dialogBody = document.querySelector('.add-issue-dialog .el-dialog__body')
          if (dialogBody) {
            dialogBody.scrollTop = 0
          }
        })
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 获取弹窗标题
    getDialogTitle() {
      if (this.isView) {
        return '查看'
      }
      return this.editMode ? '编辑' : '新增'
    },

    // 初始化表单
    initForm() {
      if (this.editData) {
        // 编辑或查看模式，加载现有数据
        this.form = {
          id: this.editData.id || '',
          orderNo: this.editData.orderNo || '',
          productionLine: this.editData.productionLine || '',
          issueDate: this.editData.issueDate || '',
          problemDescription: this.editData.problemDescription || '',
          defectQuantity: this.editData.defectQuantity || 0,
          productionQuantity: this.editData.productionQuantity || 0,
          exceptionStatus: this.editData.exceptionStatus || 1,
          responsibility: this.editData.responsibility || '',
          responsibilityDeptId: this.editData.responsibilityDeptId || null,
          causeAnalysis: this.editData.causeAnalysis || '',
          confirmer: this.editData.confirmer || '',
          effectConfirmation: this.editData.effectConfirmation || '',
          problemImages: this.editData.problemImages || '',
          temporaryMeasures: this.editData.temporaryMeasures || '',
          longTermImprovement: this.editData.longTermImprovement || '',
          isClosed: this.editData.isClosed || 0
        }
      } else {
        // 新增模式
        this.form = {
          id: '',
          orderNo: '',
          productionLine: '',
          issueDate: '',
          problemDescription: '',
          defectQuantity: 0,
          productionQuantity: 0,
          exceptionStatus: 1,
          responsibility: '',
          responsibilityDeptId: null,
          causeAnalysis: '',
          confirmer: '',
          effectConfirmation: '',
          problemImages: '',
          temporaryMeasures: '',
          longTermImprovement: '',
          isClosed: 0
        }
      }
    },

    // 取消
    handleCancel() {
      this.dialogVisible = false
    },

    // 确定提交
    handleConfirm() {
      if (this.isView) {
        this.dialogVisible = false
        return
      }

      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true
          
          if (this.editMode) {
            // 编辑模式
            this.updateIssue()
          } else {
            // 新增模式
            this.createIssue()
          }
        }
      })
    },

    // 创建质量异常
    createIssue() {
      // 准备提交数据
      const submitData = {
        ...this.form,
        createTime: this.formatDateTime(new Date()),
        updateTime: this.formatDateTime(new Date())
      }
      this.submitData.confirmer=this.nickName;
      addQualityIssue(submitData).then(res => {
        if (res.code === 200) {
          this.$message.success('创建成功')
          this.dialogVisible = false
          this.$emit('success')
        } else {
          this.$message.error(res.msg || '创建失败')
        }
      }).catch(() => {
        this.$message.error('创建失败，请稍后重试')
      }).finally(() => {
        this.loading = false
      })
    },

    // 更新质量异常
    updateIssue() {
      const submitData = {
        ...this.form,
        updateTime: this.formatDateTime(new Date())
      }
      
      updateQualityIssue(submitData).then(res => {
        if (res.code === 200) {
          this.$message.success('更新成功')
          this.dialogVisible = false
          this.$emit('success')
        } else {
          this.$message.error(res.msg || '更新失败')
        }
      }).catch(() => {
        this.$message.error('更新失败，请稍后重试')
      }).finally(() => {
        this.loading = false
      })
    },

    // 关闭弹窗
    handleClose() {
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },

    // 弹窗打开时重置滚动条
    handleDialogOpen() {
      this.$nextTick(() => {
        const dialogBody = document.querySelector('.add-issue-dialog .el-dialog__body')
        if (dialogBody) {
          dialogBody.scrollTop = 0
        }
      })
    },

    // 获取部门树结构
    getTreeselect() {
      this.deptLoading = true
      return listDept().then((res) => {
        const data = res.data.map((item) => {
          return {
            parentId: item.parentId,
            id: item.deptId,
            label: item.deptName,
            isSelected: false,
            isDefaultExpanded: false
          }
        })
        this.deptOptions = this.handleTree(data)
        this.deptLoading = false
        return this.deptOptions
      }).catch(() => {
        this.deptLoading = false
        throw new Error('获取部门数据失败')
      })
    },

    // 构造部门下拉树结构
    handleTree(data, parentId = 0) {
      const tree = []
      data.forEach(item => {
        if (item.parentId === parentId) {
          const children = this.handleTree(data, item.id)
          if (children.length > 0) {
            item.children = children
          }
          tree.push(item)
        }
      })
      return tree
    },

    // 部门变化处理
    handleDeptChange(deptId) {
      if (deptId) {
        // 从部门选项中查找对应的部门名称
        const findDeptName = (options, id) => {
          for (const option of options) {
            if (option.id === id) {
              return option.label
            }
            if (option.children && option.children.length > 0) {
              const childResult = findDeptName(option.children, id)
              if (childResult) return childResult
            }
          }
          return null
        }
        
        const deptName = findDeptName(this.deptOptions, deptId)
        if (deptName) {
          this.form.responsibility = deptName
        }
      } else {
        this.form.responsibility = ''
      }
    },

    // 根据部门名称查找部门ID
    findDeptIdByName(deptName) {
      const findInOptions = (options) => {
        for (const option of options) {
          if (option.label === deptName) {
            this.form.responsibilityDeptId = option.id
            return option.id
          }
          if (option.children && option.children.length > 0) {
            const childResult = findInOptions(option.children)
            if (childResult) return childResult
          }
        }
        return null
      }
      return findInOptions(this.deptOptions)
    },

    // 根据部门名称设置部门选择器的值
    setDeptFromName(deptName) {
      if (!deptName || !this.deptOptions.length) return
      
      const findInOptions = (options) => {
        for (const option of options) {
          if (option.label === deptName) {
            this.form.responsibilityDeptId = option.id
            console.log('部门回显成功:', { deptName, deptId: option.id })
            return option.id
          }
          if (option.children && option.children.length > 0) {
            const childResult = findInOptions(option.children)
            if (childResult) return childResult
          }
        }
        return null
      }
      
      const deptId = findInOptions(this.deptOptions)
      if (!deptId) {
        console.warn('未找到匹配的部门:', deptName)
      }
    },

    // 加载字典数据
    loadDictData() {
      // 获取线号字典
      getDicts('sop_line').then(res => {
        this.sopLineOptions = res.data || []
      }).catch(() => {
        console.error('获取线号字典失败')
        this.sopLineOptions = []
      })
    },

    // 获取订单数据 - SelectLoadMore组件接口
    getOrderData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getOrderList({
          p: page,
          salesOrderNo: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;

          if (more) {
            this.orderData.data = [...this.orderData.data, ...list];
          } else {
            this.orderData.data = list;
          }
          this.orderData.more = pageNum * pageSize < total;
          this.orderData.page = pageNum;
          resolve();
        });
      });
    },

    // 格式化日期时间为后端期望的格式 yyyy-MM-dd HH:mm:ss
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
    },

    // 加载用户列表
    loadUserList() {
      dictUserList().then((res) => {
        // 对数据进行去重处理，避免重复键值问题
        const uniqueUsers = [];
        const userNameSet = new Set();

        res.data.forEach(user => {
          if (!userNameSet.has(user.userName)) {
            userNameSet.add(user.userName);
            uniqueUsers.push(user);
          }
        });

        this.userListOptions = uniqueUsers;
      }).catch(() => {
        console.error('获取用户列表失败');
        this.userListOptions = [];
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.add-issue-dialog {
  .issue-form {
    padding: 0;
  }
  
  .dialog-footer {
    text-align: right;
    padding: 20px 0 0;
    border-top: 1px solid #f0f0f0;
    margin-top: 20px;
  }
}

// 字段集样式
.form-fieldset {
  border: 1px solid #dcdfe6;
  margin-bottom: 20px;
  border-radius: 4px;
  
  .fieldset-legend {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    padding: 0 10px;
  }
  
  .fieldset-content {
    padding: 20px;
  }
}

// 图片上传区域优化
.image-upload-container {
  width: 100%;
}

.upload-section {
  .upload-tips {
    margin-top: 12px;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 4px;
    color: #606266;
    font-size: 13px;
    display: flex;
    align-items: center;
    
    i {
      margin-right: 6px;
      color: #909399;
    }
  }
}


// 表单标签样式
::v-deep .el-form-item__label {
  font-weight: 500;
  color: #333;
}

</style>

<!-- 简化的全局样式 -->
<style lang="scss">
.add-issue-dialog {
  .el-dialog__body {
    max-height: 75vh;
    overflow-y: auto;
    padding: 20px;
  }
}

// Treeselect 组件样式
.vue-treeselect {
  .vue-treeselect__control {
    border: 1px solid #dcdfe6 !important;
    border-radius: 4px !important;
    
    &:focus-within {
      border-color: #409eff !important;
    }
  }
}
</style>