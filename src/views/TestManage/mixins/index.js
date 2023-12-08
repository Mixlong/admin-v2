/*
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-10-27 11:20:13
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2023-12-06 13:23:29
 * @FilePath: \FILECONF-UI\src\views\TestManage\mixins\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
