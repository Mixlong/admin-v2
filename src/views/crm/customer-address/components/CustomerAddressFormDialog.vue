<template>
  <el-dialog
    :title="isEdit ? '修改客户收货地址' : '新增客户收货地址'"
    :visible.sync="dialogVisible"
    width="600px"
    center
    :before-close="handleClose"
    class="customer-address-form-dialog"
    :close-on-click-modal="false"
    top="0vh"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      size="small"
      @submit.prevent
    >
      <!-- 快捷粘贴解析区域 -->

            <el-form-item label="客户" prop="customerId">
        <SelectLoadMore
          v-model="form.customerId"
          :data="customerData.data"
          :page="customerData.page"
          :hasMore="customerData.more"
          dictLabel="name"
          dictValue="id"
          :request="getCustomerData"
          size="small" 
          placeholder="请选择客户" 
          clearable
          :disabled="isCustomerDisabled"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="联系人" prop="contactName">
        <el-input
          v-model="form.contactName"
          placeholder="请输入联系人姓名"
          maxlength="50"
        />
      </el-form-item>

      <el-form-item label="联系方式" prop="contactPhone">
        <el-input
          v-model="form.contactPhone"
          placeholder="请输入联系方式"
          maxlength="200"
        />
      </el-form-item>

      <el-form-item label="收货地址" prop="address">
        <el-input
          v-model="form.address"
          type="textarea"
          placeholder="请输入收货地址"
          :rows="2"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          placeholder="请输入地址备注"
          :rows="3"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">取 消</el-button>
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
import {
  addCustomerAddress,
  updateCustomerAddress,
  getCustomerAddress,
} from "@/api/crm/customerAddress";
import { getCustomerList } from "@/api/order";
import SelectLoadMore from "@/components/selectLoadMore";

