<template>
  <el-dialog title="类别管理" :visible.sync="dialogVisible" width="900px" :close-on-click-modal="false"    top='0'
    @close="handleClose">

    <div class="category-manage-container">
      <div class="category-section">
        <!-- 成本类型管理 -->
        <div class="category-column">
          <div class="column-header">
            <h3>成本类型</h3>
            <el-button size="mini" type="primary" @click="addCostType" icon="el-icon-plus">新增</el-button>
          </div>
          <div class="column-content">
            <div class="category-list">
              <div v-for="item in costTypes" :key="item.dictCode" class="category-item"
                :class="{ 'active': item.dictCode === selectedTypeId }" @click="selectCostType(item)">
                <div class="item-content">
                  <div class="item-text">
                    <div class="chinese-name">中文: {{ item.dictLabel }}</div>
                    <div class="english-name">英文: {{ item.remark }}</div>
                  </div>
                </div>
                <div class="item-actions">
                  <el-button size="mini" @click.stop="editCostType(item)" icon="el-icon-edit"></el-button>
                  <el-button size="mini" type="danger" @click.stop="deleteCostType(item)" icon="el-icon-delete"></el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 成本项管理 -->
        <div class="category-column">
          <div class="column-header">
            <h3>成本项</h3>
            <el-button size="mini" type="primary" @click="addCostItem" icon="el-icon-plus"
              :disabled="!selectedTypeId">新增</el-button>
          </div>
          <div class="column-content">
            <div class="category-list">
              <div v-for="item in filteredCostItems" :key="item.dictCode" class="category-item">
                <div class="item-content">
                  <div class="item-text">
                    <div class="chinese-name">中文: {{ item.dictLabel }}</div>
                    <div class="english-name">英文: {{ item.remark }}</div>
                  </div>
                </div>
                <div class="item-actions">
                  <el-button size="mini" @click.stop="editCostItem(item)" icon="el-icon-edit"></el-button>
                  <el-button size="mini" type="danger" @click.stop="deleteCostItem(item)" icon="el-icon-delete"></el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <!-- <el-button type="primary" @click="handleConfirm">确定</el-button> -->
    </div>

    <!-- 编辑成本类型弹窗 -->
    <el-dialog :title="editTypeData ? '编辑成本类型' : '新增成本类型'" :visible.sync="typeDialogVisible" width="400px"
      append-to-body>
      <el-form :model="typeForm" :rules="typeRules" ref="typeForm" label-width="80px">
        <el-form-item label="中文名称" prop="label">
          <el-input v-model="typeForm.label" placeholder="请输入中文名称"></el-input>
        </el-form-item>
        <el-form-item label="英文名称" prop="remark">
          <el-input v-model="typeForm.remark" placeholder="请输入英文名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveType">确定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑成本项弹窗 -->
    <el-dialog :title="editItemData ? '编辑成本项' : '新增成本项'" :visible.sync="itemDialogVisible" width="400px" append-to-body top="0">
      <el-form :model="itemForm" :rules="itemRules" ref="itemForm" label-width="100px">
        <el-form-item label="所属成本类型">
          <el-input :value="selectedTypeName" disabled></el-input>
        </el-form-item>
        <el-form-item label="中文名称" prop="label">
          <el-input v-model="itemForm.label" placeholder="请输入中文名称"></el-input>
        </el-form-item>
        <el-form-item label="英文名称" prop="remark">
          <el-input v-model="itemForm.remark" placeholder="请输入英文名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveItem">确定</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { addData, updateData, delData } from '@/api/system/dict/data'

