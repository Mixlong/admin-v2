<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="DUT名称/编码" prop="key">
        <el-select
          v-model="queryParams.key"
          placeholder="请选择"
          style="width: 100%"
          @change="getList"
          clearable
        >
          <el-option
            v-for="item in dutOptions"
            :key="item.value"
            :label="item.name"
            :value="item.model"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="工序" prop="processId">
        <el-select
          style="width: 100%"
          v-model="queryParams.processId"
          @change="getList"
        >
          <el-option
            v-for="item in processOptions"
            :key="item.value"
            :label="item.dictLabel"
            :value="item.dictCode"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
      <el-row :gutter="10" class="mt fr">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            >新增</el-button
          >
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" :data="list" :height="tableHeight()" border>
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="DUT名称"
        align="center"
        prop="dutName"
        width="220"
      />
      <el-table-column label="测试说明" align="center" prop="explain" />
      <el-table-column
        label="工序"
        align="center"
        prop="processName"
        width="80"
      />
      <el-table-column
        label="创建人"
        align="center"
        prop="createBy"
        width="110"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      />

      <el-table-column
        label="操作"
        align="center"
        width="100"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <Tooltip
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(scope.row)"
          />
          <Tooltip
            icon="el-icon-delete"
            :className="['text-red']"
            content="删除"
            @click="handleDelete(scope.row)"
          />

          <el-tooltip
            class="item font16"
            effect="dark"
            content="脚本下载"
            placement="top-end"
          >
            <el-button
              icon="el-icon-bottom"
              type="text"
              class="text-orange"
              @click="handleDownload(scope.row.fileUrl)"
            ></el-button>
          </el-tooltip>
          <el-tooltip
            class="item font16"
            effect="dark"
            content="接线下载"
            placement="top-end"
            v-if="scope.row.connectionFileUrl"
          >
            <el-button
              icon="el-icon-bottom"
              type="text"
              class="text-cyan"
              @click="handleDownload(scope.row.connectionFileUrl)"
            ></el-button>
          </el-tooltip>
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
    <CompUpdate
      ref="compUpdate"
      :title="title"
      :processOptions="processOptions"
      :dutOptions="dutOptions"
    />
  </div>
</template>

<script>
import { listDut, authDut } from "@/api/dut";
import { categoryComputerDict } from "@/api/third/fileConfig";
import CompUpdate from "./components/update";
import axios from "axios";
export default {
  components: {
    CompUpdate,
  },
  data() {
    return {
      processOptions: [],
      dutOptions: [],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 用户表格数据
      list: [],
      // 弹出层标题
      title: "",
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        key: undefined,
      },
    };
  },

  mounted() {
    axios
      .all([categoryComputerDict(), this.getDicts("pucs_process_label")])
      .then((res) => {
        for (let key of res[0].data) {
          key.model = key.id;
        }
        this.dutOptions = res[0].data;
        this.processOptions = res[1].data;
        this.getList();
      });
  },
  methods: {
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      listDut(this.queryParams).then((response) => {
        let list = response.data.list;
        for (let key of list) {
          let proIndex = this.processOptions.findIndex(
            (item) => item.dictCode == key.processId
          );
          if (proIndex > -1) {
            key.processName = this.processOptions[proIndex].dictLabel;
          }
        }
        this.list = list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    handleDelete(row) {
      this.postDelete([{ id: row.id, status: 1 }]);
    },
    handleDelete(row) {
      this.$confirm("此操作将进行删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        authDut([{ id: row.id, status: 1 }]).then((res) => {
          this.getList();
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        });
      });
    },
    handleDownload(url) {
      this.urlDownload(url);
      // var name = url;
      // var url = url;
      // var suffix = url.substring(url.lastIndexOf("."), url.length);
      // const a = document.createElement("a");
      // a.setAttribute("download", name + suffix);
      // a.setAttribute("target", "_blank");
      // a.setAttribute("href", url);
      // a.click();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },

    handleAdd() {
      this.title = "添加测试程序";
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
    },
    handleUpdate(row) {
      this.$refs.compUpdate.dialogVisible = true;
      this.title = "修改软件";
      row.dutId = row.dutCode;
      let params = Object.assign({}, row);
      for (let key of this.dutOptions) {
        if (
          key.computerList.findIndex((item) => item.model == row.dutCode) > -1
        ) {
          params.dutCode = [key.id, row.dutCode];
        }
      }
      this.$refs.compUpdate.form = params;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            editCategory(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addCategory(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          }
        }
      });
    },
  },
};
</script>
