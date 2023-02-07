<template>
  <el-dialog
    :close-on-click-modal="false"
    :title="this.isType === 1 ? '新增订单' : '修改订单'"
    :visible.sync="dialogVisible"
    :width="isPlain ? '590px' : '800px'"
    append-to-body
    :top="boleConfig ? '5vh' : '0vh'"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      class="form-data"
      label-width="100px"
      label-position="right"
      :class="{ 'inline-form': boleConfig, 'form-data-inline': !isPlain }"
      :inline="!isPlain"
    >   
        <el-form-item label="订单号：" prop="no">
            <el-input v-model.trim="form.no" clearable placeholder="请输入订单号"></el-input>
        </el-form-item>
        <el-form-item label="客户：" prop="customer">
            <el-input v-model.trim="form.customer" clearable placeholder="请输入客户"></el-input>
        </el-form-item>
        <el-form-item label="产品品类：" prop="category">
            <el-select
                size="small"
                clearable
                v-model="form.category"
                placeholder="请选择产品品类"
            >
            <el-option
                v-for="dict in dictList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.name"
            />
        </el-select>
        </el-form-item>
        <el-form-item label="产品型号：" prop="model">
            <el-select
                size="small"
                clearable
                v-model="form.model"
                placeholder="请选择产品型号"
            >
            <el-option
                v-for="dict in modelList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.name"
            />
        </el-select>
        </el-form-item>
        <el-form-item label="数量：" prop="num">
            <el-input v-model.number="form.num" clearable placeholder="请输入数量"></el-input>
        </el-form-item>
        <el-form-item label="交货时间：" prop="deliverTime">
            <el-date-picker v-model="form.deliverTime" type="datetime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择日期时间"></el-date-picker>
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
            <el-input type="textarea" v-model.trim="form.remark" clearable placeholder="请输入备注"></el-input>
        </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getSaleOrderCreate, getSaleOrderUpdate } from '@/api/third/saleOrder'
export default {
    props: ['dictList', 'modelList'],
    data() {
        return {
            boleConfig: false,
            dialogVisible: false,
            isPlain: false,
            isType: 1,
            form: {},
            rules: {
                no: [{ required: true, message: "订单号不能为空", trigger: "change" }],
                customer: [{ required: true, message: "客户不能为空", trigger: "change" }],
                category: [{ required: true, message: "产品品类不能为空", trigger: "change" }],
                model: [{ required: true, message: "产品型号不能为空", trigger: "change" }],
                num: [{ required: true, message: "数量不能为空", trigger: "change" }],
                deliverTime: [{ required: true, message: "交货时间不能为空", trigger: "change" }]
            }
        }
    },
    methods: {
        // 新增
        onAddSaleOrder() {
            getSaleOrderCreate(this.form).then(res => {
                if(res.data) {
                    this.msgSuccess("新增成功");
                    this.dialogVisible = false
                    this.$parent.getList()
                }
            })
        },
        // 修改
        onUpdateSaleOrder() {
            getSaleOrderUpdate(this.form).then(res => {
                if(res.data) {
                    this.msgSuccess("修改成功");
                    this.dialogVisible = false
                    this.$parent.getList()
                }
            })
        },
        reset() {
            this.form = {}
            this.resetForm("form");
        },
        submitForm() {
            this.$refs.form.validate(valid => {
                if(valid) {
                    if(this.isType === 2) {
                        this.onUpdateSaleOrder()
                    } else {
                        this.onAddSaleOrder() 
                    }
                }
            })
        }
    }
}
</script>

<style>

</style>