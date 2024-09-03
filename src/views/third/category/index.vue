<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="品类名称" prop="key">
        <el-input
          v-model="queryParams.key"
          placeholder="请输入品类名称"
          clearable
          size="small"
          style="width: 185px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          v-debounce="{ Fn: handleQuery }"
        >
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
      <el-row :gutter="10" class="fr mt5">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['third:dev:add']"
          >
            新增
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      :data="categoryList"
      border
      :height="tableHeight()"
    >
      <el-table-column label="序号" width="50" align="center" type="index" />
      <el-table-column label="名称" align="center" prop="name" width="140" />
      <el-table-column label="描述" align="center" prop="desc">
        <span slot-scope="scope" v-NoData="scope.row.desc"></span>
      </el-table-column>
      <el-table-column label="图片" align="center" width="140">
        <template slot-scope="{ row }">
          <preview-img :url="row.img" :srcList="[row.img]" />
        </template>
      </el-table-column>
      <el-table-column label="开启送样" align="center" width="140">
        <template slot-scope="{ row }">
          <el-tag :type="row.isSample === '1' ? 'success' : 'danger'">
            {{ row.isSample === "1" ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建人"
        align="center"
        prop="createBy"
        width="120"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        sortable
        width="180"
      />
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="scope">
          <Tooltip
            v-hasPermi="['product:category:edit']"
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(scope.row)"
          />
          <Tooltip
            v-hasPermi="['product:category:add']"
            icon="el-icon-delete"
            :className="['text-red']"
            content="删除"
            @click="handleStatusChange(scope.row)"
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

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog
      :title="title"
      center
      width="500px"
      :visible.sync="open"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.native.prevent
      >
        <el-form-item label="名称:" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入品类名称"
            @keyup.enter.native.prevent="submitForm"
          />
        </el-form-item>
        <el-form-item label="描述:" prop="desc">
          <el-input
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            v-model="form.desc"
            placeholder="请输入品类描述"
          />
        </el-form-item>
        <el-form-item label="图片:" class="img-box">
          <el-upload-sortable v-model="form.img" :max="1" />
        </el-form-item>
        <el-form-item label="开启送样:">
          <el-radio-group v-model="form.isSample">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-debounce="{ Fn: submitForm }">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="请确认是否删除"
      width="350px"
      center
      :visible.sync="delDialogVisible"
      :close-on-click-modal="false"
    >
      <div class="flex justify-between align-center">
        <el-input
          class="delete-code-box margin-right-xs"
          v-model="auth.code"
          auto-complete="off"
          placeholder="验证码"
          clearable
        />
        <img @click="getCode" :src="codeUrl" />
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="handleDel(0)">取 消</el-button>
        <el-button type="primary" @click="handleDel(1)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  listCategory,
  authCategory,
  addCategory,
  editCategory,
} from "@/api/third/category";
import { getCodeImg } from "@/api/base/code";

export default {
  name: "Category",
  data() {
    return {
      // 遮罩层
      loading: true,
      codeUrl: "",
      auth: { id: undefined, status: 1, code: undefined, uuid: undefined },
      delDialogVisible: false,
      // 总条数
      total: 0,
      // 用户表格数据
      categoryList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
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
  watch: {
    delDialogVisible(delDialogVisible) {
      if (delDialogVisible) {
        this.getCode();
      }
    },
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      listCategory(this.queryParams)
        .then((response) => {
          this.categoryList = response.data.list;
          this.total = response.data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getCode() {
      getCodeImg().then((res) => {
        this.codeUrl = "data:image/gif;base64," + res.img;
        this.auth.uuid = res.uuid;
      });
    },
    handleDel(status) {
      if (status === 1) {
        if (this.auth.code) {
          authCategory(this.auth).then(() => {
            this.delDialogVisible = false;
            this.msgSuccess("删除成功");
            this.loading = false;
            this.getList();
          });
        } else {
          this.msgError("验证码不能为空");
        }
      } else {
        this.delDialogVisible = false;
      }
    },
    // 用户状态修改
    handleStatusChange(row) {
      this.delDialogVisible = true;
      this.auth.id = row.id;
      this.auth.status = 1;
      this.auth.code = undefined;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.form = {
        id: undefined,
        p: 1,
        l: 50,
        key: undefined,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加品类";
    },
    handleUpdate(row) {
      this.form = Object.assign({}, row);
      this.open = true;
      this.title = "修改品类";
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
                this.msgSuccess("创建成功");
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
<style lang="scss" scoped>
.delete-code-box {
  height: 36px;
  /deep/ .el-input__inner {
    height: 100%;
  }
}
</style>
