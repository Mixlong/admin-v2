<template>
  <el-dialog 
    :visible.sync="dialogVisible" 
    title="原因分析"
    width="800px" 
    :close-on-click-modal="false" 
    @close="handleClose"
    class="analysis-dialog"
    top="5vh">
    
    <el-form 
      :model="form" 
      :rules="rules" 
      ref="form" 
      label-width="120px" 
      class="analysis-form">
      
      <el-form-item label="原因分析" prop="causeAnalysis">
        <Editor 
          v-model="form.causeAnalysis" 
          :min-height="200" 
          placeholder="请分析问题产生的根本原因，可从人员、设备、方法、材料、环境等方面进行分析"
          :config="editorConfig">
        </Editor>
      </el-form-item>
      
      <el-form-item label="对策人员" prop="measurePerson">
        <TypedSelectLoadMore 
          v-model="form.measurePerson" 
          type="user"
          placeholder="请选择对策人员"
          clearable
          customStyle="width: 100%">
        </TypedSelectLoadMore>
      </el-form-item>
      
      <el-form-item label="责任人" prop="responsiblePerson">
        <TypedSelectLoadMore 
          v-model="form.responsiblePerson" 
          type="user"
          placeholder="请选择责任人"
          clearable
          customStyle="width: 100%">
        </TypedSelectLoadMore>
      </el-form-item>
      
      <el-form-item label="效果确认人" prop="confirmer">
        <TypedSelectLoadMore 
          v-model="form.confirmer" 
          type="user"
          placeholder="请选择确认人"
          clearable
          customStyle="width: 100%">
        </TypedSelectLoadMore>
      </el-form-item>
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">
        保存
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { updateQualityIssue } from '@/api/base/qualityIssue'
import Editor from '@/components/Editor'
import TypedSelectLoadMore from '@/components/TypedSelectLoadMore'

export default {
  name: 'AnalysisDialog',
  components: {
    Editor,
    TypedSelectLoadMore
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    issueData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      // 富文本编辑器配置 - 简洁版
      editorConfig: {
        height: 200,
        menubar: false,
        toolbar: 'bold italic underline | bullist numlist | removeformat',
        plugins: 'lists',
        statusbar: false,
        resize: false,
        branding: false
      },
      form: {
        id: '',
        causeAnalysis: '',
        measurePerson: '',
        responsiblePerson: '',
        confirmer: '',
        exceptionStatus: 2 // 填写完成后更新为原因分析状态
      },
      rules: {
        causeAnalysis: [
          { required: true, message: '请输入原因分析', trigger: 'blur' }
        ],
        measurePerson: [
          { required: true, message: '请选择措施人员', trigger: 'change' }
        ],
        responsiblePerson: [
          { required: true, message: '请选择责任人', trigger: 'change' }
        ],
        confirmer: [
          { required: true, message: '请选择确认人', trigger: 'change' }
        ]
      }
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
  methods: {
    // 初始化表单
    initForm() {
      if (this.issueData) {
        this.form = {
          id: this.issueData.id || '',
          causeAnalysis: this.issueData.causeAnalysis || '',
          measurePerson: this.issueData.measurePerson || '',
          responsiblePerson: this.issueData.responsiblePerson || '',
          confirmer: this.issueData.confirmer || '',
          exceptionStatus: 2 // 填写完成后更新为原因分析状态
        }
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
          
          const submitData = {
            id: this.form.id,
            causeAnalysis: this.form.causeAnalysis,
            measurePerson: this.form.measurePerson,
            responsiblePerson: this.form.responsiblePerson,
            confirmer: this.form.confirmer,
            exceptionStatus: 2, // 填写完成后更新为原因分析状态
            updateTime: this.formatDateTime(new Date())
          }
          
          updateQualityIssue(submitData).then(res => {
            if (res.code === 200) {
              this.$message.success('分析提交成功')
              this.dialogVisible = false
              this.$emit('success')
            } else {
              this.$message.error(res.msg || '提交失败')
            }
          }).catch(() => {
            this.$message.error('提交失败，请稍后重试')
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },

    // 关闭弹窗
    handleClose() {
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
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
    }
  }
}
</script>

<style lang="scss" scoped>
.analysis-dialog {
  .analysis-form {
    padding: 20px 0;
  }
  
  .dialog-footer {
    text-align: right;
    padding: 20px 0 0;
    border-top: 1px solid #f0f0f0;
    margin-top: 20px;
  }
}

// 表单标签样式
::v-deep .el-form-item__label {
  font-weight: 500;
  color: #333;
}
</style>

<style lang="scss">
.analysis-dialog {
  .el-dialog__body {
    max-height: 70vh;
    overflow-y: auto;
    padding: 20px;
  }
}
</style>
