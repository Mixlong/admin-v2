<template>
  <el-dialog title="供应商管理" :visible.sync="dialogVisible" width="800px" top="0" :close-on-click-modal="false" center
    @close="handleClose">

    <div class="supplier-container">
      <!-- 操作按钮 -->
      <div class="action-bar">
        <el-button type="primary" @click="handleAdd" icon="el-icon-plus">新增供应商</el-button>
      </div>

      <!-- 供应商列表 -->
      <el-table :data="paginatedData" v-loading="loading" border stripe height="500px" style="width: 100%">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            {{ (pagination.current - 1) * pagination.size + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="dictLabel" label="供应商名称" align="center"></el-table-column>
        <el-table-column prop="remark" label="备注" align="center"></el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="handleEdit(scope.row)" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="text" class="text-red" @click="handleDelete(scope.row)"
              icon="el-icon-delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="pagination.current" :page-sizes="[10, 20, 50, 100]" :page-size="pagination.size"
          layout="total, sizes, prev, pager, next, jumper" :total="supplierList.length">
        </el-pagination>
      </div>
    </div>

    <!-- 新增/编辑供应商弹窗 -->
    <el-dialog :title="editData ? '编辑供应商' : '新增供应商'" top='0' :visible.sync="supplierFormVisible" width="500px"
      append-to-body :close-on-click-modal="false" center>

      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="供应商名称" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入供应商名称"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="supplierFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">确定</el-button>
      </div>
    </el-dialog>

  </el-dialog>
</template>

<script>
import { getSupplierDict, addSupplierDict, updateSupplierDict, deleteSupplierDict } from '@/api/quote-management/cableCost'

export default {
  name: 'AddSupplierDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      saveLoading: false,
      supplierFormVisible: false,
      supplierList: [],
      editData: null,
      form: {
        dictLabel: '',
        remark: ''
      },
      rules: {
        dictLabel: [
          { required: true, message: '请输入供应商名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ]
      },
      pagination: {
        current: 1,
        size: 10
      }
    }
  },
  computed: {
    paginatedData() {
      const start = (this.pagination.current - 1) * this.pagination.size;
      const end = start + this.pagination.size;
      return this.supplierList.slice(start, end);
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.loadSupplierList()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 加载供应商列表
    loadSupplierList() {
      this.loading = true
      getSupplierDict().then(res => {
        if (res.code === 200) {
          this.supplierList = res.data || []
        } else {
          this.$message.error(res.msg || '获取供应商列表失败')
        }
      }).catch(() => {
        this.$message.error('获取供应商列表失败')
      }).finally(() => {
        this.loading = false
      })
    },

    // 新增供应商
    handleAdd() {
      this.editData = null
      this.form = {
        dictLabel: '',
        remark: ''
      }
      this.supplierFormVisible = true
    },

    // 编辑供应商
    handleEdit(row) {
      this.editData = row
      this.form = {
        dictLabel: row.dictLabel,
        remark: row.remark
      }
      this.supplierFormVisible = true
    },

    // 删除供应商
    handleDelete(row) {
      this.$confirm('确定要删除该供应商吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSupplierDict(row.dictCode).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.loadSupplierList()
            this.$emit('success')
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

    // 保存供应商
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.saveLoading = true
          const data = {
            dictLabel: this.form.dictLabel,
            remark: this.form.remark,
            dictType: 'cable_suppliers'
          }

          if (this.editData) {
            // 编辑时保留原有的dictValue和dictCode
            data.dictValue = this.editData.dictValue
            data.dictCode = this.editData.dictCode
            updateSupplierDict(data).then(res => {
              if (res.code === 200) {
                this.$message.success('编辑成功')
                this.supplierFormVisible = false
                this.loadSupplierList()
                this.$emit('success')
              } else {
                this.$message.error(res.msg || '编辑失败')
              }
            }).catch(() => {
              this.$message.error('编辑失败')
            }).finally(() => {
              this.saveLoading = false
            })
          } else {
            // 新增时生成新的dictValue
            let maxValue = 0
            this.supplierList.forEach(item => {
              const value = parseInt(item.dictValue)
              if (!isNaN(value) && value > maxValue) {
                maxValue = value
              }
            })
            data.dictValue = (maxValue + 1).toString()

            addSupplierDict(data).then(res => {
              if (res.code === 200) {
                this.$message.success('新增成功')
                this.supplierFormVisible = false
                this.loadSupplierList()
                this.$emit('success')
              } else {
                this.$message.error(res.msg || '新增失败')
              }
            }).catch(() => {
              this.$message.error('新增失败')
            }).finally(() => {
              this.saveLoading = false
            })
          }
        }
      })
    },

    // 关闭弹窗
    handleClose() {
      this.supplierFormVisible = false
      this.$refs.form?.resetFields()
    },

    // 每页显示条数改变
    handleSizeChange(val) {
      this.pagination.size = val;
      this.pagination.current = 1; // 当每页显示条数改变时，重置当前页为1
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.pagination.current = val;
    }
  }
}
</script>

<style lang="scss" scoped>
.supplier-container {
  .action-bar {
    margin-bottom: 20px;
    text-align: right;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
    padding: 10px 20px;
    background: #fff;
  }
}

.text-red {
  color: #F56C6C;
  margin-left: 10px;

  &:hover {
    color: #f78989;
  }
}

.el-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}
</style>