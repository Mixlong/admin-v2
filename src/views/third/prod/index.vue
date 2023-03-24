<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属品类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          @change="changeCategory"
          placeholder="请选择"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="仪表型号" prop="computerModel">
        <el-select
          v-model="queryParams.computerModel"
          placeholder="请选择"
          @change="changeComputer"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.model"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="ERP编码" prop="erp">
        <el-input
          v-model="queryParams.erp"
          placeholder="请输入ERP编码"
          clearable
          size="small"
          style="width: 185px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="brandList"
      @selection-change="handleSelectionChange"
      :height="tableHeight()"
      border
    >
      <el-table-column label="序号" width="58" type="index" />
      <el-table-column label="品类" prop="category" :show-overflow-tooltip="true" />
      <el-table-column label="型号" prop="computer" :show-overflow-tooltip="true" />
      <el-table-column label="ERP编码" prop="erp" :show-overflow-tooltip="true" />
      <el-table-column label="属性" prop="typeName" :show-overflow-tooltip="true" />
      <el-table-column label="属性描述" prop="content" :show-overflow-tooltip="true" />
      <el-table-column label="创建人" align="center">
        <template slot-scope="{ row }">{{ row.createBy || row.updateBy }}</template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="{ row }">{{ row.createTime ? row.createTime : row.updateTime }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template slot-scope="scope">
          <el-button v-show="scope.row.status === 0 && scope.row.url" icon="el-icon-download" size="mini" type="text"
            @click="
              downloadFile(
                scope.row.url,
                scope.row.computerModel,
                scope.row.name,
                getType(scope.row.type)
              )
            "
          >
          下载
        </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l" @pagination="getList" />
    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :close-on-click-modal="false" :title="title" :visible.sync="open" width="540px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="150px" class="form-data" :inline="false">
        <el-form-item label="品类" prop="categoryId">
          <el-select v-model="form.categoryId" clearable @change="changeCategory2" size="small" style="width: 185px">
            <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="型号" prop="computerModel">
          <el-select v-model="form.computerModel" clearable size="small" style="width: 185px" @change="$forceUpdate()">
            <el-option v-for="dict in computerFormOptions" :key="dict.model" :label="dict.name" :value="dict.model" />
          </el-select>
        </el-form-item>
        <el-form-item label="属性" prop="type">
          <el-select v-model="form.type" clearable size="small" style="width: 185px" disabled @change="$forceUpdate()">
            <el-option v-for="dict in fileTypeList" :key="dict.key" :label="dict.value" :value="dict.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="属性描述" prop="content">
          <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" v-model="form.content" placeholder="请输入文件描述" style="width: 185px" />
        </el-form-item>
        <el-form-item label="文件" prop="url">
          <el-upload
            class="upload-demo"
            :action="actionUrl"
            :on-remove="handleRemove"
            :on-success="uploadSuccess"
            :limit="1"
            :on-exceed="handleExceed"
            :file-list="urls"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listFactoryFileConfig,
  authFileConfig,
  addFileConfig,
  editFileConfig,
  categoryComputerDict,
} from "@/api/third/fileConfig";
import { listType } from "@/api/third/category";
import reqUrl from "@/utils/requestUrl";
import axios from "axios";
export default {
  components: {
    history,
  },
  name: "BikeFileConfig",
  filters: {},
  data() {
    let validateUpload = (rule, value, callback) => {
      if (this.form.url) {
        callback();
      } else {
        callback(new Error("请上传文件"));
      }
    };
    return {
      urls: [],
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
      brandList: [],
      statusOptions: [
        { key: "已审核", value: 0 },
        { key: "未通过", value: 1 },
      ],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      // 日期范围
      dateRange: [],
      fileList: [],
      categoryOptions: [],
      dictList: [],
      computerOptions: [],
      computerFormOptions: [],
      fileTypeList: [],
      fileListCover: [],
      actionUrl: reqUrl + "/oss/batch-upload",

      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        status: undefined,
        key: undefined,
        type: undefined,
        computerModel: undefined,
        categoryId: undefined,
        erp: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        computerModel: [
          { required: true, message: "所属仪表不能为空", trigger: "blur" },
        ],
        type: [
          { required: true, message: "文件类型不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    listType().then((response) => {
      this.fileTypeList = response.data;
    });
  },
  mounted() {
    categoryComputerDict().then((response) => {
      this.dictList = response.data;

      let type = this.$route.query.type;
      if (type) {
        this.queryParams.type = type;
      }
      let categoryId = this.$route.query.categoryId;

      if (categoryId) {
        this.queryParams.categoryId = categoryId;
        this.changeCategory(categoryId);
        let computerModel = this.$route.query.model;
        if (computerModel) {
          this.queryParams.computerModel = computerModel;
        }
      }

      this.getList();
    });
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      listFactoryFileConfig(this.queryParams).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    getType(type) {
      return this.fileTypeList.filter((item) => item.dictValue === type)[0]
        .dictLabel;
    },
    changeCategory(val) {
      this.queryParams.computerModel = "";
      this.getList();
      return new Promise((resove) => {
        this.computerOptions = this.dictList.filter(
          (item) => item.id === val
        )[0].computerList;
        resove();
      });
    },
    changeComputer(val) {
      this.getList();
    },
    changeStatus(val) {
      this.getList();
    },
    changeType(val) {
      this.getList();
    },
    changeCategory2(val) {
      this.form.computerModel = "";
      return new Promise((resove) => {
        this.computerFormOptions = this.dictList.filter(
          (item) => item.id === val
        )[0].computerList;
        resove();
      });
    },
    downloadFile(url, title, name, modelName) {
      axios({
        method: "get",
        url,
        responseType: "arraybuffer",
      }).then((res) => {
        let headers = res.headers;
        let blob = new Blob([res.data], {
          type: headers["content-type"],
        });
        let link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        let ext = url.substr(url.lastIndexOf(".") + 1);
        link.download = title + "_" + modelName + "_" + name + "." + ext;
        link.click();
      });
    },

    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === 0 ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.name + '"吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.loading = true;
          let data = [];
          let authData = { id: row.id, status: row.status };
          data.push(authData);

          authFileConfig(data).then((response) => {
            this.msgSuccess(text + "成功");
            this.loading = false;
          });
        })
        .catch(function () {
          row.status = row.status === 0 ? 1 : 0;
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.urls = [];
      this.reset();
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
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
          authFileConfig(data).then((response) => {
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
      this.resetForm("form");
      for (let key in this.form) {
        this.form[key] = "";
      }
      delete this.form.id;
      this.open = true;
      this.form.url = null;
      this.urls = [];
      this.title = "添加";
      this.fileList = [];
      this.fileListCover = [];
      this.computerFormOptions = [];
    },
    handleHistory(item) {
      this.$router.push({ name: "FileHistory", query: item });
    },
    handleUpdate(row) {
      this.form = Object.assign({}, row);
      let computerModel = this.form.computerModel;
      this.urls = [];
      if (this.form.url) {
        let file = {
          name: this.form.url,
          url: this.form.url,
        };
        this.urls.push(file);
      }

      // this.reset();
      for (let key in this.form) {
        this.form[key] = row[key];
      }
      this.form.id = row.id;
      // this.form = this.extend(row);
      this.open = true;

      this.title = "修改";
      this.fileListCover = [{ name: row.url, url: row.url }];
      if (row.imgs) {
        let imgArr = row.imgs.split(",");
        let boxes = [];
        for (let key of imgArr) {
          boxes.push({
            response: {
              data: [
                {
                  url: key,
                },
              ],
            },
            name: key,
          });
        }
        this.fileList = boxes;
      }
      this.changeCategory2(this.form.categoryId);
      this.form.computerModel = computerModel;
    },
    uploadSuccess(res) {
      this.form.url = res.data[0].url;
      let file = {
        name: res.data[0].url,
        url: res.data[0].url,
      };
      this.urls = [];
      this.urls.push(file);
    },
    uploadSuccessTwo(res) {
      let imgs = res.data.map((item) => item.url);
      let old = this.form.imgs;
      let catImg = old ? old.split(",").concat(imgs) : imgs;
      this.form.imgs = catImg.toString();
    },
    handleRemove(file, fileList) {
      this.form.url = null;
    },
    handleRemoveTwo(file, fileList) {
      let url = fileList.map((item) => item.response.data[0].url);
      this.form.imgs = url.toString();
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
          files.length + fileList.length
        } 个文件`
      );
    },
    spImgs(val) {
      if (val) {
        return val.split(",");
      }
      return [];
    },
    sImgs(val) {
      if (val) {
        return val.split(",")[0];
      }
      return "";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            delete this.form.createTime;
            delete this.form.updateTime;
            delete this.form.updateBy;
            delete this.form.updateTime;
            editFileConfig(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.urls = [];
                this.getList();
              }
            });
          } else {
            addFileConfig(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.urls = [];
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
</style>
