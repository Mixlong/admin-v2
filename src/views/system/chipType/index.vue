<template>
  <div class="app-container chip-type-container">
    <div class="toolbar">
      <el-form :model="queryParams" ref="queryForm" v-show="showSearch" :inline="true" class="search-form">
        <el-form-item label="品类" prop="categoryId">
          <ModelCategory v-model="queryParams.categoryId" dictLabel="name" dictValue="id"></ModelCategory>
        </el-form-item>
        <el-form-item label="芯片类型" prop="label">
          <el-select v-model="queryParams.label" placeholder="请选择芯片类型" clearable filterable style="width: 185px">
            <el-option v-for="dict in chipTypeList" :key="dict.dictCode" :label="dict.dictLabel"
              :value="dict.dictLabel" />
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
          <el-button type="primary" icon="el-icon-plus" v-hasPermi="['third:chipType:add']" @click="handleAdd">
            新增
          </el-button>
        </el-col>
      </el-row>

    </div>

    <el-table v-loading="loading" :data="chipList" :height="tableHeight()" border>
      <el-table-column label="品类" align="center" prop="categoryName" />
      <el-table-column label="芯片类型" align="center" prop="schemeVersion" />
      <el-table-column label="资料类型" align="center" prop="type" :formatter="onTypeFormatter" />
      <el-table-column label="创建人" align="center" prop="createBy">
        <span slot-scope="scope" v-NoData="scope.row.createBy"></span>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template slot-scope="scope">
          <Tooltip icon="el-icon-edit" content="编辑" v-hasPermi="['third:chipType:update']"
            @click="handleUpdate(scope.row)" />
          <Tooltip icon="el-icon-reading" content="详情" v-hasPermi="['third:chipType:detail']"
            @click="handleDetail(scope.row)" />
          <Tooltip icon="el-icon-delete" content="删除" v-hasPermi="['third:chipType:delete']"
          class="text-red"
            @click="handleDelete(scope.row)" />
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />

    <!-- 新增、修改属性 -->
    <el-dialog class="addOrUp-Type-container" :title="title" append-to-body width="900px" center top="5vh"
      :visible.sync="open" :close-on-click-modal="false" v-if="open">
      <el-form ref="form" inline :model="form" :rules="rules">
        <el-card :body-style="{ paddingBottom: '0px' }">
          <el-form-item label="品类" prop="categoryName">
            <ModelCategory v-model="form.categoryName" :disabled="!!form.id" dictLabel="name" :moreParams="true"
              @getChange="getChange"></ModelCategory>
          </el-form-item>
          <el-form-item label="芯片类型：" prop="schemeVersion">
            <el-select v-model="form.schemeVersion" placeholder="请选择芯片类型" clearable filterable style="width: 200px"
              :disabled="!!form.id">
              <el-option v-for="dict in chipTypeList" :key="dict.dictCode" :label="dict.dictLabel"
                :value="dict.dictLabel" />
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
              <span class="type_title">软件属性（bist）</span>
            </div>
            <ChooseType v-model="form.bistValue" :typeList="softwareType" />
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
      <el-descriptions :title="`芯片类型:  ${isDetailTypeName}`" direction="vertical" :column="3" border
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
        <el-descriptions-item label="软件属性（bist）" :labelStyle="{ textAlign: 'center' }"
          :contentStyle="{ width: '33.333%', verticalAlign: 'top' }">
          <div class="detail_item_box">
            <el-tag size="small" class="margin-right-xs margin-bottom-xs"
              v-for="(typeName, index) in detailData.bistType" :key="index">
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
  schemeTypeList,
  schemeTypePtList,
  schemeTypeSave,
  schemeTypeUpdate,
  schemeTypePtPick,
  schemeTypeDelete,
} from "@/api/system/skipType";

