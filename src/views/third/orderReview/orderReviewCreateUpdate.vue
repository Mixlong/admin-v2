<template>
  <el-dialog
    class="fixed_bottom_dialog"
    title="订单评审Checklist"
    :visible.sync="dialogVisible"
    fullscreen
    center
  >
    <table id="order-review-table">
      <tr>
        <th class="labelW custom-cell">客户名称</th>
        <td class="full-td-box">
          <el-input
            v-model.trim.lazy="form.customerName"
            class="full-input"
            :readonly="isReadonly"
          ></el-input>
        </td>

        <th class="labelW custom-cell">客户订单号</th>
        <td class="full-td-box">
          <el-input
            v-model.trim.lazy="form.customerOrderNo"
            class="full-input"
            :readonly="isReadonly"
          ></el-input>
        </td>

        <th class="labelW custom-cell">下单日期</th>
        <td class="full-td-box">
          <el-date-picker
            v-model="form.orderDate"
            type="date"
            value-format="timestamp"
            placeholder="请选择下单日期"
            style="width: 100%"
            class="full-input"
            :readonly="isReadonly"
          >
          </el-date-picker>
        </td>

        <th class="labelW custom-cell">期望日期</th>
        <td class="full-td-box">
          <el-date-picker
            v-model="form.expectedDate"
            type="date"
            value-format="timestamp"
            placeholder="请选择期望日期"
            style="width: 100%"
            class="full-input"
            :readonly="isReadonly"
          >
          </el-date-picker>
        </td>
      </tr>
      <tr>
        <th class="labelW custom-cell">订单类型</th>
        <td colspan="7" class="order_pad">
          <el-radio-group
            v-model="form.orderType"
            size="mini"
            :disabled="isReadonly"
          >
            <el-radio :label="0">首次订单</el-radio>
            <el-radio :label="1">新增订单</el-radio>
            <el-radio :label="2">其他</el-radio>
          </el-radio-group>
        </td>
      </tr>
    </table>

    <el-table
      class="order-full-table"
      :data="form.list"
      style="width: 100%"
      border
      :header-cell-class-name="headerCellClassNameOrderInfo"
    >
      <el-table-column label="具体订单信息" align="center">
        <el-table-column
          label="序号"
          type="index"
          width="100"
          align="center"
        ></el-table-column>

        <el-table-column
          label="产品型号"
          prop="computerName"
          align="center"
          class-name="full-cell"
        >
          <template slot-scope="scope">
            <div class="input-container">
              <el-input
                v-model.trim.lazy="scope.row.computerName"
                class="full-size-input"
                :readonly="isReadonly"
              ></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="规格描述"
          prop="description"
          align="center"
          class-name="full-textarea-cell"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.description"
              type="textarea"
              autosize
              :readonly="isReadonly"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column
          label="订单数量(pcs)"
          prop="num"
          align="center"
          class-name="full-cell"
        >
          <template slot-scope="scope">
            <div class="input-container">
              <el-input
                v-model.trim.lazy="scope.row.num"
                oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                class="full-size-input"
                :readonly="isReadonly"
              ></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="客供物料"
          prop="material"
          align="center"
          class-name="full-textarea-cell"
        >
          <template slot-scope="scope">
            <div class="input-container">
              <el-input
                v-model="scope.row.material"
                type="textarea"
                autosize
                class="full-size-input"
                :readonly="isReadonly"
              ></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          prop="remark"
          align="center"
          class-name="full-textarea-cell"
        >
          <template slot-scope="scope">
            <div class="input-container">
              <el-input
                v-model="scope.row.remark"
                type="textarea"
                autosize
                class="full-size-input"
                :readonly="isReadonly"
              ></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="80"
          class-name="full-cell"
          v-if="!isReadonly"
        >
          <template slot="header" slot-scope="scope">
            <el-button
              icon="el-icon-plus"
              type="primary"
              size="mini"
              @click="handleAddOrderInfo"
            ></el-button>
          </template>
          <template slot-scope="scope">
            <el-button
              icon="el-icon-minus"
              type="danger"
              size="mini"
              :disabled="form.list.length < 2"
              @click="handleRemoveOrderInfo(scope.$index)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>

    <el-table
      class="order-review-table order-full-table"
      :data="form.resultList"
      border
      :header-cell-style="headerStyle"
      :header-cell-class-name="headerCellClassName"
      :span-method="objectSpanMethod"
      :cell-class-name="cellClassName"
    >
      <el-table-column
        prop="departmentName"
        label="评审部门"
        width="100"
        align="center"
      />
      <el-table-column label="评审项目" align="center" header-align="center">
        <el-table-column align="left" width="300">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column align="left" class-name="review-project-box">
          <template slot-scope="scope">
            <template v-if="scope.row.moduleType === 1">
              <el-radio-group
                v-model="scope.row.selectValue"
                size="mini"
                :disabled="isReadonly"
              >
                <el-radio
                  v-for="cItem in scope.row.list"
                  :label="cItem.value"
                  @dblclick.native.prevent="
                    handleRadioDblClick(scope.row, cItem)
                  "
                >
                  {{ cItem.label }}
                </el-radio>
              </el-radio-group>
            </template>
            <template v-if="scope.row.moduleType === 2">
              <div class="flex align-center">
                <!-- <b
                  class="text-blue margin-right-xs"
                  style="white-space: nowrap"
                >
                  请描述:
                </b> -->
                <el-input
                  v-model="scope.row.inputValue"
                  size="mini"
                  type="textarea"
                  autosize
                  :readonly="isReadonly"
                  placeholder="请描述"
                ></el-input>
              </div>
            </template>
            <template v-if="scope.row.moduleType === 3">
              <el-row
                :gutter="20"
                type="flex"
                justify="space-between"
                align="middle"
              >
                <el-col :span="6">
                  <el-radio-group
                    v-model="scope.row.selectValue"
                    size="mini"
                    :disabled="isReadonly"
                  >
                    <el-radio
                      v-for="cItem in scope.row.list"
                      :label="cItem.value"
                      @dblclick.native.prevent="
                        handleRadioDblClick(scope.row, cItem)
                      "
                    >
                      {{ cItem.label }}
                    </el-radio>
                  </el-radio-group>
                </el-col>
                <el-col :span="18">
                  <el-input
                    v-model="scope.row.inputValue"
                    size="mini"
                    type="textarea"
                    autosize
                    :readonly="isReadonly"
                    placeholder="请描述"
                  ></el-input>
                </el-col>
              </el-row>
            </template>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        prop="view"
        label="评审意见"
        align="center"
        width="500"
        class-name="full-cell"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.view"
            type="textarea"
            autosize
            :readonly="isReadonly"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column
        prop="completeTime"
        label="完成日期"
        align="center"
        width="150"
        class-name="full-cell"
      >
        <template slot-scope="scope">
          <div class="input-container">
            <el-input
              v-model.trim.lazy="scope.row.completeTime"
              class="full-size-input"
              :readonly="isReadonly"
            ></el-input>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="nickName"
        label="责任人"
        align="center"
        width="150"
        class-name="full-cell"
      >
        <template slot-scope="scope">
          <div class="input-container">
            <el-input
              v-model.trim.lazy="scope.row.nickName"
              class="full-size-input"
              :readonly="isReadonly"
            ></el-input>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <table id="order-review-table">
      <tr>
        <th class="labelW custom-cell">备注</th>
        <td class="full-td-box" colspan="7">
          <el-input
            v-model.trim.lazy="form.remark"
            class="full-input"
            :readonly="isReadonly"
          ></el-input>
        </td>
      </tr>
      <tr>
        <th class="labelW custom-cell">图片</th>
        <td class="full-td-box" colspan="7">
          <el-upload-sortable
            v-model="form.file"
            :imgW="150"
            :imgH="98"
            :max="10"
            accept="image/jpeg, image/gif, image/png"
            :isDisabled="isReadonly"
          />
        </td>
      </tr>
    </table>

    <span slot="footer" class="dialog-footer" v-show="!isReadonly">
      <el-button type="primary" :loading="isSubLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { judgeOrderCreate, judgeOrderEdit } from "@/api/third/orderReview.js";

