<template>
  <div>
    <el-dialog
      v-bind="$attrs"
      width="900px"
      append-to-body
      center
      :close-on-click-modal="false"
      @close="$emit('update:visible', false)"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="80px"
        label-position="left"
      >
        <el-row :gutter="15">
          <el-col :span="8">
            <el-form-item label="所属品类" prop="categoryId">
              <el-select v-model="form.categoryId" filterable clearable>
                <el-option
                  v-for="dict in dictList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="防水测试标准"
              prop="waterproofingTestStandard"
              label-width="110"
            >
              <el-select
                v-model="form.waterproofingTestStandard"
                filterable
                clearable
              >
                <el-option
                  v-for="dict in dictsWaterTestData"
                  :key="dict.dictCode"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            clearable
            size="mini"
            placeholder="请输入备注"
          />
        </el-form-item>
        <el-row :gutter="10" class="gas-config-box">
          <el-col :span="7">
            <el-card shadow="nerver" class="el-card-box">
              <div slot="header">
                <span>测试时间参数(S)</span>
              </div>
              <div
                class="flex align-center justify-between"
                v-for="(item, index) in testTimeData"
                :key="index"
              >
                <el-tag
                  color="#00aadc"
                  effect="dark"
                  size="medium"
                  style="border: none; display: flex; align-items: center"
                >
                  {{ item.label }}
                </el-tag>
                <el-input-number
                  v-model="item.value"
                  :min="item.min"
                  controls-position="right"
                  style="width: 120px"
                />
              </div>
            </el-card>
          </el-col>
          <el-col :span="10">
            <el-card shadow="nerver" class="el-card-box">
              <div slot="header">
                <span>测试压力参数</span>
              </div>
              <div
                class="flex align-center justify-between"
                v-for="(item, index) in testPressureData"
                :key="index"
              >
                <el-tag
                  color="#00aadc"
                  effect="dark"
                  size="medium"
                  style="border: none; display: flex; align-items: center"
                >
                  {{ item.label }}
                </el-tag>
                <div class="flex align-center space-between">
                  <el-input-number
                    v-model="item.value"
                    controls-position="right"
                    style="width: 120px"
                  />
                  <div class="unit-box">{{ item.unit }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="7" class="test-front-end-box">
            <el-card shadow="nerver" class="el-card-box">
              <div slot="header">
                <span>测试前外部输出状态(S)</span>
              </div>
              <div
                class="flex align-center justify-between"
                v-for="(item, index) in testFrongData"
                :key="index"
              >
                <el-tag
                  type="warning"
                  effect="dark"
                  size="medium"
                  style="width: 70px; text-align: center"
                >
                  {{ item.label }}
                </el-tag>
                <el-input-number
                  v-model="item.value"
                  :min="item.min"
                  controls-position="right"
                  style="width: 120px"
                />
              </div>
            </el-card>
            <el-card shadow="nerver" class="el-card-box">
              <div slot="header">
                <span>测试后外部输出状态(S)</span>
              </div>
              <div
                class="flex align-center justify-between"
                v-for="(item, index) in testEndData"
                :key="index"
              >
                <el-tag
                  type="success"
                  effect="dark"
                  size="medium"
                  style="width: 70px; text-align: center"
                >
                  {{ item.label }}
                </el-tag>
                <el-input-number
                  v-model="item.value"
                  :min="item.min"
                  controls-position="right"
                  style="width: 120px"
                />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="$emit('update:visible', false)">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { gasConfigSave, gasConfigUpdate } from "@/api/third/testApi";

export default {
  inheritAttrs: false,
  props: ["dictList"],
  data() {
    return {
      // 表单参数
      form: {
        categoryId: "",
        json: "",
        remark: "",
        waterproofingTestStandard: "",
      },
      testTimeData: [],
      testPressureData: [],
      testFrongData: [],
      testEndData: [],
      dictsWaterTestData: [],
      // 表单校验
      rules: {
        categoryId: [
          { required: true, message: "请选择品类", trigger: "change" },
        ],
        waterproofingTestStandard: [
          { required: true, message: "请选择防水测试标准", trigger: "change" },
        ],
        remark: [{ required: true, message: "请输入备注", trigger: "blur" }],
      },
    };
  },
  watch: {
    "$attrs.visible"(visible) {
      if (visible && this.form.id) {
        this.setGasConfigParams();
      }
    },
  },
  created() {
    this.getDicts("sys_water_test").then((res) => {
      this.dictsWaterTestData = res.data;
    });
  },
  methods: {
    // 表单重置
    reset() {
      this.setConfigDefaultVal();
      this.resetForm("form");
      this.form = {
        categoryId: "",
        json: "",
        remark: "",
        waterproofingTestStandard: "",
      };
    },
    setConfigDefaultVal() {
      this.testTimeData = [
        {
          label: "充气时间",
          value: undefined,
          key: "inflationTime",
          min: 0
        },
        {
          label: "稳压时间",
          value: undefined,
          key: "stablePressureTime",
          min: 0
        },
        {
          label: "测试时间",
          value: undefined,
          key: "testTime",
          min: 0
        },
        {
          label: "放气时间",
          value: undefined,
          key: "deflationTime",
          min: 0
        },
        {
          label: "定量进气",
          value: undefined,
          key: "quantitativeInflationTime",
          min: 0
        },
        // {
        //   label: "分压时间",
        //   value: undefined,
        //   key: "PartialPressureTime",
        // },
        // {
        //   label: "下一程序",
        //   value: undefined,
        //   key: "NextProcedure",
        // },
      ];

      this.testPressureData = [
        {
          label: "进气压力",
          value: undefined,
          unit: "KPa",
          key: "intakePressure",
        },
        {
          label: "进气上限",
          value: undefined,
          unit: "KPa",
          key: "upperIntakeLimit",
        },
        {
          label: "进气下限",
          value: undefined,
          unit: "KPa",
          key: "lowerIntakeLimit",
        },
        {
          label: "泄漏上限",
          value: undefined,
          unit: "KPa",
          key: "upperLeakageLimit",
        },
        {
          label: "泄漏下限",
          value: undefined,
          unit: "KPa",
          key: "lowerLeakageLimit",
        },
        // {
        //   label: "泄漏偏移",
        //   value: undefined,
        //   unit: "KPa",
        //   key: "LeakageMigration",
        // },
        // {
        //   label: "大漏上限",
        //   value: undefined,
        //   key: "LargeLeakLimit",
        // },
        // {
        //   label: "大漏下限",
        //   value: undefined,
        //   key: "LargeLeakLowLimite",
        // },
        // {
        //   label: "工件容积",
        //   value: undefined,
        //   unit: "ml",
        //   key: "workVolume",
        // },
      ];

      this.testFrongData = [
        {
          label: "延时1",
          value: undefined,
          key: "beforeTestOutputDelay1",
          min: 0
        },
        // {
        //   label: "延时2",
        //   value: undefined,
        //   key: "beforeTestOutputDelay2",
        // },
        // {
        //   label: "延时3",
        //   value: undefined,
        //   key: "beforeTestOutputDelay3",
        // },
        // {
        //   label: "延时4",
        //   value: undefined,
        //   key: "beforeTestOutputDelay4",
        // },
      ];

      this.testEndData = [
        {
          label: "延时1",
          value: undefined,
          key: "afterTestOutputDelay1",
          min: 0
        },
        // {
        //   label: "延时2",
        //   value: undefined,
        //   key: "afterTestOutputDelay2",
        // },
        // {
        //   label: "延时3",
        //   value: undefined,
        //   key: "afterTestOutputDelay3",
        // },
        // {
        //   label: "延时4",
        //   value: undefined,
        //   key: "afterTestOutputDelay4",
        // },
      ];
    },
    setGasConfigParams() {
      const { json } = this.form;;
      const jsonData = JSON.parse(json);

      this.$set(
        this.form,
        "waterproofingTestStandard",
        jsonData?.waterproofingTestStandard
      );

      const gasConfigList = [
        "testTimeData",
        "testPressureData",
        "testFrongData",
        "testEndData",
      ];

      gasConfigList.forEach((name) => {
        this[name].forEach((item) => {
          if (jsonData[item.key] || jsonData[item.key] === 0) {
            item.value = jsonData[item.key];
          }
        });
      });
    },

    checkGasConfigItemEmpty(data) {
      const flag = data?.some((item) => item.value === undefined);
      return flag;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.checkGasConfigItemEmpty(this.testTimeData)) {
            return this.msgWarning("测试时间参数不能为空");
          }

          if (this.checkGasConfigItemEmpty(this.testPressureData)) {
            return this.msgWarning("测试压力参数不能为空");
          }

          if (this.checkGasConfigItemEmpty(this.testFrongData)) {
            return this.msgWarning("测试前外部输出状态参数不能为空");
          }

          if (this.checkGasConfigItemEmpty(this.testEndData)) {
            return this.msgWarning("测试后外部输出状态参数不能为空");
          }

          const gasTestData = [
            ...this.testTimeData,
            ...this.testPressureData,
            ...this.testFrongData,
            ...this.testEndData,
          ];
          const jsonData = {};
          gasTestData.forEach((item) => {
            jsonData[item.key] = item.value ?? "";
          });

          const { remark, waterproofingTestStandard } = this.form;
          this.form.json = JSON.stringify({
            ...jsonData,
            remark,
            waterproofingTestStandard,
          });

          if (this.form.id) {
            gasConfigUpdate(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.$emit("update:visible", false);
                this.$parent.getList();
              }
            });
          } else {
            gasConfigSave(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("创建成功");
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
<style lang="scss" scoped>
.gas-config-box {
  /* height: 440px; */
  height: 240px;
  margin-bottom: 20px;
  .el-col {
    height: 100%;
    .el-card-box {
      height: 100%;
      /deep/ .el-card__header {
        background: #00aaaa;
        color: #fff;
        text-align: center;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      /deep/ .el-card__body {
        padding: 10px;
        height: calc(100% - 40px);
        display: grid;
        /* align-content: space-between; */
      }
    }
  }

  .test-front-end-box {
    display: grid;
    row-gap: 10px;
  }

  .unit-box {
    width: 30px;
    text-align: left;
    margin-left: 5px;
  }
}
</style>