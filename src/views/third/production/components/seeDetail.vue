<template>
  <el-table :data="dataList" height="300" max-height="500px">
    <el-table-column label="品类" prop="category" align="center" />
    <el-table-column label="型号" prop="model" align="center" />
    <el-table-column label="员工编号" prop="no" align="center" />
    <el-table-column label="员工姓名" prop="name" align="center" />
    <el-table-column label="线号" prop="lineNo" align="center" />
    <el-table-column label="app版本" prop="appVersion" align="center" />
    <el-table-column label="boot版本" prop="bootVersion" align="center" />
    <el-table-column label="hw版本" prop="hwVersion" align="center" />
    <el-table-column label="ui版本" prop="uiVersion" align="center" />
    <el-table-column label="sn" prop="sn" align="center" />
    <el-table-column label="测试报告" prop="report" align="center" />
    <el-table-column label="测试结果" prop="result" align="center" />
    <el-table-column label="老化时间" prop="time" align="center" />
  </el-table>
</template>

<script>
export default {
  name: "com-aging",
  props: {
    dataList: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style>
</style>