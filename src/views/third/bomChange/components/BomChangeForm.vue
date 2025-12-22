<template>
  <el-dialog :title="title" :visible.sync="open" :width="isAttachmentOnly ? '600px' : '70%'" append-to-body :close-on-click-modal="false" top="0vh"
    custom-class="  dialog-scroll">
    <div class="form-container">
      <el-form ref="form" :model="form" :rules="rules" label-width="140px" @submit.native.prevent class="modern-form">
        <!-- 基本信息卡片 -->

        <div class="form-section" v-if="!isAttachmentOnly">
          <div class="section-header">
            <div class="header-left">
              <i class="el-icon-document"></i>
              <span class="section-title">基本信息</span>
            </div>
          </div>
          <div class="section-content">


            <!-- 流程信息区域 -->
            <div class="info-group">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="流程编号" prop="processCode">
                    <el-input v-model="form.processCode" placeholder="系统自动生成" :disabled="true"
                      prefix-icon="el-icon-document-copy" size="small" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="申请部门" prop="dept"
                    :rules="[{ required: true, message: '请选择申请部门', trigger: 'change' }]">
                    <treeselect v-model="form.dept" :options="deptOptions" :disable-branch-nodes="true"
                      :show-count="true" placeholder="请选择申请部门" :clearable="true" :searchable="true"
                      :default-expand-level="0" @input="handleDeptChange" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="申请人员" prop="deptPerson"
                    :rules="[{ required: true, message: '请选择申请人员', trigger: 'change' }]">
                    <el-select v-model="form.deptPerson" placeholder="请选择申请人员" filterable clearable size="small"
                      style="width: 100%">

                      <el-option v-for="item in applicantList" :key="item.userId" :label="item.nickName"
                        :value="item.userId" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 客户订单信息表格 -->
            <div class="info-group">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="客户名称" prop="customer"
                    :rules="[{ required: true, message: '请输入客户名称', trigger: 'blur' }]">
                    <select-loadMore v-model="form.customer" :data="customerData.data" :page="customerData.page"
                      :hasMore="customerData.more" dictLabel="name" dictValue="name" :request="getCustomerData"
                      size="small" placeholder="请选择客户名称" style="width:100%;">
                    </select-loadMore>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="配置型号" prop="configModel"
                    :rules="[{ required: true, message: '请输入配置型号', trigger: 'blur' }]">
                    <el-select filterable remote clearable v-model="form.configModel" placeholder="请选择配置型号"
                      :remote-method="getComputerNameList" size="small" style="width:100%">
                      <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name"
                        :value="dict.name" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="客户通知变更时间" prop="customerNoticeTime"
                    :rules="[{ required: true, message: '请选择客户通知变更时间', trigger: 'change' }]">
                    <el-date-picker v-model="form.customerNoticeTime" type="datetime" placeholder="请选择客户通知变更时间"
                      format="yyyy-MM-dd" value-format="yyyy-MM-dd HH:mm:ss" size="small" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              
        
            </div>

            <!-- BOM变更信息区域 -->
            <div class="info-group">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="变更前BOM编码" prop="beforeOrderBom">
                    <el-input v-model="form.beforeOrderBom" placeholder="请输入变更前BOM编码" size="small" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="变更后BOM编码" prop="afterOrderBom">
                    <el-input v-model="form.afterOrderBom" placeholder="请输入变更后BOM编码" size="small" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="订单数量" prop="orderNum"
                    :rules="[{ required: true, message: '请输入订单数量', trigger: 'blur' }]">
                    <el-input-number v-model="form.orderNum" placeholder="请输入订单数量" :min="1" :precision="0"
                      controls-position="right" size="small" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
       
                <el-col :span="8">
                  <el-form-item label="变更说明" prop="changeInfo">
                    <el-input v-model="form.changeInfo" placeholder="请输入变更说明" type="textarea" :rows="4"
                      class="modern-textarea"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="16">
              <!-- 变更分类 - 动态结构 -->
              <el-form-item label="变更分类" prop="changeValidation">
                <div class="category-selection-compact">
                  <!-- 动态渲染变更分类 -->
                  <div class="change-categories">
                    <div v-for="item in orderChangeTypes" :key="item.id" class="category-item">
                      <el-checkbox v-model="item.check" size="small" class="category-checkbox">
                        <i :class="getCategoryIcon(item.id)"></i> {{ item.label }}
                      </el-checkbox>

                      <!-- 如果是订单变更且被选中，显示子选项（单选） -->
                      <div v-if="item.id === 3 && item.check && item.list.length > 0" class="sub-categories">
                        <div class="sub-category-title">请选择具体变更类型：</div>
                        <div class="sub-category-options">
                          <el-radio-group :value="getSelectedOrderChangeType()" @input="handleOrderChangeTypeSelect"
                            size="small">
                            <el-radio v-for="subItem in item.list" :key="subItem.value" :label="subItem.value"
                              class="sub-category-radio">
                              {{ subItem.label }}
                            </el-radio>
                          </el-radio-group>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-form-item>
                </el-col>
              </el-row>
                             <!-- 订单BOM变更通知信息表格 -->
              <el-form-item label="" prop="infoList" label-width="0">
                <div class="order-notice-section">
                  <div style="text-align: right; padding-bottom: 12px;">
                    <el-button type="primary" icon="el-icon-plus" size="small" @click="addOrderNoticeRow">
                      添加订单信息
                    </el-button>
                  </div>
                <el-table :data="form.infoList" border style="width: 100%" size="small">
                  <el-table-column label="序号" type="index" width="60" align="center" />
                  
                  <el-table-column label="客户单号" prop="customerNo"  >
                    <template slot="header">
                      客户单号 <span style="color: #f56c6c;">*</span>
                    </template>
                    <template slot-scope="scope">
                      <el-input 
                        v-model="scope.row.customerNo" 
                        placeholder="请输入客户单号" 
                        size="mini"
                      />
                    </template>
                  </el-table-column>
                  
                  <el-table-column label="U8单号" prop="uuNo"  >
                    <template slot="header">
                      U8单号 <span style="color: #f56c6c;">*</span>
                    </template>
                    <template slot-scope="scope">
                      <el-input 
                        v-model="scope.row.uuNo" 
                        placeholder="请输入U8单号" 
                        size="mini"
                      />
                    </template>
                  </el-table-column>
                  
                  <el-table-column label="E树单号" prop="treeNo"  >
                    <template slot="header">
                      E树单号 <span style="color: #f56c6c;">*</span>
                    </template>
                    <template slot-scope="scope">
                      <el-input 
                        v-model="scope.row.treeNo" 
                        placeholder="请输入E树单号" 
                        size="mini"
                      />
                    </template>
                  </el-table-column>
                  
                  <el-table-column label="原下单日期" prop="originalOrderTime"  >
                    <template slot="header">
                      原下单日期 <span style="color: #f56c6c;">*</span>
                    </template>
                    <template slot-scope="scope">
                      <el-date-picker 
                        v-model="scope.row.originalOrderTime" 
                        placeholder="请选择日期" 
                        type="date" 
                        format="yyyy-MM-dd" 
                        value-format="yyyy-MM-dd HH:mm:ss" 
                        size="mini" 
                        style="width: 100%"
                      />
                    </template>
                  </el-table-column>
                  
                  <el-table-column label="原计划交期" prop="originalPlanTime"  >
                    <template slot="header">
                      原计划交期 <span style="color: #f56c6c;">*</span>
                    </template>
                    <template slot-scope="scope">
                      <el-date-picker 
                        v-model="scope.row.originalPlanTime" 
                        placeholder="请选择日期" 
                        type="date" 
                        format="yyyy-MM-dd" 
                        value-format="yyyy-MM-dd HH:mm:ss" 
                        size="mini" 
                        style="width: 100%"
                      />
                    </template>
                  </el-table-column>
                  
                  <el-table-column label="操作" width="120" align="center">
                    <template slot-scope="scope">
                      <el-button 
                        type="text" 
                        icon="el-icon-copy-document" 
                        size="mini"
                        @click="copyOrderNoticeRow(scope.$index)"
                        title="复制"
                      >
                        复制
                      </el-button>
                      <el-button 
                        type="text" 
                        icon="el-icon-delete" 
                        size="mini"
                        @click="deleteOrderNoticeRow(scope.$index)"
                        :disabled="form.infoList.length <= 1"
                        style="color: #f56c6c;"
                        title="删除"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                </div>
              </el-form-item>
            </div>
          </div>
   
        </div>


        <!-- 变更涉及领域 -->
        <div class="form-section" v-if="!isAttachmentOnly">
          <div class="section-header">
            <i class="el-icon-s-cooperation"></i>
            <span class="section-title">变更涉及领域</span>
          </div>
          <div class="section-content">
            <!-- 隐藏的全局部门验证项 -->
            <el-form-item prop="departmentValidation" style="display: none;">
              <el-input v-model="form.departmentValidation" />
            </el-form-item>

            <div class="department-grid-2x2">
              <!-- PMC部门 -->
              <div class="department-card">
                <div class="department-header">
                  <i class="el-icon-s-management department-icon pmc-icon"></i>
                  <span class="department-name">PMC</span>
                </div>
                <div class="department-content">
                  <el-form-item prop="selPmcData" label="负责人员">
                    <el-select v-model="form.selPmcData" placeholder="请选择PMC人员" filterable clearable
                      :disable="form.firstState == 1" multiple :loading="pmcData.length === 0" size="small"
                      class="modern-select" @change="(val) => handleMultiSelectChange('PMC', val)">
                      <el-option v-for="item in pmcData" :label="item.personnel" :value="item.personnel"
                        :key="item.id"></el-option>
                    </el-select>
                  </el-form-item>

                  <!-- <el-form-item label="在制产品处理方案" prop="pmcTxt">
                    <el-input v-model="form.pmcTxt" clearable placeholder="订单暂停、订单取消、物料变更、数量减少、软件变更情况下涉及填写"
                      type="textarea" :rows="4" class="modern-textarea"></el-input>
                  </el-form-item> -->
                </div>
              </div>

              <!-- 采购部门 -->
              <div class="department-card">
                <div class="department-header">
                  <i class="el-icon-shopping-cart-2 department-icon purchase-icon"></i>
                  <span class="department-name">采购</span>
                </div>
                <div class="department-content">
                  <el-form-item prop="selBuyerData" label="负责人员">
                    <el-select v-model="form.selBuyerData" placeholder="请选择采购人员" filterable clearable
                      :disable="form.firstState == 1" :loading="buyerData.length === 0" size="small" multiple
                      class="modern-select" @change="(val) => handleMultiSelectChange('采购', val)">
                      <el-option v-for="item in buyerData" :label="item.personnel" :value="item.personnel"
                        :key="item.id"></el-option>
                    </el-select>
                  </el-form-item>
                  <!-- 
                  <el-form-item label="在途物料处理方案" prop="buyerTxt">
                    <el-input v-model="form.buyerTxt" clearable placeholder="订单暂停、订单取消、物料变更及数量减少情况下涉及填写" type="textarea"
                      :rows="4" class="modern-textarea"></el-input>
                  </el-form-item> -->
                </div>
              </div>

              <!-- 研发部门 -->
              <div class="department-card">
                <div class="department-header">
                  <i class="el-icon-cpu department-icon rd-icon"></i>
                  <span class="department-name">研发</span>
                </div>
                <div class="department-content">
                  <el-form-item prop="selResearchData" label="负责人员">
                    <el-select v-model="form.selResearchData" placeholder="请选择研发人员" filterable clearable
                      :disable="form.firstState == 1" :loading="researchData.length === 0" size="small" multiple
                      class="modern-select" @change="(val) => handleMultiSelectChange('研发', val)">
                      <el-option v-for="item in researchData" :label="item.personnel" :value="item.personnel"
                        :key="item.id"></el-option>
                    </el-select>
                  </el-form-item>

                  <!-- <el-form-item label="涉及更新的文件" prop="researchDataTxt">
                    <el-input v-model="form.researchDataTxt" clearable placeholder="物料变更及软件变更情况下涉及填写" type="textarea"
                      :rows="9" class="modern-textarea"></el-input>
                  </el-form-item> -->
                </div>
              </div>

              <!-- 市场部门 -->
              <div class="department-card">
                <div class="department-header">
                  <i class="el-icon-s-marketing department-icon market-icon"></i>
                  <span class="department-name">市场</span>
                </div>
                <div class="department-content">
                  <el-form-item prop="selMarketerData" label="负责人员">
                    <el-select v-model="form.selMarketerData" placeholder="请选择市场人员" filterable clearable
                      :disable="form.firstState == 1" :loading="marketerData.length === 0" size="small" multiple
                      class="modern-select" @change="(val) => handleMultiSelectChange('市场', val)">
                      <el-option v-for="item in marketerData" :label="item.personnel" :value="item.personnel"
                        :key="item.id"></el-option>
                    </el-select>
                  </el-form-item>
                  <!-- 
                  <el-form-item label="在库成品处理方案" prop="finishedHandleTxt">
                    <el-input v-model="form.finishedHandleTxt" clearable placeholder="订单暂停、订单取消、物料变更、数量减少、软件变更情况下涉及填写"
                      type="textarea" :rows="4" class="modern-textarea"></el-input>
                  </el-form-item>

                  <el-form-item label="在库物料处理方案" prop="warehouseDataTxt">
                    <el-input v-model="form.warehouseDataTxt" clearable placeholder="订单暂停、订单取消、物料变更、数量减少、软件变更情况下涉及填写"
                      type="textarea" :rows="4" class="modern-textarea"></el-input>
                  </el-form-item> -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 审核人员 -->
        <div class="form-section" v-if="!isAttachmentOnly">
          <div class="section-header">
            <i class="el-icon-s-check"></i>
            <span class="section-title">审核人员</span>
          </div>
          <div class="section-content">
            <el-row>
              <el-col :span="8">
                <el-form-item label="初审人员" prop="firstPerson" :rules="[
                  {
                    required: true,
                    message: '请选择初审人员',
                    trigger: 'change',
                  },
                ]">
                  <el-select v-model="form.firstPerson" placeholder="请选择初审人员" filterable clearable :disabled="!!form.id"
                    :loading="firstAuditorData.length === 0" size="small" class="modern-select"
                    prefix-icon="el-icon-user-solid">
                    <el-option v-for="item in firstAuditorData" :label="item.personnel" :value="item.personnel"
                      :key="item.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="终审人员" prop="secondPerson" :rules="[
                  {
                    required: true,
                    message: '请选择终审人员',
                    trigger: 'change',
                  },
                ]">
                  <el-select v-model="form.secondPerson" placeholder="请选择终审人员" filterable clearable
                    :disabled="!!form.id" :loading="finalJudgmentData.length === 0" size="small" class="modern-select"
                    prefix-icon="el-icon-user-solid">
                    <el-option v-for="item in finalJudgmentData" :label="item.personnel" :value="item.personnel"
                      :key="item.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>

            </el-row>
          </div>
        </div>

        <!-- 开始执行领域 -->
        <div class="form-section" v-if="!isAttachmentOnly">
          <div class="section-header">
            <i class="el-icon-s-operation"></i>
            <span class="section-title">开始执行领域</span>
          </div>
          <div class="section-content">
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="系统变更人员" prop="systemPerson">
                  <el-select v-model="form.systemPerson" placeholder="请选择系统变更人员" filterable clearable
                    :loading="executeSystemData.length === 0" size="small" class="modern-select"
                    prefix-icon="el-icon-user-solid">
                    <el-option v-for="item in executeSystemData" :label="item.personnel" :value="item.personnel"
                      :key="item.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="订单变更人员" prop="orderChangePerson">
                  <el-select v-model="form.orderChangePerson" placeholder="请选择订单变更人员" filterable clearable
                    :loading="executeOrderData.length === 0" size="small" class="modern-select"
                    prefix-icon="el-icon-user-solid">
                    <el-option v-for="item in executeOrderData" :label="item.personnel" :value="item.personnel"
                      :key="item.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="工单变更人员" prop="workOrderChangePerson">
                  <el-select v-model="form.workOrderChangePerson" placeholder="请选择工单变更人员" filterable clearable
                    :loading="executeWorkOrderData.length === 0" size="small" class="modern-select"
                    prefix-icon="el-icon-user-solid">
                    <el-option v-for="item in executeWorkOrderData" :label="item.personnel" :value="item.personnel"
                      :key="item.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 附件上传 -->
        <div class="form-section">
          <div class="section-header">
            <i class="el-icon-paperclip"></i>
            <span class="section-title">附件</span>
          </div>
          <div class="section-content">
            <el-form-item label="附件上传" prop="file">
              <DrUpload v-model="form.file" :drag="true" :multiple="true" :limit="10" accept="*"
                :css="{ width: '100%' }" class="modern-upload">

              </DrUpload>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel" size="small" class="cancel-btn">
        取 消
      </el-button>
      <el-button type="primary" @click="submitForm" size="small" class="submit-btn">
        {{ isApprovalMode ? '提交审批' : '确 定' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addBomOrderChange, updateBomOrderChange } from "@/api/third/bomChange"
import { BomPersonList } from "@/api/third/ecn"
import DrUpload from "@/components/MyUpload"
import Treeselect from "@riophae/vue-treeselect";
import { listDept } from "@/api/system/dept";
import { listUser } from '@/api/system/user'
import {
  getCustomerList,
} from "@/api/order";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { computerNameList } from "@/api/third/fileConfig";
export default {
  name: "BomChangeForm",
  components: {
    DrUpload,
    Treeselect
  },
  data() {
    return {
      // 型号
      computerOptions: [],
      // 对话框标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否为审批模式
      isApprovalMode: false,
      // 是否为仅附件模式
      isAttachmentOnly: false,
      // 表单参数 - 简化的数据结构
      form: {
        // 主表单数据
        id: null,
        processCode: '',
        customer: '',
        customerNo: '',
        uuNo: '',
        treeNo: '',
        orderBom: '',
        configModel: '',
        orderNum: null,
        originalOrderTime: '',
        originalPlanTime: '',
        customerNoticeTime: '',
        dept: '',
        deptPerson: '',
        // 变更分类 - 标准化字段
        isPause: false,        // 是否订单暂停
        isCancel: false,       // 是否订单取消
        isOrderChange: false,  // 是否订单变更
        orderChangeType: '',   // 订单变更具体类型：MATERIAL_CHANGE, QTY_INCREASE, QTY_DECREASE, SOFTWARE_CHANGE
        changeReason: '',      // 变更原因描述
        file: '',
        // 审核相关
        firstState: null,
        firstResult: '',
        firstPerson: '',
        secondState: null,
        secondResult: '',
        secondPerson: '',
        secondRemark: '',
        systemState: null,
        systemPerson: '',
        // BOM变更相关
        beforeOrderBom: '',
        afterOrderBom: '',
        orderChangeState: null,
        orderChangeResult: '',
        workOrderChangeState: null,
        workOrderChangePerson: '',
        workOrderChangeResult: '',
        // 开始执行领域
        executeSystemPerson: '',      // 系统变更人员
        executeOrderPerson: '',       // 订单变更人员
        executeWorkOrderPerson: '',   // 工单变更人员
        // 系统字段
        createBy: '',
        createTime: '',
        updateBy: '',
        updateTime: '',
        status: null,
        // 部门字段数据 - 包含ID用于编辑
        selPmcData: [],
        pmcTxt: '',
        pmcId: null, // 重要：保存PMC记录的ID
        selBuyerData: [],
        buyerTxt: '',
        buyerId: null, // 重要：保存采购记录的ID
        selResearchData: [],
        researchDataTxt: '',
        researchId: null, // 重要：保存研发记录的ID
        selMarketerData: [],
        finishedHandleTxt: '',
        warehouseDataTxt: '',
        marketerId: null, // 重要：保存市场记录的ID
        // 部门验证字段
        departmentValidation: ''
      },
      customerData: {
        data: [],
        page: 1,
        more: true,
      },
      // 表单校验
      rules: {
        customer: [
          { required: true, message: "客户名称不能为空", trigger: "blur" }
        ],
        infoList: [
          {
            validator: (rule, value, callback) => {
              if (!this.form.infoList || this.form.infoList.length === 0) {
                callback(new Error('请至少添加一条订单信息'));
                return;
              }
              
              // 检查每行数据的完整性
              for (let i = 0; i < this.form.infoList.length; i++) {
                const item = this.form.infoList[i];
                if (!item.customerNo) {
                  callback(new Error(`第${i + 1}行客户单号不能为空`));
                  return;
                }
                if (!item.uuNo) {
                  callback(new Error(`第${i + 1}行U8单号不能为空`));
                  return;
                }
                if (!item.treeNo) {
                  callback(new Error(`第${i + 1}行E树单号不能为空`));
                  return;
                }
                if (!item.originalOrderTime) {
                  callback(new Error(`第${i + 1}行原下单日期不能为空`));
                  return;
                }
                if (!item.originalPlanTime) {
                  callback(new Error(`第${i + 1}行原计划交期不能为空`));
                  return;
                }
              }
              callback();
            },
            trigger: 'change'
          }
        ],
        configModel: [
          { required: true, message: "配置型号不能为空", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "订单数量不能为空", trigger: "blur" }
        ],

        customerNoticeTime: [
          { required: true, message: "客户通知变更时间不能为空", trigger: "change" }
        ],
        dept: [
          { required: true, message: "申请部门不能为空", trigger: "change" }
        ],
        changeInfo: [
          { required: true, message: "变更说明不能为空", trigger: "change" }
        ],
        deptPerson: [
          { required: true, message: "申请人员不能为空", trigger: "change" }
        ],
        changeValidation: [
          {
            validator: (rule, value, callback) => {
              // 至少选择一个变更分类
              const hasChecked = this.orderChangeTypes.some(item => item.check);
              if (!hasChecked) {
                callback(new Error('请至少选择一个变更分类'));
                return;
              }

              // 如果选择了订单变更，必须选择具体的变更类型（单选）
              const orderChangeItem = this.orderChangeTypes.find(item => item.id === 3);
              if (orderChangeItem && orderChangeItem.check) {
                const selectedCount = orderChangeItem.list.filter(subItem => subItem.check).length;
                if (selectedCount === 0) {
                  callback(new Error('选择订单变更时，请选择具体的变更类型'));
                  return;
                }
                if (selectedCount > 1) {
                  callback(new Error('订单变更类型只能选择一个'));
                  return;
                }
              }

              callback();
            },
            trigger: "change"
          }
        ],
        firstPerson: [
          { required: true, message: "初审人员不能为空", trigger: "change" }
        ],
        secondPerson: [
          { required: true, message: "终审人员不能为空", trigger: "change" }
        ],
        systemPerson: [
          { required: false, message: "系统变更人员不能为空", trigger: "change" }
        ],
        orderChangePerson: [
          { required: true, message: "订单变更人员不能为空", trigger: "change" }
        ],
        workOrderChangePerson: [
          { required: true, message: "工单变更人员不能为空", trigger: "change" }
        ],
        file: [
          { required: false, message: "附件不能为空", trigger: "change" }
        ],
        departmentValidation: [
          {
            validator: this.validateDepartments,
            trigger: "change"
          }
        ]
      },
      // 人员数据
      systemChangeData: [],     // 系统变更人员
      firstAuditorData: [],     // 初审人员
      finalJudgmentData: [],    // 终审人员
      buyerData: [],            // 采购人员
      QAData: [],               // 品检人员
      productData: [],          // 生产人员
      engineerData: [],         // 工程人员
      researchData: [],         // 研发人员
      warehouseData: [],        // 仓库人员
      marketerData: [],         // 市场人员
      pmcData: [],              // PMC人员
      applicantList: [], // 申请人员下拉
      // 开始执行领域人员数据
      executeSystemData: [],    // 系统变更人员 (type: 11)
      executeOrderData: [],     // 订单变更人员 (type: 12)
      executeWorkOrderData: [], // 工单变更人员 (type: 13)
      // 部门数据
      deptOptions: [],          // 部门选项
      // 变更类型配置 - 支持嵌套结构和check状态
      orderChangeTypes: [
        {
          label: '订单暂停',
          id: 1,
          check: false,
          list: []
        },
        {
          label: '订单取消',
          id: 2,
          check: false,
          list: []
        },
        {
          label: '订单变更',
          id: 3,
          check: false,
          list: [
            { value: 'MATERIAL_CHANGE', label: '物料变更', check: false },
            { value: 'QTY_INCREASE', label: '数量增加', check: false },
            { value: 'QTY_DECREASE', label: '数量减少', check: false },
            { value: 'SOFTWARE_CHANGE', label: '软件变更', check: false }
          ]
        }
      ]
    };
  },
  computed: {
    // 获取订单变更项
    orderChangeItem() {
      return this.orderChangeTypes.find(item => item.id === 3);
    },

    // 检查是否有选中的订单变更子类型
    hasSelectedOrderChangeType() {
      const orderChangeItem = this.orderChangeItem;
      return orderChangeItem && orderChangeItem.list.some(item => item.check);
    }
  },
  created() {
    this.getTreeselect();
  },
  watch: {
    // 监听申请部门变化，联动申请人员
    'form.dept'(newVal) {
      this.handleDeptChange(newVal);
    },
    // 深度监听 orderChangeTypes 变化，触发表单验证
    orderChangeTypes: {
      handler() {
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.validateField('changeValidation');
        });
      },
      deep: true
    },
    // 监听对话框打开状态，确保新增时部门字段为空
    open(newVal) {
      if (newVal && !this.isApprovalMode && !this.form.id) {
        // 只有在新增模式且没有ID时才清空部门字段
        this.$nextTick(() => {
          if (this.form.dept !== null && this.form.dept !== '') {
            this.form.dept = null;
          }
        });
      }
    },

    // 监听部门字段变化，触发全局部门验证
    'form.selPmcData'() {
      this.triggerDepartmentValidation();
    },
    'form.pmcTxt'() {
      this.triggerDepartmentValidation();
    },
    'form.selBuyerData'() {
      this.triggerDepartmentValidation();
    },
    'form.buyerTxt'() {
      this.triggerDepartmentValidation();
    },
    'form.selResearchData'() {
      this.triggerDepartmentValidation();
    },
    'form.researchDataTxt'() {
      this.triggerDepartmentValidation();
    },
    'form.selMarketerData'() {
      this.triggerDepartmentValidation();
    },
    'form.finishedHandleTxt'() {
      this.triggerDepartmentValidation();
    },
    'form.warehouseDataTxt'() {
      this.triggerDepartmentValidation();
    }
  },
  methods: {
    // 型号
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = false;
        computerNameList({
          name,
        }).then((res) => {
          this.computerOptions = res.data;
        });
      } else {
        this.computerOptions = [];
      }
    },
    getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getCustomerList({
          p: page,
          name: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          list.filter((item) => item.status === 0);

          if (more) {
            this.customerData.data = [...this.customerData.data, ...list];
          } else {
            this.customerData.data = list;
          }
          this.customerData.more = pageNum * pageSize < total;
          this.customerData.page = pageNum;
          resolve();
        });
      });
    },
    /**
     * 检查指定部门的信息是否完整
     * @param {string} departmentType - 部门类型：'pmc', 'buyer', 'research', 'marketer'
     * @returns {boolean} - 部门信息是否完整
     */
    isDepartmentComplete(departmentType) {
      switch (departmentType) {
        case 'pmc':
          // return !!(this.form.selPmcData && this.form.selPmcData.length > 0 && this.form.pmcTxt);
          return !!(this.form.selPmcData && this.form.selPmcData.length > 0);
        case 'buyer':
          // return !!(this.form.selBuyerData && this.form.selBuyerData.length > 0 && this.form.buyerTxt);
          return !!(this.form.selBuyerData && this.form.selBuyerData.length > 0);
        case 'research':
          // return !!(this.form.selResearchData && this.form.selResearchData.length > 0 && this.form.researchDataTxt);
          return !!(this.form.selResearchData && this.form.selResearchData.length > 0);
        case 'marketer':
          // return !!(this.form.selMarketerData && this.form.selMarketerData.length > 0 && this.form.finishedHandleTxt && this.form.warehouseDataTxt);
          return !!(this.form.selMarketerData && this.form.selMarketerData.length > 0);
        default:
          return false;
      }
    },

    /**
     * 变更涉及领域验证器
     * @param {*} rule - 验证规则
     * @param {*} value - 字段值
     * @param {Function} callback - 回调函数
     */
    validateDepartments(rule, value, callback) {
      // 检查所有四个变更涉及领域的完整性
      const departments = ['pmc', 'buyer', 'research', 'marketer'];
      const hasCompleteDepart = departments.some(dept => this.isDepartmentComplete(dept));

      if (!hasCompleteDepart) {
        callback(new Error('请至少选择一个变更涉及领域并填写完整信息（负责人员）'));
        return;
      }

      callback();
    },

    /**
     * 触发部门验证
     */
    triggerDepartmentValidation() {
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.validateField('departmentValidation');
        }
      });
    },

    /** 查询部门下拉树结构 */
    getTreeselect() {
      listDept().then((res) => {
        const data = res.data.map((item) => {
          return {
            parentId: item.parentId,
            id: item.deptId,
            label: item.deptName,
            // 确保没有默认选中状态
            isSelected: false,
            isDefaultExpanded: false
          };
        });

        this.deptOptions = this.handleTree(data);
        console.log('部门选项数据:', this.deptOptions);
      });
    },
    // 获取人员列表 - 参考 ECN 组件
    getPeopleList(type) {
      BomPersonList({ type, p: 1, l: 50 }).then((res) => {
        const { list } = res.data;

        switch (type) {
          case 1:
            this.firstAuditorData = list;
            break;
          case 2:
            this.buyerData = list;
            break;
          case 3:
            this.QAData = list;
            break;
          case 4:
            this.productData = list;
            break;
          case 5:
            this.engineerData = list;
            break;
          case 6:
            this.researchData = list;
            break;
          case 7:
            this.warehouseData = list;
            break;
          case 8:
            this.marketerData = list;
            break;
          case 9:
            this.finalJudgmentData = list;
            break;
          case 10:
            this.pmcData = list;
            break;
          case 11:
            this.executeSystemData = list;
            break;
          case 12:
            this.executeOrderData = list;
            break;
          case 13:
            this.executeWorkOrderData = list;
            break;
        }
      }).catch(() => {
      });
    },
    /** 获取分类图标 */
    getCategoryIcon(id) {
      const iconMap = {
        1: 'el-icon-video-pause',  // 订单暂停
        2: 'el-icon-close',        // 订单取消
        3: 'el-icon-edit'          // 订单变更
      };
      return iconMap[id] || 'el-icon-document';
    },

    /** 获取当前选中的订单变更类型 */
    getSelectedOrderChangeType() {
      const orderChangeItem = this.orderChangeTypes.find(item => item.id === 3);
      if (orderChangeItem && orderChangeItem.list) {
        const selectedItem = orderChangeItem.list.find(item => item.check);
        return selectedItem ? selectedItem.value : '';
      }
      return '';
    },

    /** 处理订单变更类型选择（单选） */
    handleOrderChangeTypeSelect(value) {
      const orderChangeItem = this.orderChangeTypes.find(item => item.id === 3);
      if (orderChangeItem && orderChangeItem.list) {
        // 先清空所有选择
        orderChangeItem.list.forEach(item => {
          item.check = false;
        });

        // 设置选中的项
        if (value) {
          const selectedItem = orderChangeItem.list.find(item => item.value === value);
          if (selectedItem) {
            selectedItem.check = true;
          }
        }
      }
    },

    /** 解析变更分类数据并回显 */
    parseChangeData(data) {
      if (!data) return;

      // 重置所有选择状态
      this.resetChangeTypes();

      // 如果是JSON字符串，解析它
      if (typeof data === 'string') {
        try {
          const changeData = JSON.parse(data);

          // 如果是新格式（数组结构）
          if (Array.isArray(changeData)) {
            changeData.forEach(item => {
              const targetItem = this.orderChangeTypes.find(type => type.id === item.id);
              if (targetItem) {
                targetItem.check = item.check || false;

                // 处理子项（单选逻辑）
                if (item.list && Array.isArray(item.list)) {
                  // 先清空所有选择
                  targetItem.list.forEach(sub => {
                    sub.check = false;
                  });

                  // 找到选中的项（应该只有一个）
                  const selectedSubItem = item.list.find(subItem => subItem.check);
                  if (selectedSubItem) {
                    const targetSubItem = targetItem.list.find(sub => sub.value === selectedSubItem.value);
                    if (targetSubItem) {
                      targetSubItem.check = true;
                    }
                  }
                }
              }
            });
          }
          // 兼容旧格式
          else if (changeData.categories) {
            if (changeData.categories.includes('订单暂停')) {
              this.orderChangeTypes[0].check = true;
            }
            if (changeData.categories.includes('订单取消')) {
              this.orderChangeTypes[1].check = true;
            }
            if (changeData.categories.includes('订单变更')) {
              this.orderChangeTypes[2].check = true;
              // 设置具体的变更类型（单选）
              if (changeData.changeType) {
                // 先清空所有选择
                this.orderChangeTypes[2].list.forEach(item => {
                  item.check = false;
                });
                // 设置选中的项
                const subItem = this.orderChangeTypes[2].list.find(item => item.value === changeData.changeType);
                if (subItem) {
                  subItem.check = true;
                }
              }
            }
          }
        } catch (error) {
          console.warn('解析changeCause失败:', error);
        }
      }
    },

    /** 重置变更类型选择状态 */
    resetChangeTypes() {
      this.orderChangeTypes.forEach(item => {
        item.check = false;
        if (item.list) {
          item.list.forEach(subItem => {
            subItem.check = false;
          });
        }
      });
    },
    /**
     * 根据部门加载成员，并可选回显申请人
     * @param {String|Number} deptId 部门ID
     * @param {String|Number} applicantId 需要回显的申请人userId（可选）
     */
    loadApplicantListByDept(deptId, applicantId = null) {
      this.form.deptPerson = '';
      if (deptId) {
        // 确保部门ID是数字类型
        const numericDeptId = Number(deptId);
        listUser({ deptId: numericDeptId, p: 1, l: 999 }).then(res => {
          if (res.code === 200 && res && Array.isArray(res.rows)) {
            this.applicantList = res.rows;
            if (applicantId) {
              // 确保申请人ID是数字类型
            this.form.deptPerson = Number(applicantId);
            }
          } else {
            this.applicantList = [];
          }
        });
      } else {
        this.applicantList = [];
      }
    },
    /** 申请部门变化时，动态加载成员 */
    handleDeptChange(deptId) {
      // 确保部门ID有效时才加载成员
      if (deptId && deptId !== null && deptId !== '') {
        // 确保部门ID是数字类型
        const numericDeptId = Number(deptId);
        this.loadApplicantListByDept(numericDeptId);
      } else {
        // 部门为空时清空申请人员列表
        this.applicantList = [];
        this.form.deptPerson = '';
      }
    },

    /** 打开对话框 */
    async openDialog(row, isApproval = false, attachmentOnly = false) {
      this.reset();
      this.isApprovalMode = isApproval;
      this.isAttachmentOnly = attachmentOnly;

      // 等待所有人员数据加载完成
      await Promise.all([
        this.getPeopleList(1),
        this.getPeopleList(2),
        this.getPeopleList(3),
        this.getPeopleList(4),
        this.getPeopleList(5),
        this.getPeopleList(6),
        this.getPeopleList(7),
        this.getPeopleList(8),
        this.getPeopleList(9),
        this.getPeopleList(10),
        this.getPeopleList(11),  // 系统变更人员
        this.getPeopleList(12),  // 订单变更人员
        this.getPeopleList(13)   // 工单变更人员
      ]);

      if (row && row.dept) {
        this.loadApplicantListByDept(row.dept, row.deptPerson);
      }

      if (row) {
        // 直接赋值主表单数据
        Object.assign(this.form, row);

        // 确保部门ID类型正确（转换为数字类型以匹配部门选项的id）
        if (row.dept) {
          this.form.dept = Number(row.dept);
          console.log('编辑模式 - 部门ID:', this.form.dept, '类型:', typeof this.form.dept);
        }

        // 处理订单BOM变更通知详情列表
        if (row.infoList && Array.isArray(row.infoList)) {
          this.form.infoList = row.infoList.map(item => ({
            changeNoticeId: item.changeNoticeId || this.form.id,
            customerNo: item.customerNo || '',
            uuNo: item.uuNo || '',
            treeNo: item.treeNo || '',
            originalOrderTime: item.originalOrderTime || '',
            originalPlanTime: item.originalPlanTime || ''
          }));
        } else {
          // 如果没有详情列表，创建一行默认数据
          this.form.infoList = [{
            changeNoticeId: this.form.id,
            customerNo: row.customerNo || '',
            uuNo: row.uuNo || '',
            treeNo: row.treeNo || '',
            originalOrderTime: row.originalOrderTime || '',
            originalPlanTime: row.originalPlanTime || ''
          }];
        }

        // 解析变更分类数据并回显
        this.parseChangeData(row.changeCause || row);

        // 重点：正确映射部门字段数据和ID
        this.mapDepartmentFieldsWithIds(row.list || []);

        this.title = attachmentOnly ? "上传附件" : (isApproval ? "审批订单变更" : "修改订单变更");
      } else {
        this.title = "新增订单变更";
        // 明确设置部门相关字段为空，确保不会显示默认值
        this.form.dept = null;
        this.form.deptPerson = '';
        this.form.processCode = 'order' + new Date().getTime();
        // 初始化一行订单信息
        this.form.infoList = [{
          changeNoticeId: null,
          customerNo: '',
          uuNo: '',
          treeNo: '',
          originalOrderTime: '',
          originalPlanTime: ''
        }];
      }

      this.open = true;
    },

    /** 映射部门字段数据和ID - 核心方法 */
    mapDepartmentFieldsWithIds(listData) {
      // 按field字段分组
      const fieldMap = {};
      listData.forEach(item => {
        if (!fieldMap[item.field]) fieldMap[item.field] = [];
        fieldMap[item.field].push(item);
      });

      // PMC数据 (field: 10) - 支持多选
      if (fieldMap[10] && fieldMap[10].length > 0) {
        const pmcNames = fieldMap[10].map(item => item.fieldName);
        this.$set(this.form, 'selPmcData', pmcNames);
        // 使用第一个记录的programme和id
        const pmcData = fieldMap[10][0];
        this.$set(this.form, 'pmcTxt', pmcData.programme);
        this.$set(this.form, 'pmcId', pmcData.id); // 重要：保存ID
      }

      // 采购数据 (field: 2) - 支持多选
      if (fieldMap[2] && fieldMap[2].length > 0) {
        const buyerNames = fieldMap[2].map(item => item.fieldName);
        this.$set(this.form, 'selBuyerData', buyerNames);
        // 使用第一个记录的programme和id
        const buyerData = fieldMap[2][0];
        this.$set(this.form, 'buyerTxt', buyerData.programme);
        this.$set(this.form, 'buyerId', buyerData.id); // 重要：保存ID
      }

      // 研发数据 (field: 6) - 支持多选
      if (fieldMap[6] && fieldMap[6].length > 0) {
        const researchNames = fieldMap[6].map(item => item.fieldName);
        this.$set(this.form, 'selResearchData', researchNames);
        // 使用第一个记录的programme和id
        const researchData = fieldMap[6][0];
        this.$set(this.form, 'researchDataTxt', researchData.programme);
        this.$set(this.form, 'researchId', researchData.id); // 重要：保存ID
      }

      // 市场数据 (field: 8) - 支持多选
      if (fieldMap[8] && fieldMap[8].length > 0) {
        const marketNames = fieldMap[8].map(item => item.fieldName);
        this.$set(this.form, 'selMarketerData', marketNames);
        // 使用第一个记录的programme和id
        const marketData = fieldMap[8][0];
        this.$set(this.form, 'finishedHandleTxt', marketData.programme);
        this.$set(this.form, 'warehouseDataTxt', marketData.treatment || '');
        this.$set(this.form, 'marketerId', marketData.id); // 重要：保存ID
      }

      // 调试信息
      console.log('ID映射结果:', {
        pmcId: this.form.pmcId,
        buyerId: this.form.buyerId,
        researchId: this.form.researchId,
        marketerId: this.form.marketerId
      });
      console.log('多选数据回显:', {
        selPmcData: this.form.selPmcData,
        selBuyerData: this.form.selBuyerData,
        selResearchData: this.form.selResearchData,
        selMarketerData: this.form.selMarketerData
      });
    },

    /** 表单重置 */
    reset() {
      // 重置变更类型选择状态
      this.resetChangeTypes();

      // 重置表单对象到初始状态
      this.form = {
        // 主表单数据
        id: null,
        processCode: '',
        customer: '',
        customerNo: '',
        uuNo: '',
        treeNo: '',
        orderBom: '',
        configModel: '',
        orderNum: null,
        originalOrderTime: '',
        originalPlanTime: '',
        customerNoticeTime: '',
        dept: null, // 修改：使用null而不是空字符串，确保treeselect组件不会显示默认值
        deptPerson: '',
        changeCause: '', // 存储JSON字符串
        file: '',
        // 审核相关
        firstState: null,
        firstResult: '',
        firstPerson: '',
        secondState: null,
        secondResult: '',
        secondPerson: '',
        secondRemark: '',
        systemState: null,
        systemPerson: '',
        // BOM变更相关
        beforeOrderBom: '',
        afterOrderBom: '',
        orderChangeState: null,
        orderChangeResult: '',
        workOrderChangeState: null,
        workOrderChangePerson: '',
        workOrderChangeResult: '',
        // 开始执行领域
        systemPerson: '',      // 系统变更人员
        orderChangePerson: '',       // 订单变更人员
        workOrderChangePerson: '',   // 工单变更人员
        // 系统字段
        createBy: '',
        createTime: '',
        updateBy: '',
        updateTime: '',
        status: null,
        // 部门字段数据 - 包含ID
        selPmcData: [],
        pmcTxt: '',
        pmcId: null,
        selBuyerData: [],
        buyerTxt: '',
        buyerId: null,
        selResearchData: [],
        researchDataTxt: '',
        researchId: null,
        selMarketerData: [],
        finishedHandleTxt: '',
        warehouseDataTxt: '',
        marketerId: null,
        // 部门验证字段
        changeInfo: '',
        departmentValidation: ''
      };
      
      // 初始化至少一行订单信息
      this.addOrderNoticeRow();

      // 重置表单验证
      this.resetForm("form");
    },

    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },

    /** 表单提交 */
    submitForm() {
      // 手动验证部门信息
      const departmentValid = this.validateDepartmentManually();
      
      // 手动验证订单信息表格
      const infoListValid = this.validateInfoListManually();

      this.$refs["form"].validate(valid => {
        if (valid && departmentValid && infoListValid) {
          // 新增/修改逻辑
          this.handleSave();
        } else {
          console.log('表单验证失败');
          if (!departmentValid) {
            this.$message.error('请至少填写一个部门的信息（人员和处理方案）');
          }
          if (!infoListValid) {
            this.$message.error('订单信息表格中存在必填字段未填写，请检查');
          }
        }
      });
    },

    /** 手动验证订单信息表格 */
    validateInfoListManually() {
      if (!this.form.infoList || this.form.infoList.length === 0) {
        this.$message.error('请至少添加一条订单信息');
        return false;
      }
      
      // 检查每行数据的完整性
      for (let i = 0; i < this.form.infoList.length; i++) {
        const item = this.form.infoList[i];
        if (!item.customerNo) {
          this.$message.error(`第${i + 1}行客户单号不能为空`);
          return false;
        }
        if (!item.uuNo) {
          this.$message.error(`第${i + 1}行U8单号不能为空`);
          return false;
        }
        if (!item.treeNo) {
          this.$message.error(`第${i + 1}行E树单号不能为空`);
          return false;
        }
        if (!item.originalOrderTime) {
          this.$message.error(`第${i + 1}行原下单日期不能为空`);
          return false;
        }
        if (!item.originalPlanTime) {
          this.$message.error(`第${i + 1}行原计划交期不能为空`);
          return false;
        }
      }
      return true;
    },

    /** 手动验证部门信息 */
    validateDepartmentManually() {
      const departments = ['pmc', 'buyer', 'research', 'marketer'];
      const hasCompleteDepart = departments.some(dept => this.isDepartmentComplete(dept));

      console.log('部门验证结果:', {
        pmc: {
          hasData: this.form.selPmcData && this.form.selPmcData.length > 0,
          hasText: true || !!this.form.pmcTxt,
          complete: this.isDepartmentComplete('pmc')
        },
        buyer: {
          hasData: true || this.form.selBuyerData && this.form.selBuyerData.length > 0,
          hasText: true || !!this.form.buyerTxt,
          complete: this.isDepartmentComplete('buyer')
        },
        research: {
          hasData: true || this.form.selResearchData && this.form.selResearchData.length > 0,
          hasText: true || !!this.form.researchDataTxt,
          complete: this.isDepartmentComplete('research')
        },
        marketer: {
          hasData: true || this.form.selMarketerData && this.form.selMarketerData.length > 0,
          hasText: true || !!(this.form.finishedHandleTxt && this.form.warehouseDataTxt),
          complete: this.isDepartmentComplete('marketer')
        },
        hasCompleteDepart
      });

      return hasCompleteDepart;
    },

    /** 保存处理 */
    handleSave() {
      // 构建提交数据 - 简化版本
      const submitData = this.buildSubmitData();
      // 提交数据
      if (submitData.id != null) {
        updateBomOrderChange(submitData).then(() => {
          this.$modal.msgSuccess("修改成功");
          this.open = false;
          this.$emit("ok");
        }).catch(error => {
          console.error('更新失败:', error);
          this.$modal.msgError("修改失败");
        });
      } else {
        addBomOrderChange(submitData).then(() => {
          this.$modal.msgSuccess("新增成功");
          this.open = false;
          this.$emit("ok");
        }).catch(error => {
          console.error('新增失败:', error);
          this.$modal.msgError("新增失败");
        });
      }
    },

    /** 构建提交数据 - 核心方法 */
    buildSubmitData() {
      // 复制主表单数据
      const submitData = { ...this.form };

      // 构建新格式的变更分类数据
      submitData.changeCause = this.buildChangeCauseData();

      // 构建部门字段列表 - 支持多选
      const list = [];

      // PMC数据 - 多选处理
      if (this.form.selPmcData && this.form.selPmcData.length > 0) {
        this.form.selPmcData.forEach((name) => {
          const pmcItem = {
            field: 10,
            fieldName: name,
            programme: this.form.pmcTxt || '',
            isCorrelation: 1,
            isComplete: 1
          };

          // 设置bomChangeId为下拉框选中人员的ID
          const selectedPmcUser = this.pmcData.find(user => user.personnel === name);
          if (selectedPmcUser) {
            pmcItem.bomChangeId = selectedPmcUser.id;
          }
          list.push(pmcItem);
        });
      }

      // 采购数据 - 多选处理
      if (this.form.selBuyerData && this.form.selBuyerData.length > 0) {
        this.form.selBuyerData.forEach((name) => {
          const buyerItem = {
            field: 2,
            fieldName: name,
            programme: this.form.buyerTxt || '',
            isCorrelation: 1,
            isComplete: 1
          };

          // 设置bomChangeId为下拉框选中人员的ID
          const selectedBuyerUser = this.buyerData.find(user => user.personnel === name);
          if (selectedBuyerUser) {
            buyerItem.bomChangeId = selectedBuyerUser.id;
          }
          list.push(buyerItem);
        });
      }

      // 研发数据 - 多选处理
      if (this.form.selResearchData && this.form.selResearchData.length > 0) {
        this.form.selResearchData.forEach((name) => {
          const researchItem = {
            field: 6,
            fieldName: name,
            programme: this.form.researchDataTxt || '',
            isCorrelation: 1,
            isComplete: 1
          };

          // 设置bomChangeId为下拉框选中人员的ID
          const selectedResearchUser = this.researchData.find(user => user.personnel === name);
          if (selectedResearchUser) {
            researchItem.bomChangeId = selectedResearchUser.id;
          }
          list.push(researchItem);
        });
      }

      // 市场数据 - 多选处理
      if (this.form.selMarketerData && this.form.selMarketerData.length > 0) {
        this.form.selMarketerData.forEach((name) => {
          const marketItem = {
            field: 8,
            fieldName: name,
            programme: this.form.finishedHandleTxt || '',
            treatment: this.form.warehouseDataTxt || '',
            isCorrelation: 1,
            isComplete: 1
          };

          // 设置bomChangeId为下拉框选中人员的ID
          const selectedMarketerUser = this.marketerData.find(user => user.personnel === name);
          if (selectedMarketerUser) {
            marketItem.bomChangeId = selectedMarketerUser.id;
          }
          list.push(marketItem);
        });
      }

      submitData.list = list;

      // 调试信息
      console.log('提交的list数据:', list);
      console.log('提交的infoList数据:', submitData.infoList);

      return submitData;
    },

    /** 添加订单通知行 */
    addOrderNoticeRow() {
      const newRow = {
        changeNoticeId: this.form.id,
        customerNo: '',
        uuNo: '',
        treeNo: '',
        originalOrderTime: '',
        originalPlanTime: ''
      };
      
      if (!this.form.infoList) {
        this.form.infoList = [];
      }
      
      this.form.infoList.push(newRow);
      
      // 触发表单验证
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.validateField('infoList');
      });
    },

    /** 复制订单通知行 */
    copyOrderNoticeRow(index) {
      const originalRow = this.form.infoList[index];
      const copiedRow = {
        ...originalRow,
        changeNoticeId: this.form.id
      };
      
      this.form.infoList.splice(index + 1, 0, copiedRow);
      
      // 触发表单验证
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.validateField('infoList');
      });
    },

    /** 删除订单通知行 */
    deleteOrderNoticeRow(index) {
      if (this.form.infoList.length <= 1) {
        this.$message.warning('至少需要保留一行订单信息');
        return;
      }
      
      this.form.infoList.splice(index, 1);
      
      // 触发表单验证
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.validateField('infoList');
      });
    },

    /** 构建变更原因数据 - 新格式 */
    buildChangeCauseData() {
      // 深拷贝当前的 orderChangeTypes，只保留选中状态
      const changeData = this.orderChangeTypes.map(item => ({
        label: item.label,
        id: item.id,
        check: item.check,
        list: item.list.map(subItem => ({
          value: subItem.value,
          label: subItem.label,
          check: subItem.check
        }))
      }));

      return JSON.stringify(changeData);
    },

    /** 测试数据结构 - 开发调试用 */
    testDataStructure() {
      // 模拟选择：订单暂停 + 订单变更(物料变更) - 单选逻辑
      this.orderChangeTypes[0].check = true; // 订单暂停
      this.orderChangeTypes[2].check = true; // 订单变更

      // 使用单选方法设置订单变更类型
      this.handleOrderChangeTypeSelect('MATERIAL_CHANGE');

      const result = this.buildChangeCauseData();
      console.log('测试数据结构:', result);
      console.log('解析后:', JSON.parse(result));

      return result;
    },

    /** 处理多选字段变化 - 参考update.vue */
    handleMultiSelectChange(fieldType, selectedValues) {
      console.log(`${fieldType} 多选变化:`, selectedValues);

      // 触发部门验证
      this.$nextTick(() => {
        this.triggerDepartmentValidation();
      });
    },

    /** 处理审批 */
    handleApproval() {
      // 根据初审和终审结果确定最终状态
      const firstApproved = this.form.firstState === '1';
      const secondApproved = this.form.secondState === '1';

      let finalStatus = 0; // 待审核
      if (firstApproved && secondApproved) {
        finalStatus = 1; // 通过
      } else if (this.form.firstState === '0' || this.form.secondState === '0') {
        finalStatus = 2; // 驳回
      }

      const approvalData = {
        id: this.form.id,
        firstPerson: this.form.firstPerson,
        firstAgreement: this.form.firstState,
        firstOpinion: this.form.firstResult,
        secondPerson: this.form.secondPerson,
        secondAgreement: this.form.secondState,
        secondOpinion: this.form.secondResult,
        status: finalStatus
      };

      // 这里应该调用审批API
      console.log('审批数据:', approvalData);

      this.$modal.msgSuccess("审批成功");
      this.open = false;
      this.$emit('ok');
    }
  }
};
</script>

