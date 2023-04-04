<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      @submit.native.prevent
    >
      <el-form-item label="产品类型" prop="type">
        <el-select
          v-model="queryParams.type"
          clearable
          placeholder="请选择类型"
        >
          <el-option label="通用" :value="1"></el-option>
          <el-option label="Lime" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="产品品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          placeholder="请选择产品品类"
          clearable
          filterable
          @change="getList"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="产品型号" prop="computerName">
        <el-input
          placeholder="请输入产品型号"
          size="small"
          clearable
          v-model="queryParams.computerName"
          @keyup.enter.native="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          @keyup.native.enter="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item label="箱号" prop="boxNo">
        <el-input
          v-model="queryParams.boxNo"
          placeholder="请输入箱号"
          clearable
          @keyup.native.enter="handleQuery"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>

      <el-row :gutter="10" class="fr">
        <el-col :span="1.5">
          <el-button
            type="primary"
            v-if="checkRole(['test', 'admin'])"
            @click="handleAdd('compUpdate', '申请返工')"
          >
            申请返工
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      :height="tableHeight()"
      border
      @cell-click="cellClick"
      :cell-style="cellStyle"
    >
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          <span>{{
            (queryParams.p - 1) * queryParams.l + scope.$index + 1
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="产品品类"
        prop="categoryName"
        width="150"
        align="center"
      />
      <el-table-column
        label="产品型号"
        prop="computerName"
        width="150"
        align="center"
      />
      <el-table-column
        label="订单号"
        prop="orderNo"
        width="150"
        align="center"
      />
      <el-table-column label="返工箱号" prop="boxNo" align="center">
        <template slot-scope="{ row }">
          <p v-for="item in row.boxNo.split(',')" :key="item">{{ item }}</p>
        </template>
      </el-table-column>
      <el-table-column
        label="返工数量"
        prop="reworkNum"
        width="120"
        align="center"
      />
      <el-table-column
        label="申请人"
        prop="createBy"
        width="100"
        align="center"
      />
      <el-table-column label="返工理由" prop="reason" align="center">
        <template slot-scope="scope">
          <div class="text-left text-red" v-html="scope.row.reason"></div>
        </template>
      </el-table-column>
      <el-table-column
        label="驳回原因"
        prop="rebutReason"
        align="left"
        header-align="center"
      >
        <div class="text-red" slot-scope="{ row }" v-show="row.state !== 1">
          {{ row.rebutReason }}
        </div>
      </el-table-column>
      <el-table-column label="状态" prop="state" width="90" align="center">
        <el-tag :type="typeList[row.state]" slot-scope="{ row }">
          {{ stateList[row.state] }}
        </el-tag>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="100"
      >
        <div
          v-show="row.state === 0"
          class="flex flex-direction"
          slot-scope="{ row }"
        >
          <el-button
            type="text"
            v-if="checkRole(['test', 'admin'])"
            @click="handleUpdate({ row, title: '编辑' })"
          >
            编辑
          </el-button>
          <el-button
            class="mlZero"
            type="text"
            v-if="checkRole(['test', 'admin'])"
            @click="handleCheck(row.id)"
          >
            审核
          </el-button>
          <el-button
            class="mlZero text-red"
            type="text"
            v-if="checkRole(['test', 'admin'])"
            @click="onReworkDel(row.id)"
          >
            删除
          </el-button>
        </div>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />
    <CompUpdate
      ref="compUpdate"
      :dictList="dictList"
      :materialTypeList="materialTypeList"
    />
    <Return ref="return" :sampleTypeOptions="sampleTypeOptions" />
    <Log ref="log" />
    <!-- 审核 -->
    <el-dialog
      title="请确认是否通过"
      :visible.sync="isCheck"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
      center
    >
      <el-form ref="checkForm" :model="checkForm" @submit.native.prevent>
        <el-form-item label="拒审原因" prop="rebutReason">
          <el-input
            v-model="checkForm.rebutReason"
            type="textarea"
            placeholder="不通过则需要输入原因"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm(1)"> 通过 </el-button>
        <el-button @click="submitForm(2)">不通过</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { reworkList, reworkDel, remorkProgress } from "@/api/third/reworkBox";
import { typeCategory } from "@/api/third/category";
import CompUpdate from "./components/Update";

import Return from "./components/DReturn";
import Log from "./components/Log";

export default {
  components: {
    Log,
    Return,
    CompUpdate,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 审核弹窗
      isCheck: false,
      checkId: "",
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      list: [],
      // 弹出层标题
      title: "",
      // 产品品类
      dictList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        categoryName: "",
        computerName: "",
        orderNo: "",
        boxNo: "",
      },
      // 审核数据
      checkForm: {
        rebutReason: "",
      },
      sampleTypeOptions: [],
      // 物料类别
      materialTypeList: [],
      stateList: {
        0: "未审核",
        1: "审核通过",
        2: "已驳回",
      },
      typeList: {
        0: "primary",
        1: "success",
        2: "danger",
      },
    };
  },
  computed: {},
  mounted() {
    this.getDicts("sample_type").then((response) => {
      if (response.code === 200) {
        if (this.$route.name == "SampleLedger") {
          response.data = response.data.slice(0, 2);
        } else {
          response.data = response.data.slice(2);
        }

        this.sampleTypeOptions = response.data;
      }
      this.getList();
    });
    this.getDicts("materialType").then((res) => {
      this.materialTypeList = res.data;
    });
    this.getTypeCategory();
  },
  methods: {
    // 获取品类字典
    getTypeCategory() {
      typeCategory().then((res) => {
        this.dictList = res.data;
      });
    },
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      reworkList(this.queryParams).then((response) => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    cellClick(row, column, cell, event) {
      switch (column.label) {
        case "返工理由":
          this.handleUpdate({ row, name: "reason", title: "返工理由" });
          break;
        default:
          break;
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (column.label == "返工理由") {
        return `cursor: pointer;`;
      } else {
        return ``;
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 审核 */
    handleCheck(id) {
      this.resetForm("checkForm");
      this.checkId = id;
      this.isCheck = true;
    },
    submitForm(state) {
      if (state === 2 && this.checkForm.rebutReason === "") {
        return this.msgError("拒审原因不能为空");
      }
      this.$refs["checkForm"].validate((valid) => {
        if (valid) {
          remorkProgress({
            ...this.checkForm,
            id: this.checkId,
            state,
          }).then(() => {
            this.isCheck = false;
            this.msgSuccess("操作成功");
            this.getList();
          });
        }
      });
    },
    /** 删除 */
    onReworkDel(id) {
      this.$confirm("是否确认删除?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return reworkDel(id);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(function () {});
    },
    handleAdd(form, title) {
      this.$refs[form].dialogVisible = true;
      this.$refs[form].title = title;
      this.$refs[form].showName = "";
      this.$refs[form].form = {
        type: 1,
        categoryId: "",
        computerId: "",
        computerName: "",
        orderNo: "",
        reason: "",
        boxNoList: [],
      };
    },
    handleUpdate({ row, name = "", title = "" }) {
      this.$refs["compUpdate"].dialogVisible = true;
      this.$refs["compUpdate"].title = title;
      if (row) {
        row.boxNoList = row.boxNo.split(",").map((item) => {
          return { boxSn: item };
        });
        this.$refs["compUpdate"].form = Object.assign({}, row);
        this.$refs["compUpdate"].showName = name;
      }
    },
  },
};
</script>
<style scoped></style>
