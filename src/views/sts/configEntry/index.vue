<template>
  <div class="app-container">
    <el-container>
      <el-main>
        <el-card class="box-card" shadow="never">
          <el-form
            ref="ruleForm"
            :rules="formRules"
            :model="formData"
            label-width="150px"
          >
            <el-row :gutter="10">
              <el-col :span="6">
                <el-form-item label="客户" prop="customerName">
                  <el-autocomplete
                    v-model="formData.customerName"
                    clearable
                    :fetch-suggestions="querySearchAsync"
                    placeholder="请选择客户"
                    @change="handleQuery"
                    class="w100"
                  />
                </el-form-item>
                <el-form-item label="控制器接头" prop="controlConnect">
                  <el-input
                    v-model="formData.controlConnect"
                    placeholder="请输入控制器接头"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="按键型号" prop="keyType">
                  <el-select
                    v-model="formData.keyType"
                    placeholder="请选择按键型号"
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
                <el-form-item label="背光亮度" prop="backlightBrightness">
                  <el-select
                    v-model="formData.backlightBrightness"
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

                <el-form-item label="休眠时间(min)" prop="sleepTime">
                  <el-select
                    v-model="formData.sleepTime"
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

                <el-form-item label="系统电压(V)" prop="voltage">
                  <el-select
                    v-model="formData.voltage"
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

                <el-form-item label="欠压门限(V)" prop="undervoltage">
                  <el-input-number
                    class="el-input-number-box"
                    v-model.number="formData.undervoltage"
                    :precision="1"
                    :min="0"
                    :max="99.9"
                    :controls="false"
                    placeholder="请输入欠压门限"
                  />
                </el-form-item>

                <el-form-item label="助力档位数" prop="powerGear">
                  <el-select
                    v-model="formData.powerGear"
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
                  prop="assistStartMagnetNumber"
                >
                  <el-select
                    v-model="formData.assistStartMagnetNumber"
                    placeholder="请选择助力开始磁钢数"
                    class="w100"
                    clearable
                  >
                    <el-option
                      v-for="item in assistStartMagnetNumberData"
                      :key="item"
                      :label="item"
                      :value="item"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="助力比例" prop="assistPercentage">
                  <el-input
                    type="number"
                    v-minMaxValue="{ min: 0, max: 255 }"
                    v-model.number="formData.assistPercentage"
                    oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                    placeholder="请输入助力比例"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="限流门限(A)" prop="currentlimiting">
                  <el-input
                    type="number"
                    v-minMaxValue="{ min: 0, max: 40 }"
                    v-model.number="formData.currentlimiting"
                    oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                    placeholder="请输入限流门限"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="助力限速门限(km/h)" prop="assistLimit">
                  <el-select
                    v-model="formData.assistLimit"
                    placeholder="请选择助力限速门限"
                    class="w100"
                    filterable
                    clearable
                  >
                    <el-option
                      v-for="item in assistLimitData"
                      :key="item"
                      :label="item"
                      :value="item"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="显示轮径" prop="showWheelsize">
                  <el-input
                    type="number"
                    v-minMaxValue="{ min: 0, max: 999 }"
                    v-model.number="formData.showWheelsize"
                    oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                    placeholder="显示轮径"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="所属品类" prop="categoryId">
                  <el-select
                    v-model="formData.categoryId"
                    @change="changeCategory"
                    filterable
                    clearable
                    placeholder="请选择所属品类"
                    class="w100"
                  >
                    <el-option
                      v-for="dict in dictList"
                      :key="dict.id"
                      :label="dict.name"
                      :value="dict.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="控制器头" prop="controlHead">
                  <el-select
                    v-model.number="formData.controlHead"
                    filterable
                    clearable
                    placeholder="请选择控制器头"
                    class="w100"
                  >
                    <el-option label="不含头" :value="0" />
                    <el-option label="含头" :value="1" />
                  </el-select>
                </el-form-item>
                <el-form-item label="按键线头" prop="keyLineType">
                  <el-select
                    v-model.number="formData.keyLineType"
                    filterable
                    clearable
                    placeholder="请选择按键线头"
                    class="w100"
                  >
                    <el-option label="不含头" :value="0" />
                    <el-option label="含头" :value="1" />
                  </el-select>
                </el-form-item>
                <el-form-item label="缓启动" prop="slowStart">
                  <el-select
                    v-model="formData.slowStart"
                    placeholder="请选择缓启动"
                    filterable
                    class="w100"
                    clearable
                  >
                    <el-option
                      v-for="item in slowStartData"
                      :key="item"
                      :label="item"
                      :value="+item"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="轮径(inch)" prop="wheelDiameter">
                  <el-select
                    v-model="formData.wheelDiameter"
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
                <el-form-item label="周长(mm)" prop="perimeter">
                  <el-input
                    v-model="formData.perimeter"
                    oninput="value=value.replace(/[^\d]/, '')"
                    placeholder="请输入周长"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="显示单位" prop="unit">
                  <el-select
                    v-model="formData.unit"
                    placeholder="请选择显示单位"
                    class="w100"
                    clearable
                  >
                    <el-option
                      v-for="(value, key) in dicts_unit"
                      :key="key"
                      :label="value"
                      :value="+key"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="协议" prop="agreement">
                  <el-select
                    v-model="formData.agreement"
                    placeholder="请选择协议"
                    class="w100"
                    clearable
                  >
                    <el-option
                      v-for="(value, key) in dicts_agreement"
                      :key="key"
                      :label="value"
                      :value="+key"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="电量计算方式" prop="power">
                  <el-select
                    v-model="formData.power"
                    placeholder="请选择电量计算方式"
                    class="w100"
                    clearable
                  >
                    <el-option
                      v-for="(value, key) in dicts_power"
                      :key="key"
                      :label="value"
                      :value="+key"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="测速磁钢数" prop="speedSteel">
                  <el-select
                    v-model="formData.speedSteel"
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
                  prop="batteryVoltageChangeTime"
                >
                  <el-select
                    v-model="formData.batteryVoltageChangeTime"
                    placeholder="请选择电量变化时间"
                    filterable
                    class="w100"
                    clearable
                  >
                    <el-option
                      v-for="item in batteryVoltageChangeTimeData"
                      :key="item"
                      :label="item"
                      :value="item"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="速度平滑等级" prop="smoothLevel">
                  <el-select
                    v-model="formData.smoothLevel"
                    placeholder="请选择速度平滑等级"
                    filterable
                    class="w100"
                    clearable
                  >
                    <el-option
                      v-for="item in smoothLevelData"
                      :key="item"
                      :label="item"
                      :value="item"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item
                  label="总线故障超时时间(s)"
                  prop="allLineErrTimeOut"
                >
                  <el-select
                    v-model="formData.allLineErrTimeOut"
                    placeholder="请选择总线故障超时时间"
                    filterable
                    class="w100"
                    clearable
                  >
                    <el-option
                      v-for="item in allLineErrTimeOutData"
                      :key="item"
                      :label="item"
                      :value="item"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="仪表型号" prop="computerId">
                  <el-select
                    v-model="formData.computerId"
                    filterable
                    clearable
                    placeholder="请选择仪表型号"
                    class="w100"
                  >
                    <el-option
                      v-for="dict in computerOptions"
                      :key="dict.model"
                      :label="dict.name"
                      :value="dict.model"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="控制器出线线长(mm)" prop="controlLineLen">
                  <el-input
                    v-model.number="formData.controlLineLen"
                    placeholder="请输入控制器出线线长"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="按键线长(mm)" prop="keyLineLen">
                  <el-input
                    v-model.number="formData.keyLineLen"
                    placeholder="请输入按键线长"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="车名" prop="ebikeName">
                  <el-select
                    v-model="formData.ebikeName"
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
                <el-form-item label="车型" prop="carModel">
                  <el-input
                    maxlength="2"
                    v-model="formData.carModel"
                    placeholder="车型"
                  />
                </el-form-item>
                <el-form-item label="默认档位" prop="defaultGear">
                  <el-input
                    v-minMaxValue="{ min: 0, max: 9 }"
                    v-model="formData.defaultGear"
                    oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                    placeholder="请输入默认档位"
                  />
                </el-form-item>
                <el-form-item label="最高档位" prop="TopGear">
                  <el-input
                    v-minMaxValue="{ min: 0, max: 9 }"
                    v-model="formData.TopGear"
                    oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                    placeholder="请输入最高档位"
                  />
                </el-form-item>
                <el-form-item label="Logo界面" prop="logo">
                  <el-select
                    v-model="formData.logo"
                    placeholder="请选择Logo界面"
                    class="w100"
                    clearable
                  >
                    <el-option
                      v-for="(value, key) in dicts_logo"
                      :key="key"
                      :label="value"
                      :value="+key"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="开机密码" prop="startupPasswd">
                  <el-input
                    type="number"
                    v-minMaxValue="{ min: 0, max: 9999 }"
                    v-model="formData.startupPasswd"
                    oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                    placeholder="请输入开机密码"
                  />
                </el-form-item>

                <el-form-item label="电机功率(W)" prop="motorSys">
                  <el-input
                    type="number"
                    v-minMaxValue="{ min: 0, max: 999 }"
                    v-model="formData.motorSys"
                    oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                    placeholder="请输入电机功率"
                  />
                </el-form-item>
                <el-form-item label="电池容量" prop="batteryCap">
                  <el-input
                    type="number"
                    v-minMaxValue="{ min: 0, max: 9999 }"
                    v-model="formData.batteryCap"
                    oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                    placeholder="电池容量"
                  />
                </el-form-item>
                <el-form-item label="通讯方式" prop="serialLevel">
                  <el-select
                    v-model="formData.serialLevel"
                    placeholder="请选择通讯方式"
                    class="w100"
                    clearable
                  >
                    <el-option
                      v-for="(value, key) in serialLevelData"
                      :key="key"
                      :label="value"
                      :value="key"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="高级菜单密码" prop="menuPasswd">
                  <el-input
                    v-model="formData.menuPasswd"
                    oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                    type="number"
                    v-minMaxValue="{ min: 0, max: 9999 }"
                    placeholder="请输入高级菜单密码"
                  />
                </el-form-item>
                <el-form-item
                  label="高速蜂鸣器提醒"
                  prop="highSpeedBuzzerRemind"
                >
                  <el-input
                    v-model="formData.highSpeedBuzzerRemind"
                    v-minMaxValue="{ min: 0, max: 99 }"
                    oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                    placeholder="请输入高速蜂鸣器提醒"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="客户料号" prop="customerMaterialNum">
                  <el-input
                    v-model="formData.customerMaterialNum"
                    placeholder="请输入客户料号"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="车轮宽度" prop="tiresSize">
                  <el-input
                    v-minMaxValue="{ min: 0, max: 99 }"
                    v-model="formData.tiresSize"
                    oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                    placeholder="请输入车轮宽度"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="自动关机时间" prop="autoShudownTime">
                  <el-input
                    v-minMaxValue="{ min: 0 }"
                    v-model="formData.autoShudownTime"
                    oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                    placeholder="请输入自动关机时间"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="蓝牙" prop="bluetooth">
                  <el-radio-group v-model="formData.bluetooth">
                    <el-radio :label="1"> YES </el-radio>
                    <el-radio :label="0"> NO </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="推车助力" prop="driveAssist">
                  <el-radio-group v-model="formData.driveAssist">
                    <el-radio :label="1">YES</el-radio>
                    <el-radio :label="0">NO</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="恢复出厂设置" prop="factoryReset">
                  <el-radio-group v-model="formData.factoryReset">
                    <el-radio :label="0"> YES </el-radio>
                    <el-radio :label="1"> NO </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="转把分档" prop="rotateHandle">
                  <el-radio-group v-model="formData.rotateHandle">
                    <el-radio :label="1"> YES </el-radio>
                    <el-radio :label="0"> NO </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="蜂鸣器开关" prop="buzzerSwitch">
                  <el-radio-group v-model="formData.buzzerSwitch">
                    <el-radio :label="0"> YES </el-radio>
                    <el-radio :label="1"> NO </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="定速巡航功能" prop="cruise">
                  <el-radio-group v-model="formData.cruise">
                    <el-radio :label="0"> YES </el-radio>
                    <el-radio :label="1"> NO </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="开机密码" prop="turnOnPasswd">
                  <el-radio-group v-model="formData.turnOnPasswd">
                    <el-radio :label="0"> YES </el-radio>
                    <el-radio :label="1"> NO </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="菜单密码" prop="menuPassword">
                  <el-radio-group v-model="formData.menuPassword">
                    <el-radio :label="0"> YES </el-radio>
                    <el-radio :label="1"> NO </el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="转把限速" prop="rotateHandleSpeedLimit">
                  <el-radio-group v-model="formData.rotateHandleSpeedLimit">
                    <div class="flex">
                      <el-radio :label="0">正常</el-radio>
                      <el-radio :label="1">限速6Km</el-radio>
                    </div>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="助力正反" prop="assist">
                  <el-radio-group v-model="formData.assist">
                    <div class="flex">
                      <el-radio :label="0">助力正</el-radio>
                      <el-radio :label="1">助力反</el-radio>
                    </div>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="APP" prop="APP">
                  <el-radio-group v-model="formData.APP">
                    <div class="flex">
                      <el-radio :label="1">YES</el-radio>
                      <el-radio :label="0">NO</el-radio>
                    </div>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <div class="text-center margin-top"></div>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import { categoryComputerDict } from "@/api/third/fileConfig";
