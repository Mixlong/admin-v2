<template>
  <el-dialog class="Trial-Apply-Dialog Header_Fixed" :title="title" :visible.sync="dialogVisible" fullscreen top="2vh"
    center append-to-body :close-on-click-modal="false">
    <el-row type="flex" justify="space-between">
      <el-col :xs="0" :span="2"></el-col>
      <el-col :xs="24" :span="20">
        <el-form ref="form" :model="form" :rules="rules" label-width="85px" label-position="left" class="input-width">
          <!-- 基本信息 -->
          <el-row :gutter="10" class="margin-bottom-xs">
            <el-col :sm="24" :md="12" :lg="6">
              <el-form-item label="试产编号" prop="ecn">
                <el-input v-model="form.ecn" placeholder="请输入试产编号" readonly clearable />
              </el-form-item>
            </el-col>
            <el-col :sm="24" :md="12" :lg="6">
              <el-form-item label="产品品类" prop="categoryName">
                <el-select v-model="form.categoryName" @change="changeCategory" placeholder="请选择产品品类" clearable filterable
                  style="width: 100%">
                  <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.name" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :sm="24" :md="12" :lg="6">
              <el-form-item label="产品型号" prop="computerName">
                <el-select v-model="form.computerName" clearable filterable placeholder="请选择产品型号"
                  style="width: 100%">
                  <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.name" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :sm="24" :md="12" :lg="6">
              <el-form-item label="申请部门" prop="reqUnit">
                <treeselect v-model="form.reqUnit" :options="deptOptions" :disable-branch-nodes="true"
                  :show-count="true" placeholder="请选择申请部门" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 初审人员 -->
          <el-form-item label="初审人员" prop="firstPerson" class="margin-bottom-xs">
            <el-select v-model="form.firstPerson" placeholder="请选择初审人员" filterable clearable   >
              <el-option v-for="item in firstAuditorData" :label="item.personnel" :value="item.personnel"
                :key="item.id"></el-option>
            </el-select>
          </el-form-item>

          <!-- 变更涉及领域 -->
          <div class="involveUnit-box margin-bottom-xs">
            <p>变更涉及领域</p>
            <el-row type="flex" style="overflow-x: auto">
              <el-col :span="1" class="involveUnit-left">
                <el-form-item prop="involveUnit" label-width="0">
                  <div class="each_item_box">
                    <div class="each_unit">采购：</div>
                    <div class="each_unit">品质：</div>
                    <div class="each_unit">生产：</div>
                    <div class="each_unit">工程：</div>
                    <div class="each_unit">研发：</div>
                    <div class="each_unit">仓库：</div>
                    <div class="each_unit">市场：</div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="23" class="involveUnit-right">
                <!-- 采购 -->
                <div class="flex">
                  <el-form-item prop="selBuyerData" label-width="0" :rules="[
                    {
                      required: true,
                      message: '请选择采购人员',
                      trigger: 'change',
                    },
                  ]">
                    <el-select v-model="form.selBuyerData" placeholder="请选择采购人员" filterable clearable multiple
                      collapse-tags style="width: 180px">
                      <el-option v-for="item in buyerData" :label="item.personnel" :value="item.personnel"
                        :key="item.id" :disabled="item.disabled"></el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item label="新增物料状况：" label-width="155px" class="iterm-box margin-left-xs flex flex-sub" prop="buyerTxt" :rules="[
                    {
                      required: true,
                      message: '请输入新增物料状况',
                      trigger: 'blur',
                    },
                  ]">
                    <el-input v-model="form.buyerTxt" clearable placeholder="请输入" style="min-width: 250px"></el-input>
                  </el-form-item>
                </div>
                <!-- 品质 -->
                <div class="flex">
                  <el-form-item prop="selQAData" label-width="0" :rules="[
                    {
                      required: true,
                      message: '请选择品质人员',
                      trigger: 'change',
                    },
                  ]">
                    <el-select v-model="form.selQAData" placeholder="请选择品质人员" filterable clearable multiple
                      collapse-tags style="width: 180px">
                      <el-option v-for="item in QAData" :label="item.personnel" :value="item.personnel"
                        :key="item.id"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="涉及品质检验文件：" label-width="155px" class="iterm-box margin-left-xs flex flex-sub" prop="QADataTxt" :rules="[
                    {
                      required: true,
                      message: '请输入涉及品质检验文件',
                      trigger: 'blur',
                    },
                  ]">
                    <el-input v-model="form.QADataTxt" clearable placeholder="请输入" style="min-width: 250px"></el-input>
                  </el-form-item>
                </div>
                <!-- 生产 -->
                <div class="flex">
                  <el-form-item prop="selProductData" label-width="0" :rules="[
                    {
                      required: true,
                      message: '请选择生产人员',
                      trigger: 'change',
                    },
                  ]">
                    <el-select v-model="form.selProductData" placeholder="请选择生产人员" filterable clearable multiple
                      collapse-tags style="width: 180px">
                      <el-option v-for="item in productData" :label="item.personnel" :value="item.personnel"
                        :key="item.id"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="试产前期准备：" label-width="155px" class="iterm-box margin-left-xs flex flex-sub" prop="productDataTxt"
                    :rules="[
                      {
                        required: true,
                        message: '请输入试产前期准备',
                        trigger: 'blur',
                      },
                    ]">
                    <el-input v-model="form.productDataTxt" clearable placeholder="请输入"
                      style="min-width: 250px"></el-input>
                  </el-form-item>
                </div>
                <!-- 工程 -->
                <div class="flex">
                  <el-form-item prop="selEngineerData" label-width="0" :rules="[
                    {
                      required: true,
                      message: '请选择工程人员',
                      trigger: 'change',
                    },
                  ]">
                    <el-select v-model="form.selEngineerData" placeholder="请选择工程人员" filterable clearable multiple
                      collapse-tags style="width: 180px">
                      <el-option v-for="item in engineerData" :label="item.personnel" :value="item.personnel"
                        :key="item.id"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="试产治具准备：" label-width="155px" class="iterm-box margin-left-xs flex flex-sub" prop="engineerDataTxt"
                    :rules="[
                      {
                        required: true,
                        message: '请输入试产治具准备',
                        trigger: 'blur',
                      },
                    ]">
                    <el-input v-model="form.engineerDataTxt" clearable placeholder="请输入"
                      style="min-width: 250px"></el-input>
                  </el-form-item>
                </div>
                <!-- 研发 -->
                <div class="flex">
                  <el-form-item prop="selResearchData" label-width="0" :rules="[
                    {
                      required: true,
                      message: '请选择研发人员',
                      trigger: 'change',
                    },
                  ]">
                    <el-select v-model="form.selResearchData" placeholder="请选择研发人员" filterable clearable multiple
                      collapse-tags style="width: 180px">
                      <el-option v-for="item in researchData" :label="item.personnel" :value="item.personnel"
                        :key="item.id"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="研发进度与状况：" label-width="155px" prop="researchDataTxt" class="iterm-box margin-left-xs flex flex-sub"
                    :rules="[
                      {
                        required: true,
                        message: '请输入研发进度与状况',
                        trigger: 'blur',
                      },
                    ]">
                    <el-input v-model="form.researchDataTxt" clearable placeholder="请输入"
                      style="min-width: 250px"></el-input>
                  </el-form-item>
                </div>
                <!-- 仓库 -->
                <div class="flex flex-sub">
                  <el-form-item prop="selWarehouseData" label-width="0" :rules="[
                    {
                      required: true,
                      message: '请选择仓库人员',
                      trigger: 'change',
                    },
                  ]">
                    <el-select v-model="form.selWarehouseData" placeholder="请选择仓库人员" filterable clearable multiple
                      collapse-tags style="width: 180px">
                      <el-option v-for="item in warehouseData" :label="item.personnel" :value="item.personnel"
                        :key="item.id"></el-option>
                    </el-select>
                  </el-form-item>
                  <div class="flex flex-direction flex-sub">
                    <el-form-item label="试产后剩余物料处理方案：" label-width="155px" prop="warehouseDataTxt"
                      class="iterm-box margin-left-xs flex flex-sub" :rules="[
                        {
                          required: true,
                          message: '请输入试产后剩余物料处理方案',
                          trigger: 'blur',
                        },
                      ]">
                      <el-input v-model="form.warehouseDataTxt" clearable placeholder="请输入"
                        style="min-width: 250px"></el-input>
                    </el-form-item>
                    <el-form-item label="试产成品入库确认：" label-width="155px" prop="finishedHandleTxt"
                      class="iterm-box margin-left-xs flex flex-sub" :rules="[
                        {
                          required: true,
                          message: '请输入试产成品入库确认',
                          trigger: 'blur',
                        },
                      ]">
                      <el-input v-model="form.finishedHandleTxt" clearable placeholder="请输入"
                        style="min-width: 250px"></el-input>
                    </el-form-item>
                  </div>
                </div>
                <!-- 市场 -->
                <div class="flex">
                  <el-form-item prop="selMarketerData" label-width="0" :rules="[
                    {
                      required: true,
                      message: '请选择市场人员',
                      trigger: 'change',
                    },
                  ]">
                    <el-select v-model="form.selMarketerData" placeholder="请选择市场人员" filterable clearable multiple
                      collapse-tags style="width: 180px">
                      <el-option v-for="item in marketerData" :label="item.personnel" :value="item.personnel"
                        :key="item.id"></el-option>
                    </el-select>
                  </el-form-item>
                  <div class="flex flex-direction flex-sub">
                    <el-form-item label="有试送样需求：" label-width="155px" prop="noMarketerDataTxt"
                      class="iterm-box margin-left-xs flex flex-sub" :rules="[
                        {
                          required: true,
                          message: '请输入有试送样需求',
                          trigger: 'blur',
                        },
                      ]">
                      <el-input v-model="form.noMarketerDataTxt" clearable placeholder="请输入"
                        style="min-width: 250px"></el-input>
                    </el-form-item>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 审核人员 (无系统变更人员) -->
          <el-row :gutter="10" class="margin-bottom-xs">
            <el-col :sm="24" :md="12" :lg="8">
              <el-form-item label="PMC终审人员" prop="thirdPerson" label-width="120px">
                <el-select v-model="form.thirdPerson" placeholder="请选择PMC终审人员" filterable clearable   >
                  <el-option v-for="item in pmcData" :label="item.personnel" :value="item.personnel"
                    :key="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :sm="24" :md="12" :lg="8">
              <el-form-item label="最终审核人员" prop="secondPersonList" label-width="120px">
                <el-select 
                  v-model="form.secondPersonList" 
                  placeholder="请选择最终审核人员" 
                  filterable 
                  clearable 
                  multiple
                  collapse-tags
                    
                > 
                  <el-option v-for="item in finalJudgmentData" :label="item.personnel" :value="item.personnel"
                    :key="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 试产说明 -->
          <el-form-item label="试产说明" prop="trialInfo" class="margin-bottom-xs">
            <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" placeholder="请输入试产说明"
              v-model="form.trialInfo"></el-input>
          </el-form-item>

          <!-- 附件 -->
          <el-form-item label="附件" prop="file">
            <DrUpload v-model="form.file">
              <div class="text-left">
                <el-button size="mini" type="primary">附件上传</el-button>
              </div>
            </DrUpload>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :xs="0" :span="2"></el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
      <el-button @click="dialogVisible = false" :disabled="submitLoading">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { trialApplyAdd, trialApplyUpdate, trialApplyPersonList } from '@/api/third/trialApply'
