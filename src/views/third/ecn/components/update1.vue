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
      <el-col :xs="0" :span="2"></el-col>
      <el-col :xs="24" :span="20">
        <el-form
          ref="form"
          :model="form"
          :rules="rules"
          label-width="85px"
          label-position="left"
          class="input-width"
        >
          <el-row :gutter="10" class="margin-bottom-xs">
            <el-col :sm="24" :md="12" :lg="6">
              <el-form-item label="ECR/N编号" prop="ecn">
                <el-input
                  v-model="form.ecn"
                  placeholder="请输入ECR/N编号"
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
            <el-checkbox-group
              v-model="form.changeCause"
              class="grid_column_two"
            >
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
              :disabled="!!form.id"
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
            <el-row type="flex" style="overflow-x: auto">
              <el-col :span="1" class="involveUnit-left">
                <el-form-item prop="involveUnit" label-width="0">
                  <div class="each_item_box">
                    <div
                      v-for="(item, index) in involveUnitList"
                      :label="+item.dictValue"
                      :key="index"
                      class="each_unit"
                    >
                      {{ item.dictLabel }}：
                    </div>
                  </div>
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
                        required: true,
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
                      multiple
                      collapse-tags
                      style="width: 180px"
                    >
                      <el-option
                        v-for="item in buyerData"
                        :label="item.personnel"
                        :value="item.personnel"
                        :key="item.id"
                        :disabled="item.disabled"
                      ></el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item
                    label="在途物料处理方案："
                    class="iterm-box margin-left-xs flex flex-sub"
                    prop="buyerTxt"
                    :rules="[
                      {
                        required: true,
                        message: '请输入在途物料处理方案',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <el-input
                      v-model="form.buyerTxt"
                      clearable
                      placeholder="请输入"
                      style="min-width: 250px"
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
                        required: true,
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
                      multiple
                      collapse-tags
                      style="width: 180px"
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
                    :rules="[
                      {
                        required: true,
                        message: '请输入涉及更新的文件名称',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <el-input
                      v-model="form.QADataTxt"
                      clearable
                      placeholder="请输入"
                      style="min-width: 250px"
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
                        required: true,
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
                      multiple
                      collapse-tags
                      style="width: 180px"
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
                    :rules="[
                      {
                        required: true,
                        message: '请输入在制产品处理方案',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <el-input
                      v-model="form.productDataTxt"
                      clearable
                      placeholder="请输入"
                      style="min-width: 250px"
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
                        required: true,
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
                      multiple
                      collapse-tags
                      style="width: 180px"
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
                    :rules="[
                      {
                        required: true,
                        message: '请输入涉及更新的文件名称',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <el-input
                      v-model="form.engineerDataTxt"
                      clearable
                      placeholder="请输入"
                      style="min-width: 250px"
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
                        required: true,
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
                      multiple
                      collapse-tags
                      style="width: 180px"
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
                    :rules="[
                      {
                        required: true,
                        message: '请输入涉及更新的文件名称',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <el-input
                      v-model="form.researchDataTxt"
                      clearable
                      placeholder="请输入"
                      style="min-width: 250px"
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
                        required: true,
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
                      multiple
                      collapse-tags
                      style="width: 180px"
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
                      :rules="[
                        {
                          required: true,
                          message: '请输入在库物料处理方案',
                          trigger: 'blur',
                        },
                      ]"
                    >
                      <el-input
                        v-model="form.warehouseDataTxt"
                        clearable
                        placeholder="请输入"
                        style="min-width: 250px"
                      ></el-input>
                    </el-form-item>
                    <el-form-item
                      label="在库成品处理方案："
                      prop="finishedHandleTxt"
                      class="iterm-box margin-left-xs flex flex-sub"
                      :rules="[
                        {
                          required: true,
                          message: '请输入在库成品处理方案',
                          trigger: 'blur',
                        },
                      ]"
                    >
                      <el-input
                        v-model="form.finishedHandleTxt"
                        clearable
                        placeholder="请输入"
                        style="min-width: 250px"
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
                        required: true,
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
                      multiple
                      collapse-tags
                      style="width: 180px"
                    >
                      <el-option
                        v-for="item in marketerData"
                        :label="item.personnel"
                        :value="item.personnel"
                        :key="item.id"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <div class="flex flex-direction flex-sub">
                    <el-form-item
                      label="未出货产品处理方案："
                      prop="noMarketerDataTxt"
                      class="iterm-box margin-left-xs flex flex-sub"
                      :rules="[
                        {
                          required: true,
                          message: '请输入未出货产品处理方案',
                          trigger: 'blur',
                        },
                      ]"
                    >
                      <el-input
                        v-model="form.noMarketerDataTxt"
                        clearable
                        placeholder="请输入"
                        style="min-width: 250px"
                      ></el-input>
                    </el-form-item>

                    <el-form-item
                      label="已出货产品处理方案："
                      prop="marketerDataTxt"
                      class="iterm-box margin-left-xs flex flex-sub"
                      :rules="[
                        {
                          required: true,
                          message: '请输入已出货产品处理方案',
                          trigger: 'blur',
                        },
                      ]"
                    >
                      <el-input
                        v-model="form.marketerDataTxt"
                        clearable
                        placeholder="请输入"
                        style="min-width: 250px"
                      ></el-input>
                    </el-form-item>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <el-form-item
            label="PMC终审人员"
            label-width="110px"
            prop="thirdPerson"
            class="margin-bottom-xs"
          >
            <el-select
              v-model="form.thirdPerson"
              placeholder="请选择PMC终审人员"
              filterable
              clearable
              :disabled="!!form.id"
            >
              <el-option
                v-for="item in pmcData"
                :label="item.personnel"
                :value="item.personnel"
                :key="item.id"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item
            label="最终审核人员"
            label-width="110px"
            prop="secondPerson"
            class="margin-bottom-xs"
          >
            <el-select
              v-model="form.secondPerson"
              placeholder="请选择最终审核人员"
              filterable
              clearable
              :disabled="!!form.id"
            >
              <el-option
                v-for="item in finalJudgmentData"
                :label="item.personnel"
                :value="item.personnel"
                :key="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="系统变更人员"
            label-width="110px"
            prop="systemPerson"
            class="margin-bottom-xs"
          >
            <el-select
              v-model="form.systemPerson"
              placeholder="请选择系统变更人员"
              filterable
              clearable
              :disabled="!!form.id"
            >
              <el-option
                v-for="item in systemChangeData"
                :label="item.personnel"
                :value="item.personnel"
                :key="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <div class="flex margin-bottom-xs">
            <el-form-item label="导入方式" prop="importType">
              <el-radio-group v-model="form.importType" class="grid_column_two">
                <el-radio :label="1" border>立即导入</el-radio>
                <el-radio :label="2" border> 自然导入 </el-radio>
                <el-radio :label="3" border>条件导入</el-radio>
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
      <el-col :xs="0" :span="2"></el-col>
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
import { cloneDeep } from "lodash";

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
        selBuyerData: [],
        buyerTxt: "",
        selQAData: [],
        QADataTxt: "",
        selProductData: [],
        productDataTxt: "",
        selEngineerData: [],
        engineerDataTxt: "",
        selResearchData: [],
        researchDataTxt: "",
        selWarehouseData: [],
        warehouseDataTxt: "",
        finishedHandleTxt: "",
        selMarketerData: [],
        marketerDataTxt: "",
        noMarketerDataTxt: "",
      },
      // 最终审核人员
      systemChangeData: [],
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
      // PMC人员
      pmcData: [],
      // 表单校验
      rules: {
        ecn: [{ required: true, message: "请输入ECR/N编号", trigger: "blur" }],
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
        thirdPerson: [
          { required: true, message: "请选择PMC人员", trigger: "change" },
        ],
        secondPerson: [
          { required: true, message: "请选择最终审核人员", trigger: "change" },
        ],
        systemPerson: [
          { required: true, message: "请选择系统变更人员", trigger: "change" },
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
        file: [
          { required: true, message: "请输入上传附件", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    isRequired() {
      return (type) => {
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
        this.getPeopleList(10);
        this.getPeopleList(11);
      }
    },
    "form.reqUnit"(reqUnit) {
      if (reqUnit) this.clearValidateItem("form", "reqUnit");
    },
    "form.file"(file) {
      if (file) this.clearValidateItem("form", "file");
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
            this.buyerData = this.handleSetCheckList(list, 2);
            break;
          case 3:
            this.QAData = this.handleSetCheckList(list, 3);
            break;
          case 4:
            this.productData = this.handleSetCheckList(list, 4);
            break;
          case 5:
            this.engineerData = this.handleSetCheckList(list, 5);
            break;
          case 6:
            this.researchData = this.handleSetCheckList(list, 6);
            break;
          case 7:
            this.warehouseData = this.handleSetCheckList(list, 7);
            break;
          case 8:
            this.marketerData = this.handleSetCheckList(list, 8);
            break;
          case 9:
            this.finalJudgmentData = list;
            break;
          case 10:
            this.pmcData = list;
            break;
          case 11:
            this.systemChangeData = list;
            
        }
      });
    },
    handleSetCheckList(data, field) {
      const copyData = cloneDeep(data);
      const { id, list } = this.form;
      if (id) {
        // 编辑
        const selectedData = list.filter(
          (item) => item.field === field && item.state !== 0
        );
        copyData.forEach((item) => {
          selectedData.forEach((cItem) => {
            item.disabled = item.personnel === cItem.fieldName;
          });
        });

        return copyData;
      } else {
        // 新增
        return data.map((item) => {
          return {
            ...item,
            disabled: false,
          };
        });
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
        selBuyerData: [],
        buyerTxt: "",
        selQAData: [],
        QADataTxt: "",
        selProductData: [],
        productDataTxt: "",
        selEngineerData: [],
        engineerDataTxt: "",
        selResearchData: [],
        researchDataTxt: "",
        selWarehouseData: [],
        warehouseDataTxt: "",
        finishedHandleTxt: "",
        selMarketerData: [],
        marketerDataTxt: "",
        noMarketerDataTxt: "",
      };
      this.resetForm("form");
    },
    handleAddJointPeople(paramCopyData) {
      const newList = [];

      if (paramCopyData.selBuyerData.length) {
        this.handleAddEachJointPeople(newList, paramCopyData.selBuyerData, 2, {
          programme: paramCopyData.buyerTxt,
        });
      }

      if (paramCopyData.selQAData.length) {
        this.handleAddEachJointPeople(newList, paramCopyData.selQAData, 3, {
          programme: paramCopyData.QADataTxt,
        });
      }

      if (paramCopyData.selProductData.length) {
        this.handleAddEachJointPeople(newList, paramCopyData.selProductData, 4, {
          programme: paramCopyData.productDataTxt,
        });
      }

      if (paramCopyData.selEngineerData.length) {
        this.handleAddEachJointPeople(newList, paramCopyData.selEngineerData, 5, {
          programme: paramCopyData.engineerDataTxt,
        });
      }

      if (paramCopyData.selResearchData.length) {
        this.handleAddEachJointPeople(newList, paramCopyData.selResearchData, 6, {
          programme: paramCopyData.researchDataTxt,
        });
      }

      if (paramCopyData.selWarehouseData.length) {
        this.handleAddEachJointPeople(newList, paramCopyData.selWarehouseData, 7, {
          programme: paramCopyData.warehouseDataTxt,
          treatment: paramCopyData.finishedHandleTxt,
        });
      }

      if (paramCopyData.selMarketerData.length) {
        this.handleAddEachJointPeople(newList, paramCopyData.selMarketerData, 8, {
          programme: paramCopyData.marketerDataTxt,
          treatment: paramCopyData.noMarketerDataTxt,
        });
      }

      return newList;
    },
    handleAddEachJointPeople(newList, checkPeopleData, field, params) {
      checkPeopleData.forEach((name) => {
        newList.push({
          field,
          fieldName: name,
          ...params,
        });
      });
    },
    handleEditJointPeople(paramCopyData) {
      if (paramCopyData.list.length) {
        const newList = [];

        if (paramCopyData.selBuyerData.length) {
          this.handleEditEachJointPeople(newList, paramCopyData.selBuyerData, 2, {
            programme: paramCopyData.buyerTxt,
          });
        }

        if (paramCopyData.selQAData.length) {
          this.handleEditEachJointPeople(newList, paramCopyData.selQAData, 3, {
            programme: paramCopyData.QADataTxt,
          });
        }

        if (paramCopyData.selProductData.length) {
          this.handleEditEachJointPeople(
            newList,
            paramCopyData.selProductData,
            4,
            {
              programme: paramCopyData.productDataTxt,
            }
          );
        }

        if (paramCopyData.selEngineerData.length) {
          this.handleEditEachJointPeople(
            newList,
            paramCopyData.selEngineerData,
            5,
            {
              programme: paramCopyData.engineerDataTxt,
            }
          );
        }

        if (paramCopyData.selResearchData.length) {
          this.handleEditEachJointPeople(
            newList,
            paramCopyData.selResearchData,
            6,
            {
              programme: paramCopyData.researchDataTxt,
            }
          );
        }

        if (paramCopyData.selWarehouseData.length) {
          this.handleEditEachJointPeople(
            newList,
            paramCopyData.selWarehouseData,
            7,
            {
              programme: paramCopyData.warehouseDataTxt,
              treatment: paramCopyData.finishedHandleTxt,
            }
          );
        }

        if (paramCopyData.selMarketerData.length) {
          this.handleEditEachJointPeople(
            newList,
            paramCopyData.selMarketerData,
            8,
            {
              programme: paramCopyData.marketerDataTxt,
              treatment: paramCopyData.noMarketerDataTxt,
            }
          );
        }
        return newList;
      }
    },
    handleEditEachJointPeople(newList, checkPeopleData, field, params) {
      const { list: editListData } = this.form;

      editListData.forEach(item => {
        if(checkPeopleData.includes(item.fieldName)) {
          newList.push({
            ...item,
            ...params,
          }); 
        }
      })

      const existingFieldNames = editListData.map(item => item.fieldName);
      checkPeopleData.forEach((name) => {
        if (!existingFieldNames.includes(name)) {
          newList.push({
            field,
            fieldName: name,
           ...params,
          });
        } 
      })

      return newList;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let param = cloneDeep(this.form);

          if (param.id) {
            const list = this.handleEditJointPeople(param);
            param.list = list;
          } else {
            const list = this.handleAddJointPeople(param);
            param.list = list;
          }

          param.changeCause = param.changeCause.toString();
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
                this.msgSuccess("创建成功");
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
        min-width: 145px !important;
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

  .card-box {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03),
      0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
    border-radius: 8px;
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

