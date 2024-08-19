<template>
  <div class="app-container">
    <transition name="fade-transform-tb">
      <el-form ref="queryForm" :model="queryParams" :inline="true">
        <el-form-item label="工单号" prop="orderCode">
          <el-input
            v-model="queryParams.orderCode"
            clearable
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="工单类型" prop="type">
          <el-select v-model="queryParams.type" placeholder="请选择" clearable>
            <el-option label="包装" value="1"></el-option>
            <el-option label="委外" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="handleQuery"
            v-hasPermi="['third:plant:search']"
          >
            搜 索
          </el-button>
          <el-button
            icon="el-icon-refresh"
            @click="resetQuery"
            v-hasPermi="['third:plant:reset']"
          >
            重 置
          </el-button>
        </el-form-item>
        <!-- <el-row :gutter="10" class="fr mt5">
          <el-col :span="1.5">
            <el-button
              type="primary"
              icon="el-icon-plus"
              @click="handleAdd"
              v-hasPermi="['third:plant:add']"
            >
              新增
            </el-button>
          </el-col>
        </el-row> -->
      </el-form>
    </transition>

    <el-table
      v-loading="loading"
      :data="tableData"
      :height="tableHeight()"
      border
    >
      <el-table-column label="订单号" prop="orderCode" align="center">
        <span slot-scope="{ row }" v-NoData="row.orderCode"></span>
      </el-table-column>
      <el-table-column label="订单日期" prop="orderDate" align="center">
        <span
          slot-scope="{ row }"
          v-NoData="parseTime(row.orderDate, '{y}-{m}-{d} {h}:{i}')"
        ></span>
      </el-table-column>
      <el-table-column label="工单类型" prop="type" align="center">
        <el-tag
          slot-scope="{ row }"
          :type="row.type === 1 ? 'success ' : 'danger'"
          >{{ row.type === 1 ? "包装" : "委外" }}</el-tag
        >
      </el-table-column>
      <el-table-column label="开始时间" prop="startTime" align="center">
        <span
          slot-scope="{ row }"
          v-NoData="parseTime(row.startTime, '{y}-{m}-{d} {h}:{i}')"
        ></span>
      </el-table-column>
      <el-table-column label="结束时间" prop="endTime" align="center">
        <span
          slot-scope="{ row }"
          v-NoData="parseTime(row.endTime, '{y}-{m}-{d} {h}:{i}')"
        ></span>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" align="center">
        <span
          slot-scope="{ row }"
          v-NoData="parseTime(row.createTime, '{y}-{m}-{d} {h}:{i}')"
        ></span>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <el-dialog title="创建工单" width="450px" :visible.sync="isShow" center>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="80px"
        label-position="left"
      >
        <el-form-item label="订单号" prop="orderCode">
          <el-input v-model="form.orderCode" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="订单日期" prop="orderDate">
          <el-date-picker
            v-model="form.orderDate"
            type="datetime"
            placeholder="请选择"
            value-format="timestamp"
            :default-time="defaultTime"
            clearable
            style="width: 100%"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="工单类型" prop="type">
          <el-select
            v-model="form.type"
            placeholder="请选择"
            clearable
            style="width: 100%"
          >
            <el-option label="包装" :value="1"></el-option>
            <el-option label="委外" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-col :span="11">
            <el-form-item label="" label-width="0" prop="startTime">
              <el-time-picker
                v-model="form.startTime"
                type="datetime"
                placeholder="开始时间"
                value-format="timestamp"
                :default-time="defaultTime"
                clearable
                style="width: 100%"
              >
              </el-time-picker>
            </el-form-item>
          </el-col>
          <el-col class="text-center" :span="2">-</el-col>
          <el-col :span="11">
            <el-form-item label="" label-width="0" prop="endTime">
              <el-time-picker
                v-model="form.endTime"
                type="datetime"
                placeholder="结束时间"
                value-format="timestamp"
                :default-time="defaultTime"
                clearable
                style="width: 100%"
              >
              </el-time-picker>
            </el-form-item>
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleOk" :loading="confirmLoading">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { orderWorkList, orderWorkErpCreate } from "@/api/third/prodPlant";
export default {
  data() {
    return {
      loading: false,
      isShow: false,
      confirmLoading: false,
      tableData: [],
      total: 0,
      defaultTime: this.moment().format("HH:mm:ss"),
      queryParams: {
        p: 1,
        l: 10,
        orderCode: "",
        type: "",
      },
      form: {
        orderCode: "",
        orderDate: "",
        type: "",
        startTime: "",
        endTime: "",
      },
      rules: {
        orderCode: [
          { required: true, message: "订单号不能为空", trigger: "blur" },
        ],
        orderDate: [
          { required: true, message: "订单日期不能为空", trigger: "change" },
        ],
        type: [
          { required: true, message: "工单类型不能为空", trigger: "change" },
        ],
        startTime: [
          { required: true, message: "开始时间不能为空", trigger: "change" },
        ],
        endTime: [
          { required: true, message: "结束时间不能为空", trigger: "change" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      orderWorkList(this.queryParams)
        .then((res) => {
          const { list, total } = res.data;
          this.tableData = list;
          this.total = total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleAdd() {
      this.reset();
      this.isShow = true;
    },
    reset() {
      this.form = {
        orderCode: "",
        orderDate: "",
        type: "",
        startTime: "",
        endTime: "",
      };
      this.resetForm("form");
    },
    handleCancel() {
      this.isShow = false;
    },
    handleOk() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.confirmLoading = true;

          try {
            orderWorkErpCreate(this.form)
              .then(() => {
                this.getList();
                this.msgSuccess("操作成功");
              })
              .finally(() => {
                this.isShow = false;
                this.confirmLoading = false;
              });
          } catch (error) {
            console.error(error);
          }
        }
      });
    },
  },
};
</script>

<style>
</style>