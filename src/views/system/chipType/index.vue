<template>
  <div class="app-container chip-type-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      v-show="showSearch"
      :inline="true"
    >
      <el-form-item label="芯片类型" prop="label">
        <el-select
          v-model="queryParams.label"
          placeholder="请选择芯片类型"
          clearable
          size="small"
          style="width: 185px"
        >
          <el-option
            v-for="dict in chipTypeList"
            :key="dict.dictCode"
            :label="dict.dictLabel"
            :value="dict.dictLabel"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="cyan"
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
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:role:add']"
        >
          新增
        </el-button>
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="chipList"
      :height="tableHeight()"
      border
    >
      <el-table-column label="芯片类型" align="center" prop="schemeVersion" />
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="140"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >
            修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-reading"
            @click="handleDetail(scope.row)"
          >
            详情
          </el-button>
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

    <!-- 新增、修改属性 -->
    <el-dialog
      class="addOrUp-Type-container"
      :title="title"
      append-to-body
      width="900px"
      center
      top="5vh"
      :visible.sync="open"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules">
        <el-card :body-style="{ paddingBottom: '0px' }">
          <el-form-item label="芯片类型：" prop="type">
            <el-select
              v-model="form.type"
              placeholder="请选择芯片类型"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="dict in chipTypeList"
                :key="dict.dictCode"
                :label="dict.dictLabel"
                :value="dict.dictLabel"
              />
            </el-select>
          </el-form-item>
        </el-card>
        <div
          class="flex justify-around type_container margin-top-xs"
          v-loading="isAddOrUpLoading"
        >
          <el-card class="flex-sub">
            <div slot="header" class="clearfix">
              <span class="type_title">软件属性</span>
            </div>
            <ChooseType v-model="form.softwareType" :typeList="softwareType" />
          </el-card>
          <el-card class="flex-sub margin-left-xs margin-right-xs">
            <div slot="header" class="clearfix">
              <span class="type_title">硬件属性</span>
            </div>
            <ChooseType v-model="form.hardType" :typeList="hardType" />
          </el-card>
          <el-card class="flex-sub">
            <div slot="header" class="clearfix">
              <span class="type_title">工程属性</span>
            </div>
            <ChooseType v-model="form.epcType" :typeList="epcType" />
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
    <el-dialog
      class="detail-type-container"
      title="详情"
      append-to-body
      width="1000px"
      center
      top="3vh"
      :visible.sync="isDetail"
      :close-on-click-modal="false"
    >
      <el-descriptions
        :title="`芯片类型:  ${isDetailTypeName}`"
        direction="vertical"
        :column="3"
        border
        v-loading="isDetailLoading"
      >
        <el-descriptions-item
          label="软件属性"
          :labelStyle="{ textAlign: 'center' }"
          :contentStyle="{ width: '33.333%', verticalAlign: 'top' }"
        >
          <div class="detail_item_box">
            <el-tag
              size="small"
              class="margin-right-xs margin-bottom-xs"
              v-for="(typeName, index) in detailData.softwareType"
              :key="index"
            >
              {{ typeName }}
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item
          label="硬件属性"
          :labelStyle="{ textAlign: 'center' }"
          :contentStyle="{ width: '33.333%', verticalAlign: 'top' }"
        >
          <div class="detail_item_box">
            <el-tag
              size="small"
              class="margin-right-xs margin-bottom-xs"
              v-for="(typeName, index) in detailData.hardType"
              :key="index"
            >
              {{ typeName }}
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item
          label="工程属性"
          :labelStyle="{ textAlign: 'center' }"
          :contentStyle="{ width: '33.333%', verticalAlign: 'top' }"
        >
          <div class="detail_item_box">
            <el-tag
              size="small"
              class="margin-right-xs margin-bottom-xs"
              v-for="(typeName, index) in detailData.epcType"
              :key="index"
            >
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
} from "@/api/system/skipType";

export default {
  name: "Role",
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
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
        label: undefined,
      },
      softwareType: [],
      hardType: [],
      epcType: [],
      // 表单参数
      form: {
        type: "",
        softwareType: [],
        hardType: [],
        epcType: [],
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
          { required: true, message: "芯片类型不能为空", trigger: "change" },
        ],
      },
    };
  },
  created() {
    this.getList();
    this.getTypePyList();
    // 芯片类型
    this.getDicts("scheme_version").then((res) => {
      this.chipTypeList = res.data;
    });
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
    // 表单重置
    reset() {
      this.form = {
        type: "",
        softwareType: [],
        hardType: [],
        epcType: [],
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
      const { schemeVersion, id } = row;
      this.form.type = schemeVersion;
      this.form.id = id;
      this.isAddOrUpLoading = true;
      const { softList, hardList, projectList } = await this.getChipType(
        schemeVersion
      );
      this.form.softwareType = softList;
      this.form.hardType = hardList;
      this.form.epcType = projectList;
    },
    /** 已选属性 */
    getChipType(scheme) {
      return new Promise((resolve, reject) => {
        schemeTypePtPick({ scheme }).then((res) => {
          const { softList, hardList, projectList } = res.data;
          this.isAddOrUpLoading = false;
          this.isDetailLoading = false;
          resolve({
            softList,
            hardList,
            projectList,
          });
        });
      });
    },
    /** 详情 */
    async handleDetail(row) {
      this.isDetail = true;
      const { schemeVersion } = row;
      this.isDetailTypeName = schemeVersion;
      this.isDetailLoading = true;
      const { softList, hardList, projectList } = await this.getChipType(
        schemeVersion
      );
      // 软件
      this.detailData.softwareType = this.handleTransType(
        this.softwareType,
        softList
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
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const { softwareType, hardType, epcType } = this.form;
          if (
            this.Is_Empty(softwareType) ||
            this.Is_Empty(hardType) ||
            this.Is_Empty(epcType)
          ) {
            return this.msgError("软/硬/工属性每项至少选择一个");
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
