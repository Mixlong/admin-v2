<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="来源" prop="source">
        <el-input
          size="small"
          v-model="queryParams.source"
          placeholder="请输入来源"
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item label="版块" prop="plate">
        <el-select
          @change="handleQuery"
          v-model="queryParams.plate"
          placeholder="请选择"
          style="width: 100%"
          size="small"
        >
          <el-option
            v-for="(item, index) in plateOptions"
            :key="index"
            :label="item.label"
            :value="item.value"
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
      <el-row :gutter="20" class="fr mt5 flex align-center">
        <el-col :span="15">
          <el-checkbox v-model="queryParams.state" @change="handleQuery"
            >显示已完成</el-checkbox
          >
        </el-col>
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

    <el-table
      :row-class-name="rowName"
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      border
      @cell-click="cellClick"
      :cell-style="cellStyle"
    >
      <el-table-column label="序号" type="index" width="50" align="center">
        <template slot-scope="scope">
          <span>{{
            (queryParams.p - 1) * queryParams.l + scope.$index + 1
          }}</span>
        </template>
      </el-table-column>

      <el-table-column label="来源" prop="source" align="center" width="100" />

      <el-table-column
        label="版块"
        prop="plate"
        align="center"
        width="55"
        :formatter="plateName"
      />
      <el-table-column label="需求详情" prop="description" align="center">
        <template slot-scope="scope">
          <div class="text-left" v-html="scope.row.detail"></div>
        </template>
      </el-table-column>

      <el-table-column
        label="责任人"
        prop="principal"
        align="center"
        width="63"
        :formatter="principalName"
      />

      <el-table-column label="实现方案" prop="report" align="center">
        <template slot-scope="scope">
          <el-row class="flex">
            <el-col :span="18">
              <div class="text-left" v-html="scope.row.scheme"></div>
            </el-col>
            <el-col :span="6" class="flex align-center justify-center">
              <img
                v-if="scope.row.schemeAtt"
                class="margin-left-xs"
                style="width: 17px; height: 17px; cursor: pointer"
                :src="require('@/assets/image/xiazai.png')"
                alt=""
                @click.stop="handleDownloadProgress(scope.row)"
              />
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="导入计划" prop="plan" align="center">
        <template slot-scope="scope">
          <div class="text-left" v-html="scope.row.plan"></div>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="plan" align="center" width="65">
        <template slot-scope="scope">
          <span v-if="scope.row.state == 0" class="text-gray">待接收</span>
          <span v-if="scope.row.state == 1" class="text-blue">接收</span>
          <span v-if="scope.row.state == 2" class="text-red">拒绝</span>
          <span v-if="scope.row.state == 3" class="text-green">完成</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="100"
        fixed="right"
        class-name="small-padding fixed-width  "
      >
        <template slot-scope="scope">
          <div style="padding-left: 8px" class="text-left">
            <Tooltip
              v-if="scope.row.createUser == userId || checkRole(['admin'])"
              icon="el-icon-edit"
              content="编辑"
              @click="handleUpdate(scope.row)"
            />
            <el-tooltip
              class="item font16"
              effect="dark"
              content="同意"
              placement="top-end"
              v-if="
                scope.row.state == 0 &&
                (scope.row.principal == userId || checkRole(['admin']))
              "
            >
              <el-button
                size="small"
                icon="el-icon-check"
                type="text"
                class="text-green"
                @click="handleAuthChange(scope.row, 1)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item font16"
              effect="dark"
              content="拒绝"
              placement="top-end"
              v-if="
                scope.row.state == 0 &&
                (scope.row.principal == userId || checkRole(['admin']))
              "
            >
              <img
                class="margin-lr-xs"
                style="
                  width: 14px;
                  cursor: pointer;
                  vertical-align: middle;
                  position: relative;
                  top: -3px;
                "
                :src="require('@/assets/image/reject.png')"
                alt=""
                @click="handleAuthChange(scope.row, 2)"
              />
            </el-tooltip>
            <el-tooltip
              class="item font16"
              effect="dark"
              content="完成"
              placement="top-end"
              v-if="
                scope.row.state == 1 &&
                (scope.row.principal == userId || checkRole(['admin']))
              "
            >
              <el-button
                size="small"
                icon="el-icon-check"
                type="text"
                class="text-green"
                @click="handleAuthChange(scope.row, 3)"
              ></el-button>
            </el-tooltip>

            <!-- <el-button
              size="mini"
              type="text"
              class="text-red font16"
              icon="el-icon-delete"
              v-if="
                scope.row.principal == userId || scope.row.feedbackBy == userId
              "
              @click="handleDelete(scope.row)"
            >
            </el-button> -->
          </div>
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
      :pmDictListOptions="pmDictListOptions"
      :plateOptions="plateOptions"
    />
  </div>
</template>

<script>
import { demandList, demandAuth, demandState } from "@/api/third/demand";

