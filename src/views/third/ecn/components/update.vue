<template>
  <el-dialog
    class="ECN-Dialog-Box Header_Fixed"
    :title="title"
    :visible.sync="dialogVisible"
    fullscreen
    top="2vh"
    center
    append-to-body
    :close-on-click-modal="false"
  >
    <el-row type="flex" justify="space-between">
      <el-col :span="2"></el-col>
      <el-col :span="20">
        <el-form
          ref="form"
          :model="form"
          :rules="rules"
          label-width="90px"
          label-position="left"
          class="input-width"
        >
          <el-row :gutter="10" class="margin-bottom-xs">
            <el-col :sm="24" :md="12" :lg="6">
              <el-form-item label="ECN编号" prop="ecn">
                <el-input
                  v-model="form.ecn"
                  placeholder="请输入ECN编号"
                  readonly
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :sm="24" :md="12" :lg="6">
              <el-form-item label="项目名称" prop="projectName">
                <el-input
                  v-model="form.projectName"
                  clearable
                  placeholder="请输入项目名称"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="24" :md="12" :lg="6">
              <el-form-item label="产品代号" prop="productCode">
                <el-input
                  v-model="form.productCode"
                  clearable
                  placeholder="请输入产品代号"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="24" :md="12" :lg="6">
              <el-form-item label="申请部门" prop="reqUnit">
                <treeselect
                  v-model="form.reqUnit"
                  :options="deptOptions"
                  :disable-branch-nodes="true"
                  :show-count="true"
                  placeholder="请选择申请部门"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item
            label="分类"
            prop="changeCause"
            class="margin-bottom-xs"
          >
            <el-checkbox-group v-model="form.changeCause">
              <el-checkbox
                v-for="(item, index) in classifyList"
                :label="item.dictValue"
                :key="index"
                border
              >
                {{ item.dictLabel }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item
            label="初审人员"
            prop="firstPerson"
            class="margin-bottom-xs"
          >
            <el-select
              v-model="form.firstPerson"
              placeholder="请选择初审人员"
              filterable
              clearable
            >
              <el-option
                v-for="item in firstAuditorData"
                :label="item.personnel"
                :value="item.personnel"
                :key="item.id"
              ></el-option>
            </el-select>
          </el-form-item>

          <div class="involveUnit-box margin-bottom-xs">
            <p>变更涉及领域</p>
            <el-row type="flex" style="margin-left: 90px">
              <el-col :span="1" class="involveUnit-left">
                <el-form-item prop="involveUnit" label-width="0">
                  <el-checkbox-group v-model="form.involveUnit">
                    <el-checkbox
                      v-for="(item, index) in involveUnitList"
                      :label="+item.dictValue"
                      :key="index"
                    >
                      {{ item.dictLabel }}
                    </el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
              <el-col :span="23" class="involveUnit-right">
                <!-- 采购 -->
                <div class="flex">
                  <el-form-item
                    prop="selBuyerData"
                    label-width="0"
                    :rules="[
                      {
                        required: isRequired(2),
                        message: '请选择采购人员',
                        trigger: 'change',
                      },
                    ]"
                  >
                    <el-select
                      v-model="form.selBuyerData"
                      placeholder="请选择采购人员"
                      filterable
                      clearable
                      :disabled="!isRequired(2)"
                      style="width: 150px"
                    >
                      <el-option
                        v-for="item in buyerData"
                        :label="item.personnel"
                        :value="item.personnel"
                        :key="item.id"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="在途物料处理方案："
                    class="iterm-box margin-left-xs flex flex-sub"
                    prop="buyerTxt"
                  >
                    <el-input
                      v-model="form.buyerTxt"
                      clearable
                      :disabled="!isRequired(2)"
                      placeholder="请输入在途物料处理方案"
                    ></el-input>
                  </el-form-item>
                </div>
                <!-- 品质 -->
                <div class="flex">
                  <el-form-item
                    prop="selQAData"
                    label-width="0"
                    :rules="[
                      {
                        required: isRequired(3),
                        message: '请选择品质人员',
                        trigger: 'change',
                      },
                    ]"
                  >
                    <el-select
                      v-model="form.selQAData"
                      placeholder="请选择品质人员"
                      filterable
                      clearable
                      :disabled="!isRequired(3)"
                      style="width: 150px"
                    >
                      <el-option
                        v-for="item in QAData"
                        :label="item.personnel"
                        :value="item.personnel"
                        :key="item.id"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="涉及更新的文件："
                    class="iterm-box margin-left-xs flex flex-sub"
                    prop="QADataTxt"
                  >
                    <el-input
                      v-model="form.QADataTxt"
                      clearable
                      :disabled="!isRequired(3)"
                      placeholder="请输入涉及更新的文件名称"
                    ></el-input>
                  </el-form-item>
                </div>
                <!-- 生产 -->
                <div class="flex">
                  <el-form-item
                    prop="selProductData"
                    label-width="0"
                    :rules="[
                      {
                        required: isRequired(4),
                        message: '请选择生产人员',
                        trigger: 'change',
                      },
                    ]"
                  >
                    <el-select
                      v-model="form.selProductData"
                      placeholder="请选择生产人员"
                      filterable
                      clearable
                      :disabled="!isRequired(4)"
                      style="width: 150px"
                    >
                      <el-option
                        v-for="item in productData"
                        :label="item.personnel"
                        :value="item.personnel"
                        :key="item.id"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="在制产品处理方案："
                    class="iterm-box margin-left-xs flex flex-sub"
                    prop="productDataTxt"
                  >
                    <el-input
                      v-model="form.productDataTxt"
                      clearable
                      :disabled="!isRequired(4)"
                      placeholder="请输入在制产品处理方案"
                    ></el-input>
                  </el-form-item>
                </div>
                <!-- 工程 -->
                <div class="flex">
                  <el-form-item
                    prop="selEngineerData"
                    label-width="0"
                    :rules="[
                      {
                        required: isRequired(5),
                        message: '请选择工程人员',
                        trigger: 'change',
                      },
                    ]"
                  >
                    <el-select
                      v-model="form.selEngineerData"
                      placeholder="请选择工程人员"
                      filterable
                      clearable
                      :disabled="!isRequired(5)"
                      style="width: 150px"
                    >
                      <el-option
                        v-for="item in engineerData"
                        :label="item.personnel"
                        :value="item.personnel"
                        :key="item.id"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="涉及更新的文件："
                    class="iterm-box margin-left-xs flex flex-sub"
                    prop="engineerDataTxt"
                  >
                    <el-input
                      v-model="form.engineerDataTxt"
                      clearable
                      :disabled="!isRequired(5)"
                      placeholder="请输入涉及更新的文件名称"
                    ></el-input>
                  </el-form-item>
                </div>
                <!-- 研发 -->
                <div class="flex">
                  <el-form-item
                    prop="selResearchData"
                    label-width="0"
                    :rules="[
                      {
                        required: isRequired(6),
                        message: '请选择研发人员',
                        trigger: 'change',
                      },
                    ]"
                  >
                    <el-select
                      v-model="form.selResearchData"
                      placeholder="请选择研发人员"
                      filterable
                      clearable
                      :disabled="!isRequired(6)"
                      style="width: 150px"
                    >
                      <el-option
                        v-for="item in researchData"
                        :label="item.personnel"
                        :value="item.personnel"
                        :key="item.id"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="涉及更新的文件："
                    prop="researchDataTxt"
                    class="iterm-box margin-left-xs flex flex-sub"
                  >
                    <el-input
                      v-model="form.researchDataTxt"
                      clearable
                      :disabled="!isRequired(6)"
                      placeholder="请输入涉及更新的文件名称"
                    ></el-input>
                  </el-form-item>
                </div>
                <!-- 仓库 -->
                <div class="flex flex-sub">
                  <el-form-item
                    prop="selWarehouseData"
                    label-width="0"
                    :rules="[
                      {
                        required: isRequired(7),
                        message: '请选择仓库人员',
                        trigger: 'change',
                      },
                    ]"
                  >
                    <el-select
                      v-model="form.selWarehouseData"
                      placeholder="请选择仓库人员"
                      filterable
                      clearable
                      :disabled="!isRequired(7)"
                      style="width: 150px"
                    >
                      <el-option
                        v-for="item in warehouseData"
                        :label="item.personnel"
                        :value="item.personnel"
                        :key="item.id"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <div class="flex flex-direction flex-sub">
                    <el-form-item
                      label="在库物料处理方案："
                      prop="warehouseDataTxt"
                      class="iterm-box margin-left-xs flex flex-sub"
                    >
                      <el-input
                        v-model="form.warehouseDataTxt"
                        clearable
                        :disabled="!isRequired(7)"
                        placeholder="请输入在库物料处理方案"
                      ></el-input>
                    </el-form-item>
                    <el-form-item
                      label="在库成品处理方案："
                      prop="finishedHandleTxt"
                      class="iterm-box margin-left-xs flex flex-sub"
                    >
                      <el-input
                        v-model="form.finishedHandleTxt"
                        clearable
                        :disabled="!isRequired(7)"
                        placeholder="请输入在库成品处理方案"
                      ></el-input>
                    </el-form-item>
                  </div>
                </div>
                <!-- 市场 -->
                <div class="flex">
                  <el-form-item
                    prop="selMarketerData"
                    label-width="0"
                    :rules="[
                      {
                        required: isRequired(8),
                        message: '请选择市场人员',
                        trigger: 'change',
                      },
                    ]"
                  >
                    <el-select
                      v-model="form.selMarketerData"
                      placeholder="请选择市场人员"
                      filterable
                      clearable
                      :disabled="!isRequired(8)"
                      style="width: 150px"
                    >
                      <el-option
                        v-for="item in marketerData"
                        :label="item.personnel"
                        :value="item.personnel"
                        :key="item.id"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="已出货产品处理方案："
                    prop="marketerDataTxt"
                    class="iterm-box margin-left-xs flex flex-sub"
                  >
                    <el-input
                      v-model="form.marketerDataTxt"
                      clearable
                      :disabled="!isRequired(8)"
                      placeholder="请输入已出货产品处理方案"
                    ></el-input>
                  </el-form-item>
                </div>
              </el-col>
            </el-row>
          </div>

          <el-form-item
            label="终审人员"
            prop="secondPerson"
            class="margin-bottom-xs"
          >
            <el-select
              v-model="form.secondPerson"
              placeholder="请选择终审人员"
              filterable
              clearable
            >
              <el-option
                v-for="item in finalJudgmentData"
                :label="item.personnel"
                :value="item.personnel"
                :key="item.id"
              ></el-option>
            </el-select>
          </el-form-item>

          <div class="flex margin-bottom-xs">
            <el-form-item label="导入方式" prop="importType">
              <el-radio-group v-model="form.importType">
                <el-radio :label="1">立即导入</el-radio>
                <el-radio :label="2"> 自然导入 </el-radio>
                <el-radio :label="3">条件导入</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label-width="30px"
              prop="importTime"
              v-if="form.importType == 2"
            >
              <el-date-picker
                ref="datePicker"
                v-model="form.importTime"
                type="datetime"
                placeholder="请选择时间"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item
              label-width="30px"
              prop="importCondition"
              v-if="form.importType == 3"
            >
              <el-input
                v-model="form.importCondition"
                placeholder="请输入导入条件"
                clearable
                style="width: 345px"
              />
            </el-form-item>
          </div>

          <el-row :gutter="15" class="margin-bottom-xs">
            <el-col :span="24" :lg="12">
              <el-form-item label="BOM版本" prop="beforeVersion">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 6, maxRows: 6 }"
                  placeholder="请输入变更前BOM版本"
                  v-model="form.beforeVersion"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24" :lg="12">
              <el-form-item label="变更原因" prop="changeCauseNote">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 6, maxRows: 6 }"
                  placeholder="请输入变更内容"
                  v-model="form.changeCauseNote"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24" :lg="12">
              <el-form-item label="变更内容" prop="changeContent">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 6, maxRows: 6 }"
                  placeholder="请输入变更内容"
                  v-model="form.changeContent"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24" :lg="12">
              <el-form-item label="变更结果" prop="afterVersion">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 6, maxRows: 6 }"
                  placeholder="请输入变更结果"
                  v-model="form.afterVersion"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="附件" prop="file">
            <DrUpload v-model="form.file" :limit="1" :isOnePic="1">
              <div class="text-left">
                <el-button size="mini" type="primary">附件上传</el-button>
              </div>
            </DrUpload>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="2"></el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { bomAdd, bomUpdate, ecnPersonList } from "@/api/third/ecn";
