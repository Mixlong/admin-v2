<template>
  <!-- 添加售后 -->
  <el-dialog
    class="after-sale-box fixed_bottom_dialog"
    :title="isTitle"
    :visible="visible"
    width="1250px"
    append-to-body
    center
    top="2vh"
    fullscreen
    :close-on-click-modal="false"
    @close="close"
  >
    <el-row :gutter="10" type="flex">
      <el-col :span="3"></el-col>
      <el-col :span="18">
        <el-form ref="form" :model="form" :rules="rules" label-position="top">
          <el-form-item label="售后基本信息">
            <el-row type="flex" justify="space-around" :gutter="10">
              <el-col :span="12">
                <el-row>
                  <el-col>
                    <el-form-item label="客诉日期" prop="returnDate">
                      <el-date-picker
                        v-model="form.returnDate"
                        clearable
                        type="date"
                        style="width: 100%"
                        :picker-options="returnDatePickerOptions"
                        placeholder="请选择客诉日期"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col>
                    <el-form-item label="客户名称" prop="customerName">
                      <select-loadMore
                        v-model="form.customerName"
                        style="width: 100%"
                        :data="customerNameData.data"
                        :page="customerNameData.page"
                        :hasMore="customerNameData.more"
                        dictLabel="name"
                        :moreParams="true"
                        :request="getCustomerNameList"
                        @getChange="getCustomerNameId"
                        placeholder="请选择客户名称"
                      >
                      </select-loadMore>
                    </el-form-item>
                  </el-col>
                  <el-col v-if="isUpdateId">
                    <el-form-item label="问题根因" prop="rootMatter">
                      <el-input
                        v-model="form.rootMatter"
                        clearable
                        :disabled="form.status === 1"
                        placeholder="请输入问题根因"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col>
                    <el-form-item label="客退物流单号" prop="logisticsNo">
                      <el-input
                        v-model="form.logisticsNo"
                        clearable
                        style="width: 100%"
                        placeholder="请输入客退物流单号"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-col>

              <el-col :span="12">
                <el-row>
                  <el-col>
                    <el-form-item label="迪太接收人" prop="receiveName">
                      <el-input
                        v-model="form.receiveName"
                        clearable
                        placeholder="请输入迪太接收人"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col>
                    <el-form-item label="客诉现象" prop="result">
                      <el-input
                        v-model="form.result"
                        clearable
                        placeholder="请输入客诉现象"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col>
                    <el-form-item label="仪表去向" prop="direction">
                      <el-select
                        v-model="form.direction"
                        filterable
                        allow-create
                        clearable
                        style="width: 100%"
                        placeholder="请选择仪表去向"
                      >
                        <el-option
                          v-for="dict in modelDirList"
                          :key="dict.dictCode"
                          :label="dict.dictLabel"
                          :value="dict.dictValue"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col v-if="isUpdateId">
                    <el-form-item label="根因分类" prop="rootMatterType">
                      <el-select
                        v-model="form.rootMatterType"
                        filterable
                        allow-create
                        clearable
                        style="width: 100%"
                        placeholder="请选择根因分类"
                      >
                        <el-option
                          v-for="dict in rootClassify"
                          :key="dict.dictCode"
                          :label="dict.dictLabel"
                          :value="+dict.dictValue"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item :label="form.id ? '修改仪表' : '添加仪表'">
            <el-table
              :data="form.list"
              style="width: 100%"
              border
              max-height="450"
            >
              <el-table-column prop="categoryId" label="品类">
                <el-form-item
                  slot-scope="scope"
                  :prop="`list[${scope.$index}].categoryId`"
                  :rules="rules.categoryId"
                >
                  <el-select
                    v-model="scope.row.categoryId"
                    filterable
                    allow-create
                    clearable
                    style="width: 100%"
                    placeholder="请选择"
                    @change="handleCategoryName(scope)"
                  >
                    <el-option
                      v-for="dict in dictList"
                      :key="dict.id"
                      :label="dict.name"
                      :value="dict.id"
                    />
                  </el-select>
                </el-form-item>
              </el-table-column>
              <el-table-column prop="sampleName" label="送样单号">
                <el-form-item
                  :rules="rules.sampleName"
                  :prop="`list[${scope.$index}].sampleName`"
                  slot-scope="scope"
                >
                  <select-loadMore
                    v-model="scope.row.sampleName"
                    style="width: 100%"
                    :data="sampleData.data"
                    :page="sampleData.page"
                    :hasMore="sampleData.more"
                    dictLabel="number"
                    :moreParams="true"
                    :request="getSampleList"
                    @getChange="getSampleName"
                    @handleFocus="handleFocus(scope.$index)"
                    v-slot="{ proOption }"
                    placeholder="请选择"
                  >
                    <template>
                      <span style="float: left">
                        客户：{{ proOption.customerName }}
                      </span>
                      <span
                        style="float: right; color: #8492a6; font-size: 13px"
                      >
                        单号：{{ proOption.number }}
                      </span>
                    </template>
                  </select-loadMore>
                </el-form-item>
              </el-table-column>
              <el-table-column prop="sn" label="产品SN">
                <el-form-item
                  slot-scope="scope"
                  :prop="`list[${scope.$index}].sn`"
                  :rules="rules.sn"
                >
                  <el-input
                    v-model.trim="scope.row.sn"
                    clearable
                    placeholder="请输入"
                  />
                </el-form-item>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template slot-scope="scope">
                  <el-button
                    type="danger"
                    size="mini"
                    plain
                    icon="el-icon-minus"
                    @click="removeSaleItem(scope.row)"
                  >
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button
              style="width: 100%; border-style: dashed"
              icon="el-icon-plus"
              plain
              size="mini"
              @click="onAddSaleItem"
            />
          </el-form-item>

          <el-card
            style="padding-top: 30px; margin: 30px 0"
            class="step-wrap"
            shadow="never"
          >
            <el-steps :active="active" align-center finish-status="success">
              <el-step>
                <template slot="title">
                  <div class="title-top">现象复测</div>
                </template>
                <template slot="description">
                  <div
                    :class="isActiveClass(1)"
                    @click.stop="stateChange(1)"
                  ></div>
                  <el-form-item label="" prop="retester" label-width="0">
                    <el-select
                      v-model="form.retester"
                      placeholder="请选择"
                      clearable
                      style="width: 100%"
                      :disabled="isNoSelect"
                    >
                      <el-option
                        v-for="(item, p) in roleList('Sample_Sale')"
                        :key="p"
                        :label="item.dictLabel"
                        :value="item.dictValue"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                </template>
              </el-step>
              <el-step>
                <template slot="title">
                  <div class="title-top">问题处理</div>
                </template>
                <template slot="description">
                  <div
                    :class="isActiveClass(2)"
                    @click.stop="stateChange(2)"
                  ></div>
                  <el-form-item label="" prop="handlerBy" label-width="0">
                    <el-select
                      v-model="form.handlerBy"
                      placeholder="请选择"
                      clearable
                      style="width: 100%"
                      :disabled="isNoSelect"
                    >
                      <el-option
                        v-for="(item, index) in roleList('Sample_Sale')"
                        :key="index"
                        :label="item.dictLabel"
                        :value="item.dictValue"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                </template>
              </el-step>
              <el-step>
                <template slot="title">
                  <div class="title-top">维修处理</div>
                </template>
                <template slot="description">
                  <div
                    :class="isActiveClass(3)"
                    @click.stop="stateChange(3)"
                  ></div>
                  <el-form-item label="" prop="serviceBy" label-width="0">
                    <el-select
                      v-model="form.serviceBy"
                      placeholder="请选择"
                      clearable
                      style="width: 100%"
                      :disabled="isNoSelect"
                    >
                      <el-option
                        v-for="(item, p) in roleList('Sample_Sale')"
                        :key="p"
                        :label="item.dictLabel"
                        :value="item.dictValue"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                </template>
              </el-step>
              <el-step>
                <template slot="title">
                  <div class="title-top">完成</div>
                </template>
                <template slot="description">
                  <div
                    :class="isActiveClass(4)"
                    @click.stop="stateChange(4)"
                  ></div>
                </template>
              </el-step>
            </el-steps>
          </el-card>

          <el-form-item label="不良图片" prop="file" style="width: 100%">
            <el-upload-sortable
              v-model="form.file"
              :action="actionUrl"
              :imgW="80"
              :imgH="80"
              :multiple="true"
            />
          </el-form-item>
          <el-form-item label="不良视频" prop="video" style="width: 100%">
            <el-upload-sortable
              v-model="form.video"
              :action="actionUrl"
              :isVideo="true"
              accept="video/mp4"
              :imgW="150"
              :imgH="98"
            />
          </el-form-item>
          <el-form-item label="上传8D报告" prop="report" v-if="isUpdateId">
            <DrUpload v-model="form.report" :limit="1" :isOnePic="1">
              <div class="text-left">
                <el-button size="small" type="primary">点击上传</el-button>
              </div>
            </DrUpload>
          </el-form-item>
          <template v-if="isUpdateId">
            <h3 class="margin-top-sm">返回客户信息</h3>
            <el-row :gutter="10">
              <el-col :span="8">
                <el-form-item
                  label="返回日期"
                  prop="logisticsEntity.returnDate"
                >
                  <el-date-picker
                    v-model="form.logisticsEntity.returnDate"
                    clearable
                    type="date"
                    style="width: 100%"
                    placeholder="请选择返回日期"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="收件人" prop="logisticsEntity.recipient">
                  <el-input
                    v-model="form.logisticsEntity.recipient"
                    clearable
                    style="width: 100%"
                    placeholder="请输入收件人"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  label="寄件单号"
                  prop="logisticsEntity.mailingNumber"
                >
                  <el-input
                    v-model="form.logisticsEntity.mailingNumber"
                    clearable
                    style="width: 100%"
                    placeholder="请输入寄件单号"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="联系电话" prop="logisticsEntity.phone">
                  <el-input
                    v-model="form.logisticsEntity.phone"
                    clearable
                    style="width: 100%"
                    placeholder="请输入联系电话"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="物流付款方式" prop="logisticsEntity.isPay">
                  <el-select
                    v-model="form.logisticsEntity.isPay"
                    placeholder="请选择物流付款方式"
                    clearable
                    style="width: 100%"
                  >
                    <el-option label="月结" :value="0" />
                    <el-option label="到付" :value="1" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="寄件人" prop="logisticsEntity.sender">
                  <el-input
                    v-model="form.logisticsEntity.sender"
                    clearable
                    style="width: 100%"
                    placeholder="请输入寄件人"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="收货地址" prop="logisticsEntity.address">
                  <el-input
                    v-model="form.logisticsEntity.address"
                    type="textarea"
                    style="width: 100%"
                    placeholder="请输入收货地址"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </template>
        </el-form>
      </el-col>
      <el-col :span="3"></el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="isSubLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>
  

