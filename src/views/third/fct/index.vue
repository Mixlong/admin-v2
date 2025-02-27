<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="sn" prop="sn">
        <el-input
          v-model="queryParams.sn"
          placeholder="请输入sn"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="出货人" prop="deliveryUser">
        <el-input
          v-model="queryParams.deliveryUser"
          placeholder="请输入出货人"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="收货人" prop="consignees">
        <el-input
          v-model="queryParams.consignees"
          placeholder="请输入收货人"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="出货项" prop="deliveryOption">
        <el-input
          v-model="queryParams.deliveryOption"
          placeholder="请输入出货项"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery"> 重置 </el-button>
      </el-form-item>
      <el-button
        type="warning"
        icon="el-icon-download"
        @click="handleExport"
        class="fr margin-bottom-xs"
      >
        导出
      </el-button>
    </el-form>
    <el-table
      v-loading="loading"
      :data="brandList"
      :height="tableHeight(+18)"
      border
    >
      <el-table-column label="序号" type="index" width="50" align="center">
        <template slot-scope="scope">
          <span>
            {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
          </span>
        </template>
      </el-table-column>

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
        width="140"
      />
      <el-table-column
        label="收货人"
        prop="consignees"
        align="center"
        width="100"
      />
      <el-table-column
        label="收货人电话"
        prop="consigneesPhone"
        align="center"
        width="120"
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
      <el-table-column
        label="出货项"
        prop="deliveryOption"
        align="center"
        width="100"
      />
      <el-table-column label="宝SN" prop="chargePalSn" align="center" />
      <el-table-column
        label="主机SN号	"
        prop="masterSn"
        align="center"
        width="120"
      />
      <el-table-column
        label="从机SN号	"
        prop="slaveSn"
        align="center"
        width="120"
      />
      <el-table-column
        label="搭配宝个数"
        prop="typeName"
        align="center"
        width="100"
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

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <CompDetail ref="compDetail" :list="detailList" />
    <ExportList ref="exportList" />
  </div>
</template>

<script>
import { fctCabinet } from "@/api/third/fct";
import CompDetail from "./components/detail";
import ExportList from "./components/exportList";
import { mapGetters } from "vuex";
export default {
  name: "Fct",
  components: {
    CompDetail,
    ExportList,
  },
  data() {
    return {
      open: false,
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
      brandList: [],

      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
      },
      detailList: [],
    };
  },
  computed: {
    ...mapGetters(["userId"]),
  },
  mounted() {
    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      let params = Object.assign({}, this.queryParams);
      fctCabinet(params).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
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

    handleDetail(row) {
      this.$refs.compDetail.dialogVisible = true;
      this.detailList = row.palList;
    },
    handleExport() {
      this.$refs.exportList.dialogVisible = true;
    },
  },
};
</script>
<style lang="scss" scope>
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
