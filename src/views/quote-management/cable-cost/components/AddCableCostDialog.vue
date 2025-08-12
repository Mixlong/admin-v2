<template>
  <el-dialog :visible.sync="dialogVisible" width="850px" top='0vh' :close-on-click-modal="false" @close="handleClose"
    class="add-cable-cost-dialog" custom-class="cable-cost-dialog">
    <div slot="title" class="dialog-title">
      <i class="el-icon-connection"></i>
      {{ editData ? '编辑线缆成本' : '新增线缆成本' }}
    </div>

    <el-form :model="form" :rules="rules" ref="form" label-width="80px" class="compact-form">
      <!-- 供应商选择 -->
      <div class="supplier-section">
        <div class="section-header">
          <div class="section-title">
            <i class="text-red">*</i>
            供应商
          </div>
        </div>
        <div class="supplier-input-wrapper">
          <el-select v-model="form.supplier" placeholder="请选择供应商" style="width: 100%" class="el-select-supplier"
            filterable>
            <el-option v-for="item in supplierOptions" :key="item.dictCode" :label="item.dictLabel"
              :value="item.dictCode" :disabled="isSupplierDisabled(item.dictCode)">
            </el-option>
          </el-select>
        </div>
      </div>

      <!-- 防水头模块 -->
      <div class="cost-type-section">
        <div class="cost-type-header">
          <div class="cost-type-title">
            防水头
          </div>
          <el-button size="mini" type="text" @click="addWaterproofHead">
            <i class="el-icon-plus"></i> 新增
          </el-button>
        </div>
        <div class="cost-items-grid">
          <div v-for="(item, index) in form.waterproofHeads" :key="index" class="cost-item-card">
            <div class="cost-item-info">
              <el-input v-model="item.cableModel" placeholder="防水头型号" size="mini" style="margin-bottom: 8px;">
              </el-input>
              <el-input-number v-model="item.waterproofHeadPrice" :precision="2" :min="0" :controls="false"
                placeholder="价格" size="mini" style="width: 100%">
              </el-input-number>
            </div>
            <div class="cost-item-actions">
              <el-button size="mini" type="danger" icon="el-icon-delete" circle
                @click="removeWaterproofHead(index)"></el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 扳机端子模块 -->
      <div class="cost-type-section">
        <div class="cost-type-header">
          <div class="cost-type-title">
            插线端子
          </div>
          <el-button size="mini" type="text" @click="addTriggerTerminal">
            <i class="el-icon-plus"></i> 新增
          </el-button>
        </div>
        <div class="cost-items-grid">
          <div v-for="(item, index) in form.triggerTerminals" :key="index" class="cost-item-card">
            <div class="cost-item-info">
              <el-input v-model="item.triggerTerminalModel" placeholder="扳机端子型号" size="mini"
                style="margin-bottom: 8px;">
              </el-input>
              <el-input-number v-model="item.triggerTerminalPrice" :precision="2" :min="0" :controls="false"
                placeholder="价格" size="mini" style="width: 100%">
              </el-input-number>
            </div>
            <div class="cost-item-actions">
              <el-button size="mini" type="danger" icon="el-icon-delete" circle
                @click="removeTriggerTerminal(index)"></el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 线缆价格模块 -->
      <div class="cost-type-section">
        <div class="cost-type-header">
          <div class="cost-type-title">
            线缆价格
          </div>
          <el-button size="mini" type="text" @click="addLinearPrice">
            <i class="el-icon-plus"></i> 新增
          </el-button>
        </div>
        <div class="cost-items-grid">
          <div v-for="(item, index) in form.linearPrices" :key="index" class="cost-item-card linear-price-card">
            <div class="cost-item-info">
              <el-select v-model="item.linearType" placeholder="线材类型" size="mini"
                style="margin-bottom: 8px; width: 100%;">
                <el-option label="普通线" value="common"></el-option>
                <el-option label="UL线" value="ul"></el-option>
              </el-select>
              <el-input v-model="item.linearModel" placeholder="线材型号" size="mini" style="margin-bottom: 8px;">
              </el-input>
              <div class="input-with-unit">
                <el-input-number v-model="item.price" :precision="2" :min="0" :controls="false" placeholder="价格（元/米）"
                  size="mini" style="width: 100%;">
                </el-input-number>
              </div>
            </div>
            <div class="cost-item-actions">
              <el-button size="mini" type="danger" icon="el-icon-delete" circle
                @click="removeLinearPrice(index)"></el-button>
            </div>
          </div>
        </div>
      </div>

    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleCancel">取消</el-button>
      <el-button size="small" type="primary" @click="handleConfirm" :loading="loading">
        {{ editData ? '保存' : '提交' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addCableCost } from '@/api/quote-management/cableCost'

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
    },
    existingSuppliers: {
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
        waterproofHeads: [],
        linearPrices: [], // 线缆价格数组
        triggerTerminals: []
      },
      rules: {
        supplier: [
          { required: true, message: '请选择供应商', trigger: 'change' }
        ]
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
  methods: {
    // 初始化表单
    initForm() {
      if (this.editData) {
        // 编辑模式，解析现有数据
        this.form = {
          supplier: this.editData.supplier || '',
          waterproofHeads: [],
          linearPrices: [],
          triggerTerminals: []
        }

        // 解析编辑数据中的防水头、线缆价格和扳机端子
        if (this.editData.list && Array.isArray(this.editData.list)) {
          this.editData.list.forEach(item => {
            if (item.costCableType === 1) {
              // 防水头
              this.form.waterproofHeads.push({
                cableModel: item.cableModel || '',
                waterproofHeadPrice: item.waterproofHeadPrice || undefined
              })
            } else if (item.costCableType === 2) {
              // 线缆价格
              if (item.commonLinearPrice > 0) {
                this.form.linearPrices.push({
                  linearType: 'common',
                  linearModel: item.linearModel || '',
                  price: item.commonLinearPrice
                })
              }
              if (item.ulLinearPrice > 0) {
                this.form.linearPrices.push({
                  linearType: 'ul',
                  linearModel: item.linearModel || '',
                  price: item.ulLinearPrice
                })
              }
            } else if (item.costCableType === 3) {
              // 扳机端子
              this.form.triggerTerminals.push({
                triggerTerminalModel: item.triggerTerminalModel || '',
                triggerTerminalPrice: item.triggerTerminalPrice || undefined
              })
            }
          })
        }

        // 如果没有数据，至少添加一个空项
        if (this.form.waterproofHeads.length === 0) {
          this.form.waterproofHeads.push({
            cableModel: '',
            waterproofHeadPrice: undefined
          })
        }
        if (this.form.linearPrices.length === 0) {
          this.form.linearPrices.push({
            linearType: 'common',
            linearModel: '',
            price: undefined
          })
        }
        if (this.form.triggerTerminals.length === 0) {
          this.form.triggerTerminals.push({
            triggerTerminalModel: '',
            triggerTerminalPrice: undefined
          })
        }
      } else {
        // 新增模式
        this.form = {
          supplier: '',
          waterproofHeads: [{
            cableModel: '',
            waterproofHeadPrice: undefined
          }],
          linearPrices: [{
            linearType: 'common',
            linearModel: '',
            price: undefined
          }],
          triggerTerminals: [{
            triggerTerminalModel: '',
            triggerTerminalPrice: undefined
          }]
        }
      }
    },

    // 新增防水头
    addWaterproofHead() {
      this.form.waterproofHeads.push({
        cableModel: '',
        waterproofHeadPrice: undefined
      })
    },

    // 删除防水头
    removeWaterproofHead(index) {
      if (this.form.waterproofHeads.length > 1) {
        this.form.waterproofHeads.splice(index, 1)
      } else {
        this.$message.warning('至少保留一个防水头项')
      }
    },

    // 新增线缆价格
    addLinearPrice() {
      this.form.linearPrices.push({
        linearType: 'common',
        linearModel: '',
        price: undefined
      })
    },

    // 删除线缆价格
    removeLinearPrice(index) {
      if (this.form.linearPrices.length > 1) {
        this.form.linearPrices.splice(index, 1)
      } else {
        this.$message.warning('至少保留一个线缆价格项')
      }
    },


    // 新增扳机端子
    addTriggerTerminal() {
      this.form.triggerTerminals.push({
        triggerTerminalModel: '',
        triggerTerminalPrice: undefined
      })
    },

    // 删除扳机端子
    removeTriggerTerminal(index) {
      if (this.form.triggerTerminals.length > 1) {
        this.form.triggerTerminals.splice(index, 1)
      } else {
        this.$message.warning('至少保留一个扳机端子项')
      }
    },

    // 验证防水头模块
    validateWaterproofHeads() {
      const validWaterproofHeads = []
      const incompleteWaterproofHeads = []

      this.form.waterproofHeads.forEach(item => {
        const hasModel = item.cableModel && item.cableModel.trim()
        const hasPrice = item.waterproofHeadPrice > 0

        if (hasModel && hasPrice) {
          // 完整的项目
          validWaterproofHeads.push(item)
        } else if (hasModel || hasPrice) {
          // 不完整的项目（有一个字段填写了但另一个没填）
          incompleteWaterproofHeads.push(item)
        }
        // 完全空的项目直接跳过
      })

      return { validWaterproofHeads, incompleteWaterproofHeads }
    },

    // 验证线缆价格模块
    validateLinearPrices() {
      const validLinearPrices = []
      const incompleteLinearPrices = []

      this.form.linearPrices.forEach(item => {
        const hasType = item.linearType && item.linearType.trim()
        const hasModel = item.linearModel && item.linearModel.trim()
        const hasPrice = item.price > 0

        if (hasType && hasModel && hasPrice) {
          // 完整的项目
          validLinearPrices.push(item)
        } else if (hasType || hasModel || hasPrice) {
          // 不完整的项目（有字段填写了但不完整）
          incompleteLinearPrices.push(item)
        }
        // 完全空的项目直接跳过
      })

      return { validLinearPrices, incompleteLinearPrices }
    },

    // 验证扳机端子模块
    validateTriggerTerminals() {
      const validTriggerTerminals = []
      const incompleteTriggerTerminals = []

      this.form.triggerTerminals.forEach(item => {
        const hasModel = item.triggerTerminalModel && item.triggerTerminalModel.trim()
        const hasPrice = item.triggerTerminalPrice > 0

        if (hasModel && hasPrice) {
          // 完整的项目
          validTriggerTerminals.push(item)
        } else if (hasModel || hasPrice) {
          // 不完整的项目（有一个字段填写了但另一个没填）
          incompleteTriggerTerminals.push(item)
        }
        // 完全空的项目直接跳过
      })

      return { validTriggerTerminals, incompleteTriggerTerminals }
    },

    // 判断供应商是否应该被禁用
    isSupplierDisabled(supplierCode) {
      // 编辑模式下，当前供应商不禁用
      if (this.editData && this.editData.supplier === supplierCode) {
        return false
      }
      // 新增模式下，如果供应商已存在则禁用
      return this.existingSuppliers.includes(supplierCode)
    },

    // 取消
    handleCancel() {
      this.dialogVisible = false
    },

    // 确定提交
    handleConfirm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 验证供应商必填
          if (!this.form.supplier) {
            this.$message.warning('请选择供应商')
            return
          }

          // 验证防水头模块
          const { validWaterproofHeads, incompleteWaterproofHeads } = this.validateWaterproofHeads()
          // 验证线缆价格模块
          const { validLinearPrices, incompleteLinearPrices } = this.validateLinearPrices()
          // 验证扳机端子模块
          const { validTriggerTerminals, incompleteTriggerTerminals } = this.validateTriggerTerminals()

          // 检查是否有不完整的项目并提示用户
          const incompleteMessages = []
          if (incompleteWaterproofHeads.length > 0) {
            incompleteMessages.push(`防水头模块有 ${incompleteWaterproofHeads.length} 项未完成填写`)
          }
          if (incompleteLinearPrices.length > 0) {
            incompleteMessages.push(`线缆价格模块有 ${incompleteLinearPrices.length} 项未完成填写`)
          }
          if (incompleteTriggerTerminals.length > 0) {
            incompleteMessages.push(`插线端子模块有 ${incompleteTriggerTerminals.length} 项未完成填写`)
          }

          if (incompleteMessages.length > 0) {
            this.$message.warning(incompleteMessages.join('，') + '，请完善后再提交')
            return
          }

          // 验证每个模块至少有一个完整的项目
          const moduleMessages = []
          if (validWaterproofHeads.length === 0) {
            moduleMessages.push('防水头模块')
          }
          if (validLinearPrices.length === 0) {
            moduleMessages.push('线缆价格模块')
          }
          if (validTriggerTerminals.length === 0) {
            moduleMessages.push('插线端子模块')
          }

          if (moduleMessages.length > 0) {
            this.$message.warning(`请至少在以下模块中各填写一项完整信息：${moduleMessages.join('、')}`)
            return
          }

          // 构造提交数据数组
          const submitData = []
          let sort = 1

          // 添加防水头数据
          validWaterproofHeads.forEach(item => {
            submitData.push({
              supplier: this.form.supplier,
              costCableType: 1, // 防水头
              cableModel: item.cableModel,
              waterproofHeadPrice: item.waterproofHeadPrice,
              sort: sort++,
              isDel: 0
            })
          })

          // 添加线缆价格数据
          validLinearPrices.forEach(item => {
            submitData.push({
              supplier: this.form.supplier,
              costCableType: 2, // 线缆价格
              linearModel: item.linearModel,
              commonLinearPrice: item.linearType === 'common' ? item.price : 0,
              ulLinearPrice: item.linearType === 'ul' ? item.price : 0,
              sort: sort++,
              isDel: 0
            })
          })

          // 添加扳机端子数据
          validTriggerTerminals.forEach(item => {
            submitData.push({
              supplier: this.form.supplier,
              costCableType: 3, // 扳机端子
              triggerTerminalModel: item.triggerTerminalModel,
              triggerTerminalPrice: item.triggerTerminalPrice,
              sort: sort++,
              isDel: 0
            })
          })

          this.loading = true

          // 调用API提交数据 - 编辑和新增都使用addCableCost接口
          const apiCall = addCableCost(submitData)

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
      // 重置数组数据
      this.form.waterproofHeads = [{
        cableModel: '',
        waterproofHeadPrice: undefined
      }]
      this.form.linearPrices = [{
        linearType: 'common',
        linearModel: '',
        price: undefined
      }]
      this.form.triggerTerminals = [{
        triggerTerminalModel: '',
        triggerTerminalPrice: undefined
      }]
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .cable-cost-dialog {
  .el-dialog__header {
    padding: 15px 20px 10px;
    border-bottom: 1px solid #ebeef5;
    background: #f8f9fa;
  }

  .el-dialog__body {
    padding: 40px 20px 30px;
    height: 70vh; // 固定高度避免跳动
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



// 供应商区域
.supplier-section {
  margin-bottom: 30px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #ffffff;
  position: relative;

  .section-header {
    position: absolute;
    top: -12px;
    left: 10px;
    z-index: 1;
    height: 24px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      white-space: nowrap;
      background: #fff;
      padding: 0 15px;

      i {
        color: #f56c6c;
        font-size: 14px;
      }
    }
  }

  .supplier-input-wrapper {
    padding: 18px;

    ::v-deep .el-input__inner {
      height: 50px;
      border: 0;
      text-align: center;
      font-weight: 600;
      font-size: 16px;
    }
  }
}

// 成本类型区域
.cost-type-section {
  margin-bottom: 30px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #ffffff;
  position: relative;

  .cost-type-header {
    position: absolute;
    top: -12px;
    left: 10px;
    right: 10px;
    z-index: 1;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .cost-type-title {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      white-space: nowrap;
      background: #fff;
      padding: 0 15px;

      i {
        color: #f56c6c;
        font-size: 14px;
      }
    }

    .el-button {
      color: #409eff;
      white-space: nowrap;
      background: #fff;
      padding: 0 15px;

      &:hover {
        color: #66b1ff;
      }
    }
  }
}

// 网格布局 - 一行3个
.cost-items-grid {
  padding: 22px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

// 成本项卡片
.cost-item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafbfc;
  border: 1px dashed #cfdbf3;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #409eff;
    background: #f0f6ff;
    box-shadow: 0 1px 4px rgba(64, 158, 255, 0.15);
  }

  .cost-item-info {
    flex: 1;
    min-width: 0;

    // 普通输入框也居中
    ::v-deep .el-input__inner {
      text-align: center;
    }
  }

  .cost-item-actions {
    margin-left: 10px;
    flex-shrink: 0;
  }
}

// 线缆价格卡片特殊样式
.linear-price-card {
  .cost-item-info {
    .input-with-unit {
      display: flex;
      align-items: center;

      .unit-text {
        margin-left: 5px;
        color: #606266;
        font-size: 12px;
        white-space: nowrap;
      }
    }
  }
}

// 线缆价格网格
.cable-price-grid {
  padding: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

// 线缆价格一行显示
.cable-price-inline {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 20px;

}

.cable-price-item {
  display: flex;
  align-items: center;

  .cable-price-label {
    font-size: 14px;
    font-weight: 500;
    min-width: 80px; // 统一标签宽度
    color: #303133;
    margin-right: 12px; // 增加右边距保持对齐
    white-space: nowrap;
    text-align: left; // 左对齐标签文字
  }
}

// 输入框与单位组合样式
.input-with-unit {
  display: flex;
  align-items: center;
  width: 100%;

  .number-input {
    width: 200px;
  }
}

// radio组样式统一
.cable-price-item {
  ::v-deep .el-radio-group {
    display: flex;
    align-items: center;

    .el-radio {
      margin-right: 15px;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  // 统一输入框宽度
  .el-input {
    width: 200px;
  }
}

// 移除数字输入框的控制按钮
.number-input ::v-deep .el-input-number__increase,
.number-input ::v-deep .el-input-number__decrease {
  display: none;
}

// 数字输入框内容居中对齐
.number-input ::v-deep .el-input__inner {
  text-align: center;
  padding-right: 15px;
}

// 单位文字样式
.unit-text {
  margin-left: 8px;
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
  min-width: 45px;
}

// 弹窗底部按钮样式
.dialog-footer {
  text-align: right;

  .el-button {
    margin-left: 8px;
  }
}

// 红色必填标识
.text-red {
  color: #f56c6c;
}

// 响应式优化
@media (max-width: 1200px) {
  .cost-items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

@media (max-width: 800px) {
  .cost-items-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .cable-price-inline {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 1400px) {
  .cable-price-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>