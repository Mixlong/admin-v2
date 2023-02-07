<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="730px"
    append-to-body
    :close-on-click-modal="false"
    center
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.native.prevent
    >
      <el-row v-show="showName !== 'reason'">
        <el-col :span="12">
          <el-form-item label="产品类型：" prop="type">
            <el-select
              style="width: 100%"
              v-model="form.type"
              :disabled="!!form.id"
              placeholder="请选择类型"
              @change="form.orderNo = ''"
            >
              <el-option label="通用" :value="1"></el-option>
              <el-option label="Lime" :value="2"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <template v-if="form.type === 1">
          <el-col :span="12">
            <el-form-item label="产品品类：" prop="categoryId">
              <el-select
                v-model="form.categoryId"
                placeholder="请选择产品品类"
                clearable
                filterable
                :disabled="!!form.id"
                style="width: 100%"
                @change="getProductId"
              >
                <el-option
                  v-for="dict in dictList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品型号：" prop="computerName">
              <select-loadMore
                style="width: 100%"
                v-model="form.computerName"
                :data="computerData.data"
                :page="computerData.page"
                :hasMore="computerData.more"
                dictLabel="name"
                dictValue="id"
                :disabled="!!form.id"
                :request="getComputerList"
                @getChange="getComputerId"
                placeholder="请选择产品型号"
              />
            </el-form-item>
          </el-col>
        </template>
        <el-col :span="12">
          <el-form-item label="订单号：" prop="orderNo">
            <div class="flex align-center">
              <select-loadMore
                style="width: 100%"
                v-model="form.orderNo"
                :data="orderData.data"
                :page="orderData.page"
                :hasMore="orderData.more"
                dictLabel="orderNo"
                dictValue="orderNo"
                :disabled="isDisOrder"
                :request="getOrderList"
                @getChange="form.boxNoList = []"
                placeholder="请选择订单号"
              />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="返工箱号：" required>
            <div>
              <el-button type="primary" @click="addBox"> 添加箱号 </el-button>
            </div>
            <el-tag
              v-for="item in form.boxNoList"
              class="margin-right-xs"
              :key="item.boxSn"
              type="primary"
              closable
              @close="handleClose(item)"
            >
              {{ item.boxSn }}
            </el-tag>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="返工原因："
        prop="reason"
        style="width: 100%"
        v-if="showName == 'reason' || !showName"
      >
        <tinymce
          v-if="dialogVisible"
          v-model="form.reason"
          placeholder="请输入"
          :width="showName == 'reason' ? '100%' : '590px'"
          height="300"
        ></tinymce>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
    <reworkBoxList
      ref="reworkRef"
      @choosedItem="choosedItem"
      :orderNo="form.orderNo"
      :checkId="form.id"
    />
  </el-dialog>
</template>
<script>
import {
  reworkAdd,
  remorkUpdate,
  reworkOrderList,
} from "@/api/third/reworkBox";
import { listComputer } from "@/api/third/computer";
import tinymce from "@/views/components/Editor";
export default {
  components: {
    tinymce,
    reworkBoxList: () => import("./reworkBoxList"),
  },
  props: ["dictList", "materialTypeList"],
  data() {
    return {
      showName: "",
      dialogVisible: false,
      loading: false,
      title: "",
      orderNoList: [],
      // 产品型号
      computerList: [],
      // 表单参数
      form: {
        computerName: "",
        categoryId: "",
        computerId: "",
        type: "",
        orderNo: "",
        reason: "",
        boxNoList: [],
      },
      computerData: {
        data: [],
        page: 1,
        more: true,
      },
      orderData: {
        data: [],
        page: 1,
        more: true,
      },
      // 表单校验
      rules: {
        categoryId: [
          { required: true, message: "产品品类不能为空", trigger: "change" },
        ],
        computerName: [
          { required: true, message: "产品型号不能为空", trigger: "change" },
        ],
        type: [{ required: true, message: "类型不能为空", trigger: "change" }],
        orderNo: [
          { required: true, message: "订单号不能为空", trigger: "change" },
        ],
        reason: [
          { required: true, message: "返工原因不能为空", trigger: "change" },
        ],
      },
      options: [],
    };
  },
  computed: {
    isBoxNo() {
      return this.form.boxNoList.length;
    },
    isDisOrder() {
      return !this.form.categoryId || !this.form.computerId;
    },
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.orderNoList = [];
        this.resetForm("form");
      }
    },
    "form.reason"(val) {
      if (val) {
        this.clearValidateItem("form", "reason");
      }
    },
    // "form.categoryId"(categoryId) {
    //   if (categoryId) {
    //     this.form.computerName = "";
    //     this.form.computerId = "";
    //     this.getComputerList();
    //   }
    // },
  },
  methods: {
    /** 添加箱号 */
    addBox() {
      if (!this.form.categoryId || !this.form.computerId) {
        return this.msgError("请先选择品类或型号");
      }
      if (!this.form.orderNo) {
        return this.msgError("请先选择订单号");
      }
      this.$refs.reworkRef.show = true;
      this.$refs.reworkRef.selectRows = this.form.boxNoList;
    },
    /** 箱号列表 */
    choosedItem(list) {
      this.form.boxNoList = list;
    },
    handleClose(item) {
      this.form.boxNoList.splice(this.form.boxNoList.indexOf(item), 1);
    },
    /** 产品型号 */
    getComputerList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        listComputer({
          p: page,
          key: this.form.categoryId,
          name: keyword,
        }).then((res) => {
          console.log(res);
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.computerData.data = [...this.computerData.data, ...list];
          } else {
            this.computerData.data = list;
          }
          this.computerData.more = pageNum * pageSize < total;
          this.computerData.page = pageNum;
          resolve();
        });
      });
    },
    getComputerId(computerId) {
      this.form.computerId = computerId;
    },
    /** 订单号列表 */
    getOrderList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        reworkOrderList({
          p: page,
          orderNo: keyword,
          type: this.form.type,
          categoryId: this.form.categoryId,
          computerId: this.form.computerId,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.orderData.data = [...this.orderData.data, ...list];
          } else {
            this.orderData.data = list;
          }
          this.orderData.more = pageNum * pageSize < total;
          this.orderData.page = pageNum;
          resolve();
        });
      });
    },
    getProductId() {
      this.form.computerName = "";
      this.form.computerId = "";
      this.getComputerList();
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (!this.form.boxNoList.length) {
            return this.msgError("请添加箱号");
          }
          let data = Object.assign({}, this.form);
          data.boxNo = this.form.boxNoList.map((item) => item.boxSn).join(",");
          let fn = this.form.id ? remorkUpdate : reworkAdd;
          fn(data).then((response) => {
            if (response.code === 200) {
              this.msgSuccess(this.form.id ? "修改成功" : "创建成功");
              this.$parent.getList();
              this.dialogVisible = false;
            }
          });
        }
      });
    },
  },
};
</script>
