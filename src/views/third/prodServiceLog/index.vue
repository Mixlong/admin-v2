<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <!-- <el-form-item label="装备系列" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          filterable
          clearable
          placeholder="请选择装备系列"
        >
          <el-option
            v-for="dict in processesList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="装备型号" prop="processesId">
        <el-select
          v-model="queryParams.processesId"
          clearable
          size="mini"
          placeholder="请选择装备型号"
        >
          <el-option
            v-for="(dict, index) in processesList"
            :key="index"
            :label="dict.dictLabel"
            :value="String(dict.dictCode)"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item label="装备ID" prop="cpuId">
        <el-input
          v-model="queryParams.cpuId"
          clearable
          size="mini"
          placeholder="请输入装备ID"
        ></el-input>
      </el-form-item>
      <el-form-item label="部署工厂" prop="factoryName">
        <el-select
          v-model="queryParams.factoryName"
          clearable
          size="mini"
          placeholder="请选择部署工厂"
        >
          <el-option
            v-for="(dict, index) in factoryList"
            :key="index"
            :label="dict.dictLabel"
            :value="dict.dictLabel"
          />
        </el-select>
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
          重 置
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      :height="tableHeight()"
      @cell-click="cellClick"
      :cell-style="cellStyle"
      border
    >
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="日期" prop="cpuId" align="center" />
      <el-table-column label="型号" prop="sysVersion" align="center" />
      <el-table-column label="线号" prop="factoryName" align="center" />
      <el-table-column label="PCBA SN" prop="line" align="center" />
      <el-table-column label="不良标签" prop="domainIp" align="center" />
      <el-table-column label="实际不良原因" prop="orderNo" align="center" />
      <el-table-column label="维修方法" prop="productNo" align="center" />
      <el-table-column label="维修结果" prop="processName" align="center" />
      <el-table-column label="产品去向" prop="dutName" align="center" />
      <el-table-column label="维修员" prop="remark" align="center" />
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="scope">
          <Tooltip
            v-if="checkRole(['test', 'admin'])"
            icon="el-icon-tickets"
            content="编辑"
            @click="handleUpdate(scope.row)"
          />
          <Tooltip
            v-if="checkRole(['test', 'admin'])"
            icon="el-icon-paperclip"
            content="删除"
            @click="handleDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <!-- 新增维修记录 -->
    <el-dialog title="新增维修记录" center width="450px" :visible.sync="isTask">
      <el-form
        ref="taskForm"
        :model="taskForm"
        :rules="rules"
        label-width="90px"
        label-position="left"
      >
        <el-form-item label="所属品类" prop="categoryId">
          <el-select
            v-model="deviceForm.categoryId"
            filterable
            clearable
            placeholder="请选择所属品类"
            class="w100"
          >
            <el-option
              v-for="dict in dictList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="线号" prop="line">
          <el-select
            v-model="deviceForm.line"
            clearable
            size="mini"
            placeholder="请选择线号"
            class="w100"
          >
            <el-option
              v-for="(dict, index) in testLineList"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="不良标签" prop="line">
          <el-select
            v-model="deviceForm.line"
            clearable
            size="mini"
            allow-create
            filterable
            placeholder="请选择不良标签"
            class="w100"
          >
            <el-option
              v-for="(dict, index) in testLineList"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="不良原因" prop="line">
          <el-select
            v-model="deviceForm.line"
            clearable
            size="mini"
            allow-create
            filterable
            placeholder="请选择不良原因"
            class="w100"
          >
            <el-option
              v-for="(dict, index) in testLineList"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="维修方法" prop="line">
          <el-select
            v-model="deviceForm.line"
            clearable
            size="mini"
            allow-create
            filterable
            placeholder="请选择维修方法"
            class="w100"
          >
            <el-option
              v-for="(dict, index) in testLineList"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="维修结果" prop="line">
          <el-select
            v-model="deviceForm.line"
            clearable
            size="mini"
            filterable
            placeholder="请选择维修结果"
            class="w100"
          >
            <el-option
              v-for="(value, key) in serviceResultList"
              :key="key"
              :label="value"
              :value="+key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品去向" prop="line">
          <el-select
            v-model="deviceForm.line"
            clearable
            size="mini"
            filterable
            placeholder="请选择产品去向"
            class="w100"
          >
            <el-option
              v-for="(value, key) in prodDirectionList"
              :key="key"
              :label="value"
              :value="+key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="PCBA SN" prop="line">
          <el-input
            v-model="deviceForm.PCBASN"
            type="textarea"
            rows="3"
          ></el-input>
          <i>SN可以扫码输入，多个SN输入注意回车换行</i>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          size="small"
          type="primary"
          :loading="isTaskLoading"
          @click="submitTaskForm()"
        >
          确 定
        </el-button>
        <el-button size="small" @click="isTask = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  stsWebAuth,
  stsDeviceList,
  stsEquipUpdate,
  stsTaskUpdate,
} from "@/api/third/testApi";
import { orderList } from "@/api/order";
import { schedulingList } from "@/api/www/planSchedule";
import { categoryComputerDict } from "@/api/third/fileConfig";
import { pucsVersion } from "@/api/pucs";
import { dictFactory } from "@/api/factory";

