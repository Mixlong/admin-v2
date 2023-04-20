<template>
  <div>
    <el-dialog
      title="测试数据"
      width="1300px"
      append-to-body
      center
      v-bind="$attrs"
      :close-on-click-modal="false"
      @close="$emit('update:visible', false)"
    >
    {{ isPassFlag }}
      <el-table :data="detailData.list" style="width: 100%" height="350">
        <el-table-column
          prop="productName"
          label="模块"
          width="120"
          align="center"
        />
        <el-table-column
          prop="content"
          label="测试项"
          width="110"
          align="center"
        />
        <el-table-column
          prop="preconditions"
          label="前置条件"
          width="110"
          align="center"
        />
        <el-table-column
          prop="inter"
          label="输入与操作"
          align="center"
          width="110"
        />
        <el-table-column
          prop="result"
          label="预期结果"
          width="110"
          align="center"
        />
        <el-table-column
          prop="reality"
          label="实际测试情况"
          align="center"
          width=""
        >
          <template slot-scope="{ row }">
            <el-input
              v-model="row.reality"
              placeholder="请输入实际测试情况"
              clearable
            />
          </template>
        </el-table-column>
        <el-table-column prop="reality" label="失败/忽略原因" align="center">
          <template slot-scope="{ row }">
            <el-input
              v-if="row.isPass === 2 || row.isPass === 3"
              v-model="row.msg"
              :placeholder="isNoPassOrLossMsg(row.isPass)"
              clearable
            />
          </template>
        </el-table-column>
        <el-table-column label="实际测试结果" align="center" width="280">
          <template slot-scope="{ row }">
            <el-radio-group v-model="row.isPass">
              <el-radio
                :label="1"
                border
                size="small"
                style="margin-right: 5px"
              >
                通过
              </el-radio>
              <el-radio
                :label="2"
                border
                size="small"
                style="margin-right: 5px; margin-left: 0"
              >
                不通过
              </el-radio>
              <el-radio :label="3" border size="small" style="margin-left: 0">
                忽略
              </el-radio>
            </el-radio-group>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm(1)">通 过</el-button>
        <el-button type="danger" @click="submitForm(2)">不通过</el-button>
        <el-button type="success" @click="submitForm()">保 存</el-button>
        <el-button @click="$emit('update:visible', false)">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
  
  <script>
import { taskInfo, taskState } from "@/api/third/testApi";

export default {
  inheritAttrs: false,
  data() {
    return {
      isNoPass: false,
      isPassFlag: true,
      detailData: {
        list: [],
      },
    };
  },
  computed: {
    isNoPassOrLossMsg() {
      return (isPass) => {
        return `请填写${isPass === 2 ? "不通过" : isPass === 3 ? "忽略" : ""}的原因`;
      };
    },
  },
  methods: {
    getDetail(detailId) {
      taskInfo(detailId).then((res) => {
        this.detailData = res.data;
      });
    },
    checkListPass() {
      return this.detailData.list.some(
        (item) => !item.reality || item.isPass === 0
      );
    },
    // 测试结果为 不通过，忽略时原因必填
    checkNoPassList() {
      return this.detailData.list.some(
        (item) => this.Is_Empty(item.msg) && item.isPass === 2
      );
    },
    // 测试结果为 不通过，忽略时原因必填
    checkLoss() {
      return this.detailData.list.some(
        (item) => this.Is_Empty(item.msg) && item.isPass === 3
      );
    },
    // 所有测试用例通过
    checkAllPass() {
      return this.detailData.list.every((item) => item.isPass === 1);
    },
    // 测试不通过项
    checkEachNoPass() {
      return this.detailData.list.some((item) => item.isPass === 2);
    },
    // 不通过状态
    checkNoPass() {
      return this.detailData.list
        .filter((item) => item.isPass === 2)
        .map((item) => item.productName);
    },
    /** 提交按钮 */
    submitForm(state) {
      if (this.checkListPass()) {
        return this.msgError("请填写或选择必须的内容");
      }
      if (this.checkNoPassList()) {
        return this.msgError("请填写“不通过”原因");
      }
      if (this.checkLoss()) {
        return this.msgError("请填写“忽略”原因");
      }
      // 通过
      if (state === 1) {
        console.log(this.checkAllPass());
        // 全部测试通过
        if (this.checkAllPass()) {
          if (this.isPassFlag) {
            this.isPassFlag = false;
            return this.msgError("请再次检查一遍测试用例");
          } else {
            console.info("通过");
            this.onTaskState(state);
          }
        }

        // 不通过测试项
        if (this.checkEachNoPass()) {
          const noPassList = this.checkNoPass();
          this.$confirm(
            `当前有“ ${noPassList} ”不通过的用例，确认要测试通过吗？`,
            "警告",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          )
            .then(() => {
              this.onTaskState(state);
            })
            .catch(() => {});
        }
      }
      // 不通过
      if (state === 2) {
        const noPassList = this.checkNoPass();
        if (noPassList.length) {
          this.$confirm(`确认要“ ${noPassList} ”用例测试不通过吗？`, "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              this.onTaskState(state);
            })
            .catch(() => {});
        } else {
          this.onTaskState(state);
        }
      }
    },
    onTaskState(state) {
      const { id, list } = this.detailData;
      const data = { id, state, list };
      taskState(data).then(() => {
        this.msgSuccess("操作成功");
        this.$emit("update:visible", false);
        this.$parent.getList();
      });
    },
  }
};
</script>
  