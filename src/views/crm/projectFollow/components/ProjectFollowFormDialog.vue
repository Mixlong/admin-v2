<template>
  <el-dialog
    :title="isEdit ? '编辑' : '新增'"
    :visible.sync="dialogVisible"
    width="800px"
    center
    :before-close="handleClose"
    class="project-follow-form-dialog dialog-scroll"
    :close-on-click-modal="false"
    top="0vh"
  >
    <el-form
      ref="projectFollowForm"
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
            <el-form-item label="项目名称" prop="projectName">
              <el-input
                v-model="form.projectName"
                placeholder="请输入项目名称"
                maxlength="100"
                show-word-limit
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户简称" prop="customerId">
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
                    ? '客户已锁定（来自客户详情）'
                    : '请选择客户'
                "
                clearable
                :disabled="!!defaultCustomerId"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- <el-col :span="12">
            <el-form-item label="产品类型" prop="productType">
              <el-input
                v-model="form.productType"
                placeholder="请输入产品类型"
                maxlength="100"
                show-word-limit
                clearable
              />
            </el-form-item>
          </el-col> -->
          <el-col :span="12">
            <el-form-item label="项目阶段" prop="projectNode">
              <el-select
                v-model="form.projectNode"
                placeholder="请选择项目阶段"
                style="width: 100%"
              >
                <el-option label="需求分析" value="需求分析" />
                <el-option label="方案设计" value="方案设计" />
                <el-option label="开发阶段" value="开发阶段" />
                <el-option label="测试阶段" value="测试阶段" />
                <el-option label="部署上线" value="部署上线" />
                <el-option label="验收完成" value="验收完成" />
                <el-option label="项目结束" value="项目结束" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="需求总表" prop="requirementLink">
          <el-input
            v-model="form.requirementLink"
            placeholder="https://"
            maxlength="200"
            show-word-limit
            clearable
            prefix-icon="el-icon-link"
          />
        </el-form-item>
      </fieldset>

      <!-- 项目详情 -->
      <fieldset class="form-fieldset">
        <legend>项目详情</legend>

        <el-form-item label="项目背景" prop="projectBackground">
          <el-input
            v-model="form.projectBackground"
            type="textarea"
            :rows="3"
            placeholder="请输入项目背景"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="项目进度" prop="progress">
          <el-input
            v-model="form.progress"
            type="textarea"
            :rows="3"
            placeholder="请输入项目进度详情"
            maxlength="1000"
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
        :loading="loading"
        @click="handleSubmit"
      >
        {{ isEdit ? "更新" : "创建" }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addProjectFollow, updateProjectFollow } from "@/api/crm/projectFollow";
import { getCustomerList } from "@/api/order";
import SelectLoadMore from "@/components/selectLoadMore";

