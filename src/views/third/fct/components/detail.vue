<!--
 * @Author: your name
 * @Date: 2021-05-07 18:30:41
 * @LastEditTime: 2021-05-28 17:36:27
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/views/third/fct/components/detail.vue
-->
<template>
  <!--   -->
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="500px"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-table :data="list" border>
      <el-table-column label="序号" type="index" width="50" align="center" />

      <el-table-column label="宝sn" prop="chargePalSn" align="center" />
      <el-table-column label="创建时间" prop="createTime" align="center" />
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: ["list"],
  data() {
    return {
      // 表单参数
      form: {
        isShow: 0,
      },
      title: "",
      dialogVisible: false,
      // 表单校验
    };
  },

  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scope>
</style>

