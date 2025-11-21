<template>
  <el-dialog 
    :visible.sync="dialogVisible" 
    :title="dialogTitle" 
    :width="dialogWidth"
    :close-on-click-modal="false"
    top="0vh"
    @close="handleClose" 
    class="add-shipment-order-dialog"
  >
    <!-- 模式切换 -->
    <div class="mode-switch" v-if="!isEdit && hasMarketPermission">
      <el-radio-group v-model="isQuickMode" size="small">
        <el-radio-button :label="false">标准订单</el-radio-button>
        <el-radio-button :label="true">快速订单</el-radio-button>
      </el-radio-group>
      <span class="mode-tip" v-if="isQuickMode">（适用于返修/返工等特殊订单，仅需填写基本信息）</span>
    </div>

    <el-form :model="form" :rules="rules" ref="form" label-width="140px" size="small">
      
      <!-- ==================== 快速订单模式 ==================== -->
      <template v-if="isQuickMode && !isEdit">
        <fieldset class="form-fieldset quick-order-fieldset">
          <legend>快速订单信息</legend>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="订单类型" prop="orderType">
                <el-select v-model="form.orderType" placeholder="请选择订单类型" style="width: 100%">
                  <el-option label="售后返修" value="售后返修"></el-option>
                  <el-option label="返工订单" value="返工订单"></el-option>
                  <el-option label="其他特殊订单" value="其他特殊订单"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="客户名称" prop="customerName">
                <el-input
                  v-model="form.customerName"
                  placeholder="请输入客户名称"
                  clearable
                  @keyup.enter.native="handleCustomerInputEnter"
                >
                  <el-button 
                    slot="append" 
                    icon="el-icon-search"
                    @click="showCustomerOptions = !showCustomerOptions"
                  ></el-button>
                </el-input>
                <!-- 客户选择下拉列表 -->
                <el-select
                  v-if="showCustomerOptions"
                  v-model="form.customerName"
                  filterable
                  placeholder="或从列表选择"
                  style="width: 100%; margin-top: 5px"
                  clearable
                  @change="showCustomerOptions = false"
                >
                  <el-option
                    v-for="item in customerOptions"
                    :key="item.value || item.name"
                    :label="item.label || item.name"
                    :value="item.value || item.name"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="产品型号" prop="configModel">
                <el-select 
                  v-model="form.configModel" 
                  :loading="computerLoading"
                  filterable 
                  allow-create
                  default-first-option
                  remote 
                  clearable
                  placeholder="请选择或输入产品型号"
                  :remote-method="getComputerNameList"
                  @focus="getComputerData"
                  style="width: 100%">
                  <el-option
                    v-for="dict in computerOptions"
                    :key="dict.model"
                    :label="dict.name"
                    :value="dict.model">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="订单数量" prop="orderQuantity">
                <el-input-number 
                  v-model="form.orderQuantity" 
                  :min="0" 
                  :controls="true" 
                  placeholder="请输入订单数量"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="交货计划" prop="deliveryPlan">
                <el-date-picker 
                  v-model="form.deliveryPlan" 
                  type="date" 
                  placeholder="请选择交货计划日期" 
                  value-format="yyyy-MM-dd"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="备注说明" prop="specialRemark">
                <el-input 
                  v-model="form.specialRemark" 
                  type="textarea"
                  :rows="3"
                  placeholder="请输入备注说明"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </fieldset>
      </template>
      
      <!-- ==================== 标准订单模式 ==================== -->
      <!-- ==================== 市场专员：新增/编辑订单 ==================== -->
      <!-- 市场专员可编辑表单，其他角色查看纯文本 -->
      <template v-if="(!isQuickMode || isEdit) && (hasMarketPermission || (isEdit && (hasBomPermission || hasPmcPermission)))">
        <fieldset class="form-fieldset market-fieldset" :class="{ 'readonly-text-fieldset': !hasMarketPermission && isEdit }">
          <legend v-if="!isEdit">订单基础信息</legend>
          <legend v-else-if="!hasMarketPermission">市场信息（只读）</legend>
        
        <!-- 市场专员：显示表单控件 -->
        <template v-if="hasMarketPermission">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="客户名称" prop="customerName">
                <TypedSelectLoadMore 
                  v-model="form.customerName" 
                  type="customer"
                  placeholder="请选择客户" 
                  clearable
                  returnLabel
                  customStyle="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="产品型号" prop="configModel">
                <el-select 
                  v-model="form.configModel" 
                  :loading="computerLoading"
                  filterable 
                  remote 
                  clearable
                  placeholder="请选择产品型号"
                  :remote-method="getComputerNameList"
                  @focus="getComputerData"
                  style="width: 100%">
                  <el-option
                    v-for="dict in computerOptions"
                    :key="dict.model"
                    :label="dict.name"
                    :value="dict.model">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="按键型号" prop="keyModel">
                <TypedSelectLoadMore 
                  v-model="form.keyModel" 
                  type="category"
                  placeholder="请选择按键型号" 
                  clearable
                  returnLabel
                  customStyle="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="客户订单号" prop="customerOrderNo">
                <el-input v-model="form.customerOrderNo" placeholder="请输入客户订单号" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="E树订单号" prop="etreeOrderNo">
                <el-input v-model="form.etreeOrderNo" placeholder="请输入E树订单号" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="U8单号" prop="u8OrderNo">
                <el-input v-model="form.u8OrderNo" placeholder="请输入U8单号" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="BOM编码" prop="bomCode">
                <el-input v-model="form.bomCode" placeholder="请输入BOM编码" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="上单时间" prop="orderDate">
                <el-date-picker 
                  v-model="form.orderDate" 
                  type="date" 
                  placeholder="请选择上单时间" 
                  value-format="yyyy-MM-dd"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="订单数量" prop="orderQuantity">
                <el-input-number 
                  v-model="form.orderQuantity" 
                  :min="0" 
                  :controls="true" 
                  placeholder="请输入订单数量"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="交货计划" prop="deliveryPlan">
                <el-date-picker 
                  v-model="form.deliveryPlan" 
                  type="date" 
                  placeholder="请选择交货计划日期" 
                  value-format="yyyy-MM-dd"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- BOM/PMC专员：以详情页形式显示 -->
        <template v-else>
          <div class="detail-view">
            <el-row :gutter="40" class="detail-row">
              <el-col :span="12">
                <div class="detail-item">
                  <span class="detail-label">客户名称</span>
                  <span class="detail-value">{{ form.customerName || '-' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <span class="detail-label">产品型号</span>
                  <span class="detail-value">{{ form.configModel || '-' }}</span>
                </div>
              </el-col>
            </el-row>

            <el-row :gutter="40" class="detail-row">
              <el-col :span="12">
                <div class="detail-item">
                  <span class="detail-label">按键型号</span>
                  <span class="detail-value">{{ form.keyModel || '-' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <span class="detail-label">客户订单号</span>
                  <span class="detail-value">{{ form.customerOrderNo || '-' }}</span>
                </div>
              </el-col>
            </el-row>

            <el-row :gutter="40" class="detail-row">
              <el-col :span="12">
                <div class="detail-item">
                  <span class="detail-label">E树订单号</span>
                  <span class="detail-value">{{ form.etreeOrderNo || '-' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <span class="detail-label">U8单号</span>
                  <span class="detail-value">{{ form.u8OrderNo || '-' }}</span>
                </div>
              </el-col>
            </el-row>

            <el-row :gutter="40" class="detail-row">
              <el-col :span="12">
                <div class="detail-item">
                  <span class="detail-label">BOM编码</span>
                  <span class="detail-value">{{ form.bomCode || '-' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <span class="detail-label">上单时间</span>
                  <span class="detail-value">{{ form.orderDate || '-' }}</span>
                </div>
              </el-col>
            </el-row>

            <el-row :gutter="40" class="detail-row">
              <el-col :span="12">
                <div class="detail-item">
                  <span class="detail-label">订单数量</span>
                  <span class="detail-value">{{ form.orderQuantity || 0 }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <span class="detail-label">交货计划</span>
                  <span class="detail-value">{{ form.deliveryPlan || '-' }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </template>
        </fieldset>

        <!-- 市场后填信息（仅编辑时显示） -->
        <template v-if="isEdit">
          <fieldset class="form-fieldset market-fieldset" :class="{ 'readonly-text-fieldset': !hasMarketPermission }" style="margin-top: 15px">
          
          <!-- 市场专员：显示表单控件 -->
          <template v-if="hasMarketPermission">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="客供物料情况" prop="customerMaterial">
                  <el-select 
                    v-model="form.customerMaterial"
                    filterable
                    allow-create
                    default-first-option
                    placeholder="请选择或输入客供物料情况"
                    clearable
                    multiple
                    style="width: 100%"
                  >
                    <el-option label="/" value="/"></el-option>
                    <el-option label="中控线" value="中控线"></el-option>
                    <el-option label="按键线" value="按键线"></el-option>
                    <el-option label="丝印保护膜" value="丝印保护膜"></el-option>
                    <el-option label="蓝牙模块" value="蓝牙模块"></el-option>
                    <el-option label="安全芯片" value="安全芯片"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="到料时间" prop="customerMaterialArrival">
                  <Editor 
                    v-model="form.customerMaterialArrival" 
                    :min-height="150"
                    placeholder="请输入到料时间信息"
                    />
                </el-form-item>
              </el-col>
            </el-row>
            
   

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="特殊备注" prop="specialRemark">
                  <Editor 
                    v-model="form.specialRemark" 
                    :min-height="200"
                    placeholder="请输入特殊备注（支持图片）"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="交期变更履历" prop="deliveryChangeLog">
                  <Editor 
                    v-model="form.deliveryChangeLog" 
                    :min-height="150"
                    placeholder="请输入交期变更履历（支持富文本）"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="订单是否已回签" prop="orderSigned">
                  <el-switch v-model="form.orderSigned" />
                </el-form-item>
              </el-col>
            </el-row>
          </template>

          <!-- BOM/PMC专员：以详情页形式显示 -->
          <template v-else>
            <div class="detail-view">
              <el-row :gutter="40" class="detail-row">
                <el-col :span="12">
                  <div class="detail-item">
                    <span class="detail-label">客供物料情况</span>
                    <span class="detail-value">{{ form.customerMaterial || '-' }}</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="detail-item">
                    <span class="detail-label">到料时间</span>
                    <span class="detail-value">{{ form.customerMaterialArrival || '-' }}</span>
                  </div>
                </el-col>
              </el-row>

              <el-row :gutter="40" class="detail-row">
                <el-col :span="24">
                  <div class="detail-item">
                    <span class="detail-label">特殊备注</span>
                    <div class="detail-value" v-html="form.specialRemark || '-'"></div>
                  </div>
                </el-col>
              </el-row>

              <el-row :gutter="40" class="detail-row">
                <el-col :span="24">
                  <div class="detail-item">
                    <span class="detail-label">交期变更履历</span>
                    <div class="detail-value" v-html="form.deliveryChangeLog || '-'"></div>
                  </div>
                </el-col>
              </el-row>

              <el-row :gutter="40" class="detail-row">
                <el-col :span="12">
                  <div class="detail-item">
                    <span class="detail-label">订单是否已回签</span>
                    <span class="detail-value">{{ form.orderSigned ? '是' : '否' }}</span>
                  </div>
                </el-col>
              </el-row>
            </div>
          </template>
          </fieldset>
        </template>
      </template>

      <!-- ==================== BOM专员：编辑BOM信息 ==================== -->
      <template v-if="hasBomPermission">
        <fieldset class="form-fieldset bom-fieldset">
        
        <!-- U8相关信息 -->
        <div class="sub-section">
          <div class="sub-section-title">U8信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="U8是否可用" prop="u8Available">
                <el-switch v-model="form.u8Available" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- E树相关信息 -->
        <div class="sub-section">
          <div class="sub-section-title">E树信息</div>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="E树BOM审核状态" prop="etreeBomAudited">
                <el-radio-group v-model="form.etreeBomAudited">
                  <el-radio label="已审核">已审核</el-radio>
                  <el-radio label="未审核">未审核</el-radio>
                  <el-radio label="有遗留">有遗留</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="E树BOM刷新前" prop="etreeBomBefore">
                <el-input v-model="form.etreeBomBefore" placeholder="请输入E树BOM刷新前" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="E树BOM刷新后" prop="etreeBomAfter">
                <el-input v-model="form.etreeBomAfter" placeholder="请输入E树BOM刷新后" clearable />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        </fieldset>
      </template>

      <!-- ==================== PMC专员：编辑交期信息 ==================== -->
      <template v-if="hasPmcPermission">
        <fieldset class="form-fieldset pmc-fieldset">
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="PMC可达成交期" prop="pmcDeliveryDate">
              <Editor 
                v-model="form.pmcDeliveryDate" 
                :min-height="150"
                placeholder="请输入PMC可达成交期（支持富文本）"
              />
            </el-form-item>
          </el-col>
        </el-row>
        </fieldset>
      </template>

      <!-- ==================== 无权限提示 ==================== -->
      <template v-if="!hasMarketPermission && !hasBomPermission && !hasPmcPermission">
        <el-empty description="当前角色无编辑权限" :image-size="100">
          <template slot="image">
            <i class="el-icon-lock" style="font-size: 100px; color: #C0C4CC"></i>
          </template>
        </el-empty>
      </template>

    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button 
        type="primary" 
        @click="handleSubmit" 
        :loading="submitLoading"
        v-if="hasMarketPermission || hasBomPermission || hasPmcPermission"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addShipmentOrder, updateShipmentOrder } from '@/api/shipment-management/shipmentOrder.mock'
import { checkPermi } from '@/utils/permission'
import TypedSelectLoadMore from '@/components/TypedSelectLoadMore'
import Editor from '@/components/Editor'

export default {
  name: 'AddShipmentOrderDialog',
  components: {
    TypedSelectLoadMore,
    Editor
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: null
    },
    copyMode: {
      type: Boolean,
      default: false
    },
    customerOptions: {
      type: Array,
      default: () => []
    },
    statusOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      isQuickMode: false, // 快速订单模式
      showCustomerOptions: false, // 显示客户选择下拉
      // 产品型号相关
      computerOptions: [],
      computerAllOptions: [], // 保存所有产品型号数据
      computerLoading: false,
      // 到料时间选项
      materialArrivalOptions: [
        '蓝牙模块',
        '安全芯片',
        '主板',
        'LCD屏幕',
        '外壳',
        '电池',
        '摄像头',
        '其他'
      ],
      form: {
        orderType: '', // 订单类型（快速订单使用）
        customerName: '',
        u8Available: true,
        u8OrderNo: '',
        bomCode: '',
        etreeBomBefore: '',
        etreeBomAfter: '',
        etreeBomAudited: false,
        configModel: '',
        keyModel: '',
        customerOrderNo: '',
        etreeOrderNo: '',
        orderDate: '',
        orderQuantity: 0,
        shippedQuantity: 0,
        deliveryPlan: '',
        pmcDeliveryDate: '',
  
        deliveryChangeLog: '',
        customerMaterial: '',
        customerMaterialArrival: [],  // 改为数组支持多选
        qrCodeFilmStatus: '',
        nylonShellStatus: '',
        productionStatus: '',
        productionVersion: '',
        productionVersionApp: '',
        productionVersionUi: '',
        specialRemark: '',
        orderSigned: false,
        orderDays: 0
      },
      rules: {
        customerName: [
          { required: true, message: '请选择客户', trigger: 'change' }
        ],
        configModel: [
          { required: true, message: '请选择产品型号', trigger: 'change' }
        ],
        customerOrderNo: [
          { required: true, message: '请输入客户订单号', trigger: 'blur' }
        ],
        orderQuantity: [
          { required: true, message: '请输入订单数量', trigger: 'blur' }
        ],
        orderDate: [
          { required: true, message: '请选择上单时间', trigger: 'change' }
        ],
        deliveryPlan: [
          { required: false, message: '请选择交货计划', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      if (this.copyMode) {
        return '复制未出货订单'
      }
      if (!this.isEdit) {
        return '新增未出货订单'
      }
      // 根据角色显示角色名称
      if (this.hasMarketPermission) {
        return '市场专员'
      } else if (this.hasBomPermission) {
        return 'BOM专员'
      } else if (this.hasPmcPermission) {
        return 'PMC专员'
      }
      return '查看订单详情'
    },
    dialogWidth() {
      // 统一使用800px宽度，更紧凑
      return '800px'
    },
    isEdit() {
      return !!this.editData
    },
    unshippedQuantity() {
      return (this.form.orderQuantity || 0) - (this.form.shippedQuantity || 0)
    },
    // 权限检查
    hasMarketPermission() {
      // 市场专员权限：ms (roleKey: ms, roleId: 124)
      return this.checkRole(['ms', 'sale_manager', 'admin'])
    },
    hasBomPermission() {
      // BOM专员权限：BOM_Manage (roleKey: BOM_Manage, roleId: 143)
      return this.checkRole(['BOM_Manage', 'admin'])
    },
    hasPmcPermission() {
      // PMC/计划专员权限：pmc (roleKey: pmc, roleId: 120)
      return this.checkRole(['pmc', 'admin'])
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.dialogVisible = val
        if (val) {
          this.initForm()
        }
      },
      immediate: true
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    checkPermi,
    
    // 处理客户名称输入回车
    handleCustomerInputEnter() {
      // 回车后自动关闭下拉选项
      this.showCustomerOptions = false
    },
    
    // 检查角色（支持父组件传递的模拟角色）
    checkRole(roles) {
      // 优先使用父组件的模拟角色（用于测试）
      if (this.$parent && this.$parent.mockRoles && this.$parent.mockRoles.length > 0) {
        return roles.some(role => this.$parent.mockRoles.includes(role))
      }
      
      // 生产环境使用真实角色
      const userRoles = this.$store.getters && this.$store.getters.roles
      if (!userRoles || userRoles.length === 0) {
        return false
      }
      return roles.some(role => userRoles.includes(role))
    },
    
    // 获取角色名称
    getRoleName(roleKey) {
      const roleMap = {
        'ms': '市场专员',
        'sale_manager': '市场主管',
        'BOM_Manage': 'BOM专员',
        'pmc': 'PMC专员',
        'admin': '超级管理员',
        'user': '普通用户'
      }
      return roleMap[roleKey] || roleKey
    },
    
    // 初始化表单
    initForm() {
      if (this.editData) {
        if (this.copyMode) {
          // 复制模式：复制数据但清空 id，确保走新增逻辑
          this.form = { ...this.editData }
          delete this.form.id
          // 复制模式下，上单时间重置为当天
          this.form.orderDate = this.getCurrentDate()
        } else {
          // 编辑模式：直接复制所有数据
          this.form = { ...this.editData }
        }
      } else {
        // 新增模式
        this.resetForm()
      }
    },

    // 重置表单
    resetForm() {
      this.showCustomerOptions = false // 重置客户下拉显示状态
      this.form = {
        customerName: '',
        u8Available: true,
        u8OrderNo: '',
        bomCode: '',
        etreeBomBefore: '',
        etreeBomAfter: '',
        etreeBomAudited: false,
        configModel: '',
        keyModel: '',
        customerOrderNo: '',
        etreeOrderNo: '',
        orderDate: this.getCurrentDate(),
        orderQuantity: 0,
        shippedQuantity: 0,
        deliveryPlan: '',
        pmcDeliveryDate: '',
    
        deliveryChangeLog: '',
        customerMaterial: '',
        customerMaterialArrival: [],  // 改为数组支持多选
        qrCodeFilmStatus: '',
        nylonShellStatus: '',
        productionStatus: '',
        productionVersion: '',
        productionVersionApp: '',
        productionVersionUi: '',
        specialRemark: '',
        orderSigned: false,
        orderDays: 0
      }
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          
          const submitData = {
            ...this.form,
            unshippedQuantity: this.unshippedQuantity,
            orderDays: this.calculateOrderDays(this.form.orderDate)
          }

          // 复制模式使用新增接口，编辑模式使用更新接口
          const apiMethod = (this.editData && !this.copyMode) ? updateShipmentOrder : addShipmentOrder
          
          apiMethod(submitData).then((res) => {
            if (res.code === 200) {
              this.$message.success(this.editData ? '编辑成功' : '新增成功')
              this.handleClose()
              this.$emit('success')
            } else {
              this.$message.error(res.msg || '操作失败')
            }
          }).catch((error) => {
            console.error('提交失败:', error)
            this.$message.error('操作失败')
          }).finally(() => {
            this.submitLoading = false
          })
        }
      })
    },

    // 计算订单已耗时
    calculateOrderDays(orderDate) {
      if (!orderDate) return 0
      const startDate = new Date(orderDate)
      const today = new Date()
      const diffTime = Math.abs(today - startDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    },

    // 关闭对话框
    handleClose() {
      this.resetForm()
      this.dialogVisible = false
    },

    // 获取产品型号数据（焦点事件）
    getComputerData() {
      // 如果已经有数据，不重复加载
      if (this.computerAllOptions.length > 0) {
        this.computerOptions = [...this.computerAllOptions];
        return Promise.resolve();
      }
      
      this.computerLoading = true;
      // 导入并调用产品型号字典API，获取所有数据
      return import('@/api/computer/index').then(({ dictList }) => {
        return dictList().then((res) => {
          this.computerAllOptions = res.data || [];
          this.computerOptions = [...this.computerAllOptions];
        }).catch(() => {
          this.computerAllOptions = [];
          this.computerOptions = [];
          console.error('获取产品型号失败');
        }).finally(() => {
          this.computerLoading = false;
        });
      });
    },

    // 远程搜索产品型号（前端筛选）
    getComputerNameList(name) {
      if (!name) {
        // 如果没有搜索词，显示所有数据
        this.computerOptions = [...this.computerAllOptions];
        return;
      }
      
      // 如果还没有加载过数据，先加载
      if (this.computerAllOptions.length === 0) {
        this.getComputerData();
        return;
      }
      
      // 前端筛选：根据名称过滤，不修改原始数据
      this.computerOptions = this.computerAllOptions.filter(item => 
        item.name && item.name.toLowerCase().includes(name.toLowerCase())
      );
    },

    // 获取当前日期（yyyy-MM-dd格式）
    getCurrentDate() {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style lang="scss" scoped>
.add-shipment-order-dialog {
  // 模式切换样式
  .mode-switch {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 15px;
    
    .mode-tip {
      font-size: 13px;
      color: #909399;
    }
  }
  
  // 快速订单样式
  .quick-order-fieldset {
    border-color: #67C23A;
    background-color: #f0f9ff;
    
    legend {
      color: #67C23A;
    }
  }
  
  ::v-deep .el-dialog__body {
    max-height: 70vh;
    overflow-y: auto;
    padding: 20px 30px;
  }

  ::v-deep .el-divider {
    margin: 15px 0;
  }

  ::v-deep .el-divider__text {
    font-weight: 600;
    color: #409EFF;
    font-size: 14px;
  }

  .field-tip {
    font-size: 12px;
    color: #909399;
    margin-left: 8px;
  }

  .dialog-footer {
    text-align: right;
    padding-top: 10px;
  }

  // Fieldset 样式
  .form-fieldset {
    border: 2px solid #dcdfe6;
    border-radius: 6px;
    padding: 15px 20px 10px;
    margin-bottom: 15px;

    legend {
      font-size: 14px;
      font-weight: 600;
      padding: 0 10px;
      color: #303133;
      border: none;
      width: auto;
      margin-bottom: 0;
    }
  }

  // 子区域样式
  .sub-section {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #e4e7ed;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .sub-section-title {
      font-size: 13px;
      font-weight: 600;
      color: #606266;
      margin-bottom: 10px;
      padding-left: 10px;
      border-left: 3px solid #409eff;
    }
  }

  // 只读文本区域样式
  .readonly-text-fieldset {
    background-color: #f5f7fa;
    
    legend {
      color: #909399;
    }
  }

  // 详情页展示样式
  .detail-view {
    padding: 5px 10px;

    .detail-row {
      margin-bottom: 18px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      line-height: 1.6;

      .detail-label {
        flex-shrink: 0;
        width: 120px;
        color: #606266;
        font-size: 14px;
        text-align: right;
        padding-right: 12px;
      }

      .detail-value {
        flex: 1;
        color: #303133;
        font-size: 14px;
        word-break: break-all;
        
        // 富文本内容样式
        ::v-deep {
          p {
            margin: 5px 0;
            line-height: 1.6;
          }
          
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 8px 0;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
    }
  }

  // BOM专员区域 - 橙色边框
  .bom-fieldset {
    border-color: #e6a23c;
    background-color: #fdf6ec;

    legend {
      color: #e6a23c;
    }
  }
}
</style>
 