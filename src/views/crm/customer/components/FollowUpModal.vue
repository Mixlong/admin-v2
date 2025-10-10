<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="添加跟进记录"
    width="600px"
    center
    class="followup-modal"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      size="small"
    >
      <el-form-item label="跟进类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择跟进类型" style="width: 100%">
          <el-option label="电话跟进" value="call" />
          <el-option label="客户拜访" value="visit" />
          <el-option label="邮件沟通" value="email" />
          <el-option label="会议讨论" value="meeting" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>

      <el-form-item label="跟进标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入跟进标题" />
      </el-form-item>

      <el-form-item label="跟进内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="请详细描述跟进内容和结果"
        />
      </el-form-item>

      <el-form-item label="联系人" prop="contactId">
        <el-select v-model="form.contactId" placeholder="请选择联系人" style="width: 100%">
          <el-option
            v-for="contact in contactOptions"
            :key="contact.id"
            :label="contact.name"
            :value="contact.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="下次跟进时间">
        <el-date-picker
          v-model="form.nextFollowUp"
          type="datetime"
          placeholder="选择下次跟进时间"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="上传附件">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          action="#"
          multiple
        >
          <el-button icon="el-icon-upload">选择文件</el-button>
          <template slot="tip">
            <div class="el-upload__tip">
              支持上传jpg/png/pdf/doc等格式文件，单个文件不超过10MB
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template slot="footer">
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'FollowUpModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    customer: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      fileList: [],
      contactOptions: [],
      form: {
        type: '',
        title: '',
        content: '',
        contactId: '',
        nextFollowUp: null
      },
      rules: {
        type: [
          { required: true, message: '请选择跟进类型', trigger: 'change' }
        ],
        title: [
          { required: true, message: '请输入跟进标题', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入跟进内容', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    }
  },

  watch: {
    visible(newVal) {
      if (newVal && this.customer) {
        this.getContactOptions(this.customer.id)
      }
    },
    customer(newCustomer) {
      if (newCustomer && this.dialogVisible) {
        this.getContactOptions(newCustomer.id)
      }
    }
  },
  methods: {
    async getContactOptions(customerId) {
      try {
        // 模拟API调用获取该客户的联系人列表
        const mockData = [
          { id: '1', name: '张总' },
          { id: '2', name: '李经理' },
          { id: '3', name: '王助理' }
        ]
        this.contactOptions = mockData
      } catch (error) {
        console.error('获取联系人列表失败:', error)
      }
    },

    handleFileChange(file, fileList) {
      // 文件大小检查
      const isLt10M = file.raw.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过 10MB!')
        return false
      }
    },

    resetForm() {
      this.form = {
        type: '',
        title: '',
        content: '',
        contactId: '',
        nextFollowUp: null
      }
      this.fileList = []
      if (this.$refs.uploadRef) {
        this.$refs.uploadRef.clearFiles()
      }
    },

    handleClose() {
      this.resetForm()
      this.dialogVisible = false
    },

    async handleSubmit() {
      const valid = await this.$refs.formRef.validate().catch(() => false)
      if (!valid) return

      this.loading = true

      try {
        // 模拟API调用
        const submitData = {
          ...this.form,
          customerId: this.customer && this.customer.id,
          attachments: this.fileList.map(file => ({
            name: file.name,
            size: file.size,
            url: file.url || ''
          }))
        }

        // 模拟提交
        await new Promise(resolve => setTimeout(resolve, 1000))

        this.$message.success('跟进记录添加成功')
        this.$emit('refresh')
        this.handleClose()
      } catch (error) {
        this.$message.error('添加跟进记录失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

:deep(.el-upload__tip) {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>

<style>
.followup-modal .el-dialog__body {
  max-height: 75vh;
  overflow-y: auto;
  padding: 20px;
}

.followup-modal .el-dialog {
  margin: 0 auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0 !important;
  max-height: 90vh;
}
</style>