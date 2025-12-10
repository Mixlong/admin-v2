<template>
  <div >
    <!-- 添加售后 -->
    <el-dialog
      class="dialog-scroll"
      :title="isTitle"
      :visible="visible"
      width="1250px"
      append-to-body
      center
      top="0vh"
      :close-on-click-modal="false"
      @close="close"
    >
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <h3>基本信息</h3>
      <!-- 基本信息表格布局 -->
      <el-row :gutter="20">
        <!-- 第一行：客退日期、客户名称、迪太接收人 -->
        <el-col :span="8">
          <el-form-item label="客退日期" prop="returnDate">
            <el-date-picker
              v-model="form.returnDate"
              clearable
              type="date"
              style="width: 100%"
              value-format="yyyy-MM-dd"
              :picker-options="returnDatePickerOptions"
              placeholder="请选择客退日期"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
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
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="迪太接收人" prop="receiveName">
            <TypedSelectLoadMore
              v-model="form.receiveName"
              type="user"
              :return-label="true"
              placeholder="请选择迪太接收人"
              clearable
              :custom-style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <!-- 第二行：客退类型、客诉现象、客退单号 -->
        <el-col :span="8">
          <el-form-item label="客退类型" prop="afterType">
            <el-select
              v-model="form.afterType"
              clearable
              style="width: 100%"
              placeholder="请选择客退类型"
              @change="handleAfterTypeChange"
            >
              <el-option label="大货" :value="1" />
              <el-option label="样品" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="客诉现象" prop="result">
            <el-input
              v-model="form.result"
              clearable
              placeholder="请输入客诉现象"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="客退单号" prop="logisticsNo">
            <el-input
              v-model="form.logisticsNo"
              clearable
              placeholder="请输入客退单号"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <!-- 第三行：发生阶段、客退清单、是否到付件 -->
        <el-col :span="8">
          <el-form-item label="发生阶段" prop="generatorStage">
            <el-select
              v-model="form.generatorStage"
              clearable
              style="width: 100%"
              placeholder="请选择发生阶段"
            >
              <el-option
                v-for="item in happenStageOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
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
        <el-col :span="8">
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
      </el-row>

      <el-row :gutter="20">
        <!-- 第四行：客退方、客退方信息 -->
        <el-col :span="8">
          <el-form-item label="客退方" prop="returnParty">
            <select-loadMore
              v-model="form.returnParty"
              style="width: 100%"
              :data="returnPartyData.data"
              :page="returnPartyData.page"
              :hasMore="returnPartyData.more"
              dictLabel="name"
              dictValue="name"
              :moreParams="true"
              :request="getReturnPartyList"
              @getChange="getReturnPartyId"
              placeholder="请选择客退方"
            />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="客退方信息" prop="returnAddressInfo">
            <div class="address-selector-wrapper">
              <el-link 
                type="primary" 
                size="small" 
                icon="el-icon-location"
                @click="openReturnAddressDialog"
                :disabled="!form.returnPartyId"
              >
                {{ form.returnAddressInfo ? '重新选择地址' : '选择收货地址' }}
              </el-link>
              <span v-if="!form.returnPartyId" class="address-tip">请先选择客退方</span>
              <div v-if="form.returnAddressInfo" class="selected-address">
                {{ form.returnName }} / {{ form.returnPhone }} - {{ form.returnAddress }}
              </div>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
 
      <div class="flex align-center justify-between">
        <h3>仪表信息</h3>
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
          <el-col :span="2" style="display: flex; gap: 5px;">
            <el-button
              type="success"
              icon="el-icon-document-copy"
              circle
              style="height: 28px"
              @click="copySaleItem(index)"
              v-if="!form.id"
              title="复制此行"
            />
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
       :imgW="80"
          :imgH="80"
        />
      </el-form-item>
      <template v-if="isUpdateId && form.logistics">
        <h3 class="margin-top-sm">返还信息</h3>
        <el-row :gutter="20">
          <!-- 第一行 -->
          <el-col :span="8">
            <el-form-item label="返回日期" prop="logistics.returnDate">
            <el-date-picker
              v-model="form.logistics.returnDate"
              clearable
              type="date"
              style="width: 100%"
              value-format="yyyy-MM-dd"
              placeholder="请选择返回日期"
            />
          </el-form-item>
        </el-col>
          <el-col :span="8">
            <el-form-item label="寄件人" prop="logistics.sender">
              <el-select
                v-model="form.logistics.sender"
                filterable
                clearable
                style="width: 100%"
                placeholder="请选择寄件人"
              >
                <el-option
                  v-for="(item, p) in roleList('afterSale')"
                  :key="p"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="寄件单号" prop="logistics.mailingNumber">
              <el-input
                v-model="form.logistics.mailingNumber"
                clearable
                placeholder="请输入寄件单号"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 第二行 - 收方信息 -->
          <el-col :span="24">
            <el-form-item label="返还收货地址" prop="logisticsAddressInfo">
              <div class="address-selector-wrapper">
                <el-link 
                  type="primary" 
                  size="small" 
                  icon="el-icon-location"
                  @click="openLogisticsAddressDialog"
                  :disabled="!form.returnPartyId"
                >
                  {{ form.logisticsAddressInfo ? '重新选择地址' : '选择收货地址' }}
                </el-link>
                <span v-if="!form.returnPartyId" class="address-tip">请先选择客退方</span>
                <div v-if="form.logisticsAddressInfo" class="selected-address">
                  {{ form.logistics.recipient }} / {{ form.logistics.phone }} - {{ form.logistics.address }}
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 第三行 -->
          <el-col :span="24">
            <el-form-item label="备注" prop="locationRemark">
              <el-input
                v-model="form.locationRemark"
                type="textarea"
                :rows="3"
                placeholder="备注特殊信息（如售后换货，需记录新的产品SN，以便追溯）"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </template>
    </el-form>
    <div slot="footer" class="dialog-footer" style="text-align: right;">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" :loading="isSubLoading" @click="submitForm">
        确 定
      </el-button>
    </div>
  </el-dialog>

  <!-- 地址选择弹窗 -->
  <el-dialog
    title="选择收货地址"
    :visible.sync="addressDialogVisible"
    width="1200px"
    append-to-body
    :close-on-click-modal="false"
    top="0vh"
    custom-class="address-selection-dialog"
  >
    <div v-if="!form.returnPartyId" class="address-empty-tip">
      <i class="el-icon-warning"></i>
      <p>请先选择客退方</p>
    </div>
    <div v-else class="address-dialog-content">
      <div class="address-search" style="margin-bottom: 15px;">
        <el-input
          v-model="addressSearchKeyword"
          placeholder="搜索联系人、电话或地址"
          prefix-icon="el-icon-search"
          clearable
          size="medium"
          type="mini"
          @input="handleAddressSearch"
          style="width: 300px;"
        />
      </div>
      <el-table
        ref="addressTable"
        :data="filteredAddressList"
        border
        style="width: 100%"
        height="500"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="contactName" label="联系人" width="120" align="center" />
        <el-table-column prop="contactPhone" label="联系电话" width="140" align="center" />
        <el-table-column prop="address" label="详细地址" min-width="200"   />
        <el-table-column prop="remark" label="备注" width="250"  />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="selectAddress(scope.row)"
            >
              选择
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="filteredAddressList.length === 0" class="address-empty-tip">
        <i class="el-icon-info"></i>
        <p>暂无收货地址数据</p>
      </div>
    </div>
  </el-dialog>
  </div>
