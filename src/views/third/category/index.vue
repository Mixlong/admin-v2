<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" @submit.native.prevent>
      <el-form-item label="品类名称" prop="key">
        <el-input v-model="queryParams.key" placeholder="请输入品类名称" clearable size="small" style="width: 185px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-row :gutter="10" class="fr mt5">

        <el-col :span="1.5">
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['third:dev:add']">新增
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" :data="categoryList" :height="tableHeight()" border>
      <el-table-column label="序号" width="50" align="center" type="index" />
      <el-table-column label="名称" align="center" prop="name" width="130" />
      <el-table-column label="描述" align="center" prop="desc">
        <template slot-scope="scope">
          <div class="text-left">{{ scope.row.desc }}</div>
        </template>
      </el-table-column>
      <el-table-column label="图片" align="center" width="180">
        <template slot-scope="{ row }">
          <preview-img :url="row.img" :srcList="[row.img]" />
        </template>
      </el-table-column>
      <el-table-column label="是否开启送样" align="center" width="80">
        <template slot-scope="{ row }">
          <el-tag :type="row.isSample === '1' ? 'success' : 'danger'">{{ row.isSample === '1' ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" width="80" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" width="80" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <Tooltip v-if="checkPermi(['third:dev:edit']) || checkRole(['admin'])" icon="el-icon-edit" content="编辑"
            @click="handleUpdate(scope.row)" />
          <Tooltip v-if="checkPermi(['third:dev:auth']) || checkRole(['admin'])" icon="el-icon-delete"
            :className="['text-red']" content="删除" @click="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :close-on-click-modal="false" :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" @submit.native.prevent>
        <el-form-item label="名称:" prop="name">
          <el-input v-model="form.name" placeholder="请输入品类名称" @keyup.enter.native.prevent="submitForm" />
        </el-form-item>
        <el-form-item label="描述:" prop="desc">
          <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" v-model="form.desc" placeholder="请输入品类描述" />
        </el-form-item>
        <el-form-item label="图片:" class="img-box">
          <DrUpload class="upload-img-box" listType="picture-card" :limit="1" pclass="flex" v-model="form.img">
            <div class="text-center">
              <i class="el-icon-plus"></i>
            </div>
          </DrUpload>
        </el-form-item>
        <el-form-item label="是否开启送样:">
          <el-radio-group v-model="form.isSample">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="请确认是否删除" :visible.sync="delDialogVisible" width="30%" center :close-on-click-modal="false">
      <el-row style="display: flex">
        <el-input auto-complete="off" placeholder="验证码" v-model="auth.code" style="width: 60%; margin-right: 20px">
        </el-input>
        <img @click="getCode" :src="codeUrl" />
      </el-row>

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
  detailCategory,
  addCategory,
  editCategory,
} from "@/api/third/category";
import { getCodeImg } from "@/api/base/code";

export default {
  name: "BikeCategory",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      codeUrl: "",
      auth: { id: undefined, status: 1, code: undefined, uuid: undefined },
      delDialogVisible: false,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 用户表格数据
      categoryList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      // 日期范围
      dateRange: [],
      genderOptions: [],
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
  created() {
    this.getCode();
  },
  mounted() {
    this.getList();
  },
  methods: {
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      listCategory(this.queryParams).then((response) => {
        this.categoryList = response.data.list;
        this.total = response.data.total;
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
      this.getCode();
      if (status === 1) {
        if (this.auth.code) {
          authCategory(this.auth).then((response) => {
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
      this.getCode();
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
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
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
      this.reset();
      this.open = true;
      this.title = "添加品类";
    },
    handleUpdate(row) {
      // this.reset();
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
<style lang="scss">
.img-box {
  .upload-img-box {
    .el-upload-list__item {
      width: 100px !important;
      height: 100px !important;
    }
  }
}
</style>