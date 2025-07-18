import { categoryComputerDict, categoryNameList, computerNameList } from "@/api/third/fileConfig";
import { listCustomer } from "@/api/third/sample";
import { getDicts } from "@/api/system/dict/data";

export default {
  data() {
    return {
      product: null,
      isCLoading: false,
      // 品类
      dictList: [],
      // 仪表型号
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
        0: "km/h",
        1: "mph",
      },
      dicts_agreement: {},
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
      // 车名
      dicts_ebike: {},
      // can波特率
      canRateList: {},
      // uart波特率
      baudRateList: {},
      // 按键型号
      dicts_keyType_list: {},
      // 通讯协议
      dicts_protocol_list: {},
    };
  },
  created() {
    // 品类
    this.getCategoryComputerDict();
    // 车名
    this.getConfigDicts("instrument_ebike_name", "dicts_ebike");
    // can波特率
    this.getConfigDicts("can_baud_rate", "canRateList");
    // uart波特率
    this.getConfigDicts("uart_baud_rate", "baudRateList");
    //仪表协议
    this.getConfigDicts("instrument_agreement", "dicts_agreement");
    // 按键型号
    this.getConfigDicts("STS_KEY_TYPE", "dicts_keyType_list");
    // 通讯协议
    this.getConfigDicts("sys_protocol", "dicts_protocol_list");

    // 轮径
    for (let i = 8; i < 100; i++) {
      this.wheelDiameterData[i] = i * 0.5;
    }
  },
  methods: {
    // 品类
    async getCategoryComputerDict() {
      try {
        const result = await categoryComputerDict();
        this.dictList = result.data;
      } catch (error) {
        console.log(error);
      }
    },
    changeCategory(name, isHandleQuery = true) {
      if (name) {
        this.product = name;
        const data = this.dictList.filter((item) => item.name === name);
        this.computerOptions = data[0].computerList;
        isHandleQuery && this.handleQuery();
      } else {
        this.computerOptions = [];
      }
    },
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = true;
        computerNameList({ name, categoryName: this.product })
          .then((res) => {
            this.computerOptions = res.data;
            this.isCLoading = false;
          })
          .catch(() => {
            this.isCLoading = false;
          });
      } else {
        this.computerOptions = [];
      }
    },
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
    // 配置字典
    getConfigDicts(dictName, currentData) {
      try {
        getDicts(dictName).then((res) => {
          const data = res.data;
          data.forEach(({ dictLabel, dictValue }) => {
            this[currentData][dictValue] = dictLabel;
          });
        });
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};
