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
      <template v-if="showName !== 'remark'">
        <el-form-item label="产品品类" prop="categoryName">
          <el-select
            v-model="form.categoryName"
            placeholder="请选择产品品类"
            clearable
            filterable
            :disabled="!!form.id"
          >
            <el-option
              v-for="dict in dictList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="物料类别" prop="materialType">
          <el-select
            v-model="form.materialType"
            placeholder="请选择物料类别"
            clearable
            filterable
            :disabled="!!form.id"
          >
            <el-option
              v-for="(item, index) in materialTypeList"
              :key="index"
              :label="item.dictLabel"
              :value="item.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <template v-if="form.materialType !== '底壳'">
          <el-form-item label="版本:" prop="version">
            <el-input
              v-model="form.version"
              clearable
              placeholder="请输入版本"
            ></el-input>
          </el-form-item>
          <el-form-item label="ERP编码:" prop="erpCode">
            <el-input
              v-model="form.erpCode"
              clearable
              placeholder="请输入规格型号"
            >
            </el-input>
          </el-form-item>
        </template>
        <template v-if="form.materialType === 'PCBA'">
          <el-form-item label="蓝牙:" prop="bluetooth">
            <el-input
              v-model.trim="form.bluetooth"
              clearable
              placeholder="请输入蓝牙"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="MCU:" prop="mcu">
            <el-select
              v-model="form.mcu"
              placeholder="请选择MCU"
              clearable
              filterable
              allow-create
            >
              <el-option
                v-for="(dict, index) in mucList"
                :key="index"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
        </template>
        <el-form-item
          label="厂家:"
          prop="factory"
          v-if="form.materialType === '底壳'"
        >
          <el-input
            v-model.trim="form.factory"
            clearable
            placeholder="请输入厂家"
          >
          </el-input>
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
        <el-form-item label="存放位置:" prop="address">
          <el-select
            v-model="form.address"
            clearable
            filterable
            allow-create
            placeholder="请选择存放位置"
          >
            <el-option
              v-for="(item, index) in addressTypeList"
              :key="index"
              :disabled="item.disabled"
              :label="item.dictLabel"
              :value="item.dictValue"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </template>
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
import { material_add, material_update } from "@/api/third/sample";
import tinymce from "@/views/components/Editor";
export default {
  components: { tinymce },
  props: ["dictList", "materialTypeList"],
  data() {
    return {
      showName: "",
      dialogVisible: false,
      title: "",
      // mcu
      mucList: [],
      // 存放位置
      addressTypeList: [],
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
        categoryName: [
          { required: true, message: "请选择产品品类", trigger: "change" },
        ],
        materialType: [
          { required: true, message: "请选择物料类别", trigger: "change" },
        ],
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
  mounted() {
    this.getDicts("assembleAddressType").then((res) => {
      this.addressTypeList = res.data;
    });
    this.getDicts("mcuType").then((res) => {
      this.mucList = res.data;
    });
  },
  methods: {
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let data = Object.assign({}, this.form);
          if (data.materialType === "底壳") {
            data.version = "";
            data.erpCode = "";
            data.bluetooth = "";
            data.mcu = "";
          } else if (
            data.materialType !== "PCBA" &&
            data.materialType !== "底壳"
          ) {
            data.bluetooth = "";
            data.mcu = "";
          }
          let fn = this.form.id ? material_update : material_add;
          fn(data).then((response) => {
            if (response.code === 200) {
              this.msgSuccess(this.form.id ? "修改成功" : "新增成功");
              this.$parent.getList();
              this.dialogVisible = false;
            }
          });
        }
      });
    },
  },
};
</script>
