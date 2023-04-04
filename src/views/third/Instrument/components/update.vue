<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :top="dialogTop()"
      width="1560px"
      append-to-body
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="124px"
        class="form-data-in"
      >
        <el-row style="width: 100%">
          <el-col :span="4">
            <el-form-item
              label="产品品类"
              prop="categoryId"
              :rules="[
                { required: true, message: '请选择产品品类', trigger: 'blur' },
              ]"
            >
              <el-select
                v-model="form.categoryId"
                placeholder="请选择"
                filterable
                :disabled="disabled"
              >
                <el-option
                  v-for="item in modelList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="通讯方式"
              prop="instrumentModel.communicationType1"
            >
              <el-select
                v-model="form.instrumentModel.communicationType1"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in dicts_communication_type"
                  :key="item.dictValue"
                  :label="item.dictValue"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="协议" prop="instrumentModel.agreement">
              <el-select
                v-model="form.instrumentModel.agreement"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in dicts_agreement"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="单位" prop="instrumentModel.unit">
              <el-select
                v-model="form.instrumentModel.unit"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in dicts_unit"
                  :key="item.dictValue"
                  :label="item.dictValue"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="电压" prop="instrumentModel.voltage">
              <el-select
                v-model="form.instrumentModel.voltage"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in dicts_voltage"
                  :key="item.dictValue"
                  :label="item.dictValue"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Logo界面" prop="instrumentModel.logo">
              <el-select
                v-model="form.instrumentModel.logo"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in dicts_logo"
                  :key="item.dictValue"
                  :label="item.dictValue"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="限流门限"
              prop="instrumentModel.currentlimiting"
            >
              <el-select
                v-model="form.instrumentModel.currentlimiting"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in dicts_currentlimiting"
                  :key="item.dictValue"
                  :label="item.dictValue"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="欠压门限" prop="instrumentModel.undervoltage">
              <el-select
                v-model="form.instrumentModel.undervoltage"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in dicts_undervoltage"
                  :key="item.dictValue"
                  :label="item.dictValue"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="描述:" prop="desc" v-if="form.id">
              <el-input
                style="width: 384px"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 8 }"
                v-model="form.desc"
                placeholder="仪表描述"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item v-if="form.id" label="型号" prop="name">
              <el-input v-model="form.name" placeholder="型号" />
            </el-form-item>
            <el-form-item
              label="控制器接头"
              prop="instrumentModel.controllerJoint"
            >
              <el-select
                v-model="form.instrumentModel.controllerJoint"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in dicts_controller_joint"
                  :key="item.dictValue"
                  :label="item.dictValue"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="电量计算" prop="instrumentModel.power">
              <el-select
                v-model="form.instrumentModel.power"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in dicts_power"
                  :key="item.dictValue"
                  :label="item.dictValue"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item
              label="限速（km/h）"
              prop="instrumentModel.speedLimit"
            >
              <el-input
                type="number"
                v-model="form.instrumentModel.speedLimit"
                placeholder="限速（km/h）"
              />
            </el-form-item>

            <el-form-item label="默认档位" prop="instrumentModel.defaultGear">
              <el-input
                v-model="form.instrumentModel.defaultGear"
                type="number"
                placeholder="默认档位"
              />
            </el-form-item>
            <el-form-item label="最高档位" prop="instrumentModel.maxGear">
              <el-input
                v-model="form.instrumentModel.maxGear"
                placeholder="最高档位"
              />
            </el-form-item>
            <el-form-item
              label="背光亮度"
              prop="instrumentModel.backlightBrightness"
            >
              <el-input
                type="number"
                v-model="form.instrumentModel.backlightBrightness"
                placeholder="背光亮度"
                v-minMaxValue="{ min: 1, max: 5 }"
              />
            </el-form-item>
            <el-form-item
              label="高速蜂鸣器提醒"
              prop="instrumentModel.highSpeedBuzzerRemind"
            >
              <el-input
                v-model="form.instrumentModel.highSpeedBuzzerRemind"
                placeholder="高速蜂鸣器提醒"
              />
            </el-form-item>
            <el-form-item
              :class="{ 'posi-left': form.id }"
              label="其它配置"
              prop="instrumentModel.ortherConfig"
            >
              <el-select
                v-model="form.instrumentModel.ortherConfig"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in dicts_ortherConfig"
                  :key="item.dictValue"
                  :label="item.dictValue"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="ERP编码:" prop="erp" v-if="form.id">
              <el-input v-model="form.erp" placeholder="ERP编码" />
            </el-form-item>
            <el-form-item
              label="不含头出线线长"
              prop="instrumentModel.notControllerJointString"
            >
              <el-input
                maxlength="10"
                oninput="value=value.replace(/^\.+|[^\d.]/g,'')"
                v-model="form.instrumentModel.notControllerJointString"
                placeholder="不含头控制器出线线长"
              />
            </el-form-item>
            <el-form-item label="测速磁钢数" prop="instrumentModel.speedSteel">
              <el-input
                oninput="value=value.replace(/^\.+|[^\d.]/g,'')"
                v-model="form.instrumentModel.speedSteel"
                placeholder="测速磁钢数"
              />
            </el-form-item>
            <el-form-item
              label="轮径（寸）"
              prop="instrumentModel.wheelDiameter"
            >
              <el-input
                type="number"
                @input="changeCountPerimeter"
                v-model="form.instrumentModel.wheelDiameter"
                placeholder="轮径（寸）"
              />
            </el-form-item>

            <el-form-item label="周长（mm）" prop="instrumentModel.perimeter">
              <el-input
                oninput="value=value.replace(/^\.+|[^\d.]/g,'')"
                v-model="form.instrumentModel.perimeter"
                placeholder="周长（mm）"
              />
            </el-form-item>
            <el-form-item
              label="自动关机时间"
              prop="instrumentModel.shutdownTime"
            >
              <el-input
                type="number"
                v-model="form.instrumentModel.shutdownTime"
                placeholder="自动关机时间"
                v-minMaxValue="{ min: 0, max: 99 }"
              >
              </el-input>
            </el-form-item>
            <el-form-item
              label="通讯方式"
              prop="instrumentModel.communicationType2"
            >
              <el-input
                v-model="form.instrumentModel.communicationType2"
                placeholder="通讯方式"
              />
            </el-form-item>
            <el-form-item
              label="蜂鸣器开关"
              prop="instrumentModel.buzzerSwitch"
            >
              <el-input
                v-model="form.instrumentModel.buzzerSwitch"
                placeholder="蜂鸣器开关"
              />
            </el-form-item>
            <el-form-item
              label="助力开始磁钢数"
              prop="assistStartMagnetNumber"
              :class="{ 'posi-left': form.id }"
            >
              <el-input
                type="number"
                v-minMaxValue="{ min: 2, max: 64 }"
                v-model="form.instrumentModel.assistStartMagnetNumber"
                placeholder="助力开始磁钢数"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="缓启动" prop="slowStart">
              <el-input
                type="number"
                v-minMaxValue="{ min: 0, max: 3 }"
                v-model="form.instrumentModel.slowStart"
                placeholder="缓启动"
              />
            </el-form-item>

            <el-form-item label="助力限速" prop="assistSpeedLimitThreshold">
              <el-input
                type="number"
                v-minMaxValue="{ min: 10, max: 41 }"
                v-model="form.instrumentModel.assistSpeedLimitThreshold"
                placeholder="助力限速"
              />
            </el-form-item>
            <el-form-item label="电量变化时间" prop="batteryVoltageChangeTime">
              <el-input
                type="number"
                v-minMaxValue="{ min: 1, max: 60 }"
                v-model="form.instrumentModel.batteryVoltageChangeTime"
                placeholder="电量显示变化时间"
              />
            </el-form-item>

            <el-form-item label="总线故障超时" prop="busOvertime">
              <el-input
                type="number"
                v-minMaxValue="{ min: 5, max: 255 }"
                v-model="form.instrumentModel.busOvertime"
                placeholder="总线故障超时"
              />
            </el-form-item>
            <el-form-item label="速度平滑等级" prop="smoothLevel">
              <el-input
                type="number"
                v-minMaxValue="{ min: 0, max: 10 }"
                v-model="form.instrumentModel.smoothLevel"
                placeholder="速度平滑等级"
              />
            </el-form-item>
            <el-form-item label="助力比例" prop="assistPercentage">
              <el-input
                type="number"
                v-minMaxValue="{ min: 0, max: 255 }"
                v-model="form.instrumentModel.assistPercentage"
                placeholder="助力比例"
              />
            </el-form-item>
            <el-form-item label="车名" prop="ebikeName">
              <el-select
                v-model="form.instrumentModel.ebikeName"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in dicts_ebike"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="车型" prop="carModel">
              <el-input
                maxlength="2"
                v-model="form.instrumentModel.carModel"
                placeholder="车型"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="电机功率" prop="motorSys">
              <el-input
                type="number"
                v-minMaxValue="{ min: 0, max: 999 }"
                v-model="form.instrumentModel.motorSys"
                placeholder="电机功率"
              />
            </el-form-item>
            <el-form-item label="电池容量" prop="batteryCap">
              <el-input
                type="number"
                v-minMaxValue="{ min: 0, max: 9999 }"
                v-model="form.instrumentModel.batteryCap"
                placeholder="电池容量"
              />
            </el-form-item>
            <el-form-item label="显示轮径" prop="showWheelsize">
              <el-input
                type="number"
                v-minMaxValue="{ min: 0, max: 999 }"
                v-model="form.instrumentModel.showWheelsize"
                placeholder="显示轮径"
              />
            </el-form-item>
            <el-form-item label="车轮宽度" prop="tiresSize">
              <el-input
                type="number"
                v-minMaxValue="{ min: 0, max: 99 }"
                v-model="form.instrumentModel.tiresSize"
                placeholder="车轮宽度"
              />
            </el-form-item>

            <el-form-item label="转把分档" prop="rotateHandle">
              <el-radio v-model="form.instrumentModel.rotateHandle" label="0"
                >不分</el-radio
              >
              <el-radio v-model="form.instrumentModel.rotateHandle" label="1"
                >分</el-radio
              >
            </el-form-item>
            <el-form-item label="转把限速" prop="rotateHandleSpeedLimit">
              <div class="flex padding-top-xs">
                <el-radio
                  v-model="form.instrumentModel.rotateHandleSpeedLimit"
                  label="0"
                  >正常</el-radio
                >
                <el-radio
                  v-model="form.instrumentModel.rotateHandleSpeedLimit"
                  label="1"
                  >限速6Km</el-radio
                >
              </div>
            </el-form-item>
            <el-form-item label="开机密码" prop="instrumentModel.startupPasswd">
              <el-radio v-model="form.instrumentModel.startupPasswd" :label="0"
                >NO</el-radio
              >
              <el-radio v-model="form.instrumentModel.startupPasswd" :label="1"
                >YES</el-radio
              >
            </el-form-item>
            <el-form-item label="定速巡航功能" prop="instrumentModel.cruise">
              <el-radio v-model="form.instrumentModel.cruise" :label="0"
                >NO</el-radio
              >
              <el-radio v-model="form.instrumentModel.cruise" :label="1"
                >YES</el-radio
              >
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="蓝牙" prop="instrumentModel.bluetooth">
              <el-radio v-model="form.instrumentModel.bluetooth" :label="0"
                >NO</el-radio
              >
              <el-radio v-model="form.instrumentModel.bluetooth" :label="1"
                >YES</el-radio
              >
            </el-form-item>
            <el-form-item label="菜单密码" prop="instrumentModel.menuPasswd">
              <el-radio v-model="form.instrumentModel.menuPasswd" :label="0"
                >NO</el-radio
              >
              <el-radio v-model="form.instrumentModel.menuPasswd" :label="1"
                >YES</el-radio
              >
            </el-form-item>
            <el-form-item label="USB" prop="instrumentModel.usb">
              <el-radio v-model="form.instrumentModel.usb" :label="0"
                >NO</el-radio
              >
              <el-radio v-model="form.instrumentModel.usb" :label="1"
                >YES</el-radio
              >
            </el-form-item>
            <el-form-item label="蜂鸣器" prop="instrumentModel.buzzer">
              <el-radio v-model="form.instrumentModel.buzzer" :label="0"
                >NO</el-radio
              >
              <el-radio v-model="form.instrumentModel.buzzer" :label="1"
                >YES</el-radio
              >
            </el-form-item>

            <el-form-item label="APP" prop="instrumentModel.app">
              <el-radio v-model="form.instrumentModel.app" :label="0"
                >NO</el-radio
              >
              <el-radio v-model="form.instrumentModel.app" :label="1"
                >YES</el-radio
              >
            </el-form-item>
            <el-form-item label="推车助力" prop="instrumentModel.driveAssist">
              <el-radio v-model="form.instrumentModel.driveAssist" :label="0"
                >NO</el-radio
              >
              <el-radio v-model="form.instrumentModel.driveAssist" :label="1"
                >YES</el-radio
              >
            </el-form-item>

            <el-form-item label="助力正反" prop="instrumentModel.assist">
              <el-radio v-model="form.instrumentModel.assist" :label="0"
                >正</el-radio
              >
              <el-radio v-model="form.instrumentModel.assist" :label="1"
                >反</el-radio
              >
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div
        class="flex align-center"
        v-if="!form.id"
        style="height: 173px; overflow-y: scroll"
      >
        <div>同配推荐：</div>
        <div class="flex-sub margin-left-xs">
          <el-card style="min-height: 120px">
            <el-button
              :class="{ 'margin-left-xs': i == 0 }"
              class="margin-bottom-xs"
              v-for="(pg, i) in selectList"
              :key="i + 'q'"
              @click="getDetail(pg)"
              >{{ pg.computerName }}</el-button
            >
          </el-card>
        </div>
      </div>

      <div slot="footer" class="dialog-footer flex justify-between">
        <div class="flex">
          <el-upload
            action=""
            class="upload-demo"
            ref="upload"
            :on-change="handleChange"
            :auto-upload="false"
            :show-file-list="false"
          >
            <el-button type="warning"> 导入 </el-button>
          </el-upload>
          <el-button type="info" class="margin-left-xs" @click="exportForm"
            >导出</el-button
          >
        </div>
        <div>
          <el-button type="primary" @click="submitForm" v-if="form.id">
            修改
          </el-button>
          <el-button type="primary" @click="submitOpen" v-else>
            确定
          </el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="false"
      title="添加品类"
      :visible.sync="open"
      width="540px"
      append-to-body
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="150px"
        @submit.native.prevent
      >
        <el-form-item
          label="型号:"
          prop="name"
          :rules="[
            {
              required: true,
              message: '型号',
              trigger: 'blur',
            },
          ]"
        >
          <el-input v-model="form.name" placeholder="仪表型号" />
        </el-form-item>

        <el-form-item label="ERP编码" prop="erp">
          <el-input v-model="form.erp" placeholder="ERP编码" />
        </el-form-item>
        <el-form-item label="描述" prop="desc" style="width: 100%">
          <el-input
            type="textarea"
            :autosize="{ minRows: 5, maxRows: 8 }"
            v-model="form.desc"
            placeholder="仪表描述"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  selectComputer,
  addComputer,
  editComputer,
  detailComputer,
} from "@/api/third/computer";

