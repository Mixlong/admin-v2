<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="isEdit ? '编辑客户' : '新建客户'"
    width="1200px"
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
              <el-select v-model="form.customerSource" placeholder="请选择客户来源" style="width: 100%" clearable>
                <el-option
                  v-for="dict in dict.type.customer_source"
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
            <el-form-item label="客户状态" prop="customerStatus">
              <el-select v-model="form.customerStatus" placeholder="请选择客户状态" style="width: 100%">
                <el-option label="潜在客户" value="潜在客户" />
                <el-option label="意向客户" value="意向客户" />
                <el-option label="送样客户" value="送样客户" />
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
          <el-col :span="12">
            <el-form-item label="客户属性" prop="customerAttribute">
              <el-select v-model="form.customerAttribute" placeholder="请选择客户属性" style="width: 100%" clearable>
                <el-option
                  v-for="dict in dict.type.customer_attribute_enum"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
 
          <el-col :span="12">
            <el-form-item label="客户品牌" prop="customerBrand">
              <el-input v-model="form.customerBrand" placeholder="请输入客户品牌" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属国家" prop="country">
              <el-select
                v-model="form.country"
                placeholder="请选择或输入所属国家"
                style="width: 100%"
                clearable
                filterable
                allow-create
                default-first-option
              >
                <el-option
                  v-for="dict in dict.type.country_origin.slice().sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'))"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.label"
                />
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
            <el-form-item label="项目经理" prop="assistant">
              <el-select 
                v-model="form.assistant" 
                placeholder="请选择项目经理" 
                style="width: 100%"
                filterable
                clearable
              >
                <el-option 
                  v-for="user in projectManagerList" 
                  :key="user.userId" 
                  :label="user.nickName" 
                  :value="user.nickName" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="客户网址" prop="address">
          <el-input
            v-model="form.address"
            type="textarea"
            :rows="2"
            placeholder="请输入客户网址"
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
 
       <!-- 联系人信息 -->
       <fieldset class="form-fieldset contact-fieldset">
         <legend>
           <span>联系人信息</span>
           <el-button 
             type="text" 
             icon="el-icon-plus" 
             size="mini" 
             @click.stop="addContactRow"
           >
             新增联系人
           </el-button>
         </legend>
        
        <div v-if="contactList.length === 0" style="text-align: center; padding: 15px 0; color: #909399; font-size: 13px;">
          暂无联系人，请点击"新增联系人"按钮添加
        </div>
        
        <div v-else class="contact-table-wrapper">
          <el-table 
            :data="contactList" 
            border 
            size="small"
            max-height="250"
          >
          <el-table-column type="index" label="序号" width="55" align="center" />
          
          <el-table-column label="联系人姓名" width="120" align="center">
            <template slot-scope="{ row, $index }">
              <el-input 
                v-model="row.contactName" 
                placeholder="姓名" 
                size="mini"
                :disabled="isEdit && row.id && editingContactIndex !== $index"
                :class="{ 'is-required': !row.contactName }"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="部门" width="120" align="center">
            <template slot-scope="{ row, $index }">
              <el-input 
                v-model="row.department" 
                placeholder="部门" 
                size="mini"
                :disabled="isEdit && row.id && editingContactIndex !== $index"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="职位" width="120" align="center">
            <template slot-scope="{ row, $index }">
              <el-input 
                v-model="row.position" 
                placeholder="职位" 
                size="mini"
                :disabled="isEdit && row.id && editingContactIndex !== $index"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="邮箱"  align="center" width="140">
            <template slot-scope="{ row, $index }">
              <el-input 
                v-model="row.email" 
                placeholder="邮箱" 
                size="mini"
                :disabled="isEdit && row.id && editingContactIndex !== $index"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="其他联系方式" width="140" align="center">
            <template slot-scope="{ row, $index }">
              <el-input 
                v-model="row.contactPhone" 
                placeholder="联系方式" 
                size="mini"
                :disabled="isEdit && row.id && editingContactIndex !== $index"
              />
            </template>  
          </el-table-column>
          
          <el-table-column label="决策人" width="80" align="center">
            <template slot-scope="{ row, $index }">
              <el-switch
                v-model="row.isDecisionMaker"
                :active-value="1"
                :inactive-value="0"
                :disabled="isEdit && row.id && editingContactIndex !== $index"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="名片" width="220" align="center">
            <template slot-scope="{ row, $index }">
              <!-- 新增模式或新联系人：只显示上传组件 -->
              <template v-if="!isEdit || !row.id">
                <el-upload-sortable
                  v-model="row.cardImage"
                  :img-w="60"
                  :img-h="50"
                  accept="image/*"
                  :multiple="true"
                  :sortable="false"
                  :max="5"
                  :isDisabled="false"
                />
              </template>
              
              <!-- 编辑模式-已有联系人 -->
              <template v-else>
                <!-- 正在编辑当前行：显示上传组件 -->
                <template v-if="editingContactIndex === $index">
                  <el-upload-sortable
                    v-model="row.cardImage"
                    :img-w="60"
                    :img-h="50"
                    accept="image/*"
                    :multiple="true"
                    :sortable="false"
                    :max="5"
                    :isDisabled="false"
                  />
                </template>
                
                <!-- 未编辑状态：显示轮播图+查看 -->
                <template v-else>
                  <div v-if="row.cardImage && getImageList(row.cardImage).length > 0" style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                    <el-carousel 
                      v-if="getImageList(row.cardImage).length > 1"
                      height="50px" 
                      :autoplay="false" 
                      indicator-position="none"
                      arrow="hover"
                      :interval="4000"
                      style="width: 120px; border-radius: 4px; overflow: hidden;">
                      <el-carousel-item 
                        v-for="(img, imgIndex) in getImageList(row.cardImage)" 
                        :key="imgIndex">
                        <el-image
                          style="width: 60px; height: 50px"
                          :src="img"
                          :preview-src-list="getImageList(row.cardImage)"
                          :initial-index="imgIndex"
                          fit="cover">
                        </el-image>
                      </el-carousel-item>
                    </el-carousel>
                    <el-image
                      v-else
                      style="width: 60px; height: 50px; border-radius: 4px;"
                      :src="getImageList(row.cardImage)[0]"
                      :preview-src-list="getImageList(row.cardImage)"
                      fit="cover">
                    </el-image>
                    <el-tag size="mini" type="info">{{ getImageList(row.cardImage).length }}张</el-tag>
                  </div>
                  <span v-else style="color: #909399; font-size: 12px;">暂无名片</span>
                </template>
              </template>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="140" align="center" fixed="right">
            <template slot-scope="{ row, $index }">
              <!-- 新增模式：只显示删除 -->
              <template v-if="!isEdit">
                <el-button 
                  type="text" 
                  size="mini" 
                  @click="deleteContactRow($index)"
                  style="color: #F56C6C;"
                >
                  删除
                </el-button>
              </template>
              
              <!-- 编辑模式 -->
              <template v-else>
                <!-- 已有联系人 -->
                <template v-if="row.id">
                  <!-- 非编辑状态 -->
                  <template v-if="editingContactIndex !== $index">
                    <el-button 
                      type="text" 
                      size="mini" 
                      @click="startEditContact($index)"
                    >
                      编辑
                    </el-button>
                    <el-button 
                      type="text" 
                      size="mini" 
                      @click="deleteContactRow($index)"
                      style="color: #F56C6C;"
                    >
                      删除
                    </el-button>
                  </template>
                  <!-- 编辑状态 -->
                  <template v-else>
                    <el-button 
                      type="text" 
                      size="mini" 
                      @click="saveEditContact($index)"
                      style="color: #67C23A;"
                    >
                      保存
                    </el-button>
                    <el-button 
                      type="text" 
                      size="mini" 
                      @click="cancelEditContact($index)"
                    >
                      取消
                    </el-button>
                  </template>
                </template>
                
                <!-- 新增的联系人（没有id） -->
                <template v-else>
                  <el-button 
                    type="text" 
                    size="mini" 
                    @click="saveNewContact($index)"
                    style="color: #67C23A;"
                  >
                    保存
                  </el-button>
                  <el-button 
                    type="text" 
                    size="mini" 
                    @click="deleteContactRow($index)"
                    style="color: #F56C6C;"
                  >
                    删除
                  </el-button>
                </template>
              </template>
            </template>
          </el-table-column>
        </el-table>
        </div>
      </fieldset>
          <!-- 收货地址信息 -->
      <fieldset class="form-fieldset address-fieldset">
        <legend>
          <span>收货地址信息</span>
          <el-button 
            type="text" 
            icon="el-icon-plus" 
            size="mini" 
            @click.stop="addAddressRow"
          >
            新增收货地址
          </el-button>
        </legend>
        
        <div v-if="addressList.length === 0" style="text-align: center; padding: 15px 0; color: #909399; font-size: 13px;">
          暂无收货地址，请点击"新增收货地址"按钮添加
        </div>
        
        <div v-else class="address-table-wrapper">
          <el-table 
            :data="addressList" 
            border 
            size="small"
            max-height="250"
          >
            <el-table-column type="index" label="序号" width="55" align="center" />
            
            <el-table-column label="联系人姓名"  align="center" width="120">
              <template slot-scope="{ row, $index }">
                <el-input 
                  v-model="row.contactName" 
                  placeholder="姓名" 
                  size="mini"
                  :disabled="isEdit && row.id && editingAddressIndex !== $index"
                  :class="{ 'is-required': !row.contactName }"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="联系方式"   align="center">
              <template slot-scope="{ row, $index }">
                <el-input 
                  v-model="row.contactPhone" 
                  placeholder="联系方式" 
                  size="mini"
                  :disabled="isEdit && row.id && editingAddressIndex !== $index"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="收货地址" align="center" width="250">
              <template slot-scope="{ row, $index }">
                <el-input 
                  v-model="row.address" 
                  type="text"
                  placeholder="收货地址" 
                  size="mini"
                  :disabled="isEdit && row.id && editingAddressIndex !== $index"
                  :class="{ 'is-required': !row.address }"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="备注" align="center" width="180">
              <template slot-scope="{ row, $index }">
                <el-input 
                  v-model="row.remark" 
                  placeholder="备注" 
                  size="mini"
                  :disabled="isEdit && row.id && editingAddressIndex !== $index"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="140" align="center" fixed="right">
              <template slot-scope="{ row, $index }">
                <!-- 新增模式：只显示删除 -->
                <template v-if="!isEdit">
                  <el-button 
                    type="text" 
                    size="mini" 
                    @click="deleteAddressRow($index)"
                    style="color: #F56C6C;"
                  >
                    删除
                  </el-button>
                </template>
                
                <!-- 编辑模式 -->
                <template v-else>
                  <!-- 已有收货地址 -->
                  <template v-if="row.id">
                    <!-- 非编辑状态 -->
                    <template v-if="editingAddressIndex !== $index">
                      <el-button 
                        type="text" 
                        size="mini" 
                        @click="startEditAddress($index)"
                      >
                        编辑
                      </el-button>
                      <el-button 
                        type="text" 
                        size="mini" 
                        @click="deleteAddressRow($index)"
                        style="color: #F56C6C;"
                      >
                        删除
                      </el-button>
                    </template>
                    <!-- 编辑状态 -->
                    <template v-else>
                      <el-button 
                        type="text" 
                        size="mini" 
                        @click="saveEditAddress($index)"
                        style="color: #67C23A;"
                      >
                        保存
                      </el-button>
                      <el-button 
                        type="text" 
                        size="mini" 
                        @click="cancelEditAddress($index)"
                      >
                        取消
                      </el-button>
                    </template>
                  </template>
                  
                  <!-- 新增的收货地址（没有id） -->
                  <template v-else>
                    <el-button 
                      type="text" 
                      size="mini" 
                      @click="saveNewAddress($index)"
                      style="color: #67C23A;"
                    >
                      保存
                    </el-button>
                    <el-button 
                      type="text" 
                      size="mini" 
                      @click="deleteAddressRow($index)"
                      style="color: #F56C6C;"
                    >
                      删除
                    </el-button>
                  </template>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </fieldset>

      <!-- 深度调研 -->
      <fieldset class="form-fieldset">
        <legend>深度调研</legend>

        <el-row :gutter="20">
 
          <el-col :span="12">
            <el-form-item label="年出货量" prop="annualShipments">
              <el-input-number v-model="form.annualShipments" placeholder="请输入年出货量" style="width: 100%" :min="0" />
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
        </el-row>
        
      </fieldset>

       <!-- 财务信息 -->
      <fieldset class="form-fieldset">
        <legend>财务信息</legend>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="付款条件" prop="paymentTerm">
                <el-input
                 v-model="form.paymentTerm"
                 placeholder="请输入付款条件"
                />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="币种" prop="taxType">
              <el-select v-model="form.taxType" placeholder="请选择" style="width: 100%">
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
import { dictPmProject, dictMkProject } from '@/api/third/project'
import { 
  getContactsByCustomerId, 
  addCustomerContact, 
  updateCustomerContact,
  deleteCustomerContact 
} from '@/api/third/customerContact'
import {
  listCustomerAddress,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress
} from '@/api/crm/customerAddress'

