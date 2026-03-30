<template>
  <el-dialog
    title="售后分析"
    :visible="visible"
    width="900px"
    append-to-body
    center
    top="0vh"
    :close-on-click-modal="false"
    @close="close"
    class="dialog-scroll"
  >
    <el-form
      ref="analysisForm"
      :model="form"
      :rules="rules"
      label-position="right"
      label-width="110px"
      v-loading="loading"
      class="analysis-container"
    >
      <!-- 问题确认 -->
      <fieldset class="analysis-section">
        <legend>问题确认</legend>
        <div class="section-row">
          <el-form-item
            label="一级问题"
            prop="problemCategory"
            class="form-item-flex"
          >
            <div class="select-with-btn">
              <el-select
                v-model="form.problemCategory"
                placeholder="请选择一级问题"
                clearable
                style="width: 100%"
                @change="handleProblemCategoryChange"
              >
                <el-option
                  v-for="dict in dict.type.after_problem_major_class"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.label"
                />
              </el-select>
              <el-button
                v-hasPermi="['third:afterSale:dictAdd']"
                type="primary"
                icon="el-icon-plus"
                circle
                size="mini"
                @click="openDictDialog('after_problem_major_class')"
              />
            </div>
          </el-form-item>

          <el-form-item
            label="二级问题"
            prop="problemSubCategory"
            class="form-item-flex"
          >
            <div class="select-with-btn">
              <el-select
                v-model="form.problemSubCategory"
                placeholder="请选择二级问题"
                clearable
                style="width: 100%"
                :disabled="!form.problemCategory"
              >
                <el-option
                  v-for="dict in filteredProblemMinorOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.label"
                />
              </el-select>
              <el-button
                v-hasPermi="['third:afterSale:dictAdd']"
                type="primary"
                icon="el-icon-plus"
                circle
                size="mini"
                :disabled="!form.problemCategory"
                @click="
                  openDictDialog(
                    'after_problem_minor_class',
                    form.problemCategory
                  )
                "
              />
            </div>
          </el-form-item>
        </div>

        <div class="section-row">
          <el-form-item
            label="问题照片"
            prop="problemImages"
            class="form-item-flex"
          >
            <el-upload-sortable
              v-model="form.problemImages"
              :action="actionUrl"
              :imgW="80"
              :imgH="80"
              :multiple="true"
            />
          </el-form-item>
        </div>

        <div class="section-row">
          <el-form-item
            label="问题视频"
            prop="problemVideos"
            class="form-item-flex"
          >
            <el-upload-sortable
              v-model="form.problemVideos"
              :action="actionUrl"
              :isVideo="true"
              accept="video/mp4"
              :imgW="80"
              :imgH="80"
            />
          </el-form-item>
        </div>
      </fieldset>

      <!-- 定位结果 -->
      <fieldset class="analysis-section">
        <legend>定位结果</legend>
        <div class="section-row">
          <el-form-item
            label="定位结果"
            prop="faultDescription"
            class="form-item-flex"
          >
            <Editor
              v-model="form.faultDescription"
              :min-height="200"
              placeholder="请详细描述定位分析过程"
            />
          </el-form-item>
        </div>

        <div class="section-row">
          <el-form-item
            label="分析负责人"
            prop="analysisResponsiblePerson"
            class="form-item-flex"
          >
            <TypedSelectLoadMore
              v-model="form.analysisResponsiblePerson"
              type="user"
              style="width: 100%"
              :return-label="true"
              placeholder="请选择分析负责人"
              clearable
            />
          </el-form-item>

          <el-form-item
            label="处理完成时间"
            prop="completionTime"
            class="form-item-flex"
          >
            <el-date-picker
              v-model="form.completionTime"
              type="datetime"
              disabled
              placeholder="请选择处理完成时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              :default-time="currentTime"
              :picker-options="completionTimePickerOptions"
              style="width: 100%"
            />
          </el-form-item>
        </div>
        <!-- <div class="section-row">
          <el-form-item
            label="备注"
            prop="confirmRemark"
            class="form-item-flex"
          >
            <el-input v-model="form.confirmRemark" type="textarea" :rows="4" placeholder="请输入备注"/>
          </el-form-item>
        </div> -->
      </fieldset>

      <!-- 原因分析 -->
      <fieldset class="analysis-section">
        <legend>原因分析</legend>
        <div class="section-row">
          <el-form-item
            label="发生原因"
            prop="causeOfOccurrence"
            class="form-item-flex"
          >
            <Editor v-model="form.causeOfOccurrence" :min-height="200" />
          </el-form-item>
        </div>

        <div class="section-row">
          <el-form-item
            label="流出原因"
            prop="causeOfOutflow"
            class="form-item-flex"
          >
            <Editor v-model="form.causeOfOutflow" :min-height="200" />
          </el-form-item>
        </div>
      </fieldset>

      <!-- 责任判定 -->
      <fieldset class="analysis-section">
        <legend>责任判定</legend>
        <div class="section-row">
          <el-form-item
            label="一二级责任"
            prop="responsibilityCascader"
            class="form-item-flex"
          >
            <div class="select-with-btn">
              <el-cascader
                v-model="form.responsibilityCascader"
                :options="responsibilityOptions"
                :props="{
                  value: 'label',
                  label: 'label',
                  children: 'children',
                  expandTrigger: 'hover',
                  checkStrictly: false,
                }"
                placeholder="请选择责任判定"
                clearable
                filterable
                style="width: 100%"
                @change="handleResponsibilityCascaderChange"
              />
              <el-dropdown
                v-hasPermi="['third:afterSale:dictAdd']"
                trigger="click"
                @command="handleResponsibilityDictAdd"
              >
                <el-button
                  type="primary"
                  icon="el-icon-plus"
                  circle
                  size="mini"
                />
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="responsibility_group"
                    >新增一级</el-dropdown-item
                  >
                  <el-dropdown-item command="responsibility_determination"
                    >新增二级</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-form-item>
        </div>
      </fieldset>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        确定
      </el-button>
    </div>

    <!-- 字典数据弹窗 -->
    <dict-data-dialog
      ref="dictDataDialog"
      :status-options="dictStatusOptions"
      :remark-disabled="remarkDisabled"
      @success="handleDictSuccess"
    />
  </el-dialog>
