<template>
  <div class="prod-plan-box">
    <div class="flex justify-between margin-top-xs margin-bottom-xs">
      <div class="flex align-center">
        <check-status-legend class="margin-right-xs" />

        <!-- <el-form-item label=""> -->
        <!-- <el-checkbox v-model="queryParams.myLag" true-label="1" false-label="0" @change="getList">我的滞后</el-checkbox>
        <el-checkbox v-model="queryParams.myTodo" true-label="1" false-label="0" @change="getList">我的待完成</el-checkbox> -->
        <!-- </el-form-item> -->
      </div>

      <ul class="options-box">
        <el-form ref="queryForm" :model="queryParams" inline label-position="left">
          <li>
            <el-form-item label="生产日期" prop="date">
              <!-- <el-date-picker v-model="queryParams.date" type="date" value-format="timestamp" style="width: 120px">
              </el-date-picker> -->
              <el-date-picker v-model="dateRange" style="width: 250px" value-format="timestamp" type="daterange"
                range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
            </el-form-item>
            <el-form-item label="型号" prop="computerId">
              <el-select v-model="queryParams.computerId" :loading="isCLoading" filterable remote clearable
                :remote-method="getComputerNameList" style="width: 100px" placeholder="请输入">
                <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.model" />
              </el-select>
            </el-form-item>
            <el-form-item label="订单号" prop="orderNo">
              <select-loadMore v-model="queryParams.orderNo" :data="salesOrderNoData.data" :page="salesOrderNoData.page"
                :hasMore="salesOrderNoData.more" allow-create dictLabel="salesOrderNo" dictValue="salesOrderNo"
                :request="getSalesOrderNoData" style="width: 100px" />
            </el-form-item>
            <!-- <el-form-item label="客户订单号" prop="customerOrderNo">
              <select-loadMore v-model="queryParams.customerOrderNo" :data="customerOrderNoData.data"
                :page="customerOrderNoData.page" :hasMore="customerOrderNoData.more" dictLabel="salesOrderNo"
                dictValue="salesOrderNo" :request="getCustomerOrderNoData" style="width: 100px" />
            </el-form-item> -->
            <el-form-item label="生产阶段" prop="process">
              <el-select v-model="queryParams.process" style="width: 85px">
                <el-option v-for="(item, index) in operationList" :key="index" :label="item.dictLabel"
                  :value="item.dictLabel"></el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="生产地点" prop="address">
              <el-select v-model="queryParams.address" style="width: 85px">
                <el-option v-for="(item, index) in productAddressList" :label="item.dictLabel" :value="item.dictLabel"
                  :key="index"></el-option>
              </el-select>
            </el-form-item> -->
            <el-form-item label="许可状态" prop="isLicense">
              <el-select v-model="queryParams.isLicense" clearable style="width: 85px">
                <el-option label="未许可" :value="0"></el-option>
                <el-option label="已许可" :value="1"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="mini" @click="getList">
                搜索
              </el-button>
              <el-button size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
          </li>
          <!-- <li>
            <el-form-item label="特殊搜索项:" label-width="90px">
              <el-checkbox-group v-model="queryParams.otherSearch" size="mini">
                <el-checkbox border v-for="(item, index) in otherOptions" :label="item.value" :key="index">{{ item.title
                }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </li> -->
          <li class="flex">
            <!-- <el-form-item label="视图:">
              <el-radio-group v-model="isView" size="mini">
                <el-radio v-for="(item, index) in viewData" :label="item.value" :key="index">
                  {{ item.title }}
                </el-radio>
              </el-radio-group>
            </el-form-item> -->
          </li>
        </el-form>
      </ul>
    </div>

    <el-table classs="plan-order-table" :key="tableKey" ref="planOrderRef" v-loading="loading" :data="productionList"
      :height="isTestTabHeight" @cell-dblclick="onDbClick" @cell-click="onCellClick" :cell-class-name="getCellClassName"
      :row-class-name="tableRowClassName" :span-method="arraySpanMethod">
      <el-table-column prop="date" label="生产日期" align="center" width="90" fixed>
        <template slot-scope="{ row }">
          <span v-if="row.date" :class="proDate(row.date)">{{ parseTime(row.date, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="computerName" label="型号" align="center" min-width="150" fixed>
        <template slot-scope="{ row }">
          <el-link v-if="row.computerName" @click="handleNameToPage('FileConfig', {
            categoryId: row.categoryId,
            computerId: row.computerId
          })">
            {{ row.computerName }}
          </el-link>
          <span v-else>- - -</span>
        </template>
      </el-table-column>
      <el-table-column prop="salesOrderNo" label="迪太订单号" min-width="150" align="center">
        <template slot-scope="{ row }">
          <el-link v-if="row.salesOrderNo" @click="handleNameToPage('PlanSchedule', {
            salesOrderNo: row.salesOrderNo
          })">
            {{ row.salesOrderNo }}
          </el-link>
          <span v-else>- - -</span>
        </template>
      </el-table-column>
      <el-table-column prop="customerOrderNo" label="客户订单号" min-width="150" align="center">
        <span slot-scope="scope" v-NoData="scope.row.customerOrderNo"></span>
      </el-table-column>
      <el-table-column prop="process" label="生产阶段" align="center" width="80">
        <span slot-scope="scope" v-NoData="scope.row.process"></span>
      </el-table-column>
      <el-table-column prop="num" label="生产数量" align="center" width="80">
        <span slot-scope="scope" v-NoData="scope.row.num"></span>
      </el-table-column>
      <el-table-column prop="address" label="生产地点" align="center" width="80">
        <span slot-scope="scope" v-NoData="scope.row.address"></span>
      </el-table-column>
      <!-- <el-table-column prop="address" label="出货箱唛" align="center" width="80">
        <template slot-scope="{ row }">
          <el-button type="text" @click="urlDownload(row.file)"></el-button>
          <el-tag>通用</el-tag>
          <div>
            <el-tag type="danger">客供</el-tag>
            <span>（待提供）</span>
          </div>
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="滞后流程" align="center">
        <el-table-column prop="address" label="环节" align="center" width="80">
          <template slot-scope="{ row }">
            <template v-if="row.personStatus && row.personStatus.length">
              <Carousel :delayList="row.personStatus" :intervalTime="5000"></Carousel>
            </template>
            <template v-else>暂无</template>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="责任人" align="center" width="80">
          <template slot-scope="{ row }">

          </template>
        </el-table-column>
        <el-table-column prop="address" label="滞后时长" align="center" width="80">
          <template slot-scope="{ row }">

          </template>
        </el-table-column>
      </el-table-column> -->


      <!-- <el-table-column v-if="isSeeStatus" label="产前样状态" align="center">
        <el-table-column prop="pucsStatus" label="是否寄出" align="center" width="80">
          <template v-slot="{ row, $index }">
            <div class="flex align-center justify-center">
              <el-dropdown trigger="click" placement="bottom" class="flex"
                :disabled="row.sampleStatus == 1 || row.sampleStatus == 2">
                <template v-if="row.sampleStatus == 1 || row.sampleStatus == 2">
                  <StatusFlag bgColor="green" :class="[{ 'pointer': checkRole(['PS']) }]"></StatusFlag>
                </template>
                <template v-else>
                  <StatusFlag bgColor="red" :class="{ 'pointer': checkRole(['PS']) }"></StatusFlag>
                </template>
                <el-dropdown-menu slot="dropdown">
                  <template v-if="checkRole(['PS'])">
                    <el-dropdown-item @click.native="handleStatus(0, 1, row)">
                      已寄出
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="handleStatus(0, 2, row)">
                      无需样品
                    </el-dropdown-item>
                  </template>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="pucsStatus" label="客户确认" align="center" width="80">
          <template v-slot="{ row, $index }">
            <div class="flex align-center justify-center">
              <el-dropdown trigger="click" style="width: 100%" class="flex align-center justify-center"
                :disabled="row.customerStatus == 1">
                <template v-if="row.customerStatus == 1">
                  <StatusFlag bgColor="green"
                    :class="[{ 'pointer': checkRole(['project_manager', 'product']) && checkType(2, row.personStatus) }]">
                  </StatusFlag>
                </template>
                <template v-else>
                  <StatusFlag bgColor="red"
                    :class="{ 'pointer': checkRole(['project_manager', 'product']) && checkType(2, row.personStatus) }">
                  </StatusFlag>
                </template>

                <el-dropdown-menu slot="dropdown">
                  <template v-if="checkRole(['project_manager', 'product']) && checkType(2, row.personStatus)">
                    <el-dropdown-item @click.native="handleStatus(1, 0, row)">
                      待确认
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="handleStatus(1, 1, row)">
                      已确认
                    </el-dropdown-item>
                  </template>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table-column> -->

      <el-table-column v-if="isSeeStatus" label="配置总览" align="center">
        <!-- 配置审核状态 -->
        <el-table-column prop="configStatus" label="配置" align="center" width="80">
          <template slot-scope="{ row }">
            <template v-if="row.configStatus === 3">
              <span style="font-size: 13px; color: #67C23A; font-weight: 500;">已审核</span>
            </template>
            <template v-else>
              <span style="font-size: 13px; color: #F56C6C; font-weight: 500;">未审核</span>
            </template>
          </template>
        </el-table-column>
        
        <!-- 包装审核状态 -->
        <el-table-column prop="packagingAuditStatus" label="包装" align="center" width="80">
          <template slot-scope="{ row }">
            <template v-if="row.packagingAuditStatus === 2">
              <span style="font-size: 13px; color: #67C23A; font-weight: 500;">已审核</span>
            </template>
            <template v-else-if="row.packagingAuditStatus === 1">
              <span style="font-size: 13px; color: #E6A23C; font-weight: 500;">待终审</span>
            </template>
            <template v-else-if="row.packagingAuditStatus === 0">
              <span style="font-size: 13px; color: #E6A23C; font-weight: 500;">待初审</span>
            </template>
            <template v-else-if="row.packagingAuditStatus === -1">
              <span style="font-size: 13px; color: #F56C6C; font-weight: 500;">拒审</span>
            </template>
            <template v-else>
              <span style="font-size: 13px; color: #909399; font-weight: 500;">未配置</span>
            </template>
          </template>
        </el-table-column>
        
        <!-- 规格书审核状态 -->
        <el-table-column prop="specificationAuditStatus" label="产品图纸" align="center" width="80">
          <template slot-scope="{ row }">
            <template v-if="row.specificationAuditStatus === 2">
              <span style="font-size: 13px; color: #67C23A; font-weight: 500;">已审核</span>
            </template>
            <template v-else-if="row.specificationAuditStatus === 1">
              <span style="font-size: 13px; color: #E6A23C; font-weight: 500;">待终审</span>
            </template>
            <template v-else-if="row.specificationAuditStatus === 0">
              <span style="font-size: 13px; color: #E6A23C; font-weight: 500;">待初审</span>
            </template>
            <template v-else-if="row.specificationAuditStatus === -1">
              <span style="font-size: 13px; color: #F56C6C; font-weight: 500;">拒审</span>
            </template>
            <template v-else>
              <span style="font-size: 13px; color: #909399; font-weight: 500;">未配置</span>
            </template>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column v-if="isSeeStatus" label="SMT资料" align="center">
        <el-table-column prop="pucsStatus" label="JS脚本" align="center" width="80">
          <template slot-scope="{ row }">
            <miss-data v-if="row.mapFile[1].length" :row="row" currentDataName="JS脚本" :currentIndex="1"></miss-data>
            <template v-else> - - - </template>
          </template>
        </el-table-column>
        <el-table-column prop="hardStatus" label="硬件资料" align="center" width="80">
          <template slot-scope="{ row }">
            <miss-data v-if="row.mapFile[2].length" :row="row" currentDataName="硬件资料" :currentIndex="2">
            </miss-data>
            <template v-else> - - - </template>
          </template>
        </el-table-column>
        <el-table-column prop="softStatus" label="软件资料" align="center" width="80">
          <template slot-scope="{ row }">
            <miss-data v-if="row.mapFile[3].length" :row="row" currentDataName="软件资料" :currentIndex="3"></miss-data>

            <template v-else> - - - </template>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column v-if="isSeeStatus" label="组装资料" align="center">
        <el-table-column prop="configStatus" label="配置文件" align="center" width="80">
          <template slot-scope="{ row }">
            <miss-data v-if="row.mapFile[4].length" :row="row" currentDataName="配置文件" :currentIndex="4"></miss-data>

            <template v-else> - - - </template>
          </template>
        </el-table-column>
        <el-table-column prop="testStatus" label="ITA脚本" align="center" width="80">
          <template slot-scope="{ row }">
            <miss-data v-if="row.mapFile[5].length" :row="row" currentDataName="ITA脚本" :currentIndex="5"></miss-data>
            <template v-else> - - - </template>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column v-if="isSeeStatus" label="审核状态" align="center">
        <el-table-column prop="firstStatus" label="初审" align="center" width="80">
          <template slot-scope="{ row }">
            <MissCheckData :categoryName="row.categoryName" :computerName="row.computerName"
              :checkData="row.firstStateList" :state="row.firstStatus" currentDataName="初审">
            </MissCheckData>
          </template>
        </el-table-column>
        <el-table-column prop="finalStatus" label="终审" align="center" width="80">
          <template slot-scope="{ row }">
            <MissCheckData :categoryName="row.categoryName" :computerName="row.computerName"
              :checkData="row.finalStateList" :state="row.finalStatus" currentDataName="终审">
            </MissCheckData>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column prop="softEndTime" label="软件截止时间" align="center" width="120">
        <template slot-scope="{ row }">
          <template v-if="row.finalStatus === 1">
            - - -
          </template>
          <template v-else>
            <template v-if="isDelayTime(row.softEndTime)">
              <el-tooltip effect="dark" :content="row.softEndTime">
                <el-progress :percentage="100" :stroke-width="10" status="exception" :show-text="false"></el-progress>
              </el-tooltip>
            </template>
            <template v-else>
              <DelayProgress :startTime="row.softEndTime" />
            </template>
          </template>
        </template>
      </el-table-column>

      <el-table-column prop="testEndTime" label="测试截止时间" align="center" width="120">
        <template slot-scope="{ row }">
          <template v-if="row.finalStatus === 1">
            - - -
          </template>
          <template v-else>
            <template v-if="isDelayTime(row.testEndTime)">
              <el-tooltip effect="dark" :content="row.testEndTime">
                <el-progress :percentage="100" :stroke-width="10" status="exception" :show-text="false"></el-progress>
              </el-tooltip>
            </template>
            <template v-else>
              <DelayProgress :startTime="row.testEndTime" />
            </template>
          </template>
        </template>
      </el-table-column>

      <el-table-column prop="licenseEndTime" label="许可截止时间" align="center" width="120">
        <template slot-scope="{ row }">
          <template v-if="row.isLicense === 1">
            - - -
          </template>
          <template v-else>
            <template v-if="isDelayTime(row.licenseEndTime)">
              <el-tooltip effect="dark" :content="row.licenseEndTime">
                <el-progress :percentage="100" :stroke-width="10" status="exception" :show-text="false"></el-progress>
              </el-tooltip>
            </template>
            <template v-else>
              <DelayProgress :startTime="row.licenseEndTime" />
            </template>
          </template>
        </template>
      </el-table-column>

      <!-- <el-table-column prop="customerStatus" label="客户确认状态" align="center" width="140">
        <template v-slot="{ row, $index }">
          <template v-if="row.id">
            <el-dropdown trigger="click" style="width: 100%">
              <el-button :type="typeStatus(row.customerStatus)" size="mini" plain style="width: 100%; font-size: 11px">
                {{ isStatusText(row.customerStatus, row.customerDate) }}
                <i class="el-icon-arrow-down el-icon--right" v-if="checkRole(['product']) && checkType(2, row.personStatus)"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <template v-if="checkRole(['product']) && checkType(2, row.personStatus)">
                  <el-dropdown-item @click.native="handleCustomerStatus(0, row)">
                    未确认
                  </el-dropdown-item>
                  <el-dropdown-item @click.native="handleCustomerStatus(1, row)">
                    已确认
                  </el-dropdown-item>
                  <el-dropdown-item @click.native="handleSelDate(1, row)">
                    选择日期
                  </el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
          <template v-else>
            <span>- - -</span>
          </template>
        </template>
      </el-table-column> -->

      <!-- <el-table-column prop="testStatus" label="测试状态" align="center" width="140">
        <template v-slot="{ row, $index }">
          <template v-if="row.id">
            <el-dropdown trigger="click" style="width: 100%">
              <el-button :type="typeStatus(row.testStatus)" size="mini" plain style="width: 100%; font-size: 11px">
                {{ isStatusText(row.testStatus, row.testDate) }}
                <i class="el-icon-arrow-down el-icon--right" v-if="checkRole(['test']) && row.num > 0"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <template v-if="checkRole(['test'])">
                  <el-dropdown-item @click.native="handleTestStatus(0, row)">
                    未确认
                  </el-dropdown-item>
                  <el-dropdown-item @click.native="handleTestStatus(1, row)">
                    已确认
                  </el-dropdown-item>
                  <el-dropdown-item @click.native="handleSelDate(2, row)">
                    选择日期
                  </el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
          <template v-else>
            <span>- - -</span>
          </template>
        </template>
      </el-table-column> -->

      <el-table-column prop="isLicense" label="许可状态" align="center" width="76" fixed="right">
        <template v-slot="{ row, $index }">
          <template v-if="row.schedulingId">
            <div class="flex align-center justify-center">
              <template v-if="row.isLicense == 1">
                <StatusFlag bgColor="green"></StatusFlag>
              </template>
              <template v-else>
                <StatusFlag bgColor="red"></StatusFlag>
              </template>
            </div>
          </template>
          <template v-else>
            <span>- - -</span>
          </template>
        </template>
      </el-table-column>

      <el-table-column prop="isLicense" label="任务令" align="center" width="70" fixed="right">
        <template v-slot="{ row }">
          <div v-if="row.schedulingId" class="flex justify-center align-center" @click="handleQrCode(row)">
            <svg t="1736758692229" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
              p-id="4424" width="20" height="20">
              <path
                d="M149.897707 387.566843l154.232099 0c49.484303 0 89.577425-40.093122 89.577425-89.577425L393.707231 143.757319C393.707231 94.273016 353.614109 54.179894 304.491005 54.179894L149.897707 54.179894c-49.484303 0-89.577425 40.093122-89.577425 89.577425l0 154.232099C60.320282 347.473721 100.774603 387.566843 149.897707 387.566843zM136.533333 143.757319c0-7.223986 6.140388-13.364374 13.364374-13.364374l154.232099 0c7.223986 0 13.364374 6.140388 13.364374 13.364374l0 154.232099c0 7.223986-6.140388 13.364374-13.364374 13.364374L149.897707 311.353792c-7.223986 0-13.364374-6.140388-13.364374-13.364374L136.533333 143.757319z"
                fill="#575B66" p-id="4425"></path>
              <path
                d="M304.491005 628.486772 149.897707 628.486772c-49.484303 0-89.577425 40.093122-89.577425 89.577425l0 154.232099c0 49.484303 40.093122 89.577425 89.577425 89.577425l154.232099 0c49.484303 0 89.577425-40.093122 89.577425-89.577425l0-154.232099C393.707231 668.579894 353.614109 628.486772 304.491005 628.486772zM317.49418 872.296296c0 7.223986-6.140388 13.364374-13.364374 13.364374L149.897707 885.66067c-7.223986 0-13.364374-6.140388-13.364374-13.364374l0-154.232099c0-7.223986 6.140388-13.364374 13.364374-13.364374l154.232099 0c7.223986 0 13.364374 6.140388 13.364374 13.364374L317.49418 872.296296z"
                fill="#575B66" p-id="4426"></path>
              <path
                d="M878.797884 54.179894l-154.232099 0c-49.484303 0-89.577425 40.093122-89.577425 89.577425l0 154.232099c0 49.484303 40.093122 89.577425 89.577425 89.577425l154.232099 0c49.484303 0 89.577425-40.093122 89.577425-89.577425L968.375309 143.757319C968.014109 94.273016 927.920988 54.179894 878.797884 54.179894zM891.801058 297.989418c0 7.223986-6.140388 13.364374-13.364374 13.364374l-154.232099 0c-7.223986 0-13.364374-6.140388-13.364374-13.364374L710.840212 143.757319c0-7.223986 6.140388-13.364374 13.364374-13.364374l154.232099 0c7.223986 0 13.364374 6.140388 13.364374 13.364374L891.801058 297.989418z"
                fill="#575B66" p-id="4427"></path>
              <path
                d="M673.997884 552.273721c19.865961 0 36.119929-15.892769 35.75873-36.119929 0-19.865961-15.892769-36.119929-36.119929-36.119929l-126.058554 0L547.578131 338.443739c0-19.865961-15.892769-36.119929-36.119929-35.75873-19.865961 0-36.119929 15.892769-36.119929 36.119929L475.338272 480.395062 96.440212 480.395062c-19.865961 0-36.119929 15.892769-36.119929 36.119929 0 19.865961 15.892769 36.119929 36.119929 36.119929l379.620459 0 0 169.04127c0 19.865961 15.892769 36.119929 36.119929 36.119929s36.119929-15.892769 36.119929-36.119929l0-169.04127L673.997884 552.634921z"
                fill="#575B66" p-id="4428"></path>
              <path
                d="M932.255379 552.273721c19.865961 0 36.119929-15.892769 35.75873-36.119929 0-19.865961-15.892769-36.119929-36.119929-36.119929l-79.825044 0c-19.865961 0-36.119929 15.892769-36.119929 36.119929 0 19.865961 15.892769 36.119929 36.119929 36.119929L932.255379 552.273721z"
                fill="#575B66" p-id="4429"></path>
              <path
                d="M511.8194 166.874074c19.865961 0 36.119929-15.892769 36.119929-36.119929L547.93933 88.855026c0-19.865961-15.892769-36.119929-36.119929-35.75873-19.865961 0-36.119929 15.892769-36.119929 36.119929l0 41.899118C476.06067 150.620106 491.953439 166.874074 511.8194 166.874074z"
                fill="#575B66" p-id="4430"></path>
              <path
                d="M511.8194 849.179541c-19.865961 0-36.119929 15.892769-36.119929 36.119929l0 41.899118c0 19.865961 15.892769 36.119929 36.119929 36.119929s36.119929-15.892769 36.119929-36.119929l0-42.260317C547.93933 865.07231 531.685362 849.179541 511.8194 849.179541z"
                fill="#575B66" p-id="4431"></path>
              <path
                d="M892.884656 871.573898c0 7.223986-6.140388 13.003175-13.003175 13.003175l-38.648325 0 0 75.129453 38.648325 0c48.761905 0 88.493827-39.731922 88.493827-88.493827l0-43.705115-75.129453 0L893.245855 871.573898z"
                fill="#575B66" p-id="4432"></path>
              <path
                d="M879.520282 631.015168l-152.426102 0c-48.761905 0-88.493827 39.731922-88.493827 88.493827l0 152.426102c0 48.761905 39.731922 88.493827 88.493827 88.493827l38.648325 0L765.742504 884.938272l-38.648325 0c-7.223986 0-13.003175-6.140388-13.003175-13.003175l0-152.426102c0-7.223986 6.140388-13.003175 13.003175-13.003175l152.426102 0c7.223986 0 13.003175 6.140388 13.003175 13.003175l0 33.591534L968.014109 753.100529l0-33.591534C968.014109 670.74709 928.282187 631.015168 879.520282 631.015168z"
                fill="#575B66" p-id="4433"></path>
            </svg>
          </div>

          <span v-else>- - -</span>
        </template>
      </el-table-column>

      <el-table-column label="责任人" align="center" width="70" fixed="right">
        <template slot-scope="{ row }">
          <el-link @click="seeChargePerson(row)">查看</el-link>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-between align-center">
      <!-- <el-checkbox v-model="isSeeStatus" @change="changeSeeStatus">完成状态</el-checkbox> -->
      <div></div>
      <pagination :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l" @pagination="getList" />
    </div>

    <el-dialog :title="isTitle" :visible.sync="dialogVisible" width="350px" top="2vh" center>
      <el-date-picker v-model="dateTime" type="date" placeholder="选择日期" value-format="timestamp"
        :picker-options="pickerOptions" style="width: 100%">
      </el-date-picker>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit"> 确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 任务令 -->
    <el-dialog title="任务令" :visible.sync="isQrCode" width="500px" center top="-5vh">
      <el-card shadow="hover">
        <div class="text-center">
          <vue-qr class="margin-bottom-xs" :text="qrCodeObj.qrCode" :size="250" :margin="10"></vue-qr>

          <el-descriptions direction="vertical" :column="4" border>
            <el-descriptions-item label="产品型号">
              <span v-NoData="qrCodeObj.computerName"></span>
            </el-descriptions-item>
            <el-descriptions-item label="芯片版本">
              <span v-NoData="qrCodeObj.chipVersion"></span>
            </el-descriptions-item>
            <el-descriptions-item label="客户订单号">
              <span v-NoData="qrCodeObj.customerOrderNo"></span>
            </el-descriptions-item>
            <el-descriptions-item label="生产数量">
              <span v-NoData="qrCodeObj.num"></span>
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="4">
              <span v-NoData="qrCodeObj.remark"></span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
    </el-dialog>

    <!-- 责任人 -->
    <el-dialog title="责任人" :visible.sync="isChargePerson" width="1200px" center top="-5vh">
      <el-table v-loading="loading" :data="chargeData" border>
        <el-table-column label="品类" prop="categoryName" align="center" />
        <el-table-column label="型号" prop="computerName" align="center" />
        <el-table-column label="产前样" align="center">
          <el-table-column label="样品组装" align="center" width="90">
            <template slot-scope="{ row }">
              <template v-if="row.list[0]">
                {{ row.list[0].personnel }}
              </template>
              <template v-else>
                - - -
              </template>
            </template>
          </el-table-column>
          <el-table-column label="客户确认" prop="name" align="center" width="90">
            <template slot-scope="{ row }">
              <template v-if="row.list[1]">
                {{ row.list[1].personnel }}
              </template>
              <template v-else>
                - - -
              </template>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="SMT资料上传" align="center">
          <el-table-column label="PUCS脚本" prop="name" align="center" width="90">
            <template slot-scope="{ row }">
              <template v-if="row.list[2]">
                {{ row.list[2].personnel }}
              </template>
              <template v-else>
                - - -
              </template>
            </template>
          </el-table-column>
          <el-table-column label="硬件资料" prop="name" align="center" width="90">
            <template slot-scope="{ row }">
              <template v-if="row.list[3]">
                {{ row.list[3].personnel }}
              </template>
              <template v-else>
                - - -
              </template>
            </template>
          </el-table-column>
          <el-table-column label="软件资料" prop="name" align="center" width="90">
            <template slot-scope="{ row }">
              <template v-if="row.list[4]">
                {{ row.list[4].personnel }}
              </template>
              <template v-else>
                - - -
              </template>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="组装资料上传" align="center">
          <el-table-column label="配置文件" prop="name" align="center" width="90">
            <template slot-scope="{ row }">
              <template v-if="row.list[5]">
                {{ row.list[5].personnel }}
              </template>
              <template v-else>
                - - -
              </template>
            </template>
          </el-table-column>
          <el-table-column label="ITA脚本" prop="name" align="center" width="90">
            <template slot-scope="{ row }">
              <template v-if="row.list[6]">
                {{ row.list[6].personnel }}
              </template>
              <template v-else>
                - - -
              </template>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="审核环节" align="center">
          <el-table-column label="初审" prop="name" align="center" width="90">
            <template slot-scope="{ row }">
              <template v-if="row.list[7]">
                {{ row.list[7].personnel }}
              </template>
              <template v-else>
                - - -
              </template>
            </template>
          </el-table-column>
          <el-table-column label="终审" prop="name" align="center" width="90">
            <template slot-scope="{ row }">
              <template v-if="row.list[8]">
                {{ row.list[8].personnel }}
              </template>
              <template v-else>
                - - -
              </template>
            </template>
          </el-table-column>
          <el-table-column label="许可" prop="name" align="center" width="90">
            <template slot-scope="{ row }">
              <template v-if="row.list[9]">
                {{ row.list[9].personnel }}
              </template>
              <template v-else>
                - - -
              </template>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 滞后流程 -->
    <el-dialog title="滞后流程" :visible.sync="isOpenProgress" width="500px" center top="-5vh">
      <el-table :data="progressData" border max-height="250">
        <el-table-column label="环节" prop="categoryName" align="center">
          <template slot-scope="{ row }">
            <span v-NoData="typeList[row.type]"></span>
          </template>
        </el-table-column>
        <el-table-column label="责任人" prop="person" align="center" />
        <el-table-column label="滞后时长" prop="time" align="center">
          <template slot-scope="{ row }">
            <CountdownTimer :initialSeconds="row.time" />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { homeProduction, homeProductionStatus, prodScheduleUpdate, responsibleList } from "@/api/home/index";
