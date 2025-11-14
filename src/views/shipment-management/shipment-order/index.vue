<template>
  <div class="app-container">
    <!-- 智能搜索区域 -->
    <IntelligentSearchForm 
      :searchForm="searchForm" 
      :fields="searchFields" 
      @search="handleSearch"
      :defaultVisibleCount="4" 
      @reset="handleReset">

      <!-- 自定义客户选择器字段 -->
      <template #field-customerName="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <TypedSelectLoadMore 
            v-model="searchForm[field.key]" 
            type="customer"
            size="mini" 
            placeholder="请选择客户" 
            clearable
            returnLabel
            customStyle="width: 100%;"
          />
        </el-form-item>
      </template>
      
      <!-- 页面操作按钮 -->
      <template #page-actions>
        <!-- 角色切换（仅用于测试） -->
        <div style="display: inline-flex; align-items: center; margin-right: 10px; padding: 5px 10px; background: #f0f9ff; border: 1px solid #409EFF; border-radius: 4px;">
          <i class="el-icon-user" style="color: #409EFF; margin-right: 5px;"></i>
          <el-select 
            v-model="mockRole" 
            placeholder="切换角色测试" 
            size="mini" 
            style="width: 130px"
            @change="handleRoleChange"
          >
            <el-option label="👔 市场专员" value="ms"></el-option>
            <el-option label="📋 BOM专员" value="BOM_Manage"></el-option>
            <el-option label="📊 PMC专员" value="pmc"></el-option>
            <el-option label="👑 超级管理员" value="admin"></el-option>
          </el-select>
        </div>
        
        <!-- 市场专员可新增订单 -->
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          class="mr10"
          @click="handleAdd"
          v-if="checkRole(['ms', 'sale_manager', 'admin'])"
        >
          新增订单
        </el-button>
        
 
        
        <!-- <el-button
          type="warning"
          size="mini"
          icon="el-icon-download"
          @click="handleExport"
          v-hasPermi="['shipment:order:export']"
        >
          导出
        </el-button> -->
                <!-- 列显示设置 -->
        <el-dropdown trigger="click" placement="bottom" @command="handleDropdownCommand">
          <el-button icon="el-icon-setting" size="mini">
            列设置<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown" class="column-setting-dropdown-menu">
            <div class="column-control-panel" @click.stop>
              <div class="panel-header">
                <span>列显示设置</span>
                <el-button type="text" size="mini" @click="resetColumns">重置</el-button>
              </div>
              
              <!-- 模式选择 -->
              <div class="mode-selection">
                <el-radio-group v-model="columnDisplayMode" @change="handleModeChange" size="small">
                  <el-radio label="mode1">模式1</el-radio>
                  <el-radio label="custom">自定义</el-radio>
                </el-radio-group>
              </div>
              
              <!-- 自定义列选择 -->
              <el-checkbox-group 
                v-model="visibleColumns" 
                @change="handleColumnChange"
                :disabled="columnDisplayMode !== 'custom'"
              >
                <el-checkbox 
                  v-for="col in allColumns" 
                  :key="col.prop" 
                  :label="col.prop"
                  :disabled="col.fixed || columnDisplayMode !== 'custom'"
                >
                  {{ col.label }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </IntelligentSearchForm>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table 
        ref="mainTable"
        :key="tableKey"
        :data="tableData" 
        v-loading="loading" 
        border 
        style="width: 100%" 
        :height="tableHeight(30)"
        size="small"
      >
        <el-table-column type="index" label="序号" width="60" align="center" fixed="left"></el-table-column>
        
        <!-- 基础信息 - 必显列 (level >= 0) -->
        <el-table-column prop="customerName" label="客户名称" align="center" width="120" fixed="left">
          <template slot-scope="scope">
            {{ scope.row.customerName || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="u8OrderNo" label="U8单号" align="center" width="140" v-if="isColumnVisible('u8OrderNo')">
          <template slot-scope="scope">
            <span class="order-no-link">{{ scope.row.u8OrderNo || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="bomCode" label="BOM编码" align="center" width="140"   v-if="isColumnVisible('bomCode')">
          <template slot-scope="scope">
            {{ scope.row.bomCode || '-' }}
          </template>
        </el-table-column>
        
        <!-- BOM信息 - 平铺的3个列 -->
        <el-table-column prop="etreeBomBefore" label="E树BOM刷新前" align="center"  v-if="isColumnVisible('etreeBomBefore')">
          <template slot-scope="scope">
            {{ scope.row.etreeBomBefore || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="etreeBomAfter" label="E树BOM刷新后" align="center" width="140" v-if="isColumnVisible('etreeBomAfter')">
          <template slot-scope="scope">
            {{ scope.row.etreeBomAfter || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="etreeBomAudited" label="E树BOM是否审核" align="center" width="130" v-if="isColumnVisible('etreeBomAudited')">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.etreeBomAudited" type="success" size="small">已审核</el-tag>
            <el-tag v-else type="info" size="small">未审核</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="configModel" label="配置型号" align="center" width="140" v-if="isColumnVisible('configModel')">
          <template slot-scope="scope">
            <span class="model-text">{{ scope.row.configModel || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="keyModel" label="按键型号" align="center" width="120" v-if="isColumnVisible('keyModel')">
          <template slot-scope="scope">
            {{ scope.row.keyModel || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="customerOrderNo" label="客户订单号" align="center"   v-if="isColumnVisible('customerOrderNo')">
          <template slot-scope="scope">
            {{ scope.row.customerOrderNo || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="etreeOrderNo" label="E树订单号" align="center" width="150" v-if="isColumnVisible('etreeOrderNo')">
          <template slot-scope="scope">
            {{ scope.row.etreeOrderNo || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="orderDate" label="上单时间" align="center" width="110" v-if="isColumnVisible('orderDate')">
          <template slot-scope="scope">
            {{ scope.row.orderDate || '-' }}
          </template>
        </el-table-column>
        
        <!-- 数量信息 -->
        <el-table-column label="数量信息" align="center" header-align="center" v-if="isColumnVisible('orderQuantity') || isColumnVisible('shippedQuantity') || isColumnVisible('unshippedQuantity')">
          <el-table-column prop="orderQuantity" label="订单数量" align="center" width="100" v-if="isColumnVisible('orderQuantity')">
            <template slot-scope="scope">
              <span class="quantity-text">{{ scope.row.orderQuantity || 0 }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="shippedQuantity" label="已发货量" align="center" width="100" v-if="isColumnVisible('shippedQuantity')">
            <template slot-scope="scope">
              <span class="shipped-text">{{ scope.row.shippedQuantity || 0 }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="unshippedQuantity" label="未发货量" align="center" width="100" v-if="isColumnVisible('unshippedQuantity')">
            <template slot-scope="scope">
              <span class="unshipped-text" :class="{ 'has-unshipped': scope.row.unshippedQuantity > 0 }">
                {{ scope.row.unshippedQuantity || 0 }}
              </span>
            </template>
          </el-table-column>
        </el-table-column>
        
        <!-- 交期信息 -->
        <el-table-column label="交期信息" align="center" header-align="center" v-if="isColumnVisible('deliveryPlan') || isColumnVisible('pmcDeliveryDate')">
          <el-table-column prop="deliveryPlan" label="交货计划" align="center" width="110" v-if="isColumnVisible('deliveryPlan')">
            <template slot-scope="scope">
              {{ scope.row.deliveryPlan || '-' }}
            </template>
          </el-table-column>
          
          <el-table-column prop="pmcDeliveryDate" label="PMC可达成交期" align="center" width="130" v-if="isColumnVisible('pmcDeliveryDate')">
            <template slot-scope="scope">
              {{ scope.row.pmcDeliveryDate || '-' }}
            </template>
          </el-table-column>
        </el-table-column>
        
        <el-table-column prop="softwareStatus" label="软件程序状态" align="center" width="120" show-overflow-tooltip v-if="isColumnVisible('softwareStatus')">
          <template slot-scope="scope">
            {{ scope.row.softwareStatus || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="deliveryChangeLog" label="交期变更履历" align="center" min-width="180" show-overflow-tooltip v-if="isColumnVisible('deliveryChangeLog')">
          <template slot-scope="scope">
            {{ scope.row.deliveryChangeLog || '-' }}
          </template>
        </el-table-column>
        
        <!-- 物料信息 -->
        <el-table-column label="客供物料情况" align="center" header-align="center" v-if="isColumnVisible('customerMaterial') || isColumnVisible('customerMaterialArrival')">
          <el-table-column prop="customerMaterial" label="客供料" align="center" width="100" v-if="isColumnVisible('customerMaterial')">
            <template slot-scope="scope">
              {{ scope.row.customerMaterial || '-' }}
            </template>
          </el-table-column>
          
          <el-table-column prop="customerMaterialArrival" label="到料时间" align="center" width="110" v-if="isColumnVisible('customerMaterialArrival')">
            <template slot-scope="scope">
              {{ scope.row.customerMaterialArrival || '-' }}
            </template>
          </el-table-column>
        </el-table-column>
        
        <el-table-column prop="productionStatus" label="生产情况" align="center" width="120" v-if="isColumnVisible('productionStatus')">
          <template slot-scope="scope">
            <el-tag 
              v-if="scope.row.productionStatus" 
              :type="getProductionStatusType(scope.row.productionStatus)"
              size="small"
            >
              {{ scope.row.productionStatus }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="specialRemark" label="特殊备注" align="center" min-width="150" show-overflow-tooltip v-if="isColumnVisible('specialRemark')">
          <template slot-scope="scope">
            {{ scope.row.specialRemark || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="orderDays" label="订单已耗时(天)" align="center" width="120" v-if="isColumnVisible('orderDays')">
          <template slot-scope="scope">
            <span class="days-text" :class="{ 'warning-days': scope.row.orderDays > 60 }">
              {{ scope.row.orderDays || 0 }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template slot-scope="scope">
            <el-tooltip content="编辑" placement="top" :enterable="false">
              <el-button size="small" type="text" @click="handleEdit(scope.row)" icon="el-icon-edit"
                v-hasPermi="['shipment:order:edit']" class="icon-btn" circle></el-button>
            </el-tooltip>
            <el-tooltip content="复制" placement="top" :enterable="false" v-if="checkRole(['ms', 'sale_manager', 'admin'])">
              <el-button size="small" type="text" @click="handleCopy(scope.row)" icon="el-icon-document-copy"
                class="icon-btn" circle style="color: #409EFF;"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" :enterable="false">
              <el-button size="small" type="text" class="text-red icon-btn" @click="handleDelete(scope.row)" icon="el-icon-delete"
                v-hasPermi="['shipment:order:remove']" circle></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <div class="pagination-wrapper flex" style='margin-top:10px;justify-content: flex-end;'>
      <el-pagination 
        @size-change="handleSizeChange" 
        @current-change="handleCurrentChange"
        :current-page="pagination.current" 
        :page-sizes="[10, 20, 30, 40, 50, 100]" 
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next, jumper" 
        :total="pagination.total">
      </el-pagination>
    </div>

    <!-- 新增/编辑未出货订单弹窗 -->
    <AddShipmentOrderDialog 
      :visible.sync="dialogVisible" 
      :editData="editData" 
      :copyMode="copyMode"
      :customerOptions="customerOptions"
      :statusOptions="statusOptions" 
      @success="handleDialogSuccess">
    </AddShipmentOrderDialog>
  </div>
</template>

<script>
import AddShipmentOrderDialog from './components/AddShipmentOrderDialog'
// ========== 临时使用 Mock 数据，后续对接真实接口后删除 .mock 即可 ==========
import {
  getShipmentOrderList,
  deleteShipmentOrder,
  batchDeleteShipmentOrder,
  getCustomerDict,
  getOrderStatusDict,
  exportShipmentOrder
} from '@/api/shipment-management/shipmentOrder.mock'
// ========== Mock 数据使用结束 ==========

export default {
  name: 'ShipmentOrder',
  components: {
    AddShipmentOrderDialog
  },
  data() {
    return {
      // 模拟角色（仅用于测试）
      mockRole: 'ms', // 默认市场专员
      mockRoles: ['ms'], // 模拟的角色数组
      
      // 列显示控制
      columnDisplayMode: 'mode1', // 当前模式：mode1, mode2, custom
      visibleColumns: [
        'customerName', 'u8OrderNo', 'bomCode', 'etreeBomBefore', 'etreeBomAfter', 'etreeBomAudited',
        'configModel', 'keyModel', 'customerOrderNo', 'etreeOrderNo', 'orderDate', 'orderQuantity', 
        'shippedQuantity', 'unshippedQuantity', 'deliveryPlan', 'pmcDeliveryDate', 'softwareStatus',
        'deliveryChangeLog', 'customerMaterial', 'customerMaterialArrival', 'productionStatus', 
        'specialRemark', 'orderDays'
      ],
      // 预设模式配置
      columnModes: {
        mode1: {
          name: '模式1',
          columns: [
            'customerName', 'bomCode','etreeBomAudited',
            'configModel', 'keyModel', 'customerOrderNo', 'etreeOrderNo', 'orderDate', 'orderQuantity', 
            'shippedQuantity', 'unshippedQuantity', 'deliveryPlan', 'pmcDeliveryDate', 'softwareStatus',
            'deliveryChangeLog', 'customerMaterial', 'customerMaterialArrival', 'productionStatus', 
            'specialRemark', 'orderDays'
          ]
        },
        // mode2: {
        //   name: '模式2',
        //   columns: [
        //     'customerName', 'u8OrderNo', 'bomCode', 'etreeBomBefore', 'etreeBomAfter', 'etreeBomAudited',
        //     'configModel', 'keyModel', 'customerOrderNo', 'etreeOrderNo', 'orderDate', 'orderQuantity', 
        //     'shippedQuantity', 'unshippedQuantity', 'deliveryPlan', 'pmcDeliveryDate', 'softwareStatus',
        //     'deliveryChangeLog', 'customerMaterial', 'customerMaterialArrival', 'productionStatus', 
        //     'specialRemark', 'orderDays'
        //   ]
        // }
      },
      allColumns: [
        { prop: 'customerName', label: '客户名称', fixed: true },
        { prop: 'u8OrderNo', label: 'U8单号', fixed: false },
        { prop: 'bomCode', label: 'BOM编码', fixed: false },
        { prop: 'etreeBomBefore', label: 'E树BOM刷新前', fixed: false },
        { prop: 'etreeBomAfter', label: 'E树BOM刷新后', fixed: false },
        { prop: 'etreeBomAudited', label: 'E树BOM是否审核', fixed: false },
        { prop: 'configModel', label: '配置型号', fixed: false },
        { prop: 'keyModel', label: '按键型号', fixed: false },
        { prop: 'customerOrderNo', label: '客户订单号', fixed: false },
        { prop: 'etreeOrderNo', label: 'E树订单号', fixed: false },
        { prop: 'orderDate', label: '上单时间', fixed: false },
        { prop: 'orderQuantity', label: '订单数量', fixed: false },
        { prop: 'shippedQuantity', label: '已发货量', fixed: false },
        { prop: 'unshippedQuantity', label: '未发货量', fixed: false },
        { prop: 'deliveryPlan', label: '交货计划', fixed: false },
        { prop: 'pmcDeliveryDate', label: 'PMC可达成交期', fixed: false },
        { prop: 'softwareStatus', label: '软件程序状态', fixed: false },
        { prop: 'deliveryChangeLog', label: '交期变更履历', fixed: false },
        { prop: 'customerMaterial', label: '客供料', fixed: false },
        { prop: 'customerMaterialArrival', label: '到料时间', fixed: false },
        { prop: 'productionStatus', label: '生产情况', fixed: false },
        { prop: 'specialRemark', label: '特殊备注', fixed: false },
        { prop: 'orderDays', label: '订单已耗时(天)', fixed: false }
      ],
      
      // 搜索表单
      searchForm: {
        customerName: '',
        configModel: '',
        customerOrderNo: '',
        u8OrderNo: '',
        bomCode: '',
        orderDate: null
      },
      // 搜索字段配置
      searchFields: [
        {
          key: 'customerName',
          label: '客户',
          component: 'custom',  // 使用自定义插槽
          sort: 1
        },
        {
          key: 'configModel',
          label: '配置型号',
          component: 'el-input',
          placeholder: '请输入配置型号',
          sort: 2
        },
        {
          key: 'customerOrderNo',
          label: '客户订单号',
          component: 'el-input',
          placeholder: '请输入客户订单号',
          sort: 3
        },
        {
          key: 'u8OrderNo',
          label: 'U8单号',
          component: 'el-input',
          placeholder: '请输入U8单号',
          sort: 4
        },
        {
          key: 'bomCode',
          label: 'BOM编码',
          component: 'el-input',
          placeholder: '请输入BOM编码',
          sort: 5
        },
        {
          key: 'orderDate',
          label: '上单日期',
          component: 'el-date-picker',
          componentAttrs: {
            type: 'daterange',
            rangeSeparator: '至',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            valueFormat: 'yyyy-MM-dd'
          },
          sort: 6
        }
      ],
      // 表格数据
      tableData: [],
      loading: false,
      // 分页信息
      pagination: {
        current: 1,
        size: 20,
        total: 0
      },
      // 下拉选项（保留用于对话框）
      customerOptions: [],
      statusOptions: [],
      // 弹窗控制
      dialogVisible: false,
      // 编辑数据
      editData: null,
      // 复制模式
      copyMode: false,
      customerData: { data: [], page: 1, more: true },
      // 表格key，用于强制刷新
      tableKey: 0
    }
  },
  computed: {},
  created() {
    this.loadColumnConfig()
    this.fetchData()
    this.loadOptions()
  },
  methods: {
    // 从本地存储加载列配置
    loadColumnConfig() {
      const storageKey = 'shipment_order_column_config'
      const savedConfig = localStorage.getItem(storageKey)
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig)
          if (config.mode) {
            this.columnDisplayMode = config.mode
          }
          if (config.mode === 'custom' && Array.isArray(config.columns) && config.columns.length > 0) {
            this.visibleColumns = config.columns
          } else if (config.mode && this.columnModes[config.mode]) {
            this.visibleColumns = [...this.columnModes[config.mode].columns]
          }
        } catch (e) {
          console.error('加载列配置失败:', e)
        }
      }
    },
    
    // 保存列配置到本地存储
    saveColumnConfig() {
      const storageKey = 'shipment_order_column_config'
      try {
        const config = {
          mode: this.columnDisplayMode,
          columns: this.columnDisplayMode === 'custom' ? this.visibleColumns : []
        }
        localStorage.setItem(storageKey, JSON.stringify(config))
      } catch (e) {
        console.error('保存列配置失败:', e)
      }
    },
    
    // 处理模式切换
    handleModeChange(mode) {
      if (mode === 'mode1' || mode === 'mode2') {
        this.visibleColumns = [...this.columnModes[mode].columns]
      } else if (mode === 'custom') {
        // 切换到自定义模式时，默认全选所有列
        this.visibleColumns = this.allColumns.map(col => col.prop)
      }
      this.saveColumnConfig()
      this.tableKey++
      this.$message.success(`已切换到${mode === 'mode1' ? '模式1' : mode === 'mode2' ? '模式2' : '自定义模式'}`)
    },
    
    // 列显示变化处理
    handleColumnChange(value) {
      this.columnDisplayMode = 'custom' // 切换到自定义模式
      this.saveColumnConfig()
      this.tableKey++
    },
    
    // 重置列显示
    resetColumns() {
      this.visibleColumns = this.allColumns.map(col => col.prop)
      this.saveColumnConfig()
      // 强制刷新表格以重新计算布局
      this.tableKey++
      this.$message.success('已重置为默认显示')
    },
    
    // dropdown 命令处理（空方法，防止点击菜单项关闭）
    handleDropdownCommand(command) {
      // 不需要处理，只是为了防止默认行为
    },
    
    // 判断列是否可见
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop)
    },
    
    // 检查角色（支持模拟角色）
    checkRole(roles) {
      // 优先使用模拟角色（用于测试）
      if (this.mockRoles && this.mockRoles.length > 0) {
        return roles.some(role => this.mockRoles.includes(role))
      }
      
      // 生产环境使用真实角色
      const userRoles = this.$store.getters && this.$store.getters.roles
      if (!userRoles || userRoles.length === 0) {
        return false
      }
      return roles.some(role => userRoles.includes(role))
    },
    
    // 切换角色（仅用于测试）
    handleRoleChange(role) {
      this.mockRoles = [role]
      this.$message.success(`已切换到角色: ${this.getRoleName(role)}`)
      
      // 强制更新视图
      this.$forceUpdate()
    },
    
    // 获取角色名称
    getRoleName(roleKey) {
      const roleMap = {
        'ms': '市场专员',
        'BOM_Manage': 'BOM专员',
        'pmc': 'PMC专员',
        'admin': '超级管理员',
      }
      return roleMap[roleKey] || roleKey
    },
    
    // 加载下拉选项
    loadOptions() {
      this.loadCustomerOptions()
      this.loadStatusOptions()
    },

    // 加载客户选项
    loadCustomerOptions() {
      getCustomerDict().then(res => {
        if (res.code === 200) {
          this.customerOptions = res.data || []
        }
      })
    },

    // 加载状态选项
    loadStatusOptions() {
      getOrderStatusDict().then(res => {
        if (res.code === 200) {
          this.statusOptions = res.data || []
        }
      }).catch(() => {
        this.$message.error('获取状态数据失败')
      })
    },

    // 获取生产状态类型
    getProductionStatusType(status) {
      const typeMap = {
        '生产中': 'warning',
        '已入库': 'success',
        '已出货': 'info',
        '待生产': 'info'
      }
      return typeMap[status] || 'info'
    },

    // 获取列表数据
    fetchData() {
      this.loading = true
      const params = {
        pageNum: this.pagination.current,
        pageSize: this.pagination.size,
        customerName: this.searchForm.customerName || undefined,
        configModel: this.searchForm.configModel || undefined,
        customerOrderNo: this.searchForm.customerOrderNo || undefined,
        u8OrderNo: this.searchForm.u8OrderNo || undefined,
        bomCode: this.searchForm.bomCode || undefined
      }

      // 处理日期范围
      if (this.searchForm.orderDate && this.searchForm.orderDate.length === 2) {
        params.startDate = this.searchForm.orderDate[0]
        params.endDate = this.searchForm.orderDate[1]
      }

      getShipmentOrderList(params).then((res) => {
        if (res && res.code === 200) {
          this.tableData = res.data?.list || res.data?.rows || []
          this.pagination.total = res.data?.total || 0
        } else {
          this.$message.error(res?.msg || '获取数据失败')
          this.tableData = []
          this.pagination.total = 0
        }
      }).catch((error) => {
        console.error('获取未出货订单列表失败:', error)
        this.$message.error('获取数据失败')
        this.tableData = []
        this.pagination.total = 0
      }).finally(() => {
        this.loading = false
      })
    },

    // 搜索功能
    handleSearch() {
      this.pagination.current = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        customerName: '',
        configModel: '',
        customerOrderNo: '',
        u8OrderNo: '',
        bomCode: '',
        orderDate: null
      }
      this.pagination.current = 1
      this.fetchData()
    },

    // 新增订单
    handleAdd() {
      this.editData = null
      this.copyMode = false
      this.dialogVisible = true
    },

    // 编辑订单
    handleEdit(row) {
      this.editData = { ...row }
      this.copyMode = false
      this.dialogVisible = true
    },

    // 复制订单
    handleCopy(row) {
      // 复制数据，但不带 id
      const copyData = { ...row }
      delete copyData.id
      this.editData = copyData
      this.copyMode = true
      this.dialogVisible = true
    },

    // 删除订单
    handleDelete(row) {
      this.$confirm('确定要删除这条未出货订单记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteShipmentOrder([row.id]).then((res) => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.fetchData()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        }).catch((error) => {
          console.error('删除订单失败:', error)
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 导出
    handleExport() {
      const params = {
        customerName: this.searchForm.customerName || undefined,
        configModel: this.searchForm.configModel || undefined,
        customerOrderNo: this.searchForm.customerOrderNo || undefined,
        u8OrderNo: this.searchForm.u8OrderNo || undefined,
        bomCode: this.searchForm.bomCode || undefined
      }

      if (this.searchForm.orderDate && this.searchForm.orderDate.length === 2) {
        params.startDate = this.searchForm.orderDate[0]
        params.endDate = this.searchForm.orderDate[1]
      }

      this.$confirm('确定要导出未出货订单数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        exportShipmentOrder(params).then(res => {
          const blob = new Blob([res], { type: 'application/vnd.ms-excel' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `未出货订单_${new Date().getTime()}.xlsx`
          link.click()
          window.URL.revokeObjectURL(url)
          this.$message.success('导出成功')
        }).catch(() => {
          this.$message.error('导出失败')
        })
      })
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.size = val
      this.fetchData()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.pagination.current = val
      this.fetchData()
    },

    // 弹窗成功回调
    handleDialogSuccess() {
      this.fetchData()
    }
  }
}
</script>

<style lang="scss" scoped>
.shipment-order-page {
  padding: 20px;
  
  // 操作列表头
  .action-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    
    span {
      font-size: 14px;
      color: #303133;
    }
  }
  
  .table-wrapper {
    background: #fff;
    border-radius: 4px;
    
    ::v-deep .el-table {
      .el-table__header-wrapper {
        .el-table__header {
          th {
            background-color: #f5f7fa;
            color: #303133;
            font-weight: 600;
            font-size: 14px;
            
            // 多层级表头
            &.is-group {
              background-color: #e8f4f8;
              color: #333333;
              font-weight: 700;
            }
          }
        }
      }

      // 固定列样式优化
      .el-table__fixed,
      .el-table__fixed-right {
        &::before {
          background-color: transparent;
        }
      }
      
      // 统一单元格样式
      .el-table__body-wrapper,
      .el-table__fixed-body-wrapper,
      .el-table__fixed-right .el-table__fixed-body-wrapper {
        .el-table__body {
          .el-table__row {
            td {
              font-size: 13px;
              box-sizing: border-box;
              border-right: 1px solid #EBEEF5;
              
              position: relative;
              
              &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 1px;
                background-color: #EBEEF5;
              }
            }
          }
        }
      }
      
      // 确保固定列和主表格行高一致
      .el-table__body {
        tr {
          height: auto;
          
          td {
            padding: 12px 0;
            line-height: 23px;
          }
        }
      }
    }
  }

  .pagination-wrapper {
    margin-top: 25px;
    padding: 10px;
    background: #fff;
    border-radius: 4px;
    display: flex;
    justify-content: flex-end;
  }

  // 订单编号链接样式
  .order-no-link {
    color: #409EFF;
    cursor: pointer;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
      color: #66b1ff;
    }
  }

  // 型号文本样式
  .model-text {
    font-weight: 600;
    color: #303133;
    font-size: 13px;
  }

  // 数量文本样式
  .quantity-text {
    font-weight: 600;
    color: #303133;
    font-size: 14px;
  }

  .shipped-text {
    color: #67C23A;
    font-weight: 500;
  }

  .unshipped-text {
    color: #909399;
    font-weight: 500;
    
    &.has-unshipped {
      color: #E6A23C;
      font-weight: 600;
    }
  }

  // 天数文本样式
  .days-text {
    color: #606266;
    
    &.warning-days {
      color: #F56C6C;
      font-weight: 600;
    }
  }

  // 删除按钮样式
  .text-red {
    color: #F56C6C;

    &:hover {
      color: #f78989;
    }
  }

  // 操作按钮图标样式
  .icon-btn {
    font-size: 14px;
    padding: 8px;
    
    i {
      font-size: 14px;
    }
    
    &:hover {
      transform: scale(1.1);
      transition: all 0.2s;
    }
  }
}
</style>

<style lang="scss">
// 列设置下拉菜单（挂载到 body，需要全局样式）
.column-setting-dropdown-menu {
  padding: 0 !important;
  min-width: 320px;
  max-width: 500px;
  max-height: 620px;
  
  .el-dropdown-menu__item {
    padding: 0 !important;
    line-height: normal !important;
    
    &:hover {
      background-color: transparent !important;
    }
  }
  
  .column-control-panel {
    padding: 12px 15px;
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 12px;
      border-bottom: 1px solid #EBEEF5;
      
      span {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }
    
    .mode-selection {
      margin-bottom: 15px;
      
      .el-radio-group {
        display: flex;
        gap: 15px;
        
        .el-radio {
          margin-right: 0;
        }
      }
    }
    
    .el-checkbox-group {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 12px;
      max-height: 550px;
      overflow-y: auto;
      padding: 5px;
      
      .el-checkbox {
        margin: 0 !important;
        white-space: nowrap;
        
        &.is-disabled {
          .el-checkbox__label {
            color: #909399;
            font-weight: 500;
          }
          
          .el-checkbox__input.is-disabled .el-checkbox__inner {
            background-color: #F5F7FA;
            border-color: #DCDFE6;
          }
        }
        
        .el-checkbox__label {
          font-size: 13px;
          padding-left: 8px;
        }
      }
    }
  }
}
</style>
