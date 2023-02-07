<!--
 * @Author: your name
 * @Date: 2021-04-14 13:47:31
 * @LastEditTime: 2021-05-14 17:04:56
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/views/third/work/paper/components/readList.vue
-->
<template>
  <el-dialog
    title="查看已读列表"
    :visible.sync="dialogVisible"
    center
    append-to-body
    :close-on-click-modal="false"
  >
    <el-table :data="list" :height="tableHeight()" border>
      <el-table-column
        prop="recipientUser"
        label="接收人"
        align="center"
        :formatter="fnProjectUserName"
      />

      <el-table-column
        prop="projectStatus"
        label="项目状态"
        align="center"
        v-if="remindType == 2"
      >
        <template slot-scope="scope">
          <span
            :class="[scope.row.projectStatus == 1 ? 'text-green' : 'text-red']"
            >{{ scope.row.projectStatus == 1 ? "已完成" : "进行中" }}</span
          >
        </template>
      </el-table-column>

      <el-table-column prop="paperStatus" label="读取状态" align="center">
        <template slot-scope="scope">
          <span
            :class="[scope.row.paperStatus == 1 ? 'text-yellow' : 'text-gray']"
            >{{ scope.row.paperStatus == 1 ? "已读" : "未读" }}</span
          >
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
export default {
  props: ["memberDictMap"],
  data() {
    return {
      dialogVisible: false,
      list: [],
      memberDictMap: {},
      remindType: 1,
    };
  },
  mounted() {},
  methods: {
    fnProjectUserName(row) {
      return this.memberDictMap[row.recipientUser];
    },
  },
};
</script>

<style>
</style>