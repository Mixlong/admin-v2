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
