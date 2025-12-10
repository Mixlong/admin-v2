<template>
  <el-dialog
    :title="isEdit ? '编辑' : '新增'"
    :visible="visible"
    width="900px"
    append-to-body
    center
    top="0vh"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    custom-class="problem-form-dialog"
    @close="close"
    class="dialog-scroll"
    @opened="handleDialogOpened"
  >
      <el-form ref="form" :model="form" :rules="rules" label-width="140px">
        <!-- 问题点 -->
        <fieldset class="form-fieldset">
          <legend>问题点</legend>
          <div class="form-row">
            <el-form-item label="问题来源" prop="problemSource" class="form-item-flex-1">
              <el-select
                v-model="form.problemSource"
                placeholder="请选择问题来源"
                clearable
                style="width: 100%"
                @change="handleProblemSourceChange"
              >
                <el-option label="客户反馈" :value="1" />
                <el-option label="生产反馈" :value="2" />
                <el-option label="品质反馈" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间点" prop="problemTime" class="form-item-flex-1">
              <el-date-picker
                v-model="form.problemTime"
                type="datetime"
                placeholder="请选择时间点"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </div>
  
          <div class="form-row">
            <el-form-item label="问题描述" prop="problemDescription" class="form-item-full">
              <Editor
                v-model="form.problemDescription"
                :min-height="150"
                placeholder="请详细描述问题"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item :label="businessLabel" prop="businessIdList" class="form-item-full">
              <div class="after-sale-select-wrapper">
                <el-button 
                  type="primary" 
                  icon="el-icon-search" 
                  size="small"
                  :disabled="!form.problemSource"
                  @click="openBusinessDialog"
                >
                  {{ businessButtonText }}
                </el-button>
                <span class="selected-info">
                  已选择 <span class="count">{{ (form.businessIdList || []).length }}</span> 条记录
                </span>
              </div>
              <div v-if="!form.problemSource" class="tip-text">
                <i class="el-icon-info"></i> 请先选择问题来源
              </div>
            </el-form-item>
          </div>
        </fieldset>
  
        <!-- 迪太研发&品质 -->
        <fieldset class="form-fieldset">
          <legend>迪太研发&品质</legend>
          <div class="form-row">
            <el-form-item label="问题分析（过程）" prop="problemAnalysis" class="form-item-full">
              <Editor
                v-model="form.problemAnalysis"
                :min-height="150"
                placeholder="请输入问题分析过程"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="分析结果" prop="analysisResult" class="form-item-full">
              <Editor
                v-model="form.analysisResult"
                :min-height="150"
                placeholder="请输入分析结果"
              />
            </el-form-item>
          </div>
        </fieldset>
  
        <!-- 对策 -->
        <fieldset class="form-fieldset">
          <legend>对策</legend>
          <div class="form-row">
            <el-form-item label="影响面" prop="impactScope" class="form-item-full">
              <Editor
                v-model="form.impactScope"
                :min-height="150"
                placeholder="请输入影响面"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="内部对策" prop="internalMeasures" class="form-item-full">
              <Editor
                v-model="form.internalMeasures"
                :min-height="150"
                placeholder="请输入内部对策"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="外部对策" prop="externalMeasures" class="form-item-full">
              <Editor
                v-model="form.externalMeasures"
                :min-height="150"
                placeholder="请输入外部对策"
              />
            </el-form-item>
          </div>
        </fieldset>
  
        <!-- 改善跟踪 -->
        <fieldset class="form-fieldset">
          <legend>改善跟踪</legend>
          <div class="form-row">
            <el-form-item label="责任人" prop="responsiblePerson" class="form-item-flex-1">
              <el-select
                v-model="form.responsiblePerson"
                filterable
                clearable
                placeholder="请选择责任人"
                style="width: 100%"
              >
                <el-option
                  v-for="user in responsiblePersonList"
                  :key="user.userId"
                  :label="user.displayName"
                  :value="user.displayName"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="完成时间" prop="completionTime" class="form-item-flex-1">
              <el-date-picker
                v-model="form.completionTime"
                type="datetime"
                placeholder="请选择完成时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="效果确认" prop="effectivenessConfirmation" class="form-item-full">
              <Editor
                v-model="form.effectivenessConfirmation"
                :min-height="150"
                placeholder="请输入效果确认"
              />
            </el-form-item>
          </div>
        </fieldset>

        <!-- 分析报告 -->
        <fieldset class="form-fieldset">
          <legend>分析报告</legend>
          <div class="form-row">
            <el-form-item label="是否需要报告" prop="needReport" class="form-item-flex-1">
              <el-radio-group v-model="form.needReport">
                <el-radio :label="0">否</el-radio>
                <el-radio :label="1">是</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <div v-if="form.needReport === 1" class="form-row">
            <el-form-item label="上传分析报告" prop="reportFile" class="form-item-full">
              <MyUpload
                v-model="form.reportFile"
                :limit="10"
                btnTitle="点击上传分析报告"
              />
            </el-form-item>
          </div>
        </fieldset>
      </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        确 定
      </el-button>
    </div>

    <!-- 售后记录选择组件 -->
    <AfterSaleRecordSelector
      :visible.sync="afterSaleDialogVisible"
      :selected-ids="form.businessIdList"
      @confirm="handleAfterSaleConfirm"
    />

    <!-- 生产记录选择组件 -->
    <ProductionRecordSelector
      :visible.sync="productionDialogVisible"
      :selected-ids="form.businessIdList"
      @confirm="handleProductionConfirm"
    />

    <!-- 品质记录选择组件 -->
    <QualityRecordSelector
      :visible.sync="qualityDialogVisible"
      :selected-ids="form.businessIdList"
      @confirm="handleQualityConfirm"
    />
  </el-dialog>
