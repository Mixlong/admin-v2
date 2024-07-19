<template>
  <!--   -->
  <el-dialog
    :title="showName ? '' : title"
    :visible.sync="dialogVisible"
    width="1000px"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="120px"
      @submit.native.prevent
    >
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item
            label="线缆类型:"
            prop="type"
            v-if="showName == 'type' || !showName"
          >
            <el-select
              v-model="form.type"
              filterable
              allow-create
              clearable
              placeholder="请选择线缆类型"
              :disabled="!!form.id"
            >
              <el-option
                v-for="item in cableTypeList"
                :key="item.index"
                :disabled="item.disabled"
                :label="item.dictLabel"
                :value="item.dictValue"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="ERP编码:"
            prop="erpCode"
            v-if="showName == 'erpCode' || !showName"
          >
            <el-input
              v-model.trim="form.erpCode"
              clearable
              placeholder="请输入ERP编码"
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="规格:"
            prop="standards"
            v-if="showName == 'standards' || !showName"
          >
            <el-input
              v-model.trim="form.standards"
              clearable
              placeholder="请输入规格"
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="纤芯:"
            prop="lineCore"
            v-if="showName == 'lineCore' || !showName"
          >
            <el-select
              v-model="form.lineCore"
              clearable
              placeholder="请选择纤芯"
            >
              <el-option
                v-for="item in lineCoreList"
                :key="item.dictLabel"
                :disabled="item.disabled"
                :label="item.dictValue"
                :value="item.dictValue"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="厂家:"
            prop="product"
            v-if="showName == 'product' || !showName"
          >
            <el-select
              v-model="form.product"
              filterable
              allow-create
              clearable
              placeholder="请选择厂家"
            >
              <el-option
                v-for="item in productList"
                :key="item.dictLabel"
                :disabled="item.disabled"
                :label="item.dictValue"
                :value="item.dictValue"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="防水头型号:"
            prop="headModel"
            v-if="showName == 'headModel' || !showName"
          >
            <el-select
              v-model="form.headModel"
              filterable
              allow-create
              clearable
              placeholder="请选择防水头型号"
            >
              <el-option
                v-for="item in headModelList"
                :key="item.dictLabel"
                :disabled="item.disabled"
                :label="item.dictValue"
                :value="item.dictValue"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="线长MM(不含头):"
            prop="lineLength"
            v-if="showName == 'lineLength' || !showName"
          >
            <el-input
              v-model="form.lineLength"
              oninput="value=value.replace(/[^0-9]/g,'')"
              clearable
              placeholder="请输入线长MM(不含头)"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="对应客户:"
            prop="customerName"
            v-if="showName == 'customerName' || !showName"
          >
            <el-autocomplete
              v-model="form.customerName"
              clearable
              :fetch-suggestions="querySearchAsync"
              placeholder="请输入对应客户"
            ></el-autocomplete>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="目标库存:"
            prop="expectationInventory"
            v-if="showName == 'expectationInventory' || !showName"
          >
            <el-input
              oninput="value=value.replace(/[^0-9]/g,'')"
              clearable
              v-model="form.expectationInventory"
              placeholder="请输入目标库存"
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="存放位置:"
            prop="address"
            v-if="showName == 'address' || !showName"
          >
            <el-select
              v-model="form.address"
              filterable
              allow-create
              clearable
              placeholder="请选择存放位置"
            >
              <el-option
                v-for="item in addressTypeList"
                :key="item.dictLabel"
                :disabled="item.disabled"
                :label="item.dictValue"
                :value="item.dictValue"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="备注:"
        prop="remark"
        v-if="showName == 'remark' || !showName"
      >
        <tinymce
          v-if="dialogVisible"
          v-model="form.remark"
          placeholder="请输入"
          width="800px"
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
  sampleCable_add,
  sampleCable_update,
  listCustomer,
} from "@/api/third/sample";
import tinymce from "@/views/components/Editor";
export default {
  components: { tinymce },
  props: ["cableTypeList", "productList"],
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
        type: [
          { required: true, message: "请选择线缆类型", trigger: "change" },
        ],
        erpCode: [
          { required: true, message: "请输入ERP编码", trigger: "blur" },
        ],
        expectationInventory: [
          { required: true, message: "请输入目标库存", trigger: "blur" },
        ],
        address: [
          { required: true, message: "请输入存放位置", trigger: "change" },
        ],
      },
      options: [],
      // 线芯
      lineCoreList: [],
      // 防水头型号
      headModelList: [],
      // 存放位置
      addressTypeList: [],
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
    this.getDicts("lineCore").then((res) => {
      this.lineCoreList = res.data;
    });
    this.getDicts("addressType").then((res) => {
      this.addressTypeList = res.data;
    });
    this.getDicts("headModelType").then((res) => {
      this.headModelList = res.data;
    });
  },
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
          let fn = this.form.id ? sampleCable_update : sampleCable_add;
          fn(this.form).then((response) => {
            if (response.code === 200) {
              this.msgSuccess(this.form.id ? "修改成功" : "新增成功");
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
