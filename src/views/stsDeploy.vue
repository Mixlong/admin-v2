<template>
  <el-container>
    <el-header>配置文件生成器(STS)</el-header>
    <el-main>
      <el-card class="box-card" shadow="never">
        <div slot="header">
          <el-form :inline="true" :model="queryParams">
            <el-form-item label="所属品类" prop="categoryId">
              <el-select
                v-model="queryParams.categoryId"
                @change="changeCategory"
                filterable
                allow-create
                clearable
                placeholder="请选择品类"
              >
                <el-option
                  v-for="dict in dictList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="仪表型号" prop="computerId">
              <el-select
                filterable
                remote
                clearable
                v-model="queryParams.computerId"
                placeholder="请选择仪表型号"
              >
                <el-option
                  v-for="dict in computerOptions"
                  :key="dict.model"
                  :label="dict.name"
                  :value="dict.model"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-search"
                @click="handleQuery"
                >检索</el-button
              >
            </el-form-item>
          </el-form>
        </div>
        <el-form ref="form" :model="formData" label-width="124px">
          <el-row :gutter="10">
            <el-col :span="4">
              <el-form-item label="背光亮度">
                <el-select
                  v-model="formData.instrumentModel.backlightBrightness"
                  placeholder="请选择背光亮度"
                >
                  <el-option
                    v-for="item in backlightBrightnessList"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="休眠时间">
                <el-select
                  v-model="formData.instrumentModel.sleepTime"
                  placeholder="请选择休眠时间"
                >
                  <el-option
                    v-for="item in sleepTimeList"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
                <!-- <b class="margin-left-xs">min</b> -->
              </el-form-item>

              <el-form-item label="系统电压">
                <el-select
                  v-model="formData.instrumentModel.voltage"
                  placeholder="请选择系统电压"
                  @change="changeVoltage"
                >
                  <el-option
                    v-for="item in dicts_voltage"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
                <!-- <b class="margin-left-xs">V</b> -->
              </el-form-item>

              <el-form-item label="欠压门限">
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 99.9 }"
                  v-model="formData.instrumentModel.undervoltage"
                  placeholder="请输入欠压门限"
                />
              </el-form-item>

              <el-form-item label="助力档位数">
                <el-select
                  v-model="formData.instrumentModel.voltage"
                  placeholder="请选择助力档位数"
                >
                  <el-option
                    v-for="item in powerGearData"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="助力正反">
                <el-select
                  v-model="formData.instrumentModel.assist"
                  placeholder="请选择助力正反"
                >
                  <el-option
                    v-for="item in assistData"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                label="助力开始磁钢数"
                prop="assistStartMagnetNumber"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 2, max: 64 }"
                  v-model="formData.instrumentModel.assistStartMagnetNumber"
                  placeholder="请输入助力开始磁钢数"
                />
              </el-form-item>
              <el-form-item label="助力比例" prop="assistPercentage">
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 255 }"
                  v-model="formData.instrumentModel.assistPercentage"
                  placeholder="请输入助力比例"
                  clearable
                />
              </el-form-item>
              <el-form-item label="限流门限" prop="currentlimiting">
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 40 }"
                  v-model="formData.instrumentModel.currentlimiting"
                  placeholder="请输入限流门限"
                  clearable
                />
              </el-form-item>
              <el-form-item label="助力限速门限" prop="assistLimit">
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 99 }"
                  v-model="formData.instrumentModel.assistLimit"
                  placeholder="请输入助力限速门限"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="缓启动" prop="instrumentModel.slowStart">
                <el-select
                  v-model="formData.instrumentModel.slowStart"
                  placeholder="请选择缓启动"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="item in slowStartData"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="轮径" prop="instrumentModel.wheelDiameter">
                <el-select
                  v-model="formData.instrumentModel.wheelDiameter"
                  placeholder="请选择轮径"
                  filterable
                  allow-create
                  clearable
                >
                  <el-option
                    v-for="item in wheelDiameterData"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="周长" prop="instrumentModel.perimeter">
                <el-input
                  type="number"
                  readonly
                  v-model="formData.instrumentModel.perimeter"
                  placeholder="请输入周长"
                  clearable
                />
              </el-form-item>
              <el-form-item label="单位" prop="instrumentModel.unit">
                <el-select
                  v-model="formData.instrumentModel.unit"
                  placeholder="请选择单位"
                >
                  <el-option
                    v-for="(value, key) in dicts_unit"
                    :key="key"
                    :label="value"
                    :value="+key"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="协议" prop="instrumentModel.agreement">
                <el-select
                  v-model="formData.instrumentModel.agreement"
                  placeholder="请选择协议"
                >
                  <el-option
                    v-for="(value, key) in dicts_agreement"
                    :key="key"
                    :label="value"
                    :value="+key"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="电量计算" prop="instrumentModel.agreement">
                <el-select
                  v-model="formData.instrumentModel.power"
                  placeholder="请选择电量计算"
                >
                  <el-option
                    v-for="(value, key) in dicts_power"
                    :key="key"
                    :label="value"
                    :value="+key"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="测速磁钢数"
                prop="instrumentModel.speedSteel"
              >
                <el-select
                  v-model="formData.instrumentModel.speedSteel"
                  placeholder="请选择测速磁钢数"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="item in speedSteelData"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="电量变化时间"
                prop="batteryVoltageChangeTime"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 1, max: 60 }"
                  v-model="formData.instrumentModel.batteryVoltageChangeTime"
                  placeholder="电量显示变化时间"
                />
              </el-form-item>
              <el-form-item label="速度平滑等级" prop="smoothLevel">
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 10 }"
                  v-model="formData.instrumentModel.smoothLevel"
                  placeholder="速度平滑等级"
                />
              </el-form-item>
              <el-form-item label="总线故障超时时间" prop="allLineErrTimeOut">
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 5, max: 255 }"
                  v-model="formData.instrumentModel.allLineErrTimeOut"
                  placeholder="请输入总线故障超时时间"
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="车名" prop="ebikeName">
                <el-select
                  v-model="formData.instrumentModel.ebikeName"
                  placeholder="请选择车名"
                >
                  <el-option
                    v-for="(value, key) in dicts_ebike"
                    :key="key"
                    :label="value"
                    :value="+key"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="车型" prop="carModel">
                <el-input
                  maxlength="2"
                  v-model="formData.instrumentModel.carModel"
                  placeholder="车型"
                />
              </el-form-item>
              <el-form-item label="默认档位" prop="instrumentModel.defaultGear">
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 9 }"
                  v-model="formData.instrumentModel.defaultGear"
                  placeholder="请输入默认档位"
                />
              </el-form-item>
              <el-form-item label="Logo界面" prop="instrumentModel.logo">
                <el-select
                  v-model="formData.instrumentModel.logo"
                  placeholder="请选择Logo界面"
                >
                  <el-option
                    v-for="(value, key) in dicts_logo"
                    :key="key"
                    :label="value"
                    :value="+key"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="开机密码"
                prop="instrumentModel.startupPasswd"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 9999 }"
                  v-model="formData.instrumentModel.startupPasswd"
                  placeholder="请输入开机密码"
                />
              </el-form-item>

              <el-form-item label="电机功率" prop="motorSys">
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 999 }"
                  v-model="formData.instrumentModel.motorSys"
                  placeholder="请输入电机功率"
                />
              </el-form-item>
              <el-form-item label="电池容量" prop="batteryCap">
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 9999 }"
                  v-model="formData.instrumentModel.batteryCap"
                  placeholder="电池容量"
                />
              </el-form-item>
              <el-form-item
                label="串口通讯电平"
                prop="instrumentModel.serialLevel"
              >
                <el-select
                  v-model="formData.instrumentModel.serialLevel"
                  placeholder="请选择串口通讯电平"
                >
                  <el-option
                    v-for="(value, key) in serialLevelData"
                    :key="key"
                    :label="value"
                    :value="+key"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="高级菜单密码"
                prop="instrumentModel.menuPasswd"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 9999 }"
                  v-model="formData.instrumentModel.menuPasswd"
                  placeholder="请输入高级菜单密码"
                />
              </el-form-item>
              <el-form-item
                label="高速蜂鸣器提醒"
                prop="instrumentModel.highSpeedBuzzerRemind"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 99 }"
                  v-model="formData.instrumentModel.highSpeedBuzzerRemind"
                  placeholder="请输入高速蜂鸣器提醒"
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="显示轮径" prop="showWheelsize">
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 999 }"
                  v-model="formData.instrumentModel.showWheelsize"
                  placeholder="显示轮径"
                />
              </el-form-item>
              <el-form-item label="车轮宽度" prop="tiresSize">
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 99 }"
                  v-model="formData.instrumentModel.tiresSize"
                  placeholder="车轮宽度"
                />
              </el-form-item>
              <el-form-item label="蓝牙" prop="instrumentModel.bluetooth">
                <el-radio
                  v-model="formData.instrumentModel.bluetooth"
                  :label="1"
                >
                  YES
                </el-radio>
                <el-radio
                  v-model="formData.instrumentModel.bluetooth"
                  :label="0"
                >
                  NO
                </el-radio>
              </el-form-item>
              <el-form-item label="推车助力" prop="instrumentModel.driveAssist">
                <el-radio
                  v-model="formData.instrumentModel.driveAssist"
                  :label="1"
                >
                  YES
                </el-radio>
                <el-radio
                  v-model="formData.instrumentModel.driveAssist"
                  :label="0"
                >
                  NO
                </el-radio>
              </el-form-item>
              <el-form-item
                label="恢复出厂设置"
                prop="instrumentModel.factoryReset"
              >
                <el-radio
                  v-model="formData.instrumentModel.factoryReset"
                  :label="0"
                >
                  YES
                </el-radio>
                <el-radio
                  v-model="formData.instrumentModel.factoryReset"
                  :label="1"
                >
                  NO
                </el-radio>
              </el-form-item>
              <el-form-item label="转把分档" prop="rotateHandle">
                <el-radio
                  v-model="formData.instrumentModel.rotateHandle"
                  :label="1"
                >
                  YES
                </el-radio>
                <el-radio
                  v-model="formData.instrumentModel.rotateHandle"
                  :label="0"
                >
                  NO
                </el-radio>
              </el-form-item>
              <el-form-item
                label="蜂鸣器开关"
                prop="instrumentModel.buzzerSwitch"
              >
                <el-radio-group v-model="formData.instrumentModel.buzzerSwitch">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="定速巡航功能" prop="instrumentModel.cruise">
                <el-radio-group v-model="formData.instrumentModel.cruise">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="开机密码"
                prop="instrumentModel.turnOnPasswd"
              >
                <el-radio-group v-model="formData.instrumentModel.turnOnPasswd">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="菜单密码"
                prop="instrumentModel.menuPassword"
              >
                <el-radio-group v-model="formData.instrumentModel.menuPassword">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item
                label="转把限速"
                prop="instrumentModel.rotateHandleSpeedLimit"
              >
                <el-radio-group
                  v-model="formData.instrumentModel.rotateHandleSpeedLimit"
                >
                  <div class="flex">
                    <el-radio :label="0">正常</el-radio>
                    <el-radio :label="1">限速6Km</el-radio>
                  </div>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </el-main>
    <el-footer class="flex align-center justify-center">
      <el-upload
        class="margin-right-xs"
        action=""
        accept=".json"
        :on-change="handleChange"
        :auto-upload="false"
        :show-file-list="false"
      >
        <el-button size="mini" type="primary">导入配置</el-button>
      </el-upload>
      <el-button size="mini" type="primary">读取配置(STS)</el-button>
      <el-button size="mini" type="primary" @click="visible = true"
        >上传配置</el-button
      >
      <el-button size="mini" type="primary" @click="exportForm"
        >导出配置</el-button
      >
    </el-footer>


    <el-dialog title="上传配置" width="400px" :visible.sync="visible">
      <el-form ref="form" :model="deployForm" :rules="rules" label-width="80px">
        <el-form-item label="所属品类" prop="categoryId">
          <el-select
            v-model="deployForm.categoryId"
            @change="changeCategory"
            filterable
            allow-create
            clearable
            placeholder="请选择品类"
            style="width: 100%;"
          >
            <el-option
              v-for="dict in dictList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="仪表型号" prop="computerId">
          <el-select
            v-model="deployForm.computerId"
            filterable
            clearable
            placeholder="请选择仪表型号"
            style="width: 100%;"
          >
            <el-option
              v-for="dict in computerOptions"
              :key="dict.model"
              :label="dict.name"
              :value="dict.model"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="属性描述" prop="content">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 8 }"
            v-model="deployForm.content"
            placeholder="请输入文件描述"
          />
        </el-form-item>
        <el-form-item label="文件" prop="url">
          <DrUpload
            :limit="1"
            v-model="deployForm.url"
            :css="{ width: '100%' }"
            :isOnePic="1"
          >
            <div>
              <el-button size="small" type="primary">点击上传</el-button>
            </div>
          </DrUpload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="handleCancel">取 消</el-button>
        <el-button
          size="small"
          type="primary"
          @click="handleOk"
          :loading="confirmLoading"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </el-container>
