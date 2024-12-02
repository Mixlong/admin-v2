<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="客户名称" prop="customerName">
        <el-autocomplete
          size="small"
          clearable
          v-model="queryParams.customerName"
          :fetch-suggestions="querySearchAsync"
          placeholder="请输入客户名称"
          @select="handleQuery"
        ></el-autocomplete>
      </el-form-item>
      <el-form-item label="产品品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          filterable
          placeholder="请选择产品品类"
          @change="handleQuery"
        >
          <el-option
            v-for="item in typeCategoryList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="送样单号" prop="number">
        <select-loadMore
          v-model="queryParams.number"
          :data="sampleNumberData.data"
          :page="sampleNumberData.page"
          :hasMore="sampleNumberData.more"
          :request="getSampleNumberList"
          placeholder="请选择送样单号"
        />
      </el-form-item>
      <el-form-item label="属性" prop="typeName">
        <el-input
          v-model="queryParams.typeName"
          clearable
          placeholder="请输入属性"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
        >
          重置
        </el-button>
      </el-form-item>
      <el-row :gutter="10" class="fr mt5">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            v-hasPermi="['third:isType:add']"
            @click="handleAdd"
          >
            新增
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      :data="typeList"
      :height="tableHeight()"
      border
      @cell-click="cellClick"
    >
      <el-table-column label="序号" width="50" type="index" align="center" />
      <el-table-column
        label="外发客户"
        prop="customerName"
        align="center"
        width="120"
      />
      <el-table-column
        label="产品品类"
        prop="categoryName"
        align="center"
        width="130"
      />
      <el-table-column
        label="送样单号"
        prop="number"
        align="center"
        width="160"
      />
      <el-table-column
        label="属性"
        prop="typeName"
        align="center"
        width="160"
      />
      <el-table-column label="描述" prop="orderDesc" show-overflow-tooltip />
      <el-table-column
        label="下载口令"
        align="center"
        width="140"
        show-overflow-tooltip
      >
        <template slot-scope="{ row }" v-if="row.downloadPassword">
          <el-tooltip effect="dark" content="点击复制下载口令" placement="top">
            <el-button type="text">{{ row.downloadPassword }}</el-button>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        label="有效期至"
        prop="expiryDate"
        align="center"
        width="160"
      >
        <template slot-scope="{ row }">
          <div v-if="row.status && !timeOut(row.expiryDate)">
            {{ parseTime(row.expiryDate) }}
          </div>
          <template v-if="!row.status">
            <el-tag type="danger" size="mini">已禁用</el-tag><br />
          </template>
          <el-tag type="danger" size="mini" v-if="timeOut(row.expiryDate)">
            已过期
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建人"
        align="center"
        prop="createName"
        width="120"
      />
      <el-table-column
        label="审核状态"
        align="center"
        prop="createTime"
        width="150"
      >
        <template slot-scope="{ row }">
          <div v-if="!row.testState">
            <p class="text-blue">{{ row.testUserName }}(测试)</p>
            待审核
          </div>
          <div v-if="row.testState && !row.pmState">
            <p class="text-blue">{{ row.pmUserName }}(产品经理)</p>
            待审核
          </div>
          <div v-if="row.testState && row.pmState && !row.dmState">
            <p class="text-blue">{{ row.dmUserName }}(部门经理)</p>
            待审核
          </div>
          <span
            class="text-green"
            v-if="row.testState && row.pmState && row.dmState"
            >已完成</span
          >
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="160"
      >
        <template slot-scope="{ row }">
          <el-button
            v-if="row.isState"
            v-hasPermi="['third:isType:check']"
            type="text"
            class="text-green"
            @click="onCheck(row)"
          >
            审核
          </el-button>
          <el-button
            type="text"
            class="text-orange"
            v-if="row.file"
            v-hasPermi="['third:isType:download']"
            @click="urlDownload(row.file)"
          >
            下载
          </el-button>
          <el-button
            v-if="row.isEditAndForbid"
            v-hasPermi="['third:isType:statusCheck']"
            type="text"
            :class="[row.status ? 'text-red' : 'text-blue']"
            @click="onDisable(row)"
          >
            {{ row.status ? "禁用" : "启用" }}
          </el-button>
          <el-button
            v-if="row.isEditAndForbid"
            v-hasPermi="['third:isType:update']"
            type="text"
            @click="handleUpdate(row)"
          >
            编辑
          </el-button>
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
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="open"
      width="800px"
      top="5vh"
      append-to-body
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="80px"
        @submit.native.prevent
        class="form-data-inline"
        inline
        label-position="left"
      >
        <el-form-item label="客户名称:" prop="customerName">
          <el-autocomplete
            style="width: 100%"
            size="small"
            clearable
            v-model="form.customerName"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入客户名称"
            @select="handleQuery"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="产品品类:" prop="categoryId">
          <el-select
            v-model="form.categoryId"
            filterable
            placeholder="请选择产品品类"
            clearable
          >
            <el-option
              v-for="item in typeCategoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="送样单号" prop="number">
          <select-loadMore
            v-model="form.number"
            :data="sampleNumberData.data"
            :page="sampleNumberData.page"
            :hasMore="sampleNumberData.more"
            :request="getSampleNumberList"
            placeholder="请选择送样单号"
          />
        </el-form-item>
        <el-form-item label="描述:" prop="orderDesc" style="width: 97%">
          <el-input
            type="textarea"
            v-model="form.orderDesc"
            placeholder="请输入描述"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </el-form-item>
        <el-row>
          <el-form-item label="有效期至:" prop="expiryDate">
            <el-date-picker
              v-model="form.expiryDate"
              type="datetime"
              placeholder="选择日期时间"
              align="right"
              :picker-options="pickerOptions"
              format="yyyy-MM-dd HH:mm:ss"
              :default-time="defaultTime"
              value-format="timestamp"
            >
            </el-date-picker>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="外发文件:" prop="file" style="width: 100%">
            <el-row type="flex">
              <el-col :span="20">
                <el-input v-model="form.file" readonly></el-input>
              </el-col>
              <el-col :span="3">
                <DrUpload
                  style="margin-left: 10px"
                  :limit="1"
                  v-model="form.file"
                  :isOnePic="1"
                  :showFileList="false"
                >
                  <div class="text-left">
                    <el-button type="primary" size="mini">点击上传</el-button>
                  </div>
                </DrUpload>
              </el-col>
            </el-row>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="审核指定:"></el-form-item>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="测试" prop="testUserId">
              <el-select
                v-model="form.testUserId"
                clearable
                placeholder="请选择测试人员"
              >
                <el-option
                  v-for="item in testList"
                  :key="item.userId"
                  :label="item.userName"
                  :value="+item.userId"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="产品经理" prop="pmUserId">
              <el-select
                v-model="form.pmUserId"
                clearable
                placeholder="请选择产品经理"
              >
                <el-option
                  v-for="item in productList"
                  :key="item.userId"
                  :label="item.userName"
                  :value="+item.userId"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="部门审核" prop="dmUserId">
              <el-select
                v-model="form.dmUserId"
                clearable
                placeholder="请选择部门审核"
              >
                <el-option
                  v-for="item in managerList"
                  :key="item.userId"
                  :label="item.userName"
                  :value="+item.userId"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="isLoading" @click="submitForm"
          >确 定</el-button
        >
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <CompUpdate ref="compUpdate" :formObj="formObj" :UserList="UserList" />
  </div>
