export default {
  data() {
    return {
      // 客退清单
      returnList: [],
      // 现象复测值
      againCheckResultData: {
        0: "APP问题",
        1: "按键问题",
        2: "大灯故障",
        3: "故障代码",
        4: "光敏不良",
        5: "开关机不良",
        6: "屏幕问题",
        7: "软件功能问题",
        8: "数码管不良",
        9: "外观不良",
        10: "外壳不良",
        11: "线缆不良",
        12: "未复现",
        13: "其它问题"
      },
      // 分类处理
      classificationData: {
        0: "简单问题，售后维修",
        1: "复杂问题，研发定位",
        2: "无问题，退回客户",
      },
    };
  },
  created() {},
  methods: {
    async getReturnList() {
      try {
        const { data } = await this.getDicts("sys_return_list");
        this.returnList = data;
      } catch (error) {
        console.error(error);
      }
    },
  },
};
