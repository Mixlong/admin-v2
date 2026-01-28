<template>
  <el-dialog
    :title="isEdit ? '编辑跟进记录' : '新增跟进记录'"
    :visible.sync="dialogVisible"
    width="800px"
    center
    :before-close="handleClose"
    class="follow-record-form-dialog"
    :close-on-click-modal="false"
    top="0vh"
  >
    <el-form
      ref="followRecordForm"
      :model="form"
      :rules="rules"
      label-width="120px"
      size="small"
      @submit.prevent
    >
      <!-- 基本信息 -->
      <fieldset class="form-fieldset">
        <legend>基本信息</legend>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerId">
              <SelectLoadMore
                v-model="form.customerId"
                :data="customerData.data"
                :page="customerData.page"
                :hasMore="customerData.more"
                dictLabel="name"
                dictValue="id"
                :request="getCustomerData"
                size="small"
                :placeholder="
                  defaultCustomerId
                    ? '客户已锁定（来自跟进计划）'
                    : '请选择客户名称'
                "
                clearable
                :disabled="!!defaultCustomerId"
                style="width: 100%"
                @change="handleCustomerChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户联系人" prop="contactId">
              <SelectLoadMore
                v-model="form.contactId"
                :data="contactData.data"
                :page="contactData.page"
                :hasMore="contactData.more"
                dictLabel="contactName"
                dictValue="id"
                :request="getContactData"
                size="small"
                placeholder="请选择客户联系人"
                clearable
                style="width: 100%"
                :disabled="!form.customerId"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="沟通方式" prop="followMethod">
              <el-select
                v-model="form.followMethod"
                placeholder="请选择沟通方式"
                style="width: 100%"
              >
                <el-option
                  v-for="option in followMethodOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="跟进时间" prop="followTime">
              <el-date-picker
                v-model="form.followTime"
                type="datetime"
                placeholder="请选择跟进时间"
                style="width: 100%"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="跟进内容" prop="followContent">
          <el-input
            v-model="form.followContent"
            type="textarea"
            :rows="4"
            placeholder="请输入跟进内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </fieldset>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        size="small"
        @click="handleSubmit"
        :loading="loading"
      >
        {{ isEdit ? "更新" : "创建" }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addFollowRecord, updateFollowRecord } from "@/api/crm/followRecord";
import { getSoCustomerList } from "@/api/crm/soCustomer";
import { getCustomerContactList } from "@/api/third/customerContact";
import SelectLoadMore from "@/components/selectLoadMore";
import TypedSelectLoadMore from "@/components/TypedSelectLoadMore";
import { FOLLOW_METHOD_OPTIONS } from "@/views/crm/constants";