import CompUpdate from "./components/update";
import JSZip from "jszip";
import FileSaver from "file-saver";
import axios from "axios";
import { mapGetters } from "vuex";
import { memberDictUser } from "@/api/system/user";
import FlipDown from "vue-flip-down";
export default {
  components: {
    CompUpdate,
    FlipDown,
  },

  filters: {},
  data() {
    return {
      form: {},
      urls: [],
      // 遮罩层
      loading: true,
      authDialogVisible: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      brandList: [],
      options: [
        {
          label: "接收",
          value: 1,
        },
        {
          label: "拒绝",
          value: 2,
        },
        {
          label: "完成",
          value: 3,
        },
      ],
      plateOptions: [
        {
          label: "APP",
          value: 1,
        },
        {
          label: "仪表",
          value: 2,
        },
        {
          label: "其他",
          value: 3,
        },
      ],
      pmDictListOptions: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        source: undefined,
        customer: undefined,
        state: undefined,
      },
    };
  },
  computed: {
    ...mapGetters(["userId"]),
  },
  mounted() {
    let { name } = this.$route.query;
    if (name) {
      this.queryParams.source = name;
    }
    memberDictUser().then((response) => {
      if (response.code === 200) {
        this.pmDictListOptions = response.data;
      }
      this.getList();
    });
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      let params = Object.assign({}, this.queryParams);
      params.state = params.state ? "1" : "";
      demandList(params).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },

    principalName(row) {
      let { pmDictListOptions } = this;
      let name = "";
      pmDictListOptions.forEach((item) => {
        if (item.dictValue == row.principal) {
          name = item.dictLabel;
        }
      });
      return name;
    },
    plateName(row) {
      let { plateOptions } = this;
      let name = "";
      plateOptions.forEach((item) => {
        if (item.value == row.plate) {
          name = item.label;
        }
      });
      return name;
    },
    handleDownload(row) {
      this.zipFile(row.attachment, row.source);
    },
    handleDownloadProgress(row) {
      this.zipFile(row.reportAttachment, row.source);
    },

    handleAdd() {
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.showName = "";
      this.$refs.compUpdate.title = "添加售后";
    },
    handleAuthChange(row, type) {
      let params = {};
      params.state = type;
      params.id = row.id;
      demandState(params).then((res) => {
        if (res.code == 200) {
          this.msgSuccess("操作成功！");
          this.getList();
        }
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

    handleUpdate(row, showName, title) {
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.$refs.compUpdate.showName = showName;
      this.$refs.compUpdate.title = title == undefined ? "修改需求" : title;
    },
    cellClick(row, column, cell, event) {
      switch (column.label) {
        case "实现方案":
          if (row.principal == this.userId || this.checkRole(["admin"]))
            this.handleUpdate(row, "scheme", "实现方案");
          break;
        case "导入计划":
          if (row.principal == this.userId || this.checkRole(["admin"]))
            this.handleUpdate(row, "plan", "");
          break;
        default:
          break;
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (
        (column.label == "实现方案" || column.label == "导入计划") &&
        (row.principal == this.userId || this.checkRole(["admin"]))
      ) {
        return `cursor: pointer;`;
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(
        '是否确认删产品名称为"' + row.product + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return demandAuth([{ id: row.id, status: 1 }]);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    //下载文件并压缩zip下载
    downfile(row, value) {
      let data = value.split(",");
      const zip = new JSZip();
      const cache = {};
      const promises = [];
      data.forEach((item) => {
        const promise = this.getFile(item).then((data) => {
          // 下载文件, 并存成ArrayBuffer对象
          const arr_name = item.split("/");
          const file_name = arr_name[arr_name.length - 1]; // 获取文件名
          zip.file(file_name, data, { binary: true }); // 逐个添加文件
          cache[file_name] = data;
        });
        promises.push(promise);
      });
      Promise.all(promises).then(() => {
        zip.generateAsync({ type: "blob" }).then((content) => {
          // 生成二进制流
          FileSaver.saveAs(content, `${row.source}.zip`); // 利用file-saver保存文件
        });
      });
    },
    getFile(url) {
      let that = this;
      return new Promise((resolve, reject) => {
        axios({
          method: "get",
          url,
          responseType: "arraybuffer",
          onDownloadProgress: function (progressEvent) {},
        })
          .then((data) => {
            resolve(data.data);
          })
          .catch((error) => {
            reject(error.toString());
          });
      });
    },

    rowName({ row, rowIndex }) {
      let styleJson = " ";

      if (row.state == 4) {
        return "finish-row";
      }
      return styleJson;
    },
  },
};
</script>
<style lang="scss"  scope >
.auth {
  text-align: center;
  margin-bottom: 10px;
}
.finish-row td,
.finish-row:hover td {
  background-color: rgba(155, 216, 148, 0.3) !important;
}
</style>
