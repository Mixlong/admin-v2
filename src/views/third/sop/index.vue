<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" inline>
      <el-form-item label="产品品类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          filterable
          allow-create
          clearable
          style="width: 140px"
          placeholder="请选择产品品类"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="state">
        <el-select
          v-model="queryParams.state"
          style="width: 140px"
          clearable
          placeholder="请选择审核状态"
        >
          <el-option label="待审核" value="0" />
          <el-option label="审核通过" value="1" />
          <el-option label="审核拒绝" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="版本号" prop="versionCode">
        <el-input
          v-model.trim="queryParams.versionCode"
          clearable
          style="width: 140px"
          placeholder="请选择版本号"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          v-hasPermi="['sop:search:btn']"
          type="primary"
          icon="el-icon-search"
          @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button
          icon="el-icon-refresh"
          v-hasPermi="['sop:search:reset']"
          @click="resetQuery"
        >
          重置
        </el-button>
      </el-form-item>
      <el-row
        :gutter="20"
        type="flex"
        align="middle"
        justify="start"
        class="fr mt5"
      >
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['sop:add:btn']"
            type="primary"
            icon="el-icon-plus"
            @click="handleAdd"
          >
            新增
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      class="afterSaleBox"
      :row-class-name="rowName"
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      border
    >
      <el-table-column
        label="品类"
        prop="categoryName"
        align="center"
        width="150"
      />
      <el-table-column
        label="版本号"
        prop="versionCode"
        align="center"
        width="150"
      />
      <el-table-column label="描述" prop="desc" align="center" />
      <el-table-column label="审核状态" prop="model" align="center" width="150">
        <template slot-scope="{ row }">
          <span v-if="row.state === 0" class="text-cyan">待审核</span>
          <span v-if="row.state === 1" class="text-green">审核通过</span>
          <span v-if="row.state === 2" class="text-red">审核拒绝</span>
        </template>
      </el-table-column>
      <el-table-column
        label="创建人"
        prop="createBy"
        align="center"
        width="150"
      />
      <el-table-column
        label="更新时间"
        prop="updateTime"
        align="center"
        width="150"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.updateTime || row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180">
        <template slot-scope="{ row }">
          <div class="flex justify-center">
            <el-button
              v-if="row.state === 0"
              v-hasPermi="['sop:check:btn']"
              class="text-orange"
              type="text"
              @click="handleCheck(row)"
            >
              审核
            </el-button>
            <el-button
              v-hasPermi="['sop:detail:btn']"
              class="text-green"
              type="text"
              @click="handleDetail(row)"
            >
              查看
            </el-button>
            <el-button
              v-hasPermi="['sop:update:btn']"
              class="text-blue"
              type="text"
              @click="handleUpdate(row)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPermi="['sop:delete:btn']"
              class="text-red"
              type="text"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </div>
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

    <!-- 新增、修改 -->
    <add-sop
      ref="isAddSopRef"
      :visible.sync="isSopAddDia"
      :dictList="dictList"
    />

    <!-- 详情 -->
    <sop-detail ref="isSopDetailRef" :visible.sync="isSopDetailDia" />
  </div>
</template>

<script>
import { sopList, sopDelete, sopState } from "@/api/third/testApi";
import { mapGetters } from "vuex";
import { CategoryMixin } from "@/mixins/common";

export default {
  name: "Sop",
  mixins: [CategoryMixin],
  components: {
    AddSop: () => import("./components/addSop"),
    sopDetail: () => import("./components/sopDetail"),
  },
  data() {
    return {
      form: {},
      urls: [],
      // 遮罩层
      loading: true,
      authDialogVisible: false,
      // 新增、修改弹窗
      isSopAddDia: false,
      // 详情弹窗
      isSopDetailDia: false,
      // 待处理 、 全部
      isWaitDispose: true,
      // 总条数
      total: 0,
      brandList: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        categoryId: undefined,
        state: undefined,
        versionCode: undefined,
      },
    };
  },
  computed: {
    ...mapGetters(["userId", "name"]),
    directionDir() {
      return (dataList, direction) => {
        return (
          dataList.length &&
          dataList.filter((item) => +item.dictValue === +direction)
        );
      };
    },
    directionLabel() {
      return (dataList, direction) => {
        const directionData = this.directionDir(dataList, direction);
        return directionData[0] && directionData[0].dictLabel;
      };
    },
  },
  created() {
    let { name } = this.$route.query;
    if (name) {
      this.queryParams.product = name;
    }
    this.getList();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      sopList(this.queryParams)
        .then((res) => res.data)
        .then((data) => {
          const { list, total } = data;

          this.brandList = list;
          this.total = total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 审核
    handleCheck(row) {
      let loading = null;

      this.$confirm("是否审核通过？", "警告", {
        confirmButtonText: "通 过",
        cancelButtonText: "驳 回",
        type: "warning",
      })
        .then(() => {
          loading = this.$loading({
            lock: true,
            text: "正在处理中...",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          });

          sopState({ id: row.id, state: 1 }).then(() => {
            loading.close();
            this.getList();
            this.msgSuccess("操作成功");
          });
        })
        .catch(() => {
          loading = this.$loading({
            lock: true,
            text: "正在处理中...",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          });

          sopState({ id: row.id, state: 2 }).then(() => {
            loading.close();
            this.getList();
            this.msgSuccess("操作成功");
          });
        });
    },
    // 新增
    handleAdd() {
      this.isSopAddDia = true;
    },
    // 修改
    handleUpdate(row) {
      this.isSopAddDia = true;
      this.$refs.isAddSopRef.form = JSON.parse(JSON.stringify(row));
    },
    // 详情
    handleDetail(row) {
      this.isSopDetailDia = true;
      this.$refs.isSopDetailRef.getSopInfo(row.id);
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(
        '是否确认删除品类为"' + row.categoryName + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          return sopDelete([row.id]);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
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
    rowName({ row, rowIndex }) {
      if (row.state === 1) {
        return "finish-row";
      }
      if (row.state === 2) {
        return "reject-row";
      }
    },
  },
};
</script>
<style lang="scss">
.finish-row td,
.finish-row:hover td {
  background-color: rgba(155, 216, 148, 0.3) !important;
}

.reject-row td,
.reject-row:hover td {
  background-color: rgba(224, 82, 99, 0.3) !important;
}
</style>