<style lang="scss" scoped>
// 现代化表单样式
.modern-form {
  padding-top: 20px;

  .el-form-item__label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 14px;
  }
}

// 表单区块样式
.form-section {
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #e8f4fd;
  overflow: visible;
  &:last-child{
    margin-bottom: 0;
  }
}

// 区块头部样式
.section-header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  position: absolute;
  top: -25px;
  left: 3px;
  background: #fff;

  .header-left {
    display: flex;
    align-items: center;

    i {
      font-size: 18px;
      margin-right: 12px;
      opacity: 0.9;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  }

  .header-right {
    .el-tag {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
    }
  }
}

// 信息分组样式
.info-group {
  position: relative;

  &:last-child {
    margin-bottom: 0;
  }
}

.group-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f2f5;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #409EFF, #67C23A);
    border-radius: 1px;
  }

  i {
    font-size: 16px;
    color: #409EFF;
    margin-right: 8px;
  }

  span {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

// 分类选择简化样式
.category-selection-compact {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;

  .change-categories {
    display: flex;
    flex-direction: row;
    gap: 16px;
  }

  .category-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .category-checkbox {
    margin-right: 0;

    .el-checkbox__label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;

      i {
        font-size: 14px;
        color: #606266;
      }
    }

    &.is-checked {
      .el-checkbox__label {
        color: #409EFF;

        i {
          color: #409EFF;
        }
      }
    }
  }

  .sub-categories {
    margin-left: 24px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;
    border-left: 3px solid #409EFF;
  }

  .sub-category-title {
    font-size: 13px;
    color: #606266;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .sub-category-options {
    .el-radio-group {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
  }

  .sub-category-radio {
    margin-right: 0;

    .el-radio__label {
      font-size: 13px;
      color: #606266;
    }

    &.is-checked {
      .el-radio__label {
        color: #409EFF;
      }
    }
  }
}

// 变更类型提示样式
.change-type-hint {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  font-size: 12px;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 6px;

  i {
    font-size: 14px;
    color: #3b82f6;
  }

  span {
    line-height: 1.4;
  }
}

// 区块内容样式
.section-content {
  padding: 24px;

}

// 部门网格布局
.department-grid-2x2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 20px;
  margin-top: 8px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
}

