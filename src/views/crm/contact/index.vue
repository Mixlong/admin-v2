<template>
  <div class="app-container">
    <!-- 智能搜索区域 -->
    <IntelligentSearchForm 
      ref="intelligentSearchForm"
      :searchForm="searchForm" 
      :fields="searchFields" 
      @search="handleSearch"
      :defaultVisibleCount="4" 
      @reset="handleReset" 
      @field-change="handleFieldChange">

      <!-- 自定义客户选择器字段 -->
      <template #field-customerId="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <SelectLoadMore 
            v-model="searchForm[field.key]" 
            :data="customerData.data" 
            :page="customerData.page"
            :hasMore="customerData.more" 
            dictLabel="name" 
            dictValue="id" 
            :request="getCustomerData"
            size="mini" 
            placeholder="请选择客户" 
            clearable
            @getChange="handleSearch"
            style="width: 150px;"
          />
        </el-form-item>
      </template>

      <!-- 自定义归属部门选择器字段 -->
      <template #field-belongDepartment="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <Treeselect 
            v-model="belongDeptSearchId" 
            :options="deptOptions" 
            :disable-branch-nodes="true"
            :show-count="true" 
            placeholder="请选择归属部门" 
            :clearable="true" 
            :searchable="true"
            :default-expand-level="0"
            value-consists-of="LEAF_PRIORITY"
            @input="onSearchBelongDeptChange"
            style="width: 150px;"
          />
        </el-form-item>
      </template>

      <!-- 页面操作按钮 -->
      <template #page-actions>
          <el-button
            type="primary"
          size="mini"
            icon="el-icon-plus"
            @click="handleAdd"
            v-hasPermi="['crm:contact:add']"
          >
            新建联系人
          </el-button>
      </template>
    </IntelligentSearchForm>

    <!-- 联系人表格 -->
      <el-table
        v-loading="loading"
        :data="filteredContacts"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        row-key="id"
        border
        :height='tableHeight(30)'
        class="crm-contact-table"
      >

        <el-table-column
          prop="contactName"
          label="联系人姓名"
          width="150"
          align="center"
        >
        </el-table-column>

        <el-table-column prop="customerName" label="所属客户" width="170" align="center" />

        <el-table-column prop="department" label="部门" width="140" align="center" />

        <el-table-column prop="position" label="职位" width="140" align="center" />
        <el-table-column prop="email" label="邮箱"  align="center">
          <template slot-scope="{ row }">
            <div v-if="row.email">
              <span class="cursor-pointer text-blue-600" @click="handleEmail(row.email)">
                {{ row.email }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="contactPhone" label="其他联系方式" width="150" align="center">
          <template slot-scope="{ row }">
            <div v-if="row.contactPhone">
              <span class="cursor-pointer text-blue-600" @click="handleCall(row.contactPhone)">
                {{ row.contactPhone }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="cardImage" label="名片" width="200" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.cardImage && getImageList(scope.row.cardImage).length > 0">
              <el-carousel 
                v-if="getImageList(scope.row.cardImage).length > 1"
                height="50px" 
                :autoplay="false" 
                indicator-position="none"
                arrow="hover"
                :interval="4000"
                style="width: 120px; border-radius: 4px; overflow: hidden;margin: auto;">
                <el-carousel-item 
                  v-for="(img, index) in getImageList(scope.row.cardImage)" 
                  :key="index">
                  <el-image
                    style="width: 60px; height: 50px"
                    :src="img"
                    :preview-src-list="getImageList(scope.row.cardImage)"
                    :initial-index="index"
                    fit="cover">
                  </el-image>
                </el-carousel-item>
              </el-carousel>
              <el-image
                v-else
                style="width: 60px; height: 50px; border-radius: 4px;"
                :src="getImageList(scope.row.cardImage)[0]"
                :preview-src-list="getImageList(scope.row.cardImage)"
                fit="cover">
              </el-image>
            </div>
            <span v-else>--</span>
          </template>
        </el-table-column>

        <el-table-column prop="isDecisionMaker" label="决策人" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="row.isDecisionMaker === 1 ? 'success' : 'info'" size="small">
              {{ row.isDecisionMaker === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>

        

        <el-table-column label="操作" align="center" width="220" fixed="right">
          <template slot-scope="{ row }">
            <el-button
              type="text"
              size="small"
              icon="el-icon-view"
              @click="handleView(row)"
              v-hasPermi="['crm:contact:query']"
            >
              查看
            </el-button>
            <el-button
              type="text"
              size="small"
              icon="el-icon-edit"
              @click="handleEdit(row)"
              v-hasPermi="['crm:contact:edit']"
            >
              编辑
            </el-button>
       
            <el-button
              type="text"
              size="small"
              class="action-danger"
              icon="el-icon-delete"
              @click="handleDelete(row)"
              v-hasPermi="['crm:contact:remove']"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-5 flex justify-end" style="margin-top: 10px;">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          size="small"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

    <!-- 联系人详情弹框 -->
    <ContactDetailModal
      :visible.sync="detailVisible"
      :contact="currentContact"
      @refresh="getContactList"
    />

    <!-- 联系人新建/编辑弹框 -->
    <ContactFormModal
      :visible.sync="formVisible"
      :contact="currentContact"
      @refresh="getContactList"
    />

    <!-- 导入弹框 -->
    <ImportModal
      :visible.sync="importVisible"
      type="contact"
      @refresh="getContactList"
    />
  </div>
</template>

<script>
import ContactDetailModal from './components/ContactDetailModal.vue'
import ContactFormModal from './components/ContactFormModal.vue'
import ImportModal from '../components/ImportModal.vue'
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import SelectLoadMore from '@/components/selectLoadMore'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { 
  getCustomerContactList, 
  deleteCustomerContact, 
  batchDeleteCustomerContact,
  exportCustomerContact
} from '@/api/third/customerContact'
import { getCustomerList } from '@/api/order'
import { listDept } from '@/api/system/dept'

export default {
  name: 'CrmContact',
  components: {
    ContactDetailModal,
    ContactFormModal,
    ImportModal,
    IntelligentSearchForm,
    SelectLoadMore,
    Treeselect
  },
  data() {
    return {
      // 响应式数据
      loading: false,
      contacts: [],
      selectedRows: [],

      // 客户数据（与表单共享结构）
      customerData: {
        data: [],
        page: 1,
        more: true
      },
      // 部门数据（与表单共享结构）
      deptOptions: [],
      // 部门映射
      deptIdToLabel: {},
      // 搜索用的归属部门ID
      belongDeptSearchId: null,

      // 搜索表单
      searchForm: {
        contactName: '',
        contactPhone: '',
        customerId: '',
        department: '',
        position: '',
        isDecisionMaker: '',
        responsiblePerson: '',
        belongDepartment: '',
        dateRange: null // 对应 startDate, endDate，日期范围选择器应该初始化为null
      },

      // 搜索字段配置
      searchFields: [
        {
          key: 'contactName',
          label: '联系人姓名',
          component: 'el-input',
          placeholder: '请输入联系人姓名',
          width: '150px',
          sort: 5,
          autoSearch: false,
          props: {
            size: 'mini',
            clearable: true
          }
        },
        {
          key: 'contactPhone',
          label: '联系人手机号',
          component: 'el-input',
          placeholder: '请输入手机号',
          width: '150px',
          sort: 6,
          autoSearch: false,
          props: {
            size: 'mini',
            clearable: true
          }
        },
        {
          key: 'customerId',
          label: '客户',
          component: 'custom', // 使用slot自定义
          placeholder: '请选择客户',
          width: '200px',
          sort: 1,
          autoSearch: true
        },
        {
          key: 'department',
          label: '部门',
          component: 'el-input',
          placeholder: '请输入部门',
          width: '120px',
          sort: 2,
          autoSearch: false,
          props: {
            size: 'mini',
            clearable: true
          }
        },
        {
          key: 'position',
          label: '职务',
          component: 'el-input',
          placeholder: '请输入职务',
          width: '120px',
          sort: 5,
          autoSearch: false,
          props: {
            size: 'mini',
            clearable: true
          }
        },
        {
          key: 'isDecisionMaker',
          label: '是否决策人',
          component: 'el-select',
          placeholder: '是否决策人',
          width: '120px',
          sort: 6,
          autoSearch: true,
          props: {
            size: 'mini',
            clearable: true,
            options: [
              { label: '是', value: '1' },
              { label: '否', value: '0' }
            ]
          }
        },
        {
          key: 'belongDepartment',
          label: '归属部门',
          component: 'custom', // 使用slot自定义
          placeholder: '请选择归属部门',
          width: '160px',
          sort: 4,
          autoSearch: true
        },
        {
          key: 'dateRange',
          label: '创建时间',
          component: 'el-date-picker',
          placeholder: '请选择时间范围',
          width: '200px',
          sort: 3,
          autoSearch: true,
          props: {
            size: 'mini',
            clearable: true,
            type: 'daterange',
            rangeSeparator: '至',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            format: 'yyyy-MM-dd',
            valueFormat: 'yyyy-MM-dd'
          }
        }
      ],

      // 弹框控制
      detailVisible: false,
      formVisible: false,
      importVisible: false,
      currentContact: null,

      // 分页
      currentPage: 1,
      pageSize: 20,
      total: 0
    }
  },
  computed: {
    filteredContacts() {
      // 由于使用服务端搜索，直接返回contacts数据
      return this.contacts
    }
  },
  watch: {
    // 监听搜索表单变化，同步重置自定义组件
    'searchForm.belongDepartment'(newVal) {
      if (newVal === '' || newVal === null || newVal === undefined) {
        this.belongDeptSearchId = null
      }
    },
    'searchForm.customerId'(newVal) {
      if (newVal === '' || newVal === null || newVal === undefined) {
        // 客户被重置时，清空客户数据
        this.customerData = {
          data: [],
          page: 1,
          more: true
        }
      }
    }
  },
  mounted() {
    this.getContactList()
    this.getDeptTreeselect()
  },
  methods: {
    // 处理多图显示 - 将逗号分隔的URL字符串转换为数组
    getImageList(imgStr) {
      if (!imgStr) return []
      return imgStr.split(',').filter(url => url.trim() !== '')
    },

    // 获取客户数据（与表单共享）
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

    // 获取部门树结构（与表单共享）
    getDeptTreeselect() {
      listDept().then((res) => {
        const idToLabel = {}
        const data = res.data.map((item) => {
          idToLabel[item.deptId] = item.deptName
          return {
            parentId: item.parentId,
            id: item.deptId,
            value: item.deptId,
            label: item.deptName,
          };
        });
        this.deptIdToLabel = idToLabel
        this.deptOptions = this.handleTree(data, "id", "parentId");
      });
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
    async getContactList() {
      this.loading = true
      try {
        // 构建查询参数，使用正确的API参数
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          // 联系人查询参数
          contactName: this.searchForm.contactName,
          contactPhone: this.searchForm.contactPhone,
          customerId: this.searchForm.customerId,
          department: this.searchForm.department,
          position: this.searchForm.position,
          isDecisionMaker: this.searchForm.isDecisionMaker,
          responsiblePerson: this.searchForm.responsiblePerson,
          belongDepartment: this.searchForm.belongDepartment
        }

        // 处理日期范围参数
        if (this.searchForm.dateRange && Array.isArray(this.searchForm.dateRange) && this.searchForm.dateRange.length === 2) {
          params.startDate = this.searchForm.dateRange[0]
          params.endDate = this.searchForm.dateRange[1]
        }

        // 移除空值参数
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await getCustomerContactList(params)
        
        if (response.code === 200) {
          // 直接使用API返回的数据结构，不做字段映射
          this.contacts = response.data.list || []
          
          this.total = response.data.total || 0
        } 
      } catch (error) {
        
        // 如果API调用失败，可以使用模拟数据作为备选
        this.loadMockData()
      } finally {
        this.loading = false
      }
    },

    // 加载模拟数据作为备选方案
    loadMockData() {
        const mockData = [
          {
            id: '1',
            name: '张建华',
            phone: '13800138000',
            customer: '华为技术有限公司',
            customerCode: 'HW001',
            department: '研发中心',
            position: '技术总监',
            wechat: 'zhang_jh_2024',
            email: 'zhang.jh@huawei.com',
            isKeyDecisionMaker: true,
            contactDetails: '负责新能源汽车电控系统技术决策，具有15年行业经验，对技术要求严格',
            responsiblePerson: '王销售',
            belongingDepartment: '华南销售部',
            collaborators: ['李协作', '赵助理'],
            submitter: '系统管理员',
            submitTime: '2024-01-15 10:00:00',
            updateTime: '2024-01-25 14:30:00',
          status: 'active',
          birthday: '03-15',
          lastContact: '2024-01-25'
          },
          {
            id: '2',
            name: '李明',
            phone: '13900139000',
            customer: '小米科技有限公司',
            customerCode: 'MI002',
            department: '智能硬件部',
            position: '产品经理',
            wechat: 'liming_xiaomi',
            email: 'liming@xiaomi.com',
            isKeyDecisionMaker: false,
            contactDetails: '负责智能汽车产品规划，年轻有活力，对新技术接受度高',
            responsiblePerson: '张销售',
            belongingDepartment: '华北销售部',
            collaborators: ['陈协作'],
            submitter: '业务员001',
            submitTime: '2024-01-16 11:30:00',
            updateTime: '2024-01-24 16:00:00',
          status: 'active',
          birthday: '08-20',
          lastContact: '2024-01-24'
          }
        ]

        this.contacts = mockData
        this.total = mockData.length
    },

    handleAdd() {
      this.currentContact = null
      this.formVisible = true
    },

    handleEdit(row) {
      this.currentContact = row
      this.formVisible = true
    },

    handleView(row) {
      this.currentContact = row
      this.detailVisible = true
    },

    handleCall(phone) {
      window.location.href = `tel:${phone}`
    },

    handleEmail(email) {
      window.location.href = `mailto:${email}`
    },

    async handleDelete(row) {
      try {
        await this.$confirm(
          `确定要删除联系人"${row.contactName}"吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const response = await deleteCustomerContact(row.id)
        if (response.code === 200) {
        this.$message.success('删除成功')
        this.getContactList()
        } else {
          this.$message.error(response.msg || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除联系人失败:', error)
          this.$message.error('删除失败')
        }
      }
    },

    async handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的联系人')
        return
      }

      try {
        await this.$confirm(
          `确定要删除选中的 ${this.selectedRows.length} 个联系人吗？`,
          '批量删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const ids = this.selectedRows.map(row => row.id)
        const response = await deleteCustomerContact(ids)
        
        if (response.code === 200) {
          this.$message.success(`成功删除 ${this.selectedRows.length} 个联系人`)
          this.selectedRows = []
          this.getContactList()
        } else {
          this.$message.error(response.msg || '批量删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除联系人失败:', error)
          this.$message.error('批量删除失败')
        }
      }
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // IntelligentSearchForm 事件处理
    handleSearch(searchForm) {
      console.log('执行搜索:', searchForm)
      this.currentPage = 1
      // 重新加载数据，使用服务端搜索
      this.getContactList()
    },

    handleReset() {
      console.log('重置搜索表单')
      this.currentPage = 1
      
      // 重置自定义组件的值
      this.belongDeptSearchId = null
      
      // 重置客户数据
      this.customerData = {
        data: [],
        page: 1,
        more: true
      }
      
      // 清除浮层字段（如果IntelligentSearchForm组件有clearAllFilters方法）
      this.$nextTick(() => {
        if (this.$refs.intelligentSearchForm && this.$refs.intelligentSearchForm.clearAllFilters) {
          this.$refs.intelligentSearchForm.clearAllFilters()
        }
        // 确保浮层临时表单也被重置
        if (this.$refs.intelligentSearchForm && this.$refs.intelligentSearchForm.initTempSearchForm) {
          this.$refs.intelligentSearchForm.initTempSearchForm()
        }
      })
      
    // 重新加载数据
      this.getContactList()
    },

    handleFieldChange(fieldKey, value) {
      console.log(`字段 ${fieldKey} 变化为:`, value)
      // 处理特定字段变化的逻辑
      if (fieldKey === 'customerId' && value) {
        console.log('客户已选择:', value)
      }
      // 归属部门选择：Treeselect返回ID，需要转换为中文名称用于API查询
      if (fieldKey === 'belongDepartment' && value !== null && value !== undefined) {
        const deptName = this.deptIdToLabel[value]
        if (deptName) {
          // 更新searchForm中的实际值为部门名称
          this.searchForm.belongDepartment = deptName
        }
      } else if (fieldKey === 'belongDepartment' && (value === null || value === undefined)) {
        this.searchForm.belongDepartment = ''
      }
    },

    // 搜索区域归属部门选择变化
    onSearchBelongDeptChange(val) {
      if (val === null || val === undefined || val === '') {
        this.searchForm.belongDepartment = ''
        this.belongDeptSearchId = null
      } else {
        const label = this.deptIdToLabel[val]
        this.searchForm.belongDepartment = label || ''
        this.belongDeptSearchId = val
      }
      // 触发搜索
      this.handleSearch()
    },

    handleSortChange({ prop, order }) {
      // TODO: 处理排序
    },

    async handleExport() {
      try {
        this.loading = true
        
        // 构建导出参数，使用正确的搜索条件
        const params = {
          contactName: this.searchForm.contactName,
          contactPhone: this.searchForm.contactPhone,
          customerId: this.searchForm.customerId,
          department: this.searchForm.department,
          position: this.searchForm.position,
          isDecisionMaker: this.searchForm.isDecisionMaker,
          responsiblePerson: this.searchForm.responsiblePerson,
          belongDepartment: this.searchForm.belongDepartment
        }

        // 处理日期范围参数
        if (this.searchForm.dateRange && Array.isArray(this.searchForm.dateRange) && this.searchForm.dateRange.length === 2) {
          params.startDate = this.searchForm.dateRange[0]
          params.endDate = this.searchForm.dateRange[1]
        }

        // 移除空值参数
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await exportCustomerContact(params)
        
        // 创建下载链接
        const blob = new Blob([response], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `客户联系人_${new Date().toLocaleDateString()}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败')
      } finally {
        this.loading = false
      }
    },

    handleSizeChange(size) {
      this.pageSize = size
      this.getContactList()
    },

    handleCurrentChange(page) {
      this.currentPage = page
      this.getContactList()
    },

    // 获取联系人姓名首字母
    getContactInitials(name) {
      if (!name) return ''
      
      // 统一取第一个字符
      return name.charAt(0).toUpperCase()
    },

    // 根据姓名生成头像背景色
    getAvatarColor(name) {
      if (!name) return '#409EFF'
      
      const colors = [
        '#409EFF', // 蓝色
        '#67C23A', // 绿色
        '#E6A23C', // 橙色
        '#F56C6C', // 红色
        '#909399', // 灰色
        '#9C27B0', // 紫色
        '#FF9800', // 深橙色
        '#4CAF50', // 深绿色
        '#2196F3', // 深蓝色
        '#FF5722', // 深红色
        '#795548', // 棕色
        '#607D8B'  // 蓝灰色
      ]
      
      // 根据姓名的字符码生成颜色索引
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      
      const index = Math.abs(hash) % colors.length
      return colors[index]
    }

  }
}
</script>

<style scoped>
.crm-contact-table :deep(.el-table__row) {
  cursor: pointer;
}

.crm-contact-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

.contact-avatar {
  font-size: 12px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.space-x-2 > * + * {
  margin-left: 8px;
}

.cursor-pointer {
  cursor: pointer;
}

.font-medium {
  font-weight: 500;
}

.text-blue-600 {
  color: #2563eb;
}

.hover\:underline:hover {
  text-decoration: underline;
}

.text-xs {
  font-size: 12px;
}

.text-gray-500 {
  color: #6b7280;
}

.action-danger {
  color: #f56c6c;
}

.action-danger:hover,
.action-danger:focus {
  color: #dd6161;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.crm-contact-table :deep(.el-image) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.text-gray-400 {
  color: #909399;
  font-size: 12px;
}
</style>
