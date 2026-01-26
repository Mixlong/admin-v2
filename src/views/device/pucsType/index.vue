<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="系列名称/型号" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入设备名称/型号"
          size="small"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="small"
          @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
      <el-row :gutter="10" class="fr mt5">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="handleAdd"
          >
            新增
          </el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="small"
            :disabled="multiple"
            @click="handleMultipleDelete"
          >
            删除
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      border
            :height="tableHeight(-30)"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="装备类型"
        align="center"
        prop="name"
        width="200"
      />
      <el-table-column
        label="装备型号"
        align="center"
        prop="code"
        width="200"
      />
      <el-table-column label="外观照片" align="center" prop="icon" width="90">
        <template slot-scope="scope">
          <preview-img
            :url="scope.row.icon"
            :srcList="[`${scope.row.icon}`]"
            width="45px"
            height="45px"
          />
        </template>
      </el-table-column>
      <el-table-column label="配置明细" align="center">
        <template slot-scope="scope">
          <el-descriptions
            v-for="item in scope.row.moduleList"
            :key="item.id"
            size="mini"
          >
            <el-descriptions-item label="名称">
              {{ item.name }}
            </el-descriptions-item>
            <el-descriptions-item label="编码">
              {{ item.code }}
            </el-descriptions-item>
            <el-descriptions-item label="数量">
              {{ item.num || 0 }}
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status ? 'success' : 'danger'">
            {{ scope.row.status ? "禁用" : "正常" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建人"
        prop="createBy"
        align="center"
        width="100"
      />
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="140"
        sortable
      />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="100"
      >
        <template slot-scope="scope">
          <Tooltip
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(scope.row)"
          />

          <Tooltip
            class="text-red"
            icon="el-icon-delete"
            content="删除"
            @click="handleDelete(scope.row)"
          />
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

    <CompUpdate ref="compUpdate" :title="title" />
  </div>
</template>

<script>
import { listType, authType } from "@/api/pucs/type";
import CompUpdate from "./components/update";
import requestUrl from "@/utils/requestUrl";
import { getToken } from "@/utils/auth";
export default {
  name: "PucsType",
  components: {
    CompUpdate,
  },
  data() {
    return {
      actionUrl: requestUrl + "/pucs/type/import/js",
      // 设置上传的请求头部
      headers: { Authorization: "Bearer " + getToken() },
      listcc: [
        {
          name: "food.jpeg",
          url: "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100",
        },
        {
          name: "food2.jpeg",
          url: "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100",
        },
      ],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
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
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "品类名称不能为空", trigger: "blur" },
        ],
      },
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      listType(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    handleMultipleDelete() {
      this.postDelete(
        this.ids.map((item) => {
          return {
            id: item,
            status: 1,
          };
        })
      );
    },
    handleDelete(row) {
      this.postDelete([{ id: row.id, status: 1 }]);
    },
    postDelete(data) {
      this.$confirm("此操作将进行删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        authType(data).then((res) => {
          this.getList();
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        });
      });
    },
    fnUpdateCondition(row, inx, val) {
      for (let key of this.conditionOptions) {
        if (key.dictLabel == val) {
          return key.dictValue;
        }
      }
    },
    handleDownload(row) {
      this.urlDownload(row.fileUrl);
      // var name = row.fileUrl;
      // var url = row.fileUrl;
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.multiple = !selection.length;
    },
    handleAuth(status) {
      let text = status === 0 ? "启用" : "停用";
      this.$confirm('确认要"' + text + "吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.loading = true;
          let data = [];
          for (let i = 0; i < this.ids.length; i++) {
            let authData = { id: this.ids[i], status: status };
            data.push(authData);
          }
          this.loading = false;
          authCategory(data).then((response) => {
            this.msgSuccess(text + "成功");
            this.loading = false;
            this.getList();
          });
        })
        .catch(function () {
          status = status === "0" ? "1" : "0";
        });
    },
    handleAdd() {
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.title = "新增装备类型";
    },
    handleUpdate(row) {
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.form = JSON.parse(JSON.stringify(row));
      this.$refs.compUpdate.form.targetId;
      this.title = "修改装备类型";
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

<style>
</style>