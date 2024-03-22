<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属品类" prop="categoryName">
        <el-select
          v-model="queryParams.categoryName"
          filterable
          clearable
          placeholder="请选择所属品类"
          style="width: 140px"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="线号" prop="lineNum">
        <el-select
          v-model="queryParams.lineNum"
          clearable
          size="mini"
          placeholder="请选择线号"
          style="width: 140px"
        >
          <el-option
            v-for="(dict, index) in testLineList"
            :key="index"
            :label="dict.dictLabel"
            :value="dict.dictLabel"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="维修结果" prop="serviceResult">
        <el-select
          v-model="queryParams.serviceResult"
          clearable
          size="mini"
          filterable
          placeholder="请选择维修结果"
          style="width: 140px"
        >
          <el-option
            v-for="(dict, index) in serviceResultList"
            :key="index"
            :label="dict"
            :value="dict"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="不良原因" prop="badResult">
        <el-select
          v-model="queryParams.badResult"
          clearable
          size="mini"
          allow-create
          filterable
          placeholder="请选择不良原因"
          style="width: 140px"
        >
          <el-option
            v-for="(dict, index) in badResultList"
            :key="index"
            :label="dict.dictLabel"
            :value="dict.dictLabel"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="PCBA SN" prop="pcbaSn">
        <el-input
          v-model="queryParams.pcbaSn"
          size="mini"
          clearable
          placeholder="请输入PCBA SN"
          style="width: 140px"
        />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 185px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
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
      <el-form-item class="fr">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
          新增
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="dataList"
      :height="tableHeight()"
      border
    >
      <el-table-column label="序号" width="58" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="日期" prop="createTime" align="center" />
      <el-table-column label="品类" prop="categoryName" align="center" />
      <el-table-column label="转入线别 " prop="lineNum" align="center" />
      <el-table-column label="PCBA SN" prop="pcbaSn" align="center" />
      <el-table-column label="不良标签" prop="badLabel" align="center" />
      <el-table-column label="实际不良原因" prop="badResult" align="center" />
      <el-table-column label="维修方法" prop="serviceMethod" align="center" />
      <el-table-column label="维修结果" prop="serviceResult" align="center" />
      <el-table-column label="产品去向" prop="destination" align="center" />
      <el-table-column label="维修员" prop="createBy" align="center" />
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="scope">
          <Tooltip
            icon="el-icon-edit"
            content="编辑"
            @click="handleUpdate(scope.row)"
          />
          <Tooltip
            icon="el-icon-delete"
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
    <el-dialog
      :title="isRecordTitle"
      center
      width="500px"
      :visible.sync="isRecordShow"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="90px"
        label-position="left"
      >
        <el-form-item label="所属品类" prop="categoryName">
          <el-select
            v-model="form.categoryName"
            filterable
            clearable
            :disabled="!!form.id"
            placeholder="请选择所属品类"
            class="w70"
          >
            <el-option
              v-for="dict in dictList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="线号" prop="lineNum">
          <el-select
            v-model="form.lineNum"
            clearable
            size="mini"
            placeholder="请选择线号"
            class="w70"
          >
            <el-option
              v-for="(dict, index) in testLineList"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="不良标签" prop="badLabel">
          <el-select
            v-model="form.badLabel"
            clearable
            size="mini"
            allow-create
            filterable
            placeholder="请选择不良标签（可输入）"
            class="w70"
          >
            <el-option
              v-for="(dict, index) in errLabelList"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="不良原因" prop="badResult">
          <el-select
            v-model="form.badResult"
            clearable
            size="mini"
            allow-create
            filterable
            placeholder="请选择不良原因（可输入）"
            class="w70"
          >
            <el-option
              v-for="(dict, index) in badResultList"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="维修方法" prop="serviceMethod">
          <el-select
            v-model="form.serviceMethod"
            clearable
            size="mini"
            allow-create
            filterable
            placeholder="请选择维修方法（可输入）"
            class="w70"
          >
            <el-option
              v-for="(dict, index) in serviceMethodList"
              :key="index"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="维修结果" prop="serviceResult">
          <el-select
            v-model="form.serviceResult"
            clearable
            size="mini"
            filterable
            placeholder="请选择维修结果"
            class="w70"
          >
            <el-option
              v-for="(dict, index) in serviceResultList"
              :key="index"
              :label="dict"
              :value="dict"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品去向" prop="destination">
          <el-select
            v-model="form.destination"
            clearable
            size="mini"
            filterable
            placeholder="请选择产品去向"
            class="w70"
          >
            <el-option
              v-for="(dict, index) in prodDirectionList"
              :key="index"
              :label="dict"
              :value="dict"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="PCBA SN" prop="list">
          <el-input v-model="form.list" type="textarea" rows="3" :disabled="!!form.id" />
          <i>SN可以扫码输入，多个SN输入注意回车换行或英文逗号</i>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          size="small"
          type="primary"
          :loading="isRecordLoading"
          @click="submitTaskForm()"
        >
          确 定
        </el-button>
        <el-button size="small" @click="isRecordShow = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  recordList,
  recordSave,
  recordUpdate,
  recordDelete,
} from "@/api/third/testApi";
import { categoryComputerDict } from "@/api/third/fileConfig";

