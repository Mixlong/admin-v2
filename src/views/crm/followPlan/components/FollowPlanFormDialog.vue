<template>
  <el-dialog
    :title="isEdit ? '编辑跟进计划' : '新增跟进计划'"
    :visible.sync="dialogVisible"
    width="700px"
    center
    :before-close="handleClose"
    class="follow-plan-form-dialog"
    :close-on-click-modal="false"
    top="0vh"
  >
    <el-form
      ref="followPlanForm"
      :model="form"
      :rules="rules"
      label-width="120px"
      size="small"
      @submit.prevent
    >
      <!-- 基本信息 -->
      <fieldset class="form-fieldset">
        <legend>基本信息</legend>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户" prop="customerId">
              <SelectLoadMore 
                v-model="form.customerId" 
                :data="customerData.data" 
                :page="customerData.page"
                :hasMore="customerData.more" 
                dictLabel="name" 
                dictValue="id" 
                :request="getCustomerData"
                :placeholder="defaultCustomerId ? '客户已锁定（来自客户详情）' : '请选择客户'" 
                clearable
                :disabled="!!defaultCustomerId"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划执行人" prop="planExecutor">
              <el-select 
                v-model="form.planExecutor" 
                placeholder="请选择计划执行人" 
                style="width: 100%"
                filterable
                clearable
              >
                <el-option 
                  v-for="user in userList" 
                  :key="user.userId" 
                  :label="user.nickName" 
                  :value="user.nickName" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划时间" prop="planTime">
              <el-date-picker
                v-model="form.planTime"
                type="datetime"
                placeholder="请选择计划时间"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">

          </el-col>
        </el-row>

      </fieldset>

      <!-- 计划详情 -->
      <fieldset class="form-fieldset">
        <legend>计划详情</legend>
        <el-form-item label="计划内容" prop="planContent">
          <el-input
            v-model="form.planContent"
            type="textarea"
            :rows="4"
            placeholder="请输入计划内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </fieldset>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button type="primary" size="small" :loading="loading" @click="handleSubmit">
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addFollowPlan, updateFollowPlan } from '@/api/crm/followPlan'
import { getSoCustomerList } from '@/api/crm/soCustomer'
import { listDept } from '@/api/system/dept'
import { listUser } from '@/api/system/user'
import SelectLoadMore from '@/components/selectLoadMore'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'FollowPlanFormDialog',
  components: {
    SelectLoadMore,
    Treeselect
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    projectFollow: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      default: 'add', // add, edit, copy
      validator: value => ['add', 'edit', 'copy'].includes(value)
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
      loading: false,
      // 客户数据
      customerData: {
        data: [],
        page: 1,
        more: true
      },
      // 部门数据
      deptOptions: [],
      // 用户数据
      userList: [],
      form: {
        id: '',
        customerId: '',
        departmentId: null,
        planTime: '',
        planExecutor: '',
        planState: 0,
        planContent: '',
        createBy: '',
        createTime: '',
        updateBy: '',
        updateTime: ''
      },
      rules: {
        customerId: [
          { required: true, message: '请选择客户', trigger: 'change' }
        ],
        planTime: [
          { required: true, message: '请选择计划时间', trigger: 'change' }
        ],
        planExecutor: [
          { required: true, message: '请选择计划执行人', trigger: 'change' }
        ],
        planState: [
          { required: true, message: '请选择计划状态', trigger: 'change' }
        ],
        planContent: [
          { required: true, message: '请输入计划内容', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    isEdit() {
      return this.mode === 'edit'
    },
    isCopy() {
      return this.mode === 'copy'
    }
  },
  watch: {
    visible(val) {
      if (val) {
        // 确保客户数据已加载
        if (this.customerData.data.length === 0) {
          this.getCustomerData().then(async () => {
            if (this.projectFollow && (this.isEdit || this.isCopy)) {
              this.loadFollowPlanData()
            } else {
              this.resetForm()
              await this.$nextTick()
              await this.handleDefaultCustomer()
            }
          })
        } else {
          if (this.projectFollow && (this.isEdit || this.isCopy)) {
            this.loadFollowPlanData()
          } else {
            this.resetForm()
            this.$nextTick(async () => {
              await this.handleDefaultCustomer()
            })
          }
        }
      }
    },
    projectFollow: {
      handler(newVal) {
        if (newVal && this.visible && (this.isEdit || this.isCopy)) {
          this.loadFollowPlanData()
        }
      },
      immediate: true
    }
  },
  mounted() {
    // 初始化数据
    this.getDeptTreeselect()
    this.getUserList()
    this.getCustomerData()
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
        this.form.customerId = this.defaultCustomerId
        
        // 确保计划执行人为当前用户
        const currentUser = this.$store.state.user || {}
        const currentUserName = currentUser.nickName || currentUser.userName || ''
        this.form.planExecutor = currentUserName
        
        console.log('设置后的表单客户ID:', this.form.customerId)
        console.log('设置后的计划执行人:', this.form.planExecutor)
        console.log('当前客户数据:', this.customerData.data)
      }
    },

    // 确保客户选项存在（用于回显）
    async ensureCustomerOptionPresent(customerId) {
      if (!customerId) return
      
      console.log('检查客户选项是否存在:', customerId)
      console.log('当前客户数据:', this.customerData.data)
      
      const exists = this.customerData.data.some(opt => String(opt.id) === String(customerId))
      if (!exists) {
        console.log('客户选项不存在，手动添加用于回显')
        // 直接添加客户选项用于回显，不依赖重新加载
        this.customerData.data.unshift({ 
          id: customerId, 
          name: this.defaultCustomerName || `客户-${customerId}`
        })
        console.log('添加后的客户数据:', this.customerData.data)
      } else {
        console.log('客户选项已存在')
      }
    },

    resetForm() {
      // 获取当前登录用户昵称
      const currentUser = this.$store.state.user || {}
      const currentUserName = currentUser.nickName || currentUser.userName || ''
      
      this.form = {
        id: '',
        customerId: '',
        departmentId: null,
        planTime: '',
        planExecutor: currentUserName, // 默认为当前用户昵称
        planState: 0,
        planContent: '',
        createBy: '',
        createTime: '',
        updateBy: '',
        updateTime: ''
      }
      
      // 只在新增模式下重置客户数据，编辑模式保留已加载的数据
      if (!this.isEdit && !this.isCopy) {
        this.customerData = { data: [], page: 1, more: true }
      }
      
      this.$nextTick(() => {
        if (this.$refs.followPlanForm) {
          this.$refs.followPlanForm.clearValidate()
        }
      })
    },

    async loadFollowPlanData() {
      if (this.projectFollow) {
        // 确保客户数据已加载
        if (this.customerData.data.length === 0) {
          await this.getCustomerData()
        }
        
        // 获取当前登录用户昵称
        const currentUser = this.$store.state.user || {}
        const currentUserName = currentUser.nickName || currentUser.userName || ''
        
        // 填充表单数据
        Object.keys(this.form).forEach(key => {
          if (this.projectFollow[key] !== undefined) {
            this.form[key] = this.projectFollow[key]
          }
        })
        
        // 无论新增、编辑还是复制，都设置为当前用户
        this.form.planExecutor = currentUserName
        
        // 复制模式时清除ID
        if (this.isCopy) {
          this.form.id = ''
        }
        
        // 确保客户选项存在（用于编辑/复制时回显）
        if (this.form.customerId && this.projectFollow.customerName) {
          await this.ensureCustomerOptionPresent(this.form.customerId, this.projectFollow.customerName)
        }
      }
      
      this.$nextTick(() => {
        if (this.$refs.followPlanForm) {
          this.$refs.followPlanForm.clearValidate()
        }
      })
    },

    handleClose() {
      this.dialogVisible = false
      this.resetForm()
    },

    async handleSubmit() {
      try {
        await this.$refs.followPlanForm.validate()
        
        this.loading = true
        
        // 根据模式选择API
        const api = this.isEdit ? updateFollowPlan : addFollowPlan
        const submitData = this.isEdit ? this.form : { ...this.form }
        
        // 新增和复制模式时移除ID字段
        if (!this.isEdit) {
          delete submitData.id
        }
        
        const response = await api(submitData)
        
        if (response.code === 200 || response.code === 0) {
          const action = this.isEdit ? '更新' : '新增'
          this.$message.success(`${action}跟进计划成功`)
          this.dialogVisible = false
          this.$emit('refresh')
        } else {
          const action = this.isEdit ? '更新' : '新增'
          this.$message.error(response.msg || `${action}跟进计划失败`)
        }
      } catch (error) {
        if (error !== false) { // 表单验证失败时error为false
          const action = this.isEdit ? '更新' : '新增'
          console.error(`${action}跟进计划失败:`, error)
          this.$message.error(`${action}跟进计划失败`)
        }
      } finally {
        this.loading = false
      }
    },

    // 获取客户数据
    getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      console.log('获取客户数据:', { page, more, keyword });
      return new Promise((resolve) => {
        getSoCustomerList({
          p: page,
          l: 20,
          name: keyword,
        }).then((res) => {
          console.log('客户API响应:', res);
          const { list, total, pageNum, pageSize } = res.data;
          const filteredList = list.filter((item) => item.status === 0);
          console.log('过滤后的客户列表:', filteredList);

          if (more) {
            this.customerData.data = [...this.customerData.data, ...filteredList];
          } else {
            this.customerData.data = filteredList;
          }

          this.customerData.page = pageNum;
          this.customerData.more = this.customerData.data.length < total;

          resolve();
        }).catch((error) => {
          console.error('获取客户列表失败:', error);
          resolve();
        });
      });
    },

    // 确保客户选项存在（用于编辑/复制时回显）
    async ensureCustomerOptionPresent(id, name) {
      if (!id) return
      const exists = this.customerData.data.some(opt => String(opt.id) === String(id))
      if (!exists) {
        this.customerData.data.unshift({ id, name })
      }
    },

    // 获取部门树结构
    getDeptTreeselect() {
      listDept().then((res) => {
        console.log('部门API响应:', res);
        const data = res.data.map((item) => {
          return {
            parentId: item.parentId,
            id: item.deptId,
            value: item.deptId,
            label: item.deptName,
          };
        });
        this.deptOptions = this.handleTree(data, "id", "parentId");
        console.log('部门选项:', this.deptOptions);
      }).catch((error) => {
        console.error('获取部门列表失败:', error);
      });
    },

    // 获取用户列表
    async getUserList() {
      try {
        const response = await listUser({ p: 1, l: 999 })
        if (response.code === 200 && response.rows) {
          this.userList = response.rows
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
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
    }
  }
}
</script>

<style scoped>
.follow-plan-form-dialog :deep(.el-dialog) {
  margin: 0 auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0 !important;
  max-height: 90vh;
}

.follow-plan-form-dialog :deep(.el-dialog__body) {
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

.follow-plan-form-dialog :deep(.el-form-item) {
  margin-bottom: 16px;
}

.follow-plan-form-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.follow-plan-form-dialog :deep(.el-input__wrapper) {
  border-radius: 4px;
}

.follow-plan-form-dialog :deep(.el-select .el-input__wrapper) {
  border-radius: 4px;
}

.follow-plan-form-dialog :deep(.el-textarea .el-textarea__inner) {
  border-radius: 4px;
}

.follow-plan-form-dialog :deep(.el-date-editor) {
  width: 100%;
}
</style>
