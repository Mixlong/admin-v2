import { categoryComputerDict, categoryNameList } from "@/api/third/fileConfig";
import { listCustomer } from "@/api/third/sample";

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
      sleepTimeList: [...Array(11)].map((v, i) => i),
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
      assistLimitData: [...Array(90)].map((v, i) => i + 10),
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
      canRateList: {
        0: "100",
        1: "125",
        2: "150",
        3: "200",
        4: "250",
        5: "300",
        6: "400",
        7: "500",
        8: "600",
        9: "900",
      },
      baudRateList: [
        1200, 2400, 4800, 9600, 14400, 19200, 38400, 43000, 57600, 76800,
        115200, 128000,
      ],
    };
  },
  created() {
    // 品类
    this.getCategoryComputerDict();
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
    changeCategory(name) {
      if (name) {
        this.product = name;
        const data = this.dictList.filter((item) => item.name === name);
        this.computerOptions = data[0].computerList;
        this.handleQuery();
      } else {
        this.computerOptions = [];
      }
    },
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = true;
        categoryNameList({ name, categoryName: this.product })
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
  },
};
