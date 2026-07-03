<template>
  <el-dialog
    :visible.sync="visible"
    title="角色类型管理"
    width="900px"
    append-to-body
    class="role-type-dict-dialog"
    @close="handleClose"
  >
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:dict:add']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >
          新增类型
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="dataList" border size="small" style="width: 100%">
      <el-table-column label="类型名称" prop="dictLabel" min-width="140" align="center" />
      <el-table-column label="类型值" prop="dictValue" min-width="120" align="center" />
      <el-table-column label="排序" prop="dictSort" width="80" align="center" />
      <el-table-column label="状态" prop="status" width="90" align="center">
        <template slot-scope="scope">
          <dict-tag v-if="statusOptions && statusOptions.length" :options="statusOptions" :value="scope.row.status" />
          <span v-else>{{ scope.row.status === '0' ? '正常' : '停用' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        prop="remark"
        min-width="160"
        align="center"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:dict:edit']"
            type="text"
            icon="el-icon-edit"
            size="mini"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:dict:remove']"
            type="text"
            icon="el-icon-delete"
            size="mini"
            style="color: #f56c6c"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑角色类型弹窗 -->
    <el-dialog
      :visible.sync="formOpen"
      :title="formTitle"
      width="500px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="90px" size="small">
        <el-form-item label="字典类型">
          <el-input :value="form.dictType" disabled />
        </el-form-item>
        <el-form-item label="类型名称" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="类型值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入类型值" />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number
            v-model="form.dictSort"
            :min="0"
            controls-position="right"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <template v-if="statusOptions && statusOptions.length">
              <el-radio
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </template>
            <template v-else>
              <el-radio label="0">正常</el-radio>
              <el-radio label="1">停用</el-radio>
            </template>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="formOpen = false">取 消</el-button>
        <el-button size="small" type="primary" :loading="submitting" @click="submitForm">
          确 定
        </el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import {
  addData,
  delData,
  getData,
  getDicts,
  updateData,
} from "@/api/system/dict/data";

const DICT_TYPE = "sys_role_type";

export default {
  name: "RoleTypeDictDialog",
  props: {
    statusOptions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      visible: false,
      loading: false,
      formOpen: false,
      submitting: false,
      formTitle: "",
      dataList: [],
      form: {
        dictCode: undefined,
        dictType: DICT_TYPE,
        dictLabel: undefined,
        dictValue: undefined,
        dictSort: 0,
        listClass: "default",
        status: "0",
        remark: undefined,
      },
      rules: {
        dictLabel: [{ required: true, message: "类型名称不能为空", trigger: "blur" }],
        dictValue: [{ required: true, message: "类型值不能为空", trigger: "blur" }],
        dictSort: [{ required: true, message: "显示排序不能为空", trigger: "change" }],
      },
    };
  },
  methods: {
    reset() {
      this.form = {
        dictCode: undefined,
        dictType: DICT_TYPE,
        dictLabel: undefined,
        dictValue: undefined,
        dictSort: 0,
        listClass: "default",
        status: "0",
        remark: undefined,
      };
      this.resetForm("form");
    },
    getList() {
      this.loading = true;
      getDicts(DICT_TYPE)
        .then((response) => {
          this.dataList = response.data || [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    open() {
      this.visible = true;
      this.getList();
    },
    handleClose() {
      this.visible = false;
    },
    handleAdd() {
      this.reset();
      this.formTitle = "新增角色类型";
      this.formOpen = true;
    },
    handleUpdate(row) {
      this.reset();
      getData(row.dictCode).then((response) => {
        this.form = response.data || {};
        this.formTitle = "修改角色类型";
        this.formOpen = true;
      });
    },
    handleDelete(row) {
      this.$modal
        .confirm(`是否确认删除角色类型"${row.dictLabel}"？`)
        .then(() => {
          return delData(row.dictCode);
        })
        .then(() => {
          this.$modal.msgSuccess("删除成功");
          this.handleSuccess();
        })
        .catch(() => {});
    },
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (!valid) return;
        this.submitting = true;
        const apiCall = this.form.dictCode !== undefined ? updateData(this.form) : addData(this.form);
        apiCall
          .then(() => {
            this.$modal.msgSuccess(this.form.dictCode !== undefined ? "修改成功" : "新增成功");
            this.formOpen = false;
            this.handleSuccess();
          })
          .finally(() => {
            this.submitting = false;
          });
      });
    },
    handleSuccess() {
      this.$store.dispatch("dict/removeDict", DICT_TYPE).then(() => {
        this.getList();
        this.$emit("success");
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.mb8 {
  margin-bottom: 16px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
