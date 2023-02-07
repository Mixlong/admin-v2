<template>
  <!--   -->
  <el-dialog
    :title="showName ? '' : title"
    :visible.sync="dialogVisible"
    width="730px"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.native.prevent
      class="form-data-inline"
      :class="{ 'row-label-style': showName }"
      inline
    >
      <el-form-item
        label="类型:"
        prop="type"
        v-if="showName == 'type' || !showName"
      >
        <el-select
          v-model="form.type"
          placeholder="请选择类型"
          filterable
          allow-create
          clearable
          :disabled="!!form.id"
        >
          <el-option
            v-for="item in partsTypeList"
            :key="item.index"
            :disabled="item.disabled"
            :label="item.dictLabel"
            :value="item.dictValue"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="名称:"
        prop="name"
        v-if="showName == 'name' || !showName"
      >
        <el-input v-model.trim="form.name" clearable placeholder="请输入名称">
        </el-input>
      </el-form-item>
      <el-form-item
        label="规格型号:"
        prop="standards"
        v-if="showName == 'standards' || !showName"
      >
        <el-input
          v-model="form.standards"
          clearable
          placeholder="请输入规格型号"
        >
        </el-input>
      </el-form-item>
      <el-form-item
        label="对应客户:"
        prop="customerName"
        v-if="showName == 'customerName ' || !showName"
      >
        <el-autocomplete
          v-model="form.customerName"
          clearable
          :fetch-suggestions="querySearchAsync"
          placeholder="请输入对应客户"
        ></el-autocomplete>
      </el-form-item>
      <el-form-item
        label="目标库存:"
        prop="expectationInventory"
        v-if="showName == 'expectationInventory' || !showName"
      >
        <el-input
          oninput="value=value.replace(/[^0-9]/g,'')"
          v-model="form.expectationInventory"
          placeholder="请输入目标库存"
        >
        </el-input>
      </el-form-item>
      <el-form-item
        label="存放位置:"
        prop="address"
        v-if="showName == 'address ' || !showName"
      >
        <el-input
          v-model.trim="form.address"
          clearable
          placeholder="请输入存放位置"
        >
        </el-input>
      </el-form-item>
      <el-form-item
        label="备注:"
        prop="remark"
        style="width: 100%"
        :label-width="showName == 'remark' ? '0' : '100px'"
        v-if="showName == 'remark' || !showName"
      >
        <tinymce
          v-if="dialogVisible"
          v-model="form.remark"
          placeholder="请输入"
          :width="showName == 'remark' ? '100%' : '590px'"
          height="210"
        ></tinymce>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  sampleParts_add,
  sampleParts_update,
  listCustomer,
} from "@/api/third/sample";
import tinymce from "@/views/components/Editor";
export default {
  components: { tinymce },
  props: ["partsTypeList"],
  data() {
    return {
      showName: "",
      dialogVisible: false,
      title: "",
      // 是否显示弹出层

      // 查询参数
      queryParams: {
        p: 1,
        l: 1000,
        key: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        customerName: [
          { required: false, message: "请输入对应客户", trigger: "blur" },
        ],
        name: [{ required: true, message: "请输入名称", trigger: "change" }],
        standards: [
          { required: false, message: "请输入规格型号", trigger: "blur" },
        ],
        expectationInventory: [
          { required: true, message: "请输入目标库存", trigger: "change" },
        ],
        address: [
          { required: true, message: "请输入存放位置", trigger: "blur" },
        ],
        realInventory: [
          { required: true, message: "请输入当前库存", trigger: "change" },
        ],
        type: [{ required: true, message: "请选择类型", trigger: "change" }],
      },
      options: [],
    };
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.resetForm("form");
      }
    },
  },
  mounted() {},
  methods: {
    querySearchAsync(queryString, cb) {
      listCustomer({ key: queryString || "" }).then((res) => {
        cb(
          res.data.map((item) => {
            return {
              value: item.name,
            };
          })
        );
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let fn = this.form.id ? sampleParts_update : sampleParts_add;
          fn(this.form).then((response) => {
            if (response.code === 200) {
              this.msgSuccess(this.showName ? "修改成功" : "新增成功");
              this.$parent.getList();
              this.dialogVisible = false;
            }
          });
        }
      });
    },
    changeDut(val) {
      if (!val) {
        this.form.processId = null;
        this.form.dutCode = null;
      }
    },
    changeProcessId(val) {
      if (!val) {
        this.form.processId = null;
        this.form.dutCode = null;
      }
    },
  },
};
</script>