</template>
  

<script>
import { saleSave, saleUpdate } from "@/api/third/sale";
import { getCustomerList } from "@/api/order";
import { computerNameList } from "@/api/third/fileConfig";
import { sampleListComputer } from "@/api/third/sampleProductFamily";
import { listCustomer } from "@/api/third/sample";
import { listCustomerAddress } from "@/api/crm/customerAddress";
import tinymce from "@/views/components/Editor";
import globalData from "../mixins/global";
import ElUploadSortable from "@/components/el-upload-sortable";
import TypedSelectLoadMore from "@/components/TypedSelectLoadMore";
import reqUrl from "@/utils/requestUrl";

export default {
  components: {
    tinymce,
    ElUploadSortable,
    TypedSelectLoadMore,
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
      showName: "",
      isReset: false,
      // 提交loading
      isSubLoading: false,
      computerIdIndex: "",
      happenStageOptions: [
        { label: "组装厂", value: "组装厂" },
        { label: "用户", value: "用户" },
      ],
      // 表单参数
      form: {
        id: "",
        afterProblemId: "",
        returnDate: "",
        receiveName: "",
        returnParty: "",
        returnPartyId: "",
        customerName: "",
        customerId: "",
        generatorStage: "",
        inventory: [],
        afterType: "",
        returnName: "",
        returnPhone: "",
        returnAddress: "",
        returnAddressInfo: "",
        returnOrderNo: "",
        isFreight: "",
        result: "",
        logisticsNo: "",
        direction: "",
        file: "",
        video: "",
        locationRemark: "",
        logisticsAddressInfo: "",
        logistics: {
          id: "",
          afterId: "",
          returnDate: "",
          sender: "",
          mailingDepartment: "",
          mailingNumber: "",
          recipient: "",
          phone: "",
          address: "",
          isPay: "",
        },
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
      // 客退方数据
      returnPartyData: {
        data: [],
        page: 1,
        more: true,
      },
      dictForm: {},
      isCLoading: false,
      // 仪表型号
      computerOptions: [],
      // 客户收货地址列表
      customerAddressList: [],
      // 地址搜索关键词
      addressSearchKeyword: '',
      // 过滤后的地址列表
      filteredAddressList: [],
      // 地址选择弹窗
      addressDialogVisible: false,
      selectedAddressId: "",
      currentAddressType: "", // 'return' 或 'logistics'
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
          { required: true, message: "请选择客退方", trigger: "change" },
        ],
        afterType: [
          { required: true, message: "请选择客退类型", trigger: "change" },
        ],
        returnName: [
          { required: true, message: "请输入收件人", trigger: "blur" },
        ],
        returnPhone: [
          { required: true, message: "请输入联系电话", trigger: "blur" },
        ],
        returnAddress: [
          { required: true, message: "请输入收件地址", trigger: "blur" },
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
        generatorStage: [
          { required: true, message: "请选择发生阶段", trigger: "change" },
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
  },
  watch: {
    visible(isShow) {
      if (isShow) {
        this.getReturnList();
        // 回显仪表型号
        this.changeCategory(0);
        // 编辑时如果有客退方ID，自动加载地址列表
        if (this.form.returnPartyId) {
          this.$nextTick(() => {
            this.loadCustomerAddresses();
          });
        }
        // 编辑时如果有地址信息，设置地址信息标志以显示地址
        if (this.form.returnName || this.form.returnPhone || this.form.returnAddress) {
          this.form.returnAddressInfo = 'selected';
        }
        // 编辑时如果有返还地址信息，设置返还地址信息标志
        if (this.form.logistics && (this.form.logistics.recipient || this.form.logistics.phone || this.form.logistics.address)) {
          this.form.logisticsAddressInfo = 'selected';
        }
      } else {
        this.reset();
      }
    },
    // 监听客退类型变化，动态调整仪表型号必填规则
    'form.afterType'(newVal) {
      if (newVal === 2) {
        // 样品：仪表型号非必填
        this.rules.computerId = [
          { required: false, message: "请选择仪表型号", trigger: "change" }
        ];
      } else {
        // 大货：仪表型号必填
        this.rules.computerId = [
          { required: true, message: "请选择仪表型号", trigger: "change" }
        ];
      }
    },
  },
  methods: {
    // 处理客退类型变化
    handleAfterTypeChange() {
      // 清空所有仪表型号
      this.form.list.forEach((item) => {
        item.computerId = '';
      });
      // 清空仪表型号选项列表
      this.computerOptions = [];
      
      // 清除所有仪表型号字段的验证错误
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.form.list.forEach((item, index) => {
            this.$refs.form.clearValidate(`list[${index}].computerId`);
          });
        }
      });
    },
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
    /** 客退方列表 */
    getReturnPartyList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getCustomerList({
          p: page,
          name: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.returnPartyData.data = [
              ...this.returnPartyData.data,
              ...list,
            ];
          } else {
            this.returnPartyData.data = list;
          }
          this.returnPartyData.more = pageNum * pageSize < total;
          this.returnPartyData.page = pageNum;
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
    getReturnPartyId(info) {
      if (!info) {
        this.form.returnPartyId = "";
        this.customerAddressList = [];
        this.filteredAddressList = [];
        return;
      }
      const { id, name } = JSON.parse(info);
      this.form.returnPartyId = id;
      // 确保 returnParty 只存储 name，不存储 JSON 字符串
      this.form.returnParty = name;
      // 选择客退方后自动加载客户地址列表
      this.loadCustomerAddresses();
    },
    onChangeCategory(index) {
      this.form.list[index].computerId = "";
    },
    changeCategory(index) {
      const categoryId = this.form.list[index].categoryId;
      this.computerIdIndex = index;
      if (categoryId) {
        // 根据客退类型选择不同的数据源
        if (this.form.afterType === 2) {
          // 样品：需要通过API查询，获取焦点时立即查询
          this.computerOptions = [];
          this.getSampleComputerList(categoryId);
        } else {
          // 大货：使用本地字典数据
          const data = this.categoryList.filter((item) => item.id === categoryId);
          this.computerOptions = data[0]?.computerList || [];
        }
      } else {
        this.computerOptions = [];
      }
    },
    // 样品模式：获取仪表型号列表（支持焦点触发）
    getSampleComputerList(categoryId, name = '') {
      this.isCLoading = true;
      sampleListComputer({
        key: categoryId,
        name,
        p:1,
        l:10000
      })
        .then((res) => {
          // 处理样品接口返回的数据格式
          // 样品返回的数据结构：{ name: 型号名, id, desc, ... }
          this.computerOptions = (res.data.list || res.data || []).map(item => ({
            model: item.id,  // 使用 id 作为 model
            name: item.name,   // 显示名称也用 name
          }));
          this.isCLoading = false;
        })
        .catch(() => {
          this.isCLoading = false;
        });
    },
    getComputerNameList(name) {
      const categoryId = this.form.list[this.computerIdIndex].categoryId;
      
      // 根据客退类型选择不同的API
      if (this.form.afterType === 2) {
        // 样品：使用 /sample/computer/list 接口，支持空搜索
        this.getSampleComputerList(categoryId, name || '');
      } else {
        // 大货：使用原有的 computer/name 接口，必须有搜索关键词
        if (name) {
          this.isCLoading = true;
          computerNameList({
            name,
            categoryId,
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
    /** 加载客户收货地址列表 */
    async loadCustomerAddresses() {
      if (!this.form.returnPartyId) {
        this.customerAddressList = [];
        this.filteredAddressList = [];
        return;
      }
      
      try {
        const res = await listCustomerAddress({ 
          customerId: this.form.returnPartyId,
          pageSize: 999
        });
        if (res.code === 200 && res.data) {
          this.customerAddressList = (res.data.list || res.data || []).map(address => ({
            id: address.id,
            contactName: address.contactName || '',
            contactPhone: address.contactPhone || '',
            address: address.address || '',
            remark: address.remark || '',
            customerId: this.form.returnPartyId
          }));
          // 初始化过滤列表
          this.filteredAddressList = this.customerAddressList;
          this.addressSearchKeyword = '';
        } else {
          this.customerAddressList = [];
          this.filteredAddressList = [];
        }
      } catch (error) {
        console.error('加载客户地址失败:', error);
        this.customerAddressList = [];
        this.filteredAddressList = [];
      }
    },
    /** 收件人搜索过滤方法 */
    filterRecipientMethod(keyword) {
      this.addressSearchKeyword = keyword;
      if (!keyword) {
        this.filteredAddressList = this.customerAddressList;
        return;
      }
      
      const lowerKeyword = keyword.toLowerCase();
      this.filteredAddressList = this.customerAddressList.filter(addr => {
        return (
          (addr.contactName && addr.contactName.toLowerCase().includes(lowerKeyword)) ||
          (addr.contactPhone && addr.contactPhone.includes(keyword)) ||
          (addr.address && addr.address.toLowerCase().includes(lowerKeyword))
        );
      });
    },
    /** 处理收件人下拉框显示隐藏 */
    handleRecipientVisibleChange(visible) {
      if (visible && this.customerAddressList.length === 0) {
        this.loadCustomerAddresses();
      }
    },
    /** 处理收件人选择变化（物流信息） */
    handleRecipientChange(recipientName) {
      if (!recipientName) {
        // 清空时不处理
        return;
      }
      
      // 根据收件人姓名查找对应的地址信息
      const selectedAddress = this.customerAddressList.find(
        addr => addr.contactName === recipientName
      );
      
      if (selectedAddress) {
        // 自动填充联系电话和收件地址
        this.$set(this.form.logistics, 'phone', selectedAddress.contactPhone || '');
        this.$set(this.form.logistics, 'address', selectedAddress.address || '');
        this.$set(this.form.logistics, 'addressId', selectedAddress.id);
      } else {
        // 手动输入的收件人，清空 addressId
        this.$set(this.form.logistics, 'addressId', '');
      }
    },
    /** 处理返还信息收件人选择变化 */
    handleReturnRecipientChange(recipientName) {
      if (!recipientName) {
        return;
      }
      
      // 根据收件人姓名查找对应的地址信息
      const selectedAddress = this.customerAddressList.find(
        addr => addr.contactName === recipientName
      );
      
      if (selectedAddress) {
        // 自动填充联系电话和收件地址
        this.form.returnPhone = selectedAddress.contactPhone || '';
        this.form.returnAddress = selectedAddress.address || '';
      }
    },
    /** 打开客退地址选择弹窗 */
    openReturnAddressDialog() {
      if (!this.form.returnPartyId) {
        this.$message.warning('请先选择客退方');
        return;
      }
      
      // 确保地址列表已加载
      if (this.customerAddressList.length === 0) {
        this.loadCustomerAddresses().then(() => {
          this.currentAddressType = 'return';
          this.addressDialogVisible = true;
          this.selectedAddressId = "";
          this.addressSearchKeyword = "";
          this.filteredAddressList = [...this.customerAddressList];
        });
      } else {
        this.currentAddressType = 'return';
        this.addressDialogVisible = true;
        this.selectedAddressId = "";
        this.addressSearchKeyword = "";
        this.filteredAddressList = [...this.customerAddressList];
      }
    },
    /** 打开返还地址选择弹窗 */
    openLogisticsAddressDialog() {
      if (!this.form.returnPartyId) {
        this.$message.warning('请先选择客退方');
        return;
      }
      
      // 确保地址列表已加载
      if (this.customerAddressList.length === 0) {
        this.loadCustomerAddresses().then(() => {
          this.currentAddressType = 'logistics';
          this.addressDialogVisible = true;
          this.selectedAddressId = "";
          this.addressSearchKeyword = "";
          this.filteredAddressList = [...this.customerAddressList];
        });
      } else {
        this.currentAddressType = 'logistics';
        this.addressDialogVisible = true;
        this.selectedAddressId = "";
        this.addressSearchKeyword = "";
        this.filteredAddressList = [...this.customerAddressList];
      }
    },
    /** 地址搜索 */
    handleAddressSearch() {
      const keyword = this.addressSearchKeyword.toLowerCase().trim();
      if (!keyword) {
        this.filteredAddressList = this.customerAddressList;
        return;
      }
      this.filteredAddressList = this.customerAddressList.filter(addr => {
        return (
          (addr.contactName && addr.contactName.toLowerCase().includes(keyword)) ||
          (addr.contactPhone && addr.contactPhone.includes(keyword)) ||
          (addr.address && addr.address.toLowerCase().includes(keyword))
        );
      });
    },
    /** 选择地址（直接完成选择并关闭弹窗） */
    selectAddress(address) {
      if (!address) {
        return;
      }
      
      if (this.currentAddressType === 'return') {
        // 客退地址
        this.form.returnName = address.contactName || '';
        this.form.returnPhone = address.contactPhone || '';
        this.form.returnAddress = address.address || '';
        this.form.returnAddressInfo = 'selected';
      } else if (this.currentAddressType === 'logistics') {
        // 返还地址
        this.form.logistics.recipient = address.contactName || '';
        this.form.logistics.phone = address.contactPhone || '';
        this.form.logistics.address = address.address || '';
        this.form.logisticsAddressInfo = 'selected';
      }
      
      // 关闭弹窗
      this.addressDialogVisible = false;
    },
    // 表单重置
    reset() {
      this.form = {
        id: "",
        afterProblemId: "",
        returnDate: "",
        receiveName: "",
        returnParty: "",
        returnPartyId: "",
        customerName: "",
        customerId: "",
        generatorStage: "",
        inventory: [],
        afterType: "",
        returnName: "",
        returnPhone: "",
        returnAddress: "",
        returnAddressInfo: "",
        returnOrderNo: "",
        isFreight: "",
        result: "",
        logisticsNo: "",
        direction: "",
        file: "",
        video: "",
        locationRemark: "",
        logisticsAddressInfo: "",
        list: [
          {
            categoryId: "",
            computerId: "",
            sn: "",
          },
        ],
        logistics: {
          id: "",
          afterId: "",
          returnDate: "",
          sender: "",
          mailingDepartment: "",
          mailingNumber: "",
          recipient: "",
          phone: "",
          address: "",
          isPay: "",
        },
      };
      this.customerAddressList = [];
      this.filteredAddressList = [];
      this.addressSearchKeyword = '';
      this.resetForm("form");
    },
    onAddSaleItem() {
      this.form.list.push({
        categoryId: "",
        computerId: "",
        sn: "",
      });
    },
    copySaleItem(index) {
      if (this.form.list.length >= 300) {
        this.$message.warning('最多只能添加300条仪表信息');
        return;
      }
      // 复制当前行的数据
      const copiedItem = {
        categoryId: this.form.list[index].categoryId,
        computerId: this.form.list[index].computerId,
        sn: this.form.list[index].sn,
      };
      // 在当前行的下一行插入复制的数据
      this.form.list.splice(index + 1, 0, copiedItem);
    },
    removeSaleItem(item) {
      const index = this.form.list.indexOf(item);
      if (index !== -1) {
        this.form.list.splice(index, 1);
      }
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.isSubLoading = true;
          let params = JSON.parse(JSON.stringify(this.form));
          params.inventory = JSON.stringify(params.inventory);
          
          // 处理图片和视频：数组转逗号分隔字符串
          if (Array.isArray(params.file)) {
            params.file = params.file.join(',');
          }
          if (Array.isArray(params.video)) {
            params.video = params.video.join(',');
          }
          
          // 字段映射：兼容后端字段名
          if (params.generatorStage !== undefined) {
            params.happenStage = params.generatorStage;
          }

          if (params.id) {
            const { logistics, ...dataInfo } = params;
            let currentData = params;
            if (!Object.keys(logistics).length) {
              currentData = dataInfo;
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
  
<style lang="scss" scoped>
// 地址选择弹窗样式
.address-empty-tip {
  text-align: center;
  padding: 40px 20px;
  color: #909399;

  i {
    font-size: 48px;
    color: #c0c4cc;
    margin-bottom: 16px;
    display: block;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
  }
}

.address-dialog-content {
  .address-search {
    margin-bottom: 15px;
  }
}

// 地址选择器样式
.address-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;

  .address-tip {
    color: #909399;
    font-size: 13px;
  }

  .selected-address {
    flex: 1;
    display: flex;
    align-items: center;
    border-radius: 4px;
    color: #606266;
    font-size: 14px;
    line-height: 1.5;
    overflow-x: auto;
    white-space: nowrap;
    
    /* 美化滚动条 */
    &::-webkit-scrollbar {
      height: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: #dcdfe6;
      border-radius: 3px;
      
      &:hover {
        background-color: #c0c4cc;
      }
    }
    
    &::-webkit-scrollbar-track {
      background-color: #f5f7fa;
      border-radius: 3px;
    }
  }
}
</style>

<style lang="scss">
// 地址选择表格全局样式
.address-selection-dialog {
  .el-table {
    // 表格行hover效果
    .el-table__body tr:hover > td {
      background-color: #f5f7fa;
    }
  }

  .el-dialog__header {
    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .el-dialog__body {
    padding: 24px;
  }
}
</style>