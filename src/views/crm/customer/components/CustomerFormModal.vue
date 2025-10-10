<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="isEdit ? '编辑客户' : '新建客户'"
    width="800px"
    :close-on-click-modal="false"
    center
    class="customer-form-dialog"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="140px"
      size="small"
    >
      <!-- 基本信息 -->
      <fieldset class="form-fieldset">
        <legend>基本信息</legend>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户来源" prop="customerSource">
              <el-select v-model="form.customerSource" placeholder="请选择客户来源" style="width: 100%">
                <el-option label="电话营销" value="电话营销" />
                <el-option label="网络推广" value="网络营销" />
                <el-option label="朋友介绍" value="客户推荐" />
                <el-option label="展会活动" value="展会" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户状态" prop="customerStatus">
              <el-select v-model="form.customerStatus" placeholder="请选择客户状态" style="width: 100%">
                <el-option label="潜在客户" value="潜在客户" />
                <el-option label="意向客户" value="意向客户" />
                <el-option label="成交客户" value="成交客户" />
                <el-option label="流失客户" value="流失客户" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户类别" prop="customerLevel">
              <el-select v-model="form.customerLevel" placeholder="请选择客户类别" style="width: 100%" clearable>
                <el-option
                  v-for="dict in dict.type.customer_type_enum"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户品牌" prop="customerBrand">
              <el-input v-model="form.customerBrand" placeholder="请输入客户品牌" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属国家" prop="country">
              <el-select
                v-model="form.country"
                placeholder="请选择所属国家"
                style="width: 100%"
                clearable
              >
                <el-option
                  v-for="dict in dict.type.country_origin"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户来源" prop="customerSource">
              <el-select v-model="form.customerSource" placeholder="请选择客户来源" style="width: 100%" clearable>
                <el-option label="电话营销" value="电话营销" />
                <el-option label="网络推广" value="网络推广" />
                <el-option label="朋友介绍" value="朋友介绍" />
                <el-option label="展会活动" value="展会活动" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售负责人" prop="salesLeader">
              <el-select 
                v-model="form.salesLeader" 
                placeholder="请选择销售负责人" 
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
          <el-col :span="12">
            <el-form-item label="协助人" prop="assistant">
              <el-select 
                v-model="form.assistant" 
                placeholder="请选择协助人" 
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

        <el-form-item label="客户地址" prop="address">
          <el-input
            v-model="form.address"
            type="textarea"
            :rows="2"
            placeholder="请输入客户地址"
          />
        </el-form-item>
        <el-form-item label="背景调查" prop="backgroundCheck">
          <el-input
            v-model="form.backgroundCheck"
            type="textarea"
            :rows="3"
            placeholder="请输入背景调查信息"
          />
        </el-form-item>
      </fieldset>

      <!-- 产品信息 -->
      <fieldset class="form-fieldset">
        <legend>产品信息</legend>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电控类型" prop="electricalControlType">
              <el-input v-model="form.electricalControlType" placeholder="请输入电控类型" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电控供应商" prop="electricalSupplier">
              <el-input v-model="form.electricalSupplier" placeholder="请输入电控供应商" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="仪表供应商" prop="instrumentSupplier">
              <el-input v-model="form.instrumentSupplier" placeholder="请输入仪表供应商" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组装工厂" prop="assemblyFactory">
              <el-input v-model="form.assemblyFactory" placeholder="请输入组装工厂" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年出货量（台/年）" prop="annualShipments">
              <el-input-number
                v-model="form.annualShipments"
                :min="0"
                :max="999999"
                placeholder="请输入年出货量"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品意向" prop="productIntent">
              <el-input
                v-model="form.productIntent"
                type="textarea"
                :rows="2"
                placeholder="请输入产品意向"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </fieldset>

      <!-- 财务信息 -->
      <fieldset class="form-fieldset">
        <legend>财务信息</legend>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="结算期限" prop="paymentTerm">
              <el-select v-model="form.paymentTerm" placeholder="请选择结算期限" style="width: 100%" clearable>
                <el-option
                  v-for="option in settlementPeriodOptions"
                  :key="option.dictCode"
                  :label="option.dictLabel"
                  :value="Number(option.dictCode)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="税种" prop="taxType">
              <el-select v-model="form.taxType" placeholder="请选择税种" style="width: 100%">
                <el-option 
                  v-for="dict in dict.type.tax_type" 
                  :key="dict.value" 
                  :label="dict.label" 
                  :value="dict.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="增值税税率(%)" prop="vatRate">
              <el-input-number v-model="form.vatRate" placeholder="请输入增值税税率" style="width: 100%" :min="0" :max="100" :precision="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发票税号" prop="invoiceTaxNo">
              <el-input-number v-model="form.invoiceTaxNo" placeholder="请输入发票税号" style="width: 100%" :controls="false" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发票抬头" prop="invoiceTitle">
              <el-input v-model="form.invoiceTitle" placeholder="请输入发票抬头" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开户银行" prop="bankName">
              <el-select v-model="form.bankName" placeholder="请选择开户银行" style="width: 100%" clearable filterable>
                <el-option
                  v-for="dict in dict.type.bank_account"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="银行账户" prop="bankAccount">
              <el-input v-model="form.bankAccount" placeholder="请输入银行账户" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开户电话" prop="bankPhone">
              <el-input v-model="form.bankPhone" placeholder="请输入开户电话" />
            </el-form-item>
          </el-col>
        </el-row>
      </fieldset>

      <!-- 产品信息 -->
      <fieldset class="form-fieldset">
        <legend>产品信息</legend>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品意向" prop="productIntent">
              <el-select v-model="form.productIntent" placeholder="请选择产品意向" style="width: 100%" clearable multiple >
                <el-option
                  v-for="dict in dict.type.product_intention"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年出货量" prop="annualShipments">
              <el-input-number v-model="form.annualShipments" placeholder="请输入年出货量" style="width: 100%" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="组装工厂" prop="assemblyFactory">
              <el-input v-model="form.assemblyFactory" placeholder="请输入组装工厂" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电控类型" prop="electricalControlType">
              <el-select v-model="form.electricalControlType" placeholder="请选择电控类型" style="width: 100%" clearable>
                <el-option
                  v-for="dict in dict.type.control_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="现有电控供应商" prop="electricalSupplier">
              <el-input v-model="form.electricalSupplier" placeholder="请输入电控供应商" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="现有仪表供应商" prop="instrumentSupplier">
              <el-input v-model="form.instrumentSupplier" placeholder="请输入仪表供应商" />
            </el-form-item>
          </el-col>
        </el-row>
      </fieldset>

 
    </el-form>

    <template slot="footer">
      <div class="dialog-footer">
        <el-button @click="handleClose" size="small">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit" size="small">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { listUser } from '@/api/system/user'
