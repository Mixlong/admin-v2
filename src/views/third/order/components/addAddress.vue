<template>
    <el-dialog :title="title" :visible.sync="dialogVisible" :width="isCustomer ? '700px' : '400px'" center
        append-to-body top="1vh" :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rules" label-position="left" label-width="90px"
            @submit.native.prevent>
            <template v-if="isCustomer">
                <el-form-item label="客户名称" prop="customerId" style="width: 50%;">
                    <el-select v-model="form.customerId" filterable placeholder="请选择客户名称" clearable>
                        <el-option v-for="item in orderCusList" :key="item.id" :label="`${item.no}-${item.name}`"
                            :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="收货人" prop="consignee" style="width: 50%;">
                    <el-input v-model.trim="form.consignee" placeholder="请输入收货人" clearable size="mini"></el-input>
                </el-form-item>
                <el-form-item label="联系方式" prop="consigneeTel" style="width: 50%;">
                    <el-input v-model.trim="form.consigneeTel" oninput="value=value.replace(/[^\d]/g,'')" maxlength="11"
                        placeholder="请输入联系方式" clearable size="mini"></el-input>
                </el-form-item>
                <el-form-item label="收获地址">
                    <v-distpicker @selected="onSelected"></v-distpicker>
                    <!-- <el-row>
                    <el-col :span="6">
                        <el-form-item prop="province">
                            <el-select v-model="form.province" filterable placeholder="请选择省份" clearable size="mini">
                                <el-option v-for="item in provinceList" :key="item.id" :label="item.name"
                                    :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="2" class="flex justify-center">省</el-col>
                    <el-col :span="6">
                        <el-form-item prop="city">
                            <el-select v-model="form.city" filterable placeholder="请选择市" clearable size="mini">
                                <el-option v-for="item in provinceList" :key="item.id" :label="item.name"
                                    :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="2" class="flex justify-center">市</el-col>
                    <el-col :span="6">
                        <el-form-item prop="area">
                            <el-select v-model="form.area" filterable placeholder="请选择区/县" clearable size="mini">
                                <el-option v-for="item in provinceList" :key="item.id" :label="item.name"
                                    :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="2" class="flex justify-center">区/县</el-col>
                </el-row> -->
                </el-form-item>
                <el-form-item label="详细地址" prop="consigneeAddress">
                    <el-input v-model.trim="form.consigneeAddress" type="textarea" placeholder="请输入详细地址"></el-input>
                </el-form-item>
            </template>
            <template v-else>
                <!-- 新增客户 -->
                <el-form-item label="客户编码" prop="no">
                    <el-input v-model.trim="form.no" size="mini" placeholder="请输入客户编码" clearable></el-input>
                </el-form-item>
                <el-form-item label="客户名称" prop="name">
                    <el-input v-model.trim="form.name" size="mini" placeholder="请输入客户名称" clearable></el-input>
                </el-form-item>
            </template>
        </el-form>
        <span slot="footer">
            <el-button type="primary" @click="submitForm('form')">确定</el-button>
            <el-button @click="resetForm('form')">取消</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { addCustomer, addAddress } from "@/api/order"
import { mixinsFn } from "@/mixins/commonFn"
import VDistpicker from 'v-distpicker'
const validConsigneeTel = (rule, value, callback) => {
    if (!/^1[35678]\d{9}$/g.test(value)) {
        return callback('请输入正确的手机号')
    }
    callback()
}
export default {
    props: {
        title: {
            type: String,
            default: "",
            required: true
        },
        orderCusList: {
            type: Array,
            default: []
        }
    },
    mixins: [mixinsFn],
    inject: ["getOrderCusListData", "getAddressList"],
    components: {
        VDistpicker
    },
    data() {
        return {
            dialogVisible: false,
            isCustomer: true,
            form: {},
            provinceList: [],
            rules: {
                customerId: [
                    { required: true, message: "请选择客户名称", trigger: "change" }
                ],
                consignee: [
                    { required: true, message: "请输入收货人", trigger: "blur" }
                ],
                consigneeTel: [
                    { required: true, validator: validConsigneeTel, trigger: "blur" }
                ],
                province: [
                    { required: true, message: "请选择省份", trigger: "change" }
                ],
                city: [
                    { required: true, message: "请选择市", trigger: "change" }
                ],
                area: [
                    { required: true, message: "请选择区", trigger: "change" }
                ],
                consigneeAddress: [
                    { required: true, message: "请输入详细地址", trigger: "blur" }
                ],
                no: [
                    { required: true, message: "请输入客户编码", trigger: "blur" }
                ],
                name: [
                    { required: true, message: "请输入客户名称", trigger: "blur" }
                ]
            }
        }
    },
    methods: {
        onSelected(data) {
            const { province, city, area } = data;
            if (!province.code && !city.code && !city.code) return;
            this.form.province = province.value;
            this.form.city = city.value;
            this.form.area = area.value;
        },
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    if (this.isCustomer) { // 创建地址
                        if(!this.form.area && !this.form.province) {
                            return this.msgSuccess("请选择收货地址");
                        }
                        addAddress(this.form).then(() => {
                            this.dialogVisible = false
                            this.getAddressList(this.form.customerId)
                            this.msgSuccess("地址新增成功");
                        })
                    } else {
                        addCustomer(this.form).then(() => {
                            this.dialogVisible = false
                            this.getOrderCusListData()
                            this.msgSuccess("新增客户成功");
                        }).catch(() => {
                            this.msgError("新增客户失败");
                        })
                    }
                } else {
                    return false;
                }
            });
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.dialogVisible = false
        }
    }
}
</script>

<style>
</style>