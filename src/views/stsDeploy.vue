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
                @change="changeQueryCategory"
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
            <el-form-item label="文件类型" prop="type">
              <el-select
                v-model="queryParams.type"
                clearable
                placeholder="请选择文件类型"
              >
                <el-option label="json" value="config_file"></el-option>
                <el-option label="ini" value="config_file_ini"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-search"
                @click="handleQuery"
              >
                检索
              </el-button>
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
                :rules="isCheckConfigItem({ message: '背光亮度' })"
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
                :rules="isCheckConfigItem({ message: '休眠时间' })"
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
                :rules="isCheckConfigItem({ message: '系统电压' })"
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
                :rules="isCheckConfigItem({ message: '欠压门限' })"
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

              <el-form-item
                label="助力档位数"
                class="noData"
                prop="instrumentModel.powerGear"
                :rules="isCheckConfigItem({ message: '助力档位数' })"
              >
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
                prop="instrumentModel.assistStartMagnetNumber"
                :class="{ noData: isNoData('assistStartMagnetNumber') }"
                :rules="isCheckConfigItem({ message: '助力开始磁钢数' })"
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
                prop="instrumentModel.assistPercentage"
                :class="{ noData: isNoData('assistPercentage') }"
                :rules="isCheckConfigItem({ message: '助力比例' })"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0 }"
                  v-model.number="formData.instrumentModel.assistPercentage"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="请输入助力比例"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="限流门限(A)"
                prop="instrumentModel.currentlimiting"
                :class="{ noData: isNoData('currentlimiting') }"
                :rules="isCheckConfigItem({ message: '限流门限' })"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0 }"
                  v-model.number="formData.instrumentModel.currentlimiting"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="请输入限流门限"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="助力限速门限(km/h)"
                prop="instrumentModel.assistLimit"
                class="noData"
                :rules="isCheckConfigItem({ message: '助力限速门限' })"
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
                prop="instrumentModel.showWheelsize"
                :class="{ noData: isNoData('showWheelsize') }"
                :rules="isCheckConfigItem({ message: '显示轮径' })"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0 }"
                  v-model.number="formData.instrumentModel.showWheelsize"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="显示轮径"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item
                label="缓启动"
                prop="instrumentModel.slowStart"
                :class="{ noData: isNoData('slowStart') }"
                :rules="isCheckConfigItem({ message: '缓启动' })"
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
                :rules="isCheckConfigItem({ message: '轮径' })"
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
                :rules="
                  isCheckConfigItem({
                    message: '周长',
                    trigger: ['blur', 'change'],
                  })
                "
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
                :rules="isCheckConfigItem({ message: '显示单位' })"
              >
                <el-select
                  v-model="formData.instrumentModel.unit"
                  placeholder="请选择显示单位"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in dicts_unit"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="+item.dictValue"
                  >
                    <span style="float: left">
                      <b>展示值：</b>
                      {{ item.dictLabel }}
                    </span>
                    <span style="float: right">
                      <b>实际值：</b>
                      {{ item.dictValue }}
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="协议"
                prop="instrumentModel.agreement"
                :class="{ noData: isNoData('agreement') }"
                :rules="isCheckConfigItem({ message: '协议' })"
              >
                <el-select
                  v-model="formData.instrumentModel.agreement"
                  placeholder="请选择协议"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in dicts_agreement"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="+item.dictValue"
                  >
                    <span style="float: left">
                      <b>展示值：</b>
                      {{ item.dictLabel }}
                    </span>
                    <span style="float: right">
                      <b>实际值：</b>
                      {{ item.dictValue }}
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="电量计算方式"
                prop="instrumentModel.power"
                :class="{ noData: isNoData('power') }"
                :rules="isCheckConfigItem({ message: '电量计算方式' })"
              >
                <el-select
                  v-model="formData.instrumentModel.power"
                  placeholder="请选择电量计算方式"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in dicts_power"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  >
                    <span style="float: left" class="margin-right-sm">
                      <b>展示值：</b>
                      {{ item.dictLabel }}
                    </span>
                    <span style="float: right">
                      <b>实际值：</b>
                      {{ item.dictValue }}
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="测速磁钢数"
                prop="instrumentModel.speedSteel"
                :class="{ noData: isNoData('speedSteel') }"
                :rules="isCheckConfigItem({ message: '测速磁钢数' })"
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
                :rules="isCheckConfigItem({ message: '电量变化时间' })"
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
                :rules="isCheckConfigItem({ message: '速度平滑等级' })"
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
                prop="instrumentModel.allLineErrTimeOut"
                :class="{ noData: isNoData('allLineErrTimeOut') }"
                :rules="isCheckConfigItem({ message: '总线故障超时时间' })"
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
                prop="instrumentModel.ebikeName"
                :class="{ noData: isNoData('ebikeName') }"
                :rules="isCheckConfigItem({ message: '车名' })"
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
                    :key="+key"
                    :label="value"
                    :value="+key"
                  >
                    <span style="float: left">
                      <b>展示值：</b>
                      {{ value }}
                    </span>
                    <span style="float: right">
                      <b>实际值：</b>
                      {{ key }}
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="车型"
                prop="instrumentModel.carModel"
                :class="{ noData: isNoData('carModel') }"
                :rules="isCheckConfigItem({ message: '车型' })"
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
                :rules="isCheckConfigItem({ message: '车型' })"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0 }"
                  v-model="formData.instrumentModel.defaultGear"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="请输入默认档位"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="Logo界面"
                prop="instrumentModel.logo"
                :class="{ noData: isNoData('logo') }"
                :rules="isCheckConfigItem({ message: 'Logo界面' })"
              >
                <el-select
                  v-model="formData.instrumentModel.logo"
                  placeholder="请选择Logo界面"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in dicts_logo"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                  >
                    <span style="float: left">
                      <b>展示值：</b>
                      {{ item.dictLabel }}
                    </span>
                    <span style="float: right">
                      <b>实际值：</b>
                      {{ item.dictValue }}
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="开机密码"
                prop="instrumentModel.startupPasswd"
                :class="{ noData: isNoData('startupPasswd') }"
                :rules="isCheckConfigItem({ message: '开机密码' })"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0 }"
                  v-model="formData.instrumentModel.startupPasswd"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="请输入开机密码"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="高级菜单密码"
                prop="instrumentModel.highMenuPasswd"
                :class="{ noData: isNoData('highMenuPasswd') }"
                :rules="
                  isCheckConfigItem({
                    message: '高级菜单密码',
                  })
                "
              >
                <el-input
                  v-model="formData.instrumentModel.highMenuPasswd"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  type="number"
                  v-minMaxValue="{ min: 0 }"
                  placeholder="请输入高级菜单密码"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="电机功率(W)"
                prop="instrumentModel.motorSys"
                :class="{ noData: isNoData('motorSys') }"
                :rules="isCheckConfigItem({ message: '电机功率' })"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0 }"
                  v-model="formData.instrumentModel.motorSys"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="请输入电机功率"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="电池容量"
                prop="instrumentModel.batteryCap"
                :class="{ noData: isNoData('batteryCap') }"
                :rules="isCheckConfigItem({ message: '电池容量' })"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0 }"
                  v-model="formData.instrumentModel.batteryCap"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="电池容量"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="高速蜂鸣器提醒"
                prop="instrumentModel.highSpeedBuzzerRemind"
                :class="{ noData: isNoData('highSpeedBuzzerRemind') }"
                :rules="
                  isCheckConfigItem({
                    message: '高速蜂鸣器提醒',
                  })
                "
              >
                <el-input
                  v-model="formData.instrumentModel.highSpeedBuzzerRemind"
                  v-minMaxValue="{ min: 0 }"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  type="number"
                  placeholder="请输入高速蜂鸣器提醒"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="串口通讯电平"
                prop="instrumentModel.serialLevel"
                :class="{ noData: isNoData('serialLevel') }"
                :rules="isCheckConfigItem({ message: '串口通讯电平' })"
              >
                <el-select
                  v-model="formData.instrumentModel.serialLevel"
                  placeholder="请选择串口通讯电平"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="(value, key) in serialLevelLogData"
                    :key="key"
                    :label="value"
                    :value="+key"
                  >
                    <span style="float: left">
                      <b>展示值：</b>
                      {{ value }}
                    </span>
                    <span style="float: right">
                      <b>实际值：</b>
                      {{ key }}
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item
                label="车轮宽度"
                prop="instrumentModel.tiresSize"
                :class="{ noData: isNoData('tiresSize') }"
                :rules="isCheckConfigItem({ message: '车轮宽度' })"
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0 }"
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
                :rules="isCheckConfigItem({ message: '蓝牙' })"
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
                :rules="isCheckConfigItem({ message: '推车助力' })"
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
                :rules="isCheckConfigItem({ message: '恢复出厂设置' })"
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
                :rules="isCheckConfigItem({ message: '转把分档' })"
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
                :rules="isCheckConfigItem({ message: '蜂鸣器开关' })"
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
                :rules="isCheckConfigItem({ message: '定速巡航功能' })"
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
                :rules="isCheckConfigItem({ message: '开机密码' })"
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
                :rules="isCheckConfigItem({ message: '菜单密码' })"
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
                :rules="isCheckConfigItem({ message: '转把限速' })"
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
                :rules="isCheckConfigItem({ message: '助力正反' })"
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
        <el-button
          size="mini"
          type="primary"
          @click="handleSendConfig(1)"
          v-hasPermi="['third:productFamily:update']"
        >
          同步配置
        </el-button>
        <!-- <el-button size="mini" type="primary" @click="handleSendConfig(2)">
          上传配置
        </el-button> -->
        <el-button size="mini" type="primary" @click="exportForm">
          导出配置
        </el-button>
      </template>
    </el-footer>

    <!-- 选择客户 -->
    <el-dialog
      title="导出配置"
      width="400px"
      center
      top="0"
      :visible.sync="isCustomerShow"
      :close-on-click-modal="false"
    >
      <el-form
        ref="downloadForm"
        :model="downloadForm"
        :rules="rules"
        label-width="80px"
      >
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
            style="width: 100%"
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
        <el-form-item label="文件类型" prop="type">
          <el-select
            v-model="downloadForm.type"
            placeholder="请选择文件类型"
            style="width: 100%"
          >
            <el-option label="json" value="config_file"></el-option>
            <el-option label="ini" value="config_file_ini"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="isCustomerShow = false">取 消</el-button>
        <el-button type="primary" @click="handleDownloadSubmit">
          确 定
        </el-button>
      </div>
    </el-dialog>

    <!-- 同步配置 -->
    <el-dialog
      :title="isSyncOrUploadType === 1 ? '同步配置' : '上传配置'"
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
            @change="changeConfigCategory"
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

        <template v-if="isSyncOrUploadType === 2">
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
                <el-button size="mini" type="primary">点击上传</el-button>
              </div>
            </DrUpload>
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="visible = false">取 消</el-button>
        <el-button
          size="mini"
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
import {
  editComputer,
  listComputer,
  detailComputer,
} from "@/api/third/computer";
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
      } else {
        callback();
      }
    };
    return {
      isUploadFlag: false,
      visible: false,
      confirmLoading: false,
      isCustomerShow: false,
      isSyncOrUploadType: null,
      customerName: "",
      queryParams: {
        categoryId: "",
        computerId: "",
        type: "config_file",
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
          highMenuPasswd: "",
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
        type: "config_file",
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
      dicts_voltage: [],
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
      dicts_unit: [],
      dicts_agreement: [],
      dicts_power: [],
      dicts_logo: [],
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
      serialLevelLogData: {
        0: "3.3V",
        1: "5V",
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
        shutdownTime: "shutdown_time",
        communicationType2: "communication_type2",
        usb: "usb",
        app: "app",
        //已明确对应关系
        rotateHandle: "rotate_handle", // 转把分档
        rotateHandleSpeedLimit: "rotate_handle_speed_limit", // 转把限速
        slowStart: "slow_start", // 缓启动
        speedSteel: "speed_detect_magnet_number", // 测速磁钢数
        undervoltage: "low_voltage_threshold", // 欠压门限
        currentlimiting: "current_limit_threshold", // 限流门限
        assistLimit: "assist_speed_limit_threshold", // 助力限速门限
        wheelDiameter: "wheelsize", // 轮径
        batteryVoltageChangeTime: "battery_voltage_change_time", // 电量变化时间
        allLineErrTimeOut: "bus_overtime", // 总线故障超时时间
        smoothLevel: "smooth_level", // 速度平滑等级
        unit: "display_unit", // 显示单位
        bluetooth: "has_ble_feature", // 蓝牙
        backlightBrightness: "backlight_brightness", // 背光亮度
        sleepTime: "sleep_time", // 休眠时间
        voltage: "system_voltage", // 系统电压
        powerGear: "assist_level", // 助力档位数
        assist: "assist_dir", // 助力正反
        assistStartMagnetNumber: "assist_start_magnet_number", // 助力开始磁钢数
        assistPercentage: "assist_percentage", // 助力比例
        perimeter: "peri_meter", // 周长
        agreement: "uart_protocol", // 协议
        power: "electricity_method", // 电量计算方式
        driveAssist: "push_speed_func", // 推车助力
        defaultGear: "default_assist", // 默认档位
        logo: "logo", // Logo界面
        serialLevel: "uart_level", // 串口通讯电平
        buzzerSwitch: "beep_switch", // 蜂鸣器开关
        highSpeedBuzzerRemind: "limit_speed_beep", // 高速蜂鸣器提醒
        cruise: "cruise_enable_switch", // 定速巡航功能
        startupPasswd: "power_on_password", // 开机密码
        highMenuPasswd: "menu_password", // 高级菜单密码
        factoryReset: "res_factory_set", // 恢复出厂设置
        ebikeName: "ebike_name", // 车名
        motorSys: "motor_sys", // 电机功率
        batteryCap: "battery_cap", // 电池容量
        showWheelsize: "show_wheelsize", // 显示轮径
        tiresSize: "tires_size", // 车轮宽度
        carModel: "car_model", // 车型
        turnOnPasswd: "power_password_switch", // 开机密码
        menuPassword: "menu_password_switch", // 菜单密码
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
    isCheckConfigItem() {
      return ({ required = true, message = "", trigger = "change" } = {}) => {
        return { required, message: `${message}不能为空`, trigger };
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
    this.getOptions();
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
    getOptions() {
      //仪表电压
      this.getDicts("instrument_voltage").then((res) => {
        this.dicts_voltage = res.data.map(({ dictValue }) => +dictValue);
      });
      //仪表协议
      this.getDicts("instrument_agreement").then((res) => {
        this.dicts_agreement = res.data;
      });
      //仪表单位
      this.getDicts("instrument_unit").then((res) => {
        this.dicts_unit = res.data;
      });
      //仪表电量计算
      this.getDicts("instrument_power").then((res) => {
        this.dicts_power = res.data;
      });
      //仪表LOGO界面
      this.getDicts("instrument_logo").then((res) => {
        this.dicts_logo = res.data;
      });
    },
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

          console.log("content", content);
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
        menuPasswd: "",
        startupPasswd: "",
        highMenuPasswd: "",
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
      console.log("objVal", objVal);
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

            // 车名
            if (childKey === "ebikeName" && parVal !== "") {
              objVal[parallelism[childKey]] = +parVal;
            }

            // 显示单位
            if (childKey === "unit" && parVal !== "") {
              objVal[parallelism[childKey]] = +parVal;
            }

            // 显示单位
            if (childKey === "serialLevel" && parVal !== "") {
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
    changeQueryCategory(val) {
      if (!val) return;
      this.queryParams.computerId = "";
      this.computerOptions = [];
      this.computerOptions = this.dictList.filter(
        (item) => item.id === val
      )[0].computerList;
    },
    changeConfigCategory(val) {
      if (!val) return;
      this.deployForm.computerId = "";
      this.computerOptions = this.dictList.filter(
        (item) => item.id === val
      )[0].computerList;
    },
    handleQuery() {
      listFileConfig(this.queryParams).then((res) => {
        const { list } = res.data;
        const stsDeployFile = list[0]?.url;
        if (stsDeployFile) {
          this.handleFetchData(stsDeployFile);
        } else {
          this.msgInfo("暂无配置文件");
        }
      });
    },
    handleFetchData(url) {
      const { type } = this.queryParams;
      let fetchOption = {};
      if (type === "config_file") {
        fetchOption = {
          method: "get",
          url,
        };
      } else if (type === "config_file_ini") {
        fetchOption = {
          method: "get",
          url,
          responseType: "arraybuffer",
        };
      }
      Axios(fetchOption).then((res) => {
        const configData = res.data;
        console.log("configData", configData);
        if (type === "config_file") {
          let { undervoltage, unit, serialLevel } = configData.instrumentModel;
          if (undervoltage > 99.9) {
            undervoltage /= 1000;
            configData.instrumentModel.undervoltage = undervoltage;
          }

          configData.instrumentModel.unit = Number(unit);
          configData.instrumentModel.serialLevel = Number(serialLevel);
          this.formData = { ...configData };
        }

        if (type === "config_file_ini") {
          this.convertIniToJson(configData);
        }
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
        type: "config_file",
      };
    },
    handleDownloadSubmit() {
      this.$refs.downloadForm.validate((valid) => {
        if (valid) {
          const fileName = this.handleDownloadName();
          const { type } = this.downloadForm;
          if (type === "config_file") {
            // json
            this.exportToJsonFile(this.formData, fileName);
          }

          if (type === "config_file_ini") {
            // ini

            console.log("配置文件", this.formData);
            const { instrumentModel } = this.formData;
            this.exportToIniFile(instrumentModel, `${fileName}.ini`);
          }
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
    configToJsonString() {
      const {
        backlightBrightness,
        sleepTime,
        voltage,
        undervoltage,
        powerGear,
        assistStartMagnetNumber,
        assistPercentage,
        currentlimiting,
        assistLimit,
        showWheelsize,
        slowStart,
        wheelDiameter,
        perimeter,
        unit,
        agreement,
        power,
        speedSteel,
        batteryVoltageChangeTime,
        smoothLevel,
        allLineErrTimeOut,
        ebikeName,
        carModel,
        defaultGear,
        logo,
        startupPasswd,
        highMenuPasswd,
        motorSys,
        batteryCap,
        highSpeedBuzzerRemind,
        // autoShutdownTime,
        tiresSize,
        bluetooth,
        driveAssist,
        factoryReset,
        rotateHandle,
        buzzerSwitch,
        cruise,
        turnOnPasswd,
        menuPassword,
        rotateHandleSpeedLimit,
        assist,
        serialLevel,
      } = this.formData.instrumentModel;

      const instrumentModel = {
        backlightBrightness: Number(backlightBrightness),
        sleepTime: Number(sleepTime),
        voltage: Number(voltage),
        undervoltage: Number(undervoltage),
        powerGear: Number(powerGear),
        assistStartMagnetNumber: String(assistStartMagnetNumber),
        assistPercentage: String(assistPercentage),
        currentlimiting: Number(currentlimiting),
        assistLimit: String(assistLimit),
        showWheelsize: String(showWheelsize),
        slowStart: String(slowStart),
        wheelDiameter: Number(wheelDiameter),
        perimeter: Number(perimeter),
        unit: Number(unit),
        agreement: Number(agreement),
        power: String(power),
        speedSteel: Number(speedSteel),
        batteryVoltageChangeTime: String(batteryVoltageChangeTime),
        smoothLevel: String(smoothLevel),
        allLineErrTimeOut: String(allLineErrTimeOut),
        ebikeName: Number(ebikeName),
        carModel: String(carModel),
        defaultGear: String(defaultGear),
        logo: String(logo),
        startupPasswd: String(startupPasswd),
        highMenuPasswd: String(highMenuPasswd),
        menuPasswd: String(highMenuPasswd),
        motorSys: String(motorSys),
        batteryCap: Number(batteryCap),
        highSpeedBuzzerRemind: String(highSpeedBuzzerRemind),
        // autoShutdownTime,
        tiresSize: String(tiresSize),
        bluetooth: Number(bluetooth),
        driveAssist: Number(driveAssist),
        factoryReset: Number(factoryReset),
        rotateHandle: Number(rotateHandle),
        buzzerSwitch: Number(buzzerSwitch),
        cruise: Number(cruise),
        turnOnPasswd: Number(turnOnPasswd),
        menuPassword: Number(menuPassword),
        rotateHandleSpeedLimit: Number(rotateHandleSpeedLimit),
        assist: Number(assist),
        serialLevel: Number(serialLevel),
      };

      const data = {
        instrumentModel,
      };
      return JSON.stringify(data);
    },
    exportToIniFile(data, fileName) {
      const iniString = this.convertToIni(data);
      const blob = new Blob([iniString], { type: "text/plain" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // 释放URL对象
    },
    convertToIni(configData) {
      const { parallelism } = this;

      let newObj = {};
      for (const parentKey in configData) {
        for (const childKey in parallelism) {
          if (parentKey === childKey) {
            if (parentKey === "undervoltage") {
              newObj[parallelism[childKey]] =
                configData[parentKey] * 1000 - 20000;
            } else if (parentKey === "powerGear") {
              // 助力档位数
              const value = this.powerGearData.indexOf(configData[parentKey]);
              newObj[parallelism[childKey]] = value;
            } else if (parentKey === "batteryVoltageChangeTime") {
              // 电量变化时间
              const value = this.batteryVoltageChangeTimeData.indexOf(
                configData[parentKey]
              );
              newObj[parallelism[childKey]] = value;
            } else if (parentKey === "allLineErrTimeOut") {
              // 总线故障超时时间
              const value = this.allLineErrTimeOutData.indexOf(
                configData[parentKey]
              );
              newObj[parallelism[childKey]] = value;
            } else if (parentKey === "allLineErrTimeOut") {
              // 总线故障超时时间
              const value = this.allLineErrTimeOutData.indexOf(
                configData[parentKey]
              );
              newObj[parallelism[childKey]] = value;
            } else if (parentKey === "voltage") {
              // 系统电压
              const value = this.dicts_voltage.indexOf(configData[parentKey]);
              newObj[parallelism[childKey]] = value;
            } else if (parentKey === "assistStartMagnetNumber") {
              // 助力开始磁钢数
              const value = this.assistStartMagnetNumberData.indexOf(
                configData[parentKey]
              );
              newObj[parallelism[childKey]] = value;
            } else {
              newObj[parallelism[childKey]] = configData[parentKey];
            }
          }
        }
      }

      const section = "UI";
      let iniString = `[${section}]\n`;

      for (const key in newObj) {
        iniString += `${key} = ${newObj[key]}\n`;
      }

      return iniString;
    },
    // 同步配置
    handleSendConfig(type) {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.visible = true;
          this.isSyncOrUploadType = type;
          this.reset();
        }
      });
    },
    // 同步配置
    handleOk(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          try {
            this.confirmLoading = true;
            let formData = null;
            let fetchFn = null;
            if (this.isSyncOrUploadType === 1) {
              const { categoryId, computerId } = this.deployForm;
              const result = await listComputer({
                key: categoryId,
                computerId,
              });
              const { list } = result.data;
              const detailComputerId = list[0]?.id;
              const detailComputerData = await detailComputer(detailComputerId);
              const { data } = detailComputerData;
              formData = data;

              const { instrumentModel } = this.formData;
              formData.instrumentModel = {
                ...formData.instrumentModel,
                ...instrumentModel,
              };

              formData = this.isStsOrNoSts(formData);

              fetchFn = editComputer;
            }

            if (this.isSyncOrUploadType === 2) {
              formData = {
                ...this.deployForm,
                type: "config_file",
                dataType: 2,
              };

              fetchFn = stsEditFileConfig;
            }

            const tipMsg = isSyncOrUploadType === 1 ? "同步" : "上传";
            fetchFn(formData)
              .then(() => {
                this.msgSuccess(`${tipMsg}配置成功`);
                this.visible = false;
              })
              .catch((err) => {
                this.msgSuccess(`${tipMsg}配置失败`);
              })
              .finally(() => {
                this.confirmLoading = false;
              });
          } catch (error) {
            console.log(error);
          }
        }
      });
    },
    isStsOrNoSts(formData) {
      // 非STS
      if (formData.isSts === 0) {
        const {
          customerMaterialNum,
          customerName,
          customerCarName,
          id,
          serialLevel,
          baudRate,
          msgType,
          canRate,
          sn,
          pcbaSn,
          sysProtocol,
          labelRule,
          labelRuleImg,
          controlConnect,
          controlHead,
          notControllerJointString,
          keyType,
          keyLinkType,
          modelEndHead,
          keyEndHead,
          keyLineLen,
          keyImgUrl,
          powerLogo,
          specification,
        } = formData.instrumentModel;
        formData.instrumentModel = {};
        formData.instrumentModel.customerMaterialNum = customerMaterialNum;
        formData.instrumentModel.customerName = customerName;
        formData.instrumentModel.customerCarName = customerCarName;
        formData.instrumentModel.id = id;
        formData.instrumentModel.serialLevel = serialLevel;
        formData.instrumentModel.baudRate = baudRate;
        formData.instrumentModel.msgType = msgType;
        formData.instrumentModel.canRate = canRate;
        formData.instrumentModel.sn = sn;
        formData.instrumentModel.pcbaSn = pcbaSn;
        formData.instrumentModel.sysProtocol = sysProtocol;
        formData.instrumentModel.labelRule = labelRule;
        formData.instrumentModel.labelRuleImg = labelRuleImg;
        formData.instrumentModel.controlConnect = controlConnect;
        formData.instrumentModel.controlHead = controlHead;
        formData.instrumentModel.notControllerJointString =
          notControllerJointString;
        formData.instrumentModel.keyType = keyType;
        formData.instrumentModel.keyLinkType = keyLinkType;
        formData.instrumentModel.modelEndHead = modelEndHead;
        formData.instrumentModel.keyEndHead = keyEndHead;
        formData.instrumentModel.keyLineLen = keyLineLen;
        formData.instrumentModel.keyImgUrl = keyImgUrl;
        formData.instrumentModel.powerLogo = powerLogo;
        formData.instrumentModel.specification = specification;

        formData.jsonStr = "";
      } else {
        // STS
        const configJsonString = this.configToJsonString();
        formData.jsonStr = configJsonString;
      }

      return formData;
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
