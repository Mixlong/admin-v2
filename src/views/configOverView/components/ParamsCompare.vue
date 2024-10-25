<template>
  <!-- 对比 -->
  <el-dialog
    class="params-compare-Box Header_Fixed"
    title="参数对比"
    :visible="isParamsCompareShow"
    fullscreen
    top="2vh"
    center
    append-to-body
    :close-on-click-modal="false"
    @close="$emit('update:isParamsCompareShow', false)"
  >
    <el-row type="flex" justify="space-between">
      <el-col :span="2"></el-col>
      <el-col :span="20">
        <div class="flex justify-between params-set-header">
          <div class="flex align-center">
            <div class="compare-params-box">对比参数设置：</div>
            <el-checkbox v-model="isLight">高亮显示不同参数</el-checkbox>
            <el-checkbox v-model="isHide">隐藏相同参数</el-checkbox>
          </div>
        </div>
        <div class="tbA compare-param">
          <table
            class="params-table"
            width="100%"
            border="0"
            cellspacing="0"
            cellpadding="0"
          >
            <tbody>
              <tr>
                <th class="tit no-bottom-border">产品信息</th>
                <td
                  class="no-bottom-border"
                  v-for="(item, index) in compareData"
                >
                  <SearchParams
                    :dictList="dictList"
                    :paramsIndex="index"
                    :currentItem="item"
                    :compareData="compareData"
                    @sendBrandData="sendBrandData"
                    @handleRemove="handleRemove"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <el-collapse v-model="basicParams">
            <el-collapse-item title="基本参数" name="1">
              <table
                class="params-table"
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
              >
                <tbody>
                  <tr
                    v-show="isHideSameItem('category')"
                    :class="{ 'light-different-params': isLightBg('category') }"
                  >
                    <th>所属品类</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.category }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('computerName')"
                    :class="{
                      'light-different-params': isLightBg('computerName'),
                    }"
                  >
                    <th>所属型号</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.computerName }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('customerName')"
                    :class="{
                      'light-different-params': isLightBg('customerName'),
                    }"
                  >
                    <th>客户</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.customerName }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('customerMaterialNum')"
                    :class="{
                      'light-different-params': isLightBg(
                        'customerMaterialNum'
                      ),
                    }"
                  >
                    <th>客户料号</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.customerMaterialNum }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('desc')"
                    :class="{ 'light-different-params': isLightBg('desc') }"
                  >
                    <th>描述</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.desc }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('sn')"
                    :class="{ 'light-different-params': isLightBg('sn') }"
                  >
                    <th>SN</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.sn }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('pcbaSn')"
                    :class="{ 'light-different-params': isLightBg('pcbaSn') }"
                  >
                    <th>pcbaSn</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.pcbaSn }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('customerCarName')"
                    :class="{
                      'light-different-params': isLightBg('customerCarName'),
                    }"
                  >
                    <th>实际客户车名</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.customerCarName }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('carModel')"
                    :class="{ 'light-different-params': isLightBg('carModel') }"
                  >
                    <th>客户车型编码</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.carModel }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('controlConnect')"
                    :class="{
                      'light-different-params': isLightBg('controlConnect'),
                    }"
                  >
                    <th>控制器接头</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.controlConnect }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('notControllerJointString')"
                    :class="{
                      'light-different-params': isLightBg(
                        'notControllerJointString'
                      ),
                    }"
                  >
                    <th>不含头控制器出线线长</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.notControllerJointString }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('modelEndHead')"
                    :class="{
                      'light-different-params': isLightBg('modelEndHead'),
                    }"
                  >
                    <th>按键【仪表端】接头</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.modelEndHead }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('keyEndHead')"
                    :class="{
                      'light-different-params': isLightBg('keyEndHead'),
                    }"
                  >
                    <th>按键【按键端】接头</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.keyEndHead }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('serialLevel')"
                    :class="{
                      'light-different-params': isLightBg('serialLevel'),
                    }"
                  >
                    <th>通讯方式</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ serialLevelData[item.serialLevel] }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('keyType')"
                    :class="{ 'light-different-params': isLightBg('keyType') }"
                  >
                    <th>按键型号</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ dicts_keyType_list[item.keyType] }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('keyLineLen')"
                    :class="{
                      'light-different-params': isLightBg('keyLineLen'),
                    }"
                  >
                    <th>按键线长</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ dicts_keyType_list[item.keyLineLen] }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('speedLimitRang')"
                    :class="{
                      'light-different-params': isLightBg('speedLimitRang'),
                    }"
                  >
                    <th>限速范围</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.speedLimitRang }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('handlebarSize')"
                    :class="{
                      'light-different-params': isLightBg('handlebarSize'),
                    }"
                  >
                    <th class="no-bottom-border">车把尺寸</th>
                    <td
                      class="no-bottom-border"
                      v-for="item in compareData"
                      :key="item.id"
                    >
                      {{ item.handlebarSize }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </el-collapse-item>
          </el-collapse>
          <el-collapse v-model="setParams">
            <el-collapse-item title="配置参数" name="1">
              <table
                class="params-table"
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
              >
                <tbody>
                  <tr
                    v-show="isHideSameItem('backlightBrightness')"
                    :class="{
                      'light-different-params': isLightBg(
                        'backlightBrightness'
                      ),
                    }"
                  >
                    <th>背光亮度</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ backlightBrightnessList[item.backlightBrightness] }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('slowStart')"
                    :class="{
                      'light-different-params': isLightBg('slowStart'),
                    }"
                  >
                    <th>缓启动</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.slowStart }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('ebikeName')"
                    :class="{
                      'light-different-params': isLightBg('ebikeName'),
                    }"
                  >
                    <th>车名</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ dicts_ebike[item.ebikeName] }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('tiresSize')"
                    :class="{
                      'light-different-params': isLightBg('tiresSize'),
                    }"
                  >
                    <th>车轮宽度</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.tiresSize }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('sleepTime')"
                    :class="{
                      'light-different-params': isLightBg('sleepTime'),
                    }"
                  >
                    <th>休眠时间</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.sleepTime }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('wheelDiameter')"
                    :class="{
                      'light-different-params': isLightBg('wheelDiameter'),
                    }"
                  >
                    <th>轮径</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ wheelDiameterData[item.wheelDiameter] }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('carModel')"
                    :class="{ 'light-different-params': isLightBg('carModel') }"
                  >
                    <th>车型</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.carModel }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('bluetooth')"
                    :class="{
                      'light-different-params': isLightBg('bluetooth'),
                    }"
                  >
                    <th>蓝牙</th>
                    <td v-for="item in compareData" :key="item.id">
                      <span v-show="!Is_Empty(item.bluetooth)">
                        {{ item.bluetooth === 1 ? "YES" : "NO" }}
                      </span>
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('voltage')"
                    :class="{ 'light-different-params': isLightBg('voltage') }"
                  >
                    <th>系统电压</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.voltage }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('perimeter')"
                    :class="{
                      'light-different-params': isLightBg('perimeter'),
                    }"
                  >
                    <th>周长</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.perimeter }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('defaultGear')"
                    :class="{
                      'light-different-params': isLightBg('defaultGear'),
                    }"
                  >
                    <th>默认档位</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.defaultGear }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('driveAssist')"
                    :class="{
                      'light-different-params': isLightBg('driveAssist'),
                    }"
                  >
                    <th>推车助力</th>
                    <td v-for="item in compareData" :key="item.id">
                      <span v-show="!Is_Empty(item.driveAssist)">
                        {{ item.driveAssist === 1 ? "YES" : "NO" }}
                      </span>
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('undervoltage')"
                    :class="{
                      'light-different-params': isLightBg('undervoltage'),
                    }"
                  >
                    <th>欠压门限</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.undervoltage }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('unit')"
                    :class="{ 'light-different-params': isLightBg('unit') }"
                  >
                    <th>显示单位</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ dicts_unit[item.unit] }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('logo')"
                    :class="{ 'light-different-params': isLightBg('logo') }"
                  >
                    <th>Logo界面</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ dicts_logo[item.logo] }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('factoryReset')"
                    :class="{
                      'light-different-params': isLightBg('factoryReset'),
                    }"
                  >
                    <th>恢复出厂设置</th>
                    <td v-for="item in compareData" :key="item.id">
                      <span v-show="!Is_Empty(item.factoryReset)">
                        {{ item.factoryReset === 0 ? "YES" : "NO" }}
                      </span>
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('powerGear')"
                    :class="{
                      'light-different-params': isLightBg('powerGear'),
                    }"
                  >
                    <th>助力档位数</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.powerGear }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('agreement')"
                    :class="{
                      'light-different-params': isLightBg('agreement'),
                    }"
                  >
                    <th>协议</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ dicts_agreement[item.agreement] }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('startupPasswd')"
                    :class="{
                      'light-different-params': isLightBg('startupPasswd'),
                    }"
                  >
                    <th>开机密码</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.startupPasswd }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('rotateHandle')"
                    :class="{
                      'light-different-params': isLightBg('rotateHandle'),
                    }"
                  >
                    <th>转把分档</th>
                    <td v-for="item in compareData" :key="item.id">
                      <span v-show="!Is_Empty(item.rotateHandle)">
                        {{ item.rotateHandle === 1 ? "YES" : "NO" }}
                      </span>
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('assistStartMagnetNumber')"
                    :class="{
                      'light-different-params': isLightBg(
                        'assistStartMagnetNumber'
                      ),
                    }"
                  >
                    <th>助力开始磁钢数</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.assistStartMagnetNumber }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('power')"
                    :class="{ 'light-different-params': isLightBg('power') }"
                  >
                    <th>电量计算方式</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ dicts_power[item.power] }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('highMenuPasswd')"
                    :class="{
                      'light-different-params': isLightBg('highMenuPasswd'),
                    }"
                  >
                    <th>高级菜单密码</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.highMenuPasswd }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('buzzerSwitch')"
                    :class="{
                      'light-different-params': isLightBg('buzzerSwitch'),
                    }"
                  >
                    <th>蜂鸣器开关</th>
                    <td v-for="item in compareData" :key="item.id">
                      <span v-show="!Is_Empty(item.buzzerSwitch)">
                        {{ item.buzzerSwitch === 0 ? "YES" : "NO" }}
                      </span>
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('assistPercentage')"
                    :class="{
                      'light-different-params': isLightBg('assistPercentage'),
                    }"
                  >
                    <th>助力比例</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.assistPercentage }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('speedSteel')"
                    :class="{
                      'light-different-params': isLightBg('speedSteel'),
                    }"
                  >
                    <th>测速磁钢数</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.speedSteel }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('motorSys')"
                    :class="{ 'light-different-params': isLightBg('motorSys') }"
                  >
                    <th>电机功率</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.motorSys }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('cruise')"
                    :class="{ 'light-different-params': isLightBg('cruise') }"
                  >
                    <th>定速巡航功能</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.cruise }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('currentlimiting')"
                    :class="{
                      'light-different-params': isLightBg('currentlimiting'),
                    }"
                  >
                    <th>限流门限</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.currentlimiting }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('batteryVoltageChangeTime')"
                    :class="{
                      'light-different-params': isLightBg(
                        'batteryVoltageChangeTime'
                      ),
                    }"
                  >
                    <th>电量变化时间</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.batteryVoltageChangeTime }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('batteryCap')"
                    :class="{
                      'light-different-params': isLightBg('batteryCap'),
                    }"
                  >
                    <th>电池容量</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.batteryCap }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('turnOnPasswd')"
                    :class="{
                      'light-different-params': isLightBg('turnOnPasswd'),
                    }"
                  >
                    <th>开机密码</th>
                    <td v-for="item in compareData" :key="item.id">
                      <span v-show="!Is_Empty(item.turnOnPasswd)">
                        {{ item.turnOnPasswd === 0 ? "YES" : "NO" }}
                      </span>
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('assistLimit')"
                    :class="{
                      'light-different-params': isLightBg('assistLimit'),
                    }"
                  >
                    <th>助力限速门限</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.assistLimit }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('smoothLevel')"
                    :class="{
                      'light-different-params': isLightBg('smoothLevel'),
                    }"
                  >
                    <th>速度平滑等级</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.smoothLevel }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('highSpeedBuzzerRemind')"
                    :class="{
                      'light-different-params': isLightBg(
                        'highSpeedBuzzerRemind'
                      ),
                    }"
                  >
                    <th>高速蜂鸣器提醒</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.highSpeedBuzzerRemind }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('menuPassword')"
                    :class="{
                      'light-different-params': isLightBg('menuPassword'),
                    }"
                  >
                    <th>菜单密码</th>
                    <td v-for="item in compareData" :key="item.id">
                      <span v-show="!Is_Empty(item.menuPassword)">
                        {{ item.menuPassword === 0 ? "YES" : "NO" }}
                      </span>
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('showWheelsize')"
                    :class="{
                      'light-different-params': isLightBg('showWheelsize'),
                    }"
                  >
                    <th>显示轮径</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.showWheelsize }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('allLineErrTimeOut')"
                    :class="{
                      'light-different-params': isLightBg('allLineErrTimeOut'),
                    }"
                  >
                    <th>总线故障超时时间</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ item.allLineErrTimeOut }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('serialLevelLog')"
                    :class="{
                      'light-different-params': isLightBg('serialLevelLog'),
                    }"
                  >
                    <th>串口通讯电平</th>
                    <td v-for="item in compareData" :key="item.id">
                      {{ serialLevelLogData[item.serialLevelLog] }}
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('rotateHandleSpeedLimit')"
                    :class="{
                      'light-different-params': isLightBg(
                        'rotateHandleSpeedLimit'
                      ),
                    }"
                  >
                    <th>转把限速</th>
                    <td v-for="item in compareData" :key="item.id">
                      <span v-show="!Is_Empty(item.rotateHandleSpeedLimit)">
                        {{
                          item.rotateHandleSpeedLimit === 0 ? "正常" : "限速6Km"
                        }}
                      </span>
                    </td>
                  </tr>
                  <tr
                    v-show="isHideSameItem('assist')"
                    :class="{ 'light-different-params': isLightBg('assist') }"
                  >
                    <th class="no-bottom-border">助力正反</th>
                    <td
                      class="no-bottom-border"
                      v-for="item in compareData"
                      :key="item.id"
                    >
                      <span v-show="!Is_Empty(item.assist)">
                        {{ item.assist === 0 ? "助力正" : "助力反" }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-col>
      <el-col :span="2"></el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import SearchParams from "./SearchParams.vue";
import commonData from "@/mixins/commonData";
const localCompareData = JSON.parse(localStorage.getItem("compareData"));
export default {
  mixins: [commonData],
  props: {
    isParamsCompareShow: {
      type: Boolean,
      default: false,
    },
    // dictList: {
    //   type: Array,
    //   default: () => [],
    // },
  },
  components: {
    SearchParams,
  },
  data() {
    return {
      isLight: false,
      isHide: false,
      basicParams: ["1"],
      setParams: ["1"],
      serialLevelLogData: {
        0: "3.3V",
        1: "5V",
      },
      compareData: localCompareData || [{}, {}, {}, {}, {}],
    };
  },
  computed: {
    isLightBg() {
      return (key) => {
        return this.isLight && this.isDifferentParams(key);
      };
    },
    isHideSameItem() {
      return (key) => {
        if (this.isHide) {
          return this.isDifferentParams(key);
        } else {
          return true;
        }
      };
    },
    isDifferentParams() {
      return (key) => {
        const seen = new Map();
        const newData = this.compareData.filter((item) => item.id);

        for (const item of newData) {
          if (seen.has(item[key])) {
            return false;
          }
          seen.set(item[key], item);
        }
        return true;
      };
    },
  },
  methods: {
    sendBrandData({ brandData, paramsIndex }) {
      this.compareData.splice(paramsIndex, 1, brandData);

      localStorage.setItem("compareData", JSON.stringify(this.compareData));
    },
    handleRemove(removeIndex) {
      this.compareData.splice(removeIndex, 1, {});
      localStorage.setItem("compareData", JSON.stringify(this.compareData));
    },
  },
};
</script>

<style lang="scss" scoped>
.params-compare-Box {
  .params-set-header {
    background: #fff0cd;
    padding: 5px 9px;
    box-sizing: border-box;

    .compare-params-box {
      width: 140px;
      text-align: center;
    }
  }

  .compare-param {
    border: 1px solid #dfdfdf;
    border-top: 1px solid #fea912;

    .params-table {
      text-align: center;
      tr {
        th {
          width: 100px;
          border-bottom: 1px solid #ddd;
          border-right: 1px solid #ddd;
          padding: 5px 0;
          color: #706b6b;
          font-size: 12px;
        }
        td {
          border-right: 1px solid #ddd;
          border-bottom: 1px dashed #ddd;
          width: 200px;
        }
      }

      .tit {
        font-size: 16px;
        font-weight: 700;
        background: #fff;
        color: #1a0202;
      }

      .no-bottom-border {
        border-bottom: none;
      }
    }
  }

  .el-collapse-item {
    /deep/ .el-collapse-item__header {
      height: 30px !important;
      line-height: 30px !important;
      padding-left: 45px;
      border-bottom: 1px solid #dfdfdf;
      background: #e3e3e3;
      font-weight: bold;
    }
    /deep/ .el-collapse-item__content {
      padding-bottom: 0;
    }
  }

  .light-different-params {
    background: #fffdde;
  }
}
</style>
