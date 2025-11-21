<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1000px" class="add-shipment-order-dialog"
    top="0vh" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="220px" :inline="true" class="form-data-inline">
      <el-form-item label="客户名称：" prop="customerName">
        <SelectLoadMore
          v-model="form.customerName"
          :data="customerData.data"
          :page="customerData.page"
          :hasMore="customerData.more"
          dictLabel="name"
          dictValue="name"
          :request="getCustomerData"
          placeholder="请选择客户"
          clearable
        />
      </el-form-item>

      <el-form-item label="产品品类：" prop="categoryId">
        <CategorySelect
          v-model="form.categoryId"
          :return-id="true"
          placeholder="请选择产品品类"
          clearable
        />
      </el-form-item>

      <el-form-item label="预测数量：" prop="forecastQuantity">
        <el-input-number v-model="form.forecastQuantity" :min="1" :controls="false" placeholder="请输入预测数量"
          style="width: 100%" />
      </el-form-item>

      <el-form-item label="预计下单日期：" prop="expectedOrderDate">
        <el-date-picker v-model="form.expectedOrderDate" type="date" value-format="yyyy-MM-dd"
          placeholder="请选择预计下单日期" />
      </el-form-item>

      <el-form-item label="期望交货日期：" prop="expectedDeliveryDate">
        <el-date-picker v-model="form.expectedDeliveryDate" type="date" value-format="yyyy-MM-dd"
          placeholder="请选择期望交货日期" />
      </el-form-item>

      <!-- 编辑模式才显示订单取消和转正式订单 -->
      <!-- <el-form-item v-if="isEdit" label="订单取消：" prop="orderCancel">
        <el-radio-group v-model="form.orderCancel">
          <el-radio :label="0">否</el-radio>
          <el-radio :label="1">是</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="isEdit" label="转正式订单：" prop="convertToFormal">
        <el-radio-group v-model="form.convertToFormal">
          <el-radio :label="0">否</el-radio>
          <el-radio :label="1">是</el-radio>
        </el-radio-group>
      </el-form-item> -->

      <el-form-item v-if="isEdit && form.convertToFormal === 1" label="正式订单录入时间：" prop="formalOrderTime">
        <el-date-picker v-model="form.formalOrderTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="请选择正式订单录入时间" />
      </el-form-item>

      <!-- 风险对策字段已分配给专门的角色编辑，不在此处显示 -->
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.form-data-inline {
  ::v-deep .el-form-item {
    width: 48%;
    margin-right: 2%;
    margin-bottom: 20px;

    &.full-width {
      width: 100%;
      margin-right: 0;

      .el-form-item__content {
        width: calc(100% - 220px);
      }
    }

    .el-form-item__content {
      width: calc(100% - 220px);

      .el-input,
      .el-select,
      .el-date-picker {
        width: 100%;
      }
    }
  }
}
</style>

<script>
import {
  createForecast,
  updateForecast,
  getForecastInfo,
} from "@/api/order/forecast.js";
import CategorySelect from "@/components/CategorySelect/index.vue";
import SelectLoadMore from "@/components/selectLoadMore/index.vue";
import tinymce from "@/views/components/Editor";
import { getSoCustomerList } from "@/api/crm/soCustomer";