import { treeselect, listDept } from '@/api/system/dept'
import { categoryComputerDict } from '@/api/third/fileConfig'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { cloneDeep } from 'lodash'

export default {
  components: { Treeselect },
  props: ['dictList'],
  data() {
    return {
      dialogVisible: false,
      title: '',
      submitLoading: false,
      deptOptions: [],
      form: {
        ecn: '',
        categoryName: '',
        computerName: '',
        reqUnit: undefined,
        firstPerson: '',
        selBuyerData: [],
        buyerTxt: '',
        selQAData: [],
        QADataTxt: '',
        selProductData: [],
        productDataTxt: '',
        selEngineerData: [],
        engineerDataTxt: '',
        selResearchData: [],
        researchDataTxt: '',
        selWarehouseData: [],
        warehouseDataTxt: '',
        finishedHandleTxt: '',
        selMarketerData: [],
        marketerDataTxt: '',
        noMarketerDataTxt: '',
        secondPersonList: [],
        thirdPerson: '',
        trialInfo: '',
        file: ''
      },
      firstAuditorData: [],
      buyerData: [],
      QAData: [],
      productData: [],
      engineerData: [],
      researchData: [],
      warehouseData: [],
      marketerData: [],
      finalJudgmentData: [],
      pmcData: [],
      computerOptions: [],
      rules: {
        ecn: [{ required: true, message: '请输入ECN编号', trigger: 'blur' }],
        categoryName: [{ required: true, message: '请选择产品品类', trigger: 'change' }],
        computerName: [{ required: true, message: '请选择产品型号', trigger: 'change' }],
        reqUnit: [{ required: true, message: '请选择申请部门', trigger: 'change' }],
        firstPerson: [{ required: true, message: '请选择初审人员', trigger: 'change' }],
        thirdPerson: [{ required: true, message: '请选择PMC人员', trigger: 'change' }],
        secondPersonList: [{ required: true, message: '请选择最终审核人员', trigger: 'change' }],
        trialInfo: [{ required: true, message: '请输入试产说明', trigger: 'blur' }],
        file: [{ required: true, message: '请上传附件', trigger: 'change' }]
      }
    }
  },
  watch: {
    dialogVisible(bool) {
      if (bool) {
        this.getPeopleList(1)
        this.getPeopleList(2)
        this.getPeopleList(3)
        this.getPeopleList(4)
        this.getPeopleList(5)
        this.getPeopleList(6)
        this.getPeopleList(7)
        this.getPeopleList(8)
        this.getPeopleList(9)
        this.getPeopleList(10)

        if (this.form.secondPersonList && typeof this.form.secondPersonList === 'string') {
          this.form.secondPersonList = this.form.secondPersonList.split(',').filter(item => item.trim())
        } else if (!this.form.secondPersonList) {
          this.form.secondPersonList = []
        }

        // 编辑模式下，加载品类对应的型号列表
        if (this.form.id && this.form.categoryName) {
          this.changeCategory(this.form.categoryName)
        }
      }
    },
    'form.reqUnit'(reqUnit) {
      if (reqUnit) this.clearValidateItem('form', 'reqUnit')
    },
    'form.file'(file) {
      if (file) this.clearValidateItem('form', 'file')
    }
  },
  created() {
    this.getTreeselect()
  },
  methods: {
    getTreeselect() {
      listDept().then((res) => {
        const data = res.data.map((item) => {
          return {
            parentId: item.parentId,
            id: item.deptId,
            label: item.deptName
          }
        })
        this.deptOptions = this.handleTree(data)
      })
    },
    // 品类变更处理
    changeCategory(categoryName) {
      this.form.computerName = ''
      if (categoryName) {
        this.computerOptions = this.dictList.filter(
          (item) => item.name === categoryName
        )[0]?.computerList || []
      } else {
        this.computerOptions = []
      }
    },
    getPeopleList(type) {
      trialApplyPersonList({ type, changeType: 4, p: 1, l: 50 }).then((res) => {
        const { list } = res.data
        switch (type) {
          case 1:
            this.firstAuditorData = list
            break
          case 2:
            this.buyerData = this.handleSetCheckList(list, 2)
            break
          case 3:
            this.QAData = this.handleSetCheckList(list, 3)
            break
          case 4:
            this.productData = this.handleSetCheckList(list, 4)
            break
          case 5:
            this.engineerData = this.handleSetCheckList(list, 5)
            break
          case 6:
            this.researchData = this.handleSetCheckList(list, 6)
            break
          case 7:
            this.warehouseData = this.handleSetCheckList(list, 7)
            break
          case 8:
            this.marketerData = this.handleSetCheckList(list, 8)
            break
          case 9:
            this.finalJudgmentData = list
            break
          case 10:
            this.pmcData = list
            break
        }
      })
    },
    handleSetCheckList(data, field) {
      const copyData = cloneDeep(data)
      const { id, list } = this.form
      if (id) {
        const selectedData = list.filter(
          (item) => item.field === field && item.state !== 0
        )
        copyData.forEach((item) => {
          selectedData.forEach((cItem) => {
            item.disabled = item.personnel === cItem.fieldName
          })
        })
        return copyData
      } else {
        return data.map((item) => {
          return {
            ...item,
            disabled: false
          }
        })
      }
    },
    reset() {
      this.form = {
        ecn: '',
        categoryName: '',
        computerName: '',
        reqUnit: undefined,
        firstPerson: '',
        selBuyerData: [],
        buyerTxt: '',
        selQAData: [],
        QADataTxt: '',
        selProductData: [],
        productDataTxt: '',
        selEngineerData: [],
        engineerDataTxt: '',
        selResearchData: [],
        researchDataTxt: '',
        selWarehouseData: [],
        warehouseDataTxt: '',
        finishedHandleTxt: '',
        selMarketerData: [],
        marketerDataTxt: '',
        noMarketerDataTxt: '',
        secondPersonList: [],
        thirdPerson: '',
        trialInfo: '',
        file: ''
      }
      this.resetForm('form')
    },
    initEditData(row) {
      // 复制编辑数据
      const editData = cloneDeep(row)
      
      // 基本信息
      this.form = {
        id: editData.id,
        ecn: editData.ecn,
        categoryName: editData.categoryName,
        computerName: editData.computerName,
        reqUnit: editData.reqUnit,
        firstPerson: editData.firstPerson,
        thirdPerson: editData.thirdPerson,
        trialInfo: editData.trialInfo,
        file: editData.file,
        list: editData.list || [],
        selBuyerData: [],
        buyerTxt: '',
        selQAData: [],
        QADataTxt: '',
        selProductData: [],
        productDataTxt: '',
        selEngineerData: [],
        engineerDataTxt: '',
        selResearchData: [],
        researchDataTxt: '',
        selWarehouseData: [],
        warehouseDataTxt: '',
        finishedHandleTxt: '',
        selMarketerData: [],
        marketerDataTxt: '',
        noMarketerDataTxt: '',
        secondPersonList: []
      }

      // 处理最终审核人员（从字符串转数组）
      if (editData.finalPerson) {
        this.form.secondPersonList = editData.finalPerson.split(',').filter(item => item.trim())
      }

      // 从 list 数组中提取各部门的人员和方案
      if (editData.list && editData.list.length > 0) {
        editData.list.forEach(item => {
          switch (item.field) {
            case 2: // 采购
              if (!this.form.selBuyerData.includes(item.fieldName)) {
                this.form.selBuyerData.push(item.fieldName)
              }
              if (!this.form.buyerTxt) {
                this.form.buyerTxt = item.programme || ''
              }
              break
            case 3: // 品质
              if (!this.form.selQAData.includes(item.fieldName)) {
                this.form.selQAData.push(item.fieldName)
              }
              if (!this.form.QADataTxt) {
                this.form.QADataTxt = item.programme || ''
              }
              break
            case 4: // 生产
              if (!this.form.selProductData.includes(item.fieldName)) {
                this.form.selProductData.push(item.fieldName)
              }
              if (!this.form.productDataTxt) {
                this.form.productDataTxt = item.programme || ''
              }
              break
            case 5: // 工程
              if (!this.form.selEngineerData.includes(item.fieldName)) {
                this.form.selEngineerData.push(item.fieldName)
              }
              if (!this.form.engineerDataTxt) {
                this.form.engineerDataTxt = item.programme || ''
              }
              break
            case 6: // 研发
              if (!this.form.selResearchData.includes(item.fieldName)) {
                this.form.selResearchData.push(item.fieldName)
              }
              if (!this.form.researchDataTxt) {
                this.form.researchDataTxt = item.programme || ''
              }
              break
            case 7: // 仓库
              if (!this.form.selWarehouseData.includes(item.fieldName)) {
                this.form.selWarehouseData.push(item.fieldName)
              }
              if (!this.form.warehouseDataTxt) {
                this.form.warehouseDataTxt = item.programme || ''
              }
              if (!this.form.finishedHandleTxt) {
                this.form.finishedHandleTxt = item.treatment || ''
              }
              break
            case 8: // 市场
              if (!this.form.selMarketerData.includes(item.fieldName)) {
                this.form.selMarketerData.push(item.fieldName)
              }
              if (!this.form.marketerDataTxt) {
                this.form.marketerDataTxt = item.programme || ''
              }
              if (!this.form.noMarketerDataTxt) {
                this.form.noMarketerDataTxt = item.treatment || ''
              }
              break
          }
        })
      }
    },
    handleAddJointPeople(paramCopyData) {
      const newList = []
      if (paramCopyData.selBuyerData.length) {
        this.handleAddEachJointPeople(newList, paramCopyData.selBuyerData, 2, {
          programme: paramCopyData.buyerTxt
        })
      }
      if (paramCopyData.selQAData.length) {
        this.handleAddEachJointPeople(newList, paramCopyData.selQAData, 3, {
          programme: paramCopyData.QADataTxt
        })
      }
      if (paramCopyData.selProductData.length) {
        this.handleAddEachJointPeople(newList, paramCopyData.selProductData, 4, {
          programme: paramCopyData.productDataTxt
        })
      }
      if (paramCopyData.selEngineerData.length) {
        this.handleAddEachJointPeople(newList, paramCopyData.selEngineerData, 5, {
          programme: paramCopyData.engineerDataTxt
        })
      }
      if (paramCopyData.selResearchData.length) {
        this.handleAddEachJointPeople(newList, paramCopyData.selResearchData, 6, {
          programme: paramCopyData.researchDataTxt
        })
      }
      if (paramCopyData.selWarehouseData.length) {
        this.handleAddEachJointPeople(newList, paramCopyData.selWarehouseData, 7, {
          programme: paramCopyData.warehouseDataTxt,
          treatment: paramCopyData.finishedHandleTxt
        })
      }
      if (paramCopyData.selMarketerData.length) {
        this.handleAddEachJointPeople(newList, paramCopyData.selMarketerData, 8, {
          programme: paramCopyData.marketerDataTxt,
          treatment: paramCopyData.noMarketerDataTxt
        })
      }
      return newList
    },
    handleAddEachJointPeople(newList, checkPeopleData, field, params) {
      checkPeopleData.forEach((name) => {
        newList.push({
          field,
          fieldName: name,
          ...params
        })
      })
    },
    handleEditJointPeople(paramCopyData) {
      if (paramCopyData.list.length) {
        const newList = []

        if (paramCopyData.selBuyerData.length) {
          this.handleEditEachJointPeople(newList, paramCopyData.selBuyerData, 2, {
            programme: paramCopyData.buyerTxt
          })
        }

        if (paramCopyData.selQAData.length) {
          this.handleEditEachJointPeople(newList, paramCopyData.selQAData, 3, {
            programme: paramCopyData.QADataTxt
          })
        }

        if (paramCopyData.selProductData.length) {
          this.handleEditEachJointPeople(
            newList,
            paramCopyData.selProductData,
            4,
            {
              programme: paramCopyData.productDataTxt
            }
          )
        }

        if (paramCopyData.selEngineerData.length) {
          this.handleEditEachJointPeople(
            newList,
            paramCopyData.selEngineerData,
            5,
            {
              programme: paramCopyData.engineerDataTxt
            }
          )
        }

        if (paramCopyData.selResearchData.length) {
          this.handleEditEachJointPeople(
            newList,
            paramCopyData.selResearchData,
            6,
            {
              programme: paramCopyData.researchDataTxt
            }
          )
        }

        if (paramCopyData.selWarehouseData.length) {
          this.handleEditEachJointPeople(
            newList,
            paramCopyData.selWarehouseData,
            7,
            {
              programme: paramCopyData.warehouseDataTxt,
              treatment: paramCopyData.finishedHandleTxt
            }
          )
        }

        if (paramCopyData.selMarketerData.length) {
          this.handleEditEachJointPeople(
            newList,
            paramCopyData.selMarketerData,
            8,
            {
              programme: paramCopyData.marketerDataTxt,
              treatment: paramCopyData.noMarketerDataTxt
            }
          )
        }
        
        return newList
      }
    },
    handleEditEachJointPeople(newList, checkPeopleData, field, params) {
      const { list: editListData } = this.form

      // 获取当前部门已存在的人员记录，确保每个人只取一条记录
      const existingItems = new Map()
      editListData.forEach(item => {
        if (item.field === field && !existingItems.has(item.fieldName)) {
          existingItems.set(item.fieldName, item)
        }
      })

      // 处理选中的人员
      checkPeopleData.forEach((name) => {
        if (existingItems.has(name)) {
          // 更新已存在的记录
          newList.push({
            ...existingItems.get(name),
            ...params
          })
        } else {
          // 创建新记录
          newList.push({
            field,
            fieldName: name,
            ...params
          })
        }
      })

      return newList
    },
    submitForm() {
      // 防止重复提交
      if (this.submitLoading) return
      
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.submitLoading = true
          let param = cloneDeep(this.form)

          if (param.id) {
            const list = this.handleEditJointPeople(param)
            param.list = list
          } else {
            const list = this.handleAddJointPeople(param)
            param.list = list
          }

          if (param.secondPersonList && Array.isArray(param.secondPersonList) && param.secondPersonList.length > 0) {
            param.finalPerson = param.secondPersonList.join(',')
          } else {
            param.finalPerson = ''
          }

          if (param.id) {
            trialApplyUpdate(param).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.dialogVisible = false
                this.$parent.getList()
              }
            }).catch(() => {
              this.submitLoading = false
            }).finally(() => {
              this.submitLoading = false
            })
          } else {
            trialApplyAdd(param).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('创建成功')
                this.dialogVisible = false
                this.$parent.getList()
              }
            }).catch(() => {
              this.submitLoading = false
            }).finally(() => {
              this.submitLoading = false
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.Trial-Apply-Dialog {
  .el-dialog__body {
    padding-bottom: 60px;
  }

  .el-dialog__footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
  }

  .involveUnit-box {
    background: #f0f2f5;
    border-radius: 8px;
    padding: 10px;
    box-sizing: border-box;

    .iterm-box {
      .el-form-item__label {
        white-space: nowrap;
        min-width: 155px !important;
      }

      .el-form-item__content {
        width: 100%;
        margin-left: 0 !important;
      }
    }

    .involveUnit-left {
      min-width: 65px;

      .each_item_box {
        display: flex;
        flex-direction: column;
        row-gap: 20px;

        .each_unit {
          text-align: center;

          &:nth-last-child(1) {
            margin-top: 50px;
          }
        }
      }
    }

    .involveUnit-right {
      display: flex;
      flex-direction: column;
      row-gap: 1px;
    }
  }
}
</style>

<style lang="scss" scoped>
@media screen and(max-width: 768px) {
  .grid_column_two {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(2, 1fr);

    .el-checkbox,
    .el-radio {
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
  }
}
</style>
