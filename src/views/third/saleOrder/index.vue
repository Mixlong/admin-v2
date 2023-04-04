<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="订单号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入订单号"
          clearable
          size="small"
          style="width: 185px"
          @keyup.enter.native="getList"
          @change="getList"
        />
      </el-form-item>
      <el-form-item label="客户" prop="customer">
        <el-input
          v-model="queryParams.customer"
          placeholder="请输入客户名称"
          clearable
          size="small"
          style="width: 185px"
          @keyup.enter.native="getList"
          @change="getList"
        />
      </el-form-item>
      <el-form-item label="产品品类" prop="category">
        <el-select
          size="small"
          clearable
          filterable
          v-model="queryParams.category"
          placeholder="请选择产品品类"
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
      <el-form-item label="产品型号" prop="model">
        <el-select
          size="small"
          clearable
          filterable
          v-model="queryParams.model"
          placeholder="请选择产品型号"
          @change="getList"
        >
          <el-option
            v-for="dict in modelList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="state">
        <el-select
          size="small"
          clearable
          v-model="queryParams.state"
          placeholder="请选择产品型号"
          @change="getList"
        >
          <el-option
            v-for="(item, index) in stateList"
            :key="index"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="small"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery"
          >重置</el-button
        >
        <el-button
          type="warning"
          size="small"
          :disabled="!checkRole(['sale'])"
          @click="onAdd(1)"
          >新增</el-button
        >
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="saleOrderList"
      :height="tableHeight()"
      border
    >
      <el-table-column label="序号" width="58" type="index" align="center" />
      <el-table-column label="订单号" prop="no" align="center" />
      <el-table-column label="客户" prop="customer " align="center">
        <span slot-scope="{ row }">{{ row.customer || "---" }}</span>
      </el-table-column>
      <el-table-column label="产品品类" prop="category " align="center">
        <span slot-scope="{ row }">{{ row.category || "---" }}</span>
      </el-table-column>
      <el-table-column label="产品型号" prop="model " align="center">
        <span slot-scope="{ row }">{{ row.model || "---" }}</span>
      </el-table-column>
      <el-table-column label="订单数量" prop="num" align="center" />
      <el-table-column
        label="订单交期"
        prop="deliverTime"
        width="180"
        align="center"
      >
        <span slot-scope="{ row }">{{ row.deliverTime || "---" }}</span>
      </el-table-column>
      <el-table-column label="阶段进展" align="center" width="420px">
        <div class="progress-box" slot-scope="{ row }" v-if="row.stockEndTime">
          <div
            class="overTime"
            v-if="row.state > 0 && row.state < 5"
            :style="progressClass(row.state)"
          >
            <span v-if="OverTimeDay(row) > 0"
              >{{ row.state === 4 ? "交货" : "" }}已逾期{{
                OverTimeDay(row)
              }}天</span
            >
            <i
              :class="['el-icon-bottom', { danger: OverTimeDay(row) > 0 }]"
            ></i>
          </div>
          <ul
            :class="[{ 'border-Red': OverTimeDay(row) > 0 }, 'progress-line']"
          >
            <li
              v-for="(item, index) in progressListTitle"
              :key="index"
              :class="[
                {
                  'border-Red': OverTimeDay(row) > 0,
                  finished: row.state === 5 && index === 4,
                },
              ]"
              @click="handleAuthChange(row, index + 1)"
            >
              {{ item }}
            </li>
          </ul>
        </div>
        <div v-else>
          <el-button
            type="text"
            v-if="!row.stockEndTime && checkRole(['PMC'])"
            @click="onAddPlan(1, row)"
            >新增计划</el-button
          >
        </div>
      </el-table-column>
      <el-table-column label="备注" prop="remark " align="center">
        <span slot-scope="{ row }">{{ row.remark || "---" }}</span>
      </el-table-column>
      <el-table-column label="操作" align="center" width="105">
        <template slot-scope="{ row }">
          <div class="btn-box">
            <el-button type="text" @click="onAdd(2, row)">修改</el-button>
            <el-button type="text" @click="handleDelete(row)">删除</el-button>
            <el-button
              type="text"
              v-if="row.state === 0 && checkRole(['PMC']) && row.stockEndTime"
              @click="handleAuthChange(row, 1)"
              >备货中</el-button
            >
            <el-button
              type="text"
              v-if="row.state === 1 && checkRole(['PMC'])"
              @click="handleAuthChange(row, 2)"
              >备货完成</el-button
            >
            <el-button
              type="text"
              v-if="row.state === 2 && checkRole(['PMC'])"
              @click="handleAuthChange(row, 3)"
              >开始生产</el-button
            >
            <el-button
              type="text"
              v-if="row.state === 3 && checkRole(['PMC'])"
              @click="handleAuthChange(row, 4)"
              >生产完成</el-button
            >
            <el-button
              type="text"
              v-if="row.state === 4 && checkRole(['sale'])"
              @click="handleAuthChange(row, 5)"
              >确定发货</el-button
            >
            <el-button
              type="text"
              v-if="!row.stockEndTime && checkRole(['PMC'])"
              @click="onAddPlan(1, row)"
              >新增计划</el-button
            >
            <el-button
              type="text"
              v-if="row.stockEndTime && checkRole(['PMC']) && row.state !== 5"
              @click="onAddPlan(2, row)"
              >修改计划</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-if="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <add-or-update
      ref="addOrUpdateRef"
      :dictList="dictList"
      :modelList="modelList"
    />
    <add-plan ref="addPlanRef" />
  </div>
