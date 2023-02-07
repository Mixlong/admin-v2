 
<template>
  <div class="cust-style-content bg-white" safe-area-inset-bottom
    :style="custStyle">
    <van-nav-bar title="迪太仪表样品需求单"></van-nav-bar>
    <div style="height: 46px"></div>
    <van-field v-model="form.customerName" label="客户名称" :disabled="isDisabled" clearable required placeholder="请输入" />
    <van-field v-model="form.sendTime" label="期望完成日期" :disabled="isDisabled" clearable required placeholder="请输入" @click="!isDisabled && (showDate = true)"
      :readonly="true" />
    <van-field v-model="form.baseModel" required label="产品型号" :disabled="isDisabled" clearable readonly @click="!isDisabled && (showModel = true)"
      placeholder="请选择" />
    <van-field v-model="form.sendNum" required label="样品数量" type="number" :disabled="isDisabled" clearable requiredlabel="请输入"
      placeholder="请输入" />
    <van-field v-model="conForm.projectName" label="项目" :disabled="isDisabled" clearable placeholder="请输入" />
    <van-field label="蓝牙功能" required>
      <template #input>
        <van-radio-group v-model="conForm.ble" direction="horizontal" :disabled="isDisabled">
          <van-radio :name="item" v-for="(item, index) in bleList" :key="index">
            {{ item }}
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="通讯方式" required>
      <template #input>
        <van-radio-group v-model="conForm.comMethods" direction="horizontal" :disabled="isDisabled" @change="getComMethods">
          <van-radio :name="item" v-for="(item, index) in communicationMethodsList" :key="index">
            {{ item }}
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="通讯协议" required>
      <template #input>
        <van-radio-group v-model="conForm.communication" :disabled="isDisabled" direction="horizontal">
          <van-radio class="margin-bottom-xs" style="min-width: 90px" :name="item"
            v-for="(item, index) in communicationList" :key="index">
            <span v-if="item != '其它'"> {{ item }}</span>
            <van-field class="van-cell-border" v-if="item == '其它'" :disabled="isDisabled" style="flex-direction: row; padding-left: 0"
              v-model="conForm.communicationValue" clearable label="其它" placeholder="请输入" />
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="轮径" required>
      <template #input>
        <van-radio-group v-model="conForm.wheel" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" style="min-width: 80px" :name="item" v-for="(item, index) in wheelList"
            :key="index">
            <span v-if="item != '其它'"> {{ item }}</span>
            <van-field v-else class="van-cell-border" clearable :disabled="isDisabled" v-model="conForm.wheelValue" label=""
              :placeholder="item" />
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="周长" required >
      <template #input>
        <van-cell center>
          <template #title>
            <div class="flex align-center margin-right-lg">
              <van-field v-model="conForm.permiter" :disabled="isDisabled" clearable type="number" placeholder="请输入周长" />mm
            </div>
          </template>
        </van-cell>
      </template>
    </van-field>
    <van-cell title="注：通用周长计算方式：轮径尺寸 x 25.4 x 3.14" title-class="text-red margin-bottom-xs" :border="false" />
    <van-field label="传感器" required>
      <template #input>
        <van-radio-group v-model="conForm.sensor" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" :name="item" v-for="(item, index) in sensorList" :key="index">
            <span v-if="item != '其它'"> {{ item }}</span>
            <van-cell-group v-else>
              <van-field v-model="conForm.sensorValue" :disabled="isDisabled" clearable label="" :placeholder="item" />
            </van-cell-group>
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="助力磁钢数" required>
      <template #input>
        <van-radio-group v-model="conForm.magnetic" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" :name="item" v-for="(item, index) in 12" :key="index">
            {{ item }}
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="电机内置测速传感磁钢数" required>
      <template #input>
        <van-radio-group v-model="conForm.sensing" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" :name="item" v-for="(item, index) in 12" :key="index">
            {{ item }}
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="车把外径" required>
      <template #input>
        <van-radio-group v-model="conForm.sensorHanderbar" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" :name="item" v-for="(item, index) in handerbarList" :key="index">
            <span v-if="item != '其它'"> {{ item }}mm</span>
            <van-cell-group v-else>
              <van-field v-model="conForm.sensorHanderbarVal" :disabled="isDisabled" clearable label="" :placeholder="item" />
            </van-cell-group>
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="电池电压" required>
      <template #input>
        <van-radio-group v-model="conForm.handerbar" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" :name="item" v-for="(item, index) in BatteryList" :key="index">
            <span v-if="item != '其它'"> {{ item }}</span>
            <van-field v-else class="van-cell-border" clearable :disabled="isDisabled" v-model="conForm.handerbarValue" label=""
              :placeholder="item" />
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="请客户选择分段电压值">
      <template #input>
        <van-radio-group style="padding-left: 0">
          <van-field v-for="(item, index) in conForm.voltageList" :disabled="isDisabled" clearable :required="index === 0" :key="index"
            v-model="item.value" :label="item.label" placeholder="请输入" class="flex" style="flex-direction: row" />
        </van-radio-group>
      </template>
    </van-field>
    <van-cell title="注意：LED仪表可选项目为24/36V" title-class="text-red margin-bottom-xs" :border="false" />
    <!-- <van-field name="switch" label="电池材料">
      <template #input>
        <van-radio-group v-model="conForm.battery">
          <van-radio
            class="margin-bottom-xs"
            style="widthd: 100%"
            :name="item"
            v-for="(item, index) in batteryList"
            :key="index"
          >
            <span v-if="item != '其它'"> {{ item }}</span>
            <van-cell-group v-else>
              <van-field
                v-model="conForm.batteryValue"
                label=""
                :placeholder="item"
              />
            </van-cell-group>
          </van-radio>
        </van-radio-group>
      </template>
    </van-field> -->
    <van-field label="电量计算" required>
      <template #input>
        <van-radio-group v-model="conForm.electicRad" :disabled="isDisabled">
          <van-radio :name="item" v-for="(item, index) in electicList" :key="index">
            {{ item }}
            <span v-show="index === 1">（需提供电池充电放电曲线图）</span>
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="限流值" required>
      <template #input>
        <van-cell center>
          <template #title>
            <div class="flex align-center margin-right-lg">
              <van-field v-model="conForm.limitFlow" :disabled="isDisabled" clearable type="number" placeholder="请输入限流值" />A
            </div>
          </template>
        </van-cell>
      </template>
    </van-field>
    <van-field label="电机功率" required>
      <template #input>
        <van-cell center>
          <template #title>
            <div class="flex align-center margin-right-lg">
              <van-field v-model="conForm.power" :disabled="isDisabled" clearable type="number" placeholder="请输入电机功率" />W
            </div>
          </template>
        </van-cell>
      </template>
    </van-field>
    <van-field label="定速巡航功能" required>
      <template #input>
        <van-radio-group v-model="conForm.constantSpeed" class="flex" :disabled="isDisabled">
          <van-radio :name="item" v-for="(item, index) in constantSpeedList" :key="index">
            {{ item }}
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="开机密码" required>
      <template #input>
        <van-radio-group v-model="conForm.openPwd" class="flex" :disabled="isDisabled">
          <van-radio :name="item" v-for="(item, index) in openPwdList" :key="index">
            {{ item }}
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="高级菜单" required>
      <template #input>
        <van-radio-group v-model="conForm.menuVal" class="flex" :disabled="isDisabled">
          <van-radio :name="item" v-for="(item, index) in menuList" :key="index">
            {{ item }}
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="档位" required>
      <template #input>
        <van-radio-group v-model="conForm.asist" class="flex" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" style="min-width: 56px" :name="item" v-for="(item, index) in asistList"
            :key="index">
            <span v-if="item != '其它'"> {{ item }}</span>
            <van-field v-else class="van-cell-border" clearable :disabled="isDisabled" type="number" v-model="conForm.asistValue" label=""
              :placeholder="item" />
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-cell title="注：该项不适用于LED仪表" title-class="text-red margin-bottom-xs" :border="false" />
    <van-field label="默认档位" required>
      <template #input>
        <van-radio-group v-model="conForm.assistLevel" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" style="widthd: 100%" :name="item" v-for="(item, index) in assistLevelList"
            :key="index">
            <span v-if="item != '其它'"> {{ item }}</span>
            <van-cell-group v-else>
              <van-field v-model="conForm.assistLevelValue" :disabled="isDisabled" clearable label="" :placeholder="item" />
            </van-cell-group>
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="6km/h助推" required>
      <template #input>
        <van-radio-group v-model="conForm.km" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" style="widthd: 100%" :name="item" v-for="(item, index) in openPwdList"
            :key="index">
            <span v-if="item != '其它'"> {{ item }}</span>
            <van-cell-group v-else>
              <van-field v-model="conForm.kmValue" :disabled="isDisabled" clearable label="" :placeholder="item" />
            </van-cell-group>
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="转把功能">
      <template #input>
        <van-radio-group v-model="conForm.throttle" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" style="widthd: 100%" :name="item" v-for="(item, index) in throttleList"
            :key="index">
            <span v-if="item != '其它'"> {{ item }}</span>
            <van-cell-group v-else>
              <van-field v-model="conForm.throttleValue" :disabled="isDisabled" clearable label="" :placeholder="item" />
            </van-cell-group>
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="转把分档">
      <template #input>
        <van-radio-group v-model="conForm.turnStep" class="flex" :disabled="isDisabled">
          <van-radio :name="item" v-for="(item, index) in turnStepList" :key="index">
            {{ item }}
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="限速值" required>
      <template #input>
        <van-radio-group v-model="conForm.speed" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" :name="item" v-for="(item, index) in speedList" :key="index">
            <span v-if="item != '其它'"> {{ item }}</span>
            <van-cell-group v-else>
              <van-field v-model="conForm.speedVal" :disabled="isDisabled" clearable label="" :placeholder="item" />
            </van-cell-group>
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="显示单位" required>
      <template #input>
        <van-radio-group v-model="conForm.unit" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" style="widthd: 100%" :name="item" v-for="(item, index) in unitList"
            :key="index">
            <span> {{ item }}</span>
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field label="APP功能" required>
      <template #input>
        <van-radio-group v-model="conForm.appFun" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" style="widthd: 100%" :name="item" v-for="(item, index) in appFunList"
            :key="index">
            <span v-if="item != '其它'"> {{ item }}</span>
            <van-cell-group v-else>
              <van-field v-model="conForm.appFunVal" :disabled="isDisabled" clearable label="" :placeholder="item" />
            </van-cell-group>
          </van-radio>
        </van-radio-group>
      </template>
      <template #right-icon>
        <span class="text-red">注：默认迪太APP</span>
      </template>
    </van-field>
    <!-- <van-field label="按键选项" required>
      <template #input>
        <van-radio-group v-model="conForm.keyVal" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" :name="item" v-for="(item, index) in keyList" :key="index">
            <span> {{ item }}</span>
          </van-radio>
        </van-radio-group>
      </template>
    </van-field> -->
    <van-cell-group>
      <van-field label="连接线仪表到控制器" required class="border-none">
        <template #input>
          <div style="width: 100%">
            <div style="width: 100%">
              <van-field required v-model="conForm.clength" :disabled="isDisabled" clearable label="线长" placeholder="请输入mm" type="number" />
              <van-field label="含头/不含头" required>
                <template #input>
                  <van-radio-group v-model="conForm.cable" class="flex" :disabled="isDisabled">
                    <van-radio :name="item" v-for="(item, index) in cableList" :key="index">
                      <span v-if="item != '其它'"> {{ item }}</span>
                      <van-cell-group v-else>
                        <van-field v-model="conForm.Value" :disabled="isDisabled" clearable label="" :placeholder="item" />
                      </van-cell-group>
                    </van-radio>
                  </van-radio-group>
                </template>
              </van-field>
            </div>
            <van-cell :border="false">
              <div class="text-center" slot="title">
                <el-image :src="srcList[0]" :preview-src-list="srcList"></el-image>
              </div>
            </van-cell>
            <div class="solid">
              <van-field style="width: 100%; margin-top: 0.5rem" :disabled="isDisabled" v-model="conForm.explain" rows="2" autosize label=""
                type="textarea" maxlength="300" clearable placeholder="请输入其它说明" show-word-limit />
            </div>
          </div>
        </template>
      </van-field>
    </van-cell-group>
    <van-field required label="插件型号及类型" placeholder="请输入" class="border-none">
      <template #input>
        <van-radio-group v-model="conForm.plugModel" :disabled="isDisabled">
          <van-radio :name="item" v-for="(item, index) in plugModelList" :key="index" style="padding-right: 0;">
            <div class="flex align-center">
              <van-field class="van-cell-border" :disabled="isDisabled" clearable style="padding-left: 5px;"
                v-model="plugModelListValue[index]" :label="item" placeholder="请输入型号" />
            </div>
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-cell>
      <template #title>
        <el-select style="width: 100%" size="mini" :disabled="isDisabled" clearable v-model="conForm.coreVal" placeholder="请选择几芯"
          class="margin-right-xs">
          <el-option v-for="(item, index) in coreList" :key="index" :label="item" :value="item"></el-option>
        </el-select>
      </template>
      <template #right-icon>
        <el-select class="margin-left-xs" clearable :disabled="isDisabled" style="width: 50%" size="mini" v-model="conForm.maleOrFemale"
          placeholder="请选择公母">
          <el-option v-for="(item, index) in maleFemale" :key="index" :label="item" :value="item"></el-option>
        </el-select>
      </template>
    </van-cell>
    <van-field required label="按键线选择">
      <!-- <template #input>
        <div class="flex-direction">
          <van-radio-group v-model="conForm.connector" @change="getConnector" :disabled="isDisabled">
            <van-radio class="margin-bottom-xs" :name="item"
              v-for="(item, index) in connectorList" :key="index">
              <span> {{ item }}</span>
            </van-radio>
          </van-radio-group>
          <van-field v-if="conForm.connector === '直连按键'" v-model="conForm.cableLengh3" clearable required label="仪表到按键（不含头）" type="number" placeholder="请输入长度(mm)">
          </van-field>
          <template v-else>
            <van-field v-model="conForm.cableLengh1" required :disabled="isDisabled" label="仪表到快插头（不含头）" clearable type="number"
            placeholder="请输入长度(mm)"></van-field>
            <van-field v-model="conForm.cableLengh2" required :disabled="isDisabled" label="按键到快插头（不含头）" clearable type="number"
            placeholder="请输入长度(mm)"></van-field>
          </template>
        </div>
      </template> -->
      <template #input>
        <van-radio-group v-model="conForm.keyVal" :disabled="isDisabled">
          <van-radio class="margin-bottom-xs" :name="item" v-for="(item, index) in keyList" :key="index">
            <span> {{ item }}</span>
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <van-field v-model="conForm.cableLengh3" :disabled="isDisabled" clearable required label="仪表到按键（不含头）" type="number" placeholder="请输入长度(mm)"></van-field>
    <van-cell center :border="false">
      <div class="text-center" slot="title">
        <el-image :src="srcList1[0]" :preview-src-list="srcList1"></el-image>
      </div>
    </van-cell>
    <van-field label="线色定义" required>
      <template #input>
        <van-cell-group style="width:100%" :border="false">
          <van-cell title="电源正极" center>
            <template #right-icon>
              <el-select :class="['f' + elBgColor(conForm.VDD)]" :disabled="isDisabled" clearable style="width: 120px" v-model="conForm.VDD">
                <el-option :style="{ 'background': selBgColor(index), color: selColor(index) }"
                  v-for="(item, index) in lineColorList" :key="index" :label="item" :value="item"></el-option>
              </el-select>
            </template>
          </van-cell>
          <van-cell title="电源负极" center>
            <template #right-icon>
              <el-select :class="['f' + elBgColor(conForm.GND)]" :disabled="isDisabled" clearable style="width: 120px" v-model="conForm.GND">
                <el-option :style="{ 'background': selBgColor(index), color: selColor(index) }"
                  v-for="(item, index) in lineColorList" :key="index" :label="item" :value="item">
                </el-option>
              </el-select>
            </template>
          </van-cell>
          <van-cell title="电锁" center>
            <template #right-icon>
              <el-select :class="['f' + elBgColor(conForm.switchLock)]" :disabled="isDisabled" clearable style="width: 120px"
                v-model="conForm.switchLock">
                <el-option :style="{ 'background': selBgColor(index), color: selColor(index) }"
                  v-for="(item, index) in lineColorList" :key="index" :label="item" :value="item">
                </el-option>
              </el-select>
            </template>
          </van-cell>
          <van-cell title="仪表Rx" center>
            <template #right-icon>
              <el-select :class="['f' + elBgColor(conForm.meterRx)]" :disabled="isDisabled" clearable style="width: 120px"
                v-model="conForm.meterRx">
                <el-option :style="{ 'background': selBgColor(index), color: selColor(index) }"
                  v-for="(item, index) in lineColorList" :key="index" :label="item" :value="item">
                </el-option>
              </el-select>
            </template>
          </van-cell>
          <van-cell title="仪表Tx" center>
            <template #right-icon>
              <el-select :class="['f' + elBgColor(conForm.meterTx)]" :disabled="isDisabled" clearable style="width: 120px"
                v-model="conForm.meterTx">
                <el-option :style="{ 'background': selBgColor(index), color: selColor(index) }"
                  v-for="(item, index) in lineColorList" :key="index" :label="item" :value="item">
                </el-option>
              </el-select>
            </template>
          </van-cell>
          <!-- <van-field v-model="conForm.otherColor" label="其他线色" :disabled="isDisabled" input-align="left" placeholder="请输入" /> -->
        </van-cell-group>
      </template>
    </van-field>
    <van-field label="开机LOGO" required error-message="只可上传ai文件" class="img-box" v-if="!isDisabled">
      <template #input>
        <DrUpload class="upload-img-box" :disabled="isDisabled" accept=".ai"
          :limit="1" :showFileList="true" pclass="flex" v-model="conForm.img">
          <div class="text-left margin-top-sm">
            <el-button type="primary" size="small">点击上传</el-button>
          </div>
        </DrUpload>
      </template>
    </van-field>
    <van-field v-else label="开机LOGO" readonly v-model="conForm.img" @click="onCopy(conForm.img)"></van-field>
    <van-field v-model="conForm.customer" rows="3" :disabled="isDisabled" clearable autosize label="客户其他要求说明" type="textarea" maxlength="1000"
      placeholder="请输入说明" show-word-limit />
    <div class="fix-bt" v-if="!isDisabled">
      <van-button type="info" size="large" @click="submit" safe-area-inset-bottom>提交</van-button>
    </div>
    <van-calendar v-if="maxDate" safe-area-inset-bottom v-model="showDate" :max-date="maxDate" @confirm="onConfirm" />
    <van-overlay safe-area-inset-bottom :show="show" @click="closeOverlay" z-index="101" class="overlay-content">
      <div @click.stop>
        <van-checkbox-group v-model="selectModel">
          <van-cell-group>
            <van-cell v-for="(item, index) in modelList" :key="item.id" :title="item.name" @click="toggle(index)">
              <template #right-icon>
                <van-checkbox :name="item.name" ref="checkboxes" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-checkbox-group>
      </div>
    </van-overlay>
    <!-- 产品型号图片 -->
    <van-popup v-model="showModel" round class="model-box">
      <van-cell-group>
        <van-cell center v-for="(item) in imgList" :key="item.id" :title="item.name" @click="chooseModelItem(item)"
          class="pointer">
          <template #right-icon>
            <van-image width="80" height="80" radius="5" fit="contain" :src="item.img" style="background: #f8f8f8" />
          </template>
        </van-cell>
      </van-cell-group>
    </van-popup>
  </div>