export default {
  data() {
    return {
      // 遮罩层
      loading: false,
      // 总条数
      total: 0,
      list: [],
      // 任务变更
      isTask: false,
      isTaskLoading: false,
      taskForm: {},
      // 表单校验
      rules: {
        categoryId: [
          {
            required: true,
            message: "请选择品类",
            trigger: "change",
          },
        ],
        orderNo: [
          {
            required: true,
            message: "请选择订单号",
            trigger: "change",
          },
        ],
        productNo: [
          {
            required: true,
            message: "请选择排产单号",
            trigger: "change",
          },
        ],
        processName: [
          {
            required: true,
            message: "请选择排产单号",
            trigger: "change",
          },
        ],
        factoryName: [
          {
            required: true,
            message: "请选择排产单号",
            trigger: "change",
          },
        ],
        processId: [
          {
            required: true,
            message: "请选择测试工序",
            trigger: "change",
          },
        ],
        factoryId: [
          {
            required: true,
            message: "请选择部署工厂",
            trigger: "change",
          },
        ],
        line: [
          {
            required: true,
            message: "请选择排产单号",
            trigger: "change",
          },
        ],
      },
      isDeviceLoading: false,
      deviceForm: {},
      // 测试工序
      processesList: [],
      // 部署工厂
      factoryList: [],
      // 线号
      testLineList: [],
      isDutLoading: false,
      // 品类
      dictList: [],
      // 维修结果
      serviceResultList: {
        0: "待处理",
        1: "OK",
        2: "报废",
      },
      // 产品去向
      prodDirectionList: {
        0: "产线",
        1: "报废",
        2: "研发",
      },
      dutForm: {},
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        categoryName: "",
        processesId: "",
        version: "",
      },
    };
  },
  created() {
    // 品类
    categoryComputerDict().then((response) => {
      this.dictList = response.data;
    });

    // 线号
    this.getDicts("sts_test_line").then((res) => {
      this.testLineList = res.data;
    });

    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      stsDeviceList(this.queryParams)
        .then((response) => {
          this.list = response.data.list;
          this.total = response.data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 删除
    handleDelete(row) {
      let text = row.status ? "禁用" : "启用";
      this.$confirm("确认要" + text, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return stsWebAuth([
            {
              id: row.id,
              status: row.status,
            },
          ]);
        })
        .then(() => {
          this.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.status = row.status ? 0 : 1;
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
    cellClick(row, column) {
      switch (column.label) {
        case "在测DUT":
          this.isDutForm = true;
          this.dutForm = {
            ...row,
          };
          break;
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (column.label == "在测DUT") {
        return `cursor: pointer;`;
      }
    },
    // 任务变更
    handleUpdate(row) {
      this.isTask = true;
      this.taskForm = {
        ...row,
      };
    },
    submitTaskForm() {
      this.$refs["taskForm"].validate((valid) => {
        if (valid) {
          if (this.taskForm.id) {
            this.isTaskLoading = true;
            stsTaskUpdate(this.taskForm)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("操作成功");
                  this.isTask = false;
                  this.getList();
                }
              })
              .finally(() => (this.isTaskLoading = false));
          }
        }
      });
    },
  },
};
</script>