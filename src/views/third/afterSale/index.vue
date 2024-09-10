<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" inline>
      <el-form-item label="客诉日期" prop="returnDate">
        <el-date-picker
          v-model="queryParams.returnDate"
          type="date"
          clearable
          placeholder="请选择客诉日期"
          value-format="yyyy-MM-dd"
          style="width: 140px"
        />
      </el-form-item>
      <el-form-item label="客户名称" prop="customerName">
        <el-autocomplete
          v-model="queryParams.customerName"
          clearable
          style="width: 140px"
          multiple
          :fetch-suggestions="querySearchAsync"
          placeholder="请选择客户名称"
        ></el-autocomplete>
      </el-form-item>
      <el-form-item label="品类" prop="categoryName">
        <el-select
          filterable
          allow-create
          clearable
          v-model="queryParams.categoryName"
          style="width: 140px"
          @change="changeCategory"
          placeholder="请选择品类"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="型号" prop="computerName">
        <el-select
          :loading="isCLoading"
          filterable
          remote
          clearable
          style="width: 140px"
          v-model="queryParams.computerName"
          placeholder="请选择型号"
          :remote-method="getComputerNameList"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="产品SN" prop="sn">
        <el-input
          v-model.trim="queryParams.sn"
          placeholder="请输入产品SN"
          clearable
        />
      </el-form-item>
      <el-form-item label="问题状态" prop="status">
        <el-select
          v-model="queryParams.status"
          style="width: 120px"
          clearable
          placeholder="请选择问题状态"
        >
          <el-option label="OPEN" value="0" />
          <el-option label="CLOSE" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="处理进展" prop="state">
        <el-select
          v-model="queryParams.state"
          filterable
          style="width: 120px"
          clearable
          placeholder="请选择处理进展"
          @change="handleQuery"
        >
          <el-option
            v-for="(label, value) in stateList"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-row
        :gutter="20"
        type="flex"
        align="middle"
        justify="start"
        class="fr mt5 mb5"
      >
        <el-col :span="1.5">
          <el-button class="fr" type="danger" @click="clearFilter">
            清除所有过滤器
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            icon="el-icon-download"
            @click="handleMultipleExport"
          >
            批量导出
          </el-button>
        </el-col>
        <!-- <el-col :span="1.5">
          <el-button
            type="success"
            icon="el-icon-download"
            @click="handleExport"
          >
            全部导出
          </el-button>
        </el-col> -->
        <el-col :span="1.5">
          <el-button type="warning" @click="handleTypeIn"> 批量修改 </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="info" @click="handleDeal"> 批量处理 </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button :type="isWaitOrAllType" @click="handleSeeWaitOrAllData">
            {{ isWaitOrAllTxt }}
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
            新增
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      ref="afterSaleRef"
      class="afterSaleBox"
      v-loading="loading"
      :data="brandList"
      :height="tableHeight()"
      @cell-click="cellClick"
      :cell-style="cellStyle"
      row-key="id"
      @selection-change="handleSelectionChange"
      border
    >
      <el-table-column
        type="selection"
        width="55"
        :reserve-selection="true"
        align="center"
      />
      <el-table-column
        label="客诉日期"
        prop="returnDate"
        align="center"
        width="90"
        column-key="returnDate"
        :filters="getFiltersData('returnDate')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      />
      <el-table-column
        label="问题状态"
        prop="status"
        align="center"
        width="90"
        column-key="status"
        :filters="
          handleDataFilter({
            '0': 'OPEN',
            '1': 'CLOSE',
          })
        "
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <template slot-scope="{ row }">
          <el-tag v-if="row.status === 0" type="danger">OPEN</el-tag>
          <el-tag v-else type="success">CLOSE</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="不良仪表去向"
        prop="direction"
        align="center"
        width="115"
        column-key="direction"
        :filters="handleDataFilter(modelDirList)"
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <template slot-scope="{ row }">
          <el-tag :type="directionListClass(modelDirList, row.direction)">
            {{ directionLabel(modelDirList, row.direction) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="产品SN"
        prop="sn"
        align="center"
        column-key="sn"
        :filters="getFiltersData('sn')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <template slot-scope="{ row }">
          <el-link @click.stop="toPage(row.sn)">{{ row.sn }}</el-link>
        </template>
      </el-table-column>
      <el-table-column
        label="客户名称"
        prop="customerName"
        align="center"
        column-key="customerName"
        :filters="getFiltersData('customerName')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      />
      <el-table-column
        label="品类"
        prop="categoryName"
        align="center"
        column-key="categoryName"
        :filters="getFiltersData('categoryName')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      />
      <el-table-column
        label="型号"
        prop="computerName"
        align="center"
        column-key="computerName"
        :filters="getFiltersData('computerName')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <span slot-scope="{ row }" v-NoData="row.computerName"></span>
      </el-table-column>
      <el-table-column
        label="客诉现象"
        prop="result"
        align="center"
        column-key="result"
        :filters="getFiltersData('result')"
        :filter-method="filterHandler"
        filter-placement="bottom"
        show-overflow-tooltip
      />
      <el-table-column
        label="客退清单"
        prop="inventory"
        align="center"
        min-width="110"
      >
        <template slot-scope="{ row }">
          <div class="inventory-box">
            <el-tag
              v-for="(item, index) in setInventory(row.inventory)"
              :key="index"
            >
              {{ item }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="客退方"
        prop="returnParty"
        align="center"
        column-key="returnParty"
        :filters="getFiltersData('returnParty')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      />
      <el-table-column
        label="处理进展"
        prop="state"
        align="center"
        width="90"
        column-key="state"
        :filters="handleDataFilter(stateList)"
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <template slot-scope="{ row }">
          <span v-if="row.state === 1" class="text-orange">处理类型</span>
          <span v-if="row.state === 2" class="text-red">现象复测</span>
          <span v-if="row.state === 3" class="text-blue">分类处理</span>
          <span v-if="row.state === 4" class="text-cyan">问题处理</span>
          <span v-if="row.state === 5" class="text-yellow">维修处理</span>
          <span v-if="row.state === 6" class="text-yellow">返厂处理</span>
          <span v-if="row.state === 7" class="text-green">处理完成</span>
        </template>
      </el-table-column>
      <el-table-column
        label="处理人"
        prop="handleName"
        align="center"
        width="80"
        column-key="handleName"
        :filters="getFiltersData('handleName')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <template slot-scope="{ row }">
          <span v-if="row.state === 7" class="text-green">已完成</span>
          <span v-if="row.state === 6 && !row.handleName" class="text-red">
            无
          </span>
          <span v-else>{{ row.handleName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="是否异常"
        prop="isProblem"
        align="center"
        width="90"
        column-key="isProblem"
        :filters="
          handleDataFilter({
            0: '是',
            1: '否',
          })
        "
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <template slot-scope="{ row }">
          <el-tag v-if="row.isProblem === 0" type="primary">是</el-tag>
          <el-tag v-else type="danger">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="问题根因"
        prop="rootMatter"
        align="center"
        column-key="rootMatter"
        :filters="getFiltersData('rootMatter')"
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <span slot-scope="scope" v-NoData="scope.row.rootMatter"></span>
      </el-table-column>
      <el-table-column
        label="根因分类"
        prop="rootMatterType"
        align="center"
        column-key="rootMatterType"
        :filters="handleDataFilter(rootClassify)"
        :filter-method="filterHandler"
        filter-placement="bottom"
      >
        <span
          slot-scope="scope"
          v-NoData="directionLabel(rootClassify, scope.row.rootMatterType)"
        ></span>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160">
        <template slot-scope="{ row }">
          <div class="flex justify-center align-center">
            <el-button class="text-blue" type="text" @click="handleUpdate(row)">
              编辑
            </el-button>
            <el-tooltip
              v-if="isHandlerType(row)"
              effect="dark"
              content="处理类型人员确认中"
              placement="top-end"
            >
              <el-button
                type="text"
                class="text-orange"
                @click="handleProblem(row)"
              >
                处理
              </el-button>
            </el-tooltip>
            <el-tooltip
              v-if="isRetester(row)"
              effect="dark"
              content="现象复测人员确认中"
              placement="top-end"
            >
              <el-button
                type="text"
                class="text-orange"
                @click="handleProblem(row)"
              >
                处理
              </el-button>
            </el-tooltip>
            <el-tooltip
              v-if="isClassifiedBy(row)"
              effect="dark"
              content="分类处理人员确认中"
              placement="top-end"
            >
              <el-button
                type="text"
                class="text-orange"
                @click="handleProblem(row)"
              >
                处理
              </el-button>
            </el-tooltip>
            <el-tooltip
              v-if="isHandlerBy(row)"
              effect="dark"
              content="问题处理人员确认中"
              placement="top-end"
            >
              <el-button
                type="text"
                class="text-orange"
                @click="handleProblem(row)"
              >
                处理
              </el-button>
            </el-tooltip>
            <el-tooltip
              v-if="isServiceBy(row)"
              effect="dark"
              content="维修处理人员确认中"
              placement="top-end"
            >
              <el-button
                type="text"
                class="text-orange"
                @click="handleProblem(row)"
              >
                处理
              </el-button>
            </el-tooltip>
            <el-tooltip
              v-if="isWarehousingBy(row)"
              effect="dark"
              content="返厂处理人员确认中"
              placement="top-end"
            >
              <el-button
                type="text"
                class="text-orange"
                @click="handleProblem(row)"
              >
                处理
              </el-button>
            </el-tooltip>
            <el-dropdown size="mini" class="margin-left-xs">
              <span class="el-dropdown-link">
                <span class="text-green" style="font-size: 12px">更多操作</span
                ><i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>
                  <el-button type="text" @click="handleDetail(row)">
                    详情
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button type="text" @click="handleDelete(row)">
                    删除
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item v-if="row.video">
                  <el-button type="text" @click="urlDownload(row.video)">
                    视频下载
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item v-if="!Is_Empty(row.rootMatter)">
                  <el-button type="text" @click="handleClose(row)">
                    {{ isStatusTxt(row.status) }}
                  </el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :ls="[50, 100, 200]"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <!-- 新增、修改 -->
    <AddSale
      ref="isAddSaleRef"
      :visible.sync="isSaleAddDia"
      :dictList="dictList"
      :modelDirList="modelDirList"
      :pmDictListOptions="pmDictListOptions"
      :rootClassify="rootClassify"
    />

    <!-- 详情 -->
    <after-detail
      ref="isAfterDetailRef"
      :visible.sync="isAfterDetailDia"
      :rootClassify="rootClassify"
      :directionLabel="directionLabel"
    />

    <!-- 处理 -->
    <handle-problem
      ref="isHandleProblemRef"
      :visible.sync="isHandleProblemDia"
      :handleProblemData="handleProblemData"
      @clearSaleSelection="clearSaleSelection"
    />

    <!-- 批量物流录入 -->
    <sale-info
      :visible.sync="isSaleInfoFlag"
      :saleIdList="saleIdList"
      :modelDirList="modelDirList"
      @clearSaleSelection="clearSaleSelection"
    />
    <!-- 当前处理进展 -->
    <deal-progress ref="isDealProgressRef" :visible.sync="isDealProgressDia" />
  </div>
</template>

<script>
import {
  afterList,
  saleDelete,
  saleOperation,
  saleExport,
  afterMultipleDownload,
} from "@/api/third/sale";
import { mapGetters } from "vuex";
import { memberDictUser } from "@/api/system/user";
import FlipDown from "vue-flip-down";
import commonData from "@/mixins/commonData";

export default {
  name: "AfterSale",
  mixins: [commonData],
  components: {
    FlipDown,
    AddSale: () => import("./components/addSale"),
    AfterDetail: () => import("./components/afterDetail"),
    HandleProblem: () => import("./components/handleProblem"),
    DealProgress: () => import("./components/dealProgress"),
    SaleInfo: () => import("./components/saleInfo"),
  },
  data() {
    return {
      form: {},
      urls: [],
      // 遮罩层
      loading: true,
      authDialogVisible: false,
      // 新增、修改弹窗
      isSaleAddDia: false,
      // 详情弹窗
      isAfterDetailDia: false,
      // 处理
      isHandleProblemDia: false,
      handleProblemData: {},
      // 当前处理进展
      isDealProgressDia: false,
      // 待处理 、 全部
      isWaitDispose: true,
      //
      isSaleInfoFlag: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      isSaleIdFlag: false,
      // 总条数
      total: 0,
      brandList: [],
      // 品类
      dictList: [],
      // 仪表去向
      modelDirList: [],
      // 根因分类
      rootClassify: [],
      // 售后ID
      saleIdList: [],
      uploadIds: [],
      multipleList: [],
      // 批量处理ID
      multipleDealIds: [],
      // 处理进展
      stateList: {
        1: "处理类型",
        2: "现象复测",
        3: "分类处理",
        4: "问题处理",
        5: "维修处理",
        6: "返厂处理",
        7: "处理完成",
      },
      options: [
        {
          label: "待处理",
          value: 0,
        },
        {
          label: "处理中",
          value: 1,
        },
        {
          label: "已处理",
          value: 2,
        },
        {
          label: "已驳回",
          value: 3,
        },
      ],
      pmDictListOptions: [],
      // 查询参数
      queryParams: {
        p: 1,
        l: 50,
        returnDate: undefined,
        customerName: undefined,
        categoryName: undefined,
        computerName: undefined,
        sn: undefined,
        status: undefined,
        state: undefined,
      },
    };
  },
  computed: {
    ...mapGetters(["userId", "nickName"]),
    setInventory() {
      return (inventory) => {
        if (inventory) {
          return JSON.parse(inventory);
        }
      };
    },
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
        if (!this.Is_Empty(direction)) {
          const directionData = this.directionDir(dataList, direction);
          return directionData[0] && directionData[0].dictLabel;
        }
      };
    },
    directionListClass() {
      return (dataList, direction) => {
        const directionData = this.directionDir(dataList, direction);
        const tagType = directionData[0] && directionData[0].listClass;
        return tagType === "primary" ? "" : tagType;
      };
    },
    isStatusTxt() {
      return (status) => {
        return status === 0 ? "关闭" : "打开";
      };
    },
    isWaitOrAllTxt() {
      return this.isWaitDispose ? "待处理" : "全部";
    },
    isWaitOrAllType() {
      return this.isWaitDispose ? "danger" : "success";
    },
    // 处理类型人员确认中
    isHandlerType() {
      return ({ handlerType, state }) => {
        return +handlerType === this.userId && state === 1;
      };
    },
    // 现象复测人员确认中
    isRetester() {
      return ({ retester, state }) => {
        return +retester === this.userId && state === 2;
      };
    },
    // 分类处理人员确认中
    isClassifiedBy() {
      return ({ classifiedBy, state }) => {
        return +classifiedBy === this.userId && state === 3;
      };
    },
    // 问题处理人员确认中
    isHandlerBy() {
      return ({ handlerBy, state }) => {
        return +handlerBy === this.userId && state === 4;
      };
    },
    // 维修处理人员确认中
    isServiceBy() {
      return ({ serviceBy, state }) => {
        return +serviceBy === this.userId && state === 5;
      };
    },
    // 返厂处理人员确认中
    isWarehousingBy() {
      return ({ warehousing, state }) => {
        return +warehousing === this.userId && state === 6;
      };
    },
    // 协议查询条件
    handleDataFilter() {
      return (data) => {
        try {
          if (data instanceof Object) {
            if (Array.isArray(data)) {
              return data.map(({ dictLabel, dictValue }) => {
                return { text: dictLabel, value: +dictValue };
              });
            } else {
              return Object.entries(data)
                .map(([key, value]) => {
                  return { text: value, value: +key };
                })
                .sort((a, b) => a.text - b.text);
            }
          } else {
            throw new Error("传的值类型必须是对象或数组");
          }
        } catch (error) {
          console.error(error);
        }
      };
    },
    // 获取每项的筛选值
    getFiltersData() {
      return (key) => {
        let newList = [];
        let filterList = [];
        this.brandList.forEach((item) => {
          if (!this.Is_Empty(item[key]) && !filterList.includes(item[key])) {
            filterList.push(item[key]);
            newList.push({
              text: item[key],
              value: item[key],
            });
          }
        });

        return newList.sort((a, b) => a.text - b.text);
      };
    },
  },
  created() {
    let { name } = this.$route.query;
    if (name) {
      this.queryParams.product = name;
    }
    this.getMemberDictUser();
    this.getModelDirData();
    this.getRootClassifyData();
    this.getList();
  },
  methods: {
    async getMemberDictUser() {
      try {
        const { data } = await memberDictUser();
        this.pmDictListOptions = data;
      } catch (error) {
        console.error(error);
      }
    },
    // 不良仪表去向
    async getModelDirData() {
      try {
        const { data } = await this.getDicts("sys_model_direction");
        this.modelDirList = data;
      } catch (error) {
        console.error(error);
      }
    },
    // 根因分类
    async getRootClassifyData() {
      try {
        const { data } = await this.getDicts("sys_root_classify");
        this.rootClassify = data;
      } catch (error) {
        console.error(error);
      }
    },
    handleSelectionChange(selection) {
      this.multipleList = selection;
      this.saleIdList = selection.map((item) => item.id);
      this.uploadIds = selection.map((item) => item.id);
    },
    // 批量修改物流信息
    handleTypeIn() {
      if (!this.saleIdList.length) {
        return this.msgError("请选择批量修改物流项");
      }
      this.isSaleIdFlag = true;
      this.isSaleInfoFlag = true;
    },
    // 批量处理
    handleDeal() {
      let { state } = this.queryParams;

      if (this.isWaitDispose) {
        return this.msgError("请先点击“待处理”按钮");
      }

      if (this.Is_Empty(state)) {
        return this.msgError("请先选择“处理进展”筛选项");
      }

      state = +state;

      let multipleDealIds = this.multipleList
        .filter(
          (item) => item.state === state && item.handleName === this.nickName
        )
        .map((item) => item.id);

      if (!multipleDealIds.length) {
        return this.msgError("请选择批量处理物流项");
      }

      this.isHandleProblemDia = true;
      this.isSaleIdFlag = false;
      this.$refs.isHandleProblemRef.isMultipleDeal = true;

      if (state === 5) {
        this.handleProblemData = {
          state,
          materialLossList: [
            {
              materialName: "",
              materialCode: "",
              materialNum: "",
            },
          ],
          list: multipleDealIds,
        };
      } else {
        this.handleProblemData = { state, list: multipleDealIds };
      }
    },
    clearSaleSelection() {
      this.$refs.afterSaleRef.clearSelection();
    },
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      const dataInfo = {
        ...this.queryParams,
        my: this.isWaitDispose ? "" : this.nickName,
      };
      afterList(dataInfo).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 新增
    handleAdd() {
      this.isSaleAddDia = true;
    },
    // 修改
    handleUpdate(row) {
      this.isSaleAddDia = true;
      let { logisticsEntity, inventory, categoryId, computerId, sn } = row;
      let dataCopy;
      if (this.Is_Empty(logisticsEntity)) {
        dataCopy = {
          ...row,
          logisticsEntity: {},
          inventory: JSON.parse(inventory),
        };
      } else {
        dataCopy = { ...row, inventory: JSON.parse(inventory) };
      }
      const list = [
        {
          categoryId,
          computerId,
          sn,
        },
      ];
      this.$refs.isAddSaleRef.form = { ...dataCopy, list };
      this.$refs.isAddSaleRef.active =
        dataCopy.state === 7 ? 7 : dataCopy.state - 1;
    },
    // 详情
    handleDetail(row) {
      this.isAfterDetailDia = true;
      this.$refs.isAfterDetailRef.getAfterInfo(row.id);
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删产品SN为"' + row.sn + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return saleDelete([row.id]);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    // 关闭问题
    handleClose(row) {
      const { status } = row;
      this.$confirm(`是否${this.isStatusTxt(status)}该问题?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return saleOperation({ id: row.id, status: status === 0 ? 1 : 0 });
        })
        .then(() => {
          this.getList();
          this.msgSuccess(`问题${this.isStatusTxt(status)}成功`);
        });
    },
    // 待处理、全部
    handleSeeWaitOrAllData() {
      this.isWaitDispose = !this.isWaitDispose;
      this.getList();
    },
    // 处理问题
    handleProblem(row) {
      this.isHandleProblemDia = true;
      this.$refs.isHandleProblemRef.isMultipleDeal = false;
      if (row.state === 5) {
        this.handleProblemData = {
          ...row,
          materialLossList: [
            {
              materialName: "",
              materialCode: "",
              materialNum: "",
            },
          ],
        };
      } else {
        this.handleProblemData = { ...row };
      }
    },
    // 查看处理进展
    seeDealProgress({ id, state }) {
      this.isDealProgressDia = true;
      this.$refs.isDealProgressRef.getAfterHandleDetail(id, state);
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
    toPage(sn) {
      this.$router.push(`/www/PartInfoView/production?sn=${sn}`);
    },
    cellClick(row, column, cell, event) {
      const { label } = column;
      switch (label) {
        case "处理进展":
          this.seeDealProgress(row);
          break;
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      const { label } = column;
      if (label === "产品SN" || label === "处理进展") {
        return `cursor: pointer;`;
      }
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = {
        ...this.queryParams,
        my: this.isWaitDispose ? "" : this.nickName,
      };
      this.$confirm("是否确认导出所有售后支持数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return saleExport(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
    },
    /** 批量导出按钮操作 */
    handleMultipleExport() {
      if (!this.uploadIds.length) return this.msgError("请选择导出项");

      this.downloadFile({
        aFn: afterMultipleDownload,
        queryParams: this.uploadIds,
      });
    },
    /** 每项筛选方法 */
    filterHandler(value, row, column) {
      const property = column["property"];

      return row[property] == value;
    },
    /** 清除所有过滤器  */
    clearFilter() {
      this.$refs.afterSaleRef.clearFilter();
    },
  },
};
</script>
<style lang="scss" scoped>
.inventory-box {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 5px;
  justify-content: center;
}
</style>
