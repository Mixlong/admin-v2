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
          clearable
          placeholder="请选择产品品类"
          @change="handleSelCategoryName"
        >
          <el-option
            v-for="item in typeCategoryList"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="产品型号" prop="computerName">
        <el-select
          v-model="queryParams.computerName"
          filterable
          clearable
          placeholder="请选择产品型号"
          @focus="getComputerNameData"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in computerNameOptions"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
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
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
      <el-row :gutter="10" class="fr">
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
        width="100"
      />
      <el-table-column label="产品品类" prop="categoryName" align="center" />
      <el-table-column label="产品型号" prop="computerName" align="center" />
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
      <el-table-column
        label="描述"
        prop="orderDesc"
        align="center"
        min-width="150"
      />
      <el-table-column
        label="文件类型"
        prop="orderDesc"
        align="center"
        width="100"
      >
        <template v-slot="{ row }">
          <el-tag v-if="row.type === '1'">大货仪表</el-tag>
          <el-tag v-if="row.type === '2'">送样仪表</el-tag>
          <el-tag v-if="row.type === '3'">其他</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="下载口令" align="center" width="110">
        <template slot-scope="{ row }" v-if="row.downloadPassword">
          <el-tooltip
            effect="dark"
            content="点击复制下载口令"
            placement="top"
            :disabled="!row.status"
          >
            <el-button type="text">{{ row.downloadPassword }}</el-button>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        label="有效期至"
        prop="expiryDate"
        align="center"
        width="140"
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
        width="90"
      />
      <el-table-column
        label="审核状态"
        align="center"
        prop="createTime"
        width="120"
      >
        <template slot-scope="{ row }">
          <div v-if="!row.testState">
            <div class="text-blue">{{ row.testUserName }}(测试)</div>
            <span class="text-red">待审核</span>
          </div>
          <!-- <div v-if="row.testState && !row.pmState">
            <p class="text-blue">{{ row.pmUserName }}(产品经理)</p>
            待审核
          </div>
          <div v-if="row.testState && row.pmState && !row.dmState">
            <p class="text-blue">{{ row.dmUserName }}(部门经理)</p>
            待审核
          </div> -->
          <span class="text-green" v-if="row.testState"> 已完成 </span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="120"
      >
        <template slot-scope="{ row }">
          <Tooltip
            v-show="row.isEditAndForbid"
            v-hasPermi="['third:isType:update']"
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(row)"
          />

          <Tooltip
            class="text-green"
            v-show="row.isState"
            v-hasPermi="['third:isType:check']"
            icon="el-icon-s-check"
            content="审核"
            @click="onCheck(row)"
          />

          <Tooltip
            :class="[row.status ? 'text-red' : 'text-green']"
            v-show="row.isEditAndForbid"
            v-hasPermi="['third:isType:statusCheck']"
            icon="el-icon-folder-checked"
            :content="row.status ? '禁用' : '启用'"
            @click="onDisable(row)"
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
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="open"
      width="800px"
      top="5vh"
      append-to-body
      center
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="85px"
        label-position="left"
      >
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerName">
              <el-autocomplete
                v-model="form.customerName"
                clearable
                placeholder="请输入客户名称"
                :fetch-suggestions="querySearchAsync"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="产品品类" prop="categoryId">
              <el-select
                v-model="form.categoryId"
                filterable
                placeholder="请选择产品品类"
                clearable
                style="width: 100%"
                @change="handleResetComputerData"
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
          </el-col>

          <el-col :span="12">
            <el-form-item label="仪表型号" prop="computerId">
              <el-select
                v-model="form.computerId"
                filterable
                clearable
                placeholder="请选择仪表型号"
                style="width: 100%"
                @focus="getComputerData"
              >
                <el-option
                  v-for="dict in computerOptions"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="送样单号" prop="number">
              <select-loadMore
                v-model="form.number"
                :data="sampleNumberData.data"
                :page="sampleNumberData.page"
                :hasMore="sampleNumberData.more"
                :request="getSampleNumberList"
                placeholder="请选择送样单号"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="有效期至" prop="expiryDate">
              <el-date-picker
                v-model="form.expiryDate"
                type="datetime"
                placeholder="选择日期时间"
                align="right"
                :picker-options="pickerOptions"
                format="yyyy-MM-dd HH:mm:ss"
                :default-time="defaultTime"
                value-format="timestamp"
                style="width: 100%"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>

          <el-col>
            <el-form-item label="文件类型" prop="type">
              <el-radio-group
                v-model="form.type"
                size="mini"
                @change="handleSelType"
              >
                <el-radio label="1" border>大货仪表</el-radio>
                <el-radio label="2" border>送样仪表</el-radio>
                <el-radio label="3" border>其他</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <transition name="fade">
            <div class="margin-bottom-xs">
              <el-table :data="form.list" border>
                <el-table-column
                  label="序号"
                  width="80"
                  type="index"
                  align="center"
                />

                <el-table-column
                  label="文件类型"
                  prop="fileName"
                  width="120px"
                  align="center"
                />
                <el-table-column label="文件名称" prop="file" align="center">
                  <template v-slot="{ row }">
                    {{ getFileName(row.file) }}
                  </template>
                </el-table-column>

                <el-table-column label="操作" align="center" width="160px">
                  <template v-slot="{ row, $index }">
                    <div class="flex justify-between">
                      <DrUpload
                        v-if="form.type === '3'"
                        v-model="row.file"
                        :showFileList="false"
                        :isExceedTip="false"
                        :accept="acceptType($index)"
                      >
                      </DrUpload>

                      <el-button
                        v-else
                        size="mini"
                        type="primary"
                        @click="handleAddCad(row, $index)"
                      >
                        添加
                      </el-button>

                      <el-button
                        size="mini"
                        type="danger"
                        :disabled="!row.file"
                        @click="handleDelFile($index)"
                      >
                        删除
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </transition>

          <el-col class="margin-top-xs" v-if="form.type === '3'">
            <el-form-item label="审核人员" prop="testUserId">
              <el-select
                v-model="form.testUserId"
                clearable
                placeholder="请选择审核人员"
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
            <el-form-item label="描述:" prop="orderDesc">
              <el-input
                type="textarea"
                v-model="form.orderDesc"
                placeholder="请输入描述"
                :autosize="{ minRows: 3, maxRows: 5 }"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <!-- <el-col>
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
          </el-col> -->
          <!-- <el-col>
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
          </el-col> -->
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="isLoading" @click="submitForm">
          确 定
        </el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <CompUpdate ref="compUpdate" :formObj="formObj" :UserList="UserList" />

    <!-- 大货仪表 -->
    <CadFile ref="cadFileRef" @handleSendFile="handleSendFile"></CadFile>
    <!-- 送样仪表 -->
    <SendSampleCad
      ref="cadSampleFileRef"
      @handleSendFile="handleSendFile"
    ></SendSampleCad>
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
  listModelDict,
  listModelNameDict,
} from "@/api/third/isType";
import { listCustomer, sampleNumberList } from "@/api/third/sample";

