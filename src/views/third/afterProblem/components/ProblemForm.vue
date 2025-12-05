<template>
  <el-dialog
    :title="isEdit ? '编辑售后问题处理' : '新增售后问题处理'"
    :visible="visible"
    width="1200px"
    append-to-body
    center
    top="2vh"
    :close-on-click-modal="false"
    @close="close"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="140px">
      <h3>基本信息</h3>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="问题来源" prop="problemSource">
            <el-input
              v-model="form.problemSource"
              placeholder="请输入问题来源"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="时间点" prop="problemTime">
            <el-date-picker
              v-model="form.problemTime"
              type="datetime"
              placeholder="请选择时间点"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="责任人" prop="responsiblePerson">
            <el-input
              v-model="form.responsiblePerson"
              placeholder="请输入责任人"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="问题描述" prop="problemDescription">
            <el-input
              v-model="form.problemDescription"
              type="textarea"
              :rows="3"
              placeholder="请输入问题描述"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="影响面" prop="impactScope">
            <el-input
              v-model="form.impactScope"
              type="textarea"
              :rows="3"
              placeholder="请输入影响面"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="问题分析（过程）" prop="problemAnalysis">
            <el-input
              v-model="form.problemAnalysis"
              type="textarea"
              :rows="3"
              placeholder="请输入问题分析过程"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <h3 class="margin-top">对策信息</h3>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="内部对策" prop="internalMeasures">
            <el-input
              v-model="form.internalMeasures"
              type="textarea"
              :rows="3"
              placeholder="请输入内部对策"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="外部对策" prop="externalMeasures">
            <el-input
              v-model="form.externalMeasures"
              type="textarea"
              :rows="3"
              placeholder="请输入外部对策"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <h3 class="margin-top">分析与确认</h3>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分析结果" prop="analysisResult">
            <el-input
              v-model="form.analysisResult"
              type="textarea"
              :rows="3"
              placeholder="请输入分析结果"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="效果确认" prop="effectivenessConfirmation">
            <el-input
              v-model="form.effectivenessConfirmation"
              type="textarea"
              :rows="3"
              placeholder="请输入效果确认"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="完成时间" prop="completionTime">
            <el-date-picker
              v-model="form.completionTime"
              type="datetime"
              placeholder="请选择完成时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="新售后ID列表" prop="afterNewIdList">
            <el-select
              v-model="form.afterNewIdList"
              multiple
              filterable
              allow-create
              placeholder="请输入或选择新售后ID"
              style="width: 100%"
            >
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  afterProblemAdd,
  afterProblemUpdate,
  afterProblemDetail
} from "@/api/third/afterProblem";

export default {
  name: "ProblemForm",
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
        afterNewIdList: []
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
        ]
      }
    };
  },
  methods: {
    /** 重置表单 */
    reset() {
      this.isEdit = false;
      this.form = {
        id: undefined,
        problemSource: "",
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
        afterNewIdList: []
      };
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
          this.form = { ...data };
        } catch (error) {
          console.error("获取详情失败:", error);
        }
      } else {
        // 直接使用传入的数据
        this.form = { ...row };
      }
      
      // 确保 afterNewIdList 是数组
      if (this.form.afterNewIdList && !Array.isArray(this.form.afterNewIdList)) {
        try {
          this.form.afterNewIdList = JSON.parse(this.form.afterNewIdList);
        } catch (e) {
          this.form.afterNewIdList = [];
        }
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
          
          const submitData = { ...this.form };
          
          // 处理 afterNewIdList，确保是数组格式
          if (submitData.afterNewIdList && Array.isArray(submitData.afterNewIdList)) {
            // 后端期望的是字符串数组
            submitData.afterNewIdList = submitData.afterNewIdList.map(item => String(item));
          }
          
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
h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 20px 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #DCDFE6;
  
  &:first-child {
    margin-top: 0;
  }
}

.margin-top {
  margin-top: 20px;
}

::v-deep .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
}
</style>

