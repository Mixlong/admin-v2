<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" inline>
      <el-form-item label="所属品类" prop="product">
        <el-select filterable allow-create clearable v-model="queryParams.product" style="width: 150px"
          @change="changeCategory" placeholder="请选择">
          <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="仪表型号" prop="model">
        <el-select :loading="isCLoading" filterable remote clearable style="width: 150px" v-model="queryParams.model"
          placeholder="请选择" @change="handleQuery" :remote-method="getComputerNameList">
          <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="客户" prop="customer">
        <el-autocomplete clearable v-model="queryParams.customer" style="width: 150px"
          :fetch-suggestions="querySearchAsync" placeholder="请选择客户" @change="handleQuery"></el-autocomplete>
      </el-form-item>
      <el-form-item label="售后单号" prop="saleNum">
        <el-input clearable v-model="queryParams.saleNum" style="width: 150px" placeholder="请输入售后单号"
          @change="handleQuery"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="state">
        <el-select @change="handleQuery" v-model="queryParams.state" style="width: 100px" placeholder="请选择">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-row :gutter="10" class="fr mt5">
        <el-col :span="1.5">
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table class="afterSaleBox" :row-class-name="rowName" v-loading="loading" :data="brandList"
      :height="tableHeight()" border @cell-click="cellClick" :cell-style="cellStyle">
      <el-table-column label="售后单号" prop="saleNum" align="center" width="135" />
      <el-table-column label="产品SN" prop="sn" align="center" width="135">
        <template slot-scope="{ row }">
          <div v-html="transSn(row.sn)"></div>
        </template>
      </el-table-column>
      <el-table-column label="品类" prop="product" align="center" width="70" />
      <el-table-column label="型号" prop="model" align="center" width="80" />
      <el-table-column label="客户" prop="customer" align="center" width="85" />
      <el-table-column label="不良类型" prop="errorType" align="center" width="80">
        <el-tag v-if="row.errorType" type="danger" slot-scope="{ row }">{{ row.errorType }}</el-tag>
      </el-table-column>
      <el-table-column label="数量" prop="num" align="center" width="55" />
      <el-table-column label="现象&影响" prop="description" align="center">
        <template slot-scope="scope">
          <div class="text-left">
            {{ scope.row.description }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="反馈人" prop="createBy" align="center" width="55" />
      <el-table-column label="反馈时间" prop="createTime" align="center" width="80">
        <template slot-scope="scope">
          {{ scope.row.createTime.slice(0, 11) }}
        </template>
      </el-table-column>
      <el-table-column label="期望解决时间" prop="expectTime" align="center" width="80">
        <template slot-scope="{ row }">
          {{ parseTime(row.expectTime, "{y}-{m}-{d}") }}
        </template>
      </el-table-column>
      <el-table-column label="实际解决时间" align="center" prop="performTime" width="80">
        <template slot-scope="{ row }">
          {{ parseTime(row.actualTime, "{y}-{m}-{d}") }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="55">
        <template slot-scope="scope">
          <span v-if="scope.row.state == 0" class="text-red">待处理</span>
          <span v-if="scope.row.state == 1" class="text-blue">处理中</span>
          <span v-if="scope.row.state == 2" class="text-green">已处理</span>
          <span v-if="scope.row.state == 3" class="text-orange">已驳回</span>
        </template>
      </el-table-column>
      <el-table-column label="定位进展" prop="demand" align="center">
        <template slot-scope="scope">
          <div class="text-left demand-box" v-html="scope.row.progress"></div>
        </template>
      </el-table-column>
      <el-table-column label="对策及导入计划" prop="report" align="center">
        <template slot-scope="scope">
          <el-row class="flex">
            <el-col :span="18">
              <div class="text-left demand-box" v-html="scope.row.report"></div>
            </el-col>
            <el-col :span="6" class="flex align-center justify-center">
              <img v-if="scope.row.reportAttachment" class="margin-left-xs"
                style="width: 17px; height: 17px; cursor: pointer" :src="require('@/assets/image/xiazai.png')" alt=""
                @click.stop="handleDownloadProgress(scope.row)" />
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="责任人" prop="principal" align="center" width="65" :formatter="principalName" />
      <el-table-column label="操作" align="center" width="140" class-name="small-padding fixed-width  ">
        <template slot-scope="scope">
          <!-- urlDownload -->
          <div style="padding-left: 8px" class="text-left">
            <Tooltip v-if="
              scope.row.principal == userId ||
              scope.row.feedbackBy == userId ||
              checkRole(['afterSale'])
            " icon="el-icon-edit" content="编辑" @click="handleUpdate(scope.row)" />

            <el-tooltip class="item font16" effect="dark" content="同意" placement="top-end" v-if="
              scope.row.state == 0 &&
              (scope.row.principal == userId || checkRole(['admin']))
            ">
              <el-button size="small" icon="el-icon-check" type="text" class="text-green"
                @click="handleAuthChange(scope.row, 1)"></el-button>
            </el-tooltip>
            <el-tooltip class="item font16" effect="dark" content="驳回" placement="top-end" v-if="
              scope.row.state == 0 &&
              (scope.row.principal == userId || checkRole(['admin']))
            ">
              <el-button size="small" icon="el-icon-circle-close" type="text" class="text-green font16"
                @click="handleAuthChange(scope.row, 3)"></el-button>
              <!-- <img class="margin-lr-xs" style="
                  width: 14px;
                  cursor: pointer;
                  vertical-align: middle;
                  position: relative;
                  top: -3px;
                " :src="require('@/assets/image/reject.png')" alt="" @click="handleAuthChange(scope.row, 3)" /> -->
            </el-tooltip>
            <el-tooltip class="item font16" effect="dark" content="已处理" placement="top-end" v-if="
              scope.row.state == 1 &&
              (scope.row.principal == userId || checkRole(['admin']))
            ">
              <el-button size="small" icon="el-icon-check" type="text" class="text-green"
                @click="handleAuthChange(scope.row, 2)"></el-button>
            </el-tooltip>
            <Tooltip v-if="
              scope.row.principal == userId ||
              scope.row.feedbackBy == userId ||
              checkRole(['admin'])
            " icon="el-icon-delete" :className="['text-red']" content="删除" @click="handleDelete(scope.row)" />
            <el-tooltip v-if="scope.row.attachment" effect="dark" content="附件" placement="top-end">
              <el-button size="small" icon="el-icon-download" type="text" class="text-green font16"
                @click.stop="handleDownload(scope.row.attachment, scope.row.product)"></el-button>
            </el-tooltip>
            <el-tooltip v-if="scope.row.fileUrl" effect="dark" content="记录文件" placement="top-end">
              <el-button size="small" icon="el-icon-download" type="text" class="text-green font16"
                @click.stop="handleDownload(scope.row.fileUrl, scope.row.product)"></el-button>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />

    <CompUpdate ref="compUpdate" :pmDictListOptions="pmDictListOptions" :dictList="dictList" />
  </div>
</template>

<script>
import { saleList, saleAuth, saleState } from "@/api/third/sale";
import CompUpdate from "./components/update";
import { listCustomer } from "@/api/third/sample";
import { mapGetters } from "vuex";
import { memberDictUser } from "@/api/system/user";
import FlipDown from "vue-flip-down";
import commonData from './mixins'
export default {
  mixins: [commonData],
  components: {
    CompUpdate,
    FlipDown,
  },
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
      // 品类
      dictList: [],
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
        l: 50,
        product: undefined,
        model: null,
        customer: undefined,
        saleNum: null,
        state: undefined,
      },
    };
  },
  computed: {
    ...mapGetters(["userId"]),
    transSn() {
      return sn => {
        if(/(,|，)/g.test(sn)) {
          sn = sn.replace(/，/g, ',')
          const snArr = sn.split(',')
          let htmlStr = ''
          snArr.forEach(item => {
            htmlStr += `<p>${item}</p>`
          })
          return htmlStr
        } else {
          return sn
        }
      }
    }
  },
  mounted() {
    let { name } = this.$route.query;
    if (name) {
      this.queryParams.product = name;
    }
    memberDictUser().then((response) => {
      if (response.code === 200) {
        this.pmDictListOptions = response.data;
      }
      this.getList();
    });
  },
  methods: {
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
      this.loading = true;
      saleList(this.queryParams).then((response) => {
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

    handleAdd() {
      this.$refs.compUpdate.dialogVisible = true;
      this.computerOptions = []
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.showName = "";
      this.$refs.compUpdate.title = "添加售后";
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

    handleUpdate(row, showName, title) {
      this.$refs.compUpdate.reset();
      this.$refs.compUpdate.dialogVisible = true;
      this.$refs.compUpdate.form = Object.assign({}, row);
      this.$refs.compUpdate.showName = showName;
      this.$refs.compUpdate.title = title == undefined ? "售后修改" : title;
      // this.$refs.compUpdate.changeCategory(row.product)
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
          return saleAuth([{ id: row.id, status: 1 }]);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
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
