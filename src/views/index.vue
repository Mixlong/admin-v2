<template>
  <div class="dashboard-editor-container font14 app-container">
    <ProdPlanOrder />
  </div>
</template>

<script>
import ProdPlanOrder from "@/views/proPlanOrder/index";

export default {
  name: "Index",
  components: {
    ProdPlanOrder,
  }
};
</script>