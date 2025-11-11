<template>
  <div>
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属品类" prop="categoryId">
        <el-select v-model="queryParams.categoryId" @change="changeCategory" filterable allow-create clearable
          style="width: 150px;">
          <el-option v-for="dict in dictList" :key="dict.id" :label="dict.name" :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="仪表型号" prop="computerId">
        <el-select v-model="queryParams.computerId" :loading="isCLoading" filterable remote clearable @change="getList"
          style="width: 150px;" :remote-method="getComputerNameList">
          <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.model" />
        </el-select>
      </el-form-item>
      <el-form-item label="客户名称" prop="customerName">
        <select-loadMore v-model="queryParams.customerName" :data="customerNameData.data" :page="customerNameData.page"
          :hasMore="customerNameData.more" dictLabel="name" dictValue="name" :request="getCustomerNameList"
          style="width: 150px;" />
      </el-form-item>
      <el-form-item label="型号类型" prop="customerName">
        <el-select v-model="queryParams.isBist" @change="getList" clearable style="width: 100px;">
          <el-option label="BIST型号" :value="1" />
          <el-option label="大货型号" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="产品图纸状态" prop="specificationAuditStatus">
        <el-select v-model="queryParams.specificationAuditStatus" @change="getList" clearable style="width: 120px;">
          <el-option label="拒审" :value="-1" />
          <el-option label="待初审" :value="0" />
          <el-option label="待终审" :value="1" />
          <el-option label="已审核" :value="2" />
        </el-select>
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

    <div style="position: relative">
      <!-- 固定的基础信息分组标题 -->
      <div class="fixed-group-header"></div>

    <el-table id="drag_table" ref="tableRef" row-key="id" v-loading="loading" :data="brandList"
        :height="tableHeight(10)" @selection-change="handleSelectionChange" :header-cell-class-name="headerCellClassName">
 
      <!-- 审核状态与操作合并列 -->
      <el-table-column label="审核状态" prop="state" align="center" width="200" fixed="left">
        <template v-slot="{ row }">
          <div class="audit-container">
            <!-- 配置审核状态与操作 -->
            <div class="audit-row audit-row-config">
              <div class="audit-status">
                <el-tag size="mini" v-if="row.state === 0" type="warning"><span class="tag-prefix-config">配置:</span>未审核</el-tag>
                <el-tag size="mini" v-else-if="row.state === 1" type="success"><span class="tag-prefix-config">配置:</span>初审通过</el-tag>
                <el-tag size="mini" v-else-if="row.state === 2" type="danger"><span class="tag-prefix-config">配置:</span>初审未通过</el-tag>
                <el-tag size="mini" v-else-if="row.state === 3" type="success"><span class="tag-prefix-config">配置:</span>终审通过</el-tag>
                <el-tag size="mini" v-else-if="row.state === 4" type="danger"><span class="tag-prefix-config">配置:</span>终审未通过</el-tag>
                <el-tag size="mini" v-else type="info"><span class="tag-prefix-config">配置:</span>未知状态</el-tag>
                
                <!-- 配置审核人信息 - 移到状态后面 -->
                <el-tooltip v-if="row.createBy || row.firstPerson || row.lastPerson" placement="top">
                  <div slot="content" style="line-height: 1.8;">
                    <div v-if="row.createBy">创建者：{{ row.createBy }}</div>
                    <div v-if="row.firstPerson">初审者：{{ row.firstPerson }}</div>
                    <div v-if="row.lastPerson">终审者：{{ row.lastPerson }}</div>
                  </div>
                  <i class="el-icon-user" style="color: #409EFF; cursor: pointer; font-size: 14px; margin-left: 6px;"></i>
                </el-tooltip>
              </div>
              
              <div class="audit-operations">
                <!-- 配置初审 -->
                <Tooltip v-if="row.state === 0" class="text-orange" icon="el-icon-circle-check" content="配置初审"
              v-hasPermi="['config:overview:first:check']" @click="handleAuthChange(row, 1)" />

                <!-- 配置终审 -->
                <Tooltip v-if="row.state === 1" class="text-orange" icon="el-icon-circle-check" content="配置终审"
              v-hasPermi="['config:overview:final:check']" @click="handleAuthChange(row, 2)" />

            <!-- 配置详情 -->
                <Tooltip icon="el-icon-view" content="配置详情" @click="handleOpenDetail(row)" />
                
                <!-- 配置编辑 -->
                <Tooltip v-hasPermi="['config:overview:first:edit']" icon="el-icon-edit" content="配置编辑"
                  @click="handleEdit(row)" />
          </div>
            </div>
            
            <!-- 包装审核状态与操作 -->
            <div v-if="row.packagingInfo" class="audit-row audit-row-package">
              <div class="audit-status">
                <el-tooltip v-if="row.packagingAuditStatus === -1" 
                  :content="row.packagingReasonRejection || '暂无拒绝原因'" 
                  placement="top"
                  :disabled="!row.packagingReasonRejection">
                  <el-tag size="mini" type="danger" style="cursor: pointer;"><span class="tag-prefix-package">包装:</span>拒审</el-tag>
                </el-tooltip>
                <el-tag size="mini" v-else-if="row.packagingAuditStatus === 0" type="warning"><span class="tag-prefix-package">包装:</span>待审核</el-tag>
                <el-tag size="mini" v-else-if="row.packagingAuditStatus === 1" type="success"><span class="tag-prefix-package">包装:</span>已审核</el-tag>
                <el-tag size="mini" v-else type="info"><span class="tag-prefix-package">包装:</span>--</el-tag>
                
                <!-- 包装审核人信息 - 移到状态后面 -->
                <el-tooltip v-if="row.packagingFirstPerson || row.packagingLastPerson" placement="top">
                  <div slot="content" style="line-height: 1.8;">
                    <div v-if="row.packagingLastPerson">终审者：{{ row.packagingLastPerson }}</div>
                  </div>
                  <i class="el-icon-user" style="color: #409EFF; cursor: pointer; font-size: 14px; margin-left: 6px;"></i>
                </el-tooltip>
              </div>
              
              <div class="audit-operations">
                <!-- 包装信息审核 -->
                <Tooltip v-if="row.packagingAuditStatus === 0" 
                  class="text-orange" 
                  icon="el-icon-circle-check" content="包装审核" 
                  v-hasPermi="['config:overview:packaging:final:check']" @click="handlePackagingFinalAudit(row)" />
                
            <!-- 包装信息查看 -->
                <Tooltip icon="el-icon-view" content="包装查看" 
              @click="handleSeePackagingInfo(row)" />
                
                <!-- 包装信息编辑 -->
                <Tooltip icon="el-icon-edit" content="包装编辑" 
                  v-hasPermi="['config:overview:first:editPackage']" @click="handleEditPackagingInfo(row)" />
              </div>
          </div>

            <!-- 产品图纸审核状态与操作 -->
            <div v-if="row.specification" class="audit-row audit-row-spec">
              <div class="audit-status">
                <el-tooltip v-if="row.specificationAuditStatus === -1" 
                  :content="row.specificationReasonRejection || '暂无拒绝原因'" 
                  placement="top"
                  :disabled="!row.specificationReasonRejection">
                  <el-tag size="mini" type="danger" style="cursor: pointer;"><span class="tag-prefix-spec">图纸:</span>拒审</el-tag>
                </el-tooltip>
                <el-tag size="mini" v-else-if="row.specificationAuditStatus === 0" type="warning"><span class="tag-prefix-spec">图纸:</span>待初审</el-tag>
                <el-tag size="mini" v-else-if="row.specificationAuditStatus === 1" type="warning"><span class="tag-prefix-spec">图纸:</span>待终审</el-tag>
                <el-tag size="mini" v-else-if="row.specificationAuditStatus === 2" type="success"><span class="tag-prefix-spec">图纸:</span>已审核</el-tag>

                
                <!-- 产品图纸审核人信息 - 移到状态后面 -->
                <el-tooltip v-if="row.specificationFirstPerson || row.specificationLastPerson" placement="top">
                  <div slot="content" style="line-height: 1.8;">
                    <div v-if="row.specificationFirstPerson">初审者：{{ row.specificationFirstPerson }}</div>
                    <div v-if="row.specificationLastPerson">终审者：{{ row.specificationLastPerson }}</div>
                  </div>
                  <i class="el-icon-user" style="color: #409EFF; cursor: pointer; font-size: 14px; margin-left: 6px;"></i>
                </el-tooltip>
              </div>
              
              <div class="audit-operations">
                <!-- 产品图纸初审 -->
                <Tooltip v-if="row.specificationAuditStatus === 0" 
                  class="text-orange" 
                  icon="el-icon-circle-check" content="图纸初审" 
                  v-hasPermi="['config:overview:specification:first:check']" @click="handleSpecificationFirstAudit(row)" />
                
                <!-- 产品图纸终审 -->
                <Tooltip v-if="row.specificationAuditStatus === 1" 
                  class="text-orange" 
                  icon="el-icon-circle-check" content="图纸终审" 
                  v-hasPermi="['config:overview:specification:final:check']" @click="handleSpecificationFinalAudit(row)" />
                
                <!-- 产品图纸查看 -->
                <Tooltip icon="el-icon-view" content="图纸查看" 
                  @click="handleViewSpecification(row)" />
                
                <!-- 产品图纸编辑 -->
                <Tooltip icon="el-icon-edit" content="图纸编辑" 
                  v-hasPermi="['config:overview:specification:upload']" @click="handleOpenSpecificationManage(row)" />
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <!-- 品类 -->
      <el-table-column label="品类" prop="category" align="center" width="120" fixed="left" column-key="category"
        :filters="getFiltersData('category')" :filter-method="filterHandler" />
      
      <!-- 型号 -->
      <el-table-column label="型号" prop="computerName" align="center" width="120" fixed="left" column-key="computerName"
        :filters="getFiltersData('computerName')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.computerName"></span>
      </el-table-column>
      
      <!-- 基础信息 -->
      <el-table-column label="基础信息" align="left" label-class-name="group-header-basic">
              <el-table-column label="型号类型" prop="isBist" align="center" width="180" header-align="center">
        <template slot-scope="{ row }">
          <div 
            style="display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer;"
            @click="handleEditBist(row)"
          >
            <el-tag size="small" :type="row.isBist == 1 ? 'success' : 'danger'">
              {{ row.isBist == 1 ? 'BIST型号' : '大货型号' }}
            </el-tag>
            <div  style="font-size: 12px; color: #606266; text-align: center;">
             {{ row.isBist == 1 ? '关联大货型号：' : '关联BIST型号：' }} {{ (row.relatedModelList || []).map(item => item.computerName || item.name || '-').join(', ') || '--' }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="客户" prop="customerName" align="center" width="120" column-key="customerName">
        <span slot-scope="scope" v-NoData="scope.row.customerName"></span>
      </el-table-column>
      <el-table-column label="客户料号" prop="customerMaterialNum" align="center" min-width="160" class-name="rich-text-cell-column">
          <template slot-scope="{ row }">
            <div 
              v-html="row.customerMaterialNum" 
              class="rich-text-content"
              style="overflow: auto;"
              @click="handleRichTextClick($event, row, '客户料号')"
            ></div>
          </template>
      </el-table-column>
      
      <el-table-column label="实际客户车名" prop="customerCarName" align="center" width="130" column-key="customerCarName">
        <span slot-scope="scope" v-NoData="scope.row.customerCarName"></span>
      </el-table-column>
      <el-table-column label="是否配置" prop="isStat" align="center" width="90">
        <template slot-scope="{ row }">
          <el-tag type="success" v-if="row.isSts == 1">是</el-tag>
          <el-tag type="danger" v-else>否</el-tag>
        </template>
      </el-table-column>
 
      </el-table-column>
      
      <!-- 外观信息 -->
      <el-table-column label="外观信息" align="center" label-class-name="group-header-appearance">
      <el-table-column label="产品图纸" prop="specification" align="center" width="120">
        <template slot-scope="{ row }">
          <div class="specification-upload-cell">
            <!-- 如果有图片，显示第一张预览 + 管理按钮 -->
            <div v-if="row.specification" class="spec-preview-wrapper">
              <div class="spec-image-container" @click.stop="handlePreviewSpecification(row.specification)">
                <el-image
                  style="width: 60px; height: 60px"
                  :src="getFirstImageUrl(row.specification)"
                  fit="contain"
                  :preview-src-list="[]"
                >
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </el-image>
                <!-- 图片数量徽章 -->
                <span class="spec-count-badge">{{ getImageCount(row.specification) }}</span>
              </div>
              <el-button 
                v-hasPermi="['config:overview:specification:upload']"
                type="text" 
                icon="el-icon-edit" 
                size="mini"
                @click="handleOpenSpecificationManage(row)"
              >
                上传
              </el-button>
            </div>
            <!-- 如果没有图片 -->
            <template v-else>
              <!-- 有权限：显示上传按钮 -->
              <el-button 
                v-if="checkPermi(['config:overview:specification:upload'])"
                type="text" 
                icon="el-icon-upload2" 
                size="mini"
                @click="handleOpenSpecificationManage(row)"
              >
                上传
              </el-button>
              <!-- 无权限：显示-- -->
              <span v-else>--</span>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="标签规则" align="center" width="100" >
        <template slot-scope="{ row }">
          <div v-if="row.labelRule === 2" style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <preview-img 
              v-if="row.labelRuleImg" 
              width="60px" 
              height="60px" 
              :url="row.labelRuleImg" 
            />
            <span v-else style="color: #909399; font-size: 12px;">无图片</span>
          </div>
          <span v-else v-NoData="labelRuleData[row.labelRule]" />
        </template>
      </el-table-column>
      <el-table-column label="SN" prop="sn" align="center" width="120" column-key="sn"
        :filters="getFiltersData('sn')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.sn"></span>
      </el-table-column>
      <el-table-column label="PCBA SN" prop="pcbaSn" align="center" width="120" column-key="pcbaSn"
        :filters="getFiltersData('pcbaSn')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.pcbaSn"></span>
      </el-table-column>
      <el-table-column label="车把尺寸" prop="handlebarSize" align="center" width="95" column-key="handlebarSize"
        :filters="handleDataFilter(handlebarSizeData)" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="handlebarSizeData[scope.row.handlebarSize]" />
      </el-table-column>
      <el-table-column label="控制器接头" prop="controlConnect" align="center" width="120" column-key="controlConnect"
        :filters="getFiltersData('controlConnect')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.controlConnect" />
      </el-table-column>
      <el-table-column label="控制器线长不含头mm" align="center" width="175" prop="notControllerJointString"
        column-key="notControllerJointString" :filters="getFiltersData('notControllerJointString')" :filter-method="filterHandler">
        <template slot-scope="{ row }">
          <span class="text-green" v-if="row.controlHead === 1">（含头）</span>
          <p>
            <span v-NoData="row.notControllerJointString"></span>
          </p>
        </template>
      </el-table-column>
      <el-table-column label="按键型号" prop="keyType" align="center" width="100" column-key="keyType"
        :filters="handleDataFilter(dicts_keyType_list)" :filter-method="filterHandler">
        <span slot-scope="{ row }" v-NoData="dicts_keyType_list[row.keyType]" />
      </el-table-column>
      <el-table-column label="按键连接类型" prop="keyLinkType" align="center" width="125" column-key="keyLinkType" :filters="[
        { text: '直连', value: 0 },
        { text: '快拆', value: 1 },
      ]" :filter-method="filterHandler">
        <template slot-scope="{ row }">
          <span v-if="row.keyLinkType === 0">直连</span>
          <span v-else-if="row.keyLinkType === 1">快拆</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="按键线长mm" prop="keyLineLen" align="center" width="120" column-key="keyLineLen"
        :filters="getFiltersData('keyLineLen')" :filter-method="filterHandler">
        <template slot-scope="{ row }">
          <span class="text-green" v-if="row.keyLineType === 1">（含头）</span>
          <p>
            <span v-NoData="row.keyLineLen"></span>
          </p>
        </template>
      </el-table-column>
      <el-table-column label="按键【仪表端】接头" align="center" prop="modelEndHead" width="165" column-key="modelEndHead"
        :filters="getFiltersData('modelEndHead')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.modelEndHead"></span>
      </el-table-column>
      <el-table-column label="按键【按键端】接头" align="center" prop="keyEndHead" width="165" column-key="keyEndHead"
        :filters="getFiltersData('keyEndHead')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.keyEndHead"></span>
      </el-table-column>
      </el-table-column>
      
      <!-- 车型配置 -->
      <el-table-column label="车型配置" align="center" label-class-name="group-header-config">
      <el-table-column label="蓝牙" prop="bluetooth" align="center" width="80" column-key="bluetooth" :filters="[
        { text: 'YES', value: 1 },
        { text: 'NO', value: 0 },
      ]" :filter-method="filterHandler">
        <el-tag v-if="isShow(row.bluetooth)" slot-scope="{ row }" :type="row.bluetooth === 1 ? 'success' : 'danger'">
          {{ row.bluetooth === 1 ? "YES" : "NO" }}
        </el-tag>
        <template v-else> - - - </template>
      </el-table-column>
      <el-table-column label="通讯协议" prop="sysProtocol" align="center" width="95" column-key="sysProtocol"
        :filters="handleDataFilter(dicts_protocol_list)" :filter-method="filterHandler">
        <span slot-scope="{ row }" v-NoData="dicts_protocol_list[row.sysProtocol]" />
      </el-table-column>
      <el-table-column label="通讯方式" prop="serialLevel" align="center" width="95" column-key="serialLevel"
        :filters="handleDataFilter(serialLevelData)" :filter-method="filterHandler">
        <span slot-scope="{ row }" v-NoData="serialLevelData[row.serialLevel]" />
      </el-table-column>
      <el-table-column label="实际协议" prop="showAgreement" align="center" width="90" />
      <el-table-column label="配置协议" prop="agreement" align="center" width="95" column-key="agreement"
        :filters="handleDataFilter(dicts_agreement)" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="dicts_agreement[scope.row.agreement]" />
      </el-table-column>
      <el-table-column label="系统电压" prop="voltage" align="center" width="95" column-key="voltage"
        :filters="getFiltersData('voltage')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.voltage"></span>
      </el-table-column>
      <el-table-column label="欠压门限" prop="undervoltage" align="center" width="95" column-key="undervoltage"
        :filters="getFiltersData('undervoltage')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.undervoltage"></span>
      </el-table-column>
      <el-table-column label="实际轮径" prop="showWheelDiameter" align="center" width="95" />
      <el-table-column label="配置轮径" prop="wheelDiameter" align="center" width="95" column-key="wheelDiameter"
        :filters="handleDataFilter(wheelDiameterData)" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="wheelDiameterData[scope.row.wheelDiameter]"></span>
      </el-table-column>
      <el-table-column label="周长" prop="perimeter" align="center" width="95" column-key="perimeter"
        :filters="getFiltersData('perimeter')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.perimeter"></span>
      </el-table-column>
      <el-table-column label="助力档位数" prop="powerGear" align="center" width="110" column-key="powerGear"
        :filters="getFiltersData('powerGear')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.powerGear"></span>
      </el-table-column>
      <el-table-column label="默认档位" prop="defaultGear" align="center" width="95" column-key="defaultGear"
        :filters="getFiltersData('defaultGear')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.defaultGear"></span>
      </el-table-column>
      <el-table-column label="测速磁钢数" prop="speedSteel" align="center" width="110" column-key="speedSteel"
        :filters="getFiltersData('speedSteel')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.speedSteel"></span>
      </el-table-column>
      <el-table-column label="助力限速门限" prop="assistLimit" align="center" width="125" column-key="assistLimit"
        :filters="getFiltersData('assistLimit')" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="scope.row.assistLimit"></span>
      </el-table-column>
      <el-table-column label="限速范围" prop="speedLimitRang" align="center" width="110" column-key="speedLimitRang">
        <span slot-scope="scope" v-NoData="scope.row.speedLimitRang"></span>
      </el-table-column>
      <el-table-column label="显示单位" prop="unit" align="center" width="95" column-key="unit"
        :filters="handleDataFilter(dicts_unit)" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="dicts_unit[scope.row.unit]"></span>
      </el-table-column>
      <el-table-column label="LOGO界面" prop="logo" align="center" width="120" column-key="logo"
        :filters="handleDataFilter(dicts_logo)" :filter-method="filterHandler">
        <span slot-scope="scope" v-NoData="dicts_logo[scope.row.logo]"></span>
      </el-table-column>
      <el-table-column label="开机LOGO" prop="powerLogo" align="center" width="120">
        <template slot-scope="{ row }">
          <preview-img width="45px" height="45px" :url="row.powerLogo" />
        </template>
      </el-table-column>
      </el-table-column>
      
      <!-- 包装信息 -->
      <el-table-column label="包装信息" align="center" label-class-name="group-header-package">
      <el-table-column label="附件出货方式" align="center">
        <el-table-column label="支架螺丝" align="center" width="120">
          <template slot-scope="{ row }">
            <span v-NoData="getPackagingValue(row, '解件出库方式', '支架螺丝')"></span>
          </template>
      </el-table-column>
        <el-table-column label="按键螺丝" align="center" width="120">
          <template slot-scope="{ row }">
            <span v-NoData="getPackagingValue(row, '解件出库方式', '按键螺丝')"></span>
          </template>
      </el-table-column>
        <el-table-column label="硅胶垫片" align="center" width="120">
          <template slot-scope="{ row }">
            <span v-NoData="getPackagingValue(row, '解件出库方式', '硅胶垫片')"></span>
          </template>
      </el-table-column>
        <el-table-column label="其它附件要求" header-align="center" align="left" min-width="220" class-name="rich-text-cell-column">
          <template slot-scope="{ row }">
            <div 
              v-if="!isRichTextEmpty(getPackagingValue(row, '解件出库方式', '其它附件要求'))"
              v-html="getPackagingValue(row, '解件出库方式', '其它附件要求')" 
              class="rich-text-content"
              @click="handleRichTextClick($event, row, '解件出库方式', '其它附件要求')"
            ></div>
            <span v-else>--</span>
          </template>
      </el-table-column>
      </el-table-column>

      <el-table-column label="附件装箱方式" header-align="center" align="left" min-width="220" class-name="rich-text-cell-column">
        <template slot-scope="{ row }">
          <div>
            <div class="select-value-text">{{ getPackagingValue(row, '附件装箱方式', 'value') || '--' }}</div>
            <div v-if="shouldShowAdministrator(getPackagingValue(row, '附件装箱方式', 'value')) && !isRichTextEmpty(getPackagingValue(row, '附件装箱方式', 'administrator'))" 
                 v-html="getPackagingValue(row, '附件装箱方式', 'administrator')" 
                 class="rich-text-content text-muted"
                 @click="handleRichTextClick($event, row, '附件装箱方式', 'administrator')"></div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="箱唛要求" header-align="center" align="left" min-width="220" class-name="rich-text-cell-column">
        <template slot-scope="{ row }">
          <div>
            <div class="select-value-text">{{ getPackagingValue(row, '箱唛要求', 'value') || '--' }}</div>
            <div v-if="shouldShowAdministrator(getPackagingValue(row, '箱唛要求', 'value')) && !isRichTextEmpty(getPackagingValue(row, '箱唛要求', 'administrator'))" 
                 v-html="getPackagingValue(row, '箱唛要求', 'administrator')" 
                 class="rich-text-content text-muted"
                 @click="handleRichTextClick($event, row, '箱唛要求', 'administrator')"></div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="检验报告要求" header-align="center" align="left" min-width="220" class-name="rich-text-cell-column">
        <template slot-scope="{ row }">
          <div>
            <div class="select-value-text">{{ getPackagingValue(row, '检验报告要求', 'value') || '--' }}</div>
            <div v-if="shouldShowAdministrator(getPackagingValue(row, '检验报告要求', 'value')) && !isRichTextEmpty(getPackagingValue(row, '检验报告要求', 'administrator'))" 
                 v-html="getPackagingValue(row, '检验报告要求', 'administrator')" 
                 class="rich-text-content text-muted"
                 @click="handleRichTextClick($event, row, '检验报告要求', 'administrator')"></div>
          </div>
        </template>
      </el-table-column>
      </el-table-column>

    </el-table>
    </div>

    <div style="display: flex; align-items: center; justify-content: space-between;">
      <el-alert 
        title="表格可通过按住Ctrl + 鼠标左键左右拖动" 
        type="success" 
        show-icon
        :closable="false"
        style="flex: 0 0 auto; margin-right: 20px;width:fit-content;">
      </el-alert>
      
      <pagination 
        v-if="total > 0" 
        :total="total" 
        :ls="[10,20,30,40, 50, 100, 300, 500]" 
        :page.sync="queryParams.p"
        :limit.sync="queryParams.l" 
        @pagination="getList" 
        style="flex: 1; display: flex; justify-content: flex-end;" />
    </div>

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
      <el-descriptions direction="vertical" :column="6" border>
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
      </el-descriptions>
    </el-dialog>

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
      <el-descriptions direction="vertical" :column="6" border>
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
    <PackagingInfoEdit 
      ref="packInfoEditRef" 
      :visible.sync="packagingEditVisible"
      :packagingInfo="currentPackagingInfo"
      @save="handlePackagingInfoSave"
    />
    <SpecificationManage
      :visible.sync="specificationManageVisible"
      :currentRow="currentSpecificationRow"
      :viewOnly="specificationViewMode"
      :uploadImageMethod="uploadImageForSpecification"
      :uploadPdfMethod="uploadPdfForSpecification"
      @save="handleSpecificationSave"
    />
    <addDialog ref="addDialogRef" @refresh-list="getList" />
    
    <!-- 图片预览组件 -->
    <el-image-viewer 
      v-if="showImageViewer" 
      :url-list="previewImageList" 
      :initial-index="currentImageIndex"
      :on-close="closeImageViewer"
    />
    
    <!-- 审核对话框 -->
    <el-dialog 
      :title="auditDialog.title" 
      :visible.sync="auditDialog.visible" 
      width="500px"
      top='0vh'
      append-to-body
    >
      <el-form :model="auditDialog.form" :rules="auditDialog.rules" ref="auditForm" label-width="100px">
        <el-form-item label="审核结果" prop="status">
          <el-radio-group v-model="auditDialog.form.status">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="-1">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item 
          label="拒绝原因" 
          prop="why"
          v-if="auditDialog.form.status === -1"
        >
          <el-input 
            v-model="auditDialog.form.why" 
            type="textarea" 
            :rows="4"
            placeholder="请输入拒绝原因"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="auditDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="handleAuditConfirm" :loading="auditDialog.loading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { computerNameList } from "@/api/third/fileConfig";
