<!--
 * @Author: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @Date: 2023-09-18 20:05:34
 * @LastEditors: chao.wu@riding-evolved.com chao.wu@riding-evolved.com
 * @LastEditTime: 2024-01-03 11:43:47
 * @FilePath: \FILECONF-UI\src\views\third\afterSale\components\addSale.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <!-- 添加售后 -->
  <el-dialog
    class="after-sale-box"
    :title="isTitle"
    :visible="visible"
    width="1250px"
    append-to-body
    center
    top="2vh"
    :close-on-click-modal="false"
    @close="close"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <h3>售后基本信息</h3>
      <el-row type="flex" justify="space-around">
        <el-col :span="11">
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
            <el-col>
              <el-form-item label="客退方" prop="returnParty">
                <el-input
                  v-model="form.returnParty"
                  clearable
                  style="width: 100%"
                  placeholder="请输入客退方"
                />
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="客退人" prop="returnName">
                <el-input
                  v-model="form.returnName"
                  clearable
                  style="width: 100%"
                  placeholder="请输入客退人"
                />
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="客退清单" prop="inventory">
                <el-select
                  v-model="form.inventory"
                  filterable
                  multiple
                  allow-create
                  clearable
                  style="width: 100%"
                  placeholder="请选择客退清单"
                >
                  <el-option
                    v-for="item in returnList"
                    :key="item.dictCode"
                    :label="item.dictLabel"
                    :value="item.dictLabel"
                  />
                </el-select>
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
          </el-row>
        </el-col>
        <el-col :span="11">
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
            <el-col>
              <el-form-item label="是否到付件" prop="isFreight">
                <el-select
                  v-model="form.isFreight"
                  placeholder="请选择是否到付件"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="是" :value="0" />
                  <el-option label="否" :value="1" />
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
            <!-- <el-col v-if="isStatus">
              <el-form-item label="关闭问题" prop="status">
                <el-switch
                  v-model="form.status"
                  active-color="#409EFF"
                  inactive-color="#DCDFE6"
                  :active-value="0"
                  :inactive-value="1"
                >
                </el-switch>
              </el-form-item>
            </el-col> -->
          </el-row>
        </el-col>
      </el-row>
      <div class="flex align-center justify-between">
        <h3>{{ form.id ? "修改" : "添加"  }}仪表</h3>
        <el-button
          style="margin-right: 25px"
          v-if="form.list && form.list.length < 300 && !form.id"
          type="primary"
          icon="el-icon-plus"
          circle
          @click="onAddSaleItem"
        />
      </div>

      <div class="sale-list-box">
        <el-row
          type="flex"
          justify="space-between"
          :gutter="10"
          v-for="(item, index) in form.list"
          :key="index"
        >
          <el-col :span="22">
            <el-row type="flex">
              <el-col :span="8">
                <el-form-item
                  label="品类"
                  :prop="`list[${index}].categoryId`"
                  :rules="rules.categoryId"
                >
                  <el-select
                    v-model="item.categoryId"
                    filterable
                    allow-create
                    clearable
                    style="width: 100%"
                    placeholder="请选择品类"
                    @change="onChangeCategory(index)"
                  >
                    <el-option
                      v-for="dict in dictList"
                      :key="dict.id"
                      :label="dict.name"
                      :value="dict.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  label="仪表型号"
                  :prop="`list[${index}].computerId`"
                  :rules="rules.computerId"
                >
                  <el-select
                    v-model="item.computerId"
                    :loading="isCLoading"
                    @focus="changeCategory(index)"
                    filterable
                    remote
                    clearable
                    style="width: 100%"
                    placeholder="请选择仪表型号"
                    :remote-method="getComputerNameList"
                  >
                    <el-option
                      v-for="dict in computerOptions"
                      :key="dict.model"
                      :label="dict.name"
                      :value="dict.model"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  label="产品SN"
                  :prop="`list[${index}].sn`"
                  :rules="rules.sn"
                >
                  <el-input
                    v-model="item.sn"
                    clearable
                    placeholder="请输入产品SN"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="2">
            <el-button
              v-if="index !== 0"
              type="danger"
              icon="el-icon-minus"
              circle
              style="height: 28px"
              @click="removeSaleItem(item)"
            />
          </el-col>
        </el-row>
      </div>

      <el-card
        style="padding-top: 30px; margin: 0 30px 10px"
        class="step-wrap"
        shadow="never"
      >
        <el-steps :active="active" align-center finish-status="success">
          <el-step>
            <template slot="title">
              <div class="title-top">处理类型</div>
            </template>
            <template slot="description">
              <div :class="isActiveClass(1)" @click.stop="stateChange(1)"></div>
              <el-form-item label="" prop="handlerType" label-width="0">
                <el-select
                  v-model="form.handlerType"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                  :disabled="isNoSelect"
                >
                  <el-option
                    v-for="(item, index) in roleList('sale')"
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
              <div class="title-top">现象复测</div>
            </template>
            <template slot="description">
              <div :class="isActiveClass(2)" @click.stop="stateChange(2)"></div>
              <el-form-item label="" prop="retester" label-width="0">
                <el-select
                  v-model="form.retester"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                  :disabled="isNoSelect"
                >
                  <el-option
                    v-for="(item, p) in roleList('afterSale')"
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
              <div class="title-top">分类处理</div>
            </template>
            <template slot="description">
              <div :class="isActiveClass(3)" @click.stop="stateChange(3)" />
              <el-form-item label="" prop="classifiedBy" label-width="0">
                <el-select
                  v-model="form.classifiedBy"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                  :disabled="isNoSelect"
                >
                  <el-option
                    v-for="(item, p) in roleList('afterSale')"
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
              <div :class="isActiveClass(4)" @click.stop="stateChange(4)"></div>
              <el-form-item label="" prop="handlerBy" label-width="0">
                <el-select
                  v-model="form.handlerBy"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                  :disabled="isNoSelect"
                >
                  <el-option
                    v-for="(item, index) in roleList('afterSale')"
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
              <div :class="isActiveClass(5)" @click.stop="stateChange(5)"></div>
              <el-form-item label="" prop="serviceBy" label-width="0">
                <el-select
                  v-model="form.serviceBy"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                  :disabled="isNoSelect"
                >
                  <el-option
                    v-for="(item, p) in roleList('afterSale')"
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
              <div class="title-top">返厂处理</div>
            </template>
            <template slot="description">
              <div :class="isActiveClass(6)" @click.stop="stateChange(6)"></div>
              <el-form-item label="" prop="warehousing" label-width="0">
                <el-select
                  v-model="form.warehousing"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                  :disabled="isNoSelect"
                >
                  <el-option
                    v-for="(item, p) in roleList('pmc')"
                    :key="p"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  >
                  </el-option>
                  <el-option label="无" value="-1"></el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-step>
          <el-step>
            <template slot="title">
              <div class="title-top">完成</div>
            </template>
            <template slot="description">
              <div :class="isActiveClass(7)" @click.stop="stateChange(7)"></div>
            </template>
          </el-step>
        </el-steps>
      </el-card>

      <el-form-item label="不良图片" prop="file" style="width: 100%">
        <el-upload-sortable
          v-model="form.file"
          :action="actionUrl"
          :imgW="98"
          :imgH="98"
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
        <el-row>
          <el-col :span="8">
            <el-form-item label="返回日期" prop="logisticsEntity.returnDate">
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
            <el-form-item label="寄件单号" prop="logisticsEntity.mailingNumber">
              <el-input
                v-model="form.logisticsEntity.mailingNumber"
                clearable
                style="width: 100%"
                placeholder="请输入寄件单号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="寄件部门"
              prop="logisticsEntity.mailingDepartment"
            >
              <el-input
                v-model="form.logisticsEntity.mailingDepartment"
                clearable
                style="width: 100%"
                placeholder="请输入寄件部门"
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
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="isSubLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>
  

