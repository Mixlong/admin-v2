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
        
 
        
        <el-button
          type="warning"
          size="mini"
          icon="el-icon-download"
          @click="handleExport"
        >
          导出Excel
        </el-button>
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
                <div class="mode-title">预设模式</div>
                <el-radio-group v-model="columnDisplayMode" @change="handleModeChange" size="small">
                  <el-radio label="mode1">主模式</el-radio>
                  <el-radio label="custom">自定义</el-radio>
                </el-radio-group>
              </div>
              
              <!-- 已保存的方案 -->
              <div class="saved-schemes" v-if="Object.keys(customSchemes).length > 0">
                <div class="mode-title">已保存方案</div>
                <div class="scheme-list">
                  <div 
                    v-for="(scheme, key) in customSchemes" 
                    :key="key"
                    class="scheme-item"
                    :class="{ active: columnDisplayMode === key }"
                  >
                    <el-radio 
                      :label="key" 
                      v-model="columnDisplayMode" 
                      @change="handleModeChange"
                      size="small"
                    >
                      {{ scheme.name }}
                    </el-radio>
                    <el-button 
                      type="text" 
                      size="mini" 
                      icon="el-icon-delete"
                      class="delete-scheme-btn"
                      @click.stop="deleteCustomScheme(key)"
                      title="删除方案"
                    ></el-button>
                  </div>
                </div>
              </div>
              
              <!-- 保存方案按钮 -->
              <div class="save-scheme-section" v-if="columnDisplayMode === 'custom'">
                <el-button 
                  type="primary" 
                  size="mini" 
                  icon="el-icon-folder-add"
                  @click="openSaveSchemeDialog"
                  style="width: 100%"
                >
                  保存当前方案
                </el-button>
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
        <el-table-column 
          prop="customerName" 
          label="客户名称" 
          align="center" 
          width="140" 
          fixed="left"
          :filters="getColumnFilters('customerName')"
          :filter-method="filterHandler"
          column-key="customerName"
        >
          <template slot-scope="scope">
            {{ scope.row.customerName || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="u8OrderNo" 
          label="U8单号" 
          align="center" 
          width="160" 
          v-if="isColumnVisible('u8OrderNo')"
          :filters="getColumnFilters('u8OrderNo')"
          :filter-method="filterHandler"
          column-key="u8OrderNo"
        >
          <template slot-scope="scope">
            <span class="order-no-link">{{ scope.row.u8OrderNo || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="u8Available" 
          label="U8是否可用" 
          align="center" 
          width="130" 
          v-if="isColumnVisible('u8Available')"
          :filters="[{text: '可用', value: true}, {text: '不可用', value: false}]"
          :filter-method="filterHandler"
          column-key="u8Available"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.u8Available" type="success" size="small">可用</el-tag>
            <el-tag v-else type="info" size="small">不可用</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="bomCode" 
          label="BOM编码" 
          align="center" 
          width="160" 
          v-if="isColumnVisible('bomCode')"
          :filters="getColumnFilters('bomCode')"
          :filter-method="filterHandler"
          column-key="bomCode"
        >
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
        
        <el-table-column 
          prop="etreeBomAudited" 
          label="E树BOM审核" 
          align="center" 
          width="120" 
          v-if="isColumnVisible('etreeBomAudited')"
          :filters="[{text: '已审核', value: '已审核'}, {text: '未审核', value: '未审核'}, {text: '有遗留', value: '有遗留'}]"
          :filter-method="filterHandler"
          column-key="etreeBomAudited"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.etreeBomAudited === '已审核'" type="success" size="small">已审核</el-tag>
            <el-tag v-else-if="scope.row.etreeBomAudited === '有遗留'" type="warning" size="small">有遗留</el-tag>
            <el-tag v-else-if="scope.row.etreeBomAudited === '未审核'" type="info" size="small">未审核</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="configModel" 
          label="配置型号" 
          align="center" 
          width="160" 
          v-if="isColumnVisible('configModel')"
          :filters="getColumnFilters('configModel')"
          :filter-method="filterHandler"
          column-key="configModel"
        >
          <template slot-scope="scope">
            <span class="model-text">{{ scope.row.configModel || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="keyModel" 
          label="按键型号" 
          align="center" 
          width="140" 
          v-if="isColumnVisible('keyModel')"
          :filters="getColumnFilters('keyModel')"
          :filter-method="filterHandler"
          column-key="keyModel"
        >
          <template slot-scope="scope">
            {{ scope.row.keyModel || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="customerOrderNo" 
          label="客户订单号" 
          align="center" 
          width="160" 
          v-if="isColumnVisible('customerOrderNo')"
          :filters="getColumnFilters('customerOrderNo')"
          :filter-method="filterHandler"
          column-key="customerOrderNo"
        >
          <template slot-scope="scope">
            {{ scope.row.customerOrderNo || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="etreeOrderNo" 
          label="E树订单号" 
          align="center" 
          width="160" 
          v-if="isColumnVisible('etreeOrderNo')"
          :filters="getColumnFilters('etreeOrderNo')"
          :filter-method="filterHandler"
          column-key="etreeOrderNo"
        >
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
              <span class="quantity-text text-green">{{ scope.row.orderQuantity || 0 }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="shippedQuantity" label="已发货量" align="center" width="100" v-if="isColumnVisible('shippedQuantity')">
            <template slot-scope="scope">
              <span class="shipped-text">{{ scope.row.shippedQuantity || 0 }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="unshippedQuantity" label="未发货量" align="center" width="100" v-if="isColumnVisible('unshippedQuantity')">
            <template slot-scope="scope">
              <span class="unshipped-text text-red" :class="{ 'has-unshipped': scope.row.unshippedQuantity > 0 }">
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
        
 
        
        <el-table-column prop="deliveryChangeLog" label="交期变更履历" align="left" min-width="200" v-if="isColumnVisible('deliveryChangeLog')">
          <template slot-scope="scope">
            <div class="rich-text-cell" v-if="scope.row.deliveryChangeLog" v-html="scope.row.deliveryChangeLog"></div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <!-- 物料信息 -->
        <el-table-column label="客供物料情况" align="center" header-align="center" v-if="isColumnVisible('customerMaterial') || isColumnVisible('customerMaterialArrival')">
          <el-table-column prop="customerMaterial" label="客供料" align="center" width="120" v-if="isColumnVisible('customerMaterial')">
            <template slot-scope="scope">
              {{ scope.row.customerMaterial || '-' }}
            </template>
          </el-table-column>
          
          <el-table-column prop="customerMaterialArrival" label="到料时间" align="center" width="110" v-if="isColumnVisible('customerMaterialArrival')">
            <template slot-scope="scope">
              <span v-if="Array.isArray(scope.row.customerMaterialArrival) && scope.row.customerMaterialArrival.length > 0">
                {{ scope.row.customerMaterialArrival.join('、') }}
              </span>
              <span v-else>{{ scope.row.customerMaterialArrival || '-' }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        
        <!-- <el-table-column prop="productionStatus" label="生产情况" align="center" width="120" v-if="isColumnVisible('productionStatus')">
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
        </el-table-column> -->
        
        <el-table-column prop="specialRemark" label="特殊备注" align="left" min-width="200" v-if="isColumnVisible('specialRemark')">
          <template slot-scope="scope">
            <div class="rich-text-cell" v-if="scope.row.specialRemark" v-html="scope.row.specialRemark"></div>
            <span v-else>-</span>
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

    <!-- 保存方案对话框 -->
    <el-dialog
      title="保存列显示方案"
      :visible.sync="saveSchemeDialogVisible"
      width="400px"
      :close-on-click-modal="false">
      <el-form :model="{ schemeName }" label-width="100px">
        <el-form-item label="方案名称" required>
          <el-input 
            v-model="schemeName" 
            placeholder="请输入方案名称"
            maxlength="20"
            show-word-limit>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="saveSchemeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveCustomScheme">保 存</el-button>
      </div>
    </el-dialog>
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
        'customerName', 'u8OrderNo', 'u8Available', 'bomCode', 'etreeBomAudited',
        'configModel', 'keyModel', 'customerOrderNo', 'etreeOrderNo', 'orderDate', 'orderQuantity', 
        'shippedQuantity', 'unshippedQuantity', 'deliveryPlan', 'pmcDeliveryDate',
        'deliveryChangeLog', 'customerMaterial', 'customerMaterialArrival', 'productionStatus', 
        'specialRemark', 'orderDays'
      ],
      // 保存方案相关
      saveSchemeDialogVisible: false,
      schemeName: '',
      customSchemes: {}, // 自定义方案存储
      // 预设模式配置
      columnModes: {
        mode1: {
          name: '主模式',
          columns: [
            'customerName', 'u8OrderNo', 'u8Available', 'bomCode', 'etreeBomAudited',
            'configModel', 'keyModel', 'customerOrderNo', 'etreeOrderNo', 'orderDate', 'orderQuantity', 
            'shippedQuantity', 'unshippedQuantity', 'deliveryPlan', 'pmcDeliveryDate',
            'deliveryChangeLog', 'customerMaterial', 'customerMaterialArrival', 'productionStatus', 
            'specialRemark', 'orderDays'
          ]
        },
        mode2: {
          name: 'BOM模式',
          columns: [
            'customerName', 'u8OrderNo', 'bomCode', 'etreeBomBefore', 'etreeBomAfter', 'etreeBomAudited',
            'configModel', 'keyModel', 'customerOrderNo', 'etreeOrderNo', 'orderDate', 'orderQuantity', 
            'shippedQuantity', 'unshippedQuantity', 'deliveryPlan', 'pmcDeliveryDate', 
            'deliveryChangeLog', 'customerMaterial', 'customerMaterialArrival', 'productionStatus', 
            'specialRemark', 'orderDays'
          ]
        }
      },
      allColumns: [
        { prop: 'customerName', label: '客户名称', fixed: true },
        { prop: 'u8OrderNo', label: 'U8单号', fixed: false },
        { prop: 'u8Available', label: 'U8是否可用', fixed: false },
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
  mounted() {
    // 先加载自定义方案，再加载列配置（确保能正确恢复方案）
    this.loadCustomSchemesFromStorage()
    this.loadColumnConfig()
    // 加载数据
    this.fetchData()
    this.loadCustomerOptions()
    this.loadStatusOptions()
  },
  methods: {
    // 获取列筛选选项
    getColumnFilters(columnProp) {
      if (!this.tableData || this.tableData.length === 0) {
        return []
      }
      
      const values = this.tableData.map(row => row[columnProp])
      
      // 去重
      const uniqueValues = [...new Set(values)]
      
      // 分离空值和非空值
      const emptyValues = uniqueValues.filter(v => v === null || v === undefined || v === '')
      const nonEmptyValues = uniqueValues.filter(v => v !== null && v !== undefined && v !== '')
      
      // 构建筛选选项列表
      const filters = []
      
      // 添加非空值选项（排序）
      nonEmptyValues.sort().forEach(value => {
        filters.push({
          text: value,
          value: value
        })
      })
      
      // 如果有空值，添加到最后
      if (emptyValues.length > 0) {
        filters.push({
          text: '/',  // 显示为"/"
          value: null  // 使用 null 作为空值的标识
        })
      }
      
      return filters
    },
    
    // Element UI 表格筛选方法
    filterHandler(value, row, column) {
      const property = column.property
      const cellValue = row[property]
      
      // 如果筛选值是 null，表示筛选空值
      if (value === null) {
        return cellValue === null || cellValue === undefined || cellValue === ''
      }
      
      // 普通值匹配
      return cellValue === value
    },
    
    // 从本地存储加载列配置
    loadColumnConfig() {
      const storageKey = 'shipment_order_column_config'
      const savedConfig = localStorage.getItem(storageKey)
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig)
          console.log('加载的列配置:', config)
          
          if (config.mode) {
            this.columnDisplayMode = config.mode
          }
          
          if (config.mode === 'custom' && Array.isArray(config.columns) && config.columns.length > 0) {
            // 自定义模式：恢复保存的列
            this.visibleColumns = config.columns
            console.log('恢复自定义模式列配置')
          } else if (config.mode && this.columnModes[config.mode]) {
            // 预设模式：使用预设的列配置
            this.visibleColumns = [...this.columnModes[config.mode].columns]
            console.log(`恢复预设模式: ${config.mode}`)
          } else if (config.mode && this.customSchemes[config.mode]) {
            // 自定义方案：使用方案的列配置
            this.visibleColumns = [...this.customSchemes[config.mode].columns]
            console.log(`恢复自定义方案: ${this.customSchemes[config.mode].name}`)
          }
          
          // 强制更新表格
          this.$nextTick(() => {
            this.tableKey++
          })
        } catch (e) {
          console.error('加载列配置失败:', e)
        }
      } else {
        console.log('未找到保存的列配置，使用默认配置')
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
      } else if (this.customSchemes[mode]) {
        // 切换到自定义方案
        this.visibleColumns = [...this.customSchemes[mode].columns]
      }
      this.saveColumnConfig()
      this.tableKey++
      const modeName = this.getModeName(mode)
      this.$message.success(`已切换到${modeName}`)
    },

    // 获取模式名称
    getModeName(mode) {
      if (mode === 'mode1') return '主模式'
      if (mode === 'mode2') return 'BOM模式'
      if (mode === 'custom') return '自定义模式'
      if (this.customSchemes[mode]) return this.customSchemes[mode].name
      return mode
    },

    // 打开保存方案对话框
    openSaveSchemeDialog() {
      if (this.columnDisplayMode !== 'custom') {
        this.$message.warning('请先切换到自定义模式后再保存方案')
        return
      }
      this.schemeName = ''
      this.saveSchemeDialogVisible = true
    },

    // 保存自定义方案
    saveCustomScheme() {
      if (!this.schemeName.trim()) {
        this.$message.error('请输入方案名称')
        return
      }
      
      const schemeKey = `custom_${Date.now()}`
      const scheme = {
        name: this.schemeName.trim(),
        columns: [...this.visibleColumns],
        createTime: new Date().toLocaleString()
      }
      
      // 使用Vue.set确保响应式更新
      this.$set(this.customSchemes, schemeKey, scheme)
      this.saveCustomSchemesToStorage()
      
      // 关闭对话框
      this.saveSchemeDialogVisible = false
      
      // 自动切换到新保存的方案
      this.columnDisplayMode = schemeKey
      this.saveColumnConfig()
      
      // 强制更新视图
      this.$forceUpdate()
      
      this.$message.success(`方案 "${scheme.name}" 保存成功并已切换`)
      
      // 调试信息
      console.log('保存方案后的customSchemes:', this.customSchemes)
      console.log('当前使用方案:', this.columnDisplayMode)
    },

    // 保存自定义方案到本地存储
    saveCustomSchemesToStorage() {
      try {
        localStorage.setItem('shipment_order_custom_schemes', JSON.stringify(this.customSchemes))
      } catch (e) {
        console.error('保存自定义方案失败:', e)
      }
    },

    // 加载自定义方案
    loadCustomSchemesFromStorage() {
      try {
        const schemes = localStorage.getItem('shipment_order_custom_schemes')
        if (schemes) {
          const parsedSchemes = JSON.parse(schemes)
          // 清空现有方案
          Object.keys(this.customSchemes).forEach(key => {
            this.$delete(this.customSchemes, key)
          })
          // 逐个添加方案以保持响应式
          Object.keys(parsedSchemes).forEach(key => {
            this.$set(this.customSchemes, key, parsedSchemes[key])
          })
        }
      } catch (e) {
        console.error('加载自定义方案失败:', e)
        // 清空方案对象
        Object.keys(this.customSchemes).forEach(key => {
          this.$delete(this.customSchemes, key)
        })
      }
    },

    // 删除自定义方案
    deleteCustomScheme(schemeKey) {
      this.$confirm(`确定要删除方案 "${this.customSchemes[schemeKey].name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 使用Vue.delete确保响应式更新
        this.$delete(this.customSchemes, schemeKey)
        this.saveCustomSchemesToStorage()
        
        // 如果当前使用的是被删除的方案，切换到主模式
        if (this.columnDisplayMode === schemeKey) {
          this.handleModeChange('mode1')
        }
        
        this.$message.success('删除成功')
        
        // 强制更新视图
        this.$forceUpdate()
      }).catch(() => {})
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
      this.columnDisplayMode = 'custom'
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

    // 导出Excel（动态表头）
    handleExport() {
      this.$confirm(`确定要导出当前${this.tableData.length}条订单数据吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.exportToExcel()
      }).catch(() => {
        this.$message.info('已取消导出')
      })
    },
    
    // 执行导出Excel
    exportToExcel() {
      // 尝试使用 ExcelJS（支持样式）
      this.exportWithExcelJS().catch(error => {
        console.warn('ExcelJS 导出失败，降级到普通导出:', error)
        // 降级到普通 xlsx 库导出（无样式）
        import('xlsx').then(module => {
          const XLSX = module.default || module
          this.doExport(XLSX)
        }).catch(error2 => {
          console.error('导出失败:', error2)
          this.$message.error('导出失败，请重试')
        })
      })
    },
    
    // 使用 ExcelJS 导出（支持样式）
    async exportWithExcelJS() {
      try {
        const ExcelJSModule = await import('exceljs')
        const FileSaverModule = await import('file-saver')
        
        const ExcelJS = ExcelJSModule.default || ExcelJSModule
        const FileSaver = FileSaverModule.default || FileSaverModule
        
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('未出货订单')
        
        // 获取列配置
        const exportColumns = this.getExportColumnsWithGroups()
        
        // 构建表头数据
        const header1Row = []
        const header2Row = []
        const merges = []
        let colIndex = 1
        
        exportColumns.forEach(col => {
          if (col.children && col.children.length > 0) {
            // 分组列
            header1Row.push(col.label)
            merges.push({
              start: { row: 1, col: colIndex },
              end: { row: 1, col: colIndex + col.children.length - 1 }
            })
            col.children.forEach((child, index) => {
              if (index > 0) {
                header1Row.push('') // 分组列的其他子列在第一行留空
              }
              header2Row.push(child.label)
              colIndex++
            })
          } else {
            // 单列
            header1Row.push(col.label)
            header2Row.push(col.label)
            merges.push({
              start: { row: 1, col: colIndex },
              end: { row: 2, col: colIndex }
            })
            colIndex++
          }
        })
        
        // 添加表头行
        const headerRow1 = worksheet.addRow(header1Row)
        const headerRow2 = worksheet.addRow(header2Row)
        
        // 应用表头样式
        const headerStyle = {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } },
          font: { bold: true, size: 11 },
          alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        }
        
        const groupHeaderStyle = {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D2E9' } },
          font: { bold: true, size: 11 },
          alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        }
        
        // 应用表头样式（区分分组表头和普通表头）
        let currentCol = 1
        exportColumns.forEach(col => {
          if (col.children && col.children.length > 0) {
            // 分组表头 - 紫色背景
            for (let i = 0; i < col.children.length; i++) {
              const cell1 = headerRow1.getCell(currentCol)
              const cell2 = headerRow2.getCell(currentCol)
              if (cell1) cell1.style = groupHeaderStyle
              if (cell2) cell2.style = headerStyle
              currentCol++
            }
          } else {
            // 单列 - 灰色背景
            const cell1 = headerRow1.getCell(currentCol)
            const cell2 = headerRow2.getCell(currentCol)
            if (cell1) cell1.style = headerStyle
            if (cell2) cell2.style = headerStyle
            currentCol++
          }
        })
        
        // 合并单元格
        merges.forEach(merge => {
          worksheet.mergeCells(merge.start.row, merge.start.col, merge.end.row, merge.end.col)
        })
        
        // 添加数据行
        const colPropMap = []
        exportColumns.forEach(col => {
          if (col.children) {
            col.children.forEach(child => colPropMap.push(child.prop))
          } else {
            colPropMap.push(col.prop)
          }
        })
        
        // 颜色配置
        const columnColors = {
          'etreeBomAudited': { bg: 'FFD9534F', font: 'FFFFFFFF' },
          'customerMaterial': { bg: 'FF92D050', font: 'FF000000' },
          'customerMaterialArrival': { bg: 'FFFF0000', font: 'FFFFFFFF' },
          'specialRemark': { bg: 'FFFFFF00', font: 'FF000000' },
          'deliveryChangeLog': { bg: 'FFFFC7CE', font: 'FF9C0006' },
          'pmcDeliveryDate': { bg: 'FFD9D2E9', font: 'FF000000' },
          'orderSigned': { bg: 'FFE2EFDA', font: 'FF000000' }
        }
        
        this.tableData.forEach(row => {
          const rowData = colPropMap.map(prop => this.formatCellValue(prop, row[prop], row))
          const dataRow = worksheet.addRow(rowData)
          
          dataRow.eachCell((cell, colNumber) => {
            const prop = colPropMap[colNumber - 1]
            const colorConfig = columnColors[prop]
            
            if (colorConfig) {
              cell.style = {
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colorConfig.bg } },
                font: { size: 10, color: { argb: colorConfig.font } },
                alignment: { vertical: 'middle', horizontal: 'center' },
                border: {
                  top: { style: 'thin' },
                  left: { style: 'thin' },
                  bottom: { style: 'thin' },
                  right: { style: 'thin' }
                }
              }
            } else {
              cell.style = {
                font: { size: 10 },
                alignment: { vertical: 'middle', horizontal: 'center' },
                border: {
                  top: { style: 'thin' },
                  left: { style: 'thin' },
                  bottom: { style: 'thin' },
                  right: { style: 'thin' }
                }
              }
            }
          })
        })
        
        // 设置列宽
        worksheet.columns = colPropMap.map(() => ({ width: 15 }))
        
        // 生成文件
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const fileName = `未出货订单_${this.formatDate(new Date())}.xlsx`
        
        // FileSaver 可能是 { saveAs } 或者 { default: saveAs }
        if (FileSaver.saveAs) {
          FileSaver.saveAs(blob, fileName)
        } else if (typeof FileSaver === 'function') {
          FileSaver(blob, fileName)
        } else {
          // 手动下载
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          link.click()
          URL.revokeObjectURL(url)
        }
        
        this.$message.success('导出成功')
      } catch (error) {
        console.error('ExcelJS 导出失败:', error)
        this.$message.error('导出失败: ' + error.message)
      }
    },
    
    // 执行导出逻辑
    doExport(XLSX) {
      try {
        // 获取当前显示的列配置（支持多级表头）
        const exportColumns = this.getExportColumnsWithGroups()
        
        // 构建二级表头
        const header1 = [] // 一级表头
        const header2 = [] // 二级表头
        const merges = [] // 合并单元格配置
        let colIndex = 0
        
        exportColumns.forEach(col => {
          if (col.children && col.children.length > 0) {
            // 有子列的分组列
            header1.push(col.label)
            // 合并单元格：从colIndex到colIndex + children.length - 1
            if (col.children.length > 1) {
              merges.push({
                s: { r: 0, c: colIndex },
                e: { r: 0, c: colIndex + col.children.length - 1 }
              })
            }
            // 添加子列表头
            col.children.forEach(child => {
              header1.push('') // 一级表头留空（会被合并）
              header2.push(child.label)
              colIndex++
            })
            // 移除最后多加的一个空列
            header1.pop()
            colIndex--
          } else {
            // 单列（跨两行）
            header1.push(col.label)
            header2.push(col.label)
            // 合并单元格：合并两行
            merges.push({
              s: { r: 0, c: colIndex },
              e: { r: 1, c: colIndex }
            })
          }
          colIndex++
        })
        
        // 构建数据行
        const data = this.tableData.map(row => {
          const rowData = []
          exportColumns.forEach(col => {
            if (col.children && col.children.length > 0) {
              // 分组列，添加子列数据
              col.children.forEach(child => {
                const value = row[child.prop]
                rowData.push(this.formatCellValue(child.prop, value, row))
              })
            } else {
              // 单列
              const value = row[col.prop]
              rowData.push(this.formatCellValue(col.prop, value, row))
            }
          })
          return rowData
        })
        
        // 合并表头和数据
        const sheetData = [header1, header2, ...data]
        
        // 创建工作表
        const ws = XLSX.utils.aoa_to_sheet(sheetData)
        
        // 应用合并单元格
        ws['!merges'] = merges
        
        // 应用样式
        this.applyExcelStyles(ws, exportColumns, header2.length, sheetData.length, XLSX)
        
        // 设置列宽
        const totalCols = header2.length
        const colWidths = Array(totalCols).fill({ wch: 15 })
        ws['!cols'] = colWidths
        
        // 创建工作簿
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, '未出货订单')
        
        // 导出文件
        const fileName = `未出货订单_${this.formatDate(new Date())}.xlsx`
        XLSX.writeFile(wb, fileName)
        
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败，请重试')
      }
    },
    
    // 应用Excel样式
    applyExcelStyles(ws, exportColumns, totalCols, totalRows, XLSX) {
      // 定义列的颜色配置
      const columnColors = {
        'etreeBomAudited': { bg: 'FFD9534F', font: 'FFFFFFFF' }, // 红底白字
        'customerMaterial': { bg: 'FF92D050', font: 'FF000000' }, // 绿底黑字
        'customerMaterialArrival': { bg: 'FFFF0000', font: 'FFFFFFFF' }, // 红底白字
        'specialRemark': { bg: 'FFFFFF00', font: 'FF000000' }, // 黄底黑字
        'deliveryChangeLog': { bg: 'FFFFC7CE', font: 'FF9C0006' }, // 粉底红字
        'pmcDeliveryDate': { bg: 'FFD9D2E9', font: 'FF000000' }, // 紫底黑字
        'orderSigned': { bg: 'FFE2EFDA', font: 'FF000000' } // 浅绿底黑字
      }
      
      // 基础样式
      const baseStyle = {
        alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: 'FF000000' } },
          bottom: { style: 'thin', color: { rgb: 'FF000000' } },
          left: { style: 'thin', color: { rgb: 'FF000000' } },
          right: { style: 'thin', color: { rgb: 'FF000000' } }
        }
      }
      
      // 表头样式（浅灰底）
      const headerStyle = {
        ...baseStyle,
        fill: { fgColor: { rgb: 'FFE7E6E6' } },
        font: { bold: true, sz: 11, color: { rgb: 'FF000000' } }
      }
      
      // 分组表头样式（紫色背景）
      const groupHeaderStyle = {
        ...baseStyle,
        fill: { fgColor: { rgb: 'FFD9D2E9' } },
        font: { bold: true, sz: 11, color: { rgb: 'FF000000' } }
      }
      
      // 应用表头样式
      for (let c = 0; c < totalCols; c++) {
        const cellAddr1 = XLSX.utils.encode_cell({ r: 0, c: c })
        const cellAddr2 = XLSX.utils.encode_cell({ r: 1, c: c })
        
        if (ws[cellAddr1]) {
          // 判断是否为分组表头
          let isGroupHeader = false
          let colIdx = 0
          for (const col of exportColumns) {
            if (col.children && col.children.length > 0) {
              if (c >= colIdx && c < colIdx + col.children.length) {
                isGroupHeader = true
                break
              }
              colIdx += col.children.length
            } else {
              colIdx++
            }
          }
          ws[cellAddr1].s = isGroupHeader ? groupHeaderStyle : headerStyle
        }
        
        if (ws[cellAddr2]) {
          ws[cellAddr2].s = headerStyle
        }
      }
      
      // 获取列prop映射
      const colPropMap = []
      exportColumns.forEach(col => {
        if (col.children && col.children.length > 0) {
          col.children.forEach(child => {
            colPropMap.push(child.prop)
          })
        } else {
          colPropMap.push(col.prop)
        }
      })
      
      // 应用数据行样式
      for (let r = 2; r < totalRows; r++) {
        for (let c = 0; c < totalCols; c++) {
          const cellAddr = XLSX.utils.encode_cell({ r: r, c: c })
          if (ws[cellAddr]) {
            const prop = colPropMap[c]
            const colorConfig = columnColors[prop]
            
            if (colorConfig) {
              // 有特殊颜色配置的列
              ws[cellAddr].s = {
                ...baseStyle,
                fill: { fgColor: { rgb: colorConfig.bg } },
                font: { sz: 10, color: { rgb: colorConfig.font } }
              }
            } else {
              // 默认样式
              ws[cellAddr].s = {
                ...baseStyle,
                font: { sz: 10, color: { rgb: 'FF000000' } }
              }
            }
          }
        }
      }
    },
    
    // 获取要导出的列配置（支持多级表头，按照页面el-table实际顺序）
    getExportColumnsWithGroups() {
      const columns = []
      
      // 定义表格列结构（完全按照页面el-table中的列定义顺序）
      const tableStructure = [
        { prop: 'customerName', label: '客户名称' },
        { prop: 'u8OrderNo', label: 'U8单号' },
        { prop: 'u8Available', label: 'U8是否可用' },
        { prop: 'bomCode', label: 'BOM编码' },
        { prop: 'etreeBomBefore', label: 'E树BOM刷新前' },
        { prop: 'etreeBomAfter', label: 'E树BOM刷新后' },
        { prop: 'etreeBomAudited', label: 'E树BOM审核' },
        { prop: 'configModel', label: '配置型号' },
        { prop: 'keyModel', label: '按键型号' },
        { prop: 'customerOrderNo', label: '客户订单号' },
        { prop: 'etreeOrderNo', label: 'E树订单号' },
        { prop: 'orderDate', label: '上单时间' },
        // 数量信息分组
        {
          label: '数量信息',
          children: [
            { prop: 'orderQuantity', label: '订单数量' },
            { prop: 'shippedQuantity', label: '已发货量' },
            { prop: 'unshippedQuantity', label: '未发货量' }
          ]
        },
        // 交期信息分组
        {
          label: '交期信息',
          children: [
            { prop: 'deliveryPlan', label: '交货计划' },
            { prop: 'pmcDeliveryDate', label: 'PMC交付日' }
          ]
        },
        { prop: 'deliveryChangeLog', label: '交期变更履历' },
        // 客供物料情况分组
        {
          label: '客供物料情况',
          children: [
            { prop: 'customerMaterial', label: '客供料' },
            { prop: 'customerMaterialArrival', label: '到料时间' }
          ]
        },
        { prop: 'specialRemark', label: '特殊备注' },
        { prop: 'orderDays', label: '订单已耗时(天)' }
      ]
      
      // 按照表格顺序，只添加当前显示的列
      tableStructure.forEach(item => {
        if (item.children) {
          // 检查分组中是否有可见的子列
          const visibleChildren = item.children.filter(child => this.isColumnVisible(child.prop))
          if (visibleChildren.length > 0) {
            columns.push({
              label: item.label,
              children: visibleChildren
            })
          }
        } else {
          // 单列
          if (item.prop === 'customerName' || this.isColumnVisible(item.prop)) {
            columns.push(item)
          }
        }
      })
      
      return columns
    },
    
    // 格式化单元格值
    formatCellValue(prop, value, row) {
      // 处理空值
      if (value === null || value === undefined || value === '') {
        return '-'
      }
      
      // 处理布尔值
      if (prop === 'u8Available') {
        return value ? '可用' : '不可用'
      }
      
      if (prop === 'orderSigned') {
        return value ? '已回签' : '未回签'
      }
      
      // 处理E树BOM审核状态
      if (prop === 'etreeBomAudited') {
        if (value === '已审核') return '已审核'
        if (value === '有遗留') return '有遗留'
        if (value === '未审核') return '未审核'
        return value ? '已审核' : '未审核'
      }
      
      // 处理富文本字段（去除HTML标签）
      if (prop === 'deliveryChangeLog' || prop === 'specialRemark') {
        return this.stripHtml(value)
      }
      
      // 返回原始值
      return value
    },
    
    // 去除HTML标签
    stripHtml(html) {
      if (!html) return ''
      const tmp = document.createElement('DIV')
      tmp.innerHTML = html
      return tmp.textContent || tmp.innerText || ''
    },
    
    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${year}${month}${day}_${hour}${minute}`
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
    color: #67C23A !important;
    font-weight: 500;
  }

  .unshipped-text {
    color: #F56C6C !important;  // 红色
    font-weight: 500;
    
    &.has-unshipped {
      color: #F56C6C !important;  // 红色
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

  // 富文本单元格样式
  .rich-text-cell {
    max-height: 200px;
    overflow-y: auto;
    text-align: left;
    line-height: 1.6;
    
    ::v-deep {
      p {
        margin: 5px 0;
        line-height: 1.6;
      }
      
      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 5px 0;
        border-radius: 4px;
      }
      
      ul, ol {
        padding-left: 20px;
        margin: 5px 0;
      }
      
      strong {
        font-weight: 600;
      }
      
      em {
        font-style: italic;
      }
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
    
    .mode-title {
      font-size: 13px;
      font-weight: 600;
      color: #606266;
      margin-bottom: 8px;
      padding-left: 2px;
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
    
    .saved-schemes {
      margin-bottom: 15px;
      
      .scheme-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .scheme-item {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #dcdfe6;
          background-color: #fff;
          transition: all 0.2s;
          
          &:hover {
            background-color: #f5f7fa;
            border-color: #c0c4cc;
          }
          
          &.active {
            background-color: #ecf5ff;
            border-color: #409eff;
          }
          
          .el-radio {
            margin-right: 4px;
            
            .el-radio__label {
              font-size: 13px;
              padding-left: 6px;
            }
          }
          
          .delete-scheme-btn {
            opacity: 0;
            transition: opacity 0.2s;
            color: #f56c6c;
            padding: 2px 4px;
            margin-left: 4px;
            
            &:hover {
              color: #f56c6c;
              background-color: #fef0f0;
            }
          }
          
          &:hover .delete-scheme-btn {
            opacity: 1;
          }
        }
      }
    }
    
    .save-scheme-section {
      margin-bottom: 15px;
      padding-top: 10px;
      border-top: 1px solid #ebeef5;
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