<script>
import { saleSave, saleUpdate } from "@/api/third/sampleSale";
import { getCustomerList } from "@/api/order";
import { computerNameList } from "@/api/third/fileConfig";
import { listCustomer, sampleList } from "@/api/third/sample";
import tinymce from "@/views/components/Editor";
import globalData from "../mixins/global";
import ElUploadSortable from "@/components/el-upload-sortable";
import reqUrl from "@/utils/requestUrl";

export default {
  components: {
    tinymce,
    ElUploadSortable,
  },
  props: {
    dictList: Array,
    modelDirList: Array,
    pmDictListOptions: Array,
    rootClassify: Array,
    visible: {
      type: Boolean,
      default: false,
    },
  },
  mixins: [globalData],
  data() {
    return {
      currentSampleIndex: null,
      actionUrl: reqUrl + "/oss/batch-upload",
      active: -1,
      isState: -1,
      showName: "",
      isReset: false,
      // 提交loading
      isSubLoading: false,
      // 表单参数
      form: {
        logisticsEntity: {},
        list: [
          {
            categoryId: "",
            sampleId: "",
            sn: "",
          },
        ],
      },
      // 客户数据
      customerNameData: {
        data: [],
        page: 1,
        more: true,
      },
      // 送样单号
      sampleData: {
        data: [],
        page: 1,
        more: true,
      },
      dictForm: {},
      isCLoading: false,
      // 仪表型号
      computerOptions: [],
      returnDatePickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
      },
      // 表单校验
      rules: {
        returnDate: [
          { required: true, message: "请选择客诉日期", trigger: "change" },
        ],
        customerName: [
          { required: true, message: "请选择客户名称", trigger: "change" },
        ],
        logisticsNo: [
          { required: true, message: "请输入客退物流单号", trigger: "blur" },
        ],
        sampleName: [
          { required: true, message: "请选择送样单号", trigger: "change" },
        ],
        categoryId: [
          { required: true, message: "请选择品类", trigger: "change" },
        ],
        sn: [{ required: true, message: "请输入产品SN", trigger: "blur" }],
        receiveName: [
          { required: true, message: "请输入迪太接收人", trigger: "blur" },
        ],
        result: [
          { required: true, message: "请输入客诉现象", trigger: "blur" },
        ],
        direction: [
          { required: true, message: "请选择仪表去向", trigger: "change" },
        ],
        retester: [
          { required: true, message: "请选择现象复测人", trigger: "change" },
        ],
        classifiedBy: [
          { required: true, message: "请选择分类处理人", trigger: "change" },
        ],
        handlerBy: [
          { required: true, message: "请选择问题处理人", trigger: "change" },
        ],
        handlerType: [
          { required: true, message: "请选择处理类型人", trigger: "change" },
        ],
        serviceBy: [
          { required: true, message: "请选择维修处理人", trigger: "change" },
        ],
        warehousing: [
          { required: true, message: "请选择返厂处理人", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    categoryList() {
      return this.dictList;
    },
    // 角色
    roleList() {
      return (roleKey) => {
        return this.pmDictListOptions.filter(
          (item) => item.roleKey === roleKey
        );
      };
    },
    isUpdateId() {
      return !!this.form.id;
    },
    isStatus() {
      return this.isUpdateId && !this.Is_Empty(this.form.rootMatter);
    },
    isTitle() {
      return this.form.id ? "编辑样品售后" : "添加样品售后";
    },
    isActiveClass() {
      return (active) => {
        return ["wrap-click", { pointer: this.isPointer(active) }];
      };
    },
    isPointer() {
      const { state, id } = this.form;
      return (active) => {
        return !!id && active < state && this.checkRole(["sale"]);
      };
    },
    isNoSelect() {
      return this.form.id && this.active === 7;
    },
  },
  watch: {
    visible(isShow) {
      if (isShow) {
        this.getReturnList();
      } else {
        this.reset();
      }
    },
  },
  methods: {
    handleCategoryName(scope) {
      const { categoryId } = scope.row;
      const index = scope.$index;

      const categoryName = this.dictList.find(
        (item) => item.id === categoryId
      ).name;

      this.form.list[index].categoryName = categoryName;

      console.log(this.form.list);
    },
    close() {
      this.$emit("update:visible", false);
    },
    /** 送样单号 */
    getSampleList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        sampleList({
          p: page,
          sampleName: keyword
        }).then((res) => {
          let { list, total, pageNum, pageSize } = res.data;

          if (more) {
            this.sampleData.data = [...this.sampleData.data, ...list];
          } else {
            this.sampleData.data = list;
          }
          this.sampleData.more = pageNum * pageSize < total;
          this.sampleData.page = pageNum;
          resolve();
        });
      });
    },
    getSampleName(info) {
      console.log(JSON.parse(info))
      if (!info) {
        this.form.list[this.currentSampleIndex].sampleId = "";
        return;
      }
      const { id, number } = JSON.parse(info);
      this.form.list[this.currentSampleIndex].sampleId = id;
      this.form.list[this.currentSampleIndex].sampleName = number;
    },
    handleFocus(index) {
      this.currentSampleIndex = index;
    },
    /** 客户名称列表 */
    getCustomerNameList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getCustomerList({
          p: page,
          name: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.customerNameData.data = [
              ...this.customerNameData.data,
              ...list,
            ];
          } else {
            this.customerNameData.data = list;
          }
          this.customerNameData.more = pageNum * pageSize < total;
          this.customerNameData.page = pageNum;
          resolve();
        });
      });
    },
    getCustomerNameId(info) {
      if (!info) {
        this.form.customerId = "";
        return;
      }
      const { id, name } = JSON.parse(info);
      this.form.customerName = name;
      this.form.customerId = id;
    },
    querySearchAsync(queryString, cb) {
      listCustomer({ key: queryString || "" }).then((res) => {
        cb(
          res.data.map((item) => {
            return {
              value: item.name,
            };
          })
        );
      });
    },
    // 表单重置
    reset() {
      this.form = {
        direction: '1',
        list: [
          {
            categoryId: "",
            sampleId: "",
            sn: "",
          },
        ],
        logisticsEntity: {},
      };
      this.active = -1;
      this.isState = -1;
      this.resetForm("form");
    },
    onAddSaleItem() {
      this.form.list.push({
        categoryId: "",
        sampleId: "",
        sn: "",
      });
    },
    removeSaleItem(item) {
      const index = this.form.list.indexOf(item);
      if (index !== -1) {
        this.form.list.splice(index, 1);
      }
    },
    stateChange(data) {
      const { state, id } = this.form;
      if (!this.checkRole(["sale"]) || data >= state) {
        return;
      }

      this.isState = data > this.active ? data + 1 : data;

      data = data <= this.active ? data - 1 : 4;
      if (id) {
        this.active = data;
      }
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.isSubLoading = true;
          let params = JSON.parse(JSON.stringify(this.form));
          params.inventory = JSON.stringify(params.inventory);

          if (params.id) {
            const { logisticsEntity, ...dataInfo } = params;
            let currentData = params;
            if (!Object.keys(logisticsEntity).length) {
              currentData = dataInfo;
            }

            if (this.isState !== -1) {
              currentData.state = this.isState;
            }

            saleUpdate(currentData)
              .then(() => {
                this.msgSuccess("修改成功");
                this.$parent.getList();
              })
              .finally(() => {
                this.isSubLoading = false;
                this.close();
              });
          } else {
            saleSave(params)
              .then(() => {
                this.msgSuccess("创建成功");
                this.$parent.getList();
              })
              .finally(() => {
                this.isSubLoading = false;
                this.close();
              });
          }
        }
      });
    },
  },
};
</script>
  
<style lang="scss">
.after-sale-box {
  // .el-dialog__body {
  //   max-height: 90vh;
  //   overflow: hidden;
  //   overflow-y: auto;
  // }

  .step-wrap {
    .title-top {
      position: absolute;
      top: -38px;
      left: 0;
      width: 100%;
      height: 38px;
    }

    .wrap-click {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 24px;
      z-index: 10;
    }

    .el-step__description {
      padding-top: 15px;
    }

    .el-form-item__error {
      min-width: auto;
      white-space: nowrap;
    }
  }
}
</style>
  
  