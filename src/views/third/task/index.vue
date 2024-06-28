<template>
  <div class="app-container">
    <div class="flex justify-end">
      <el-button
        size="small"
        type="primary"
        @click="handleAdd"
        v-if="checkRole(['task_director', 'admin'])"
      >
        新增任务
      </el-button>
    </div>

    <el-row>
      <el-col :span="4" :xs="24">
        <div
          class="head-container el-card"
          style="padding: 20px"
          :style="{ minHeight: tableHeight(120) + 'px' }"
        >
          <el-tree
            :data="deptOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="tree"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <el-col :span="20" :xs="24">
        <div
          :style="{ height: tableHeight(120) + 'px', overflowY: 'scroll' }"
          v-scroll="handleScroll"
        >
          <el-row style="overflow-x: hidden">
            <el-col
              :span="8"
              style="display: inline-block"
              v-for="(item, index) in list"
              :key="index"
            >
              <Item :content="item" />
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>

    <CompUpdate
      ref="compUpdate"
      :title="title"
      :worKListOptions="worKListOptions"
    />
  </div>
</template>

<script> 
import Item from "./components/Item";
import CompUpdate from "./components/update";
import { taskDictDept, taskDeptList } from "@/api/third/task";
import { treeselect } from "@/api/system/dept";
export default {
  components: {
    CompUpdate,
    Item,
  },
  data() {
    return {
      deptOptions: undefined,
      defaultProps: {
        children: "children",
        label: "label",
      },
      worKListOptions: [],
      taskDeptOptions: [],
      list: [],
      title: "",
      queryParams: {
        p: 1,
        l: 50,
        deptId: 103,
      },
    };
  },

  mounted() {
    this.getTreeselect();
    taskDictDept().then((res) => {
      this.worKListOptions = res.data;
      this.getList();
    });
  },

  methods: {
    getList() {
      taskDeptList(this.queryParams).then((response) => {
        let { data } = response;
        let { worKListOptions } = this;
        for (let key of data) {
          let lendata = worKListOptions.filter(
            (k) => k.dictValue == key.workId
          );
          if (lendata.length) {
            key.work = lendata[0].dictLabel;
          }
        }
        this.list = data;
        this.loading = false;
      });
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      treeselect().then((response) => {
        this.deptOptions = response.data[0].children.filter(
          (item) => item.id == 103
        );
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.getList();
    },
    handleScroll() {},
    handleAdd() {
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.showName = "";
      this.title = "添加任务";
    },
  },
};
</script>

<style>
</style>