<template>
    <el-dialog :visible="visible" @update:visible="handleVisibleChange" :title="dialogTitle" width="1300px"
        :close-on-click-modal="false" :close-on-press-escape="false" class="add-quote-dialog"
        :before-close="handleBeforeClose" center top="0">
        <div class=" dialog-content" style="height: calc(70vh - 80px); overflow-y: auto; padding-right: 10px;">

            <!-- 产品配置区域 -->
            <div class="config-container">
                <!-- 左侧：主产品配置 -->
                <div class="config-section main-product-section">
                    <div class="section-header">
                        <h3>主产品</h3>
                    </div>
                    <div class="section-content">
                        <el-form :model="mainProduct" :rules="mainProductRules" ref="mainProductForm"
                            label-width="100px" size="small">
                            <!-- 产品品类 -->
                            <el-form-item label="产品品类" prop="categoryId">
                                <el-select v-model="mainProduct.categoryId" style="width: 100%" placeholder="请输入或选择产品品类"
                                    clearable :loading="loading" filterable remote
                                    :remote-method="searchMainProductCategory"
                                    :filter-method="filterMainProductCategory" default-first-option
                                    @change="handleMainProductCategoryChange">
                                    <el-option v-for="(category, index) in filteredMainProductCategories"
                                        :key="`main-category-${category.id || index}-${index}-${category.name}`"
                                        :label="category.name" :value="category.id">
                                    </el-option>
                                </el-select>
                            </el-form-item>

                            <!-- 选项 -->
                            <el-form-item label="选项">
                                <el-checkbox-group v-model="mainProduct.deviceOptional"
                                    v-if="mainProductOptions.length > 0" v-show="!mainProductOptionsLoading"
                                    class="checkbox-group options-fade">
                                    <el-checkbox v-for="(option, index) in mainProductOptions"
                                        :key="`main-product-option-${option.id || index}-${index}-${option.name || ''}`"
                                        :label="option.id">
                                        <div class="option-item">
                                            <span class="option-name">{{ getOptionDisplayName(option) }}</span>
                                            <span class="option-amount">¥{{ option.amount || 0 }}</span>
                                        </div>
                                    </el-checkbox>
                                </el-checkbox-group>
                                <div v-if="mainProductOptions.length === 0" class="no-options" :class="{
                                    'no-category': !mainProduct.categoryId,
                                    'loading-state': mainProductOptionsLoading,
                                    'empty-state': !mainProductOptionsLoading && mainProduct.categoryId
                                }">
                                    <span v-if="!mainProduct.categoryId" class="hint-text">
                                        <i class="el-icon-info"></i>
                                        请先选择产品品类
                                    </span>
                                    <span v-else-if="mainProductOptionsLoading" class="loading-text">
                                        <i class="el-icon-loading"></i>
                                        正在加载选项数据...
                                    </span>
                                    <span v-else class="empty-text">
                                        <i class="el-icon-warning-outline"></i>
                                        暂无可选项
                                    </span>
                                </div>
                            </el-form-item>

                            <!-- 线缆 -->
                            <el-form-item label="线缆">
                                <div class="cable-config">
                                    <!-- 线缆类型 -->
                                    <div class="cable-supplier" :class="{ 'has-details': mainProduct.cableType === 2 }">
                                        <el-radio-group v-model="mainProduct.cableType" class="supplier-radio">
                                            <el-radio :label="1">迪太提供</el-radio>
                                            <el-radio :label="2">客供线缆</el-radio>
                                        </el-radio-group>
                                    </div>

                                    <!-- 线缆详细配置 - 只有选择客供线缆时才显示 -->
                                    <div class="cable-details" v-if="mainProduct.cableType === 2">
                                        <el-form-item prop="supplierCode" class="cable-detail-item">
                                            <label class="cable-label">供应商：</label>
                                            <el-select v-model="mainProduct.supplierCode" class="cable-select"
                                                placeholder="请选择供应商" @change="handleMainProductSupplierChange">
                                                <el-option v-for="(supplier, index) in supplierOptions"
                                                    :key="`main-supplier-${supplier.dictCode || index}-${index}-${supplier.dictLabel}`"
                                                    :label="supplier.dictLabel" :value="String(supplier.dictCode)">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                        <el-form-item prop="cableId" class="cable-detail-item">
                                            <label class="cable-label">防水头型号：</label>
                                            <el-select v-model="mainProduct.cableId" class="cable-select"
                                                placeholder="请选择防水头型号" :disabled="!mainProduct.supplierCode">
                                                <el-option v-for="(option, index) in waterproofHeadOptions"
                                                    :key="`main-waterproof-${option.id || index}-${index}-${option.cableModel}`"
                                                    :label="option.cableModel" :value="String(option.id)">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                        <el-form-item prop="cableLong" class="cable-detail-item">
                                            <label class="cable-label">线长：</label>
                                            <div class="input-with-unit">
                                                <el-input-number v-model="mainProduct.cableLong" :min="1"
                                                    :max="10000000" :step="1000" :precision="0" :controls="false"
                                                    class="cable-length-input" placeholder="请输入线长" />
                                            </div>
                                            <span class="unit-text">mm</span>
                                        </el-form-item>
                                    </div>
                                </div>
                            </el-form-item>

                            <!-- 费用分摊 -->
                            <el-form-item label="费用分摊">
                                <div class="cost-sharing-config">
                                    <!-- ID费用分摊 -->
                                    <div class="cost-sharing-item">
                                        <el-checkbox v-model="mainProductIdCostSharing"
                                            @change="handleMainProductIdCostSharingChange">
                                            <span class="share-label-text">ID费用分摊</span>
                                        </el-checkbox>
                                        <div class="input-with-unit" v-show="mainProductIdCostSharing">
                                            <el-input-number v-model="mainProduct.idCostSharingPcs" :min="1"
                                                :max="999999" :step="1" :precision="0" :controls="false" size="small"
                                                style="width: 120px" :controls-position="'right'" />
                                            <span class="unit-text">pcs</span>
                                        </div>
                                    </div>
                                    <!-- 摸具费用分摊 -->
                                    <div class="cost-sharing-item">
                                        <el-checkbox v-model="mainProductAbrasiveCostSharing"
                                            @change="handleMainProductAbrasiveCostSharingChange">
                                            <span class="share-label-text">摸具费用分摊</span>
                                        </el-checkbox>
                                        <div class="input-with-unit" v-show="mainProductAbrasiveCostSharing">
                                            <el-input-number v-model="mainProduct.abrasiveCostSharingPcs" :min="1"
                                                :max="999999" :step="1" :precision="0" :controls="false" size="small"
                                                style="width: 120px" :controls-position="'right'" />
                                            <span class="unit-text">pcs</span>
                                        </div>
                                    </div>
                                </div>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>

                <!-- 右侧：按键配置 -->
                <div class="config-section button-section">
                    <div class="section-header">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <h3>按键</h3>
                            <el-switch v-model="buttonEnabled" @change="handleButtonEnabledChange" active-text="启用"
                                inactive-text="禁用" active-color="#409EFF" inactive-color="#C0C4CC">
                            </el-switch>
                        </div>
                    </div>
                    <div class="section-content">
                        <el-form :model="buttonProduct || {}" :rules="dynamicButtonRules" ref="buttonForm"
                            label-width="100px" size="small">
                            <!-- 按键品类 -->
                            <el-form-item prop="categoryId">
                                <span slot="label"><span v-if="isButtonCategoryRequired"
                                        style="color: #f56c6c;">*</span>按键品类</span>
                                <el-select v-model="buttonProduct.categoryId" style="width: 100%"
                                    placeholder="请输入或选择按键品类" :loading="loading" filterable remote clearable
                                    :remote-method="searchButtonCategory" :filter-method="filterButtonCategory"
                                    default-first-option @change="handleButtonCategoryChange"
                                    :disabled="!buttonEnabled">
                                    <el-option v-for="(category, index) in filteredButtonCategories"
                                        :key="`button-category-${category.id || index}-${index}-${category.name}`"
                                        :label="category.name" :value="category.id">
                                        <div class="category-option-simple">
                                            <span class="category-name">{{ category.name }}</span>
                                            <span v-if="category.code" class="category-code">{{ category.code }}</span>
                                        </div>
                                    </el-option>
                                </el-select>
                            </el-form-item>

                            <!-- 选项 -->
                            <el-form-item label="选项">
                                <el-checkbox-group v-model="buttonProduct.deviceOptional"
                                    v-if="buttonOptions.length > 0 && buttonEnabled"
                                    v-show="!buttonProductOptionsLoading" class="checkbox-group options-fade">
                                    <el-checkbox v-for="(option, index) in buttonOptions"
                                        :key="`button-option-${option.id || index}-${index}-${option.name || ''}`"
                                        :label="option.id">
                                        <div class="option-item">
                                            <span class="option-name">{{ getOptionDisplayName(option) }}</span>
                                            <span class="option-amount">¥{{ option.amount || 0 }}</span>
                                        </div>
                                    </el-checkbox>
                                </el-checkbox-group>
                                <div v-if="buttonOptions.length === 0 || !buttonEnabled" class="no-options" :class="{
                                    'no-category': !buttonProduct || !buttonProduct.categoryId || !buttonEnabled,
                                    'loading-state': buttonProductOptionsLoading,
                                    'empty-state': !buttonProductOptionsLoading && buttonProduct && buttonProduct.categoryId && buttonEnabled
                                }">
                                    <span v-if="!buttonEnabled" class="hint-text">
                                        <i class="el-icon-info"></i>
                                        请先启用按键配置
                                    </span>
                                    <span v-else-if="!buttonProduct || !buttonProduct.categoryId" class="hint-text">
                                        <i class="el-icon-info"></i>
                                        请先选择按键品类
                                    </span>
                                    <span v-else-if="buttonProductOptionsLoading" class="loading-text">
                                        <i class="el-icon-loading"></i>
                                        正在加载选项数据...
                                    </span>
                                    <span v-else class="empty-text">
                                        <i class="el-icon-warning-outline"></i>
                                        暂无可选项
                                    </span>
                                </div>
                            </el-form-item>

                            <!-- 线缆 -->
                            <el-form-item label="线缆">
                                <div class="cable-config">
                                    <!-- 线缆类型 -->
                                    <div class="cable-supplier"
                                        :class="{ 'has-details': buttonProduct.cableType === 2 && buttonEnabled }">
                                        <el-radio-group v-model="buttonProduct.cableType" class="supplier-radio"
                                            :disabled="!buttonEnabled">
                                            <el-radio :label="1">迪太提供</el-radio>
                                            <el-radio :label="2">客供线缆</el-radio>
                                        </el-radio-group>
                                    </div>

                                    <!-- 线缆详细配置 - 只有选择客供线缆时才显示 -->
                                    <div class="cable-details" v-if="buttonProduct.cableType === 2 && buttonEnabled">
                                        <el-form-item prop="supplierCode" class="cable-detail-item">
                                            <label class="cable-label">供应商：</label>
                                            <el-select v-model="buttonProduct.supplierCode" class="cable-select"
                                                placeholder="请选择供应商" @change="handleButtonSupplierChange">
                                                <el-option v-for="(supplier, index) in supplierOptions"
                                                    :key="`button-supplier-${supplier.dictCode || index}-${index}-${supplier.dictLabel}`"
                                                    :label="supplier.dictLabel" :value="String(supplier.dictCode)">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                        <el-form-item prop="cableId" class="cable-detail-item">
                                            <label class="cable-label">防水头型号：</label>
                                            <el-select v-model="buttonProduct.cableId" class="cable-select"
                                                placeholder="请选择防水头型号" :disabled="!buttonProduct.supplierCode">
                                                <el-option v-for="(option, index) in waterproofHeadOptions"
                                                    :key="`button-waterproof-${option.id || index}-${index}-${option.cableModel}`"
                                                    :label="option.cableModel" :value="String(option.id)">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                        <el-form-item prop="cableLong" class="cable-detail-item">
                                            <label class="cable-label">线长：</label>
                                            <div class="input-with-unit">
                                                <el-input-number v-model="buttonProduct.cableLong" :min="1"
                                                    :max="10000000" :step="1000" :precision="0" :controls="false"
                                                    class="cable-length-input" placeholder="请输入线长" />
                                            </div>
                                            <span class="unit-text">mm</span>
                                        </el-form-item>
                                    </div>
                                </div>
                            </el-form-item>

                            <!-- 费用分摊 -->
                            <el-form-item label="费用分摊">
                                <div class="cost-sharing-config">
                                    <!-- ID费用分摊 -->
                                    <div class="cost-sharing-item">
                                        <el-checkbox v-model="buttonIdCostSharing"
                                            @change="handleButtonIdCostSharingChange" :disabled="!buttonEnabled">
                                            <span class="share-label-text">ID费用分摊</span>
                                        </el-checkbox>
                                        <div class="input-with-unit" v-show="buttonIdCostSharing && buttonEnabled">
                                            <el-input-number v-model="buttonProduct.idCostSharingPcs" :min="1"
                                                :max="999999" :step="1" :precision="0" :controls="false" size="small"
                                                style="width: 120px" :controls-position="'right'" />
                                            <span class="unit-text">pcs</span>
                                        </div>
                                    </div>
                                    <!-- 摸具费用分摊 -->
                                    <div class="cost-sharing-item">
                                        <el-checkbox v-model="buttonAbrasiveCostSharing"
                                            @change="handleButtonAbrasiveCostSharingChange" :disabled="!buttonEnabled">
                                            <span class="share-label-text">摸具费用分摊</span>
                                        </el-checkbox>
                                        <div class="input-with-unit"
                                            v-show="buttonAbrasiveCostSharing && buttonEnabled">
                                            <el-input-number v-model="buttonProduct.abrasiveCostSharingPcs" :min="1"
                                                :max="999999" :step="1" :precision="0" :controls="false" size="small"
                                                style="width: 120px" :controls-position="'right'" />
                                            <span class="unit-text">pcs</span>
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
                    <h3>
                        <i class="el-icon-setting"></i>
                        其他信息
                    </h3>
                </div>
                <div class="section-content">
                    <el-form :model="quotationData" :rules="otherRules" ref="otherForm" label-width="100px"
                        size="small">
                        <!-- 第一行：客户类型、产品税率、售后费用 -->
                        <div class="form-row three-columns">
                            <div class="form-column">
                                <el-form-item label="客户类型" prop="customerType">
                                    <el-select v-model="quotationData.customerType" style="width: 100%"
                                        placeholder="请选择客户类型">
                                        <el-option v-for="(customerType, index) in dictData.customerTypes || []"
                                            :key="`customer-type-${customerType.value}-${index}`"
                                            :label="customerType.label" :value="customerType.value">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </div>
                            <div class="form-column">
                                <el-form-item label="产品税率" prop="productTaxRate">
                                    <el-select v-model="quotationData.productTaxRate" style="width: 100%"
                                        placeholder="请选择产品税率">
                                        <el-option v-for="(taxRate, index) in dictData.productTaxRates || []"
                                            :key="`tax-rate-${taxRate.value}-${index}`" :label="`${taxRate.label}%`"
                                            :value="taxRate.value">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </div>
                            <div class="form-column">
                                <el-form-item label="售后费用" prop="afterSalesRate">
                                    <el-select v-model="quotationData.afterSalesRate" style="width: 100%"
                                        placeholder="请选择售后费用">
                                        <el-option v-for="(afterSalesRate, index) in dictData.afterSalesRates"
                                            :key="`after-sales-${afterSalesRate.value}-${index}`"
                                            :label="`${afterSalesRate.label}%`" :value="afterSalesRate.value">
                                        </el-option>
                                    </el-select>
                                </el-form-item>

                            </div>
                        </div>

                        <!-- 第二行：报价方式和汇率 -->
                        <el-row class="form-row">
                            <el-col :span="10">
                                <el-form-item label="报价方式" prop="quotationType">
                                    <el-radio-group v-model="quotationData.quotationType">
                                        <el-radio :label="1">
                                            <i class="el-icon-coin"></i>
                                            人民币
                                        </el-radio>
                                        <el-radio :label="2">
                                            <i class="el-icon-money"></i>
                                            美元
                                        </el-radio>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                            <!-- 汇率 - 选择美元时显示，独立表单项进行校验 -->
                            <el-form-item label="汇率" prop="exchangeRate" v-if="quotationData.quotationType === 2">
                                <div class="input-with-unit">
                                    <el-input-number v-model="quotationData.exchangeRate" :min="0.0001" :max="20"
                                        :precision="4" :step="0" :controls="false" size="small" style="width: 120px"
                                        placeholder="请输入汇率" />
                                    <span class="unit-text">CNY/USD</span>
                                </div>
                            </el-form-item>
                        </el-row>

                        <!-- 第三行：备注描述 -->
                        <div class="form-row">
                            <el-form-item label="备注描述" prop="remark">
                                <el-input v-model="quotationData.remark" type="textarea" :rows="3"
                                    placeholder="请输入备注信息（可选）" maxlength="500" show-word-limit style="width: 100%" />
                            </el-form-item>
                        </div>
                    </el-form>
                </div>
            </div>
        </div>

        <!-- 底部按钮 -->
        <div slot="footer" class="dialog-footer">
            <div class="footer-content">
                <div class="footer-info">
                    <i class="el-icon-info"></i>
                    <span>请确认所有信息填写正确后再提交</span>
                </div>
                <div class="footer-buttons">
                    <el-button @click="handleCancel" size="medium" icon="el-icon-close">
                        取 消
                    </el-button>
                    <el-button type="primary" @click="handleSave" :loading="saving" size="medium" icon="el-icon-check">
                        {{ saving ? '保存中...' : '确 定' }}
                    </el-button>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script>
