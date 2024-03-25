<template>
  <el-dialog
    :close-on-click-modal="false"
    :title="this.isType === 1 ? '新增订单' : '修改订单'"
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
      label-position="right"
    >   
        <el-form-item label="设备编号：" prop="no">
            <el-input v-model.trim="form.no" clearable placeholder="请输入设备编号"></el-input>
        </el-form-item>
        <el-form-item label="设备名称：" prop="name">
            <el-input v-model.trim="form.name" clearable placeholder="请输入设备名称"></el-input>
        </el-form-item>
        <el-form-item label="负责人 ：" prop="user">
            <el-input v-model.trim="form.user" clearable placeholder="请输入负责人"></el-input>
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
import { getTestDeviceCreate, getTestDeviceUpdate } from '@/api/third/testDeviceManage'
export default {
    data() {
        return {
            title: '',
            dialogVisible: false,
            isType: 1,
            form: {},
            rules: {
                no: [{ required: true, message: "设备编号不能为空", trigger: "change" }],
                name: [{ required: true, message: "设备名称不能为空", trigger: "change" }],
                user: [{ required: true, message: "负责人不能为空", trigger: "change" }],
                remark: [{ required: true, message: "备注不能为空", trigger: "change" }]
            }
        }
    },
    methods: {
        // 新增
        onTestDeviceCreate() {
            getTestDeviceCreate(this.form).then(res => {
                if(res.data) {
                    this.msgSuccess("新增成功");
                    this.dialogVisible = false
                    this.$parent.getList()
                }
            })
        },
        // 修改
        onTestDeviceUpdate() {
            getTestDeviceUpdate(this.form).then(res => {
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
                    if(this.form.id) {
                        this.onTestDeviceUpdate() 
                    } else {
                        this.onTestDeviceCreate() 
                    }
                }
            })
        }
    }
}
</script>

<style>

</style>