<template>
  <div>
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属品类" prop="categoryId">
        <el-select v-model="queryParams.categoryId" @change="changeCategory" filterable allow-create clearable>
          <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="仪表型号" prop="computerId">
        <el-select v-model="queryParams.computerId" :loading="isCLoading" filterable remote clearable @change="getList"
          :remote-method="getComputerNameList">
          <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.model" />
        </el-select>
      </el-form-item>
      <el-form-item label="客户名称" prop="customerName">
        <select-loadMore v-model="queryParams.customerName" :data="customerNameData.data" :page="customerNameData.page"
          :hasMore="customerNameData.more" dictLabel="name" dictValue="name" :request="getCustomerNameList" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button type="danger" @click="clearFilter">
          清除所有过滤器
        </el-button>

      </el-form-item>

      <el-button class="fr" style="margin-left: 20px;" type="warning" icon="el-icon-download" @click="handleExport"
        v-hasPermi="['config:overview:first:export']">
        导 出
      </el-button>
      <el-button class="fr" type="primary" @click="addDialogChange" v-hasPermi="['config:overview:first:add']">
        新增配置
      </el-button>
      <!-- <el-button class="fr" icon="el-icon-plus" @click="handleParamsCompare">
          对比
        </el-button> -->
    </el-form>

    <el-alert title="表格可通过按住Ctrl + 鼠标左键左右拖动" type="success" show-icon>
    </el-alert>

    <el-table id="drag_table" ref="tableRef" row-key="id" v-loading="loading" :data="brandList"
      :height="tableHeight(-20)" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" fixed :reserve-selection="true" />
      <el-table-column label="操作" align="center" width="100" fixed>
        <template slot-scope="{ row }">
          <div class="flex justify-between">

            <!-- 初审 -->
            <Tooltip v-if="row.state === 0" class="text-orange" icon="el-icon-coordinate" content="待初审"
              v-hasPermi="['config:overview:first:check']" @click="handleAuthChange(row, 1)" />

            <!-- 终审 -->
            <Tooltip v-if="row.state === 1" class="text-orange" icon="el-icon-coordinate" content="待终审"
              v-hasPermi="['config:overview:final:check']" @click="handleAuthChange(row, 2)" />
            <!-- 
            <Tooltip class="margin-0" icon="el-icon-position" content="产品族谱" v-hasPermi="['product:configOverView:btn']"
              @click="
                handleNameToPage('ProductFamily', {
                  categoryId: row.categoryId,
                  computerId: row.computerId,
                })
                " /> -->

            <!-- 配置详情 -->
            <Tooltip class="margin-0" icon="el-icon-s-management" content="配置详情" @click="handleOpenDetail(row)" />
            <Tooltip v-hasPermi="['config:overview:first:edit']" icon="el-icon-edit" content="编辑"
              @click="handleEdit(row)" style="margin-left: 0px;" />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="包装信息" prop="state" align="center" width="100" fixed>
        <template v-slot="{ row }">

          <!-- 包装信息查看 -->
          <Tooltip v-show="row.packagingInfo" class="margin-0" icon="el-icon-view" content="包装信息"
            @click="handleSeePackagingInfo(row)" />
          <!-- 包装信息 -->
          <Tooltip v-hasPermi="['config:overview:first:editPackage']" class="margin-0" icon="el-icon-edit"
            content="编辑包装信息" @click="handleEditPackagingInfo(row)" />
        </template>
      </el-table-column>
      <el-table-column label="审核状态" prop="state" align="center" width="100" fixed>
        <template v-slot="{ row }">
          <template v-if="row.state === 0">
            <el-tag type="danger">未审核</el-tag>
          </template>
          <template v-if="row.state === 1">
            <el-tag type="success">初审通过</el-tag>
          </template>
          <template v-if="row.state === 2">
            <el-tag type="info">初审未通过</el-tag>
          </template>
          <template v-if="row.state === 3">
            <el-tag type="success">终审通过</el-tag>
          </template>
          <template v-if="row.state === 4">
            <el-tag type="info">终审未通过</el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="品类" prop="category" align="center" width="120" fixed column-key="category"
        :filters="getFiltersData('category')" :filter-method="filterHandler" />
      <el-table-column label="型号" prop="computerName" align="center" width="120" fixed column-key="computerName"
        :filters="getFiltersData('computerName')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.computerName"></span>
      </el-table-column>
      <el-table-column label="规格书" prop="specification" align="center" width="120" fixed>
        <template slot-scope="{ row }">
          <preview-img width="45px" height="45px" :isDisBadge="false" :url="row.specification" />
        </template>
      </el-table-column>
      <el-table-column label="是否配置" prop="isStat" align="center" width="120" fixed>
        <template slot-scope="{ row }">
          <el-tag type="success" v-if="row.isSts == 1">是</el-tag>
          <el-tag type="danger" v-else>否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="客户" prop="customerName" align="center" width="120" fixed column-key="customerName"
        :filters="getFiltersData('customerName')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.customerName"></span>
      </el-table-column>
      <el-table-column label="客户料号" prop="customerMaterialNum" align="center" width="120" fixed
        column-key="customerMaterialNum" :filters="getFiltersData('customerMaterialNum')"
        :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.customerMaterialNum" />
      </el-table-column>
      <el-table-column label="描述" prop="desc" align="center" width="120">
        <span slot-scope="scope" v-NoData="scope.row.desc"></span>
      </el-table-column>
      <el-table-column label="SN" prop="sn" align="center" width="120">
        <span slot-scope="scope" v-NoData="scope.row.sn"></span>
      </el-table-column>
      <el-table-column label="pcbaSn" prop="pcbaSn" align="center" width="120">
        <span slot-scope="scope" v-NoData="scope.row.pcbaSn"></span>
      </el-table-column>
      <el-table-column label="实际客户车名" prop="customerCarName" align="center" width="150" column-key="customerCarName"
        :filters="getFiltersData('customerCarName')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.customerCarName"></span>
      </el-table-column>
      <el-table-column label="车名" prop="ebikeName" align="center" width="150" column-key="ebikeName"
        :filters="handleDataFilter(dicts_ebike)" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="dicts_ebike[scope.row.ebikeName]" />
      </el-table-column>
      <el-table-column label="客户车型编码" prop="carModel" align="center" width="150" column-key="carModel"
        :filters="getFiltersData('carModel')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.carModel" />
      </el-table-column>
      <el-table-column label="控制器接头" prop="controlConnect" align="center" width="120" column-key="controlConnect"
        :filters="getFiltersData('controlConnect')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.controlConnect" />
      </el-table-column>
      <el-table-column label="不含头控制器出线线长(mm)" align="center" width="200" prop="notControllerJointString"
        column-key="notControllerJointString" :filters="getFiltersData('notControllerJointString')"
        :filter-method="filterHandler">
        <template slot-scope="{ row }">
          <span class="text-green" v-if="row.controlHead === 1">（含头）</span>

          <p>
            <span v-NoData="row.notControllerJointString"></span>
          </p>
        </template>
      </el-table-column>
      <el-table-column label="按键【仪表端】接头" align="center" prop="modelEndHead" width="160" column-key="modelEndHead"
        :filters="getFiltersData('modelEndHead')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.modelEndHead"></span>
      </el-table-column>
      <el-table-column label="按键【按键端】接头" align="center" prop="keyEndHead" width="160" column-key="keyEndHead"
        :filters="getFiltersData('keyEndHead')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.keyEndHead"></span>
      </el-table-column>
      <el-table-column label="通讯协议" prop="sysProtocol" align="center" width="120" column-key="sysProtocol"
        :filters="handleDataFilter(dicts_protocol_list)" :filter-method="filterHandler">
        <span slot-scope="{ row }" v-NoData="dicts_protocol_list[row.sysProtocol]" />
      </el-table-column>

      <el-table-column label="通讯方式" prop="serialLevel" align="center" width="120" column-key="serialLevel"
        :filters="handleDataFilter(serialLevelData)" :filter-method="filterHandler">
        <span slot-scope="{ row }" v-NoData="serialLevelData[row.serialLevel]" />
      </el-table-column>

      <el-table-column label="串口波特率" prop="baudRate" align="center" width="120" column-key="baudRate"
        :filters="handleDataFilter(baudRateList)" :filter-method="filterHandler">
        <span slot-scope="{ row }" v-NoData="baudRateList[row.baudRate]" />
      </el-table-column>

      <el-table-column label="CAN波特率" prop="canRate" align="center" width="120" column-key="canRate"
        :filters="handleDataFilter(canRateList)" :filter-method="filterHandler">
        <template slot-scope="{ row }">
          <span v-if="row.serialLevel === 2" v-NoData="canRateList[row.canRate]" />
          <span v-else>- - -</span>
        </template>
      </el-table-column>

      <el-table-column label="帧类型" prop="msgType" align="center" width="120" column-key="msgType"
        :filters="handleDataFilter(msgTypeData)" :filter-method="filterHandler">
        <template slot-scope="{ row }">
          <span v-if="row.serialLevel === 2" v-NoData="msgTypeData[row.msgType]" />
          <span v-else>- - -</span>
        </template>
      </el-table-column>

      <el-table-column label="按键型号" prop="keyType" align="center" width="120" column-key="keyType"
        :filters="handleDataFilter(dicts_keyType_list)" :filter-method="filterHandler">
        <span slot-scope="{ row }" v-NoData="dicts_keyType_list[row.keyType]" />
      </el-table-column>
      <el-table-column label="按键线长(mm)" prop="keyLineLen" align="center" width="120" column-key="keyLineLen"
        :filters="getFiltersData('keyLineLen')" :filter-method="filterHandler">
        <template slot-scope="{ row }">
          <span class="text-green" v-if="row.keyLineType === 1">（含头）</span>
          <p>
            <span v-NoData="row.keyLineLen"></span>
          </p>
        </template>
      </el-table-column>
      <el-table-column label="按键图片" prop="keyImgUrl" align="center" width="120">
        <template slot-scope="{ row }">
          <preview-img width="45px" height="45px" :url="row.keyImgUrl" />
        </template>
      </el-table-column>
      <el-table-column label="开机logo" prop="powerLogo" align="center" width="120">
        <template slot-scope="{ row }">
          <preview-img width="45px" height="45px" :url="row.powerLogo" />
        </template>
      </el-table-column>
      <el-table-column label="标签规则" prop="labelRule" align="center" width="120" column-key="labelRule"
        :filters="handleDataFilter(labelRuleData)" :filter-method="filterHandler">
        <span slot-scope="{ row }" v-NoData="labelRuleData[row.labelRule]" />
      </el-table-column>
      <el-table-column label="标签图片" prop="labelRuleImg" align="center" width="120">
        <template slot-scope="{ row }">
          <preview-img width="45px" height="45px" :url="row.labelRuleImg" />
        </template>
      </el-table-column>
      <el-table-column label="限速范围" prop="speedLimitRang" align="center" width="120" column-key="speedLimitRang"
        :filters="getFiltersData('speedLimitRang')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.speedLimitRang"></span>
      </el-table-column>
      <el-table-column label="车把尺寸" prop="handlebarSize" align="center" width="120" column-key="handlebarSize"
        :filters="handleDataFilter(handlebarSizeData)" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="handlebarSizeData[scope.row.handlebarSize]" />
      </el-table-column>
      <el-table-column label="配置协议" prop="agreement" align="center" width="120" column-key="agreement"
        :filters="handleDataFilter(dicts_agreement)" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="dicts_agreement[scope.row.agreement]" />
      </el-table-column>
      <el-table-column label="实际协议" prop="showAgreement" align="center" width="120" />
      <el-table-column label="测速磁钢数" prop="speedSteel" align="center" width="120" column-key="speedSteel"
        :filters="getFiltersData('speedSteel')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.speedSteel"></span>
      </el-table-column>
      <el-table-column label="车轮宽度" prop="tiresSize" align="center" width="120" column-key="tiresSize"
        :filters="getFiltersData('tiresSize')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.tiresSize"></span>
      </el-table-column>
      <el-table-column label="助力限速门限(km/h)" prop="assistLimit" align="center" width="155" column-key="assistLimit"
        :filters="getFiltersData('assistLimit')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.assistLimit"></span>
      </el-table-column>
      <el-table-column label="配置轮径" prop="wheelDiameter" align="center" width="120" column-key="wheelDiameter"
        :filters="handleDataFilter(wheelDiameterData)" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="wheelDiameterData[scope.row.wheelDiameter]"></span>
      </el-table-column>
      <el-table-column label="实际轮径" prop="showWheelDiameter" align="center" width="120" />
      <el-table-column label="周长(mm)" prop="perimeter" align="center" width="120" column-key="perimeter"
        :filters="getFiltersData('perimeter')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.perimeter"></span>
      </el-table-column>
      <el-table-column label="电压" prop="voltage" align="center" width="120" column-key="voltage"
        :filters="getFiltersData('voltage')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.voltage"></span>
      </el-table-column>
      <el-table-column label="缓启动" prop="slowStart" align="center" width="120" column-key="slowStart"
        :filters="getFiltersData('slowStart')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.slowStart"></span>
      </el-table-column>
      <el-table-column label="显示单位" prop="unit" align="center" width="120" column-key="unit"
        :filters="handleDataFilter(dicts_unit)" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="dicts_unit[scope.row.unit]"></span>
      </el-table-column>
      <el-table-column label="电量计算" prop="power" align="center" width="120" column-key="power"
        :filters="handleDataFilter(dicts_power)" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="dicts_power[scope.row.power]"></span>
      </el-table-column>
      <el-table-column label="APP" prop="app" align="center" width="120" column-key="app" :filters="[
        { text: 'YES', value: 1 },
        { text: 'NO', value: 0 },
      ]" :filter-method="filterHandler">
        <el-tag v-if="isShow(row.app)" slot-scope="{ row }" :type="row.app === 1 ? 'success' : 'danger'">
          {{ row.app === 1 ? "YES" : "NO" }}
        </el-tag>
        <template v-else> - - - </template>
      </el-table-column>
      <el-table-column label="USB" prop="usb" align="center" width="120" column-key="usb" :filters="[
        { text: 'YES', value: 1 },
        { text: 'NO', value: 0 },
      ]" :filter-method="filterHandler">
        <el-tag v-if="isShow(row.usb)" slot-scope="{ row }" :type="row.usb === 1 ? 'success' : 'danger'">
          {{ row.usb === 1 ? "YES" : "NO" }}
        </el-tag>
        <template v-else> - - - </template>
      </el-table-column>
      <el-table-column label="蓝牙" prop="bluetooth" align="center" width="120" column-key="bluetooth" :filters="[
        { text: 'YES', value: 1 },
        { text: 'NO', value: 0 },
      ]" :filter-method="filterHandler">
        <el-tag v-if="isShow(row.bluetooth)" slot-scope="{ row }" :type="row.bluetooth === 1 ? 'success' : 'danger'">
          {{ row.bluetooth === 1 ? "YES" : "NO" }}
        </el-tag>
        <template v-else> - - - </template>
      </el-table-column>
      <el-table-column label="推车助力" prop="driveAssist" align="center" width="120" column-key="driveAssist" :filters="[
        { text: 'YES', value: 1 },
        { text: 'NO', value: 0 },
      ]" :filter-method="filterHandler">
        <el-tag v-if="isShow(row.driveAssist)" slot-scope="{ row }"
          :type="row.driveAssist === 1 ? 'success' : 'danger'">
          {{ row.driveAssist === 1 ? "YES" : "NO" }}
        </el-tag>
        <template v-else> - - - </template>
      </el-table-column>
      <el-table-column label="恢复出厂设置" prop="factoryReset" align="center" width="120" column-key="factoryReset" :filters="[
        { text: 'YES', value: 0 },
        { text: 'NO', value: 1 },
      ]" :filter-method="filterHandler">
        <el-tag v-if="isShow(row.factoryReset)" slot-scope="{ row }"
          :type="row.factoryReset === 0 ? 'success' : 'danger'">
          {{ row.factoryReset === 0 ? "YES" : "NO" }}
        </el-tag>
        <template v-else> - - - </template>
      </el-table-column>
      <el-table-column label="转把分档" prop="rotateHandle" align="center" width="120" column-key="rotateHandle" :filters="[
        { text: 'YES', value: 1 },
        { text: 'NO', value: 0 },
      ]" :filter-method="filterHandler">
        <el-tag v-if="isShow(row.rotateHandle)" slot-scope="{ row }"
          :type="row.rotateHandle === 1 ? 'success' : 'danger'">
          {{ row.rotateHandle === 1 ? "YES" : "NO" }}
        </el-tag>
        <template v-else> - - - </template>
      </el-table-column>
      <el-table-column label="助力正反" prop="assist" align="center" width="120" column-key="assist" :filters="[
        { text: '助力正', value: 0 },
        { text: '助力反', value: 1 },
      ]" :filter-method="filterHandler">
        <template v-if="isShow(row.assist)" slot-scope="{ row }">
          {{ row.assist === 0 ? "助力正" : "助力反" }}
        </template>
        <template v-else> - - - </template>
      </el-table-column>
      <el-table-column label="转把限速" prop="rotateHandleSpeedLimit" align="center" width="120"
        column-key="rotateHandleSpeedLimit" :filters="[
          { text: '正常', value: 0 },
          { text: '限速6Km', value: 1 },
        ]" :filter-method="filterHandler">
        <template v-if="isShow(row.rotateHandleSpeedLimit)" slot-scope="{ row }">
          {{ row.rotateHandleSpeedLimit === 0 ? "正常" : "限速6Km" }}
        </template>
        <template v-else> - - - </template>
      </el-table-column>
      <el-table-column label="默认档位" prop="defaultGear" align="center" width="120" column-key="defaultGear"
        :filters="getFiltersData('defaultGear')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.defaultGear"></span>
      </el-table-column>
      <el-table-column label="最高档位" prop="topGear" align="center" width="120" column-key="topGear"
        :filters="getFiltersData('topGear')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.topGear"></span>
      </el-table-column>
      <el-table-column label="速度平滑等级" prop="smoothLevel" align="center" width="120" column-key="smoothLevel"
        :filters="getFiltersData('smoothLevel')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.smoothLevel"></span>
      </el-table-column>
      <el-table-column label="电量变化时间(s)" prop="batteryVoltageChangeTime" align="center" width="150"
        column-key="batteryVoltageChangeTime" :filters="getFiltersData('batteryVoltageChangeTime')"
        :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.batteryVoltageChangeTime"></span>
      </el-table-column>
      <el-table-column label="总线故障超时时间(s)" prop="allLineErrTimeOut" align="center" width="160"
        column-key="allLineErrTimeOut" :filters="getFiltersData('allLineErrTimeOut')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.allLineErrTimeOut"></span>
      </el-table-column>
      <el-table-column label="背光亮度" prop="backlightBrightness" align="center" width="120"
        column-key="backlightBrightness" :filters="handleDataFilter(backlightBrightnessList)"
        :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="backlightBrightnessList[scope.row.backlightBrightness]"></span>
      </el-table-column>
      <el-table-column label="Logo界面" prop="logo" align="center" width="120" column-key="logo"
        :filters="handleDataFilter(dicts_logo)" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="dicts_logo[scope.row.logo]"></span>
      </el-table-column>
      <el-table-column label="休眠时间(min)" prop="sleepTime" align="center" width="120" column-key="sleepTime"
        :filters="getFiltersData('sleepTime')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.sleepTime"></span>
      </el-table-column>
      <el-table-column label="助力档位数" prop="powerGear" align="center" width="120" column-key="powerGear"
        :filters="getFiltersData('powerGear')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.powerGear"></span>
      </el-table-column>
      <el-table-column label="助力开始磁钢数" prop="assistStartMagnetNumber" align="center" width="130"
        column-key="assistStartMagnetNumber" :filters="getFiltersData('assistStartMagnetNumber')"
        :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.assistStartMagnetNumber" />
      </el-table-column>
      <el-table-column label="助力比例" prop="assistPercentage" align="center" width="120" column-key="assistPercentage"
        :filters="getFiltersData('assistPercentage')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.assistPercentage"></span>
      </el-table-column>
      <el-table-column label="显示轮径" prop="showWheelsize" align="center" width="120" column-key="showWheelsize"
        :filters="getFiltersData('showWheelsize')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.showWheelsize"></span>
      </el-table-column>
      <el-table-column label="系统电压(V)" prop="voltage" align="center" width="120" column-key="voltage"
        :filters="getFiltersData('voltage')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.voltage"></span>
      </el-table-column>
      <el-table-column label="限流门限(A)" prop="currentlimiting" align="center" width="120" column-key="currentlimiting"
        :filters="getFiltersData('currentlimiting')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.currentlimiting"></span>
      </el-table-column>
      <el-table-column label="欠压门限(V)" prop="undervoltage" align="center" width="120" column-key="undervoltage"
        :filters="getFiltersData('undervoltage')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.undervoltage"></span>
      </el-table-column>
      <el-table-column label="蜂鸣器" prop="buzzerSwitch" align="center" width="120" column-key="buzzerSwitch" :filters="[
        { text: 'YES', value: 0 },
        { text: 'NO', value: 1 },
      ]" :filter-method="filterHandler">
        <el-tag v-if="isShow(row.buzzerSwitch)" slot-scope="{ row }"
          :type="row.buzzerSwitch === 0 ? 'success' : 'danger'">
          {{ row.buzzerSwitch === 0 ? "YES" : "NO" }}
        </el-tag>
        <template v-else> - - - </template>
      </el-table-column>
      <el-table-column label="高速蜂鸣器提醒" prop="highSpeedBuzzerRemind" align="center" width="140"
        column-key="highSpeedBuzzerRemind" :filters="getFiltersData('highSpeedBuzzerRemind')"
        :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.highSpeedBuzzerRemind"></span>
      </el-table-column>
      <el-table-column label="定速巡航功能" prop="cruise" align="center" width="120" column-key="cruise" :filters="[
        { text: 'YES', value: 0 },
        { text: 'NO', value: 1 },
      ]" :filter-method="filterHandler">
        <el-tag v-if="isShow(row.cruise)" slot-scope="{ row }" :type="row.cruise === 0 ? 'success' : 'danger'">
          {{ row.cruise === 0 ? "YES" : "NO" }}
        </el-tag>
        <template v-else> - - - </template>
      </el-table-column>
      <el-table-column label="是否开机密码" prop="turnOnPasswd" align="center" width="120" column-key="turnOnPasswd" :filters="[
        { text: 'YES', value: 0 },
        { text: 'NO', value: 1 },
      ]" :filter-method="filterHandler">
        <el-tag v-if="isShow(row.turnOnPasswd)" slot-scope="{ row }"
          :type="row.turnOnPasswd === 0 ? 'success' : 'danger'">
          {{ row.turnOnPasswd === 0 ? "YES" : "NO" }}
        </el-tag>
        <template v-else> - - - </template>
      </el-table-column>
      <el-table-column label="开机密码" prop="startupPasswd" align="center" width="120" column-key="startupPasswd"
        :filters="getFiltersData('startupPasswd')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.startupPasswd"></span>
      </el-table-column>
      <el-table-column label="是否菜单密码" prop="menuPassword" align="center" width="120" column-key="menuPassword" :filters="[
        { text: 'YES', value: 0 },
        { text: 'NO', value: 1 },
      ]" :filter-method="filterHandler">
        <el-tag v-if="isShow(row.menuPassword)" slot-scope="{ row }"
          :type="row.menuPassword === 0 ? 'success' : 'danger'">
          {{ row.menuPassword === 0 ? "YES" : "NO" }}
        </el-tag>
        <template v-else> - - - </template>
      </el-table-column>
      <el-table-column label="高级菜单密码" prop="highMenuPasswd" align="center" width="120" column-key="highMenuPasswd"
        :filters="getFiltersData('highMenuPasswd')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.highMenuPasswd"></span>
      </el-table-column>
      <el-table-column label="有无高级菜单" prop="isHighMenuPassword" align="center" width="130">
        <el-tag v-if="isShow(row.isHighMenuPassword)" slot-scope="{ row }"
          :type="row.isHighMenuPassword === 0 ? 'success' : 'danger'">
          {{ row.isHighMenuPassword === 0 ? "YES" : "NO" }}
        </el-tag>
      </el-table-column>
      <el-table-column label="电机功率(W)" prop="motorSys" align="center" width="120" column-key="motorSys"
        :filters="getFiltersData('motorSys')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.motorSys"></span>
      </el-table-column>
      <el-table-column label="电池容量" prop="batteryCap" align="center" width="120" column-key="batteryCap"
        :filters="getFiltersData('batteryCap')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.batteryCap"></span>
      </el-table-column>
      <el-table-column label="创建人" prop="createBy" align="center" width="120" column-key="createBy"
        :filters="getFiltersData('createBy')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.createBy"></span>
      </el-table-column>
      <el-table-column label="审核人 " prop="checkBy" align="center" width="120" column-key="checkBy"
        :filters="getFiltersData('checkBy')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.checkBy"></span>
      </el-table-column>

    </el-table>

    <pagination v-if="total > 0" :total="total" :ls="[10, 50, 100, 300, 500]" :page.sync="queryParams.p"
      :limit.sync="queryParams.l" @pagination="getList" />

    <el-dialog title="请确认是否通过" :visible.sync="authDialogVisible" width="40%" center :close-on-click-modal="false">
      <el-form ref="authForm" :model="authForm" class="form-data" :inline="false">
        <el-form-item label="拒审原因">
          <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" v-model="authForm.msg"
            placeholder="不通过则需要输入原因" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="isSubmitLoading" @click="handleStatusChange(isAuthFlag === 1 ? 2 : 4)">
          不通过
        </el-button>
        <el-button type="primary" :loading="isSubmitLoading" @click="handleStatusChange(isAuthFlag === 1 ? 1 : 3)">
          通过
        </el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="isDeployShow" width="50%" center top="2vh">
      <template v-slot:title>
        <div>
          <h2>配置详情</h2>
          <el-switch v-model="isSample" active-text="简化"> </el-switch>
        </div>
      </template>
      <el-descriptions direction="vertical" :column="4" border>
        <el-descriptions-item label="背光亮度">
          <div class="flex justify-between">
            <div>
              <span v-NoData="backlightBrightnessList[deployData.backlightBrightness]
                "></span>
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.backlightBrightness">
              </span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="缓启动" v-if="isKm5s">
          <span v-NoData="deployData.slowStart"></span>
        </el-descriptions-item>
        <el-descriptions-item label="车名" v-if="!isSample">
          <div class="flex justify-between">
            <div>
              <span v-NoData="dicts_ebike[deployData.ebikeName]"></span>
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.ebikeName"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="车轮宽度" v-if="!isSample">
          <span v-NoData="deployData.tiresSize"></span>
        </el-descriptions-item>
        <el-descriptions-item label="休眠时间(min)">
          <span v-NoData="deployData.sleepTime"></span>
        </el-descriptions-item>
        <el-descriptions-item label="轮径">
          <div class="flex justify-between">
            <div>
              <span v-NoData="wheelDiameterData[deployData.wheelDiameter]"></span>
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.wheelDiameter"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="车型" v-if="!isSample">
          <span v-NoData="deployData.carModel"></span>
        </el-descriptions-item>
        <el-descriptions-item label="蓝牙">
          <div class="flex justify-between">
            <div>
              {{ deployData.bluetooth === 1 ? "YES" : "NO" }}
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.bluetooth"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="系统电压(V)">
          <span v-NoData="deployData.voltage"></span>
        </el-descriptions-item>
        <el-descriptions-item label="周长(mm)">
          <span v-NoData="deployData.perimeter"></span>
        </el-descriptions-item>
        <el-descriptions-item label="默认档位">
          <span v-NoData="deployData.defaultGear"></span>
        </el-descriptions-item>
        <el-descriptions-item label="推车助力">
          {{ deployData.driveAssist === 1 ? "YES" : "NO" }}
        </el-descriptions-item>
        <el-descriptions-item label="欠压门限(V)">
          <span v-NoData="deployData.undervoltage"></span>
        </el-descriptions-item>
        <el-descriptions-item label="显示单位">
          <div class="flex justify-between">
            <div>
              <span v-NoData="dicts_unit[deployData.unit]"></span>
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.unit"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="Logo界面">
          <div class="flex justify-between">
            <div>
              <span v-NoData="dicts_logo[deployData.logo]"></span>
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.logo"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="恢复出厂设置" v-if="!isSample">
          <div class="flex justify-between">
            <div>
              {{ deployData.factoryReset === 0 ? "YES" : "NO" }}
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.factoryReset"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="助力档位数">
          <span v-NoData="deployData.powerGear"></span>
        </el-descriptions-item>
        <el-descriptions-item label="协议">
          <div class="flex justify-between">
            <div>
              <span v-NoData="dicts_agreement[deployData.agreement]"></span>
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.agreement"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="开机密码">
          <span v-NoData="deployData.startupPasswd"></span>
        </el-descriptions-item>
        <el-descriptions-item label="转把分档" v-if="isKm5s">
          <div class="flex justify-between">
            <div>
              {{ deployData.rotateHandle === 1 ? "YES" : "NO" }}
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.rotateHandle"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="助力开始磁钢数" v-if="isKm5s">
          <span v-NoData="deployData.assistStartMagnetNumber"></span>
        </el-descriptions-item>
        <el-descriptions-item label="电量计算方式">
          <div class="flex justify-between">
            <div>
              <span v-NoData="dicts_power[deployData.power]"></span>
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.power"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="高级菜单密码">
          <span v-NoData="deployData.highMenuPasswd"></span>
        </el-descriptions-item>
        <el-descriptions-item label="蜂鸣器开关" v-if="!isSample">
          <div class="flex justify-between">
            <div>
              {{ deployData.buzzerSwitch === 0 ? "YES" : "NO" }}
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.buzzerSwitch"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="助力比例" v-if="isKm5s">
          <span v-NoData="deployData.assistPercentage"></span>
        </el-descriptions-item>
        <el-descriptions-item label="测速磁钢数">
          <span v-NoData="deployData.speedSteel"></span>
        </el-descriptions-item>
        <el-descriptions-item label="电机功率(W)">
          <span v-NoData="deployData.motorSys"></span>
        </el-descriptions-item>
        <el-descriptions-item label="定速巡航功能">
          <div class="flex justify-between">
            <div>
              {{ deployData.cruise === 0 ? "YES" : "NO" }}
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.cruise"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="限流门限(A)">
          <span v-NoData="deployData.currentlimiting"></span>
        </el-descriptions-item>
        <el-descriptions-item label="电量变化时间(s)">
          <span v-NoData="deployData.batteryVoltageChangeTime"></span>
        </el-descriptions-item>
        <el-descriptions-item label="电池容量" v-if="!isSample">
          <span v-NoData="deployData.batteryCap"></span>
        </el-descriptions-item>
        <el-descriptions-item label="开机密码">
          <div class="flex justify-between">
            <div>
              {{ deployData.turnOnPasswd === 0 ? "YES" : "NO" }}
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.turnOnPasswd"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="助力限速门限(km/h)">
          <span v-NoData="deployData.assistLimit"></span>
        </el-descriptions-item>
        <el-descriptions-item label="速度平滑等级" v-if="!isSample">
          <span v-NoData="deployData.smoothLevel"></span>
        </el-descriptions-item>
        <el-descriptions-item label="高速蜂鸣器提醒" v-if="!isSample">
          <span v-NoData="deployData.highSpeedBuzzerRemind"></span>
        </el-descriptions-item>
        <el-descriptions-item label="菜单密码">
          <div class="flex justify-between">
            <div>
              {{ deployData.menuPassword === 0 ? "YES" : "NO" }}
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.menuPassword"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="显示轮径" v-if="!isSample">
          <span v-NoData="deployData.showWheelsize"></span>
        </el-descriptions-item>
        <el-descriptions-item label="总线故障超时时间(s)">
          <span v-NoData="deployData.allLineErrTimeOut"></span>
        </el-descriptions-item>
        <el-descriptions-item label="串口通讯电平">
          <div class="flex justify-between">
            <div>
              <span v-NoData="serialLevelLogData[deployData.serialLevelLog]"></span>
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.serialLevelLog"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="转把限速" v-if="isKm5s">
          <div class="flex justify-between">
            <div>
              {{ deployData.rotateHandleSpeedLimit === 0 ? "正常" : "限速6Km" }}
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.rotateHandleSpeedLimit"></span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="助力正反" v-if="isKm5s">
          <div class="flex justify-between">
            <div>
              {{ deployData.assist === 0 ? "助力正" : "助力反" }}
            </div>
            <div v-show="!isSample">
              实际值：
              <span class="text-red" v-NoData="deployData.assist"></span>
            </div>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 对比 -->
    <ParamsCompare :isParamsCompareShow.sync="isParamsCompareShow" :dictList="dictList" />

    <PackagingInfo ref="packInfoRef" />
    <addDialog ref="addDialogRef" />
  </div>