</template>

<script>
import { sampleApply, sampleImgList } from "@/api/third/sample";
import {
  Field,
  CellGroup,
  RadioGroup,
  Radio,
  Calendar,
  Button,
  Toast,
  Overlay,
  Checkbox,
  CheckboxGroup,
  Cell,
  Uploader,
  Popup,
  Image,
  NavBar
} from "vant";
import { commonJs } from "@/mixins/common";
export default {
  mixins: [commonJs],
  name: 'survey',
  components: {
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [RadioGroup.name]: RadioGroup,
    [Radio.name]: Radio,
    [Calendar.name]: Calendar,
    [Button.name]: Button,
    [Overlay.name]: Overlay,
    [Checkbox.name]: Checkbox,
    [CheckboxGroup.name]: CheckboxGroup,
    [Cell.name]: Cell,
    [Uploader.name]: Uploader,
    [Popup.name]: Popup,
    [Image.name]: Image,
    [NavBar.name]: NavBar
  },
  data() {
    return {
      isDisabled: false,
      maxDate: "",
      show: false,
      showDate: false,
      showModel: false,
      modelValue: null,
      form: {},
      conForm: {
        ble: '有蓝牙',
        magnetic: 1,
        sensing: 1,
        comMethods: 'UART',
        communication: '5s',
        wheel: '12',
        sensor: '力矩传感器',
        sensorHanderbar: '22.2',
        handerbar: '24V',
        electicRad: '控制器上报电量',
        constantSpeed: '开',
        openPwd: '有',
        menuVal: '有（带密码）',
        asist: '3',
        assistLevel: '0档',
        km: '有',
        speed: '25km/h',
        unit: 'km/h',
        appFun: '有',
        keyVal: 'DTK3',
        connector: '直连按键',
        cable: '含头',
        coreVal: '5芯',
        maleOrFemale: '公端',
        voltageList: [
          { label: "V欠压", value: "" },
          { label: "第1格", value: "" },
          { label: "第2格", value: "" },
          { label: "第3格", value: "" },
          { label: "第4格", value: "" },
          { label: "第5格", value: "" },
        ]
      },
      modelList: [],
      selectModel: [],
      imgList: [],
      bleList: ['有蓝牙', '无蓝牙'],
      communicationMethodsList: ['UART', 'CAN'],
      communicationList: ["5s", "2号", "J", "APT", "Tongsh", "BAFANG 4.0", "BAFANG 5.0", "BAFANG 5.8", "其它"],
      wheelList: [
        "12",
        "14",
        "16",
        "18",
        "20",
        "22",
        "24",
        "26",
        "27.5",
        "28",
        "700C",
        "29",
        "其它",
      ],
      sensorList: ["力矩传感器", "踏频传感器"],
      // magneticList: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      handerbarList: ["22.2", "25.4", "31.8", "35", "其它"],
      BatteryList: ["24V", "36V", "48V", "52V", "60V", "72V", "其它"],
      // batteryList: [
      //   "三元 Ternary compound",
      //   "锰锂 Lithium manganate",
      //   "磷酸铁锂 Lithium iron phosphate",
      // ],
      asistList: ["3", "5", "9", "其它"],
      assistLevelList: ["0档", "1档"],
      connectorList: ["直连按键", "快插按键"],
      throttleList: ["6km/h助推", "最高速"],
      unitList: ["km/h", "mph"],
      cableList: ["含头", "不含"],
      plugModelList: ["君磊线", "海固线", "八明线", "亿联盛", "其它"],
      plugModelListValue: ["", "", "", "", ""],
      // shellList: ["黑色", "深灰色上壳", "白上壳"],
      lineColorList: ["红色", "蓝色", "黑色", "绿色", "黄色", "白色", "橙色", "棕色"],
      lineProperty: ["电源正极", "电锁", "电源负极", "仪表Rx", "仪表Tx"],
      srcList: [require('@/assets/image/keyLine2.jpg')],
      srcList1: [require('@/assets/image/keyLine1.jpg')],
      electicList: ['控制器上报电量', '仪表检查电压,仪表计算电量'],
      constantSpeedList: ['开', '关'],
      openPwdList: ['有', '无'],
      menuList: ['有（带密码）', '有（不带密码）', '无'],
      turnStepList: ['分档', '不分档'],
      speedList: ['25km/h', '32km/h', '不限速（5s协议默认41km/h）', '其它'],
      appFunList: ['有', '无', '其它'],
      keyList: ['DTK3', 'DTK5', '仪表本体自带按键'],
      coreList: ['5芯', '6芯'],
      maleFemale: ['公端', '母端']
    };
  },
  computed: {
    selBgColor() {
      return idx => {
        let bg = null
        switch (idx) {
          case 0: bg = 'red'; break;
          case 1: bg = 'blue'; break;
          case 2: bg = 'black'; break;
          case 3: bg = 'green'; break;
          case 4: bg = 'yellow'; break;
          case 5: bg = 'white'; break;
          case 6: bg = 'darkorange'; break;
          case 7: bg = 'brown'; break;
        }
        return bg
      }
    },
    elBgColor() {
      return selBg => {
        let bg = null
        let bgIdx = this.lineColorList.indexOf(selBg)
        switch (bgIdx) {
          case 0: bg = 'red'; break;
          case 1: bg = 'blue'; break;
          case 2: bg = 'black'; break;
          case 3: bg = 'green'; break;
          case 4: bg = 'yellow'; break;
          case 5: bg = 'white'; break;
          case 6: bg = 'darkorange'; break;
          case 7: bg = 'brown'; break;
        }
        return bg
      }
    },
    selColor() {
      return index => {
        return index === 4 || index === 5 ? '#606266' : '#fff'
      }
    },
    custStyle() {
      return {
        'padding-bottom': this.isDisabled ? '30px' : '100px', 
        'max-width': '768px', 
        'margin': 'auto'
      }
    }
  },
  watch: {
    'conForm.comMethods'(val) {
      if(val === 'CAN') {
        this.communicationList = ["BAFANG 3.0", "BAFANG 4.6", "BAFANG 6.1", "BAFANG 6.2", "BAFANG 6.3", "其它"]
      }
    }
  },
  created() {
    let transDate = decodeURIComponent(window.location.href).split('row=')[1]
    if(transDate) {
      transDate = JSON.parse(transDate)
      let { demandObject, customerName, sendTime, sendNum, projectName, baseModel  } = transDate
      demandObject = JSON.parse(demandObject)
      this.isDisabled = true
      this.conForm = Object.assign({}, demandObject)
      this.form = Object.assign(this.form, { customerName, sendTime, sendNum, projectName, baseModel: baseModel })
    }
  },
  mounted() {
    document.title = "迪太仪表样品需求单";
    this.getSampleImgList()
    this.maxDate = new Date(new Date().getFullYear() + 5, 0, 31);
    // this.reset();
  },
  methods: {
    formatDate(date) {
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    },
    onConfirm(date) {
      this.showDate = false;
      this.form.sendTime = this.formatDate(date);
    },
    closeOverlay() {
      this.form.baseModel = this.selectModel.toString();
      this.show = false;
    },
    submit() {
      let { conForm, htmlConcat, form } = this;
      let html = "";
      let html1 = "", html2 = "", html3 = "";
      let { customerName, sendTime, baseModel, sendNum } = form;
      let { permiter, limitFlow, power, clength, cableLengh3, VDD, GND, switchLock, meterRx, meterTx, img, plugModel, voltageList } = conForm
      let err = "";
      if (!customerName) {
        err = "客户名称";
      } else if (!sendTime) {
        err = "期望完成日期";
      } else if (!baseModel) {
        err = "产品型号";
      } else if (!sendNum) {
        err = "样品数量";
      } else if (!permiter) {
        err = "周长";
      } else if (!voltageList[0].value) {
        err = 'V欠压'
      } else if (!limitFlow) {
        err = "限流值";
      } else if (!power) {
        err = "电机功率";
      } else if (!clength) {
        err = "线长";
      } else if (!plugModel) {
        err = '插件型号及类型'
      } 
      else if (!cableLengh3) {
        err = "仪表到按键（不含头）"
      }
      else if (!VDD) {
        err = "电源正极线色"
      } else if (!GND) {
        err = "电源负极线色"
      } else if (!switchLock) {
        err = "电锁线色"
      } else if (!meterRx) {
        err = "仪表Rx线色"
      } else if (!meterTx) {
        err = "仪表Tx线色"
      } else if (!img) {
        err = "开机LOGO"
      }
      if (err) {
        return Toast.fail(err + "不能为空");
      }
      for (let key of Object.keys(conForm)) {
        let value = conForm[key];
        if (conForm[key] == "其它") {
          value = conForm[key + "Value"];
        }
        if (key == "ble") {
          html1 += htmlConcat({ name: "蓝牙功能", value });
        } else if (key == "comMethods") {
          html1 += htmlConcat({ name: "通讯方式", value });
        } else if (key == "communication") {
          html1 += htmlConcat({ name: "通讯协议", value });
        } else if (key == "communicationValue") {
          html1 += htmlConcat({ name: "其它通讯协议", value });
        } else if (key == "wheel") {
          html1 += htmlConcat({ name: "轮径", value: value + '寸' });
        } else if (key == "wheelValue") {
          html1 += htmlConcat({ name: "其它轮径", value });
        } else if (key == "sensorHanderbar") {
          html1 += htmlConcat({ name: "车把外径", value: value + 'mm' });
        } else if (key == "sensorHanderbarVal") {
          html1 += htmlConcat({ name: "其它车把外径", value });
        } else if (key == "handerbar") {
          html1 += htmlConcat({ name: "电池电压", value });
        } else if (key == "handerbarValue") {
          html1 += htmlConcat({ name: "其它电池电压", value });
        } else if (key == "assistLevel") {
          html1 += htmlConcat({ name: "默认档位", value });
        } else if (key == "km") {
          html += htmlConcat({ name: "6km/h助推", value });
        } else if (key == "speed") {
          html1 += htmlConcat({ name: "限速值", value });
        } else if (key == "speedVal") {
          html1 += htmlConcat({ name: "其它限速值", value });
        } else if (key == "unit") {
          html1 += htmlConcat({ name: "显示单位", value });
        } else if (key == "appFun") {
          html1 += htmlConcat({ name: "APP功能", value });
        } else if (key == "appFunVal") {
          html1 += htmlConcat({ name: "其它APP功能", value });
        } else if (key == "keyVal") {
          html2 += htmlConcat({ name: "按键选项", value });
        } else if (key == "clength") {
          html2 += htmlConcat({ name: "仪表到控制器线长", value: value + 'mm' });
        } else if (key == "cable") {
          html2 += htmlConcat({ name: "含头/不含头", value });
        } else if (key == "explain") {
          html2 += htmlConcat({ name: "连接线其它说明", value });
        } else if (key == "plugModel") {
          let { plugModelListValue, plugModelList } = this;
          let ipt = plugModelListValue[plugModelList.indexOf(value)]
          if (!ipt) {
            return Toast.fail("插件型号不能为空");
          }
          if (value == "其它") {
            value = ""
          }
          html2 += htmlConcat({ name: "插件型号及类型", value: value + ipt });
        } else if (key == "coreVal") {
          html2 += htmlConcat({ name: "几芯", value });
        } else if (key == "maleOrFemale") {
          html2 += htmlConcat({ name: "公母", value });
        } else if (value && key == "cableLengh3") {
          html2 += htmlConcat({ name: "仪表到按键（不含头）", value: value + 'mm' });
        } else if (key == "VDD") {
          html3 += htmlConcat({ name: "电源正极线色", value });
        } else if (key == "GND") {
          html3 += htmlConcat({ name: "电源负极线色", value });
        } else if (key == "switchLock") {
          html3 += htmlConcat({ name: "电锁线色", value });
        } else if (key == "meterRx") {
          html3 += htmlConcat({ name: "仪表Rx线色", value });
        } else if (key == "meterTx") {
          html3 += htmlConcat({ name: "仪表Tx线色", value });
        } else if (key === 'img') {
          html3 += `<span style="margin-right: 20px;"><a href=${value} target="_blank" class="text-red">开机LOGO</span>`
        }
      }
      html = `<p>${html1}</p><p>${html2}</p><p>${html3}</p>`
      sampleApply(
        Object.assign(
          {
            demand: html,
            demandObject: JSON.stringify(conForm)
          },
          form
        )
      ).then((res) => {
        let { code } = res;
        if (code == 200) {
          Toast.success("提交成功！");
          this.form = {};
          this.reset();
        }
      });
    },
    reset() {
      this.form = {}
      this.conForm = {
        magnetic: 1,
        sensing: 1,
        permiter: '',
        limitFlow: '',
        power: '',
        clength: '',
        cableLengh1: '',
        cableLengh2: '',
        cableLengh3: '',
        img: '',
        communication: '5s',
        comMethods: 'UART',
        wheel: '12',
        ble: '有蓝牙',
        sensor: '力矩传感器',
        sensorHanderbar: '22.2',
        handerbar: '24V',
        electicRad: '控制器上报电量',
        constantSpeed: '开',
        openPwd: '有',
        menuVal: '有（带密码）',
        asist: '3',
        assistLevel: '0档',
        km: '有',
        speed: '25km/h',
        unit: 'km/h',
        appFun: '有',
        keyVal: 'DTK3',
        connector: '0档',
        cable: '含头',
        coreVal: '5芯',
        maleOrFemale: '公',
        voltageList: [
          { label: "V欠压", value: "" },
          { label: "第1格", value: "" },
          { label: "第2格", value: "" },
          { label: "第3格", value: "" },
          { label: "第4格", value: "" },
          { label: "第5格", value: "" },
        ]
      };
    },
    toggle(index) {
      this.$refs.checkboxes[index].toggle();
    },
    htmlConcat(obj) {
      let { name, value } = obj;
      return `<span style="margin-right: 20px;color:#409EFF"><b style="color:#999">${name}:</b> ${value}</span>`;
    },
    // 获取图片列表
    getSampleImgList() {
      sampleImgList().then(res => {
        this.imgList = res.data
      })
    },
    chooseModelItem(item) {
      this.form.baseModel = item.name
      this.showModel = false
    },
    getConnector(connector) {
      const { cableLengh1, cableLengh2 } = this.conForm
      if(connector === '直连按键') {
        this.srcList1 = [require('@/assets/image/keyLine1.jpg')]
        if(cableLengh1 && cableLengh2) {
          this.conForm.cableLengh1 = null
          this.conForm.cableLengh2 = null
        }
      } else {
        this.conForm.cableLengh3 = null
        this.srcList1 = [require('@/assets/image/keyLine1_1.jpg')]
      }
    },
    getComMethods(comMethods) {
      if(comMethods === 'CAN') {
        this.conForm.communication = 'BAFANG 3.0'  // 默认选择  
        // this.communicationList = ["BAFANG 3.0", "BAFANG 4.6", "BAFANG 6.1", "BAFANG 6.2", "BAFANG 6.3", "其它"]
      } else {
        this.conForm.communication = '5s'
        this.communicationList = ["5s", "2号", "J", "APT", "Tongsh", "BAFANG 4.0", "BAFANG 5.0", "BAFANG 5.8", "其它"]
      }
    },
    onCopy(val) {
      this.$copyText(val).then(
        () => {
          this.warningMessage("复制成功", 1);
        },
        () => {
          this.warningMessage("复制失败", 3);
        }
      );
    }
  }
};
</script>

