<template>
  <div>
    <!-- 非BIST模式 -->
    <div v-if="!eidtBist">
      <el-dialog
        class="instrument_box"
        :title="title"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        :top="dialogTop()"
        :fullscreen="!isPackage"
        append-to-body
        center
      >
        <template v-if="!isPackage">
          <el-form :model="queryParams" ref="queryParams" :inline="true">
            <el-form-item label="所属品类" prop="categoryId">
              <el-select
                v-model="queryParams.categoryId"
                filterable
                allow-create
                clearable
                placeholder="请选择品类"
                style="width: 160px"
                @change="changeCategory(queryParams.categoryId, false)"
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
                v-model="queryParams.computerId"
                :loading="isCLoading"
                filterable
                remote
                clearable
                :disabled="!queryParams.categoryId"
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
              >
                复制
              </el-button>
            </el-form-item>
          </el-form>
          <div class="flex margin-bottom-sm">
            <div class="flex items-center" style="align-items: center">
              <span class="mr5"> 是否配置</span>
              <el-switch
                v-model="form.isSts"
                :active-value="1"
                :inactive-value="0"
                active-color="#13ce66"
                inactive-color="#ff4949"
              >
              </el-switch>
            </div>
            <span style="margin-left: 50px"></span>
            <div class="flex items-center" style="align-items: center">
              <span class="mr5"> BIST型号</span>
              <el-switch
                v-model="form.isBist"
                :active-value="1"
                :inactive-value="0"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="handleBistChange"
              >
              </el-switch>
            </div>
          </div>
          <el-form
            ref="form"
            :rules="formRules"
            :model="form"
            label-width="150px"
          >
            <fieldset>
              <legend class="text-red">基础配置</legend>
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
                </el-col>

                <template v-if="form.id">
                  <el-col :span="6">
                    <el-form-item label="型号" prop="name">
                      <el-input
                        v-model="form.name"
                        placeholder="型号"
                        clearable
                      />
                    </el-form-item>
                  </el-col>

                  <el-col :span="6">
                    <el-form-item label="描述" prop="desc">
                      <el-input
                        v-model="form.desc"
                        clearable
                        placeholder="仪表描述"
                      />
                    </el-form-item>
                  </el-col>

                  <el-col :span="6">
                    <el-form-item label="ERP编码" prop="erp">
                      <el-input
                        v-model="form.erp"
                        placeholder="ERP编码"
                        clearable
                      />
                    </el-form-item>
                  </el-col>
                </template>

                <el-col :span="6">
                  <el-form-item label="SN" prop="instrumentModel.sn">
                    <el-input
                      v-model.trim="form.instrumentModel.sn"
                      clearable
                      placeholder="请输入SN号"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item label="pcbaSn" prop="instrumentModel.pcbaSn">
                    <el-input
                      v-model.trim="form.instrumentModel.pcbaSn"
                      clearable
                      placeholder="请输入pcbaSn"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item
                    label="实际客户车名"
                    prop="instrumentModel.customerCarName"
                  >
                    <el-input
                      v-model="form.instrumentModel.customerCarName"
                      placeholder="请输入实际客户车名"
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
                </el-col>
              </el-row>

              <el-row :gutter="10">
                <el-col :span="24">
                  <el-form-item
                    label="客户料号"
                    prop="instrumentModel.customerMaterialNum"
                  >
                    <tinymce
                      v-model="form.instrumentModel.customerMaterialNum"
                      :height="200"
                      v-if="dialogVisible"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="10">
                <template v-if="form.isSts === 1">
                  <el-col :span="6">
                    <el-form-item
                      label="最高档位"
                      prop="instrumentModel.topGear"
                    >
                      <el-input
                        v-minMaxValue="{ min: 0, max: 255 }"
                        v-model="form.instrumentModel.topGear"
                        oninput="value=value.replace(/^\.+|[^\d.]/g, '')"
                        placeholder="请输入最高档位"
                        clearable
                      />
                    </el-form-item>
                  </el-col>
                  <!-- 限速范围 -->
                  <el-col :span="6">
                    <el-form-item
                      label="限速范围"
                      prop="instrumentModel.speedLimitRang"
                    >
                      <el-input
                        v-model="form.instrumentModel.speedLimitRang"
                        placeholder="请输入限速范围"
                        clearable
                      />
                    </el-form-item>
                  </el-col>

                  <!-- 车把尺寸 -->
                  <el-col :span="6">
                    <el-form-item
                      label="车把尺寸"
                      prop="instrumentModel.handlebarSize"
                    >
                      <el-select
                        v-model="form.instrumentModel.handlebarSize"
                        placeholder="请选择车把尺寸"
                        clearable
                        class="w100"
                      >
                        <el-option
                          v-for="(item, index) in handlebarSizeData"
                          :key="index"
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
                  </el-col>
                </template>
              </el-row>

              <el-row :gutter="10">
                <el-col :span="6" v-if="form.isSts === 1">
                  <el-form-item label="APP" prop="instrumentModel.app">
                    <el-radio-group v-model="form.instrumentModel.app">
                      <div class="flex">
                        <el-radio :label="1">YES</el-radio>
                        <el-radio :label="0">NO</el-radio>
                      </div>
                    </el-radio-group>
                  </el-form-item>
                </el-col>

                <el-col :span="6" v-if="form.isSts === 1">
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

              <fieldset class="margin-top">
                <legend class="text-green">仪表配置区</legend>
                <el-row :gutter="10">
                  <el-col :span="6">
                    <el-form-item
                      label="通讯方式"
                      prop="instrumentModel.serialLevel"
                      :rules="isCheckConfigItem({ message: '通讯方式' })"
                    >
                      <el-select
                        v-model="form.instrumentModel.serialLevel"
                        placeholder="请选择通讯方式"
                        class="w100"
                        clearable
                        @change="clearRateOrType"
                      >
                        <el-option
                          v-for="(item, index) in dicts_communication_type"
                          :key="index"
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
                  </el-col>
                  <el-col :span="6">
                    <el-form-item
                      label="串口波特率"
                      prop="instrumentModel.baudRate"
                      :rules="isCheckConfigItem({ message: '串口波特率' })"
                    >
                      <el-select
                        v-model="form.instrumentModel.baudRate"
                        placeholder="请选择串口波特率"
                        class="w100"
                        clearable
                      >
                        <el-option
                          v-for="(value, key) in baudRateList"
                          :label="value"
                          :value="+value"
                          :key="key"
                        >
                          <span style="float: left">
                            <b>展示值：</b>
                            {{ value }}
                          </span>
                          <span style="float: right">
                            <b>实际值：</b>
                            {{ value }}
                          </span>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item
                      label="通讯协议"
                      prop="instrumentModel.sysProtocol"
                      :rules="isCheckConfigItem({ message: '通讯协议' })"
                    >
                      <el-select
                        v-model="form.instrumentModel.sysProtocol"
                        placeholder="请选择通讯协议"
                        class="w100"
                        clearable
                      >
                        <el-option
                          v-for="item in sysProtocolList"
                          :label="item.dictLabel"
                          :value="+item.dictValue"
                          :key="item.dictValue"
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
                  </el-col>
                  <template v-if="form.instrumentModel.serialLevel === 2">
                    <el-col :span="6">
                      <el-form-item
                        label="帧类型"
                        prop="instrumentModel.msgType"
                        :rules="isCheckConfigItem({ message: '帧类型' })"
                      >
                        <el-select
                          v-model.number="form.instrumentModel.msgType"
                          filterable
                          clearable
                          placeholder="请选择帧类型"
                          class="w100"
                        >
                          <el-option
                            v-for="item in [
                              { dictLabel: '标准帧', dictValue: 0 },
                              { dictLabel: '扩展帧', dictValue: 1 },
                            ]"
                            :label="item.dictLabel"
                            :value="item.dictValue"
                            :key="item.dictValue"
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
                    </el-col>
                    <el-col :span="6">
                      <el-form-item
                        label="CAN波特率"
                        prop="instrumentModel.canRate"
                        :rules="isCheckConfigItem({ message: 'CAN波特率' })"
                      >
                        <el-select
                          v-model="form.instrumentModel.canRate"
                          placeholder="请选择CAN波特率"
                          class="w100"
                          clearable
                        >
                          <el-option
                            v-for="(value, key) in canRateList"
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
                  </template>
                  <el-col :span="6">
                    <el-form-item
                      label="标签规则"
                      prop="instrumentModel.labelRule"
                    >
                      <el-select
                        v-model="form.instrumentModel.labelRule"
                        clearable
                        @change="handleLabelRule"
                        class="w100"
                      >
                        <el-option label="通用" :value="1"></el-option>
                        <el-option label="图片" :value="2"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>

                  <el-col :span="6" v-if="form.instrumentModel.labelRule === 2">
                    <el-form-item
                      label="标签图片"
                      prop="instrumentModel.labelRuleImg"
                      :rules="isCheckConfigItem({ message: '标签图片' })"
                    >
                      <el-upload-sortable
                        v-model="form.instrumentModel.labelRuleImg"
                        :imgW="80"
                        :imgH="80"
                        :isLimit="1"
                        :max="1"
                      />
                    </el-form-item>
                  </el-col>

                  <el-col>
                    <el-form-item
                      label="包装信息"
                      prop="instrumentModel.packagingInfo"
                    >
                      <div
                        style="display: flex; align-items: center; gap: 10px"
                      >
                        <el-button
                          type="primary"
                          size="small"
                          @click="openPackagingInfoEdit"
                        >
                          编辑包装信息
                        </el-button>
                        <el-tag
                          v-if="hasPackagingInfo"
                          type="success"
                          size="small"
                        >
                          已配置
                        </el-tag>
                        <el-tag v-else type="info" size="small">
                          未配置
                        </el-tag>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
              </fieldset>
              <template>
                <fieldset class="margin-top">
                  <legend class="text-green">控制器、按键配置区</legend>
                  <el-row :gutter="10">
                    <el-col :span="6">
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
                            v-for="(item, index) in dicts_controller_joint"
                            :key="index"
                            :label="item.dictValue"
                            :value="item.dictValue"
                          >
                            <span style="float: left">
                              <b>展示值：</b>
                              {{ item.dictValue }}
                            </span>
                            <span style="float: right">
                              <b>实际值：</b>
                              {{ item.dictValue }}
                            </span>
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item
                        label="控制器头"
                        prop="instrumentModel.controlHead"
                      >
                        <el-select
                          v-model.number="form.instrumentModel.controlHead"
                          filterable
                          clearable
                          placeholder="请选择控制器头"
                          class="w100"
                        >
                          <el-option
                            v-for="item in [
                              { dictLabel: '不含头', dictValue: 0 },
                              { dictLabel: '含头', dictValue: 1 },
                            ]"
                            :label="item.dictLabel"
                            :value="item.dictValue"
                            :key="item.dictValue"
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
                    </el-col>
                    <el-col :span="6">
                      <el-form-item
                        label="控制器出线线长(mm)"
                        prop="instrumentModel.notControllerJointString"
                      >
                        <el-input
                          v-model.number="
                            form.instrumentModel.notControllerJointString
                          "
                          placeholder="请输入控制器出线线长"
                          oninput="value=value.replace(/[^\d.]/g, '')"
                          clearable
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item
                        label="按键型号"
                        prop="instrumentModel.keyType"
                      >
                        <el-select
                          v-model="form.instrumentModel.keyType"
                          placeholder="请选择按键型号"
                          clearable
                          class="w100"
                          filterable
                          allow-create
                        >
                          <el-option
                            v-for="(item, index) in dicts_keyType_list"
                            :key="index"
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
                    </el-col>
                    <el-col :span="6">
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
                          <el-option
                            v-for="item in [
                              { dictLabel: '直连', dictValue: 0 },
                              { dictLabel: '快拆', dictValue: 1 },
                            ]"
                            :label="item.dictLabel"
                            :value="item.dictValue"
                            :key="item.dictValue"
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
                    </el-col>
                    <template v-if="form.instrumentModel.keyLinkType === 1">
                      <el-col :span="6">
                        <el-form-item
                          label="按键【仪表端】接头"
                          prop="instrumentModel.modelEndHead"
                        >
                          <el-input
                            v-model="form.instrumentModel.modelEndHead"
                            placeholder="请输入按键【仪表端】接头"
                            clearable
                          />
                        </el-form-item>
                      </el-col>
                      <el-col :span="6">
                        <el-form-item
                          label="按键【按键端】接头"
                          prop="instrumentModel.keyEndHead"
                        >
                          <el-input
                            v-model="form.instrumentModel.keyEndHead"
                            placeholder="请输入按键【按键端】接头"
                            clearable
                          />
                        </el-form-item>
                      </el-col>
                    </template>
                    <el-col :span="6">
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
                  </el-row>
                </fieldset>

                <fieldset class="margin-top">
                  <legend class="text-green">图片配置区</legend>
                  <el-row :gutter="10">
                    <el-col :span="6">
                      <el-form-item
                        label="按键图片"
                        prop="instrumentModel.keyImgUrl"
                      >
                        <el-upload-sortable
                          v-model="form.instrumentModel.keyImgUrl"
                          :imgW="80"
                          :imgH="80"
                          :isLimit="1"
                          :max="1"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item
                        label="开机logo"
                        prop="instrumentModel.powerLogo"
                      >
                        <el-upload-sortable
                          v-model="form.instrumentModel.powerLogo"
                          :imgW="80"
                          :imgH="80"
                          :isLimit="1"
                          :max="1"
                        />
                      </el-form-item>
                    </el-col>

                    <!-- <el-col :span="24">
                    <el-form-item label="产品图纸" prop="instrumentModel.specification">
                      <el-upload-sortable v-model="form.instrumentModel.specification" :imgW="80" :imgH="80"
                        :max="20" />
                    </el-form-item>
                  </el-col> -->
                  </el-row>
                </fieldset>
              </template>
            </fieldset>

            <fieldset class="margin-top" v-if="form.isSts === 1">
              <legend class="text-red">车型配置</legend>
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
                        v-for="(item, index) in sleepTimeList"
                        :key="index"
                        :label="item"
                        :value="item"
                      >
                        <span style="float: left">
                          <b>展示值：</b>
                          {{ item }}
                        </span>
                        <span style="float: right">
                          <b>实际值：</b>
                          {{ item }}
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item
                    label="系统电压(V)"
                    prop="instrumentModel.voltage"
                  >
                    <el-select
                      v-model="form.instrumentModel.voltage"
                      placeholder="请选择系统电压"
                      @change="changeVoltage"
                      class="w100"
                      clearable
                    >
                      <el-option
                        v-for="(item, index) in dicts_voltage"
                        :key="index"
                        :label="item"
                        :value="item"
                      >
                        <span style="float: left">
                          <b>展示值：</b>
                          {{ item }}
                        </span>
                        <span style="float: right">
                          <b>实际值：</b>
                          {{ item }}
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item
                    label="欠压门限(V)"
                    prop="instrumentModel.undervoltage"
                  >
                    <el-input-number
                      class="el-input-number-box w100"
                      v-model.number="form.instrumentModel.undervoltage"
                      :precision="1"
                      :min="0"
                      :controls="false"
                      placeholder="请输入欠压门限"
                      clearable
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
                        v-for="(item, index) in powerGearData"
                        :key="index"
                        :label="item"
                        :value="item"
                      >
                        <span style="float: left">
                          <b>展示值：</b>
                          {{ item }}
                        </span>
                        <span style="float: right">
                          <b>实际值：</b>
                          {{ item }}
                        </span>
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
                        <span style="float: left">
                          <b>展示值：</b>
                          {{ item }}
                        </span>
                        <span style="float: right">
                          <b>实际值：</b>
                          {{ item }}
                        </span>
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
                      v-minMaxValue="{ min: 0 }"
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
                      isCheckConfigItem({
                        message: '限流门限',
                        trigger: 'blur',
                      })
                    "
                  >
                    <el-input
                      type="number"
                      v-minMaxValue="{ min: 0 }"
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
                        <span style="float: left">
                          <b>展示值：</b>
                          {{ item }}
                        </span>
                        <span style="float: right">
                          <b>实际值：</b>
                          {{ item }}
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item
                    label="显示轮径"
                    prop="instrumentModel.showWheelsize"
                    :rules="
                      isCheckConfigItem({
                        message: '显示轮径',
                        trigger: 'blur',
                      })
                    "
                  >
                    <el-input
                      type="number"
                      v-minMaxValue="{ min: 0 }"
                      v-model.number="form.instrumentModel.showWheelsize"
                      oninput="value=value.replace(/[^\d]/g, '')"
                      clearable
                      placeholder="显示轮径"
                    />
                  </el-form-item>

                  <el-form-item
                    label="车轮宽度"
                    prop="instrumentModel.tiresSize"
                    :rules="
                      isCheckConfigItem({
                        message: '车轮宽度',
                        trigger: 'blur',
                      })
                    "
                  >
                    <el-input
                      v-model="form.instrumentModel.tiresSize"
                      v-minMaxValue="{ min: 0 }"
                      oninput="value=value.replace(/[^\d]/g, '')"
                      placeholder="请输入车轮宽度"
                      clearable
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
                        <span style="float: left">
                          <b>展示值：</b>
                          {{ item }}
                        </span>
                        <span style="float: right">
                          <b>实际值：</b>
                          {{ item }}
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item
                    label="配置轮径(inch)"
                    prop="instrumentModel.wheelDiameter"
                    :rules="isCheckConfigItem({ message: '配置轮径' })"
                  >
                    <el-select
                      v-model="form.instrumentModel.wheelDiameter"
                      placeholder="请选择配置轮径"
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
                    label="实际轮径(inch)"
                    prop="instrumentModel.showWheelDiameter"
                    :rules="isCheckConfigItem({ message: '实际轮径' })"
                  >
                    <el-select
                      v-model="form.instrumentModel.showWheelDiameter"
                      placeholder="请选择实际轮径"
                      filterable
                      class="w100"
                      clearable
                    >
                      <el-option
                        v-for="(value, key) in wheelDiameterData"
                        :key="key"
                        :label="value"
                        :value="value"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item
                    label="周长(mm)"
                    prop="instrumentModel.perimeter"
                  >
                    <el-input
                      v-minMaxValue="{ min: 0 }"
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
                    label="配置协议"
                    prop="instrumentModel.agreement"
                    :rules="isCheckConfigItem({ message: '配置协议' })"
                  >
                    <el-select
                      v-model="form.instrumentModel.agreement"
                      placeholder="请选择配置协议"
                      class="w100"
                      clearable
                      @change="onChangeAgreement"
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
                    label="实际协议"
                    prop="instrumentModel.showAgreement"
                    :rules="isCheckConfigItem({ message: '实际协议' })"
                  >
                    <el-select
                      v-model="form.instrumentModel.showAgreement"
                      placeholder="请选择实际协议"
                      class="w100"
                      clearable
                    >
                      <el-option
                        v-for="item in dicts_agreement"
                        :key="item.dictValue"
                        :label="item.dictLabel"
                        :value="item.dictLabel"
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
                        <span style="float: left">
                          <b>展示值：</b>
                          {{ item }}
                        </span>
                        <span style="float: right">
                          <b>实际值：</b>
                          {{ item }}
                        </span>
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
                        <span style="float: left">
                          <b>展示值：</b>
                          {{ item }}
                        </span>
                        <span style="float: right">
                          <b>实际值：</b>
                          {{ item }}
                        </span>
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
                        <span style="float: left">
                          <b>展示值：</b>
                          {{ item }}
                        </span>
                        <span style="float: right">
                          <b>实际值：</b>
                          {{ item }}
                        </span>
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
                    :rules="
                      isCheckConfigItem({ message: '车型', trigger: 'blur' })
                    "
                  >
                    <el-input
                      maxlength="2"
                      v-model="form.instrumentModel.carModel"
                      placeholder="请输入车型"
                      clearable
                    />
                  </el-form-item>

                  <el-form-item
                    label="默认档位"
                    prop="instrumentModel.defaultGear"
                    :rules="
                      isCheckConfigItem({
                        message: '默认档位',
                        trigger: 'blur',
                      })
                    "
                  >
                    <el-input
                      v-minMaxValue="{ min: 0 }"
                      v-model="form.instrumentModel.defaultGear"
                      oninput="value=value.replace(/[^\d.]/g, '')"
                      clearable
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
                    :rules="
                      isCheckConfigItem({
                        message: '开机密码',
                        trigger: 'blur',
                      })
                    "
                  >
                    <el-input
                      type="number"
                      clearable
                      v-minMaxValue="{ min: 0 }"
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
                      clearable
                      type="number"
                      v-minMaxValue="{ min: 0 }"
                      oninput="value=value.replace(/[^\d.]/g, '')"
                      placeholder="请输入高级菜单密码"
                    />
                  </el-form-item>

                  <el-form-item
                    label="电机功率(W)"
                    prop="instrumentModel.motorSys"
                    :rules="
                      isCheckConfigItem({
                        message: '电机功率',
                        trigger: 'blur',
                      })
                    "
                  >
                    <el-input
                      type="number"
                      v-minMaxValue="{ min: 0 }"
                      v-model="form.instrumentModel.motorSys"
                      oninput="value=value.replace(/[^\d.]/g, '')"
                      clearable
                      placeholder="请输入电机功率"
                    />
                  </el-form-item>

                  <el-form-item
                    label="电池容量"
                    prop="instrumentModel.batteryCap"
                    :rules="
                      isCheckConfigItem({
                        message: '电池容量',
                        trigger: 'blur',
                      })
                    "
                  >
                    <el-input
                      type="number"
                      v-minMaxValue="{ min: 0 }"
                      v-model="form.instrumentModel.batteryCap"
                      oninput="value=value.replace(/[^\d.]/g, '')"
                      clearable
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
                      v-minMaxValue="{ min: 0 }"
                      oninput="value=value.replace(/[^\d.]/g, '')"
                      placeholder="请输入高速蜂鸣器提醒"
                      clearable
                    />
                  </el-form-item>

                  <el-form-item
                    label="串口通讯电平"
                    prop="instrumentModel.serialLevelLog"
                    :rules="isCheckConfigItem({ message: '串口通讯电平' })"
                  >
                    <el-select
                      v-model="form.instrumentModel.serialLevelLog"
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
                        <span style="float: left">
                          <b>展示值：</b>
                          {{ item }}
                        </span>
                        <span style="float: right">
                          <b>实际值：</b>
                          {{ item }}
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="6">
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
                    label="有无高级菜单"
                    prop="instrumentModel.isHighMenuPassword"
                    :rules="isCheckConfigItem({ message: '高级菜单' })"
                  >
                    <el-radio-group
                      v-model="form.instrumentModel.isHighMenuPassword"
                    >
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
        </template>
        <template v-else>
          <el-form
            ref="form"
            :rules="formRules"
            :model="form"
            label-width="150px"
          >
            <div
              style="
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 20px;
              "
            >
              <el-button
                type="primary"
                size="small"
                @click="openPackagingInfoEdit"
              >
                编辑包装信息
              </el-button>
              <el-tag v-if="hasPackagingInfo" type="success" size="small">
                已配置
              </el-tag>
              <el-tag v-else type="info" size="small"> 未配置 </el-tag>
            </div>
          </el-form>
        </template>
        <div
          slot="footer"
          class="dialog-footer flex justify-center"
          :class="{ 'product-btn-box': !isPackage }"
        >
          <div>
            <el-button
              v-if="form.id && !isCopyProduct"
              type="primary"
              @click="submitForm('form')"
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
          ref="finalForm"
          :model="form"
          label-width="150px"
          @submit.native.prevent
        >
          <el-form-item
            label="仪表型号:"
            prop="name"
            :rules="isCheckConfigItem({ message: '仪表型号', trigger: 'blur' })"
          >
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
            @click="submitForm('finalForm')"
          >
            确 定
          </el-button>
          <el-button @click="onResetForm">取 消</el-button>
        </div>
      </el-dialog>

      <!-- 包装信息编辑弹窗 -->
      <PackagingInfoEdit
        :visible.sync="packagingInfoEditVisible"
        :packagingInfo="currentPackagingInfo"
        @save="handlePackagingInfoSave"
      />
    </div>
    <div v-else>
      <el-dialog
        :title="form.isBist === 1 ? '关联大货型号' : '关联BIST型号'"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        width="600px"
        append-to-body
        center
        top='0vh'
      >
               <el-form
            ref="form"
            :rules="formRules"
            :model="form"
            label-width="150px"
            
          >
          <div class="bist-edit-container">
            <!-- BIST型号开关 -->
            <div class="bist-form-item">
              <label class="bist-label">型号: </label>
                    <label class="bist-label">{{ form.name }} </label>

            </div>

            <!-- 关联型号选择 -->
            <div class="bist-form-item">
              <label class="bist-label">{{ form.isBist === 1 ? '大货型号' : 'BIST型号' }}:</label>
              <el-select
                ref="relatedModelSelect"
                :key="`related-select-${form.isBist}`"
                v-model="form.instrumentModel.relatedModelIdList"
                :placeholder="
                  form.isBist === 1
                    ? '请选择关联的大货型号'
                    : '请选择关联的BIST的型号'
                "
                :multiple="form.isBist === 1"
                filterable
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in bistOptions"
                  :key="item.id"
                  :disabled="
                    item.isBind == 1 &&
                    !editRelatedModelIdList.includes(item.id) &&
                    item.id != form.instrumentModel.id
                  "
                  :label="item.computerName"
                  :value="item.id"
                >
                </el-option>
              </el-select>
            </div>

            <!-- 提示信息 -->
            <div class="bist-tip" v-if='form.isBist === 1'>
              <i class="el-icon-info"></i>
              <span>{{
                form.isBist === 1
                  ? "多选模式：可选择多个关联型号"
                  : "单选模式：只能选择一个关联型号"
              }}</span>
            </div>
          </div>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" @click="dialogVisible = false"
            >取 消</el-button
          >
          <el-button 
            type="primary" 
            size="small" 
            :loading="isSubmitLoading"
            @click="submitForm('form')"
          >
            保 存
          </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  addComputer,
  editComputer,
  detailComputer,
  getModelSimpleList,
} from "@/api/third/computer";
import { typeCategory } from "@/api/third/category";
import { getCustomerList } from "@/api/order";
import mixin from "./export";
import commonData from "@/mixins/commonData";
import ElUploadSortable from "@/components/el-upload-sortable";
import tinymce from "@/views/components/Editor";
import PackagingInfoEdit from "@/views/configOverView/components/packagingInfoEdit.vue";
import { add } from "lodash";
export default {
  mixins: [mixin, commonData],
  props: {
    isPackage: {
      type: Boolean,
      default: false,
    },
    eidtBist: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    // 背光亮度
    const validateBacklightBrightness = (rule, value, callback) => {
      if (this.Is_Empty(value)) {
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
      if (this.Is_Empty(value)) {
        callback(new Error("休眠时间不能为空"));
      } else if (!Number.isInteger(+value)) {
        callback(new Error("请输入数字值"));
      } else if (+value < 0) {
        callback("休眠时间不能小于0");
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
      if (this.Is_Empty(value)) {
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
      if (this.Is_Empty(value)) {
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
      isEditCopy: false,
      modelList: [],
      selectList: [],
      queryParams: {
        categoryId: "",
        computerId: "",
      },
      dialogVisible: false,
      open: false,
      // 表单参数
      form: {
        isSts: 1,
        isBist: 0,
        name: null,
        instrumentModel: {
          relatedModelIdList: [],
        },
      },
      title: "",
      disabled: false,
      // 包装信息编辑弹窗
      packagingInfoEditVisible: false,
      currentPackagingInfo: null,
      serialLevelLogData: {
        0: "3.3V",
        1: "5V",
      },
      // 表单校验
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
      // 按键型号
      dicts_keyType_list: [],
      // 车把尺寸
      handlebarSizeData: [],
      // 通讯协议
      sysProtocolList: [],
      // 关联型号选项
      bistOptions: [],
      // 标志位：是否正在加载编辑数据，防止watch清空数据
      isLoadingDetail: false,
      editRelatedModelIdList: [],
    };
  },
  computed: {
    isCheckConfigItem() {
      return ({ required = true, message = "", trigger = "change" } = {}) => {
        return { required, message: `${message}不能为空`, trigger };
      };
    },
    // 判断是否已配置包装信息
    hasPackagingInfo() {
      const packagingInfo = this.form.instrumentModel?.packagingInfo;
      if (!packagingInfo) return false;

      // 如果是字符串，尝试解析
      if (typeof packagingInfo === "string") {
        try {
          const parsed = JSON.parse(packagingInfo);
          // 检查是否有实质内容（非空对象/数组）
          if (Array.isArray(parsed)) {
            return parsed.length > 0;
          }
          return Object.keys(parsed).length > 0;
        } catch (e) {
          return false;
        }
      }

      // 如果是对象或数组
      if (Array.isArray(packagingInfo)) {
        return packagingInfo.length > 0;
      }
      if (typeof packagingInfo === "object") {
        return Object.keys(packagingInfo).length > 0;
      }

      return false;
    },
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.isEditCopy = false;
        this.resetForm("queryParams");
        this.resetForm("form");
        // 确保 instrumentModel.relatedModelIdList 初始化
        if (!this.form.instrumentModel) {
          this.$set(this.form, "instrumentModel", {});
        }
        if (
          !this.form.instrumentModel.hasOwnProperty("relatedModelIdList") ||
          this.form.instrumentModel.relatedModelIdList === undefined ||
          this.form.instrumentModel.relatedModelIdList === null
        ) {
          this.$set(this.form.instrumentModel, "relatedModelIdList", []);
        }
        this.getList();
      }
    },
    "form.isBist"(val) {
      // 初始化确保 instrumentModel.relatedModelIdList 存在
      if (!this.form.instrumentModel) {
        this.$set(this.form, "instrumentModel", {});
      }
      if (
        !this.form.instrumentModel.hasOwnProperty("relatedModelIdList") ||
        this.form.instrumentModel.relatedModelIdList === undefined ||
        this.form.instrumentModel.relatedModelIdList === null
      ) {
        this.$set(
          this.form.instrumentModel,
          "relatedModelIdList",
          val === 1 ? [] : null
        );
      }

      const value = this.form.instrumentModel.relatedModelIdList;
      // 编辑详情加载期间只做类型矫正
      if (this.isLoadingDetail) {
        if (val === 1 && !Array.isArray(value)) {
          this.form.instrumentModel.relatedModelIdList = value ? [value] : [];
        }
        if (val !== 1 && Array.isArray(value)) {
          this.form.instrumentModel.relatedModelIdList =
            value.length > 0 ? value[0] : null;
        }
        return;
      }

      if (val === 1) {
        // 多选：确保是数组
        if (!Array.isArray(value)) {
          this.form.instrumentModel.relatedModelIdList = value ? [value] : [];
        }
      } else {
        // 单选：使用基础类型并清空
        if (Array.isArray(value)) {
          this.form.instrumentModel.relatedModelIdList =
            value.length > 0 ? value[0] : null;
        } else {
          this.form.instrumentModel.relatedModelIdList = null;
        }
      }
    },
    "form.instrumentModel.labelRuleImg"(labelRuleImg) {
      if (labelRuleImg) {
        this.clearValidateItem("form", "instrumentModel.labelRuleImg");
      }
    },
  },
  created() {
    this.echoWheelDiameter();
    this.getOptions();
  },
  methods: {
    getList() {
      typeCategory().then((res) => {
        this.modelList = res.data;
      });
    },
    /** BIST开关变化处理 */
    handleBistChange(val) {
      // 初始化确保 instrumentModel.relatedModelIdList 存在
      if (!this.form.instrumentModel) {
        this.$set(this.form, "instrumentModel", {});
      }

      const emptyValue = val === 1 ? [] : null;
      this.editRelatedModelIdList = [];
      this.$set(this.form.instrumentModel, "relatedModelIdList", emptyValue);

      this.$nextTick(() => {
        if (
          this.$refs.relatedModelSelect &&
          typeof this.$refs.relatedModelSelect.clear === "function"
        ) {
          this.$refs.relatedModelSelect.clear();
        }
      });

      // 重新加载关联型号列表
      this.bistOptions = [];
      this.loadBistOptions();
    },
    /** 加载关联型号列表 */
    loadBistOptions() {
      const isBist = this.form.isBist == 1 ? 0 : 1;
      const categoryId = this.form.categoryId;
      // 如果isBist未设置，不加载
      if (isBist === undefined || isBist === null) {
        this.bistOptions = [];
        return Promise.resolve();
      }
      return getModelSimpleList(isBist,categoryId)
        .then((res) => {
          if (res.code === 200 && res.data) {
            this.bistOptions = res.data;
          } else {
            this.bistOptions = [];
          }
          return Promise.resolve();
        })
        .catch((error) => {
          console.error("加载关联型号列表失败:", error);
          this.bistOptions = [];
          return Promise.resolve();
        });
    },
    addBistOptions() {
      this.loadBistOptions();
      this.editRelatedModelIdList = [];
    },
    async viewBistOptions() {
      await this.loadBistOptions();
      this.editRelatedModelIdList =
        this.form.instrumentModel.relatedModelList.map((item) => item.id) || [];

      if (this.form.isBist == 1) {
        this.form.instrumentModel.relatedModelIdList =
          this.editRelatedModelIdList;
      } else {
        this.form.instrumentModel.relatedModelIdList =
          this.editRelatedModelIdList[0];
      }
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
      const { agreement } = this.form.instrumentModel;

      if (type !== 2) {
        this.form.instrumentModel.msgType = "";
        this.form.instrumentModel.canRate = "";

        if (agreement === 2) {
          // 八方
          this.form.instrumentModel.baudRate = 1200;
        }
      } else {
        this.form.instrumentModel.baudRate = 115200;

        if (agreement !== "") {
          this.form.instrumentModel.msgType = 1;
          this.form.instrumentModel.canRate = 4;

          if (agreement === 7) {
            // 天腾
            this.form.instrumentModel.msgType = 0;
          }
          if (agreement === 4) {
            // 高标
            this.form.instrumentModel.canRate = 7;
          }
        }
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
      // 车把尺寸
      this.getDicts("handleBar_size").then((res) => {
        this.handlebarSizeData = res.data;
      });
      // 通讯协议
      this.getDicts("sys_protocol").then((res) => {
        this.sysProtocolList = res.data;
      });
    },
    //查看同配详情
    getDetail(row) {
      // 设置加载标志，防止watch清空数据
      this.isLoadingDetail = true;
      detailComputer(row.computerId)
        .then((res) => {
          let { data } = res;
          // 保存顶层数据中的name，用于后续构建选项名称
          const topLevelName = data.name;
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

          // 保存原始的关联型号ID列表和完整数据，稍后处理
          // 后端可能返回 relatedModelList（数组）或 relatedModel（单个ID）或 relatedModelIdList
          let originalRelatedModelIdList = [];
          let savedRelatedModelList = []; // 保存完整的 relatedModelList，用于手动添加到下拉列表

          console.log("🔍 开始处理关联型号数据:", {
            hasInstrumentModel: !!data.instrumentModel,
            relatedModelList: data.instrumentModel?.relatedModelList,
            relatedModel: data.instrumentModel?.relatedModel,
            relatedModelIdList: data.instrumentModel?.relatedModelIdList,
          });

          if (data.instrumentModel) {
            // 保存完整的 relatedModelList，用于手动添加到下拉列表
            if (
              data.instrumentModel.relatedModelList &&
              Array.isArray(data.instrumentModel.relatedModelList)
            ) {
              savedRelatedModelList = [
                ...data.instrumentModel.relatedModelList,
              ];
              console.log("🔍 保存的 relatedModelList:", savedRelatedModelList);

              // 优先从 relatedModelList 中提取 computerId（因为API返回的id就是computerId）
              originalRelatedModelIdList = data.instrumentModel.relatedModelList
                .map((item) => {
                  // relatedModelList中的对象有computerId字段，这是我们需要匹配的ID
                  const computerId = item.computerId || item.id || null;
                  console.log("🔍 提取 computerId:", { item, computerId });
                  return computerId;
                })
                .filter((id) => id);

              console.log(
                "🔍 提取的 computerId 列表:",
                originalRelatedModelIdList
              );
            }
            // 如果有 relatedModel（单个ID）且上面没有数据，需要找到对应的computerId
            if (
              !originalRelatedModelIdList ||
              originalRelatedModelIdList.length === 0
            ) {
              if (data.instrumentModel.relatedModel) {
                // 如果有relatedModelList，尝试从其中找到对应的computerId
                if (
                  data.instrumentModel.relatedModelList &&
                  Array.isArray(data.instrumentModel.relatedModelList)
                ) {
                  const matchedItem =
                    data.instrumentModel.relatedModelList.find(
                      (item) =>
                        item.id === data.instrumentModel.relatedModel ||
                        item.computerId === data.instrumentModel.relatedModel
                    );
                  if (matchedItem && matchedItem.computerId) {
                    originalRelatedModelIdList = [matchedItem.computerId];
                  } else {
                    // 如果找不到，直接使用relatedModel的值（可能是computerId）
                    originalRelatedModelIdList = [
                      data.instrumentModel.relatedModel,
                    ];
                  }
                } else {
                  // 没有relatedModelList，直接使用relatedModel的值
                  originalRelatedModelIdList = [
                    data.instrumentModel.relatedModel,
                  ];
                }
              }
            }
            // 如果直接有 relatedModelIdList
            else if (
              data.instrumentModel.relatedModelIdList !== undefined &&
              data.instrumentModel.relatedModelIdList !== null
            ) {
              originalRelatedModelIdList = Array.isArray(
                data.instrumentModel.relatedModelIdList
              )
                ? data.instrumentModel.relatedModelIdList
                : [data.instrumentModel.relatedModelIdList];
            }

            // 临时删除这些字段，避免watch触发时清空数据
            delete data.instrumentModel.relatedModelList;
            delete data.instrumentModel.relatedModel;
            delete data.instrumentModel.relatedModelIdList;
          } else if (
            data.relatedModelIdList !== undefined &&
            data.relatedModelIdList !== null
          ) {
            originalRelatedModelIdList = Array.isArray(data.relatedModelIdList)
              ? data.relatedModelIdList
              : [data.relatedModelIdList];
            delete data.relatedModelIdList;
          }

          let val = Object.assign(this.form, data);
          // 确保 instrumentModel 存在
          if (!val.instrumentModel) {
            val.instrumentModel = {};
          }
          // 确保 instrumentModel.relatedModelIdList 属性存在
          if (!val.instrumentModel.hasOwnProperty("relatedModelIdList")) {
            val.instrumentModel.relatedModelIdList = [];
          }
          this.$set(this, "form", val);

          // 先加载关联型号列表选项
          this.loadBistOptions().then(() => {
            console.log("🔍 加载选项列表后:", {
              bistOptions: this.bistOptions,
              savedRelatedModelList: savedRelatedModelList,
              originalRelatedModelIdList: originalRelatedModelIdList,
            });

            // 选项加载完成后，手动将已关联的型号添加到下拉列表中（因为API会过滤掉已关联的型号）
            if (savedRelatedModelList && savedRelatedModelList.length > 0) {
              const newOptions = [];
              const computerIdPromises = [];

              savedRelatedModelList.forEach((item) => {
                const computerId = item.computerId || item.id;
                console.log("🔍 处理关联型号:", { item, computerId });

                if (computerId) {
                  // 检查是否已经在选项列表中
                  const exists = this.bistOptions.some((opt) => {
                    return (
                      String(opt.id) === String(computerId) ||
                      opt.id == computerId
                    );
                  });

                  console.log("🔍 检查是否存在:", {
                    computerId,
                    exists,
                    currentOptions: this.bistOptions,
                  });

                  // 如果不存在，手动添加到选项列表
                  if (!exists) {
                    // 构建选项对象，格式：{ id: computerId, computerName: ... }
                    // 先使用临时名称，然后尝试通过API获取真实名称
                    let computerName = item.computerName || null;

                    // 如果没有computerName，尝试从item的其他字段获取
                    if (!computerName) {
                      // 如果有sn，使用sn作为显示（临时显示）
                      if (item.sn) {
                        computerName = item.sn;
                      }
                      // 如果有customerMaterialNum，使用料号
                      else if (item.customerMaterialNum) {
                        computerName = `料号: ${item.customerMaterialNum}`;
                      }
                      // 使用computerId的前8位作为显示
                      else {
                        computerName = `型号ID: ${String(computerId).substring(
                          0,
                          8
                        )}...`;
                      }
                    }

                    const optionItem = {
                      id: computerId,
                      computerName: computerName,
                    };
                    console.log("🔍 添加选项到列表:", optionItem);
                    newOptions.push(optionItem);

                    // 尝试通过API获取真实的名称（异步，不阻塞）
                    if (!item.computerName) {
                      detailComputer(computerId)
                        .then((res) => {
                          if (res.code === 200 && res.data && res.data.name) {
                            // 更新选项中的名称
                            const option = this.bistOptions.find(
                              (opt) => String(opt.id) === String(computerId)
                            );
                            if (option) {
                              option.computerName = res.data.name;
                              this.$forceUpdate(); // 强制更新视图
                            }
                          }
                        })
                        .catch(() => {
                          // 如果获取失败，保持原有显示名称
                        });
                    }
                  }
                }
              });

              // 批量添加到选项列表，确保响应式更新
              if (newOptions.length > 0) {
                this.bistOptions = [...this.bistOptions, ...newOptions];
                console.log("🔍 添加完关联型号后的选项列表:", this.bistOptions);
              }
            }

            // 选项加载完成后，再设置 relatedModelIdList
            this.$nextTick(() => {
              // 处理 relatedModelIdList，确保格式和类型正确
              let relatedModelIdList = [];
              if (
                originalRelatedModelIdList !== undefined &&
                originalRelatedModelIdList !== null &&
                originalRelatedModelIdList.length > 0
              ) {
                // 确保是数组格式
                if (!Array.isArray(originalRelatedModelIdList)) {
                  relatedModelIdList = [originalRelatedModelIdList];
                } else {
                  relatedModelIdList = [...originalRelatedModelIdList];
                }

                console.log("🔍 处理选中值:", {
                  originalRelatedModelIdList,
                  relatedModelIdList,
                  bistOptions: this.bistOptions,
                });

                // 确保数据类型与选项的value类型一致
                relatedModelIdList = relatedModelIdList.map((id) => {
                  // 查找匹配的选项以确保类型一致
                  const option = this.bistOptions.find((opt) => {
                    const optId = String(opt.id);
                    const compareId = String(id);
                    return optId === compareId || opt.id == id;
                  });
                  console.log("🔍 匹配选项:", {
                    id,
                    idType: typeof id,
                    option,
                    found: !!option,
                    allOptionIds: this.bistOptions.map((o) => ({
                      id: o.id,
                      type: typeof o.id,
                    })),
                  });
                  // 如果找到选项，使用选项的id（确保类型一致）
                  if (option) {
                    return option.id;
                  }
                  // 如果没找到，保持原值（但确保是字符串，因为el-select的value需要一致的类型）
                  // 注意：选项的id可能是字符串或数字，需要保持一致
                  return id;
                });

                console.log("🔍 最终选中的值:", relatedModelIdList);

                // 不过滤，因为我们已经手动添加了已关联的型号到选项列表
              }

              // 设置处理后的 relatedModelIdList 到 instrumentModel 中
              console.log("🔍 设置选中值到表单:", relatedModelIdList);
              this.$set(
                this.form.instrumentModel,
                "relatedModelIdList",
                relatedModelIdList
              );

              // 数据加载完成，清除标志
              this.isLoadingDetail = false;
            });
          });
        })
        .catch(() => {
          this.isLoadingDetail = false;
        });
    },
    // 表单重置
    reset() {
      this.disabled = false;
      this.resetForm("form");
      this.form = {
        isSts: 1,
        isBist: 0,
        categoryId: null,
        desc: null,
        erp: null,
        name: null,
        sn: "",
        pcbaSn: "",
        instrumentModel: {
          relatedModelIdList: [],
          packagingInfo: "",
          showWheelDiameter: null,
          showAgreement: null,
          isHighMenuPassword: null,
          labelRule: null,
          labelRuleImg: null,
          sn: null,
          pcbaSn: null,
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
          serialLevelLog: 1,
          msgType: 1,
          canRate: 4,
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
          logo: "0",
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
          sysProtocol: null,
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
        }
      });
    },
    onResetForm() {
      this.open = false;
    },
    // 根据协议来自动切换仪表波特率   八方（UART） ---> 1200
    onChangeAgreement(agreement) {
      this.form.instrumentModel.msgType = 1;
      this.form.instrumentModel.canRate = 4;
      const { serialLevel } = this.form.instrumentModel;

      if (agreement === 2 && serialLevel !== 2) {
        // 八方
        this.form.instrumentModel.baudRate = 1200;
      }
      if (agreement === 7) {
        // 天腾
        this.form.instrumentModel.msgType = 0;
      }
      if (agreement === 4) {
        // 高标
        this.form.instrumentModel.canRate = 7;
      }
    },
    async handleCopy() {
      const { computerId } = this.queryParams;

      try {
        const { data } = await detailComputer(computerId);
        data.instrumentModel = data.instrumentModel ?? {};
        // 确保 instrumentModel.relatedModelIdList 存在（可能来自顶层或 instrumentModel）
        if (
          data.instrumentModel.relatedModelIdList === undefined ||
          data.instrumentModel.relatedModelIdList === null
        ) {
          // 如果顶层有，移动到 instrumentModel
          if (
            data.relatedModelIdList !== undefined &&
            data.relatedModelIdList !== null
          ) {
            data.instrumentModel.relatedModelIdList = data.relatedModelIdList;
            delete data.relatedModelIdList;
          } else {
            data.instrumentModel.relatedModelIdList = [];
          }
        }
        this.msgSuccess("操作成功");
        // 编辑拷贝
        if (this.form.id) {
          this.isEditCopy = true;
          const { id, categoryId, name, instrumentModel } = this.form;

          const copyData = Object.assign({}, data);
          copyData.id = id;
          copyData.categoryId = categoryId;
          copyData.name = name;
          copyData.instrumentModel.id = instrumentModel?.id;
          copyData.instrumentModel.categoryId = instrumentModel?.categoryId;
          copyData.instrumentModel.computerId = instrumentModel?.computerId;
          // 确保 instrumentModel.relatedModelIdList 存在
          if (
            !copyData.instrumentModel.relatedModelIdList ||
            !Array.isArray(copyData.instrumentModel.relatedModelIdList)
          ) {
            copyData.instrumentModel.relatedModelIdList = [];
          }

          this.form = copyData;
        } else {
          // 新增拷贝
          // 确保 instrumentModel.relatedModelIdList 存在
          if (
            !data.instrumentModel.relatedModelIdList ||
            !Array.isArray(data.instrumentModel.relatedModelIdList)
          ) {
            data.instrumentModel.relatedModelIdList = [];
          }
          this.form = Object.assign({}, data);
        }
      } catch (error) {
        this.msgError("操作失败");
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
        serialLevelLog,
      } = this.form.instrumentModel;

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
        serialLevel: Number(serialLevelLog),
      };

      const data = {
        instrumentModel,
      };
      return JSON.stringify(data);
    },
    /** 提交按钮 */
    submitForm(forName) {
      this.$refs[forName].validate((valid) => {
        if (valid) {
          if (!this.isEditCopy) {
            this.isSubmitLoading = true;
          }

          // 非STS
          if (this.form.isSts === 0) {
            // 非STS模式：移除STS专有字段（黑名单方式更安全，避免遗漏字段）
            // 只删除纯STS的配置字段，保留所有可能用到的字段
            const stsOnlyFields = [
              // 车型配置区的STS专有字段（在 v-if="form.isSts === 1" 内）
              "backlightBrightness",
              "sleepTime",
              "voltage",
              "undervoltage",
              "powerGear",
              "assistStartMagnetNumber",
              "assistPercentage",
              "currentlimiting",
              "assistLimit",
              "showWheelsize",
              "slowStart",
              "wheelDiameter",
              "showWheelDiameter",
              "perimeter",
              "unit",
              "agreement",
              "showAgreement",
              "power",
              "speedSteel",
              "batteryVoltageChangeTime",
              "smoothLevel",
              "allLineErrTimeOut",
              "ebikeName",
              "carModel",
              "defaultGear",
              "logo",
              "startupPasswd",
              "highMenuPasswd",
              "menuPasswd",
              "motorSys",
              "batteryCap",
              "highSpeedBuzzerRemind",
              "tiresSize",
              "bluetooth",
              "driveAssist",
              "factoryReset",
              "rotateHandle",
              "buzzerSwitch",
              "cruise",
              "turnOnPasswd",
              "menuPassword",
              "isHighMenuPassword",
              "rotateHandleSpeedLimit",
              "assist",
              "serialLevelLog",
              // 基础配置区的STS专有字段
              "topGear",
              "speedLimitRang",
              "app",
              "usb",
              "communicateType",
              "maxGear",
              "speedLimit",
              "shutdownTime",
              "assistSpeedLimitThreshold",
              "busOvertime",
            ];

            // 删除STS专有字段，保留其他所有字段
            stsOnlyFields.forEach((field) => {
              delete this.form.instrumentModel[field];
            });

            this.form.jsonStr = "";
          } else {
            // STS
            const configJsonString = this.configToJsonString();
            this.form.jsonStr = configJsonString;
            console.log("🚀 ~ file: updates.vue:2419 ~  this.form:", this.form);
          }

          // 格式化 instrumentModel.relatedModelIdList，确保始终是字符串数组
          if (!this.form.instrumentModel) {
            this.$set(this.form, "instrumentModel", {});
          }
          if (
            !this.form.instrumentModel.hasOwnProperty("relatedModelIdList") ||
            this.form.instrumentModel.relatedModelIdList === undefined ||
            this.form.instrumentModel.relatedModelIdList === null
          ) {
            this.form.instrumentModel.relatedModelIdList = [];
          } else if (
            !Array.isArray(this.form.instrumentModel.relatedModelIdList)
          ) {
            // 如果不是数组，转换为数组
            this.form.instrumentModel.relatedModelIdList = [
              this.form.instrumentModel.relatedModelIdList,
            ];
          }
          // 确保数组中的每个元素都是字符串，并过滤掉无效值
          this.form.instrumentModel.relatedModelIdList =
            this.form.instrumentModel.relatedModelIdList
              .map((id) => String(id))
              .filter((id) => id !== "undefined" && id !== "null" && id !== "");

          // 包装信息已经通过编辑弹窗保存到 form.instrumentModel.packagingInfo 中
          console.log(this.form);
          if (this.form.id && !this.isCopyProduct) {
            this.handleSubmitEdit();
          } else {
            this.handleSubmitAdd();
          }
        }
      });
    },
    // 新增操作
    handleSubmitAdd() {
      if (this.isCopyProduct) {
        delete this.form.id;
        delete this.form.instrumentModel.id;
      }
      addComputer(this.form)
        .then((response) => {
          if (response.code === 200) {
            this.msgSuccess("添加成功");
            this.dialogVisible = false;
            this.$emit("refresh-list");
            this.open = false;
          }
        })
        .finally(() => {
          this.isSubmitLoading = false;
        });
    },
    // 编辑操作
    handleSubmitEdit() {
      if (this.isEditCopy) {
        this.$confirm("是否确认提交当前拷贝项?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            this.isSubmitLoading = true;
            editComputer(this.form)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("拷贝成功");
                  this.dialogVisible = false;
                  this.$emit("refresh-list");
                }
              })
              .finally(() => {
                this.isSubmitLoading = false;
              });
          })
          .catch(() => {});
      } else {
        editComputer(this.form)
          .then((response) => {
            if (response.code === 200) {
              this.msgSuccess("修改成功");
              this.dialogVisible = false;
              this.$emit("refresh-list");
            }
          })
          .finally(() => {
            this.isSubmitLoading = false;
          });
      }
    },
    // 标签规则
    handleLabelRule(labelRule) {
      // 选择通用或清空标签规则时，清空图片字段
      if (labelRule === 1 || !labelRule) {
        this.form.instrumentModel.labelRuleImg = "";
      }
    },
    // 打开包装信息编辑弹窗
    openPackagingInfoEdit() {
      // 取当前表单中的包装信息数据
      this.currentPackagingInfo =
        this.form.instrumentModel.packagingInfo || null;
      this.packagingInfoEditVisible = true;
    },
    // 保存包装信息
    handlePackagingInfoSave(newFormatData) {
      try {
        // 确保 instrumentModel 存在
        if (!this.form.instrumentModel) {
          this.form.instrumentModel = {};
        }

        // 将新格式数据序列化为字符串并保存到表单
        const packagingInfoStr = JSON.stringify(newFormatData || {});
        this.form.instrumentModel.packagingInfo = packagingInfoStr;

        this.packagingInfoEditVisible = false;
        this.$message.success("包装信息已更新");
      } catch (e) {
        console.error("保存包装信息失败:", e);
        this.$message.error("保存包装信息失败");
      }
    },
  },
  components: {
    ElUploadSortable,
    tinymce,
    PackagingInfoEdit,
  },
};
</script>

<style lang="scss" scoped>
.dispaly {
  display: none;
}

.form-data-in {
  .el-input-number .el-input__inner {
    text-align: left;
  }
}

.posi-left {
  position: relative;
  right: -253px;
}

.el-input-number-box {
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

.product-btn-box {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 30px;
}

/deep/ input[aria-hidden="true"] {
  display: none !important;
}

/deep/.el-radio:focus:not(.is-focus):not(:active):not(.is-disabled)
  .el-radio__inner {
  box-shadow: none !important;
}

/* BIST关联型号弹窗样式 */
.bist-edit-container {
  padding: 20px 0;
}

.bist-form-item {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.bist-label {
  width: 100px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  flex-shrink: 0;
}

.bist-tip {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f4f4f5;
  border-radius: 4px;
  font-size: 13px;
  color: #909399;
  margin-top: 10px;
}

.bist-tip i {
  margin-right: 8px;
  font-size: 16px;
  color: #409eff;
}
</style>
