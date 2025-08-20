<template>
  <div class="app-container chip-type-container">
    <div class="toolbar">
      <el-form :model="queryParams" ref="queryForm" v-show="showSearch" :inline="true" class="search-form">
        <el-form-item label="资料类型：" prop="type">
          <el-select v-model="queryParams.type" placeholder="请选择资料类型" clearable style="width: 200px">
            <el-option v-for="(label, value) in dataTypeList" :key="value" :label="label" :value="+value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="cyan" icon="el-icon-search" @click="handleQuery">
            搜索
          </el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['third:totalChipType:add']">
            新增
          </el-button>
        </el-col>
      </el-row>
    </div>

    <el-table v-loading="loading" :data="chipList" :height="tableHeight()" border>
      <el-table-column label="资料类型" align="center" prop="type" :formatter="onTypeFormatter" />
      <el-table-column label="创建人" align="center" prop="createBy">
        <span slot-scope="scope" v-NoData="scope.row.createBy"></span>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="140">
        <template slot-scope="scope">
          <Tooltip icon="el-icon-edit" content="编辑" v-hasPermi="['third:totalChipType:update']"
            @click="handleUpdate(scope.row)" />
          <Tooltip icon="el-icon-reading" content="详情" v-hasPermi="['third:totalChipType:detail']"
            @click="handleDetail(scope.row)" />
          <Tooltip icon="el-icon-delete" :className="['text-red']" content="删除"
            v-hasPermi="['third:totalChipType:delete']" @click="handleDelete(scope.row)" />
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />

    <!-- 新增、修改属性 -->
    <el-dialog class="addOrUp-Type-container" :title="title" append-to-body width="900px" center top="5vh"
      :visible.sync="open" :close-on-click-modal="false">
      <el-form ref="form" inline :model="form" :rules="rules">
        <el-card :body-style="{ paddingBottom: '0px' }">
          <el-form-item label="资料类型：" prop="type">
            <el-select v-model="form.type" placeholder="请选择资料类型" clearable style="width: 200px" :disabled="!!form.id">
              <el-option v-for="(label, value) in dataTypeList" :key="value" :label="label" :value="+value" />
            </el-select>
          </el-form-item>
        </el-card>
        <div class="flex justify-around type_container margin-top-xs" v-loading="isAddOrUpLoading">
          <el-card class="flex-sub">
            <div slot="header" class="clearfix">
              <span class="type_title">软件属性</span>
            </div>
            <ChooseType v-model="form.softValue" :typeList="softwareType" />
          </el-card>
          <el-card class="flex-sub margin-left-xs margin-right-xs">
            <div slot="header" class="clearfix">
              <span class="type_title">硬件属性</span>
            </div>
            <ChooseType v-model="form.hardValue" :typeList="hardType" />
          </el-card>
          <el-card class="flex-sub">
            <div slot="header" class="clearfix">
              <span class="type_title">工程属性</span>
            </div>
            <ChooseType v-model="form.projectValue" :typeList="epcType" />
          </el-card>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :loading="isSubLoading" type="primary" @click="submitForm()">
          确 定
        </el-button>
        <el-button @click="open = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 详情 -->
    <el-dialog class="detail-type-container" title="详情" append-to-body width="1000px" center top="3vh"
      :visible.sync="isDetail" :close-on-click-modal="false">
      <el-descriptions :title="`资料类型:  ${isDetailTypeName}`" direction="vertical" :column="3" border
        v-loading="isDetailLoading">
        <el-descriptions-item label="软件属性" :labelStyle="{ textAlign: 'center' }"
          :contentStyle="{ width: '33.333%', verticalAlign: 'top' }">
          <div class="detail_item_box">
            <el-tag size="small" class="margin-right-xs margin-bottom-xs"
              v-for="(typeName, index) in detailData.softwareType" :key="index">
              {{ typeName }}
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="硬件属性" :labelStyle="{ textAlign: 'center' }"
          :contentStyle="{ width: '33.333%', verticalAlign: 'top' }">
          <div class="detail_item_box">
            <el-tag size="small" class="margin-right-xs margin-bottom-xs"
              v-for="(typeName, index) in detailData.hardType" :key="index">
              {{ typeName }}
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="工程属性" :labelStyle="{ textAlign: 'center' }"
          :contentStyle="{ width: '33.333%', verticalAlign: 'top' }">
          <div class="detail_item_box">
            <el-tag size="small" class="margin-right-xs margin-bottom-xs"
              v-for="(typeName, index) in detailData.epcType" :key="index">
              {{ typeName }}
            </el-tag>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import {
  meansList,
  meansSave,
  meansUpdate,
  meansDelete,
} from "@/api/system/skipType";

import { listType as softwareList } from "@/api/third/type";
import { listType as hardList } from "@/api/third/ids/type";
import { listType as epcList } from "@/api/third/epc/type";

