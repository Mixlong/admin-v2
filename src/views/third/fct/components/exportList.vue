 <template>
  <el-dialog
    title="导出列表"
    :visible.sync="dialogVisible"
    width="80%"
    append-to-body
    :close-on-click-modal="false"
  >
    <div>
      <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
        @submit.native.prevent
      >
        <el-form-item label="出货人" prop="deliveryUser">
          <el-input
            v-model="queryParams.deliveryUser"
            placeholder="请输入出货人"
            size="small"
          ></el-input>
        </el-form-item>
        <el-form-item label="收货人" prop="consignees">
          <el-input
            v-model="queryParams.consignees"
            placeholder="请输入收货人"
            size="small"
          ></el-input>
        </el-form-item>
		<el-form-item label="出货项" prop="deliveryOption">
		  <el-input
		    v-model="queryParams.deliveryOption"
		    placeholder="请输入出货项"
		    size="small"
		  ></el-input>
		</el-form-item>	
        <el-form-item label="导出日期" prop="categoryId">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            align="right"
            size="small"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          >
          </el-date-picker>
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
        <el-button
          part="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          class="fr margin-top-xs"
          >导出</el-button
        >
      </el-form>
      <el-table
        v-loading="loading"
        :data="brandList"
        :height="tableHeight(-30)"
        border
      >
        <el-table-column label="序号" type="index" width="50" align="center" />

        <el-table-column
          label="出货人"
          prop="deliveryUser"
          align="center"
          width="100"
        />
        <el-table-column
          label="出货时间"
          prop="deliveryTime"
          align="center"
          width="100"
        />
        <el-table-column
          label="收货人"
          prop="consignees"
          align="center"
          width="130"
        />
        <el-table-column
          label="收货人电话"
          prop="consigneesPhone"
          align="center"
          width="130"
        />
        <el-table-column
          label="收货人地址	"
          prop="consigneesAddress"
          align="center"
          width="150"
        />
        <el-table-column label="备注" prop="remark" align="center">
          <template slot-scope="scope">
            <div class="text-left">
              {{ scope.row.remark }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="宝SN" prop="chargePalSn" align="center" />
        <el-table-column
          label="出货项	"
          prop="deliveryOption"
          align="center"
          width="100"
        />
        <el-table-column
          label="主机SN号"
          prop="masterSn"
          align="center"
          width="100"
        />
        <el-table-column
          label="从机SN号"
          prop="slaveSn"
          align="center"
          width="100"
        />
        <el-table-column
          label="搭配宝个数	"
          prop="palList"
          align="center"
          width="80"
        >
          <template slot-scope="scope">
            {{ scope.row.palList.length }}
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="80">
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              content="详情"
              placement="top-end"
            >
              <el-button
                icon="el-icon-view"
                type="text"
                class="text-green"
                @click="handleDetail(scope.row, 3)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <CompDetail ref="compDetail" :list="detailList" />
    </div>
  </el-dialog>
</template>

<script>
import { fctExportList } from "@/api/third/fct";
import CompDetail from "./detail";
import { mapGetters } from "vuex";
import { formatDate } from "@/utils";
export default {
  components: {
    CompDetail,
  },
  filters: {},
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
      },
      dialogVisible: false,
      open: false,
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      dateRange: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      brandList: [],
      // 查询参数
      queryParams: {},
      detailList: [],
    };
  },
  watch: {
    // dialogVisible() {
    //   this.getList();
    // },
  },
  computed: {
    ...mapGetters(["userId"]),
  },
  mounted() {
    const end = new Date();
    const start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
    this.dateRange = [start, end];
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      fctExportList(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.brandList = response.data;
          this.loading = false;
        }
      );
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

    handleDetail(row) {
      this.$refs.compDetail.dialogVisible = true;
      this.detailList = row.palList;
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.addDateRange(this.queryParams, this.dateRange);
      let _this = this;
      this.$confirm("是否确认导出所有数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(function () {
        import("../js/Export2Excel").then((excel) => {
          const tHeader = [
            "发货日期",
            "分类",
            "审批编号",
            "组织代码",
            "出货人",
            "收货人",
            "收货人电话",
            "收货人地址",
            "快递公司",
            "快递单号",

            "电饱饱充电站Pro-/套",
            "主机SN号",
            "从机SN号",
            "主机对应QRC",
            "充电宝数量/套",
            "箱码",
            "充电宝ID（1）",
            "充电宝ID（2）",
            "充电宝ID（3）",
            "充电宝ID（4）",
            "充电宝ID（5）",
            "充电宝ID（6）",
            "充电宝ID（7）",
            "充电宝ID（8）",
            "备注",
          ];
          const filterVal = [
            "deliveryTime",
            "分类",
            "审批编号",
            "组织代码",
            "deliveryUser",
            "consignees",
            "consigneesPhone",
            "consigneesAddress",
            "快递公司",
            "快递单号",
            "deliveryOption",
            "masterSn",
            "slaveSn",
            "masterQrc",
            "palList",
            "箱码",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "remark",
          ];

          const list = _this.brandList;
          for (let key of list) {
            if (key.chargePalSn) {
              key.palList = [
                {
                  chargePalSn: key.chargePalSn,
                },
              ];
            }
          }
          const data = _this.formatJson(filterVal, list);

          excel.export_json_to_excel({
            header: tHeader, //表头 必填
            data, //具体数据 必填
            oldData: list,
            filename:
              "收钱吧包装出货数据-" +
              formatDate(new Date()).replace(/:|-|\s/g, ""), //非必填
            autoWidth: true, //非必填
            bookType: "xlsx", //非必填
            myMerges: _this.myMerges,
          });
        });
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((j) => {
          if (j == "palList") {
            return v[j].length;
          } else if (Number(j) <= 8) {
            if (v["palList"].length >= j) {
              return v["palList"][Number(j) - 1].chargePalSn;
            }
            return "";
          } else {
            return v[j];
          }
        })
      );
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
.mask-layer {
  position: relative;
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
}
.open-detail-style {
  div {
    > span {
      &:first-child {
        color: #666;
        margin-right: 10px;
      }
    }
  }
}
</style>