export default {
  data() {
    return {
      isReadonly: false,
      dialogVisible: false,
      isSubLoading: false,
      isFullTextarea: null,
      textareaStyles: {}, // 用于存储每个 textarea 的样式
      form: {},
    };
  },
  watch: {
    dialogVisible(val) {
      if (!val) {
        this.isReadonly = false;
      }
    },
  },
  methods: {
    handleFocus(index) {
      // 获取焦点时，设置高度为较大的值
      // this.$set(this.textareaStyles, index, { height: "100px" });

      this.isFullTextarea = index;
    },
    handleBlur(index) {
      // 失去焦点时，恢复默认高度
      // this.$set(this.textareaStyles, index, { height: "auto" });
      this.isFullTextarea = null;
    },
    handleAddOrderInfo() {
      this.form.list.push({
        computerName: "",
        description: "",
        num: "",
        material: "",
        remark: "",
      });
    },
    handleRemoveOrderInfo(delIndex) {
      this.form.list.splice(delIndex, 1);
    },
    headerStyle({ row, rowIndex }) {
      if (rowIndex === 1) {
        return {
          display: "none",
        };
      }
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0 || columnIndex === 5) {
        if (row.departmentName) {
          return [row.rowSpan, 1];
        } else {
          return [0, 0]; // 被合并的行返回 [0, 0]
        }
      }
    },
    headerCellClassName({ row, column, rowIndex, columnIndex }) {
      // 为表头单元格添加自定义类名
      return "custom-cell";
    },
    headerCellClassNameOrderInfo({ row, column, rowIndex, columnIndex }) {
      if (rowIndex === 0) {
        return "custom-cell";
      }
    },
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return "custom-cell";
      }
      return "";
    },
    handleRadioDblClick(rowData, cItem) {
      if (rowData.selectValue === cItem.value) {
        rowData.selectValue = "";
      }
    },
    submitForm() {
      const {
        customerName,
        customerOrderNo,
        orderDate,
        expectedDate,
        orderType,
        list,
        id,
        remark,
        file,
      } = this.form;
      if (!customerName) {
        return this.msgWarning("客户名称不能为空");
      }

      if (!customerOrderNo) {
        return this.msgWarning("客户订单号不能为空");
      }

      const isOrderNum = list.some((item) => item.num === "");
      if (isOrderNum) {
        return this.msgWarning("订单数量不能为空");
      }

      const orderExcelJson = JSON.stringify(this.form);

      this.isSubLoading = true;
      if (id) {
        judgeOrderEdit({
          id,
          customerName,
          customerOrderNo,
          orderDate,
          expectedDate,
          orderType,
          list,
          orderExcelJson,
          remark,
          file,
        })
          .then((res) => {
            if (res.code === 200) {
              this.msgSuccess("编辑成功");
              this.dialogVisible = false;
              this.$parent.getList();
            }
          })
          .finally(() => {
            this.isSubLoading = false;
          });
      } else {
        judgeOrderCreate({
          customerName,
          customerOrderNo,
          orderDate,
          expectedDate,
          orderType,
          list,
          orderExcelJson,
          remark,
          file,
        })
          .then((res) => {
            if (res.code === 200) {
              this.msgSuccess("创建成功");
              this.dialogVisible = false;
              this.$parent.getList();
            }
          })
          .finally(() => {
            this.isSubLoading = false;
          });
      }
    },
  },
};
</script>

