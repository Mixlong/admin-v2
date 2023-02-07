<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="6">
        <div class="flex align-center">
          <span class="font14 nowrap" style="white-space: nowrap"
            >项目名称：</span
          >
          <el-autocomplete
            style="width: 100%"
            clearable
            class="inline-input"
            v-model="queryParams.key"
            :fetch-suggestions="querySearch"
            placeholder="请输入标题"
            @select="getList"
            @clear="getList"
          ></el-autocomplete>
        </div>
      </el-col>
      <el-col :span="18" class="flex justify-end align-center">
        <el-checkbox-group v-model="queryParams.states" @change="getList">
          <el-checkbox
            :label="item.dictValue"
            v-for="(item, index) in stateListOptions"
            :key="index"
            >{{ item.dictLabel }}</el-checkbox
          >
        </el-checkbox-group>
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          class="margin-left"
          v-if="checkRole(['project_manager', 'admin'])"
          >新增</el-button
        >
      </el-col>
    </el-row>
    <div :style="{ height: tableHeight(130) + 'px', overflowY: 'scroll' }">
      <draggable
        :disabled="!checkRole(['project_manager', 'admin'])"
        class="dragArea list-image"
        :list="list"
        group="people"
        @change="dragChange"
      >
        <div
          style="display: inline-block; width: 20%; text-align: center"
          v-for="(item, index) in list"
          :key="index"
        >
          <Item
            :content="item"
            :stateListOptions="stateListOptions"
            @delete="openDeleteCode"
            @task="handleTask"
            @sort="getList"
          />
        </div>
      </draggable>
    </div>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />
    <CompUpdate
      :worKListOptions="worKListOptions"
      :pmDictListOptions="pmDictListOptions"
      :stateListOptions="stateListOptions"
      @success="getList"
      ref="compUpdate"
    />
    <Code ref="code" @confirm="handleDelete" />
    <CompTaskUpdate
      ref="compTaskUpdate"
      :worKListOptions="worKListOptions"
      :title="title"
    />
  </div>
</template>

<script>
import draggable from "vuedraggable";
import Item from "./components/Item";
import CompUpdate from "./components/Update";
import Code from "./components/Code";
import {
  listProject,
  deleteProject,
  dictPmProject,
  sortProject,
  dictNameProject2,
} from "@/api/third/project";
import { taskDictDept } from "@/api/third/task";

import CompTaskUpdate from "@/views/third/task/components/update";
export default {
  components: {
    draggable,
    Code,
    Item,
    CompUpdate,
    CompTaskUpdate,
  },

  data() {
    return {
      dialogVisible: false,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],

      // 总条数
      total: 0,
      // 用户表格数据
      list: [],
      logList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      states: [],
      queryParams: {
        states: ["0", "1", "2", "3", "4", "5", "7"],
      },
      // 表单参数
      form: {},
      worKListOptions: [], //工作内容
      pmDictListOptions: [], //责任人
      stateListOptions: [], //状态
    };
  },

  mounted() {
    let projectCheckList = sessionStorage.getItem("projectCheckList");
    if (projectCheckList) {
      this.queryParams.states = projectCheckList.split(",");
    }
    taskDictDept().then((res) => {
      this.worKListOptions = res.data;
      this.getList();
    });
    this.getDicts("base_project_state").then((res) => {
      this.stateListOptions = res.data;
    });

    dictPmProject().then((response) => {
      if (response.code === 200) {
        this.pmDictListOptions = response.data;
      }
    });
    dictNameProject2().then((response) => {
      if (response.code === 200) {
        this.projectListOptions = response.data;
      }
    });
  },
  methods: {
    getList() {
      this.loading = true;
      let loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.6)",
        target: document.querySelector(".app-container"), //loading需要覆盖的DOM节点，默认为body
      });
      let params = Object.assign({}, this.queryParams);
      params.states = this.queryParams.states.toString();
      listProject(params)
        .then((response) => {
          let { data } = response;
          let { worKListOptions } = this;
          for (let key of data) {
            key.work = [];
            for (let keys of key.workList) {
              let lendata = worKListOptions.filter(
                (k) => k.dictValue == keys.workId
              );
              if (lendata.length) {
                key.work.push(Object.assign(keys, lendata[0]));
              }
            }
          }

          this.list = data;
          // this.total = data.total;
          this.loading = false;
        })
        .finally(() => {
          loading.close();
        });
    },

    querySearch(queryString, cb) {
      var restaurants = this.projectListOptions.map((item) => {
        return { value: item.dictLabel };
      });

      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        );
      };
    },
    dragChange(val) {
      let { list } = this;
      let idList = list.map((item) => item.id);
      sortProject({ idList, sort: 2 });
    },
    //组件回调新增任务
    handleTask(row) {
      let { worKListOptions } = this;
      let allId = row.workList.map((item) => item.workId);
      for (let key of worKListOptions) {
        key.disabled = allId.indexOf(key.dictValue) <= -1;
      }
      this.$refs.compTaskUpdate.dialogVisible = true;
      this.$refs.compTaskUpdate.reset();
      this.$refs.compTaskUpdate.disableObj = {
        projectId: true,
      };
      this.$refs.compTaskUpdate.form = {
        projectId: row.id,
      };
      this.$refs.compTaskUpdate.showName = "";
      this.title = "添加任务";
    },
    handleAdd() {
      this.$refs.compUpdate.title = "添加项目";
      this.$refs.compUpdate.reset();

      this.$refs.compUpdate.dialogFormVisible = true;
    },

    handleUpdate(row) {
      // this.$refs.compUpdate.title = "修改项目";
      // this.$refs.compUpdate.reset();
      // this.$refs.compUpdate.form = Object.assign({}, row);
      // this.$refs.compUpdate.dialogFormVisible = true;
    },
    //删除弹出验证码验证
    openDeleteCode(row) {
      this.$refs.code.delDialogVisible = true;
      this.deleteRow = row;
    },
    //删除项目
    handleDelete(data) {
      let { deleteRow } = this;
      deleteProject([
        { status: 1, id: deleteRow.id, code: data.code, uuid: data.uuid },
      ]).then((res) => {
        if (res.code == 200) {
          this.$refs.code.delDialogVisible = false;
          this.msgSuccess("删除成功！");
          this.getList();
        }
      });
    },
  },
  beforeDestroy() {
    sessionStorage.setItem("projectCheckList", this.queryParams.states);
  },
};
</script>

<style>
</style>