</template>

<script>
import { getCodeImg } from "@/api/base/code";
import { commonJs } from "@/mixins/common";
import { typeCategory } from "@/api/third/category";
import {
  listManagement,
  detailCategory,
  authManagement,
  listEdit,
  listCreate,
  dictUserList,
} from "@/api/third/isType";
import { listCustomer, sampleNumberList } from "@/api/third/sample";

export default {
  name: "FileIsType",
  mixins: [commonJs],
  data() {
    return {
      isLoading: false,
      typeCategoryList: [],
      UserList: [],
      testList: [],
      productList: [],
      managerList: [],
      formObj: {},
      value: "",
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      codeUrl: "",
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 用户表格数据
      typeList: [],
      roleTypeDictList: [],
      roleTypeDictMap: {},
      roleTypeDictMap2: {},
      auth: { id: undefined, status: 1, code: undefined, uuid: undefined },
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      // 日期范围
      dateRange: [],
      genderOptions: [],
      sampleNumberData: {
        data: [],
        page: 1,
        more: true,
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        customerName: "",
        categoryName: "",
        number: "",
      },
      // 表单参数
      form: {
        up: "",
      },
      // 表单校验
      rules: {
        customerName: [
          { required: true, message: "客户名称不能为空", trigger: "change" },
        ],
        categoryId: [
          { required: true, message: "产品品类不能为空", trigger: "change" },
        ],
        number: [
          { required: true, message: "送样单号不能为空", trigger: "change" },
        ],
        expiryDate: [
          { required: true, message: "有效期不能为空", trigger: "change" },
        ],
        file: [
          { required: true, message: "外发文件不能为空", trigger: "change" },
        ],
        testUserId: [
          { required: true, message: "测试人员不能为空", trigger: "change" },
        ],
        pmUserId: [
          { required: true, message: "产品经理不能为空", trigger: "change" },
        ],
        dmUserId: [
          { required: true, message: "部门审核不能为空", trigger: "change" },
        ],
      },
      defaultTime: this.moment().format("HH:mm:ss"),
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() <= Date.now() - 24 * 3600 * 1000;
        },
        shortcuts: [
          {
            text: "1小时后",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一天后",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一周后",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一个月后",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 30);
              picker.$emit("pick", date);
            },
          },
        ],
      },
    };
  },
  components: {
    CompUpdate: () => import("./components/update"),
  },
  computed: {
    timeOut() {
      return (time) => {
        const now = Date.now();
        return time < now;
      };
    },
  },
  created() {
    this.getCode();
    this.getTypeCategory();
    this.getDictUserList();
    // this.getListCustomer()
  },
  mounted() {
    this.getList();
  },
  methods: {
    getSampleNumberList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        sampleNumberList({
          p: page,
          num: keyword,
        }).then((res) => {
          let { list, total, pageNum, pageSize } = res.data;
          if (list.length) {
            list = list.map((item) => {
              return {
                label: item,
                value: item,
              };
            });
          }
          if (more) {
            this.sampleNumberData.data = [
              ...this.sampleNumberData.data,
              ...list,
            ];
          } else {
            this.sampleNumberData.data = list;
          }
          this.sampleNumberData.more = pageNum * pageSize < total;
          this.sampleNumberData.page = pageNum;
          resolve();
        });
      });
    },
    handleStatus(row) {
      this.formObj = row;
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.active = -1;
    },
    cellClick(row, column) {
      // if(!row.isState) {
      //   return
      // }
      if (column.label === "审核状态") {
        this.handleStatus(row);
      } else if (column.label === "下载口令") {
        this.onCopy(row.downloadPassword);
      }
    },
    querySearchAsync(queryString, cb) {
      listCustomer({ key: queryString || "" }).then((res) => {
        cb(
          res.data.map((item) => {
            return {
              value: item.name,
            };
          })
        );
      });
    },
    getTypeCategory() {
      typeCategory().then((res) => {
        this.typeCategoryList = res.data;
      });
    },
    getDictUserList() {
      dictUserList().then((res) => {
        this.UserList = res.data;
        this.testList = res.data.filter((item) => item.roleKey === "test");
        this.productList = res.data.filter(
          (item) => item.roleKey === "product"
        );
        this.managerList = res.data.filter(
          (item) => item.roleKey === "project_manager"
        );
      });
    },
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      listManagement(this.queryParams).then((response) => {
        this.typeList = response.data.list;
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
    getRoleName(roleId) {
      if (this.roleTypeDictMap[roleId]) {
        return this.roleTypeDictMap[roleId].roleName;
      }
      return undefined;
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

    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "新增外发文件";
    },
    handleUpdate(row) {
      this.reset();
      this.form = Object.assign({}, row);
      console.log(this.form);
      this.open = true;
      this.title = "编辑外发文件";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.isLoading = true;
          if (this.form.id !== undefined) {
            listEdit(this.form.id, this.form)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                }
              })
              .finally(() => {
                this.isLoading = false;
              });
          } else {
            listCreate(this.form)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                }
              })
              .finally(() => {
                this.isLoading = false;
              });
          }
        }
      });
    },
    // 审核
    onCheck(row) {
      this.$confirm("文件是否通过审核?", "文件审核", {
        confirmButtonText: "通过",
        cancelButtonText: "不通过",
        type: "warning",
      })
        .then(() => {
          let reviewer = null;
          if (!row.testState) {
            reviewer = 1;
          } else if (row.testState && !row.pmState) {
            reviewer = 2;
          } else if (row.testState && row.pmState && !row.dmState) {
            reviewer = 3;
          }
          detailCategory({ id: row.id, state: 1, reviewer }).then((res) => {
            this.warningMessage("审核通过!", 1);
            this.getList();
          });
        })
        .catch(() => {});
    },
    // 禁用
    onDisable(row) {
      this.$confirm("你确定要禁用吗?", "禁用", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          authManagement({ id: row.id, status: row.status ? 0 : 1 }).then(
            (res) => {
              this.warningMessage(`${row.status ? "禁用" : "启用"}成功`, 1);
              this.getList();
            }
          );
        })
        .catch(() => {});
    },
    // 复制下载口令
    onCopy(val) {
      this.$copyText(val).then(
        () => {
          this.warningMessage("口令复制成功", 1);
        },
        () => {
          this.warningMessage("口令复制失败", 3);
        }
      );
    },
  },
};
</script>

<style lang="scss">
.checkbox-wrap {
  .el-form-item__content {
    width: 80%;
  }
}
</style>
