 
<template>
  <div>
    <el-row :gutter="10" class="mb5">
      <el-col :span="1.5">
        <el-button
          v-if="state == 0"
          type="primary"
          size="mini"
          :disabled="multiple"
          @click="handleBatchOperation(1)"
          >通过</el-button
        >

        <el-button
          v-if="state == 0"
          type="danger"
          size="mini"
          :disabled="multiple"
          @click="handleBatchOperation(2)"
          >拒绝</el-button
        >
        <el-button
          v-if="state == 2"
          type="primary"
          size="mini"
          :disabled="multiple"
          @click="handleBatchOperation(0)"
          >恢复</el-button
        >
        <el-button
          v-if="state == 2"
          type="danger"
          size="mini"
          :disabled="multiple"
          @click="handleDeleteOperation()"
          >删除</el-button
        >
      </el-col>
    </el-row>
    <el-table
      :data="applyList"
      :height="tableHeight(-100)"
      border
      @cell-click="handleCellClick"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="序号" type="index" width="50" align="center">
        <template slot-scope="scope">
          <span>{{
            (queryParams.p - 1) * queryParams.l + scope.$index + 1
          }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="客户"
        prop="customerName"
        align="center"
        width="100"
      />
      <el-table-column
        label="产品型号"
        prop="baseModel"
        align="center"
        width="100"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <div :key="tag" v-for="tag in scope.row.baseModel">
            <el-tag style="margin: 5px 0 0 0" size="small">{{ tag }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="数量" prop="sendNum" align="center" width="50" />
      <el-table-column label="详细需求" prop="demand" align="center">
        <template slot-scope="scope">
          <div class="text-left" v-html="scope.row.demand"></div>
        </template>
      </el-table-column>
      <el-table-column
        label="送样日期"
        align="center"
        prop="sendTime"
        width="120"
      >
        <template slot-scope="scope">
          <div>{{ scope.row.sendTime }}</div>
        </template>
      </el-table-column>
      <el-table-column
        label="申请日期"
        prop="createTime"
        align="center"
        width="105"
      >
        <template slot-scope="scope">
          {{ scope.row.createTime ? scope.row.createTime.slice(0, 11) : "" }}
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="70"
        fixed="right"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.state == 0">
            <Tooltip
              v-if="checkRole(['sale', 'admin'])"
              icon="el-icon-check"
              :className="['text-green']"
              content="通过"
              @click="handleAuthChange(scope.row, 1)"
            />
            <Tooltip
              v-if="checkRole(['sale', 'admin'])"
              icon="el-icon-close"
              :className="['text-red']"
              content="拒绝"
              @click="handleAuthChange(scope.row, 2)"
            />
          </div>
          <div v-else-if="state == 2">
            <Tooltip
              v-if="checkRole(['sale', 'admin'])"
              icon="el-icon-refresh-right"
              :className="['text-blue']"
              content="恢复"
              @click="handleAuthChange(scope.row, 0)"
            />
            <Tooltip
              v-if="checkRole(['sale', 'admin'])"
              icon="el-icon-delete"
              :className="['text-red']"
              content="删除"
              @click="handleDelete(scope.row)"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: ["applyList", "queryParams", "state"],
  data() {
    return {
      multiple: true,
    };
  },
  methods: {
    handleAuthChange(row, state) {
      this.$emit("change", [
        {
          id: row.id,
          state,
          remark: "",
          demandObject: row.demandObject
        }
      ]);
    },
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.multiple = !selection.length;
    },
    handleBatchOperation(state) {
      let params = this.ids.map((item) => {
        return {
          id: item,
          state,
          remark: "",
        };
      });
      this.$emit("change", params);
    },
    handleDelete(row) {
      let params = [
        {
          id: row.id,
          status: 1,
        },
      ];
      this.$emit("delete", params);
    },
    handleDeleteOperation() {
      let params = this.ids.map((item) => {
        return {
          id: item,
          status: 1,
        };
      });
      this.$emit("delete", params);
    },
    handleCellClick(row, column) {
      console.log(row)
      if(column.label === '详细需求') {
        window.open(window.location.origin + '/survey?row=' + JSON.stringify(row))
      }
    }
  },
};
</script>

<style>
</style>