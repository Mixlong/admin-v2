<template>
  <el-dialog
    :title="isView ? '查看' : editData ? '编辑' : '新增'"
    :visible.sync="dialogVisible"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
    @opened="handleDialogOpened"
    top="0"
    class="inspection-data-dialog"
    :modal-append-to-body="false"
    :append-to-body="true"
  >
    <div class="dialog-content">
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="90px"
        :disabled="isView"
      >
        <!-- 基本信息 -->
        <fieldset class="form-fieldset">
          <legend>基本信息</legend>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="物料编码" prop="invCode">
                <select-loadMore
                  v-model="form.invCode"
                  style="width: 100%"
                  :data="inventoryData.data"
                  :page="inventoryData.page"
                  :hasMore="inventoryData.more"
                  dictLabel="invCode"
                  dictValue="invCode"
                  :request="getInventoryList"
                  placeholder="请选择物料编码"
                  size="mini"
                  :disabled="isView"
                  @change="handleInventoryChange"
                >
                </select-loadMore>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="采购单号" prop="purchaseOrderCode">
                <el-input
                  v-model="form.purchaseOrderCode"
                  placeholder="请输入采购单号"
                  size="mini"
                  :disabled="isView"
                  clearable
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="批次号" prop="batchNo">
                <el-input
                  v-model="form.batchNo"
                  placeholder="请输入批次号"
                  style="width: 100%"
                  size="mini"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <!-- 没有供应商信息时，显社输入框 -->
            <el-col
              :span="12"
              v-if="form.invCode && !selectedInventoryInfo.supplier"
            >
              <el-form-item label="供应商" prop="invDefine">
                <el-input
                  v-model="form.invDefine"
                  placeholder="请输入供应商"
                  style="width: 100%"
                  size="mini"
                  :disabled="isView"
                  clearable
                >
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <div v-if="form.invCode" class="inventory-info">
                <div class="info-item">
                  <span class="label">物料名称:</span>
                  <span class="value">{{ form.invName || "--" }}</span>
                </div>
                <div class="info-item">
                  <span class="label">规格1:</span>
                  <span class="value">{{
                    selectedInventoryInfo.englishName || "--"
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="label">规格2:</span>
                  <span class="value">{{
                    selectedInventoryInfo.invStd || "--"
                  }}</span>
                </div>
                <!-- 有供应商信息时，只读显示 -->
                <div v-if="selectedInventoryInfo.supplier" class="info-item">
                  <span class="label">供应商:</span>
                  <span class="value">{{
                    selectedInventoryInfo.supplier
                  }}</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </fieldset>

        <!-- 检验数据 -->
        <fieldset class="form-fieldset">
          <legend>检验数据</legend>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="到料数量" prop="arrivalQuantity">
                <el-input-number
                  v-model="form.arrivalQuantity"
                  :min="0"
                  placeholder="请输入到料数量"
                  style="width: 100%"
                  size="mini"
                >
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="抽检数量" prop="samplingQuantity">
                <el-input-number
                  v-model="form.samplingQuantity"
                  :min="0"
                  placeholder="请输入抽检数量"
                  style="width: 100%"
                  size="mini"
                >
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="不良数量" prop="defectiveQuantity">
                <el-input-number
                  v-model="form.defectiveQuantity"
                  :min="0"
                  placeholder="请输入不良数量"
                  style="width: 100%"
                  size="mini"
                  @change="calculateDefectRate"
                >
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="检验结果" prop="testResult">
                <el-select
                  v-model="form.testResult"
                  placeholder="请选择检验结果"
                  style="width: 100%"
                  size="mini"
                  :disabled="isView"
                  clearable
                >
                  <el-option label="PASS" value="PASS"></el-option>
                  <el-option label="NG" value="NG"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </fieldset>

        <!-- 详细信息 -->
        <fieldset class="form-fieldset">
          <legend>详细信息</legend>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item
                label="检验结果描述"
                prop="testInfo"
                label-width="120px"
              >
                <Editor
                  v-model="form.testInfo"
                  :min-height="120"
                  :read-only="isView"
                  placeholder="请输入检验结果描述..."
                  :headers="headers"
                  :config="{
                    height: 120,
                    menubar: false,
                    toolbar:
                      'bold italic underline | bullist numlist | removeformat',
                    plugins: 'lists',
                    statusbar: false,
                    resize: false,
                    branding: false,
                    auto_focus: false,
                    init_instance_callback: (editor) => {
                      // 编辑器初始化完成后立即失去焦点
                      editor.getBody().blur();
                      // 禁用编辑器的自动滚动行为
                      editor.getBody().style.scrollBehavior = 'auto';
                    },
                    setup: (editor) => {
                      editor.on('init', () => {
                        setTimeout(() => {
                          editor.getBody().blur();
                          // 确保父容器滚动位置不变
                          const dialogBody = document.querySelector(
                            '.inspection-data-dialog .el-dialog__body'
                          );
                          if (dialogBody) dialogBody.scrollTop = 0;
                        }, 100);
                      });
                    },
                  }"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="备注" prop="remark" label-width="120px">
                <el-input
                  v-model="form.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入备注信息"
                  show-word-limit
                  :disabled="isView"
                >
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </fieldset>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer" v-if="!isView">
      <el-button @click="handleClose" size="mini">取 消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="submitLoading"
        size="mini"
      >
        {{ editData ? "更 新" : "保 存" }}
      </el-button>
    </div>

    <!-- 来料选择对话框 -->
    <el-dialog
      title="选择来料信息"
      :visible.sync="inventorySelectVisible"
      width="1200px"
      :close-on-click-modal="false"
      top="0"
      append-to-body
    >
      <!-- 搜索区域 -->
      <el-form :inline="true" class="search-form" size="mini">
        <el-form-item label="物料编码">
          <el-input
            v-model="inventorySearchForm.invCode"
            placeholder="请输入物料编码"
            clearable
            style="width: 200px"
          ></el-input>
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input
            v-model="inventorySearchForm.invName"
            placeholder="请输入物料名称"
            clearable
            style="width: 200px"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleInventorySearch"
            icon="el-icon-search"
            >搜索</el-button
          >
          <el-button @click="handleInventoryReset" icon="el-icon-refresh"
            >重置</el-button
          >
        </el-form-item>
      </el-form>

      <!-- 来料列表 -->
      <el-table
        class="inspection-data-table"
        :data="inventoryTableData"
        v-loading="inventoryLoading"
        border
        style="width: 100%"
        height="60vh"
        :header-cell-class-name="getInventoryHeaderCellClassName"
        @row-click="handleInventoryRowClick"
        close-on-click-modal="false"
        highlight-current-row
      >
        <el-table-column
          prop="invCode"
          label="物料编码"
          align="center"
          width="140"
        ></el-table-column>
        <el-table-column
          prop="invName"
          label="物料名称"
          align="center"
          width="170"
        ></el-table-column>
        <el-table-column
          prop="englishName"
          label="英文名称"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="invStd"
          label="物料标准"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="invDefine"
          label="供应商"
          align="center"
          width="120"
        ></el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          align="center"
          width="120"
        >
          <template slot-scope="scope">
            <span>{{ formatDate(scope.row.createTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleSelectInventoryRow(scope.row)"
              >选择</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div
        class="pagination-section"
        style="margin-top: 20px; text-align: right"
      >
        <el-pagination
          @size-change="handleInventorySizeChange"
          @current-change="handleInventoryCurrentChange"
          :current-page="inventoryPagination.current"
          :page-sizes="[10, 20, 50]"
          :page-size="inventoryPagination.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="inventoryPagination.total"
        >
        </el-pagination>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import {
  addIqcInspectionData,
  updateIqcInspectionData,
} from "@/api/iqc/inspectionData";
import { getIqcBasicInfoList } from "@/api/iqc/basicInfo";
import Editor from "@/components/Editor";
import { afterCategoryList } from "@/api/third/sale";
import { getToken } from "@/utils/auth";

export default {
  name: "AddInspectionDataDialog",
  components: {
    Editor,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    editData: {
      type: Object,
      default: null,
    },
    isView: {
      type: Boolean,
      default: false,
    },
    basicInfoId: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    // 验证函数抽离
    const createQuantityValidator = (fieldName, minValue = 1) => {
      return (rule, value, callback) => {
        if (value === null || value === undefined || value === "") {
          callback(new Error(`请输入${fieldName}`));
        } else if (value < minValue) {
          const errorMsg =
            minValue === 0 ? `${fieldName}不能小于0` : `${fieldName}必须大于0`;
          callback(new Error(errorMsg));
        } else {
          callback();
        }
      };
    };

    return {
      dialogVisible: this.visible,
      submitLoading: false,
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      form: {
        batchNo: "",
        invCode: "",
        invName: "",
        category: "",
        supplier: "",
        purchaseOrderCode: "",
        arrivalQuantity: null,
        samplingQuantity: null,
        defectiveQuantity: null,
        defectRate: "0.00%",
        testInfo: "",
        defectiveDesc: "",
        inspectionResult: "PASS",
        testResult: "PASS",
        remark: "",
      },
      rules: {
        batchNo: [{ required: true, message: "请输入批次号", trigger: "blur" }],
        invCode: [
          { required: true, message: "请选择来料编码", trigger: "blur" },
        ],
        purchaseOrderCode: [
          { required: true, message: "请输入采购单号", trigger: "blur" },
        ],
        category: [
          { required: true, message: "请选择品类", trigger: "change" },
        ],
        arrivalQuantity: [
          { required: true, message: "请输入到料数量", trigger: "blur" },
          { validator: createQuantityValidator("到料数量"), trigger: "blur" },
        ],
        samplingQuantity: [
          { required: true, message: "请输入抽检数量", trigger: "blur" },
          { validator: createQuantityValidator("抽检数量"), trigger: "blur" },
        ],

        inspectionResult: [
          { required: true, message: "请选择检验结果", trigger: "change" },
        ],
        testResult: [
          { required: true, message: "请选择检验结果", trigger: "change" },
        ],
      },
      // 来料选择相关
      inventorySelectVisible: false,
      inventoryLoading: false,
      inventoryTableData: [],
      inventorySearchForm: {
        invCode: "",
        invName: "",
      },
      inventoryPagination: {
        current: 1,
        size: 10,
        total: 0,
      },
      // 品类数据
      categoryData: {
        data: [],
        page: 1,
        more: true,
      },
      // 来料数据
      inventoryData: {
        data: [],
        page: 1,
        more: true,
      },
      // 选中的来料完整信息
      selectedInventoryInfo: {},
    };
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val) {
        this.initForm();
        // 编辑模式下预加载数据确保回显
        if (this.editData) {
          // 预加载机型数据
          if (this.editData.category) {
            this.getCategoryList();
          }
          // 预加载来料数据
          if (this.editData.invCode) {
            this.getInventoryList();
          }
        }
        // 立即重置滚动位置，在对话框显示前就设置好
        this.$nextTick(() => {
          const resetScrollImmediately = () => {
            const dialogBody = document.querySelector(
              ".inspection-data-dialog .el-dialog__body"
            );
            const dialogContent = document.querySelector(
              ".inspection-data-dialog .dialog-content"
            );
            if (dialogBody) dialogBody.scrollTop = 0;
            if (dialogContent) dialogContent.scrollTop = 0;
          };

          // 立即重置
          resetScrollImmediately();
          // 10ms后再次重置（确保DOM完全渲染）
          setTimeout(resetScrollImmediately, 10);
          // 50ms后最后一次重置
          setTimeout(resetScrollImmediately, 50);
        });
      }
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    },
    "form.samplingQuantity"() {
      this.calculateDefectRate();
    },
  },
  methods: {
    getInventoryHeaderCellClassName({ column }) {
      const headerGroupMap = {
        物料编码: "inspection-header-group-material",
        物料名称: "inspection-header-group-material",
        英文名称: "inspection-header-group-material",
        物料标准: "inspection-header-group-material",
        供应商: "inspection-header-group-material",
        创建时间: "inspection-header-group-batch",
      };

      return headerGroupMap[column.label] || "";
    },
    // 初始化表单
    initForm() {
      if (this.editData) {
        // 编辑模式，填充数据
        this.form = {
          ...this.editData,
        };

        // 编辑模式下设置来料相关信息用于显示
        if (this.editData.invCode) {
          this.selectedInventoryInfo = {
            englishName: this.editData.englishName || "",
            invStd: this.editData.invStd || "",
            supplier: this.editData.supplier || this.editData.invDefine || "",
            invDefine: this.editData.invDefine || "",
          };
        }
      } else {
        // 新增模式，重置表单
        this.form = {
          basicInfoId: this.basicInfoId,
          batchNo: "",
          invCode: "",
          invName: "",
          category: "",
          supplier: "",
          purchaseOrderCode: "",
          arrivalQuantity: null,
          samplingQuantity: null,
          defectiveQuantity: null,
          defectRate: "0.00%",
          testInfo: "",
          defectiveDesc: "",
          inspectionResult: "PASS",
          remark: "",
        };

        // 新增模式下清空来料相关信息
        this.selectedInventoryInfo = {};
      }

      // 清除验证错误
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate();
        }
      });
    },

    // 计算不良率
    calculateDefectRate() {
      const samplingQuantity = this.form.samplingQuantity || 0;
      const defectiveQuantity = this.form.defectiveQuantity || 0;

      if (samplingQuantity > 0) {
        const rate = ((defectiveQuantity / samplingQuantity) * 100).toFixed(2);
        this.form.defectRate = rate + "%";
      } else {
        this.form.defectRate = "0.00%";
      }
    },

    // 打开来料选择对话框
    handleSelectInventory() {
      if (this.isView) return;
      this.inventorySelectVisible = true;
      this.fetchInventoryData();
    },

    // 获取来料列表数据
    fetchInventoryData() {
      this.inventoryLoading = true;

      const params = {
        p: this.inventoryPagination.current,
        l: this.inventoryPagination.size,
      };

      if (this.inventorySearchForm.invCode)
        params.invCode = this.inventorySearchForm.invCode;
      if (this.inventorySearchForm.invName)
        params.invName = this.inventorySearchForm.invName;

      getIqcBasicInfoList(params)
        .then((res) => {
          if (res.code === 200) {
            this.inventoryTableData = res.data?.list || [];
            this.inventoryPagination.total = res.data?.total || 0;
          } else {
            this.$message.error(res.msg || "获取来料数据失败");
            this.inventoryTableData = [];
            this.inventoryPagination.total = 0;
          }
        })
        .catch((error) => {
          console.error("获取来料数据失败:", error);
          this.$message.error("获取来料数据失败");
          this.inventoryTableData = [];
          this.inventoryPagination.total = 0;
        })
        .finally(() => {
          this.inventoryLoading = false;
        });
    },

    // 来料搜索
    handleInventorySearch() {
      this.inventoryPagination.current = 1;
      this.fetchInventoryData();
    },

    // 来料搜索重置
    handleInventoryReset() {
      this.inventorySearchForm = {
        invCode: "",
        invName: "",
      };
      this.inventoryPagination.current = 1;
      this.fetchInventoryData();
    },

    // 来料行点击（已禁用，使用按钮选择）
    handleInventoryRowClick() {
      // 行点击功能已禁用，请使用"选择"按钮
    },

    // 选择来料
    handleSelectInventoryRow(row) {
      this.form.invCode = row.invCode;
      this.form.invName = row.invName;
      this.form.category = row.category || "";
      this.inventorySelectVisible = false;

      // 清除验证错误
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate(["invCode"]);
        }
      });
    },

    // 来料分页大小改变
    handleInventorySizeChange(val) {
      this.inventoryPagination.size = val;
      this.fetchInventoryData();
    },

    // 来料当前页改变
    handleInventoryCurrentChange(val) {
      this.inventoryPagination.current = val;
      this.fetchInventoryData();
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return "--";
      return date.split(" ")[0]; // 只显示日期部分
    },

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          delete this.form.createTime;
          // 准备提交数据
          const submitData = { ...this.form };

          // 调用对应的API
          const apiCall = this.editData
            ? updateIqcInspectionData(submitData)
            : addIqcInspectionData(submitData);

          apiCall
            .then((res) => {
              if (res.code === 200) {
                this.$message.success(this.editData ? "更新成功" : "新增成功");
                this.handleClose();
                this.$emit("success");
              } else {
                this.$message.error(res.msg || "操作失败");
              }
            })
            .catch((error) => {
              console.error("提交失败:", error);
              this.$message.error("操作失败");
            })
            .finally(() => {
              this.submitLoading = false;
            });
        }
      });
    },

    // 对话框完全打开后处理
    handleDialogOpened() {
      // 对话框打开后再次确保滚动位置在顶部
      const dialogBody = document.querySelector(
        ".inspection-data-dialog .el-dialog__body"
      );
      const dialogContent = document.querySelector(
        ".inspection-data-dialog .dialog-content"
      );
      if (dialogBody) dialogBody.scrollTop = 0;
      if (dialogContent) dialogContent.scrollTop = 0;
    },

    // 关闭对话框
    handleClose() {
      this.dialogVisible = false;
      // 重置表单
      this.$refs.form && this.$refs.form.resetFields();
    },

    // 获取品类列表
    getCategoryList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        afterCategoryList({
          p: page,
          key: keyword,
        })
          .then((res) => {
            if (res.code === 200 && res.data) {
              const { list, total, pageNum, pageSize } = res.data;
              if (more) {
                this.categoryData.data = [...this.categoryData.data, ...list];
              } else {
                this.categoryData.data = list || [];
              }
              this.categoryData.more = pageNum * pageSize < total;
              this.categoryData.page = pageNum;

              // 编辑模式下确保当前选中的机型在数据列表中
              if (this.editData && this.editData.category && !more) {
                const currentCategory = this.form.category;
                const existsInList = this.categoryData.data.some(
                  (item) => item.id === currentCategory
                );
                if (!existsInList && this.editData.categoryName) {
                  // 如果当前选中的机型不在列表中，添加一个临时项
                  this.categoryData.data.unshift({
                    id: currentCategory,
                    name: this.editData.categoryName,
                  });
                }
              }
            } else {
              this.categoryData.data = [];
              this.categoryData.more = false;
            }
            resolve();
          })
          .catch((error) => {
            console.error("获取品类数据失败:", error);
            this.categoryData.data = [];
            this.categoryData.more = false;
            resolve();
          });
      });
    },

    // 获取来料列表
    getInventoryList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        const params = {
          p: page,
          l: 10,
        };

        if (keyword) {
          params.invCode = keyword;
        }

        getIqcBasicInfoList(params)
          .then((res) => {
            if (res.code === 200 && res.data) {
              const { list, total } = res.data;
              const pageSize = 10;
              if (more) {
                this.inventoryData.data = [...this.inventoryData.data, ...list];
              } else {
                this.inventoryData.data = list || [];
              }
              this.inventoryData.more = page * pageSize < total;
              this.inventoryData.page = page;
            } else {
              this.inventoryData.data = [];
              this.inventoryData.more = false;
            }
            resolve();
          })
          .catch((error) => {
            console.error("获取来料数据失败:", error);
            this.inventoryData.data = [];
            this.inventoryData.more = false;
            resolve();
          });
      });
    },

    // 来料选择变化处理
    handleInventoryChange(invCode) {
      if (invCode) {
        const selectedInventory = this.inventoryData.data.find(
          (item) => item.invCode === invCode
        );
        if (selectedInventory) {
          this.form.invName = selectedInventory.invName || "";
          this.form.category = selectedInventory.category || "";

          // 检查是否有供应商信息
          const supplierInfo =
            selectedInventory.supplier || selectedInventory.invDefine || "";

          // 存储完整的选中信息用于显示
          this.selectedInventoryInfo = {
            englishName: selectedInventory.englishName || "",
            invStd: selectedInventory.invStd || "",
            supplier: supplierInfo, // 用于判断是否显示输入框
          };

          // 有供应商信息时，不填充到 form.supplier（因为会在 selectedInventoryInfo 中只读显示）
          // 没有供应商信息时，清空 form.supplier，显示输入框让用户手动输入
          this.form.supplier = "";
        }
      } else {
        this.form.invName = "";
        this.form.category = "";
        this.form.supplier = "";
        this.selectedInventoryInfo = {};
      }
    },
  },
};
</script>