export default {
  name: "ProjectFollowFormDialog",
  components: {
    SelectLoadMore,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: "add", // 'add' | 'edit' | 'copy'
      validator: (value) => ["add", "edit", "copy"].includes(value),
    },
    projectFollow: {
      type: Object,
      default: null,
    },
    defaultCustomerId: {
      type: String,
      default: "",
    },
    defaultCustomerName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      loading: false,
      form: {
        id: "",
        projectName: "",
        customerId: "",
        productType: "",
        projectNode: "",
        progress: "",
        productKeyFeatures: "",
        projectBackground: "",
        projectMilestones: "",
        projectTest: "",
        requirementLink: "",
      },
      // 客户数据
      customerData: {
        data: [],
        page: 1,
        more: true,
      },
      rules: {
        projectName: [
          { required: true, message: "请输入项目名称", trigger: "blur" },
        ],
        customerId: [
          { required: true, message: "请选择客户", trigger: "change" },
        ],
        // productType: [
        //   { required: true, message: "请输入产品类型", trigger: "blur" },
        // ],
        projectNode: [
          { required: true, message: "请选择项目阶段", trigger: "change" },
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
      return this.mode === "edit";
    },
    isCopy() {
      return this.mode === "copy";
    },
  },
  watch: {
    visible(val) {
      if (val) {
        // 确保客户数据已加载
        if (this.customerData.data.length === 0) {
          this.getCustomerData().then(async () => {
            if (this.projectFollow && (this.isEdit || this.isCopy)) {
              this.loadProjectFollowData();
            } else {
              this.resetForm();
              await this.$nextTick();
              await this.handleDefaultCustomer();
            }
          });
        } else {
          if (this.projectFollow && (this.isEdit || this.isCopy)) {
            this.loadProjectFollowData();
          } else {
            this.resetForm();
            this.$nextTick(async () => {
              await this.handleDefaultCustomer();
            });
          }
        }
      }
    },
    projectFollow: {
      handler(newVal) {
        if (newVal && this.visible && (this.isEdit || this.isCopy)) {
          this.loadProjectFollowData();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    // 初始化客户数据
    this.getCustomerData();
  },
  methods: {
    // 处理默认客户设置
    async handleDefaultCustomer() {
      if (this.defaultCustomerId && this.defaultCustomerName) {
        console.log(
          "设置默认客户:",
          this.defaultCustomerId,
          this.defaultCustomerName
        );

        // 先确保客户选项存在
        const exists = this.customerData.data.some(
          (opt) => String(opt.id) === String(this.defaultCustomerId)
        );
        if (!exists) {
          console.log("添加客户选项到列表");
          this.customerData.data.unshift({
            id: this.defaultCustomerId,
            name: this.defaultCustomerName,
          });
        }

        // 等待下一个tick后设置客户ID
        await this.$nextTick();
        this.form.customerId = this.defaultCustomerId;

        console.log("设置后的表单客户ID:", this.form.customerId);
        console.log("当前客户数据:", this.customerData.data);
      }
    },

    resetForm() {
      this.form = {
        id: "",
        projectName: "",
        customerId: "",
        productType: "",
        projectNode: "",
        progress: "",
        productKeyFeatures: "",
        projectBackground: "",
        projectMilestones: "",
        projectTest: "",
        requirementLink: "",
      };
      // 只在新增模式下重置客户数据，编辑模式保留已加载的数据
      if (!this.isEdit && !this.isCopy) {
        this.customerData = { data: [], page: 1, more: true };
      }

      this.$nextTick(() => {
        if (this.$refs.projectFollowForm) {
          this.$refs.projectFollowForm.clearValidate();
        }
      });
    },

    async loadProjectFollowData() {
      if (this.projectFollow) {
        // 确保客户数据已加载
        if (this.customerData.data.length === 0) {
          await this.getCustomerData();
        }

        // 填充表单数据
        Object.keys(this.form).forEach((key) => {
          if (this.projectFollow[key] !== undefined) {
            this.form[key] = this.projectFollow[key];
          }
        });

        // 复制模式时清除ID
        if (this.isCopy) {
          this.form.id = "";
        }

        // 确保客户选项存在（用于编辑/复制时回显）
        if (this.form.customerId && this.projectFollow.customerName) {
          await this.ensureCustomerOptionPresent(
            this.form.customerId,
            this.projectFollow.customerName
          );
        }
      }

      this.$nextTick(() => {
        if (this.$refs.projectFollowForm) {
          this.$refs.projectFollowForm.clearValidate();
        }
      });
    },

    // 获取客户数据
    getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getCustomerList({
          p: page,
          name: keyword,
        })
          .then((res) => {
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
          .catch(() => {
            resolve();
          });
      });
    },

    // 确保客户选项存在（用于编辑/复制时回显）
    async ensureCustomerOptionPresent(id, name) {
      if (!id) return;
      const exists = this.customerData.data.some(
        (opt) => String(opt.id) === String(id)
      );
      if (!exists) {
        this.customerData.data.unshift({ id, name });
      }
    },

    handleClose() {
      this.dialogVisible = false;
      this.resetForm();
    },

    async handleSubmit() {
      try {
        await this.$refs.projectFollowForm.validate();

        this.loading = true;

        // 根据模式选择API
        const api = this.isEdit ? updateProjectFollow : addProjectFollow;
        const submitData = this.isEdit ? this.form : { ...this.form };

        // 新增和复制模式时移除ID字段
        if (!this.isEdit) {
          delete submitData.id;
        }

        const response = await api(submitData);

        if (response.code === 200) {
          const action = this.isEdit ? "更新" : "新增";
          this.$message.success(`${action}项目跟进成功`);
          this.dialogVisible = false;
          this.$emit("refresh");
        } else {
          const action = this.isEdit ? "更新" : "新增";
          this.$message.error(response.msg || `${action}项目跟进失败`);
        }
      } catch (error) {
        if (error !== false) {
          // 表单验证失败时error为false
          const action = this.isEdit ? "更新" : "新增";
          console.error(`${action}项目跟进失败:`, error);
          this.$message.error(`${action}项目跟进失败`);
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.project-follow-form-dialog :deep(.el-dialog) {
  margin: 0 auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0 !important;
  max-height: 90vh;
}

.project-follow-form-dialog :deep(.el-dialog__body) {
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

.project-follow-form-dialog :deep(.el-form-item) {
  margin-bottom: 16px;
}

.project-follow-form-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.project-follow-form-dialog :deep(.el-input__wrapper) {
  border-radius: 4px;
}

.project-follow-form-dialog :deep(.el-select .el-input__wrapper) {
  border-radius: 4px;
}

.project-follow-form-dialog :deep(.el-textarea .el-textarea__inner) {
  border-radius: 4px;
}

.project-follow-form-dialog :deep(.el-date-editor) {
  width: 100%;
}
</style>
