<template>
  <select-loadMore
    v-model="categoryId"
    :value="value"
    :disabled="disabled"
    :data="categoryData.data"
    :page="categoryData.page"
    :hasMore="categoryData.more"
    :dictLabel="dictLabel"
    :dictValue="dictValue"
    :moreParams="moreParams"
    :request="getCategoryList"
    placeholder="请选择品类"
    style="width: 100%"
    @change="getChange"
  />
</template>

<script>
import { listCategory } from "@/api/third/category";
export default {
  name: "ModelCategory",
  props: {
    value: {
      type: String,
      default: "",
    },
    dictLabel: {
      type: String,
      default: "label",
    },
    dictValue: {
      type: String,
      default: "value",
    },
    moreParams: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      categoryData: {
        data: [],
        page: 1,
        more: true,
      },
      categoryId: this.value,
    };
  },
  methods: {
    getCategoryList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        listCategory({
          p: page,
          key: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.categoryData.data = [...this.categoryData.data, ...list];
          } else {
            this.categoryData.data = list;
          }
          this.categoryData.more = pageNum * pageSize < total;
          this.categoryData.page = pageNum;
          resolve();
        });
      });
    },
    getChange(e) {
      if (this.moreParams) {
        this.$emit("getChange", e);
      } else {
        this.$emit("input", e);
      }
    },
  },
};
</script>
