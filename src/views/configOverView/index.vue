<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属品类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          @change="changeCategory"
          filterable
          allow-create
          clearable
          placeholder="请选择品类"
          style="width: 160px"
        >
          <el-option
            v-for="dict in dictList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="仪表型号" prop="computerId">
        <el-select
          :loading="isCLoading"
          filterable
          remote
          clearable
          v-model="queryParams.computerId"
          placeholder="请选择仪表型号"
          @change="getList"
          :remote-method="getComputerNameList"
          style="width: 160px"
        >
          <el-option
            v-for="dict in computerOptions"
            :key="dict.model"
            :label="dict.name"
            :value="dict.model"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="客户名称" prop="customerName">
        <el-autocomplete
          v-model="queryParams.customerName"
          clearable
          style="width: 140px"
          :fetch-suggestions="querySearchAsync"
          placeholder="请选择客户名称"
        ></el-autocomplete>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="brandList" :height="tableHeight()">
      <el-table-column label="操作" align="center" width="90">
        <template slot-scope="{ row }">
          <div class="flex flex-direction">
            <Tooltip
              v-if="row.state === 0"
              class="text-orange"
              icon="el-icon-coordinate"
              content="审核"
              v-hasPermi="['product:configOverView:check']"
              @click="handleAuthChange(row)"
            />
            <Tooltip
              class="margin-0"
              icon="el-icon-position"
              content="产品族谱"
              v-hasPermi="['product:configOverView:btn']"
              @click="
                handleNameToPage('ProductFamily', {
                  categoryId: row.categoryId,
                  computerId: row.computerId,
                })
              "
            />

            <template v-if="row.state === 1">
              <el-tag type="success">通过</el-tag>
            </template>
            <template v-else-if="row.state === 2">
              <el-tag type="danger">未通过</el-tag>
            </template>
            <template v-else>
              <el-tag type="warning">未审核</el-tag>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="品类"
        prop="category"
        align="center"
        width="150"
      />
      <el-table-column
        label="型号"
        prop="computerName"
        align="center"
        width="150"
      >
        <span slot-scope="scope" v-NoData="scope.row.computerName"></span>
      </el-table-column>
      <el-table-column
        label="规格书"
        prop="specification"
        align="center"
        width="120"
      >
        <template slot-scope="{ row }">
          <preview-img
            width="60px"
            height="60px"
            :isDisBadge="false"
            :url="row.specification"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="客户"
        prop="customerName"
        align="center"
        width="150"
      >
        <span slot-scope="scope" v-NoData="scope.row.customerName"></span>
      </el-table-column>
      <el-table-column
        label="客户料号"
        prop="customerMaterialNum"
        align="center"
        width="150"
      >
        <span
          slot-scope="scope"
          v-NoData="scope.row.customerMaterialNum"
        ></span>
      </el-table-column>
      <el-table-column
        label="实际客户车名"
        prop="customerCarName"
        align="center"
        width="150"
      >
        <span slot-scope="scope" v-NoData="scope.row.customerCarName"></span>
      </el-table-column>
      <el-table-column label="车名" prop="ebikeName" align="center" width="150">
        <span
          slot-scope="scope"
          v-NoData="dicts_ebike[scope.row.ebikeName]"
        ></span>
      </el-table-column>
      <el-table-column
        label="客户车型编码"
        prop="carModel"
        align="center"
        width="150"
      >
        <span slot-scope="scope" v-NoData="scope.row.carModel"></span>
      </el-table-column>
      <el-table-column
        label="控制器接头"
        prop="controlConnect"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.controlConnect"></span>
      </el-table-column>
      <el-table-column
        label="不含头控制器出线线长(mm)"
        align="center"
        width="200"
      >
        <template slot-scope="{ row }">
          <span class="text-green" v-if="row.controlHead === 1">（含头）</span>

          <p>
            <span v-NoData="row.notControllerJointString"></span>
          </p>
        </template>
      </el-table-column>
      <el-table-column
        label="按键【仪表端】接头"
        align="center"
        prop="modelEndHead"
        width="150"
      >
        <span slot-scope="scope" v-NoData="scope.row.modelEndHead"></span>
      </el-table-column>
      <el-table-column
        label="按键【按键端】接头"
        align="center"
        prop="keyEndHead"
        width="150"
      >
        <span slot-scope="scope" v-NoData="scope.row.keyEndHead"></span>
      </el-table-column>
      <el-table-column
        label="通讯方式"
        prop="serialLevel"
        align="center"
        width="120"
      >
        <template v-slot="{ row }">
          <template v-if="isShow(row.serialLevel)">
            {{ serialLevelData[row.serialLevel] }}
          </template>
          <template v-else> --- </template>
        </template>
      </el-table-column>
      <el-table-column
        label="按键型号"
        prop="keyType"
        align="center"
        width="120"
      >
        <template v-slot="{ row }">
          <template v-if="isShow(row.keyType)">
            {{ dicts_keyType_list[row.keyType] }}
          </template>
          <template v-else> --- </template>
        </template>
      </el-table-column>
      <el-table-column
        label="按键线长(mm)"
        prop="keyLineLen"
        align="center"
        width="120"
      >
        <template slot-scope="{ row }">
          <span class="text-green" v-if="row.keyLineType === 1">（含头）</span>
          <p>
            <span v-NoData="row.keyLineLen"></span>
          </p>
        </template>
      </el-table-column>
      <el-table-column
        label="按键图片"
        prop="keyImgUrl"
        align="center"
        width="120"
      >
        <template slot-scope="{ row }">
          <preview-img width="60px" height="60px" :url="row.keyImgUrl" />
        </template>
      </el-table-column>
      <el-table-column
        label="开机logo"
        prop="powerLogo"
        align="center"
        width="120"
      >
        <template slot-scope="{ row }">
          <preview-img width="60px" height="60px" :url="row.powerLogo" />
        </template>
      </el-table-column>
      <el-table-column
        label="限速范围"
        prop="speedLimitRang"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.speedLimitRang"></span>
      </el-table-column>
      <el-table-column
        label="车把尺寸"
        prop="handlebarSize"
        align="center"
        width="120"
      >
        <span
          slot-scope="scope"
          v-NoData="handlebarSizeData[scope.row.handlebarSize]"
        ></span>
      </el-table-column>
      <el-table-column label="协议" prop="agreement" align="center" width="120">
        <span
          slot-scope="scope"
          v-NoData="dicts_agreement[scope.row.agreement]"
        ></span>
      </el-table-column>
      <el-table-column
        label="测速磁钢数"
        prop="speedSteel"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.speedSteel"></span>
      </el-table-column>
      <el-table-column
        label="车轮宽度"
        prop="tiresSize"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.tiresSize"></span>
      </el-table-column>
      <el-table-column
        label="助力限速门限(km/h)"
        prop="assistLimit"
        align="center"
        width="140"
      >
        <span slot-scope="scope" v-NoData="scope.row.assistLimit"></span>
      </el-table-column>
      <el-table-column
        label="轮径"
        prop="wheelDiameter"
        align="center"
        width="120"
      >
        <span
          slot-scope="scope"
          v-NoData="wheelDiameterData[scope.row.wheelDiameter]"
        ></span>
      </el-table-column>
      <el-table-column
        label="周长(mm)"
        prop="perimeter"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.perimeter"></span>
      </el-table-column>
      <el-table-column label="电压" prop="voltage" align="center" width="120">
        <span slot-scope="scope" v-NoData="scope.row.voltage"></span>
      </el-table-column>
      <el-table-column
        label="缓启动"
        prop="slowStart"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.slowStart"></span>
      </el-table-column>
      <el-table-column label="显示单位" prop="unit" align="center" width="120">
        <span slot-scope="scope" v-NoData="dicts_unit[scope.row.unit]"></span>
      </el-table-column>
      <el-table-column label="电量计算" prop="power" align="center" width="120">
        <span slot-scope="scope" v-NoData="dicts_power[scope.row.power]"></span>
      </el-table-column>
      <el-table-column label="APP" prop="app" align="center" width="120">
        <el-tag
          v-if="isShow(row.app)"
          slot-scope="{ row }"
          :type="row.app === 1 ? 'success' : 'danger'"
        >
          {{ row.app === 1 ? "YES" : "NO" }}
        </el-tag>
        <template v-else> --- </template>
      </el-table-column>
      <el-table-column label="USB" prop="usb" align="center" width="120">
        <el-tag
          v-if="isShow(row.usb)"
          slot-scope="{ row }"
          :type="row.usb === 1 ? 'success' : 'danger'"
        >
          {{ row.usb === 1 ? "YES" : "NO" }}
        </el-tag>
        <template v-else> --- </template>
      </el-table-column>
      <el-table-column label="蓝牙" prop="bluetooth" align="center" width="120">
        <el-tag
          v-if="isShow(row.bluetooth)"
          slot-scope="{ row }"
          :type="row.bluetooth === 1 ? 'success' : 'danger'"
        >
          {{ row.bluetooth === 1 ? "YES" : "NO" }}
        </el-tag>
      </el-table-column>
      <el-table-column
        label="推车助力"
        prop="driveAssist"
        align="center"
        width="120"
      >
        <el-tag
          v-if="isShow(row.driveAssist)"
          slot-scope="{ row }"
          :type="row.driveAssist === 1 ? 'success' : 'danger'"
        >
          {{ row.driveAssist === 1 ? "YES" : "NO" }}
        </el-tag>
      </el-table-column>
      <el-table-column
        label="恢复出厂设置"
        prop="factoryReset"
        align="center"
        width="120"
      >
        <el-tag
          v-if="isShow(row.factoryReset)"
          slot-scope="{ row }"
          :type="row.factoryReset === 0 ? 'success' : 'danger'"
        >
          {{ row.factoryReset === 0 ? "YES" : "NO" }}
        </el-tag>
      </el-table-column>
      <el-table-column
        label="转把分档"
        prop="rotateHandle"
        align="center"
        width="120"
      >
        <el-tag
          v-if="isShow(row.rotateHandle)"
          slot-scope="{ row }"
          :type="row.rotateHandle === 1 ? 'success' : 'danger'"
        >
          {{ row.rotateHandle === 1 ? "YES" : "NO" }}
        </el-tag>
      </el-table-column>
      <el-table-column
        label="助力正反"
        prop="assist"
        align="center"
        width="120"
      >
        <template v-if="isShow(row.assist)" slot-scope="{ row }">
          {{ row.assist === 0 ? "助力正" : "助力反" }}
        </template>
      </el-table-column>
      <el-table-column
        label="转把限速"
        prop="rotateHandleSpeedLimit"
        align="center"
        width="120"
      >
        <template
          v-if="isShow(row.rotateHandleSpeedLimit)"
          slot-scope="{ row }"
        >
          {{ row.rotateHandleSpeedLimit === 0 ? "正常" : "限速6Km" }}
        </template>
      </el-table-column>
      <el-table-column
        label="默认档位"
        prop="defaultGear"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.defaultGear"></span>
      </el-table-column>
      <el-table-column
        label="最高档位"
        prop="topGear"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.topGear"></span>
      </el-table-column>
      <el-table-column
        label="速度平滑等级"
        prop="smoothLevel"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.smoothLevel"></span>
      </el-table-column>
      <el-table-column
        label="电量变化时间(s)"
        prop="batteryVoltageChangeTime"
        align="center"
        width="120"
      >
        <span
          slot-scope="scope"
          v-NoData="scope.row.batteryVoltageChangeTime"
        ></span>
      </el-table-column>
      <el-table-column
        label="总线故障超时时间(s)"
        prop="allLineErrTimeOut"
        align="center"
        width="150"
      >
        <span slot-scope="scope" v-NoData="scope.row.allLineErrTimeOut"></span>
      </el-table-column>
      <el-table-column
        label="背光亮度"
        prop="backlightBrightness"
        align="center"
        width="120"
      >
        <span
          slot-scope="scope"
          v-NoData="backlightBrightnessList[scope.row.backlightBrightness]"
        ></span>
      </el-table-column>
      <el-table-column label="Logo界面" prop="logo" align="center" width="120">
        <span slot-scope="scope" v-NoData="dicts_logo[scope.row.logo]"></span>
      </el-table-column>
      <el-table-column
        label="休眠时间(min)"
        prop="sleepTime"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.sleepTime"></span>
      </el-table-column>
      <el-table-column
        label="助力档位数"
        prop="powerGear"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.powerGear"></span>
      </el-table-column>
      <el-table-column
        label="助力开始磁钢数"
        prop="assistStartMagnetNumber"
        align="center"
        width="120"
      >
        <span
          slot-scope="scope"
          v-NoData="scope.row.assistStartMagnetNumber"
        ></span>
      </el-table-column>
      <el-table-column
        label="助力比例"
        prop="assistPercentage"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.assistPercentage"></span>
      </el-table-column>
      <el-table-column
        label="显示轮径"
        prop="showWheelsize"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.showWheelsize"></span>
      </el-table-column>
      <el-table-column
        label="系统电压(V)"
        prop="voltage"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.voltage"></span>
      </el-table-column>
      <el-table-column
        label="限流门限(A)"
        prop="currentlimiting"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.currentlimiting"></span>
      </el-table-column>
      <el-table-column
        label="欠压门限(V)"
        prop="undervoltage"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.undervoltage"></span>
      </el-table-column>
      <el-table-column
        label="蜂鸣器"
        prop="buzzerSwitch"
        align="center"
        width="120"
      >
        <el-tag
          v-if="isShow(row.buzzerSwitch)"
          slot-scope="{ row }"
          :type="row.buzzerSwitch === 0 ? 'success' : 'danger'"
        >
          {{ row.buzzerSwitch === 0 ? "YES" : "NO" }}
        </el-tag>
      </el-table-column>
      <el-table-column
        label="高速蜂鸣器提醒"
        prop="highSpeedBuzzerRemind"
        align="center"
        width="120"
      >
        <span
          slot-scope="scope"
          v-NoData="scope.row.highSpeedBuzzerRemind"
        ></span>
      </el-table-column>
      <el-table-column
        label="定速巡航功能"
        prop="cruise"
        align="center"
        width="120"
      >
        <el-tag
          v-if="isShow(row.cruise)"
          slot-scope="{ row }"
          :type="row.cruise === 0 ? 'success' : 'danger'"
        >
          {{ row.cruise === 0 ? "YES" : "NO" }}
        </el-tag>
      </el-table-column>
      <el-table-column
        label="是否开机密码"
        prop="turnOnPasswd"
        align="center"
        width="120"
      >
        <el-tag
          v-if="isShow(row.turnOnPasswd)"
          slot-scope="{ row }"
          :type="row.turnOnPasswd === 0 ? 'success' : 'danger'"
        >
          {{ row.turnOnPasswd === 0 ? "YES" : "NO" }}
        </el-tag>
      </el-table-column>
      <el-table-column
        label="开机密码"
        prop="startupPasswd"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.startupPasswd"></span>
      </el-table-column>
      <el-table-column
        label="是否菜单密码"
        prop="menuPassword"
        align="center"
        width="120"
      >
        <el-tag
          v-if="isShow(row.menuPassword)"
          slot-scope="{ row }"
          :type="row.menuPassword === 0 ? 'success' : 'danger'"
        >
          {{ row.menuPassword === 0 ? "YES" : "NO" }}
        </el-tag>
      </el-table-column>
      <el-table-column
        label="高级菜单密码"
        prop="highMenuPasswd"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.highMenuPasswd"></span>
      </el-table-column>
      <el-table-column
        label="电机功率(W)"
        prop="motorSys"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.motorSys"></span>
      </el-table-column>
      <el-table-column
        label="电池容量"
        prop="batteryCap"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.batteryCap"></span>
      </el-table-column>
      <el-table-column label="SN标签" prop="snTag" align="center" width="120">
        <span slot-scope="scope" v-NoData="scope.row.snTag"></span>
      </el-table-column>
      <el-table-column
        label="创建人"
        prop="createBy"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.createBy"></span>
      </el-table-column>
      <el-table-column
        label="审核人 "
        prop="checkBy"
        align="center"
        width="120"
      >
        <span slot-scope="scope" v-NoData="scope.row.checkBy"></span>
      </el-table-column>
    </el-table>

    <pagination
      v-if="total > 0"
      :total="total"
      :ls="[20, 50, 100, 300, 500]"
      :page.sync="queryParams.p"
      :limit.sync="queryParams.l"
      @pagination="getList"
    />

    <el-dialog
      title="请确认是否通过"
      :visible.sync="authDialogVisible"
      width="40%"
      center
      :close-on-click-modal="false"
    >
      <el-form
        ref="authForm"
        :model="authForm"
        class="form-data"
        :inline="false"
      >
        <el-form-item label="拒审原因">
          <el-input
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            v-model="authForm.msg"
            placeholder="不通过则需要输入原因"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="isSubmitLoading" @click="handleStatusChange(2)">
          不通过
        </el-button>
        <el-button
          type="primary"
          :loading="isSubmitLoading"
          @click="handleStatusChange(1)"
        >
          通过
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { categoryComputerDict, computerNameList } from "@/api/third/fileConfig";
import { listCustomer } from "@/api/third/sample";
import { modelConfigList, modelConfigState } from "@/api/third/testApi";
import commonData from "@/mixins/commonData";