const fileData = [
  {
    fileName: "BOOT文件",
    file: "",
  },
  {
    fileName: "APP文件",
    file: "",
  },
  {
    fileName: "UI文件",
    file: "",
  },
  {
    fileName: "车型配置文件",
    file: "",
  },
];

export default {
  name: "FileIsType",
  mixins: [commonJs],
  data() {
    return {
      isLoading: false,
      typeCategoryList: [],
      computerOptions: [],
      UserList: [],
      testList: [],
      productList: [],
      managerList: [],
      computerNameOptions: [],
      formObj: {},
      value: "",
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      codeUrl: "",
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
        computerName: "",
        number: "",
        typeName: "",
      },
      // 表单参数
      form: {
        categoryId: "",
        computerId: "",
        customerName: "",
        number: "",
        expiryDate: "",
        up: "",
        type: "",
        list: [],
        testUserId: "",
      },
      // 表单校验
      rules: {
        customerName: [
          { required: true, message: "客户名称不能为空", trigger: "change" },
        ],
        categoryId: [
          { required: true, message: "产品品类不能为空", trigger: "change" },
        ],
        computerId: [
          { required: true, message: "产品型号不能为空", trigger: "change" },
        ],
        number: [
          { required: true, message: "送样单号不能为空", trigger: "change" },
        ],
        expiryDate: [
          { required: true, message: "有效期不能为空", trigger: "change" },
        ],
        type: [
          { required: true, message: "文件类型不能为空", trigger: "change" },
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
    CadFile: () => import("./components/cadFile.vue"),
    SendSampleCad: () => import("./components/sendSampleCad.vue"),
  },
  computed: {
    timeOut() {
      return (time) => {
        const now = Date.now();
        return time < now;
      };
    },
    acceptType() {
      return (index) => {
        const fileTypeData = {
          0: ".bin",
          1: ".bin,.hex",
          2: ".bin,.txt",
          3: ".json",
        };

        if (this.form.type === "3") {
          return fileTypeData[index];
        }
      };
    },
    getFileName() {
      return (fileUrl) => {
        if (fileUrl) {
          const regex = /[^\/]*$/;
          const filename = fileUrl.match(regex)[0];

          return filename;
        }
      };
    },
  },
  watch: {
    "form.type"(type) {
      if (type !== "3") {
        this.clearValidateItem("form", "testUserId");
        this.clearValidateItem("form", "file");
      }
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
      if (!row.status) {
        return;
      }
      if (column.label === "审核状态") {
        // this.handleStatus(row);
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
      this.form = {
        categoryId: "",
        computerId: "",
        customerName: "",
        number: "",
        expiryDate: "",
        up: "",
        type: "3",
        list: fileData,
        testUserId: "",
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

    async handleUpdate(row) {
      this.reset();
      this.form = Object.assign({}, row);
      const { type, list } = this.form;

      list.forEach((item, index) => {
        item.fileName = fileData[index].fileName;
      });

      await this.getComputerData();

      this.open = true;
      this.title = "编辑外发文件";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let { type, list } = this.form;

          const isFileEmpty = list.every((item) => item.file === "");
          if (isFileEmpty) {
            this.msgWarning("升级文件至少有一项");
            return;
          }

          const fileTypeObj = {
            0: "BOOT",
            1: "APP",
            2: "UI",
            3: "JSON",
          };

          list.forEach((item, index) => {
            item.type = fileTypeObj[index];
          });

          this.form.list = list;

          if (type !== "3") {
            this.form.testUserId = "";
          }

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
    // 文件类型
    handleSelType(type) {
      fileData.forEach((item) => (item.file = ""));
      this.$set(this.form, "list", fileData);
      console.log("this.form", this.form, fileData);
    },
    // 软件数据
    handleAddCad(row, index) {
      console.log(row, this.form);
      const { type, categoryId, computerId, number, customerName } = this.form;
      if (!categoryId || !computerId) {
        this.msgWarning("请先选择品类和型号");
        return;
      }

      if (type === "1") {
        this.$refs.cadFileRef.isDrawer = true;
        this.$refs.cadFileRef.queryParams.categoryId = categoryId;
        this.$refs.cadFileRef.queryParams.computerId = computerId;
        this.$refs.cadFileRef.fileType = index;
        this.$refs.cadFileRef.selectedFile = row.file;
        this.$refs.cadFileRef.getList();
      }

      if (type === "2") {
        if (!number) {
          this.msgWarning("请先选择送样单号");
          return;
        }
        this.$refs.cadSampleFileRef.isDrawer = true;
        this.$refs.cadSampleFileRef.queryParams.categoryId = categoryId;
        this.$refs.cadSampleFileRef.queryParams.number = number;
        this.$refs.cadSampleFileRef.fileType = index;
        this.$refs.cadSampleFileRef.selectedFile = row.file;
        this.$refs.cadSampleFileRef.getList();
      }
    },
    handleDelFile(delIndex) {
      this.form.list[delIndex].file = "";
    },
    // 型号
    getComputerData() {
      return new Promise((resolve, reject) => {
        const { categoryId } = this.form;
        if (!categoryId) return;
        listModelDict(categoryId).then((res) => {
          this.computerOptions = res.data;

          resolve();
        });
      });
    },
    getComputerNameData() {
      return new Promise((resolve, reject) => {
        const { categoryName } = this.queryParams;
        if (!categoryName) return;
        listModelNameDict(categoryName).then((res) => {
          this.computerNameOptions = res.data;

          resolve();
        });
      });
    },
    handleSelCategoryName() {
      this.computerNameOptions = [];
      this.queryParams.computerName = "";
    },
    handleResetComputerData() {
      this.form.computerId = "";
      this.computerOptions = [];
    },
    // 软件数据选择值
    handleSendFile({ fileUrl, fileType }) {
      this.form.list[fileType].file = fileUrl;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
</style>