export default {
  name: "CustomerAddressFormDialog",
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
      default: "add", // 'add' | 'edit'
      validator: (value) => ["add", "edit"].includes(value),
    },
    customerAddress: {
      type: Object,
      default: null,
    },
    // 是否禁用客户选择（用于客户详情页面，客户已确定的情况下）
    disableCustomerSelect: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      pasteText: "", // 快捷粘贴文本
      form: {
        id: null,
        customerId: null,
        contactName: null,
        contactPhone: null,
        address: null,
        remark: null,
      },
      // 客户数据
      customerData: {
        data: [],
        page: 1,
        more: true,
      },
      rules: {
        customerId: [
          { required: true, message: '请选择客户', trigger: 'change' }
        ],
        contactName: [
          { required: true, message: "请输入联系人姓名", trigger: "blur" },
        ],
        contactPhone: [
          { required: true, message: "请输入联系方式", trigger: "blur" },
        ],
        address: [
          { required: true, message: "请输入收货地址", trigger: "blur" },
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
    // 是否禁用客户字段：如果明确指定禁用，或者编辑模式下禁用，或者在新增模式下如果已传入客户ID（从客户详情页打开）也禁用
    isCustomerDisabled() {
      if (this.disableCustomerSelect) {
        return true;
      }
      return (
        this.isEdit ||
        (this.customerAddress &&
          this.customerAddress.customerId &&
          !this.customerAddress.id)
      );
    },
  },
  watch: {
    visible(val) {
      if (val) {
        // 确保客户数据已加载
        if (this.customerData.data.length === 0) {
          this.getCustomerData().then(async () => {
            if (
              this.customerAddress &&
              this.isEdit &&
              this.customerAddress.id
            ) {
              await this.loadCustomerAddressData();
            } else {
              this.resetForm();
            }
          });
        } else {
          if (this.customerAddress && this.isEdit && this.customerAddress.id) {
            this.loadCustomerAddressData();
          } else {
            this.resetForm();
          }
        }
      }
    },
    customerAddress: {
      handler(newVal) {
        if (newVal && this.visible && this.isEdit && newVal.id) {
          this.loadCustomerAddressData();
        } else if (newVal && this.visible && !this.isEdit) {
          // 新增模式下，如果有默认客户ID，也需要设置
          this.resetForm();
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

    resetForm() {
      // 如果有传入的customerAddress且包含customerId，则使用它作为默认值
      const defaultCustomerId =
        this.customerAddress && this.customerAddress.customerId
          ? this.customerAddress.customerId
          : null;

      this.form = {
        id: null,
        customerId: defaultCustomerId,
        contactName: null,
        contactPhone: null,
        address: null,
        remark: null,
      };

      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
    },

    async loadCustomerAddressData() {
      if (this.customerAddress && this.isEdit) {
        // 如果只有ID，需要先获取详情
        if (this.customerAddress.id && !this.customerAddress.contactName) {
          try {
            const response = await getCustomerAddress(this.customerAddress.id);
            if (response.code === 200 && response.data) {
              Object.assign(this.form, response.data);
            }
          } catch (error) {
            console.error("获取收货地址详情失败:", error);
            this.$message.error("获取收货地址详情失败");
            return;
          }
        } else {
          // 直接使用传入的数据
          Object.keys(this.form).forEach((key) => {
            if (this.customerAddress[key] !== undefined) {
              this.form[key] = this.customerAddress[key];
            }
          });
        }

        // 确保客户选项存在（用于编辑时回显）
        if (this.form.customerId) {
          await this.ensureCustomerOptionPresent(
            this.form.customerId,
            this.customerAddress.customerName || ""
          );
        }
      }

      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
    },

    // 确保客户选项存在（用于编辑时回显）
    async ensureCustomerOptionPresent(id, name) {
      if (!id) return;
      const exists = this.customerData.data.some(
        (opt) => String(opt.id) === String(id)
      );
      if (!exists) {
        // 如果客户不在列表中，尝试通过API获取
        if (name) {
          this.customerData.data.unshift({ id, name });
        } else {
          // 如果没有名称，尝试通过API获取客户信息
          try {
            const res = await getCustomerList({ p: 1, name: "" });
            const filteredList = res.data.list.filter(
              (item) => item.status === 0
            );
            const customer = filteredList.find(
              (item) => String(item.id) === String(id)
            );
            if (customer) {
              this.customerData.data.unshift({
                id: customer.id,
                name: customer.customerName,
              });
            }
          } catch (error) {
            console.error("获取客户信息失败:", error);
          }
        }
      }
    },

    /**
     * 处理快捷粘贴事件
     */
    handleQuickPaste(event) {
      // 获取粘贴的文本
      const pastedText = (event.clipboardData || window.clipboardData).getData(
        "text"
      );

      if (pastedText && pastedText.trim()) {
        this.pasteText = pastedText.trim();
        // 自动触发解析
        this.$nextTick(() => {
          this.parseAndFill();
        });
      }
    },

    /**
     * 解析并填充到表单字段
     */
    parseAndFill() {
      if (!this.pasteText || !this.pasteText.trim()) {
        this.$message.warning("请先粘贴地址信息");
        return;
      }

      console.log("📋 粘贴的原始文本:", this.pasteText);

      // 尝试解析粘贴的文本
      const parsed = this.parseAddressText(this.pasteText);

      if (parsed) {
        // 如果解析成功，填充到对应字段
        if (parsed.contactName) {
          this.form.contactName = parsed.contactName;
        }
        if (parsed.contactPhone) {
          this.form.contactPhone = parsed.contactPhone;
        }
        if (parsed.address) {
          this.form.address = parsed.address;
        }

        this.$message.success("地址解析成功！");
        console.log("✅ 解析结果:", parsed);

        // 清空粘贴区域
        this.pasteText = "";
      } else {
        // 如果解析失败，直接填充到地址字段
        this.form.address = this.pasteText.trim();
        this.$message.info("未识别到标准格式，已填充到地址字段");
        this.pasteText = "";
      }
    },

    /**
     * 解析地址文本
     * @param {String} text - 粘贴的文本
     * @returns {Object|null} - 解析结果 { contactName, contactPhone, address }
     */
    parseAddressText(text) {
      if (!text) return null;

      const trimmedText = text.trim();

      // 手机号正则：11位数字，1开头
      const phoneRegex = /1[3-9]\d{9}/;

      // 尝试匹配标准格式：姓名 / 手机号 - 地址
      // 支持多种分隔符：/ 或 - 或空格
      let contactName = "";
      let contactPhone = "";
      let address = "";

      // 提取手机号
      const phoneMatch = trimmedText.match(phoneRegex);
      if (phoneMatch) {
        contactPhone = phoneMatch[0];

        // 移除手机号，剩余文本
        let remainingText = trimmedText.replace(contactPhone, "").trim();

        // 尝试提取姓名（手机号前面的部分）
        const beforePhone = trimmedText
          .substring(0, trimmedText.indexOf(contactPhone))
          .trim();

        // 清理分隔符
        const namePart = beforePhone.replace(/[\/\-\s]+$/, "").trim();
        if (namePart && namePart.length <= 20) {
          // 姓名一般不超过20个字符
          contactName = namePart;
        }

        // 提取地址（手机号后面的部分）
        const afterPhone = trimmedText
          .substring(trimmedText.indexOf(contactPhone) + contactPhone.length)
          .trim();

        // 清理分隔符
        address = afterPhone.replace(/^[\/\-\s]+/, "").trim();

        // 如果地址为空，尝试使用剩余文本
        if (!address) {
          // 移除姓名和手机号后的文本
          address = remainingText
            .replace(namePart, "")
            .replace(/^[\/\-\s]+/, "")
            .trim();
        }
      } else {
        // 没有找到手机号，尝试其他格式
        // 检查是否有明显的分隔符
        if (trimmedText.includes(" / ") || trimmedText.includes("/")) {
          const parts = trimmedText.split(/\s*\/\s*/);
          if (parts.length >= 2) {
            contactName = parts[0].trim();
            address = parts.slice(1).join(" ").trim();
          }
        } else if (trimmedText.includes(" - ") || trimmedText.includes("-")) {
          const parts = trimmedText.split(/\s*-\s*/);
          if (parts.length >= 2) {
            contactName = parts[0].trim();
            address = parts.slice(1).join(" ").trim();
          }
        }
      }

      // 验证解析结果
      if (contactName || contactPhone || address) {
        return {
          contactName: contactName || "",
          contactPhone: contactPhone || "",
          address: address || trimmedText,
        };
      }

      return null;
    },

    handleClose() {
      this.dialogVisible = false;
      this.resetForm();
    },

    async handleSubmit() {
      try {
        await this.$refs.formRef.validate();

        this.loading = true;

        // 根据模式选择API
        const api = this.isEdit ? updateCustomerAddress : addCustomerAddress;
        const submitData = { ...this.form };

        // 新增模式时移除ID字段
        if (!this.isEdit) {
          delete submitData.id;
        }

        const response = await api(submitData);

        if (response.code === 200) {
          const action = this.isEdit ? "修改" : "新增";
          this.$message.success(`${action}成功`);
          this.dialogVisible = false;
          this.$emit("refresh");
        } else {
          const action = this.isEdit ? "修改" : "新增";
          this.$message.error(response.msg || `${action}失败`);
        }
      } catch (error) {
        if (error !== false) {
          // 表单验证失败时error为false
          const action = this.isEdit ? "修改" : "新增";
          console.error(`${action}收货地址失败:`, error);
          this.$message.error(`${action}失败`);
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.customer-address-form-dialog :deep(.el-dialog) {
  margin: 0 auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0 !important;
  max-height: 90vh;
}

.customer-address-form-dialog :deep(.el-dialog__body) {
  max-height: 75vh;
  overflow-y: auto;
  padding: 20px;
}

.dialog-footer {
  text-align: right;
}

.customer-address-form-dialog :deep(.el-form-item) {
  margin-bottom: 16px;
}

.customer-address-form-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.customer-address-form-dialog :deep(.el-input__wrapper) {
  border-radius: 4px;
}

.customer-address-form-dialog :deep(.el-select .el-input__wrapper) {
  border-radius: 4px;
}

.customer-address-form-dialog :deep(.el-textarea .el-textarea__inner) {
  border-radius: 4px;
}
</style>

