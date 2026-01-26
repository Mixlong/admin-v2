<template>
  <div class="sample-form-wrapper">
    <table class="sample-form-table" border="1" cellspacing="0">
      <!-- 基础信息 -->
      <tr class="section-header">
        <td class="section-title" colspan="12">基础信息</td>
      </tr>
      <tr>
        <td class="label"><span class="required">*</span>需求客户</td>
        <td class="value"><RemoteSelect v-model="formData.requirementCustomerId" type="customer" custom-style="width:100%" /></td>
        <td class="label"><span class="required">*</span>需求品类</td>
        <td class="value"><RemoteSelect ref="categorySelectRef" v-model="formData.requirementCategoryId" type="category" custom-style="width:100%" @item-change="handleCategoryChange" /></td>
        <td class="label">仪表型号</td>
        <td class="value"><RemoteSelect v-model="formData.meterModelId" type="model" :category-id="formData.requirementCategoryId" :category-data="categoryData" custom-style="width:100%" /></td>
        <td class="label">订单类型</td>
        <td class="value">
          <el-select v-model="formData.orderType" size="small" style="width:100%">
            <el-option label="新单" :value="0" />
            <el-option label="反单" :value="1" />
          </el-select>
        </td>
        <td class="label">项目经理</td>
        <td class="value"><RemoteSelect v-model="formData.projectManager" type="projectManager" custom-style="width:100%" /></td>
        <td class="label">当前状态</td>
        <td class="value status-cell"><el-tag type="success" size="small">{{ formData.currentStatusName || '进行中' }}</el-tag></td>
      </tr>
      <tr>
        <td class="label">客户分级</td>
        <td class="value"><el-input v-model="formData.customerLevel" size="small" placeholder="请输入" /></td>
        <td class="label"><span class="required">*</span>需求数量</td>
        <td class="value"><el-input v-model="formData.requirementQuantity" size="small" placeholder="请输入" /></td>
        <td class="label">要求送样日期</td>
        <td class="value"><el-date-picker v-model="formData.requiredSampleDate" type="date" size="small" style="width:100%" value-format="YYYY-MM-DD" /></td>
        <td class="label">样品用途</td>
        <td class="value"><el-input v-model="formData.samplePurpose" size="small" placeholder="请输入" /></td>
        <td class="label">需求总表链接</td>
        <td class="value" colspan="3"><el-input v-model="formData.requirementLink" size="small" placeholder="请输入腾讯文档链接" /></td>
      </tr>

      <!-- 基础配置 -->
      <tr class="section-header">
        <td class="section-title" colspan="12">基础配置</td>
      </tr>
      <tr>
        <td class="label"><span class="required">*</span>通讯方式</td>
        <td class="value"><DictSelect v-model="formData.communicationType" dict-type="instrument_communication_type_1" /></td>
        <td class="label">通讯协议</td>
        <td class="value"><DictSelect v-model="formData.communicationProtocol" dict-type="sys_protocol" /></td>
        <td class="label"><span class="required">*</span>开关机电路</td>
        <td class="value"><DictSelect v-model="formData.powerCircuit" dict-type="instrument_controller_joint" /></td>
        <td class="label">电压</td>
        <td class="value"><DictSelect v-model="formData.voltage" dict-type="instrument_voltage" /></td>
        <td class="label"><span class="required">*</span>轮径</td>
        <td class="value"><DictSelect v-model="formData.wheelDiameter" :options="wheelDiameterOptions" label-key="label" value-key="value" /></td>
        <td colspan="2"></td>
      </tr>
      <tr>
        <td class="label"><span class="required">*</span>蓝牙功能</td>
        <td class="value">
          <el-select v-model="formData.bluetoothFunction" size="small" style="width:100%">
            <el-option label="YES" value="1" />
            <el-option label="NO" value="0" />
          </el-select>
        </td>
        <td class="label"><span class="required">*</span>蓝牙APP</td>
        <td class="value"><el-input v-model="formData.bluetoothApp" size="small" placeholder="请输入蓝牙APP" /></td>
        <td class="label">外设连接</td>
        <td class="value"><el-input v-model="formData.peripheralConnection" size="small" placeholder="请输入外设" /></td>
        <td class="label">外设数量</td>
        <td class="value"><el-input v-model="formData.peripheralQuantity" size="small" placeholder="请输入" /></td>
        <td colspan="4"></td>
      </tr>

      <!-- 外观配置 -->
      <tr class="section-header">
        <td class="section-title" colspan="12">外观配置</td>
      </tr>
      <tr>
        <td class="label">通讯线型号</td>
        <td class="value"><DictSelect v-model="formData.communicationCableModel" dict-type="instrument_controller_joint" /></td>
        <td class="label">线长(mm)</td>
        <td class="value"><el-input v-model="formData.communicationCableLength" size="small" placeholder="请输入线长" /></td>
        <td class="label">是否含头</td>
        <td class="value">
          <el-select v-model="formData.communicationCableHead" size="small" style="width:100%">
            <el-option label="含头" value="1" />
            <el-option label="不含头" value="0" />
          </el-select>
        </td>
        <td class="label">供线方式</td>
        <td class="value"><el-input v-model="formData.supplyMethod1" size="small" placeholder="请输入" /></td>
        <td class="label">线束类型</td>
        <td class="value"><el-input v-model="formData.wireType1" size="small" placeholder="请输入" /></td>
        <td class="label">线径</td>
        <td class="value"><el-input v-model="formData.wireDiameter1" size="small" placeholder="请输入" /></td>
      </tr>
      <tr>
        <td class="label">延长线型号</td>
        <td class="value"><DictSelect v-model="formData.extensionCableModel" dict-type="instrument_controller_joint" /></td>
        <td class="label">线长(mm)</td>
        <td class="value"><el-input v-model="formData.extensionCableLength" size="small" placeholder="请输入线长" /></td>
        <td class="label">是否含头</td>
        <td class="value">
          <el-select v-model="formData.extensionCableHead" size="small" style="width:100%">
            <el-option label="含头" value="1" />
            <el-option label="不含头" value="0" />
          </el-select>
        </td>
        <td class="label">供线方式</td>
        <td class="value"><el-input v-model="formData.supplyMethod2" size="small" placeholder="请输入" /></td>
        <td class="label">线束类型</td>
        <td class="value"><el-input v-model="formData.wireType2" size="small" placeholder="请输入" /></td>
        <td class="label">线径</td>
        <td class="value"><el-input v-model="formData.wireDiameter2" size="small" placeholder="请输入" /></td>
      </tr>
      <tr>
        <td class="label">按键型号</td>
        <td class="value"><DictSelect v-model="formData.buttonModel" dict-type="STS_KEY_TYPE" /></td>
        <td class="label">出线方式</td>
        <td class="value"><el-input v-model="formData.outputMethod" size="small" placeholder="请输入" /></td>
        <td class="label">按键【仪表端】接头</td>
        <td class="value"><el-input v-model="formData.buttonHead" size="small" placeholder="请输入接头型号" /></td>
        <td class="label">按键【按键端】接头</td>
        <td class="value"><el-input v-model="formData.buttonControlHead" size="small" placeholder="请输入接头型号" /></td>
        <td class="label">线长(mm)</td>
        <td class="value"><el-input v-model="formData.buttonCableLength" size="small" placeholder="请输入线长" /></td>
        <td class="label">线径</td>
        <td class="value"><el-input v-model="formData.wireDiameter3" size="small" placeholder="请输入" /></td>
      </tr>
      <tr>
        <td class="label">车把尺寸</td>
        <td class="value"><DictSelect v-model="formData.handlebarSize" dict-type="handleBar_size" /></td>
        <td class="label">其它要求</td>
        <td class="value" colspan="9"><el-input v-model="formData.otherRequirements" size="small" placeholder="请输入" /></td>
      </tr>

      <!-- 文件上传区域 -->
      <tr class="section-header">
        <td class="section-title" colspan="4">
          <div class="upload-title-row">
            <span>客户需求单</span>
            <el-icon class="add-icon" @click="customerDemandRef?.triggerUpload()"><Plus /></el-icon>
          </div>
        </td>
        <td class="section-title" colspan="4">
          <div class="upload-title-row">
            <span>过程记录</span>
            <el-icon class="add-icon" @click="processRecordRef?.triggerUpload()"><Plus /></el-icon>
          </div>
        </td>
        <td class="section-title" colspan="4">
          <div class="upload-title-row">
            <span>样品评审表</span>
            <el-icon class="add-icon" @click="sampleReviewRef?.triggerUpload()"><Plus /></el-icon>
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="4" class="upload-cell">
          <FileUpload
            ref="customerDemandRef"
            v-model="formData.customerDemandFiles"
            compact
            hide-header
            layout="row"
            :file-size="50"
            :limit="10"
            :file-type="['doc', 'docx', 'xls', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png']"
            empty-text="请上传样品单或其它需求来源"
            list-height="100px"
          />
        </td>
        <td colspan="4" class="upload-cell">
          <FileUpload
            ref="processRecordRef"
            v-model="formData.processRecordFiles"
            compact
            hide-header
            layout="row"
            :file-size="50"
            :limit="10"
            :file-type="['doc', 'docx', 'xls', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png']"
            empty-text="请上传半成品或特殊过程记录"
            list-height="100px"
          />
        </td>
        <td colspan="4" class="upload-cell">
          <FileUpload
            ref="sampleReviewRef"
            v-model="formData.sampleReviewFiles"
            compact
            hide-header
            layout="row"
            :file-size="50"
            :limit="10"
            :file-type="['doc', 'docx', 'xls', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png']"
            empty-text="请上传4表(需求&送样评审、组装评审、硬件评审、软件评审)"
            list-height="100px"
          />
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup name="SampleForm">
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import DictSelect from '@/components/DictSelect/index.vue'
import FileUpload from '@/components/FileUpload/index.vue'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

