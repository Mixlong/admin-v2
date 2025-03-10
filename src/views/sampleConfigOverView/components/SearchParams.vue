<template>
  <div class="search-params-box">
    <template v-if="!currentItem.id">
      <el-select
        class="margin-bottom-xs"
        v-model="queryParams.categoryId"
        filterable
        clearable
        size="mini"
        placeholder="请选择品类"
        @change="changeCategory"
        style="width: 100%"
      >
        <el-option
          v-for="dict in dictList"
          :key="dict.id"
          :label="dict.name"
          :value="dict.id"
        />
      </el-select>
      <el-select
        v-model="queryParams.computerId"
        :loading="isCLoading"
        filterable
        remote
        clearable
        size="mini"
        placeholder="请选择仪表型号"
        :remote-method="getComputerNameList"
        style="width: 100%"
      >
        <el-option
          v-for="dict in computerOptions"
          :key="dict.model"
          :label="dict.name"
          :value="dict.model"
        />
      </el-select>
    </template>
    <template v-else>
      <p>品类：{{ currentItem.category }}</p>
      <p>型号：{{ currentItem.computerName }}</p>
    </template>

    <div class="margin-top-xs">
      <el-button
        v-if="!currentItem.id"
        :disabled="!queryParams.categoryId || !queryParams.computerId"
        size="mini"
        @click="getList"
      >
        添加
      </el-button>
      <el-link type="primary" v-else @click="handleRemove">移除</el-link>
    </div>
  </div>
</template>

<script>
import { categoryComputerDict, computerNameList } from "@/api/third/fileConfig";
import { modelConfigList } from "@/api/third/testApi";

export default {
  props: {
    dictList: {
      type: Array,
      default: () => [],
    },
    compareData: {
      type: Array,
      default: () => [],
    },
    currentItem: {
      type: Object,
      default: () => {},
    },
    paramsIndex: {
      type: Number,
    },
  },
  data() {
    return {
      isCLoading: false,
      isProductShow: true,
      computerOptions: [],
      brandData: {},
      queryParams: {
        categoryId:  "",
        computerId: "",
      },
    };
  },
  methods: {
    changeCategory(categoryId) {
      this.queryParams.computerId = "";

      this.computerOptions = this.dictList.filter(
        (item) => item.id === categoryId
      )[0]?.computerList;
    },
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = false;
        computerNameList({
          name,
          categoryId: this.queryParams.categoryId,
        }).then((res) => {
          this.computerOptions = res.data;
        });
      } else {
        this.computerOptions = [];
      }
    },
    getList() {
      modelConfigList(this.queryParams).then((res) => {
        const { list } = res.data;
        this.brandData = list[0];

        if (this.handleInCompareData()) {
          this.$message.error("该参数已存在");
          return;
        }

        this.isProductShow = false;
        this.$emit("sendBrandData", {
          paramsIndex: this.paramsIndex,
          brandData: this.brandData,
        });
      });
    },
    handleInCompareData() {
      return this.compareData.some((item) => {
        return item.id === this.brandData.id;
      });
    },
    handleRemoveCompareData() {
      const deleteCompareData = this.compareData.map((item) => item.id).filter(item => item !== undefined);
      return deleteCompareData.length <= 2;
    },
    handleRemove() {
      // if (this.handleRemoveCompareData()) {
      //   this.$message.error("不能删除，已经是最后一个比较的产品!");
      //   return;
      // }

      this.isProductShow = true;
      this.queryParams = {
        categoryId: "",
        computerId: "",
      };
      this.computerOptions = [];

      this.$emit("handleRemove", this.paramsIndex);
    },
  },
};
</script>

<style lang="scss" scoped>
.search-params-box {
  box-sizing: border-box;
  padding: 15px 40px;
  text-align: center;
}
</style>