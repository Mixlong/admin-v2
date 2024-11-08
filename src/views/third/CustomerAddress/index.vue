<template>
    <div class="app-container">
        <el-form ref="queryForm" :model="queryParams" :inline="true">
            <el-form-item label="客户名称" prop="customerName">
                <el-input v-model="queryParams.customerName" filterable placeholder="请输入客户名称" clearable />
            </el-form-item>
            <el-form-item label="收货人" prop="consignee">
                <el-input v-model="queryParams.consignee" filterable placeholder="请输入收货人" clearable />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" icon="el-icon-plus" @click="handleAddAddress">
                    新增
                </el-button>
            </el-col>
        </el-row>

        <el-table :data="addressData">
            <el-table-column property="customerName" label="客户名称" align="center"></el-table-column>
            <el-table-column property="consignee" label="收货人" align="center"></el-table-column>
            <el-table-column property="phone" label="电话号码" align="center"></el-table-column>
            <el-table-column property="address" label="收货地址" align="center"></el-table-column>
            <el-table-column label="创建/更新时间" align="center" sortable>
                <span slot-scope="{ row }" v-NoData="parseTime(row.updateTime || row.createTime)"></span>
            </el-table-column>
            <el-table-column label="操作" align="center">
                <template slot-scope="{ row }">
                    <Tooltip v-hasPermi="['delivery:edit:btn']" icon="el-icon-edit" content="编辑"
                        @click="handleUpdate(row)" />

                    <el-popconfirm title="确定要删除吗？" @confirm="handleDelete(row)">
                        <Tooltip style="margin: 0 10px" slot="reference" icon="el-icon-delete" :className="['text-red']"
                            content="删除" />
                    </el-popconfirm>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
            @pagination="getList" />

        <!-- 新增、编辑 -->
        <el-dialog :title="title" :visible.sync="dialogVisible" top="2vh" center append-to-body
            :close-on-click-modal="false" width="600px">
            <el-form ref="form" :model="form" :rules="rules" label-width="100px" label-position="right">
                <el-form-item label="客户名称" prop="customerName">
                    <select-loadMore v-model="form.customerName" style="width: 100%" :data="customerData.data"
                        :page="customerData.page" :hasMore="customerData.more" dictLabel="name" dictValue="name"
                        :request="getCustomerList" placeholder="请选择客户名称">
                    </select-loadMore>
                </el-form-item>
                <el-form-item label="收货人" prop="consignee">
                    <el-input v-model="form.consignee" clearable placeholder="请输入收货人" />
                </el-form-item>
                <el-form-item label="手机号码" prop="phone">
                    <el-input v-model="form.phone" clearable placeholder="请输入手机号码" />
                </el-form-item>
                <el-form-item label="收货地址" prop="address">
                    <el-input v-model="form.address" type="textarea" placeholder="请输入收货地址" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="dialogVisible = false">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { deliveryAddress, deliveryAddressAdd, deliveryAddressUpdate, deliveryAddressDel } from "@/api/delivery";
import { getCustomerList } from "@/api/order";

export default {
    props: {
        isCustomerAddressShow: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            title: "",
            dialogVisible: false,
            total: 0,
            addressData: [],
            form: {},
            customerData: {
                data: [],
                page: 1,
                more: true,
            },
            rules: {
                customerName: [
                    { required: true, message: "请选择客户名称", trigger: "change" },
                ],
                consignee: [
                    { required: true, message: "请输入收货人", trigger: "blur" },
                ],
                phone: [
                    { required: true, message: "请输入手机号码", trigger: "blur" },
                    {
                        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
                        message: "请输入正确的手机号码",
                        trigger: "blur",
                    },
                ],
                address: [
                    { required: true, message: "请输入收货地址", trigger: "blur" },
                ],
            },
            queryParams: {
                p: 1,
                l: 10,
                consignee: null,
            }
        }
    },
    watch: {
        dialogVisible(show) {
            if (!show) {
                this.reset();
            }
        }
    },
    created() {
        this.getList();
    },
    methods: {
        /** 搜索按钮操作 */
        handleQuery() {
            this.queryParams.p = 1;
            this.getList();
        },
        resetQuery() {
            this.resetForm("queryForm");
            this.handleQuery();
        },
        getList() {
            deliveryAddress(this.queryParams).then(res => {
                const { list, total } = res.data;
                this.addressData = list;
                this.total = total;
            })
        },
        handleAddAddress() {
            this.dialogVisible = true;
            this.title = "新增客户地址";
        },
        handleUpdate(row) {
            this.form = Object.assign({}, row);
            this.dialogVisible = true;
            this.title = "修改客户地址";
        },
        reset() {
            this.form = {};
            this.resetForm("form");
        },
        // 删除
        handleDelete(row) {
            deliveryAddressDel(row.id).then(() => {
                this.getList();
                this.msgSuccess("删除成功");
            });
        },
        submitForm() {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    let param = this.form;

                    if (param.id) {
                        deliveryAddressUpdate(param).then((response) => {
                            if (response.code === 200) {
                                this.msgSuccess("修改成功");
                                this.dialogVisible = false;
                                this.getList();
                            }
                        });
                    } else {
                        deliveryAddressAdd(param).then((response) => {
                            if (response.code === 200) {
                                this.msgSuccess("创建成功");
                                this.dialogVisible = false;
                                this.getList();
                            }
                        });
                    }
                }
            });
        },
        getCustomerList({ page = 1, more = false, keyword = "" } = {}) {
            return new Promise((resolve) => {
                getCustomerList({
                    p: page,
                    name: keyword
                }).then((res) => {
                    const { list, total, pageNum, pageSize } = res.data;
                    list.filter(item => item.status === 0);

                    if (more) {
                        this.customerData.data = [...this.customerData.data, ...list];
                    } else {
                        this.customerData.data = list;
                    }
                    this.customerData.more = pageNum * pageSize < total;
                    this.customerData.page = pageNum;
                    resolve();
                });
            });
        },
    }
}
</script>