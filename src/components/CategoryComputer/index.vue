<template>
  <div>
    <el-select
      :value="value"
      v-bind="$attrs"
      @change="changeCategory"
      placeholder="请选择品类"
    >
      <el-option
        v-for="dict in options"
        :key="dict.id"
        :label="dict.name"
        :value="dict.id"
      />
    </el-select>
  </div>
</template>

<script>
import { categoryComputerDict } from "@/api/third/fileConfig";
export default {
  props: {
    value: {
      default: ""
    }
  },
  data() {
    return {
      options: [],
    };
  },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      categoryComputerDict().then((res) => {
        this.options = res.data;
      });
    },
    changeCategory(data) {
      this.$emit("input", data);
    },
  },
};
</script>

<style></style>
