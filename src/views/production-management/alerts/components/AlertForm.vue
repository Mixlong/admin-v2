<template>
  <el-dialog :title="isEdit ? '编辑报警信息' : '新增报警信息'" :visible.sync="dialogVisible" width="800px" top="0"
    :close-on-click-modal="false" @close="handleClose" class="alert-form-dialog">
    <el-form ref="alertForm" :model="formData" :rules="formRules" label-width="120px" class="alert-form">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="工单号" prop="workOrderNo">
            <el-autocomplete v-model="formData.workOrderNo" :fetch-suggestions="queryWorkOrders" placeholder="请输入工单号"
              clearable style="width: 100%" @select="handleWorkOrderSelect">
              <template slot-scope="{ item }">
                <div class="work-order-suggestion">
                  <span>{{ item.value }}</span>
                </div>
              </template>
            </el-autocomplete>
          </el-form-item>
        </el-col>


      </el-row>

      <el-row :gutter="20">
        <!-- <el-col :span="12">
          <el-form-item label="品类名称" prop="categoryName">
            <el-select v-model="formData.categoryName" placeholder="请选择品类" clearable filterable style="width: 100%"
              :loading="categoryLoading" @change="changeCategory">
              <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.name" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="型号名称" prop="computerName">
            <el-select v-model="formData.computerName" placeholder="请先选择品类" clearable filterable style="width: 100%"
              :loading="computerLoading" :disabled="!formData.categoryName">
              <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.name" />
            </el-select>
          </el-form-item>
        </el-col> -->

        <el-col :span="12" style="display: none;">
          <el-form-item label="上报人" prop="reporter">
            <el-input v-model="formData.reporter" placeholder="请输入上报人" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="责任归属部门" prop="responsibleDept"
            :rules="[{ required: true, message: '请选择责任归属部门', trigger: 'change' }]">
            <treeselect v-model="formData.responsibleDept" :options="deptOptions" :disable-branch-nodes="true"
              placeholder="请选择责任归属部门" :clearable="true" :searchable="true" @input="handleDeptChange"
              :loading="deptLoading" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="责任归属人" prop="responsible"
            :rules="[{ required: true, message: '请选择责任归属人', trigger: 'change' }]">
            <el-select v-model="formData.responsible" placeholder="请先选择部门" filterable clearable style="width: 100%"
              :disabled="!formData.responsibleDept" :loading="computerLoading">
              <el-option v-for="item in applicantList" :key="item.userId" :label="item.nickName"
                :value="item.nickName" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="问题描述" prop="problemDesc">
        <el-input v-model="formData.problemDesc" type="textarea" :rows="4" placeholder="请详细描述遇到的问题..." maxlength="100"
          show-word-limit />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注信息（可选）" maxlength="200"
          show-word-limit />
      </el-form-item>

      <el-form-item label="附件上传" prop="fileUrl">
        <DrUpload v-model="formData.fileUrl" :isOnePic="0" :multiple="true" class="file-upload-container">
          <div class="upload-area">
            <el-button size="small" type="primary" icon="el-icon-upload">上传附件</el-button>
            <div class="upload-tip">
              支持上传图片、文档等文件，单个文件不超过10MB
            </div>
          </div>
        </DrUpload>
      </el-form-item>


    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createProductionAlert, updateProductionAlert, getTodayOrderCodes } from '@/api/production-management/alerts'
