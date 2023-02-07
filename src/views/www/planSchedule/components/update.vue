
<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    center
    append-to-body
    top="1vh"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="form"
      label-position="left"
      :model="form"
      :rules="rules"
      label-width="90px"
    >
      <el-form-item label="产品品类:" prop="categoryId">
        <el-select
          v-model="form.categoryId"
          style="width: 100%"
          placeholder="请选择产品品类"
          clearable
          filterable
          @change="getComputerId"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="产品型号:" prop="computerId">
        <el-select
          v-model="form.computerId"
          style="width: 100%"
          placeholder="请选择产品型号"
          clearable
          filterable
        >
          <el-option
            v-for="dict in modelList"
            :key="dict.model"
            :label="dict.name"
            :value="dict.model"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="生产日期:" prop="date">
        <el-date-picker
          v-model="form.date"
          style="width: 100%"
          type="date"
          :default-time="defaultTime"
          value-format="timestamp"
          placeholder="请选择生产日期"
          @change="selDate"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="生产地点:" prop="address">
        <el-radio-group v-model="form.address">
          <el-radio
            v-for="(item, index) in productAddressList"
            :key="index"
            :label="item.dictLabel"
          >
            {{ item.dictLabel }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生产流程:" prop="process">
        <el-radio-group v-model="form.process">
          <el-radio
            v-for="(item, index) in operationList"
            :key="index"
            :label="item.dictLabel"
          >
            {{ item.dictLabel }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="form.process === 'SMT'">
        <el-form-item label="方案版本:" prop="schemeVersion">
          <el-select
            v-model="form.schemeVersion"
            style="width: 100%"
            placeholder="请选择产品型号"
            clearable
            filterable
          >
            <el-option
              v-for="dict in versionList"
              :key="dict.dictCode"
              :label="dict.dictLabel"
              :value="String(dict.dictCode)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="有效期:" prop="dateRange">
          <el-date-picker
            style="width: 100%"
            v-model="form.dateRange"
            value-format="timestamp"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item>
      </template>
      <el-form-item label="数量:" prop="num">
        <el-input v-model.number="form.num" clearable placeholder="请输入数量">
          <template slot="append">pcs</template>
        </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  schedulingCreate,
  schedulingEdit,
  scheduleVersion,
} from "@/api/www/planSchedule";
import { listComputer } from "@/api/third/computer";

export default {
  props: ["title", "dictList", "operationList"],
  data() {
    const checkScheduleNum = (rule, value, callback) => {
      if (value === "") {
        return callback("请输入数量");
      } else if (!Number.isInteger(value) && /./g.test(value)) {
        return callback("数量必须为数字值，且为整数");
      } else if (value < 1) {
        return callback("数量必须大于0");
      } else {
        callback();
      }
    };
    return {
      dialogVisible: false,
      // 生产地点
      productAddressList: [],
      modelList: [],
      // 方案版本字典
      versionList: [],
      // 表单参数
      form: {
        categoryId: "",
        computerId: "",
        date: "",
        address: "",
        process: "",
        schemeVersion: "",
        dateRange: [],
        num: "",
      },
      defaultTime: this.moment().format("HH:mm:ss"),
      // 表单校验
      rules: {
        categoryId: [
          { required: true, message: "请选择产品品类", trigger: "change" },
        ],
        computerId: [
          { required: true, message: "请选择产品型号", trigger: "change" },
        ],
        date: [
          { required: true, message: "请选择生产日期", trigger: "change" },
        ],
        address: [
          { required: true, message: "请选择生产地点", trigger: "change" },
        ],
        process: [
          { required: true, message: "请选择生产流程", trigger: "change" },
        ],
        schemeVersion: [
          { required: true, message: "请选择方案版本", trigger: "change" },
        ],
        dateRange: [
          { required: true, message: "请选择时间", trigger: "change" },
        ],
        num: [{ required: true, validator: checkScheduleNum, trigger: "blur" }],
      },
    };
  },
  computed: {
    pickerOptions() {
      return {
        disabledDate(time) {
          return time.getTime() < Date.now() - 24 * 3600 * 1000;
        },
        selectableRange: `${this.defaultTime} - 23:59:59`,
      };
    },
  },
  watch: {
    "form.categoryId"(id) {
      if (id)
        this.modelList = this.dictList.filter(
          (item) => item.id === id
        )[0].computerList;
    },
  },
  created() {
    this.getProductAddress();
    this.getScheduleVersion();
  },
  methods: {
    getComputerId(id) {
      if (id) {
        this.form.computerId = "";
      }
    },
    // 获取型号字典
    getlistComputer(key) {
      listComputer({ key }).then((res) => {
        const { list } = res.data;
        this.modelList = list;
      });
    },
    // 方案版本字典
    getScheduleVersion() {
      scheduleVersion().then((res) => {
        this.versionList = res.data;
      });
    },
    // 生产地点
    getProductAddress() {
      this.getDicts("product_address").then((response) => {
        this.productAddressList = response.data;
      });
    },
    selDate(time) {
      this.form.dateRange = [time, time];
    },
    // 表单重置
    reset() {
      this.form = {
        categoryId: "",
        computerId: "",
        date: "",
        address: "",
        process: "",
        schemeVersion: "",
        dateRange: [],
        num: "",
      };
      this.resetForm("form");
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const data = this.addDateRange(this.form, this.form.dateRange, {
            begin: "startTime",
          });
          if (this.form.process !== "SMT") {
            this.form.schemeVersion = "";
          }
          if (this.form.id) {
            schedulingEdit(data).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("编辑成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          } else {
            schedulingCreate(data).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.dialogVisible = false;
                this.$parent.getList();
              }
            });
          }
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.style-upload {
  .el-upload-dragger {
    width: 100%;
  }
}

.products-box {
  max-height: 400px;
  overflow: auto;
  overflow-x: hidden;

  .add-btn {
    position: sticky;
    top: -6px;
    z-index: 666;
    background: #fff;
    padding: 10px;
  }

  .product-list-box {
    border-radius: 3px;
  }
}
</style>