import {
  schedulingList
} from "@/api/www/planSchedule";
import { computerNameList } from "@/api/third/fileConfig";
import { materialList } from "@/api/third/prodData";
import VueQr from "vue-qr";
import CheckStatusLegend from "./checkStatusLegend.vue";
import Carousel from "./carousel.vue";
import StatusFlag from "./StatusFlag.vue";
import { mapGetters } from "vuex";
import MissCheckData from "./MissCheckData.vue";
import DelayProgress from "./DelayProgress.vue";

export default {
  name: "proPlanOrder",
  data() {
    return {
      dateRange: [],
      progressData: [],
      operationList: [],
      typeList: {
        1: '样品组装',
        2: '客户确认',
        3: 'PUCS脚本',
        4: '硬件资料',
        5: '软件资料',
        6: '配置文件',
        7: 'ITA脚本',
        8: '初审',
        9: '终审',
        10: '许可'
      },
      chargeData: [],
      isChargePerson: false,
      isOpenProgress: false,
      isSeeStatus: true,
      total: 0,
      loading: true,
      isCLoading: false,
      isQrCode: false,
      qrCodeObj: {},
      isTitle: "",
      dialogVisible: false,
      dateTime: "",
      currentSelTimeType: null,
      currentSelData: {},
      dateRange: [],
      productionList: [],
      computerOptions: [],
      salesOrderNoData: {
        data: [],
        page: 1,
        more: true,
      },
      customerOrderNoData: {
        data: [],
        page: 1,
        more: true,
      },
      viewData: [
        {
          title: '生产视图',
          value: 0
        },
        {
          title: '研发视图',
          value: 1
        },
      ],
      // 生产地点
      productAddressList: [],
      sendList: {
        0: '已寄出',
        1: '无需样品'
      },
      queryParams: {
        p: 1,
        l: 50,
        computerId: "",
        isLicense: "",
        date: "",
        orderNo: "",
        process: "",
        address: "",
        myLag: "",
        myTodo: ""
      },
      isView: "",
      tableKey: 0,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() <= Date.now() - 24 * 3600 * 1000;
        },
      },
    };
  },
  components: {
    VueQr,
    MissData: () => import("./MissData.vue"),
    MissCheckData,
    CheckStatusLegend,
    Carousel,
    StatusFlag,
    DelayProgress,
    CountdownTimer: () => import('./CountdownTimer.vue')
  },
  computed: {
    ...mapGetters(['nickName']),
    // 处理数据，插入间隔行
    processedData() {
      const result = [];
      let lastWeek = null;

      this.productionList.forEach((item, index) => {
        const createTime = this.moment(item.date);
        const week = createTime.startOf("week").format("YYYY-MM-DD");

        if (lastWeek !== week) {
          // 如果当前行的周与上一行不同，插入间隔行
          if (lastWeek !== null) {
            result.push({ isSeparator: true });
          }
          lastWeek = week;
        }

        result.push(item);
      });

      return result;
    },
    isToday() {
      return (date) => {
        return (
          this.moment(date).format("YYYY-MM-DD") === this.moment().format("YYYY-MM-DD")
        );
      };
    },
    proDate() {
      return (date) => {
        return {
          'text-red': this.moment(date).format("YYYY-MM-DD") < this.moment().format("YYYY-MM-DD")
        }
      };
    },
    isDelayTime() {
      return (date) => {
        // const now = this.moment();
        // const timeA = this.moment(date);
        // const diff = Math.abs(timeA.diff(now, "days"));
        // return diff > 1;
        return this.moment(date) < this.moment();
      }
    },
    isTestTabHeight() {
      return "calc(100vh - 290px)";
    },
    hopeDateStyle() {
      return (hopeDate, result) => {
        // 预计时间
        const expectedTime = this.moment(hopeDate);

        const now = this.moment();

        const diffInHours = expectedTime.diff(now, "hours");
        let bgStyle = "";

        if (result === "OK") {
          bgStyle = "bg-green-noHurry ";
        } else if (result === "NG") {
          bgStyle = "bg-danger ";
        } else {
          // 判断时间差
          if (diffInHours <= 8) {
            bgStyle = "bg-danger ";
          } else if (diffInHours <= 16) {
            bgStyle = "bg-warning ";
          } else if (diffInHours <= 32) {
            bgStyle = "bg-yellow ";
          } else {
            bgStyle = "bg-green-noHurry ";
          }
        }
        return bgStyle + `${result === "OK" ? "" : "pointer"} text-black`;
      };
    },
    bgResultStyle() {
      return (result) => {
        if (result === "OK") {
          return "bg-green-noHurry text-black";
        } else if (result === "NG") {
          return "bg-danger text-black";
        } else {
          return "";
        }
      };
    },
    // 客户确认状态选择值
    isStatusText() {
      return (status, date) => {
        switch (status) {
          case 0:
            return "未确认";
          case 1:
            return "已确认";
          case 2:
            const finishedTime = this.moment.unix(date).format("MM/DD");
            return `预计${finishedTime}完成`;
          default:
            return "请选择";
        }
      };
    },
    typeStatus() {
      return (status) => {
        switch (status) {
          case 0:
            return "danger";
          case 1:
            return "success";
          default:
            return "primary";
        }
      };
    }
  },
  created() {
    // 设置默认日期范围：今天到明天
    this.setDefaultDateRange();
    this.getList();
    this.getOperationList();
    // this.getHomeProductionAll();
    this.getProductAddress();
  },
  methods: {
    getList() {
      this.loading = true;
      materialList(this.addDateRange(this.queryParams, this.dateRange, {
        begin: "startTime",
        end: "endTime",
      })).then(res => {
        const { list, total } = res.data;
        this.productionList = list;
        this.total = total;
      }).finally(() => {
        this.loading = false;
      })
    },
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = true;
        computerNameList({ name })
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
    // 设置默认日期范围：今天到明天
    setDefaultDateRange() {
      const today = new Date();
      // 设置今天的时间为 00:00:00
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      // 设置明天的时间为 23:59:59
      tomorrow.setHours(23, 59, 59, 999);

      // 设置为时间戳格式
      this.dateRange = [today.getTime(), tomorrow.getTime()];
    },
    resetQuery() {
      this.dateTime = [];
      this.dateRange = []; // 重置时清空日期范围
      this.$set(this.queryParams, 'myLag', '');
      this.$set(this.queryParams, 'myTodo', '');
      this.resetForm("queryForm");
      this.getList();
      // this.getHomeProductionAll();
    },
    getHomeProductionAll(isUpdate = true) {
      isUpdate && (this.isLoading = true);
      homeProduction({ ...this.queryParams })
        .then((res) => {
          const totalData = res.data;

          this.productionList = this.handleTransData(totalData);

          if (isUpdate) {
            this.$nextTick(() => {
              this.scrollToToday();
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    scrollToToday() {
      const todayIndex = this.productionList.findIndex((item) =>
        this.isToday(item.date)
      );

      if (todayIndex !== -1) {
        const tableBody =
          this.$refs.planOrderRef.$el.querySelector(".el-table__body");
        const rowElement = tableBody.querySelector(
          `.el-table__row:nth-child(${todayIndex + 1})`
        );
        if (rowElement) {
          const rowTop = rowElement.offsetTop;
          const tableBodyWrapper = this.$refs.planOrderRef.$el.querySelector(
            ".el-table__body-wrapper"
          );
          tableBodyWrapper.scrollTop = rowTop - tableBody.offsetTop;
        }
      }
    },
    handleTransData(totalData) {
      try {
        let newData = [];

        for (let time in totalData) {
          if (!totalData[time].length) {
            newData.push({
              date: +new Date(time),
              map: { 1: 0, 2: 4, 3: 0, 4: 0, 5: 2, 6: 1 },
              mapFile: {
                1: [],
                2: [],
                3: [],
                4: [],
                5: [],
                6: [],
              },
              list: [],
            });
          } else {
            newData.push(...totalData[time]);
          }
        }

        return newData;
      } catch (error) { }
    },
    handleStatus(type, status, row) {

      let data = {};
      if (type == 0) {     // 是否寄出
        data = {
          sampleStatus: status,
          schedulingId: row.schedulingId
        }
      }

      if (type == 1) { // 客户确认状态
        data = {
          customerStatus: status,
          schedulingId: row.schedulingId
        }
      }

      prodScheduleUpdate(data).then(() => {
        this.msgSuccess("操作成功");
        this.getList();
      })
    },
    // 客户确认状态
    handleCustomerStatus(customerStatus, data) {
      let { customerDate, id, testDate, testStatus } = data;
      customerDate =
        customerDate && String(customerDate).length === 13
          ? Math.floor(customerDate / 1000)
          : "";

      homeProductionStatus({
        customerDate,
        customerStatus,
        schedulingId: id,
        testDate,
        testStatus,
      })
        .then(() => {
          this.msgSuccess("操作成功");
          this.getHomeProductionAll(false);
        })
        .catch(() => {
          this.msgError("操作失败");
        })
        .finally(() => {
          this.dialogVisible = false;
        });
    },
    // 测试确认状态
    handleTestStatus(testStatus, data) {
      let { customerDate, id, testDate, customerStatus } = data;
      testDate =
        testDate && String(testDate).length === 13
          ? Math.floor(testDate / 1000)
          : "";

      homeProductionStatus({
        customerDate,
        customerStatus,
        schedulingId: id,
        testDate,
        testStatus,
      })
        .then(() => {
          this.msgSuccess("操作成功");
          this.getHomeProductionAll(false);
        })
        .catch(() => {
          this.msgError("操作失败");
        })
        .finally(() => {
          this.dialogVisible = false;
        });
    },
    // 客户确认选择日期
    handleSelDate(type, data) {
      this.currentSelTimeType = type;
      this.currentSelData = Object.assign({}, data);

      this.isTitle = type === 1 ? "客户确认日期" : "测试确认日期";
      this.dialogVisible = true;
      this.dateTime = "";

      if (type === 1 && data.customerDate) {
        this.dateTime = data.customerDate * 1000;
      }

      if (type === 2 && data.testDate) {
        this.dateTime = data.testDate * 1000;
      }
    },
    handleSubmit() {
      if (!this.dateTime) {
        this.msgWarning("请选择日期");
        return;
      }

      if (this.currentSelTimeType === 1) {
        const data = { ...this.currentSelData, customerDate: this.dateTime };
        this.handleCustomerStatus(2, data);
      }

      if (this.currentSelTimeType === 2) {
        const data = { ...this.currentSelData, testDate: this.dateTime };
        this.handleTestStatus(2, data);
      }
    },
    toPlanSchedule(item) {
      const { categoryId, computerId } = item;
      if (!this.checkRole(["factory"]) || !categoryId || !computerId) {
        return;
      }

      this.$router.push({
        name: "ProdPermit",
        params: {
          categoryId,
          computerId,
        },
      });
    },
    onCellClick(row, column) {
      switch (column?.label) {
        case "型号":
          // this.toPlanSchedule(row);
          break;
        case "配置总览":
          this.toConfigOverview(row);
          break;
        case "许可状态":
          this.handleToPermit(10, row);
          break;
        case "环节": this.openProgress(row.personStatus); break;
      }
    },
    openProgress(personStatus) {
      if (!personStatus.length) {
        return;
      }
      this.isOpenProgress = true;
      this.progressData = personStatus;
    },
    toConfigOverview(row) {
      if (this.checkRole(['project_manager', 'product'])) {
        this.handleNameToPage('ConfigOverview', {
          categoryId: row.categoryId,
          computerId: row.computerId,
        });
      }
    },
    onDbClick(row, column, cell, event) {
      switch (column?.label) {
        case "JS脚本":
          this.onCellStateClick(row, row.map[1], row?.mapFile[1]?.length);
          break;
        case "硬件资料":
          this.onCellStateClick(row, row.map[2], row?.mapFile[2]?.length);
          break;
        case "软件资料":
          this.onCellStateClick(row, row.map[3], row?.mapFile[3]?.length);
          break;
        case "配置文件":
          this.onCellStateClick(row, row.map[4], row?.mapFile[4]?.length);
          break;
        case "测试上位机":
          this.onCellStateClick(row, row.map[5], row?.mapFile[5]?.length);
          break;
      }
    },
    tableRowClassName({ row, rowIndex }) {
      return this.isToday(row.date) ? "success-row" : "";

      // if (row.isSeparator) {
      //   // 间隔行
      //   return "separator-row";
      // }

      // const createTime = this.moment(row.date);
      // const oneWeekAgo = this.moment().subtract(1, "week");

      // if (createTime.isAfter(oneWeekAgo)) {
      //   // 一周内的数据行
      //   return "highlight-row";
      // }

      // return "";
    },
    getCellClassName({ row, column }) {
      const { map, mapFile, hopeDate, result, date, computerName } = row;
      const { label } = column;
      switch (label) {
        case "型号":
          return computerName && this.checkRole(["factory"]) ? "pointer" : "";
        case "JS脚本":
          return this.getDataState(map[1], mapFile[1]?.length);
        case "硬件资料":
          return this.getDataState(map[2], mapFile[2]?.length);
        case "软件资料":
          return this.getDataState(map[3], mapFile[3]?.length);
        case "配置文件":
          return this.getDataState(map[4], mapFile[4]?.length);
        case "ITA脚本":
          return this.getDataState(map[5], mapFile[5]?.length);
        case "任务令":
          return row.qrCode ? "pointer" : "";
        case "配置总览": return this.checkRole(['project_manager', 'product']) ? "pointer" : "";
        case "许可状态": return this.checkType(10, row.personStatus) ? 'pointer' : '';
        case "环节":
        case "责任人":
        case "滞后时长":
          return `delay-progress-box ${row.personStatus?.length ? 'pointer' : ''}`
      }
    },
    checkType(type, personStatus) {
      if (type === 10) {
        let personData = personStatus?.find(item => item.type === type);
        return personData?.person === this.nickName;
      }
    },
    handleToPermit(type, row) {
      if (this.checkType(type, row.personStatus)) {
        this.handleNameToPage('ProdPermit', {
          categoryId: row.categoryId,
          computerId: row.computerId
        })
      }
      // this.handleNameToPage('ProdPermit', {
      //   categoryId: row.categoryId,
      //   computerId: row.computerId
      // })
    },
    getDataState(state, fileLen) {
      if (!fileLen) return null;
      switch (state) {
        case 0: // 待上传
        case 1: // 待审核
        case 2: // 测试审核通过
        case 3: // 未通过
          return "pointer";
      }
    },
    // 查看任务令
    handleQrCode(row) {
      this.isQrCode = true;
      this.qrCodeObj = row;
    },
    // 迪太订单号
    getSalesOrderNoData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        schedulingList({
          p: page,
          productStatus: 0,
          salesOrderNo: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.salesOrderNoData.data = [...this.salesOrderNoData.data, ...list];
          } else {
            this.salesOrderNoData.data = list;
          }
          this.salesOrderNoData.more = pageNum * pageSize < total;
          this.salesOrderNoData.page = pageNum;
          resolve();
        });
      });
    },
    // 客户订单号
    getCustomerOrderNoData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        schedulingList({
          p: page,
          productStatus: 0,
          customerOrderNo: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          if (more) {
            this.customerOrderNoData.data = [...this.customerOrderNoData.data, ...list];
          } else {
            this.customerOrderNoData.data = list;
          }
          this.customerOrderNoData.more = pageNum * pageSize < total;
          this.customerOrderNoData.page = pageNum;
          resolve();
        });
      });
    },
    // 生产地点
    getProductAddress() {
      this.getDicts("product_address").then((response) => {
        this.productAddressList = response.data;
      });
    },
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      // 合并规则：由于滞后流程只有一个子列（环节），不需要合并
      // 如果后续有其他需要合并的列，可以在这里添加逻辑
      return [1, 1]; // 默认不合并
    },
    // 责任人
    seeChargePerson(row) {
      const { categoryId, computerId } = row;
      this.isChargePerson = true;
      this.chargeData = [];

      responsibleList({
        categoryId, computerId
      }).then(res => {
        const { list } = res.data;
        this.chargeData = list;
      })
    },
    // 生产流程
    getOperationList() {
      this.getDicts("process").then((response) => {
        this.operationList = response.data;
      });
    },
    changeSeeStatus() {
      // localStorage.setItem('isSeeStatus', this.isSeeStatus);
      // this.tableKey += 1;
      this.$nextTick(() => {
        this.$refs.planOrderRef.doLayout();
      })
    }
  },
};
</script>
<style lang="scss">
.success-row {
  background: #ebfae2 !important;
}

