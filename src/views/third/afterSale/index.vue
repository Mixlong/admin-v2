<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" inline>
      <el-form-item label="客诉日期" prop="returnDate">
        <el-date-picker
          v-model="queryParams.returnDate"
          type="date"
          placeholder="请选择客诉日期"
          style="width: 140px"
        />
      </el-form-item>
      <el-form-item label="客户名称" prop="customerName">
        <el-autocomplete
          v-model="queryParams.customerName"
          clearable
          style="width: 140px"
          :fetch-suggestions="querySearchAsync"
          placeholder="请选择客户名称"
          @change="handleQuery"
        ></el-autocomplete>
      </el-form-item>
      <el-form-item label="品类" prop="categoryName">
        <el-select
          filterable
          allow-create
          clearable
          v-model="queryParams.categoryName"
          style="width: 140px"
          @change="changeCategory"
          placeholder="请选择品类"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="型号" prop="computerName">
        <el-select
          :loading="isCLoading"
          filterable
          remote
          clearable
          style="width: 140px"
          v-model="queryParams.computerName"
          placeholder="请选择型号"
          @change="handleQuery"
          :remote-method="getComputerNameList"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="问题状态" prop="status">
        <el-select
          v-model="queryParams.status"
          style="width: 120px"
          placeholder="请选择问题状态"
        >
          <el-option label="OPEN" value="0" />
          <el-option label="CLOSE" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="处理进展" prop="state">
        <el-select
          v-model="queryParams.state"
          filterable
          style="width: 120px"
          placeholder="请选择处理进展"
        >
          <el-option
            v-for="(label, value) in stateList"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-row
        :gutter="20"
        type="flex"
        align="middle"
        justify="start"
        class="fr mt5"
      >
        <el-col :span="1.5">
          <el-button :type="isWaitOrAllType" @click="handleSeeWaitOrAllData">{{ isWaitOrAllTxt }}</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      class="afterSaleBox"
      :row-class-name="rowName"
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      border
      @cell-click="cellClick"
      :cell-style="cellStyle"
    >
      <el-table-column
        label="客诉日期"
        prop="returnDate"
        align="center"
        width="120"
      />
      <el-table-column
        label="问题状态"
        prop="status"
        align="center"
        width="90"
      >
        <template scope="{ row }">
          <el-tag v-if="row.status === 0" type="success">OPEN</el-tag>
          <el-tag v-else type="danger">CLOSE</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="不良仪表去向" prop="direction" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="directionListClass(modelDirList, row.direction)">
            {{ directionLabel(modelDirList, row.direction) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="产品SN" prop="sn" align="center" />
      <el-table-column label="客户名称" prop="customerName" align="center" />
      <el-table-column label="品类" prop="categoryName" align="center" />
      <el-table-column label="型号" prop="computerName" align="center" />
      <el-table-column label="客诉现象" prop="result" align="center" show-overflow-tooltip />
      <el-table-column label="客退清单" prop="inventory" align="center" />
      <el-table-column label="客退方" prop="returnParty" align="center" />
      <el-table-column label="处理进展" prop="model" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.state == 1" class="text-red">现象复测</span>
          <span v-if="scope.row.state == 2" class="text-blue">分类处理</span>
          <span v-if="scope.row.state == 3" class="text-cyan">问题处理</span>
          <span v-if="scope.row.state == 4" class="text-orange">处理类型</span>
          <span v-if="scope.row.state == 5" class="text-yellow">维修处理</span>
          <span v-if="scope.row.state == 6" class="text-green">处理完成</span>
        </template>
      </el-table-column>
      <el-table-column label="处理人" prop="handleName" align="center" />
      <el-table-column
        label="是否问题"
        prop="isProblem"
        align="center"
        width="80"
      >
        <template slot-scope="{ row }">
          <el-tag v-if="row.isProblem === 0" type="primary">是</el-tag>
          <el-tag v-else type="danger">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="问题根因" prop="rootMatter" align="center" />
      <el-table-column label="根因分类" prop="rootMatterType" align="center">
        <template slot-scope="{row}">
          {{ directionLabel(rootClassify, row.rootMatterType) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="{ row }">
          <div class="flex justify-center">
            <el-button class="text-green" type="text" @click="handleDetail(row)">详情</el-button>
            <el-button class="text-blue" type="text" @click="handleUpdate(row)">编辑</el-button>
            <el-button class="text-orange" type="text">处理</el-button>
            <el-button v-if="!Is_Empty(row.rootMatter)" class="text-yellow" type="text" @click="handleClose(row)">
              {{ isStatusTxt(row.status) }}
            </el-button>
            <el-button class="text-red" type="text" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
        <!-- <template slot-scope="scope"> -->
        <!-- <div style="padding-left: 8px" class="text-left">
            <Tooltip
              v-if="
                scope.row.principal == userId ||
                scope.row.feedbackBy == userId ||
                checkRole(['afterSale'])
              "
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
              content="驳回"
              placement="top-end"
              v-if="
                scope.row.state == 0 &&
                (scope.row.principal == userId || checkRole(['admin']))
              "
            >
              <el-button
                size="small"
                icon="el-icon-circle-close"
                type="text"
                class="text-green font16"
                @click="handleAuthChange(scope.row, 3)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item font16"
              effect="dark"
              content="已处理"
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
                @click="handleAuthChange(scope.row, 2)"
              ></el-button>
            </el-tooltip>
            <Tooltip
              v-if="
                scope.row.principal == userId ||
                scope.row.feedbackBy == userId ||
                checkRole(['admin'])
              "
              icon="el-icon-delete"
              :className="['text-red']"
              content="删除"
              @click="handleDelete(scope.row)"
            />
            <el-tooltip
              v-if="scope.row.attachment"
              effect="dark"
              content="附件"
              placement="top-end"
            >
              <el-button
                size="small"
                icon="el-icon-download"
                type="text"
                class="text-green font16"
                @click.stop="
                  handleDownload(scope.row.attachment, scope.row.product)
                "
              ></el-button>
            </el-tooltip>
            <el-tooltip
              v-if="scope.row.fileUrl"
              effect="dark"
              content="记录文件"
              placement="top-end"
            >
              <el-button
                size="small"
                icon="el-icon-download"
                type="text"
                class="text-green font16"
                @click.stop="
                  handleDownload(scope.row.fileUrl, scope.row.product)
                "
              ></el-button>
            </el-tooltip>
          </div> -->
        <!-- </template> -->
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <AddSale
      ref="isAddSaleRef"
      :visible.sync="isSaleAddDia"
      :dictList="dictList"
      :modelDirList="modelDirList"
      :pmDictListOptions="pmDictListOptions"
      :rootClassify="rootClassify"
    />

    <!-- 详情 -->
    <after-detail 
      ref="isAfterDetailRef"
      :visible.sync="isAfterDetailDia"
      :rootClassify="rootClassify"
      :directionLabel="directionLabel"
    >
    </after-detail>   
  </div>
</template>

<script>
import { afterList, saleAuth, saleState, saleDelete, saleUpdate } from "@/api/third/sale";
import { listCustomer } from "@/api/third/sample";
import { mapGetters } from "vuex";
import { memberDictUser } from "@/api/system/user";
import FlipDown from "vue-flip-down";
import commonData from "./mixins";

export default {
  mixins: [commonData],
  components: {
    FlipDown,
    AddSale: () => import("./components/addSale"),
    AfterDetail: () => import("./components/afterDetail")
  },
  data() {
    return {
      form: {},
      urls: [],
      // 遮罩层
      loading: true,
      authDialogVisible: false,
      // 新增、修改弹窗
      isSaleAddDia: false,
      // 详情弹窗
      isAfterDetailDia: false, 
      // 待处理 、 全部
      isWaitDispose: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      brandList: [],
      // 品类
      dictList: [],
      // 仪表去向
      modelDirList: [],
      // 根因分类
      rootClassify: [],
      // 处理进展
      stateList: {
        1: "现象复测",
        2: "分类处理",
        3: "问题处理",
        4: "处理类型",
        5: "维修处理",
        6: "处理完成",
      },
      options: [
        {
          label: "待处理",
          value: 0,
        },
        {
          label: "处理中",
          value: 1,
        },
        {
          label: "已处理",
          value: 2,
        },
        {
          label: "已驳回",
          value: 3,
        },
      ],
      pmDictListOptions: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        returnDate: undefined,
        customerName: null,
        computerName: undefined,
        status: null,
        state: undefined,
      },
    };
  },
  computed: {
    ...mapGetters(["userId", "name"]),
    transSn() {
      return (sn) => {
        if (/(,|，)/g.test(sn)) {
          sn = sn.replace(/，/g, ",");
          const snArr = sn.split(",");
          let htmlStr = "";
          snArr.forEach((item) => {
            htmlStr += `<p>${item}</p>`;
          });
          return htmlStr;
        } else {
          return sn;
        }
      };
    },
    directionDir() {
      return (dataList, direction) => {
        return dataList.length && dataList.filter((item) => +item.dictValue === +direction);
      };
    },
    directionLabel() {
      return (dataList, direction) => {
        const directionData = this.directionDir(dataList, direction);
        return directionData[0] && directionData[0].dictLabel;
      };
    },
    directionListClass() {
      return (dataList, direction) => {
        const directionData = this.directionDir(dataList, direction);
        const tagType = directionData[0] && directionData[0].listClass;
        return tagType === "primary" ? "" : tagType;
      };
    },
    isStatusTxt() {
      return (status) => {
        return status === 0 ? "关闭" : "打开";
      }
    },
    isWaitOrAllTxt() {
      return this.isWaitDispose ? "待处理" : "全部"
    },
    isWaitOrAllType() {
      return this.isWaitDispose ? "danger" : "success";
    }
  },
  created() {
    let { name } = this.$route.query;
    if (name) {
      this.queryParams.product = name;
    }
    this.getMemberDictUser();
    this.getModelDirData();
    this.getRootClassifyData();
    this.getList();
  },
  methods: {
    async getMemberDictUser() {
      try {
        const { data } = await memberDictUser();
        this.pmDictListOptions = data;
      } catch (error) {
        console.error(error);
      }
    },
    // 不良仪表去向
    async getModelDirData() {
      try {
        const { data } = await this.getDicts("sys_model_direction");
        this.modelDirList = data;
      } catch (error) {
        console.error(error);
      }
    },
    // 根因分类
    async getRootClassifyData() {
      try {
        const { data } = await this.getDicts("sys_root_classify");
        this.rootClassify = data;
      } catch (error) {
        console.error(error);
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
    /** 查询品牌列表 */
    getList() {
      console.log(this.name)
      this.loading = true;
      const dataInfo = { ...this.queryParams, my: this.isWaitDispose ? "" : this.name }; 
      afterList(dataInfo).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    difference(endTime) {
      let dateBegin = new Date();
      let dateEnd = new Date(endTime);
      let dateDiff = dateEnd.getTime() - dateBegin.getTime(); //时间差的毫秒数
      let dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000)); //计算出相差天数
      let leave1 = dateDiff % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
      let hours = Math.floor(leave1 / (3600 * 1000)); //计算出小时数
      //计算相差分钟数
      let leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
      let minutes = Math.floor(leave2 / (60 * 1000)); //计算相差分钟数
      //计算相差秒数
      let leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
      let seconds = Math.round(leave3 / 1000);
      let className = "";
      if (dayDiff >= 2) {
        className = "text-black";
      } else if (dayDiff == 1) {
        className = "text-orange";
      } else if (hours >= 12) {
        className = "text-red";
      } else {
        className = "text-red text-bold";
      }
      return className;
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
    handleDownload(file, name) {
      this.zipFile(file, name);
    },
    handleDownloadProgress(row) {
      this.zipFile(row.reportAttachment, row.product);
    },
    // 新增
    handleAdd() {
      this.isSaleAddDia = true;
    },
    // 修改
    handleUpdate(row) {
      this.isSaleAddDia = true;
      let { logisticsEntity } = row;
      let dataCopy;
      if(this.Is_Empty(logisticsEntity)) {
        dataCopy = { ...row, logisticsEntity: {} };
      } else {
        dataCopy = { ...row };
      }
      this.$refs.isAddSaleRef.form = dataCopy;
    },
    // 详情
    handleDetail(row) {
      this.isAfterDetailDia = true;  
      this.$refs.isAfterDetailRef.getAfterInfo(row.id)
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删产品SN为"' + row.sn + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return saleDelete([row.id]);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    // 关闭问题
    handleClose(row) {
      const { status } = row;
      this.$confirm(`是否${this.isStatusTxt(status)}该问题?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return saleUpdate({ ...row, status: status === 0 ? 1 : 0 });
        })
        .then(() => {
          this.getList();
          this.msgSuccess(`问题${this.isStatusTxt(status)}成功`);
        });
    },
    // 待处理、全部
    handleSeeWaitOrAllData() {
      this.isWaitDispose = !this.isWaitDispose;
      this.getList();
    },
    handleAuthChange(row, type) {
      let params = {};
      params.state = type;
      params.id = row.id;
      saleState(params).then((res) => {
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
    cellClick(row, column, cell, event) {
      switch (column.label) {
        case "定位进展":
          if (row.principal == this.userId || this.checkRole(["admin"]))
            this.handleUpdate(row, "progress", "");
          break;
        case "对策及导入计划":
          if (row.principal == this.userId || this.checkRole(["admin"]))
            this.handleUpdate(row, "report", "对策及导入计划");
          break;
        default:
          break;
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (
        (columnIndex == 12 || columnIndex == 13) &&
        (row.principal == this.userId || this.checkRole(["admin"]))
      ) {
        return `cursor: pointer;`;
      }
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
<style lang="scss">
.auth {
  text-align: center;
  margin-bottom: 10px;
}

.finish-row td,
.finish-row:hover td {
  background-color: rgba(155, 216, 148, 0.3) !important;
}

.afterSaleBox {
  .cell {
    padding: 0 5px;
  }

  .demand-box {
    img {
      width: 100% !important;
    }
  }
}
</style>
