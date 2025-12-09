<template>
  <el-dialog
    title="售后分析"
    :visible="visible"
    width="900px"
    append-to-body
    center
    top="3vh"
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
          </el-form-item>

          <el-form-item
            label="二级问题"
            prop="problemSubCategory"
            class="form-item-flex"
          >
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
            <Editor v-model="form.faultDescription" :min-height="200"  placeholder="请详细描述定位分析过程"/>
          </el-form-item>
        </div>

        <div class="section-row">
          <el-form-item
            label="分析负责人"
            prop="analysisResponsiblePerson"
            class="form-item-flex"
          >
            <select-loadMore
              v-model="form.analysisResponsiblePerson"
              :data="userListData.data"
              :page="userListData.page"
              :hasMore="userListData.more"
              dictLabel="nickName"
              dictValue="nickName"
              :request="getUserList"
              placeholder="请选择分析负责人"
              clearable
              filterable
              style="width: 100%"
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
            label="责任判定"
            prop="responsibilityCascader"
            class="form-item-flex"
          >
            <el-cascader
              v-model="form.responsibilityCascader"
              :options="responsibilityOptions"
              :props="{
                value: 'label',
                label: 'label',
                children: 'children',
                expandTrigger: 'hover',
                checkStrictly: false
              }"
              placeholder="请选择责任判定"
              clearable
              filterable
              style="width: 100%"
              @change="handleResponsibilityCascaderChange"
            />
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
  </el-dialog>
</template>

<script>
import Editor from "@/components/Editor";
import ElUploadSortable from "@/components/el-upload-sortable";
import reqUrl from "@/utils/requestUrl";
import { saleUpdate } from "@/api/third/sale";
import { listUser } from "@/api/system/user";