// 部门卡片样式
.department-card {
  background: white;
  border-radius: 12px;
  border: 1px dashed #e4e7ed;
}

// 部门头部样式
.department-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e9ecef;

  .department-icon {
    font-size: 16px;
    margin-right: 8px;

    &.pmc-icon {
      color: #e74c3c;
    }

    &.purchase-icon {
      color: #f39c12;
    }

    &.rd-icon {
      color: #3498db;
    }

    &.market-icon {
      color: #27ae60;
    }
  }

  .department-name {
    font-weight: 600;
    color: #2c3e50;
    font-size: 14px;
  }
}

// 部门内容样式
.department-content {
  padding: 16px;

  .el-form-item {
    margin-bottom: 16px;

    .el-select {
      width: 100%;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

// 审批网格布局
.approval-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

// 审批卡片样式
.approval-card {
  background: #ffffff;
  border-radius: 10px;
  border: 2px solid #f0f2f5;
  overflow: hidden;
}

// 审批头部样式
.approval-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  display: flex;
  align-items: center;
  border-bottom: 1px solid #d9f7be;

  .approval-icon {
    font-size: 16px;
    margin-right: 8px;

    &.first-approval {
      color: #1890ff;
    }

    &.final-approval {
      color: #52c41a;
    }
  }

  .approval-title {
    font-weight: 600;
    color: #2c3e50;
    font-size: 14px;
  }
}

// 审批内容样式
.approval-content {
  padding: 16px;
}

// 现代化输入框样式
:deep(.modern-select) {
  .el-input__wrapper {
    border-radius: 8px;
    border: 2px solid #e8f4fd;

    &:focus {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }
  }
}

// 现代化文本域样式
:deep(.modern-textarea) {
  .el-textarea__inner {
    border-radius: 8px;
    border: 2px solid #e8f4fd;
    resize: vertical;

    &:focus {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }
  }
}

// 审批单选按钮样式
.approval-radio {
  margin-right: 20px;
  margin-bottom: 8px;

  &.success {
    .el-radio__label {
      color: #52c41a;
      font-weight: 500;
    }

    &.is-checked {
      .el-radio__inner {
        background-color: #52c41a;
        border-color: #52c41a;
      }
    }
  }

  &.danger {
    .el-radio__label {
      color: #ff4d4f;
      font-weight: 500;
    }

    &.is-checked {
      .el-radio__inner {
        background-color: #ff4d4f;
        border-color: #ff4d4f;
      }
    }
  }

  .el-radio__label {
    display: flex;
    align-items: center;

    i {
      margin-right: 4px;
    }
  }
}

// 底部按钮样式
.dialog-footer {
  text-align: center;
  padding: 20px 24px;
  border-top: 1px solid #e8f4fd;
}

// 对话框自定义样式
:deep(.bom-change-dialog) {
  max-height: 90vh;

  .el-dialog {
    margin-top: 5vh !important;
    margin-bottom: 5vh !important;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .el-dialog__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px 24px;
    flex-shrink: 0;

    .el-dialog__title {
      color: white;
      font-size: 18px;
      font-weight: 600;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: white;
        font-size: 20px;
      }
    }
  }

  .el-dialog__body {
    padding: 0;
    flex: 1;
    overflow: hidden;
  }

  .el-dialog__footer {
    padding: 0;
    flex-shrink: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .department-grid {
    grid-template-columns: 1fr;
  }

  .department-grid-2x2 {
    grid-template-columns: 1fr;
  }

  .approval-grid {
    grid-template-columns: 1fr;
  }

  .section-content {
    padding: 16px;
  }
}

// 加载状态样式
.el-loading-mask {
  border-radius: 8px;
}

/* 订单通知表格样式 - 遵循项目风格 */
.order-notice-section {
  padding:0 20px;
  margin-bottom: 20px;
  .section-header {
    margin-bottom: 16px;
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      display: inline-flex;
      align-items: center;
      
      i {
        margin-right: 6px;
        color: #409eff;
      }
    }
    
    .section-subtitle {
      font-size: 12px;
      color: #909399;
      margin-left: 8px;
    }
  }
}

/* 表单验证错误样式 */
.el-form-item.is-error {

  .el-input__inner,
  .el-textarea__inner {
    border-color: #ff4d4f;
    box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.1);
  }
}