</template>
<script>
import { listFileConfig, categoryComputerDict } from "@/api/third/fileConfig";
import Axios from "axios";
export default {
  data() {
    return {
      visible: false,
      confirmLoading: false,
      queryParams: {
        categoryId: "",
        computerId: "",
      },
      formData: {
        instrumentModel: {
          backlightBrightness: 5,
          sleepTime: 10,
          voltage: 48,
          powerGear: 5,
          agreement: 0,
          assist: 0,
          assistStartMagnetNumber: 2,
          assistPercentage: 128,
          rotateHandle: 0,
          rotateHandleSpeedLimit: 0,
          slowStart: 1,
          speedSteel: 1,
          currentlimiting: 12,
          undervoltage: 42,
          assistLimit: 25,
          wheelDiameter: 26,
          perimeter: "",
          batteryVoltageChangeTime: 30,
          allLineErrTimeOut: 10,
          smoothLevel: 4,
          unit: 0,
          bluetooth: 1,
          power: 2,
          driveAssist: 1,
          defaultGear: 9,
          logo: 0,
          highSpeedBuzzerRemind: 0,
          startupPasswd: 2020,
          menuPasswd: 2020,
          factoryReset: 0,
          ebikeName: "",
          motorSys: 500,
          batteryCap: "",
          showWheelsize: "",
          tiresSize: "",
          carModel: "",
          turnOnPasswd: 1,
          menuPassword: 1,
          buzzerSwitch: 1,
          cruise: 1,
        },
      },
      deployForm: {
        categoryId: "",
        computerId: "",
        content: "",
        url: "",
      },
      rules: {
        categoryId: [{ required: true,  message: "所属品类不能为空", trigger: "change" }],
        computerId: [{ required: true,  message: "仪表型号不能为空", trigger: "change" }],
        content: [{ required: true,  message: "属性描述不能为空", trigger: "blur" }],
        url: [{ required: true,  message: "文件不能为空", trigger: "change" }],
      },
      dictList: [],
      computerOptions: [],
      //   背光亮度
      backlightBrightnessList: [1, 2, 3, 4, 5],
      //   休眠时间
      sleepTimeList: [...Array(11)].map((v, i) => i),
      //   系统电压
      dicts_voltage: [24, 36, 48, 52, 60, 72],
      //   助力档位数
      powerGearData: [3, 4, 5, 6, 7, 8, 9],
      // 助力正反
      assistData: [
        {
          label: "助力正",
          value: 0,
        },
        {
          label: "助力反",
          value: 1,
        },
      ],
      // 缓启动参数
      slowStartData: [0, 1, 2, 3],
      // 测速磁钢数
      speedSteelData: [...Array(16)].map((v, i) => i),
      // 轮径
      wheelDiameterData: [16, 18, 20, 22, 24, 26, "700C", 27.5, 28],
      dicts_unit: {
        0: "公制",
        1: "英制",
      },
      dicts_agreement: {
        0: "KM5S",
        1: "锂电2号",
        2: "八方协议",
        3: "J协议",
      },
      dicts_power: {
        0: "控制器上报电压，仪表计算电量",
        1: "控制器上报电量",
        2: "仪表检查电压，仪表计算电量",
      },
      dicts_logo: {
        0: "迪太界面",
        1: "中性界面",
        2: "客户界面",
      },
      serialLevelData: {
        0: "3.3V",
        1: "5V",
      },
      dicts_ebike: {
        0: "Pace500",
        1: "Pace350",
        2: "Level",
        3: "Sinch",
        4: "Aventure",
        5: "Pace",
      },
    };
  },
  watch: {
    "formData.instrumentModel.wheelDiameter"(wheelDiameter) {
      console.log(wheelDiameter);

      if (!this.wheelDiameterData.includes(wheelDiameter)) {
        this.formData.instrumentModel.wheelDiameter =
          parseFloat(wheelDiameter) * 0.5;
      }
      if (wheelDiameter === "700C") wheelDiameter = 27.5;
      this.formData.instrumentModel.perimeter = wheelDiameter * 24.4 * 3.14;
    },
    "deployForm.url"(url) {
      if (url) {
        this.clearValidateItem("deployForm", "url");
      }
    },
  },
  created() {
    categoryComputerDict().then((res) => {
      this.dictList = res.data;
    });
    this.getOptions();
  },
  methods: {
    handleChange(file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const jsonData = JSON.parse(e.target.result);
        this.$message.success("文件解析成功");
        this.formData = jsonData;
        console.log(jsonData);
      };
      reader.readAsText(file.raw);
    },
    changeCategory(val) {
      if (!val) return;
      this.queryParams.computerId = "";
      this.computerOptions = this.dictList.filter(
        (item) => item.id === val
      )[0].computerList;
    },
    handleQuery() {
      listFileConfig({
        ...this.queryParams,
        type: "config_file",
      }).then((res) => {
        const { list } = res.data;
        const stsDeployFile = list[0]?.url;
        if (stsDeployFile) {
          this.handleFetchData(stsDeployFile);
        } else {
          this.$message.error("暂无配置文件");
        }
      });
    },
    handleFetchData(stsDeployFile) {
      Axios.get(stsDeployFile).then((res) => {
        console.log(res);
        this.formData = res.data;
      });
    },
    getOptions() {
      //仪表电压
      //   this.getDicts("instrument_voltage").then((res) => {
      //     this.dicts_voltage = res.data;
      //   });
    },
    changeVoltage(voltageVal) {
      let voltage = "";
      switch (voltageVal) {
        case 24:
          voltage = 22;
          break;
        case 36:
          voltage = 31.5;
          break;
        case 48:
          voltage = 42;
          break;
        case 52:
          voltage = 45;
          break;
        case 60:
          voltage = 54;
          break;
        case 72:
          voltage = 62;
          break;
      }
      this.formData.instrumentModel.undervoltage = voltage;
    },
    // 导出
    exportForm() {
      this.exportToJsonFile(this.formData, "配置文件.json");
    },
    exportToJsonFile(data, fileName) {
      const jsonData = JSON.stringify(data);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      link.click();

      URL.revokeObjectURL(url);
    },
  },
};
</script>
<style lang="scss" scoped>
.el-container {
  min-height: 100vh;
  background: #fff;

  .el-header {
    font-size: 20px;
    font-weight: bold;
  }

  .el-header,
  .el-footer {
    line-height: 60px;
    text-align: center;
  }
}
</style>