<template>
  <div class="app-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span class="text-blue font20">{{ commonObj && commonObj.title }}</span>
      </div>
      <el-form
        ref="form"
        label-position="left"
        :model="form"
        :rules="rules"
        label-width="90px"
        class="test_box"
      >
        <el-tabs
          type="border-card"
          v-model="form.type"
          @tab-click="handleClick"
        >
          <el-tab-pane
            label="送样需求"
            name="0"
            v-if="
              (this.testData.id && this.form.type === '0') || !this.testData.id
            "
          >
            <el-container class="test_left_box flex">
              <el-aside
                class="test_aside_box flex-sub bg-white reset_pad_mar solid-right"
              >
                <el-descriptions
                  title="送样信息"
                  direction="vertical"
                  :column="4"
                  border
                >
                  <template slot="extra">
                    <el-button size="mini" type="primary" @click="onSampleData">
                      {{ sampleSingleData.id ? "修改" : "选择" }}送样需求
                    </el-button>
                  </template>
                  <el-descriptions-item label="产品型号">
                    <el-tag
                      class="margin-right-xs"
                      v-for="(item, index) in modelList(
                        sampleSingleData.baseModel
                      )"
                      :key="index"
                    >
                      {{ item }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="客户名称">
                    {{ sampleSingleData.customerName }}
                  </el-descriptions-item>
                  <el-descriptions-item label="软件版本">
                    {{ sampleSingleData.softVersion }}
                  </el-descriptions-item>
                  <el-descriptions-item label="硬件版本">
                    {{ sampleSingleData.hardVersion }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-aside>
              <el-main class="flex-sub reset_pad_mar">
                <CareList
                  ref="careListRef1"
                  :multipleSelection.sync="form.list"
                  :sammpleId="sammpleId"
                />
              </el-main>
            </el-container>
          </el-tab-pane>
          <el-tab-pane
            label="新增需求"
            name="1"
            v-if="
              (this.testData.id && this.form.type === '1') || !this.testData.id
            "
          >
            <el-container class="test_left_box flex">
              <el-aside
                class="test_aside_box flex-sub bg-white reset_pad_mar solid-right"
              >
                <el-form-item label="客户" prop="customerName">
                  <el-input
                    v-model.trim="form.customerName"
                    clearable
                    placeholder="请输入客户"
                  />
                </el-form-item>
                <el-form-item label="产品品类" prop="categoryName">
                  <el-input
                    v-model.trim="form.categoryName"
                    clearable
                    placeholder="请输入产品品类"
                  />
                </el-form-item>
                <el-form-item label="产品型号" prop="computerName">
                  <el-input
                    v-model.trim="form.computerName"
                    clearable
                    placeholder="请输入产品型号"
                  />
                </el-form-item>
                <el-form-item label="软件版本" prop="softVersion">
                  <el-input
                    v-model.trim="form.softVersion"
                    clearable
                    placeholder="请输入软件版本"
                  />
                </el-form-item>
                <el-form-item label="硬件版本" prop="hardVersion">
                  <el-input
                    v-model.trim="form.hardVersion"
                    clearable
                    placeholder="请输入硬件版本"
                  />
                </el-form-item>
                <el-form-item label="需求总表" prop="needInfo">
                  <DrUpload
                    class="flex flex-direction"
                    v-model="form.needInfo"
                    :limit="1"
                    :isOnePic="1"
                  >
                    <div class="text-left">
                      <el-button size="mini" type="primary">
                        附件上传
                      </el-button>
                    </div>
                  </DrUpload>
                </el-form-item>
              </el-aside>
              <el-main class="flex-sub reset_pad_mar">
                <CareList
                  ref="careListRef2"
                  :multipleSelection.sync="form.list"
                  :sammpleId="sammpleId"
                />
              </el-main>
            </el-container>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div class="text-center margin-top-lg">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="$router.push('/TestManage/productTest')">
          取 消
        </el-button>
      </div>
    </el-card>

    <!-- 送样 -->
    <el-drawer
      title="送样需求列表"
      size="60%"
      custom-class="elDrawer_box"
      :wrapperClosable="false"
      :show-close="false"
      :visible.sync="isDrawer"
      :close-on-press-escape="false"
    >
      <el-table
        ref="sampleTableRef"
        v-loading="isSampleLoading"
        :data="sampleDataList"
        height="calc(100vh - 250px)"
        @select="handleSelection"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          label="客户"
          prop="customerName"
          align="center"
          width="120px"
        />
        <el-table-column label="产品型号" align="center" width="120px">
          <template slot-scope="{ row }">
            <div class="flex flex-direction align-center">
              <el-tag
                class="model_item"
                v-for="(item, index) in modelList(row.baseModel)"
                :key="index"
              >
                {{ item }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="数量"
          prop="sendNum"
          align="center"
          width="100px"
        />
        <el-table-column
          label="软件版本号"
          prop="appVersion"
          align="center"
          width="100px"
        />
        <el-table-column
          label="硬件版本号"
          prop="harkVersion"
          align="center"
          width="100px"
        />
        <el-table-column
          label="UI版本号"
          prop="uiVersion"
          align="center"
          width="100px"
        />
        <el-table-column label="详细需求" prop="demand" align="center">
          <template slot-scope="scope">
            <div class="text-left" v-html="scope.row.demand"></div>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="sampleTotal > 0"
        :total="sampleTotal"
        :page.sync="sampleQueryParams.p"
        :limit.sync="sampleQueryParams.l"
        @pagination="getSampleList"
      />

      <div class="dialog-footer text-center margin-top-lg">
        <el-button type="primary" @click="submitSample">确 定</el-button>
        <el-button @click="handleCloseDrawer">取 消</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  getOrderProcess,
} from "@/api/order";
import { sampleList } from "@/api/third/sample";
import { taskSave, taskUpdate, taskInfo } from "@/api/third/testApi";

import { categoryComputerDict } from "@/api/third/fileConfig";
import commomFile from "../mixins";

export default {
  mixins: [commomFile],
  props: ["commonObj"],
  components: {
    CareList: () => import("./caseList/index.vue"),
    tinymce: () => import("@/views/components/Editor"),
  },
  data() {
    return {
      isDrawer: false,
      isCateLoading: false,
      // 品类
      dictList: [],
      // 型号
      computerOptions: [],
      // 芯片版本
      chipVersionList: [],
      form: {
        demandId: "",
        list: [],
      },
      cloneForm: {},
      sammpleId: "",
      isSampleLoading: false,
      sampleTotal: 0,
      // 送样列表
      sampleDataList: [],
      sampleSingleData: {},
      // 选中项
      multipleSelection: {},
      sampleQueryParams: {
        p: 1,
        l: 10,
      },

      testData: {},

      // 表单校验
      rules: {
        customerName: [
          { required: false, message: "请选择客户名称", trigger: "blur" },
        ],
        categoryName: [
          { required: false, message: "请输入产品品类", trigger: "blur" },
        ],
        computerName: [
          { required: false, message: "请输入产品型号", trigger: "blur" },
        ],
        softVersion: [
          { required: false, message: "请输入软件版本", trigger: "blur" },
        ],
        hardVersion: [
          { required: false, message: "请输入硬件版本", trigger: "blur" },
        ],
        needInfo: [
          { required: false, message: "请上传需求总表", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    btnClassObject() {
      return {
        flex: !this.form.demandId,
        "justify-center": !this.form.demandId,
        "align-center": !this.form.demandId,
      };
    },
    modelList() {
      return (baseModel) => {
        return baseModel && baseModel.split(",");
      };
    },
    isSampleTab() {
      if (this.testData.id && this.form.type === "0") {
        return true;
      }
      if (!this.testData.id) {
        return true;
      }
    },
    isAddTab() {
      if (this.testData.id && this.form.type === "1") {
        return true;
      }
      if (!this.testData.id) {
        return true;
      }
    },
  },
  watch: {
    "form.needInfo"(needInfo) {
      if (needInfo) {
        this.clearValidateItem("form", "needInfo");
      }
    },
    "form.type"(type) {
      if (type === "1") {
        this.rules.customerName[0].required = true;
        this.rules.categoryName[0].required = true;
        this.rules.computerName[0].required = true;
        this.rules.customerName[0].required = true;
        this.rules.softVersion[0].required = true;
        this.rules.hardVersion[0].required = true;
        this.rules.needInfo[0].required = true;
      } else {
        this.rules.customerName[0].required = false;
        this.rules.categoryName[0].required = false;
        this.rules.computerName[0].required = false;
        this.rules.customerName[0].required = false;
        this.rules.softVersion[0].required = false;
        this.rules.hardVersion[0].required = false;
        this.rules.needInfo[0].required = false;
      }
    },
  },
  async created() {
    const { id } = this.$route.query;
    this.sammpleId = id;
    if (id) {
      this.testData = await this.getTaskInfo(id);
      if (this.testData.type === 0) {
        const {
          demandId,
          computerName,
          customerName,
          softVersion,
          hardVersion,
        } = this.testData;
        this.sampleSingleData = {
          id: demandId,
          baseModel: computerName,
          customerName,
          softVersion,
          hardVersion,
        };
        this.$refs.careListRef1.getList();
        this.form = Object.assign({}, this.testData);
      } else {
        this.$refs.careListRef2.getList();
        this.form = Object.assign({}, this.testData);
      }
      this.form.type = String(this.testData.type);
    }

    this.getCategoryComputerDict();
    this.getOrderProcessData();
  },

  methods: {
    onSampleData() {
      this.isDrawer = true;
      this.getSampleList();
    },
    getTaskInfo(id) {
      return new Promise((resolve, reject) => {
        taskInfo(id).then((res) => {
          resolve(res.data);
        });
      });
    },
    // 送样列表
    getSampleList() {
      this.isSampleLoading = true;
      sampleList(this.sampleQueryParams).then((res) => {
        const { list, total } = res.data;
        this.sampleDataList = list.filter((item) => item.state !== 6);
        this.sampleTotal = total;
        this.isSampleLoading = false;

        if (this.sampleSingleData.id) {
          const item = this.sampleDataList.filter(
            (item) => item.id === this.sampleSingleData.id
          );
          this.$nextTick(() => {
            this.$refs.sampleTableRef.toggleRowSelection(item[0]);
          });
        }
      });
    },

    // 选择送样项
    submitSample() {
      if (!this.multipleSelection.id) {
        return this.msgError("请先选择一项");
      } else {
        const { appVersion, harkVersion } = this.multipleSelection;
        this.sampleSingleData = Object.assign(
          { softVersion: appVersion, hardVersion: harkVersion },
          this.multipleSelection
        );
        this.isDrawer = false;
      }
    },

    handleCloseDrawer() {
      this.$confirm("确认关闭？")
        .then((_) => {
          this.isDrawer = false;
        })
        .catch((_) => {});
    },

    handleSelection(selection, row) {
      if (selection.length > 1) {
        const del_row = selection.shift();
        this.$refs.sampleTableRef.toggleRowSelection(del_row, false);
      }
      this.multipleSelection = row;
    },

    // 切换清空
    handleClick() {
      this.form.list = [];
    },
    // 品类
    getCategoryComputerDict() {
      this.isCateLoading = true;
      categoryComputerDict()
        .then((res) => {
          this.dictList = res.data;

          this.computerOptions = this.dictList.filter(
            (item) => item.id === this.form.categoryId
          )[0].computerList;

          this.isCateLoading = false;
        })
        .catch(() => {
          this.isCateLoading = false;
        });
    },
    // 芯片版本
    getOrderProcessData() {
      getOrderProcess({ dictType: "scheme_version" }).then((res) => {
        this.chipVersionList = res.data;
      });
    },
    getCustomerId(customerId) {
      this.form.customerId = customerId;
    },
    // 表单重置
    reset() {
      this.form = {
        list: [],
      };
      this.resetForm("form");
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (!this.form.list.length) {
            return this.msgError("请选择用例库");
          }
          if (this.form.id) {
            if (this.form.type === "0") {
              const { baseModel, customerName, softVersion, hardVersion, id } =
                this.sampleSingleData;
              this.form = {
                ...this.form,
                computerName: baseModel,
                customerName,
                softVersion,
                hardVersion,
                demandId: id,
              };
            }
            taskUpdate(this.form).then((res) => {
              if (res.code === 200) {
                this.msgSuccess("更新成功");
                this.$router.push("/TestManage/productTest");
              }
            });
          } else {
            if (this.form.type === "0") {
              if (!this.sampleSingleData.id) {
                return this.msgError("请选择送样任务");
              }
              const { baseModel, customerName, softVersion, hardVersion } =
                this.sampleSingleData;
              this.form = {
                computerName: baseModel,
                customerName,
                softVersion,
                hardVersion,
                demandId: this.sampleSingleData.id,
                type: 0,
                list: this.form.list,
              };
            }
            taskSave(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("添加成功");
                this.$router.push("/TestManage/productTest");
              }
            });
          }
        }
      });
    },
  },
};
</script>

<style lang="scss">
.orderReason_style {
  .el-message-box__title {
    padding-right: 15px;
    line-height: 20px;
  }
}
</style>

<style lang="scss" scoped>
.el_divider_line {
  height: inherit;
}
.test_box {
  .test_left_box {
    min-height: calc(100vh - 400px);
    width: 100%;
  }
  .reset_pad_mar {
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 0;
    margin-bottom: 0;
  }
}
</style>
