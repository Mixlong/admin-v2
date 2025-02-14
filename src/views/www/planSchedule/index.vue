<template>
  <div class="app-container">
    <transition name="fade-transform-tb">
      <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
        v-show="showSearch"
      >
        <el-form-item label="所属品类" prop="categoryId">
          <el-select
            v-model="queryParams.categoryId"
            filterable
            allow-create
            clearable
            @change="changeCategory"
            style="width: 140px"
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
        <el-form-item label="仪表型号" prop="computerId">
          <el-select
            v-model="queryParams.computerId"
            :loading="isCLoading"
            filterable
            remote
            clearable
            @change="getList"
            :remote-method="getComputerNameList"
            style="width: 140px"
          >
            <el-option
              v-for="dict in computerOptions"
              :key="dict.model"
              :label="dict.name"
              :value="dict.model"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="迪太订单号" prop="salesOrderNo">
          <el-input
            v-model.trim="queryParams.salesOrderNo"
            clearable
            @keyup.native.enter="handleQuery"
            style="width: 140px"
            placeholder="请选择"
          />
        </el-form-item>
        <el-form-item label="排产单号" prop="no">
          <el-input
            v-model.trim="queryParams.no"
            clearable
            @keyup.native.enter="handleQuery"
            style="width: 140px"
            placeholder="请选择"
          />
        </el-form-item>
        <el-form-item label="排产状态" prop="productStatus">
          <el-select
            v-model="queryParams.productStatus"
            clearable
            style="width: 100px"
          >
            <el-option
              v-for="(value, key) in productStatusList"
              :key="key"
              :label="value"
              :value="+key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生产日期">
          <el-date-picker
            v-model="dateRange"
            style="width: 250px"
            value-format="timestamp"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleQuery"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="handleQuery"
          >
            搜 索
          </el-button>
          <el-button
            icon="el-icon-refresh"
            size="mini"
            @click="resetQuery"
          >
            重 置
          </el-button>
        </el-form-item>
      </el-form>
    </transition>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          v-hasPermi="['www:planSchedule:add']"
          @click="handleAdd"
        >
          新 增
        </el-button>
        <el-button
          v-hasPermi="['www:planSchedule:oldAdd']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleOldAdd"
        >
          新 增（旧）
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>
    <el-table
      border
      v-loading="loading"
      :height="tableHeight()"
      :data="list"
      :cell-class-name="cellClassName"
      @cell-click="cellClick"
    >
      <el-table-column label="序号" width="60" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="产品品类"
        align="center"
        prop="categoryName"
        width="100"
      />
      <el-table-column
        label="产品型号"
        align="center"
        prop="computerName"
        width="100"
      />
      <el-table-column
        label="迪太订单号"
        align="center"
        prop="salesOrderNo"
        width="100"
      />
      <el-table-column
        label="客户订单号"
        align="center"
        prop="customerOrderNo"
        width="100"
      >
        <span slot-scope="scope" v-NoData="scope.row.customerOrderNo"></span>
      </el-table-column>
      <el-table-column label="排产单号" align="center" prop="no" width="100" />
      <el-table-column label="订单编号" align="center" prop="orderCode" />
      <el-table-column
        label="生产地点"
        align="center"
        prop="address"
        width="90"
      />
      <el-table-column label="生产日期" align="center" prop="date" width="90">
        <template slot-scope="{ row }">
          {{ parseTime(row.date, "{y}-{m}-{d}") }}
          <br />
          <span class="text-red" v-show="isDisabled(row.date)">（已过期）</span>
        </template>
      </el-table-column>
      <el-table-column
        label="生产流程"
        align="center"
        prop="process"
        width="80"
      />
      <el-table-column
        label="方案版本"
        align="center"
        prop="soChipVersion"
        width="80"
      />
      <el-table-column label="排产数量" align="center" prop="num" width="90" />
      <el-table-column
        label="排产状态"
        align="center"
        prop="productStatus"
        width="80"
      >
        <template slot-scope="{ row }">
          <el-tag
            v-if="row.productStatus !== null"
            size="mini"
            :type="tagType(row.productStatus)"
          >
            {{ productStatusList[row.productStatus] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="订单数量"
        align="center"
        prop="orderQuantity"
        width="85"
      />
      <el-table-column
        label="排产人"
        align="center"
        prop="createBy"
        width="85"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="90"
      >
        <template slot-scope="{ row }">
          <span>
            {{ parseTime(row.createTime, "{y}-{m}-{d}") }}
          </span>
          <br>
          <span>
            {{ parseTime(row.createTime, "{h}:{i}") }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" fixed="right">
        <div class="flex align-center justify-between" slot-scope="{ row }">
          <el-button
            v-if="row.salesOrderNo"
            v-hasPermi="['www:planSchedule:update']"
            :class="[isDisabled(row.date) ? 'text-gray' : 'text-blue']"
            type="text"
            @click="handleUpdate(row)"
          >
            编辑
          </el-button>
          <el-button
            v-if="!row.salesOrderNo"
            v-hasPermi="['www:planSchedule:oldUpdate']"
            :class="[isDisabled(row.date) ? 'text-gray' : 'text-blue']"
            type="text"
            @click="handleOldUpdate(row)"
          >
            编辑(旧)
          </el-button>
          <el-button
            class="mlZero"
            v-show="row.qrCode"
            type="text"
            v-hasPermi="['www:planSchedule:taskOrder']"
            @click="handleQrCode(row)"
          >
            任务令
          </el-button>
          <el-dropdown>
            <span class="el-dropdown-link text-blue font12">
              更多操作<i class="el-icon-arrow-down el-icon--right"></i>
            </span>

            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-hasPermi="['www:planSchedule:delete']"
                @click.native="handleDelete(row)"
              >
                删除
              </el-dropdown-item>
              <el-dropdown-item
                v-hasPermi="['www:planSchedule:log']"
                @click.native="onEditLog(row.id)"
              >
                日志
              </el-dropdown-item>
              <el-dropdown-item
                v-hasPermi="['www:planSchedule:create:prodData']"
                @click.native="handleCreateFile(row.id)"
              >
                生成生产资料
              </el-dropdown-item>

              <template v-if="row.fileZip">
                <el-dropdown-item
                  v-hasPermi="['www:planSchedule:download:prodData']"
                  @click.native="zipFile(row.fileZip)"
                >
                  下载生产资料
                </el-dropdown-item>

                <el-dropdown-item
                  v-hasPermi="['www:planSchedule:create:seeData']"
                  @click="getProSecDetail(row.id)"
                >
                  生成预览资料
                </el-dropdown-item>

                <template v-if="row.excelUrl">
                  <el-dropdown-item
                    v-hasPermi="['www:planSchedule:download:fileData']"
                    @click="zipFile(row.excelUrl)"
                  >
                    下载资料清单
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-hasPermi="['www:planSchedule:send:prod']"
                    @click="handleProd(row.id)"
                  >
                    外发生产
                  </el-dropdown-item>
                </template>
              </template>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
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
      :dictList="dictList"
      :modelList="modelList"
      :operationList="operationList"
      :isExcelFile.sync="isExcelFile"
      @getData="getList"
    />

    <old-comUpdate
      ref="oldCompUpdate"
      :title="title"
      :dictList="dictList"
      :modelList="modelList"
      :operationList="operationList"
      @getData="getList"
    />

    <!-- 任务令 -->
    <el-dialog title="任务令" :visible.sync="isQrCode" width="350px" center>
      <el-card shadow="hover">
        <div class="flex flex-direction" style="row-gap: 10px">
          <vue-qr :text="qrCodeObj.qrCode" :size="200"></vue-qr>
          <span class="flex align-center">
            产品品类：<el-tag>{{ qrCodeObj.categoryName }}</el-tag>
          </span>
          <span class="flex align-center">
            产品型号：<el-tag>{{ qrCodeObj.computerName }}</el-tag>
          </span>
          <span class="flex align-center">
            芯片版本：<el-tag>{{ qrCodeObj.soChipVersion }}</el-tag>
          </span>
          <span class="flex align-center" v-show="qrCodeObj.customerOrderNo">
            客户订单号：<el-tag>{{ qrCodeObj.customerOrderNo }}</el-tag>
          </span>
          <span class="flex align-center">
            生产数量：<el-tag>{{ qrCodeObj.num }}</el-tag>
          </span>
        </div>
      </el-card>
    </el-dialog>

    <!-- 缺失资料状态弹窗 -->
    <el-dialog
      title="缺失资料状态"
      center
      width="40%"
      top="-12vh"
      :visible.sync="isDataShow"
      :close-on-click-modal="false"
      class="data-box"
    >
      <el-descriptions direction="vertical" :column="3" border>
        <el-descriptions-item
          label="软件资料"
          :labelStyle="isLabelStyle"
          :contentStyle="isContentStyle"
          content-class-name="overflow-y"
          v-if="isDataLen(dataInfo.softList)"
        >
          <div class="detail_item_box">
            <el-tag
              size="small"
              class="margin-right-xs margin-bottom-xs"
              v-for="(item, index) in dataInfo.softList"
              :key="index"
            >
              {{ item.typeValue }}
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item
          label="硬件资料"
          :labelStyle="isLabelStyle"
          :contentStyle="isContentStyle"
          content-class-name="overflow-y"
          v-if="isDataLen(dataInfo.hardList)"
        >
          <div class="detail_item_box">
            <el-tag
              size="small"
              class="margin-right-xs margin-bottom-xs"
              v-for="(item, index) in dataInfo.hardList"
              :key="index"
            >
              {{ item.typeValue }}
            </el-tag>
          </div>
        </el-descriptions-item>

        <el-descriptions-item
          label="工程资料"
          :labelStyle="isLabelStyle"
          :contentStyle="isContentStyle"
          content-class-name="overflow-y"
          v-if="isDataLen(dataInfo.projectList)"
        >
          <div class="detail_item_box">
            <el-tag
              size="small"
              class="margin-right-xs margin-bottom-xs"
              v-for="(item, index) in dataInfo.projectList"
              :key="index"
            >
              {{ item.typeValue }}
            </el-tag>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 外发生产 -->
    <el-dialog
      title="外发生产"
      :visible.sync="isOutProd"
      width="500px"
      center
      :close-on-click-modal="false"
    >
      <el-card shadow="hover"> 文件 </el-card>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary">确 定</el-button>
        <el-button>取 消</el-button>
      </div>
    </el-dialog>

    <edit-log ref="editLogRef" />
  </div>
</template>

<script>
import {
  schedulingList,
  schedulingDel,
  createDataFile,
  sendProd,
  proSecDetail,
} from "@/api/www/planSchedule";
import { listComputer, computerName } from "@/api/third/computer";
import { computerNameList, categoryComputerDict } from "@/api/third/fileConfig";
import VueQr from "vue-qr";
import table2excel from "js-table2excel";
import XLSX from "xlsx";
import "./table2excel";
import reqUrl from "@/utils/requestUrl";

import FileSaver from "file-saver";
import axios from "axios";

export default {
  name: "PlanSchedule",
  components: {
    VueQr,
    CompUpdate: () => import("./components/update.vue"),
    OldComUpdate: () => import("./components/oldUpdate.vue"),
    EditLog: () => import("./components/log.vue"),
  },
  data() {
    return {
      actionUrl: reqUrl + "/oss/batch-upload",
      isExcelFile: false,
      // 显示搜索条件
      showSearch: true,
      // 遮罩层
      loading: false,
      // 缺失资料状态弹窗
      isDataShow: false,
      isCLoading: false,
      isQrCode: false,
      isOutProd: false,
      qrCodeObj: {},
      dataInfo: {},
      title: "",
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 产品品类
      dictList: [],
      // 型号
      modelList: [],
      computerOptions: [],
      operationList: [],
      // 日期范围
      dateRange: [],
      productStatusList: {
        0: "正常",
        1: "已取消",
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        categoryId: "",
        computerId: "",
        salesOrderNo: "",
        no: "",
        startDate: "",
        endDate: "",
        operation: "",
      },
    };
  },
  computed: {
    tagType() {
      return (status) => {
        switch (status) {
          case 0:
            return "success";
          case 1:
            return "info";
        }
      };
    },
    isDisabled() {
      return (date) => {
        return date < +new Date() - 3600 * 1000 * 24;
      };
    },
    isDataLen() {
      return (list) => {
        // true 未配齐
        return Array.isArray(list) && list.length > 0;
      };
    },
    isDataAll() {
      return ({ softList, hardList, projectList }) => {
        if (!this.isDataNull({ softList, hardList, projectList })) {
          if (
            !this.isDataLen(softList) &&
            !this.isDataLen(hardList) &&
            !this.isDataLen(projectList)
          ) {
            return true;
          }
        }
      };
    },
    isDataNull() {
      return ({ softList, hardList, projectList }) => {
        if (softList === null && hardList === null && projectList === null) {
          return true;
        }
      };
    },
    isDataAlltxt() {
      return (bool) => {
        return bool ? "未配齐" : "已配齐";
      };
    },
    dataStateColor() {
      return (bool) => {
        return bool ? "text-red" : "text-green";
      };
    },
    isLabelStyle() {
      return { textAlign: "center", color: "#e54d42" };
    },
    isContentStyle() {
      return { width: "33.333%", verticalAlign: "top" };
    },
  },
  watch: {
    "queryParams.categoryId"(id) {
      if (id) {
        // this.queryParams.computerId = "";
        this.getlistComputer(id);
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      await vm.getCategoryComputerData();
      vm.getCacheParamsFn(to?.params);
    });
  },
  created() {
    this.getOperationList();
  },
  methods: {
    getCacheParamsFn(params) {
      const { categoryId, computerId, salesOrderNo, orderId } = params;

      // 从订单管理跳转到当前页面
      if (categoryId || computerId || salesOrderNo) {
        this.queryParams.categoryId = categoryId;
        this.queryParams.computerId = computerId;
        this.queryParams.salesOrderNo = salesOrderNo;
        this.queryParams.orderId = orderId;

        const computerData = this.dictList.filter(
          (item) => item.id === categoryId
        );
        this.computerOptions = computerData[0].computerList;
      }

      this.getList();
    },
    getCategoryComputerData() {
      return new Promise((resolve, reject) => {
        categoryComputerDict().then((res) => {
          this.dictList = res.data;

          const { categoryId } = this.$route.query;

          if (categoryId) {
            this.queryParams.categoryId = categoryId;
            this.changeCategory(categoryId);
            let computerId = this.$route.query.model;
            if (computerId) {
              this.queryParams.computerId = computerId;
            }
          }

          resolve();
        });
      });
    },
    loadingFn(text) {
      return new Promise((resolve) => {
        let downloadLoadingInstance = this.$loading({
          text,
          lock: true,
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        setTimeout(() => {
          resolve(downloadLoadingInstance);
        }, 1000);
      });
    },
    async getProSecDetail(id) {
      let downloadLoadingInstance = await this.loadingFn("预览资料生成中...");
      proSecDetail(id)
        .then((res) => {
          this.getList();
        })
        .finally(() => {
          downloadLoadingInstance.close();
        });
    },
    handleExcel(data) {
      const column = [
        {
          title: "属性",
          key: "name",
          type: "text",
        },
        {
          title: "值",
          key: "value",
          type: "text",
        },
        {
          title: "图片",
          key: "url",
          type: "image",
        },
      ];
      const excelName = "生产资料确认表";
      const datas = this.Format(data);
      table2excel(column, datas, excelName);
    },

    textExcel(id) {
      const table2excel = new Table2Excel();
      table2excel.export(document.getElementById("table"));
      const wb = XLSX.utils.table_to_book(document.getElementById("table"));

      const wbout = XLSX.write(wb, {
        bookType: "xlsx",
        bookSST: true,
        type: "binary",
      });

      const blob = new Blob([this.s2ab(wbout)], {
        type: "application/octet-stream",
      });

      this.uploadExcelFile(blob, id);

      // 上传到服务器

      const formData = new FormData();
      formData.append(
        "file",
        new Blob([wbout], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        fileName
      );

      axios
        .post(this.actionUrl, formData, {
          "Content-type": "multipart/form-data",
        })
        .then(
          (res) => {
            // 上传成功后的处理
            console.log(res);
          },
          (err) => {
            // 出现错误时的处理
          }
        );
    },

    // uploadExcelFile(fileData) {
    //   const formData = new FormData();
    //   formData.append("file", fileData);
    //   let reader = new FileReader();
    //   reader.readAsBinaryString(fileData);
    //   reader.onload = function (event) {
    //     let data = event.target.result;
    //     console.log(data);
    //     axios
    //       .post(this.actionUrl, data, {
    //         "Content-type": "application/octet-stream",
    //       })
    //       .then(
    //         (res) => {
    //           // 上传成功后的处理
    //           console.log(res, "success");
    //         },
    //         (err) => {
    //           // 出现错误时的处理
    //         }
    //       );
    //   };
    // },
    // s2ab(s) {
    //   const buf = new ArrayBuffer(s.length);
    //   const view = new Uint8Array(buf);
    //   for (let i = 0; i < s.length; ++i) {
    //     view[i] = s.charCodeAt(i) & 0xff;
    //   }
    //   return buf;
    // },

    Format(data) {
      data.forEach((item) => {
        if (item.value === null) {
          item.value = "";
        }
      });
      return data;
    },
    // 上传资料清单
    uploadFile(row) {
      this.title = "资料清单";
      this.isExcelFile = true;
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.$refs.compUpdate.dialogVisible = true;
    },
    changeCategory(val) {
      if (!val) return;
      this.queryParams.computerId = "";
      return new Promise((resove) => {
        this.computerOptions = this.dictList.filter(
          (item) => item.id === val
        )[0].computerList;
        resove();
      });
    },
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = false;
        computerNameList({
          name,
          categoryId: this.queryParams.categoryId,
        }).then((res) => {
          this.computerOptions = res.data;
        });
      } else {
        this.computerOptions = [];
      }
    },
    // 获取型号字典
    getlistComputer(key) {
      listComputer({ key }).then((res) => {
        const { list } = res.data;
        this.modelList = list;
      });
    },
    // 生产流程
    getOperationList() {
      this.getDicts("process").then((response) => {
        this.operationList = response.data;
      });
    },
    getList() {
      this.loading = true;
      schedulingList(
        this.addDateRange(this.queryParams, this.dateRange, {
          begin: "startDate",
          end: "endDate",
        })
      ).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    handleAdd() {
      this.title = "新增计划";
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
    },
    handleOldAdd() {
      this.title = "新增计划";
      this.$refs.oldCompUpdate.reset();
      this.$refs.oldCompUpdate.oldDialogVisible = true;
    },
    handleUpdate(row) {
      this.title = "编辑计划";
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.form = Object.assign({}, row);

      const { id, ...data } = row;
      this.$refs.compUpdate.orderData = [{ ...data }];
      this.$refs.compUpdate.cloneForm = Object.assign({}, row);
      this.$refs.compUpdate.dialogVisible = true;
    },
    handleOldUpdate(row) {
      this.title = "编辑计划";
      this.$refs.oldCompUpdate.reset();
      this.$refs.oldCompUpdate.form = Object.assign(
        {},
        { ...row, dateRange: [row.startTime, row.endTime] }
      );
      this.$refs.oldCompUpdate.cloneForm = Object.assign({}, row);
      this.$refs.oldCompUpdate.oldDialogVisible = true;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.orderId = "";
      this.queryParams.id = "";
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.orderId = "";
      this.queryParams.id = "";
      this.dateRange = [];
      this.modelList = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 删除
    handleDelete(row) {
      this.$confirm("确定要删除此项吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return schedulingDel(row.id);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    // 查看任务令
    handleQrCode(row) {
      this.isQrCode = true;
      this.qrCodeObj = row;
    },
    // 资料状态
    cellClick(row, column) {
      if (
        column.label === "资料状态" &&
        !this.isDataNull(row) &&
        !this.isDataAll(row)
      ) {
        this.handleDataVis(row);
      }
    },
    cellClassName({ row, column }) {
      if (
        column.label === "资料状态" &&
        !this.isDataNull(row) &&
        !this.isDataAll(row)
      ) {
        return "pointer";
      }
    },
    // 缺失资料
    handleDataVis({ softList, hardList, projectList }) {
      this.isDataShow = true;
      this.dataInfo = { softList, hardList, projectList };
    },
    // 生成生产资料
    async handleCreateFile(id) {
      let downloadLoadingInstance = await this.loadingFn("生产资料生成中...");

      createDataFile(id)
        .then(() => {
          this.msgSuccess("生成生产资料成功");
          this.getList();
        })
        .catch(() => {
          this.msgError("生成生产资料失败");
        })
        .finally(() => {
          downloadLoadingInstance.close();
        });
    },
    // 外发生产
    async handleProd(id) {
      let downloadLoadingInstance = await this.loadingFn("外发生产处理中...");
      sendProd(id)
        .then((res) => {
          if (res.code === 200) {
            this.msgSuccess("外发成功,请查看邮箱");
          } else {
            this.msgError("外发失败");
          }
        })
        .finally(() => {
          downloadLoadingInstance.close();
        });
    },
    /** 修改日志 */
    onEditLog(id) {
      this.$refs.editLogRef.dialogVisible = true;
      this.$refs.editLogRef.getList(id);
    },
  },
};
</script>
<style lang="scss" scoped>
.data-box {
  .detail_item_box {
    min-height: 150px;
    max-height: 300px;
    overflow: hidden;
    &:hover {
      overflow-y: auto;
    }
  }
}
</style>
