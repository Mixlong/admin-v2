<template>
  <div class="app-container paper">
    <el-tabs v-model="activeName" @tab-click="handleChange">
      <el-tab-pane label="发给我的" name="first"
        ><CompReveiveList v-if="activeName == 'first'" />
      </el-tab-pane>
      <el-tab-pane label="我发送的" name="second">
        <CompSendList  v-if="activeName == 'second'"
      /></el-tab-pane>
    </el-tabs>

    
  </div>
</template>

<script>
 
import CompSendList from "./components/sendList";
import CompReveiveList from "./components/reveiveList";

export default {
  components: {
    CompSendList,
    CompReveiveList,
  },
  data() {
    return {
      activeName: "first",
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 用户表格数据
      list: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      processOptions: [],
      dutOptions: [],
      updateType: 1,
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        pucsid: undefined,
        factoryName: undefined,
        dutName: undefined,
      },
      // 表单参数
      form: {},
    };
  },

  mounted() {},
  methods: {
    handleChange(val) {
    },
  },
};
</script>
<style lang="scss">
.paper {
  .el-table--medium th,
  .el-table--medium td {
    padding: 0;
  }
}
</style>
