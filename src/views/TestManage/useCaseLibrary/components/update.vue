<template>
  <div>
    <el-dialog
      v-bind="$attrs"
      width="450px"
      append-to-body
      center
      :close-on-click-modal="false"
      @close="$emit('update:visible', false)"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="110px"
        label-position="left"
      >
        <el-form-item label="模块：" prop="productName">
          <select-loadMore
            v-model="form.productName"
            :data="moduleData.data"
            :page="moduleData.page"
            :hasMore="moduleData.more"
            :moreParams="true"
            dictLabel="productName"
            dictValue="id"
            :request="getModuleList"
            @getChange="getModuleId"
            placeholder="请选择模块"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="用例类型：" prop="type">
          <el-select
            v-model="form.type"
            size="mini"
            filterable
            placeholder="请选择用例类型"
            style="width: 100%"
          >
            <el-option
              v-for="dict in useCaseTypeList"
              :key="dict.dictCode"
              :label="dict.dictValue"
              :value="String(dict.dictCode)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="测试项：" prop="content">
          <el-input
            v-model="form.content"
            clearable
            placeholder="请输入测试项"
          />
        </el-form-item>
        <el-form-item label="前置条件：" prop="preconditions">
          <el-input
            v-model="form.preconditions"
            clearable
            placeholder="请输入前置条件"
          />
        </el-form-item>
        <el-form-item label="输入与操作：" prop="inter">
          <el-input
            v-model="form.inter"
            clearable
            placeholder="请输入输入与操作"
          />
        </el-form-item>
        <el-form-item label="预期结果：" prop="result">
          <el-input
            v-model="form.result"
            clearable
            placeholder="请输入预期结果"
          />
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
  testProductList,
  testCaseAdd,
  testCaseEdit,
} from "@/api/third/testApi";

export default {
  inheritAttrs: false,
  props: ["useCaseTypeList"],
  data() {
    return {
      moduleData: {
        data: [],
        page: 1,
        more: true,
      },
      step: 1,
      modelList: [],
      dialogVisible: false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        productName: [
          { required: true, message: "请选择模块", trigger: "change" },
        ],
        type: [
          { required: true, message: "请输入用例类型", trigger: "change" },
        ],
        content: [{ required: true, message: "请输入测试项", trigger: "blur" }],
        preconditions: [
          { required: true, message: "请输入前置条件", trigger: "blur" },
        ],
        inter: [
          { required: true, message: "请输入输入与操作", trigger: "blur" },
        ],
        result: [
          { required: true, message: "请输入预期结果", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    // 表单重置
    reset() {
      this.resetForm("form");
      this.form = {};
    },
    /** 产品型号 */
    getModuleList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        testProductList({
          p: page,
          productType: keyword,
        }).then((res) => {
          console.log(res, 111);
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.moduleData.data = [...this.moduleData.data, ...list];
          } else {
            this.moduleData.data = list;
          }
          this.moduleData.more = pageNum * pageSize < total;
          this.moduleData.page = pageNum;
          resolve();
        });
      });
    },
    getModuleId(info) {
      if (!info) {
        this.form.productId = "";
        return;
      }
      const data = JSON.parse(info);
      console.log(data);
      this.form.productId = data.id;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id) {
            testCaseEdit(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.$emit("update:visible", false);
                this.$parent.getList();
              }
            });
          } else {
            testCaseAdd(this.form).then((response) => {
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
