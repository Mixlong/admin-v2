<template>
  <el-dialog
    class="delivery-detail-box"
    title="发货详情"
    :visible.sync="dialogVisible"
    center
    append-to-body
    top="1vh"
    width="1000px"
    :close-on-click-modal="true"
  >
    <el-descriptions title="基本信息" direction="vertical" :column="4" border>
      <el-descriptions-item label="客户名称">
        <span v-NoData="form.customerName"></span>
      </el-descriptions-item>
      <el-descriptions-item label="迪太订单号">
        <span v-NoData="form.salesOrderNo"></span>
      </el-descriptions-item>
      <el-descriptions-item label="客户订单号">
        <span v-NoData="form.customerOrderNo"></span>
      </el-descriptions-item>
      <el-descriptions-item label="品类">
        <span v-NoData="form.categoryName"></span>
      </el-descriptions-item>
      <el-descriptions-item label="型号">
        <span v-NoData="form.computerName"></span>
      </el-descriptions-item>
      <el-descriptions-item label="发货单号">
        <span v-NoData="form.orderNumber"></span>
      </el-descriptions-item>
      <el-descriptions-item label="运输方式">
        <span v-NoData="form.transportMode"></span>
      </el-descriptions-item>
      <el-descriptions-item label="发货数量">
        <span v-NoData="form.shippingNumber"></span>
      </el-descriptions-item>
      <el-descriptions-item label="收货人">
        <span v-NoData="form.consignee"></span>
      </el-descriptions-item>
      <el-descriptions-item label="发货状态">
        <el-tag size="mini" :type="tagType(form.status)">
          {{ statusList[form.status] }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="发货时间">
        <span v-NoData="parseTime(form.shippingTime, '{y}-{m}-{d}')"></span>
      </el-descriptions-item>
    </el-descriptions>

    <el-card
      v-if="!Is_Empty(form.shippingPicture)"
      shadow="nerver"
      class="margin-top-sm"
    >
      <b slot="header">发货图片</b>
      <div class="flex flex-wrap" style="gap: 8px">
        <preview-img
          v-for="(item, index) in form.shippingPicture.split(',')"
          width="60px"
          height="60px"
          :key="index"
          :url="item"
        />
      </div>
    </el-card>

    <template v-if="form.list">
      <el-divider content-position="center">订单列表</el-divider>
      <el-card shadow="nerver" v-for="item in form.list" class="margin-bottom-xs">
        <el-table
          :data="[item]"
          border
          :header-cell-style="{ background: '#c0c0f4 !important' }"
        >
          <el-table-column
            label="客户订单号"
            prop="customerOrderNo"
            align="center"
          >
            <span slot-scope="{ row }" v-NoData="row.customerOrderNo"></span>
          </el-table-column>
          <el-table-column label="客户名称" prop="customerName" align="center">
            <span slot-scope="{ row }" v-NoData="row.customerName"></span>
          </el-table-column>
          <el-table-column label="送货单号" prop="oddNumbers" align="center">
            <span slot-scope="{ row }" v-NoData="row.oddNumbers"></span>
          </el-table-column>
          <el-table-column
            label="计划发货数量"
            prop="shippingNumber"
            align="center"
          >
            <span slot-scope="{ row }" v-NoData="row.shippingNumber"></span>
          </el-table-column>
          <el-table-column
            label="计划发货时间"
            prop="shippingTime"
            align="center"
          >
            <span
              slot-scope="{ row }"
              v-NoData="parseTime(row.shippingTime, '{y}-{m}-{d}')"
            ></span>
          </el-table-column>
          <el-table-column label="备注" prop="remark" align="center">
            <span slot-scope="{ row }" v-NoData="row.remark"></span>
          </el-table-column>
        </el-table>

        <el-table
          v-if="item.boxList.length"
          :data="item.boxList"
          max-height="250"
          border
          class="margin-top-xs"
          :cell-class-name="cellClassName"
        >
          <el-table-column label="整箱编号" prop="no" align="center">
            <template slot-scope="{ row }">
              <el-tooltip
                effect="dark"
                content="点击跳转产品记录页"
                placement="top"
                :disabled="Is_Empty(row.no)"
              >
                <el-link
                  type="primary"
                  :underline="!Is_Empty(row.no)"
                  :disabled="Is_Empty(row.no)"
                  @click="handleToPage(row)"
                >
                  {{ Is_Empty(row.no) ? "- - -" : row.no }}
                </el-link>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            prop="createTime"
            align="center"
            sortable
          >
            <span
              slot-scope="{ row }"
              v-NoData="parseTime(row.createTime)"
            ></span>
          </el-table-column>
        </el-table>

        <el-table
          v-if="item.endBoxList.length"
          :data="item.endBoxList"
          max-height="250"
          border
          class="margin-top-sm"
          :cell-class-name="cellClassName"
        >
          <el-table-column label="尾数编号" prop="no" align="center">
            <template slot-scope="{ row }">
              <el-tooltip
                effect="dark"
                content="点击跳转产品记录页"
                placement="top"
                :disabled="Is_Empty(row.no)"
              >
                <el-link
                  type="primary"
                  :underline="!Is_Empty(row.no)"
                  :disabled="Is_Empty(row.no)"
                  @click="handleToPage(row)"
                >
                  {{ Is_Empty(row.no) ? "- - -" : row.no }}
                </el-link>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            prop="createTime"
            align="center"
            sortable
          >
            <span
              slot-scope="{ row }"
              v-NoData="parseTime(row.createTime)"
            ></span>
          </el-table-column>
        </el-table>

        <el-table
          v-if="item.orderList.length"
          :data="item.orderList"
          max-height="250"
          border
          class="margin-top-sm"
        >
          <el-table-column label="运单号" prop="no" align="center">
            <span slot-scope="{ row }" v-NoData="row.no"></span>
          </el-table-column>
          <el-table-column
            label="创建时间"
            prop="createTime"
            align="center"
            sortable
          >
            <span
              slot-scope="{ row }"
              v-NoData="parseTime(row.createTime)"
            ></span>
          </el-table-column>
        </el-table>
      </el-card>
    </template>
  </el-dialog>
</template>

<script>
import { deliveryDetail } from "@/api/delivery";

export default {
  props: ["statusList", "tagType"],
  data() {
    return {
      dialogVisible: false,
      form: {
        boxList: [],
        endBoxList: [],
        orderList: [],
      },
    };
  },
  methods: {
    getDetail(id) {
      deliveryDetail(id).then((res) => {
        this.form = res.data;
        console.log("this.form", this.form);
      });
    },
    cellClassName({ row, column, rowIndex, columnIndex }) {
      const columnIndexData = [0];
      if (this.Is_Empty(row.no)) {
        return;
      }

      if (columnIndexData.includes(columnIndex)) {
        return "pointer";
      } else {
        return "";
      }
    },
    handleToPage(row) {
      this.dialogVisible = false;
      this.handleNameToPage("ProductRecord", { boxNo: row.no });
    },
  },
};
</script>
<style lang="scss" scoped>
.delivery-detail-box {
  /deep/ .el-dialog__body {
    max-height: 80vh;
    overflow: hidden;
    overflow-y: auto;
  }
}
</style>
