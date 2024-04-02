<template>
  <div>
    <el-dialog
      class="instrument_box"
      :title="title"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :top="dialogTop()"
      width="1560px"
      append-to-body
    >
      <el-form
        v-show="isCopyProduct"
        :model="queryParams"
        ref="queryParams"
        :inline="true"
      >
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
              :value="dict.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="仪表型号" prop="computerId">
          <el-select
            :loading="isCLoading"
            filterable
            remote
            clearable
            :disabled="!queryParams.categoryId"
            v-model="queryParams.computerId"
            placeholder="请选择仪表型号"
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
        <el-form-item>
          <el-button
            type="primary"
            :disabled="!queryParams.computerId"
            @click="handleCopy"
            >复制</el-button
          >
        </el-form-item>
      </el-form>

      <el-form ref="form" :rules="formRules" :model="form" label-width="150px">
        <fieldset>
          <legend>基础配置</legend>
          <el-row :gutter="10">
            <el-col :span="6">
              <el-form-item
                label="产品品类"
                prop="categoryId"
                :rules="[
                  {
                    required: true,
                    message: '请选择产品品类',
                    trigger: 'blur',
                  },
                ]"
              >
                <el-select
                  v-model="form.categoryId"
                  placeholder="请选择产品品类"
                  filterable
                  :disabled="disabled"
                  class="w100"
                >
                  <el-option
                    v-for="item in modelList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="控制器接头"
                prop="instrumentModel.controlConnect"
              >
                <el-select
                  v-model="form.instrumentModel.controlConnect"
                  placeholder="请选择控制器接头"
                  filterable
                  allow-create
                  clearable
                  class="w100"
                >
                  <el-option
                    v-for="item in dicts_controller_joint"
                    :key="item.dictLabel"
                    :label="item.dictValue"
                    :value="item.dictValue"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="控制器头" prop="instrumentModel.controlHead">
                <el-select
                  v-model.number="form.instrumentModel.controlHead"
                  filterable
                  clearable
                  placeholder="请选择控制器头"
                  class="w100"
                >
                  <el-option label="不含头" :value="0" />
                  <el-option label="含头" :value="1" />
                </el-select>
              </el-form-item>

              <el-form-item
                label="控制器出线线长(mm)"
                prop="instrumentModel.notControllerJointString"
              >
                <el-input
                  v-model.number="form.instrumentModel.notControllerJointString"
                  placeholder="请输入控制器出线线长"
                  oninput="value=value.replace(/[^\d.]/g, '')"
                  clearable
                />
              </el-form-item>

              <el-form-item label="按键型号" prop="instrumentModel.keyType">
                <el-select
                  v-model="form.instrumentModel.keyType"
                  placeholder="请选择按键型号"
                  clearable
                  class="w100"
                  filterable
                  allow-create
                >
                  <el-option
                    v-for="item in dicts_keyType_list"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="+item.dictValue"
                  />
                </el-select>
              </el-form-item>

              <el-form-item
                label="按键连接类型"
                prop="instrumentModel.keyLinkType"
              >
                <el-select
                  v-model.number="form.instrumentModel.keyLinkType"
                  filterable
                  clearable
                  placeholder="请选择按键连接类型"
                  class="w100"
                >
                  <el-option label="直连" :value="0" />
                  <el-option label="快拆" :value="1" />
                </el-select>
              </el-form-item>

              <el-form-item
                label="按键线头"
                prop="instrumentModel.keyLineType"
                v-if="form.instrumentModel.keyLinkType === 1"
              >
                <el-select
                  v-model.number="form.instrumentModel.keyLineType"
                  filterable
                  clearable
                  placeholder="请选择按键线头"
                  class="w100"
                >
                  <el-option label="不含头" :value="0" />
                  <el-option label="含头" :value="1" />
                </el-select>
              </el-form-item>

              <el-form-item
                label="按键线长(mm)"
                prop="instrumentModel.keyLineLen"
              >
                <el-input
                  v-model.number="form.instrumentModel.keyLineLen"
                  placeholder="请输入按键线长"
                  oninput="value=value.replace(/[^\d.]/g, '')"
                  clearable
                />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item
                label="客户名称"
                prop="instrumentModel.customerName"
              >
                <select-loadMore
                  v-model="form.instrumentModel.customerName"
                  class="w100"
                  :data="customerNameData.data"
                  :page="customerNameData.page"
                  :hasMore="customerNameData.more"
                  dictLabel="name"
                  dictValue="name"
                  :request="getCustomerNameList"
                  placeholder="请选择客户名称"
                >
                </select-loadMore>
              </el-form-item>

              <template v-if="form.id">
                <el-form-item label="型号" prop="name">
                  <el-input v-model="form.name" placeholder="型号" clearable />
                </el-form-item>
                <el-form-item label="ERP编码" prop="erp">
                  <el-input
                    v-model="form.erp"
                    placeholder="ERP编码"
                    clearable
                  />
                </el-form-item>
              </template>

              <el-form-item label="通讯方式" prop="instrumentModel.serialLevel">
                <el-select
                  v-model="form.instrumentModel.serialLevel"
                  placeholder="请选择通讯方式"
                  class="w100"
                  clearable
                  @change="clearRateOrType"
                >
                  <el-option
                    v-for="item in dicts_communication_type"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="+item.dictValue"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="串口波特率" prop="instrumentModel.baudRate">
                <el-select
                  v-model="form.instrumentModel.baudRate"
                  placeholder="请选择串口波特率"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in baudRateList"
                    :label="item"
                    :value="item"
                    :key="item"
                  ></el-option>
                </el-select>
              </el-form-item>

              <template v-if="form.instrumentModel.serialLevel === 2">
                <el-form-item label="帧类型" prop="instrumentModel.msgType">
                  <el-select
                    v-model.number="form.instrumentModel.msgType"
                    filterable
                    clearable
                    placeholder="请选择帧类型"
                    class="w100"
                  >
                    <el-option label="标准帧" :value="0" />
                    <el-option label="扩展帧" :value="1" />
                  </el-select>
                </el-form-item>

                <el-form-item label="CAN波特率" prop="instrumentModel.canRate">
                  <el-select
                    v-model="form.instrumentModel.canRate"
                    placeholder="请选择CAN波特率"
                    class="w100"
                    clearable
                  >
                    <el-option
                      v-for="(value, key) in canRateList"
                      :key="key"
                      :label="`${value}k`"
                      :value="+key"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-col>

            <el-col :span="6">
              <el-form-item
                label="客户料号"
                prop="instrumentModel.customerMaterialNum"
              >
                <el-input
                  v-model="form.instrumentModel.customerMaterialNum"
                  placeholder="请输入客户料号"
                  clearable
                />
              </el-form-item>
              <el-form-item label="最高档位" prop="instrumentModel.topGear">
                <el-input
                  v-minMaxValue="{ min: 0, max: 9 }"
                  v-model="form.instrumentModel.topGear"
                  oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                  placeholder="请输入最高档位"
                />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="APP" prop="instrumentModel.app">
                <el-radio-group v-model="form.instrumentModel.app">
                  <div class="flex">
                    <el-radio :label="1">YES</el-radio>
                    <el-radio :label="0">NO</el-radio>
                  </div>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="USB" prop="instrumentModel.usb">
                <el-radio-group v-model="form.instrumentModel.usb">
                  <div class="flex">
                    <el-radio :label="1">YES</el-radio>
                    <el-radio :label="0">NO</el-radio>
                  </div>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="0">
            <el-col :span="6">
              <el-form-item label="按键图片" prop="instrumentModel.keyImgUrl">
                <el-upload-sortable
                  v-model="form.instrumentModel.keyImgUrl"
                  :imgW="80"
                  :imgH="80"
                  :isLimit="1"
                  :max="1"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </fieldset>

        <fieldset class="margin-top">
          <legend>车型配置</legend>
          <el-row :gutter="10">
            <el-col :span="6">
              <el-form-item
                label="背光亮度"
                prop="instrumentModel.backlightBrightness"
              >
                <el-select
                  v-model="form.instrumentModel.backlightBrightness"
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
                    :value="+key"
                  />
                </el-select>
              </el-form-item>

              <el-form-item
                label="休眠时间(min)"
                prop="instrumentModel.sleepTime"
              >
                <el-select
                  v-model="form.instrumentModel.sleepTime"
                  placeholder="请选择休眠时间"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in sleepTimeList"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="系统电压(V)" prop="instrumentModel.voltage">
                <el-select
                  v-model="form.instrumentModel.voltage"
                  placeholder="请选择系统电压"
                  @change="changeVoltage"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in dicts_voltage"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>

              <el-form-item
                label="欠压门限(V)"
                prop="instrumentModel.undervoltage"
              >
                <el-input-number
                  class="el-input-number-box"
                  v-model.number="form.instrumentModel.undervoltage"
                  :precision="1"
                  :min="0"
                  :max="99"
                  :controls="false"
                  placeholder="请输入欠压门限"
                />
              </el-form-item>

              <el-form-item
                label="助力档位数"
                prop="instrumentModel.powerGear"
                :rules="isCheckConfigItem({ message: '助力档位数' })"
              >
                <el-select
                  v-model="form.instrumentModel.powerGear"
                  placeholder="请选择助力档位数"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in powerGearData"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                label="助力开始磁钢数"
                prop="instrumentModel.assistStartMagnetNumber"
                :rules="isCheckConfigItem({ message: '助力开始磁钢数' })"
              >
                <el-select
                  v-model="form.instrumentModel.assistStartMagnetNumber"
                  placeholder="请选择助力开始磁钢数"
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in assistStartMagnetNumberData"
                    :key="item"
                    :label="item"
                    :value="String(item)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                label="助力比例"
                prop="instrumentModel.assistPercentage"
                :rules="
                  isCheckConfigItem({
                    message: '助力开始磁钢数',
                    trigger: 'blur',
                  })
                "
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 255 }"
                  v-model.number="form.instrumentModel.assistPercentage"
                  oninput="value=value.replace(/[^\d]/g, '')"
                  placeholder="请输入助力比例"
                  clearable
                />
              </el-form-item>

              <el-form-item
                label="限流门限(A)"
                prop="instrumentModel.currentlimiting"
                :rules="
                  isCheckConfigItem({ message: '限流门限', trigger: 'blur' })
                "
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 255 }"
                  v-model.number="form.instrumentModel.currentlimiting"
                  oninput="value=value.replace(/[^\d]/g, '')"
                  placeholder="请输入限流门限"
                  clearable
                />
              </el-form-item>

              <el-form-item
                label="助力限速门限(km/h)"
                prop="instrumentModel.assistLimit"
                :rules="isCheckConfigItem({ message: '助力限速门限' })"
              >
                <el-select
                  v-model="form.instrumentModel.assistLimit"
                  placeholder="请选择助力限速门限"
                  class="w100"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="item in assistLimitData"
                    :key="item"
                    :label="item"
                    :value="String(item)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                label="显示轮径"
                prop="instrumentModel.showWheelsize"
                :rules="
                  isCheckConfigItem({ message: '显示轮径', trigger: 'blur' })
                "
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 999 }"
                  v-model.number="form.instrumentModel.showWheelsize"
                  oninput="value=value.replace(/[^\d]/g, '')"
                  placeholder="显示轮径"
                />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item
                label="缓启动"
                prop="instrumentModel.slowStart"
                :rules="isCheckConfigItem({ message: '缓启动' })"
              >
                <el-select
                  v-model="form.instrumentModel.slowStart"
                  placeholder="请选择缓启动"
                  filterable
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in slowStartData"
                    :key="item"
                    :label="item"
                    :value="String(item)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                label="轮径(inch)"
                prop="instrumentModel.wheelDiameter"
                :rules="isCheckConfigItem({ message: '轮径' })"
              >
                <el-select
                  v-model="form.instrumentModel.wheelDiameter"
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
                    :value="+key"
                  >
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="周长(mm)" prop="instrumentModel.perimeter">
                <el-input
                  v-minMaxValue="{ min: 0, max: 9999 }"
                  v-model.number="form.instrumentModel.perimeter"
                  oninput="value=value.replace(/[^\d]/, '')"
                  placeholder="请输入周长"
                  clearable
                />
              </el-form-item>

              <el-form-item
                label="显示单位"
                prop="instrumentModel.unit"
                :rules="isCheckConfigItem({ message: '显示单位' })"
              >
                <el-select
                  v-model="form.instrumentModel.unit"
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
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                label="协议"
                prop="instrumentModel.agreement"
                :rules="isCheckConfigItem({ message: '协议' })"
              >
                <el-select
                  v-model="form.instrumentModel.agreement"
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
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                label="电量计算方式"
                prop="instrumentModel.power"
                :rules="isCheckConfigItem({ message: '电量计算方式' })"
              >
                <el-select
                  v-model="form.instrumentModel.power"
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
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                label="测速磁钢数"
                prop="instrumentModel.speedSteel"
                :rules="isCheckConfigItem({ message: '测速磁钢数' })"
              >
                <el-select
                  v-model="form.instrumentModel.speedSteel"
                  placeholder="请选择测速磁钢数"
                  filterable
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in speedSteelData"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                label="电量变化时间(s)"
                prop="instrumentModel.batteryVoltageChangeTime"
                :rules="isCheckConfigItem({ message: '电量变化时间' })"
              >
                <el-select
                  v-model="form.instrumentModel.batteryVoltageChangeTime"
                  placeholder="请选择电量变化时间"
                  filterable
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in batteryVoltageChangeTimeData"
                    :key="item"
                    :label="item"
                    :value="String(item)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                label="速度平滑等级"
                prop="instrumentModel.smoothLevel"
                :rules="isCheckConfigItem({ message: '速度平滑等级' })"
              >
                <el-select
                  v-model="form.instrumentModel.smoothLevel"
                  placeholder="请选择速度平滑等级"
                  filterable
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in smoothLevelData"
                    :key="item"
                    :label="item"
                    :value="String(item)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                label="总线故障超时时间(s)"
                prop="instrumentModel.allLineErrTimeOut"
                :rules="isCheckConfigItem({ message: '总线故障超时时间' })"
              >
                <el-select
                  v-model="form.instrumentModel.allLineErrTimeOut"
                  placeholder="请选择总线故障超时时间"
                  filterable
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="item in allLineErrTimeOutData"
                    :key="item"
                    :label="item"
                    :value="String(item)"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item
                label="车名"
                prop="instrumentModel.ebikeName"
                :rules="isCheckConfigItem({ message: '车名' })"
              >
                <el-select
                  v-model="form.instrumentModel.ebikeName"
                  placeholder="请选择车名"
                  class="w100"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="(value, key) in dicts_ebike"
                    :key="key"
                    :label="value"
                    :value="+key"
                  />
                </el-select>
              </el-form-item>

              <el-form-item
                label="车型"
                prop="instrumentModel.carModel"
                :rules="isCheckConfigItem({ message: '车型', trigger: 'blur' })"
              >
                <el-input
                  maxlength="2"
                  v-model="form.instrumentModel.carModel"
                  placeholder="车型"
                  clearable
                />
              </el-form-item>

              <el-form-item
                label="默认档位"
                prop="instrumentModel.defaultGear"
                :rules="
                  isCheckConfigItem({ message: '默认档位', trigger: 'blur' })
                "
              >
                <el-input
                  v-minMaxValue="{ min: 0, max: 9 }"
                  v-model="form.instrumentModel.defaultGear"
                  oninput="value=value.replace(/[^\d.]/g, '')"
                  placeholder="请输入默认档位"
                />
              </el-form-item>

              <el-form-item
                label="Logo界面"
                prop="instrumentModel.logo"
                :rules="isCheckConfigItem({ message: 'Logo界面' })"
              >
                <el-select
                  v-model="form.instrumentModel.logo"
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
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item
                label="开机密码"
                prop="instrumentModel.startupPasswd"
                :rules="
                  isCheckConfigItem({ message: '开机密码', trigger: 'blur' })
                "
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 9999 }"
                  v-model="form.instrumentModel.startupPasswd"
                  oninput="value=value.replace(/[^\d.]/g, '')"
                  placeholder="请输入开机密码"
                />
              </el-form-item>

              <el-form-item
                label="高级菜单密码"
                prop="instrumentModel.highMenuPasswd"
                :rules="
                  isCheckConfigItem({
                    message: '高级菜单密码',
                    trigger: 'blur',
                  })
                "
              >
                <el-input
                  v-model="form.instrumentModel.highMenuPasswd"
                  type="number"
                  v-minMaxValue="{ min: 0, max: 9999 }"
                  oninput="value=value.replace(/[^\d.]/g, '')"
                  placeholder="请输入高级菜单密码"
                />
              </el-form-item>

              <el-form-item
                label="电机功率(W)"
                prop="instrumentModel.motorSys"
                :rules="
                  isCheckConfigItem({ message: '电机功率', trigger: 'blur' })
                "
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 999 }"
                  v-model="form.instrumentModel.motorSys"
                  oninput="value=value.replace(/[^\d.]/g, '')"
                  placeholder="请输入电机功率"
                />
              </el-form-item>

              <el-form-item
                label="电池容量"
                prop="instrumentModel.batteryCap"
                :rules="
                  isCheckConfigItem({ message: '电池容量', trigger: 'blur' })
                "
              >
                <el-input
                  type="number"
                  v-minMaxValue="{ min: 0, max: 9999 }"
                  v-model="form.instrumentModel.batteryCap"
                  oninput="value=value.replace(/[^\d.]/g, '')"
                  placeholder="电池容量"
                />
              </el-form-item>

              <el-form-item
                label="高速蜂鸣器提醒"
                prop="instrumentModel.highSpeedBuzzerRemind"
                :rules="
                  isCheckConfigItem({
                    message: '高速蜂鸣器提醒',
                    trigger: 'blur',
                  })
                "
              >
                <el-input
                  v-model="form.instrumentModel.highSpeedBuzzerRemind"
                  v-minMaxValue="{ min: 0, max: 99 }"
                  oninput="value=value.replace(/[^\d.]/g, '')"
                  placeholder="请输入高速蜂鸣器提醒"
                  clearable
                />
              </el-form-item>

              <el-form-item
                label="串口通讯电平"
                prop="instrumentModel.serialLevel_log"
              >
                <el-select
                  v-model="form.instrumentModel.serialLevel_log"
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
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item
                label="车轮宽度"
                prop="instrumentModel.tiresSize"
                :rules="
                  isCheckConfigItem({ message: '车轮宽度', trigger: 'blur' })
                "
              >
                <el-input
                  v-model="form.instrumentModel.tiresSize"
                  v-minMaxValue="{ min: 0, max: 99 }"
                  oninput="value=value.replace(/[^\d]/g, '')"
                  placeholder="请输入车轮宽度"
                  clearable
                />
              </el-form-item>
              <el-form-item
                label="蓝牙"
                prop="instrumentModel.bluetooth"
                :rules="isCheckConfigItem({ message: '蓝牙' })"
              >
                <el-radio-group v-model="form.instrumentModel.bluetooth">
                  <el-radio :label="1"> YES </el-radio>
                  <el-radio :label="0"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="推车助力"
                prop="instrumentModel.driveAssist"
                :rules="isCheckConfigItem({ message: '推车助力' })"
              >
                <el-radio-group v-model="form.instrumentModel.driveAssist">
                  <el-radio :label="1">YES</el-radio>
                  <el-radio :label="0">NO</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="恢复出厂设置"
                prop="instrumentModel.factoryReset"
                :rules="isCheckConfigItem({ message: '恢复出厂设置' })"
              >
                <el-radio-group v-model="form.instrumentModel.factoryReset">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="转把分档"
                prop="instrumentModel.rotateHandle"
                :rules="isCheckConfigItem({ message: '转把分档' })"
              >
                <el-radio-group v-model="form.instrumentModel.rotateHandle">
                  <el-radio :label="1"> YES </el-radio>
                  <el-radio :label="0"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="蜂鸣器开关"
                prop="instrumentModel.buzzerSwitch"
                :rules="isCheckConfigItem({ message: '蜂鸣器开关' })"
              >
                <el-radio-group v-model="form.instrumentModel.buzzerSwitch">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="定速巡航功能"
                prop="instrumentModel.cruise"
                :rules="isCheckConfigItem({ message: '定速巡航功能' })"
              >
                <el-radio-group v-model="form.instrumentModel.cruise">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="开机密码"
                prop="instrumentModel.turnOnPasswd"
                :rules="isCheckConfigItem({ message: '开机密码' })"
              >
                <el-radio-group v-model="form.instrumentModel.turnOnPasswd">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="菜单密码"
                prop="instrumentModel.menuPassword"
                :rules="isCheckConfigItem({ message: '菜单密码' })"
              >
                <el-radio-group v-model="form.instrumentModel.menuPassword">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item
                label="转把限速"
                prop="instrumentModel.rotateHandleSpeedLimit"
                :rules="isCheckConfigItem({ message: '转把限速' })"
              >
                <el-radio-group
                  v-model="form.instrumentModel.rotateHandleSpeedLimit"
                >
                  <div class="flex">
                    <el-radio :label="0">正常</el-radio>
                    <el-radio :label="1">限速6Km</el-radio>
                  </div>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="助力正反"
                prop="instrumentModel.assist"
                :rules="isCheckConfigItem({ message: '助力正反' })"
              >
                <el-radio-group v-model="form.instrumentModel.assist">
                  <div class="flex">
                    <el-radio :label="0">助力正</el-radio>
                    <el-radio :label="1">助力反</el-radio>
                  </div>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </fieldset>
      </el-form>

      <!-- <div
        class="flex align-center"
        v-if="!form.instrumentModel.id"
        style="height: 173px; overflow-y: scroll"
      >
        <div>同配推荐：</div>
        <div class="flex-sub margin-left-xs">
          <el-card style="min-height: 120px">
            <el-button
              :class="{ 'margin-left-xs': i == 0 }"
              class="margin-bottom-xs"
              v-for="(pg, i) in selectList"
              :key="i + 'q'"
              @click="getDetail(pg)"
            >
              {{ pg.computerName }}
            </el-button>
          </el-card>
        </div>
      </div> -->

      <!-- <div slot="footer" class="dialog-footer flex justify-between">
        <div class="flex">
          <el-upload
            action=""
            class="upload-demo"
            ref="upload"
            :on-change="handleChange"
            :auto-upload="false"
            :show-file-list="false"
          >
            <el-button type="warning"> 导入 </el-button>
          </el-upload>
          <el-button type="info" class="margin-left-xs" @click="exportForm">
            导出
          </el-button>
        </div>
        <div>
          <el-button
            type="primary"
            @click="submitForm"
            v-if="form.instrumentModel.id"
          >
            修改
          </el-button>
          <el-button type="primary" @click="submitOpen" v-else>
            确定
          </el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
      </div> -->

      <div slot="footer" class="dialog-footer flex justify-center">
        <div>
          <el-button
            v-if="form.instrumentModel.id && !isCopyProduct"
            type="primary"
            @click="submitForm"
            :loading="isSubmitLoading"
          >
            修改
          </el-button>
          <el-button type="primary" @click="submitOpen" v-else>
            确定
          </el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="false"
      title="添加型号"
      :visible.sync="open"
      width="540px"
      append-to-body
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="150px"
        @submit.native.prevent
      >
        <el-form-item label="仪表型号:" prop="name">
          <el-input v-model.trim="form.name" placeholder="仪表型号" />
        </el-form-item>

        <el-form-item label="ERP编码" prop="erp">
          <el-input v-model.trim="form.erp" placeholder="ERP编码" />
        </el-form-item>
        <el-form-item label="描述" prop="desc" style="width: 100%">
          <el-input
            type="textarea"
            :autosize="{ minRows: 5, maxRows: 8 }"
            v-model="form.desc"
            placeholder="仪表描述"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="isSubmitLoading"
          @click="submitForm"
        >
          确 定
        </el-button>
        <el-button @click="onResetForm">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  selectComputer,
  addComputer,
  editComputer,
  detailComputer,
} from "@/api/third/computer";
import { typeCategory } from "@/api/third/category";
import { getCustomerList } from "@/api/order";
import mixin from "./export";
import commonData from "@/mixins/commonData";
import ElUploadSortable from "@/components/el-upload-sortable";