<style scoped>
.dialog-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0;
}

.form-fieldset {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
}

.form-fieldset legend {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  padding: 0 10px;
  border: none;
  width: auto;
}

.dialog-footer {
  text-align: right;
  padding: 15px 0 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 20px;
}

/* 表单项间距优化 */
.el-form-item {
  margin-bottom: 18px;
}

/* 富文本编辑器优化 */
::v-deep .el-form-item__label {
  font-weight: 500;
  color: #333;
}

/* 来料信息显示样式 */
.inventory-info {
  margin-top: 8px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 12px;
}

.inventory-info .info-item {
  display: flex;
  margin-bottom: 4px;
}

.inventory-info .info-item:last-child {
  margin-bottom: 0;
}

.inventory-info .label {
  width: 60px;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
}

.inventory-info .value {
  color: #333;
  flex: 1;
}
</style>

<style>
/* 对话框全局样式 - 确保从顶部开始显示 */
.inspection-data-dialog .el-dialog__body {
  padding: 20px;
  max-height: 75vh;
  overflow-y: auto;
  /* 强制禁用自动滚动和平滑滚动 */
  scroll-behavior: auto !important;
  scroll-padding: 0 !important;
  scroll-margin: 0 !important;
}

/* 确保对话框内容从顶部开始 */
.inspection-data-dialog .dialog-content {
  scroll-behavior: auto !important;
  scroll-padding: 0 !important;
  scroll-margin: 0 !important;
}