// 轮径数据（与 commonData.js 保持一致）
const wheelDiameterOptions = (() => {
  const data = {
    0: 16, 1: 18, 2: 20, 3: 22, 4: 24, 5: 26, 6: '700C', 7: 28
  }
  // 动态生成 8-99
  for (let i = 8; i < 100; i++) {
    data[i] = i * 0.5
  }
  return Object.entries(data).map(([key, val]) => ({ label: String(val), value: Number(key) }))
})()

// 品类数据
const categoryData = ref([])
const categorySelectRef = ref(null)

// 文件上传 refs
const customerDemandRef = ref(null)
const processRecordRef = ref(null)
const sampleReviewRef = ref(null)

// 表单数据双向绑定
const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 品类选择变化
function handleCategoryChange() {
  formData.value.meterModelId = ''
  if (categorySelectRef.value) {
    categoryData.value = categorySelectRef.value.getOptions() || []
  }
}

// 初始化品类数据
function initCategoryData() {
  nextTick(() => {
    setTimeout(() => {
      if (categorySelectRef.value) {
        categoryData.value = categorySelectRef.value.getOptions() || []
      }
    }, 500)
  })
}

// 暴露方法
defineExpose({ initCategoryData })
</script>


<style scoped lang="scss">
.sample-form-wrapper {
  overflow-x: auto;
}

