<template>
  <el-dialog
    :close-on-click-modal="false"
    :title="this.isType === 1 ? '新增计划' : '修改计划'"
    :visible.sync="dialogVisible"
    width="590px"
    append-to-body
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      class="form-data"
      label-width="100px"
      label-position="right"
    >   
        <el-form-item label="备货时间：" required>
            <el-col :span="11">
                <el-form-item prop="stockStartTime">
                    <el-date-picker v-model="form.stockStartTime" type="datetime" placeholder="备货开始时间" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" style="width: 100%;"></el-date-picker>
                </el-form-item>
            </el-col>
            <el-col class="text-center" :span="2">-</el-col>
            <el-col :span="11">
                <el-form-item prop="stockEndTime">
                    <el-date-picker v-model="form.stockEndTime" type="datetime" placeholder="备货结束时间" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" style="width: 100%;"></el-date-picker>
                </el-form-item>
            </el-col>
        </el-form-item>
        <el-form-item label="生产时间：" required>
            <el-col :span="11">
                <el-form-item prop="produceStartTime">
                    <el-date-picker v-model="form.produceStartTime" type="datetime" placeholder="生产开始时间" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" style="width: 100%;"></el-date-picker>
                </el-form-item>
            </el-col>
            <el-col class="text-center" :span="2">-</el-col>
            <el-col :span="11">
                <el-form-item prop="produceEndTime">
                    <el-date-picker v-model="form.produceEndTime" type="datetime" placeholder="生产结束时间" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" style="width: 100%;"></el-date-picker>
                </el-form-item>
            </el-col>
        </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getSaleOrderUpdate } from '@/api/third/saleOrder'
export default {
    data() {
        return {
            isType: 1,
            dialogVisible: false,
            form: {},
            rules: {
                stockStartTime: [{ required: true, message: "备货开始时间不能为空", trigger: "change" }],
                stockEndTime: [{ required: true, message: "备货结束时间不能为空", trigger: "change" }],
                produceStartTime: [{ required: true, message: "生产开始时间不能为空", trigger: "change" }],
                produceEndTime: [{ required: true, message: "生产结束时间不能为空", trigger: "change" }],
            }
        }
    },
    methods: {
        onUpdateSaleOrder() {
            getSaleOrderUpdate(this.form).then(res => {
                if(res.data) {
                    if(this.isType === 1) {
                        this.msgSuccess("新增计划成功");
                    } else {
                        this.msgSuccess("修改成功");
                    }
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
                    this.onUpdateSaleOrder()
                }
            })
        }
    }
}
</script>

<style>

</style>