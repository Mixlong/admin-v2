<template>
  <el-dialog
    :close-on-click-modal="false"
    :title="this.isType === 1 ? '新增计划' : '编辑计划'"
    :visible.sync="dialogVisible"
    width="400px"
    append-to-body
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      class="form-data"
      label-width="100px"
      label-position="left"
    >   
        <el-form-item label="待测设备：" prop="planDevice">
            <el-input v-model.trim="form.planDevice" clearable placeholder="请输入待测设备"></el-input>
        </el-form-item>
        <el-form-item label="数量：" prop="num">
            <el-input v-model.number="form.num" clearable placeholder="请输入数量"></el-input>
        </el-form-item>
        <el-form-item label="开始时间：" prop="startTime">
            <el-date-picker v-model="form.startTime" type="datetime" placeholder="开始时间" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间：" prop="endTime">
            <el-date-picker v-model="form.endTime" type="datetime" placeholder="结束时间" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" style="width: 100%;"></el-date-picker>
        </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getTestDevicePlanCreate, getTestDevicePlanUpdate } from '@/api/third/testDeviceManage'
export default {
    data() {
        return {
            dialogVisible: false,
            isType: 1,
            form: {
                device: ''
            },
            rules: {
                planDevice: [{ required: true, message: "待测设备不能为空", trigger: "change" }],
                num: [{ required: true, message: "数量不能为空", trigger: "change" }],
                startTime: [{ required: true, message: "开始时间不能为空", trigger: "change" }],
                endTime: [{ required: true, message: "结束时间不能为空", trigger: "change" }]
            }
        }
    },
    methods: {
        // 新增
        onTestDevicePlanCreate() {
            getTestDevicePlanCreate(this.form).then(res => {
                if(res.data) {
                    this.msgSuccess("新增成功");
                    this.dialogVisible = false
                    this.$parent.getList()
                }
            })
        },
        // 修改
        onTestDevicePlanUpdate() {
            getTestDevicePlanUpdate(this.form).then(res => {
                if(res.data) {
                    this.msgSuccess("修改成功");
                    this.dialogVisible = false
                    this.$parent.getList()
                }
            })
        },
        reset() {
            // if(this.isType === 1) {
            //     this.form.id = ''
            // }
            this.form = {}
            this.resetForm("form");
        },
        submitForm() {
            this.$refs.form.validate(valid => {
                if(valid) {
                    if(this.isType === 2) {
                        this.onTestDevicePlanUpdate() 
                    } else {
                        this.onTestDevicePlanCreate() 
                    }
                }
            })
        }
    }
}
</script>

<style>

</style>