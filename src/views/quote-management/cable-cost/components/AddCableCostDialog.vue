<template>
  <el-dialog :title="editData ? '编辑线缆成本' : '新增线缆成本'" :visible.sync="dialogVisible" width="700px"
    :close-on-click-modal="false" center top="0" @close="handleClose">

    <el-form :model="form" :rules="rules" ref="form" label-width="120px" class="cable-cost-form">

      <el-form-item label="供应商" prop="supplier">
        <el-select v-model="form.supplier" placeholder="请选择供应商" filterable clearable style="width: 100%">
          <el-option v-for="item in supplierOptions" :key="item.dictCode" :label="item.dictLabel"
            :value="item.dictCode">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="防水头型号" prop="cableModel">
        <el-input v-model="form.cableModel" placeholder="请输入防水头型号"></el-input>
      </el-form-item>

      <el-form-item label="防水头价格" prop="waterproofHeadPrice">
        <div class="input-with-unit">
          <el-input-number v-model="form.waterproofHeadPrice" :precision="2" :min="0" :controls="false"
            placeholder="请输入防水头价格" style="width: 100%" class="number-input">
          </el-input-number>
          <span class="unit-text">元/米</span>
        </div>
      </el-form-item>
      <el-form-item label="普通线价格" prop="commonLinearPrice">
        <div class="input-with-unit">
          <el-input-number v-model="form.commonLinearPrice" :precision="2" :min="0" :controls="false"
            placeholder="请输入普通线价格" style="width: 100%" class="number-input">
          </el-input-number>
          <span class="unit-text">元/米</span>
        </div>
      </el-form-item>

      <el-form-item label="UL线价格" prop="ulLinearPrice">
        <div class="input-with-unit">
          <el-input-number v-model="form.ulLinearPrice" :precision="2" :min="0" :controls="false" placeholder="请输入UL线价格"
            style="width: 100%" class="number-input">
          </el-input-number>
          <span class="unit-text">元/米</span>
        </div>
      </el-form-item>

    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addCableCost, updateCableCost } from '@/api/quote-management/cableCost'

export default {
  name: 'AddCableCostDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: null
    },
    supplierOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      form: {
        supplier: '',
        cableModel: '',
        commonLinearPrice: undefined,
        ulLinearPrice: undefined
      },
      rules: {
        supplier: [
          { required: true, message: '请选择供应商', trigger: 'change' }
        ],
        cableModel: [
          { required: true, message: '请输入防水头型号', trigger: 'blur' },
          { min: 1, max: 50, message: '型号长度在1到50个字符', trigger: 'blur' }
        ],
        waterproofHeadPrice: [
          { required: true, message: '请输入防水头价格', trigger: 'blur' },
          { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' }
        ],
        commonLinearPrice: [
          {
            validator: function (rule, value, callback) {
              var form = this.form || rule.form
              if ((value === undefined || value === null || value === '') &&
                (form.ulLinearPrice === undefined || form.ulLinearPrice === null || form.ulLinearPrice === '')) {
                callback(new Error('普通线价格和UL线价格至少填写一个'))
              } else if (value !== undefined && value !== null && value !== '' && value < 0) {
                callback(new Error('价格必须大于等于0'))
              } else {
                callback()
              }
            }.bind(this),
            trigger: 'blur'
          }
        ],
        ulLinearPrice: [
          {
            validator: function (rule, value, callback) {
              var form = this.form || rule.form
              if ((value === undefined || value === null || value === '') &&
                (form.commonLinearPrice === undefined || form.commonLinearPrice === null || form.commonLinearPrice === '')) {
                callback(new Error('普通线价格和UL线价格至少填写一个'))
              } else if (value !== undefined && value !== null && value !== '' && value < 0) {
                callback(new Error('价格必须大于等于0'))
              } else {
                callback()
              }
            }.bind(this),
            trigger: 'blur'
          }
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
    },
    // 监听普通线价格变化，触发UL线价格验证
    'form.commonLinearPrice': function (newVal, oldVal) {
      if (newVal !== oldVal && this.$refs.form) {
        this.$nextTick(() => {
          this.$refs.form.validateField('ulLinearPrice')
        })
      }
    },
    // 监听UL线价格变化，触发普通线价格验证
    'form.ulLinearPrice': function (newVal, oldVal) {
      if (newVal !== oldVal && this.$refs.form) {
        this.$nextTick(() => {
          this.$refs.form.validateField('commonLinearPrice')
        })
      }
    }
  },
  methods: {
    // 初始化表单
    initForm() {
      if (this.editData) {
        this.form = {
          ...this.editData
        }
      } else {
        this.form = {
          supplier: '',
          cableModel: '',
          commonLinearPrice: undefined,
          ulLinearPrice: undefined
        }
      }
    },

    // 取消
    handleCancel() {
      this.dialogVisible = false
    },

    // 确定
    handleConfirm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true

          // 准备API数据
          const apiData = {
            ...this.form
          }

          // 如果是编辑模式，添加ID
          if (this.editData && this.editData.id) {
            apiData.id = this.editData.id
          }

          // 调用相应的API
          const apiCall = this.editData ? updateCableCost(apiData) : addCableCost(apiData)

          apiCall.then((res) => {
            this.loading = false
            if (res.code === 200) {
              this.$message.success(this.editData ? '编辑成功' : '新增成功')
              this.dialogVisible = false
              this.$emit('success')
            } else {
              this.$message.error(res.msg || (this.editData ? '编辑失败' : '新增失败'))
            }
          }).catch((error) => {
            this.loading = false
            console.error('API调用失败:', error)
            this.$message.error(this.editData ? '编辑失败，请重试' : '新增失败，请重试')
          })
        }
      })
    },

    // 关闭
    handleClose() {
      this.$refs.form.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
/* 弹窗整体样式 */
.cable-cost-form {
  text-align: left;
  padding: 0 20px;

  :deep(.el-form-item) {
    margin-bottom: 22px;
  }
}

/* 输入框与单位组合样式 */
.input-with-unit {
  display: flex;
  align-items: center;
  width: 100%;

  .number-input {
    flex: 1;
  }
}

/* 移除数字输入框的控制按钮 */
.number-input :deep(.el-input-number__increase),
.number-input :deep(.el-input-number__decrease) {
  display: none;
}

/* 数字输入框内容左对齐 */
.number-input :deep(.el-input__inner) {
  text-align: left;
  padding-right: 15px;
}

/* 单位文字样式 */
.unit-text {
  margin-left: 8px;
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
  min-width: 45px;
}

/* 弹窗底部按钮样式 */
.dialog-footer {
  text-align: right;
  padding: 0 20px 20px;

  .el-button {
    margin-left: 10px;
  }
}

/* 确保弹窗在屏幕中央 */
:deep(.el-dialog) {
  margin-top: 5vh !important;

  .el-dialog__body {
    padding: 10px 0;
  }
}

/* 响应式调整 */
@media (max-height: 800px) {
  :deep(.el-dialog) {
    margin-top: 3vh !important;
  }
}
</style>