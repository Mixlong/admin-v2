<template>
  <div class="app-container">
    <AllPramsConfig :categoryId="routeParams.categoryId" :computerId="routeParams.computerId" />
    <!-- <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="总配置项" name="first">
        <AllPramsConfig />
      </el-tab-pane>
      <el-tab-pane label="型号名称" name="second">
        <SingleParamsConfig />
      </el-tab-pane>
    </el-tabs> -->
  </div>
</template>

<script>
import AllPramsConfig from './components/allPramsConfig.vue';
import SingleParamsConfig from './components/singleParamsConfig.vue';

export default {
  name: "ConfigOverview",
  components: {
    AllPramsConfig,
    SingleParamsConfig
  },
  data() {
    return {
      activeName: 'first',
      routeParams: {}
    }
  },
  watch: {
    // 监听路由参数变化
    '$route.params': {
      handler(newParams, oldParams) {
        this.routeParams = {
          categoryId: newParams.categoryId,
          computerId: newParams.computerId
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    // 获取路由参数
    this.routeParams = {
      categoryId: this.$route.params.categoryId,
      computerId: this.$route.params.computerId
    }
  }
};
</script>