<style lang="scss">
.custom-cell {
  background-color: #dedcdc !important;
  color: #000 !important;
}

.full-td-box {
  padding: 0;

  .full-input {
    .el-input__inner,
    .el-date-editor {
      border-color: transparent;
      height: 36px;
      box-sizing: border-box;
      text-align: center;
      transition: border-color 0.3s;

      /* 平滑过渡效果 */
      &:focus {
        border-color: #409eff !important;
      }
    }
  }
}

.order-full-table {
  .full-cell {
    padding: 0 !important;

    .cell {
      padding: 0;

      .input-container {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
        height: 100%;

        .full-size-input {
          height: 100%;

          .el-input__inner {
            height: 100% !important;
            text-align: center;
            border-color: transparent;
            transition: border-color 0.3s;
            /* 平滑过渡效果 */

            &:focus {
              border-color: #409eff !important;
            }
          }
        }
      }

      /* textarea */
      .el-textarea {
        .el-textarea__inner {
          min-height: 35px !important;
          resize: none;
          border-color: transparent;
          transition: border-color 0.3s;

          &:focus {
            border-color: #409eff !important;
          }
        }
      }
    }
  }

  .full-textarea-cell {
    padding: 0;

    .cell {
      padding: 0;
    }
  }

  .review-project-box {
    padding: 0;

    .cell {
      /* textarea */
      .el-textarea__inner {
        min-height: 35px !important;
        resize: none;
        border-color: transparent;
        transition: border-color 0.3s;

        &:focus {
          border-color: #409eff !important;
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.fixed_bottom_dialog {
  #order-review-table {
    width: 100%;
    border-collapse: collapse;
    box-sizing: border-box;

    .main-title {
      font-size: 1.8em;
      padding: 10px;
    }

    .sub-title {
      font-size: 1.4em;
    }

    .labelW {
      width: 100px;
    }

    .padding-zero {
      padding: 0;
    }

    th,
    td {
      font-size: 1em;
      border: 1px solid #ebeef5;
    }

    td.order_pad {
      padding: 6px 10px;
    }
  }

  /* 修改禁用状态下且选中的样式 */
  /deep/ .el-radio.is-disabled.is-checked .el-radio__inner {
    border-color: #409eff !important;
    /* 修改禁用且选中状态下的边框颜色 */
    background-color: #409eff !important;
    /* 修改禁用且选中状态下的背景颜色 */
  }

  /deep/ .el-radio.is-disabled.is-checked .el-radio__inner::after {
    background-color: #fff !important;
    /* 修改禁用且选中状态下的选中点颜色 */
  }

  /deep/ .el-radio.is-disabled.is-checked .el-radio__label {
    color: #409eff !important;
    /* 修改禁用且选中状态下的文字颜色 */
  }
}
</style>