import { listCustomer } from "@/api/third/sample";

import { scrollTo } from "@/utils/scroll-to";

export default {
  name: "",
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
      if (!this.dicts_voltage.includes(value)) {
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
      if (!wheelDiameterKeys.includes(value)) {
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
      visible: false,
      confirmLoading: false,
      queryParams: {
        categoryId: "",
        computerId: "",
      },
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
        0: "UART 3.3V",
        1: "UART 5V",
        2: "CAN",
      },
      dicts_ebike: {
        0: "Pace500",
        1: "Pace350",
        2: "Level",
        3: "Sinch",
        4: "Aventure",
        5: "Pace",
        6: "Sinch ST",
        7: "Pace500 V2",
        8: "Pace350 V2",
        9: "Soltera",
        10: "Soltera-7S",
        11: "Cruiser",
        12: "Level V2",
        13: "Sinch V2 ST",
        14: "Aventure V2",
        15: "Abound",
        16: "Aventure CN",
        17: "Sinch ST CN",
        18: "Sinch CN",
        19: "Aventure.2",
        20: "Pace350.3",
        21: "Pace500.3",
        22: "Level.3",
        23: "Sinch ST.2",
        24: "Soltera.2",
        25: "Level.2",
      },
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
  created() {
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
    // 客户
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
    resetSetFile() {
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
    changeCategory(val) {
      if (!val) return;
      this.queryParams.computerId = "";
      this.computerOptions = this.dictList.filter(
        (item) => item.id === val
      )[0].computerList;
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