.sample-form-table {
  width: 100%;
  min-width: 1600px;
  border-collapse: collapse;
  font-size: 12px;
  
  td {
    border: 1px solid #e0e0e0;
    padding: 6px 8px;
    vertical-align: middle;
  }
  
  .section-header {
    background: #fff;
  }
  
  .section-title {
    background: #e8f5e9;
    color: #2e7d32;
    font-weight: 600;
    font-size: 13px;
    padding: 8px 12px;
    
    .upload-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .add-icon {
        font-size: 16px;
        cursor: pointer;
        padding: 2px;
        border-radius: 2px;
        transition: all 0.2s;
        
        &:hover {
          background: rgba(46, 125, 50, 0.1);
          color: #1b5e20;
        }
      }
    }
  }
  
  .label {
    background: #f5f7fa;
    color: #333;
    font-weight: 500;
    white-space: nowrap;
    min-width: 80px;
    text-align: right;
    padding-right: 10px;
    
    .required {
      color: #f56c6c;
      margin-right: 2px;
    }
  }
  
  .value {
    min-width: 100px;
    
    :deep(.el-input),
    :deep(.el-select),
    :deep(.el-date-editor),
    :deep(.el-input-number) {
      width: 100%;
    }
    
    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      box-shadow: none;
      background: transparent;
    }
  }
  
  .status-cell {
    text-align: center;
  }
  
  .upload-cell {
    padding: 12px;
    vertical-align: top;
    background: #fff;
    min-height: 100px;
  }
}
</style>