export default {
  name: "AddFollowRecordDialog",
  components: {
    SelectLoadMore,
    TypedSelectLoadMore,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    defaultCustomerId: {
      type: String,
      default: "",
    },
    defaultCustomerName: {
      type: String,
      default: "",
    },
    defaultPlanId: {
      type: String,
      default: "",
    },
    followRecord: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      followMethodOptions: FOLLOW_METHOD_OPTIONS,
      loading: false,
      form: {
        customerId: "",
        contactId: "",
        followMethod: "",
        follower: "",
        followTime: "",
        departmentId: "",
        followContent: "",
        planId: "", // 跟进计划ID
        id: "", // 编辑时的记录ID
      },
      // 客户数据
      customerData: {
        data: [],
        page: 1,
        more: true,
      },
      // 联系人数据
      contactData: {
        data: [],
        page: 1,
        more: true,
      },
      rules: {
        customerId: [
          { required: true, message: "请选择客户名称", trigger: "change" },
        ],
        contactId: [
          { required: false, message: "请选择联系人", trigger: "change" },
        ],
        followMethod: [
          { required: false, message: "请选择沟通方式", trigger: "change" },
        ],
        followTime: [
          { required: true, message: "请选择跟进时间", trigger: "change" },
        ],
        followContent: [
          { required: true, message: "请输入跟进内容", trigger: "blur" },
        ],
      },
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      },
    },
    isEdit() {
      return !!(this.followRecord && this.followRecord.id);
    },
  },
  mounted() {
    this.getCustomerData();
  },
  watch: {
    visible(val) {
      if (val) {
        // 确保客户数据已加载
        if (this.customerData.data.length === 0) {
          this.getCustomerData().then(() => {
            if (this.isEdit) {
              this.loadFollowRecord();
            } else {
              this.resetForm();
              this.handleDefaultCustomer();
              this.handleDefaultPlan();
            }
          });
        } else {
          if (this.isEdit) {
            this.loadFollowRecord();
          } else {
            this.resetForm();
            this.handleDefaultCustomer();
            this.handleDefaultPlan();
          }
        }
      }
    },
    followRecord: {
      handler(newVal) {
        if (newVal && this.visible) {
          this.loadFollowRecord();
        }
      },
      immediate: true,
    },
  },
  methods: {
    resetForm() {
      this.form = {
        customerId: "",
        contactId: "",
        followMethod: "",
        follower: "",
        followTime: "",
        departmentId: "",
        followContent: "",
        planId: "", // 跟进计划ID
      };
      // 只在没有默认客户时重置客户数据
      if (!this.defaultCustomerId) {
        this.customerData = { data: [], page: 1, more: true };
      }
      this.contactData = { data: [], page: 1, more: true };

      this.$nextTick(() => {
        if (this.$refs.followRecordForm) {
          this.$refs.followRecordForm.clearValidate();
        }
      });
    },

    // 获取客户数据
    getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getSoCustomerList({
          p: page,
          l: 20,
          name: keyword,
        })
          .then((res) => {
            console.log("客户API响应:", res);
            const { list, total, pageNum, pageSize } = res.data;
            const filteredList = list.filter((item) => item.status === 0);

            if (more) {
              this.customerData.data = [
                ...this.customerData.data,
                ...filteredList,
              ];
            } else {
              this.customerData.data = filteredList;
            }

            this.customerData.page = pageNum;
            this.customerData.more = this.customerData.data.length < total;
            resolve();
          })
          .catch((error) => {
            console.error("获取客户列表失败:", error);
            resolve();
          });
      });
    },

    // 处理默认客户设置
    async handleDefaultCustomer() {
      if (this.defaultCustomerId) {
        // 确保客户选项存在
        await this.ensureCustomerOptionPresent(this.defaultCustomerId);
        // 设置客户ID并加载联系人
        this.form.customerId = this.defaultCustomerId;
        this.handleCustomerChange(this.defaultCustomerId);
      }
    },

    // 处理默认计划ID
    handleDefaultPlan() {
      if (this.defaultPlanId) {
        console.log("设置默认跟进计划ID:", this.defaultPlanId);
        this.form.planId = this.defaultPlanId;
      }
    },

    // 加载跟进记录数据（编辑模式）
    async loadFollowRecord() {
      if (this.followRecord) {
        console.log("编辑模式 - 加载跟进记录数据:", this.followRecord);
        console.log("当前表单数据（加载前）:", this.form);
        this.form = {
          id: this.followRecord.id || "",
          customerId: this.followRecord.customerId || "",
          contactId: this.followRecord.contactId || "",
          followMethod: this.followRecord.followMethod || "",
          follower: this.followRecord.follower || "",
          followTime: this.followRecord.followTime || "",
          departmentId: this.followRecord.departmentId || "",
          followContent: this.followRecord.followContent || "",
          planId: this.followRecord.planId || "",
        };

        // 加载客户数据并确保当前选中的客户在列表中
        if (this.form.customerId) {
          await this.ensureCustomerOptionPresent(this.form.customerId);
          // 加载对应的联系人数据
          await this.getContactData();
          // 确保当前选中的联系人在列表中
          if (this.form.contactId) {
            this.ensureContactOptionPresent(
              this.form.contactId,
              this.followRecord.contactName
            );
          }
        }
      }
    },

    // 确保联系人选项存在（用于编辑时回显）
    ensureContactOptionPresent(id, contactName) {
      if (!id) return;
      const exists = this.contactData.data.some(
        (opt) => String(opt.id) === String(id)
      );
      if (!exists) {
        this.contactData.data.unshift({ id, contactName });
      }
    },

    // 确保客户选项存在（用于回显）
    async ensureCustomerOptionPresent(customerId) {
      if (!customerId) return;
      const exists = this.customerData.data.some(
        (opt) => String(opt.id) === String(customerId)
      );
      if (!exists) {
        // 如果客户不存在，尝试重新加载客户数据
        await this.getCustomerData();
        // 检查重新加载后是否存在
        const stillNotExists = !this.customerData.data.some(
          (opt) => String(opt.id) === String(customerId)
        );
        if (stillNotExists) {
          console.log(
            `客户ID ${customerId} 在客户列表中不存在，手动添加用于回显`
          );
          // 手动添加客户选项用于回显
          this.customerData.data.unshift({
            id: customerId,
            name: this.defaultCustomerName || `客户-${customerId}`,
          });
        }
      }
    },

    // 获取联系人数据
    getContactData({ page = 1, more = false, keyword = "" } = {}) {
      if (!this.form.customerId) {
        this.contactData = { data: [], page: 1, more: false };
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        getCustomerContactList({
          pageNum: page,
          pageSize: 20,
          customerId: this.form.customerId,
          contactName: keyword,
        })
          .then((res) => {
            if (res.code === 200) {
              const list = res.data.list || [];

              if (more) {
                this.contactData.data = [...this.contactData.data, ...list];
              } else {
                this.contactData.data = list;
              }

              this.contactData.page = page;
              this.contactData.more =
                this.contactData.data.length < (res.data.total || 0);
            }
            resolve();
          })
          .catch(() => {
            resolve();
          });
      });
    },

    // 客户选择变化
    handleCustomerChange(customerId) {
      // 清空联系人选择
      this.form.contactId = "";
      this.contactData = { data: [], page: 1, more: true };

      // 如果选择了客户，加载对应的联系人
      if (customerId) {
        this.getContactData();
      }
    },

    handleClose() {
      this.dialogVisible = false;
      this.resetForm();
    },
    async handleSubmit() {
      try {
        await this.$refs.followRecordForm.validate();

        this.loading = true;

        // 获取当前登录用户昵称并设置为市场经理
        const currentUser = this.$store.state.user || {};
        const currentUserName =
          currentUser.nickName || currentUser.userName || "";
        console.log("提交时设置市场经理 为当前用户:", currentUserName);

        const submitData = {
          ...this.form,
          follower: currentUserName, // 无论新增还是编辑，都使用当前登录用户
        };

        const requestFn = this.isEdit ? updateFollowRecord : addFollowRecord;
        const response = await requestFn(submitData);

        if (response.code === 200) {
          this.$message.success(
            this.isEdit ? "更新跟进记录成功" : "新增跟进记录成功"
          );
          this.dialogVisible = false;
          this.$emit("refresh");
        } else {
          this.$message.error(
            response.msg ||
              (this.isEdit ? "更新跟进记录失败" : "新增跟进记录失败")
          );
        }
      } catch (error) {
        if (error !== false) {
          // 表单验证失败时error为false
          console.error(
            (this.isEdit ? "更新" : "新增") + "跟进记录失败:",
            error
          );
          this.$message.error((this.isEdit ? "更新" : "新增") + "跟进记录失败");
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.follow-record-form-dialog :deep(.el-dialog) {
  margin: 0 auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0 !important;
  max-height: 90vh;
}

.follow-record-form-dialog :deep(.el-dialog__body) {
  max-height: 75vh;
  overflow-y: auto;
  padding: 20px;
}

.form-fieldset {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px 20px 8px 20px;
  margin-bottom: 20px;
}

.form-fieldset legend {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding: 0 8px;
  margin-left: -8px;
  background-color: transparent;
  border-radius: 4px;
  padding: 4px 12px;
}

.dialog-footer {
  text-align: right;
}

.follow-record-form-dialog :deep(.el-form-item) {
  margin-bottom: 16px;
}

.follow-record-form-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.follow-record-form-dialog :deep(.el-input__wrapper) {
  border-radius: 4px;
}

.follow-record-form-dialog :deep(.el-select .el-input__wrapper) {
  border-radius: 4px;
}

.follow-record-form-dialog :deep(.el-textarea .el-textarea__inner) {
  border-radius: 4px;
}

.follow-record-form-dialog :deep(.el-date-editor) {
  width: 100%;
}
</style>
