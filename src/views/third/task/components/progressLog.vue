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
      title="进展记录"
    >
      <el-table :data="list" border>
        <el-table-column
          prop="createTime"
          align="center"
          width="180"
          label="时间"
        ></el-table-column>
        <el-table-column prop="content" align="center" label="操作内容">
          <template slot="header" slot-scope="scope">
            <div class="flex align-center justify-center">
              <span>操作内容</span>
              <i
                class="el-icon-circle-plus text-blue font18 margin-left-sm"
                style="cursor: pointer"
                @click.stop="handleProgressLog"
              ></i>
            </div>
          </template>
          <template slot-scope="scope">
            <div v-html="scope.row.content" class="text-left"></div>
          </template>
        </el-table-column>
        <el-table-column
          prop="createBy"
          align="center"
          width="120"
          label="操作人"
        ></el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="120"
          class-name="small-padding fixed-width btn-icon-style"
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
import { taskProgress } from "@/api/third/task";
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
      taskProgress(this.id, this.queryParams).then((res) => {
        this.list = res.data.list;

        this.total = res.data.total;
      });
    },
    onOpen() {},
    handleUpdate(row) {
      this.$emit("update", this.form, row);
    },
    //新增记录
    handleProgressLog(){
      this.$parent.problemAdd( this.form)
    },
    onClose() {},
    close(e) {
      this.$emit("update:visible", false);
    },
  },
};
</script>
