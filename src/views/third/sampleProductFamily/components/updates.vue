<template>
  <div>
    <el-dialog class="instrument_box" :title="title" :visible.sync="dialogVisible" :close-on-click-modal="false"
      :top="dialogTop()" fullscreen append-to-body center>
      <el-form :model="queryParams" ref="queryParams" :inline="true">
        <el-form-item label="所属品类" prop="categoryId">
          <el-select v-model="queryParams.categoryId" filterable allow-create clearable placeholder="请选择品类"
            style="width: 160px" @change="changeCategory(queryParams.categoryId, false)">
            <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="仪表型号" prop="computerId">
          <el-select v-model="queryParams.computerId" :loading="isCLoading" filterable remote clearable
            :disabled="!queryParams.categoryId" placeholder="请选择仪表型号" :remote-method="getComputerNameList"
            style="width: 160px">
            <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.model" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :disabled="!queryParams.computerId" @click="handleCopy">
            复制
          </el-button>
        </el-form-item>

        <div style="width:100%"></div>
        <CopyBtn @config="handleCopy2" />
      </el-form>
      <div class="flex  alince-center margin-bottom-sm" style="align-items: center;">
        <el-switch v-model="form.isSts" :active-value="1" :inactive-value="0" active-color="#13ce66"
          inactive-color="#ff4949" active-text="STS" inactive-text="非STS" @change="handleStsChange">
        </el-switch>
      </div>

      <el-form ref="form" :rules="formRules" :model="form" label-width="150px">
        <fieldset>
          <legend class="text-red">基础配置</legend>
          <el-row :gutter="10">
            <el-col :span="6">
              <el-form-item label="产品品类" prop="categoryId" :rules="[
                {
                  required: true,
                  message: '请选择产品品类',
                  trigger: 'blur',
                },
              ]">
                <el-select v-model="form.categoryId" placeholder="请选择产品品类" filterable :disabled="disabled" class="w100">
                  <el-option v-for="item in modelList" :key="item.id" :label="item.name" :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <template v-if="form.id">
              <el-col :span="6">
                <el-form-item label="型号" prop="name">
                  <el-input v-model="form.name" placeholder="型号" clearable />
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="描述" prop="desc">
                  <el-input v-model="form.desc" clearable placeholder="仪表描述" />
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="ERP编码" prop="erp">
                  <el-input v-model="form.erp" placeholder="ERP编码" clearable />
                </el-form-item>
              </el-col>
            </template>

            <el-col :span="6">
              <el-form-item label="SN" prop="instrumentModel.sn">
                <el-input v-model.trim="form.instrumentModel.sn" clearable placeholder="请输入SN号" />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="pcbaSn" prop="instrumentModel.pcbaSn">
                <el-input v-model.trim="form.instrumentModel.pcbaSn" clearable placeholder="请输入pcbaSn" />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="实际客户车名" prop="instrumentModel.customerCarName">
                <el-input v-model="form.instrumentModel.customerCarName" placeholder="请输入实际客户车名" clearable />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="客户料号" prop="instrumentModel.customerMaterialNum">
                <el-input v-model="form.instrumentModel.customerMaterialNum" placeholder="请输入客户料号" clearable />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="客户名称" prop="instrumentModel.customerName">
                <select-loadMore v-model="form.instrumentModel.customerName" class="w100" :data="customerNameData.data"
                  :page="customerNameData.page" :hasMore="customerNameData.more" dictLabel="name" dictValue="name"
                  :request="getCustomerNameList" placeholder="请选择客户名称">
                </select-loadMore>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="腾讯文档链接" prop="txFileUrl">
                <el-input v-model="form.txFileUrl" placeholder="请输入腾讯文档链接" clearable />
              </el-form-item>
            </el-col>

            <template v-if="form.isSts === 1">
              <el-col :span="6">
                <el-form-item label="最高档位" prop="instrumentModel.topGear">
                  <el-input v-minMaxValue="{ min: 0, max: 255 }" v-model="form.instrumentModel.topGear"
                    oninput="value=value.replace(/^\.+|[^\d.]/g, '')" placeholder="请输入最高档位" clearable />
                </el-form-item>
              </el-col>
              <!-- 限速范围 -->
              <el-col :span="6">
                <el-form-item label="限速范围" prop="instrumentModel.speedLimitRang">
                  <el-input v-model="form.instrumentModel.speedLimitRang" placeholder="请输入限速范围" clearable />
                </el-form-item>
              </el-col>

              <!-- 车把尺寸 -->
              <el-col :span="6">
                <el-form-item label="车把尺寸" prop="instrumentModel.handlebarSize">
                  <el-select v-model="form.instrumentModel.handlebarSize" placeholder="请选择车把尺寸" clearable class="w100">
                    <el-option v-for="(item, index) in handlebarSizeData" :key="index" :label="item.dictLabel"
                      :value="item.dictValue">
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
            <div class="cq-config-section">
              <div class="cq-config-card">
                <div class="cq-config-card__title">公共配置</div>
                <el-row :gutter="10">
                  <el-col :span="6">
                    <el-form-item label="通讯方式" prop="instrumentModel.serialLevel"
                      :rules="isCheckConfigItem({ message: '通讯方式' })">
                      <el-select v-model="form.instrumentModel.serialLevel" placeholder="请选择通讯方式" class="w100" clearable
                        @change="handleCqCommTypeChange">
                        <el-option v-for="item in cqCommTypeOptions" :key="`comm-${item.value}`" :label="item.label"
                          :value="item.value">
                          <span style="float: left">
                            <b>展示值：</b>
                            {{ item.label }}
                          </span>
                          <span style="float: right">
                            <b>实际值：</b>
                            {{ item.value }}
                          </span>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="通讯协议" prop="instrumentModel.sysProtocol"
                      :rules="isCheckConfigItem({ message: '通讯协议' })">
                      <el-select v-model="form.instrumentModel.sysProtocol" placeholder="请选择通讯协议" class="w100" clearable>
                        <el-option v-for="item in sysProtocolList" :label="item.dictLabel" :value="+item.dictValue"
                          :key="item.dictValue">
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
                    <el-form-item label="供电电压" prop="instrumentModel.cqPowerVoltage"
                      :rules="isCheckConfigItem({ message: '供电电压' })">
                      <el-select v-model="form.instrumentModel.cqPowerVoltage" placeholder="请选择供电电压" class="w100" clearable>
                        <el-option v-for="item in cqPowerVoltageOptions" :key="`power-${item.value}`" :label="item.label"
                          :value="item.value">
                          <span style="float: left">
                            <b>展示值：</b>
                            {{ item.label }}
                          </span>
                          <span style="float: right">
                            <b>实际值：</b>
                            {{ item.value }}
                          </span>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="VLK5V开关" prop="instrumentModel.cqVlk5vSwitch"
                      :rules="isCheckConfigItem({ message: 'VLK5V开关' })">
                      <el-select v-model="form.instrumentModel.cqVlk5vSwitch" placeholder="请选择VLK5V开关" class="w100" clearable
                        disabled>
                        <el-option v-for="item in cqVlk5vOptions" :key="`vlk-${item.value}`" :label="item.label"
                          :value="item.value">
                          <span style="float: left">
                            <b>展示值：</b>
                            {{ item.label }}
                          </span>
                          <span style="float: right">
                            <b>实际值：</b>
                            {{ item.value }}
                          </span>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="升级协议类型" prop="instrumentModel.cqUpgradeProtocolType"
                      :rules="isCheckConfigItem({ message: '升级协议类型' })">
                      <el-select v-model="form.instrumentModel.cqUpgradeProtocolType" placeholder="请选择升级协议类型" class="w100"
                        clearable>
                        <el-option v-for="item in cqProtocolTypeOptions" :key="`protocol-${item.value}`" :label="item.label"
                          :value="item.value">
                          <span style="float: left">
                            <b>展示值：</b>
                            {{ item.label }}
                          </span>
                          <span style="float: right">
                            <b>实际值：</b>
                            {{ item.value }}
                          </span>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="烧录文件类型" prop="instrumentModel.cqBurnFileType"
                      :rules="isCheckConfigItem({ message: '烧录文件类型' })">
                      <el-select v-model="form.instrumentModel.cqBurnFileType" placeholder="请选择烧录文件类型" class="w100" clearable
                        disabled @change="handleBurnFileTypeChange">
                        <el-option v-for="item in cqBurnFileTypeOptions" :key="`burn-${item.value}`" :label="item.label"
                          :value="item.value">
                          <span style="float: left">
                            <b>展示值：</b>
                            {{ item.label }}
                          </span>
                          <span style="float: right">
                            <b>实际值：</b>
                            {{ item.value }}
                          </span>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" v-if="isCqCanType">
                    <el-form-item label="帧ID" prop="instrumentModel.cqFrameId"
                      :rules="isCheckConfigItem({ message: '帧ID' })">
                      <el-select v-model="form.instrumentModel.cqFrameId" placeholder="请选择帧ID" class="w100" clearable
                        @change="handleCqFrameIdChange">
                        <el-option v-for="item in cqFrameIdOptions" :key="`frame-id-${item.value}`" :label="item.label"
                          :value="item.value">
                          <span style="float: left">
                            <b>展示值：</b>
                            {{ item.label }}
                          </span>
                          <span style="float: right">
                            <b>实际值：</b>
                            {{ item.value }}
                          </span>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" v-if="shouldShowCustomFrameIdInput">
                    <el-form-item label="自定义帧ID" prop="instrumentModel.cqCustomFrameId" :rules="customFrameIdRules">
                      <el-input v-model.trim="form.instrumentModel.cqCustomFrameId" placeholder="请输入十六进制帧ID" clearable
                        @input="normalizeCustomFrameId" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <div class="cq-config-version-row" v-if="hasSelectedCommType">
                <div class="cq-config-card cq-config-card--half">
                  <div class="cq-config-card__title">BOOT配置</div>
                  <el-row :gutter="10">
                    <el-col :span="12">
                      <el-form-item :label="isCqCanType ? 'CAN波特率' : '串口波特率'"
                        :prop="isCqCanType ? 'instrumentModel.bootCanRate' : 'instrumentModel.bootBaudRate'"
                        :rules="isCheckConfigItem({ message: isCqCanType ? 'BOOT CAN波特率' : 'BOOT串口波特率' })">
                        <el-select v-if="isCqCanType" v-model="form.instrumentModel.bootCanRate" placeholder="请选择BOOT CAN波特率"
                          class="w100" clearable>
                          <el-option v-for="item in cqBootBaudOptions" :key="`boot-can-${item.value}`" :label="item.label"
                            :value="item.value">
                            <span style="float: left">
                              <b>展示值：</b>
                              {{ item.label }}
                            </span>
                            <span style="float: right">
                              <b>实际值：</b>
                              {{ item.value }}
                            </span>
                          </el-option>
                        </el-select>
                        <el-select v-else v-model="form.instrumentModel.bootBaudRate" placeholder="请选择BOOT串口波特率"
                          class="w100" clearable>
                          <el-option v-for="item in cqBaudOptions" :key="`boot-uart-${item.value}`" :label="item.label"
                            :value="item.value">
                            <span style="float: left">
                              <b>展示值：</b>
                              {{ item.label }}
                            </span>
                            <span style="float: right">
                              <b>实际值：</b>
                              {{ item.value }}
                            </span>
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="isCqCanType">
                      <el-form-item label="帧类型" prop="instrumentModel.bootMsgType"
                        :rules="isCheckConfigItem({ message: 'BOOT帧类型' })">
                        <el-select v-model.number="form.instrumentModel.bootMsgType" placeholder="请选择BOOT帧类型" class="w100"
                          clearable>
                          <el-option v-for="item in cqBootFrameTypeOptions" :key="`boot-frame-${item.value}`"
                            :label="item.label" :value="item.value">
                            <span style="float: left">
                              <b>展示值：</b>
                              {{ item.label }}
                            </span>
                            <span style="float: right">
                              <b>实际值：</b>
                              {{ item.value }}
                            </span>
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>

                <div class="cq-config-card cq-config-card--half">
                  <div class="cq-config-card__title">APP配置</div>
                  <el-row :gutter="10">
                    <el-col :span="12">
                      <el-form-item :label="isCqCanType ? 'CAN波特率' : '串口波特率'"
                        :prop="isCqCanType ? 'instrumentModel.canRate' : 'instrumentModel.baudRate'"
                        :rules="isCheckConfigItem({ message: isCqCanType ? 'APP CAN波特率' : 'APP串口波特率' })">
                        <el-select v-if="isCqCanType" v-model="form.instrumentModel.canRate" placeholder="请选择APP CAN波特率"
                          class="w100" clearable>
                          <el-option v-for="item in cqAppBaudOptions" :key="`app-can-${item.value}`" :label="item.label"
                            :value="item.value">
                            <span style="float: left">
                              <b>展示值：</b>
                              {{ item.label }}
                            </span>
                            <span style="float: right">
                              <b>实际值：</b>
                              {{ item.value }}
                            </span>
                          </el-option>
                        </el-select>
                        <el-select v-else v-model="form.instrumentModel.baudRate" placeholder="请选择APP串口波特率" class="w100"
                          clearable>
                          <el-option v-for="item in cqBaudOptions" :key="`app-uart-${item.value}`" :label="item.label"
                            :value="item.value">
                            <span style="float: left">
                              <b>展示值：</b>
                              {{ item.label }}
                            </span>
                            <span style="float: right">
                              <b>实际值：</b>
                              {{ item.value }}
                            </span>
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="isCqCanType">
                      <el-form-item label="帧类型" prop="instrumentModel.msgType"
                        :rules="isCheckConfigItem({ message: 'APP帧类型' })">
                        <el-select v-model.number="form.instrumentModel.msgType" placeholder="请选择APP帧类型" class="w100"
                          clearable>
                          <el-option v-for="item in cqAppFrameTypeOptions" :key="`app-frame-${item.value}`"
                            :label="item.label" :value="item.value">
                            <span style="float: left">
                              <b>展示值：</b>
                              {{ item.label }}
                            </span>
                            <span style="float: right">
                              <b>实际值：</b>
                              {{ item.value }}
                            </span>
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </div>

              <div class="cq-config-card cq-config-card--compact">
                <el-row :gutter="10">
                  <el-col :span="6">
                    <el-form-item label="标签规则" prop="instrumentModel.labelRule">
                      <el-select v-model="form.instrumentModel.labelRule" clearable @change="handleLabelRule" class="w100">
                        <el-option label="通用" :value="1"></el-option>
                        <el-option label="图片" :value="2"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>

                  <el-col :span="6" v-if="form.instrumentModel.labelRule === 2">
                    <el-form-item label="标签图片" prop="instrumentModel.labelRuleImg"
                      :rules="isCheckConfigItem({ message: '标签图片' })">
                      <el-upload-sortable v-model="form.instrumentModel.labelRuleImg" :imgW="80" :imgH="80" :isLimit="1"
                        :max="1" />
                    </el-form-item>
                  </el-col>

                  <el-col :span="24">
                    <el-form-item label="包装信息" prop="instrumentModel.packagingInfo">
                      <tinymce v-if="dialogVisible" v-model="form.instrumentModel.packagingInfo" placeholder="请输入"
                        height="250">
                      </tinymce>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </div>
          </fieldset>
          <template>
            <fieldset class="margin-top">
              <legend class="text-green">控制器、按键配置区</legend>
              <el-row :gutter="10">
                <el-col :span="6">
                  <el-form-item label="控制器接头" prop="instrumentModel.controlConnect">
                    <el-select v-model="form.instrumentModel.controlConnect" placeholder="请选择控制器接头" filterable
                      allow-create clearable class="w100">
                      <el-option v-for="(item, index) in dicts_controller_joint" :key="index" :label="item.dictValue"
                        :value="item.dictValue">
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
                  <el-form-item label="控制器头" prop="instrumentModel.controlHead">
                    <el-select v-model.number="form.instrumentModel.controlHead" filterable clearable
                      placeholder="请选择控制器头" class="w100">
                      <el-option v-for="item in [
                        { dictLabel: '不含头', dictValue: 0 },
                        { dictLabel: '含头', dictValue: 1 },
                      ]" :label="item.dictLabel" :value="item.dictValue" :key="item.dictValue">
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
                  <el-form-item label="控制器出线线长(mm)" prop="instrumentModel.notControllerJointString">
                    <el-input v-model.number="form.instrumentModel.notControllerJointString
                      " placeholder="请输入控制器出线线长" oninput="value=value.replace(/[^\d.]/g, '')" clearable />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="按键型号" prop="instrumentModel.keyType">
                    <el-select v-model="form.instrumentModel.keyType" placeholder="请选择按键型号" clearable class="w100"
                      filterable allow-create>
                      <el-option v-for="(item, index) in dicts_keyType_list" :key="index" :label="item.dictLabel"
                        :value="+item.dictValue">
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
                  <el-form-item label="按键连接类型" prop="instrumentModel.keyLinkType">
                    <el-select v-model.number="form.instrumentModel.keyLinkType" filterable clearable
                      placeholder="请选择按键连接类型" class="w100">
                      <el-option v-for="item in [
                        { dictLabel: '直连', dictValue: 0 },
                        { dictLabel: '快拆', dictValue: 1 },
                      ]" :label="item.dictLabel" :value="item.dictValue" :key="item.dictValue">
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
                    <el-form-item label="按键【仪表端】接头" prop="instrumentModel.modelEndHead">
                      <el-input v-model="form.instrumentModel.modelEndHead" placeholder="请输入按键【仪表端】接头" clearable />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="按键【按键端】接头" prop="instrumentModel.keyEndHead">
                      <el-input v-model="form.instrumentModel.keyEndHead" placeholder="请输入按键【按键端】接头" clearable />
                    </el-form-item>
                  </el-col>
                </template>
                <el-col :span="6">
                  <el-form-item label="按键线长(mm)" prop="instrumentModel.keyLineLen">
                    <el-input v-model.number="form.instrumentModel.keyLineLen" placeholder="请输入按键线长"
                      oninput="value=value.replace(/[^\d.]/g, '')" clearable />
                  </el-form-item>
                </el-col>
              </el-row>
            </fieldset>

            <fieldset class="margin-top">
              <legend class="text-green">图片配置区</legend>
              <el-row :gutter="10">
                <el-col :span="6">
                  <el-form-item label="按键图片" prop="instrumentModel.keyImgUrl">
                    <el-upload-sortable v-model="form.instrumentModel.keyImgUrl" :imgW="80" :imgH="80" :isLimit="1"
                      :max="1" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="开机logo" prop="instrumentModel.powerLogo">
                    <el-upload-sortable v-model="form.instrumentModel.powerLogo" :imgW="80" :imgH="80" :isLimit="1"
                      :max="1" />
                  </el-form-item>
                </el-col>

                <el-col :span="24">
                  <el-form-item label="规格书" prop="instrumentModel.specification">
                    <el-upload-sortable v-model="form.instrumentModel.specification" :imgW="80" :imgH="80" :max="20" />
                  </el-form-item>
                </el-col>
              </el-row>
            </fieldset>
          </template>
        </fieldset>

        <fieldset class="margin-top" v-if="form.isSts === 1">
          <legend class="text-red">车型配置</legend>
          <el-row :gutter="10">
            <el-col :span="6">
              <el-form-item label="背光亮度" prop="instrumentModel.backlightBrightness">
                <el-select v-model="form.instrumentModel.backlightBrightness" placeholder="请选择背光亮度" clearable
                  class="w100" filterable allow-create>
                  <el-option v-for="(value, key) in backlightBrightnessList" :key="key" :label="value" :value="+key">
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

              <el-form-item label="休眠时间(min)" prop="instrumentModel.sleepTime">
                <el-select v-model="form.instrumentModel.sleepTime" placeholder="请选择休眠时间" class="w100" clearable>
                  <el-option v-for="(item, index) in sleepTimeList" :key="index" :label="item" :value="item">
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

              <el-form-item label="系统电压(V)" prop="instrumentModel.voltage">
                <el-select v-model="form.instrumentModel.voltage" placeholder="请选择系统电压" @change="changeVoltage"
                  class="w100" clearable>
                  <el-option v-for="(item, index) in dicts_voltage" :key="index" :label="item" :value="item">
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

              <el-form-item label="欠压门限(V)" prop="instrumentModel.undervoltage">
                <el-input-number class="el-input-number-box w100" v-model.number="form.instrumentModel.undervoltage"
                  :precision="1" :min="0" :controls="false" placeholder="请输入欠压门限" clearable />
              </el-form-item>

              <el-form-item label="助力档位数" prop="instrumentModel.powerGear"
                :rules="isCheckConfigItem({ message: '助力档位数' })">
                <el-select v-model="form.instrumentModel.powerGear" placeholder="请选择助力档位数" class="w100" clearable>
                  <el-option v-for="(item, index) in powerGearData" :key="index" :label="item" :value="item">
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

              <el-form-item label="助力开始磁钢数" prop="instrumentModel.assistStartMagnetNumber"
                :rules="isCheckConfigItem({ message: '助力开始磁钢数' })">
                <el-select v-model="form.instrumentModel.assistStartMagnetNumber" placeholder="请选择助力开始磁钢数" class="w100"
                  clearable>
                  <el-option v-for="item in assistStartMagnetNumberData" :key="item" :label="item"
                    :value="String(item)">
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

              <el-form-item label="助力比例" prop="instrumentModel.assistPercentage" :rules="isCheckConfigItem({
                message: '助力开始磁钢数',
                trigger: 'blur',
              })
                ">
                <el-input type="number" v-minMaxValue="{ min: 0 }"
                  v-model.number="form.instrumentModel.assistPercentage" oninput="value=value.replace(/[^\d]/g, '')"
                  placeholder="请输入助力比例" clearable />
              </el-form-item>

              <el-form-item label="限流门限(A)" prop="instrumentModel.currentlimiting" :rules="isCheckConfigItem({ message: '限流门限', trigger: 'blur' })
                ">
                <el-input type="number" v-minMaxValue="{ min: 0 }" v-model.number="form.instrumentModel.currentlimiting"
                  oninput="value=value.replace(/[^\d]/g, '')" placeholder="请输入限流门限" clearable />
              </el-form-item>

              <el-form-item label="助力限速门限(km/h)" prop="instrumentModel.assistLimit"
                :rules="isCheckConfigItem({ message: '助力限速门限' })">
                <el-select v-model="form.instrumentModel.assistLimit" placeholder="请选择助力限速门限" class="w100" filterable
                  clearable>
                  <el-option v-for="item in assistLimitData" :key="item" :label="item" :value="String(item)">
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

              <el-form-item label="显示轮径" prop="instrumentModel.showWheelsize" :rules="isCheckConfigItem({ message: '显示轮径', trigger: 'blur' })
                ">
                <el-input type="number" v-minMaxValue="{ min: 0 }" v-model.number="form.instrumentModel.showWheelsize"
                  oninput="value=value.replace(/[^\d]/g, '')" clearable placeholder="显示轮径" />
              </el-form-item>

              <el-form-item label="车轮宽度" prop="instrumentModel.tiresSize" :rules="isCheckConfigItem({ message: '车轮宽度', trigger: 'blur' })
                ">
                <el-input v-model="form.instrumentModel.tiresSize" v-minMaxValue="{ min: 0 }"
                  oninput="value=value.replace(/[^\d]/g, '')" placeholder="请输入车轮宽度" clearable />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="缓启动" prop="instrumentModel.slowStart" :rules="isCheckConfigItem({ message: '缓启动' })">
                <el-select v-model="form.instrumentModel.slowStart" placeholder="请选择缓启动" filterable class="w100"
                  clearable>
                  <el-option v-for="item in slowStartData" :key="item" :label="item" :value="String(item)">
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

              <el-form-item label="配置轮径(inch)" prop="instrumentModel.wheelDiameter"
                :rules="isCheckConfigItem({ message: '配置轮径' })">
                <el-select v-model="form.instrumentModel.wheelDiameter" placeholder="请选择配置轮径" filterable class="w100"
                  clearable @change="changeCountPerimeter">
                  <el-option v-for="(value, key) in wheelDiameterData" :key="key" :label="value" :value="+key">
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

              <el-form-item label="实际轮径(inch)" prop="instrumentModel.showWheelDiameter">
                <el-select v-model="form.instrumentModel.showWheelDiameter" placeholder="请选择实际轮径" filterable
                  class="w100" clearable>
                  <el-option v-for="(value, key) in wheelDiameterData" :key="key" :label="value" :value="value">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="周长(mm)" prop="instrumentModel.perimeter">
                <el-input v-minMaxValue="{ min: 0 }" v-model.number="form.instrumentModel.perimeter"
                  oninput="value=value.replace(/[^\d]/, '')" placeholder="请输入周长" clearable />
              </el-form-item>

              <el-form-item label="显示单位" prop="instrumentModel.unit" :rules="isCheckConfigItem({ message: '显示单位' })">
                <el-select v-model="form.instrumentModel.unit" placeholder="请选择显示单位" class="w100" clearable>
                  <el-option v-for="item in dicts_unit" :key="item.dictValue" :label="item.dictLabel"
                    :value="+item.dictValue">
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

              <el-form-item label="配置协议" prop="instrumentModel.agreement"
                :rules="isCheckConfigItem({ message: '配置协议' })">
                <el-select v-model="form.instrumentModel.agreement" placeholder="请选择配置协议" class="w100" clearable
                  @change="onChangeAgreement">
                  <el-option v-for="item in dicts_agreement" :key="item.dictValue" :label="item.dictLabel"
                    :value="+item.dictValue">
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

              <el-form-item label="实际协议" prop="instrumentModel.showAgreement">
                <el-select v-model="form.instrumentModel.showAgreement" placeholder="请选择实际协议" filterable allow-create class="w100" clearable>
                  <el-option v-for="item in dicts_agreement" :key="item.dictValue" :label="item.dictLabel"
                    :value="item.dictLabel">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="电量计算方式" prop="instrumentModel.power"
                :rules="isCheckConfigItem({ message: '电量计算方式' })">
                <el-select v-model="form.instrumentModel.power" placeholder="请选择电量计算方式" class="w100" clearable>
                  <el-option v-for="item in dicts_power" :key="item.dictValue" :label="item.dictLabel"
                    :value="item.dictValue">
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

              <el-form-item label="测速磁钢数" prop="instrumentModel.speedSteel"
                :rules="isCheckConfigItem({ message: '测速磁钢数' })">
                <el-select v-model="form.instrumentModel.speedSteel" placeholder="请选择测速磁钢数" filterable class="w100"
                  clearable>
                  <el-option v-for="item in speedSteelData" :key="item" :label="item" :value="item">
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

              <el-form-item label="电量变化时间(s)" prop="instrumentModel.batteryVoltageChangeTime"
                :rules="isCheckConfigItem({ message: '电量变化时间' })">
                <el-select v-model="form.instrumentModel.batteryVoltageChangeTime" placeholder="请选择电量变化时间" filterable
                  class="w100" clearable>
                  <el-option v-for="item in batteryVoltageChangeTimeData" :key="item" :label="item"
                    :value="String(item)">
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

              <el-form-item label="速度平滑等级" prop="instrumentModel.smoothLevel"
                :rules="isCheckConfigItem({ message: '速度平滑等级' })">
                <el-select v-model="form.instrumentModel.smoothLevel" placeholder="请选择速度平滑等级" filterable class="w100"
                  clearable>
                  <el-option v-for="item in smoothLevelData" :key="item" :label="item" :value="String(item)">
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
              <el-form-item label="车名" prop="instrumentModel.ebikeName" :rules="isCheckConfigItem({ message: '车名' })">
                <el-select v-model="form.instrumentModel.ebikeName" placeholder="请选择车名" class="w100" clearable
                  filterable>
                  <el-option v-for="(value, key) in dicts_ebike" :key="+key" :label="value" :value="+key">
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

              <el-form-item label="车型" prop="instrumentModel.carModel"
                :rules="isCheckConfigItem({ message: '车型', trigger: 'blur' })">
                <el-input maxlength="2" v-model="form.instrumentModel.carModel" placeholder="请输入车型" clearable />
              </el-form-item>

              <el-form-item label="默认档位" prop="instrumentModel.defaultGear" :rules="isCheckConfigItem({ message: '默认档位', trigger: 'blur' })
                ">
                <el-input v-minMaxValue="{ min: 0 }" v-model="form.instrumentModel.defaultGear"
                  oninput="value=value.replace(/[^\d.]/g, '')" clearable placeholder="请输入默认档位" />
              </el-form-item>

              <el-form-item label="Logo界面" prop="instrumentModel.logo"
                :rules="isCheckConfigItem({ message: 'Logo界面' })">
                <el-select v-model="form.instrumentModel.logo" placeholder="请选择Logo界面" class="w100" clearable>
                  <el-option v-for="item in dicts_logo" :key="item.dictValue" :label="item.dictLabel"
                    :value="item.dictValue">
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

              <el-form-item label="开机密码" prop="instrumentModel.startupPasswd" :rules="isCheckConfigItem({ message: '开机密码', trigger: 'blur' })
                ">
                <el-input type="number" clearable v-minMaxValue="{ min: 0 }"
                  v-model="form.instrumentModel.startupPasswd" oninput="value=value.replace(/[^\d.]/g, '')"
                  placeholder="请输入开机密码" />
              </el-form-item>

              <el-form-item label="高级菜单密码" prop="instrumentModel.highMenuPasswd" :rules="isCheckConfigItem({
                message: '高级菜单密码',
                trigger: 'blur',
              })
                ">
                <el-input v-model="form.instrumentModel.highMenuPasswd" clearable type="number"
                  v-minMaxValue="{ min: 0 }" oninput="value=value.replace(/[^\d.]/g, '')" placeholder="请输入高级菜单密码" />
              </el-form-item>

              <el-form-item label="电机功率(W)" prop="instrumentModel.motorSys" :rules="isCheckConfigItem({ message: '电机功率', trigger: 'blur' })
                ">
                <el-input type="number" v-minMaxValue="{ min: 0 }" v-model="form.instrumentModel.motorSys"
                  oninput="value=value.replace(/[^\d.]/g, '')" clearable placeholder="请输入电机功率" />
              </el-form-item>

              <el-form-item label="电池容量" prop="instrumentModel.batteryCap" :rules="isCheckConfigItem({ message: '电池容量', trigger: 'blur' })
                ">
                <el-input type="number" v-minMaxValue="{ min: 0 }" v-model="form.instrumentModel.batteryCap"
                  oninput="value=value.replace(/[^\d.]/g, '')" clearable placeholder="电池容量" />
              </el-form-item>

              <el-form-item label="高速蜂鸣器提醒" prop="instrumentModel.highSpeedBuzzerRemind" :rules="isCheckConfigItem({
                message: '高速蜂鸣器提醒',
                trigger: 'blur',
              })
                ">
                <el-input v-model="form.instrumentModel.highSpeedBuzzerRemind" v-minMaxValue="{ min: 0 }"
                  oninput="value=value.replace(/[^\d.]/g, '')" placeholder="请输入高速蜂鸣器提醒" clearable />
              </el-form-item>

              <el-form-item label="串口通讯电平" prop="instrumentModel.serialLevelLog"
                :rules="isCheckConfigItem({ message: '串口通讯电平' })">
                <el-select v-model="form.instrumentModel.serialLevelLog" placeholder="请选择串口通讯电平" class="w100" clearable>
                  <el-option v-for="(value, key) in serialLevelLogData" :key="key" :label="value" :value="+key">
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

              <el-form-item label="总线故障超时时间(s)" prop="instrumentModel.allLineErrTimeOut"
                :rules="isCheckConfigItem({ message: '总线故障超时时间' })">
                <el-select v-model="form.instrumentModel.allLineErrTimeOut" placeholder="请选择总线故障超时时间" filterable
                  class="w100" clearable>
                  <el-option v-for="item in allLineErrTimeOutData" :key="item" :label="item" :value="String(item)">
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
              <el-form-item label="蓝牙" prop="instrumentModel.bluetooth" :rules="isCheckConfigItem({ message: '蓝牙' })">
                <el-radio-group v-model="form.instrumentModel.bluetooth">
                  <el-radio :label="1"> YES </el-radio>
                  <el-radio :label="0"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="推车助力" prop="instrumentModel.driveAssist"
                :rules="isCheckConfigItem({ message: '推车助力' })">
                <el-radio-group v-model="form.instrumentModel.driveAssist">
                  <el-radio :label="1">YES</el-radio>
                  <el-radio :label="0">NO</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="恢复出厂设置" prop="instrumentModel.factoryReset"
                :rules="isCheckConfigItem({ message: '恢复出厂设置' })">
                <el-radio-group v-model="form.instrumentModel.factoryReset">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="转把分档" prop="instrumentModel.rotateHandle"
                :rules="isCheckConfigItem({ message: '转把分档' })">
                <el-radio-group v-model="form.instrumentModel.rotateHandle">
                  <el-radio :label="1"> YES </el-radio>
                  <el-radio :label="0"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="蜂鸣器开关" prop="instrumentModel.buzzerSwitch"
                :rules="isCheckConfigItem({ message: '蜂鸣器开关' })">
                <el-radio-group v-model="form.instrumentModel.buzzerSwitch">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="定速巡航功能" prop="instrumentModel.cruise"
                :rules="isCheckConfigItem({ message: '定速巡航功能' })">
                <el-radio-group v-model="form.instrumentModel.cruise">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="开机密码" prop="instrumentModel.turnOnPasswd"
                :rules="isCheckConfigItem({ message: '开机密码' })">
                <el-radio-group v-model="form.instrumentModel.turnOnPasswd">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="菜单密码" prop="instrumentModel.menuPassword"
                :rules="isCheckConfigItem({ message: '菜单密码' })">
                <el-radio-group v-model="form.instrumentModel.menuPassword">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="有无高级菜单" prop="instrumentModel.isHighMenuPassword">
                <el-radio-group v-model="form.instrumentModel.isHighMenuPassword">
                  <el-radio :label="0"> YES </el-radio>
                  <el-radio :label="1"> NO </el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="转把限速" prop="instrumentModel.rotateHandleSpeedLimit"
                :rules="isCheckConfigItem({ message: '转把限速' })">
                <el-radio-group v-model="form.instrumentModel.rotateHandleSpeedLimit">
                  <div class="flex">
                    <el-radio :label="0">正常</el-radio>
                    <el-radio :label="1">限速6Km</el-radio>
                  </div>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="助力正反" prop="instrumentModel.assist" :rules="isCheckConfigItem({ message: '助力正反' })">
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

      <div slot="footer" class="dialog-footer flex justify-center product-btn-box">
        <div>
          <el-button v-if="form.id && !isCopyProduct" type="primary" @click="submitForm('form')"
            :loading="isSubmitLoading">
            修改
          </el-button>
          <el-button type="primary" @click="submitOpen" v-else>
            确定
          </el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="false" title="添加型号" :visible.sync="open" width="540px" append-to-body>
      <el-form ref="finalForm" :model="form" label-width="150px" @submit.native.prevent>
        <el-form-item label="仪表型号:" prop="name" :rules="isCheckConfigItem({ message: '仪表型号', trigger: 'blur' })">
          <el-input v-model.trim="form.name" placeholder="仪表型号" />
        </el-form-item>

        <el-form-item label="ERP编码" prop="erp">
          <el-input v-model.trim="form.erp" placeholder="ERP编码" />
        </el-form-item>
        <el-form-item label="描述" prop="desc" style="width: 100%">
          <el-input type="textarea" :autosize="{ minRows: 5, maxRows: 8 }" v-model="form.desc" placeholder="仪表描述" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="isSubmitLoading" @click="submitForm('finalForm')">
          确 定
        </el-button>
        <el-button @click="onResetForm">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addSampleComputer,
  editSampleComputer,
  detailSampleComputer,
} from "@/api/third/sampleProductFamily";
import { typeCategory } from "@/api/third/category";
import { getCustomerList } from "@/api/order";
import { dictByRoles } from "@/api/third/project";
import mixin from "./export";
import commonSampleData from "@/mixins/commonSampleData";
import ElUploadSortable from "@/components/el-upload-sortable";
import tinymce from "@/views/components/Editor";
import CopyBtn from "./copyBtn.vue";
import MyUpload from "@/components/MyUpload";
import {
  detailComputer,
} from "@/api/third/computer";
export default {
  mixins: [mixin, commonSampleData],
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

    const validateCustomFrameId = (rule, value, callback) => {
      if (this.form.instrumentModel.cqFrameId !== 2) {
        callback();
      } else if (this.Is_Empty(value)) {
        callback(new Error("自定义帧ID不能为空"));
      } else if (!/^[0-9A-F]+$/i.test(String(value))) {
        callback(new Error("请输入十六进制帧ID"));
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
        name: null,
        instrumentModel: {
          bootBaudRate: null,
          bootMsgType: null,
          bootCanRate: null,
          cqPowerVoltage: null,
          cqVlk5vSwitch: 0,
          cqUpgradeProtocolType: null,
          cqBurnFileType: 0,
          fileFormat: 0,
          cqFrameId: null,
          cqCustomFrameId: "",
        },
      },
      title: "",
      disabled: false,
      serialLevelLogData: {
        0: "3.3V",
        1: "5V",
      },
      cqDictMap: {},
      // 表单校验
      formRules: {
        "instrumentModel.cqCustomFrameId": [
          {
            validator: validateCustomFrameId,
            trigger: ["blur", "change"],
          },
        ],
        "instrumentModel.bootBaudRate": [
          {
            required: true,
            message: "BOOT串口波特率不能为空",
            trigger: "change",
          },
        ],
        "instrumentModel.bootCanRate": [
          {
            required: true,
            message: "BOOT CAN波特率不能为空",
            trigger: "change",
          },
        ],
        "instrumentModel.bootMsgType": [
          {
            required: true,
            message: "BOOT帧类型不能为空",
            trigger: "change",
          },
        ],
        "instrumentModel.canRate": [
          {
            required: true,
            message: "APP CAN波特率不能为空",
            trigger: "change",
          },
        ],
        "instrumentModel.msgType": [
          {
            required: true,
            message: "APP帧类型不能为空",
            trigger: "change",
          },
        ],
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
      // 项目经理列表
      personLiableList: [],
    };
  },
  components: {
    ElUploadSortable,
    tinymce,
    CopyBtn,
    MyUpload
  },
  computed: {
    isCheckConfigItem() {
      return ({ required = true, message = "", trigger = "change" } = {}) => {
        return { required, message: `${message}不能为空`, trigger };
      };
    },
    hasSelectedCommType() {
      const serialLevel = this.form.instrumentModel?.serialLevel;
      return serialLevel !== null && serialLevel !== undefined && serialLevel !== "";
    },
    isCqCanType() {
      return Number(this.form.instrumentModel?.serialLevel) === 2;
    },
    shouldShowCustomFrameIdInput() {
      return this.isCqCanType && Number(this.form.instrumentModel?.cqFrameId) === 2;
    },
    customFrameIdRules() {
      return [
        {
          validator: (_, value, callback) => {
            if (!this.shouldShowCustomFrameIdInput) {
              callback();
            } else if (this.Is_Empty(value)) {
              callback(new Error("自定义帧ID不能为空"));
            } else if (!/^[0-9A-F]+$/i.test(String(value))) {
              callback(new Error("请输入十六进制帧ID"));
            } else {
              callback();
            }
          },
          trigger: ["blur", "change"],
        },
      ];
    },
    cqCommTypeOptions() {
      return this.getCqOptionsByValue(1);
    },
    cqBaudOptions() {
      return this.getCqOptionsByValue(2, "uart");
    },
    cqBootBaudOptions() {
      return this.filterCqOptionsByBurnFileType(
        this.getCqOptionsByValue(2, "can"),
        "boot"
      );
    },
    cqAppBaudOptions() {
      return this.filterCqOptionsByBurnFileType(
        this.getCqOptionsByValue(2, "can"),
        "app"
      );
    },
    cqBootFrameTypeOptions() {
      return this.filterCqOptionsByBurnFileType(
        this.getCqOptionsByValue(3, "can"),
        "boot"
      );
    },
    cqAppFrameTypeOptions() {
      return this.filterCqOptionsByBurnFileType(
        this.getCqOptionsByValue(3, "can"),
        "app"
      );
    },
    cqPowerVoltageOptions() {
      return this.getCqOptionsByValue(4);
    },
    cqVlk5vOptions() {
      return this.getCqOptionsByValue(5);
    },
    cqProtocolTypeOptions() {
      return this.getCqOptionsByValue(6);
    },
    cqBurnFileTypeOptions() {
      return this.getCqOptionsByValue(7);
    },
    cqFrameIdOptions() {
      return this.getCqOptionsByValue(8);
    },
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.isEditCopy = false;
        this.resetForm("queryParams");
        this.resetForm("form");
        this.ensureCqFields(this.form.instrumentModel);
        this.applyFixedCqDefaults(this.form.instrumentModel);
        this.getList();
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
    this.getPersonLiableList();
    this.ensureCqFields();
    this.applyFixedCqDefaults();
  },
  methods: {
    getDefaultCqDictMap() {
      return {
        1: [
          { label: "3.3V 串口", value: 0 },
          { label: "5V 串口", value: 1 },
          { label: "CAN", value: 2 },
        ],
        2: [
          { label: "1200", value: 1, type: "uart" },
          { label: "2400", value: 2, type: "uart" },
          { label: "4800", value: 3, type: "uart" },
          { label: "9600", value: 4, type: "uart" },
          { label: "14400", value: 5, type: "uart" },
          { label: "19200", value: 6, type: "uart" },
          { label: "38400", value: 7, type: "uart" },
          { label: "43000", value: 8, type: "uart" },
          { label: "57600", value: 9, type: "uart" },
          { label: "76800", value: 10, type: "uart" },
          { label: "115200", value: 11, type: "uart" },
          { label: "128000", value: 12, type: "uart" },
          { label: "100k", value: 1, type: "can", fileType: "boot" },
          { label: "125k", value: 2, type: "can", fileType: "boot" },
          { label: "150k", value: 3, type: "can", fileType: "boot" },
          { label: "200k", value: 4, type: "can", fileType: "boot" },
          { label: "250k", value: 5, type: "can", fileType: "boot" },
          { label: "300k", value: 6, type: "can", fileType: "boot" },
          { label: "400k", value: 7, type: "can", fileType: "boot" },
          { label: "500k", value: 8, type: "can", fileType: "boot" },
          { label: "600k", value: 9, type: "can", fileType: "boot" },
          { label: "900k", value: 10, type: "can", fileType: "boot" },
          { label: "100k", value: 1, type: "can", fileType: "app" },
          { label: "125k", value: 2, type: "can", fileType: "app" },
          { label: "150k", value: 3, type: "can", fileType: "app" },
          { label: "200k", value: 4, type: "can", fileType: "app" },
          { label: "250k", value: 5, type: "can", fileType: "app" },
          { label: "300k", value: 6, type: "can", fileType: "app" },
          { label: "400k", value: 7, type: "can", fileType: "app" },
          { label: "500k", value: 8, type: "can", fileType: "app" },
          { label: "600k", value: 9, type: "can", fileType: "app" },
          { label: "900k", value: 10, type: "can", fileType: "app" },
        ],
        3: [
          { label: "串口默认", value: 0, type: "uart" },
          { label: "标准帧", value: 1, type: "can", fileType: "boot" },
          { label: "扩展帧", value: 2, type: "can", fileType: "boot" },
          { label: "标准帧", value: 1, type: "can", fileType: "app" },
          { label: "扩展帧", value: 2, type: "can", fileType: "app" },
        ],
        4: [
          { label: "12V", value: 0 },
          { label: "24V", value: 1 },
        ],
        5: [
          { label: "关闭", value: 0 },
          { label: "打开", value: 1 },
        ],
        6: [
          { label: "通用彩屏", value: 1 },
          { label: "通用段码屏", value: 2 },
          { label: "高标", value: 3 },
          { label: "华芯微特", value: 4 },
          { label: "开阳", value: 5 },
          { label: "LIME", value: 6 },
          { label: "SPARROW", value: 7 },
          { label: "美的", value: 8 },
          { label: "IOT", value: 9 },
          { label: "K71U", value: 10 },
        ],
        7: [
          { label: "BOOT", value: 0 },
          { label: "APP", value: 1 },
          { label: "UI", value: 2 },
          { label: "配置文件", value: 3 },
        ],
        8: [
          { label: "默认帧ID", value: 1 },
          { label: "自定义帧ID", value: 2 },
        ],
      };
    },
    normalizeCqOptions(options = []) {
      if (!Array.isArray(options)) {
        return [];
      }
      return options
        .filter((item) => item && item.label !== undefined && item.value !== undefined)
        .map((item) => ({
          label: String(item.label),
          value: Number(item.value),
          type: item.type || undefined,
          fileType: item.fileType !== undefined ? item.fileType : item.burnFileType,
          version: item.version,
        }));
    },
    parseCqDictMap(dictRows = []) {
      const nextMap = { ...this.getDefaultCqDictMap() };
      (dictRows || []).forEach((item) => {
        const position = Number(item.dictValue);
        if (!position || position < 1 || position > 8) {
          return;
        }
        try {
          const parsed = JSON.parse(item.remark || "[]");
          const options = this.normalizeCqOptions(parsed);
          if (options.length > 0) {
            nextMap[position] = options;
          }
        } catch (error) {
          console.warn("CQ字典remark解析失败:", item, error);
        }
      });
      this.cqDictMap = nextMap;
    },
    loadCqDictConfig() {
      this.cqDictMap = this.getDefaultCqDictMap();
      this.getDicts("dt_upgrade_cq_config")
        .then((res) => {
          this.parseCqDictMap(res.data || []);
        })
        .catch((error) => {
          console.warn("加载CQ字典失败，已使用前端默认配置:", error);
        });
    },
    getCqOptionsByValue(dictValue, type) {
      const options = this.cqDictMap[dictValue] || [];
      if (!type) {
        return options;
      }
      return options.filter((item) => item.type === type);
    },
    normalizeBurnFileTypeKey(value) {
      return String(value || "").trim().toLowerCase();
    },
    getBurnFileTypeKeys(version) {
      if (version === "boot") {
        return ["0", "boot"];
      }
      if (version === "app") {
        return ["1", "app"];
      }
      const currentValue = Number(this.form.instrumentModel?.cqBurnFileType);
      const matched = this.getCqOptionsByValue(7).find(
        (item) => Number(item.value) === currentValue
      );
      const keys = [];
      if (!this.Is_Empty(currentValue) || currentValue === 0) {
        keys.push(String(currentValue));
      }
      if (matched?.label) {
        keys.push(this.normalizeBurnFileTypeKey(matched.label));
      }
      return keys.filter(Boolean);
    },
    filterCqOptionsByBurnFileType(options = [], version) {
      if (!this.isCqCanType) {
        return options;
      }
      const burnKeys = this.getBurnFileTypeKeys(version);
      if (burnKeys.length === 0) {
        return options;
      }
      const filtered = options.filter((item) => {
        const rawKey =
          item.fileType !== undefined
            ? item.fileType
            : item.burnFileType !== undefined
              ? item.burnFileType
              : item.version;
        if (rawKey === undefined || rawKey === null || rawKey === "") {
          return true;
        }
        return burnKeys.includes(this.normalizeBurnFileTypeKey(rawKey));
      });
      return filtered.length > 0 ? filtered : options;
    },
    ensureCqFields(model = this.form.instrumentModel) {
      if (!model) {
        return;
      }
      const defaults = {
        bootBaudRate: null,
        bootMsgType: null,
        bootCanRate: null,
        cqPowerVoltage: null,
        cqVlk5vSwitch: 0,
        cqUpgradeProtocolType: null,
        cqBurnFileType: 0,
        fileFormat: 0,
        cqFrameId: null,
        cqCustomFrameId: "",
      };
      Object.keys(defaults).forEach((key) => {
        if (
          !Object.prototype.hasOwnProperty.call(model, key) ||
          model[key] === undefined ||
          model[key] === null
        ) {
          this.$set(model, key, defaults[key]);
        }
      });
    },
    applyFixedCqDefaults(model = this.form.instrumentModel) {
      if (!model) {
        return;
      }
      model.cqVlk5vSwitch = 0;
      model.cqBurnFileType = 0;
      model.fileFormat = 0;
    },
    getFirstOptionValue(list = []) {
      return list.length > 0 ? list[0].value : null;
    },
    getDefaultBootFrameType() {
      const standardOption = this.cqBootFrameTypeOptions.find(
        (item) => item.label === "标准帧"
      );
      return standardOption
        ? standardOption.value
        : this.getFirstOptionValue(this.cqBootFrameTypeOptions);
    },
    getDefaultAppFrameType() {
      const extendedOption = this.cqAppFrameTypeOptions.find(
        (item) => item.label === "扩展帧"
      );
      return extendedOption
        ? extendedOption.value
        : this.getFirstOptionValue(this.cqAppFrameTypeOptions);
    },
    syncCqFieldsFromLegacy(model = this.form.instrumentModel) {
      this.ensureCqFields(model);
      if (!model) {
        return;
      }
      this.applyFixedCqDefaults(model);
      if (Number(model.serialLevel) === 2) {
        if (this.Is_Empty(model.bootCanRate) && model.bootCanRate !== 0) {
          model.bootCanRate = model.canRate;
        }
        if (this.Is_Empty(model.bootMsgType) && model.bootMsgType !== 0) {
          model.bootMsgType = this.getDefaultBootFrameType();
        }
        if (this.Is_Empty(model.msgType) && model.msgType !== 0) {
          model.msgType = this.getDefaultAppFrameType();
        }
        if (this.Is_Empty(model.cqFrameId) && model.cqFrameId !== 0) {
          model.cqFrameId = this.getFirstOptionValue(this.cqFrameIdOptions);
        }
      } else if (!this.Is_Empty(model.serialLevel) || model.serialLevel === 0) {
        if (this.Is_Empty(model.bootBaudRate) && model.bootBaudRate !== 0) {
          model.bootBaudRate = this.getFirstOptionValue(this.cqBaudOptions);
        }
        if (this.Is_Empty(model.baudRate) && model.baudRate !== 0) {
          model.baudRate = this.getFirstOptionValue(this.cqBaudOptions);
        }
        model.bootMsgType = null;
        model.bootCanRate = null;
        model.canRate = null;
        model.msgType = 0;
        model.cqFrameId = 0;
        model.cqCustomFrameId = "";
      }
    },
    handleCqCommTypeChange(type) {
      this.applyFixedCqDefaults(this.form.instrumentModel);
      if (Number(type) === 2) {
        this.form.instrumentModel.bootBaudRate = null;
        this.form.instrumentModel.baudRate = null;
        this.form.instrumentModel.bootCanRate = this.getFirstOptionValue(this.cqBootBaudOptions);
        this.form.instrumentModel.bootMsgType = this.getDefaultBootFrameType();
        this.form.instrumentModel.canRate = this.getFirstOptionValue(this.cqAppBaudOptions);
        this.form.instrumentModel.msgType = this.getDefaultAppFrameType();
        this.form.instrumentModel.cqFrameId = this.getFirstOptionValue(this.cqFrameIdOptions);
      } else if (type === null || type === undefined || type === "") {
        this.form.instrumentModel.bootBaudRate = null;
        this.form.instrumentModel.baudRate = null;
        this.form.instrumentModel.bootCanRate = null;
        this.form.instrumentModel.bootMsgType = null;
        this.form.instrumentModel.canRate = null;
        this.form.instrumentModel.msgType = null;
        this.form.instrumentModel.cqFrameId = null;
        this.form.instrumentModel.cqCustomFrameId = "";
      } else {
        const firstBaud = this.getFirstOptionValue(this.cqBaudOptions);
        this.form.instrumentModel.bootBaudRate = firstBaud;
        this.form.instrumentModel.baudRate = firstBaud;
        this.form.instrumentModel.bootCanRate = null;
        this.form.instrumentModel.bootMsgType = null;
        this.form.instrumentModel.canRate = null;
        this.form.instrumentModel.msgType = 0;
        this.form.instrumentModel.cqFrameId = 0;
        this.form.instrumentModel.cqCustomFrameId = "";
      }
    },
    handleBurnFileTypeChange() {
      this.applyFixedCqDefaults(this.form.instrumentModel);
    },
    handleCqFrameIdChange(value) {
      if (Number(value) !== 2) {
        this.form.instrumentModel.cqCustomFrameId = "";
      }
      this.clearValidateItem("form", "instrumentModel.cqCustomFrameId");
    },
    normalizeCustomFrameId(value) {
      this.form.instrumentModel.cqCustomFrameId = String(value || "")
        .toUpperCase()
        .replace(/[^0-9A-F]/g, "");
    },
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
    /** 获取项目经理列表 */
    getPersonLiableList() {
      dictByRoles(['project_manager', 'project_manage_s']).then((res) => {
        if (res.code === 200 && res.data) {
          this.personLiableList = this.normalizeDictOptions(res.data).map(item => ({
            dictValue: item.userName || item.nickName,
            dictLabel: item.nickName || item.userName
          }));
        }
      }).catch((error) => {
        console.error("获取项目经理列表失败:", error);
        this.personLiableList = [];
      });
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
        this.dicts_keyType_list = this.normalizeDictOptions(res.data);
      });
      //仪表控制器接头
      this.getDicts("instrument_controller_joint").then((res) => {
        this.dicts_controller_joint = this.normalizeDictOptions(res.data);
      });
      //仪表通讯方式1
      this.getDicts("instrument_communication_type_1").then((res) => {
        this.dicts_communication_type = this.normalizeDictOptions(res.data);
      });
      //仪表协议
      this.getDicts("instrument_agreement").then((res) => {
        this.dicts_agreement = this.normalizeDictOptions(res.data);
      });
      //仪表电压
      this.getDicts("instrument_voltage").then((res) => {
        this.dicts_voltage = this.normalizeDictOptions(res.data).map(
          ({ dictValue }) => +dictValue
        );
      });
      //仪表单位
      this.getDicts("instrument_unit").then((res) => {
        this.dicts_unit = this.normalizeDictOptions(res.data);
      });
      //仪表电量计算
      this.getDicts("instrument_power").then((res) => {
        this.dicts_power = this.normalizeDictOptions(res.data);
      });
      //仪表LOGO界面
      this.getDicts("instrument_logo").then((res) => {
        this.dicts_logo = this.normalizeDictOptions(res.data);
      });
      // 车把尺寸
      this.getDicts("handleBar_size").then((res) => {
        this.handlebarSizeData = this.normalizeDictOptions(res.data);
      });
      // 通讯协议
      this.getDicts("sys_protocol").then((res) => {
        this.sysProtocolList = this.normalizeDictOptions(res.data);
      });
      this.loadCqDictConfig();
    },
    //查看同配详情
    getDetail(row) {
      detailSampleComputer(row.computerId).then((res) => {
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
        this.ensureCqFields(val.instrumentModel);
        this.syncCqFieldsFromLegacy(val.instrumentModel);

        this.$set(this, "form", val);
      });
    },
    // 表单重置
    reset() {
      this.disabled = false;
      this.resetForm("form");
      this.form = {
        isSts: 1,
        categoryId: null,
        desc: null,
        erp: null,
        name: null,
        sn: "",
        pcbaSn: "",
        txFileUrl: null,
        instrumentModel: {
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
          bootBaudRate: null,
          bootMsgType: null,
          bootCanRate: null,
          cqPowerVoltage: null,
          cqVlk5vSwitch: 0,
          cqUpgradeProtocolType: null,
          cqBurnFileType: 0,
          fileFormat: 0,
          cqFrameId: null,
          cqCustomFrameId: "",
          serialLevel: null,
          serialLevelLog: 1,
          msgType: null,
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
      this.ensureCqFields(this.form.instrumentModel);
      this.applyFixedCqDefaults(this.form.instrumentModel);
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
        const { data } = await detailSampleComputer(computerId);
        data.instrumentModel = data.instrumentModel ?? {};
        this.ensureCqFields(data.instrumentModel);
        this.syncCqFieldsFromLegacy(data.instrumentModel);
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

          this.form = copyData;
        } else {
          // 新增拷贝
          this.form = Object.assign({}, data);
        }
      } catch (error) {
        this.msgError("操作失败");
        console.error(error);
      }
    },
    async handleCopy2(computerId) {
      try {
        const { data } = await detailComputer(computerId);
        data.instrumentModel = data.instrumentModel ?? {};
        this.ensureCqFields(data.instrumentModel);
        this.syncCqFieldsFromLegacy(data.instrumentModel);
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
          this.form = copyData;
        } else {
          // 新增拷贝
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
            this.ensureCqFields(this.form.instrumentModel);
            this.applyFixedCqDefaults(this.form.instrumentModel);
            this.syncCqFieldsFromLegacy(this.form.instrumentModel);
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
              bootBaudRate,
              bootMsgType,
              bootCanRate,
              cqPowerVoltage,
              cqVlk5vSwitch,
              cqUpgradeProtocolType,
              cqBurnFileType,
              fileFormat,
              cqFrameId,
              cqCustomFrameId,
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
              packagingInfo,
            } = this.form.instrumentModel;
            this.form.instrumentModel = {};
            this.form.instrumentModel.customerMaterialNum = customerMaterialNum;
            this.form.instrumentModel.customerName = customerName;
            this.form.instrumentModel.customerCarName = customerCarName;
            this.form.instrumentModel.id = id;
            this.form.instrumentModel.serialLevel = serialLevel;
            this.form.instrumentModel.baudRate = baudRate;
            this.form.instrumentModel.msgType = msgType;
            this.form.instrumentModel.canRate = canRate;
            this.form.instrumentModel.sn = sn;
            this.form.instrumentModel.pcbaSn = pcbaSn;
            this.form.instrumentModel.sysProtocol = sysProtocol;
            this.form.instrumentModel.labelRule = labelRule;
            this.form.instrumentModel.labelRuleImg = labelRuleImg;
            this.form.instrumentModel.bootBaudRate = bootBaudRate;
            this.form.instrumentModel.bootMsgType = bootMsgType;
            this.form.instrumentModel.bootCanRate = bootCanRate;
            this.form.instrumentModel.cqPowerVoltage = cqPowerVoltage;
            this.form.instrumentModel.cqVlk5vSwitch = cqVlk5vSwitch;
            this.form.instrumentModel.cqUpgradeProtocolType = cqUpgradeProtocolType;
            this.form.instrumentModel.cqBurnFileType = cqBurnFileType;
            this.form.instrumentModel.fileFormat = fileFormat;
            this.form.instrumentModel.cqFrameId = cqFrameId;
            this.form.instrumentModel.cqCustomFrameId = cqCustomFrameId;
            this.form.instrumentModel.controlConnect = controlConnect;
            this.form.instrumentModel.controlHead = controlHead;
            this.form.instrumentModel.notControllerJointString =
              notControllerJointString;
            this.form.instrumentModel.keyType = keyType;
            this.form.instrumentModel.keyLinkType = keyLinkType;
            this.form.instrumentModel.modelEndHead = modelEndHead;
            this.form.instrumentModel.keyEndHead = keyEndHead;
            this.form.instrumentModel.keyLineLen = keyLineLen;
            this.form.instrumentModel.keyImgUrl = keyImgUrl;
            this.form.instrumentModel.powerLogo = powerLogo;
            this.form.instrumentModel.specification = specification;
            this.form.instrumentModel.packagingInfo = packagingInfo;

            this.form.jsonStr = "";
          } else {
            // STS
            const configJsonString = this.configToJsonString();
            this.form.jsonStr = configJsonString;
          }

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
      addSampleComputer(this.form)
        .then((response) => {
          if (response.code === 200) {
            this.msgSuccess("添加成功");
            this.dialogVisible = false;
            this.$emit('refresh-list');
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
            editSampleComputer(this.form)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("拷贝成功");
                  this.dialogVisible = false;
                  this.$emit('refresh-list');
                }
              })
              .finally(() => {
                this.isSubmitLoading = false;
              });
          })
          .catch(() => { });
      } else {
        editSampleComputer(this.form)
          .then((response) => {
            if (response.code === 200) {
              this.msgSuccess("修改成功");
              this.dialogVisible = false;
              this.$emit('refresh-list');
            }
          })
          .finally(() => {
            this.isSubmitLoading = false;
          });
      }
    },

    handleStsChange(val) {
      // 只有编辑状态下，且从非STS切到STS时才赋默认值
      if (this.form.id && val === 1) {
        // 车型配置区默认值
        const defaultStsFields = {
          backlightBrightness: 5,
          sleepTime: 10,
          voltage: 36,
          undervoltage: 31.5,
          powerGear: 5,
          assistStartMagnetNumber: "2",
          assistPercentage: 128,
          currentlimiting: 12,
          assistLimit: "25",
          showWheelsize: null,
          slowStart: "1",
          wheelDiameter: 5,
          perimeter: 2000,
          unit: 1,
          agreement: 1,
          power: "1",
          speedSteel: 1,
          batteryVoltageChangeTime: "10",
          smoothLevel: "3",
          allLineErrTimeOut: "10",
          ebikeName: null,
          carModel: null,
          defaultGear: null,
          logo: "0",
          startupPasswd: 2020,
          highMenuPasswd: 2020,
          motorSys: null,
          batteryCap: 0,
          highSpeedBuzzerRemind: 0,
          tiresSize: 0,
          bluetooth: 1,
          driveAssist: 1,
          factoryReset: 0,
          rotateHandle: 0,
          buzzerSwitch: 0,
          cruise: 0,
          turnOnPasswd: 0,
          menuPassword: 0,
          isHighMenuPassword: 0,
          rotateHandleSpeedLimit: 0,
          assist: 0,
          serialLevelLog: 1,
        };
        // 只覆盖车型配置相关字段，保留其它编辑内容
        this.form.instrumentModel = {
          ...this.form.instrumentModel,
          ...defaultStsFields
        };
      }
    },
    // 标签规则
    handleLabelRule(labelRule) {
      if (labelRule === 1) this.form.instrumentModel.labelRuleImg = "";
    },
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

.cq-config-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cq-config-version-row {
  display: flex;
  gap: 12px;
}

.cq-config-card {
  padding: 14px 16px 4px;
  border: 1px solid #e8edf5;
  border-radius: 8px;
  background: #fafcff;
}

.cq-config-card--half {
  flex: 1;
}

.cq-config-card--compact {
  background: #fff;
}

.cq-config-card__title {
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 600;
  color: #3a4a66;
}

@media (max-width: 1200px) {
  .cq-config-version-row {
    flex-direction: column;
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

/deep/.el-radio:focus:not(.is-focus):not(:active):not(.is-disabled) .el-radio__inner {
  box-shadow: none !important;
}

::v-deep .tx-upload {
  display: flex;
  align-items: center;
  margin-left: 50px;

  .upload-demo {
    height: 28px;
    display: flex;

    .el-upload-list__item:first-child {
      margin-top: 5px;
    }
  }
}
</style>