.delay-progress-box {
  padding: 0 !important;

  .cell {
    padding: 0 !important;
  }
}

/* 自定义行样式 */
.separator-row {
  background-color: #f0f0f0;
  height: 20px;
  line-height: 20px;
  text-align: center;
  font-weight: bold;
}

.highlight-row {
  background-color: red;
  color: white;
}
</style>

<style lang="scss" scoped>
.prod-plan-box {

  .options-box {
    list-style: none;
    margin: 0;
    padding: 0;

    .el-form-item {
      margin-bottom: 5px;
      margin-right: 5px;
    }
  }



  .carousel-box {
    /deep/ .el-carousel__container {
      min-height: 30px;
      height: fit-content !important;

      .el-carousel__arrow {
        width: 20px !important;
        height: 20px !important;
        background: #21131370 !important;
      }

      .el-carousel__arrow--left {
        left: 4px;
      }

      .el-carousel__arrow--right {
        right: 4px;
      }

      .el-carousel__item {
        display: flex;
        align-items: center;

        .carousel-item {
          padding: 0;
          margin: 0;
          list-style: none;
          display: flex;
          align-items: center;

          li {
            width: 90px;

            &:nth-child(2) {
              border-left: 1px solid #EBEEF5;
              border-right: 1px solid #EBEEF5;
            }
          }
        }
      }
    }
  }

}

.bg-success {
  background-color: #c6efce !important;
}

.bg-primary {
  background-color: #00b0f0 !important;
}

.bg-warning {
  background-color: #ffc000 !important;
}

.bg-danger {
  background-color: #f56c6c !important;
}

.bg-yellow {
  background-color: yellow !important;
}

.bg-header-lightBlue {
  background-color: #92cddc !important;
}

.bg-header-deepBlue {
  background-color: #00b0f0 !important;
}

.bg-green-noHurry {
  background-color: green;
}

.font-black {
  color: #000;
}

.font-correct {
  color: #007b74;
}

.plan-order-table {
  .el-table__body {
    .el-table__row {
      .el-table__cell {
        padding: 4px 0 !important;
      }
    }
  }
}
</style>