</template>
<script>
import {
  getSaleOrderList,
  getSaleOrderDetail,
  getSaleOrderDel,
  getSaleState,
} from "@/api/third/saleOrder";
import { typeCategory } from "@/api/third/category";
import { listModelDict } from "@/api/third/computer";
export default {
  name: "saleOrder",
  data() {
    return {
      loading: false,
      // 总条数
      total: 0,
      // 销售订单数据
      saleOrderList: [],
      // 产品品类
      dictList: [],
      // 型号
      modelList: [],
      progressLineArr: ["-160px", "-80px", "0px", "80px"],
      progressListTitle: ["备货中", "备货完成", "生产中", "生产完成", "已交货"],
      // 状态
      stateList: [
        { name: "备货中", value: 1 },
        { name: "备货完成", value: 2 },
        { name: "生产中", value: 3 },
        { name: "生产完成", value: 4 },
        { name: "已交货", value: 5 },
      ],
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
      },
    };
  },
  components: {
    "add-or-update": () => import("./components/addOrUpdate.vue"),
    "add-plan": () => import("./components/addPlan.vue"),
  },
  computed: {
    progressClass() {
      return (state) => {
        if (state < 5) {
          return {
            transform:
              "translateX( " +
              this.progressLineArr[state > 0 ? state - 1 : 0] +
              " )",
            transition: "transform .3s ease",
          };
        }
      };
    },
    OverTimeDay() {
      return (row) => {
        let currentTime = +new Date();
        let transTime = null;
        if (row.state === 0 || row.state === 5) {
          return false;
        } else if (row.state === 1 && row.stockEndTime) {
          transTime = +new Date(row.stockEndTime);
        } else if (row.state === 2) {
          transTime = +new Date(row.produceStartTime);
        } else if (row.state === 3) {
          transTime = +new Date(row.produceEndTime);
        } else if (row.state === 4) {
          transTime = +new Date(row.deliverTime);
        }
        return currentTime > transTime
          ? ((currentTime - transTime) / (24 * 3600 * 1000)).toFixed(1)
          : 0;
      };
    },
  },
  created() {
    this.getList();
    this.getTypeCategory();
    this.getListModelDict();
  },
  methods: {
    // 获取品类字典
    getTypeCategory() {
      typeCategory().then((res) => {
        this.dictList = res.data;
        this.getList();
      });
    },
    // 获取型号字典
    getListModelDict() {
      listModelDict().then((res) => {
        this.modelList = res.data;
        this.getList();
      });
    },
    // 新增 ，修改订单
    onAdd(type, row) {
      this.$refs.addOrUpdateRef.dialogVisible = true;
      this.$refs.addOrUpdateRef.isType = type;
      this.$refs.addOrUpdateRef.reset();
      if (type === 2) {
        // 修改
        this.$refs.addOrUpdateRef.form = JSON.parse(JSON.stringify(row));
      }
    },
    // 新增、修改计划
    onAddPlan(type, row) {
      this.$refs.addPlanRef.dialogVisible = true;
      this.$refs.addPlanRef.isType = type;
      this.$refs.addPlanRef.reset();
      if (type === 1) {
        // 新增
        this.$refs.addPlanRef.form.id = row.id;
      } else {
        this.$refs.addPlanRef.form = JSON.parse(JSON.stringify(row));
      }
    },
    // 删除
    handleDelete(row) {
      this.$confirm("此操作将进行删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        getSaleOrderDel([{ id: row.id, status: 1 }]).then((res) => {
          this.getList();
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        });
      });
    },
    handleAuthChange(row, type) {
      if (row.state === type || row.state > type) {
        return;
      }
      let params = {};
      params.state = type;
      params.id = row.id;
      getSaleState(params).then((res) => {
        if (res.code == 200) {
          this.msgSuccess("确认成功！");
          this.getList();
        }
      });
    },
    getList() {
      this.loading = true;
      getSaleOrderList(this.queryParams).then((res) => {
        const { list, total } = res.data;
        this.saleOrderList = list;
        this.total = total;
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
  },
};
</script>
<style lang="scss" scoped>
.progress-box {
  position: relative;
  .overTime {
    display: flex;
    flex-direction: column;
    span {
      color: #f00;
    }
    i {
      font-size: 30px;
      &.danger {
        color: red;
      }
    }
  }
  .progress-line {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    border: 1px solid #ccc;
    &.border-Red {
      border-color: red;
    }
    li {
      flex: 1;
      border-right: 1px solid #ccc;
      cursor: pointer;
      &.finished {
        color: green;
      }
      &.border-Red {
        border-color: red;
      }
      &:last-child {
        border-right: none;
      }
    }
  }
}
.btn-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  button {
    margin-left: 0;
  }
}
</style>
