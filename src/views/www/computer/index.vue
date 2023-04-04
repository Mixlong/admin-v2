<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="分类" prop="dirId">
        <el-select
          v-model="queryParams.dirId"
          placeholder="请选择"
          style="width: 185px"
          size="small"
          clearable
          @change="getList"
          @keyup.enter.native="getList"
        >
          <el-option
            v-for="item in classOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="仪表名" prop="key">
        <el-input
          v-model="queryParams.key"
          placeholder="请输入仪表名"
          style="width: 185px"
          size="small"
          clearable
          @change="getList"
          @keyup.enter.native="getList"
        >
        </el-input>
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

      <el-row :gutter="10" class="mb8 fr mt5">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            >新增</el-button
          >

          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleMultipleDelete"
            >删除</el-button
          >
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      :height="tableHeight()"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-row :gutter="10">
            <el-col :span="12">
              <div class="font14 margin-bottom-xs">中文规格</div>
              <el-row
                v-for="(item, index) in JSON.parse(props.row.specification)"
                :key="index"
              >
                <el-col :span="4"> {{ item.key }} </el-col>
                <el-col :span="8"> {{ item.value }}</el-col>
              </el-row>
            </el-col>
            <el-col :span="12">
              <div class="font14 margin-bottom-xs">英文规格</div>
              <el-row
                v-for="(item, index) in JSON.parse(props.row.enSpecification)"
                :key="index"
              >
                <el-col :span="4"> {{ item.key }} </el-col>
                <el-col :span="8"> {{ item.value }}</el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="封面" align="center" prop="cover">
        <template slot-scope="scope">
          <el-image
            :src="scope.row.cover"
            style="width: 80px; height: 80px"
            fit="cover"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="首页封面" align="center" prop="homeCover">
        <template slot-scope="scope">
          <el-image
            :src="scope.row.homeCover"
            style="width: 80px; height: 80px"
            fit="cover"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="详情图" align="center" prop="detailCover">
        <template slot-scope="scope">
          <el-image
            :src="getImgList(scope.row.detailCover, 1)"
            :preview-src-list="getImgList(scope.row.detailCover)"
            style="width: 80px; height: 80px; border-radius: 3px"
            fit="cover"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="仪表名" align="center" prop="name" />
      <el-table-column
        label="分类"
        align="center"
        prop="name"
        :formatter="dirName"
      />
      <el-table-column label="排序" align="center" prop="sort" width="80" />
      <el-table-column label="是否首页" align="center" width="80">
        <el-tag
          slot-scope="scope"
          :type="scope.row.isHome ? 'success' : 'danger'"
          >{{ scope.row.isHome ? "是" : "否" }}</el-tag
        >
      </el-table-column>
      <el-table-column label="描述" align="center" prop="description" />
      <el-table-column label="英文描述" align="center" prop="enDescription" />
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
      :conditionOptions="conditionOptions"
      :classOptions="classOptions"
      :title="title"
    />
  </div>
</template>

<script>
import { computerAuth, computerList, computerDir } from "@/api/home/computer";
import CompUpdate from "./components/update";

export default {
  components: {
    CompUpdate,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],

      delDialogVisible: false,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 用户表格数据
      list: [],
      classOptions: [],
      conditionOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,

      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        key: "",
        dirId: undefined,
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
  computed: {
    getImgList() {
      return (imgList, single) => {
        const imgListArr = imgList.split(",");
        if (single === 1) {
          return imgListArr[0];
        } else {
          return imgListArr;
        }
      };
    },
  },
  mounted() {
    computerDir().then((response) => {
      this.classOptions = response.data;
    });
    this.getDicts("pucs_update_condition").then((res) => {
      this.conditionOptions = res.data;
      this.getList();
    });
  },
  methods: {
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      computerList(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    dirName(row) {
      let data = this.classOptions.filter((item) => item.id == row.dirId);
      if (data.length) {
        return data[0].name;
      }
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
        computerAuth(data).then((res) => {
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
    // 用户状态修改
    handleStatusChange(row) {
      let data = [];
      let text = "";
      if (row == 0 || row == 1) {
        text = row === 0 ? "启用" : "禁用";
        data = this.ids.map((item) => {
          return { id: item, status: row };
        });
      } else {
        text = row.status === 0 ? "启用" : "禁用";
        let authData = { id: row.id, status: row.status };
        data.push(authData);
      }

      this.$confirm("确认要" + text + "吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.loading = true;
          authSoft(data).then((response) => {
            this.msgSuccess(text + "成功");
            this.loading = false;
            this.getList();
          });
        })
        .catch(function () {
          row.status = row.status === 0 ? 1 : 0;
        });
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
      this.title = "添加仪表";
    },
    handleUpdate(row) {
      this.$refs.compUpdate.dialogVisible = true;
      let data = Object.assign({}, row);
      this.$refs.compUpdate.form = data;
      this.title = "修改仪表";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let { spceArr } = this;
          for (let key of spceArr) {
            this.specification;
          }
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