import {
    saveQuotation,
    getCategoryList,
    getSupplierDict,
    getDeviceCostByCategory,
    getCostCategoryDict,
    getCostProjectDict
} from '@/api/quote-management/quotation'
import { getCableCostList } from '@/api/quote-management/cableCost'

export default {
    name: 'AddQuoteDialogRefactored',
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
        },
        dictData: {
            type: Object,
            default: function () { return {} }
        }
    },
    data() {
        return {
            // 主表单数据 - 直接对应后端API格式
            quotationData: {
                id: null,
                key: '',
                model: '',
                standardSpec: '',
                standardSpecEn: '',
                quotationType: 1, // 1=人民币, 2=美元
                customerType: null,
                exchangeRate: null,
                productTaxRate: null,
                afterSalesRate: null,
                remark: '',
                modelImg: null, // 存储品类图片
                list: []
            },

            // Loading 状态
            mainProductOptionsLoading: false,
            buttonProductOptionsLoading: false,

            // UI辅助状态
            buttonEnabled: false,
            mainProductIdCostSharing: false,
            mainProductAbrasiveCostSharing: false,
            buttonIdCostSharing: false,
            buttonAbrasiveCostSharing: false,

            // 选项数据
            categoryList: [],
            mainProductOptions: [],
            buttonOptions: [],
            supplierOptions: [],
            waterproofHeadOptions: [],
            costCategoryOptions: [],
            costProjectOptions: [],

            // 过滤后的品类列表
            filteredMainProductCategories: [],
            filteredButtonCategories: [],
            searchMainProductQuery: '',
            searchButtonQuery: '',

            // 表单验证
            mainProductRules: {
                categoryId: [
                    { required: true, message: '请选择产品品类', trigger: 'change' }
                ],
                supplierCode: [
                    {
                        validator: function (rule, value, callback) {
                            var mainProduct = this.mainProduct
                            if (mainProduct && mainProduct.cableType === 2 && !value) {
                                callback(new Error('选择客供线缆时，线缆供应商为必填'))
                            } else {
                                callback()
                            }
                        }.bind(this),
                        trigger: 'change'
                    }
                ],
                cableId: [
                    {
                        validator: function (rule, value, callback) {
                            var mainProduct = this.mainProduct
                            if (mainProduct && mainProduct.cableType === 2 && !value) {
                                callback(new Error('选择客供线缆时，防水头型号为必填'))
                            } else {
                                callback()
                            }
                        }.bind(this),
                        trigger: 'change'
                    }
                ],
                cableLong: [
                    {
                        validator: function (rule, value, callback) {
                            var mainProduct = this.mainProduct
                            if (mainProduct && mainProduct.cableType === 2 && (!value || value <= 0)) {
                                callback(new Error('选择客供线缆时，线长为必填且必须大于0'))
                            } else {
                                callback()
                            }
                        }.bind(this),
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
                quotationType: [
                    { required: true, message: '请选择报价方式', trigger: 'change' }
                ],
                exchangeRate: [
                    { required: true, message: '请输入汇率', trigger: 'blur' },
                    { type: 'number', min: 0.0001, max: 20, message: '汇率必须在0.0001-20之间', trigger: 'blur' }
                ],
                afterSalesRate: [
                    { required: true, message: '请选择售后费用', trigger: 'change' }
                ]
            },

            // 状态管理
            saving: false,
            loading: false,
            isLoadingEditData: false
        }
    },

    computed: {
        dialogTitle: function () {
            // 如果有editData且不是复制模式，显示编辑
            if (this.editData && !this.editData._isCopy) {
                return '编辑报价项目'
            } else {
                return '新增报价项目'
            }
        },

        idInfoText: function () {
            if (this.editData) {
                return '正在编辑报价单，ID: ' + this.editData.id
            } else {
                return '正在新增报价单，将分配ID: ' + this.nextId + '，保存时将创建新记录'
            }
        },

        // 主产品数据
        mainProduct: function () {
            return (this.quotationData.list || []).find(function (item) { return item.productType === 1 }) || {}
        },

        mainProductIndex: function () {
            return (this.quotationData.list || []).findIndex(function (item) { return item.productType === 1 })
        },

        // 按键产品数据
        buttonProduct: function () {
            return (this.quotationData.list || []).find(function (item) { return item.productType === 2 }) || {}
        },

        buttonProductIndex: function () {
            return (this.quotationData.list || []).findIndex(function (item) { return item.productType === 2 })
        },

        // 是否有未保存的更改
        hasUnsavedChanges: function () {
            if (this.editData) {
                return JSON.stringify(this.quotationData) !== JSON.stringify(this.editData)
            }
            var mainProduct = this.mainProduct
            var buttonProduct = this.buttonProduct
            var hasMainProductConfig = (mainProduct && mainProduct.deviceOptional && mainProduct.deviceOptional.length > 0) || (mainProduct && mainProduct.categoryId)
            var hasButtonConfig = (buttonProduct && buttonProduct.deviceOptional && buttonProduct.deviceOptional.length > 0) || (buttonProduct && buttonProduct.categoryId)
            return hasMainProductConfig || hasButtonConfig
        },

        // 动态按键验证规则
        dynamicButtonRules: function () {
            if (this.buttonEnabled) {
                return {
                    categoryId: [
                        {
                            validator: function (rule, value, callback) {
                                if (!value) {
                                    callback(new Error('请选择按键品类'))
                                } else {
                                    callback()
                                }
                            },
                            trigger: 'blur'
                        }
                    ]
                }
            } else {
                return {
                    categoryId: []
                }
            }
        },

        // 按键品类是否必填
        isButtonCategoryRequired: function () {
            return this.buttonEnabled
        }
    },

    watch: {
        visible: async function (newVal) {
            if (newVal) {
                await this.initializeForm()
            }
        },

        editData: {
            handler: async function (newVal) {
                if (this.visible && newVal) {
                    await this.loadEditData(newVal)
                }
            },
            deep: true,
            immediate: true
        },

        // 监听报价方式变化
        'quotationData.quotationType': function (newVal, oldVal) {
            if (newVal !== oldVal) {
                if (newVal === 1) {
                    // 人民币，清空汇率
                    this.quotationData.exchangeRate = null
                } else if (newVal === 2) {
                    // 美元，设置默认汇率
                    this.quotationData.exchangeRate = this.quotationData.exchangeRate || 7.2
                }
                var self = this
                this.$nextTick(function () {
                    if (self.$refs.otherForm) {
                        self.$refs.otherForm.validateField('exchangeRate')
                    }
                })
            }
        },

        // 监听主产品线缆类型变化
        'mainProduct.cableType': function (newVal, oldVal) {
            if (newVal !== oldVal && this.mainProduct) {
                if (newVal !== 2) {
                    // 不是客供线缆，清空相关字段
                    this.mainProduct.supplierCode = null
                    this.mainProduct.cableId = null
                    this.mainProduct.cableLong = null
                    this.waterproofHeadOptions = []
                }
                // 触发表单验证
                var self = this
                this.$nextTick(function () {
                    if (self.$refs.mainProductForm) {
                        self.$refs.mainProductForm.validateField(['supplierCode', 'cableId', 'cableLong'])
                    }
                })
            }
        },

        // 监听按键线缆类型变化
        'buttonProduct.cableType': function (newVal, oldVal) {
            if (newVal !== oldVal && this.buttonProduct) {
                if (newVal !== 2) {
                    // 不是客供线缆，清空相关字段
                    this.buttonProduct.supplierCode = null
                    this.buttonProduct.cableId = null
                    this.buttonProduct.cableLong = null
                }
            }
        },

        // 监听主产品供应商变化 - 用于编辑时的回显
        'mainProduct.supplierCode': async function (newVal) {
            if (newVal && this.isLoadingEditData) {
                // 编辑时自动加载防水头选项
                await this.loadWaterproofHeadOptions(newVal)
            }
        },

        // 监听按键供应商变化 - 用于编辑时的回显
        'buttonProduct.supplierCode': async function (newVal) {
            if (newVal && this.isLoadingEditData && this.buttonEnabled) {
                // 编辑时自动加载防水头选项
                await this.loadWaterproofHeadOptions(newVal)
            }
        }
    },

    async mounted() {
        await this.loadInitialData()
    },

    methods: {
        // 处理可见性变化
        handleVisibleChange: function (val) {
            this.$emit('update:visible', val)
        },

        // 关闭前确认
        handleBeforeClose: function (done) {
            var self = this
            if (this.hasUnsavedChanges) {
                this.$confirm('您有未保存的更改，确定要关闭吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(function () {
                    done()
                }).catch(function () { })
            } else {
                done()
            }
        },

        // 加载初始数据
        loadInitialData: async function () {
            try {
                this.loading = true
                await Promise.all([
                    this.loadCategoryList(),
                    this.loadSupplierOptions(),
                    this.loadCostDictionaries()
                ])
            } catch (error) {
                console.error('加载初始数据失败:', error)
                this.$message.error('加载数据失败')
            } finally {
                this.loading = false
            }
        },

        // 加载品类列表
        loadCategoryList: async function () {
            try {
                var response = await getCategoryList()
                if (response.code === 200) {
                    this.categoryList = response.data || []
                    // 根据productType过滤品类：1=仪表类，2=按键类
                    var mainProductCategories = this.categoryList.filter(function (cat) {
                        return cat.productType === 1   // 仪表类品类
                    })
                    var buttonCategories = this.categoryList.filter(function (cat) {
                        return cat.productType === 2 // 按键类品类
                    })

                    this.$set(this, 'filteredMainProductCategories', mainProductCategories)
                    this.$set(this, 'filteredButtonCategories', buttonCategories)


                    console.log('品类过滤结果:', {
                        total: this.categoryList.length,
                        mainProduct: mainProductCategories.length,
                        button: buttonCategories.length
                    })
                } else {
                    this.$message.error(response.msg || '获取品类列表失败')
                }
            } catch (error) {
                console.error('获取品类列表失败:', error)
                this.$message.error('获取品类列表失败')
            }
        },

        // 加载供应商选项
        loadSupplierOptions: async function () {
            var response = await getSupplierDict()
            if (response.code === 200) {
                this.supplierOptions = response.data || []
            }
        },

        // 加载成本字典
        loadCostDictionaries: async function () {
            var results = await Promise.all([
                getCostCategoryDict(),
                getCostProjectDict()
            ])
            var categoryRes = results[0]
            var projectRes = results[1]

            if (categoryRes.code === 200) {
                this.costCategoryOptions = (categoryRes.data || []).map(function (item) {
                    return {
                        code: item.dictCode,
                        value: parseInt(item.dictValue),
                        label: item.dictLabel,
                        remark: item.remark
                    }
                })
            }
            if (projectRes.code === 200) {
                this.costProjectOptions = (projectRes.data || []).map(function (item) {
                    return {
                        code: item.dictCode,
                        value: parseInt(item.dictValue),
                        label: item.dictLabel,
                        remark: item.remark
                    }
                })
            }
        },

        // 搜索主产品品类
        searchMainProductCategory: function (query) {
            this.searchMainProductQuery = query
            // 先获取仪表类品类
            var mainProductCategories = this.categoryList.filter(function (cat) {
                return cat.productType === 1 // 仅仪表类品类
            })

            if (query) {
                var lowerQuery = query.toLowerCase()
                this.$set(this, 'filteredMainProductCategories', mainProductCategories.filter(function (cat) {
                    return (cat.name && cat.name.toLowerCase().includes(lowerQuery)) ||
                        (cat.code && cat.code.toLowerCase().includes(lowerQuery)) ||
                        (cat.pinyin && cat.pinyin.toLowerCase().includes(lowerQuery))
                }))
            } else {
                this.$set(this, 'filteredMainProductCategories', mainProductCategories.slice())
            }
        },

        // 过滤主产品品类
        filterMainProductCategory: function (val) {
            // 首先确保是仪表类品类
            if (val.productType !== 1) return false

            var query = this.searchMainProductQuery.toLowerCase()
            return (val.name && val.name.toLowerCase().includes(query)) ||
                (val.code && val.code.toLowerCase().includes(query)) ||
                (val.pinyin && val.pinyin.toLowerCase().includes(query))
        },

        // 搜索按键品类
        searchButtonCategory: function (query) {
            this.searchButtonQuery = query
            // 先获取按键类品类
            var buttonCategories = this.categoryList.filter(function (cat) {
                return cat.productType === 2 // 仅按键类品类
            })

            if (query) {
                var lowerQuery = query.toLowerCase()
                this.$set(this, 'filteredButtonCategories', buttonCategories.filter(function (cat) {
                    return (cat.name && cat.name.toLowerCase().includes(lowerQuery)) ||
                        (cat.code && cat.code.toLowerCase().includes(lowerQuery)) ||
                        (cat.pinyin && cat.pinyin.toLowerCase().includes(lowerQuery))
                }))
            } else {
                this.$set(this, 'filteredButtonCategories', buttonCategories.slice())
            }
        },

        // 过滤按键品类
        filterButtonCategory: function (val) {
            // 首先确保是按键类品类
            if (val.productType !== 2) return false

            var query = this.searchButtonQuery.toLowerCase()
            return (val.name && val.name.toLowerCase().includes(query)) ||
                (val.code && val.code.toLowerCase().includes(query)) ||
                (val.pinyin && val.pinyin.toLowerCase().includes(query))
        },

        // 初始化表单
        initializeForm: async function () {
            // 确保基础数据已加载
            if (this.categoryList.length === 0 || this.supplierOptions.length === 0) {
                await this.loadInitialData()
            }

            if (this.editData) {
                await this.loadEditData(this.editData)
            } else {
                this.resetForm()
            }

            // 等待DOM更新完成后清除验证错误
            await this.$nextTick()
            this.clearValidationErrors()
        },

        // 重置表单
        resetForm: function () {
            // 默认禁用按键配置，需要用户手动启用
            this.buttonEnabled = false

            this.quotationData = {
                id: this.editData ? this.editData.id : this.nextId,
                key: this.temporaryKey,
                model: '',
                standardSpec: '',
                standardSpecEn: '',
                quotationType: 1,
                customerType: null,
                exchangeRate: null,
                productTaxRate: null,
                afterSalesRate: null,
                remark: '',
                list: [
                    {
                        categoryId: null,
                        productType: 1, // 主产品
                        deviceOptional: [],
                        cableId: null,
                        cableLong: 5000000,
                        cableType: 1,
                        supplierCode: null,
                        wireType: 1,
                        isIdCostSharing: 0,
                        idCostSharingPcs: null,
                        isAbrasiveCostSharing: 0,
                        abrasiveCostSharingPcs: null
                    }
                    // 默认不包含按键产品，需要用户手动启用后才会添加
                ]
            }

            this.mainProductIdCostSharing = false
            this.mainProductAbrasiveCostSharing = false
            this.buttonIdCostSharing = false
            this.buttonAbrasiveCostSharing = false

            this.mainProductOptions = []
            this.buttonOptions = []
            this.waterproofHeadOptions = []

            // 确保过滤列表已初始化
            if (this.categoryList.length > 0) {
                // 根据productType过滤品类
                var mainProductCategories = this.categoryList.filter(function (cat) {
                    return cat.productType === 1 // 仪表类品类
                })
                var buttonCategories = this.categoryList.filter(function (cat) {
                    return cat.productType === 2 // 按键类品类
                })

                this.$set(this, 'filteredMainProductCategories', mainProductCategories)
                this.$set(this, 'filteredButtonCategories', buttonCategories)
            }
        },

        // 加载编辑数据
        loadEditData: async function (data) {
            this.isLoadingEditData = true // 标记正在加载编辑数据

            // 确保品类列表已加载
            if (this.categoryList.length === 0) {
                await this.loadCategoryList()
            }

            // 直接使用后端数据格式，无需转换
            this.quotationData = JSON.parse(JSON.stringify(data))



            // 设置UI状态
            var buttonProduct = this.quotationData.list.find(function (item) { return item.productType === 2 })
            this.buttonEnabled = !!buttonProduct

            var mainProduct = this.mainProduct
            if (mainProduct) {
                this.mainProductIdCostSharing = mainProduct.isIdCostSharing === 1
                this.mainProductAbrasiveCostSharing = mainProduct.isAbrasiveCostSharing === 1
            }

            if (buttonProduct) {
                this.buttonIdCostSharing = buttonProduct.isIdCostSharing === 1
                this.buttonAbrasiveCostSharing = buttonProduct.isAbrasiveCostSharing === 1
            }

            // 异步加载相关选项数据
            await this.$nextTick()

            if (mainProduct && mainProduct.categoryId) {
                await this.loadMainProductOptions(mainProduct.categoryId)
            }
            if (buttonProduct && buttonProduct.categoryId) {
                await this.loadButtonOptions(buttonProduct.categoryId)
            }

            // 等待一下确保供应商数据已经设置
            await this.$nextTick()

            // 加载防水头选项 - 主产品
            if (mainProduct && mainProduct.supplierCode && mainProduct.cableType === 2) {
                await this.loadWaterproofHeadOptions(mainProduct.supplierCode)
            }

            // 加载防水头选项 - 按键产品
            if (buttonProduct && buttonProduct.supplierCode && buttonProduct.cableType === 2) {
                await this.loadWaterproofHeadOptions(buttonProduct.supplierCode)
            }

            this.isLoadingEditData = false // 加载完成
        },

        // 主产品品类变化
        handleMainProductCategoryChange: async function (categoryId) {
            if (categoryId) {
                // 设置 loading 状态
                this.mainProductOptionsLoading = true

                // 存储品类图片
                var category = this.categoryList.find(function (cat) { return cat.id === categoryId })
                if (category && category.img) {
                    this.quotationData.modelImg = category.img
                }

                try {
                    await this.loadMainProductOptions(categoryId)
                    // 清空选项
                    this.mainProduct.deviceOptional = []
                } catch (error) {
                    console.error('加载主产品选项失败:', error)
                } finally {
                    this.mainProductOptionsLoading = false
                }
            } else {
                this.mainProductOptions = []
                this.mainProductOptionsLoading = false
                this.quotationData.modelImg = null
            }
        },

        // 按键品类变化
        handleButtonCategoryChange: async function (categoryId) {
            if (categoryId) {
                // 设置 loading 状态
                this.buttonProductOptionsLoading = true

                try {
                    await this.loadButtonOptions(categoryId)
                    // 清空选项
                    this.buttonProduct.deviceOptional = []
                } catch (error) {
                    console.error('加载按键选项失败:', error)
                } finally {
                    this.buttonProductOptionsLoading = false
                }
            } else {
                this.buttonOptions = []
                this.buttonProductOptionsLoading = false
            }
        },

        // 加载主产品选项
        loadMainProductOptions: async function (categoryId) {
            try {
                var response = await getDeviceCostByCategory(categoryId)
                if (response.code === 200) {
                    // 过滤只显示选配项 (isOptional = 1)
                    var allOptions = response.data || []
                    this.mainProductOptions = allOptions.filter(function (option) {
                        return option.isOptional === 1 || option.isOptional === '1'
                    })
                    console.log('主产品选项过滤结果:', this.mainProductOptions.length, '/', allOptions.length)
                }
            } catch (error) {
                console.error('加载主产品选项失败:', error)
            }
        },

        // 加载按键选项
        loadButtonOptions: async function (categoryId) {
            try {
                var response = await getDeviceCostByCategory(categoryId)
                if (response.code === 200) {
                    // 过滤只显示选配项 (isOptional = 1)
                    var allOptions = response.data || []
                    this.buttonOptions = allOptions.filter(function (option) {
                        return option.isOptional === 1 || option.isOptional === '1'
                    })
                    console.log('按键选项过滤结果:', this.buttonOptions.length, '/', allOptions.length)
                }
            } catch (error) {
                console.error('加载按键选项失败:', error)
            }
        },

        // 主产品供应商变化
        handleMainProductSupplierChange: function (supplierCode) {
            if (supplierCode) {
                this.loadWaterproofHeadOptions(supplierCode)
                // 清空防水头型号
                this.mainProduct.cableId = null
            }
        },

        // 按键供应商变化
        handleButtonSupplierChange: function (supplierCode) {
            if (supplierCode) {
                this.loadWaterproofHeadOptions(supplierCode)
                // 清空防水头型号
                this.buttonProduct.cableId = null
            }
        },

        // 加载防水头型号选项
        loadWaterproofHeadOptions: async function (supplierCode) {
            try {
                var params = {
                    supplier: supplierCode,
                    pageNum: 999,
                    pageSize: 999
                }
                var response = await getCableCostList(params)
                if (response.code === 200) {
                    this.waterproofHeadOptions = (response.data && response.data.list) || []
                }
            } catch (error) {
                console.error('加载防水头型号失败:', error)
            }
        },

        // 费用分摊处理方法
        handleMainProductIdCostSharingChange: function (value) {
            this.mainProduct.isIdCostSharing = value ? 1 : 0
            if (value && !this.mainProduct.idCostSharingPcs) {
                this.mainProduct.idCostSharingPcs = 1000
            } else if (!value) {
                this.mainProduct.idCostSharingPcs = null
            }
        },

        handleMainProductAbrasiveCostSharingChange: function (value) {
            this.mainProduct.isAbrasiveCostSharing = value ? 1 : 0
            if (value && !this.mainProduct.abrasiveCostSharingPcs) {
                this.mainProduct.abrasiveCostSharingPcs = 1000
            } else if (!value) {
                this.mainProduct.abrasiveCostSharingPcs = null
            }
        },

        handleButtonIdCostSharingChange: function (value) {
            if (this.buttonProduct) {
                this.buttonProduct.isIdCostSharing = value ? 1 : 0
                if (value && !this.buttonProduct.idCostSharingPcs) {
                    this.buttonProduct.idCostSharingPcs = 1000
                } else if (!value) {
                    this.buttonProduct.idCostSharingPcs = null
                }
            }
        },

        handleButtonAbrasiveCostSharingChange: function (value) {
            if (this.buttonProduct) {
                this.buttonProduct.isAbrasiveCostSharing = value ? 1 : 0
                if (value && !this.buttonProduct.abrasiveCostSharingPcs) {
                    this.buttonProduct.abrasiveCostSharingPcs = 1000
                } else if (!value) {
                    this.buttonProduct.abrasiveCostSharingPcs = null
                }
            }
        },

        // 按键配置开关切换
        toggleButtonConfig: function () {
            this.buttonEnabled = !this.buttonEnabled
            this.handleButtonEnabledChange(this.buttonEnabled)
        },

        // 按键启用/禁用处理
        handleButtonEnabledChange: function (value) {
            var self = this
            if (!value) {
                // 禁用按键时，从 quotationData.list 中移除按键产品数据
                var buttonIndex = this.buttonProductIndex
                if (buttonIndex !== -1) {
                    this.quotationData.list.splice(buttonIndex, 1)
                }

                // 清空选项数据
                this.buttonOptions = []
                this.buttonIdCostSharing = false
                this.buttonAbrasiveCostSharing = false

                // 清空表单验证 - 延迟执行确保DOM更新完成
                var self = this
                this.$nextTick(function () {
                    if (self.$refs.buttonForm) {
                        self.$refs.buttonForm.clearValidate()
                    }
                })
            } else {
                // 启用按键时，确保 list 中有按键产品数据
                var buttonIndex = this.buttonProductIndex
                if (buttonIndex === -1) {
                    // 如果 list 中没有按键产品，创建一个新的
                    var newButtonProduct = {
                        categoryId: null,
                        productType: 2, // 按键
                        deviceOptional: [],
                        cableId: null,
                        cableLong: 1000,
                        cableType: 1,
                        supplierCode: null,
                        wireType: 1,
                        isIdCostSharing: 0,
                        idCostSharingPcs: null,
                        isAbrasiveCostSharing: 0,
                        abrasiveCostSharingPcs: null
                    }
                    this.quotationData.list.push(newButtonProduct)
                }

                // 启用后不立即校验，等提交时再校验
            }
        },

        // 生成规格描述
        generateStandardSpec: function () {
            var specs = []
            var self = this

            // 主产品规格
            var mainProduct = this.mainProduct
            if (mainProduct && mainProduct.categoryId) {
                var category = this.categoryList.find(function (cat) { return cat.id === mainProduct.categoryId })
                if (category) {
                    var mainSpec = '主产品: ' + category.name

                    // 添加主产品选项
                    if (mainProduct.deviceOptional && mainProduct.deviceOptional.length > 0) {
                        var optionNames = mainProduct.deviceOptional.map(function (optionId) {
                            var option = self.mainProductOptions.find(function (opt) { return opt.id === optionId })
                            return option ? self.getOptionDisplayName(option) : optionId
                        }).filter(function (name) { return name && name.trim() !== '' })
                        if (optionNames.length > 0) {
                            mainSpec += ' + ' + optionNames.join(', ')
                        }
                    }
                    specs.push(mainSpec)
                }
            }

            // 按键规格
            var buttonProduct = this.buttonProduct
            if (buttonProduct && buttonProduct.categoryId) {
                var category = this.categoryList.find(function (cat) { return cat.id === buttonProduct.categoryId })
                if (category) {
                    var buttonSpec = '按键产品: ' + category.name

                    // 添加按键选项
                    if (buttonProduct.deviceOptional && buttonProduct.deviceOptional.length > 0) {
                        var optionNames = buttonProduct.deviceOptional.map(function (optionId) {
                            var option = self.buttonOptions.find(function (opt) { return opt.id === optionId })
                            return option ? self.getOptionDisplayName(option) : optionId
                        }).filter(function (name) { return name && name.trim() !== '' })
                        if (optionNames.length > 0) {
                            buttonSpec += ' + ' + optionNames.join(', ')
                        }
                    }
                    specs.push(buttonSpec)
                }
            }

            return specs.join(' | ')
        },

        // 生成英文规格描述
        generateStandardSpecEn: function () {
            var specs = []
            var self = this

            // 主产品规格
            var mainProduct = this.mainProduct
            if (mainProduct && mainProduct.categoryId) {
                var category = this.categoryList.find(function (cat) { return cat.id === mainProduct.categoryId })
                if (category) {
                    var mainSpec = 'Main Product: ' + category.name

                    // 添加主产品选项
                    if (mainProduct.deviceOptional && mainProduct.deviceOptional.length > 0) {
                        var optionNames = mainProduct.deviceOptional.map(function (optionId) {
                            var option = self.mainProductOptions.find(function (opt) { return opt.id === optionId })
                            return option ? self.getOptionDisplayNameEn(option) : optionId
                        }).filter(function (name) { return name && name.trim() !== '' })
                        if (optionNames.length > 0) {
                            mainSpec += ' + ' + optionNames.join(', ')
                        }
                    }
                    specs.push(mainSpec)
                }
            }

            // 按键规格
            var buttonProduct = this.buttonProduct
            if (buttonProduct && buttonProduct.categoryId) {
                var category = this.categoryList.find(function (cat) { return cat.id === buttonProduct.categoryId })
                if (category) {
                    var buttonSpec = 'Button Product: ' + category.name

                    // 添加按键选项
                    if (buttonProduct.deviceOptional && buttonProduct.deviceOptional.length > 0) {
                        var optionNames = buttonProduct.deviceOptional.map(function (optionId) {
                            var option = self.buttonOptions.find(function (opt) { return opt.id === optionId })
                            return option ? self.getOptionDisplayNameEn(option) : optionId
                        }).filter(function (name) { return name && name.trim() !== '' })
                        if (optionNames.length > 0) {
                            buttonSpec += ' + ' + optionNames.join(', ')
                        }
                    }
                    specs.push(buttonSpec)
                }
            }

            return specs.join(' | ')
        },

        // 生成产品型号
        generateModel: function () {
            // 简化的型号生成逻辑
            var mainProduct = this.mainProduct
            if (mainProduct && mainProduct.categoryId) {
                var category = this.categoryList.find(function (cat) { return cat.id === mainProduct.categoryId })
                var baseName = category ? category.name : 'PRODUCT'
                var timestamp = Date.now().toString().slice(-6)
                return baseName + '-' + timestamp
            }
            return 'QUOTE-' + Date.now().toString().slice(-6)
        },

        // 表单验证
        validateForm: async function () {
            var self = this
            var promises = []

            if (self.$refs.mainProductForm) {
                promises.push(self.$refs.mainProductForm.validate().catch(function () { return false }))
            }
            if (self.$refs.otherForm) {
                promises.push(self.$refs.otherForm.validate().catch(function () { return false }))
            }

            if (self.buttonEnabled && self.$refs.buttonForm) {
                promises.push(self.$refs.buttonForm.validate().catch(function () { return false }))
            }

            var results = await Promise.all(promises)
            return results.every(function (result) { return result !== false })
        },

        // 保存操作
        handleSave: async function () {
            try {
                var valid = await this.validateForm()
                if (!valid) return

                this.saving = true

                // 如果按键未启用，移除按键产品
                if (!this.buttonEnabled) {
                    var buttonIndex = this.buttonProductIndex
                    if (buttonIndex !== -1) {
                        this.quotationData.list.splice(buttonIndex, 1)
                    }
                }

                // 生成规格描述和型号
                this.quotationData.standardSpec = this.generateStandardSpec()
                this.quotationData.standardSpecEn = this.generateStandardSpecEn()
                this.quotationData.model = this.generateModel()

                // 直接发送数据，无需复杂转换
                var response = await saveQuotation(this.quotationData)

                if (response.code === 200) {
                    this.$emit('save', response.data)
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

        // 取消操作
        handleCancel: function () {
            this.$emit('update:visible', false)
        },

        // 获取选项显示名称
        getOptionDisplayName: function (option) {
            console.log('获取选项显示名称:', option)
            console.log('成本类型选项:', this.costCategoryOptions)
            console.log('成本项选项:', this.costProjectOptions)

            // 从字典数据中获取成本类型和成本项的显示名称
            // 尝试多种匹配方式
            var costCategoryItem = this.costCategoryOptions.find(function (item) { return item.value === option.costCategory })
            if (!costCategoryItem) {
                // 如果按value匹配不到，尝试按code匹配
                costCategoryItem = this.costCategoryOptions.find(function (item) { return item.code === option.costCategory })
            }
            if (!costCategoryItem) {
                // 如果还是匹配不到，尝试字符串匹配
                costCategoryItem = this.costCategoryOptions.find(function (item) { return item.value === String(option.costCategory) })
            }

            var costProjectItem = this.costProjectOptions.find(function (item) { return item.value === option.costProject })
            if (!costProjectItem) {
                // 如果按value匹配不到，尝试按code匹配
                costProjectItem = this.costProjectOptions.find(function (item) { return item.code === option.costProject })
            }
            if (!costProjectItem) {
                // 如果还是匹配不到，尝试字符串匹配
                costProjectItem = this.costProjectOptions.find(function (item) { return item.value === String(option.costProject) })
            }

            var categoryName = costCategoryItem ? costCategoryItem.label : '未知类型(' + option.costCategory + ')'
            var projectName = costProjectItem ? costProjectItem.label : '未知项目(' + option.costProject + ')'

            console.log('匹配结果 - 类型:', costCategoryItem, '项目:', costProjectItem)
            console.log('显示名称:', categoryName + '-' + projectName)

            return categoryName + '-' + projectName
        },

        // 获取选项英文显示名称
        getOptionDisplayNameEn: function (option) {
            // 从字典数据中获取成本类型和成本项的英文显示名称（使用remark字段）
            // 尝试多种匹配方式
            var costCategoryItem = this.costCategoryOptions.find(function (item) { return item.value === option.costCategory })
            if (!costCategoryItem) {
                // 如果按value匹配不到，尝试按code匹配
                costCategoryItem = this.costCategoryOptions.find(function (item) { return item.code === option.costCategory })
            }
            if (!costCategoryItem) {
                // 如果还是匹配不到，尝试字符串匹配
                costCategoryItem = this.costCategoryOptions.find(function (item) { return item.value === String(option.costCategory) })
            }

            var costProjectItem = this.costProjectOptions.find(function (item) { return item.value === option.costProject })
            if (!costProjectItem) {
                // 如果按value匹配不到，尝试按code匹配
                costProjectItem = this.costProjectOptions.find(function (item) { return item.code === option.costProject })
            }
            if (!costProjectItem) {
                // 如果还是匹配不到，尝试字符串匹配
                costProjectItem = this.costProjectOptions.find(function (item) { return item.value === String(option.costProject) })
            }

            // 使用remark字段获取英文名称，如果没有remark则使用label作为后备
            var categoryNameEn = costCategoryItem ? (costCategoryItem.remark || costCategoryItem.label || 'Unknown Type(' + option.costCategory + ')') : 'Unknown Type(' + option.costCategory + ')'
            var projectNameEn = costProjectItem ? (costProjectItem.remark || costProjectItem.label || 'Unknown Project(' + option.costProject + ')') : 'Unknown Project(' + option.costProject + ')'

            return categoryNameEn + '-' + projectNameEn
        },

        // 清除表单验证错误
        clearValidationErrors: function () {
            // 清除所有表单的验证错误
            if (this.$refs.mainProductForm) {
                this.$refs.mainProductForm.clearValidate()
            }
            if (this.$refs.buttonForm) {
                this.$refs.buttonForm.clearValidate()
            }
            if (this.$refs.otherForm) {
                this.$refs.otherForm.clearValidate()
            }
        }
    }
}
</script>

<style lang="scss" scoped>
@import './styles/add-quote-dialog.scss';
</style>