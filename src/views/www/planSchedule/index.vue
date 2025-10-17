<template>
  <div class="app-container flex-app-container">
    <!-- 智能搜索区域 -->
    <IntelligentSearchForm :searchForm="searchForm" :fields="searchFields" @search="handleSearch" @reset="handleReset"
      @field-change="handleFieldChange" defaultVisibleCount="4">
      <!-- 自定义所属品类字段渲染 -->
      <template #field-categoryId="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select v-model="searchForm[field.key]" filterable allow-create clearable @change="changeCategory"
            style="width: 140px" placeholder="请选择" size="mini">
            <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.id" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义仪表型号字段渲染 -->
      <template #field-computerId="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select v-model="searchForm[field.key]" :loading="isCLoading" filterable remote clearable @change="getList"
            :remote-method="getComputerNameList" style="width: 140px" size="mini" placeholder="请先选择品类">
            <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.model" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义迪太订单号字段渲染 -->
      <template #field-salesOrderNo="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-input v-model.trim="searchForm[field.key]" clearable @keyup.native.enter="handleQuery"
            style="width: 140px" placeholder="请输入迪太订单号" size="mini" />
        </el-form-item>
      </template>

      <!-- 自定义排产单号字段渲染 -->
      <template #field-no="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-input v-model.trim="searchForm[field.key]" clearable @keyup.native.enter="handleQuery"
            placeholder="请输入排产单号" size="mini" />
        </el-form-item>
      </template>

      <!-- 自定义排产状态字段渲染 -->
      <template #field-productStatus="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-select v-model="searchForm[field.key]" clearable size="mini" placeholder="请选择">
            <el-option v-for="(value, key) in productStatusList" :key="key" :label="value" :value="key" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义生产日期字段渲染 -->
      <template #field-dateRange="{ field, searchForm }">
        <el-form-item :label="field.label" :prop="field.key">
          <el-date-picker v-model="dateRange" style="width: 250px" value-format="timestamp" type="daterange"
            range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" @change="handleQuery"
            size="mini"></el-date-picker>
        </el-form-item>
      </template>

      <!-- 页面操作按钮 -->
      <template #page-actions>
        <el-button type="primary" icon="el-icon-plus" v-hasPermi="['www:planSchedule:add']" @click="handleAdd"
          size="mini">
          新 增
        </el-button>
        <el-button v-hasPermi="['www:planSchedule:oldAdd']" type="danger" icon="el-icon-plus" @click="handleOldAdd"
          size="mini">
          新 增(旧)
        </el-button>
      </template>
    </IntelligentSearchForm>

    <el-table border v-loading="loading" height="100%" :data="list" :cell-class-name="cellClassName"
      class="table-section" @cell-click="cellClick">
      <el-table-column label="序号" width="60" type="index" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="产品品类" align="center" prop="categoryName" width="100" />
      <el-table-column label="产品型号" align="center" prop="computerName" min-width="150" />
      <el-table-column label="迪太订单号" align="center" prop="salesOrderNo" min-width="150" />
      <el-table-column label="客户订单号" align="center" prop="customerOrderNo" min-width="150">
        <span slot-scope="scope" v-NoData="scope.row.customerOrderNo"></span>
      </el-table-column>
      <el-table-column label="排产单号" align="center" prop="no" min-width="150" />
      <el-table-column label="订单编号" align="center" prop="orderCode" min-width="150" />
      <el-table-column label="生产地点" align="center" prop="address" width="90" />
      <el-table-column label="生产日期" align="center" prop="date">
        <template slot-scope="{ row }">
          <span v-NoData="parseTime(row.date, '{y}-{m}-{d}')" :class="{ 'text-red': isDisabled(row.date) }"
            :title="isDisabled(row.date) ? '已过期' : ''"></span>
        </template>
      </el-table-column>
      <el-table-column label="生产流程" align="center" prop="process" width="80" />
      <el-table-column label="方案版本" align="center" prop="soChipVersion" width="80" />
      <el-table-column label="排产数量" align="center" prop="num" width="90" />
      <el-table-column label="排产状态" align="center" prop="productStatus" width="85">
        <template slot-scope="{ row }">
          <el-tag v-if="row.productStatus !== null" size="mini" :type="tagType(row.productStatus)">
            {{ productStatusList[row.productStatus] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="MUA配置" align="center" prop="configList" width="85">
        <template slot-scope="{ row }">
          <el-tag v-if="row.configList && row.configList.length > 0" size="mini" type="success">
            已配置
          </el-tag>
          <el-tag v-else size="mini" type="info">
            未配置
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单数量" align="center" prop="orderQuantity" width="85" />
      <el-table-column label="排产人" align="center" prop="createBy" width="85" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="150">
        <template slot-scope="{ row }">
          <span>
            {{ parseTime(row.createTime, "{y}-{m}-{d} {h}:{i}") }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="250" fixed="right">
        <div class="flex align-center justify-between" slot-scope="{ row }">
          <el-button v-if="row.salesOrderNo" v-hasPermi="['www:planSchedule:update']" type="text"
            @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="!row.salesOrderNo" v-hasPermi="['www:planSchedule:oldUpdate']" type="text"
            @click="handleOldUpdate(row)">
            编辑(旧)
          </el-button>
          <el-button class="mlZero" v-show="row.qrCode" type="text" v-hasPermi="['www:planSchedule:taskOrder']"
            @click="handleQrCode(row)">
            任务令
          </el-button>
          <el-button class="mlZero" type="text" v-hasPermi="['www:planSchedule:codeSet']"
            @click="onSetCodeConfig(row)" style="color: #E6A23C;">
            MUA配置
          </el-button>
          <el-dropdown>
            <span class="el-dropdown-link text-blue font12">
              更多操作<i class="el-icon-arrow-down el-icon--right"></i>
            </span>

            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="row.productStatus !== 2" v-hasPermi="['www:planSchedule:delete']"
                @click.native="handleDelete(row)">
                删除
              </el-dropdown-item>
              <el-dropdown-item v-hasPermi="['www:planSchedule:log']" @click.native="onEditLog(row.id)">
                日志
              </el-dropdown-item>
              <el-dropdown-item v-if="row.productStatus === 0" v-hasPermi="['www:planSchedule:editProdEnd']"
                @click.native="onEditProdStatusEnd(row)">
                生产完结
              </el-dropdown-item>

              <el-dropdown-item @click.native="onBoxInfo(row.id)">
                箱子信息
              </el-dropdown-item>
              <el-dropdown-item v-hasPermi="['www:planSchedule:create:prodData']"
                @click.native="handleCreateFile(row.id)">
                生成生产资料
              </el-dropdown-item>

              <template v-if="row.fileZip">
                <el-dropdown-item v-hasPermi="['www:planSchedule:download:prodData']"
                  @click.native="zipFile(row.fileZip)">
                  下载生产资料
                </el-dropdown-item>

                <el-dropdown-item v-hasPermi="['www:planSchedule:create:seeData']" @click="getProSecDetail(row.id)">
                  生成预览资料
                </el-dropdown-item>

                <template v-if="row.excelUrl">
                  <el-dropdown-item v-hasPermi="['www:planSchedule:download:fileData']" @click="zipFile(row.excelUrl)">
                    下载资料清单
                  </el-dropdown-item>
                  <el-dropdown-item v-hasPermi="['www:planSchedule:send:prod']" @click="handleProd(row.id)">
                    外发生产
                  </el-dropdown-item>
                </template>
              </template>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />

    <CompUpdate v-if="showUpdateComponent" ref="compUpdate" :title="title" :dictList="dictList" :modelList="modelList"
      :operationList="operationList" :isExcelFile.sync="isExcelFile" @getData="getList" />

    <old-comUpdate ref="oldCompUpdate" :title="title" :dictList="dictList" :modelList="modelList"
      :operationList="operationList" @getData="getList" />

    <!-- 任务令 -->
    <el-dialog title="任务令" :visible.sync="isQrCode" width="600px" center top="-10vh">
      <el-card shadow="nerver">
        <div class="text-center">
          <vue-qr class="margin-bottom" :text="qrCodeObj.qrCode" :size="250" :margin="10"></vue-qr>

          <el-descriptions direction="vertical" :column="4" border>
            <el-descriptions-item label="产品品类">
              <span v-NoData="qrCodeObj.categoryName"></span>
            </el-descriptions-item>
            <el-descriptions-item label="产品型号">
              <span v-NoData="qrCodeObj.computerName"></span>
            </el-descriptions-item>
            <el-descriptions-item label="芯片版本">
              <span v-NoData="qrCodeObj.soChipVersion"></span>
            </el-descriptions-item>
            <el-descriptions-item label="客户订单号">
              <span v-NoData="qrCodeObj.customerOrderNo"></span>
            </el-descriptions-item>
            <el-descriptions-item label="生产数量">
              <span v-NoData="qrCodeObj.num"></span>
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="3">
              <span v-NoData="qrCodeObj.remark"></span>
            </el-descriptions-item>
          </el-descriptions>

          <template v-if="qrCodeObj.configList && qrCodeObj.configList.length > 0">
            <el-table class="margin-top-xs" :data="qrCodeObj.configList" border max-height="200px">
              <el-table-column label="配置类型" align="center" width="90px">
                <template slot-scope="{ row }">
                  {{ selectDictLabel(configTypeData, row.configType) }}
                </template>
              </el-table-column>
              <el-table-column label="升级项目" align="center">
                <template slot-scope="{ row }">
                  {{ analyzeConfig(row.jsonStr, 'upgradeProject') }}
                </template>
              </el-table-column>
              <el-table-column label="供电电压" align="center" width="90px">
                <template slot-scope="{ row }">
                  {{ analyzeConfig(row.jsonStr, 'supplyVoltage') }}
                </template>
              </el-table-column>
              <el-table-column label="通讯类型" align="center" width="90px">
                <template slot-scope="{ row }">
                  {{ analyzeConfig(row.jsonStr, 'communicationType') }}
                </template>
              </el-table-column>
            </el-table>
          </template>
        </div>
      </el-card>
    </el-dialog>

    <!-- 缺失资料状态弹窗 -->
    <el-dialog title="缺失资料状态" center width="40%" top="-12vh" :visible.sync="isDataShow" :close-on-click-modal="false"
      class="data-box">
      <el-descriptions direction="vertical" :column="3" border>
        <el-descriptions-item label="软件资料" :labelStyle="isLabelStyle" :contentStyle="isContentStyle"
          content-class-name="overflow-y" v-if="isDataLen(dataInfo.softList)">
          <div class="detail_item_box">
            <el-tag size="mini" class="margin-right-xs margin-bottom-xs" v-for="(item, index) in dataInfo.softList"
              :key="index">
              {{ item.typeValue }}
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="硬件资料" :labelStyle="isLabelStyle" :contentStyle="isContentStyle"
          content-class-name="overflow-y" v-if="isDataLen(dataInfo.hardList)">
          <div class="detail_item_box">
            <el-tag size="mini" class="margin-right-xs margin-bottom-xs" v-for="(item, index) in dataInfo.hardList"
              :key="index">
              {{ item.typeValue }}
            </el-tag>
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="工程资料" :labelStyle="isLabelStyle" :contentStyle="isContentStyle"
          content-class-name="overflow-y" v-if="isDataLen(dataInfo.projectList)">
          <div class="detail_item_box">
            <el-tag size="mini" class="margin-right-xs margin-bottom-xs" v-for="(item, index) in dataInfo.projectList"
              :key="index">
              {{ item.typeValue }}
            </el-tag>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 外发生产 -->
    <el-dialog title="外发生产" :visible.sync="isOutProd" width="500px" center :close-on-click-modal="false">
      <el-card shadow="hover"> 文件 </el-card>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary">确 定</el-button>
        <el-button>取 消</el-button>
      </div>
    </el-dialog>

    <!-- 箱子信息 -->
    <el-dialog title="箱子信息" :visible.sync="isBoxInfoShow" center :close-on-click-modal="false">
      <el-table border v-loading="isBoxInfoLoading" :height="450" :data="boxInfoData">
        <el-table-column label="序号" width="60" type="index" align="center">
          <template slot-scope="scope">
            {{
              (boxInfoQueryParams.p - 1) * boxInfoQueryParams.l +
              scope.$index +
              1
            }}
          </template>
        </el-table-column>
        <el-table-column label="设备名称" align="center" prop="equipName" />
        <el-table-column label="箱号" align="center" prop="boxNo" />
        <el-table-column label="箱子序号" align="center" prop="no" />
        <el-table-column label="应装数量" align="center" prop="num" />
        <el-table-column label="箱子重量" align="center" prop="weight" />
        <el-table-column label="是否尾箱" align="center" prop="isEnd">
          <template slot-scope="{ row }">
            <el-tag v-if="row.isEnd === 1" type="success"> 是 </el-tag>
            <el-tag v-else type="info"> 否 </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="150">
          <template slot-scope="{ row }">
            <span>
              {{ parseTime(row.createTime, "{y}-{m}-{d} {h}:{i}") }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="boxInfoTotal > 0" :total="boxInfoTotal" :page.sync="boxInfoQueryParams.p"
        :limit.sync="boxInfoQueryParams.l" @pagination="getBoxInfoData" />
    </el-dialog>

    <edit-log ref="editLogRef" />
    <!-- Mua配置 -->
    <MuaSet ref="muaSetRef" @refresh="getList()" />
  </div>
</template>

<script>
import {
  schedulingList,
  schedulingDel,
  createDataFile,
  sendProd,
  proSecDetail,
  boxInfoList,
  schedulingEdit
} from "@/api/www/planSchedule";
import { listComputer } from "@/api/third/computer";
import { computerNameList, categoryComputerDict } from "@/api/third/fileConfig";
import VueQr from "vue-qr";
import table2excel from "js-table2excel";
import XLSX from "xlsx";
import "./table2excel";
import reqUrl from "@/utils/requestUrl";
import axios from "axios";
import { commonData } from "./mixins/common";
import IntelligentSearchForm from '@/components/IntelligentSearchForm';
import dynamicTableHeightMixin from '@/mixins/dynamicTableHeight'
export default {
  name: "PlanSchedule",
  mixins: [commonData, dynamicTableHeightMixin],
  components: {
    VueQr,
    IntelligentSearchForm,
    CompUpdate: () => import("./components/update.vue"),
    OldComUpdate: () => import("./components/oldUpdate.vue"),
    EditLog: () => import("./components/log.vue"),
    MuaSet: () => import("./components/muaSet.vue"),
    MuaSetList: () => import("./components/MuaSetList.vue"),
  },
  data() {
    return {
      actionUrl: reqUrl + "/oss/batch-upload",
      isExcelFile: false,
      // ✅ 控制更新组件的销毁和重建
      showUpdateComponent: true,
      // 显示搜索条件
      showSearch: true,
      // 遮罩层
      loading: true,
      // 缺失资料状态弹窗
      isDataShow: false,
      isCLoading: false,
      isQrCode: false,
      isOutProd: false,
      qrCodeObj: {},
      dataInfo: {},
      title: "",
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 产品品类
      dictList: [],
      // 型号
      modelList: [],
      computerOptions: [],
      operationList: [],
      // 日期范围
      dateRange: [],
      productStatusList: {
        0: "正常",
        1: "已取消",
        2: "生产完结",
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        categoryId: "",
        computerId: "",
        salesOrderNo: "",
        no: "",
        startDate: "",
        endDate: "",
        operation: "",
        productStatus: ""
      },

      // IntelligentSearchForm 搜索表单数据
      searchForm: {
        categoryId: "",
        computerId: "",
        salesOrderNo: "",
        no: "",
        productStatus: ""
      },

      // IntelligentSearchForm 搜索字段配置
      searchFields: [
        {
          key: 'categoryId',
          label: '所属品类',
          component: 'el-select',
          sort: 1     // 第1位 - 品类最重要
        },
        {
          key: 'computerId',
          label: '仪表型号',
          component: 'el-select',
          sort: 2     // 第2位 - 型号重要
        },
        {
          key: 'salesOrderNo',
          label: '迪太订单号',
          component: 'el-input',
          sort: 3     // 第3位 - 订单号
        },
        {
          key: 'no',
          label: '排产单号',
          component: 'el-input',
          sort: 4     // 第4位 - 排产单号
        },
        {
          key: 'productStatus',
          label: '排产状态',
          component: 'el-select',
          sort: 5     // 第5位 - 状态
        },
        {
          key: 'dateRange',
          label: '生产日期',
          component: 'el-date-picker',
          sort: 6     // 第6位 - 日期范围
        }
      ],
      isBoxInfoLoading: false,
      isBoxInfoShow: false,
      boxInfoData: [],
      boxInfoTotal: 0,
      schedulingId: "",
      boxInfoQueryParams: {
        p: 1,
        l: 10,
        id: ""
      }
    };
  },
  computed: {
    tagType() {
      return (status) => {
        switch (status) {
          case 0:
            return "success";
          case 1:
            return "info";
        }
      };
    },
    isDisabled() {
      return (date) => {
        return date < +new Date() - 3600 * 1000 * 24;
      };
    },
    isDataLen() {
      return (list) => {
        // true 未配齐
        return Array.isArray(list) && list.length > 0;
      };
    },
    isDataAll() {
      return ({ softList, hardList, projectList }) => {
        if (!this.isDataNull({ softList, hardList, projectList })) {
          if (
            !this.isDataLen(softList) &&
            !this.isDataLen(hardList) &&
            !this.isDataLen(projectList)
          ) {
            return true;
          }
        }
      };
    },
    isDataNull() {
      return ({ softList, hardList, projectList }) => {
        if (softList === null && hardList === null && projectList === null) {
          return true;
        }
      };
    },
    isDataAlltxt() {
      return (bool) => {
        return bool ? "未配齐" : "已配齐";
      };
    },
    dataStateColor() {
      return (bool) => {
        return bool ? "text-red" : "text-green";
      };
    },
    isLabelStyle() {
      return { textAlign: "center", color: "#e54d42" };
    },
    isContentStyle() {
      return { width: "33.333%", verticalAlign: "top" };
    }
  },
  watch: {
    "queryParams.categoryId"(id) {
      if (id) {
        this.getlistComputer(id);
      }
    },
    $route: {
      handler(route) {
        if (route.name === "PlanSchedule") {
          this.queryParams.salesOrderNo = "";
          const { salesOrderNo } = route?.params;
          if (salesOrderNo) {
            this.queryParams.salesOrderNo = salesOrderNo;
            this.handleQuery();
          }
        }
      },
      immediate: true
    }
  },
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      await vm.getCategoryComputerData();
      vm.getCacheParamsFn(to?.params);
    });
  },
  mounted() {
    this.getCacheParamsFn(this.$route?.params);
  },
  created() {
    this.getOperationList();
  },
  methods: {
    getCacheParamsFn(params) {
      const { categoryId, computerId, salesOrderNo, orderId } = params;

      // 从订单管理跳转到当前页面
      if (categoryId || computerId || salesOrderNo) {
        this.queryParams.categoryId = categoryId;
        this.queryParams.computerId = computerId;
        this.queryParams.salesOrderNo = salesOrderNo;
        this.queryParams.orderId = orderId;

        const computerData = this.dictList.filter(
          (item) => item.id === categoryId
        );
        this.computerOptions = computerData[0].computerList;
      }

      this.getList();
    },
    getCategoryComputerData() {
      return new Promise((resolve, reject) => {
        categoryComputerDict().then((res) => {
          this.dictList = res.data;

          const { categoryId } = this.$route.query;

          if (categoryId) {
            this.queryParams.categoryId = categoryId;
            this.changeCategory(categoryId);
            let computerId = this.$route.query.model;
            if (computerId) {
              this.queryParams.computerId = computerId;
            }
          }

          resolve();
        });
      });
    },
    loadingFn(text) {
      return new Promise((resolve) => {
        let downloadLoadingInstance = this.$loading({
          text,
          lock: true,
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        setTimeout(() => {
          resolve(downloadLoadingInstance);
        }, 1000);
      });
    },
    async getProSecDetail(id) {
      let downloadLoadingInstance = await this.loadingFn("预览资料生成中...");
      proSecDetail(id)
        .then((res) => {
          this.getList();
        })
        .finally(() => {
          downloadLoadingInstance.close();
        });
    },
    handleExcel(data) {
      const column = [
        {
          title: "属性",
          key: "name",
          type: "text",
        },
        {
          title: "值",
          key: "value",
          type: "text",
        },
        {
          title: "图片",
          key: "url",
          type: "image",
        },
      ];
      const excelName = "生产资料确认表";
      const datas = this.Format(data);
      table2excel(column, datas, excelName);
    },

    textExcel(id) {
      const table2excel = new Table2Excel();
      table2excel.export(document.getElementById("table"));
      const wb = XLSX.utils.table_to_book(document.getElementById("table"));

      const wbout = XLSX.write(wb, {
        bookType: "xlsx",
        bookSST: true,
        type: "binary",
      });

      const blob = new Blob([this.s2ab(wbout)], {
        type: "application/octet-stream",
      });

      this.uploadExcelFile(blob, id);

      // 上传到服务器

      const formData = new FormData();
      formData.append(
        "file",
        new Blob([wbout], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        fileName
      );

      axios
        .post(this.actionUrl, formData, {
          "Content-type": "multipart/form-data",
        })
        .then(
          (res) => {
            // 上传成功后的处理
            console.log(res);
          },
          (err) => {
            // 出现错误时的处理
          }
        );
    },

    // uploadExcelFile(fileData) {
    //   const formData = new FormData();
    //   formData.append("file", fileData);
    //   let reader = new FileReader();
    //   reader.readAsBinaryString(fileData);
    //   reader.onload = function (event) {
    //     let data = event.target.result;
    //     console.log(data);
    //     axios
    //       .post(this.actionUrl, data, {
    //         "Content-type": "application/octet-stream",
    //       })
    //       .then(
    //         (res) => {
    //           // 上传成功后的处理
    //           console.log(res, "success");
    //         },
    //         (err) => {
    //           // 出现错误时的处理
    //         }
    //       );
    //   };
    // },
    // s2ab(s) {
    //   const buf = new ArrayBuffer(s.length);
    //   const view = new Uint8Array(buf);
    //   for (let i = 0; i < s.length; ++i) {
    //     view[i] = s.charCodeAt(i) & 0xff;
    //   }
    //   return buf;
    // },

    Format(data) {
      data.forEach((item) => {
        if (item.value === null) {
          item.value = "";
        }
      });
      return data;
    },
    // 上传资料清单
    uploadFile(row) {
      this.title = "资料清单";
      this.isExcelFile = true;
      // ✅ 销毁并重建组件确保全新状态
      this.showUpdateComponent = false;
      this.$nextTick(() => {
        this.showUpdateComponent = true;
        this.$nextTick(() => {
          this.$refs.compUpdate.reset();
          this.$refs.compUpdate.form = Object.assign({}, row);
          this.$refs.compUpdate.dialogVisible = true;
        });
      });
    },
    changeCategory(val) {
      if (!val) return;
      this.queryParams.computerId = "";
      return new Promise((resove) => {
        this.computerOptions = this.dictList.filter(
          (item) => item.id === val
        )[0].computerList;
        resove();
      });
    },
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = false;
        computerNameList({
          name,
          categoryId: this.queryParams.categoryId,
        }).then((res) => {
          this.computerOptions = res.data;
        });
      } else {
        this.computerOptions = [];
      }
    },
    // 获取型号字典
    getlistComputer(key) {
      listComputer({ key }).then((res) => {
        const { list } = res.data;
        this.modelList = list;
      });
    },
    // 生产流程
    getOperationList() {
      this.getDicts("process").then((response) => {
        this.operationList = response.data;
      });
    },
    getList() {
      this.loading = true;
      schedulingList(
        this.addDateRange(this.queryParams, this.dateRange, {
          begin: "startDate",
          end: "endDate",
        })
      )
        .then((response) => {
          this.list = response.data.list;
          this.total = response.data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleAdd() {
      this.title = "新增计划";
      // ✅ 销毁并重建组件确保全新状态
      this.showUpdateComponent = false;
      this.$nextTick(() => {
        this.showUpdateComponent = true;
        this.$nextTick(() => {
          this.$refs.compUpdate.reset();
          this.$refs.compUpdate.dialogVisible = true;
        });
      });
    },
    handleOldAdd() {
      this.title = "新增计划";
      this.$refs.oldCompUpdate.reset();
      this.$refs.oldCompUpdate.oldDialogVisible = true;
    },
    handleUpdate(row) {
      this.title = "编辑计划";
      // ✅ 销毁并重建组件确保全新状态
      this.showUpdateComponent = false;
      this.$nextTick(() => {
        this.showUpdateComponent = true;
        this.$nextTick(() => {
          this.$refs.compUpdate.reset();
          this.$refs.compUpdate.dialogVisible = true;

          // 使用 loadScheduleData 方法正确处理编辑数据
          console.log('🚀 开始编辑，原始数据:', row);
          this.$refs.compUpdate.loadScheduleData(row);
        });
      });
      this.$refs.compUpdate.cloneForm = Object.assign({}, row);
    },
    handleOldUpdate(row) {
      this.title = "编辑计划";
      this.$refs.oldCompUpdate.reset();
      this.$refs.oldCompUpdate.form = Object.assign(
        {},
        { ...row, dateRange: [row.startTime, row.endTime] }
      );
      this.$refs.oldCompUpdate.cloneForm = Object.assign({}, row);
      this.$refs.oldCompUpdate.oldDialogVisible = true;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.orderId = "";
      this.queryParams.id = "";
      this.queryParams.p = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.orderId = "";
      this.queryParams.id = "";
      this.dateRange = [];
      this.modelList = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },

    // ==================== IntelligentSearchForm 相关方法 ====================

    /** 智能搜索表单搜索操作 */
    handleSearch(searchData) {
      console.log('🔍 搜索数据:', searchData)

      // 将搜索表单数据同步到queryParams
      this.queryParams.categoryId = searchData.categoryId || ""
      this.queryParams.computerId = searchData.computerId || ""
      this.queryParams.salesOrderNo = searchData.salesOrderNo || ""
      this.queryParams.no = searchData.no || ""
      this.queryParams.productStatus = searchData.productStatus || ""

      // 重置其他参数
      this.queryParams.orderId = ""
      this.queryParams.id = ""
      this.queryParams.p = 1

      // 处理日期范围
      if (this.dateRange && this.dateRange.length === 2) {
        this.queryParams.startDate = this.dateRange[0]
        this.queryParams.endDate = this.dateRange[1]
      } else {
        this.queryParams.startDate = ""
        this.queryParams.endDate = ""
      }

      this.getList()
    },

    /** 智能搜索表单重置操作 */
    handleReset() {
      console.log('🔄 重置搜索表单')

      // 重置搜索表单数据
      this.searchForm = {
        categoryId: "",
        computerId: "",
        salesOrderNo: "",
        no: "",
        productStatus: ""
      }

      // 重置日期范围
      this.dateRange = []

      // 重置型号选项
      this.computerOptions = []

      // 重置查询参数
      this.queryParams = {
        p: 1,
        l: 20,
        categoryId: "",
        computerId: "",
        salesOrderNo: "",
        no: "",
        startDate: "",
        endDate: "",
        operation: "",
        productStatus: ""
      }

      this.getList()
    },

    /** 智能搜索表单字段变更处理 */
    handleFieldChange(field, value) {
      console.log(`🔄 字段变更: ${field} = ${value}`)

      // 处理品类变更
      if (field === 'categoryId') {
        this.changeCategory(value)
        // 清空型号选择
        this.searchForm.computerId = ""
      }
    },
    // 删除
    handleDelete(row) {
      this.$confirm("确定要删除此项吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return schedulingDel(row.id);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(() => { });
    },
    // 查看任务令
    handleQrCode(row) {
      this.isQrCode = true;
      this.qrCodeObj = row;
      this.getDictData();
    },
    // 资料状态
    cellClick(row, column) {
      if (
        column.label === "资料状态" &&
        !this.isDataNull(row) &&
        !this.isDataAll(row)
      ) {
        this.handleDataVis(row);
      }
    },
    cellClassName({ row, column }) {
      if (
        column.label === "资料状态" &&
        !this.isDataNull(row) &&
        !this.isDataAll(row)
      ) {
        return "pointer";
      }
    },
    // 缺失资料
    handleDataVis({ softList, hardList, projectList }) {
      this.isDataShow = true;
      this.dataInfo = { softList, hardList, projectList };
    },
    // 生成生产资料
    async handleCreateFile(id) {
      let downloadLoadingInstance = await this.loadingFn("生产资料生成中...");

      createDataFile(id)
        .then(() => {
          this.msgSuccess("生成生产资料成功");
          this.getList();
        })
        .catch(() => {
          this.msgError("生成生产资料失败");
        })
        .finally(() => {
          downloadLoadingInstance.close();
        });
    },
    // 外发生产
    async handleProd(id) {
      let downloadLoadingInstance = await this.loadingFn("外发生产处理中...");
      sendProd(id)
        .then((res) => {
          if (res.code === 200) {
            this.msgSuccess("外发成功,请查看邮箱");
          } else {
            this.msgError("外发失败");
          }
        })
        .finally(() => {
          downloadLoadingInstance.close();
        });
    },
    /** 修改日志 */
    onEditLog(id) {
      this.$refs.editLogRef.dialogVisible = true;
      this.$refs.editLogRef.getList(id);
    },
    // 生产完结
    onEditProdStatusEnd(row) {
      this.$confirm(`确定要"生产完结"吗?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          const data = {
            id: row.id,
            productStatus: 2,
          }
          return schedulingEdit(data);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("操作成功");
        })
        .catch(() => { });
    },
    // 任务令配置
    onSetCodeConfig(row) {
      this.isSetMuaShow = true;
      this.$refs.muaSetRef.dialogVisible = true;
      this.$refs.muaSetRef.reset();
      console.log(row);
      this.$refs.muaSetRef.echoData({
        id: row.id,
        configList: row.configList || [],
      })
    },
    // 详细信息
    onBoxInfo(id) {
      this.isBoxInfoShow = true;
      this.schedulingId = id;

      this.boxInfoQueryParams.id = id;
      this.getBoxInfoData();
    },
    getBoxInfoData() {
      this.isBoxInfoLoading = true;

      boxInfoList(this.boxInfoQueryParams).then((res) => {
        this.boxInfoData = res.data.list;
        this.boxInfoTotal = res.data.total;
      }).finally(() => {
        this.isBoxInfoLoading = false;
      })
    },

  },
};
</script>
<style lang="scss" scoped>
.data-box {
  .detail_item_box {
    min-height: 150px;
    max-height: 300px;
    overflow: hidden;

    &:hover {
      overflow-y: auto;
    }
  }
}
</style>
