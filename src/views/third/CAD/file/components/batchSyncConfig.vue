<template>
  <el-dialog
    title="批量同步文件"
    :visible.sync="dialogVisible"
    width="650px"
    center
    append-to-body
    :close-on-click-modal="false"
    top="-15vh"
  >
    <el-form ref="form" :model="form" :rules="rules">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="box-card" header="原始项" shadow="nerver">
            <el-form-item label="原始品类" prop="originalCategoryId">
              <el-select
                v-model="form.originalCategoryId"
                clearable
                filterable
                @change="handleOriginCategory"
                style="width: 100%"
              >
                <el-option
                  v-for="dict in dictList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="原始型号" prop="computerId">
              <el-select
                v-model="form.computerId"
                filterable
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="dict in originComputerOptions"
                  :key="dict.model"
                  :label="dict.name"
                  :value="dict.model"
                />
              </el-select>
            </el-form-item>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="box-card" header="同步项" shadow="nerver">
            <el-form-item label="同步品类" prop="syncCategoryId">
              <el-select
                v-model="form.syncCategoryId"
                clearable
                filterable
                @change="handleSyncCategory"
                style="width: 100%"
              >
                <el-option
                  v-for="dict in dictList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="同步型号" prop="targetComputerId">
              <el-select
                v-model="form.targetComputerId"
                filterable
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="dict in syncComputerOptions"
                  :key="dict.model"
                  :label="dict.name"
                  :value="dict.model"
                />
              </el-select>
            </el-form-item>
          </el-card>
        </el-col>
      </el-row>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        :loading="isSubLoading"
        @click="submitForm('form')"
        >确 定</el-button
      >
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  fileBatchSyncConfig,
  categoryComputerDict,
} from "@/api/third/fileConfig";

export default {
  data() {
    return {
      dialogVisible: false,
      isSubLoading: false,
      dictList: [],
      originComputerOptions: [],
      syncComputerOptions: [],
      form: {
        originalCategoryId: "",
        computerId: "",
        syncCategoryId: "",
        targetComputerId: "",
      },
      rules: {
        originalCategoryId: [
          {
            required: true,
            message: "原始品类不能为空",
            trigger: "change",
          },
        ],
        computerId: [
          {
            required: true,
            message: "原始型号不能为空",
            trigger: "change",
          },
        ],
        syncCategoryId: [
          {
            required: true,
            message: "同步品类不能为空",
            trigger: "change",
          },
        ],
        targetComputerId: [
          {
            required: true,
            message: "同步型号不能为空",
            trigger: "change",
          },
        ],
      },
    };
  },
  watch: {
    dialogVisible(bool) {
      if (bool) {
        this.getCategoryData();
      } else {
        this.reset();
      }
    },
  },
  methods: {
    getCategoryData() {
      categoryComputerDict().then((response) => {
        this.dictList = response.data;
      });
    },
    handleOriginCategory(categoryId) {
      if (!categoryId) return;
      this.form.computerId = "";
      this.originComputerOptions = [];
      this.originComputerOptions = this.dictList.filter(
        (item) => item.id === categoryId
      )[0]?.computerList;
    },
    handleSyncCategory(categoryId) {
      if (!categoryId) return;
      this.form.targetComputerId = "";
      this.syncComputerOptions = [];
      this.syncComputerOptions = this.dictList.filter(
        (item) => item.id === categoryId
      )[0]?.computerList;
    },
    reset() {
      this.form = {
        originalCategoryId: "",
        computerId: "",
        syncCategoryId: "",
        targetComputerId: "",
      };
      this.dictList = [];
      this.originComputerOptions = [];
      this.syncComputerOptions = [];
      this.resetForm("form");
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.isSubLoading = true;

          const { computerId, targetComputerId } = this.form;
          fileBatchSyncConfig({
            computerId,
            targetComputerId,
          })
            .then(() => {
              this.msgSuccess("批量同步成功");
              this.dialogVisible = false;
              this.$parent.getList();
            })
            .finally(() => {
              this.isSubLoading = false;
            });
        }
      });
    },
  },
};
</script>

<style>
</style>