import {
  modelConfigList,
  modelConfigState,
  ConfigExport,
} from "@/api/third/testApi";
import { editComputer, detailComputer, packagingFirstAudit, packagingFinalAudit, specificationFirstAudit, specificationFinalAudit } from "@/api/third/computer";
import commonData from "@/mixins/commonData";
import ParamsCompare from "./ParamsCompare.vue";
import { getCustomerList } from "@/api/order";
import addDialog from '@/views/third/productFamily/index.vue'
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
import axios from "axios";
import reqUrl from "@/utils/requestUrl";
// 导入包装信息字段配置 - 统一管理所有字段定义
import { getFieldValue, PACKAGING_FIELDS } from '@/config/fieldConfigs/packaging';
// 导入权限检查方法
import { checkPermi } from '@/utils/permission';

export default {
  name: "ConfigOverview",
  mixins: [commonData],
  props: {
    categoryId: {
      type: [String, Number],
      default: undefined
    },
    computerId: {
      type: String,
      default: undefined
    }
  },
  components: {
    addDialog,
    CategoryComputer: () => import("@/components/CategoryComputer"),
    ParamsCompare,
    PackagingInfo: () => import("./packagingInfo"),
    PackagingInfoEdit: () => import("./packagingInfoEdit"),
    SpecificationManage: () => import("./SpecificationManage"),
    ElImageViewer,
  },
  mounted() {
    // 初始化表格拖拽功能
    this.$nextTick(() => {
      this.initTableDrag();
    });
  },
  data() {
    return {
      uploadIds: [],
      dragEventListeners: [], // 存储事件监听器引用
      isDrawerFlag: false,
      isSample: false,
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
      // 包装信息编辑
      packagingEditVisible: false,
      currentPackagingInfo: null,
      currentEditRow: null, // 当前编辑的行数据
      // 产品图纸管理
      specificationManageVisible: false,
      currentSpecificationRow: null,
      specificationViewMode: false, // 是否为查看模式
      // 图片预览
      showImageViewer: false,
      previewImageList: [],
      currentImageIndex: 0,
      presenceFilterOptions: [
        { text: '有', value: 'has' },
        { text: '无', value: 'none' }
      ],
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
        l: 50,
        categoryId: undefined,
        computerId: undefined,
        customerName: undefined,
        specificationAuditStatus: undefined,
      },
      // 审核对话框
      auditDialog: {
        visible: false,
        loading: false,
        title: '',
        type: '', // 'packagingFirst', 'packagingFinal', 'specificationFirst', 'specificationFinal'
        currentRow: null,
        form: {
          id: '',
          status: 1, // 1:通过, -1:拒绝
          why: ''
        },
        rules: {
          status: [
            { required: true, message: '请选择审核结果', trigger: 'change' }
          ],
          why: [
            { required: true, message: '请输入拒绝原因', trigger: 'blur' },
            { min: 5, message: '拒绝原因至少5个字符', trigger: 'blur' }
          ]
        }
      },
    };
  },
  watch: {
    // 监听传入的 categoryId 变化
    categoryId: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal && newVal) {
          this.queryParams.categoryId = newVal;
          this.changeCategory(newVal);
        }
      },
      immediate: false
    },
    // 监听传入的 computerId 变化
    computerId: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal && newVal) {
          this.queryParams.computerId = newVal;
          this.getList();
        }
      },
      immediate: false
    }
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

    // 处理传入的路由参数
    if (this.categoryId) {
      this.queryParams.categoryId = this.categoryId;
    }
    if (this.computerId) {
      this.queryParams.computerId = this.computerId;
    }

    this.getList();
  },
  activated() {
    this.getCategoryComputerDict();

    // 处理传入的路由参数（处理缓存情况）
    if (this.categoryId && this.queryParams.categoryId !== this.categoryId) {
      this.queryParams.categoryId = this.categoryId;
      this.changeCategory(this.categoryId);
    }
    if (this.computerId && this.queryParams.computerId !== this.computerId) {
      this.queryParams.computerId = this.computerId;
      this.getList();
    }
  },
  beforeDestroy() {
    // 清理事件监听器
    if (this.dragEventListeners) {
      this.dragEventListeners.forEach(({ element, type, listener }) => {
        element.removeEventListener(type, listener);
      });
    }
  },
  methods: {
    // 权限检查方法（在模板中使用）
    checkPermi,
    
    // 表头二级、三级着色：根据列名匹配所属分组
    headerCellClassName({ column, rowIndex }) {
      // 只对多级表头的子行着色（但顶级也兼容）
      const label = (column && column.label) || ''

      const basic = new Set([
        '操作', '审核状态', '品类', '型号', '客户', '客户料号', '实际客户车名', '是否配置', 'BIST型号', '关联型号', '型号类型'
      ])
      const appearance = new Set([
        '产品图纸', '标签规则', 'SN', 'PCBA SN', '车把尺寸', '控制器接头', '控制器线长不含头mm',
        '按键型号', '按键连接类型', '按键线长mm', '按键【仪表端】接头', '按键【按键端】接头'
      ])
      const vehicleCfg = new Set([
        '蓝牙', '通讯协议', '通讯方式', '实际协议', '配置协议', '系统电压', '欠压门限', '实际轮径', '配置轮径',
        '周长', '助力档位数', '默认档位', '测速磁钢数', '助力限速门限', '限速范围', '显示单位',
        'LOGO界面', '开机LOGO'
      ])
      const packageSet = new Set([
        '包装信息', '附件出货方式', '支架螺丝', '按键螺丝', '硅胶垫片', '其它附件要求',
        '附件装箱方式', '箱唛要求', '检验报告要求'
      ])

      if (basic.has(label)) return 'group-header-basic'
      if (appearance.has(label)) return 'group-header-appearance'
      if (vehicleCfg.has(label)) return 'group-header-config'
      if (packageSet.has(label)) return 'group-header-package'
      return ''
    },
    // 初始化表格拖拽功能
    initTableDrag() {
      let isDragging = false;
      let isCtrlDown = false;

      // 移除之前的事件监听器
      if (this.dragEventListeners) {
        this.dragEventListeners.forEach(({ element, type, listener }) => {
          element.removeEventListener(type, listener);
        });
      }
      this.dragEventListeners = [];

      const scrollContainer = this.$refs.tableRef?.$el?.querySelector(".el-table__body-wrapper");

      if (!scrollContainer) {
        console.warn("Table scroll container not found");
        return;
      }

      // 键盘按下事件
      const keydownHandler = (event) => {
        if (event.key === "Control" || event.key === "Meta") {
          isCtrlDown = true;
        }
      };

      // 键盘释放事件
      const keyupHandler = (event) => {
        if (event.key === "Control" || event.key === "Meta") {
          isCtrlDown = false;
          isDragging = false;
        }
      };

      // 鼠标按下事件
      const mousedownHandler = (event) => {
        if (isCtrlDown) {
          isDragging = true;
          event.preventDefault();
        }
      };

      // 鼠标移动事件
      const mousemoveHandler = (event) => {
        if (isDragging) {
          const scrollLeft = scrollContainer.scrollLeft;
          const deltaX = event.movementX;
          scrollContainer.scrollLeft = scrollLeft - deltaX;
          event.preventDefault();
        }
      };

      // 鼠标释放事件
      const mouseupHandler = (event) => {
        if (isDragging) {
          isDragging = false;
        }
      };

      // 点击事件
      const clickHandler = (event) => {
        if (isDragging) {
          event.preventDefault();
          event.stopPropagation();
        }
      };

      // 添加事件监听器
      document.addEventListener("keydown", keydownHandler);
      document.addEventListener("keyup", keyupHandler);
      document.addEventListener("mousedown", mousedownHandler);
      document.addEventListener("mousemove", mousemoveHandler);
      document.addEventListener("mouseup", mouseupHandler);
      document.addEventListener("click", clickHandler);

      // 保存事件监听器引用以便后续清理
      this.dragEventListeners = [
        { element: document, type: "keydown", listener: keydownHandler },
        { element: document, type: "keyup", listener: keyupHandler },
        { element: document, type: "mousedown", listener: mousedownHandler },
        { element: document, type: "mousemove", listener: mousemoveHandler },
        { element: document, type: "mouseup", listener: mouseupHandler },
        { element: document, type: "click", listener: clickHandler }
      ];
    },
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      this.brandList = [];
      modelConfigList(this.queryParams).then((res) => {
        const { list, total } = res.data;
        this.brandList = list;
        this.total = total;
        this.loading = false;
        
        // 调试：打印第一条数据查看审核状态字段
        if (list && list.length > 0) {
          console.log('📋 列表数据示例:', list[0]);
          console.log('包装审核状态:', list[0].packagingAuditStatus);
          console.log('规格书审核状态:', list[0].specificationAuditStatus);
          console.log('包装信息:', list[0].packagingInfo);
          console.log('规格书:', list[0].specification);
        }
        
        // 表格数据加载完成后重新初始化拖拽功能
        this.$nextTick(() => {
          this.$refs.tableRef && this.$refs.tableRef.doLayout()
          this.initTableDrag();
        });
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
      // 完全重置查询参数和相关数据 - 不保留任何默认值
      this.queryParams = {
        p: 1,
        l: 10,
        categoryId: undefined,
        computerId: undefined,
        customerName: undefined,
        specificationAuditStatus: undefined,
      };

      // 清空相关选项
      this.computerOptions = [];
      this.dateRange = [];

      // 重置表单
      this.resetForm("queryForm");

      // 直接查询，不恢复任何路由参数
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
      this.isSample = false;
      this.deployData = Object.assign({}, row);
    },
    handleParamsCompare() {
      this.isParamsCompareShow = true;
    },
    // 查看包装信息
    handleSeePackagingInfo(row) {
      console.log('👀 查看包装信息 - 原始 row 数据:', row)
      console.log('📦 row.packagingInfo:', row.packagingInfo)
      
      this.$refs.packInfoRef.isDialogVisible = true;
      this.$refs.packInfoRef.packagingInfo = row.packagingInfo || "";
    },
    handleEditPackagingInfo(row) {
      console.log('📝 编辑包装信息:', row)
      console.log('📦 row.packagingInfo:', row.packagingInfo)
      
      this.currentEditRow = row
      this.currentPackagingInfo = row.packagingInfo || ""
      console.log('📦 最终加载的包装信息:', this.currentPackagingInfo)
      this.packagingEditVisible = true
    },
    
    // 获取完整的设备详情
    async getComputerDetail(computerId) {
      try {
        return await detailComputer(computerId)
      } catch (error) {
        console.error('获取设备详情失败:', error)
        return null
      }
    },
    
    // 保存包装信息
    async handlePackagingInfoSave(newFormatData) {
      console.log('💾 保存包装信息:', newFormatData)
      console.log('📦 当前行数据:', this.currentEditRow)
      
      if (!this.currentEditRow) {
        this.$message.error('未找到编辑行数据')
        return
      }

      try {
        const loading = this.$loading({
          lock: true,
          text: '保存中...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        // ⭐ 关键修复：先获取完整的详情数据，避免字段丢失
        const detailRes = await this.getComputerDetail(this.currentEditRow.computerId)
        
        if (!detailRes || detailRes.code !== 200) {
          loading.close()
          this.$message.error('获取详情失败')
          return
        }
        
        const fullData = detailRes.data
        console.log('📋 获取到的完整数据:', fullData)
        
        // 构造完整的提交数据，只更新 packagingInfo 字段
        const packagingInfoStr = JSON.stringify(newFormatData)
        const computerData = {
          ...fullData,  // 使用完整数据
          instrumentModel: {
            ...(fullData.instrumentModel || {}),  // 展开完整的 instrumentModel
            packagingInfo: packagingInfoStr  // 只更新 packagingInfo
          }
        }
        
        console.log('📤 提交的数据:', computerData)
        console.log('📦 新的包装信息:', packagingInfoStr)

        // 调用编辑仪表接口
        const res = await editComputer(computerData)

        loading.close()

        if (res.code === 200) {
          this.$message.success('保存成功')
          
          // 更新 packagingInfo
          this.$set(this.currentEditRow, 'packagingInfo', packagingInfoStr)
          
          console.log('✅ 数据更新完成，packagingInfo:', this.currentEditRow.packagingInfo)
          
          // 刷新列表获取最新数据
          this.getList()
        } else {
          this.$message.error(res.msg || '保存失败')
        }
      } catch (error) {
        console.error('保存包装信息失败:', error)
        this.$message.error('保存失败: ' + (error.message || '未知错误'))
      }
    },
    
    // ==================== 审核相关方法 ====================
    
    // 包装信息初审
    handlePackagingFirstAudit(row) {
      this.auditDialog.title = '包装信息初审';
      this.auditDialog.type = 'packagingFirst';
      this.auditDialog.currentRow = row;
      this.auditDialog.form.id = row.id;
      this.auditDialog.form.status = 1;
      this.auditDialog.form.why = '';
      this.auditDialog.visible = true;
    },
    
    // 包装信息终审
    handlePackagingFinalAudit(row) {
      this.auditDialog.title = '包装信息终审';
      this.auditDialog.type = 'packagingFinal';
      this.auditDialog.currentRow = row;
      this.auditDialog.form.id = row.id;
      this.auditDialog.form.status = 1;
      this.auditDialog.form.why = '';
      this.auditDialog.visible = true;
    },
    
    // 产品图纸初审
    handleSpecificationFirstAudit(row) {
      this.auditDialog.title = '产品图纸初审';
      this.auditDialog.type = 'specificationFirst';
      this.auditDialog.currentRow = row;
      this.auditDialog.form.id = row.id;
      this.auditDialog.form.status = 1;
      this.auditDialog.form.why = '';
      this.auditDialog.visible = true;
    },
    
    // 产品图纸终审
    handleSpecificationFinalAudit(row) {
      this.auditDialog.title = '产品图纸终审';
      this.auditDialog.type = 'specificationFinal';
      this.auditDialog.currentRow = row;
      this.auditDialog.form.id = row.id;
      this.auditDialog.form.status = 1;
      this.auditDialog.form.why = '';
      this.auditDialog.visible = true;
    },
    
    // 确认审核
    async handleAuditConfirm() {
      // 如果拒绝，验证拒绝原因
      if (this.auditDialog.form.status === -1) {
        if (!this.auditDialog.form.why || this.auditDialog.form.why.trim() === '') {
          this.$message.warning('请输入拒绝原因');
          return;
        }
        if (this.auditDialog.form.why.trim().length < 5) {
          this.$message.warning('拒绝原因至少5个字符');
          return;
        }
      }
      
      this.auditDialog.loading = true;
      
      try {
        let apiFunction = null;
        let successMsg = '';
        
        // 根据审核类型选择对应的API
        switch (this.auditDialog.type) {
          case 'packagingFirst':
            apiFunction = packagingFirstAudit;
            successMsg = '包装信息初审完成';
            break;
          case 'packagingFinal':
            apiFunction = packagingFinalAudit;
            successMsg = '包装信息终审完成';
            break;
          case 'specificationFirst':
            apiFunction = specificationFirstAudit;
            successMsg = '产品图纸初审完成';
            break;
          case 'specificationFinal':
            apiFunction = specificationFinalAudit;
            successMsg = '产品图纸终审完成';
            break;
          default:
            this.$message.error('未知的审核类型');
            this.auditDialog.loading = false;
            return;
        }
        
        // 准备提交数据
        const submitData = {
          id: this.auditDialog.form.id,
          status: this.auditDialog.form.status === 1 ? 0 : 1, // API中 0:通过, 1:拒绝
          why: this.auditDialog.form.why || ''
        };
        
        console.log('审核提交数据:', submitData);
        
        // 调用API
        const res = await apiFunction(submitData);
        
        if (res.code === 200) {
          this.$message.success(successMsg);
          
          // 关闭对话框
          this.auditDialog.visible = false;
          
          // 刷新列表
          this.getList();
        } else {
        }
      } catch (error) {
        console.error('审核失败:', error);
        this.$message.error('审核操作失败: ' + (error.message || '未知错误'));
      } finally {
        this.auditDialog.loading = false;
      }
    },
    
    // ==================== 审核相关方法结束 ====================
    
    // 多选框选中数据
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
    
    // 编辑BIST关联型号
    handleEditBist(row) {
      // 权限判断
      if (!this.checkPermi(['config:overview:bist:edit'])) {
        this.$message.warning('您没有权限编辑BIST关联型号')
        return
      }
      let item = { ...row, id: row.computerId };
      this.$refs.addDialogRef.handleUpdate(item,{ isPackage: false, eidtBist: true});
    },
    
    /**
     * 获取包装信息字段值（使用配置文件工具函数）
     * 优势：自动处理历史字段名兼容，代码更简洁
     */
    getPackagingValue(row, groupName, fieldName) {
      if (!row.packagingInfo) return '';
      
      try {
        let packagingData = row.packagingInfo;
        
        // 如果是字符串，先解析
        if (typeof packagingData === 'string') {
          packagingData = JSON.parse(packagingData);
        }
        
        // 检测数据格式
        if (Array.isArray(packagingData)) {
          // 旧格式数据，统一显示 -- 表示不支持
          return '--';
        } else if (typeof packagingData === 'object') {
          // 新格式数据 - 使用配置文件的工具函数（自动处理历史字段名）
          return getFieldValue(packagingData, groupName, fieldName);
        }
        
        return '';
      } catch (error) {
        console.error('解析包装信息失败:', error);
        return '';
      }
    },
    
    /**
     * 判断富文本内容是否为空（包括只有空p标签的情况）
     * 修复：支持检测图片、视频等媒体元素
     */
    isRichTextEmpty(htmlContent) {
      if (!htmlContent) return true;
      
      // 创建临时div来解析HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // 检查是否包含媒体元素（图片、视频等）
      const hasMedia = tempDiv.querySelector('img, video, audio, iframe');
      if (hasMedia) {
        return false; // 包含媒体元素，不为空
      }
      
      // 获取纯文本内容（去除所有HTML标签）
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      // 判断纯文本是否为空（去除空白字符后）
      return textContent.trim() === '';
    },
    
    // 注意：getOldFormatValue、convertOldContentId、getNewFormatValue 方法已移除
    // 这些功能已由配置文件（packagingFieldsConfig.js）的工具函数统一处理
    // 好处：字段管理集中化，历史兼容性自动处理，代码更简洁
    
    /**
     * 判断是否应该显示附件内容（administrator字段）
     * 修改为：所有下拉框字段都显示富文本内容（如果有内容的话）
     */
    shouldShowAdministrator(value) {
      // 始终显示富文本内容（只要选择了值）
      return true;
    },
    
    // 处理富文本内容点击事件
    handleRichTextClick(event, row, groupName, fieldName) {
      const target = event.target;
      
      // 处理图片点击
      if (target.tagName === 'IMG') {
        event.preventDefault();
        event.stopPropagation();
        
        // 获取当前富文本内容中的所有图片
        const content = this.getPackagingValue(row, groupName, fieldName);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const images = Array.from(tempDiv.querySelectorAll('img'));
        
        // 提取所有图片地址
        this.previewImageList = images.map(img => img.src);
        
        // 找到当前点击图片的索引
        this.currentImageIndex = images.findIndex(img => img.src === target.src);
        if (this.currentImageIndex === -1) {
          this.currentImageIndex = 0;
        }
        
        // 显示图片预览
        this.showImageViewer = true;
      }
      
      // 处理链接点击（可选：在新窗口打开）
      if (target.tagName === 'A') {
        event.preventDefault();
        event.stopPropagation();
        const href = target.getAttribute('href');
        if (href) {
          window.open(href, '_blank');
        }
      }
    },
    
    // 关闭图片预览
    closeImageViewer() {
      this.showImageViewer = false;
      this.previewImageList = [];
      this.currentImageIndex = 0;
    },
    
    // 打开产品图纸管理对话框（编辑模式）
    handleOpenSpecificationManage(row) {
      console.log('📝 打开产品图纸管理:', row);
      this.currentSpecificationRow = row;
      this.specificationViewMode = false; // 编辑模式
      this.specificationManageVisible = true;
    },
    
    // 保存产品图纸
    async handleSpecificationSave(imageUrl) {
      console.log('💾 保存产品图纸:', imageUrl);
      
      if (!this.currentSpecificationRow) {
        this.$message.error('未找到行数据');
        return;
      }
      
      const loading = this.$loading({
        lock: true,
        text: '保存中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      
      try {
        await this.updateSpecification(this.currentSpecificationRow, imageUrl);
      } catch (error) {
        console.error('保存失败:', error);
      } finally {
        loading.close();
      }
    },
    
    // 为SpecificationManage组件提供的图片上传方法
    async uploadImageForSpecification(file) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        // 上传图片到OSS
        const uploadRes = await axios.post(reqUrl + '/oss/batch-upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        if (uploadRes.data.code === 200 && uploadRes.data.data) {
          let imageUrl = '';
          
          // 处理返回的数据格式（统一处理数组格式）
          if (Array.isArray(uploadRes.data.data)) {
            // 拦截空数组
            if (uploadRes.data.data.length === 0) {
              throw new Error('未返回图片地址');
            }
            
            // 提取所有图片URL
            const imageUrls = uploadRes.data.data.map(item => {
              const url = item?.url || item;
              // 清理URL中的反引号和空格
              return typeof url === 'string' ? url.replace(/`/g, '').trim() : url;
            }).filter(url => url && url.trim() !== ''); // 过滤掉空URL
            
            if (imageUrls.length === 0) {
              throw new Error('未获取到有效图片地址');
            }
            
            // 将所有图片URL用逗号连接（通常单张图片只有一个URL）
            imageUrl = imageUrls.join(',');
          } else if (typeof uploadRes.data.data === 'object') {
            imageUrl = uploadRes.data.data.url;
            // 清理URL中的反引号和空格
            if (typeof imageUrl === 'string') {
              imageUrl = imageUrl.replace(/`/g, '').trim();
            }
          } else {
            imageUrl = uploadRes.data.data;
            // 清理URL中的反引号和空格
            if (typeof imageUrl === 'string') {
              imageUrl = imageUrl.replace(/`/g, '').trim();
            }
          }
          
          // 验证 imageUrl 是否有效
          if (!imageUrl || imageUrl.trim() === '') {
            throw new Error('图片地址为空');
          }
          
          return imageUrl;
        } else {
          throw new Error(uploadRes.data.msg || '上传失败');
        }
      } catch (error) {
        console.error('图片上传失败:', error);
        throw error;
      }
    },
    
    // 为SpecificationManage组件提供的PDF上传方法
    async uploadPdfForSpecification(file) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        // 调用PDF转图片接口
        const convertRes = await axios.post(reqUrl + '/file/converterToOss', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        if (convertRes.data.code === 200 && convertRes.data.data) {
          let imageUrl = '';
          
          // 处理返回的数据格式（可能是数组或单个URL）
          if (Array.isArray(convertRes.data.data)) {
            // 拦截空数组
            if (convertRes.data.data.length === 0) {
              throw new Error('PDF转换失败：未生成图片');
            }
            
            // 如果是数组，保存所有图片URL（用逗号分隔）
            const imageUrls = convertRes.data.data.map(item => {
              const url = item?.url || item;
              // 清理URL中的反引号和空格
              return typeof url === 'string' ? url.replace(/`/g, '').trim() : url;
            }).filter(url => url && url.trim() !== ''); // 过滤掉空URL
            
            if (imageUrls.length === 0) {
              throw new Error('PDF转换失败：未生成有效图片');
            }
            
            // 将所有图片URL用逗号连接
            imageUrl = imageUrls.join(',');
          } else if (typeof convertRes.data.data === 'object') {
            imageUrl = convertRes.data.data.url;
            // 清理URL中的反引号和空格
            if (typeof imageUrl === 'string') {
              imageUrl = imageUrl.replace(/`/g, '').trim();
            }
          } else {
            imageUrl = convertRes.data.data;
            // 清理URL中的反引号和空格
            if (typeof imageUrl === 'string') {
              imageUrl = imageUrl.replace(/`/g, '').trim();
            }
          }
          
          // 验证 imageUrl 是否有效
          if (!imageUrl || imageUrl.trim() === '') {
            throw new Error('PDF转换失败：图片URL为空');
          }
          
          return imageUrl;
        } else {
          throw new Error(convertRes.data.msg || 'PDF转换失败');
        }
      } catch (error) {
        console.error('PDF转换失败:', error);
        throw error;
      }
    },
    
    // 获取第一张图片URL（处理逗号分隔的多图情况）
    getFirstImageUrl(url) {
      if (!url) return '';
      
      // 清理URL中的反引号和多余空格
      let cleanUrl = url.replace(/`/g, '').trim();
      
      // 如果包含逗号，说明有多张图片，取第一张
      if (cleanUrl.includes(',')) {
        const urls = cleanUrl.split(',').map(u => u.trim()).filter(u => u);
        return urls[0] || '';
      }
      
      return cleanUrl;
    },
    
    // 获取图片数量
    getImageCount(url) {
      if (!url) return 0;
      
      // 清理URL中的反引号和多余空格
      let cleanUrl = url.replace(/`/g, '').trim();
      
      // 如果包含逗号，说明有多张图片
      if (cleanUrl.includes(',')) {
        const urls = cleanUrl.split(',').map(u => u.trim()).filter(u => u);
        return urls.length;
      }
      
      // 单张图片
      return cleanUrl ? 1 : 0;
    },
    
    // 获取所有图片URL列表
    getAllImageUrls(url) {
      if (!url) return [];
      
      // 清理URL中的反引号和多余空格
      let cleanUrl = url.replace(/`/g, '').trim();
      
      // 如果包含逗号，说明有多张图片
      if (cleanUrl.includes(',')) {
        return cleanUrl.split(',').map(u => u.trim()).filter(u => u);
      }
      
      // 单张图片
      return cleanUrl ? [cleanUrl] : [];
    },
    
    // 预览产品图纸（支持多图左右切换）
    handlePreviewSpecification(url) {
      const imageUrls = this.getAllImageUrls(url);
      if (imageUrls.length === 0) {
        this.$message.warning('暂无图片可预览');
        return;
      }
      
      // 使用 el-image-viewer 显示图片
      this.previewImageList = imageUrls;
      this.currentImageIndex = 0; // 从第一张开始
      this.showImageViewer = true;
    },
    
    // 查看产品图纸（从操作按钮触发）- 打开查看模式对话框
    handleViewSpecification(row) {
      if (!row.specification) {
        this.$message.warning('暂无图纸可查看');
        return;
      }
      console.log('👁️ 查看产品图纸:', row);
      this.currentSpecificationRow = row;
      this.specificationViewMode = true; // 查看模式
      this.specificationManageVisible = true;
    },
    
    // 更新产品图纸
    async updateSpecification(row, imageUrl) {
      try {
        // ⭐ 关键修复：先获取完整的详情数据，避免字段丢失
        const detailRes = await this.getComputerDetail(row.computerId)
        
        if (!detailRes || detailRes.code !== 200) {
          this.$message.error('获取详情失败')
          return
        }
        
        const fullData = detailRes.data
        console.log('📋 获取到的完整数据:', fullData)
        
        // 构造完整的提交数据，只更新 specification 字段
        const submitData = {
          ...fullData,  // 使用完整数据
          instrumentModel: {
            ...(fullData.instrumentModel || {}),  // 展开完整的 instrumentModel
            specification: imageUrl  // 只更新 specification
          }
        };
        
        console.log('📤 提交的数据:', submitData)
        
        // 调用编辑接口
        const res = await editComputer(submitData);
        
        if (res.code === 200) {
          this.$message.success('产品图纸上传成功');
          // 更新本地数据
          this.$set(row, 'specification', imageUrl);
          // 刷新列表
          this.getList();
        } else {
          this.$message.error(res.msg || '更新失败');
        }
      } catch (error) {
        console.error('更新产品图纸失败:', error);
        this.$message.error('更新失败: ' + (error.message || '未知错误'));
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.gap-btn {
  gap: 10px;
}

/* 产品图纸上传单元格 */
.specification-upload-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  
  .spec-preview-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    .spec-image-container {
      position: relative;
      display: inline-block;
      cursor: pointer; /* 鼠标指针变为手型，提示可点击 */
      transition: transform 0.2s;
      
      &:hover {
        transform: scale(1.05); /* hover时轻微放大 */
      }
      
      /* 图片错误占位 */
      .image-slot {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: #F5F7FA;
        color: #C0C4CC;
        font-size: 24px;
      }
      
      /* 数量徽章 */
      .spec-count-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        min-width: 20px;
        height: 20px;
        line-height: 18px; /* 调整line-height让数字更居中 */
        padding: 0 6px;
        background: #F56C6C;
        color: #FFF;
        font-size: 12px;
        font-weight: bold;
        border-radius: 10px;
        text-align: center;
        border: 2px solid #FFF;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        z-index: 10;
        pointer-events: none; /* 徽章不响应点击，让点击穿透到容器 */
        display: flex; /* 使用flex布局让数字完美居中 */
        align-items: center;
        justify-content: center;
      }
    }
  }
}

/* 审核容器 - 整体布局 */
.audit-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0;
}

/* 审核状态行 - 状态标签 + 操作按钮 */
.audit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 26px;
  padding: 3px 4px;
  
  .audit-status {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    
    .el-tooltip {
      display: inline-flex;
      align-items: center;
    }
    
    /* 状态标签样式 */
    ::v-deep .el-tag {
      border: none;
      padding: 2px 8px;
      height: 22px;
      line-height: 18px;
      background-color: #f5f5f5 !important; /* 统一淡灰背景 */
      
      &.el-tag--success {
        background-color: #f0f9ff !important; /* 淡蓝色 */
        color: #52c41a;
      }
      
      &.el-tag--warning {
        background-color: #fffbf0 !important; /* 淡黄色 */
        color: #faad14;
      }
      
      &.el-tag--danger {
        background-color: #fff1f0 !important; /* 淡红色 */
        color: #ff4d4f;
      }
      
      &.el-tag--info {
        background-color: #fafafa !important; /* 淡灰色 */
        color: #8c8c8c;
      }
      
      &.el-tag--primary {
        background-color: #f0f5ff !important; /* 淡蓝色 */
        color: #1890ff;
      }
    }
  }
  
  .audit-operations {
    display: flex;
    gap: 4px;
    align-items: center;
    flex-wrap: nowrap;
    
    ::v-deep .el-tooltip,
    ::v-deep > * {
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
    
    ::v-deep i {
      font-size: 15px;
      opacity: 0.85;
      transition: opacity 0.2s;
      
      &:hover {
        opacity: 1;
      }
    }
  }
}

/* 状态标签前缀颜色区分 - 让文字更醒目 */
.tag-prefix-config {
  color: #1890ff !important;
  font-weight: 600;
  margin-right: 2px;
}

.tag-prefix-package {
  color: #13C2C2 !important;
  font-weight: 600;
  margin-right: 2px;
}

.tag-prefix-spec {
  color: #722ED1 !important;
  font-weight: 600;
  margin-right: 2px;
}

/* 固定的基础信息分组标题 */
.fixed-group-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 442px; /* 操作100 + 审核140 + 品类120 + 型号120 + 客户120 + 客户料号120 + 实际客户车名150 + 是否配置120 + BIST120 */
  height: 41px;
  line-height: 40px; 
  box-sizing: border-box;
  text-align: center;
  background-color: #B4C7E7;
  color: #000000;
  font-weight: 600;
  font-size: 14px;
  border-top: 1px solid #dfe6ec; /* 顶部线条 */
  border-left: 1px solid #dfe6ec;
  border-bottom: 2px solid #dfe6ec;
  z-index: 160;
  pointer-events: none; /* 允许点击事件穿透到下方筛选器 */
}

/* 富文本内容样式 */
.rich-text-content {
  max-height: 100px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  text-align: left;
  padding: 4px 8px;
  
  ::v-deep p {
    margin: 0;
    padding: 2px 0;
    white-space: pre-wrap;
    text-align: left;
  }
  
  ::v-deep img {
    max-width: 100%;
    height: auto;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  ::v-deep a {
    color: #409EFF;
    text-decoration: underline;
    cursor: pointer;
    
    &:hover {
      color: #66b1ff;
    }
  }
  
  ::v-deep br {
    display: block;
    content: "";
    margin: 2px 0;
  }
  
  ::v-deep ol,
  ::v-deep ul {
    margin: 4px 0;
    padding-left: 20px;
    text-align: left;
    
    li {
      margin: 2px 0;
      white-space: pre-wrap;
      text-align: left;
    }
  }
  
  ::v-deep div,
  ::v-deep span {
    white-space: pre-wrap;
    text-align: left;
  }
}

.text-muted {
  color: #909399;
  font-size: 11px;
  margin-top: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  text-align: left;
  padding: 4px 8px;
}

/* 下拉框选择值的样式 - 添加底部虚线分割线 */
.select-value-text {
  padding: 4px 0 10px 0;
  margin-bottom: 10px;
  border-bottom: 1px dashed #DCDFE6;
  font-size: 13px;
  color: #303133;
  font-weight: 500;
  width: 100%;
}

/* 修复固定列遮挡滚动条的问题 */
::v-deep .el-table__fixed {
  pointer-events: none;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.12) !important;
  height: calc(100% - 13px) !important; /* 减去滚动条高度，避免遮挡横向滚动条 */
  z-index: 15 !important; /* 确保fixed列高于图纸数量徽章(z-index:10) */

  /* 允许固定列内的按钮等元素可以点击 */
  .el-table__fixed-body-wrapper,
  .el-table__fixed-header-wrapper,
  .el-table__fixed-footer-wrapper {
    pointer-events: auto;
  }

  /* 确保固定列内容可以交互 */
  .el-table__body,
  .el-table__header,
  .el-table__footer {
    pointer-events: auto;
  }
}

/* 固定列左侧不遮挡滚动条 */
::v-deep .el-table__fixed-left {
  height: calc(100% - 13px) !important;
  z-index: 15 !important; /* 确保fixed左列高于图纸数量徽章 */
}

/* 固定列左侧阴影 */
::v-deep .el-table__fixed-right {
  box-shadow: -1px 0 8px rgba(0, 0, 0, 0.12) !important;
  z-index: 15 !important; /* 确保fixed右列高于图纸数量徽章 */
}

::v-deep .el-table__fixed-left {
  box-shadow: 1px 0 8px rgba(0, 0, 0, 0.12) !important;
}

/* 确保固定列背景色正确 */
::v-deep .el-table__fixed-left .el-table__cell,
::v-deep .el-table__fixed-right .el-table__cell {
  background-color: #fff !important;
  z-index: 1; /* 确保单元格内容层级正确 */
  position: relative; /* 让z-index生效 */
}

/* 固定列的表头加 padding-top 与覆盖的分组标题对齐 */
::v-deep .el-table__fixed thead.is-group th .cell {
  position: relative;
  top:19px;
}

 

/* 确保滚动条可见且可以交互 */
::v-deep .el-table__body-wrapper {
  &::-webkit-scrollbar {
    height: 12px;
    width: 12px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 6px;

    &:hover {
      background: #a8a8a8;
    }
  }
}
</style>

<style lang="scss" scoped>
/* 全局样式 - 图片预览器层级 */
.el-image-viewer__wrapper {
  z-index: 99999 !important;
  position: fixed !important;
}

.el-image-viewer__mask {
  z-index: 0 !important;
  position: absolute !important;
}

.el-image-viewer__canvas {
  z-index: 1 !important;
  position: absolute !important;
}

.el-image-viewer__btn {
  z-index: 2 !important;
  position: absolute !important;
}

.el-image-viewer__close {
  z-index: 2 !important;
  position: absolute !important;
}

.el-image-viewer__actions {
  z-index: 2 !important;
  position: absolute !important;
}

/* 表头分组颜色 - 对应 Excel 样式 */
/* 基础信息 - 浅蓝色 */
.el-table th.group-header-basic {
  background-color: #B4C7E7 !important;
  color: #000000 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}

/* 外观信息 - 浅绿色 */
.el-table th.group-header-appearance {
  background-color: #C6E0B4 !important;
  color: #000000 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}

/* 车型配置 - 浅粉色 */
.el-table th.group-header-config {
  background-color: #F4CCCC !important;
  color: #000000 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}

/* 包装信息 - 浅黄色 */
.el-table th.group-header-package {
  background-color: #FFE599 !important;
  color: #000000 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}

 
 
/* 为表头单元格添加边框 */
.el-table th.group-header-basic,
.el-table th.group-header-appearance,
.el-table th.group-header-config,
.el-table th.group-header-package {
  border: 1px solid #dfe6ec !important;
}

/* 确保 hover 时保持背景颜色 */
.el-table th.group-header-basic:hover {
  background-color: #B4C7E7 !important;
}

.el-table th.group-header-appearance:hover {
  background-color: #C6E0B4 !important;
}

.el-table th.group-header-config:hover {
  background-color: #F4CCCC !important;
}

.el-table th.group-header-package:hover {
  background-color: #FFE599 !important;
}
</style>

<style lang="scss">
/* 全局样式 - 表头分组颜色（不受 scoped 限制） */
.el-table th.group-header-basic {
  background-color: #B4C7E7 !important;
  color: #000000 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}

.el-table th.group-header-appearance {
  background-color: #C6E0B4 !important;
  color: #000000 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}

.el-table th.group-header-config {
  background-color: #F4CCCC !important;
  color: #000000 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}

.el-table th.group-header-package {
  background-color: #FFE599 !important;
  color: #000000 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}

.el-table th.group-header-basic:hover {
  background-color: #B4C7E7 !important;
}

.el-table th.group-header-appearance:hover {
  background-color: #C6E0B4 !important;
}

.el-table th.group-header-config:hover {
  background-color: #F4CCCC !important;
}

.el-table th.group-header-package:hover {
  background-color: #FFE599 !important;
}
</style>
