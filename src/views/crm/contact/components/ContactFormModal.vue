<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="editMode ? '编辑联系人' : '新建联系人'"
    width="800px"
    center
    :before-close="handleClose"
    class="contact-form-dialog"
    :close-on-click-modal="false"
    top='0vh'
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      size="small"
      @submit.prevent
    >
      <!-- 基本信息 -->
      <fieldset class="form-fieldset">
        <legend>基本信息</legend>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="联系人姓名" prop="contactName">
              <el-input v-model="formData.contactName" placeholder="请输入联系人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属客户" prop="customerId">
              <SelectLoadMore 
                v-model="formData.customerId" 
                :data="customerData.data" 
                :page="customerData.page"
                :hasMore="customerData.more" 
                dictLabel="name" 
                dictValue="id" 
                :request="getCustomerData"
                size="small" 
                :placeholder="defaultCustomerId ? '客户已锁定（来自客户详情）' : '请选择客户'" 
                clearable
                :disabled="!!defaultCustomerId"
                style="width:100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="其他联系方式" prop="contactPhone">
              <el-input v-model="formData.contactPhone" placeholder="请输入其他联系方式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱地址" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-input v-model="formData.department" placeholder="请输入部门" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-input v-model="formData.position" placeholder="请输入职位" />
            </el-form-item>
          </el-col>
          </el-row>
          <el-row :gutter="16">
          <el-col :span="12">
      
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否决策人" prop="isDecisionMaker">
              <el-switch
                v-model="formData.isDecisionMaker"
                :active-value="1"
                :inactive-value="0"
                active-text="是"
                inactive-text="否"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="联系人详情" prop="contactDetails">
          <el-input
            v-model="formData.contactDetails"
            type="textarea"
            :rows="3"
            placeholder="请输入联系人详情描述"
          />
        </el-form-item>
        <el-form-item label="名片图片" prop="cardImage">
          <el-upload-sortable
            v-model="formData.cardImage"
            :img-w="100"
            :img-h="100"
            accept="image/*"
            :multiple="true"
            :sortable="false"
          />
        </el-form-item>
        
        
      </fieldset>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button type="primary" size="small" @click="handleSubmit" :loading="submitting">
        {{ editMode ? '更新' : '创建' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addCustomerContact, updateCustomerContact } from '@/api/third/customerContact'
import { getCustomerList } from '@/api/order'
import { listDept } from '@/api/system/dept'
import { listUser } from '@/api/system/user'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import SelectLoadMore from '@/components/selectLoadMore'
import ElUploadSortable from '@/components/el-upload-sortable'

export default {
  name: 'ContactFormModal',
  components: {
    Treeselect,
    SelectLoadMore,
    ElUploadSortable
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    contact: {
      type: Object,
      default: null
    },
    defaultCustomerId: {
      type: String,
      default: ''
    },
    defaultCustomerName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      submitting: false,
      formData: {
        contactName: '',
        contactPhone: '',
        email: '',
        wechat: '',
        position: '',
        customerId: '',
        department: '',
        responsiblePerson: '',
        belongDepartment: '',
        isDecisionMaker: 0,
        contactDetails: '',
        collaborator: '',
        cardImage: ''
      },
      // 客户数据
      customerData: {
        data: [],
        page: 1,
        more: true
      },
      // 部门数据
      deptOptions: [],
      // 部门映射
      deptIdToLabel: {},
      labelToDeptId: {},
      // 用户数据
      userList: [],
      // 协作人选择辅助变量
      selectedCollaborators: [],
      // Treeselect 归属部门选择值
      belongDeptId: null,
      formRules: {
        contactName: [
          { required: true, message: '请输入联系人姓名', trigger: 'blur' }
        ],
        contactPhone: [
          { required: false, message: '请输入手机号', trigger: 'blur' },
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        customerId: [
          { required: true, message: '请选择所属客户', trigger: 'change' }
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
    },
    editMode() {
      return this.contact !== null
    }
  },
  mounted() {
    // 初始化数据
    this.getDeptTreeselect()
    this.getUserList()
  },
  watch: {
    visible(visible) {
      if (visible) {
        if (this.editMode && this.contact) {
          // 编辑模式，填充现有数据
          Object.keys(this.formData).forEach(key => {
            if (this.contact[key] !== undefined) {
              this.formData[key] = this.contact[key]
            }
          })
          // 所属客户回显：v-model 需要字符串，与 SelectLoadMore 的 selValue 保持一致
          if (this.contact.customerId !== undefined && this.contact.customerId !== null) {
            this.formData.customerId = String(this.contact.customerId)
            const displayName = this.contact.customerName || this.contact.customer || ''
            this.ensureCustomerOptionPresent(this.formData.customerId, displayName)
          }
          // 归属部门：根据中文label反查ID以回显 Treeselect
          if (this.formData.belongDepartment) {
            const id = this.labelToDeptId[this.formData.belongDepartment]
            this.belongDeptId = id !== undefined ? id : null
          } else {
            this.belongDeptId = null
          }
          // 协作人初始化（后端存逗号分隔字符串）
          if (typeof this.formData.collaborator === 'string' && this.formData.collaborator.length > 0) {
            this.selectedCollaborators = this.formData.collaborator.split(',')
          } else {
            this.selectedCollaborators = []
          }
        } else {
          // 新建模式，重置表单
          this.resetForm()
          this.selectedCollaborators = []
          // 处理默认客户
          this.handleDefaultCustomer()
        }
      }
    }
  },
  methods: {
    // 处理默认客户设置
    async handleDefaultCustomer() {
      if (this.defaultCustomerId && this.defaultCustomerName) {
        console.log('设置默认客户:', this.defaultCustomerId, this.defaultCustomerName)
        
        // 先确保客户选项存在
        const exists = this.customerData.data.some(opt => String(opt.id) === String(this.defaultCustomerId))
        if (!exists) {
          console.log('添加客户选项到列表')
          this.customerData.data.unshift({ 
            id: this.defaultCustomerId, 
            name: this.defaultCustomerName
          })
        }
        
        // 等待下一个tick后设置客户ID
        await this.$nextTick()
        this.formData.customerId = this.defaultCustomerId
        
        console.log('设置后的表单客户ID:', this.formData.customerId)
        console.log('当前客户数据:', this.customerData.data)
      }
    },

    resetForm() {
      this.formData = {
        contactName: '',
        contactPhone: '',
        email: '',
        wechat: '',
        position: '',
        customerId: '',
        department: '',
        responsiblePerson: '',
        belongDepartment: '',
        isDecisionMaker: 0,
        contactDetails: '',
        collaborator: '',
        cardImage: ''
      }

      this.selectedCollaborators = []
      this.belongDeptId = null

      this.$nextTick(() => {
        this.$refs.formRef && this.$refs.formRef.clearValidate()
      })
    },

    handleClose() {
      this.$emit('update:visible', false)
    },

    // 处理协作人选择变更
    handleCollaboratorChange(selectedUsers) {
      this.formData.collaborator = selectedUsers.join(',')
    },

    // 获取客户数据
    getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getCustomerList({
          p: page,
          name: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          const filteredList = list.filter((item) => item.status === 0);

          if (more) {
            this.customerData.data = [...this.customerData.data, ...filteredList];
          } else {
            this.customerData.data = filteredList;
          }

          this.customerData.page = pageNum;
          this.customerData.more = this.customerData.data.length < total;
          resolve();
        }).catch(() => {
          resolve();
        });
      });
    },

    // 获取部门树结构
    getDeptTreeselect() {
      listDept().then((res) => {
        const idToLabel = {}
        const labelToId = {}
        const data = res.data.map((item) => {
          idToLabel[item.deptId] = item.deptName
          labelToId[item.deptName] = item.deptId
          return {
            parentId: item.parentId,
            id: item.deptId,
            value: item.deptId,
            label: item.deptName,
          };
        });
        this.deptIdToLabel = idToLabel
        this.labelToDeptId = labelToId
        this.deptOptions = this.handleTree(data, "id", "parentId");
      });
    },

    // 归属部门选择变化：存中文label
    onBelongDeptChange(val) {
      if (val === null || val === undefined || val === '') {
        this.formData.belongDepartment = ''
      } else {
        const label = this.deptIdToLabel[val]
        this.formData.belongDepartment = label || ''
      }
    },

    // 确保所属客户选项包含当前值（用于回显）
    ensureCustomerOptionPresent(id, name) {
      if (!id) return
      const exists = this.customerData.data.some(opt => String(opt.id) === String(id))
      if (!exists) {
        this.customerData.data.unshift({ id, name })
      }
    },

    // 构建树结构
    handleTree(data, id, parentId, children) {
      let config = {
        id: id || 'id',
        parentId: parentId || 'parentId',
        childrenList: children || 'children'
      };

      let childrenListMap = {};
      let nodeIds = {};
      let tree = [];

      for (let d of data) {
        let parentId = d[config.parentId];
        if (childrenListMap[parentId] == null) {
          childrenListMap[parentId] = [];
        }
        nodeIds[d[config.id]] = d;
        childrenListMap[parentId].push(d);
      }

      for (let d of data) {
        let parentId = d[config.parentId];
        if (nodeIds[parentId] == null) {
          tree.push(d);
        }
      }

      for (let t of tree) {
        adaptToChildrenList(t);
      }

      function adaptToChildrenList(o) {
        if (childrenListMap[o[config.id]] !== null) {
          o[config.childrenList] = childrenListMap[o[config.id]];
        }
        if (o[config.childrenList]) {
          for (let c of o[config.childrenList]) {
            adaptToChildrenList(c);
          }
        }
      }
      return tree;
    },

    // 获取用户列表
    getUserList() {
      listUser({ p: 1, l: 999 }).then(res => {
        if (res.code === 200 && res && Array.isArray(res.rows)) {
          this.userList = res.rows;
        }
      });
    },

    async handleSubmit() {
      try {
        await this.$refs.formRef.validate()
        this.submitting = true

        // 直接使用表单数据，不做字段映射
        const requestData = {
          ...this.formData,
          id: this.editMode ? this.contact.id : undefined
        }

        let response
        if (this.editMode) {
          response = await updateCustomerContact(requestData)
        } else {
          response = await addCustomerContact(requestData)
        }

        if (response.code === 200) {
          this.$message.success(this.editMode ? '联系人更新成功' : '联系人创建成功')
          this.$emit('refresh')
          this.handleClose()
        } else {
          this.$message.error(response.msg || '保存失败')
        }

      } catch (error) {
        if (error !== false) { // 不是表单验证错误
          console.error('保存联系人失败:', error)
          this.$message.error('保存失败，请重试')
        }
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.contact-form-dialog :deep(.el-dialog) {
  margin: 0 auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0 !important;
  max-height: 90vh;
}

.contact-form-dialog :deep(.el-dialog__body) {
  max-height: 75vh;
  overflow-y: auto;
  padding: 20px;
}

.form-fieldset {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
}

.form-fieldset legend {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding: 0 8px;
  margin-left: 8px;
  background: #fff;
}

.dialog-footer {
  text-align: right;
}

.contact-form-dialog :deep(.el-form-item) {
  margin-bottom: 16px;
}

.contact-form-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.contact-form-dialog :deep(.el-input__wrapper) {
  border-radius: 4px;
}

.contact-form-dialog :deep(.el-select .el-input__wrapper) {
  border-radius: 4px;
}

.contact-form-dialog :deep(.el-textarea .el-textarea__inner) {
  border-radius: 4px;
}

.contact-form-dialog :deep(.el-date-editor) {
  width: 100%;
}
</style>
