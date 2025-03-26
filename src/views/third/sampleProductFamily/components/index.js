import {
  listFileConfig,
  categoryComputerDict,
  stsEditFileConfig,
} from "@/api/third/fileConfig";
import { listCustomer } from "@/api/third/sample";

import Axios from "axios";
import { scrollTo } from "@/utils/scroll-to";

export default {
  data() {
    // 背光亮度
    const validateBacklightBrightness = (rule, value, callback) => {
      if (!Number.isInteger(+value)) {
        callback(new Error("请输入数字值"));
      } else if (+value < 0) {
        callback("背光亮度不能小于0");
      } else if (+value > 6) {
        callback("背光亮度不能大于6");
      } else {
        callback();
      }
    };

    // 背光亮度
    const validateSleepTime = (rule, value, callback) => {
      if (!Number.isInteger(+value)) {
        callback(new Error("请输入数字值"));
      } else if (+value < 0) {
        callback("休眠时间不能小于0");
      } else if (+value > 10) {
        callback("休眠时间不能大于10");
      } else {
        callback();
      }
    };

    // 系统电压
    const validateVoltage = (rule, value, callback) => {
      console.log(value);
      if (!this.dicts_voltage.includes(value)) {
        callback(new Error("系统电压不在可选值范围内"));
      } else {
        callback();
      }
    };

    // 欠压门限
    const validateUnderVoltage = (rule, value, callback) => {
      if (+value < 0) {
        callback("欠压门限不能小于0");
      } else if (+value > 99.9) {
        callback("欠压门限不能大于99.9");
      } else {
        callback();
      }
    };

    // 轮径
    const validateWheelDiameter = (rule, value, callback) => {
      const wheelDiameterKeys = Object.keys(this.wheelDiameterData);
      if (!wheelDiameterKeys.includes(value)) {
        callback(new Error("请重新选择轮径值"));
      } else {
        callback();
      }
    };

    // 周长
    const validatePerimeter = (rule, value, callback) => {
      if (!Number.isInteger(+value)) {
        callback(new Error("请输入数字值"));
      } else if (+value < 0) {
        callback("周长不能小于0");
      } else if (+value > 9999) {
        callback("周长不能大于9999");
      } else {
        callback();
      }
    };
    return {
      isUploadFlag: false,
      visible: false,
      confirmLoading: false,
      queryParams: {
        categoryId: "",
        computerId: "",
      },
      keyTypeList: {
        2: {
          keyTitle: "2键",
          keyList: ["上键", "下键"],
        },
        3: {
          keyTitle: "3键",
          keyImgFlag: "DTK3_",
          keyErrImgFlag: "DTK3_Err",
          keyList: ["上(-)键", "中(+)键", "下(开机)键"],
        },
        4: {
          keyTitle: "4键",
          keyList: ["开机键", "上", "下", "左", "右"],
        },
        5: {
          keyTitle: "5键",
          keyImgFlag: "key",
          keyErrImgFlag: "keyErr",
          keyList: ["上(+)键", "中(开机)键", "下(-)键", "左键", "右键"],
        },
        6: {
          keyTitle: "6键",
          keyList: ["上", "中", "下", "左", "右"],
        },
        7: {
          keyTitle: "7键",
          keyImgFlag: "DTK7_",
          keyErrImgFlag: "DTK7_Err",
          keyList: [
            "+键",
            "中(电源键)",
            "-键",
            "左键",
            "右键",
            "左上键",
            "左下键",
          ],
        },
      },
      keySortList: [
        {
          keyLabel: "本地按键1",
          keyValue: 1,
          imgSrc: "BT1.png",
        },
        {
          keyLabel: "本地按键2",
          keyValue: 2,
          imgSrc: "BT2.png",
        },
        {
          keyLabel: "按键3",
          keyValue: 3,
          imgSrc: "DTK3.png",
        },
      ],
      formData: {
        instrumentModel: {
          backlightBrightness: "",
          sleepTime: "",
          voltage: "",
          powerGear: "",
          agreement: "",
          assist: "",
          assistStartMagnetNumber: "",
          assistPercentage: "",
          rotateHandle: "",
          rotateHandleSpeedLimit: "",
          slowStart: "",
          speedSteel: "",
          currentlimiting: "",
          undervoltage: "",
          assistLimit: "",
          wheelDiameter: "",
          perimeter: "",
          batteryVoltageChangeTime: "",
          allLineErrTimeOut: "",
          smoothLevel: "",
          unit: "",
          bluetooth: "",
          power: "",
          driveAssist: "",
          defaultGear: "",
          logo: "",
          highSpeedBuzzerRemind: "",
          startupPasswd: "",
          menuPasswd: "",
          factoryReset: "",
          ebikeName: "",
          motorSys: "",
          batteryCap: "",
          showWheelsize: "",
          tiresSize: "",
          carModel: "",
          turnOnPasswd: "",
          menuPassword: "",
          buzzerSwitch: "",
          cruise: "",
          serialLevel: "",
        },
      },
      deployForm: {
        categoryId: "",
        computerId: "",
        content: "",
        url: "",
      },
      rules: {
        categoryId: [
          { required: true, message: "所属品类不能为空", trigger: "change" },
        ],
        computerId: [
          { required: true, message: "仪表型号不能为空", trigger: "change" },
        ],
        content: [
          { required: true, message: "属性描述不能为空", trigger: "blur" },
        ],
        url: [{ required: true, message: "文件不能为空", trigger: "change" }],
        keyCode: [
          { required: true, message: "按键值不能为空", trigger: "blur" },
        ],
      },
      formRules: {
        "instrumentModel.backlightBrightness": [
          {
            validator: validateBacklightBrightness,
            trigger: ["blur", "change"],
          },
        ],
        "instrumentModel.sleepTime": [
          { validator: validateSleepTime, trigger: ["blur", "change"] },
        ],
        "instrumentModel.voltage": [
          { validator: validateVoltage, trigger: ["blur", "change"] },
        ],
        "instrumentModel.undervoltage": [
          { validator: validateUnderVoltage, trigger: ["blur", "change"] },
        ],
        "instrumentModel.wheelDiameter": [
          { validator: validateWheelDiameter, trigger: ["blur", "change"] },
        ],
        "instrumentModel.perimeter": [
          { validator: validatePerimeter, trigger: ["blur", "change"] },
        ],
      },
      dictList: [],
      computerOptions: [],
      //   背光亮度
      backlightBrightnessList: {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: "AUTO",
      },
      //   休眠时间
      sleepTimeList: [...Array(101)].map((v, i) => i),
      //   系统电压
      dicts_voltage: [24, 36, 48, 52, 60, 72],
      //   助力档位数
      powerGearData: [3, 4, 5, 9],
      // 缓启动参数
      slowStartData: [0, 1, 2, 3],
      // 测速磁钢数
      speedSteelData: [...Array(16)].map((v, i) => i),
      // 助力开始磁钢数
      assistStartMagnetNumberData: [...Array(63)].map((v, i) => i + 2),
      // 助力限速门限
      assistLimitData: [...Array(256)].map((v, i) => i),
      // 电量变化时间
      batteryVoltageChangeTimeData: [...Array(60)].map((v, i) => i + 1),
      // 速度平滑等级
      smoothLevelData: [...Array(11)].map((v, i) => i),
      // 总线故障超时时间
      allLineErrTimeOutData: [...Array(251)].map((v, i) => i + 5),
      // 轮径
      wheelDiameterData: {
        0: 16,
        1: 18,
        2: 20,
        3: 22,
        4: 24,
        5: 26,
        6: "700C",
        7: 28,
      },
      dicts_unit: {
        0: "公制",
        1: "英制",
      },
      dicts_agreement: {
        0: "KM5S",
        1: "锂电2号",
        2: "八方",
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
        0: "UART 3.3V",
        1: "UART 5V",
        2: "CAN",
      },
      dicts_ebike: {
        0: "Pace500",
        1: "Pace350",
        2: "Level",
        3: "Sinch",
        4: "Aventure",
        5: "Pace",
        6: "Sinch ST",
        7: "Pace500 V2",
        8: "Pace350 V2",
        9: "Soltera",
        10: "Soltera-7S",
        11: "Cruiser",
        12: "Level V2",
        13: "Sinch V2 ST",
        14: "Aventure V2",
        15: "Abound",
        16: "Aventure CN",
        17: "Sinch ST CN",
        18: "Sinch CN",
        19: "Aventure.2",
        20: "Pace350.3",
        21: "Pace500.3",
        22: "Level.3",
        23: "Sinch ST.2",
        24: "Soltera.2",
        25: "Level.2",
      },
      parallelism: {
        //待确认对应关系
        name: "name",
        communicationType1: "communication_type1",
        controllerJoint: "controller_joint",
        speedLimit: "speed_limit",
        maxGear: "max_gear",
        ortherConfig: "orther_config",
        notControllerJointString: "not_controller_joint_string",
        speedSteel: "speed_detect_magnet_number",
        shutdownTime: "shutdown_time",
        communicationType2: "communication_type2",
        usb: "usb",
        tiresSize: "tires_size",
        // buzzer: "buzzer",
        app: "app",
        //已明确对应关系
        undervoltage: "low_voltage_threshold",
        currentlimiting: "current_limit_threshold",
        wheelDiameter: "wheelsize",
        power: "electricity_method",
        unit: "display_unit",
        bluetooth: "has_ble_feature",
        backlightBrightness: "backlight_brightness",
        voltage: "system_voltage",
        assist: "assist_dir",
        perimeter: "peri_meter",
        agreement: "uart_protocol",
        driveAssist: "push_speed_func",
        defaultGear: "default_assist",
        logo: "logo",
        highSpeedBuzzerRemind: "limit_speed_beep",
        cruise: "cruise_enable_switch",
        startupPasswd: "power_on_password",
        menuPasswd: "menu_password",
        rotateHandle: "rotate_handle",
        rotateHandleSpeedLimit: "rotate_handle_speed_limit",
        slowStart: "slow_start",
        batteryVoltageChangeTime: "battery_voltage_change_time",
        smoothLevel: "smooth_level",
        assistPercentage: "assist_percentage",
        ebikeName: "ebike_name",
        motorSys: "motor_sys",
        batteryCap: "battery_cap",
        showWheelsize: "show_wheelsize",
        carModel: "car_model",
        assistStartMagnetNumber: "assist_start_magnet_number",
        allLineErrTimeOut: "bus_overtime",
        assistLimit: "assist_speed_limit_threshold",
        sleepTime: "sleep_time",
        powerGear: "assist_level",
        serialLevel: "uart_level",
        factoryReset: "res_factory_set",
        buzzerSwitch: "beep_switch",
        turnOnPasswd: "power_password_switch",
        menuPassword: "menu_password_switch",
      },
      deployRules: {
        categoryId: [
          { required: true, message: "所属品类不能为空", trigger: "change" },
        ],
        computerId: [
          { required: true, message: "仪表型号不能为空", trigger: "change" },
        ],
        content: [
          { required: true, message: "属性描述不能为空", trigger: "blur" },
        ],
        url: [{ required: true, message: "文件不能为空", trigger: "change" }],
      },
    };
  },
  computed: {
    isNoData() {
      return (key) => {
        return this.isUploadFlag && this.formData.instrumentModel[key] === "";
      };
    },
    inputWidth() {
      return "width: 120px";
    },
    inputValuesRules() {
      return ({ keyLabel }) => {
        return {
          required: true,
          message: `${keyLabel}不能为空`,
          trigger: "blur",
        };
      };
    },
  },
  watch: {
    "deployForm.url"(url) {
      if (url) {
        this.clearValidateItem("deployForm", "url");
      }
    },
  },
  created() {
    this.echoWheelDiameter();
    categoryComputerDict().then((res) => {
      this.dictList = res.data;
    });

    // 轮径
    for (let i = 8; i < 100; i++) {
      this.wheelDiameterData[i] = i * 0.5;
    }
  },
  mounted() {
    this.scrollToSavePosition();
    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("scrollPosition", window.scrollY);
    });
  },
  beforeRouteLeave(to, from, next) {
    sessionStorage.removeItem("scrollPosition");
    next();
  },
  methods: {
    // 客户
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
    scrollToSavePosition() {
      const savePostion = sessionStorage.getItem("scrollPosition");

      if (savePostion) {
        scrollTo(savePostion);

        sessionStorage.removeItem("savePostion");
      }
    },
    changeCountPerimeter(wheelDiameter) {
      let wheelDiameterVal = null;
      if (wheelDiameter === "6") {
        wheelDiameterVal = 27.5;
      } else {
        wheelDiameterVal = this.wheelDiameterData[wheelDiameter];
      }
      this.formData.instrumentModel.perimeter = parseInt(
        wheelDiameterVal * 25.4 * 3.14
      );
    },
    echoWheelDiameter() {
      const wheelDiameter = this.formData.instrumentModel.wheelDiameter;
      if (wheelDiameter) {
        this.formData.instrumentModel.perimeter = parseInt(
          wheelDiameter * 25.4 * 3.14
        );
      }
    },
    resetSetFile() {
      this.isUploadFlag = false;
      this.formData.instrumentModel = {
        backlightBrightness: "",
        sleepTime: "",
        voltage: "",
        powerGear: "",
        agreement: "",
        assist: "",
        assistStartMagnetNumber: "",
        assistPercentage: "",
        rotateHandle: "",
        rotateHandleSpeedLimit: "",
        slowStart: "",
        speedSteel: "",
        currentlimiting: "",
        undervoltage: "",
        assistLimit: "",
        wheelDiameter: "",
        perimeter: "",
        batteryVoltageChangeTime: "",
        allLineErrTimeOut: "",
        smoothLevel: "",
        unit: "",
        bluetooth: "",
        power: "",
        driveAssist: "",
        defaultGear: "",
        logo: "",
        highSpeedBuzzerRemind: "",
        startupPasswd: "",
        menuPasswd: "",
        factoryReset: "",
        ebikeName: "",
        motorSys: "",
        batteryCap: "",
        showWheelsize: "",
        tiresSize: "",
        carModel: "",
        turnOnPasswd: "",
        menuPassword: "",
        buzzerSwitch: "",
        cruise: "",
        serialLevel: "",
      };
    },
    convertIniToJson(content) {
      let ints = new Uint8Array(content);
      const snippets = new TextDecoder("gb2312").decode(ints);
      const objVal = this.parseINI(snippets);
      const { parallelism } = this;

      for (let parentKey in objVal) {
        for (let childKey in parallelism) {
          if (parallelism[childKey] === parentKey) {
            let parVal = objVal[parallelism[childKey]];
            if (childKey === "undervoltage" && parVal !== "") {
              objVal[parallelism[childKey]] = (+parVal + 20000) / 1000;
            }
            // 系统电压
            if (childKey === "voltage" && parVal !== "") {
              objVal[parallelism[childKey]] =
                this.dicts_voltage[parVal] || parVal;
            }
            // 背光亮度
            if (childKey === "backlightBrightness" && parVal !== "") {
              objVal[parallelism[childKey]] = +parVal;
            }
            // 助力开始磁钢数
            if (childKey === "assistStartMagnetNumber" && parVal !== "") {
              objVal[parallelism[childKey]] =
                this.assistStartMagnetNumberData[parVal];
            }
            // 休眠时间
            if (childKey === "sleepTime" && parVal !== "") {
              objVal[parallelism[childKey]] = this.sleepTimeList[parVal];
            }
            // 助力档位数
            if (childKey === "powerGear" && parVal !== "") {
              objVal[parallelism[childKey]] = this.powerGearData[parVal];
            }
            // 助力限速门限
            if (childKey === "assistLimit" && parVal !== "") {
              objVal[parallelism[childKey]] = this.assistLimitData[parVal];
            }
            // 电量变化时间
            if (childKey === "batteryVoltageChangeTime" && parVal !== "") {
              objVal[parallelism[childKey]] =
                this.batteryVoltageChangeTimeData[parVal];
            }
            // 总线故障超时时间
            if (childKey === "allLineErrTimeOut" && parVal !== "") {
              objVal[parallelism[childKey]] =
                this.allLineErrTimeOutData[parVal];
            }
            const childKeyList = [
              "agreement",
              "bluetooth",
              "driveAssist",
              "factoryReset",
              "rotateHandle",
              "buzzerSwitch",
              "cruise",
              "turnOnPasswd",
              "menuPassword",
              "rotateHandleSpeedLimit",
              "assist",
            ];
            // 蓝牙
            if (childKeyList.includes(childKey) && parVal !== "") {
              objVal[parallelism[childKey]] = +parVal;
            }

            this.formData.instrumentModel[childKey] =
              objVal[parallelism[childKey]];
          }
        }
      }
    },
    parseINI(data) {
      const regex = {
        section: /^\s*\s*([^]*)\s*\]\s*$/,

        param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,

        comment: /^\s*;.*$/,
      };

      const value = {};

      const lines = data.split(/\r\n|\r|\n/);

      let section = null;

      lines.forEach(function (line) {
        if (regex.comment.test(line)) {
          return;
        } else if (regex.param.test(line)) {
          var match = line.match(regex.param);
          if (section) {
            value[section][match[1]] = match[2];
          } else {
            value[match[1]] = match[2];
          }
        } else if (regex.section.test(line)) {
          // var match = line.match(regex.section);
          // value[match[1]] = {};
          // section = match[1];
        } else if (line.length == 0 && section) {
          section = null;
        }
      });

      return value;
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
          this.msgInfo("暂无配置文件");
        }
      });
    },
    handleFetchData(stsDeployFile) {
      Axios.get(stsDeployFile).then((res) => {
        this.formData = res.data;
      });
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
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.exportToJsonFile(this.formData, "配置文件.json");
        }
      });
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
    // 上传配置
    handleOk(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.confirmLoading = true;
          stsEditFileConfig({ ...this.deployForm, type: "config_file" })
            .then(() => {
              this.msgSuccess("配置上传成功");
              this.visible = false;
            })
            .finally(() => {
              this.confirmLoading = false;
            });
        }
      });
    },
  },
};