import { typeCategory } from "@/api/third/category";
import mixin from "./export";
export default {
  mixins: [mixin],
  data() {
    return {
      step: 1,
      modelList: [],
      selectList: [],
      dialogVisible: false,
      open: false,
      // 表单参数
      form: { instrumentModel: { backlightBrightness: "", shutdownTime: "" } },
      title: "",
      disabled: false,
      // 表单校验
      rules: {},
      dicts_controller_joint: [],
      dicts_communication_type: [],
      dicts_unit: [],
      dicts_agreement: [],
      dicts_voltage: [],
      dicts_controller_joint: [],
      dicts_power: [],
      dicts_logo: [],
      dicts_currentlimiting: [],
      dicts_undervoltage: [],
      dicts_ortherConfig: [],
      dicts_ebike: [],
    };
  },

  watch: {
    dialogVisible(val) {
      if (val) {
        this.step = 1;
        this.getList();
      }
    },
    form: {
      handler: function (nowVal, oldVal) {
        if (!nowVal.id) {
          selectComputer(this.form).then((res) => {
            this.selectList = res.data;
          });
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.reset();
    this.getOptions();
  },
  methods: {
    getList() {
      typeCategory().then((res) => {
        this.modelList = res.data;
      });
    },
    getOptions() {
      //仪表控制器接头
      this.getDicts("instrument_controller_joint").then((res) => {
        this.dicts_controller_joint = res.data;
      });
      //仪表通讯方式1
      this.getDicts("instrument_communication_type_1").then((res) => {
        this.dicts_communication_type = res.data;
      });
      //仪表协议
      this.getDicts("instrument_agreement").then((res) => {
        this.dicts_agreement = res.data;
      });
      //仪表电压
      this.getDicts("instrument_voltage").then((res) => {
        this.dicts_voltage = res.data;
      });
      //仪表单位
      this.getDicts("instrument_unit").then((res) => {
        this.dicts_unit = res.data;
      });
      //仪表电量计算
      this.getDicts("instrument_power").then((res) => {
        this.dicts_power = res.data;
      });
      //仪表LOGO界面
      this.getDicts("instrument_logo").then((res) => {
        this.dicts_logo = res.data;
      });

      //仪表限流门限
      this.getDicts("instrument_currentlimiting").then((res) => {
        this.dicts_currentlimiting = res.data;
      });
      //仪表欠压门限
      this.getDicts("instrument_undervoltage").then((res) => {
        this.dicts_undervoltage = res.data;
      });
      //其它配置
      this.getDicts("instrument_ortherConfig").then((res) => {
        this.dicts_ortherConfig = res.data;
      });
      //车名
      this.getDicts("instrument_ebike_name").then((res) => {
        this.dicts_ebike = res.data;
      });
    },
    //查看同配详情
    getDetail(row) {
      detailComputer(row.computerId).then((res) => {
        let { data } = res;
        delete data.id;
        if (data.instrumentModel) {
          delete data.instrumentModel.id;
        }
        //删除分类id
        if (this.form.categoryId) {
          if (this.form.categoryId && data.categoryId) {
            delete data.categoryId;
          }
        }
        this.resetForm("queryForm");
        let val = Object.assign(this.form, data);

        this.$set(this, "form", val);
      });
    },
    // 表单重置
    reset() {
      this.disabled = false;
      this.resetForm("form");
      this.form = {
        categoryId: null,
        desc: null,
        erp: null,
        name: null,
        instrumentModel: {
          agreement: null,
          app: null,
          assist: null,
          backlightBrightness: null,
          bluetooth: null,
          buzzer: null,
          buzzerSwitch: null,
          category: null,
          categoryId: null,
          communicationType1: null,
          communicationType2: null,
          configVersion: null,
          controllerJoint: null,
          createBy: null,
          createTime: null,
          cruise: null,
          currentlimiting: null,
          defaultGear: null,
          driveAssist: null,
          highSpeedBuzzerRemind: null,
          logo: null,
          maxGear: null,
          menuPasswd: null,
          notControllerJointString: null,
          ortherConfig: null,
          perimeter: null,
          power: null,
          shutdownTime: null,
          speedLimit: null,
          speedSteel: null,
          startupPasswd: null,
          undervoltage: null,
          unit: null,
          usb: null,
          voltage: null,
          wheelDiameter: null,
          rotateHandle: null,
          rotateHandleSpeedLimit: null,
          slowStart: null,
          assistSpeedLimitThreshold: null,
          batteryVoltageChangeTime: null,
          busOvertime: null,
          smoothLevel: null,
          assistPercentage: null,
          ebikeName: null,
          motorSys: null,
          batteryCap: null,
          showWheelsize: null,
          carModel: null,
          assistStartMagnetNumber: null,
        },
      };
    },
    //填写轮径，自动计算周长，判断条件是周长有没有赋值
    changeCountPerimeter(val) {
      // let { instrumentModel } = this.form;
      this.form.instrumentModel.perimeter = parseInt(3.14 * val * 25.4);
    },
    handleFleetnessAdd() {
      this.open = true;
    },
    handleNext() {
      let { step } = this;
      this.step = step == 1 ? 2 : 1;
    },
    submitOpen() {
      if (this.form.categoryId) {
        this.open = true;
      }
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id) {
            editComputer(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            addComputer(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("添加成功");
                this.dialogVisible = false;
                this.$parent.getList();
                this.open = false;
              }
            });
          }
        }
      });
    },
  },
};
</script>

<style lang="scss" scope>
.dispaly {
  display: none;
}
.form-data-in {
  .el-radio {
    // margin-right: 28px;
  }
  .el-input-number .el-input__inner {
    text-align: left;
  }
}
.posi-left {
  position: relative;
  right: -253px;
}
</style>