// 禁用状态样式
.el-input.is-disabled .el-input__inner {
  background-color: #f5f5f5;
  border-color: #e8e8e8;
  color: #999999;
}

// 动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-section {
  animation: fadeInUp 0.6s ease-out;
  position: relative;
}

// 滚动条样式
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

/* 分类选择样式 */
.category-selection {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}

.category-checkbox {
  margin-right: 20px;
}

.order-change-section {
  display: flex;
  align-items: center;
  margin-left: 20px;
}

.order-change-section .el-select {
  margin-left: 10px;
}

/* 表单项样式优化 */
.el-form-item__label {
  font-weight: 500;
  color: #303133;
}

.el-input__inner,
.el-textarea__inner {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.el-input__inner:focus,
.el-textarea__inner:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.el-date-editor.el-input {
  width: 100%;
}

.el-input-number {
  width: 100%;
}

.el-input-number .el-input__inner {
  text-align: left;
}

/* 附件上传样式 */
.upload-content {
  text-align: center;
  padding: 20px;
}

.upload-content .upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
  display: block;
}

.upload-content .el-upload__text {
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
}

.upload-content .el-upload__text em {
  color: #409eff;
  font-style: normal;
}

.upload-tips {
  margin-top: 8px;
}

.upload-tips p {
  margin: 4px 0;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.upload-tips .el-icon-info {
  color: #409eff;
}

.upload-tips .el-icon-warning {
  color: #e6a23c;
}

/* 自定义Upload组件样式覆盖 */
.style-upload .el-upload-dragger {
  width: 100% !important;
  height: 120px !important;
  border: 2px dashed #d9d9d9 !important;
  border-radius: 12px !important;
  background-color: #fafafa !important;
}

.style-upload .el-upload-dragger:hover {
  border-color: #409eff !important;
  background-color: #f5f7fa !important;
}
</style>