</template>

<script>
import Editor from "@/components/Editor";
import ElUploadSortable from "@/components/el-upload-sortable";
import DictDataDialog from "@/components/DictDataDialog";
import reqUrl from "@/utils/requestUrl";
import { saleUpdate } from "@/api/third/sale";
import { dictUserList } from "@/api/system/user";
import { getDictsPublic } from "@/api/system/dict/data";

export default {
  name: "AfterAnalysis",
  components: {
    Editor,
    ElUploadSortable,
    DictDataDialog,
  },
  dicts: [
    "after_problem_major_class",
    "after_problem_minor_class",
    "responsibility_group",
    "responsibility_determination",
  ],
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    rowData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      loading: false,
      submitLoading: false,
      actionUrl: reqUrl + "/oss/batch-upload",
      // 用户列表数据
      userListData: {
        data: [],
        page: 1,
        more: true,
      },
      // 责任判定级联数据
      responsibilityOptions: [],
      // 当前操作的字典类型
      currentDictType: "",
      // 当前关联的父级值（用于二级字典的remark）
      currentParentValue: "",
      // 备注是否禁用编辑
      remarkDisabled: false,
      // 字典状态选项
      dictStatusOptions: [
        { dictValue: "0", dictLabel: "正常" },
        { dictValue: "1", dictLabel: "停用" },
      ],
      // 当前时间（用于日期选择器默认时间）
      currentTime: "",
      // 处理完成时间选择器配置
      completionTimePickerOptions: {},
      // 原始表单数据快照（用于检测是否有修改）
      originalFormSnapshot: null,
      // 是否有字段被修改
      hasFormChanged: false,
      rules: {},
      form: {
        // 问题确认
        problemCategory: "", // 一级问题
        problemSubCategory: "", // 二级问题
        problemImages: "", // 问题照片
        problemVideos: "", // 问题视频
        responsibilityCascader: [], // 责任判定级联 [一级, 二级]
        responsibilityGroup: "", // 责任判定组（一级）
        responsibilityDetermination: "", // 责任判定（二级）
        analysisResponsiblePerson: "", // 分析负责人
        completionTime: "", // 处理完成时间
        confirmRemark: "", // 备注（富文本）
        faultDescription: "", // 定位结果（富文本）
        // 原因分析
        causeOfOccurrence: "", // 发生原因（富文本）
        causeOfOutflow: "", // 流出原因（富文本）
      },
    };
  },
  computed: {
    filteredProblemMinorOptions() {
      const majorDict = this.dict.type.after_problem_major_class || [];
      const minorDict = this.dict.type.after_problem_minor_class || [];
      const normalize = (val) =>
        val === undefined || val === null
          ? ""
          : String(val).trim().toLowerCase();

      if (!this.form.problemCategory) {
        return [];
      }

      const selectedMajorNormalized = normalize(this.form.problemCategory);
      const selectedMajor =
        majorDict.find(
          (item) =>
            normalize(item.label) === selectedMajorNormalized ||
            normalize(item.value) === selectedMajorNormalized
        ) || {};
      const selectedMajorLabel = normalize(
        selectedMajor.label || this.form.problemCategory
      );
      const selectedMajorValue = normalize(selectedMajor.value);

      return minorDict.filter((item) => {
        const remarkRaw =
          item.raw?.remark ?? item.raw?.dictRemark ?? item.remark ?? "";
        const remarkList = remarkRaw
          .split(/[,，]/)
          .map((v) => normalize(v))
          .filter(Boolean);

        if (remarkList.length === 0) {
          return false;
        }

        return remarkList.some(
          (remark) =>
            remark === selectedMajorLabel ||
            (selectedMajorValue && remark === selectedMajorValue)
        );
      });
    },
  },

  mounted() {
    // 延迟构建级联数据，确保字典数据已加载
    this.$nextTick(() => {
      setTimeout(() => {
        this.buildResponsibilityOptions();
      }, 500);
    });
  },
  watch: {
    visible(val) {
      if (val && this.rowData) {
        this.loadData();
        // 每次打开弹窗时重新构建级联数据
        this.$nextTick(() => {
          this.buildResponsibilityOptions();
        });
        // 重置修改标记
        this.hasFormChanged = false;
      }
    },
    "form.problemCategory"(val) {
      this.ensureProblemSubCategoryValidity(val);
    },
    filteredProblemMinorOptions(newOptions) {
      if (!this.form.problemCategory || !newOptions.length) {
        return;
      }
      this.ensureProblemSubCategoryValidity(this.form.problemCategory);
    },
  },
  methods: {
    loadData() {
      this.loading = true;
      // 从rowData加载数据到form
      if (this.rowData) {
        this.form.problemCategory = this.rowData.confirmMajorClass || "";
        this.form.problemSubCategory = this.rowData.confirmMinorClass || "";
        // el-upload-sortable 期望字符串类型（逗号分隔的URL）
        this.form.problemImages = this.rowData.file || "";
        this.form.problemVideos = this.rowData.video || "";
        // responsibilityPerson 现在存储二级值
        this.form.responsibilityDetermination =
          this.rowData.responsibilityPerson || "";

        // 延迟调用，确保字典数据已加载
        this.$nextTick(() => {
          // 从二级值反推一级值
          if (this.form.responsibilityDetermination) {
            const groupLabel = this.findGroupByDetermination(
              this.form.responsibilityDetermination
            );

            this.form.responsibilityGroup = groupLabel || "";

            // 设置级联选择器的值
            if (this.form.responsibilityGroup) {
              this.form.responsibilityCascader = [
                this.form.responsibilityGroup,
                this.form.responsibilityDetermination,
              ];
            } else {
            }
          } else {
          }

          // 数据加载完成后保存快照（用于检测修改）
          this.saveFormSnapshot();
        });
        this.form.analysisResponsiblePerson =
          this.rowData.locationAnalyst || "";
        // 加载数据库中的处理完成时间（如果有的话）
        this.form.completionTime = this.rowData.locationHandleTime || "";
        this.form.confirmRemark = this.rowData.locationRemark || "";
        this.form.faultDescription = this.rowData.locationResult || "";
        this.form.causeOfOccurrence = this.rowData.analysisCause || "";
        this.form.causeOfOutflow = this.rowData.analysisOutflowCause || "";
      }
      setTimeout(() => {
        this.loading = false;
      }, 300);
    },

    // 获取用于对比的表单数据（排除 completionTime）
    getFormSnapshotData() {
      const { completionTime, ...rest } = this.form;
      return JSON.stringify(rest);
    },

    // 保存表单快照
    saveFormSnapshot() {
      this.originalFormSnapshot = this.getFormSnapshotData();
      this.hasFormChanged = false;
    },

    // 检测表单是否有修改
    checkFormChanged() {
      return this.getFormSnapshotData() !== this.originalFormSnapshot;
    },

    ensureProblemSubCategoryValidity(value) {
      if (!value) {
        this.form.problemSubCategory = "";
        return;
      }

      const options = this.filteredProblemMinorOptions;
      if (!options.length) {
        // 字典数据还未加载完成，先保留当前值，待选项准备好后再校验
        return;
      }

      const isValid = options.some(
        (item) => item.label === this.form.problemSubCategory
      );

      if (!isValid) {
        this.form.problemSubCategory = "";
      }
    },

    handleProblemCategoryChange(value) {
      console.log("一级问题变更:", value);
      this.ensureProblemSubCategoryValidity(value);
    },

    // 打开字典弹窗
    openDictDialog(dictType, parentValue = "") {
      this.currentDictType = dictType;
      this.currentParentValue = parentValue;

      // 如果有父级值，禁用remark编辑
      this.remarkDisabled = !!parentValue;

      this.$refs.dictDataDialog.open(dictType);

      // 如果是二级字典，需要预设remark关联一级
      if (parentValue) {
        this.$nextTick(() => {
          // 通过ref访问弹窗内部form，设置remark
          const dialog = this.$refs.dictDataDialog;
          if (dialog && dialog.form) {
            dialog.form.remark = parentValue;
          }
        });
      }
    },

    // 责任判定字典新增
    handleResponsibilityDictAdd(command) {
      if (command === "responsibility_group") {
        this.openDictDialog("responsibility_group");
      } else if (command === "responsibility_determination") {
        // 二级需要选择关联的一级
        if (
          this.form.responsibilityCascader &&
          this.form.responsibilityCascader[0]
        ) {
          this.openDictDialog(
            "responsibility_determination",
            this.form.responsibilityCascader[0]
          );
        } else {
          // 没有选择一级时，弹出选择框
          this.$prompt("请输入关联的一级责任判定", "新增二级责任判定", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            inputPlaceholder: "请输入一级责任判定名称",
          })
            .then(({ value }) => {
              if (value) {
                this.openDictDialog("responsibility_determination", value);
              }
            })
            .catch(() => {});
        }
      }
    },

    // 字典新增成功回调
    async handleDictSuccess() {
      // 刷新对应的字典数据
      try {
        const res = await getDictsPublic(this.currentDictType);
        if (res.code === 200 && res.data) {
          // 更新本地字典数据
          this.dict.type[this.currentDictType] = res.data.map((item) => ({
            label: item.dictLabel,
            value: item.dictValue,
            raw: item,
            remark: item.remark,
          }));

          // 如果是责任判定相关，重新构建级联数据
          if (
            ["responsibility_group", "responsibility_determination"].includes(
              this.currentDictType
            )
          ) {
            this.buildResponsibilityOptions();
          }
        }
      } catch (error) {
        console.error("刷新字典数据失败:", error);
      }
    },

    // 获取当前时间字符串（HH:mm:ss格式）
    getCurrentTimeString() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    },

    // 获取当前完整日期时间字符串
    getCurrentFullDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    // 构建责任判定级联数据
    buildResponsibilityOptions() {
      const groupDict = this.dict.type.responsibility_group || [];
      const determinationDict =
        this.dict.type.responsibility_determination || [];

      console.log("一级字典数据:", groupDict);
      console.log("二级字典数据:", determinationDict);

      if (groupDict.length === 0 || determinationDict.length === 0) {
        console.warn("字典数据未加载完成");
        return;
      }

      const normalize = (val) =>
        val === undefined || val === null ? "" : String(val).trim();

      // 构建级联数据结构
      this.responsibilityOptions = groupDict.map((group) => {
        const groupLabel = normalize(group.label);
        const groupValue = normalize(group.value);

        // 根据 remark 字段关联二级数据
        // 注意：remark 可能为 null、undefined 或空字符串
        const children = determinationDict
          .filter((item) => {
            // remark 在 DictData 的 raw 中
            const remarkRaw =
              item.raw?.remark ?? item.raw?.dictRemark ?? item.remark;
            const remark = normalize(remarkRaw);
            // 多个父级用逗号分隔的情况
            const remarkList = remark
              .split(/[,，]/)
              .map((v) => normalize(v))
              .filter(Boolean);

            // 打印每个二级项的 remark 值
            console.log(
              `检查匹配: 一级[${groupLabel}] vs 二级[${item.label}] remark="${remark}"`
            );

            // 多种匹配方式
            const remarkMatch = remarkList.some(
              (r) => r === groupLabel || r === groupValue
            );

            if (remarkMatch) {
              console.log(`✓ 匹配成功: ${groupLabel} -> ${item.label}`);
            }

            return remarkMatch;
          })
          .map((item) => ({
            label: item.label,
            value: item.label,
          }));

        const result = {
          label: group.label,
          value: group.label,
          children,
        };

        console.log(
          `构建结果 [${group.label}]:`,
          children.length > 0 ? `${children.length}个子项` : "无子项",
          result
        );
        return result;
      });

      console.log("最终级联数据:", this.responsibilityOptions);
    },

    // 级联选择器变化
    handleResponsibilityCascaderChange(value) {
      if (value && value.length === 2) {
        this.form.responsibilityGroup = value[0];
        this.form.responsibilityDetermination = value[1];
      } else {
        this.form.responsibilityGroup = "";
        this.form.responsibilityDetermination = "";
      }
    },

    // 根据二级值查找一级值
    findGroupByDetermination(determinationValue) {
      const groupDict = this.dict.type.responsibility_group || [];
      const determinationDict =
        this.dict.type.responsibility_determination || [];

      console.log("🔍 查找一级值，二级值:", determinationValue);
      console.log(
        "一级字典:",
        groupDict.map((g) => g.label)
      );
      console.log(
        "二级字典:",
        determinationDict.map((d) => ({ label: d.label, remark: d.remark }))
      );

      // 先查找二级项
      const targetItem = determinationDict.find(
        (item) => item.label === determinationValue
      );
      if (!targetItem) {
        console.warn("❌ 未找到二级项:", determinationValue);
        return "";
      }

      console.log("✓ 找到二级项:", targetItem);

      // 统一使用与构建级联数据相同的方式获取 remark
      const remarkRaw =
        targetItem.raw?.remark ??
        targetItem.raw?.dictRemark ??
        targetItem.remark;
      const remark = remarkRaw || "";
      const normalize = (str) => String(str).trim().toLowerCase();
      const remarkList = remark
        .split(/[,，]/)
        .map((v) => normalize(v))
        .filter(Boolean);

      console.log("remark 值:", remark);
      console.log("remark 列表:", remarkList);

      // 遍历所有一级选项，查找匹配的
      for (const group of groupDict) {
        const groupLabel = normalize(group.label);
        const groupValue = normalize(group.value);

        // 使用与构建级联数据相同的匹配逻辑
        const isMatch = remarkList.some(
          (r) => r === groupLabel || r === groupValue
        );

        if (isMatch) {
          console.log("✅ 匹配成功! 一级值:", group.label);
          return group.label;
        }
      }

      console.warn("❌ 未找到匹配的一级值");
      console.log("调试信息 - remarkList:", remarkList);
      console.log(
        "调试信息 - 一级选项:",
        groupDict.map((g) => ({ label: g.label, value: g.value }))
      );
      return "";
    },

    handleSubmit() {
      this.$refs.analysisForm.validate((valid) => {
        if (!valid) {
          this.msgError("请填写必填项");
          return;
        }

        this.submitLoading = true;

        // 检测是否有字段被修改，如果有则更新处理完成时间为当前时间
        let completionTime = this.form.completionTime;
        if (this.checkFormChanged()) {
          completionTime = this.getCurrentFullDateTime();
          console.log("📝 检测到字段修改，更新处理完成时间:", completionTime);
        } else {
          console.log(
            "✅ 未检测到字段修改，保持原处理完成时间:",
            completionTime
          );
        }

        // 构建提交数据，映射到API参数
        const submitData = {
          id: this.rowData.id,
          confirmMajorClass: this.form.problemCategory,
          confirmMinorClass: this.form.problemSubCategory,
          file: this.form.problemImages,
          video: this.form.problemVideos,
          responsibilityPerson: this.form.responsibilityDetermination, // 责任判定（二级值）
          parentResponsibilityPerson: this.form.responsibilityGroup, // 一级责任判定
          responsibilityDetermination: this.form.responsibilityDetermination, // 责任判定
          locationAnalyst: this.form.analysisResponsiblePerson,
          locationHandleTime: completionTime,
          locationRemark: this.form.confirmRemark,
          locationResult: this.form.faultDescription,
          analysisCause: this.form.causeOfOccurrence,
          analysisOutflowCause: this.form.causeOfOutflow,
        };
        const list = [
          {
            categoryId: this.rowData.categoryId,
            computerId: this.rowData.computerId,
            sn: this.rowData.sn,
          },
        ];
        console.log("提交售后分析数据:", submitData);

        // 调用API接口
        saleUpdate({ ...submitData, list: list })
          .then((res) => {
            if (res.code === 200) {
              this.msgSuccess("售后分析保存成功");
              this.$emit("refresh");
              this.close();
            }
          })
          .finally(() => {
            this.submitLoading = false;
          });
      });
    },

    close() {
      this.$emit("update:visible", false);
      this.reset();
      // 重置表单验证
      this.$nextTick(() => {
        if (this.$refs.analysisForm) {
          this.$refs.analysisForm.clearValidate();
        }
      });
    },

    reset() {
      this.form = {
        // 问题确认
        problemCategory: "",
        problemSubCategory: "",
        problemImages: "",
        problemVideos: "",
        responsibilityCascader: [],
        responsibilityGroup: "",
        responsibilityDetermination: "",
        analysisResponsiblePerson: "",
        completionTime: "",
        confirmRemark: "",
        faultDescription: "",
        // 原因分析
        causeOfOccurrence: "",
        causeOfOutflow: "",
      };
      // 重置快照和修改标记
      this.originalFormSnapshot = null;
      this.hasFormChanged = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.analysis-section {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  background-color: #fafafa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);

  legend {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    padding: 0 12px;
    margin-bottom: 16px;
    background-color: transparent;
    border-radius: 4px;
    line-height: 32px;
  }
}

.section-row {
  display: flex;
  gap: 24px;
  margin-bottom: 0;

  &:last-child {
    margin-bottom: 0;
  }

  .form-item-flex {
    flex: 1;
  }
}

// 下拉框+按钮组合样式
.select-with-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  .el-select,
  .el-cascader {
    flex: 1;
  }

  .el-button--mini.is-circle {
    padding: 4px;
    flex-shrink: 0;
  }
}

