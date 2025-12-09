<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="850px"
    :close-on-click-modal="false"
    @close="handleClose"
    top="0vh"
    custom-class="production-dialog"
  >
    <div class="form-container">
      <el-form
        ref="productionForm"
        :model="formData"
        :rules="formRules"
        label-width="110px"
        label-position="right"
      >
        <!-- 生产流程选择区域 -->
        <fieldset class="form-fieldset">
          <legend><i class="el-icon-s-tools"></i> 生产流程</legend>
          <el-form-item label="流程类型" prop="productionProcess">
            <!-- 新增模式：显示单选按钮组 -->
            <el-radio-group
              v-if="!isEdit"
              v-model="formData.productionProcess"
              @change="handleProductionProcessChange"
              size="mini"
              class="process-radio-group"
            >
              <el-radio-button label="SMT" size="mini">
                <i class="el-icon-cpu"></i> SMT
              </el-radio-button>
              <el-radio-button label="打板" size="mini">
                <i class="el-icon-postcard"></i> 打板
              </el-radio-button>
            </el-radio-group>

            <!-- 编辑模式：直接显示文本 -->
            <div v-else class="process-text-display">
              <el-tag
                :type="
                  formData.productionProcess === 'SMT' ? 'primary' : 'warning'
                "
                size="medium"
                effect="plain"
              >
                <i
                  :class="
                    formData.productionProcess === 'SMT'
                      ? 'el-icon-cpu'
                      : 'el-icon-postcard'
                  "
                ></i>
                {{ formData.productionProcess }}
              </el-tag>
            </div>
          </el-form-item>
        </fieldset>

        <!-- SMT流程信息 -->
        <fieldset
          class="form-fieldset"
          v-if="formData.productionProcess === 'SMT'"
        >
          <legend>
            <i class="el-icon-document"></i> 排产信息
          </legend>

          <!-- 选择排产信息类型 -->
          <el-form-item label="信息类型" prop="schedulingInfoType">
            <el-radio-group
              v-model="formData.schedulingInfoType"
              @change="handleSchedulingInfoTypeChange"
              size="small"
            >
              <el-radio-button label="schedulingNo">
                <i class="el-icon-tickets"></i> 排产单号
              </el-radio-button>
              <el-radio-button label="categoryModel">
                <i class="el-icon-menu"></i> 品类+型号
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <!-- 采购单号（根据 showOrderCodeInSmt 控制显示） -->
          <div v-if="showOrderCodeInSmt">
            <el-form-item label="" prop="orderCode" style="height: 0" v-show="false">
              <el-input
                v-model="formData.orderCode"
                placeholder="采购单号"
                :disabled="true"
                prefix-icon="el-icon-document-copy"
              />
            </el-form-item>
          </div>

          <!-- 排产单号（仅在选择排产单号时显示） -->
          <el-form-item
            label="排产单号"
            prop="schedulingNo"
            v-if="formData.schedulingInfoType === 'schedulingNo'"
            required
          >
            <el-input
              v-model="formData.schedulingNo"
              placeholder="请扫码任务令或手动输入排产单号，扫码后按回车确认"
              clearable
              prefix-icon="el-icon-tickets"
              @keyup.enter.native="handleScanEnter"
              @input="handleSchedulingNoChange"
            />
          </el-form-item>

          <!-- 品类+型号（仅在选择品类+型号时显示） -->
          <template v-if="formData.schedulingInfoType === 'categoryModel'">
            <!-- 采购单号 -->
            <el-form-item label="采购单号" prop="orderCode" required>
              <div style="display: flex; gap: 10px; align-items: center">
                <el-input
                  v-model="formData.orderCode"
                  placeholder="请输入或选择采购单号"
                  clearable
                  prefix-icon="el-icon-document-copy"
                  style="flex: 1"
                  size="mini"
                />
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-search"
                  @click="handleSelectPurchaseOrder"
                >选择</el-button>
              </div>
            </el-form-item>

            <!-- 品类+型号 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="品类" prop="categoryId" required>
                  <el-select
                    v-model="formData.categoryId"
                    filterable
                    clearable
                    placeholder="请选择品类"
                    style="width: 100%"
                    @change="handleCategoryChangeInForm"
                  >
                    <el-option
                      v-for="dict in categoryList"
                      :key="dict.id"
                      :label="dict.name"
                      :value="dict.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="型号" prop="computerId" required>
                  <el-select
                    v-model="formData.computerId"
                    :loading="formModelLoading"
                    filterable
                    clearable
                    placeholder="请选择型号"
                    style="width: 100%"
                    @change="handleModelChangeInForm"
                  >
                    <el-option
                      v-for="dict in formModelOptions"
                      :key="dict.model"
                      :label="dict.name"
                      :value="dict.model"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </template>
        </fieldset>


        <!-- 打板流程信息 -->
        <template v-if="formData.productionProcess === '打板'">
          <fieldset class="form-fieldset">
            <legend><i class="el-icon-menu"></i> 产品信息</legend>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="BOM编码" prop="partNo" required>
                  <el-input
                    v-model="formData.partNo"
                    placeholder="请输入BOM编码"
                    clearable
                    maxlength="100"
                    prefix-icon="el-icon-goods"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </fieldset>

          <fieldset class="form-fieldset">
            <legend><i class="el-icon-shopping-cart-2"></i> 订单信息</legend>
            <el-row :gutter="20">
              <el-col :span="12" v-if="!formData.id">
                <el-form-item label="采购单号" prop="orderCode" required>
                  <el-input
                    v-model="formData.orderCode"
                    placeholder="请输入采购单号"
                    maxlength="100"
                    :disabled="showOrderCodeInSmt"
                    prefix-icon="el-icon-document-copy"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </fieldset>
        </template>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer-new">
      <el-button size="mini" @click="handleCancel"> 取消 </el-button>
      <el-button
        type="primary"
        size="mini"
        @click="handleSubmit"
        :loading="submitLoading"
      >
        {{ submitLoading ? "提交中..." : "确定" }}
      </el-button>
    </div>

    <!-- 采购订单选择弹窗 -->
    <el-dialog
      title="选择采购订单"
      :visible.sync="purchaseOrderDialogVisible"
      width="80%"
      append-to-body
      :close-on-click-modal="false"
      top="5vh"
    >
      <div class="purchase-order-selection">
        <!-- 搜索 -->
        <div class="search-section" style="margin-bottom: 15px; display: flex; gap: 10px">
          <el-input
            v-model="purchaseOrderSearch"
            placeholder="请输入采购单号搜索"
            clearable
            style="width: 300px"
            @keyup.enter.native="loadPurchaseOrderList"
          />
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="loadPurchaseOrderList"
          >搜索</el-button>
        </div>

        <!-- 表格 -->
        <el-table
          :data="purchaseOrderList"
          v-loading="purchaseOrderLoading"
          border
          height="450px"
          highlight-current-row
          @row-click="handlePurchaseOrderRowClick"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column
            prop="purchaseOrderCode"
            label="采购单号"
            align="center"
            min-width="150"
          >
            <template slot-scope="scope">
              {{ scope.row.purchaseOrderCode || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="address"
            label="生产地点"
            align="center"
            width="120"
          >
            <template slot-scope="scope">
              {{ scope.row.address || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="cancelStatus"
            label="状态"
            align="center"
            width="100"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.cancelStatus === 1 ? 'danger' : 'success'"
                size="small"
              >
                {{ scope.row.cancelStatus === 1 ? '已撤销' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="createBy"
            label="创建人"
            align="center"
            width="100"
          >
            <template slot-scope="scope">
              {{ scope.row.createBy || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
            align="center"
            width="160"
          >
            <template slot-scope="scope">
              {{ scope.row.createTime || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="100">
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                @click="handleConfirmPurchaseOrder(scope.row)"
              >
                选择
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-section" style="margin-top: 15px; text-align: right">
          <el-pagination
            @size-change="handlePurchaseOrderSizeChange"
            @current-change="handlePurchaseOrderCurrentChange"
            :current-page="purchaseOrderPagination.current"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="purchaseOrderPagination.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="purchaseOrderPagination.total"
          />
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="purchaseOrderDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import MyUpload from "@/components/MyUpload";
import { getSchedulingDetailByNo } from "@/api/outsourcing/production";
import { getOutsourcingOrderList } from "@/api/outsourcing/order";

export default {
  name: "ProductionProcessFormDialog",
  components: {
    MyUpload,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    editData: {
      type: Object,
      default: null,
    },
    initialData: {
      type: Object,
      default: null,
    },
    categoryList: {
      type: Array,
      default: () => [],
    },
    showOrderCodeInSmt: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      formData: {
        id: null,
        schedulingId: "",
        schedulingNo: "",
        schedulingInfoType: "schedulingNo", // 排产信息类型：schedulingNo | categoryModel
        productionProcess: "SMT",
        categoryId: "",
        computerId: "",
        partNo: "",
        orderCode: "",
        smtBomFile: "",
        auditStatus: 0,
      },
      formModelOptions: [],
      formModelLoading: false,
      // 采购订单选择弹窗
      purchaseOrderDialogVisible: false,
      purchaseOrderList: [],
      purchaseOrderLoading: false,
      purchaseOrderSearch: "",
      purchaseOrderPagination: {
        current: 1,
        size: 20,
        total: 0,
      },
      formRules: {
        schedulingInfoType: [
          {
            required: true,
            message: "请选择排产信息类型",
            trigger: "change",
          },
        ],
        schedulingNo: [
          {
            validator: (rule, value, callback) => {
              // 只在SMT流程且选择排产单号类型时验证
              if (
                this.formData.productionProcess === "SMT" &&
                this.formData.schedulingInfoType === "schedulingNo"
              ) {
                if (!value) {
                  callback(new Error("请输入排产单号"));
                } else {
                  callback();
                }
              } else {
                callback();
              }
            },
            trigger: ["blur", "change"],
          },
        ],
        categoryId: [
          {
            validator: (rule, value, callback) => {
              // 只在SMT流程且选择品类+型号类型时验证
              if (
                this.formData.productionProcess === "SMT" &&
                this.formData.schedulingInfoType === "categoryModel"
              ) {
                if (!value) {
                  callback(new Error("请选择品类"));
                } else {
                  callback();
                }
              } else {
                callback();
              }
            },
            trigger: "change",
          },
        ],
        computerId: [
          {
            validator: (rule, value, callback) => {
              // 只在SMT流程且选择品类+型号类型时验证
              if (
                this.formData.productionProcess === "SMT" &&
                this.formData.schedulingInfoType === "categoryModel"
              ) {
                if (!value) {
                  callback(new Error("请选择型号"));
                } else {
                  callback();
                }
              } else {
                callback();
              }
            },
            trigger: "change",
          },
        ],
        orderCode: [
          {
            validator: (rule, value, callback) => {
              // SMT 流程且 showOrderCodeInSmt=true 时必填
              if (
                this.formData.productionProcess === "SMT" &&
                this.showOrderCodeInSmt &&
                !value
              ) {
                callback(new Error("采购单号不能为空"));
              }
              // SMT流程且选择品类+型号类型时必填
              else if (
                this.formData.productionProcess === "SMT" &&
                this.formData.schedulingInfoType === "categoryModel" &&
                !value
              ) {
                callback(new Error("请输入采购单号"));
              }
              // 打板流程新增时必填
              else if (
                this.formData.productionProcess === "打板" &&
                !this.formData.id &&
                !value
              ) {
                callback(new Error("采购单号不能为空"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
        partNo: [
          {
            required: true,
            message: "请输入BOM编码",
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (this.formData.productionProcess === "打板" && !value) {
                callback(new Error("请输入BOM编码"));
              } else {
                callback();
              }
            },
          },
        ],
      },
    };
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? "编辑" : "新增";
    },
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val && this.editData) {
        this.loadEditData();
      } else if (val && this.initialData) {
        this.loadInitialData();
      } else if (val) {
        this.resetForm();
      }
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    },
  },
  methods: {
    /** 生产流程变化 */
    handleProductionProcessChange(value) {
      // 保存采购单号（如果 showOrderCodeInSmt 为 true）
      const orderCode = this.showOrderCodeInSmt ? this.formData.orderCode : "";

      // 清空相关字段
      this.formData.schedulingNo = "";
      this.formData.schedulingId = "";
      this.formData.schedulingInfoType = "schedulingNo";
      this.formData.categoryId = "";
      this.formData.computerId = "";
      this.formData.partNo = "";
      this.formData.orderCode = "";
      this.formModelOptions = [];

      // 恢复采购单号（如果 showOrderCodeInSmt 为 true）
      if (this.showOrderCodeInSmt) {
        this.formData.orderCode = orderCode;
      }

      // 清除验证
      this.$nextTick(() => {
        if (this.$refs.productionForm) {
          this.$refs.productionForm.clearValidate();
        }
      });
    },

    /** 排产信息类型变化 */
    handleSchedulingInfoTypeChange(value) {
      // 不清空数据，只是隐藏不需要的输入框
      // 数据保留，用户可以随时切换回来查看
      // 只清除验证错误提示
      this.$nextTick(() => {
        if (this.$refs.productionForm) {
          this.$refs.productionForm.clearValidate();
        }
      });
    },

    /** 扫码回车 */
    handleScanEnter() {
      if (this.formData.schedulingNo) {
        this.loadSchedulingDetail(this.formData.schedulingNo);
      }
    },

    /** 排产单号变化 */
    handleSchedulingNoChange(value) {
      if (!value) {
        this.formData.schedulingId = "";
      }
    },

    /** 加载排产单详情 */
    loadSchedulingDetail(schedulingNo) {
      getSchedulingDetailByNo(schedulingNo)
        .then((res) => {
          if (res.code === 200 && res.data) {
            const detail = res.data;
            this.formData.schedulingId = detail.id;
            this.formData.categoryId = detail.categoryId;
            this.formData.computerId = detail.computerId;

            // 加载型号列表
            if (detail.categoryId) {
              const category = this.categoryList.find(
                (item) => item.id === detail.categoryId
              );
              this.formModelOptions = category?.computerList || [];
            }

            this.$message.success("排产单信息加载成功");
          }
        })
        .catch(() => {
          this.$message.error("排产单号不存在");
        });
    },

    /** 品类变化（表单中） */
    handleCategoryChangeInForm(value) {
      this.formData.computerId = "";
      this.formModelOptions = [];

      if (value) {
        const category = this.categoryList.find((item) => item.id === value);
        this.formModelOptions = category?.computerList || [];
      }
    },

    /** 型号变化（表单中） */
    handleModelChangeInForm(value) {
      // 型号变化处理
    },

    /** 打开采购订单选择弹窗 */
    handleSelectPurchaseOrder() {
      this.purchaseOrderDialogVisible = true;
      this.purchaseOrderSearch = "";
      this.purchaseOrderPagination.current = 1;
      this.loadPurchaseOrderList();
    },

    /** 加载采购订单列表 */
    loadPurchaseOrderList() {
      this.purchaseOrderLoading = true;
      getOutsourcingOrderList({
        p: this.purchaseOrderPagination.current,
        l: this.purchaseOrderPagination.size,
        purchaseOrderCode: this.purchaseOrderSearch,
      })
        .then((res) => {
          if (res.code === 200) {
            this.purchaseOrderList = res.data?.list || [];
            this.purchaseOrderPagination.total = res.data?.total || 0;
          }
        })
        .finally(() => {
          this.purchaseOrderLoading = false;
        });
    },

    /** 采购订单行点击 */
    handlePurchaseOrderRowClick(row) {
      // 点击行高亮，可选
    },

    /** 确认选择采购订单 */
    handleConfirmPurchaseOrder(row) {
      this.formData.orderCode = row.purchaseOrderCode;
      this.purchaseOrderDialogVisible = false;
      this.$message.success("已选择采购单号：" + row.purchaseOrderCode);
    },

    /** 采购订单分页-每页条数变化 */
    handlePurchaseOrderSizeChange(size) {
      this.purchaseOrderPagination.size = size;
      this.purchaseOrderPagination.current = 1;
      this.loadPurchaseOrderList();
    },

    /** 采购订单分页-当前页变化 */
    handlePurchaseOrderCurrentChange(current) {
      this.purchaseOrderPagination.current = current;
      this.loadPurchaseOrderList();
    },

    /** 提交 */
    handleSubmit() {
      this.$refs.productionForm.validate((valid) => {
        if (valid) {
          this.$emit("submit", { ...this.formData });
        }
      });
    },

    /** 取消 */
    handleCancel() {
      this.dialogVisible = false;
    },

    /** 关闭 */
    handleClose() {
      this.resetForm();
      this.$emit("close");
    },

    /** 重置表单 */
    resetForm() {
      this.formData = {
        id: null,
        schedulingId: "",
        schedulingNo: "",
        schedulingInfoType: "schedulingNo",
        productionProcess: "SMT",
        categoryId: "",
        computerId: "",
        partNo: "",
        orderCode: "",
        smtBomFile: "",
        auditStatus: 0,
      };
      this.formModelOptions = [];

      this.$nextTick(() => {
        if (this.$refs.productionForm) {
          this.$refs.productionForm.clearValidate();
        }
      });
    },

    /** 加载编辑数据 */
    loadEditData() {
      if (!this.editData) return;

      const productionProcess = this.editData.productionProcess
        ? this.editData.productionProcess.trim()
        : "";

      // 根据数据判断使用的是哪种类型
      let schedulingInfoType = "schedulingNo";
      if (this.editData.schedulingNo) {
        schedulingInfoType = "schedulingNo";
      } else if (this.editData.categoryId && this.editData.computerId) {
        schedulingInfoType = "categoryModel";
      }

      this.formData = {
        id: this.editData.id,
        schedulingId: this.editData.schedulingId || "",
        schedulingNo: this.editData.schedulingNo || "",
        schedulingInfoType: schedulingInfoType,
        productionProcess: productionProcess,
        categoryId: this.editData.categoryId || "",
        computerId: this.editData.computerId || "",
        partNo: this.editData.partNo || "",
        orderCode: this.editData.orderCode || "",
        smtBomFile: this.editData.smtBomFile || "",
        auditStatus: this.editData.auditStatus || 0,
      };

      // 加载型号列表
      if (this.editData.categoryId) {
        const category = this.categoryList.find(
          (item) => item.id === this.editData.categoryId
        );
        this.formModelOptions = category?.computerList || [];
      }
    },

    /** 加载初始数据（用于新增时预填充） */
    loadInitialData() {
      if (!this.initialData) return;

      // 重置表单
      this.resetForm();

      // 合并初始数据到表单
      this.$nextTick(() => {
        this.formData = {
          ...this.formData,
          ...this.initialData,
        };

        // 如果有品类ID，加载型号列表
        if (this.initialData.categoryId) {
          const category = this.categoryList.find(
            (item) => item.id === this.initialData.categoryId
          );
          this.formModelOptions = category?.computerList || [];
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.form-container {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 10px;
}

.form-fieldset {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;

  legend {
    font-size: 14px;
    font-weight: normal;
    color: #606266;
    padding: 0 10px;
    margin-left: -10px;
  }
}

.process-radio-group {
  ::v-deep .el-radio-button__inner {
    padding: 8px 20px;
  }
}

.process-text-display {
  .el-tag {
    font-size: 14px;
  }
}

.dialog-footer-new {
  text-align: right;
  padding: 10px 20px 0;
}
</style>
