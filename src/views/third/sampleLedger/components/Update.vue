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
      inline
    >
      <template v-if="showName !== 'remark'">
        <el-row :gutter="15">
          <el-col :span="8">
            <el-form-item label="类型:" prop="type">
              <el-select
                v-model="form.type"
                clearable
                filterable
                allow-create
                placeholder="请选择类型"
                :disabled="!!form.id"
              >
                <el-option
                  v-for="(item, index) in sampleTypeList"
                  :disabled="item.disabled"
                  :key="index"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="产品品类" prop="name">
              <el-select
                v-model="form.name"
                placeholder="请选择产品品类"
                clearable
                filterable
                allow-create
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
          </el-col>
          <el-col :span="8">
            <el-form-item label="产品型号" prop="computerName">
              <el-select
                v-model="form.computerName"
                placeholder="请选择产品型号"
                clearable
                filterable
                allow-create
                :disabled="!!form.id"
              >
                <el-option
                  v-for="dict in modelList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="ERP编码:" prop="code">
              <el-input
                v-model="form.code"
                clearable
                placeholder="请输入ERP编码"
              >
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="蓝牙:" prop="bluetooth">
              <el-select
                v-model="form.bluetooth"
                placeholder="请选择蓝牙类型"
                clearable
              >
                <el-option label="带" value="带"></el-option>
                <el-option label="不带" value="不带"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="硬件版本:" prop="hardVersion">
              <el-input
                v-model="form.hardVersion"
                clearable
                placeholder="请输入硬件版本"
              >
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
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
          </el-col>
          <el-col :span="8">
            <el-form-item label="控制器接头:" prop="controllerHead">
              <el-select
                v-model="form.controllerHead"
                placeholder="请选择控制器接头"
                clearable
                filterable
                allow-create
              >
                <el-option
                  v-for="(dict, index) in controllerHeadList"
                  :key="index"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="控制器出线线长(不含头):" prop="controllerLine">
              <el-input
                v-model.number="form.controllerLine"
                clearable
                oninput="value=value.replace(/[^\d]/g,'')"
                placeholder="请输入控制器出线线长（不含头）"
              >
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="按键型号:" prop="keyCode">
              <el-select
                v-model="form.keyCode"
                placeholder="请选择按键型号"
                clearable
                filterable
                allow-create
              >
                <el-option
                  v-for="(dict, index) in keyCodeList"
                  :key="index"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="按键线长:" prop="keyLine">
              <el-input
                v-model.number="form.keyLine"
                oninput="value=value.replace(/[^\d]/g,'')"
                clearable
                placeholder="请输入按键线长"
              >
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="生产时间:" prop="productionTime">
              <el-date-picker
                style="width: 180px"
                v-model="form.productionTime"
                type="datetime"
                :default-time="defaultTime"
                value-format="timestamp"
                placeholder="请选择生产时间"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="生产来源:" prop="productionSource">
              <el-select
                v-model="form.productionSource"
                filterable
                allow-create
                clearable
                placeholder="请选择生产来源"
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
            <el-form-item label="对应客户:" prop="customerName">
              <el-autocomplete
                v-model="form.customerName"
                clearable
                :fetch-suggestions="querySearchAsync"
                placeholder="请输入对应客户"
              ></el-autocomplete>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="目标库存:" prop="expectationInventory">
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
          </el-col>
        </el-row>
      </template>
      <el-form-item
        label="备注:"
        prop="remark"
        v-if="showName == 'remark' || !showName"
      >
        <tinymce
          v-if="dialogVisible"
          v-model="form.remark"
          placeholder="请输入"
          width="800"
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
  specification_add,
  specification_update,
  listCustomer,
} from "@/api/third/sample";
import tinymce from "@/views/components/Editor";
export default {
  components: { tinymce },
  props: ["sampleTypeList", "dictList", "modelList"],
  data() {
    return {
      showName: "",
      dialogVisible: false,
      title: "",
      defaultTime: this.moment().format("HH:mm:ss"),
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
        name: [
          { required: true, message: "请选择产品品类", trigger: "change" },
        ],
        computerName: [
          { required: true, message: "请选择产品型号", trigger: "change" },
        ],
        erpCode: [
          { required: true, message: "请输入ERP编码", trigger: "blur" },
        ],
        expectationInventory: [
          { required: true, message: "请输入目标库存", trigger: "blur" },
        ],
        address: [
          { required: true, message: "请选择存放位置", trigger: "change" },
        ],
      },
      options: [],
      // 防水头型号
      headModelList: [],
      // 存放位置
      addressTypeList: [],
      // mcu
      mucList: [],
      // 控制器接头
      controllerHeadList: [],
      // 按键型号
      keyCodeList: [],
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
    this.getDicts("sampleLedgerAddressType").then((res) => {
      this.addressTypeList = res.data;
    });
    this.getDicts("headModelType").then((res) => {
      this.headModelList = res.data;
    });
    this.getDicts("mcuType").then((res) => {
      this.mucList = res.data;
    });
    this.getDicts("controllerHeadType").then((res) => {
      this.controllerHeadList = res.data;
    });
    this.getDicts("keyCodeType").then((res) => {
      this.keyCodeList = res.data;
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
          let fn = this.form.id ? specification_update : specification_add;
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