export default {
  name: "AddForecastDialog",
  components: {
    CategorySelect,
    SelectLoadMore,
    tinymce,
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      isEdit: false,
      isCopy: false,
      // 客户数据
      customerData: {
        data: [],
        page: 1,
        more: true,
      },
      form: {
        id: "",
        customerName: "",
        categoryId: "",
        forecastQuantity: null,
        expectedOrderDate: "",
        expectedDeliveryDate: "",
        rdRiskCountermeasure: "",
        procurementRiskCountermeasure: "",
        productionRiskCountermeasure: "",
        decisionRemark: "",
        orderCancel: 0,
        convertToFormal: 0,
        formalOrderTime: "",
      },
      rules: {
        customerName: [
          { required: true, message: "请选择客户", trigger: "change" },
        ],
        categoryId: [
          { required: true, message: "请选择产品品类", trigger: "change" },
        ],
        forecastQuantity: [
          { required: true, message: "请输入预测数量", trigger: "blur" },
        ],
      },
    };
  },
  computed: {
    dialogTitle() {
      if (this.isCopy) return "复制预测订单";
      return this.isEdit ? "编辑预测订单" : "新增预测订单";
    },
  },
  methods: {
    // 打开对话框
    open(recordOrId, isCopy = false) {
      this.dialogVisible = true;
      this.isCopy = isCopy;

      const hasRecord = recordOrId && typeof recordOrId === "object";
      const id = hasRecord ? recordOrId.id : recordOrId;

      if (!recordOrId) {
        this.isEdit = false;
        this.resetForm();
        return;
      }

      this.isEdit = !isCopy;
      this.resetForm();

      if (hasRecord) {
        this.applyFormData(recordOrId, isCopy);
      } else if (id) {
        this.loadDetail(id);
      }
    },
    // 加载详情（仅在没有列表数据时调用）
    loadDetail(id) {
      getForecastInfo(id).then((res) => {
        this.applyFormData(res.data, this.isCopy);
      });
    },
    // 根据数据填充表单
    applyFormData(record, isCopy = false) {
      if (!record) return;
      const data = JSON.parse(JSON.stringify(record));

      if (isCopy) {
        const {
          id,
          createBy,
          createTime,
          updateBy,
          updateTime,
          ...formData
        } = data;
        this.form = {
          ...this.form,
          ...formData,
          id: "",
        };
      } else {
        this.form = {
          ...this.form,
          ...data,
        };
      }

      this.$nextTick(() => {
        this.$refs.formRef?.clearValidate();
      });
    },
    // 提交
    handleSubmit() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;

        this.submitLoading = true;
        const api = this.isEdit ? updateForecast : createForecast;
        const message = this.isEdit ? "编辑成功" : "新增成功";

        // 处理提交数据，清理 undefined 和 null
        const submitData = {};
        Object.keys(this.form).forEach((key) => {
          const value = this.form[key];
          // 只过滤 undefined 和 null，保留空字符串、0 和 false
          if (value !== undefined && value !== null) {
            submitData[key] = value;
          }
        });

        api(submitData)
          .then(() => {
            this.msgSuccess(message);
            this.dialogVisible = false;
            this.$emit("refresh");
          })
          .finally(() => {
            this.submitLoading = false;
          });
      });
    },
    // 重置表单
    resetForm() {
      this.form = {
        id: "",
        customerName: "",
        categoryId: "",
        forecastQuantity: null,
        expectedOrderDate: "",
        expectedDeliveryDate: "",
        rdRiskCountermeasure: "",
        procurementRiskCountermeasure: "",
        productionRiskCountermeasure: "",
        decisionRemark: "",
        orderCancel: 0,
        convertToFormal: 0,
        formalOrderTime: "",
      };
      this.$nextTick(() => {
        this.$refs.formRef?.clearValidate();
      });
    },
    // 获取客户数据
    getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getSoCustomerList({
          p: page,
          name: keyword,
        })
          .then((res) => {
            if (res.code === 200 && res.data) {
              const { list, total, pageNum } = res.data;
              const filteredList = list || [];

              if (more) {
                this.customerData.data = [...this.customerData.data, ...filteredList];
              } else {
                this.customerData.data = filteredList;
              }

              this.customerData.page = pageNum;
              this.customerData.more = this.customerData.data.length < total;
            }
            resolve();
          })
          .catch(() => {
            resolve();
          });
      });
    },
    // 关闭对话框
    handleClosed() {
      this.resetForm();
      this.isEdit = false;
      this.isCopy = false;
      // 重置客户数据
      this.customerData = {
        data: [],
        page: 1,
        more: true,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.add-shipment-order-dialog {

  // 模式切换样式
  .mode-switch {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 15px;

    .mode-tip {
      font-size: 13px;
      color: #909399;
    }
  }

  // 快速订单样式
  .quick-order-fieldset {
    border-color: #67C23A;
    background-color: #f0f9ff;

    legend {
      color: #67C23A;
    }
  }

  ::v-deep .el-dialog__body {
    max-height: 70vh;
    overflow-y: auto;
    padding: 20px 30px;
  }

  ::v-deep .el-divider {
    margin: 15px 0;
  }

  ::v-deep .el-divider__text {
    font-weight: 600;
    color: #409EFF;
    font-size: 14px;
  }

  .field-tip {
    font-size: 12px;
    color: #909399;
    margin-left: 8px;
  }

  .dialog-footer {
    text-align: right;
    padding-top: 10px;
  }

  // Fieldset 样式
  .form-fieldset {
    border: 2px solid #dcdfe6;
    border-radius: 6px;
    padding: 15px 20px 10px;
    margin-bottom: 15px;

    legend {
      font-size: 14px;
      font-weight: 600;
      padding: 0 10px;
      color: #303133;
      border: none;
      width: auto;
      margin-bottom: 0;
    }
  }

  // 子区域样式
  .sub-section {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #e4e7ed;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .sub-section-title {
      font-size: 13px;
      font-weight: 600;
      color: #606266;
      margin-bottom: 10px;
      padding-left: 10px;
      border-left: 3px solid #409eff;
    }
  }

  // 只读文本区域样式
  .readonly-text-fieldset {
    background-color: #f5f7fa;

    legend {
      color: #909399;
    }
  }

  // 详情页展示样式
  .detail-view {
    padding: 5px 10px;

    .detail-row {
      margin-bottom: 18px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      line-height: 1.6;

      .detail-label {
        flex-shrink: 0;
        width: 120px;
        color: #606266;
        font-size: 14px;
        text-align: right;
        padding-right: 12px;
      }

      .detail-value {
        flex: 1;
        color: #303133;
        font-size: 14px;
        word-break: break-all;

        // 富文本内容样式
        ::v-deep {
          p {
            margin: 5px 0;
            line-height: 1.6;
          }

          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 8px 0;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          ul,
          ol {
            padding-left: 20px;
            margin: 5px 0;
          }

          strong {
            font-weight: 600;
          }

          em {
            font-style: italic;
          }
        }
      }
    }
  }

  // BOM专员区域 - 橙色边框
  .bom-fieldset {
    border-color: #e6a23c;
    background-color: #fdf6ec;

    legend {
      color: #e6a23c;
    }
  }

  // 只读富文本样式
  .readonly-rich-text {
    padding: 10px;
    background-color: #f5f7fa;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    min-height: 60px;
    line-height: 1.6;
    color: #606266;

    ::v-deep {
      p {
        margin: 5px 0;
      }

      img {
        max-width: 100%;
        height: auto;
      }
    }
  }
}
</style>