// 富文本编辑器样式
::v-deep .editor {
  background: #fff;
  max-height: 300px;
  overflow-y: auto;

  .ql-container {
    max-height: 250px;
    overflow-y: auto;
  }

  .ql-editor {
    min-height: 150px;
    max-height: 250px;
    overflow-y: auto;
  }
}

.section-item {
  flex: 1;
  display: flex;
  align-items: flex-start;

  .item-label {
    min-width: 110px;
    padding: 6px 16px 6px 0;
    color: #606266;
    font-size: 14px;
    font-weight: 500;
    text-align: right;
    flex-shrink: 0;

    .required {
      color: #f56c6c;
      margin-right: 4px;
    }
  }

  .item-content {
    flex: 1;
    width: 100%;

    // 富文本编辑器样式
    ::v-deep .editor {
      background: #fff;

      &:hover {
        border-color: #c0c4cc;
      }
    }

    // 上传组件样式
    ::v-deep .el-upload-list {
      margin-top: 10px;
    }
  }
}

.dialog-footer {
  text-align: right;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  background-color: #fff;
}

// 滚动条样式
.analysis-container {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c0c4cc;
    border-radius: 3px;

    &:hover {
      background-color: #909399;
    }
  }

  &::-webkit-scrollbar-track {
    background-color: #f5f7fa;
    border-radius: 3px;
  }
}

// el-select 和 el-input 优化
::v-deep .el-select,
::v-deep .el-input,
::v-deep .el-date-picker {
  .el-input__inner {
    border-radius: 4px;

    &:hover {
      border-color: #c0c4cc;
    }

    &:focus {
      border-color: #409eff;
    }
  }
}

// 上传组件美化
::v-deep .el-upload-sortable {
  .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
    }
  }
}
</style>