import { alertFormRules, processTypeOptions } from '@/types/production-alerts'
import categoryService from '@/utils/categoryService'
import { listDept } from '@/api/system/dept'
import { listUser } from '@/api/system/user'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'AlertForm',
  components: {
    Treeselect
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      computerLoading: false,
      categoryLoading: false,
      // 品类数据（与testRecord/index.vue保持一致，使用CategoryMixin模式）
      dictList: [],
      // 型号数据（根据品类过滤后的）
      computerOptions: [],
      // 部门和人员数据（与BomChangeForm保持一致）
      deptOptions: [],
      applicantList: [],
      deptLoading: false,
      // 工单号数据缓存
      allOrderCodes: [], // 缓存所有工单数据
      orderCodesLoaded: false, // 标记数据是否已加载
      formData: {
        id: '',
        workOrderNo: '',
        schedulingId: '', // 排产单ID
        categoryId: '', // 品类ID
        computerId: '', // 型号ID
        orderCode: '', // 订单编号
        categoryName: '',
        computerName: '',
        problemDesc: '',
        reporter: '',
        responsible: '',
        responsibleDept: null, // TreeSelect绑定的部门ID
        processType: 1, // 默认为待处理
        processName: '',
        remark: '',
        fileUrl: '', // 附件上传字段
        createdTime: '',
        processStartTime: '',
        processEndTime: '',
        verificationTime: '',
        processDuration: ''
      },
      formRules: {
        ...alertFormRules,
        workOrderNo: [
          { required: true, message: '请输入工单号', trigger: 'blur' }
        ]
      },
      processTypeOptions: processTypeOptions
    }
  },
  computed: {
    isEdit() {
      return this.editData && this.editData.id
    },
    canEditStatus() {
      // 只有管理员或处理人可以编辑状态
      return true // TODO: 根据用户权限判断
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.initForm()
        this.getCategoryData()
        this.getTreeselect()
        // 预加载工单数据
        this.loadAllOrderCodes()
      }
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:visible', false)
      }
    }
  },
  methods: {
    // 初始化表单
    initForm() {
      if (this.isEdit) {
        // 编辑模式，填充现有数据
        this.formData = {
          ...this.editData,
          processType: this.editData.processType || 1
        }

        // 在编辑模式下，如果有responsibleDeptId，设置为responsibleDept
        if (this.editData.responsibleDeptId) {
          this.formData.responsibleDept = parseInt(this.editData.responsibleDeptId)
        }

        // 如果有责任部门ID，加载对应的人员列表
        if (this.formData.responsibleDept) {
          this.$nextTick(() => {
            this.handleDeptChange(this.formData.responsibleDept, true) // 传递isInitialLoad=true
          })
        }
      } else {
        // 新增模式，重置表单
        this.resetForm()
        // 设置默认上报人为当前用户
        this.formData.reporter = this.$store.getters.name || ''
      }
    },

    // 重置表单
    resetForm() {
      this.formData = {
        id: '',
        workOrderNo: '',
        schedulingId: '', // 排产单ID
        categoryId: '', // 品类ID
        computerId: '', // 型号ID
        orderCode: '', // 订单编号
        categoryName: '',
        computerName: '',
        problemDesc: '',
        reporter: '',
        responsible: '',
        responsibleDept: null, // 重置部门ID选择
        processType: 1,
        processName: '',
        remark: '',
        fileUrl: '', // 重置附件字段
        createdTime: '',
        processStartTime: '',
        processEndTime: '',
        verificationTime: '',
        processDuration: ''
      }

      if (this.$refs.alertForm) {
        this.$refs.alertForm.clearValidate()
      }
    },

    // 根据部门名称查找部门ID
    findDeptIdByName(deptName) {
      const findInOptions = (options) => {
        for (const option of options) {
          if (option.label === deptName) {
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

    // 工单号自动完成查询（本地过滤）
    async queryWorkOrders(queryString, callback) {
      try {
        // 如果数据未加载，先加载所有工单数据
        if (!this.orderCodesLoaded) {
          await this.loadAllOrderCodes()
        }

        // 本地过滤数据
        let filteredResults = this.allOrderCodes

        if (queryString && queryString.trim()) {
          const query = queryString.toLowerCase().trim()
          filteredResults = this.allOrderCodes.filter(item => {
            const orderCode = (item.orderCode || item.value || '').toLowerCase()
            const desc = (item.productName || item.desc || '').toLowerCase()
            return orderCode.includes(query) || desc.includes(query)
          })
        }

        // 限制返回结果数量，避免列表过长
        const limitedResults = filteredResults.slice(0, 20)
        callback(limitedResults)
      } catch (error) {
        console.error('工单号查询失败:', error)
        callback([])
      }
    },

    // 加载所有工单数据并缓存
    async loadAllOrderCodes() {
      try {
        const response = await getTodayOrderCodes()
        if (response.code === 200 && response.data) {
          // 转换并缓存数据，使用新的API数据结构
          this.allOrderCodes = response.data.map(item => ({
            value: item.orderCode || item.id, // 显示的工单号
            desc: `排产数量: ${item.num || 0}`,
            // 保留完整的原始数据用于自动填充
            id: item.id,
            schedulingId: item.schedulingId,
            categoryId: item.categoryId,
            computerId: item.computerId,
            orderCode: item.orderCode,
            batchNo: item.batchNo,
            date: item.date,
            num: item.num
          }))
          this.orderCodesLoaded = true
          console.log(`已加载 ${this.allOrderCodes.length} 个工单号`)
        } else {
          console.warn('获取工单数据失败:', response.msg)
          this.allOrderCodes = []
        }
      } catch (error) {
        console.error('加载工单数据失败:', error)
        this.allOrderCodes = []
      }
    },

    // 工单号选择处理
    handleWorkOrderSelect(item) {
      console.log('📝 选中工单:', item)

      // 设置工单号
      this.formData.workOrderNo = item.value

      // 自动填充API返回的字段
      if (item.schedulingId) {
        this.formData.schedulingId = item.schedulingId
      }
      if (item.categoryId) {
        this.formData.categoryId = item.categoryId
      }
      if (item.computerId) {
        this.formData.computerId = item.computerId
      }
      if (item.orderCode) {
        this.formData.orderCode = item.orderCode
      }

      console.log('✅ 自动填充完成:', {
        schedulingId: this.formData.schedulingId,
        categoryId: this.formData.categoryId,
        computerId: this.formData.computerId,
        orderCode: this.formData.orderCode
      })

      // 根据工单号自动填充相关信息
      this.autoFillByWorkOrder(item)
    },

    // 根据工单号自动填充信息
    async autoFillByWorkOrder(workOrder) {
      try {
        console.log('🔄 开始自动填充工单信息:', workOrder)

        // 如果有categoryId，尝试根据categoryId获取品类名称
        if (workOrder.categoryId && this.dictList.length > 0) {
          const category = this.dictList.find(item => item.id === workOrder.categoryId)
          if (category) {
            this.formData.categoryName = category.name
            console.log('✅ 自动填充品类名称:', category.name)

            // 更新型号选项
            this.changeCategory(category.name)

            // 如果有computerId，尝试根据computerId获取型号名称
            if (workOrder.computerId) {
              this.$nextTick(() => {
                const computer = this.computerOptions.find(item => item.model === workOrder.computerId)
                if (computer) {
                  this.formData.computerName = computer.name
                  console.log('✅ 自动填充型号名称:', computer.name)
                }
              })
            }
          }
        }

        // 如果没有找到品类信息，但有传统的productName和categoryName，使用原来的逻辑
        if (workOrder.productName && workOrder.categoryName) {
          this.formData.categoryName = workOrder.categoryName
          if (workOrder.categoryName) {
            this.changeCategory(workOrder.categoryName)
            if (workOrder.computerName) {
              this.$nextTick(() => {
                this.formData.computerName = workOrder.computerName
              })
            }
          }
        }

        console.log('✅ 工单信息填充完成')
      } catch (error) {
        console.error('自动填充工单信息失败:', error)
      }
    },

    // 品类变化处理（使用共享的CategoryService）
    changeCategory(categoryName) {
      if (!categoryName) {
        this.computerOptions = []
        this.formData.computerName = ""
        return
      }

      // 清空型号选择
      this.formData.computerName = ""

      // 使用CategoryService获取对应的型号列表
      this.computerOptions = categoryService.getComputersByCategory(categoryName)
    },

    // 兼容原有的方法名
    handleCategoryChange(value) {
      this.changeCategory(value)
    },

    // 加载品类和型号数据（使用共享的CategoryService）
    async getCategoryData() {
      try {
        this.categoryLoading = true
        const { categories } = await categoryService.getCategoryData()
        this.dictList = categories || []
        return categories
      } catch (error) {
        console.error('获取品类数据失败:', error)
        this.$message.error('获取品类数据失败')
        this.dictList = []
        return []
      } finally {
        this.categoryLoading = false
      }
    },

    // 查询部门下拉树结构（与BomChangeForm完全一致）
    getTreeselect() {
      listDept().then((res) => {
        const data = res.data.map((item) => {
          return {
            parentId: item.parentId,
            id: item.deptId,
            label: item.deptName,
            // 确保没有默认选中状态
            isSelected: false,
            isDefaultExpanded: false
          };
        });

        this.deptOptions = this.handleTree(data);

      });
    },

    // 构造部门下拉树结构（与BomChangeForm完全一致）
    handleTree(data, parentId = 0) {
      const tree = [];
      data.forEach(item => {
        if (item.parentId === parentId) {
          const children = this.handleTree(data, item.id);
          if (children.length > 0) {
            item.children = children;
          }
          tree.push(item);
        }
      });
      return tree;
    },

    // treeselect节点标准化
    normalizeNode(node) {
      return {
        id: node.id,
        label: node.label,
        children: node.children
      }
    },


    // 部门变化时加载对应人员（与BomChangeForm保持一致）
    async handleDeptChange(deptId, isInitialLoad = false) {
      if (!deptId) {
        this.applicantList = []
        if (!isInitialLoad) {
          this.formData.responsible = ''
        }
        return
      }

      // 保存当前选择的责任人
      const currentResponsible = this.formData.responsible

      try {
        this.computerLoading = true
        const response = await listUser({ deptId })
        if (response.code === 200) {
          this.applicantList = response.rows || []

          // 在编辑模式下处理责任人
          if (this.isEdit && currentResponsible) {
            // 检查当前责任人是否在新的人员列表中
            const existsInNewList = this.applicantList.some(user => user.nickName === currentResponsible)

            if (existsInNewList) {
              // 责任人在列表中，保持选择
              this.formData.responsible = currentResponsible
            } else if (!isInitialLoad) {
              // 只有在非初始加载时才清空并提示（用户主动更改部门时）
              this.formData.responsible = ''
              this.$message.warning('当前责任人不属于所选部门，已清空责任人选择')
            } else {
              // 初始加载时，即使责任人不在列表中也保持原值，但给出警告

              this.formData.responsible = currentResponsible
              // 添加一个占位选项到列表中，确保显示正确
              this.applicantList.unshift({
                userId: 'temp_' + Date.now(),
                nickName: currentResponsible,
                isTemp: true
              })
            }
          } else if (!this.isEdit && !isInitialLoad) {
            // 新增模式下且非初始加载时清空责任人选择
            this.formData.responsible = ''
          }
        } else {
          this.$message.error('获取人员数据失败')
          this.applicantList = []
          if (!isInitialLoad) {
            this.formData.responsible = ''
          }
        }
      } catch (error) {

        this.$message.error('获取人员数据失败')
        this.applicantList = []
        if (!isInitialLoad) {
          this.formData.responsible = ''
        }
      } finally {
        this.computerLoading = false
      }
    },

    // 提交表单
    handleSubmit() {
      console.log('🔍 表单提交调试信息:')
      console.log('1. 表单数据:', this.formData)
      console.log('2. 是否编辑模式:', this.isEdit)
      console.log('3. 提交中状态:', this.submitLoading)

      this.$refs.alertForm.validate(async (valid) => {
        console.log('4. 表单验证结果:', valid)
        if (!valid) {
          console.log('❌ 表单验证失败')
          this.$message.error('请检查表单填写是否正确')
          return
        }

        // 提交前的数据处理
        const submitData = this.prepareSubmitData()

        this.submitLoading = true
        try {
          console.log('5. 准备提交的数据:', submitData)
          let response
          if (this.isEdit) {
            console.log('🔄 执行更新操作...')
            response = await updateProductionAlert(submitData)
          } else {
            console.log('🔄 执行创建操作...')
            response = await createProductionAlert(submitData)
          }
          console.log('6. API响应:', response)

          if (response.code === 200) {
            this.$message.success(this.isEdit ? '更新操作成功' : '创建操作成功')
            this.$emit('success', response.data)
            this.handleClose()
          } else {
            this.$message.error(response.msg || '操作失败')
          }
        } catch (error) {

          this.$message.error('操作失败，请稍后重试')
        } finally {
          this.submitLoading = false
        }
      })
    },

    // 准备提交数据
    prepareSubmitData() {
      const data = { ...this.formData }

      // 处理部门信息 - 从TreeSelect的部门ID转换为API所需格式
      if (data.responsibleDept) {
        // data.responsibleDept 存储的是TreeSelect选中的部门ID
        const currentDeptId = data.responsibleDept

        // 从部门选项中查找对应的部门名称
        const findDeptName = (options, deptId) => {
          for (const option of options) {
            if (option.id === deptId) {
              return option.label
            }
            if (option.children && option.children.length > 0) {
              const childResult = findDeptName(option.children, deptId)
              if (childResult) return childResult
            }
          }
          return null
        }

        // 查找部门名称
        const deptName = findDeptName(this.deptOptions, currentDeptId)
        if (deptName) {
          // responsibleDept 存储部门名称 (string)
          data.responsibleDept = deptName
          // responsibleDeptId 存储部门ID 转为字符串 (string)
          data.responsibleDeptId = String(currentDeptId)
        } else {
          // 如果找不到部门名称，记录警告并提供兜底值

          data.responsibleDept = `部门${currentDeptId}` // 兜底的部门名称
          data.responsibleDeptId = String(currentDeptId) // 转为字符串
        }


      }

      // 新增时设置默认值
      if (!this.isEdit) {
        data.processType = 1 // 默认为待处理
        data.createdTime = new Date().toISOString()
        // 移除编辑相关的字段
        delete data.processStartTime
        delete data.processEndTime
        delete data.verificationTime
        delete data.processDuration
      }

      // 清理空值（但保留部门相关字段）
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === null || data[key] === undefined) {
          // 保留重要的部门字段，即使为空也要传递
          if (!['responsibleDept', 'responsibleDeptId'].includes(key)) {
            delete data[key]
          }
        }
      })

      // 最终提交数据的调试信息


      return data
    },
    // 为继续创建重置表单
    resetFormForContinue() {
      const keepFields = {
        reporter: this.formData.reporter,
        responsibleDept: this.formData.responsibleDept
      }

      this.resetForm()

      // 保留一些常用字段
      Object.assign(this.formData, keepFields)

      if (this.$refs.alertForm) {
        this.$refs.alertForm.clearValidate()
      }
    },


    // 关闭对话框
    handleClose() {
      this.dialogVisible = false
      this.resetForm()
      // 清除工单数据缓存，确保下次打开时获取最新数据
      this.allOrderCodes = []
      this.orderCodesLoaded = false
    },


    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    }
  }
}
</script>

<style lang="scss" scoped>
.alert-form-dialog {
  .alert-form {
    .work-order-suggestion {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .work-order-desc {
        font-size: 12px;
        color: #909399;
      }
    }

    .time-info {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 6px;
    }

    .file-upload-container {
      .upload-area {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;

        .upload-tip {
          font-size: 12px;
          color: #909399;
          line-height: 1.4;
        }
      }

      ::v-deep .el-upload-list {
        margin-top: 10px;
      }

      ::v-deep .el-upload-list__item {
        border-radius: 4px;
        transition: all 0.3s ease;

        &:hover {
          background-color: #f5f7fa;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;
  }
}

// 深度选择器样式
::v-deep .el-textarea__inner {
  resize: vertical;
}

::v-deep .el-descriptions {
  .el-descriptions__label {
    font-weight: 500;
    color: #606266;
  }

  .el-descriptions__content {
    color: #303133;
  }
}
</style>