</template>

<script>
import {
  afterProblemAdd,
  afterProblemUpdate,
  afterProblemDetail
} from "@/api/third/afterProblem";
import { dictPmProject } from "@/api/third/project";
import Editor from "@/components/Editor";
import MyUpload from "@/components/MyUpload";
import AfterSaleRecordSelector from "./AfterSaleRecordSelector.vue";
import ProductionRecordSelector from "./ProductionRecordSelector.vue";
import QualityRecordSelector from "./QualityRecordSelector.vue";

export default {
  name: "ProblemForm",
  components: {
    Editor,
    MyUpload,
    AfterSaleRecordSelector,
    ProductionRecordSelector,
    QualityRecordSelector
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isEdit: false,
      submitLoading: false,
      form: {
        id: undefined,
        problemSource: "",
        problemSourceSn: "",
        problemDescription: "",
        problemTime: "",
        responsiblePerson: "",
        impactScope: "",
        problemAnalysis: "",
        internalMeasures: "",
        externalMeasures: "",
        analysisResult: "",
        effectivenessConfirmation: "",
        completionTime: "",
        businessIdList: [],  // 改名为 businessIdList
        needReport: 0,  // 是否需要报告 0.不需要 1.需要
        reportFile: ""  // 分析报告文件
      },
      rules: {
        problemSource: [
          { required: true, message: "请输入问题来源", trigger: "blur" }
        ],
        problemDescription: [
          { required: true, message: "请输入问题描述", trigger: "blur" }
        ],
        problemTime: [
          { required: true, message: "请选择时间点", trigger: "change" }
        ],
        responsiblePerson: [
          { required: true, message: "请输入责任人", trigger: "blur" }
        ],
        businessIdList: [
          { 
            required: true, 
            message: "请选择关联的业务记录", 
            trigger: "change",
            validator: (rule, value, callback) => {
              if (!value || value.length === 0) {
                callback(new Error("请选择至少一条业务记录"));
              } else {
                callback();
              }
            }
          }
        ]
      },
      // 售后记录弹窗
      afterSaleDialogVisible: false,
      
      // 生产记录弹窗
      productionDialogVisible: false,
      
      // 品质记录弹窗
      qualityDialogVisible: false,
      
      // 责任人列表
      responsiblePersonList: []
    };
  },
  watch: {
    visible(val) {
      if (val) {
        // 加载责任人列表
        if (this.responsiblePersonList.length === 0) {
          this.loadResponsiblePersonList();
        }
      }
    }
  },
  computed: {
    // 根据问题来源动态显示标签
    businessLabel() {
      const labels = {
        1: '关联售后',
        2: '关联维修',
        3: '关联品质'
      };
      return labels[this.form.problemSource] || '关联业务';
    },
    // 根据问题来源动态显示按钮文字
    businessButtonText() {
      const texts = {
        1: '选择售后记录',
        2: '选择维修记录',
        3: '选择品质记录'
      };
      return texts[this.form.problemSource] || '选择业务记录';
    }
  },
  mounted() {
    // 组件加载时获取责任人列表
    this.loadResponsiblePersonList();
  },

  methods: {
    /** 对话框打开后的处理 */
    handleDialogOpened() {
      // 防止富文本初始化导致滚动
      this.$nextTick(() => {
        const dialogBody = document.querySelector('.el-dialog__body');
        if (dialogBody) {
          dialogBody.scrollTop = 0;
        }
      });
    },
    /** 问题来源变化处理 */
    handleProblemSourceChange(value) {
      // 清空已选择的业务记录
      this.form.businessIdList = [];
      this.form.problemSourceSn = '';
      console.log('问题来源变化:', value);
    },

    /** 打开业务记录选择弹窗 */
    openBusinessDialog() {
      if (!this.form.problemSource) {
        this.msgWarning('请先选择问题来源');
        return;
      }
      
      // 根据问题来源打开不同的弹窗
      switch (this.form.problemSource) {
        case 1: // 客户反馈 -> 售后记录
          this.afterSaleDialogVisible = true;
          break;
        case 2: // 生产反馈 -> 生产记录
          this.productionDialogVisible = true;
          break;
        case 3: // 品质反馈 -> 品质记录
          this.qualityDialogVisible = true;
          break;
        default:
          this.msgWarning('未知的问题来源类型');
      }
    },

    /** 确认选择售后记录 */
    handleAfterSaleConfirm(records) {
      this.form.businessIdList = records.map(item => item.id);
      const snList = records
        .map(item => item.sn || item.pcbaSn || item.schedulingNo || "")
        .filter(Boolean);
      this.form.problemSourceSn = snList.join(",") || "";
      this.msgSuccess(`已选择 ${this.form.businessIdList.length} 条售后记录`);
      
      // 触发表单验证，清除错误提示
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.validateField('businessIdList');
        }
      });
    },

    /** 确认选择维修记录 */
    handleProductionConfirm(records) {
      this.form.businessIdList = records.map(item => item.id);
      const schedulingNoList = records
        .map(item => item.schedulingNo || item.pcbaSn || "")
        .filter(Boolean);
      this.form.problemSourceSn = schedulingNoList.join(",") || "";
      this.msgSuccess(`已选择 ${this.form.businessIdList.length} 条维修记录`);
      
      // 触发表单验证，清除错误提示
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.validateField('businessIdList');
        }
      });
    },

    /** 确认选择品质记录 */
    handleQualityConfirm(records) {
      this.form.businessIdList = records.map(item => item.id);
      const snList = records
        .map(item => item.sn || item.pcbaSn || item.schedulingNo || "")
        .filter(Boolean);
      this.form.problemSourceSn = snList.join(",") || "";
      this.msgSuccess(`已选择 ${this.form.businessIdList.length} 条品质记录`);
      
      // 触发表单验证，清除错误提示
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.validateField('businessIdList');
        }
      });
    },

    /** 加载责任人列表 */
    async loadResponsiblePersonList() {
      try {
        const response = await dictPmProject();
        if (response && response.data) {
          let list = [];
          // 处理不同的数据结构
          if (Array.isArray(response.data)) {
            list = response.data;
          } else if (response.data.list) {
            list = response.data.list;
          }
          
          // 统一数据格式
          this.responsiblePersonList = list.map(item => ({
            userId: item.id || item.dictValue || item.userId,
            userName: item.dictValue || item.userName || item.name,
            displayName: item.dictLabel || item.nickName || item.userName || item.name
          }));
          
          // 去重
          const uniqueMap = new Map();
          this.responsiblePersonList.forEach(item => {
            if (!uniqueMap.has(item.userId)) {
              uniqueMap.set(item.userId, item);
            }
          });
          this.responsiblePersonList = Array.from(uniqueMap.values());
        }
      } catch (error) {
        console.error('获取责任人列表失败:', error);
      }
    },

    /** 重置表单 */
    reset() {
      this.isEdit = false;
      this.form = {
        id: undefined,
        problemSource: "",
        problemSourceSn: "",
        problemDescription: "",
        problemTime: "",
        responsiblePerson: "",
        impactScope: "",
        problemAnalysis: "",
        internalMeasures: "",
        externalMeasures: "",
        analysisResult: "",
        effectivenessConfirmation: "",
        completionTime: "",
        businessIdList: [],
        needReport: 0,
        reportFile: ""
      };
      // 重置弹窗状态
      this.afterSaleDialogVisible = false;
      this.productionDialogVisible = false;
      this.qualityDialogVisible = false;
      
      // 清空表单验证
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate();
      });
    },

    /** 设置表单数据（编辑） */
    async setFormData(row) {
      this.isEdit = true;
      
      // 如果传入的是ID，则获取详情
      if (typeof row === 'string') {
        try {
          const { data } = await afterProblemDetail(row);
          // 合并数据，保留默认值
          this.form = Object.assign({}, this.form, data);
          this.$nextTick(() => {
            this.processFormData();
          });
        } catch (error) {
          console.error("获取详情失败:", error);
        }
      } else {
        // 直接使用传入的数据，合并而不是覆盖
        this.form = Object.assign({}, this.form, row);
        this.$nextTick(() => {
          this.processFormData();
        });
      }
    },

    /** 处理表单数据 */
    processFormData() {
      // 处理后端返回的 businessIds 字段（逗号分隔的字符串）
      if (this.form.businessIds && typeof this.form.businessIds === 'string') {
        // 将逗号分隔的字符串转换为数组
        this.form.businessIdList = this.form.businessIds
          .split(',')
          .map(id => id.trim())
          .filter(id => id);  // 过滤空字符串
      }
      
      // 确保 businessIdList 是数组
      if (this.form.businessIdList && !Array.isArray(this.form.businessIdList)) {
        try {
          this.form.businessIdList = JSON.parse(this.form.businessIdList);
        } catch (e) {
          this.form.businessIdList = [];
        }
      } else if (!this.form.businessIdList) {
        this.form.businessIdList = [];
      }
      
      // 确保富文本字段不为 null
      const richTextFields = [
        'problemDescription',
        'impactScope',
        'problemAnalysis',
        'internalMeasures',
        'externalMeasures',
        'analysisResult',
        'effectivenessConfirmation'
      ];
      
      richTextFields.forEach(field => {
        if (this.form[field] === null || this.form[field] === undefined) {
          this.form[field] = '';
        }
      });

      // 确保来源标识字符串存在（用于 SMT 排产单号等）
      if (this.form.problemSourceSn === null || this.form.problemSourceSn === undefined) {
        this.form.problemSourceSn = '';
      }

      // 确保 needReport 是数字类型
      if (this.form.needReport === null || this.form.needReport === undefined) {
        this.form.needReport = 0;
      } else {
        this.form.needReport = Number(this.form.needReport);
      }

      // 确保 reportFile 是字符串
      if (this.form.reportFile === null || this.form.reportFile === undefined) {
        this.form.reportFile = '';
      }
    },

    /** 关闭对话框 */
    close() {
      this.$emit("update:visible", false);
      this.reset();
    },

    /** 提交表单 */
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          
          // 深拷贝表单数据
          const submitData = JSON.parse(JSON.stringify(this.form));
          
          // 处理 businessIdList，确保是字符串数组格式
          if (submitData.businessIdList && Array.isArray(submitData.businessIdList)) {
            // 后端期望的是字符串数组 Array[string]
            submitData.businessIdList = submitData.businessIdList.map(item => String(item));
          } else {
            // 如果不是数组，设置为空数组
            submitData.businessIdList = [];
          }
          
          // 处理富文本字段，确保是字符串格式
          const richTextFields = [
            'problemDescription',
            'impactScope', 
            'problemAnalysis',
            'internalMeasures',
            'externalMeasures',
            'analysisResult',
            'effectivenessConfirmation'
          ];
          
          richTextFields.forEach(field => {
            if (submitData[field] === null || submitData[field] === undefined) {
              submitData[field] = '';
            } else if (typeof submitData[field] !== 'string') {
              submitData[field] = String(submitData[field]);
            }
          });
          
          // 处理字符串字段，确保不为 null
          const stringFields = [
            'problemSource',
            'problemSourceSn',
            'problemTime',
            'responsiblePerson',
            'completionTime'
          ];
          
          stringFields.forEach(field => {
            if (submitData[field] === null || submitData[field] === undefined) {
              submitData[field] = '';
            }
          });
          
          // 打印提交数据，方便调试
          console.log('提交数据:', {
            ...submitData,
            businessIdList: submitData.businessIdList,
            businessIdListType: Array.isArray(submitData.businessIdList) ? 'Array' : typeof submitData.businessIdList,
            businessIdListLength: submitData.businessIdList?.length || 0
          });
          
          const apiFunc = this.isEdit ? afterProblemUpdate : afterProblemAdd;
          
          apiFunc(submitData)
            .then((res) => {
              if (res.code === 200) {
                this.msgSuccess(this.isEdit ? "修改成功" : "新增成功");
                this.close();
                this.$emit("success");
              } else {
                this.msgError(res.msg || "操作失败");
              }
            })
            .catch((error) => {
              console.error("提交失败:", error);
              this.msgError("操作失败，请稍后重试");
            })
            .finally(() => {
              this.submitLoading = false;
            });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.problem-form-dialog {
  // Fieldset 分组样式
  .form-fieldset {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 16px 20px 8px 20px;
    margin-bottom: 20px;

    legend {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      padding: 0 8px;
      margin-left: -8px;
      background-color: transparent;
      border-radius: 4px;
      padding: 4px 12px;
    }
  }

  // Flexbox 表单行布局
  .form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 0;
    
    // 响应式布局
    @media (max-width: 1200px) {
      flex-wrap: wrap;
    }
  }

  // 表单项 flex 布局
  .form-item-flex-1 {
    flex: 1;
    min-width: 0; // 防止内容溢出

    ::v-deep .editor {
      width: 100%;
    }
  }

  .form-item-full {
    flex: 1 1 100%;
    width: 100%;

    ::v-deep .editor {
      width: 100%;
    }
  }

  // Flex 工具类
  .flex {
    display: flex;
  }

  .align-center {
    align-items: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .justify-center {
    justify-content: center;
  }

  // 售后记录选择区域样式
  .after-sale-select-wrapper {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px 15px;
    background-color: #f5f7fa;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    
    .selected-info {
      font-size: 14px;
      color: #606266;
      
      .count {
        color: #409eff;
        font-weight: 600;
        font-size: 16px;
      }
    }
  }

  // 弹窗搜索区域样式
  .dialog-search-area {
    padding: 15px 15px 0 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 15px;
    
    ::v-deep .el-form {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
    }
    
    ::v-deep .el-form-item {
      margin-bottom: 15px;
      margin-right: 10px;
      
      .el-form-item__label {
        padding-right: 8px;
        line-height: 32px;
      }
      
      .el-form-item__content {
        line-height: 32px;
      }
    }
  }

  // 弹窗表格区域样式
  .dialog-table-area {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding: 0 5px;
      
      .selected-count {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }
    }
    
    ::v-deep .el-table {
      font-size: 13px;
      
      th {
        background-color: #f5f7fa;
        font-weight: 600;
      }
      
      .el-table__body-wrapper {
        &::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        &::-webkit-scrollbar-thumb {
          background-color: #dcdfe6;
          border-radius: 4px;
          
          &:hover {
            background-color: #c0c4cc;
          }
        }
        
        &::-webkit-scrollbar-track {
          background-color: #f5f7fa;
        }
      }
    }
    
    ::v-deep .el-pagination {
      padding: 10px 0 0 0;
      
      .el-pagination__total {
        font-weight: 500;
      }
    }
  }

  // 提示文字样式
  .tip-text {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    
    i {
      margin-right: 4px;
    }
  }

  .dialog-footer {
    text-align: right;
    padding: 15px 20px 0;
  }

  // Element UI 组件样式覆盖（隔离在此对话框内）
  ::v-deep .el-dialog__body {
    max-height: 70vh;
    overflow-y: auto;
  }

  ::v-deep .el-select-dropdown__item {
    padding: 8px 20px;
  }

  ::v-deep .editor {
    width: 100%;
    
    .ql-container {
      min-height: 150px;
    }
    
    .ql-editor {
      min-height: 150px;
      max-height: 300px;
      overflow-y: auto;
    }
  }
}
</style>
