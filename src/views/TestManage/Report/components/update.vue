<template>
  <div>
    <el-dialog
      v-bind="$attrs"
      width="550px"
      append-to-body
      center
      :close-on-click-modal="false"
      @close="$emit('update:visible', false)"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="left"
      >
        <el-form-item
          label="测试用例："
          prop="customerName"
          v-if="isUpdateShow"
        >
          <select-loadMore
            v-model="form.customerName"
            style="width: 100%"
            :data="productTestData.data"
            :page="productTestData.page"
            :hasMore="productTestData.more"
            dictLabel="customerName"
            :moreParams="true"
            :disabled="!!form.id"
            :request="getProductTestList"
            @getChange="getProductTestId"
            placeholder="请选择测试用例"
          />
        </el-form-item>
        <el-form-item label="报告标题：" prop="title">
          <el-input
            v-model="form.title"
            clearable
            readonly
            placeholder="请输入报告标题"
          >
            <el-button
              v-if="isUpdateShow"
              slot="append"
              :disabled="form.customerName === ''"
              @click="onCreateTitle"
            >
              生成
            </el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="测试对象：" prop="target">
          <el-input
            v-model="form.target"
            clearable
            readonly
            placeholder="请输入测试对象"
          />
        </el-form-item>
        <el-form-item label="测试人员：" prop="completeName">
          <el-input
            v-model="form.completeName"
            clearable
            readonly
            placeholder="请输入测试人员"
          />
        </el-form-item>
        <el-form-item label="测试范围：" prop="range">
          <el-input
            v-model="form.range"
            clearable
            placeholder="请输入测试范围"
          />
        </el-form-item>
        <el-form-item label="测试总结：" prop="result">
          <el-input
            v-model="form.result"
            clearable
            placeholder="请输入测试总结"
          />
        </el-form-item>
        <el-form-item label="风险：" prop="risk">
          <el-input v-model="form.risk" clearable placeholder="请输入风险" />
        </el-form-item>
        <el-form-item label="测试时间：" required>
          <el-col :span="11">
            <el-form-item prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                value-format="timestamp"
                style="width: 100%"
                placeholder="请选择开始时间"
              />
            </el-form-item>
          </el-col>
          <el-col class="text-center" :span="2">-</el-col>
          <el-col :span="11">
            <el-form-item prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                value-format="timestamp"
                style="width: 100%"
                placeholder="请选择结束时间"
                :picker-options="pickerOptionsEnd"
              />
            </el-form-item>
          </el-col>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="$emit('update:visible', false)">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  reportSave,
  reportUpdate,
  resportGenerate,
  taskList,
} from "@/api/third/testApi";

export default {
  inheritAttrs: false,
  props: ["moduleList"],
  data() {
    return {
      disabledDate: null,
      defaultTime: this.moment().format("HH:mm:ss"),
      // 表单参数
      form: {},
      testData: {},
      productTestData: {
        data: [],
        page: 1,
        more: true,
      },
      // 表单校验
      rules: {
        customerName: [
          {
            required: true,
            message: "测试用例不能为空",
            trigger: "change",
          },
        ],
        title: [
          {
            required: true,
            message: "报告标题不能为空",
            trigger: ["change", "blur"],
          },
        ],
        target: [
          {
            required: true,
            message: "测试对象不能为空",
            trigger: ["change", "blur"],
          },
        ],
        completeName: [
          {
            required: true,
            message: "测试人员不能为空",
            trigger: "blur",
          },
        ],
        range: [
          {
            required: true,
            message: "测试范围不能为空",
            trigger: ["change", "blur"],
          },
        ],
        risk: [
          {
            required: true,
            message: "风险不能为空",
            trigger: ["change", "blur"],
          },
        ],
        result: [
          {
            required: true,
            message: "测试总结不能为空",
            trigger: ["change", "blur"],
          },
        ],
        startTime: [
          {
            required: true,
            message: "开始时间不能为空",
            trigger: "change",
          },
        ],
        endTime: [
          {
            required: true,
            message: "结束时间不能为空",
            trigger: "change",
          },
        ],
      },
    };
  },
  computed: {
    isUpdateShow() {
      return !this.form.id;
    },
    pickerOptionsEnd() {
      return {
        disabledDate: this.disabledDate,
        selectableRange: `${this.defaultTime} - 23:59:59`,
      }
    }
  },
  watch: {
    'form.startTime'(startTime) {
      if(startTime) {
        this.disabledDate = (time) => {
          return time.getTime() < startTime
        }
      } else {
        this.disabledDate = () => {
          return false
        }
      }
    }
  },
  methods: {
    // 自动生成报告标题
    onCreateTitle() {
      const { id, type } = this.testData;
      resportGenerate({ taskId: id, type }).then((res) => {
        const { title, target, completeName } = res.data;
        this.form.taskId = id;
        this.form.title = title;
        this.form.target = target;
        this.form.completeName = completeName;
      });
    },
    // 表单重置
    reset() {
      this.resetForm("form");
      this.form = {
        customerName: "",
        title: "",
        target: "",
        completeName: "",
        range: "",
        result: "",
        risk: "",
        startTime: "",
        endTime: ""
      };
    },
    /** 产品测试数据 */
    getProductTestList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        taskList({
          p: page,
          isComplete: 1,
          customerName: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.productTestData.data = [...this.productTestData.data, ...list];
          } else {
            this.productTestData.data = list;
          }
          this.productTestData.more = pageNum * pageSize < total;
          this.productTestData.page = pageNum;
          resolve();
        });
      });
    },
    getProductTestId(info) {
      if (!info) {
        this.form.orderId = "";
        return;
      }
      this.testData = JSON.parse(info);
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id) {
            reportUpdate(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.$emit("update:visible", false);
                this.$parent.getList();
              }
            });
          } else {
            reportSave(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("添加成功");
                this.$emit("update:visible", false);
                this.$parent.getList();
              }
            });
          }
        }
      });
    },
  },
};
</script>
