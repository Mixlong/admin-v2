<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="完成跟进记录"
    width="600px"
    center
    class="complete-activity-modal"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <div v-if="activity" class="complete-form">
      <!-- 跟进记录基本信息 -->
      <div class="activity-info mb-4">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="跟进内容" :span="2">
            {{ activity.followContent || activity.title }}
          </el-descriptions-item>
          <el-descriptions-item label="客户">{{
            activity.customerName
          }}</el-descriptions-item>
          <el-descriptions-item label="客户联系人">{{
            activity.contactName
          }}</el-descriptions-item>
          <el-descriptions-item label="跟进方式">{{
            activity.followMethod || activity.type
          }}</el-descriptions-item>
          <el-descriptions-item label="销售经理 ">{{
            activity.follower || activity.assigneeName
          }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 完成表单 -->
      <el-form
        ref="completeForm"
        :model="form"
        :rules="rules"
        label-width="100px"
        size="small"
      >
        <el-form-item label="完成时间" prop="completeTime">
          <el-date-picker
            v-model="form.completeTime"
            type="datetime"
            placeholder="请选择完成时间"
            style="width: 100%"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="完成结果" prop="result">
          <el-input
            v-model="form.result"
            type="textarea"
            :rows="4"
            placeholder="请输入跟进结果和后续计划"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="是否成功" prop="isSuccessful">
          <el-radio-group v-model="form.isSuccessful">
            <el-radio :label="true">成功</el-radio>
            <el-radio :label="false">未达预期</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="下次跟进" prop="nextFollowTime">
          <el-date-picker
            v-model="form.nextFollowTime"
            type="datetime"
            placeholder="请选择下次跟进时间（可选）"
            style="width: 100%"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            clearable
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          size="small"
          :loading="loading"
          @click="handleSubmit"
        >
          完成跟进
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { updateFollowRecord } from "@/api/crm/followRecord";

export default {
  name: "CompleteActivityModal",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    activity: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      loading: false,
      form: {
        completeTime: "",
        result: "",
        isSuccessful: true,
        nextFollowTime: "",
      },
      rules: {
        completeTime: [
          { required: true, message: "请选择完成时间", trigger: "change" },
        ],
        result: [
          { required: true, message: "请输入完成结果", trigger: "blur" },
        ],
        isSuccessful: [
          { required: true, message: "请选择是否成功", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit("update:visible", value);
      },
    },
  },
  watch: {
    visible(val) {
      if (val && this.activity) {
        this.resetForm();
        // 默认设置为当前时间
        this.form.completeTime = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      }
    },
  },
  methods: {
    resetForm() {
      this.form = {
        completeTime: "",
        result: "",
        isSuccessful: true,
        nextFollowTime: "",
      };
      this.$refs.completeForm && this.$refs.completeForm.resetFields();
    },

    handleClose() {
      this.resetForm();
      this.$emit("update:visible", false);
    },

    async handleSubmit() {
      try {
        await this.$refs.completeForm.validate();
        this.loading = true;

        const payload = {
          id: this.activity.id,
          status: "completed", // 标记为已完成
          completeTime: this.form.completeTime,
          result: this.form.result,
          isSuccessful: this.form.isSuccessful,
          nextFollowTime: this.form.nextFollowTime || null,
        };

        const response = await updateFollowRecord(payload);

        if (response.code === 200) {
          this.$message.success("跟进记录已完成");
          this.$emit("refresh");
          this.handleClose();
        } else {
          this.$message.error(response.msg || "操作失败");
        }
      } catch (error) {
        console.error("完成跟进记录失败:", error);
        this.$message.error("操作失败");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.complete-activity-modal .el-dialog {
  margin: 0 auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0 !important;
}

.complete-form {
  padding: 10px 0;
}

.activity-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

.complete-activity-modal :deep(.el-descriptions__label) {
  width: 80px;
  font-weight: 500;
  color: #606266;
  background-color: #fafafa;
}

.complete-activity-modal :deep(.el-descriptions__content) {
  color: #303133;
  font-weight: 400;
}

.complete-activity-modal :deep(.el-form-item) {
  margin-bottom: 20px;
}

.complete-activity-modal :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}
</style>
