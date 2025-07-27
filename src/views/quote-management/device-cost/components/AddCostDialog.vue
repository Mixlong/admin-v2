<template>
  <el-dialog
    :title="editData ? '编辑成本' : '新增成本'"
    :visible.sync="dialogVisible"
    width="600px"
    top='0'
    :close-on-click-modal="false"
    @close="handleClose">
    
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="100px">
      
      <el-form-item label="品类" prop="categoryId">
        <el-select v-model="form.categoryId" placeholder="请选择品类" style="width: 100%">
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="成本类型" prop="costCategory">
        <el-select v-model="form.costCategory" placeholder="请选择成本类型" style="width: 100%" @change="handleCostTypeChange">
          <el-option
            v-for="item in costTypes"
            :key="item.dictCode"
            :label="item.dictLabel"
            :value="item.dictCode">
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="成本项" prop="costProject">
        <el-select v-model="form.costProject" placeholder="请选择成本项" style="width: 100%" :disabled="!form.costCategory">
          <el-option
            v-for="item in filteredCostItems"
            :key="item.dictCode"
            :label="item.dictLabel"
            :value="item.dictCode">
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="金额" prop="amount">
        <el-input-number
          v-model="form.amount"
          :precision="2"
          :min="0"
          placeholder="请输入金额"
          style="width: 100%">
        </el-input-number>
      </el-form-item>
      
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addDeviceCost, updateDeviceCost } from '@/api/quote-management/deviceCost'

export default {
  name: 'AddCostDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: null
    },
    costTypes: {
      type: Array,
      default: () => []
    },
    costItems: {
      type: Array,
      default: () => []
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
      form: {
        categoryId: '',
        costCategory: '',
        costProject: '',
        amount: ''
      },
      rules: {
        categoryId: [
          { required: true, message: '请选择品类', trigger: 'change' }
        ],
        costCategory: [
          { required: true, message: '请选择成本类型', trigger: 'change' }
        ],
        costProject: [
          { required: true, message: '请选择成本项', trigger: 'change' }
        ],
        amount: [
          { required: true, message: '请输入金额', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 根据选中的成本类型过滤成本项
    filteredCostItems() {
      if (!this.form.costCategory) {
        return []
      }
      const selectedType = this.costTypes.find(type => type.dictCode === this.form.costCategory)
      if (!selectedType) return []
      
      return this.costItems.filter(item => item.dictValue === selectedType.dictValue)
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
      if (this.editData) {
        this.form = {
          categoryId: this.editData.categoryId,
          costCategory: parseInt(this.editData.costCategory),
          costProject: parseInt(this.editData.costProject),
          amount: this.editData.amount
        }
      } else {
        this.form = {
          categoryId: '',
          costCategory: '',
          costProject: '',
          amount: undefined
        }
      }
    },
    
    // 成本类型变化时的处理
    handleCostTypeChange() {
      // 清空已选择的成本项
      this.form.costProject = ''
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
          
          const data = {
            categoryId: this.form.categoryId,
            costCategory: this.form.costCategory,
            costProject: this.form.costProject,
            amount: this.form.amount
          }

          if (this.editData) {
            // 编辑时需要传入id
            data.id = this.editData.id
          }

          const request = this.editData ? updateDeviceCost(data) : addDeviceCost(data)

          request.then(res => {
            if (res.code === 200) {
              this.$message.success(this.editData ? '编辑成功' : '新增成功')
              this.dialogVisible = false
              this.$emit('success')
            } else {
              this.$message.error(res.msg || (this.editData ? '编辑失败' : '新增失败'))
            }
          }).catch(() => {
            this.$message.error(this.editData ? '编辑失败' : '新增失败')
          }).finally(() => {
            this.loading = false
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
.dialog-footer {
  text-align: right;
}
</style>