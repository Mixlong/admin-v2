import { testProductList } from "@/api/third/testApi";

export default {
  data() {
    return {
      moduleData: {
        data: [],
        page: 1,
        more: true,
      },
    };
  },
  methods: {
    getModuleList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        testProductList({
          p: page,
          productType: keyword,
          status: 0
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.moduleData.data = [...this.moduleData.data, ...list];
          } else {
            this.moduleData.data = list;
          }
          this.moduleData.more = pageNum * pageSize < total;
          this.moduleData.page = pageNum;
          resolve();
        });
      });
    },
  },
};
