export default {
  data() {
    return {
      // 客退清单
      returnList: [],
      // 现象复测值
      againCheckResultData: {},
      // 分类处理
      classificationData: {
        0: "简单问题，售后维修",
        1: "复杂问题，研发定位",
        2: "无问题，退回客户",
      },
    };
  },
  created() {
    // 复测结果
    this.getConfigDicts('sys_againCheck_result', 'againCheckResultData')
  },
  methods: {
    async getReturnList() {
      try {
        const { data } = await this.getDicts("sys_return_list");
        this.returnList = data;
      } catch (error) {
        console.error(error);
      }
    }
  }
};
