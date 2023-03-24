<template>
  <el-dialog
    title="订单详情"
    class="orderDetail"
    :visible.sync="dialogVisible"
    center
    append-to-body
    top="1vh"
    width="800px"
    :close-on-click-modal="true"
  >
    <el-form ref="form" label-position="left" :model="form">
      <fieldset class="margin-bottom-sm">
        <legend>基本信息</legend>
        <el-row :gutter="20" class="margin-top-xs">
          <el-col :span="12">
            <el-form-item label="客户名称：">
              {{ form.customerName }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="迪太订单号：">
              {{ form.salesOrderNo }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户订单号：">
              {{ form.customerOrderNo }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单状态：">
              <el-tag size="mini" :type="tagType(form.status)">
                {{ statusList[form.status] }}
              </el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排产状态：">
              <el-tag size="mini">
                {{ productStatusList[form.productStatus] }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>
      </fieldset>
      <fieldset class="margin-bottom-sm">
        <legend>产品信息</legend>
        <el-row :gutter="10" class="margin-top-xs">
          <el-col :span="8">
            <el-form-item label="产品品类：">
              {{ form.categoryName }}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="产品型号：">
              {{ form.computerName }}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="订单数量：">
              {{ form.orderQuantity }}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="BOM编码：">
              {{ form.bomCode }}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="芯片版本：">
              {{ form.chipVersion }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="出货日期：">
              {{ parseTime(form.sellTime) }}
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="客户要求到货日期：">
              {{ parseTime(form.arrivalTime) }}
            </el-form-item>
          </el-col>
          <el-col :span="8" v-show="form.containerMarkInfo">
            <el-form-item label="箱唛文件:">
              <el-button
                type="text"
                @click="urlDownload(form.containerMarkInfo)"
              >
                箱唛文件内容
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </fieldset>
      <fieldset class="margin-bottom-sm" v-if="form.consigneeAddress">
        <legend>收货信息</legend>
        <el-form-item label="收货地址：" class="margin-top-xs">
          {{ form.consigneeAddress }}
        </el-form-item>
      </fieldset>
      <fieldset class="margin-bottom-sm" v-if="form.boxInfo || form.sellInfo">
        <legend>其他内容</legend>
        <el-card shadow="hover" v-if="form.boxInfo">
          <span slot="header">BOM选配信息</span>
          <div
            class="overflow-y"
            style="max-height: 250px"
            v-html="form.boxInfo"
          ></div>
        </el-card>
        <el-card shadow="hover" v-if="form.sellInfo">
          <span slot="header">备注</span>
          <div style="max-height: 250px" v-html="form.sellInfo"></div>
        </el-card>
      </fieldset>
    </el-form>
  </el-dialog>
</template>

<script>
import { getOrderDetail } from "@/api/order";

export default {
  props: ["statusList"],
  data() {
    return {
      dialogVisible: false,
      form: {},
      productStatusList: {
        0: "未排产",
        1: "smt已排产、包装未排产",
        2: "smt已排产、包装已排产",
        3: "smt部分排产、包装部分排产",
        4: "smt已排产、包装部分排产",
        5: "smt部分排产、包装已排产",
        6: "smt部分排产、包装未排产",
        7: "smt未排产、包装部分排产",
        8: "smt未排产、包装已排产",
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
          case 3:
            return "warning";
        }
      };
    },
  },
  methods: {
    getOrderDetail(id) {
      getOrderDetail(id).then((res) => {
        this.form = res.data;
      });
    },
  },
};
</script>
