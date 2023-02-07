<!--
 * @Author: your name
 * @Date: 2021-04-14 13:47:31
 * @LastEditTime: 2021-05-06 16:01:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/views/third/myTask/index.vue
-->
<template>
  <div class="margin-top-xs app-container coust-ƒ" style="padding:0;overflow:hidden">
    <el-tabs
      type="border-card"
      class="card-wrap"
      v-model="active"
      @tab-click="handleData"
    >
      <el-tab-pane label="我的任务" name="firtstModel">
        <Assigned ref="firtstModel" :tableHeightCust="tableHeight(-18)" />
      </el-tab-pane>
      <el-tab-pane label="我发布的" name="sendModel">
        <Assigned
          :myTask="true"
          :tableHeightCust="tableHeight(-18)"
          ref="sendModel"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Assigned from "@/views/third/task/assigned";
export default {
  data() {
    return {
      active: "firtstModel",
    };
  },
  components: {
    Assigned,
  },
  methods: {
    handleData() {
      setTimeout(
        function () {
          if (this.active == "firtstModel") {
            this.$refs.firtstModel.getList();
          } else {
            this.$refs.sendModel.getList();
          }
        }.bind(this),
        100
      );
    },
  },
};
</script>

<style lang="scss">
.card-wrap {
  .app-table-content,
  .app-container {
    padding: 0;
  }
}
.coust-ƒ {
  .app-container {
    height: inherit;
  }
}
</style>