/* 防止所有表单元素的自动滚动 */
.inspection-data-dialog .el-form,
.inspection-data-dialog .el-form-item,
.inspection-data-dialog .form-fieldset {
  scroll-behavior: auto !important;
  scroll-margin: 0 !important;
  scroll-padding: 0 !important;
}

/* 防止富文本编辑器导致的自动滚动 */
.inspection-data-dialog .tox-edit-area,
.inspection-data-dialog .tox-edit-area iframe {
  scroll-margin: 0 !important;
  scroll-padding: 0 !important;
}

/* 防止表单元素获得焦点时自动滚动 */
.inspection-data-dialog .el-input__inner,
.inspection-data-dialog .el-textarea__inner,
.inspection-data-dialog .el-select,
.inspection-data-dialog .el-input-number {
  scroll-margin: 0 !important;
}

.inspection-data-table .inspection-header-group-material,
.inspection-data-table .inspection-header-group-batch {
  color: #1f1f1f !important;
  font-weight: 600 !important;
}

.inspection-data-table .inspection-header-group-material .cell,
.inspection-data-table .inspection-header-group-batch .cell {
  color: #1f1f1f !important;
  font-weight: 600 !important;
}

.inspection-data-table .inspection-header-group-material,
.inspection-data-table .inspection-header-group-material .cell {
  background-color: #4f81bd !important;
}

.inspection-data-table .inspection-header-group-batch,
.inspection-data-table .inspection-header-group-batch .cell {
  background-color: #8064a2 !important;
}
</style>