import ElUploadSortable from '@/components/el-upload-sortable'

export default {
  name: 'CustomerFormModal',
  dicts: ['customer_type_enum', 'control_type', 'product_intention', 'tax_type', 'bank_account', 'country_origin', 'customer_source','customer_attribute_enum'],
  components: {
    ElUploadSortable
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
          { required: false, message: '请选择销售负责人', trigger: 'change' }
        ],
        vatRate: [
          { pattern: /^([0-9]{1,2}(\.[0-9]{1,2})?|100(\.0{1,2})?)$/, message: '请输入0-100之间的数值', trigger: 'blur' }
        ],
        annualShipments: [
          { pattern: /^[0-9]+$/, message: '请输入正整数', trigger: 'blur' }
        ]
      },
      // 用户数据
      userList: [], // 销售负责人列表
      projectManagerList: [], // 项目经理列表
      settlementPeriodOptions: [],
      // 联系人列表
      contactList: [],
      // 记录原始联系人ID，用于判断是新增还是更新
      originalContactIds: [],
      // 正在编辑的联系人索引
      editingContactIndex: null,
      // 编辑前的联系人数据备份
      contactBackup: null,
      // 收货地址列表
      addressList: [],
      // 记录原始收货地址ID，用于判断是新增还是更新
      originalAddressIds: [],
      // 正在编辑的收货地址索引
      editingAddressIndex: null,
      // 编辑前的收货地址数据备份
      addressBackup: null
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
          // 如果是编辑模式，加载联系人列表和收货地址列表
          if (newCustomer.id) {
            await this.loadCustomerContacts(newCustomer.id)
            await this.loadCustomerAddresses(newCustomer.id)
          }
          Object.assign(this.form, {
            // 基本信息字段
            id: newCustomer.id || '',
            name: newCustomer.name || '',
            no: newCustomer.no || '',
            customerBrand: newCustomer.customerBrand || '',
            country: newCustomer.country || '',
            customerStatus: newCustomer.customerStatus,
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
      if (val) {
        this.$nextTick(async () => {
          if (this.customer) {
            // 编辑模式：填充表单数据
          console.log('弹窗打开后重新填充表单数据')
            await this.fillFormData()
          } else {
            // 新增模式：重置表单
            console.log('新增模式：重置表单')
            this.resetForm()
          }
        })
      }
    }
  },
  mounted() {
    this.loadSettlementPeriodOptions()
    this.getUserList()
    this.getProjectManagerList()
  },
  methods: {
    // 处理多图显示 - 将逗号分隔的URL字符串转换为数组
    getImageList(imgStr) {
      if (!imgStr) return []
      return imgStr.split(',').filter(url => url.trim() !== '')
    },
    
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
      
      // 重置联系人列表
      this.contactList = []
      this.originalContactIds = []
      this.editingContactIndex = null
      this.contactBackup = null
      
      // 重置收货地址列表
      this.addressList = []
      this.originalAddressIds = []
      this.editingAddressIndex = null
      this.addressBackup = null
      
      // 清空表单验证状态
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.resetFields()
          this.$refs.formRef.clearValidate()
        }
      })
    },

    async fillFormData() {
      if (!this.customer) return
      
      // 填充表单数据
      Object.assign(this.form, {
        // 基本信息字段
        id: this.customer.id || '',
        name: this.customer.name || '',
        no: this.customer.no || '',
        customerBrand: this.customer.customerBrand || '',
        country: this.customer.country || '',
        customerStatus: this.customer.customerStatus,
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
      
          // 加载联系人列表和收货地址列表
          if (this.customer.id) {
            await this.loadCustomerContacts(this.customer.id)
            await this.loadCustomerAddresses(this.customer.id)
          }
      
      console.log('fillFormData 完成后的表单数据:', this.form)
      console.log('fillFormData 完成后的联系人数据:', this.contactList)
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

      // 新增模式：验证联系人姓名和收货地址联系人姓名
      if (!this.isEdit) {
        const hasEmptyContactName = this.contactList.some(contact => !contact.contactName)
        if (hasEmptyContactName) {
          this.$message.warning('请填写所有联系人姓名')
          return
        }
        const hasEmptyAddressContactName = this.addressList.some(address => !address.contactName)
        if (hasEmptyAddressContactName) {
          this.$message.warning('请填写所有收货地址联系人姓名')
          return
        }
      }

      this.loading = true

      try {
        if (!this.isEdit) {
          this.generateCode()
        }

        const payload = this.buildSubmitPayload()
        const requestFn = this.isEdit ? updateSoCustomer : addSoCustomer
        const res = await requestFn(payload)

        if (res.code === 200 || res.code === 0) {
          // 新增模式：customerContactList 会自动创建联系人，不需要单独调用接口
          // 编辑模式：联系人已经通过独立的编辑/新增/删除按钮处理，也不需要这里处理
          
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

      // 只在新增模式下添加联系人列表和收货地址列表
      if (!this.isEdit) {
        if (this.contactList && this.contactList.length > 0) {
          payload.customerContactList = this.contactList.map(contact => ({
            id: contact.id || undefined,
            contactName: contact.contactName || '',
            department: contact.department || '',
            position: contact.position || '',
            email: contact.email || '',
            contactPhone: contact.contactPhone || '',
            wechat: contact.wechat || '',
            isDecisionMaker: contact.isDecisionMaker || 0,
            belongDepartment: contact.belongDepartment || '',
            responsiblePerson: contact.responsiblePerson || '',
            collaborator: contact.collaborator || '',
            contactDetails: contact.contactDetails || '',
            cardImage: contact.cardImage || '',
            customerId: this.form.id || ''
          }))
        }
        
        if (this.addressList && this.addressList.length > 0) {
          payload.customerAddressList = this.addressList.map(address => ({
            id: address.id || undefined,
            contactName: address.contactName || '',
            contactPhone: address.contactPhone || '',
            remark: address.remark || '',
            customerId: this.form.id || ''
          }))
        }
      }

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


    // 获取销售负责人列表 - 使用市场字典接口
    async getUserList() {
      try {
        const response = await dictMkProject()
        if (response && response.data) {
          let list = []
          // 处理不同的数据结构
          if (Array.isArray(response.data)) {
            list = response.data.map(item => ({
              userId: item.id || item.dictValue,
              userName: item.dictValue || item.userName || item.name,
              nickName: item.dictLabel || item.nickName || item.userName || item.name
            }))
          } else if (response.data.list) {
            list = response.data.list.map(item => ({
              userId: item.id || item.dictValue,
              userName: item.dictValue || item.userName || item.name,
              nickName: item.dictLabel || item.nickName || item.userName || item.name
            }))
          }
          
          // 去重处理
          const uniqueUsers = []
          const userNameSet = new Set()
          list.forEach(user => {
            if (!userNameSet.has(user.userName)) {
              userNameSet.add(user.userName)
              uniqueUsers.push(user)
            }
          })
          
          this.userList = uniqueUsers
        }
      } catch (error) {
        console.error('获取销售负责人列表失败:', error)
      }
    },

    // 获取项目经理列表 - 使用项目经理字典接口
    async getProjectManagerList() {
      try {
        const response = await dictPmProject()
        if (response && response.data) {
          let list = []
          // 处理不同的数据结构
          if (Array.isArray(response.data)) {
            list = response.data.map(item => ({
              userId: item.id || item.dictValue,
              userName: item.dictValue || item.userName || item.name,
              nickName: item.dictLabel || item.nickName || item.userName || item.name
            }))
          } else if (response.data.list) {
            list = response.data.list.map(item => ({
              userId: item.id || item.dictValue,
              userName: item.dictValue || item.userName || item.name,
              nickName: item.dictLabel || item.nickName || item.userName || item.name
            }))
          }
          
          // 去重处理
          const uniqueUsers = []
          const userNameSet = new Set()
          list.forEach(user => {
            if (!userNameSet.has(user.userName)) {
              userNameSet.add(user.userName)
              uniqueUsers.push(user)
            }
          })
          
          this.projectManagerList = uniqueUsers
        }
      } catch (error) {
        console.error('获取项目经理列表失败:', error)
      }
    },

    // ==================== 联系人相关方法 ====================
    
    // 加载客户联系人列表
    async loadCustomerContacts(customerId) {
      if (!customerId) {
        this.contactList = []
        return
      }
      
      try {
        const res = await getContactsByCustomerId(customerId)
        if (res.code === 200 && res.data) {
          this.contactList = res.data.map(contact => ({
            id: contact.id,
            contactName: contact.contactName || '',
            department: contact.department || '',
            position: contact.position || '',
            email: contact.email || '',
            contactPhone: contact.contactPhone || '',
            wechat: contact.wechat || '',
            isDecisionMaker: contact.isDecisionMaker || 0,
            belongDepartment: contact.belongDepartment || '',
            responsiblePerson: contact.responsiblePerson || '',
            collaborator: contact.collaborator || '',
            contactDetails: contact.contactDetails || '',
            cardImage: contact.cardImage || '',
            customerId: customerId
          }))
          // 记录原始联系人ID
          this.originalContactIds = this.contactList.map(c => c.id).filter(id => id)
        } else {
          this.contactList = []
        }
      } catch (error) {
        console.error('加载联系人列表失败:', error)
        this.contactList = []
      }
    },
    
    // 添加联系人行
    addContactRow() {
      this.contactList.push({
        id: null, // 新增的联系人没有ID
        contactName: '',
        department: '',
        position: '',
        email: '',
        contactPhone: '',
        wechat: '',
        isDecisionMaker: 0,
        belongDepartment: '',
        responsiblePerson: '',
        collaborator: '',
        contactDetails: '',
        cardImage: '',
        customerId: this.form.id || ''
      })
    },
    
    // 开始编辑联系人
    startEditContact(index) {
      // 保存当前编辑的索引
      this.editingContactIndex = index
      // 备份原始数据
      this.contactBackup = { ...this.contactList[index] }
    },
    
    // 保存编辑的联系人
    async saveEditContact(index) {
      const contact = this.contactList[index]
      
      // 验证联系人姓名
      if (!contact.contactName) {
        this.$message.warning('请填写联系人姓名')
        return
      }
      
      try {
        const contactData = {
          id: contact.id,
          contactName: contact.contactName || '',
          department: contact.department || '',
          position: contact.position || '',
          email: contact.email || '',
          contactPhone: contact.contactPhone || '',
          wechat: contact.wechat || '',
          isDecisionMaker: contact.isDecisionMaker || 0,
          belongDepartment: contact.belongDepartment || '',
          responsiblePerson: contact.responsiblePerson || '',
          collaborator: contact.collaborator || '',
          contactDetails: contact.contactDetails || '',
          cardImage: contact.cardImage || '',
          customerId: this.form.id
        }
        
        const res = await updateCustomerContact(contactData)
        
        if (res.code === 200) {
          this.$message.success('联系人更新成功')
          this.editingContactIndex = null
          this.contactBackup = null
          // 重新加载联系人列表
          await this.loadCustomerContacts(this.form.id)
        } else {
          this.$message.error(res.msg || '更新失败')
        }
      } catch (error) {
        console.error('更新联系人失败:', error)
        this.$message.error('更新失败')
      }
    },
    
    // 取消编辑联系人
    cancelEditContact(index) {
      // 恢复原始数据
      if (this.contactBackup) {
        this.$set(this.contactList, index, { ...this.contactBackup })
      }
      this.editingContactIndex = null
      this.contactBackup = null
    },
    
    // 保存新增的联系人
    async saveNewContact(index) {
      const contact = this.contactList[index]
      
      // 验证联系人姓名
      if (!contact.contactName) {
        this.$message.warning('请填写联系人姓名')
        return
      }
      
      try {
        const contactData = {
          contactName: contact.contactName || '',
          department: contact.department || '',
          position: contact.position || '',
          email: contact.email || '',
          contactPhone: contact.contactPhone || '',
          wechat: contact.wechat || '',
          isDecisionMaker: contact.isDecisionMaker || 0,
          belongDepartment: contact.belongDepartment || '',
          responsiblePerson: contact.responsiblePerson || '',
          collaborator: contact.collaborator || '',
          contactDetails: contact.contactDetails || '',
          cardImage: contact.cardImage || '',
          customerId: this.form.id
        }
        
        const res = await addCustomerContact(contactData)
        
        if (res.code === 200) {
          this.$message.success('联系人添加成功')
          // 重新加载联系人列表
          await this.loadCustomerContacts(this.form.id)
        } else {
          this.$message.error(res.msg || '添加失败')
        }
      } catch (error) {
        console.error('添加联系人失败:', error)
        this.$message.error('添加失败')
      }
    },
    
    // 删除联系人行
    async deleteContactRow(index) {
      const contact = this.contactList[index]
      
      // 编辑模式下，如果是已保存的联系人，需要调用删除API
      if (this.isEdit && contact.id) {
        try {
          await this.$confirm('确定要删除该联系人吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          
          await deleteCustomerContact(contact.id)
          this.$message.success('删除成功')
          // 重新加载联系人列表
          await this.loadCustomerContacts(this.form.id)
        } catch (error) {
          if (error !== 'cancel') {
            console.error('删除联系人失败:', error)
            this.$message.error('删除失败')
          }
        }
      } else {
        // 新增模式或未保存的联系人，直接从列表中移除
        this.contactList.splice(index, 1)
      }
    },
    
    // 注意：不再需要批量保存联系人的方法
    // 新增模式：联系人通过 customerContactList 字段自动创建
    // 编辑模式：联系人通过表格中的"保存"按钮单独处理（saveEditContact 和 saveNewContact）
    
    // ==================== 收货地址相关方法 ====================
    
    // 加载客户收货地址列表
    async loadCustomerAddresses(customerId) {
      if (!customerId) {
        this.addressList = []
        return
      }
      
      try {
        const res = await listCustomerAddress({ customerId })
        if (res.code === 200 && res.data) {
          this.addressList = (res.data.list || res.data || []).map(address => ({
            id: address.id,
            contactName: address.contactName || '',
            contactPhone: address.contactPhone || '',
            remark: address.remark || '',
            customerId: customerId
          }))
          // 记录原始收货地址ID
          this.originalAddressIds = this.addressList.map(a => a.id).filter(id => id)
        } else {
          this.addressList = []
        }
      } catch (error) {
        console.error('加载收货地址列表失败:', error)
        this.addressList = []
      }
    },
    
    // 添加收货地址行
    addAddressRow() {
      this.addressList.push({
        id: null, // 新增的收货地址没有ID
        contactName: '',
        contactPhone: '',
        address: '',
        remark: '',
        customerId: this.form.id || ''
      })
    },
    
    // 开始编辑收货地址
    startEditAddress(index) {
      // 保存当前编辑的索引
      this.editingAddressIndex = index
      // 备份原始数据
      this.addressBackup = { ...this.addressList[index] }
    },
    
    // 保存编辑的收货地址
    async saveEditAddress(index) {
      const address = this.addressList[index]
      
      // 验证联系人姓名
      if (!address.contactName) {
        this.$message.warning('请填写联系人姓名')
        return
      }
      
      try {
        const addressData = {
          id: address.id,
          contactName: address.contactName || '',
          contactPhone: address.contactPhone || '',
          remark: address.remark || '',
          customerId: this.form.id
        }
        
        const res = await updateCustomerAddress(addressData)
        
        if (res.code === 200) {
          this.$message.success('收货地址更新成功')
          this.editingAddressIndex = null
          this.addressBackup = null
          // 重新加载收货地址列表
          await this.loadCustomerAddresses(this.form.id)
        } else {
          this.$message.error(res.msg || '更新失败')
        }
      } catch (error) {
        console.error('更新收货地址失败:', error)
        this.$message.error('更新失败')
      }
    },
    
    // 取消编辑收货地址
    cancelEditAddress(index) {
      // 恢复原始数据
      if (this.addressBackup) {
        this.$set(this.addressList, index, { ...this.addressBackup })
      }
      this.editingAddressIndex = null
      this.addressBackup = null
    },
    
    // 保存新增的收货地址
    async saveNewAddress(index) {
      const address = this.addressList[index]
      
      // 验证联系人姓名
      if (!address.contactName) {
        this.$message.warning('请填写联系人姓名')
        return
      }
      
      try {
        const addressData = {
          contactName: address.contactName || '',
          contactPhone: address.contactPhone || '',
          remark: address.remark || '',
          customerId: this.form.id
        }
        
        const res = await addCustomerAddress(addressData)
        
        if (res.code === 200) {
          this.$message.success('收货地址添加成功')
          // 重新加载收货地址列表
          await this.loadCustomerAddresses(this.form.id)
        } else {
          this.$message.error(res.msg || '添加失败')
        }
      } catch (error) {
        console.error('添加收货地址失败:', error)
        this.$message.error('添加失败')
      }
    },
    
    // 删除收货地址行
    async deleteAddressRow(index) {
      const address = this.addressList[index]
      
      // 编辑模式下，如果是已保存的收货地址，需要调用删除API
      if (this.isEdit && address.id) {
        try {
          await this.$confirm('确定要删除该收货地址吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          
          await deleteCustomerAddress(address.id)
          this.$message.success('删除成功')
          // 重新加载收货地址列表
          await this.loadCustomerAddresses(this.form.id)
        } catch (error) {
          if (error !== 'cancel') {
            console.error('删除收货地址失败:', error)
            this.$message.error('删除失败')
          }
        }
      } else {
        // 新增模式或未保存的收货地址，直接从列表中移除
        this.addressList.splice(index, 1)
      }
    },
    
    // 注意：不再需要批量保存收货地址的方法
    // 新增模式：收货地址通过 customerAddressList 字段自动创建
    // 编辑模式：收货地址通过表格中的"保存"按钮单独处理（saveEditAddress 和 saveNewAddress）
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

/* 联系人表格样式 */
.contact-fieldset legend {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 收货地址表格样式 */
.address-fieldset legend {
  display: flex;
  align-items: center;
  gap: 10px;
}

.address-table-wrapper {
  margin-top: 10px;
}

/* 必填项样式 */
.is-required :deep(.el-input__inner) {
  border-color: #F56C6C;
}
 
/* 名片上传组件样式调整 */
.contact-table-wrapper :deep(.el-upload-sortable) {
  display: flex;
  justify-content: center;
  align-items: center;
}

.contact-table-wrapper :deep(.upload-queue) {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
}

/* 名片轮播图样式 */
.contact-table-wrapper :deep(.el-carousel__arrow) {
  background-color: rgba(0, 0, 0, 0.5);
}

.contact-table-wrapper :deep(.el-carousel__item) {
  display: flex;
  justify-content: center;
  align-items: center;
}

.contact-table-wrapper :deep(.el-image) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
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
