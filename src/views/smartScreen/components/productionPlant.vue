<template>
  <el-table
    :data="tableData"
    height="100%"
    :header-cell-class-name="headerCellClassName"
  >
    <el-table-column prop="name" label="序号" align="center"></el-table-column>
    <el-table-column prop="age" label="机型" align="center"></el-table-column>
    <el-table-column prop="age" label="订单号" align="center"></el-table-column>
    <el-table-column prop="age" label="半成品" align="center"></el-table-column>
    <el-table-column prop="age" label="成品" align="center"></el-table-column>
    <el-table-column prop="age" label="配置" align="center"></el-table-column>
    <el-table-column prop="age" label="包装" align="center"></el-table-column>
    <el-table-column prop="age" label="计划数量" align="center"></el-table-column>
    <el-table-column prop="age" label="备料状态" align="center"></el-table-column>
    <el-table-column prop="age" label="计划完成时间" align="center" width="120"></el-table-column>
    <el-table-column prop="age" label="达成率" align="center"></el-table-column>
  </el-table>
</template>

<script>
export default {
  data() {
    return {
      tableData: [
        { name: "张三", age: 20, address: "上海" },
        { name: "李四", age: 22, address: "北京" },
        { name: "王五", age: 25, address: "广州" },
        { name: "赵六", age: 28, address: "深圳" },
        { name: "孙七", age: 30, address: "杭州" },
        { name: "周八", age: 32, address: "成都" },
      ],
    };
  },
  methods: {
    headerCellClassName({ column, row, rowIndex, columnIndex }) {
      return "custom-header-cell";
    },
  },
};
</script>

<style lang="scss" scoped>
</style>