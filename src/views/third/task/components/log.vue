<!--
 * @Author: your name
 * @Date: 2021-04-14 13:47:31
 * @LastEditTime: 2021-06-09 17:31:03
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /fileConf-ui/src/views/third/task/components/log.vue
-->
<template>
  <div>
    <el-dialog
      v-bind="$attrs"
      width="70%"
      top="5vh"
      :close-on-click-modal="true"
      :modal-append-to-body="false"
      v-on="$listeners"
      @open="onOpen"
      @close="onClose"
      title="操作日志"
    >
      <el-table :data="list" border>
        <el-table-column
          prop="createTime"
          align="center"
          width="180"
          label="时间"
        ></el-table-column>
        <el-table-column prop="note" align="center" label="操作内容">
          <template slot-scope="scope">
            <div v-html="scope.row.note" class="text-left"></div>
          </template>
        </el-table-column>
        <el-table-column
          prop="createBy"
          align="center"
          width="80"
          label="操作人"
        ></el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.p"
        :limit.sync="queryParams.l"
        @pagination="getList"
      />
    </el-dialog>
  </div>
</template>
<script>
import { manageListLog } from "@/api/third/task";
export default {
  inheritAttrs: false,
  data() {
    return {
      id: "",
      list: [],
      total: 0,
      queryParams: {
        p: 1,
        l: 20,
      },
    };
  },

  mounted() {},
  methods: {
    getList() {
      manageListLog(this.id, this.queryParams).then((res) => {
        this.list = res.data.list;
        this.total = res.data.total;
      });
    },
    onOpen() {
      if (this.showFileName) {
        this.formData.fileName = `${+new Date()}.vue`;
      }
    },
    onClose() {},
    close(e) {
      this.$emit("update:visible", false);
    },
    handelConfirm() {
      this.$refs.elForm.validate((valid) => {
        if (!valid) return;
        this.$emit("confirm", { ...this.formData });
        this.close();
      });
    },
  },
};
</script>
