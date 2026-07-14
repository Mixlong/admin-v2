<template>
  <el-select
    v-model="internalValue"
    :placeholder="placeholder"
    :clearable="clearable"
    :filterable="filterable"
    :disabled="disabled"
    :loading="loading"
    @change="handleChange"
    @clear="handleClear"
  >
    <el-option
      v-for="item in categoryList"
      :key="item.id"
      :label="item.name"
      :value="returnId ? item.id : item.name"
    />
  </el-select>
</template>

<script>
import { typeCategory } from "@/api/third/category";

// 全局缓存品类数据，避免重复请求
let categoryCache = null;
let categoryPromise = null;

export default {
  name: "CategorySelect",
  props: {
    value: {
      type: [String, Number],
      default: "",
    },
    placeholder: {
      type: String,
      default: "请选择产品品类",
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    filterable: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    // 是否返回 id，默认返回 name
    returnId: {
      type: Boolean,
      default: false,
    },
    // 是否按品类名称排序
    sortByName: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      categoryList: [],
      loading: false,
    };
  },
  computed: {
    internalValue: {
      get() {
        // 如果没有值，直接返回
        if (!this.value) {
          return this.value;
        }

        // 如果列表还没加载，直接返回原值
        if (!this.categoryList || this.categoryList.length === 0) {
          return this.value;
        }

        // 智能识别：如果传入的是 id（数字），但需要显示 name
        if (!this.returnId && typeof this.value === 'number') {
          const category = this.categoryList.find((item) => item.id === this.value);
          return category ? category.name : this.value;
        }

        // 智能识别：如果传入的是 name（字符串），但需要显示 id
        if (this.returnId && typeof this.value === 'string') {
          const category = this.categoryList.find((item) => item.name === this.value);
          return category ? category.id : this.value;
        }

        // 其他情况直接返回
        return this.value;
      },
      set(val) {
        // 输出时根据 returnId 决定返回什么
        if (val) {
          const category = this.categoryList.find((item) =>
            this.returnId ? item.id === val : item.name === val
          );
          
          if (category) {
            // 返回用户期望的字段
            this.$emit("input", this.returnId ? category.id : category.name);
            this.$emit("category-change", category);
          } else {
            this.$emit("input", val);
            this.$emit("category-change", null);
          }
        } else {
          this.$emit("input", val);
          this.$emit("category-change", null);
        }
      },
    },
  },
  created() {
    this.loadCategoryList();
  },
  watch: {
    // 监听数据加载完成，触发一次更新确保显示正确
    categoryList(newList) {
      if (newList && newList.length > 0 && this.value) {
        // 强制触发一次 computed 重新计算
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      }
    }
  },
  methods: {
    // 加载品类列表（带缓存）
    async loadCategoryList() {
      // 如果已经有缓存，直接使用
      if (categoryCache) {
        this.categoryList = this.getCategoryList(categoryCache);
        return;
      }

      // 如果正在请求中，等待请求完成
      if (categoryPromise) {
        this.loading = true;
        try {
          const data = await categoryPromise;
          this.categoryList = this.getCategoryList(data);
        } finally {
          this.loading = false;
        }
        return;
      }

      // 发起新的请求
      this.loading = true;
      categoryPromise = typeCategory()
        .then((res) => {
          const data = res.data || [];
          categoryCache = data; // 缓存数据
          this.categoryList = this.getCategoryList(data);
          return data;
        })
        .catch((err) => {
          console.error("获取品类列表失败:", err);
          return [];
        })
        .finally(() => {
          this.loading = false;
          categoryPromise = null; // 请求完成后清除 Promise
        });

      await categoryPromise;
    },
    handleChange(val) {
      // 触发 change 事件，传递最终的值
      this.$emit("change", this.returnId ? val : val);
    },
    handleClear() {
      this.$emit("clear");
    },
    getCategoryList(list) {
      if (!this.sortByName) {
        return list || [];
      }
      return [...(list || [])].sort((a, b) => {
        const nameA = String(a?.name || "");
        const nameB = String(b?.name || "");
        return nameA.localeCompare(nameB, "zh-CN", {
          numeric: true,
          sensitivity: "base",
        });
      });
    },
    // 手动刷新数据（清除缓存并重新加载）
    refresh() {
      categoryCache = null;
      categoryPromise = null;
      this.loadCategoryList();
    },
    // 根据 id 获取 name
    getNameById(id) {
      const category = this.categoryList.find((item) => item.id === id);
      return category ? category.name : "";
    },
    // 根据 name 获取 id
    getIdByName(name) {
      const category = this.categoryList.find((item) => item.name === name);
      return category ? category.id : "";
    },
  },
};
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>
