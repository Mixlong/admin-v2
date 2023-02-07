
<template>
    <el-dialog title="订单详情" class="orderDetail" :visible.sync="dialogVisible" center append-to-body top="1vh"
        width="800px" :close-on-click-modal="true">
        <el-form ref="form" label-position="left" :model="form" @submit.native.prevent>
            <fieldset class="margin-bottom-sm">
                <legend>基本信息</legend>
                <el-row :gutter="20" class="margin-top-xs">
                    <el-col :span="12">
                        <el-form-item label="客户名称：" style="width: 100%">
                            {{ form.customerName }}
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="销售订单号：" style="width: 100%">
                            {{ form.salesOrderNo }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="客户订单号：" style="width: 100%">
                            {{ form.customerOrderNo }}
                        </el-form-item>
                    </el-col>
                </el-row>
            </fieldset>
            <fieldset class="products-box margin-bottom-sm">
                <legend>产品信息</legend>
                <div v-for="(item, index) in form.products" :key="index" class="product-list-box margin-top-xs"
                    :class="{ 'margin-bottom-sm': form.products.length > 1, 'overTime': isOverTime(item.deliveryDate) }">
                    <el-row :gutter="10">
                        <el-col :span="5">
                            <el-form-item label="产品品类：" style="width: 100%">
                                {{ item.categoryName }}
                            </el-form-item>
                        </el-col>
                        <el-col :span="7">
                            <el-form-item label="型号：" style="width: 100%">
                                {{ item.computerName }}
                            </el-form-item>
                        </el-col>
                        <el-col :span="5">
                            <el-form-item label="数量：" style="width: 100%">
                                {{ item.num }}
                            </el-form-item>
                        </el-col>
                        <el-col :span="7">
                            <el-form-item label="交期：" prop="deliveryDate" style="width: 100%">
                                {{ parseTime(item.deliveryDate) }}
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
            </fieldset>
            <fieldset class="address-box margin-bottom-sm">
                <legend>收货信息</legend>
                <el-form-item class="margin-top-xs" label="收货人：">{{ form.consignee }}</el-form-item>
                <el-form-item label="收货地址：">{{ `${form.province}${form.city}${form.area}${form.consigneeAddress}` }}
                </el-form-item>
                <el-form-item label="发货方式：">{{ form.deliveryValue }}</el-form-item>
            </fieldset>
            <el-form-item label="订单评审表" style="width: 100%" v-if="form.orderReviewForm">
                <el-row type="flex">
                    <el-col :offset="2" :span="17">
                        {{ $transFileUrl(form.orderReviewForm) }}
                    </el-col>
                    <el-col :offset="1" :push="0" :span="5" class="text-center">
                        <el-button size="mini" type="primary" @click="urlDownload(form.orderReviewForm)">下载</el-button>
                    </el-col>
                </el-row>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>
import { getOrderDetail } from "@/api/order";

export default {
    data() {
        return {
            dialogVisible: false,
            form: {}
        };
    },
    computed: {
        isOverTime() {
            return overTime => {
                return overTime < +new Date()
            }
        }
    },
    methods: {
        getOrderDetail(id) {
            getOrderDetail(id).then(res => {
                this.form = res.data
            })
        }
    },
};
</script>

<style lang="scss">
.orderDetail {
    .style-upload {
        .el-upload-dragger {
            width: 100%;
        }
    }

    .products-box,
    .address-box {
        max-height: 370px;
        overflow: auto;
        overflow-x: hidden;

        .product-list-box {
            border-bottom: 1px solid #ccc;
            padding: 0 10px;
            border-radius: 3px;

            &.overTime {
                background: rgb(236, 96, 96);
                color: #fff;

                .el-form-item__label {
                    color: #fff !important;
                }
            }

        }

        .address-list-box {
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 3px;

            .el-icon-check {
                font-size: 20px;
            }
        }
    }

    .el-form-item {
        margin-bottom: 5px;
    }
}
</style>