export default {
  name: "AfterAnalysis",
  components: {
    Editor,
    ElUploadSortable,
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
      // 当前时间（用于日期选择器默认时间）
      currentTime: this.getCurrentTimeString(),
      // 处理完成时间选择器配置
      completionTimePickerOptions: {
        selectableRange: this.getCurrentTimeString() + ' - ' + this.getCurrentTimeString()
      },
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
          : String(val)
              .trim()
              .toLowerCase();

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
  created() {
    this.getUserList();
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
        // 每次打开弹窗时更新当前时间
        this.updateCurrentTime();
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
        this.form.responsibilityDetermination = this.rowData.responsibilityPerson || "";
        
        // 延迟调用，确保字典数据已加载
        this.$nextTick(() => {
          console.log("🔍 [loadData $nextTick] responsibilityDetermination:", this.form.responsibilityDetermination);
          
          // 从二级值反推一级值
          if (this.form.responsibilityDetermination) {
            const groupLabel = this.findGroupByDetermination(this.form.responsibilityDetermination);
            console.log("🎯 [loadData] 反推结果 - 一级:", groupLabel, "二级:", this.form.responsibilityDetermination);
            
            this.form.responsibilityGroup = groupLabel || "";
            
            // 设置级联选择器的值
            if (this.form.responsibilityGroup) {
              this.form.responsibilityCascader = [
                this.form.responsibilityGroup,
                this.form.responsibilityDetermination
              ];
              console.log("✅ [loadData] 设置级联值:", this.form.responsibilityCascader);
            } else {
              console.warn("⚠️ [loadData] 未找到一级值，无法设置级联");
            }
          } else {
            console.warn("⚠️ [loadData] responsibilityDetermination 为空，跳过反推");
          }
        });
        this.form.analysisResponsiblePerson =
          this.rowData.locationAnalyst || "";
        // completionTime 不从数据库加载，始终使用当前时间
        // this.form.completionTime = this.rowData.locationHandleTime || "";
        this.form.confirmRemark = this.rowData.locationRemark || "";
        this.form.faultDescription = this.rowData.locationResult || "";
        this.form.causeOfOccurrence = this.rowData.analysisCause || "";
        this.form.causeOfOutflow = this.rowData.analysisOutflowCause || "";
      }
      setTimeout(() => {
        this.loading = false;
      }, 300);
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

    // 获取当前时间字符串（HH:mm:ss格式）
    getCurrentTimeString() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    },

    // 更新当前时间（每次打开弹窗时调用）
    updateCurrentTime() {
      const now = new Date();
      const timeString = this.getCurrentTimeString();
      
      // 更新时间选择器的默认时间
      this.currentTime = timeString;
      this.completionTimePickerOptions = {
        selectableRange: timeString + ' - ' + timeString
      };
      
      // 设置表单的完成时间为当前完整日期时间
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      this.form.completionTime = `${year}-${month}-${day} ${timeString}`;
    },

    // 构建责任判定级联数据
    buildResponsibilityOptions() {
      const groupDict = this.dict.type.responsibility_group || [];
      const determinationDict = this.dict.type.responsibility_determination || [];

      console.log('一级字典数据:', groupDict);
      console.log('二级字典数据:', determinationDict);

      if (groupDict.length === 0 || determinationDict.length === 0) {
        console.warn('字典数据未加载完成');
        return;
      }

      const normalize = (val) =>
        val === undefined || val === null ? "" : String(val).trim();

      // 构建级联数据结构
      this.responsibilityOptions = groupDict.map(group => {
        const groupLabel = normalize(group.label);
        const groupValue = normalize(group.value);

        // 根据 remark 字段关联二级数据
        // 注意：remark 可能为 null、undefined 或空字符串
        const children = determinationDict
          .filter(item => {
            // remark 在 DictData 的 raw 中
            const remarkRaw = item.raw?.remark ?? item.raw?.dictRemark ?? item.remark;
            const remark = normalize(remarkRaw);
            // 多个父级用逗号分隔的情况
            const remarkList = remark.split(/[,，]/).map(v => normalize(v)).filter(Boolean);

            // 打印每个二级项的 remark 值
            console.log(`检查匹配: 一级[${groupLabel}] vs 二级[${item.label}] remark="${remark}"`);
            
            // 多种匹配方式
            const remarkMatch = remarkList.some(r =>
              r === groupLabel || r === groupValue
            );
            
            if (remarkMatch) {
              console.log(`✓ 匹配成功: ${groupLabel} -> ${item.label}`);
            }
            
            return remarkMatch;
          })
          .map(item => ({
            label: item.label,
            value: item.label,
          }));

        const result = {
          label: group.label,
          value: group.label,
          children,
        };
        
        console.log(`构建结果 [${group.label}]:`, children.length > 0 ? `${children.length}个子项` : '无子项', result);
        return result;
      });

      console.log('最终级联数据:', this.responsibilityOptions);
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
      const determinationDict = this.dict.type.responsibility_determination || [];
      
      console.log('🔍 查找一级值，二级值:', determinationValue);
      console.log('一级字典:', groupDict.map(g => g.label));
      console.log('二级字典:', determinationDict.map(d => ({ label: d.label, remark: d.remark })));
      
      // 先查找二级项
      const targetItem = determinationDict.find(item => item.label === determinationValue);
      if (!targetItem) {
        console.warn('❌ 未找到二级项:', determinationValue);
        return "";
      }
      
      console.log('✓ 找到二级项:', targetItem);
      
      // 统一使用与构建级联数据相同的方式获取 remark
      const remarkRaw = targetItem.raw?.remark ?? targetItem.raw?.dictRemark ?? targetItem.remark;
      const remark = remarkRaw || "";
      const normalize = (str) => String(str).trim().toLowerCase();
      const remarkList = remark.split(/[,，]/).map(v => normalize(v)).filter(Boolean);
      
      console.log('remark 值:', remark);
      console.log('remark 列表:', remarkList);
      
      // 遍历所有一级选项，查找匹配的
      for (const group of groupDict) {
        const groupLabel = normalize(group.label);
        const groupValue = normalize(group.value);
        
        // 使用与构建级联数据相同的匹配逻辑
        const isMatch = remarkList.some(r => 
          r === groupLabel || r === groupValue
        );
        
        if (isMatch) {
          console.log('✅ 匹配成功! 一级值:', group.label);
          return group.label;
        }
      }
      
      console.warn('❌ 未找到匹配的一级值');
      console.log('调试信息 - remarkList:', remarkList);
      console.log('调试信息 - 一级选项:', groupDict.map(g => ({ label: g.label, value: g.value })));
      return "";
    },

    // 获取用户列表
    async getUserList(p, l) {
      try {
        const params = {
          pageNum: p || this.userListData.page,
          pageSize: l || 20,
        };
        const { rows, total } = await listUser(params);
        
        // 累加数据
        if (p === 1) {
          this.userListData.data = rows || [];
        } else {
          this.userListData.data = [...this.userListData.data, ...(rows || [])];
        }
        
        // 更新分页信息
        this.userListData.page = params.pageNum + 1;
        this.userListData.more = this.userListData.data.length < total;
      } catch (error) {
        console.error("获取用户列表失败:", error);
      }
    },

    handleSubmit() {
      this.$refs.analysisForm.validate((valid) => {
        if (!valid) {
          this.msgError("请填写必填项");
          return;
        }

        this.submitLoading = true;

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
          locationHandleTime: this.form.completionTime,
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