</template>

<script>
import { computerNameList } from "@/api/third/fileConfig";
import {
  modelConfigList,
  modelConfigState,
  ConfigExport,
} from "@/api/third/testApi";
import commonData from "@/mixins/commonData";
import { dragTableFn } from "@/mixins/common";
import ParamsCompare from "./ParamsCompare.vue";
import { getCustomerList } from "@/api/order";
import addDialog from '@/views/third/productFamily/index.vue'
export default {
  name: "ConfigOverview",
  mixins: [commonData, dragTableFn],
  components: {
    addDialog,
    CategoryComputer: () => import("@/components/CategoryComputer"),
    ParamsCompare,
    PackagingInfo: () => import("./packagingInfo"),
  },
  data() {
    return {
      uploadIds: [],
      isDrawerFlag: false,
      isSample: true,
      isDeployShow: false,
      deployData: {},
      myCategoryId: "",
      isCLoading: false,
      authDialogVisible: false,
      isParamsCompareShow: false,
      isSubmitLoading: false,
      isAuthFlag: null,
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
      serialLevelLogData: {
        0: "3.3V",
        1: "5V",
      },
      labelRuleData: {
        1: "通用",
        2: "图片",
      },
      // uart波特率
      baudRateList: {},
      // can波特率
      canRateList: {},
      // 帧类型
      msgTypeData: {
        0: "标准帧",
        1: "扩展帧",
      },
      // 客户名称
      customerNameData: {
        data: [],
        page: 1,
        more: true,
      },
      // 查询参数
      queryParams: {
        p: 1,
        l: 10,
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
    // 协议查询条件
    handleDataFilter() {
      return (data) => {
        return Object.entries(data)
          .map(([key, value]) => {
            return { text: value, value: +key };
          })
          .sort((a, b) => a.text - b.text);
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
    isKm5s() {
      if (this.isSample) {
        return this.deployData.agreement === 0;
      } else {
        return true;
      }
    },
  },
  created() {
    // 车把尺寸
    this.getConfigDicts("handleBar_size", "handlebarSizeData");
    // uart波特率
    this.getConfigDicts("uart_baud_rate", "baudRateList");
    // can波特率
    this.getConfigDicts("can_baud_rate", "canRateList");
    this.getList();
  },
  activated() {
    this.getCategoryComputerDict();
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      this.brandList = [];
      modelConfigList(this.queryParams).then((res) => {
        const { list, total } = res.data;
        this.brandList = list;
        this.total = total;
        this.loading = false;
      });
    },
    // 每项筛选方法
    filterHandler(value, row, column) {
      const property = column["property"];
      return row[property] == value;
    },
    // 清除所有过滤器
    clearFilter() {
      this.$refs.tableRef.clearFilter();
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
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.p = 1;
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
    handleAuthChange(row, isAuthFlag) {
      this.authDialogVisible = true;
      this.authForm = row;
      this.isAuthFlag = isAuthFlag;
    },
    handleStatusChange(state) {
      const data = {};
      if (state === 2 || state === 4) {
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
    handleOpenDetail(row) {
      this.isDeployShow = true;
      this.isSample = true;
      this.deployData = Object.assign({}, row);
    },
    handleParamsCompare() {
      this.isParamsCompareShow = true;
    },
    // 查看包装信息
    handleSeePackagingInfo(row) {
      this.$refs.packInfoRef.isDialogVisible = true;
      this.$refs.packInfoRef.packagingInfo = row.packagingInfo ?? "";
    },
    handleEditPackagingInfo(row) {
      let item = { ...row, id: row.computerId };
      this.$refs.addDialogRef.isPackage = true;
      this.$refs.addDialogRef.handleUpdate(item);
    },    // 多选框选中数据
    handleSelectionChange(selection) {
      this.uploadIds = selection.map((item) => item.id);
    },
    /** 导出按钮操作 */
    handleExport() {
      if (!this.uploadIds.length) return this.msgWarning("请选择导出的数据项！");

      this.downloadFile({
        aFn: ConfigExport,
        queryParams: this.uploadIds,
      });
    },
    addDialogChange() {
      this.$refs.addDialogRef.isPackage = false;
      this.$refs.addDialogRef.handleAdd();
    },
    handleEdit(row) {
      let item = { ...row, id: row.computerId };
      this.$refs.addDialogRef.isPackage = false;
      this.$refs.addDialogRef.handleUpdate(item);
    },
  },
};
</script>