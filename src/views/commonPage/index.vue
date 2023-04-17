<template>
  <component :is="commonObj.pageName" :commonObj="commonObj" />
</template>

<script>
export default {
  name: "CommonPage",
  data() {
    return {
      commonObj: {},
    };
  },
  components: {
    AddOrderPage: () => import("@/views/third/order/components/addOrUpdate"),
    AddDemandPage: () =>
      import("@/views/TestManage/productTest/components/addOrUpdate"),
  },
  created() {
    this.commonObj = this.$route.query;
  },
};
</script>
