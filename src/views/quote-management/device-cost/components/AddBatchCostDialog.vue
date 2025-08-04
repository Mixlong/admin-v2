<template>
  <el-dialog :visible.sync="dialogVisible" width="850px" top='5vh' :close-on-click-modal="false" @close="handleClose"
    custom-class="batch-cost-dialog">
    <div slot="title" class="dialog-title">
      <i class="el-icon-s-grid"></i>
      {{ editMode ? '编辑成本' : '新增成本' }}
    </div>
    <el-form :model="form" :rules="rules" ref="form" label-width="80px" class="compact-form">
      <div class="cost-type-section">
        <div class="cost-type-header">
          <div class="cost-type-title">
            <i class="text-red">*</i>
            品类
          </div>
        </div>
        <div class="cotegory-input-wrapper">
          <el-select v-model="form.categoryId" placeholder="请选择品类" style="width: 100%" class="el-select-cost">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id"
              :disabled="isCategoryDisabled(item.id)">
            </el-option>
          </el-select>
        </div>
      </div>


      <div v-for="costType in costTypes" :key="costType.dictCode" class="cost-type-section">
        <div class="cost-type-header">
          <div class="cost-type-title">
            <i class="text-red" v-if="costType.dictValue == 1">*</i>
            {{ costType.dictLabel }}
          </div>
        </div>

        <div class="cost-items-grid">
          <div v-for="costItem in getFilteredCostItems(costType)" :key="costItem.dictCode" class="cost-item-card">
            <div class="cost-item-info">
              <div class="cost-item-name">{{ costItem.dictLabel }}</div>
            </div>
            <div class="cost-item-price">
              <el-input-number :value="getCostItemPrice(costType.dictCode, costItem.dictCode)"
                @input="handlePriceInput(`${costType.dictCode}_${costItem.dictCode}`, $event)" :precision="2" :min="0"
                :placeholder="isRequiredCostItem(costType, costItem) ? '必填' : '价格'" size="mini" :controls="false"
                :class="{ 'required-input': isRequiredCostItem(costType, costItem) }" style="width: 100px">
              </el-input-number>
            </div>
          </div>
        </div>
      </div>

    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleCancel">取消</el-button>
      <el-button size="small" type="primary" @click="handleConfirm" :loading="loading">
        {{ editMode ? '保存' : '提交' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { batchAddDeviceCost, categoryList } from '@/api/quote-management/deviceCost'

export default {
  name: 'AddBatchCostDialog',
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
        costItemPrices: {},
        // 可选字段，用于扩展
        allocationType: 0, // ID模具分摄成本项类型
        isOptional: 0 // 是否选配项
      },
      rules: {
        categoryId: [
          { required: true, message: '请选择品类', trigger: 'change' }
        ]
      },
      // 必填成本类型ID
      requiredCostTypeValue: 1,
      // 禁用的分类ID列表
      disabledCategoryIds: []
    }
  },
  computed: {
    // 是否为编辑模式
    editMode() {
      return this.editData !== null
    },
    // 根据成本类型过滤成本项
    getFilteredCostItems() {
      return (costType) => {
        return this.costItems.filter(item => item.dictValue === costType.dictValue)
      }
    },
    // 判断是否为必填成本类型
    isRequiredCostType() {
      return (costType) => {
        return costType.dictValue === this.requiredCostTypeValue
      }
    },
    // 判断成本项是否必填
    isRequiredCostItem() {
      return (costType, costItem) => {
        return this.isRequiredCostType(costType)
      }
    },
    // 获取成本项价格
    getCostItemPrice() {
      return (costTypeCode, costItemCode) => {
        const key = `${costTypeCode}_${costItemCode}`
        const value = this.form.costItemPrices[key]
        // 返回有效数值或null（不能返回undefined，会导致输入框异常）
        return (value !== undefined && value !== null && value !== '') ? value : null
      }
    },
    // 判断分类是否应该被禁用
    isCategoryDisabled() {
      return (categoryId) => {
        return this.disabledCategoryIds.includes(categoryId)
      }
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.loadDisabledCategories()
        this.initForm()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 加载禁用的分类列表
    loadDisabledCategories() {
      categoryList().then(res => {
        if (res.code === 200 && res.data) {
          // 将已完成的分类ID添加到禁用列表中
          this.disabledCategoryIds = res.data
        }
      }).catch(error => {
        console.error('获取已完成分类列表失败:', error)
        this.disabledCategoryIds = []
      })
    },

    // 初始化表单
    initForm() {
      console.log('初始化表单，editData:', this.editData)
      if (this.editData) {
        // 编辑模式，加载现有数据
        const parsedPrices = this.parseEditData(this.editData)
        console.log("🚀 ~ initForm ~ parsedPrices:", parsedPrices)

        // 使用Vue.set确保响应式更新
        this.form = {
          categoryId: this.editData.categoryId || '',
          costItemPrices: {},
          allocationType: this.editData.allocationType || 0,
          isOptional: this.editData.isOptional || 0
        }

        // 逐个设置价格数据，确保响应式
        Object.keys(parsedPrices).forEach(key => {
          const value = parsedPrices[key]
          console.log(`设置初始价格 ${key}:`, value, typeof value)
          // 只要是数字类型就设置，包括0值
          if (typeof value === 'number' && !isNaN(value)) {
            this.$set(this.form.costItemPrices, key, value)
          }
        })

        console.log('编辑模式表单数据:', this.form)
        console.log('价格数据设置完成:', this.form.costItemPrices)

        // 等待下一个tick确保DOM更新后再检查数据
        this.$nextTick(() => {
          console.log('DOM更新后的表单数据:', this.form.costItemPrices)
          // 再次验证数据是否正确 - 只显示有值的数据
          Object.keys(this.form.costItemPrices).forEach(key => {
            const value = this.form.costItemPrices[key]
            if (value !== undefined && value !== null) {
              console.log(`价格项 ${key}:`, value)
            }
          })
        })
      } else {
        // 新增模式
        this.form = {
          categoryId: '',
          costItemPrices: {},
          allocationType: 0,
          isOptional: 0
        }
        console.log('新增模式表单数据:', this.form)
      }
    },

    // 解析编辑数据
    parseEditData(editData) {
      const prices = {}

      console.log('开始解析编辑数据:', editData)

      // 处理编辑时传入的单个item数据（包含list数组）
      if (editData.list && Array.isArray(editData.list) && editData.list.length > 0) {
        console.log('解析list数组，共', editData.list.length, '项数据')
        editData.list.forEach((item, index) => {
          console.log(`解析第${index + 1}项:`, item)
          console.log(`项目详情 - costCategory: ${item.costCategory}, costProject: ${item.costProject}, amount: ${item.amount} (类型: ${typeof item.amount})`)

          if (item.costCategory && item.costProject && (item.amount !== undefined && item.amount !== null)) {
            const key = `${item.costCategory}_${item.costProject}`
            // 直接使用原始值，不进行parseFloat转换，避精度丢失
            const amount = Number(item.amount)
            // 即使amount为0也要设置，因为0也是有效的价格值
            prices[key] = amount
            console.log(`添加成本项: ${key} = ${amount} (原始值: ${item.amount})`)
          } else {
            console.warn(`第${index + 1}项数据不完整:`, {
              costCategory: item.costCategory,
              costProject: item.costProject,
              amount: item.amount,
              amountType: typeof item.amount
            })
          }
        })
      } else {
        // 如果没有list或list为空，处理主数据项（兼容旧数据格式）
        console.log('list为空或不存在，解析主数据项')
        if (editData.costCategory && editData.costProject && (editData.amount !== undefined && editData.amount !== null)) {
          const key = `${editData.costCategory}_${editData.costProject}`
          const amount = Number(editData.amount)
          // 即使amount为0也要设置，因为0也是有效的价格值
          prices[key] = amount
          console.log(`添加主数据项: ${key} = ${amount} (原始值: ${editData.amount})`)
        }
      }

      console.log('最终解析结果，共', Object.keys(prices).length, '个成本项:', prices)
      return prices
    },

    // 取消
    handleCancel() {
      this.dialogVisible = false
    },

    // 确定提交
    handleConfirm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 验证品类必填
          if (!this.form.categoryId) {
            this.$message.warning('请选择品类')
            return
          }

          // 验证成本类型dictValue=1的成本项必填（只检查这一个成本类型）
          const requiredCostType = this.costTypes.find(type => type.dictValue == this.requiredCostTypeValue)
          console.log("🚀 ~ handleConfirm ~ this.costTypes.:", this.costTypes)
          if (requiredCostType) {
            const requiredItems = this.costItems.filter(item => item.dictValue === requiredCostType.dictValue)
            const missingRequiredItems = []

            requiredItems.forEach(item => {
              const key = `${requiredCostType.dictCode}_${item.dictCode}`
              const price = this.form.costItemPrices[key]
              if (!price || price <= 0) {
                missingRequiredItems.push(item.dictLabel)
              }
            })

            if (missingRequiredItems.length > 0) {
              this.$message.warning(`成本类型「${requiredCostType.dictLabel}」下的以下成本项为必填：${missingRequiredItems.join('、')}`)
              return
            }
          }

          // 构造提交数据：只提交有价格且价格>0的成本项
          const deviceCostList = []
          Object.keys(this.form.costItemPrices).forEach(key => {
            const price = this.form.costItemPrices[key]
            if (price && price > 0) { // 只要有价格且大于0就提交
              const [costTypeCode, costItemCode] = key.split('_')

              const deviceCostItem = {
                categoryId: this.form.categoryId,
                costCategory: parseInt(costTypeCode),
                costProject: parseInt(costItemCode),
                amount: price,
                allocationType: 0, // 默认为其它成本项
                isOptional: 0, // 默认不是选配项
                isDel: 0 // 默认未删除
              }

              deviceCostList.push(deviceCostItem)
            }
          })

          // 检查是否有数据需要提交
          if (deviceCostList.length === 0) {
            this.$message.warning('请至少为一个成本项输入价格')
            return
          }

          this.loading = true

          // 调用批量保存接口（新增和编辑都用同一个接口）
          batchAddDeviceCost(deviceCostList).then(response => {
            if (response.code === 200) {
              const successMsg = this.editMode
                ? `修改成功`
                : `新增成功`
              this.$message.success(successMsg)
              this.dialogVisible = false
              this.$emit('success')
            } else {
              const errorMsg = this.editMode ? '修改失败' : '新增失败'
              this.$message.error(response.msg || errorMsg)
            }
          }).catch(error => {
            const errorMsg = this.editMode ? '修改失败' : '新增失败'
            console.error(`${errorMsg}:`, error)
            this.$message.error(`${errorMsg}，请稍后重试`)
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },

    // 处理价格输入
    handlePriceInput(key, value) {
      // 如果value是undefined或null，说明是清空操作
      if (value === undefined || value === null || value === '') {
        if (this.form.costItemPrices.hasOwnProperty(key)) {
          this.$delete(this.form.costItemPrices, key)
        }
      } else if (typeof value === 'number' && value >= 0) {
        // 只有当value是有效数值时才设置
        this.$set(this.form.costItemPrices, key, value)
      }
    },

    // 关闭
    handleClose() {
      this.$refs.form.resetFields()
      this.form.costItemPrices = {}
    }
  }
}
</script>

<style lang="scss" scoped>
// 弹窗整体样式
:deep(.batch-cost-dialog) {
  .el-dialog__header {
    padding: 15px 20px 10px;
    border-bottom: 1px solid #ebeef5;
    background: #f8f9fa;
  }

  .el-dialog__body {
    padding: 15px 20px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .el-dialog__footer {
    padding: 10px 20px 15px;
    border-top: 1px solid #ebeef5;
    background: #f8f9fa;
  }
}

// 自定义标题样式
.dialog-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;

  i {
    color: #409eff;
    font-size: 18px;
  }
}

// 紧凑表单
.compact-form {
  .cotegory-input-wrapper {
    ::v-deep .el-input__inner {
      height: 70px;
      border: 0;
      text-align: center;
      font-weight: 700;
      font-size: 22px;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 12px;

    .el-form-item__label {
      font-size: 13px;
      color: #606266;
      line-height: 32px;
    }
  }

  :deep(.el-select) {
    width: 100%;
  }
}

.dialog-footer {
  text-align: right;

  .el-button {
    margin-left: 8px;
  }
}

// 成本类型区域 - 仿照图片中的边框样式
.cost-type-section {
  margin-bottom: 18px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #ffffff;
  position: relative;

  .cost-type-header {
    padding: 0px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    top: -10px;
    background: #fff;
    left: 10px;
    z-index: 1;

    .cost-type-title {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;

      i {
        color: #409eff;
        font-size: 14px;
      }
    }

    .cost-type-subtitle {
      font-size: 11px;
      color: #909399;
      background: #e8f4ff;
      padding: 2px 6px;
      border-radius: 3px;
      border: 1px solid #d9ecff;
    }
  }
}

// 网格布局优化 - 适配24寸屏幕
.cost-items-grid {
  padding: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}

// 成本项卡片 - 更紧凑的设计
.cost-item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #fafbfc;
  border: 1px dashed #cfdbf3;
  border-radius: 4px;
  transition: all 0.2s ease;
  min-height: 60px;

  &:hover {
    border-color: #409eff;
    background: #f0f6ff;
    box-shadow: 0 1px 4px rgba(64, 158, 255, 0.15);
  }

  .cost-item-info {
    flex: 1;
    min-width: 0; // 防止文字溢出

    .cost-item-name {
      font-size: 13px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 3px;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cost-item-remark {
      font-size: 11px;
      color: #909399;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .cost-item-price {
    margin-left: 10px;
    flex-shrink: 0;
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;

    ::v-deep .el-input-number {
      .el-input__inner {
        font-size: 12px;
        height: 28px;
        line-height: 28px;
      }

      .el-input-number__increase,
      .el-input-number__decrease {
        height: 14px;
        line-height: 14px;
      }
    }

    .required-mark {
      color: #f56c6c;
      font-size: 14px;
      font-weight: bold;
      margin-left: 2px;
    }
  }
}

// 响应式优化
@media (max-width: 1400px) {
  .cost-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 8px;
  }

  .cost-item-card {
    padding: 8px 10px;
    min-height: 55px;
  }
}
</style>