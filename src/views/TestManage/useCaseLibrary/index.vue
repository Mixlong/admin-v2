<!--
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-04-17 15:09:51
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2023-11-17 16:24:57
 * @FilePath: \FILECONF-UI\src\views\TestManage\useCaseLibrary\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属模块：" prop="productType">
        <select-loadMore
          v-model="queryParams.productType"
          :data="moduleData.data"
          :page="moduleData.page"
          :hasMore="moduleData.more"
          dictLabel="productType"
          dictValue="productType"
          :request="getModuleList"
          placeholder="请选择模块"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="用例类型：" prop="type">
        <el-select
          v-model="queryParams.type"
          size="mini"
          filterable
          placeholder="请选择用例类型"
          @change="getList"
          style="width: 150px"
        >
          <el-option
            v-for="dict in useCaseTypeList"
            :key="dict.dictCode"
            :label="dict.dictValue"
            :value="dict.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态：" prop="state">
        <el-select
          v-model="queryParams.state"
          clearable
          placeholder="请选择审核状态"
          @change="getList"
          style="width: 150px"
        >
          <el-option
            v-for="(value, key) in stateList"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="产品状态：" prop="status">
        <el-select
          v-model="queryParams.status"
          clearable
          placeholder="请选择产品状态"
          @change="getList"
          style="width: 150px"
        >
          <el-option
            v-for="(value, key) in commonStatusList"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-select>
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
          重 置
        </el-button>
      </el-form-item>
      <div class="fr">
        <el-button
          v-if="checkRole(['test', 'admin']) && selectionList.length"
          type="danger"
          size="mini"
          @click="handleMulityCheck"
          class="margin-right-xs"
        >
          审核
        </el-button>
        <el-button
          v-if="checkRole(['test', 'admin'])"
          type="success"
          icon="el-icon-upload"
          size="mini"
          @click="handleUpload"
          class="margin-right-xs"
        >
          导入
        </el-button>
        <el-button
          v-if="checkRole(['test', 'admin'])"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >
          新增
        </el-button>
      </div>
    </el-form>
    <el-table
      ref="multipleTable"
      v-loading="loading"
      :data="list"
      row-key="id"
      :height="tableHeight()"
      @selection-change="handleSelectionChange"
      border
    >
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :reserve-selection="true"
        :selectable="checkSelectable"
      />
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="所属模块" prop="productName" align="center" />
      <el-table-column label="用例类型" prop="typeName" align="center" />
      <el-table-column label="测试项" prop="content" align="center" />
      <el-table-column label="前置条件" prop="preconditions" align="center" />
      <el-table-column label="输入与操作" prop="inter" align="center" />
      <el-table-column
        label="预期结果"
        prop="result"
        align="center"
        min-width="180"
      />
      <el-table-column label="审核状态" prop="state" align="center" width="90">
        <template slot-scope="{ row }">
          <el-tag :type="isStateType(row.state)" hit>{{
            stateList[row.state]
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatus(scope.row)"
          />
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
        width="150"
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="{ row }">
          <Tooltip
            v-if="checkRole(['test', 'admin'])"
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(row)"
          />
          <Tooltip
            v-if="checkRole(['test', 'admin']) && row.state !== 1"
            icon="el-icon-circle-check"
            content="审核"
            @click="handleCheck(row, false)"
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
      :visible.sync="dialogVisible"
      :title="title"
      :useCaseTypeList="useCaseTypeList"
    />

    <!-- 导入文件 -->
    <el-dialog
      :visible.sync="isUploadShow"
      width="410px"
      append-to-body
      top="-5vh"
      center
      :close-on-click-modal="false"
    >
      <el-upload
        class="upload-demo"
        ref="uploadExcel"
        action="#"
        :on-change="onChange"
        :http-request="handleFileUpload"
        :auto-upload="false"
        accept=".xlsx"
        :file-list="fileList"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传<em>xlsx</em>文件</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="isUploadLoading"
          @click="submitUpload"
          >确 定</el-button
        >
        <el-button @click="isUploadShow = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  testCaseList,
  taskCaseAuth,
  testCaseState,
  caseUpload,
} from "@/api/third/testApi";
import { commonStatusList } from "@/utils/commonData";
import CommonMinins from "@/views/TestManage/mixins";
import actionUrl from "@/utils/requestUrl";

export default {
  mixins: [CommonMinins],
  components: {
    CompUpdate: () => import("./components/update"),
  },
  data() {
    return {
      uploadUrl: actionUrl + "/test/case/input",
      isUploadLoading: false,
      // 文件列表
      fileList: [],
      // 导入文件
      isUploadShow: false,
      // 用例类型
      useCaseTypeList: [],
      // 审核状态
      stateList: {
        0: "待审核",
        1: "已批准",
        2: "已驳回",
      },
      commonStatusList,
      moduleData: {
        data: [],
        page: 1,
        more: true,
      },
      // 遮罩层
      loading: false,
      dialogVisible: false,
      isCheckDis: true,
      title: "",
      // 总条数
      total: 0,
      list: [],
      selectionList: [],
      // 品类
      dictList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        productType: "",
        status: "",
      },
    };
  },
  computed: {
    isStateType() {
      return (state) => {
        const stateTypeList = ["warning", "success", "danger"];
        return stateTypeList[state];
      };
    },
  },
  created() {
    this.getDicts("useCaseType").then((res) => {
      this.useCaseTypeList = res.data;
    });
    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      testCaseList(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    handleAdd() {
      this.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.title = "新增用例";
    },
    handleUpdate(row) {
      this.dialogVisible = true;
      this.$refs.compUpdate.reset();
      const { content, inter, preconditions, result } = row;
      const list = [
        {
          content,
          inter,
          preconditions,
          result,
        },
      ];
      this.$refs.compUpdate.form = Object.assign({ list }, row);
      this.title = "修改用例";
    },
    handleStatus(row) {
      let text = row.status ? "禁用" : "启用";
      this.$confirm(`确认要${text}吗？`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return taskCaseAuth([{ id: row.id, status: row.status }]);
        })
        .then(() => {
          this.msgSuccess(text + "成功");
        })
        .catch(() => {
          row.status = row.status ? 0 : 1;
        });
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
    checkSelectable(row) {
      return this.checkRole(["test", "admin"]) && row.state !== 1;
    },
    /** 批量审核  */
    handleMulityCheck() {
      this.handleCheck(this.selectionList, true);
    },
    handleSelectionChange(selection) {
      this.selectionList = selection.map(({ id, state }) => {
        return { id, state };
      });
    },
    /** 审核  */
    handleCheck(row, isMultityCheck) {
      this.$confirm("是否审核通过？", "警告", {
        distinguishCancelAndClose: true,
        confirmButtonText: "通 过",
        cancelButtonText: "驳 回",
        type: "warning",
      })
        .then(() => {
          let caseStateData = [];
          if (isMultityCheck) {
            caseStateData = row.map(({ id }) => {
              return { id, state: 1 };
            });
          } else {
            caseStateData = [{ id: row.id, state: 1 }];
          }
          return testCaseState(caseStateData);
        })
        .then(() => {
          this.selectionList = [];
          this.$refs.multipleTable.clearSelection();
          this.getList();
          this.msgSuccess("操作成功");
        })
        .catch((action) => {
          if (action === "cancel") {
            let caseStateData = [];
            if (isMultityCheck) {
              caseStateData = row.map(({ id }) => {
                return { id, state: 2 };
              });
            } else {
              caseStateData = [{ id: row.id, state: 2 }];
            }
            testCaseState(caseStateData).then(() => {
              this.getList();
              this.msgSuccess("操作成功");
            });
          }
        })
    },
    handleUpload() {
      this.isUploadShow = true;
      this.isUploadLoading = false;
      this.fileList = [];
    },
    onChange(file, fileList) {
      this.$refs.uploadExcel.clearFiles();
      this.fileList = fileList.slice(-1);
    },
    async handleFileUpload(file) {
      try {
        this.isUploadLoading = true;
        const formData = new FormData();
        formData.append("file", file.file);
        const { data } = await caseUpload(formData);
        if (data) {
          this.isUploadShow = false;
          this.isUploadLoading = false;
          this.msgSuccess("文件上传成功");

          this.handleQuery();
        }
      } catch (error) {
        this.isUploadLoading = false;
        console.error(error);
      }
    },
    submitUpload() {
      if (this.fileList.length === 0) {
        return this.msgError("请上传文件");
      } else {
        this.$refs.uploadExcel.submit();
      }
    },
  },
};
</script>
