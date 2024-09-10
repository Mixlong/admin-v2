<template>
  <el-container>
    <el-header>配置文件生成器(STS)</el-header>
    <el-main>
      <el-card class="box-card" shadow="never">
        <div slot="header" v-if="!isShow">
          <el-form :inline="true" :model="queryParams">
            <el-form-item label="所属品类" prop="categoryId">
              <el-select
                v-model="queryParams.categoryId"
                @change="changeCategory"
                filterable
                clearable
                placeholder="请选择所属品类"
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
                v-model="queryParams.computerId"
                filterable
                clearable
                placeholder="请选择仪表型号"
              >
                <el-option
                  v-for="dict in computerOptions"
                  :key="dict.model"
                  :label="dict.name"
                  :value="dict.model"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-search"
                @click="handleQuery"
                >检索</el-button
              >
            </el-form-item>
          </el-form>
        </div>
        <el-form
          ref="ruleForm"
          :rules="formRules"
          :model="formData"
          label-width="150px"
        >
          <el-row :gutter="10">
            <el-col :span="6">
              <el-form-item
                label="背光亮度"
                class="noData"
                prop="instrumentModel.backlightBrightness"
              >
                <el-select
                  v-model="formData.instrumentModel.backlightBrightness"
                  placeholder="请选择背光亮度"
                  clearable
                  class="w100"
                  filterable
                  allow-create
                >
                  <el-option
                    v-for="(value, key) in backlightBrightnessList"
                    :key="key"
                    :label="value"
                    :value="transformValueInt('backlightBrightness', key)"
                  />
                </el-select>
              </el-form-item>

              <el-form-item
                label="休眠时间(min)"
                :class="{ noData: isNoData('sleepTime') }"
                prop="instrumentModel.sleepTime"
              >
                <el-select
                  v-model="formData.instrumentModel.sleepTime"
                  placeholder="请选择休眠时间"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in sleepTimeList"
                    :key="item"
                    :label="item"
                    :value="transformValueInt('sleepTime', item)"
                  />
                </el-select>
              </el-form-item>

              <el-form-item
                label="系统电压(V)"
                :class="{ noData: isNoData('voltage') }"
                prop="instrumentModel.voltage"
              >
                <el-select
                  v-model="formData.instrumentModel.voltage"
                  placeholder="请选择系统电压"
                  @change="changeVoltage"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in dicts_voltage"
                    :key="item"
                    :label="item"
                    :value="transformValueInt('voltage', item)"
                  />
                </el-select>
              </el-form-item>

              <el-form-item
                label="欠压门限(V)"
                class="noData"
                prop="instrumentModel.undervoltage"
              >
                <el-input-number
                  class="el-input-number-box"
                  v-model.number="formData.instrumentModel.undervoltage"
                  :precision="1"
                  :min="0"
                  :max="99.9"
                  :controls="false"
                />
              </el-form-item>

              <el-form-item label="助力档位数" class="noData">
                <el-select
                  v-model="formData.instrumentModel.powerGear"
                  placeholder="请选择助力档位数"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in powerGearData"
                    :key="item"
                    :label="item"
                    :value="transformValueInt('powerGear', item)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                label="助力开始磁钢数"
                prop="assistStartMagnetNumber"
                :class="{ noData: isNoData('assistStartMagnetNumber') }"
              >
                <el-select
                  v-model="formData.instrumentModel.assistStartMagnetNumber"
                  placeholder="请选择助力开始磁钢数"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in assistStartMagnetNumberData"
                    :key="item"
                    :label="item"
                    :value="transformValueInt('assistStartMagnetNumber', item)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="助力比例"
                prop="assistPercentage"
                :class="{ noData: isNoData('assistPercentage') }"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 255 }"
                  v-model.number="formData.instrumentModel.assistPercentage"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="请输入助力比例"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="限流门限(A)"
                prop="currentlimiting"
                :class="{ noData: isNoData('currentlimiting') }"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 40 }"
                  v-model.number="formData.instrumentModel.currentlimiting"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="请输入限流门限"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="助力限速门限(km/h)"
                prop="assistLimit"
                class="noData"
              >
                <el-select
                  v-model="formData.instrumentModel.assistLimit"
                  placeholder="请选择助力限速门限"
                  class="w100"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="item in assistLimitData"
                    :key="item"
                    :label="item"
                    :value="transformValueInt('assistLimit', item)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="显示轮径"
                prop="showWheelsize"
                :class="{ noData: isNoData('showWheelsize') }"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 999 }"
                  v-model.number="formData.instrumentModel.showWheelsize"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="显示轮径"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item
                label="缓启动"
                prop="instrumentModel.slowStart"
                :class="{ noData: isNoData('slowStart') }"
              >
                <el-select
                  v-model="formData.instrumentModel.slowStart"
                  placeholder="请选择缓启动"
                  filterable
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in slowStartData"
                    :key="item"
                    :label="item"
                    :value="transformValueInt('slowStart', item)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="轮径(inch)"
                prop="instrumentModel.wheelDiameter"
                class="noData"
              >
                <el-select
                  v-model="formData.instrumentModel.wheelDiameter"
                  placeholder="请选择轮径"
                  filterable
                  class="w100"
                  clearable
                  @change="changeCountPerimeter"
                >
                  <el-option
                    v-for="(value, key) in wheelDiameterData"
                    :key="key"
                    :label="value"
                    :value="transformValueInt('wheelDiameter', key)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="周长(mm)"
                prop="instrumentModel.perimeter"
                class="noData"
              >
                <el-input
                  v-model="formData.instrumentModel.perimeter"
                  oninput="value=value.replace(/[^\d]/, '')"
                  placeholder="请输入周长"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="显示单位"
                prop="instrumentModel.unit"
                :class="{ noData: isNoData('unit') }"
              >
                <el-select
                  v-model="formData.instrumentModel.unit"
                  placeholder="请选择显示单位"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="(value, key) in dicts_unit"
                    :key="key"
                    :label="value"
                    :value="transformValueInt('unit', key)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="协议"
                prop="instrumentModel.agreement"
                :class="{ noData: isNoData('agreement') }"
              >
                <el-select
                  v-model="formData.instrumentModel.agreement"
                  placeholder="请选择协议"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="(value, key) in dicts_agreement"
                    :key="key"
                    :label="value"
                    :value="transformValueInt('agreement', key)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="电量计算方式"
                prop="instrumentModel.power"
                :class="{ noData: isNoData('power') }"
              >
                <el-select
                  v-model="formData.instrumentModel.power"
                  placeholder="请选择电量计算方式"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="(value, key) in dicts_power"
                    :key="key"
                    :label="value"
                    :value="transformValueInt('power', key)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="测速磁钢数"
                prop="instrumentModel.speedSteel"
                :class="{ noData: isNoData('speedSteel') }"
              >
                <el-select
                  v-model="formData.instrumentModel.speedSteel"
                  placeholder="请选择测速磁钢数"
                  filterable
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in speedSteelData"
                    :key="item"
                    :label="item"
                    :value="transformValueInt('speedSteel', item)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="电量变化时间(s)"
                prop="instrumentModel.batteryVoltageChangeTime"
                :class="{ noData: isNoData('batteryVoltageChangeTime') }"
              >
                <el-select
                  v-model="formData.instrumentModel.batteryVoltageChangeTime"
                  placeholder="请选择电量变化时间"
                  filterable
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in batteryVoltageChangeTimeData"
                    :key="item"
                    :label="item"
                    :value="transformValueInt('batteryVoltageChangeTime', item)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="速度平滑等级"
                prop="instrumentModel.smoothLevel"
                :class="{ noData: isNoData('smoothLevel') }"
              >
                <el-select
                  v-model="formData.instrumentModel.smoothLevel"
                  placeholder="请选择速度平滑等级"
                  filterable
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in smoothLevelData"
                    :key="item"
                    :label="item"
                    :value="transformValueInt('smoothLevel', item)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="总线故障超时时间(s)"
                prop="allLineErrTimeOut"
                :class="{ noData: isNoData('allLineErrTimeOut') }"
              >
                <el-select
                  v-model="formData.instrumentModel.allLineErrTimeOut"
                  placeholder="请选择总线故障超时时间"
                  filterable
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in allLineErrTimeOutData"
                    :key="item"
                    :label="item"
                    :value="transformValueInt('allLineErrTimeOut', item)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item
                label="车名"
                prop="ebikeName"
                :class="{ noData: isNoData('ebikeName') }"
              >
                <el-select
                  v-model="formData.instrumentModel.ebikeName"
                  placeholder="请选择车名"
                  class="w100"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="(value, key) in dicts_ebike"
                    :key="key"
                    :label="value"
                    :value="transformValueInt('ebikeName', key)"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                label="车型"
                prop="carModel"
                :class="{ noData: isNoData('carModel') }"
              >
                <el-input
                  maxlength="2"
                  v-model="formData.instrumentModel.carModel"
                  placeholder="车型"
                />
              </el-form-item>
              <el-form-item
                label="默认档位"
                prop="instrumentModel.defaultGear"
                :class="{ noData: isNoData('defaultGear') }"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 9 }"
                  v-model="formData.instrumentModel.defaultGear"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="请输入默认档位"
                />
              </el-form-item>
              <el-form-item
                label="Logo界面"
                prop="instrumentModel.logo"
                :class="{ noData: isNoData('logo') }"
              >
                <el-select
                  v-model="formData.instrumentModel.logo"
                  placeholder="请选择Logo界面"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="(value, key) in dicts_logo"
                    :key="key"
                    :label="value"
                    :value="transformValueInt('logo', key)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="开机密码"
                prop="instrumentModel.startupPasswd"
                :class="{ noData: isNoData('startupPasswd') }"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 9999 }"
                  v-model="formData.instrumentModel.startupPasswd"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="请输入开机密码"
                />
              </el-form-item>

              <el-form-item
                label="电机功率(W)"
                prop="motorSys"
                :class="{ noData: isNoData('motorSys') }"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 999 }"
                  v-model="formData.instrumentModel.motorSys"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="请输入电机功率"
                />
              </el-form-item>
              <el-form-item
                label="电池容量"
                prop="batteryCap"
                :class="{ noData: isNoData('batteryCap') }"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 9999 }"
                  v-model="formData.instrumentModel.batteryCap"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="电池容量"
                />
              </el-form-item>
              <el-form-item
                label="串口通讯电平"
                :class="{ noData: isNoData('serialLevel') }"
              >
                <el-select
                  v-model="formData.instrumentModel.serialLevel"
                  placeholder="请选择串口通讯电平"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="(value, key) in serialLevelData"
                    :key="key"
                    :label="value"
                    :value="transformValueInt('serialLevel', key)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="高级菜单密码"
                prop="instrumentModel.menuPasswd"
                :class="{ noData: isNoData('menuPasswd') }"
              >
                <el-input
                  v-model="formData.instrumentModel.menuPasswd"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  type="number"
                  v-minMaxValue="{ min: 0, max: 9999 }"
                  placeholder="请输入高级菜单密码"
                />
              </el-form-item>
              <el-form-item
                label="高速蜂鸣器提醒"
                prop="instrumentModel.highSpeedBuzzerRemind"
                :class="{ noData: isNoData('highSpeedBuzzerRemind') }"
              >
                <el-input
                  v-model="formData.instrumentModel.highSpeedBuzzerRemind"
                  v-minMaxValue="{ min: 0, max: 99 }"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  type="number"
                  placeholder="请输入高速蜂鸣器提醒"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item
                label="车轮宽度"
                prop="tiresSize"
                :class="{ noData: isNoData('tiresSize') }"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 99 }"
                  v-model="formData.instrumentModel.tiresSize"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="请输入车轮宽度"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="蓝牙"
                prop="instrumentModel.bluetooth"
                :class="{ noData: isNoData('bluetooth') }"
              >
                <el-radio-group v-model="formData.instrumentModel.bluetooth">
                  <el-radio
                    v-for="(value, key) in radioTypeOneList"
                    :key="key"
                    :label="transformValueInt('bluetooth', key)"
                  >
                    {{ value }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="推车助力"
                prop="instrumentModel.driveAssist"
                :class="{ noData: isNoData('driveAssist') }"
              >
                <el-radio-group v-model="formData.instrumentModel.driveAssist">
                  <el-radio
                    v-for="(value, key) in radioTypeOneList"
                    :key="key"
                    :label="transformValueInt('driveAssist', key)"
                  >
                    {{ value }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="恢复出厂设置"
                prop="instrumentModel.factoryReset"
                :class="{ noData: isNoData('factoryReset') }"
              >
                <el-radio-group v-model="formData.instrumentModel.factoryReset">
                  <el-radio
                    v-for="(value, key) in radioTypeTwoList"
                    :key="key"
                    :label="transformValueInt('factoryReset', key)"
                  >
                    {{ value }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="转把分档"
                prop="instrumentModel.rotateHandle"
                :class="{ noData: isNoData('rotateHandle') }"
              >
                <el-radio-group v-model="formData.instrumentModel.rotateHandle">
                  <el-radio
                    v-for="(value, key) in radioTypeOneList"
                    :key="key"
                    :label="transformValueInt('rotateHandle', key)"
                  >
                    {{ value }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="蜂鸣器开关"
                prop="instrumentModel.buzzerSwitch"
                :class="{ noData: isNoData('buzzerSwitch') }"
              >
                <el-radio-group v-model="formData.instrumentModel.buzzerSwitch">
                  <el-radio
                    v-for="(value, key) in radioTypeTwoList"
                    :key="key"
                    :label="transformValueInt('buzzerSwitch', key)"
                  >
                    {{ value }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="定速巡航功能"
                prop="instrumentModel.cruise"
                :class="{ noData: isNoData('cruise') }"
              >
                <el-radio-group v-model="formData.instrumentModel.cruise">
                  <el-radio
                    v-for="(value, key) in radioTypeTwoList"
                    :key="key"
                    :label="transformValueInt('cruise', key)"
                  >
                    {{ value }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="开机密码"
                prop="instrumentModel.turnOnPasswd"
                :class="{ noData: isNoData('turnOnPasswd') }"
              >
                <el-radio-group v-model="formData.instrumentModel.turnOnPasswd">
                  <el-radio
                    v-for="(value, key) in radioTypeTwoList"
                    :key="key"
                    :label="transformValueInt('turnOnPasswd', key)"
                  >
                    {{ value }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="菜单密码"
                prop="instrumentModel.menuPassword"
                :class="{ noData: isNoData('menuPassword') }"
              >
                <el-radio-group v-model="formData.instrumentModel.menuPassword">
                  <el-radio
                    v-for="(value, key) in radioTypeTwoList"
                    :key="key"
                    :label="transformValueInt('menuPassword', key)"
                  >
                    {{ value }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item
                label="转把限速"
                prop="instrumentModel.rotateHandleSpeedLimit"
                :class="{ noData: isNoData('rotateHandleSpeedLimit') }"
              >
                <el-radio-group
                  v-model="formData.instrumentModel.rotateHandleSpeedLimit"
                >
                  <el-radio
                    v-for="(value, key) in rotateHandleSpeedLimitList"
                    :key="key"
                    :label="transformValueInt('rotateHandleSpeedLimit', key)"
                  >
                    {{ value }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="助力正反"
                prop="instrumentModel.assist"
                :class="{ noData: isNoData('assist') }"
              >
                <el-radio-group v-model="formData.instrumentModel.assist">
                  <el-radio
                    v-for="(value, key) in assistList"
                    :key="key"
                    :label="transformValueInt('assist', key)"
                  >
                    {{ value }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </el-main>
    <el-footer class="flex align-center justify-center">
      <el-button size="mini" type="primary" v-if="isShow">
        读取配置(STS)
      </el-button>
      <template v-else>
        <el-upload
          class="margin-right-xs"
          action=""
          accept=".json,.ini"
          :on-change="handleChange"
          :auto-upload="false"
          :show-file-list="false"
        >
          <el-button size="mini" type="primary">导入配置</el-button>
        </el-upload>
        <el-button size="mini" type="primary" @click="visible = true">
          上传配置
        </el-button>
        <el-button size="mini" type="primary" @click="exportForm">
          导出配置
        </el-button>
      </template>
    </el-footer>

    <!-- 选择客户 -->
    <el-dialog
      title="导出"
      width="330px"
      center
      top="0"
      :visible.sync="isCustomerShow"
      :close-on-click-modal="false"
    >
      <el-form ref="downloadForm" :model="downloadForm" :rules="rules" inline>
        <el-form-item label="客户名称" prop="customerName">
          <select-loadMore
            v-model="downloadForm.customerName"
            :data="customerNameData.data"
            :page="customerNameData.page"
            :hasMore="customerNameData.more"
            allow-create
            dictLabel="name"
            dictValue="name"
            :request="getCustomerNameList"
            placeholder="请选择客户名称"
          >
          </select-loadMore>
        </el-form-item>
        <el-form-item label="仪表品类" prop="categoryName">
          <model-category
            v-if="isCustomerShow"
            v-model="downloadForm.categoryName"
            dictLabel="name"
            dictValue="name"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="isCustomerShow = false">取 消</el-button>
        <el-button type="primary" @click="handleDownloadSubmit">
          确 定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="上传配置"
      width="400px"
      :visible.sync="visible"
      :close-on-click-modal="false"
      center
    >
      <el-form
        ref="deployForm"
        :model="deployForm"
        :rules="deployRules"
        label-width="80px"
      >
        <el-form-item label="所属品类" prop="categoryId">
          <el-select
            v-model="deployForm.categoryId"
            @change="changeCategory"
            filterable
            allow-create
            clearable
            placeholder="请选择品类"
            style="width: 100%"
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
            v-model="deployForm.computerId"
            filterable
            clearable
            placeholder="请选择仪表型号"
            style="width: 100%"
            @change="setContentName"
          >
            <el-option
              v-for="dict in computerOptions"
              :key="dict.model"
              :label="dict.name"
              :value="dict.model"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="属性描述" prop="content">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 8 }"
            v-model="deployForm.content"
            placeholder="请输入文件描述"
          />
        </el-form-item>
        <el-form-item label="文件" prop="url">
          <DrUpload
            :limit="1"
            v-model="deployForm.url"
            :css="{ width: '100%' }"
            :isOnePic="1"
          >
            <div>
              <el-button size="small" type="primary">点击上传</el-button>
            </div>
          </DrUpload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button
          size="small"
          type="primary"
          @click="handleOk('deployForm')"
          :loading="confirmLoading"
        >
          确 定
        </el-button>
      </span>
    </el-dialog>
  </el-container>
</template>
<script>
import {
  listFileConfig,
  categoryComputerDict,
  stsEditFileConfig,
} from "@/api/third/fileConfig";
import { getCustomerList } from "@/api/order";
import { getToken } from "@/utils/auth";
import Axios from "axios";
import { scrollTo } from "@/utils/scroll-to";

export default {
  data() {
    // 背光亮度
    const validateBacklightBrightness = (rule, value, callback) => {
      if (!Number.isInteger(+value)) {
        callback(new Error("请输入数字值"));
      } else if (+value < 0) {
        callback("背光亮度不能小于0");
      } else if (+value > 6) {
        callback("背光亮度不能大于6");
      } else {
        callback();
      }
    };

    // 背光亮度
    const validateSleepTime = (rule, value, callback) => {
      if (!Number.isInteger(+value)) {
        callback(new Error("请输入数字值"));
      } else if (+value < 0) {
        callback("休眠时间不能小于0");
      } else if (+value > 10) {
        callback("休眠时间不能大于10");
      } else {
        callback();
      }
    };

    // 系统电压
    const validateVoltage = (rule, value, callback) => {
      if (!this.dicts_voltage.includes(+value)) {
        callback(new Error("系统电压不在可选值范围内"));
      } else {
        callback();
      }
    };

    // 欠压门限
    const validateUnderVoltage = (rule, value, callback) => {
      if (+value < 0) {
        callback("欠压门限不能小于0");
      } else if (+value > 99.9) {
        callback("欠压门限不能大于99.9");
      } else {
        callback();
      }
    };

    // 轮径
    const validateWheelDiameter = (rule, value, callback) => {
      const wheelDiameterKeys = Object.keys(this.wheelDiameterData);
      if (!wheelDiameterKeys.includes(String(value))) {
        callback(new Error("请重新选择轮径值"));
      } else {
        callback();
      }
    };

    // 周长
    const validatePerimeter = (rule, value, callback) => {
      if (!Number.isInteger(+value)) {
        callback(new Error("请输入数字值"));
      } else if (+value < 0) {
        callback("周长不能小于0");
      } else if (+value > 9999) {
        callback("周长不能大于9999");
      } else {
        callback();
      }
    };
    return {
      isUploadFlag: false,
      visible: false,
      confirmLoading: false,
      isCustomerShow: false,
      customerName: "",
      queryParams: {
        categoryId: "",
        computerId: "",
      },
      // 客户数据
      customerNameData: {
        data: [],
        page: 1,
        more: true,
      },
      keySortList: [
        {
          keyLabel: "本地按键1",
          keyValue: 1,
          imgSrc: "BT1.png",
        },
        {
          keyLabel: "本地按键2",
          keyValue: 2,
          imgSrc: "BT2.png",
        },
        {
          keyLabel: "按键3",
          keyValue: 3,
          imgSrc: "DTK3.png",
        },
      ],
      formData: {
        instrumentModel: {
          backlightBrightness: "",
          sleepTime: "",
          voltage: "",
          powerGear: "",
          agreement: "",
          assist: "",
          assistStartMagnetNumber: "",
          assistPercentage: "",
          rotateHandle: "",
          rotateHandleSpeedLimit: "",
          slowStart: "",
          speedSteel: "",
          currentlimiting: "",
          undervoltage: "",
          assistLimit: "",
          wheelDiameter: "",
          perimeter: "",
          batteryVoltageChangeTime: "",
          allLineErrTimeOut: "",
          smoothLevel: "",
          unit: "",
          bluetooth: "",
          power: "",
          driveAssist: "",
          defaultGear: "",
          logo: "",
          highSpeedBuzzerRemind: "",
          startupPasswd: "",
          menuPasswd: "",
          factoryReset: "",
          ebikeName: "",
          motorSys: "",
          batteryCap: "",
          showWheelsize: "",
          tiresSize: "",
          carModel: "",
          turnOnPasswd: "",
          menuPassword: "",
          buzzerSwitch: "",
          cruise: "",
          serialLevel: "",
        },
      },
      deployForm: {
        categoryId: "",
        computerId: "",
        content: "",
        url: "",
      },
      downloadForm: {
        customerName: "",
        categoryName: "",
      },
      rules: {
        customerName: [
          { required: true, message: "客户名称不能为空", trigger: "change" },
        ],
        categoryName: [
          { required: true, message: "仪表品类不能为空", trigger: "change" },
        ],
        categoryId: [
          { required: true, message: "所属品类不能为空", trigger: "change" },
        ],
        computerId: [
          { required: true, message: "仪表型号不能为空", trigger: "change" },
        ],
        content: [
          { required: true, message: "属性描述不能为空", trigger: "blur" },
        ],
        url: [{ required: true, message: "文件不能为空", trigger: "change" }],
        keyCode: [
          { required: true, message: "按键值不能为空", trigger: "blur" },
        ],
      },
      formRules: {
        "instrumentModel.backlightBrightness": [
          {
            validator: validateBacklightBrightness,
            trigger: ["blur", "change"],
          },
        ],
        "instrumentModel.sleepTime": [
          { validator: validateSleepTime, trigger: ["blur", "change"] },
        ],
        "instrumentModel.voltage": [
          { validator: validateVoltage, trigger: ["blur", "change"] },
        ],
        "instrumentModel.undervoltage": [
          { validator: validateUnderVoltage, trigger: ["blur", "change"] },
        ],
        "instrumentModel.wheelDiameter": [
          { validator: validateWheelDiameter, trigger: ["blur", "change"] },
        ],
        "instrumentModel.perimeter": [
          { validator: validatePerimeter, trigger: ["blur", "change"] },
        ],
      },
      dictList: [],
      computerOptions: [],
      //   背光亮度
      backlightBrightnessList: {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: "AUTO",
      },
      //   休眠时间
      sleepTimeList: [...Array(11)].map((v, i) => i),
      //   系统电压
      dicts_voltage: [24, 36, 48, 52, 60, 72],
      //   助力档位数
      powerGearData: [3, 4, 5, 9],
      // 缓启动参数
      slowStartData: [0, 1, 2, 3],
      // 测速磁钢数
      speedSteelData: [...Array(16)].map((v, i) => i),
      // 助力开始磁钢数
      assistStartMagnetNumberData: [...Array(63)].map((v, i) => i + 2),
      // 助力限速门限
      assistLimitData: [...Array(256)].map((v, i) => i),
      // 电量变化时间
      batteryVoltageChangeTimeData: [...Array(60)].map((v, i) => i + 1),
      // 速度平滑等级
      smoothLevelData: [...Array(11)].map((v, i) => i),
      // 总线故障超时时间
      allLineErrTimeOutData: [...Array(251)].map((v, i) => i + 5),
      // 轮径
      wheelDiameterData: {
        0: 16,
        1: 18,
        2: 20,
        3: 22,
        4: 24,
        5: 26,
        6: "700C",
        7: 28,
      },
      dicts_unit: {
        0: "公制",
        1: "英制",
      },
      dicts_agreement: {
        0: "KM5S",
        1: "锂电2号",
        2: "八方",
        3: "J协议",
      },
      dicts_power: {
        0: "控制器上报电压，仪表计算电量",
        1: "控制器上报电量",
        2: "仪表检查电压，仪表计算电量",
      },
      dicts_logo: {
        0: "迪太界面",
        1: "中性界面",
        2: "客户界面",
      },
      serialLevelData: {
        0: "3.3V",
        1: "5V",
      },
      radioTypeOneList: {
        0: "NO",
        1: "YES",
      },
      radioTypeTwoList: {
        0: "YES",
        1: "NO",
      },
      rotateHandleSpeedLimitList: {
        0: "正常",
        1: "限速6Km",
      },
      assistList: {
        0: "助力正",
        1: "助力反",
      },
      dicts_ebike: {},
      parallelism: {
        //待确认对应关系
        name: "name",
        communicationType1: "communication_type1",
        controllerJoint: "controller_joint",
        speedLimit: "speed_limit",
        maxGear: "max_gear",
        ortherConfig: "orther_config",
        notControllerJointString: "not_controller_joint_string",
        speedSteel: "speed_detect_magnet_number",
        shutdownTime: "shutdown_time",
        communicationType2: "communication_type2",
        usb: "usb",
        tiresSize: "tires_size",
        // buzzer: "buzzer",
        app: "app",
        //已明确对应关系
        undervoltage: "low_voltage_threshold",
        currentlimiting: "current_limit_threshold",
        wheelDiameter: "wheelsize",
        power: "electricity_method",
        unit: "display_unit",
        bluetooth: "has_ble_feature",
        backlightBrightness: "backlight_brightness",
        voltage: "system_voltage",
        assist: "assist_dir",
        perimeter: "peri_meter",
        agreement: "uart_protocol",
        driveAssist: "push_speed_func",
        defaultGear: "default_assist",
        logo: "logo",
        highSpeedBuzzerRemind: "limit_speed_beep",
        cruise: "cruise_enable_switch",
        startupPasswd: "power_on_password",
        menuPasswd: "menu_password",
        rotateHandle: "rotate_handle",
        rotateHandleSpeedLimit: "rotate_handle_speed_limit",
        slowStart: "slow_start",
        batteryVoltageChangeTime: "battery_voltage_change_time",
        smoothLevel: "smooth_level",
        assistPercentage: "assist_percentage",
        ebikeName: "ebike_name",
        motorSys: "motor_sys",
        batteryCap: "battery_cap",
        showWheelsize: "show_wheelsize",
        carModel: "car_model",
        assistStartMagnetNumber: "assist_start_magnet_number",
        allLineErrTimeOut: "bus_overtime",
        assistLimit: "assist_speed_limit_threshold",
        sleepTime: "sleep_time",
        powerGear: "assist_level",
        serialLevel: "uart_level",
        factoryReset: "res_factory_set",
        buzzerSwitch: "beep_switch",
        turnOnPasswd: "power_password_switch",
        menuPassword: "menu_password_switch",
      },
      deployRules: {
        categoryId: [
          { required: true, message: "所属品类不能为空", trigger: "change" },
        ],
        computerId: [
          { required: true, message: "仪表型号不能为空", trigger: "change" },
        ],
        content: [
          { required: true, message: "属性描述不能为空", trigger: "blur" },
        ],
        url: [{ required: true, message: "文件不能为空", trigger: "change" }],
      },
    };
  },
  computed: {
    isShow() {
      return !!!getToken();
    },
    isNoData() {
      return (key) => {
        return this.isUploadFlag && this.formData.instrumentModel[key] === "";
      };
    },
    inputWidth() {
      return "width: 120px";
    },
    inputValuesRules() {
      return ({ keyLabel }) => {
        return {
          required: true,
          message: `${keyLabel}不能为空`,
          trigger: "blur",
        };
      };
    },
    transformValueInt() {
      return (keyType, value) => {
        return typeof this.formData.instrumentModel[keyType] === "string"
          ? String(value)
          : +value;
      };
    },
  },
  watch: {
    "deployForm.url"(url) {
      if (url) {
        this.clearValidateItem("deployForm", "url");
      }
    },
    visible(bool) {
      if (!bool) {
        this.$refs.deployForm.resetFields();
      }
    },
  },
  created() {
    // 车名
    this.getConfigDicts("instrument_ebike_name", "dicts_ebike");

    this.echoWheelDiameter();
    categoryComputerDict().then((res) => {
      this.dictList = res.data;
    });

    // 轮径
    for (let i = 8; i < 100; i++) {
      this.wheelDiameterData[i] = i * 0.5;
    }
  },
  mounted() {
    this.scrollToSavePosition();
    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("scrollPosition", window.scrollY);
    });
  },
  beforeRouteLeave(to, from, next) {
    sessionStorage.removeItem("scrollPosition");
    next();
  },
  methods: {
    scrollToSavePosition() {
      const savePostion = sessionStorage.getItem("scrollPosition");

      if (savePostion) {
        scrollTo(savePostion);

        sessionStorage.removeItem("savePostion");
      }
    },
    changeCountPerimeter(wheelDiameter) {
      let wheelDiameterVal = null;
      if (wheelDiameter === "6") {
        wheelDiameterVal = 27.5;
      } else {
        wheelDiameterVal = this.wheelDiameterData[wheelDiameter];
      }
      this.formData.instrumentModel.perimeter = parseInt(
        wheelDiameterVal * 25.4 * 3.14
      );
    },
    echoWheelDiameter() {
      const wheelDiameter = this.formData.instrumentModel.wheelDiameter;
      if (wheelDiameter) {
        this.formData.instrumentModel.perimeter = parseInt(
          wheelDiameter * 25.4 * 3.14
        );
      }
    },
    handleChange(file) {
      const { name } = file;
      const isIniFile = name.lastIndexOf(".ini") !== -1;

      try {
        if (typeof FileReader === "undefined") {
          return this.msgInfo("您的浏览器不支持文件读取。");
        }

        const reader = new FileReader();

        isIniFile && reader.readAsArrayBuffer(file.raw); //读任意文件

        this.resetSetFile();
        let jsonData = {};
        reader.onload = (e) => {
          const content = e.target.result;

          if (isIniFile) {
            this.convertIniToJson(content);
          } else {
            jsonData = JSON.parse(content);

            let { undervoltage } = jsonData.instrumentModel;

            if (undervoltage > 99.9) {
              undervoltage /= 1000;
              jsonData.instrumentModel.undervoltage = undervoltage;
            }

            this.formData = {
              ...jsonData,
            };
          }
        };

        this.isUploadFlag = true;
        this.msgSuccess("文件解析成功");

        !isIniFile && reader.readAsText(file.raw);
      } catch (error) {
        console.error(error);
      }
    },
    resetSetFile() {
      this.isUploadFlag = false;
      this.formData.instrumentModel = {
        backlightBrightness: "",
        sleepTime: "",
        voltage: "",
        powerGear: "",
        agreement: "",
        assist: "",
        assistStartMagnetNumber: "",
        assistPercentage: "",
        rotateHandle: "",
        rotateHandleSpeedLimit: "",
        slowStart: "",
        speedSteel: "",
        currentlimiting: "",
        undervoltage: "",
        assistLimit: "",
        wheelDiameter: "",
        perimeter: "",
        batteryVoltageChangeTime: "",
        allLineErrTimeOut: "",
        smoothLevel: "",
        unit: "",
        bluetooth: "",
        power: "",
        driveAssist: "",
        defaultGear: "",
        logo: "",
        highSpeedBuzzerRemind: "",
        startupPasswd: "",
        menuPasswd: "",
        factoryReset: "",
        ebikeName: "",
        motorSys: "",
        batteryCap: "",
        showWheelsize: "",
        tiresSize: "",
        carModel: "",
        turnOnPasswd: "",
        menuPassword: "",
        buzzerSwitch: "",
        cruise: "",
        serialLevel: "",
      };
    },
    convertIniToJson(content) {
      let ints = new Uint8Array(content);
      const snippets = new TextDecoder("gb2312").decode(ints);
      const objVal = this.parseINI(snippets);
      const { parallelism } = this;

      for (let parentKey in objVal) {
        for (let childKey in parallelism) {
          if (parallelism[childKey] === parentKey) {
            let parVal = objVal[parallelism[childKey]];

            // 欠压门限
            if (childKey === "undervoltage" && parVal !== "") {
              objVal[parallelism[childKey]] = (+parVal + 20000) / 1000;
            }
            // 系统电压
            if (childKey === "voltage" && parVal !== "") {
              objVal[parallelism[childKey]] =
                this.dicts_voltage[parVal] || parVal;
            }
            // 背光亮度
            if (childKey === "backlightBrightness" && parVal !== "") {
              objVal[parallelism[childKey]] = +parVal;
            }
            // 助力开始磁钢数
            if (childKey === "assistStartMagnetNumber" && parVal !== "") {
              objVal[parallelism[childKey]] =
                this.assistStartMagnetNumberData[parVal];
            }
            // 休眠时间
            if (childKey === "sleepTime" && parVal !== "") {
              objVal[parallelism[childKey]] = this.sleepTimeList[parVal];
            }
            // 助力档位数
            if (childKey === "powerGear" && parVal !== "") {
              objVal[parallelism[childKey]] = this.powerGearData[parVal];
            }
            // 助力限速门限
            if (childKey === "assistLimit" && parVal !== "") {
              objVal[parallelism[childKey]] = this.assistLimitData[parVal];
            }
            // 电量变化时间
            if (childKey === "batteryVoltageChangeTime" && parVal !== "") {
              objVal[parallelism[childKey]] =
                this.batteryVoltageChangeTimeData[parVal];
            }
            // 总线故障超时时间
            if (childKey === "allLineErrTimeOut" && parVal !== "") {
              objVal[parallelism[childKey]] =
                this.allLineErrTimeOutData[parVal];
            }
            const childKeyList = [
              "agreement",
              "bluetooth",
              "driveAssist",
              "factoryReset",
              "rotateHandle",
              "buzzerSwitch",
              "cruise",
              "turnOnPasswd",
              "menuPassword",
              "rotateHandleSpeedLimit",
              "assist",
            ];
            // 蓝牙
            if (childKeyList.includes(childKey) && parVal !== "") {
              objVal[parallelism[childKey]] = +parVal;
            }

            this.formData.instrumentModel[childKey] =
              objVal[parallelism[childKey]];
          }
        }
      }
    },
    parseINI(data) {
      const regex = {
        section: /^\s*\s*([^]*)\s*\]\s*$/,

        param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,

        comment: /^\s*;.*$/,
      };

      const value = {};

      const lines = data.split(/\r\n|\r|\n/);

      let section = null;

      lines.forEach(function (line) {
        if (regex.comment.test(line)) {
          return;
        } else if (regex.param.test(line)) {
          var match = line.match(regex.param);
          if (section) {
            value[section][match[1]] = match[2];
          } else {
            value[match[1]] = match[2];
          }
        } else if (regex.section.test(line)) {
          // var match = line.match(regex.section);
          // value[match[1]] = {};
          // section = match[1];
        } else if (line.length == 0 && section) {
          section = null;
        }
      });

      return value;
    },
    changeCategory(val) {
      if (!val) return;
      this.queryParams.computerId = "";
      this.computerOptions = this.dictList.filter(
        (item) => item.id === val
      )[0].computerList;
    },
    handleQuery() {
      listFileConfig({
        ...this.queryParams,
        type: "config_file",
      }).then((res) => {
        const { list } = res.data;
        const stsDeployFile = list[0]?.url;
        if (stsDeployFile) {
          this.handleFetchData(stsDeployFile);
        } else {
          this.msgInfo("暂无配置文件");
        }
      });
    },
    handleFetchData(stsDeployFile) {
      Axios.get(stsDeployFile).then((res) => {
        const configData = res.data;

        let { undervoltage } = configData.instrumentModel;
        if (undervoltage > 99.9) {
          undervoltage /= 1000;
          configData.instrumentModel.undervoltage = undervoltage;
        }
        this.formData = { ...configData };
      });
    },
    changeVoltage(voltageVal) {
      let voltage = "";
      switch (voltageVal) {
        case 24:
          voltage = 22;
          break;
        case 36:
          voltage = 31.5;
          break;
        case 48:
          voltage = 42;
          break;
        case 52:
          voltage = 45;
          break;
        case 60:
          voltage = 54;
          break;
        case 72:
          voltage = 62;
          break;
      }
      this.formData.instrumentModel.undervoltage = voltage;
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
    // 导出
    exportForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.isCustomerShow = true;
          this.reset();
        }
      });
    },
    reset() {
      this.resetForm("downloadForm");
      this.downloadForm = {
        customerName: "",
        categoryName: "",
      };
    },
    handleDownloadSubmit() {
      this.$refs.downloadForm.validate((valid) => {
        if (valid) {
          const fileName = this.handleDownloadName();
          this.exportToJsonFile(this.formData, fileName);
        }
      });
    },
    handleDownloadName() {
      const currentDate = this.moment().format("YYYYMMDD");
      return (
        currentDate +
        "-" +
        this.downloadForm.customerName +
        this.downloadForm.categoryName
      );
    },
    exportToJsonFile(data, fileName) {
      const jsonData = JSON.stringify(data);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      link.click();

      this.isCustomerShow = false;
      this.customerName = "";

      URL.revokeObjectURL(url);
    },
    // 上传配置
    handleOk(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.confirmLoading = true;
          stsEditFileConfig({
            ...this.deployForm,
            type: "config_file",
            dataType: 2,
          })
            .then(() => {
              this.msgSuccess("配置上传成功");
              this.visible = false;
            })
            .finally(() => {
              this.confirmLoading = false;
            });
        }
      });
    },
    setContentName(computerId) {
      if (computerId) {
        const contentName = this.computerOptions.filter(
          ({ model }) => model === computerId
        );
        this.deployForm.content = contentName[0].name;
      }
    },
    // 配置字典
    getConfigDicts(dictName, currentData) {
      try {
        this.getDicts(dictName).then((res) => {
          const data = res.data;
          data.forEach(({ dictLabel, dictValue }) => {
            this[currentData][dictValue] = dictLabel;
          });
        });
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.el-container {
  min-height: 100vh;
  background: #fff;

  .el-header {
    font-size: 20px;
    font-weight: bold;
  }

  .el-header,
  .el-footer {
    line-height: 60px;
    text-align: center;
  }

  .noData {
    /deep/ .el-form-item__label {
      color: #e50e4b;
    }
  }

  .el-input-number-box {
    width: 100%;
    /deep/ .el-input__inner {
      text-align: left;
    }
  }
}
</style>