import { addSoCustomer, updateSoCustomer } from '@/api/crm/soCustomer'
import { getDicts } from '@/api/system/dict/data'

export default {
  name: 'CustomerFormModal',
  dicts: ['customer_type_enum', 'control_type', 'product_intention', 'tax_type', 'bank_account', 'country_origin'],
  components: {
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    customer: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      form: {
        // 基本信息字段
        id: '',
        name: '',
        no: '',
        customerBrand: '',
        country: '',
        customerStatus: '',
        customerLevel: '',
        customerSource: '',
        address: '',
        
        // 团队信息字段
        salesLeader: '',
        assistant: '',
        
        // 业务信息字段
        paymentTerm: '',
        taxType: '',
        vatRate: '',
        invoiceTitle: '',
        invoiceTaxNo: '',
        bankName: '',
        bankAccount: '',
        bankPhone: '',
        
        // 产品相关字段
        productIntent: [],
        annualShipments: '',
        assemblyFactory: '',
        electricalControlType: '',
        electricalSupplier: '',
        instrumentSupplier: '',
        
        // 其他字段
        backgroundCheck: '',
        status: 0,
        
        // 系统字段（通常由后端自动处理）
        createTime: '',
        updateTime: '',
        createBy: '',
        updateBy: ''
      },
        rules: {
        name: [
          { required: true, message: '请输入客户名称', trigger: 'blur' }
        ],
        customerStatus: [
          { required: true, message: '请选择客户状态', trigger: 'change' }
        ],
        customerLevel: [
          { required: true, message: '请选择客户等级', trigger: 'change' }
        ],
        salesLeader: [
          { required: true, message: '请选择销售负责人', trigger: 'change' }
        ],
        vatRate: [
          { pattern: /^([0-9]{1,2}(\.[0-9]{1,2})?|100(\.0{1,2})?)$/, message: '请输入0-100之间的数值', trigger: 'blur' }
        ],
        annualShipments: [
          { pattern: /^[0-9]+$/, message: '请输入正整数', trigger: 'blur' }
        ]
      },
      // 用户数据
      userList: [], // 用户列表
      settlementPeriodOptions: []
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
    isEdit() {
      return !!(this.customer && this.customer.id)
    }
  },

  watch: {
    customer: {
      async handler(newCustomer) {
        if (newCustomer) {
          if (!this.settlementPeriodOptions.length) {
            await this.loadSettlementPeriodOptions()
          }
          Object.assign(this.form, {
            // 基本信息字段
            id: newCustomer.id || '',
            name: newCustomer.name || '',
            no: newCustomer.no || '',
            customerBrand: newCustomer.customerBrand || '',
            country: newCustomer.country || '',
            customerStatus: newCustomer.customerStatus || 'potential',
            customerLevel: newCustomer.customerLevel || '',
            customerSource: newCustomer.customerSource || '',
            address: newCustomer.address || '',
            
            // 团队信息字段
            salesLeader: newCustomer.salesLeader || '',
            assistant: newCustomer.assistant || '',
            department: newCustomer.department || '',
            
            // 业务信息字段
            paymentTerm: this.resolvePaymentTermDictCode(newCustomer.paymentTerm),
            taxType: newCustomer.taxType || '',
            vatRate: newCustomer.vatRate || '',
            invoiceTitle: newCustomer.invoiceTitle || '',
            invoiceTaxNo: newCustomer.invoiceTaxNo || '',
            bankName: newCustomer.bankName || '',
            bankAccount: newCustomer.bankAccount || '',
            bankPhone: newCustomer.bankPhone || '',
            
            // 产品相关字段
            productIntent: newCustomer.productIntent || '',
            annualShipments: newCustomer.annualShipments || '',
            assemblyFactory: newCustomer.assemblyFactory || '',
            electricalControlType: newCustomer.electricalControlType || '',
            electricalSupplier: newCustomer.electricalSupplier || '',
            instrumentSupplier: newCustomer.instrumentSupplier || '',
            
            // 其他字段
            backgroundCheck: newCustomer.backgroundCheck || '',
            status: newCustomer.status !== undefined ? newCustomer.status : 0
          })
          this.form.paymentTerm = this.resolvePaymentTermDictCode(this.form.paymentTerm)
        } else {
          // 新建模式，重置表单
          this.$nextTick(() => {
            this.resetForm()
          })
        }
      },
      immediate: true
    },
    visible(val) {
      console.log('弹窗显示状态变化:', val, '当前客户:', this.customer)
      if (val && this.customer) {
        // 弹窗打开时，如果有客户数据，重新填充表单
        this.$nextTick(() => {
          console.log('弹窗打开后重新填充表单数据')
          this.customer && this.fillFormData()
        })
      }
    }
  },
  mounted() {
    this.loadSettlementPeriodOptions()
    this.getUserList()
  },
  methods: {
    resetForm() {
      // 使用 Object.assign 来确保响应式更新
      Object.assign(this.form, {
        // 基本信息字段
        id: '',
        name: '',
        no: '',
        customerBrand: '',
        country: '',
        customerStatus: '',
        customerLevel: '',
        customerSource: '',
        address: '',
        
        // 团队信息字段
        salesLeader: '',
        assistant: '',
        
        // 业务信息字段
        paymentTerm: '',
        taxType: '',
        vatRate: '',
        invoiceTitle: '',
        invoiceTaxNo: '',
        bankName: '',
        bankAccount: '',
        bankPhone: '',
        
        // 产品相关字段
        productIntent: [],
        annualShipments: '',
        assemblyFactory: '',
        electricalControlType: '',
        electricalSupplier: '',
        instrumentSupplier: '',
        
        // 其他字段
        backgroundCheck: '',
        status: 0,
        
        // 系统字段（通常由后端自动处理）
        createTime: '',
        updateTime: '',
        createBy: '',
        updateBy: ''
      })
      
      // 清空表单验证状态
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.resetFields()
          this.$refs.formRef.clearValidate()
        }
      })
    },

    fillFormData() {
      if (!this.customer) return
      
      // 填充表单数据
      Object.assign(this.form, {
        // 基本信息字段
        id: this.customer.id || '',
        name: this.customer.name || '',
        no: this.customer.no || '',
        customerBrand: this.customer.customerBrand || '',
        country: this.customer.country || '',
        customerStatus: this.customer.customerStatus || 'potential',
        customerLevel: this.customer.customerLevel || '',
        customerSource: this.customer.customerSource || '',
        address: this.customer.address || '',
        
        // 团队信息字段
        salesLeader: this.customer.salesLeader || '',
        assistant: this.customer.assistant || '',
        department: this.customer.department || '',
        
        // 业务信息字段
        paymentTerm: this.customer.paymentTerm || '',
        taxType: this.customer.taxType || '',
        vatRate: this.customer.vatRate || '',
        invoiceTitle: this.customer.invoiceTitle || '',
        invoiceTaxNo: this.customer.invoiceTaxNo || '',
        bankName: this.customer.bankName || '',
        bankAccount: this.customer.bankAccount || '',
        bankPhone: this.customer.bankPhone || '',
        
        // 产品相关字段
        productIntent: this.customer.productIntent ? 
          (typeof this.customer.productIntent === 'string' ? 
            this.customer.productIntent.split(',').filter(item => item.trim()) : 
            this.customer.productIntent) : [],
        annualShipments: this.customer.annualShipments || '',
        assemblyFactory: this.customer.assemblyFactory || '',
        electricalControlType: this.customer.electricalControlType || '',
        electricalSupplier: this.customer.electricalSupplier || '',
        instrumentSupplier: this.customer.instrumentSupplier || '',
        
        // 其他字段
        backgroundCheck: this.customer.backgroundCheck || '',
        status: this.customer.status !== undefined ? this.customer.status : 0
      })
      
      console.log('fillFormData 完成后的表单数据:', this.form)
    },

    generateCode() {
      if (!this.isEdit) {
        // 生成CRM客户编号
        const timestamp = Date.now().toString().slice(-6)
        this.form.no = `C${timestamp}`
      }
    },

    async handleSubmit() {
      const valid = await this.$refs.formRef.validate().catch(() => false)
      if (!valid) return

      this.loading = true

      try {
        if (!this.isEdit) {
          this.generateCode()
        }

        const payload = this.buildSubmitPayload()
        const requestFn = this.isEdit ? updateSoCustomer : addSoCustomer
        const res = await requestFn(payload)

        if (res.code === 200 || res.code === 0) {
          this.$message.success(this.isEdit ? '更新成功' : '创建成功')
          this.$emit('refresh')
          this.handleClose()
        } else {
          this.$message.error(res.msg || (this.isEdit ? '更新失败' : '创建失败'))
        }
      } catch (error) {
        console.error('Error saving customer:', error)
        this.$message.error(this.isEdit ? '更新失败' : '创建失败')
      } finally {
        this.loading = false
      }
    },

    buildSubmitPayload() {
      const payload = { ...this.form }
      const toNumberOrNull = (value) => {
        if (value === '' || value === null || value === undefined) return null
        const parsed = Number(value)
        return Number.isNaN(parsed) ? value : parsed
      }

      // 产品意向数组转换为逗号分隔字符串
      if (Array.isArray(payload.productIntent)) {
        payload.productIntent = payload.productIntent.join(',')
      }

      // 数值字段转换 (paymentTerm 同步为字典 dictCode)
      payload.paymentTerm = this.resolvePaymentTermDictCode(payload.paymentTerm)
      payload.annualShipments = toNumberOrNull(payload.annualShipments)
      payload.vatRate = toNumberOrNull(payload.vatRate)
      payload.invoiceTaxNo = toNumberOrNull(payload.invoiceTaxNo)
      payload.status = toNumberOrNull(payload.status)
      if (payload.status === null) payload.status = 0

      return payload
    },

    resolvePaymentTermDictCode(value) {
      if (value === '' || value === null || value === undefined) return ''
      const list = this.settlementPeriodOptions || []
      const match = list.find(item => String(item.dictCode) === String(value) || String(item.dictValue) === String(value))
      return match ? String(match.dictCode) : String(value)
    },

    async loadSettlementPeriodOptions() {
      try {
        const res = await getDicts('settlement_period')
        if ((res.code === 200 || res.code === 0) && Array.isArray(res.data)) {
          this.settlementPeriodOptions = res.data
            .filter(item => item.status === '0')
            .map(item => ({
              dictCode: String(item.dictCode),
              dictValue: String(item.dictValue),
              dictLabel: item.dictLabel
            }))
          this.form.paymentTerm = this.resolvePaymentTermDictCode(this.form.paymentTerm)
        } else {
          this.settlementPeriodOptions = []
        }
      } catch (error) {
        console.error('获取结算期限字典失败:', error)
        this.settlementPeriodOptions = []
      }
    },

    handleClose() {
      // 先重置表单，然后关闭弹窗
      this.resetForm()
      this.$nextTick(() => {
        this.$emit('update:visible', false)
      })
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

  }
}
</script>

<style scoped>
.form-fieldset {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px 20px 8px 20px;
  margin-bottom: 20px;
}

.form-fieldset legend {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding: 0 8px;
  margin-left: -8px;
  background-color: transparent;
  border-radius: 4px;
  padding: 4px 12px;
}

.dialog-footer {
  text-align: right;
}
</style>

<style>
.customer-form-dialog .el-dialog {
  margin: 0 auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0 !important;
  max-height: 90vh;
}

.customer-form-dialog .el-dialog__body {
  max-height: 75vh;
  overflow-y: auto;
  padding: 20px;
}

.customer-form-dialog :deep(.el-form-item) {
  margin-bottom: 16px;
}

.customer-form-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.customer-form-dialog :deep(.el-input__wrapper) {
  border-radius: 4px;
}

.customer-form-dialog :deep(.el-select .el-input__wrapper) {
  border-radius: 4px;
}

.customer-form-dialog :deep(.el-textarea .el-textarea__inner) {
  border-radius: 4px;
}

.customer-form-dialog :deep(.el-date-editor) {
  width: 100%;
}

.customer-form-dialog :deep(.vue-treeselect__control) {
  border-radius: 4px;
}
</style>
