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
        <el-tabs type="border-card" v-model="form.type">
          <el-tab-pane
            label="送样需求"
            name="0"
            :disabled="testData.id && form.type === '1'"
          >
            <el-container class="test_left_box flex">
              <el-aside
                class="test_aside_box flex-sub bg-white reset_pad_mar solid-right"
              >
                <!-- <div :class="btnClassObject"></div> -->
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
                <CareList :multipleSelection.sync="form.list" />
              </el-main>
            </el-container>
          </el-tab-pane>
          <el-tab-pane
            label="新增需求"
            name="1"
            :disabled="testData.id && form.type === '0'"
          >
            <el-row
              type="flex"
              justify="space-between"
              :gutter="20"
              style="min-height: calc(100vh - 400px)"
            >
              <el-col :span="8">
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
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div class="text-center margin-top-lg">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="$router.push('/www/order')">取 消</el-button>
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
  addOrder,
  updateOrder,
  getOrderDetail,
  getOrderProcess,
} from "@/api/order";
import { sampleList } from "@/api/third/sample";
import { taskSave, taskUpdate, taskInfo } from "@/api/third/testApi";

import { computerNameList, categoryComputerDict } from "@/api/third/fileConfig";
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
      }
    },
  },
  async created() {
    const { id } = this.$route.query;
    if (id) {
      this.testData = await this.getTaskInfo(id);

      const {
        demandId,
        type,
        computerName,
        customerName,
        softVersion,
        hardVersion,
        list
      } = this.testData;
      this.form.type = String(type);
      this.form.list = list;
      this.sampleSingleData = {
        id: demandId,
        baseModel: computerName,
        customerName,
        softVersion,
        hardVersion,
      };
    }

    this.getCategoryComputerDict();
    // this.getUpdateDetail();
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
          resolve(res.data)
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
        console.log(this.sampleSingleData);
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
      console.log(2, selection, row);
      this.multipleSelection = row;
    },

    // 详情
    getUpdateDetail() {
      if (this.commonObj.id) {
        getOrderDetail(this.commonObj.id).then((res) => {
          this.form = res.data;
          this.cloneForm = { ...res.data };
        });
      }
    },
    // 品类
    getCategoryComputerDict() {
      this.isCateLoading = true;
      categoryComputerDict()
        .then((res) => {
          this.dictList = res.data;

          // 编辑
          // if (this.form.id) {
          this.computerOptions = this.dictList.filter(
            (item) => item.id === this.form.categoryId
          )[0].computerList;
          // }

          this.isCateLoading = false;
        })
        .catch(() => {
          this.isCateLoading = false;
        });
    },
    // 型号列表
    changeCategory(val) {
      if (!val) return;
      this.$set(this.form, "computerId", "");
      this.computerOptions = this.dictList.filter(
        (item) => item.id === val
      )[0].computerList;
    },
    getComputerNameList(name) {
      if (name) {
        computerNameList({
          name,
          categoryId: this.form.categoryId,
        }).then((res) => {
          this.computerOptions = res.data;
        });
      } else {
        this.computerOptions = [];
      }
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
    checkRule(params) {
      const { categoryId, computerId, chipVersion } = params;
      if (
        this.cloneForm.categoryId !== categoryId ||
        this.cloneForm.computerId !== computerId ||
        this.cloneForm.chipVersion !== chipVersion
      ) {
        return true;
      } else {
        return false;
      }
    },
    onAlertReason(params) {
      const {
        salesOrderNo,
        customerName,
        customerOrderNo,
        categoryId,
        computerId,
        chipVersion,
        bomCode,
        orderQuantity,
        sellTime,
        arrivalTime,
        consigneeAddress,
        isMark,
        containerMarkInfo,
        bomInfo,
        remark,
      } = params;
      if (
        this.cloneForm.salesOrderNo !== salesOrderNo ||
        this.cloneForm.customerName !== customerName ||
        this.cloneForm.customerOrderNo !== customerOrderNo ||
        this.cloneForm.categoryId !== categoryId ||
        this.cloneForm.computerId !== computerId ||
        this.cloneForm.chipVersion !== chipVersion ||
        this.cloneForm.bomCode !== bomCode ||
        this.cloneForm.orderQuantity !== orderQuantity ||
        this.cloneForm.sellTime !== sellTime ||
        this.cloneForm.arrivalTime !== arrivalTime ||
        this.cloneForm.consigneeAddress !== consigneeAddress ||
        this.cloneForm.isMark !== isMark ||
        this.cloneForm.containerMarkInfo !== containerMarkInfo ||
        this.cloneForm.bomInfo !== bomInfo ||
        this.cloneForm.remark !== remark
      ) {
        return true;
      } else {
        return false;
      }
    },
    onUpdateOrder(params) {
      updateOrder(params).then((res) => {
        if (res.code === 200) {
          this.msgSuccess("更新成功");
          this.$router.push("/www/order");
        }
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id) {
            // if (this.onAlertReason(this.form)) {
            //   this.$prompt(
            //     "请输入修改原因",
            //     `${
            //       this.checkRule(this.form)
            //         ? "若“品类”、“型号”、“芯片版本”改变，该排产将被取消?"
            //         : ""
            //     }`,
            //     {
            //       confirmButtonText: "确定",
            //       cancelButtonText: "取消",
            //       type: "warning",
            //       inputValidator: (value) => {
            //         if (value === null || value === "") {
            //           return false;
            //         }
            //       },
            //       inputErrorMessage: "修改原因不能为空",
            //       customClass: "orderReason_style",
            //     }
            //   )
            //     .then(({ value }) => {
            //       this.onUpdateOrder({ msg: value, ...this.form });
            //     })
            //     .catch(() => {});
            // } else {
            //   this.onUpdateOrder(this.form);
            // }
          } else {
            console.log(this.form.type);
            if (this.form.type === "0") {
              if (!this.sampleSingleData.id) {
                return this.msgError("请选择送样任务");
              }
            }
            if (!this.form.list.length) {
              return this.msgError("请选择用例库");
            }
            const { baseModel, customerName, softVersion, hardVersion } =
              this.sampleSingleData;
            this.form = {
              baseModel,
              customerName,
              softVersion,
              hardVersion,
              demandId: this.sampleSingleData.id,
              type: 0,
              list: this.form.list,
            };
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
