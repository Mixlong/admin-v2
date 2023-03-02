<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属品类" prop="categoryId">
        <el-select
          size="small"
          filterable
          allow-create
          clearable
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
      <el-form-item label="仪表型号" prop="computerId">
        <el-select
          size="small"
          :loading="isCLoading"
          filterable
          remote
          clearable
          v-model="queryParams.computerId"
          placeholder="请选择"
          @change="changeComputer"
          :remote-method="getComputerNameList"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.model"
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
      <el-form-item label="生产流程" prop="operation">
        <el-select
          style="width: 150px"
          v-model="queryParams.operation"
          placeholder="请选择产线"
          clearable
          @change="handleQuery"
        >
          <el-option
            v-for="(item, index) in operationList"
            :key="index"
            :label="item.dictLabel"
            :value="item.dictLabel"
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
        >
          搜 索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重 置
        </el-button>
      </el-form-item>
      <el-row :gutter="10" class="fr mt5">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
          >
            新 增
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      border
      v-loading="loading"
      :height="tableHeight()"
      :data="list"
      id="printMe"
      :cell-class-name="cellClassName"
      @cell-click="cellClick"
    >
      <el-table-column label="序号" width="60" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="产品品类" align="center" prop="categoryName" />
      <el-table-column label="产品型号" align="center" prop="computerName" />
      <el-table-column label="产品版本号" align="center" prop="versionName" />
      <el-table-column
        label="芯片版本"
        align="center"
        prop="chipVersion"
        width="110"
      />
      <el-table-column
        label="方案版本"
        align="center"
        prop="schemeVersionName"
        width="110"
      />
      <el-table-column
        label="生产流程"
        align="center"
        prop="process"
        width="110"
      />
      <el-table-column
        label="生产地点"
        align="center"
        prop="address"
        width="110"
      />
      <el-table-column label="生产日期" align="center" prop="date" width="110">
        <template slot-scope="{ row }">
          {{ parseTime(row.date, "{y}-{m}-{d}") }}
          <br />
          <span class="text-red" v-show="isDisabled(row.date)">（已过期）</span>
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center" prop="num" width="100" />
      <el-table-column
        label="资料状态"
        align="center"
        prop="dataState"
        width="100"
      >
        <template slot-scope="scope">
          <p v-if="isDataAll(scope.row)" class="text-green">全部已配齐</p>
          <template v-else>
            <p
              v-if="scope.row.softList !== null"
              :class="dataStateColor(isDataLen(scope.row.softList))"
            >
              软件{{ isDataAlltxt(isDataLen(scope.row.softList)) }}
            </p>
            <p
              v-if="scope.row.hardList !== null"
              :class="dataStateColor(isDataLen(scope.row.hardList))"
            >
              硬件{{ isDataAlltxt(isDataLen(scope.row.hardList)) }}
            </p>
            <p
              v-if="scope.row.projectList !== null"
              :class="dataStateColor(isDataLen(scope.row.projectList))"
            >
              工程{{ isDataAlltxt(isDataLen(scope.row.projectList)) }}
            </p>
          </template>
        </template>
      </el-table-column>
      <el-table-column
        label="创建人"
        align="center"
        prop="createBy"
        width="100"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="140"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <div class="flex justify-around" slot-scope="{ row }">
          <div class="flex flex-direction align-start">
            <el-button
              :disabled="isDisabled(row.date)"
              :class="[isDisabled(row.date) ? 'text-gray' : 'text-blue']"
              type="text"
              @click="handleUpdate(row)"
            >
              编辑
            </el-button>
            <el-button
              class="text-red mlZero"
              type="text"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
            <el-button
              v-show="row.qrCode && row.process === 'SMT'"
              class="mlZero"
              type="text"
              @click="handleQrCode(row)"
            >
              任务令
            </el-button>
          </div>
          <div class="flex flex-direction align-start" v-if="isDataAll(row)">
            <el-button
              class="mlZero"
              type="text"
              @click="handleCreateFile(row.id)"
            >
              生成生产资料
            </el-button>
            <template v-if="row.fileZip">
              <el-button
                class="mlZero"
                type="text"
                @click="handleDownloadFile(row.fileZip)"
              >
                下载生产资料
              </el-button>
              <el-button
                class="mlZero"
                type="text"
                @click="createPreDetail(row.id)"
              >
                生成预览资料
              </el-button>
              <el-button
                v-if="row.excelUrl"
                class="mlZero"
                type="text"
                @click="ReadOfficeFile(row.excelUrl)"
              >
                预览资料清单
              </el-button>
            </template>
            <el-button class="mlZero" type="text" @click="handleProd(row.id)">
              外发生产
            </el-button>
          </div>
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
    />

    <!-- 任务令 -->
    <el-dialog
      title="任务令"
      :visible.sync="isQrCode"
      width="350px"
      center
      :close-on-click-modal="false"
    >
      <el-card shadow="hover">
        <div class="flex flex-direction">
          <vue-qr :text="qrCodeObj.qrCode" :size="200"></vue-qr>
          <span class="margin-bottom-xs">
            产品品类：<el-tag>{{ qrCodeObj.categoryName }}</el-tag>
          </span>
          <span>
            产品型号：<el-tag>{{ qrCodeObj.computerName }}</el-tag>
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
  </div>
