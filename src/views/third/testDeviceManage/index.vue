<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="设备编码" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入设备编码"
          clearable
          size="small"
          style="width: 185px"
          @keyup.enter.native="getList"
          @change="getList"
        />
      </el-form-item>
      <el-form-item label="设备名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入设备名称"
          clearable
          size="small"
          style="width: 185px"
          @keyup.enter.native="getList"
          @change="getList"
        />
      </el-form-item>
      <el-form-item label="负责人" prop="user">
        <el-input
          v-model="queryParams.user"
          placeholder="请输入负责人"
          clearable
          size="small"
          style="width: 185px"
          @keyup.enter.native="getList"
          @change="getList"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="small"
          @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">
          重置
        </el-button>
        <el-button type="warning" size="small" @click="onAddOrder(1)">
          新增
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="saleOrderList"
      :height="tableHeight()"
      border
    >
      <el-table-column label="序号" width="58" type="index" align="center" />
      <el-table-column label="设备编码" width="100" prop="no" align="center" />
      <el-table-column
        label="设备名称"
        width="100"
        prop="name"
        align="center"
      />
      <el-table-column label="备注" width="100" prop="remark" align="center">
        <span slot-scope="{ row }">{{ row.remark || "---" }}</span>
      </el-table-column>
      <el-table-column
        label="设备负责人"
        width="100"
        prop="user"
        align="center"
      >
        <span slot-scope="{ row }">{{ row.user || "---" }}</span>
      </el-table-column>
      <el-table-column label="阶段进展" align="center">
        <div slot-scope="{ row }" v-if="row.planList.length">
          <!-- <div class="lay-line"></div> -->
          <div class="progress-box">
            <ul class="progress-line">
              <!-- :style="[{'margin-left': progressMargin(OverTimeDay(item)), 'margin-right': progressMargin(OverTimeDay(item))}]" -->
              <li
                v-for="(item, index) in row.planList"
                :key="index"
                class="margin-bottom-xxs"
              >
                <div
                  @click="onAddPlan(2, item)"
                  :style="[{ width: progressClass(OverTimeDay(item)) }]"
                >
                  {{ item.planDevice }} * {{ item.num }}
                </div>
                <span class="margin-left-xs"
                  >剩余{{ OverTimeDay(item) }}天</span
                >
              </li>
            </ul>
          </div>
        </div>
        <div v-else>
          <el-button type="text" @click="onAddPlan(1, row)">新增计划</el-button>
        </div>
      </el-table-column>
      <el-table-column label="操作" align="center" width="105">
        <template slot-scope="{ row }">
          <div class="btn-box">
            <el-button type="text" @click="onAddOrder(2, row)">修改</el-button>
            <el-button type="text" @click="handleDelete(row)">删除</el-button>
            <el-button type="text" @click="onAddPlan(1, row)"
              >新增计划</el-button
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

    <add-or-update-plan ref="addOrUpdatePlanRef" />
    <!-- 新增订单 -->
    <add-order ref="addOrderRef" />
  </div>
</template>
<script>
import {
  getTestDeviceList,
  getTestDeviceDetail,
  getTestDeviceDel,
} from "@/api/third/testDeviceManage";
export default {
  name: "saleOrder",
  data() {
    return {
      loading: false,
      // 总条数
      total: 0,
      // 销售订单数据
      saleOrderList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
      },
    };
  },
  components: {
    "add-or-update-plan": () => import("./components/addOrUpdatePlan.vue"),
    "add-order": () => import("./components/addOrder.vue"),
  },
  computed: {
    OverTimeDay() {
      return (item) => {
        if (item) {
          let { endTime } = item;
          endTime = +new Date(endTime);
          let currentTime = +new Date();
          if (endTime >= currentTime) {
            return +((endTime - currentTime) / (24 * 3600 * 1000)).toFixed(1);
          }
        }
      };
    },
    progressClass() {
      return (time) => {
        let times = time;
        if (time < 6) {
          times = 5;
          return times * 4 + time + "%";
        }
        if (times > 20) {
          times = 20;
        }
        return times * 5 + "%";
      };
    },
  },
  created() {
    this.getList();
  },
  methods: {
    // 新增订单/ 修改订单
    onAddOrder(type, row) {
      this.$refs.addOrderRef.isType = type;
      this.$refs.addOrderRef.dialogVisible = true;
      this.$refs.addOrderRef.reset();
      if (type === 2) {
        this.$refs.addOrderRef.form = JSON.parse(JSON.stringify(row));
      }
    },
    // 新增/修改 计划
    onAddPlan(type, row) {
      this.$refs.addOrUpdatePlanRef.isType = type;
      this.$refs.addOrUpdatePlanRef.dialogVisible = true;
      this.$refs.addOrUpdatePlanRef.reset();
      if (type === 2) {
        this.$refs.addOrUpdatePlanRef.form = JSON.parse(JSON.stringify(row));
      }
      if (type === 1) {
        this.$refs.addOrUpdatePlanRef.form.device = row.id;
      }
    },
    // 删除
    handleDelete(row) {
      this.$confirm("此操作将进行删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        getTestDeviceDel(row.id).then((res) => {
          this.getList();
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        });
      });
    },
    getList() {
      this.loading = true;
      getTestDeviceList(this.queryParams).then((res) => {
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
.lay-line {
  width: 4px;
  top: 5px;
  bottom: 5px;
  left: 50%;
  height: 93%;
  background: #ddd;
  position: absolute;
}
.progress-box {
  position: relative;
  .progress-line {
    margin: 0;
    padding: 0;
    list-style: none;
    li {
      white-space: nowrap;
      display: flex;
      div {
        width: 90%;
        border: 1px solid #ddd;
        cursor: pointer;
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
