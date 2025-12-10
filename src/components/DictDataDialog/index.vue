<template>
  <el-dialog
    :close-on-click-modal="false"
    :title="dialogTitle"
    :visible.sync="visible"
    width="500px"
    append-to-body
    @close="handleClose"
    top="0vh"
    class="dialog-scroll"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-form-item label="字典类型">
        <el-input v-model="form.dictType" :disabled="true" />
      </el-form-item>
      <el-form-item label="数据标签" prop="dictLabel">
        <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
      </el-form-item>
      <el-form-item v-if="isUpload" label="图片" prop="dictValue">
        <el-upload-sortable v-model="form.dictValue" :isLimit="1" :max="1" />
      </el-form-item>
      <el-form-item v-else label="数据键值" prop="dictValue">
        <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
      </el-form-item>
      <el-form-item label="显示排序" prop="dictSort">
        <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
      </el-form-item>
<!--  
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictValue"
          >
            {{ dict.dictLabel }}
          </el-radio>
        </el-radio-group>
      </el-form-item> -->
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" :disabled="remarkDisabled" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="loading" @click="handleSubmit">确 定</el-button>
      <el-button @click="handleClose">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getDataPublic, addDataPublic, updateDataPublic } from '@/api/system/dict/data'

const defaultForm = {
  dictCode: undefined,
  dictType: undefined,
  dictLabel: undefined,
  dictValue: undefined,
  dictSort: 0,
  listClass: 'default',
  status: '0',
  remark: undefined
}

const listClassOptions = [
  { value: 'default', label: '默认' },
  { value: 'primary', label: '主要' },
  { value: 'success', label: '成功' },
  { value: 'info', label: '信息' },
  { value: 'warning', label: '警告' },
  { value: 'danger', label: '危险' }
]

export default {
  name: 'DictDataDialog',
  props: {
    // 字典类型
    dictType: {
      type: String,
      default: ''
    },
    // 是否上传模式
    isUpload: {
      type: Boolean,
      default: false
    },
    // 状态选项
    statusOptions: {
      type: Array,
      default: () => []
    },
    // 自定义API（可选，用于无权限接口）
    customApi: {
      type: Object,
      default: null
    },
    // 备注是否禁用编辑
    remarkDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      isEdit: false,
      form: { ...defaultForm },
      listClassOptions
    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '修改字典数据' : '添加字典数据'
    },
    formRules() {
      const dictValueRule = this.isUpload
        ? [{ required: true, message: '请上传图片', trigger: 'change' }]
        : [{ required: true, message: '数据键值不能为空', trigger: 'blur' }]
      return {
        dictLabel: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
        dictValue: dictValueRule,
        dictSort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }]
      }
    },
    // 使用的API（默认无权限接口）
    api() {
      return this.customApi || {
        getData: getDataPublic,
        addData: addDataPublic,
        updateData: updateDataPublic
      }
    }
  },
  watch: {
    'form.dictValue'(val) {
      if (val && this.isUpload) {
        this.$refs.formRef?.clearValidate('dictValue')
      }
    }
  },
  methods: {
    // 打开新增弹窗
    open(dictType) {
      this.reset()
      this.form.dictType = dictType || this.dictType
      this.isEdit = false
      this.visible = true
    },
    // 打开编辑弹窗
    async openEdit(dictCode) {
      this.reset()
      this.loading = true
      try {
        const res = await this.api.getData(dictCode)
        this.form = res.data
        this.isEdit = true
        this.visible = true
      } finally {
        this.loading = false
      }
    },
    // 重置表单
    reset() {
      this.form = { ...defaultForm }
      this.$nextTick(() => {
        this.$refs.formRef?.resetFields()
      })
    },
    // 关闭弹窗
    handleClose() {
      this.visible = false
      this.reset()
    },
    // 提交表单
    handleSubmit() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.loading = true
        try {
          if (this.isEdit) {
            await this.api.updateData(this.form)
            this.$message.success('修改成功')
          } else {
            await this.api.addData(this.form)
            this.$message.success('新增成功')
          }
          this.$emit('success')
          this.handleClose()
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>
