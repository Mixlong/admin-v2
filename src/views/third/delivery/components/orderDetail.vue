<template>
  <el-dialog
    class="delivery-detail-box"
    title="发货详情"
    :visible.sync="dialogVisible"
    center
    append-to-body
    top="1vh"
    width="800px"
    :close-on-click-modal="true"
  >
    <el-card shadow="nerver">
      <b slot="header">基本信息</b>
      <p>
        客户名称：
        <span v-NoData="form.customerName"></span>
      </p>
      <p>
        迪太订单号：
        <span v-NoData="form.salesOrderNo"></span>
      </p>
      <p>
        客户订单号：
        <span v-NoData="form.customerOrderNo"></span>
      </p>
      <p>
        品类：
        <span v-NoData="form.categoryName"></span>
      </p>
      <p>
        型号：
        <span v-NoData="form.computerName"></span>
      </p>
      <p>
        发货单号：
        <span v-NoData="form.orderNumber"></span>
      </p>
      <p>
        运输方式：
        <span v-NoData="form.transportMode"></span>
      </p>
      <p>
        发货数量：
        <span v-NoData="form.shippingNumber"></span>
      </p>
      <p>
        发货人：
        <span v-NoData="form.shippingName"></span>
      </p>
      <p>
        收货人：
        <span v-NoData="form.consignee"></span>
      </p>
      <p>
        发货状态：
        <el-tag size="mini" :type="tagType(form.status)">
          {{ statusList[form.status] }}
        </el-tag>
      </p>
      <p>
        发货时间：
        <span v-NoData="parseTime(form.shippingTime)"></span>
      </p>
    </el-card>

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

    <el-card
      v-if="!Is_Empty(form.receiptImg)"
      shadow="nerver"
      class="margin-top-sm"
    >
      <b slot="header">回单图片</b>
      <div class="flex flex-wrap" style="gap: 8px">
        <preview-img
          v-for="(item, index) in form.receiptImg.split(',')"
          width="60px"
          height="60px"
          :key="index"
          :url="item"
        />
      </div>
    </el-card>

    <el-table
      v-if="form.boxList.length"
      :data="form.boxList"
      max-height="250"
      border
      class="margin-top-sm"
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
        <span slot-scope="{ row }" v-NoData="parseTime(row.createTime)"></span>
      </el-table-column>
    </el-table>

    <el-table
      v-if="form.endBoxList.length"
      :data="form.endBoxList"
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
        <span slot-scope="{ row }" v-NoData="parseTime(row.createTime)"></span>
      </el-table-column>
    </el-table>

    <el-table
      v-if="form.orderList.length"
      :data="form.orderList"
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
        <span slot-scope="{ row }" v-NoData="parseTime(row.createTime)"></span>
      </el-table-column>
    </el-table>
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