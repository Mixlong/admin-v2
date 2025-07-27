<template>
  <el-dialog :visible="visible" @update:visible="handleVisibleChange" :title="dialogTitle" width="1300px"
    :close-on-click-modal="false" :close-on-press-escape="false" class="add-quote-dialog" center
    :before-close="handleBeforeClose">
    <div class="dialog-content">
      <!-- ID信息显示 -->
      <div class="id-info-bar">
        <el-alert :title="idInfoText" type="info" :closable="false" show-icon></el-alert>
      </div>

      <!-- 产品配置区域 -->
      <div class="config-container">
        <!-- 左侧：主产品配置 -->
        <div class="config-section">
          <div class="section-header">
            <h3>主产品</h3>
          </div>
          <div class="section-content">
            <el-form :model="formData.mainProduct" :rules="mainProductRules" ref="mainProductForm" label-width="100px"
              size="small">
              <!-- 产品品类 -->
              <el-form-item label="产品品类" prop="category">
                <el-select v-model="formData.mainProduct.category" style="width: 100%" placeholder="请输入或选择产品品类"
                  :loading="loading" filterable remote :remote-method="searchMainProductCategory"
                  :filter-method="filterMainProductCategory" default-first-option>
                  <el-option v-for="(category, index) in filteredMainProductCategories"
                    :key="`main-category-${category.id || index}-${index}-${category.name}`" :label="category.name"
                    :value="category.id">
                    <div class="category-option">
                      <el-image v-if="category.image" :src="category.image" class="category-image" fit="cover">
                        <div slot="error" class="image-slot">
                          <i class="el-icon-picture-outline"></i>
                        </div>
                      </el-image>
                      <div v-else class="category-image no-image">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                      <span class="category-name">{{ category.name }}</span>
                      <span v-if="category.code" class="category-code">{{ category.code }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>

              <!-- 选项 -->
              <el-form-item label="选项">
                <el-checkbox-group v-model="formData.mainProduct.options" class="checkbox-group"
                  v-if="mainProductOptions.length > 0">
                  <el-checkbox v-for="(option, index) in mainProductOptions"
                    :key="`main-product-option-${option.id || index}-${index}-${option.name || ''}`" :label="option.id">
                    <div class="option-item">
                      <span class="option-name">{{ getOptionDisplayName(option) }}</span>
                      <span class="option-amount">¥{{ option.amount || 0 }}</span>
                    </div>
                  </el-checkbox>
                </el-checkbox-group>
                <div v-if="mainProductOptions.length === 0" class="no-options"
                  :class="{ 'no-category': !formData.mainProduct.category }">
                  <span v-if="!formData.mainProduct.category">请先选择产品品类</span>
                  <span v-else>暂无可选项</span>
                </div>
              </el-form-item>



              <!-- 线缆 -->
              <el-form-item label="线缆">
                <div class="cable-config">
                  <!-- 线缆类型 -->
                  <div class="cable-supplier">
                    <el-radio-group v-model="formData.mainProduct.cableSupplier" class="supplier-radio">
                      <el-radio :label="1">迪太提供</el-radio>
                      <el-radio :label="2">客供线缆</el-radio>
                    </el-radio-group>
                  </div>

                  <!-- 线缆详细配置 - 只有选择客供线缆时才显示 -->
                  <div class="cable-details" v-if="formData.mainProduct.cableSupplier === 2">
                    <el-form-item prop="cableSupplierName" class="cable-detail-item">
                      <label class="cable-label">供应商：</label>
                      <el-select v-model="formData.mainProduct.cableSupplierName" class="cable-select"
                        placeholder="请选择供应商">
                        <el-option v-for="(supplier, index) in supplierOptions"
                          :key="`main-supplier-${supplier.dictCode || index}-${index}-${supplier.dictLabel}`"
                          :label="supplier.dictLabel" :value="supplier.dictCode">
                        </el-option>
                      </el-select>
                    </el-form-item>

                    <el-form-item prop="waterproofHeadModel" class="cable-detail-item">
                      <label class="cable-label">防水头型号：</label>
                      <el-select v-model="formData.mainProduct.waterproofHeadModel" class="cable-select"
                        placeholder="请选择防水头型号" :disabled="!formData.mainProduct.cableSupplierName">
                        <el-option v-for="(option, index) in waterproofHeadOptions"
                          :key="`main-waterproof-${option.id || index}-${index}-${option.cableModel}`"
                          :label="option.cableModel" :value="option.cableModel">
                        </el-option>
                      </el-select>
                    </el-form-item>

                    <el-form-item prop="cableLength" class="cable-detail-item">
                      <label class="cable-label">线长：</label>
                      <div class="input-with-unit">
                        <el-input-number v-model="formData.mainProduct.cableLength" :min="1" :max="10000000"
                          :step="1000" :controls="false" class="cable-length-input" placeholder="请输入线长" />
                      </div>
                      <span class="unit-text">mm</span>
                    </el-form-item>
                  </div>
                </div>
              </el-form-item>




              <!-- 费用分摊 -->
              <el-form-item label="费用分摊">
                <div class="mold-share-config">
                  <div class="share-items">
                    <!-- ID费用分摊 -->
                    <div class="share-item">
                      <div class="share-item-label">
                        <el-checkbox v-model="mainProductIdCostSharingEnabled"
                          @change="handleMainProductIdCostSharingChange">
                          <span class="share-label-text">ID费用分摊</span>
                        </el-checkbox>
                      </div>
                      <div class="input-with-unit" v-show="mainProductIdCostSharingEnabled">
                        <el-input-number v-model="formData.mainProduct.idCostSharingPcs" :min="1" :max="999999"
                          :step="1" :precision="0" :controls="false" size="small" style="width: 120px" />
                        <span class="unit-text">pcs</span>
                      </div>
                    </div>
                    <!-- 摸具费用分摊 -->
                    <div class="share-item">
                      <div class="share-item-label">
                        <el-checkbox v-model="mainProductAbrasiveCostSharingEnabled"
                          @change="handleMainProductAbrasiveCostSharingChange">
                          <span class="share-label-text">摸具费用分摊</span>
                        </el-checkbox>
                      </div>
                      <div class="input-with-unit" v-show="mainProductAbrasiveCostSharingEnabled">
                        <el-input-number v-model="formData.mainProduct.abrasiveCostSharingPcs" :min="1" :max="999999"
                          :step="1" :precision="0" :controls="false" size="small" style="width: 120px" />
                        <span class="unit-text">pcs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 右侧：按键配置 -->
        <div class="config-section">
          <div class="section-header">
            <h3>按键</h3>
          </div>
          <div class="section-content">
            <el-form :model="formData.button" :rules="buttonRules" ref="buttonForm" label-width="100px" size="small">
              <!-- 按键品类 -->
              <el-form-item label="按键品类" prop="category">
                <el-select v-model="formData.button.category" style="width: 100%" placeholder="请输入或选择按键品类"
                  :loading="loading" filterable remote :remote-method="searchButtonCategory"
                  :filter-method="filterButtonCategory" default-first-option>
                  <el-option v-for="(category, index) in filteredButtonCategories"
                    :key="`button-category-${category.id || index}-${index}-${category.name}`" :label="category.name"
                    :value="category.id">
                    <div class="category-option">
                      <el-image v-if="category.image" :src="category.image" class="category-image" fit="cover">
                        <div slot="error" class="image-slot">
                          <i class="el-icon-picture-outline"></i>
                        </div>
                      </el-image>
                      <div v-else class="category-image no-image">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                      <span class="category-name">{{ category.name }}</span>
                      <span v-if="category.code" class="category-code">{{ category.code }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>

              <!-- 选项 -->
              <el-form-item label="选项">
                <el-checkbox-group v-model="formData.button.options" class="checkbox-group"
                  v-if="buttonOptions.length > 0">
                  <el-checkbox v-for="(option, index) in buttonOptions"
                    :key="`button-option-${option.id || index}-${index}-${option.name || ''}`" :label="option.id">
                    <div class="option-item">
                      <span class="option-name">{{ getOptionDisplayName(option) }}</span>
                      <span class="option-amount">¥{{ option.amount || 0 }}</span>
                    </div>
                  </el-checkbox>
                </el-checkbox-group>
                <div v-if="buttonOptions.length === 0" class="no-options"
                  :class="{ 'no-category': !formData.button.category }">
                  <span v-if="!formData.button.category">请先选择按键品类</span>
                  <span v-else>暂无可选项</span>
                </div>
              </el-form-item>


              <!-- 线缆 -->
              <el-form-item label="线缆">
                <div class="cable-config">
                  <!-- 线缆类型 -->
                  <div class="cable-supplier">
                    <el-radio-group v-model="formData.button.cableSupplier" class="supplier-radio">
                      <el-radio :label="1">迪太提供</el-radio>
                      <el-radio :label="2">客供线缆</el-radio>
                    </el-radio-group>
                  </div>

                  <!-- 线缆详细配置 - 只有选择客供线缆时才显示 -->
                  <div class="cable-details" v-if="formData.button.cableSupplier === 2">
                    <el-form-item prop="cableSupplierName" class="cable-detail-item">
                      <label class="cable-label">供应商：</label>
                      <el-select v-model="formData.button.cableSupplierName" class="cable-select" placeholder="请选择供应商">
                        <el-option v-for="(supplier, index) in supplierOptions"
                          :key="`button-supplier-${supplier.dictCode || index}-${index}-${supplier.dictLabel}`"
                          :label="supplier.dictLabel" :value="supplier.dictCode">
                        </el-option>
                      </el-select>
                    </el-form-item>

                    <el-form-item prop="waterproofHeadModel" class="cable-detail-item">
                      <label class="cable-label">防水头型号：</label>
                      <el-select v-model="formData.button.waterproofHeadModel" class="cable-select"
                        placeholder="请选择防水头型号" :disabled="!formData.button.cableSupplierName">
                        <el-option v-for="(option, index) in waterproofHeadOptions"
                          :key="`button-waterproof-${option.id || index}-${index}-${option.cableModel}`"
                          :label="option.cableModel" :value="option.cableModel">
                        </el-option>
                      </el-select>
                      <div class="field-hint">(按键低分时选择)</div>
                    </el-form-item>

                    <el-form-item prop="cableLength" class="cable-detail-item">
                      <label class="cable-label">线长：</label>
                      <div class="input-with-unit">
                        <el-input-number v-model="formData.button.cableLength" :min="1" :max="10000000"
                          :controls="false" class="cable-length-input" placeholder="请输入线长" />
                      </div>
                      <span class="unit-text">mm</span>
                    </el-form-item>
                  </div>
                </div>
              </el-form-item>

              <!-- 费用分摊 -->
              <el-form-item label="费用分摊">
                <div class="mold-share-config">
                  <div class="share-items">
                    <!-- ID费用分摊 -->
                    <div class="share-item">
                      <div class="share-item-label">
                        <el-checkbox v-model="buttonIdCostSharingEnabled" @change="handleButtonIdCostSharingChange">
                          <span class="share-label-text">ID费用分摊</span>
                        </el-checkbox>
                      </div>
                      <div class="input-with-unit" v-show="buttonIdCostSharingEnabled">
                        <el-input-number v-model="formData.button.idCostSharingPcs" :min="1" :max="999999" :step="1"
                          :precision="0" :controls="false" size="small" style="width: 120px" />
                        <span class="unit-text">pcs</span>
                      </div>
                    </div>
                    <!-- 摸具费用分摊 -->
                    <div class="share-item">
                      <div class="share-item-label">
                        <el-checkbox v-model="buttonAbrasiveCostSharingEnabled"
                          @change="handleButtonAbrasiveCostSharingChange">
                          <span class="share-label-text">摸具费用分摊</span>
                        </el-checkbox>
                      </div>
                      <div class="input-with-unit" v-show="buttonAbrasiveCostSharingEnabled">
                        <el-input-number v-model="formData.button.abrasiveCostSharingPcs" :min="1" :max="999999"
                          :step="1" :precision="0" :controls="false" size="small" style="width: 120px" />
                        <span class="unit-text">pcs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>

      <!-- 其他配置 -->
      <div class="other-config">
        <div class="section-header">
          <h3>其他</h3>
        </div>
        <div class="section-content">
          <el-form :model="formData.other" :rules="otherRules" ref="otherForm" label-width="100px" size="small">
            <div class="form-row">
              <!-- 客户类型 -->
              <el-form-item label="客户类型" prop="customerType">
                <el-select v-model="formData.other.customerType" style="width: 150px" placeholder="请选择客户类型">
                  <el-option v-for="(customerType, index) in customerTypeList"
                    :key="`customer-type-${customerType.value}-${index}`" :label="customerType.label"
                    :value="customerType.value">
                  </el-option>
                </el-select>
              </el-form-item>

              <!-- 产品税率 -->
              <el-form-item label="产品税率" prop="productTaxRate">
                <el-select v-model="formData.other.productTaxRate" style="width: 150px" placeholder="请选择产品税率">
                  <el-option v-for="(taxRate, index) in productTaxRateList" :key="`tax-rate-${taxRate.value}-${index}`"
                    :label="`${taxRate.label}%`" :value="taxRate.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </div>

            <div class="form-row">
              <!-- 售后费用 -->
              <el-form-item label="售后费用" prop="afterSalesCost">
                <el-input v-model="formData.other.afterSalesCost" style="width: 150px" placeholder="请输入售后费用" readonly>
                  <template slot="append">%</template>
                </el-input>
              </el-form-item>

              <!-- 报价方式 -->
              <el-form-item label="报价方式" prop="quoteMethod">
                <el-radio-group v-model="formData.other.quoteMethod">
                  <el-radio label="RMB">人民币</el-radio>
                  <el-radio label="USD">美元</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>

            <div class="form-row">
              <!-- 汇率 -->
              <el-form-item label="汇率" prop="exchangeRate" v-if="formData.other.quoteMethod === 'USD'">
                <div class="input-with-unit">
                  <el-input-number v-model="formData.other.exchangeRate" :min="0.0001" :max="20" :precision="4"
                    :step="0.0001" :controls="false" style="width: 150px" placeholder="请输入汇率" />
                  <span class="unit-text">CNY/USD</span>
                </div>
                <div class="field-hint">选择美元报价时必须填写汇率</div>
              </el-form-item>
            </div>



            <!-- 备注描述 -->
            <el-form-item label="备注描述">
              <el-input v-model="formData.other.remark" type="textarea" :rows="3" placeholder="请输入备注信息..."
                maxlength="500" show-word-limit style="width: 100%" />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel" size="medium">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving" size="medium">
        {{ saving ? '保存中...' : '确定' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getCategoryList, saveQuotation, getCustomerTypes, getProductTaxRates, getAfterSalesRates, getDeviceCostByCategory, getCostCategoryDict, getCostProjectDict, getSupplierDict, getQuotationListByKey } from '@/api/quote-management/quotation'
import { getCableCostList } from '@/api/quote-management/cableCost'
export default {
  name: 'AddQuoteDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: null
    },
    temporaryKey: {
      type: String,
      default: ''
    },
    nextId: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      saving: false,
      loading: false,
      categoryList: [], // 品类列表
      filteredMainProductCategories: [], // 过滤后的主产品品类
      filteredButtonCategories: [], // 过滤后的按键品类
      customerTypeList: [], // 客户类型列表
      productTaxRateList: [], // 产品税率列表
      afterSalesRateList: [], // 售后费用列表
      mainProductOptions: [], // 主产品设备成本选项
      buttonOptions: [], // 按键设备成本选项
      costCategoryOptions: [], // 成本类型字典
      costProjectOptions: [], // 成本项字典
      supplierOptions: [], // 供应商字典
      waterproofHeadOptions: [], // 防水头型号选项

      // 缓存机制
      waterproofHeadCache: {}, // 防水头型号缓存 {supplierCode: options}
      deviceCostCache: {}, // 设备成本缓存 {categoryId: options}
      loadingStates: { // 加载状态
        waterproofHead: {},
        deviceCost: {}
      },
      isLoadingEditData: false, // 是否正在加载编辑数据
      formData: {
        mainProduct: {
          category: '',
          options: [],
          cableSupplier: null,
          cableSupplierName: '',
          waterproofHeadModel: '',
          cableLength: 5000000,
          isIdCostSharing: 0,
          idCostSharingPcs: null,
          isAbrasiveCostSharing: 0,
          abrasiveCostSharingPcs: null
        },
        button: {
          category: '',
          options: [],
          cableSupplier: null,
          cableSupplierName: '',
          waterproofHeadModel: '',
          cableLength: 1000,
          isIdCostSharing: 0,
          idCostSharingPcs: null,
          isAbrasiveCostSharing: 0,
          abrasiveCostSharingPcs: null
        },
        other: {
          customerType: '',
          productTaxRate: '',
          afterSalesCost: '',
          quoteMethod: '',
          exchangeRate: 7.2000, // 默认汇率
          remark: '' // 备注描述
        }
      },
      mainProductRules: {
        category: [
          { required: true, message: '请选择产品品类', trigger: 'change' }
        ],
        cableSupplierName: [
          {
            validator: (rule, value, callback) => {
              if (this.formData.mainProduct.cableSupplier === 2 && !value) {
                callback(new Error('选择客供线缆时，线缆供应商为必填'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ],
        waterproofHeadModel: [
          {
            validator: (rule, value, callback) => {
              if (this.formData.mainProduct.cableSupplier === 2 && !value) {
                callback(new Error('选择客供线缆时，防水头型号为必填'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ],
        cableLength: [
          {
            validator: (rule, value, callback) => {
              if (this.formData.mainProduct.cableSupplier === 2 && (!value || value <= 0)) {
                callback(new Error('选择客供线缆时，线长为必填且必须大于0'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      },
      buttonRules: {
        category: [
          { required: false, message: '请选择按键品类', trigger: 'change' }
        ],
        cableSupplierName: [
          {
            validator: (rule, value, callback) => {
              if (this.formData.button.cableSupplier === 2 && !value) {
                callback(new Error('选择客供线缆时，线缆供应商为必填'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ],
        waterproofHeadModel: [
          {
            validator: (rule, value, callback) => {
              if (this.formData.button.cableSupplier === 2 && !value) {
                callback(new Error('选择客供线缆时，防水头型号为必填'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ],
        cableLength: [
          {
            validator: (rule, value, callback) => {
              if (this.formData.button.cableSupplier === 2 && (!value || value <= 0)) {
                callback(new Error('选择客供线缆时，线长为必填且必须大于0'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      },
      otherRules: {
        customerType: [
          { required: true, message: '请选择客户类型', trigger: 'change' }
        ],
        productTaxRate: [
          { required: true, message: '请选择产品税率', trigger: 'change' }
        ],

        quoteMethod: [
          { required: true, message: '请选择报价方式', trigger: 'change' }
        ],
        exchangeRate: [
          {
            validator: (rule, value, callback) => {
              // 当选择美元时，汇率为必填
              if (this.formData.other.quoteMethod === 'USD') {
                if (!value || value <= 0) {
                  callback(new Error('选择美元报价时，汇率为必填项且必须大于0'))
                } else {
                  callback()
                }
              } else {
                // 选择人民币时，汇率不验证
                callback()
              }
            },
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  computed: {
    // 弹窗标题
    dialogTitle() {
      if (this.editData) {
        return `编辑报价单 (ID: ${this.editData.id})`
      } else {
        return `新增报价单 (ID: ${this.nextId})`
      }
    },

    // ID信息文本
    idInfoText() {
      if (this.editData) {
        return `正在编辑报价单，ID: ${this.editData.id}，保存时将更新现有记录`
      } else {
        return `正在新增报价单，将分配ID: ${this.nextId}，保存时将创建新记录`
      }
    },

    // 主产品摸具费用分摊启用状态
    mainProductAbrasiveCostSharingEnabled: {
      get() {
        return this.formData.mainProduct.isAbrasiveCostSharing === 1
      },
      set(value) {
        this.formData.mainProduct.isAbrasiveCostSharing = value ? 1 : 0
      }
    },
    // 主产品ID费用分摊启用状态
    mainProductIdCostSharingEnabled: {
      get() {
        return this.formData.mainProduct.isIdCostSharing === 1
      },
      set(value) {
        this.formData.mainProduct.isIdCostSharing = value ? 1 : 0
      }
    },
    // 按键摸具费用分摊启用状态
    buttonAbrasiveCostSharingEnabled: {
      get() {
        return this.formData.button.isAbrasiveCostSharing === 1
      },
      set(value) {
        this.formData.button.isAbrasiveCostSharing = value ? 1 : 0
      }
    },
    // 按键ID费用分摊启用状态
    buttonIdCostSharingEnabled: {
      get() {
        return this.formData.button.isIdCostSharing === 1
      },
      set(value) {
        this.formData.button.isIdCostSharing = value ? 1 : 0
      }
    }
  },
  mounted() {
    this.fetchCategoryList()
    this.fetchCustomerTypes()
    this.fetchProductTaxRates()
    this.fetchAfterSalesRates()
    this.fetchCostCategoryDict()
    this.fetchCostProjectDict()
    this.loadSupplierOptions()
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initializeForm()
      }
    },
    editData: {
      async handler(newVal) {
        // 只有在弹窗可见时才处理，避免重复初始化
        if (this.visible) {
          if (newVal) {
            await this.loadEditData(newVal)
          } else {
            this.resetForm()
          }
        }
      },
      immediate: false // 移除immediate，避免重复触发
    },
    // 监听主产品品类变化
    'formData.mainProduct.category': {
      handler(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.fetchMainProductOptions(newVal)
          // 只有在非编辑加载状态时才清空选项
          if (!this.isLoadingEditData) {
            this.formData.mainProduct.options = []
          }
        }
      }
    },
    // 监听按键品类变化
    'formData.button.category': {
      handler(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.fetchButtonOptions(newVal)
          // 只有在非编辑加载状态时才清空选项
          if (!this.isLoadingEditData) {
            this.formData.button.options = []
          }
        }
      }
    },
    // 监听主产品线缆供应商变化
    'formData.mainProduct.cableSupplier': {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          // 如果不是选择客供线缆，清空线缆供应商、防水头型号和线长
          if (newVal !== 2) {
            this.formData.mainProduct.cableSupplierName = ''
            this.formData.mainProduct.waterproofHeadModel = ''
            this.formData.mainProduct.cableLength = null
            this.waterproofHeadOptions = []
          }
          // 触发表单验证
          this.$nextTick(() => {
            if (this.$refs.mainProductForm) {
              this.$refs.mainProductForm.validateField(['cableSupplierName', 'waterproofHeadModel', 'cableLength'])
            }
          })
        }
      }
    },

    // 监听主产品供应商名称变化
    'formData.mainProduct.cableSupplierName': {
      async handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          console.log('主产品供应商名称变化:', oldVal, '->', newVal, '是否编辑回显中:', this.isLoadingEditData)

          // 编辑回显期间不清空防水头型号，避免回显失效
          if (!this.isLoadingEditData) {
            // 清空防水头型号
            console.log('清空主产品防水头型号')
            this.formData.mainProduct.waterproofHeadModel = ''
          } else {
            console.log('编辑回显中，跳过清空防水头型号')
          }

          // 根据新的供应商加载防水头型号选项
          await this.loadWaterproofHeadOptions(newVal)

          // 触发表单验证
          this.$nextTick(() => {
            if (this.$refs.mainProductForm) {
              this.$refs.mainProductForm.validateField(['waterproofHeadModel'])
            }
          })
        }
      }
    },
    // 监听按键线缆供应商变化
    'formData.button.cableSupplier': {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          // 如果不是选择客供线缆，清空线缆供应商、防水头型号和线长
          if (newVal !== 2) {
            this.formData.button.cableSupplierName = ''
            this.formData.button.waterproofHeadModel = ''
            this.formData.button.cableLength = null
            this.waterproofHeadOptions = []
          }
          // 触发表单验证
          this.$nextTick(() => {
            if (this.$refs.buttonForm) {
              this.$refs.buttonForm.validateField(['cableSupplierName', 'waterproofHeadModel', 'cableLength'])
            }
          })
        }
      }
    },

    // 监听按键供应商名称变化
    'formData.button.cableSupplierName': {
      async handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          console.log('按键供应商名称变化:', oldVal, '->', newVal, '是否编辑回显中:', this.isLoadingEditData)

          // 编辑回显期间不清空防水头型号，避免回显失效
          if (!this.isLoadingEditData) {
            // 清空防水头型号
            console.log('清空按键防水头型号')
            this.formData.button.waterproofHeadModel = ''
          } else {
            console.log('编辑回显中，跳过清空防水头型号')
          }

          // 根据新的供应商加载防水头型号选项
          await this.loadWaterproofHeadOptions(newVal)

          // 触发表单验证
          this.$nextTick(() => {
            if (this.$refs.buttonForm) {
              this.$refs.buttonForm.validateField(['waterproofHeadModel'])
            }
          })
        }
      }
    },

    // 监听报价方式变化
    'formData.other.quoteMethod': {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          // 当切换报价方式时，重新验证汇率字段
          this.$nextTick(() => {
            if (this.$refs.otherForm) {
              this.$refs.otherForm.validateField(['exchangeRate'])
            }
          })

          // 如果从美元切换到人民币，清空汇率
          if (oldVal === 'USD' && newVal === 'RMB') {
            this.formData.other.exchangeRate = null
          }
          // 如果切换到美元，且汇率为空或0，设置默认汇率
          else if (newVal === 'USD') {
            if (!this.formData.other.exchangeRate || this.formData.other.exchangeRate <= 0) {
              this.formData.other.exchangeRate = 7.2 // 设置默认汇率
            }
          }
        }
      }
    }
  },
  methods: {
    // 获取品类列表
    async fetchCategoryList() {
      try {
        this.loading = true
        const response = await getCategoryList()
        if (response.code === 200) {
          this.categoryList = response.data || []
          // 初始化过滤数据
          this.filteredMainProductCategories = [...this.categoryList]
          this.filteredButtonCategories = [...this.categoryList]
        } else {
          this.$message.error(response.msg || '获取品类列表失败')
        }
      } catch (error) {
        console.error('获取品类列表失败:', error)
        this.$message.error('获取品类列表失败')
      } finally {
        this.loading = false
      }
    },

    // 获取客户类型列表
    async fetchCustomerTypes() {
      try {
        const response = await getCustomerTypes()
        if (response.code === 200) {
          // 转换字典数据格式，使用dictCode作为value
          this.customerTypeList = (response.data || []).map(item => ({
            value: item.dictCode,
            label: item.dictLabel
          }))
        } else {
          this.$message.error(response.msg || '获取客户类型列表失败')
        }
      } catch (error) {
        console.error('获取客户类型列表失败:', error)
        this.$message.error('获取客户类型列表失败')
      }
    },

    // 获取产品税率列表
    async fetchProductTaxRates() {
      try {
        const response = await getProductTaxRates()
        if (response.code === 200) {
          // 转换字典数据格式，使用dictCode作为value
          this.productTaxRateList = (response.data || []).map(item => ({
            value: item.dictCode,
            label: item.dictLabel
          }))
        } else {
          this.$message.error(response.msg || '获取产品税率列表失败')
        }
      } catch (error) {
        console.error('获取产品税率列表失败:', error)
        this.$message.error('获取产品税率列表失败')
      }
    },

    // 获取售后费用列表
    async fetchAfterSalesRates() {
      try {
        const response = await getAfterSalesRates()
        if (response.code === 200) {
          // 转换字典数据格式，使用dictCode作为value
          this.afterSalesRateList = (response.data || []).map(item => ({
            value: item.dictCode,
            label: item.dictLabel
          }))
        } else {
          this.$message.error(response.msg || '获取售后费用列表失败')
        }
      } catch (error) {
        console.error('获取售后费用列表失败:', error)
        this.$message.error('获取售后费用列表失败')
      }
    },

    // 获取成本类型字典
    async fetchCostCategoryDict() {
      try {
        const response = await getCostCategoryDict()
        if (response.code === 200) {
          // 转换字典数据格式，使用dictCode作为匹配键
          this.costCategoryOptions = (response.data || []).map(item => ({
            code: item.dictCode,
            value: parseInt(item.dictValue),
            label: item.dictLabel
          }))
        } else {
          this.$message.error(response.msg || '获取成本类型字典失败')
        }
      } catch (error) {
        console.error('获取成本类型字典失败:', error)
        this.$message.error('获取成本类型字典失败')
      }
    },

    // 获取成本项字典
    async fetchCostProjectDict() {
      try {
        const response = await getCostProjectDict()
        if (response.code === 200) {
          // 转换字典数据格式，使用dictCode作为匹配键
          this.costProjectOptions = (response.data || []).map(item => ({
            code: item.dictCode,
            value: parseInt(item.dictValue),
            label: item.dictLabel
          }))
        } else {
          this.$message.error(response.msg || '获取成本项字典失败')
        }
      } catch (error) {
        console.error('获取成本项字典失败:', error)
        this.$message.error('获取成本项字典失败')
      }
    },

    // 加载供应商选项
    loadSupplierOptions() {
      console.log('开始加载供应商字典数据...')
      getSupplierDict().then(res => {
        console.log('供应商字典API响应:', res)
        if (res.code === 200) {
          this.supplierOptions = res.data || []
          console.log('供应商选项数据:', this.supplierOptions)
        } else {
          console.error('获取供应商数据失败:', res.msg)
          this.$message.error(res.msg || '获取供应商数据失败')
        }
      }).catch(error => {
        console.error('供应商字典API调用失败:', error)
        this.$message.error('获取供应商数据失败')
      })
    },

    // 根据供应商加载防水头型号选项
    async loadWaterproofHeadOptions(supplierCode) {
      if (!supplierCode) {
        this.waterproofHeadOptions = []
        return Promise.resolve()
      }

      // 检查缓存
      if (this.waterproofHeadCache[supplierCode]) {
        console.log('使用缓存的防水头型号数据，供应商:', supplierCode)
        this.waterproofHeadOptions = this.waterproofHeadCache[supplierCode]
        return Promise.resolve()
      }

      // 检查是否正在加载
      if (this.loadingStates.waterproofHead[supplierCode]) {
        console.log('防水头型号数据正在加载中，供应商:', supplierCode)
        // 等待正在进行的加载完成
        return new Promise(resolve => {
          const checkLoading = () => {
            if (!this.loadingStates.waterproofHead[supplierCode]) {
              resolve()
            } else {
              setTimeout(checkLoading, 100)
            }
          }
          checkLoading()
        })
      }

      console.log('开始加载防水头型号数据，供应商:', supplierCode)
      this.loadingStates.waterproofHead[supplierCode] = true

      const params = {
        supplier: supplierCode,
        pageNum: 999,
        pageSize: 999
      }

      try {
        const res = await getCableCostList(params)
        console.log('防水头型号API响应:', res)
        if (res.code === 200) {
          const options = res.data?.list || []
          // 缓存数据
          this.waterproofHeadCache[supplierCode] = options
          this.waterproofHeadOptions = options
          console.log('防水头型号选项数据已缓存:', options.length, '条')
        } else {
          console.error('获取防水头型号数据失败:', res.msg)
          this.$message.error(res.msg || '获取防水头型号数据失败')
        }
      } catch (error) {
        console.error('防水头型号API调用失败:', error)
        this.$message.error('获取防水头型号数据失败')
      } finally {
        this.loadingStates.waterproofHead[supplierCode] = false
      }
    },

    // 根据临时key查询报价单列表
    loadQuotationListByKey() {
      if (!this.temporaryKey) {
        console.warn('临时key不存在，无法查询报价单列表')
        return
      }

      console.log('根据临时key查询报价单列表:', this.temporaryKey)
      getQuotationListByKey(this.temporaryKey).then(res => {
        console.log('报价单列表API响应:', res)
        if (res.code === 200) {
          const quotationList = res.data || []
          console.log('报价单列表数据:', quotationList)
          // 这里可以根据需要处理返回的报价单列表
          // 例如：显示在界面上、进行数据对比等
        } else {
          console.error('获取报价单列表失败:', res.msg)
        }
      }).catch(error => {
        console.error('报价单列表API调用失败:', error)
      })
    },

    // 获取主产品设备成本选项
    async fetchMainProductOptions(categoryId) {
      if (!categoryId) return

      // 检查缓存
      if (this.deviceCostCache[categoryId]) {
        console.log('使用缓存的主产品选项数据，品类ID:', categoryId)
        this.mainProductOptions = this.deviceCostCache[categoryId]
        return
      }

      // 检查是否正在加载
      if (this.loadingStates.deviceCost[categoryId]) {
        console.log('主产品选项数据正在加载中，品类ID:', categoryId)
        return
      }

      try {
        console.log('开始加载主产品选项数据，品类ID:', categoryId)
        this.loadingStates.deviceCost[categoryId] = true

        const response = await getDeviceCostByCategory(categoryId)
        if (response.code === 200) {
          const options = response.data || []
          // 缓存数据
          this.deviceCostCache[categoryId] = options
          this.mainProductOptions = options
          console.log('主产品选项数据已缓存:', options.length, '条')
        } else {
          this.$message.error(response.msg || '获取主产品选项失败')
        }
      } catch (error) {
        console.error('获取主产品选项失败:', error)
        this.$message.error('获取主产品选项失败')
      } finally {
        this.loadingStates.deviceCost[categoryId] = false
      }
    },

    // 获取按键设备成本选项
    async fetchButtonOptions(categoryId) {
      if (!categoryId) return

      // 检查缓存
      if (this.deviceCostCache[categoryId]) {
        console.log('使用缓存的按键选项数据，品类ID:', categoryId)
        this.buttonOptions = this.deviceCostCache[categoryId]
        return
      }

      // 检查是否正在加载
      if (this.loadingStates.deviceCost[categoryId]) {
        console.log('按键选项数据正在加载中，品类ID:', categoryId)
        return
      }

      try {
        console.log('开始加载按键选项数据，品类ID:', categoryId)
        this.loadingStates.deviceCost[categoryId] = true

        const response = await getDeviceCostByCategory(categoryId)
        if (response.code === 200) {
          const options = response.data || []
          // 缓存数据
          this.deviceCostCache[categoryId] = options
          this.buttonOptions = options
          console.log('按键选项数据已缓存:', options.length, '条')
        } else {
          this.$message.error(response.msg || '获取按键选项失败')
        }
      } catch (error) {
        console.error('获取按键选项失败:', error)
        this.$message.error('获取按键选项失败')
      } finally {
        this.loadingStates.deviceCost[categoryId] = false
      }
    },

    // 主产品品类搜索
    searchMainProductCategory(query) {
      if (query !== '') {
        this.filteredMainProductCategories = this.categoryList.filter(category => {
          return this.matchCategory(category, query)
        })
      } else {
        this.filteredMainProductCategories = [...this.categoryList]
      }
    },

    // 主产品品类过滤
    filterMainProductCategory(query) {
      if (query !== '') {
        this.filteredMainProductCategories = this.categoryList.filter(category => {
          return this.matchCategory(category, query)
        })
      } else {
        this.filteredMainProductCategories = [...this.categoryList]
      }
    },

    // 按键品类搜索
    searchButtonCategory(query) {
      if (query !== '') {
        this.filteredButtonCategories = this.categoryList.filter(category => {
          return this.matchCategory(category, query)
        })
      } else {
        this.filteredButtonCategories = [...this.categoryList]
      }
    },

    // 按键品类过滤
    filterButtonCategory(query) {
      if (query !== '') {
        this.filteredButtonCategories = this.categoryList.filter(category => {
          return this.matchCategory(category, query)
        })
      } else {
        this.filteredButtonCategories = [...this.categoryList]
      }
    },

    // 品类匹配逻辑
    matchCategory(category, query) {
      const searchQuery = query.toLowerCase()

      // 匹配名称
      if (category.name && category.name.toLowerCase().includes(searchQuery)) {
        return true
      }

      // 匹配编码
      if (category.code && category.code.toLowerCase().includes(searchQuery)) {
        return true
      }

      // 匹配拼音首字母
      if (category.pinyin && category.pinyin.toLowerCase().includes(searchQuery)) {
        return true
      }

      // 匹配描述
      if (category.description && category.description.toLowerCase().includes(searchQuery)) {
        return true
      }

      return false
    },

    // 初始化表单
    async initializeForm() {
      if (this.editData) {
        await this.loadEditData(this.editData)
      } else {
        this.resetForm()
      }
      this.$nextTick(() => {
        this.resetValidation()
      })
    },

    // 加载编辑数据
    async loadEditData(data) {
      if (!data) return

      // 检查数据格式，如果是API返回的格式，需要转换
      if (data.list && Array.isArray(data.list)) {
        // API格式数据，需要转换为formData格式
        await this.convertApiDataToFormData(data)
      } else {
        // 已经是formData格式，直接使用
        this.formData = JSON.parse(JSON.stringify(data))
      }
    },

    // 将API数据转换为formData格式
    async convertApiDataToFormData(apiData) {
      // 设置加载状态
      this.isLoadingEditData = true

      // 重置表单数据
      this.resetForm()

      // 解析list数据
      const mainProduct = apiData.list.find(item => item.productType === 1) || {}
      const button = apiData.list.find(item => item.productType === 2) || {}

      // 设置其他数据（不依赖异步加载的数据）
      this.formData.other.customerType = apiData.customerType || ''
      this.formData.other.productTaxRate = apiData.productTaxRate || ''
      this.formData.other.afterSalesCost = apiData.afterSalesRate || ''
      this.formData.other.quoteMethod = apiData.quotationType === 1 ? 'RMB' : 'USD'
      this.formData.other.exchangeRate = apiData.exchangeRate || 7.2000
      this.formData.other.remark = apiData.remark || ''

      // 设置主产品数据
      if (mainProduct.categoryId) {
        // 首先设置category并等待选项加载完成
        this.formData.mainProduct.category = mainProduct.categoryId

        // 等待选项列表加载完成
        await this.fetchMainProductOptions(mainProduct.categoryId)

        // 然后设置选中的选项
        this.$nextTick(() => {
          this.formData.mainProduct.options = mainProduct.deviceOptional || []

        })

        // 设置其他主产品属性
        this.formData.mainProduct.cableSupplier = mainProduct.cableType || null
        this.formData.mainProduct.cableLength = mainProduct.cableLong || 5000000
        this.formData.mainProduct.isIdCostSharing = mainProduct.isIdCostSharing || 0
        this.formData.mainProduct.idCostSharingPcs = mainProduct.idCostSharingPcs
        this.formData.mainProduct.isAbrasiveCostSharing = mainProduct.isAbrasiveCostSharing || 0
        this.formData.mainProduct.abrasiveCostSharingPcs = mainProduct.abrasiveCostSharingPcs

        // 根据cableId设置供应商和防水头型号
        await this.setCableInfoFromId(mainProduct.cableId, 'mainProduct')
      }

      // 设置按键数据
      if (button.categoryId) {
        // 首先设置category并等待选项加载完成
        this.formData.button.category = button.categoryId

        // 等待选项列表加载完成
        await this.fetchButtonOptions(button.categoryId)

        // 然后设置选中的选项
        this.$nextTick(() => {
          this.formData.button.options = button.deviceOptional || []

        })

        // 设置其他按键属性
        this.formData.button.cableSupplier = button.cableType || null
        this.formData.button.cableLength = button.cableLong || 1000
        this.formData.button.isIdCostSharing = button.isIdCostSharing || 0
        this.formData.button.idCostSharingPcs = button.idCostSharingPcs
        this.formData.button.isAbrasiveCostSharing = button.isAbrasiveCostSharing || 0
        this.formData.button.abrasiveCostSharingPcs = button.abrasiveCostSharingPcs

        // 根据cableId设置供应商和防水头型号
        await this.setCableInfoFromId(button.cableId, 'button')
      }

      // 清除加载状态
      this.isLoadingEditData = false
    },

    // 重置表单
    resetForm() {
      this.saving = false
      this.formData = {
        mainProduct: {
          category: '',
          options: [],
          cableSupplier: null,
          cableSupplierName: '',
          waterproofHeadModel: '',
          cableLength: 5000000,
          isIdCostSharing: 0,
          idCostSharingPcs: null,
          isAbrasiveCostSharing: 0,
          abrasiveCostSharingPcs: null
        },
        button: {
          category: '',
          options: [],
          cableSupplier: null,
          cableSupplierName: '',
          waterproofHeadModel: '',
          cableLength: 1000,
          isIdCostSharing: 0,
          idCostSharingPcs: null,
          isAbrasiveCostSharing: 0,
          abrasiveCostSharingPcs: null
        },
        other: {
          customerType: '',
          productTaxRate: '',
          afterSalesCost: '',
          quoteMethod: 'RMB', // 默认选择人民币
          exchangeRate: null, // 默认汇率为空
          remark: '' // 备注描述
        }
      }
    },

    // 重置表单验证
    resetValidation() {
      if (this.$refs.mainProductForm) this.$refs.mainProductForm.clearValidate()
      if (this.$refs.buttonForm) this.$refs.buttonForm.clearValidate()
      if (this.$refs.otherForm) this.$refs.otherForm.clearValidate()
    },

    // 处理弹窗可见性变化
    handleVisibleChange(val) {
      this.$emit('update:visible', val)
    },

    // 关闭前确认
    handleBeforeClose(done) {
      if (this.saving) {
        this.$message.warning('正在保存中，请稍候...')
        return
      }

      if (this.hasUnsavedChanges()) {
        this.$confirm('有未保存的更改，确定要关闭吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          done()
        }).catch(() => { })
      } else {
        done()
      }
    },

    // 检查是否有未保存的更改
    hasUnsavedChanges() {
      // 如果是编辑模式，比较与原始数据的差异
      if (this.editData) {
        return JSON.stringify(this.formData) !== JSON.stringify(this.editData)
      }

      // 如果是新增模式，检查是否有填写内容
      const hasMainProductConfig = this.formData.mainProduct.options.length > 0 ||
        this.formData.mainProduct.category

      const hasButtonConfig = this.formData.button.options.length > 0 ||
        this.formData.button.category

      return hasMainProductConfig || hasButtonConfig
    },

    // 取消操作
    handleCancel() {
      this.$emit('update:visible', false)
    },

    // 保存操作
    async handleSave() {
      try {
        // 表单验证
        const valid = await this.validateForm()
        if (!valid) return

        this.saving = true

        // 构建API数据格式
        const apiData = this.buildApiData()

        // 调用API保存数据
        const response = await saveQuotation(apiData)

        if (response.code === 200) {
          this.$message.success('保存成功')
          // 触发保存事件，传递返回的数据
          this.$emit('save', response.data)
          // 关闭弹窗
          this.$emit('update:visible', false)
          this.resetForm()
        } else {
          this.$message.error(response.msg || '保存失败')
        }
      } catch (error) {
        console.error('保存失败:', error)
        this.$message.error('保存失败，请重试')
      } finally {
        this.saving = false
      }
    },

    // 构建API数据格式
    buildApiData() {
      const { mainProduct, button, other } = this.formData

      // 构建报价单产品列表
      const list = []

      // 主产品
      if (mainProduct.category) {
        const mainProductItem = {
          categoryId: mainProduct.category,
          productType: 1, // 1主产品
          deviceOptional: mainProduct.options || [],
          cableId: this.findCableId(mainProduct.cableSupplierName, mainProduct.waterproofHeadModel), // 根据供应商和防水头查找线缆ID
          cableLong: mainProduct.cableLength ? parseInt(mainProduct.cableLength) : null,
          cableType: mainProduct.cableSupplier || null, // 1迪太提供 2客供线缆
          supplierCode: mainProduct.cableSupplierName || null, // 供应商代码
          wireType: 1, // 默认普通线，需要根据实际选择调整
          isIdCostSharing: mainProduct.isIdCostSharing,
          idCostSharingPcs: mainProduct.idCostSharingPcs,
          isAbrasiveCostSharing: mainProduct.isAbrasiveCostSharing,
          abrasiveCostSharingPcs: mainProduct.abrasiveCostSharingPcs
        }
        list.push(mainProductItem)
      }

      // 按键产品
      if (button.category) {
        const buttonItem = {
          categoryId: button.category,
          productType: 2, // 2按键
          deviceOptional: button.options || [],
          cableId: this.findCableId(button.cableSupplierName, button.waterproofHeadModel), // 根据供应商和防水头查找线缆ID
          cableLong: button.cableLength ? parseInt(button.cableLength) : null,
          cableType: button.cableSupplier || null,
          supplierCode: button.cableSupplierName || null, // 供应商代码
          wireType: 1, // 默认普通线
          isIdCostSharing: button.isIdCostSharing,
          idCostSharingPcs: button.idCostSharingPcs,
          isAbrasiveCostSharing: button.isAbrasiveCostSharing,
          abrasiveCostSharingPcs: button.abrasiveCostSharingPcs
        }
        list.push(buttonItem)
      }

      // 构建主报价单对象
      const quotationData = {
        id: this.editData ? this.editData.id : this.nextId, // 编辑时使用原ID，新增时使用nextId
        key: this.temporaryKey, // 使用props传入的临时key
        model: this.generateModel(), // 自动生成产品型号
        standardSpec: this.buildStandardSpec(),
        standardSpecEn: this.buildStandardSpecEn(), // 英文版规格描述
        quotationType: other.quoteMethod === 'RMB' ? 1 : 2, // 1人民币 2美元
        customerType: this.getCustomerTypeValue(other.customerType),
        exchangeRate: other.exchangeRate || null,
        productTaxRate: other.productTaxRate ? Number(other.productTaxRate) : null,
        afterSalesRate: other.afterSalesCost || null,
        remark: other.remark || '',
        list: list
      }

      return quotationData
    },

    // 构建标准规格描述
    buildStandardSpec() {
      const { mainProduct, button } = this.formData
      const specs = []

      // 主产品规格
      if (mainProduct.category) {
        const categoryName = this.getCategoryName(mainProduct.category)
        if (categoryName) {
          specs.push(`主产品: ${categoryName}`)
        }

        if (mainProduct.options && mainProduct.options.length > 0) {
          const optionNames = this.getOptionNames(mainProduct.options, 'mainProduct')
          specs.push(`选项: ${optionNames.join(', ')}`)
        }

        // 主产品线缆信息
        if (mainProduct.cableLength || mainProduct.cableSupplier) {
          const cableSpecs = []
          if (mainProduct.cableLength) cableSpecs.push(`长度${mainProduct.cableLength}mm`)
          if (mainProduct.cableSupplier) {
            const supplierName = mainProduct.cableSupplier === 1 ? '迪太' : '客供'
            cableSpecs.push(`${supplierName}提供`)
          }
          if (mainProduct.waterproofHeadModel) cableSpecs.push(`防水头${mainProduct.waterproofHeadModel}`)

          if (cableSpecs.length > 0) {
            specs.push(`主产品线缆: ${cableSpecs.join(', ')}`)
          }
        }
      }

      // 按键规格
      if (button.category) {
        const categoryName = this.getCategoryName(button.category)
        if (categoryName) {
          specs.push(`按键: ${categoryName}`)
        }

        if (button.options && button.options.length > 0) {
          const optionNames = this.getOptionNames(button.options, 'button')
          specs.push(`按键选项: ${optionNames.join(', ')}`)
        }

        // 按键线缆信息
        if (button.cableLength || button.cableSupplier) {
          const cableSpecs = []
          if (button.cableLength) cableSpecs.push(`长度${button.cableLength}mm`)
          if (button.cableSupplier) {
            const supplierName = button.cableSupplier === 1 ? '迪太' : '客供'
            cableSpecs.push(`${supplierName}提供`)
          }
          if (button.waterproofHeadModel) cableSpecs.push(`防水头${button.waterproofHeadModel}`)

          if (cableSpecs.length > 0) {
            specs.push(`按键线缆: ${cableSpecs.join(', ')}`)
          }
        }
      }

      return specs.join(' | ')
    },

    // 构建英文标准规格描述（只有选项名称使用英文，其他保持中文）
    buildStandardSpecEn() {
      const { mainProduct, button } = this.formData
      const specs = []

      // 主产品规格
      if (mainProduct.category) {
        const categoryName = this.getCategoryName(mainProduct.category) // 使用中文名称
        if (categoryName) {
          specs.push(`主产品: ${categoryName}`)
        }

        if (mainProduct.options && mainProduct.options.length > 0) {
          const optionNames = this.getOptionNamesEn(mainProduct.options, 'mainProduct') // 只有选项使用英文
          specs.push(`选项: ${optionNames.join(', ')}`)
        }

        // 主产品线缆信息
        if (mainProduct.cableLength || mainProduct.cableSupplier) {
          const cableSpecs = []
          if (mainProduct.cableLength) cableSpecs.push(`长度${mainProduct.cableLength}mm`)
          if (mainProduct.cableSupplier) {
            const supplierName = mainProduct.cableSupplier === 1 ? '迪太' : '客供'
            cableSpecs.push(`${supplierName}提供`)
          }
          if (mainProduct.waterproofHeadModel) cableSpecs.push(`防水头${mainProduct.waterproofHeadModel}`)

          if (cableSpecs.length > 0) {
            specs.push(`主产品线缆: ${cableSpecs.join(', ')}`)
          }
        }
      }

      // 按键规格
      if (button.category) {
        const categoryName = this.getCategoryName(button.category) // 使用中文名称
        if (categoryName) {
          specs.push(`按键: ${categoryName}`)
        }

        if (button.options && button.options.length > 0) {
          const optionNames = this.getOptionNamesEn(button.options, 'button') // 只有选项使用英文
          specs.push(`按键选项: ${optionNames.join(', ')}`)
        }

        // 按键线缆信息
        if (button.cableLength || button.cableSupplier) {
          const cableSpecs = []
          if (button.cableLength) cableSpecs.push(`长度${button.cableLength}mm`)
          if (button.cableSupplier) {
            const supplierName = button.cableSupplier === 1 ? '迪太' : '客供'
            cableSpecs.push(`${supplierName}提供`)
          }
          if (button.waterproofHeadModel) cableSpecs.push(`防水头${button.waterproofHeadModel}`)

          if (cableSpecs.length > 0) {
            specs.push(`按键线缆: ${cableSpecs.join(', ')}`)
          }
        }
      }

      return specs.join(' | ')
    },

    // 获取品类名称
    getCategoryName(categoryId) {
      const category = this.categoryList.find(cat => cat.id === categoryId)
      return category ? category.name : ''
    },



    // 获取选项名称列表
    getOptionNames(optionIds, productType) {
      if (!optionIds || optionIds.length === 0) return []

      // 根据产品类型选择对应的选项列表
      const optionsList = productType === 'mainProduct' ? this.mainProductOptions : this.buttonOptions

      return optionIds.map(optionId => {
        const option = optionsList.find(opt => opt.id === optionId)
        if (option) {
          // 使用getOptionDisplayName方法获取显示名称
          return this.getOptionDisplayName(option)
        } else {
          // 如果找不到对应选项，返回ID（避免显示空白）
          return optionId
        }
      }).filter(name => name) // 过滤掉空值
    },

    // 获取英文选项名称列表
    getOptionNamesEn(optionIds, productType) {
      if (!optionIds || optionIds.length === 0) return []

      // 根据产品类型选择对应的选项列表
      const optionsList = productType === 'mainProduct' ? this.mainProductOptions : this.buttonOptions

      return optionIds.map(optionId => {
        const option = optionsList.find(opt => opt.id === optionId)
        if (option) {
          // 使用getOptionDisplayNameEn方法获取英文显示名称
          return this.getOptionDisplayNameEn(option)
        } else {
          // 如果找不到对应选项，返回ID（避免显示空白）
          return optionId
        }
      }).filter(name => name) // 过滤掉空值
    },

    // 自动生成产品型号
    generateModel() {
      const { mainProduct, button } = this.formData
      const parts = []

      // 主产品品类
      if (mainProduct.category) {
        const categoryName = this.getCategoryName(mainProduct.category)
        if (categoryName) {
          parts.push(categoryName)
        }
      }

      // 按键品类
      if (button.category) {
        const categoryName = this.getCategoryName(button.category)
        if (categoryName) {
          parts.push(`BTN-${categoryName}`)
        }
      }

      // 如果没有选择任何品类，返回默认型号
      if (parts.length === 0) {
        return `MODEL-${Date.now()}`
      }

      return parts.join('-')
    },

    // 获取客户类型名称
    getCustomerTypeName(customerTypeValue) {
      const customerType = this.customerTypeList.find(item => item.value === customerTypeValue)
      return customerType ? customerType.label : ''
    },

    // 获取选项显示名称
    getOptionDisplayName(option) {
      // 从字典数据中获取成本类型和成本项的显示名称
      // 尝试多种匹配方式
      let costCategoryItem = this.costCategoryOptions.find(item => item.value === option.costCategory)
      if (!costCategoryItem) {
        // 如果按value匹配不到，尝试按code匹配
        costCategoryItem = this.costCategoryOptions.find(item => item.code === option.costCategory)
      }
      if (!costCategoryItem) {
        // 如果还是匹配不到，尝试字符串匹配
        costCategoryItem = this.costCategoryOptions.find(item => item.value === String(option.costCategory))
      }

      let costProjectItem = this.costProjectOptions.find(item => item.value === option.costProject)
      if (!costProjectItem) {
        // 如果按value匹配不到，尝试按code匹配
        costProjectItem = this.costProjectOptions.find(item => item.code === option.costProject)
      }
      if (!costProjectItem) {
        // 如果还是匹配不到，尝试字符串匹配
        costProjectItem = this.costProjectOptions.find(item => item.value === String(option.costProject))
      }

      const categoryName = costCategoryItem ? costCategoryItem.label : `未知类型(${option.costCategory})`
      const projectName = costProjectItem ? costProjectItem.label : `未知项目(${option.costProject})`

      return `${categoryName}-${projectName}`
    },

    // 获取选项英文显示名称
    getOptionDisplayNameEn(option) {
      // 从字典数据中获取成本类型和成本项的英文显示名称（使用remark字段）
      // 尝试多种匹配方式
      let costCategoryItem = this.costCategoryOptions.find(item => item.value === option.costCategory)
      if (!costCategoryItem) {
        // 如果按value匹配不到，尝试按code匹配
        costCategoryItem = this.costCategoryOptions.find(item => item.code === option.costCategory)
      }
      if (!costCategoryItem) {
        // 如果还是匹配不到，尝试字符串匹配
        costCategoryItem = this.costCategoryOptions.find(item => item.value === String(option.costCategory))
      }

      let costProjectItem = this.costProjectOptions.find(item => item.value === option.costProject)
      if (!costProjectItem) {
        // 如果按value匹配不到，尝试按code匹配
        costProjectItem = this.costProjectOptions.find(item => item.code === option.costProject)
      }
      if (!costProjectItem) {
        // 如果还是匹配不到，尝试字符串匹配
        costProjectItem = this.costProjectOptions.find(item => item.value === String(option.costProject))
      }

      // 使用remark字段获取英文名称，如果没有remark则使用label作为后备
      const categoryNameEn = costCategoryItem ? (costCategoryItem.remark || costCategoryItem.label || `Unknown Type(${option.costCategory})`) : `Unknown Type(${option.costCategory})`
      const projectNameEn = costProjectItem ? (costProjectItem.remark || costProjectItem.label || `Unknown Project(${option.costProject})`) : `Unknown Project(${option.costProject})`

      return `${categoryNameEn}-${projectNameEn}`
    },

    // 获取客户类型数值
    getCustomerTypeValue(customerType) {
      // 如果customerType已经是数值，直接返回
      if (typeof customerType === 'number') {
        return customerType
      }

      // 字典值通常是字符串，需要转换为数值
      if (customerType) {
        return parseInt(customerType)
      }

      return null
    },

    // 根据供应商和防水头型号查找线缆ID
    findCableId(supplierName, waterproofHeadModel) {
      // 如果是迪太提供或没有供应商/防水头信息，不需要cableId
      if (!supplierName || !waterproofHeadModel) {
        return null
      }

      // 在防水头选项中查找对应的ID
      const cableOption = this.waterproofHeadOptions.find(option =>
        option.cableModel === waterproofHeadModel
      )



      return cableOption ? cableOption.id : null
    },

    // 根据cableId设置防水头信息  
    async setCableInfoFromId(cableId, productType) {
      if (!cableId) return

      try {
        // 首先尝试从当前防水头选项中查找
        let cableInfo = this.waterproofHeadOptions.find(option => option.id === cableId)

        // 如果当前选项中没有找到，可能需要遍历所有供应商来查找
        if (!cableInfo) {
          console.log('在当前防水头选项中未找到cableId:', cableId, '尝试遍历所有供应商')

          // 遍历所有供应商来查找对应的cableId
          for (const supplier of this.supplierOptions) {
            const supplierCode = supplier.dictCode
            console.log('正在查找供应商:', supplierCode)

            try {
              // 加载该供应商的防水头选项
              const params = {
                supplier: supplierCode,
                pageNum: 999,
                pageSize: 999
              }

              const res = await getCableCostList(params)
              if (res.code === 200) {
                const cableOptions = res.data?.list || []
                cableInfo = cableOptions.find(option => option.id === cableId)

                if (cableInfo) {
                  console.log('找到防水头信息:', cableInfo, '供应商:', supplierCode)

                  // 设置找到的供应商
                  if (productType === 'mainProduct') {
                    console.log('设置主产品供应商:', supplierCode)
                    this.formData.mainProduct.cableSupplierName = supplierCode
                  } else if (productType === 'button') {
                    console.log('设置按键供应商:', supplierCode)
                    this.formData.button.cableSupplierName = supplierCode
                  }

                  // 重新加载该供应商的防水头选项
                  console.log('开始加载供应商防水头选项:', supplierCode)
                  await this.loadWaterproofHeadOptions(supplierCode)
                  console.log('防水头选项加载完成，准备设置防水头型号')
                  break
                }
              }
            } catch (err) {
              console.error('查询供应商防水头选项失败:', supplierCode, err)
            }
          }
        }

        if (cableInfo) {
          // 使用nextTick和短暂延迟确保所有异步操作完成
          await this.$nextTick()
          await new Promise(resolve => setTimeout(resolve, 50))

          console.log('准备设置防水头型号:', cableInfo.cableModel, '产品类型:', productType)

          // 设置防水头型号
          if (productType === 'mainProduct') {
            this.formData.mainProduct.waterproofHeadModel = cableInfo.cableModel || ''
            console.log('主产品防水头型号已设置:', this.formData.mainProduct.waterproofHeadModel)
          } else if (productType === 'button') {
            this.formData.button.waterproofHeadModel = cableInfo.cableModel || ''
            console.log('按键防水头型号已设置:', this.formData.button.waterproofHeadModel)
          }

          console.log('成功设置防水头信息:', cableInfo.cableModel)
        } else {
          console.warn('未找到对应的防水头信息, cableId:', cableId)
        }
      } catch (error) {
        console.error('设置线缆信息失败:', error)
      }
    },

    // 处理主产品摸具费用分摊变化
    handleMainProductAbrasiveCostSharingChange(value) {
      if (value) {
        this.formData.mainProduct.isAbrasiveCostSharing = 1
        if (!this.formData.mainProduct.abrasiveCostSharingPcs) {
          this.formData.mainProduct.abrasiveCostSharingPcs = 1000
        }
      } else {
        this.formData.mainProduct.isAbrasiveCostSharing = 0
        this.formData.mainProduct.abrasiveCostSharingPcs = null
      }
    },

    // 处理主产品ID费用分摊变化
    handleMainProductIdCostSharingChange(value) {
      if (value) {
        this.formData.mainProduct.isIdCostSharing = 1
        if (!this.formData.mainProduct.idCostSharingPcs) {
          this.formData.mainProduct.idCostSharingPcs = 1000
        }
      } else {
        this.formData.mainProduct.isIdCostSharing = 0
        this.formData.mainProduct.idCostSharingPcs = null
      }
    },

    // 处理按键摸具费用分摊变化
    handleButtonAbrasiveCostSharingChange(value) {
      if (value) {
        this.formData.button.isAbrasiveCostSharing = 1
        if (!this.formData.button.abrasiveCostSharingPcs) {
          this.formData.button.abrasiveCostSharingPcs = 1000
        }
      } else {
        this.formData.button.isAbrasiveCostSharing = 0
        this.formData.button.abrasiveCostSharingPcs = null
      }
    },

    // 处理按键ID费用分摊变化
    handleButtonIdCostSharingChange(value) {
      if (value) {
        this.formData.button.isIdCostSharing = 1
        if (!this.formData.button.idCostSharingPcs) {
          this.formData.button.idCostSharingPcs = 1000
        }
      } else {
        this.formData.button.isIdCostSharing = 0
        this.formData.button.idCostSharingPcs = null
      }
    },

    // 表单验证
    async validateForm() {
      const promises = [
        this.$refs.mainProductForm.validate().catch(() => false),
        this.$refs.buttonForm.validate().catch(() => false),
        this.$refs.otherForm.validate().catch(() => false)
      ]

      const results = await Promise.all(promises)
      const valid = results.every(result => result !== false)

      if (!valid) {
        this.$message.warning('请完善表单信息')
      }

      return valid
    }
  }
}
</script>

<style lang="scss" scoped>
.add-quote-dialog {
  ::v-deep .el-dialog {
    margin-top: 5vh !important;
    margin-bottom: 5vh;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

    .el-dialog__header {
      padding: 16px 20px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #ebeef5;

      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .el-dialog__headerbtn {
        top: 16px;
      }
    }

    .el-dialog__body {
      padding: 20px;
      overflow-y: auto;
      flex: 1;
    }

    .el-dialog__footer {
      padding: 15px 20px;
      border-top: 1px solid #ebeef5;
      background-color: #f8f9fa;
    }
  }

  .dialog-content {
    .config-container {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;

      @media (max-width: 1200px) {
        flex-direction: column;
      }

      .config-section {
        flex: 1;
        background-color: #fff;
        border-radius: 4px;
        border: 1px solid #ebeef5;
        padding: 0;

        .section-header {
          padding: 12px 15px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #ebeef5;

          h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
        }

        .section-content {
          padding: 15px;
        }
      }
    }

    .other-config {
      background-color: #fff;
      border-radius: 4px;
      border: 1px solid #ebeef5;

      .section-header {
        padding: 12px 15px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #ebeef5;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .section-content {
        padding: 15px;

        .form-row {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 0;
          }

          .el-form-item {
            margin-bottom: 0;
          }
        }
      }
    }
  }

  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    ;
    display: flex;

  }

  .field-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  // ID信息栏样式
  .id-info-bar {
    margin-bottom: 20px;

    :deep(.el-alert) {
      .el-alert__title {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  // 费用分摊配置样式
  .cost-sharing-section {
    margin-bottom: 24px;
    padding: 20px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #409eff;
    }

    .form-row {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .cost-sharing-item {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .sharing-input {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: 24px;

        .input-label {
          font-size: 14px;
          color: #606266;
          font-weight: 500;
          min-width: 80px;
        }

        .unit-text {
          font-size: 14px;
          color: #909399;
          margin-left: 8px;
        }
      }
    }

    :deep(.el-checkbox) {
      .el-checkbox__label {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }

      &.is-checked .el-checkbox__label {
        color: #409eff;
      }
    }

    :deep(.el-input-number) {
      .el-input__inner {
        text-align: left;
      }
    }
  }

  .mold-share-config {
    .share-items {
      .share-item {
        display: flex;
        align-items: center;
        gap: 12px; // 减小整体间距
        margin-bottom: 12px;
        min-height: 32px;

        &:last-child {
          margin-bottom: 0;
        }

        .share-item-label {
          flex: 0 0 auto; // 改为固定宽度，不再自动扩展
          display: flex;
          align-items: center;

          .share-label-text {
            min-width: 85px;
            display: inline-block;
          }
        }

        .input-with-unit {
          width: 160px;
        }
      }
    }
  }

  .dialog-footer {
    text-align: center;

    .el-button {
      min-width: 100px;
      padding: 10px 20px;
    }
  }

  .input-with-unit {
    display: flex;
    align-items: center;
    gap: 8px;

    .unit-text {
      color: #606266;
      font-size: 14px;
      white-space: nowrap;
    }

    ::v-deep .el-input-number {
      .el-input__inner {
        text-align: left;
        padding: 0 15px;
      }
    }
  }
}

// 品类选择样式
.category-option {
  display: flex;
  align-items: center;
  padding: 8px 0;
  width: 100%;

  .category-image {
    width: 40px;
    height: 40px;
    margin-right: 12px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: center;

    &.no-image {
      background: #f5f7fa;
      color: #c0c4cc;

      i {
        font-size: 18px;
      }
    }

    :deep(.el-image__inner) {
      border-radius: 4px;
    }

    .image-slot {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: #f5f7fa;
      color: #c0c4cc;

      i {
        font-size: 18px;
      }
    }
  }

  .category-name {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
    flex: 1;
  }

  .category-code {
    font-size: 12px;
    color: #909399;
    background: #f5f7fa;
    padding: 2px 6px;
    border-radius: 3px;
    margin-left: 8px;
    font-family: 'Courier New', monospace;
  }
}

// 选择框下拉面板样式优化
:deep(.el-select-dropdown) {
  .el-select-dropdown__item {
    height: auto;
    line-height: normal;
    padding: 8px 20px;

    &:hover {
      background-color: #f5f7fa;
    }

    &.selected {
      background-color: #e8f4fd;

      .category-name {
        color: #409eff;
        font-weight: 600;
      }
    }
  }
}

// 选项样式
.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .option-name {
    font-size: 14px;
    color: #303133;
    flex: 1;
  }

  .option-amount {
    font-size: 12px;
    color: #e6a23c;
    font-weight: 600;
    margin-left: 12px;
    background: #fdf6ec;
    padding: 2px 6px;
    border-radius: 3px;
  }
}

.no-options {
  color: #909399;
  font-size: 13px;
  text-align: center;
  padding: 20px 0;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px dashed #dcdfe6;
  transition: all 0.3s ease;

  // 未选择品类时的样式（提示选择品类）
  &.no-category {
    background: #fdf6ec;
    border-color: #f5dab1;
    color: #e6a23c;

    span {
      font-weight: 500;

      &::before {
        content: "ℹ️";
        margin-right: 6px;
      }
    }
  }

  // 已选择品类但无选项时的样式
  &:not(.no-category) {
    background: #fef0f0;
    border-color: #fbc4c4;
    color: #f56c6c;

    span {
      &::before {
        content: "⚠️";
        margin-right: 6px;
      }
    }
  }
}

// 复选框组样式优化
.checkbox-group {
  :deep(.el-checkbox) {
    display: block;
    margin-bottom: 12px;
    margin-right: 0;

    &:last-child {
      margin-bottom: 0;
    }

    .el-checkbox__label {
      width: 100%;
      padding-left: 8px;
    }

    .el-checkbox__input {
      align-self: flex-start;
      margin-top: 2px;
    }
  }
}

// 线缆配置样式
.cable-config {
  background: #fafbfc;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;

  .cable-supplier {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;

    .supplier-radio {
      display: inline-block;

      :deep(.el-radio) {
        margin-right: 20px;

        &:last-child {
          margin-right: 0;
        }

        .el-radio__label {
          font-size: 14px;
          color: #303133;
        }

        .el-radio__input.is-checked .el-radio__inner {
          background-color: #409eff;
          border-color: #409eff;
        }
      }
    }
  }

  .cable-details {
    transition: all 0.3s ease;

    .cable-detail-item {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      ::v-deep {
        .el-form-item__content {
          width: 100%;
          display: flex;
        }

        input {
          min-width: 200px;
        }

        .el-form-item__error {
          width: 100%;
          padding-left: 100px;
        }
      }

      &:last-child {
        margin-bottom: 0;
      }

      .cable-label {
        display: inline-block;
        font-size: 14px;
        color: #606266;
        font-weight: 500;
        width: 90px;
        margin-right: 12px;
        line-height: 32px;
        flex-shrink: 0;
        text-align: right;
      }

      .cable-select {
        width: 200px;
      }

      .input-with-unit {
        display: flex;
        align-items: center;
        width: 200px;

        .cable-length-input {
          width: 160px;

          :deep(.el-input__inner) {
            border-radius: 4px 0 0 4px;
            border-right: none;
          }
        }

        .unit-text {
          background: #f5f7fa;
          border: 1px solid #dcdfe6;
          border-left: none;
          border-radius: 0 4px 4px 0;
          padding: 0 12px;
          height: 32px;
          line-height: 30px;
          font-size: 14px;
          color: #909399;
          white-space: nowrap;
          width: 40px;
          text-align: center;
        }
      }

      .field-hint {
        font-size: 12px;
        color: #909399;
        margin-left: 12px;
        line-height: 32px;
        white-space: nowrap;
      }
    }
  }
}
</style>