export default {
  name: 'CategoryManageDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    costTypes: {
      type: Array,
      default: () => []
    },
    costItems: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      selectedTypeId: null,
      // 成本类型编辑
      typeDialogVisible: false,
      editTypeData: null,
      typeForm: {
        label: '',
        remark: ''
      },
      typeRules: {
        label: [{ required: true, message: '请输入中文名称', trigger: 'blur' }]
      },
      // 成本项编辑
      itemDialogVisible: false,
      editItemData: null,
      itemForm: {
        label: '',
        remark: ''
      },
      itemRules: {
        label: [{ required: true, message: '请输入中文名称', trigger: 'blur' }]
      }
    }
  },
  computed: {
    // 获取当前选中的成本类型名称
    selectedTypeName() {
      const selectedType = this.costTypes.find(type => type.dictCode === this.selectedTypeId)
      return selectedType ? selectedType.dictLabel : ''
    },
    // 根据选中的成本类型过滤成本项
    filteredCostItems() {
      console.log("当前选中的成本类型ID:", this.costItems)
      
      if (!this.selectedTypeId) return []
      
      const selectedType = this.costTypes.find(type => type.dictCode === this.selectedTypeId)
      console.log("选中的成本类型:", selectedType)
      
      if (!selectedType) return []
      
      // 直接比较dictValue，成本项的dictValue等于成本类型的dictValue即为关联
      const filtered = this.costItems.filter(item => item.dictValue === selectedType.dictValue)
      console.log("过滤后的成本项:", filtered)
      
      return filtered
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val && this.costTypes.length > 0) {
        this.selectedTypeId = this.costTypes[0].dictCode
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 选择成本类型
    selectCostType(item) {
      this.selectedTypeId = item.dictCode
    },

    // 新增成本类型
    addCostType() {
      this.editTypeData = null
      this.typeForm = { label: '', remark: '' }
      this.typeDialogVisible = true
    },

    // 编辑成本类型
    editCostType(item) {
      this.editTypeData = item
      this.typeForm = {
        label: item.dictLabel,
        remark: item.remark || ''
      }
      this.typeDialogVisible = true
    },

    // 删除成本类型
    deleteCostType(item) {
      this.$confirm('确定要删除这个成本类型吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delData(item.dictCode).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.$emit('refresh')
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        }).catch(() => {
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 保存成本类型
    saveType() {
      this.$refs.typeForm.validate((valid) => {
        if (valid) {
          const data = {
            dictLabel: this.typeForm.label,
            dictType: 'cost_category',
            remark: this.typeForm.remark
          }

          if (this.editTypeData) {
            // 编辑时使用原来的值
            data.dictValue = this.editTypeData.dictValue
            data.dictCode = this.editTypeData.dictCode
            updateData(data).then(res => {
              if (res.code === 200) {
                this.$message.success('保存成功')
                this.typeDialogVisible = false
                this.$emit('refresh')
              } else {
                this.$message.error(res.msg || '保存失败')
              }
            }).catch(() => {
              this.$message.error('保存失败')
            })
          } else {
            // 新增时，获取最大的dictValue并加1
            let maxValue = 0
            this.costTypes.forEach(item => {
              const value = parseInt(item.dictValue)
              if (!isNaN(value) && value > maxValue) {
                maxValue = value
              }
            })
            data.dictValue = (maxValue + 1).toString()
            
            addData(data).then(res => {
              if (res.code === 200) {
                this.$message.success('保存成功')
                this.typeDialogVisible = false
                this.$emit('refresh')
              } else {
                this.$message.error(res.msg || '保存失败')
              }
            }).catch(() => {
              this.$message.error('保存失败')
            })
          }
        }
      })
    },

    // 新增成本项
    addCostItem() {
      if (!this.selectedTypeId) {
        this.$message.warning('请先选择成本类型')
        return
      }
      this.editItemData = null
      this.itemForm = { label: '', remark: '' }
      this.itemDialogVisible = true
    },

    // 编辑成本项
    editCostItem(item) {
      this.editItemData = item
      this.itemForm = {
        label: item.dictLabel,
        remark: item.remark || ''
      }
      this.itemDialogVisible = true
    },

    // 删除成本项
    deleteCostItem(item) {
      this.$confirm('确定要删除这个成本项吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delData(item.dictCode).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.$emit('refresh')
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        }).catch(() => {
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 保存成本项
    saveItem() {
      this.$refs.itemForm.validate((valid) => {
        if (valid) {
          const selectedType = this.costTypes.find(type => type.dictCode === this.selectedTypeId)
          if (!selectedType) {
            this.$message.warning('请先选择成本类型')
            return
          }

          const data = {
            dictLabel: this.itemForm.label,
            dictType: 'cost_project',
            remark: this.itemForm.remark,
            dictValue: selectedType.dictValue // 使用选中的成本类型的dictValue
          }

          if (this.editItemData) {
            // 编辑时保留原来的值
            data.dictCode = this.editItemData.dictCode
            updateData(data).then(res => {
              if (res.code === 200) {
                this.$message.success('保存成功')
                this.itemDialogVisible = false
                this.$emit('refresh')
              } else {
                this.$message.error(res.msg || '保存失败')
              }
            }).catch(() => {
              this.$message.error('保存失败')
            })
          } else {
            // 新增时直接使用成本类型的dictValue
            addData(data).then(res => {
              if (res.code === 200) {
                this.$message.success('保存成功')
                this.itemDialogVisible = false
                this.$emit('refresh')
              } else {
                this.$message.error(res.msg || '保存失败')
              }
            }).catch(() => {
              this.$message.error('保存失败')
            })
          }
        }
      })
    },

    // 取消
    handleCancel() {
      this.dialogVisible = false
    },

    // 确定
    handleConfirm() {
      this.dialogVisible = false
      this.$emit('success')
    },

    // 关闭
    handleClose() {
      this.selectedTypeId = null
      this.typeDialogVisible = false
      this.itemDialogVisible = false
      this.editTypeData = null
      this.editItemData = null
    }
  }
}
</script>

<style lang="scss" scoped>
.category-manage-container {
  .category-section {
    display: flex;
    gap: 20px;
    height: 600px;

    .category-column {
      flex: 1;
      border: 1px solid #e4e7ed;
      border-radius: 4px;

      .column-header {
        background: #f5f7fa;
        padding: 10px 15px;
        border-bottom: 1px solid #e4e7ed;
        display: flex;
        align-items: center;
        position: relative;

        h3 {
          margin: 0;
          font-size: 16px;
          color: #303133;
          width: 100%;
          text-align: center;
        }

        .el-button {
          position: absolute;
          right: 15px;
        }
      }

      .column-content {
        height: calc(100% - 45px);
        overflow-y: auto;

        .category-list {
          padding: 10px;

          .category-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            margin-bottom: 8px;
            border: 1px solid #e4e7ed;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              border-color: #409eff;
              background: #f0f9ff;
            }

            &.active {
              border-color: #409eff;
              background: #ecf5ff;
            }

            .item-content {
              flex: 1;

              .item-text {
                .chinese-name {
                  font-size: 14px;
                  color: #303133;
                  margin-bottom: 4px;
                  padding-right: 10px;
                }

                .english-name {
                  font-size: 12px;
                  color: #909399;
                }
              }
            }

            .item-actions {
              display: flex;
              gap: 5px;

              .el-button {
                padding: 5px 8px;
              }
            }
          }

          .add-item {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 15px;
            border: 2px dashed #d9d9d9;
            border-radius: 4px;
            cursor: pointer;
            color: #909399;
            transition: all 0.3s;

            &:hover {
              border-color: #409eff;
              color: #409eff;
            }

            i {
              margin-right: 5px;
              font-size: 16px;
            }

            span {
              font-size: 14px;
            }
          }
        }
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>