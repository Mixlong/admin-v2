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
      title="日志"
    >
      <el-table :data="list" border>
        <el-table-column
          prop="logTime"
          align="center"
          width="180"
          label="时间"
        ></el-table-column>
        <el-table-column prop="note" align="center" label="操作内容">
          <template slot="header">
            <div class="flex align-center justify-center">
              <span>操作内容</span>
              <i
                class="el-icon-circle-plus text-blue font18 margin-left-sm"
                style="cursor: pointer"
                @click.stop="handleAdd"
              ></i>
            </div>
          </template>
          <template slot-scope="scope">
            <div v-html="scope.row.note" class="text-left"></div>
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          align="center"
          width="120"
          class-name="small-padding fixed-width btn-icon-style"
          v-if="$attrs.isEdit"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              icon="el-icon-edit"
              class="text-blue"
              @click="handleUpdate(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- <div slot="footer" class="dialog-footer">
        <el-button
          circle
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
        ></el-button>
      </div> -->
    </el-dialog>
  </div>
</template>
<script>
import { emphasisLogList } from "@/api/third/emphasis";
export default {
  inheritAttrs: false,
  data() {
    return {
      id: "",
      list: [],
      total: 0,
      queryParams: {},
    };
  },

  mounted() {},
  methods: {
    onOpen() {
      let { logRow } = this.$attrs;
      emphasisLogList(logRow.id).then((res) => {
        this.list = res.data;
      });
    },

    handleAdd(row) {
      this.$emit("update", this.form, row);
    },
    //新增记录
    handleUpdate(row) {
      this.$emit("openUpdate", row);
    },
    handleAdd() {
      this.$emit("openAdd");
    },
    close(e) {
      this.$emit("update:visible", false);
    },
  },
};
</script>