<script>
import { saleSave, saleUpdate } from "@/api/third/sale";
import { getCustomerList } from "@/api/order";
import { computerNameList } from "@/api/third/fileConfig";
import { listCustomer } from "@/api/third/sample";
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
      actionUrl: reqUrl + "/oss/batch-upload",
      active: -1,
      isState: -1,
      showName: "",
      isReset: false,
      // 提交loading
      isSubLoading: false,
      computerIdIndex: "",
      // 表单参数
      form: {
        inventory: [],
        logisticsEntity: {},
        list: [
          {
            categoryId: "",
            computerId: "",
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
        returnParty: [
          { required: true, message: "请输入客退方", trigger: "blur" },
        ],
        returnName: [
          { required: true, message: "请输入客退方", trigger: "blur" },
        ],
        logisticsNo: [
          { required: true, message: "请输入客退物流单号", trigger: "blur" },
        ],
        isFreight: [
          { required: true, message: "请选择是否到付件", trigger: "change" },
        ],
        inventory: [
          {
            type: "array",
            required: true,
            message: "请选择客退清单",
            trigger: ["change", "blur"],
          },
        ],
        categoryId: [
          { required: true, message: "请选择品类", trigger: "change" },
        ],
        computerId: [
          { required: true, message: "请选择仪表型号", trigger: "change" },
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
      return this.form.id ? "编辑售后" : "添加售后";
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
        // 回显仪表型号
        this.changeCategory(0);
      } else {
        this.reset();
      }
    },
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
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
      const { id } = JSON.parse(info);
      this.form.customerId = id;
    },
    onChangeCategory(index) {
      this.form.list[index].computerId = "";
    },
    changeCategory(index) {
      const categoryId = this.form.list[index].categoryId;
      this.computerIdIndex = index;
      if (categoryId) {
        const data = this.categoryList.filter((item) => item.id === categoryId);
        this.computerOptions = data[0].computerList;
      } else {
        this.computerOptions = [];
      }
    },
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = true;
        computerNameList({
          name,
          categoryId: this.form.list[this.computerIdIndex].categoryId,
        })
          .then((res) => {
            this.computerOptions = res.data;
            this.isCLoading = false;
          })
          .catch(() => {
            this.isCLoading = false;
          });
      } else {
        this.computerOptions = [];
      }
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
        // inventory: [],
        list: [
          {
            categoryId: "",
            computerId: "",
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
        computerId: "",
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
      console.log(data, state, this.checkRole(["sale"]))
      if (!this.checkRole(["sale"]) || data >= state) {
        return;
      }

      this.isState = data > this.active ? data + 1 : data;

      data = data <= this.active ? data - 1 : 7;
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

            // 返厂入库为无的情况
            if(currentData.warehousing === '-1' && currentData.state === 6) {
              currentData.state = 7;
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
  .el-dialog__body {
    max-height: 90vh;
    overflow: hidden;
    overflow-y: auto;
  }

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

  .sale-list-box {
    max-height: 500px;
    margin-bottom: 20px;
    overflow: hidden;
    overflow-y: auto;
  }
}
</style>
  
  