export default {
  name: "TotalChipType",
  components: {
    ChooseType: () => import("./ChooseType.vue"),
  },
  data() {
    return {
      loading: true,
      showSearch: true,
      isSubLoading: false,
      isAddOrUpLoading: false,
      isDetailLoading: false,
      total: 0,
      chipList: [],
      title: "",
      open: false,
      TypeList: [],
      // 资料类型
      dataTypeList: {},
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        type: "",
      },
      softwareType: [],
      hardType: [],
      epcType: [],
      // 表单参数
      form: {
        type: "",
        softValue: [],
        hardValue: [],
        projectValue: [],
      },
      // 详情
      isDetail: false,
      isDetailTypeName: "",
      detailData: {
        softwareType: [],
        hardType: [],
        epcType: [],
      },
      // 表单校验
      rules: {
        type: [
          { required: true, message: "资料类型不能为空", trigger: "change" },
        ],
      },
    };
  },
  created() {
    // 资料类型
    this.getConfigDicts("production_means", "dataTypeList");

    this.getList();

    this.getTypePyList();
  },
  methods: {
    getList() {
      this.loading = true;
      meansList(this.queryParams).then((res) => {
        const { list, total } = res.data;
        this.chipList = list;
        this.total = total;
        this.loading = false;
      });
    },
    /**
     * 属性列表
     *  type  1软件属性 2硬件属性 3工程属性
     */
    getTypePyList() {
      Promise.all([
        softwareList({ p: 1, l: 150 }),
        hardList({ p: 1, l: 50 }),
        epcList({ p: 1, l: 50 }),
      ]).then((res) => {
        let [softwareTypeData, hardTypeData, epcTypeData] = res;
        this.softwareType = this.getTypeKey(softwareTypeData.data.list);
        this.hardType = this.getTypeKey(hardTypeData.data.list);
        this.epcType = this.getTypeKey(epcTypeData.data.list);
      });
    },
    getTypeKey(data) {
      return data.map((item) => {
        return { id: item.id, typeKey: item.key, typeValue: item.value };
      });
    },
    onTypeFormatter(row) {
      return this.dataTypeList[row.type];
    },
    // 表单重置
    reset() {
      this.form = {
        type: "",
        process: "",
        softValue: [],
        hardValue: [],
        projectValue: [],
      };
      this.resetForm("form");
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加资料归类";
    },
    /** 修改按钮操作 */
    async handleUpdate(row) {
      this.reset();
      this.open = true;
      this.title = "修改资料归类";

      this.form = Object.assign({}, row);
    },
    /** 详情 */
    async handleDetail(row) {
      this.isDetail = true;
      const { type, softValue, hardValue, projectValue } = row;

      this.isDetailTypeName = this.dataTypeList[type];

      // 软件
      this.detailData.softwareType = this.handleTransType(
        this.softwareType,
        softValue
      );
      // 硬件
      this.detailData.hardType = this.handleTransType(this.hardType, hardValue);
      // 工程
      this.detailData.epcType = this.handleTransType(
        this.epcType,
        projectValue
      );
    },
    /** 已选属性转化  */
    handleTransType(source, target) {
      let newArr = [];
      target.forEach((item) => {
        source.forEach((item1) => {
          if (item === item1.typeKey) {
            newArr.push(item1.typeValue);
          }
        });
      });
      return newArr;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm("确认要删除该数据吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.loading = true;
          return meansDelete([row.id]);
        })
        .then(() => {
          this.loading = false;
          this.getList();
          this.msgSuccess("删除成功");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const { softValue, hardValue, projectValue } = this.form;

          const dataFlag = [
            this.Is_Empty(softValue),
            this.Is_Empty(hardValue),
            this.Is_Empty(projectValue),
          ].every((item) => item === true);

          if (dataFlag) {
            return this.msgError("软/硬/工属性至少有一项选择数据");
          }

          this.isSubLoading = true;
          if (this.form.id != undefined) {
            meansUpdate(this.form)
              .then(() => {
                this.msgSuccess("修改成功");
                this.isSubLoading = false;
                this.open = false;
                this.getList();
              })
              .catch(() => {
                this.isSubLoading = false;
              });
          } else {
            meansSave(this.form)
              .then(() => {
                this.msgSuccess("新增成功");
                this.isSubLoading = false;
                this.open = false;
                this.getList();
              })
              .catch(() => {
                this.isSubLoading = false;
              });
          }
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.addOrUp-Type-container {
  .type_container {
    .type_title {
      &::before {
        content: "*";
        color: #f56c6c;
        margin-right: 4px;
      }
    }
  }
}

.detail-type-container {
  .detail_item_box {
    min-height: 150px;
    max-height: 300px;
    overflow: hidden;
    overflow-y: auto;
  }
}
</style>