export default {
  name: "ChipType",
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
      chipTypeList: [],
      // 资料类型
      dataTypeList: {},
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        label: "", // 芯片类型
        categoryId: "", // 品类id
      },
      softwareType: [],
      hardType: [],
      epcType: [],
      // 表单参数
      form: {
        categoryName: "",
        schemeVersion: "",
        softValue: [],
        bistValue: [],
        hardValue: [],
        projectValue: [],
      },
      // 详情
      isDetail: false,
      isDetailTypeName: "",
      detailData: {
        softwareType: [],
        bistType: [],
        hardType: [],
        epcType: [],
      },
      // 表单校验
      rules: {
        categoryName: [
          { required: true, message: "品类不能为空", trigger: "change" },
        ],
        schemeVersion: [
          { required: true, message: "芯片类型不能为空", trigger: "change" },
        ],
      },
    };
  },
  created() {
    // 芯片类型
    this.getDicts("scheme_version").then((res) => {
      this.chipTypeList = res.data;
    });
    // 资料类型
    this.getConfigDicts("production_means", "dataTypeList");
    this.getList();
    this.getTypePyList();
  },
  methods: {
    /** 查询角色列表 */
    getList() {
      this.loading = true;
      schemeTypeList(this.queryParams).then((res) => {
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
        schemeTypePtList({ type: 1 }),
        schemeTypePtList({ type: 2 }),
        schemeTypePtList({ type: 3 }),
      ]).then((res) => {
        let [softwareType, hardType, epcType] = res;
        this.softwareType = softwareType.data;
        this.hardType = hardType.data;
        this.epcType = epcType.data;
      });
    },
    onTypeFormatter(row) {
      return this.dataTypeList[row.type];
    },
    // 表单重置
    reset() {
      this.form = {
        categoryName: "",
        schemeVersion: "",
        softValue: [],
        bistValue: [],
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
      this.title = "添加芯片属性";
    },
    /** 修改按钮操作 */
    async handleUpdate(row) {
      this.reset();
      this.open = true;
      this.title = "修改芯片属性";
      const { schemeVersion, id, categoryName, categoryId } = row;

      this.form.schemeVersion = schemeVersion;
      this.form.categoryName = categoryName;
      this.form.categoryId = categoryId;
      this.form.id = id;
      this.isAddOrUpLoading = true;

      const { softList, bistList, hardList, projectList } = await this.getChipType(
        schemeVersion,
        categoryId
      );
      this.form.softValue = softList;
      this.form.bistValue = bistList;
      this.form.hardValue = hardList;
      this.form.projectValue = projectList;
    },
    /** 已选属性 */
    getChipType(scheme, categoryId, type) {
      return new Promise((resolve, reject) => {
        schemeTypePtPick({ scheme, categoryId }).then((res) => {
          this.isAddOrUpLoading = false;
          this.isDetailLoading = false;
          resolve({
            softList: res.data[1] || [],
            bistList: res.data[4] || [],
            hardList: res.data[2] || [],
            projectList: res.data[3] || [],
          });
        });
      });
    },
    /** 详情 */
    async handleDetail(row) {
      this.isDetail = true;
      const { schemeVersion, categoryId } = row;
      this.isDetailTypeName = schemeVersion;
      this.isDetailLoading = true;
      const { softList, bistList, hardList, projectList } = await this.getChipType(
        schemeVersion,
        categoryId
      );
      // 软件
      this.detailData.softwareType = this.handleTransType(
        this.softwareType,
        softList
      );
      // 软件（bist）
      this.detailData.bistType = this.handleTransType(
        this.softwareType,
        bistList
      );
      // 硬件
      this.detailData.hardType = this.handleTransType(this.hardType, hardList);
      // 工程
      this.detailData.epcType = this.handleTransType(this.epcType, projectList);
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
    getChange(e) {
      const { id, name } = JSON.parse(e);

      this.$set(this.form, "categoryName", name);
      this.$set(this.form, "categoryId", id);
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const { id, schemeVersion, categoryName } = row;
      this.$confirm(`确定删除芯片类型"${row.schemeVersion}"吗？`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          schemeTypeDelete({ id }).then(() => {
            this.msgSuccess("删除成功");
            this.getList();
          });
        })
        .catch(() => {
        });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const { projectValue, hardValue, softValue, bistValue } = this.form;
          const dataFlag = [
            this.Is_Empty(softValue),
            this.Is_Empty(bistValue),
            this.Is_Empty(hardValue),
            this.Is_Empty(projectValue),
          ].every((item) => item === true);

          // if (
          //   this.Is_Empty(softValue) ||
          //   this.Is_Empty(hardValue) ||
          //   this.Is_Empty(projectValue)
          // ) {
          //   return this.msgError("软/硬/工属性每项至少选择一个");
          // }
          if (dataFlag) {
            return this.msgError("软/硬/工属性至少有一项选择数据");
          }
          this.isSubLoading = true;
          if (this.form.id != undefined) {
            schemeTypeUpdate(this.form)
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
            schemeTypeSave(this.form)
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
