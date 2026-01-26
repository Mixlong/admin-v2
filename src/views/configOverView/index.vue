<template>
  <div class="app-container">
    <AllPramsConfig :categoryId="routeParams.categoryId" :computerId="routeParams.computerId" />
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
    this.routeParams = {
      categoryId: this.$route.params.categoryId,
      computerId: this.$route.params.computerId
    }
  }
};
</script>