</template>

<script>
import {
  schedulingList,
  schedulingDel,
  createDataFile,
  createDataDetail,
  sendProd,
} from "@/api/www/planSchedule";
import { typeCategory } from "@/api/third/category";
import { listComputer, computerName } from "@/api/third/computer";
import CompUpdate from "./components/update";
import { computerNameList, categoryComputerDict } from "@/api/third/fileConfig";
import VueQr from "vue-qr";

export default {
  components: { VueQr, CompUpdate },
  data() {
    return {
      listId: "",
      // 遮罩层
      loading: true,
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
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        categoryId: "",
        computerId: "",
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
            return "info";
          case 1:
            return "primary";
          case 2:
            return "success";
        }
      };
    },
    isDisabled() {
      return (date) => {
        return date < +new Date();
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
        this.queryParams.computerId = "";
        this.getlistComputer(id);
      }
    },
  },
  created() {
    const { id } = this.$route.query;
    if (id) {
      this.queryParams.salesOrderNo = id;
    }
    const { listId } = this.$route.params;
    if (listId) {
      this.listId = listId;
    }
    this.getList();
    this.getOperationList();
  },
  mounted() {
    categoryComputerDict().then((response) => {
      this.dictList = response.data;
      let type = this.$route.query.type;
      if (type) {
        this.queryParams.type = type;
      }
      let { categoryId, status } = this.$route.query;

      if (categoryId) {
        this.queryParams.categoryId = categoryId;
        this.changeCategory(categoryId);
        let computerId = this.$route.query.model;
        if (computerId) {
          this.queryParams.computerId = computerId;
        }
      }
      if (status) {
        this.queryParams.status = status;
      }
      this.getList();
    });
  },
  methods: {
    changeCategory(val) {
      if (!val) return;
      this.queryParams.computerId = "";
      this.getList();
      return new Promise((resove) => {
        this.computerOptions = this.dictList.filter(
          (item) => item.id === val
        )[0].computerList;
        resove();
      });
    },
    changeComputer() {
      this.getList();
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
    // 获取品类字典
    getTypeCategory() {
      typeCategory().then((res) => {
        this.dictList = res.data;
      });
    },
    // 获取型号字典
    getlistComputer(key) {
      listComputer({ key }).then((res) => {
        const { list } = res.data;
        this.modelList = list;
      });
    },
    // 型号
    getComputer(name) {
      if (name) {
        computerName(name).then((res) => {
          this.modelList = res.data.map((item) => {
            return { name: item.name, id: item.model };
          });
        });
      }
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
        if (this.listId) {
          this.list = this.list.filter((item) => item.id === this.listId);
        }
      });
    },
    handleAdd() {
      this.title = "新增计划";
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
    },
    handleUpdate(row) {
      this.title = "编辑计划";
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.form = Object.assign(
        {},
        { ...row, dateRange: [row.startTime, row.endTime] }
      );
      this.$refs.compUpdate.dialogVisible = true;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.listId = this.listId && "";
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.listId = this.listId && "";
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
    handleCreateFile(id) {
      createDataFile(id)
        .then(() => {
          this.msgSuccess("生成生产资料成功");
          this.getList();
        })
        .catch(() => {
          this.msgError("生成生产资料失败");
        });
    },
    // 下载生产资料
    handleDownloadFile(url) {
      this.zipFile(url);
    },
    // 生成预览资料
    createPreDetail(id) {
      createDataDetail(id)
        .then(() => {
          this.msgSuccess("生成预览资料成功");
          this.getList();
        })
        .catch(() => {
          this.msgError("生成预览资料失败");
        });
    },
    // 外发生产
    handleProd(id) {
      sendProd(id).then((res) => {
        if (res.code === 200) {
          this.msgSuccess("外发成功,请查看邮箱");
        } else {
          this.msgError("外发失败");
        }
      });
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