export default {
  name: "ConfigOverview",
  mixins: [commonData],
  components: {
    CategoryComputer: () => import("@/components/CategoryComputer"),
  },
  data() {
    return {
      myCategoryId: "",
      isCLoading: false,
      authDialogVisible: false,
      isSubmitLoading: false,
      authForm: {},
      form: {},
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 用户表格数据
      brandList: [],
      dictList: [],
      categoryOptions: [],
      computerOptions: [],
      // 车把尺寸
      handlebarSizeData: {},
      // 查询参数
      queryParams: {
        p: 1,
        l: 20,
        categoryId: undefined,
        computerId: undefined,
        customerName: undefined,
      },
    };
  },
  computed: {
    isShow() {
      const list = [null, "null", undefined, "undefined", false, "false"];
      return (val) => {
        if (typeof val === "string") {
          return !list.includes(val.toLowerCase());
        } else {
          return !list.includes(val);
        }
      };
    },
  },
  created() {
    // 车把尺寸
    this.getConfigDicts("handleBar_size", "handlebarSizeData");

    categoryComputerDict().then((res) => {
      this.dictList = res.data;
      this.getList();
    });
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      modelConfigList(this.queryParams).then((response) => {
        this.brandList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    changeCategory(val) {
      this.queryParams.computerId = "";

      this.computerOptions = this.dictList.filter(
        (item) => item.id === val
      )[0].computerList;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
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
    handleAuthChange(row) {
      this.authDialogVisible = true;
      this.authForm = row;
    },
    handleStatusChange(state) {
      const data = {};
      if (state === 2) {
        // 不通过 检查原因是否为空
        if (this.Is_Empty(this.authForm.msg)) {
          return this.msgError("不通过原因不能为空");
        }

        data.msg = this.authForm.msg;
      }

      data.id = this.authForm.id;
      data.state = state;
      this.isSubmitLoading = true;
      modelConfigState(data)
        .then((response) => {
          let { code } = response;
          if (code == 200) {
            this.authDialogVisible = false;
            this.msgSuccess("操作成功！");
            this.getList();
          }
        })
        .finally(() => {
          this.isSubmitLoading = false;
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.auth {
  text-align: center;
  margin-bottom: 10px;
}

.width-100-style {
  width: 100%;
}
</style>