<style lang="scss">
.cust-style-content {
  .van-field {
    display: flex;
    flex-direction: column;

    >div {
      //   width: 100%;
      // white-space: nowrap;
      // min-width: 6.2em;
      width: auto;
    }
  }

  .van-radio-group {
    width: 100%;
    padding-top: 0.5rem;
    padding-left: 0.5rem;

    .van-radio {
      display: inline-flex;
      padding-right: 1rem;
      padding-bottom: 0.5rem;
      .van-radio__icon--disabled.van-radio__icon--checked .van-icon {
        color: #fff;
        background-color: #1989fa;
        border-color: #1989fa;
      }
    }
  }

  .van-nav-bar {
    background: #1989fa;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 768px;

    .van-nav-bar__title {
      color: #fff;
    }
  }

  .fred {
    .el-input__inner {
      background: red;
      color: #fff;
    }
  }

  .fblue {
    .el-input__inner {
      background: blue;
      color: #fff;
    }
  }

  .fblack {
    .el-input__inner {
      background: black;
      color: #fff;
    }
  }

  .fgreen {
    .el-input__inner {
      background: green;
      color: #fff;
    }
  }
  
  .fyellow {
    .el-input__inner {
      background: yellow;
      color: #606266;
    }
  }

  .fdarkorange {
    .el-input__inner {
      background: darkorange;
      color: #fff;
    }
  }

  .fbrown {
    .el-input__inner {
      background: brown;
      color: #fff;
    }
  }
}

.fix-bt {
  max-width: 768px;
  position: fixed;
  bottom: 0;
  width: 100%;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 100;
}

.van-cell-border {
  position: relative;

  &::before {
    position: absolute;
    box-sizing: border-box;
    content: " ";
    pointer-events: none;
    right: 16px;
    bottom: 0;
    left: 0;

    border-bottom: 1px solid #ebedf0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}

.border-line-row {
  position: relative;

  &::before {
    z-index: 10;
    position: absolute;
    box-sizing: border-box;
    content: " ";
    pointer-events: none;
    right: 16px;
    bottom: 0;
    left: 16px;

    border-bottom: 1px solid #ebedf0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}

.overlay-content {
  padding: 5%;
  display: flex;
  align-items: center;
  justify-content: center;

  >div {
    background: #fff;
    border-radius: 5px;
    max-height: 70vh;
    overflow: scroll;
    width: 100%;
  }
}

.border-none {
  &::after {
    display: none;
  }
}

.model-box {
  width: 300px;
  max-height: 400px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.img-box {
  .upload-img-box {
    flex-direction: column;
  }
}
</style>