export default {
  mixins: [mixin, commonData],
  data() {
    // 背光亮度
    const validateBacklightBrightness = (rule, value, callback) => {
      if (this.isEmpty(value)) {
        callback(new Error("背光亮度不能为空"));
      } else if (!Number.isInteger(+value)) {
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
      if (this.isEmpty(value)) {
        callback(new Error("休眠时间不能为空"));
      } else if (!Number.isInteger(+value)) {
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
      if (!this.dicts_voltage.includes(value)) {
        callback(new Error("系统电压不在可选值范围内"));
      } else {
        callback();
      }
    };

    // 欠压门限
    const validateUnderVoltage = (rule, value, callback) => {
      if (this.isEmpty(value)) {
        callback(new Error("欠压门限不能为空"));
      } else if (+value < 0) {
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
      if (this.isEmpty(value)) {
        callback(new Error("周长不能为空"));
      } else if (!Number.isInteger(+value)) {
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
      isSubmitLoading: false,
      isCopyProduct: false,
      modelList: [],
      selectList: [],
      queryParams: {
        categoryId: "",
        computerId: "",
      },
      dialogVisible: false,
      open: false,
      // 表单参数
      form: { name: null, instrumentModel: {}, instrumentModel: {} },
      title: "",
      disabled: false,
      serialLevelLogData: {
        0: "3.3V",
        1: "5V"
      },
      // 表单校验
      rules: {
        name: [
          {
            required: false,
            message: "仪表型号不能为空",
            trigger: "blur",
          },
        ],
      },
      formRules: {
        "instrumentModel.backlightBrightness": [
          {
            required: true,
            validator: validateBacklightBrightness,
            trigger: ["blur", "change"],
          },
        ],
        "instrumentModel.sleepTime": [
          {
            required: true,
            validator: validateSleepTime,
            trigger: ["blur", "change"],
          },
        ],
        "instrumentModel.voltage": [
          {
            required: true,
            validator: validateVoltage,
            trigger: ["blur", "change"],
          },
        ],
        "instrumentModel.undervoltage": [
          {
            required: true,
            validator: validateUnderVoltage,
            trigger: ["blur", "change"],
          },
        ],
        "instrumentModel.wheelDiameter": [
          {
            required: true,
            validator: validateWheelDiameter,
            trigger: ["blur", "change"],
          },
        ],
        "instrumentModel.perimeter": [
          {
            required: true,
            validator: validatePerimeter,
            trigger: ["blur", "change"],
          },
        ],
        "instrumentModel.serialLevel_log": [
          {
            required: true,
            message: "串口通讯电平不能为空",
            trigger: "change",
          },
        ],
        "instrumentModel.serialLevel": [
          {
            required: true,
            message: "通讯方式不能为空",
            trigger: "change",
          },
        ],
        "instrumentModel.baudRate": [
          {
            required: true,
            message: "串口波特率不能为空",
            trigger: "change",
          },
        ],
        "instrumentModel.msgType": [
          {
            required: true,
            message: "帧类型不能为空",
            trigger: "change",
          },
        ],
        "instrumentModel.canRate": [
          {
            required: true,
            message: "CAN波特率不能为空",
            trigger: "change",
          },
        ],
      },
      dicts_controller_joint: [],
      dicts_communication_type: [],
      dicts_unit: [],
      dicts_agreement: [],
      dicts_voltage: [],
      dicts_power: [],
      dicts_logo: [],
      // 客户数据
      customerNameData: {
        data: [],
        page: 1,
        more: true,
      },
      // 按键图片
      dicts_keyType_list: [],
    };
  },
  components: {
    ElUploadSortable,
  },
  computed: {
    isEmpty() {
      const list = [null, "null", undefined, "undefined", false, "false"];
      return (val) => {
        if (typeof val === String) {
          return list.includes(val.toLowerCase());
        } else {
          return list.includes(val);
        }
      };
    },
    isCheckConfigItem() {
      return ({ required = true, message = "", trigger = "change" } = {}) => {
        return { required, message: `${message}不能为空`, trigger };
      };
    },
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.resetForm("queryParams");
        this.resetForm("form");
        this.getList();
      }
    },
    open(val) {
      if (!val) {
        this.rules.name[0].required = false;
      }
    },
  },
  created() {
    this.echoWheelDiameter();
    this.getOptions();
    // 轮径
    for (let i = 8; i < 100; i++) {
      this.wheelDiameterData[i] = i * 0.5;
    }
  },
  methods: {
    getList() {
      typeCategory().then((res) => {
        this.modelList = res.data;
      });
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
    clearRateOrType(type) {
      if (type !== 2) {
        this.form.instrumentModel.msgType = "";
        this.form.instrumentModel.canRate = "";
      } else {
        this.form.instrumentModel.baudRate = 115200;
      }
    },
    changeCountPerimeter(wheelDiameter) {
      let wheelDiameterVal = null;
      if (wheelDiameter === 6) {
        wheelDiameterVal = 27.5;
      } else {
        wheelDiameterVal = this.wheelDiameterData[wheelDiameter];
      }
      this.form.instrumentModel.perimeter = parseInt(
        wheelDiameterVal * 25.4 * 3.14
      );
    },
    echoWheelDiameter() {
      const wheelDiameter = this.form.instrumentModel.wheelDiameter;
      if (wheelDiameter) {
        this.form.instrumentModel.perimeter = parseInt(
          wheelDiameter * 25.4 * 3.14
        );
      }
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
      this.form.instrumentModel.undervoltage = voltage;
    },
    getOptions() {
      // 按键型号
      this.getDicts("STS_KEY_TYPE").then((res) => {
        this.dicts_keyType_list = res.data;
      });
      //仪表控制器接头
      this.getDicts("instrument_controller_joint").then((res) => {
        this.dicts_controller_joint = res.data;
      });
      //仪表通讯方式1
      this.getDicts("instrument_communication_type_1").then((res) => {
        this.dicts_communication_type = res.data;
      });
      //仪表协议
      this.getDicts("instrument_agreement").then((res) => {
        this.dicts_agreement = res.data;
      });
      //仪表电压
      this.getDicts("instrument_voltage").then((res) => {
        this.dicts_voltage = res.data.map(({ dictValue }) => +dictValue);
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
    //查看同配详情
    getDetail(row) {
      detailComputer(row.computerId).then((res) => {
        let { data } = res;
        delete data.id;
        if (data.instrumentModel) {
          delete data.instrumentModel.id;
        }
        //删除分类id
        if (this.form.instrumentModel.categoryId) {
          if (this.form.instrumentModel.categoryId && data.categoryId) {
            delete data.categoryId;
          }
        }
        this.resetForm("queryParams");
        let val = Object.assign(this.form, data);

        this.$set(this, "form", val);
      });
    },
    // 表单重置
    reset() {
      this.disabled = false;
      this.resetForm("form");
      this.form = {
        categoryId: null,
        desc: null,
        erp: null,
        name: null,
        instrumentModel: {
          communicateType: 0,
          sleepTime: 10,
          assistLimit: "25",
          controlConnect: null,
          controlHead: null,
          notControllerJointString: null,
          keyType: null,
          keyLineType: null,
          keyLineLen: null,
          customerName: null,
          serialLevel: null,
          serialLevel_log: 0,
          msgType: null,
          canRate: null,
          baudRate: null,
          topGear: null,
          customerMaterialNum: null,
          app: null,
          usb: null,
          agreement: null,
          assist: 0,
          backlightBrightness: 5,
          bluetooth: null,
          buzzer: null,
          buzzerSwitch: null,
          category: null,
          categoryId: null,
          communicationType1: null,
          communicationType2: null,
          configVersion: null,
          controllerJoint: null,
          powerGear: 5,
          createBy: null,
          createTime: null,
          cruise: null,
          currentlimiting: 12,
          defaultGear: null,
          driveAssist: null,
          highSpeedBuzzerRemind: 0,
          logo: null,
          maxGear: null,
          menuPasswd: null,
          notControllerJointString: null,
          ortherConfig: null,
          perimeter: null,
          power: null,
          shutdownTime: null,
          speedLimit: null,
          speedSteel: 1,
          startupPasswd: 2020,
          highMenuPasswd: 2020,
          undervoltage: 31.5,
          tiresSize: 0,
          unit: null,
          usb: null,
          voltage: 36,
          wheelDiameter: 5,
          rotateHandle: 0,
          rotateHandleSpeedLimit: 0,
          slowStart: "1",
          assistSpeedLimitThreshold: null,
          batteryVoltageChangeTime: "10",
          allLineErrTimeOut: "10",
          busOvertime: null,
          smoothLevel: "3",
          assistPercentage: 128,
          ebikeName: null,
          motorSys: null,
          batteryCap: 0,
          showWheelsize: null,
          carModel: null,
          assistStartMagnetNumber: "2",
        },
      };
    },
    handleFleetnessAdd() {
      this.open = true;
    },
    submitOpen() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.form.categoryId && (this.open = true);
          this.rules.name[0].required = true;
        }
      });
    },
    onResetForm() {
      this.open = false;
    },
    changeCategory(name) {
      if (name) {
        this.product = name;
        const data = this.dictList.filter((item) => item.name === name);
        this.computerOptions = data[0].computerList;
      } else {
        this.computerOptions = [];
      }
    },
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = true;
        categoryNameList({ name, categoryName: this.product })
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
    async handleCopy() {
      const { computerId } = this.queryParams;

      try {
        const { data } = await detailComputer(computerId);
        data.instrumentModel = data.instrumentModel ? data.instrumentModel : {};

        this.form = Object.assign({}, data);
      } catch (error) {
        console.error(error);
      }
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
        serialLevel_log
      } = this.form.instrumentModel;

      const instrumentModel = {
        backlightBrightness,
        sleepTime,
        voltage,
        undervoltage: undervoltage * 1000,
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
        serialLevel: serialLevel_log
      };

      const data = {
        instrumentModel,
        otherOptions: {},
        inputValues: {},
      };
      return JSON.stringify(data);
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.isSubmitLoading = true;
          const configJsonString = this.configToJsonString();
          this.form.jsonStr = configJsonString;

          if (this.form.instrumentModel.id && !this.isCopyProduct) {
            editComputer(this.form)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.dialogVisible = false;
                  this.$parent.getList();
                }
              })
              .finally(() => {
                this.isSubmitLoading = false;
              });
          } else {
            if (this.isCopyProduct) {
              delete this.form.id;
              delete this.form.instrumentModel.id;
            }
            addComputer(this.form)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("添加成功");
                  this.dialogVisible = false;
                  this.$parent.getList();
                  this.open = false;
                }
              })
              .finally(() => {
                this.isSubmitLoading = false;
              });
          }
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.dispaly {
  display: none;
}
.form-data-in {
  .el-radio {
    // margin-right: 28px;
  }
  .el-input-number .el-input__inner {
    text-align: left;
  }
}
.posi-left {
  position: relative;
  right: -253px;
}

.el-input-number-box {
  width: 100%;
  /deep/ .el-input__inner {
    text-align: left;
  }
}

.instrument_box {
  /deep/ .el-dialog__body {
    max-height: 80vh;
    overflow: hidden;
    overflow-y: auto;
  }
}
</style>
