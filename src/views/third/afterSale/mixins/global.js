export default {
  data() {
    return {
      // 客退清单
      returnList: []
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
    }
  },
};