import { treeselect, listDept } from "@/api/system/dept";

import tinymce from "@/views/components/Editor";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  components: { tinymce, Treeselect },
  props: ["classifyList", "involveUnitList"],
  data() {
    return {
      dialogVisible: false,
      title: "",
      // 部门列表
      deptOptions: [],
      // 表单参数
      form: {
        importType: 1,
        ecn: "",
        projectName: "",
        productCode: "",
        reqUnit: undefined,
        changeCause: [],
        involveUnit: [],
        selBuyerData: "",
        buyerTxt: "",
        selQAData: "",
        QADataTxt: "",
        selProductData: "",
        productDataTxt: "",
        selEngineerData: "",
        engineerDataTxt: "",
        selResearchData: "",
        researchDataTxt: "",
        selWarehouseData: "",
        warehouseDataTxt: "",
        finishedHandleTxt: "",
        selMarketerData: "",
        marketerDataTxt: "",
      },
      // 初审人员
      firstAuditorData: [],
      // 终审人员
      finalJudgmentData: [],
      // 采购人员
      buyerData: [],
      // 品质人员
      QAData: [],
      // 生产人员
      productData: [],
      // 工程人员
      engineerData: [],
      // 研发人员
      researchData: [],
      // 仓库人员
      warehouseData: [],
      // 市场人员
      marketerData: [],
      // 表单校验
      rules: {
        ecn: [{ required: true, message: "请输入ECN编号", trigger: "blur" }],
        projectName: [
          { required: true, message: "请输入项目名称", trigger: "blur" },
        ],
        productCode: [
          { required: true, message: "请输入产品代号", trigger: "blur" },
        ],
        changeCause: [
          { required: true, message: "请选择分类项", trigger: "change" },
        ],
        firstPerson: [
          { required: true, message: "请选择初审人员", trigger: "change" },
        ],
        secondPerson: [
          { required: true, message: "请选择终审人员", trigger: "change" },
        ],
        reqUnit: [
          {
            required: true,
            message: "请选择申请单位",
            trigger: "change",
          },
        ],
        beforeVersion: [
          { required: true, message: "请输入变更前BOM版本", trigger: "blur" },
        ],
      },
    };
  },
  computed: {
    isRequired() {
      return (type) => {
        // this.clearDomainData(type);
        return this.form.involveUnit.includes(type);
      };
    },
  },
  watch: {
    dialogVisible(bool) {
      if (bool) {
        this.getPeopleList(1);
        this.getPeopleList(2);
        this.getPeopleList(3);
        this.getPeopleList(4);
        this.getPeopleList(5);
        this.getPeopleList(6);
        this.getPeopleList(7);
        this.getPeopleList(8);
        this.getPeopleList(9);
      }
    },
    "form.reqUnit"(reqUnit) {
      if (reqUnit) this.clearValidateItem("form", "reqUnit");
    },
  },
  created() {
    this.getTreeselect();
  },
  methods: {
    /** 查询部门下拉树结构 */
    getTreeselect() {
      listDept().then((res) => {
        const data = res.data.map((item) => {
          return {
            parentId: item.parentId,
            id: item.deptId,
            label: item.deptName,
          };
        });

        this.deptOptions = this.handleTree(data);
      });
    },
    // 获取人员列表
    getPeopleList(type) {
      ecnPersonList({ type, p: 1, l: 50 }).then((res) => {
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
        }
      });
    },
    clearDomainData(type) {
      if (type === 2 && !this.form.involveUnit.includes(type)) {
        this.form.selBuyerData = "";
        this.form.buyerTxt = "";
      } else if (type === 3 && !this.form.involveUnit.includes(type)) {
        this.form.selQAData = "";
        this.form.QADataTxt = "";
      } else if (type === 4 && !this.form.involveUnit.includes(type)) {
        this.form.selProductData = "";
        this.form.productDataTxt = "";
      } else if (type === 5 && !this.form.involveUnit.includes(type)) {
        this.form.selEngineerData = "";
        this.form.engineerDataTxt = "";
      } else if (type === 6 && !this.form.involveUnit.includes(type)) {
        this.form.researchData = "";
        this.form.researchDataTxt = "";
      } else if (type === 7 && !this.form.involveUnit.includes(type)) {
        this.form.selWarehouseData = "";
        this.form.warehouseDataTxt = "";
        this.form.finishedHandleTxt = "";
      } else if (type === 8 && !this.form.involveUnit.includes(type)) {
        this.form.selMarketerData = "";
        this.form.marketerDataTxt = "";
      }
    },

    // 表单重置
    reset() {
      this.form = {
        importType: 1,
        ecn: "",
        projectName: "",
        productCode: "",
        reqUnit: undefined,
        changeCause: [],
        involveUnit: [],
        selBuyerData: "",
        buyerTxt: "",
        selQAData: "",
        QADataTxt: "",
        selProductData: "",
        productDataTxt: "",
        selEngineerData: "",
        engineerDataTxt: "",
        selResearchData: "",
        researchDataTxt: "",
        selWarehouseData: "",
        warehouseDataTxt: "",
        finishedHandleTxt: "",
        selMarketerData: "",
        marketerDataTxt: "",
      };
      this.resetForm("form");
    },
    mergeArrays(original, additional) {
      // 创建一个映射，以快速查找 original 数组中的元素
      const originalMap = new Map(original.map((item) => [item.field, item]));

      // 遍历 additional 数组
      additional.forEach((item) => {
        // 检查 item 是否存在于 originalMap 中
        if (originalMap.has(item.field)) {
          // 如果存在，更新 original 数组中的对应元素
          const index = original.findIndex((o) => o.field === item.field);
          original[index] = { ...original[index], ...item };
        } else {
          // 如果不存在，添加到 original 数组的末尾
          original.push(item);
        }
      });

      return original;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let param = JSON.parse(JSON.stringify(this.form));

          if (param.involveUnit.length === 0) {
            return this.msgError("设计领域最少选择一项");
          }

          console.log(1111, param);

          if (param.id) {
            if (param.list.length) {
              const list = [];
              const involveUnitList = param.involveUnit;

              param.list.forEach((item) => {
                if (item.field === 2) {
                  list.push({
                    ...item,
                    fieldName: param.selBuyerData,
                    programme: param.buyerTxt,
                  });
                } else if (item.field === 3) {
                  list.push({
                    ...item,
                    fieldName: param.selQAData,
                    programme: param.QADataTxt,
                  });
                } else if (item.field === 4) {
                  list.push({
                    ...item,
                    fieldName: param.selProductData,
                    programme: param.productDataTxt,
                  });
                } else if (item.field === 5) {
                  list.push({
                    ...item,
                    fieldName: param.selEngineerData,
                    programme: param.engineerDataTxt,
                  });
                } else if (item.field === 6) {
                  list.push({
                    ...item,
                    fieldName: param.selResearchData,
                    programme: param.researchDataTxt,
                  });
                } else if (item.field === 7) {
                  list.push({
                    ...item,
                    fieldName: param.selWarehouseData,
                    programme: param.warehouseDataTxt,
                    treatment: param.finishedHandleTxt,
                  });
                } else if (item.field === 8) {
                  list.push({
                    ...item,
                    fieldName: param.selMarketerData,
                    programme: param.marketerDataTxt,
                  });
                }
              });

              const newResidueList = [];
              involveUnitList.forEach((item) => {
                if (item === 2) {
                  newResidueList.push({
                    field: 2,
                    fieldName: param.selBuyerData,
                    programme: param.buyerTxt,
                  });
                } else if (item === 3) {
                  newResidueList.push({
                    field: 3,
                    fieldName: param.selQAData,
                    programme: param.QADataTxt,
                  });
                } else if (item === 4) {
                  newResidueList.push({
                    field: 4,
                    fieldName: param.selProductData,
                    programme: param.productDataTxt,
                  });
                } else if (item === 5) {
                  newResidueList.push({
                    field: 5,
                    fieldName: param.selEngineerData,
                    programme: param.engineerDataTxt,
                  });
                } else if (item === 6) {
                  newResidueList.push({
                    field: 6,
                    fieldName: param.selResearchData,
                    programme: param.researchDataTxt,
                  });
                } else if (item === 7) {
                  newResidueList.push({
                    field: 7,
                    fieldName: param.selWarehouseData,
                    programme: param.warehouseDataTxt,
                    treatment: param.finishedHandleTxt,
                  });
                } else if (item === 8) {
                  newResidueList.push({
                    field: 8,
                    fieldName: param.selMarketerData,
                    programme: param.marketerDataTxt,
                  });
                }
              });

              const original = param.list.filter((item) => {
                return involveUnitList.includes(item.field);
              });

              const originalList = this.mergeArrays(original, newResidueList);

              param.list = originalList;
            }
          } else {
            if (param.involveUnit.length) {
              const list = [];
              param.involveUnit.forEach((item) => {
                if (item === 2) {
                  list.push({
                    field: 2,
                    fieldName: param.selBuyerData,
                    programme: param.buyerTxt,
                  });
                } else if (item === 3) {
                  list.push({
                    field: 3,
                    fieldName: param.selQAData,
                    programme: param.QADataTxt,
                  });
                } else if (item === 4) {
                  list.push({
                    field: 4,
                    fieldName: param.selProductData,
                    programme: param.productDataTxt,
                  });
                } else if (item === 5) {
                  list.push({
                    field: 5,
                    fieldName: param.selEngineerData,
                    programme: param.engineerDataTxt,
                  });
                } else if (item === 6) {
                  list.push({
                    field: 6,
                    fieldName: param.selResearchData,
                    programme: param.researchDataTxt,
                  });
                } else if (item === 7) {
                  list.push({
                    field: 7,
                    fieldName: param.selWarehouseData,
                    programme: param.warehouseDataTxt,
                    treatment: param.finishedHandleTxt,
                  });
                } else if (item === 8) {
                  list.push({
                    field: 8,
                    fieldName: param.selMarketerData,
                    programme: param.marketerDataTxt,
                  });
                }
              });

              param.list = list;
            }
          }

          console.log(param);

          param.changeCause = param.changeCause.toString();
          param.involveUnit = param.involveUnit.toString();
          if (param.id) {
            bomUpdate(param).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            bomAdd(param).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          }
        }
      });
    },
  },
};
</script>

<style lang="scss">
.ECN-Dialog-Box {
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
        min-width: 135px !important;
      }
      .el-form-item__content {
        width: 100%;
        margin-left: 0 !important;
      }
    }

    .involveUnit-left {
      min-width: 65px;
      .el-checkbox-group {
        display: flex;
        flex-direction: column;
        row-gap: 20px;
        .el-checkbox:last-child {
          margin-top: 48px;
        }
      }
    }
    .involveUnit-right {
      display: flex;
      flex-direction: column;
      row-gap: 1px;
    }
  }

  .card-box {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03),
      0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
    border-radius: 8px;
  }
}
</style>