export default {
  data() {
    const checkPcba = (rule, value, callback) => {
      if (this.Is_Empty(value)) {
        callback(new Error("请输入PCBA SN号"));
      } else if (/,/g.test(value)) {
        callback(new Error("多个PCBA号只能用中文逗号或换行分格"));
      } else {
        callback();
      }
    };

    return {
      // 遮罩层
      loading: false,
      // 总条数
      total: 0,
      dataList: [],
      // 任务变更
      isRecordShow: false,
      isRecordLoading: false,
      form: {},
      isDeviceLoading: false,
      form: {},
      // 线号
      testLineList: [],
      isDutLoading: false,
      // 品类
      dictList: [],
      // 不良标签
      errLabelList: [],
      // 不良原因
      badResultList: [],
      // 不良原因
      serviceMethodList: [],
      // 维修结果
      serviceResultList: ["待处理", "OK", "报废"],
      // 产品去向
      prodDirectionList: ["产线", "报废", "研发"],
      // 日期范围
      dateRange: [],
      // 表单校验
      rules: {
        categoryName: [
          {
            required: true,
            message: "请选择品类",
            trigger: "change",
          },
        ],
        lineNum: [
          {
            required: true,
            message: "请选择线号",
            trigger: "change",
          },
        ],
        badLabel: [
          {
            required: true,
            message: "请选择不良标签",
            trigger: "change",
          },
        ],
        badResult: [
          {
            required: true,
            message: "请选择不良原因",
            trigger: "change",
          },
        ],
        serviceMethod: [
          {
            required: true,
            message: "请选择维修方法",
            trigger: "change",
          },
        ],
        serviceResult: [
          {
            required: true,
            message: "请选择维修结果",
            trigger: "change",
          },
        ],
        destination: [
          {
            required: true,
            message: "请选择产品去向",
            trigger: "change",
          },
        ],
        list: [
          {
            required: true,
            validator: checkPcba,
            trigger: ["blur", "change"],
          },
        ],
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        categoryName: "",
        lineNum: "",
        badResult: "",
        serviceResult: "",
        pcbaSn: "",
      },
    };
  },
  computed: {
    isRecordTitle() {
      return (this.form.id ? "编辑" : "新增") + "维修记录";
    },
  },
  created() {
    // 品类
    categoryComputerDict().then((res) => {
      this.dictList = res.data;
    });

    // 线号
    this.getDicts("sts_test_line").then((res) => {
      this.testLineList = res.data;
    });

    // 不良标签
    this.getDicts("err_label_dict").then((res) => {
      this.errLabelList = res.data;
    });

    // 不良原因
    this.getDicts("err_result_dict").then((res) => {
      this.badResultList = res.data;
    });

    // 维修方法
    this.getDicts("service_method_dict").then((res) => {
      this.serviceMethodList = res.data;
    });

    this.getList();

    // this.Enter_Fn(this.submitTaskForm);
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      recordList(
        this.addDateRange(this.queryParams, this.dateRange, {
          begin: "startTime",
          end: "endTime",
        })
      )
        .then((response) => {
          this.dataList = response.data.list;
          this.total = response.data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 删除
    handleDelete(row) {
      this.$confirm("确认要刪除吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return recordDelete([row.id]);
        })
        .then(() => {
          this.msgSuccess("删除成功");
          this.getList();
        })
        .catch(() => {
          this.msgError("删除失败");
        });
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
    reset() {
      this.form = {};
      this.resetForm("form");
    },
    // 新增
    handleAdd() {
      this.reset();
      this.isRecordShow = true;
    },
    // 编辑
    handleUpdate(row) {
      this.reset();
      this.isRecordShow = true;
      this.form = { ...row, list: row.pcbaSn };
    },
    submitTaskForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const dataForm = JSON.parse(JSON.stringify(this.form));
          const { list } = dataForm;
          if (list.length) {
            const pucsList = list.split(/[/\n|，]/);

            dataForm.list = Array.from(new Set(pucsList)).filter(item => item !== "");
          }

          if (dataForm.id) {
            this.isRecordLoading = true;
            recordUpdate(dataForm)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.isRecordShow = false;
                  this.getList();
                }
              })
              .finally(() => (this.isRecordLoading = false));
          } else {
            recordSave(dataForm)
              .then(() => {
                this.msgSuccess("新增成功");
                this.isRecordShow = false;
                this.getList();
              })
              .finally(() => (this.isRecordLoading = false));
          }
        }
      });
    }
  },
};
</script>
<style lang="scss" scoped>
.w70 {
  width: 70%;
}
</style>
