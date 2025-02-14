<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="总配置项" name="first">
        <AllPramsConfig />
      </el-tab-pane>
      <el-tab-pane label="型号名称" name="second">
        <SingleParamsConfig />
      </el-tab-pane>
    </el-tabs>
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
    }
  }
};
</script>