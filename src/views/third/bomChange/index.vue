<template>
  <div class="app-container">
    <!-- 智能搜索区域 -->
    <IntelligentSearchForm :searchForm="searchForm" :fields="searchFields" 
      
    @search="handleSearch"
        :defaultVisibleCount="4" @reset="handleReset" @field-change="handleFieldChange">
        
        <!-- 自定义客户字段渲染 -->
        <template #field-customer="{ field, searchForm }">
            <el-form-item :label="field.label" :prop="field.key" :label-width="field.labelWidth">
                <select-loadMore v-model="searchForm[field.key]" :data="customerData.data" :page="customerData.page"
                  :hasMore="customerData.more" dictLabel="name" dictValue="name" :request="getCustomerData" size="mini"
                    placeholder="请选择客户名称" style="width: 100%;">
                </select-loadMore>
            </el-form-item>
        </template>

        <!-- 自定义配置型号字段渲染 -->
        <template #field-configModel="{ field, searchForm }">
            <el-form-item :label="field.label" :prop="field.key" :label-width="field.labelWidth">
                <el-select filterable remote clearable v-model="searchForm[field.key]" placeholder="请选择配置型号"
                    :remote-method="getComputerNameList" size="mini" style="width: 100%">
                    <el-option v-for="dict in computerOptions" :key="dict.model" :label="dict.name" :value="dict.name" />
                </el-select>
            </el-form-item>
        </template>

        <!-- 页面操作按钮 -->
        <template #page-actions>
            <el-button type="primary" @click="handleAdd" icon="el-icon-plus" size="mini" v-hasPermi="['bomChange:add']"
             >
                新增变更申请
            </el-button>
            <el-button type="info" plain @click="handleAddPeople" icon="el-icon-user" v-hasPermi="['bomChange:people']"
                size="mini">
                人员管理
            </el-button>
        </template>
    </IntelligentSearchForm>

    <el-table v-loading="loading" :data="bomChangeList" :height="tableHeight()" border>
      <el-table-column label="序号" type="index" width="50" align="center">
        <template slot-scope="scope">
          {{ (queryParams.p - 1) * queryParams.l + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="客户" prop="customer" align="center" />
      <el-table-column label="配置项型号" prop="configModel" align="center" />

      <el-table-column label="订单信息" align="center" width="300" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <div v-if="row.infoList && row.infoList.length > 0" class="order-info-list">
            <div v-for="(info, index) in row.infoList" :key="index" class="order-info-item">
              <div class="order-info-row">
                <span class="info-label">客户单号:</span>
                <span class="info-value">{{ info.customerNo || '-' }}</span>
              </div>
              <div class="order-info-row">
                <span class="info-label">U8:</span>
                <span class="info-value">{{ info.uuNo || '-' }}</span>
                <span class="info-label">E树:</span>
                <span class="info-value">{{ info.treeNo || '-' }}</span>
              </div>
              <div v-if="index < row.infoList.length - 1" class="order-divider"></div>
            </div>
          </div>
          <span v-else class="no-data">暂无订单信息</span>
        </template>
      </el-table-column>
      <el-table-column label="订单数量" prop="orderNum" align="center" width="80" />
      <el-table-column label="变更前BOM" prop="beforeOrderBom" align="center" show-overflow-tooltip />
      <el-table-column label="变更后BOM" prop="afterOrderBom" align="center" show-overflow-tooltip />
      <el-table-column label="变更原因" prop="changeCause" align="center" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <div style="white-space: break-spaces">
            {{ getCheckedLabels(row.changeCause) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="会审状态" prop="list" align="center" width="200">
        <template slot-scope="{ row }">
          <div class="compact-review-status">
            <div v-for="(group, field) in getReviewStatusByField(row.list)" :key="field" class="review-group">
              <el-tooltip placement="top" v-if="getDepartmentPersons(row.list, field).length > 3">

                <div class="review-row">
                  <span class="department-name">{{ TriageList[field] }}</span>
                  <span class="person-list">
                    <span
                      v-for="(item, index) in getDepartmentPersons(row.list, field).slice(0, getMaxDisplayCount(field))"
                      :key="index" class="person-item" :class="getPersonStatusClass(item.state)">
                      {{ item.fieldName }}
                    </span>
                    <span v-if="getDepartmentPersons(row.list, field).length > getMaxDisplayCount(field)"
                      class="person-more">...</span>
                  </span>
                  <el-tag v-if="group.total === group.passed" type="success" size="mini">
                    {{ group.passed }}/{{ group.total }}
                  </el-tag>
                  <el-tag v-else-if="group.rejected > 0" type="danger" size="mini">
                    {{ group.passed }}/{{ group.total }}
                  </el-tag>
                  <el-tag v-else type="warning" size="mini">
                    {{ group.passed }}/{{ group.total }}
                  </el-tag>
                </div>
              </el-tooltip>
              <div v-else class="review-row">
                <span class="department-name">{{ TriageList[field] }}</span>
                <span class="person-list">
                  <span v-for="(item, index) in getDepartmentPersons(row.list, field)" :key="index" class="person-item"
                    :class="getPersonStatusClass(item.state)">
                    {{ item.fieldName }}
                  </span>
                </span>
                <el-tag v-if="group.total === group.passed" type="success" size="mini">
                  {{ group.passed }}/{{ group.total }}
                </el-tag>
                <el-tag v-else-if="group.rejected > 0" type="danger" size="mini">
                  {{ group.passed }}/{{ group.total }}
                </el-tag>
                <el-tag v-else type="warning" size="mini">
                  {{ group.passed }}/{{ group.total }}
                </el-tag>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="创建人" prop="createBy" align="center" width="90" />
      <el-table-column label="创建时间" prop="createTime" align="center" width="150" />

      <!-- 审核进度列 -->
      <el-table-column label="审核进度" align="center" width="280">
        <template slot-scope="{ row }">
          <div class="compact-audit-progress">
            <el-tooltip :content="getAuditProgressTooltip(row)" placement="top">
              <div class="progress-flow">
                <!-- 会审阶段 -->
                <div class="progress-step" :class="getReviewStepClass(row)">
                  <div class="step-icon">
                    <i :class="getReviewStepIcon(row)"></i>
                  </div>
                  <div class="step-label">会审</div>
                  <div class="step-count" v-if="row.list && row.list.length > 0">
                    {{ getReviewCount(row) }}
                  </div>
                </div>

                <!-- 初审阶段 -->
                <div class="progress-step" :class="getFirstStepClass(row)">
                  <div class="step-icon">
                    <i :class="getFirstStepIcon(row)"></i>
                  </div>
                  <div class="step-label">初审</div>
                  <div class="step-person" v-if="row.firstPerson">{{ row.firstPerson }}</div>
                  <div class="step-status" v-if="row.firstState !== undefined">
                    {{ getFirstStatusText(row.firstState) }}
                  </div>
                </div>

                <!-- 终审阶段 -->
                <div class="progress-step" :class="getSecondStepClass(row)">
                  <div class="step-icon">
                    <i :class="getSecondStepIcon(row)"></i>
                  </div>
                  <div class="step-label">终审</div>
                  <div class="step-person" v-if="row.secondPerson">{{ row.secondPerson }}</div>
                  <div class="step-status" v-if="row.secondState !== undefined">
                    {{ getSecondStatusText(row.secondState) }}
                  </div>
                </div>

                <!-- 系统变更阶段 - 只有配置了系统变更人员才显示 -->
                <div v-if="row.systemPerson" class="progress-step" :class="getSystemStepClass(row)">
                  <div class="step-icon">
                    <i :class="getSystemStepIcon(row)"></i>
                  </div>
                  <div class="step-label">系统</div>
                  <div class="step-person">{{ row.systemPerson }}</div>
                  <div class="step-status" v-if="row.systemState !== undefined">
                    {{ getSystemStatusText(row.systemState) }}
                  </div>
                </div>

                <!-- 订单变更阶段 - 只有配置了订单变更人员才显示 -->
                <div v-if="row.orderChangePerson" class="progress-step" :class="getOrderStepClass(row)">
                  <div class="step-icon">
                    <i :class="getOrderStepIcon(row)"></i>
                  </div>
                  <div class="step-label">订单</div>
                  <div class="step-person">{{ row.orderChangePerson }}</div>
                  <div class="step-status" v-if="row.orderChangeState !== undefined">
                    {{ getOrderStatusText(row.orderChangeState) }}
                  </div>
                </div>

                <!-- 工单变更阶段 - 只有配置了工单变更人员才显示 -->
                <div v-if="row.workOrderChangePerson" class="progress-step" :class="getWorkOrderStepClass(row)">
                  <div class="step-icon">
                    <i :class="getWorkOrderStepIcon(row)"></i>
                  </div>
                  <div class="step-label">工单</div>
                  <div class="step-person">{{ row.workOrderChangePerson }}</div>
                  <div class="step-status" v-if="row.workOrderChangeState !== undefined">
                    {{ getWorkOrderStatusText(row.workOrderChangeState) }}
                  </div>
                </div>
              </div>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" fixed="right" width="120">
        <template slot-scope="{ row }">
          <el-button size="mini" type="primary" icon="el-icon-view" @click="handleView(row)">查看</el-button>

          <el-button v-if="row.firstState !== 1" size="mini" type="primary" icon="el-icon-edit"
            @click="handleUpdate(row)">编辑</el-button>

          <el-button v-show="row.createBy === nickName" size="mini" type="danger" @click="handleDelete(row)"
            icon="el-icon-delete">删除</el-button>
          <!-- 会审按钮 - 优化逻辑 -->
          <template v-for="(item, index) in (row && row.list ? row.list : [])">
            <!-- 会审按钮 -->
            <el-tooltip
              v-if="item.state === 0 && item.fieldName === nickName && row.firstState === 0 && canShowReviewButton(row, item.field)"
              :content="`${TriageList[item.field]}会审`" placement="top" :key="'review-' + index">
              <el-button size="mini" type="primary" @click="handleAuthFlag(item, 2, item.field)">
                <i class="el-icon-check"></i> {{ TriageList[item.field] }}会审
              </el-button>
            </el-tooltip>

            <!-- 撤回会审按钮 -->
            <el-tooltip
              v-if="item.state === 1 && item.fieldName === nickName && row.firstState === 0 && canRevokeReview(row, item.field)"
              :content="`撤销${TriageList[item.field]}会审`" placement="top" :key="'reset-' + index">
              <el-button size="mini" type="danger" @click="handleResetCheck(item, 2, item.field)">
                <i class="el-icon-refresh-left"></i> 撤回{{ TriageList[item.field] }}会审
              </el-button>
            </el-tooltip>
          </template>

          <!-- 审核流程按钮 - 直接显示 -->
          <!-- 初审按钮 -->
          <el-button v-if="row && row.firstPerson === nickName && row.firstState === 0 && isAllReviewsPassed(row)"
            size="mini" type="primary" @click="handleAuthFlag(row, 1)" style="margin-left: 5px;">
            <i class="el-icon-check"></i> 初审
          </el-button>

          <!-- 撤销初审按钮 -->
          <el-button
            v-if="row && row.firstPerson === nickName && row.firstState !== 0 && !(row.secondState === 1 || row.systemState === 1)"
            size="mini" type="danger" @click="handleResetCheck(row, 1)" style="margin-left: 5px;">
            <i class="el-icon-refresh-left"></i> 撤销初审
          </el-button>

          <!-- 终审按钮 -->
          <el-button v-if="row && row.secondPerson === nickName && row.secondState === 0 && row.firstState === 1"
            size="mini" type="success" @click="handleAuthFlag(row, 3)" style="margin-left: 5px;">
            <i class="el-icon-circle-check"></i> 终审
          </el-button>

          <!-- 撤销终审按钮 -->
          <el-button v-if="row && row.secondPerson === nickName && row.secondState !== 0 && row.systemState !== 1"
            size="mini" type="danger" @click="handleResetCheck(row, 3)" style="margin-left: 5px;">
            <i class="el-icon-refresh-left"></i> 撤销终审
          </el-button>

          <!-- 系统变更按钮 -->
          <el-button v-if="row && row.systemPerson === nickName && row.systemState === 0 && row.secondState === 1"
            size="mini" type="warning" @click="handleAuthFlag(row, 5)" style="margin-left: 5px;">
            <i class="el-icon-setting"></i> 系统变更
          </el-button>

          <!-- 订单变更按钮 -->
          <el-button
            v-if="row && row.orderChangePerson === nickName && row.orderChangeState === 0 && (row.systemPerson ? row.systemState === 1 : row.secondState === 1)"
            size="mini" type="primary" @click="handleAuthFlag(row, 7)" style="margin-left: 5px;">
            <i class="el-icon-document"></i> 订单变更
          </el-button>

          <!-- 工单变更按钮 -->
          <el-button
            v-if="row && row.workOrderChangePerson === nickName && row.workOrderChangeState === 0 && row.orderChangeState === 1"
            size="mini" type="info" @click="handleAuthFlag(row, 6)" style="margin-left: 5px;">
            <i class="el-icon-tickets"></i> 工单变更
          </el-button>

        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.p" :limit.sync="queryParams.l"
      @pagination="getList" />

    <!-- 添加或修改BOM变更对话框 -->
    <BomChangeForm ref="bomChangeForm" @ok="getList" />
    <!-- 查看详情对话框 -->
    <DetailView ref="detailView" />

    <!-- 审核弹窗 -->
    <el-dialog :title="authDialogTitle" :visible.sync="authDialogVisible" width="800px" append-to-body top="0vh">
      <el-form ref="authForm" :model="authForm" :rules="authFormRules" label-width="180px">
        <el-form-item label="审核状态" prop="state"
          v-if="!isSystemStateFlag && !isOrderChangeStateFlag && !isWorkOrderChangeStateFlag">
          <el-radio-group v-model="authForm.state" @change="handleResetErrTip">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">不通过</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 系统变更专用字段 -->
        <template v-if="isSystemStateFlag">

          <el-form-item label="变更前BOM编码" prop="beforeOrderBom">
            <el-input v-model="authForm.beforeOrderBom" placeholder="请输入变更前BOM编码" />
          </el-form-item>
          <el-form-item label="变更后BOM编码" prop="afterOrderBom">
            <el-input v-model="authForm.afterOrderBom" placeholder="请输入变更后BOM编码" />
          </el-form-item>
          <el-form-item label="变更内容" prop="systemChangResult">
            <el-input v-model="authForm.systemChangResult" type="textarea" :rows="3" placeholder="请输入变更内容" />
          </el-form-item>
        </template>

        <!-- 订单变更专用字段 -->
        <template v-if="isOrderChangeStateFlag">

          <el-form-item label="订单是否已做变更" prop="orderChangeState">
            <el-select v-model="authForm.orderChangeState" placeholder="请选择" style="width: 100%">
              <el-option label="已变更" :value="1"></el-option>
              <el-option label="不涉及" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="变更结果" prop="orderChangeResult">
            <el-input v-model="authForm.orderChangeResult" type="textarea" :rows="3" placeholder="请输入变更结果" />
          </el-form-item>
        </template>

        <!-- 工单变更专用字段 -->
        <template v-if="isWorkOrderChangeStateFlag">

          <el-form-item label="工单是否已做变更" prop="workOrderChangeState">
            <el-select v-model="authForm.workOrderChangeState" placeholder="请选择" style="width: 100%">
              <el-option label="已变更" value="1"></el-option>
              <el-option label="不涉及" value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="变更结果" prop="workOrderChangeResult">
            <el-input v-model="authForm.workOrderChangeResult" type="textarea" :rows="3" placeholder="请输入变更结果" />
          </el-form-item>
        </template>

        <!-- 会审专用字段 -->
        <el-form-item v-if="isFieldStateFlag" label="相关性" prop="isCorrelation">
          <el-radio-group v-model="authForm.isCorrelation">
            <el-radio label="是">是</el-radio>
            <el-radio label="否">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="isFieldStateFlag" label="是否完成" prop="isComplete">
          <el-radio-group v-model="authForm.isComplete">
            <el-radio label="是">是</el-radio>
            <el-radio label="否">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 部门特定方案字段 - 会审时显示 -->
        <template v-if="isFieldStateFlag">
          <!-- PMC部门方案 -->
          <template v-if="isAuthAlterData.field === 10">
            <el-form-item label="在制产品处理方案" prop="programme">
              <Editor v-model="authForm.programme" :min-height="150" placeholder="订单暂停、订单取消、物料变更、数量减少、软件变更情况下涉及填写">
              </Editor>
            </el-form-item>
          </template>

          <!-- 采购部门方案 -->
          <template v-if="isAuthAlterData.field === 2">
            <el-form-item label="在途物料处理方案" prop="programme">
              <Editor v-model="authForm.programme" :min-height="150" placeholder="订单暂停、订单取消、物料变更及数量减少情况下涉及填写"></Editor>
            </el-form-item>
          </template>

          <!-- 研发部门方案 -->
          <template v-if="isAuthAlterData.field === 6">
            <el-form-item label="涉及更新的文件" prop="programme">
              <Editor v-model="authForm.programme" :min-height="150" placeholder="物料变更及软件变更情况下涉及填写"></Editor>
            </el-form-item>
          </template>

          <!-- 市场部门方案 -->
          <template v-if="isAuthAlterData.field === 8">
            <el-form-item label="在库成品处理方案" prop="programme">
              <Editor v-model="authForm.programme" :min-height="150" placeholder="订单暂停、订单取消、物料变更、数量减少、软件变更情况下涉及填写">
              </Editor>
            </el-form-item>

            <el-form-item label="在库物料处理方案" prop="treatment">
              <Editor v-model="authForm.treatment" :min-height="150" placeholder="订单暂停、订单取消、物料变更、数量减少、软件变更情况下涉及填写">
              </Editor>
            </el-form-item>
          </template>

          <!-- 通用附件上传字段 - 所有部门会审时都显示 -->
          <el-form-item label="相关附件" prop="annexUrl">
            <DrUpload v-model="authForm.annexUrl" :drag="true" :multiple="true" :limit="5" accept="*"
              :css="{ width: '100%' }" class="modern-upload">
            </DrUpload>
          </el-form-item>
        </template>

        <!-- 通用备注和不通过理由字段 -->
        <el-form-item
          v-if="authForm.state === 1 && !isSystemStateFlag && !isOrderChangeStateFlag && !isWorkOrderChangeStateFlag"
          label="备注" prop="remark">
          <el-input v-model="authForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>

        <el-form-item v-if="authForm.state === 2" label="不通过理由" prop="result">
          <el-input v-model="authForm.result" type="textarea" placeholder="请输入不通过理由" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="authDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAuthForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 人员管理弹窗 -->
    <el-dialog title="BOM变更审核人员管理" :visible.sync="isPeopleManageVisible" width="800px" append-to-body top="0vh"
      v-if="isPeopleManageVisible">
      <el-row type="flex" justify="center">
        <el-col :xs="24" :span="20">
          <el-form ref="peopleForm" :model="peopleManageForm" :rules="peopleManageRules" label-width="100px"
            label-position="left" class="input-width">
            <el-form-item label="会审人员："></el-form-item>

            <el-form-item label-width="20px">
              <el-form-item label="PMC：" prop="pmcData" label-width="70px">
                <el-select class="w100" v-model="peopleManageForm.pmcData" filterable multiple clearable
                  placeholder="请选择">
                  <el-option v-for="(item, index) in pmDictListOptions"
                    :key="item.userId || item.userName + '_pmc_' + index" :label="item.userName" :value="item.userName">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="采购：" prop="buyerData" label-width="70px">
                <el-select class="w100" v-model="peopleManageForm.buyerData" filterable multiple clearable
                  placeholder="请选择采购人员">
                  <el-option v-for="(item, index) in pmDictListOptions"
                    :key="item.userId || item.userName + '_buyer_' + index" :label="item.userName"
                    :value="item.userName">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="品质：" prop="QAData" label-width="70px">
                <el-select class="w100" v-model="peopleManageForm.QAData" filterable multiple clearable
                  placeholder="请选择品质人员">
                  <el-option v-for="(item, index) in pmDictListOptions"
                    :key="item.userId || item.userName + '_QA_' + index" :label="item.userName" :value="item.userName">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="生产：" prop="productData" label-width="70px">
                <el-select class="w100" v-model="peopleManageForm.productData" filterable multiple clearable
                  placeholder="请选择生产人员">
                  <el-option v-for="(item, index) in pmDictListOptions"
                    :key="item.userId || item.userName + '_product_' + index" :label="item.userName"
                    :value="item.userName">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="工程：" prop="engineerData" label-width="70px">
                <el-select class="w100" v-model="peopleManageForm.engineerData" filterable multiple clearable
                  placeholder="请选择工程人员">
                  <el-option v-for="(item, index) in pmDictListOptions"
                    :key="item.userId || item.userName + '_engineer_' + index" :label="item.userName"
                    :value="item.userName">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="研发：" prop="researchData" label-width="70px">
                <el-select class="w100" v-model="peopleManageForm.researchData" filterable multiple clearable
                  placeholder="请选择研发人员">
                  <el-option v-for="(item, index) in pmDictListOptions"
                    :key="item.userId || item.userName + '_research_' + index" :label="item.userName"
                    :value="item.userName">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="仓库：" prop="warehouseData" label-width="70px">
                <el-select class="w100" v-model="peopleManageForm.warehouseData" filterable multiple clearable
                  placeholder="请选择仓库人员">
                  <el-option v-for="(item, index) in pmDictListOptions"
                    :key="item.userId || item.userName + '_warehouse_' + index" :label="item.userName"
                    :value="item.userName">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="市场：" prop="marketerData" label-width="70px">
                <el-select class="w100" v-model="peopleManageForm.marketerData" filterable multiple clearable
                  placeholder="请选择市场人员">
                  <el-option v-for="(item, index) in pmDictListOptions"
                    :key="item.userId || item.userName + '_marketing_' + index" :label="item.userName"
                    :value="item.userName">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form-item>

            <el-form-item label="审核人员："></el-form-item>
            <el-form-item label="初审人员：" prop="firstAuditorData">
              <el-select class="w100" v-model="peopleManageForm.firstAuditorData" filterable multiple clearable
                placeholder="请选择初审人员">
                <el-option v-for="(item, index) in pmDictListOptions"
                  :key="item.userId || item.userName + '_firstAuditor_' + index" :label="item.userName"
                  :value="item.userName">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="最终审核：" prop="finalJudgmentData">
              <el-select class="w100" v-model="peopleManageForm.finalJudgmentData" filterable multiple clearable
                placeholder="请选择">
                <el-option v-for="(item, index) in pmDictListOptions"
                  :key="item.userId || item.userName + '_finalJudgment_' + index" :label="item.userName"
                  :value="item.userName">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="变更领域人员：" label-width="500px"></el-form-item>
            <el-form-item label="系统变更 ：" prop="systemChangeData">
              <el-select class="w100" v-model="peopleManageForm.systemChangeData" filterable multiple clearable
                placeholder="请选择">
                <el-option v-for="(item, index) in pmDictListOptions"
                  :key="item.userId || item.userName + '_systemChange_' + index" :label="item.userName"
                  :value="item.userName">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="订单变更 ：" prop="orderChangeData" required>
              <el-select class="w100" v-model="peopleManageForm.orderChangeData" filterable multiple clearable
                placeholder="请选择">
                <el-option v-for="(item, index) in pmDictListOptions"
                  :key="item.userId || item.userName + '_orderChange_' + index" :label="item.userName"
                  :value="item.userName">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="工单变更 ：" prop="workOrderChangeData" required>
              <el-select class="w100" v-model="peopleManageForm.workOrderChangeData" filterable multiple clearable
                placeholder="请选择">
                <el-option v-for="(item, index) in pmDictListOptions"
                  :key="item.userId || item.userName + '_workOrderChange_' + index" :label="item.userName"
                  :value="item.userName">
                </el-option>
              </el-select>
            </el-form-item>

          </el-form>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitPeopleForm">确 定</el-button>
        <el-button @click="isPeopleManageVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import BomChangeForm from './components/BomChangeForm'
import DetailView from './components/DetailView'
import DrUpload from "@/components/MyUpload"
import Editor from "@/components/Editor"
import IntelligentSearchForm from '@/components/IntelligentSearchForm'
import {
  getBomOrderChangeList,
  addBomOrderChange,
  updateBomOrderChange,
  authBomOrderChange,
  auditBomOrderChange,
  getBomOrderChangeDetail,
  getBomOrderFieldState,
  bomOrderFirstState,
  bomOrderSecondState,
  bomOrderSystemState,
  bomOrderChangeState,
  bomOrderWorkState
} from "@/api/third/bomChange"
import { ecnFieldState, BomPersonList, personBomEdit } from "@/api/third/ecn"
import { dictUserList } from "@/api/system/user"
import { listDept } from "@/api/system/dept"
import {
  getCustomerList,
} from "@/api/order";
import { computerNameList } from "@/api/third/fileConfig";
import { mapGetters } from "vuex";
export default {
  name: "BomChange",
  components: {
    BomChangeForm,
    DetailView,
    DrUpload,
    Editor,
    IntelligentSearchForm
  },
  data() {
    return {
      nickName:'杨贵来',
      // 型号
      computerOptions: [],
      customerData: {
        data: [],
        page: 1,
        more: true,
      },
      peopleManageObject: {},
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // BOM变更列表
      bomChangeList: [],

      // 查询参数
      queryParams: {
        p: 1,        // 第几页
        l: 10,       // 多少个
        processCode: null,  // ECN编号
        customer: null,     // 客户名称
        customerNo: null,   // 客户单号
        uNo: null,         // U8单号
        eNo: null,         // E树单号
        configModel: null   // 配置型号
      },

      // IntelligentSearchForm 搜索表单
      searchForm: {
        customer: null,     // 客户名称
        customerNo: null,   // 客户单号
        uNo: null,         // U8单号
        eNo: null,         // E树单号
        configModel: null   // 配置型号
      },

      // IntelligentSearchForm 字段配置
      searchFields: [
        {
          key: 'customer',
          label: '客户',
          component: 'custom', // 使用自定义slot
          sort: 1
        },
        {
          key: 'customerNo',
          label: '客户单号',
          component: 'el-input',
          sort: 2,
          props: {
            placeholder: '请输入客户单号',
            clearable: true
          }
        },
        {
          key: 'uNo',
          label: 'U8单号',
          component: 'el-input',
          sort: 3,
          props: {
            placeholder: '请输入U8单号',
            clearable: true
          }
        },
        {
          key: 'eNo',
          label: 'E树单号',
          component: 'el-input',
          sort: 5,
          props: {
            placeholder: '请输入E树单号',
            clearable: true
          }
        },
        {
          key: 'configModel',
          label: '配置型号',
          component: 'custom', // 使用自定义slot
          sort: 4
        }
      ],
      TriageList: {
        2: "采购",
        3: "品质",
        4: "生产",
        5: "工程",
        6: "研发",
        7: "仓库",
        8: "市场",
        10: "PMC",
      },

      // 审核流程配置 - 按实际业务流程排序
      auditFlowConfig: [
        {
          id: 1,
          name: '初审',
          stateField: 'firstState',
          personField: 'firstPerson',
          type: 'primary',
          icon: 'el-icon-check',
          order: 2, // 会审后的第一步
          canRevoke: true, // 支持撤回
          prerequisite: 'allReviewsPassed' // 前置条件：所有会审通过
        },
        {
          id: 3,
          name: '终审',
          stateField: 'secondState',
          personField: 'secondPerson',
          type: 'success',
          icon: 'el-icon-circle-check',
          order: 3, // 初审后
          canRevoke: true, // 支持撤回
          prerequisite: 'firstPassed' // 前置条件：初审通过
        },
        {
          id: 5,
          name: '系统变更',
          stateField: 'systemState',
          personField: 'systemPerson',
          type: 'warning',
          icon: 'el-icon-setting',
          order: 4, // 终审后
          canRevoke: false, // 不支持撤回
          prerequisite: 'secondPassed' // 前置条件：终审通过
        },
        {
          id: 7,
          name: '订单变更',
          stateField: 'orderChangeState',
          personField: 'orderChangePerson',
          type: 'primary',
          icon: 'el-icon-document',
          order: 5, // 系统变更后
          canRevoke: false, // 不支持撤回
          prerequisite: 'systemPassed' // 前置条件：系统变更通过
        },
        {
          id: 6,
          name: '工单变更',
          stateField: 'workOrderChangeState',
          personField: 'workOrderChangePerson',
          type: 'info',
          icon: 'el-icon-tickets',
          order: 6, // 订单变更后
          canRevoke: false, // 不支持撤回
          prerequisite: 'orderChangePassed' // 前置条件：订单变更通过
        }
      ],
      peopleManageRules: {
        firstAuditorData: [
          {
            required: true,
            message: "请选择初审人员",
            trigger: "change",
          },
        ],
        buyerData: [
          {
            required: true,
            message: "请选择采购人员",
            trigger: "change",
          },
        ],
        QAData: [
          {
            required: true,
            message: "请选择品质人员",
            trigger: "change",
          },
        ],
        productData: [
          {
            required: true,
            message: "请选择生产人员",
            trigger: "change",
          },
        ],
        engineerData: [
          {
            required: true,
            message: "请选择工程人员",
            trigger: "change",
          },
        ],
        researchData: [
          {
            required: true,
            message: "请选择研发人员",
            trigger: "change",
          },
        ],
        warehouseData: [
          {
            required: true,
            message: "请选择仓库人员",
            trigger: "change",
          },
        ],
        marketerData: [
          {
            required: true,
            message: "请选择市场人员",
            trigger: "change",
          },
        ],
        pmcData: [
          {
            required: true,
            message: "请选择PMC人员",
            trigger: "change",
          },
        ],
        finalJudgmentData: [
          {
            required: true,
            message: "请选择终审人员",
            trigger: "change",
          },
        ],
        // systemChangeData: [
        //   {
        //     required: true,
        //     message: "请选择系统变更人员",
        //     trigger: "change",
        //   },
        // ],
        orderChangeData: [
          {
            required: true,
            message: "请选择订单变更人员",
            trigger: "change",
          },
        ],
        workOrderChangeData: [
          {
            required: true,
            message: "请选择工单变更人员",
            trigger: "change",
          },
        ],
      },
      // 审核相关数据
      authDialogVisible: false,
      isAuthFlag: 1,
      isAuthAlterData: {},
      authForm: {
        state: 1,
        remark: '',
        result: '',
        isCorrelation: '是', // 默认值：是
        isComplete: '是',    // 默认值：是
        // 系统变更专用字段
        beforeOrderBom: '',
        afterOrderBom: '',
        systemChangResult: '',
        // 订单变更专用字段
        orderChangePerson: '',
        orderChangeState: '',
        orderChangeResult: '',
        // 工单变更专用字段
        workOrderChangePerson: '',
        workOrderChangeStatus: '',
        workOrderChangeResult: '',
        // 部门特定方案字段
        programme: '',
        treatment: '',
        // 附件字段
        annexUrl: ''
      },
      authFormRules: {
        state: [{ required: true, message: '请选择审核状态', trigger: 'change' }],
        result: [{ required: true, message: '请输入不通过理由', trigger: 'blur' }],
        isCorrelation: [{ required: true, message: '请选择相关性', trigger: 'change' }],
        isComplete: [{ required: true, message: '请选择是否完成', trigger: 'change' }],
        // 系统变更专用字段验证（已改为非必填）
        // systemPerson: [{ required: true, message: '请选择系统变更人员', trigger: 'change' }],
        beforeBomCode: [{ required: true, message: '请输入变更前BOM编码', trigger: 'blur' }],
        afterBomCode: [{ required: true, message: '请输入变更后BOM编码', trigger: 'blur' }],
        changeContent: [{ required: true, message: '请输入变更内容', trigger: 'blur' }],
        // 订单变更专用字段验证
        orderChangePerson: [{ required: true, message: '请选择订单变更人员', trigger: 'change' }],
        orderChangeState: [{ required: true, message: '请选择订单是否已做变更', trigger: 'change' }],
        orderChangeResult: [{ required: true, message: '请输入变更结果', trigger: 'blur' }],
        // 工单变更专用字段验证
        workOrderChangePerson: [{ required: true, message: '请选择工单变更人员', trigger: 'change' }],
        workOrderChangeStatus: [{ required: true, message: '请选择工单是否已做变更', trigger: 'change' }],
        workOrderChangeResult: [{ required: true, message: '请输入变更结果', trigger: 'blur' }],
        // 部门特定方案字段验证（会审时使用 - 动态验证）
        programme: [{
          validator: (rule, value, callback) => {
            if (this.isFieldStateFlag) {
              if (this.isRichTextEmpty(value)) {
                const fieldMap = {
                  10: '请输入在制产品处理方案',
                  2: '请输入在途物料处理方案',
                  6: '请输入涉及更新的文件',
                  8: '请输入在库成品处理方案'
                };
                const message = fieldMap[this.isAuthAlterData.field] || '请输入处理方案';
                callback(new Error(message));
                return;
              }
            }
            callback();
          },
          trigger: 'blur'
        }],
        treatment: [{
          validator: (rule, value, callback) => {
            if (this.isFieldStateFlag && this.isAuthAlterData.field === 8) {
              if (this.isRichTextEmpty(value)) {
                callback(new Error('请输入在库物料处理方案'));
                return;
              }
            }
            callback();
          },
          trigger: 'blur'
        }]
      },
      // 人员管理相关
      isPeopleManageVisible: false,
      peopleManageForm: {
      },
      pmDictListOptions: [],
      deptOptions: [],
      userId: this.$store.getters.userId,
    };
  },
  computed: {
    ...mapGetters(["userId"]),
    // 判断是否为初审状态
    isFirstStateFlag() {
      return this.isAuthFlag === 1;
    },
    // 判断是否为会审状态
    isFieldStateFlag() {
      return this.isAuthFlag === 2;
    },
    // 判断是否为终审状态
    isSecondStateFlag() {
      return this.isAuthFlag === 3;
    },
    // 判断是否为PMC终审状态
    isPmcStateFlag() {
      return this.isAuthFlag === 4;
    },
    // 判断是否为系统变更状态
    isSystemStateFlag() {
      return this.isAuthFlag === 5;
    },
    // 判断是否为订单变更状态
    isOrderChangeStateFlag() {
      return this.isAuthFlag === 7;
    },
    // 判断是否为工单变更状态
    isWorkOrderChangeStateFlag() {
      return this.isAuthFlag === 6;
    },
    // 判断是否为最终状态
    isFinalStateFlag() {
      return this.isAuthAlterData && this.isAuthAlterData.secondState === 1;
    },
    // 判断是否为PMC终审状态标志
    isSecondStateFlag() {
      return this.isAuthAlterData && this.isAuthAlterData.thirdState === 1;
    },
    // 审核弹窗标题
    authDialogTitle() {
      const titleMap = {
        1: '初审',
        2: this.isAuthAlterData && this.isAuthAlterData.field ? `${this.TriageList[this.isAuthAlterData.field]}会审` : '会审',
        3: '终审',
        5: '系统变更审核',
        6: '工单变更审核',
        7: '订单变更审核',
      };
      return titleMap[this.isAuthFlag] || '审核';
    },

    // 订单变更人员选项
    orderChangePersonOptions() {
      // 优先使用专门配置的订单变更人员数据
      if (this.peopleManageForm.orderChangeData && this.peopleManageForm.orderChangeData.length > 0) {
        return this.peopleManageForm.orderChangeData.map(item => ({
          label: item,
          value: item
        }));
      }
    },

    // 工单变更人员选项
    workOrderChangePersonOptions() {
      // 优先使用专门配置的工单变更人员数据
      if (this.peopleManageForm.workOrderChangeData && this.peopleManageForm.workOrderChangeData.length > 0) {
        return this.peopleManageForm.workOrderChangeData.map(item => ({
          label: item,
          value: item
        }));
      }
    },
  },
  watch: {
    isPeopleManageVisible(bool) {
      if (bool) {
        this.getTotalPeopleData();
      }
    },
  },
  created() {
    this.getTreeselect();
    this.getList();
  },
  async mounted() {
    // 获取人员列表
    this.getCheckPeopleList();

    // 获取所有类型的人员数据，包括订单变更和工单变更人员
    this.getTotalPeopleData();

    // 如果函数未正确导入，显示错误信息
    if (typeof bomOrderFirstState !== 'function') {
      console.error('❌ bomOrderFirstState 未正确导入');
      this.$message.error('API函数导入失败，请检查控制台');
    } else {
      console.log('✅ 所有API函数导入成功');
    }
  },
  methods: {
    // IntelligentSearchForm 搜索处理
    handleSearch() {
      // 将searchForm的值同步到queryParams
      this.queryParams.customer = this.searchForm.customer
      this.queryParams.customerNo = this.searchForm.customerNo
      this.queryParams.uNo = this.searchForm.uNo
      this.queryParams.eNo = this.searchForm.eNo
      this.queryParams.configModel = this.searchForm.configModel
      
      this.queryParams.p = 1
      this.getList()
    },

    // IntelligentSearchForm 重置处理
    handleReset() {
      // 重置搜索表单
      this.searchForm = {
        customer: null,
        customerNo: null,
        uNo: null,
        eNo: null,
        configModel: null
      }
      
      // 重置查询参数
      this.queryParams.customer = null
      this.queryParams.customerNo = null
      this.queryParams.uNo = null
      this.queryParams.eNo = null
      this.queryParams.configModel = null
      
      this.queryParams.p = 1
      this.getList()
    },

    // IntelligentSearchForm 字段变化处理
    handleFieldChange(fieldKey, value) {
      // 可以在这里处理特定字段的变化逻辑
      console.log(`字段 ${fieldKey} 变化为:`, value)
    },
    // 型号
    getComputerNameList(name) {
      if (name) {
        this.isCLoading = false;
        computerNameList({
          name,
        }).then((res) => {
          this.computerOptions = res.data;
        });
      } else {
        this.computerOptions = [];
      }
    },
    // 检查富文本内容是否为空
    isRichTextEmpty(value) {
      if (!value) return true;

      // 移除HTML标签，只保留文本内容
      const textContent = value.replace(/<[^>]*>/g, '').trim();

      // 检查是否只包含空白字符、换行符等
      return textContent === '' || textContent === '\n' || /^\s*$/.test(textContent);
    },

    getCustomerData({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        getCustomerList({
          p: page,
          name: keyword,
        }).then((res) => {
          const { list, total, pageNum, pageSize } = res.data;
          list.filter((item) => item.status === 0);

          if (more) {
            this.customerData.data = [...this.customerData.data, ...list];
          } else {
            this.customerData.data = list;
          }
          this.customerData.more = pageNum * pageSize < total;
          this.customerData.page = pageNum;
          resolve();
        });
      });
    },
    /** 检查会审流程前置条件 - PMC -> 采购 -> 研发 -> 市场 */
    canShowReviewButton(row, currentField) {
      if (!row.list || row.list.length === 0) return false;

      // 定义会审流程顺序：PMC(10) -> 采购(2) -> 研发(6) -> 市场(8)
      const reviewOrder = [10, 2, 6, 8];
      const currentIndex = reviewOrder.indexOf(currentField);

      if (currentIndex === -1) return false; // 无效的部门字段

      // 如果是第一个部门(PMC)，直接允许
      if (currentIndex === 0) return true;

      // 检查前面所有部门是否都已完成会审
      for (let i = 0; i < currentIndex; i++) {
        const previousField = reviewOrder[i];
        const previousReviews = row.list.filter(item => item.field === previousField);

        // 如果前面的部门没有人员配置，跳过
        if (previousReviews.length === 0) continue;

        // 检查前面部门的所有人员是否都已通过会审
        const allPassed = previousReviews.every(item => item.state === 1);
        if (!allPassed) return false;
      }

      return true;
    },

    /** 检查是否可以撤回会审 - 只有当后面的部门都未开始会审时才能撤回 */
    canRevokeReview(row, currentField) {
      if (!row.list || row.list.length === 0) return false;

      // 定义会审流程顺序：PMC(10) -> 采购(2) -> 研发(6) -> 市场(8)
      const reviewOrder = [10, 2, 6, 8];
      const currentIndex = reviewOrder.indexOf(currentField);

      if (currentIndex === -1) return false; // 无效的部门字段

      // 检查后面所有部门是否都还未开始会审（状态为0）
      for (let i = currentIndex + 1; i < reviewOrder.length; i++) {
        const nextField = reviewOrder[i];
        const nextReviews = row.list.filter(item => item.field === nextField);

        // 如果后面的部门没有人员配置，跳过
        if (nextReviews.length === 0) continue;

        // 检查后面部门是否有人已经开始会审（状态不为0）
        const hasStarted = nextReviews.some(item => item.state !== 0);
        if (hasStarted) return false;
      }

      return true;
    },

    /** 测试会审流程控制逻辑 - 开发调试用 */
    testReviewFlow() {
      // 模拟测试数据
      const testRow = {
        list: [
          { field: 10, fieldName: 'PMC用户', state: 1 }, // PMC已完成
          { field: 2, fieldName: '采购用户', state: 0 },  // 采购待审核
          { field: 6, fieldName: '研发用户', state: 0 },  // 研发待审核
          { field: 8, fieldName: '市场用户', state: 0 }   // 市场待审核
        ]
      };

      console.log('=== 会审流程控制测试 ===');
      console.log('PMC可以会审:', this.canShowReviewButton(testRow, 10)); // true
      console.log('采购可以会审:', this.canShowReviewButton(testRow, 2));  // true (PMC已完成)
      console.log('研发可以会审:', this.canShowReviewButton(testRow, 6));  // false (采购未完成)
      console.log('市场可以会审:', this.canShowReviewButton(testRow, 8));  // false (前面未完成)

      console.log('PMC可以撤回:', this.canRevokeReview(testRow, 10)); // true (后面都未开始)
      console.log('采购可以撤回:', this.canRevokeReview(testRow, 2));  // true (后面都未开始)
    },

    /** 判断审核是否禁用 */
    isAuditDisabled(row, config) {
      // 检查前置条件
      if (!this.checkPrerequisite(row, config)) {
        return true;
      }

      // 检查后续流程是否已完成（已完成的不能撤回）
      if (config.id === 1) { // 初审
        // 如果终审或系统变更已完成，初审不能撤回
        return row.secondState === 1 || row.systemState === 1;
      }
      if (config.id === 3) { // 终审
        // 如果系统变更已完成，终审不能撤回
        return row.systemState === 1;
      }

      return false;
    },

    /** 检查前置条件 */
    checkPrerequisite(row, config) {
      switch (config.prerequisite) {
        case 'allReviewsPassed':
          // 检查所有会审是否通过
          return this.isAllReviewsPassed(row);
        case 'firstPassed':
          // 检查初审是否通过
          return row.firstState === 1;
        case 'secondPassed':
          // 检查终审是否通过
          return row.secondState === 1;
        case 'systemPassed':
          // 检查系统变更是否通过
          return row.systemState === 1;
        case 'orderChangePassed':
          // 检查订单变更是否通过
          return row.orderChangeState === 1;
        default:
          return true;
      }
    },

    /** 检查所有会审是否通过 */
    isAllReviewsPassed(row) {
      if (!row.list || row.list.length === 0) {
        return false;
      }

      // 所有会审项都必须通过（state === 1）
      return row.list.every(item => item.state === 1);
    },



    /** 获取会审标签类型 */
    getReviewTagType(row) {
      if (!row.list || row.list.length === 0) return 'info';

      const totalReviews = row.list.length;
      const passedReviews = row.list.filter(item => item.state === 1).length;
      const rejectedReviews = row.list.filter(item => item.state === 2).length;

      if (rejectedReviews > 0) return 'danger';
      if (passedReviews === totalReviews) return 'success';
      return 'warning';
    },

    /** 获取会审标签图标 */
    getReviewTagIcon(row) {
      if (!row.list || row.list.length === 0) return 'el-icon-time';

      const totalReviews = row.list.length;
      const passedReviews = row.list.filter(item => item.state === 1).length;
      const rejectedReviews = row.list.filter(item => item.state === 2).length;

      if (rejectedReviews > 0) return 'el-icon-close';
      if (passedReviews === totalReviews) return 'el-icon-check';
      return 'el-icon-time';
    },

    /** 获取会审标签文字 */
    getReviewTagText(row) {
      if (!row.list || row.list.length === 0) return '会审(0/0)';

      const totalReviews = row.list.length;
      const passedReviews = row.list.filter(item => item.state === 1).length;

      return `会审(${passedReviews}/${totalReviews})`;
    },

    /** 获取审核进度提示信息 */
    getAuditProgressTooltip(row) {
      const steps = [];

      // 会审信息
      if (row.list && row.list.length > 0) {
        const totalReviews = row.list.length;
        const passedReviews = row.list.filter(item => item.state === 1).length;
        const rejectedReviews = row.list.filter(item => item.state === 2).length;
        let reviewStatus = '进行中';
        if (rejectedReviews > 0) reviewStatus = '已驳回';
        else if (passedReviews === totalReviews) reviewStatus = '已完成';

        // 获取会审人员列表
        const reviewPersons = row.list.map(item => `${item.fieldName}(${item.state === 1 ? '已通过' : item.state === 2 ? '已驳回' : '待审核'})`).join(', ');
        steps.push(`会审: ${reviewPersons}\n状态: ${passedReviews}/${totalReviews} (${reviewStatus})`);
      }

      // 初审信息
      if (row.firstPerson) {
        let firstStatus = '待审核';
        if (row.firstState === 1) firstStatus = '已通过';
        else if (row.firstState === 2) firstStatus = '已驳回';
        steps.push(`初审: ${row.firstPerson} (${firstStatus})`);
      }

      // 终审信息
      if (row.secondPerson && row.firstState === 1) {
        let secondStatus = '待审核';
        if (row.secondState === 1) secondStatus = '已通过';
        else if (row.secondState === 2) secondStatus = '已驳回';
        steps.push(`终审: ${row.secondPerson} (${secondStatus})`);
      }

      // 系统变更信息
      if (row.systemPerson && row.secondState === 1) {
        let systemStatus = '待变更';
        if (row.systemState === 1) systemStatus = '已变更';
        else if (row.systemState === 2) systemStatus = '已驳回';
        steps.push(`系统变更: ${row.systemPerson} (${systemStatus})`);
      }

      // 订单变更信息
      if (row.orderChangeState !== undefined) {
        let orderStatus = '待变更';
        if (row.orderChangeState === 1) orderStatus = '已变更';
        else if (row.orderChangeState === 2) orderStatus = '已驳回';
        const orderPerson = row.orderChangePerson || '未指定';
        steps.push(`订单变更: ${orderPerson} (${orderStatus})`);
      }

      // 工单变更信息
      if (row.workOrderChangePerson && row.systemState === 1) {
        let workOrderStatus = '待变更';
        if (row.workOrderChangeState === 1) workOrderStatus = '已变更';
        else if (row.workOrderChangeState === 2) workOrderStatus = '已驳回';
        steps.push(`工单变更: ${row.workOrderChangePerson} (${workOrderStatus})`);
      } else if (row.workOrderChangeState !== undefined) {
        let workOrderStatus = '待变更';
        if (row.workOrderChangeState === 1) workOrderStatus = '已变更';
        else if (row.workOrderChangeState === 2) workOrderStatus = '已驳回';
        const workOrderPerson = row.workOrderChangePerson || '未指定';
        steps.push(`工单变更: ${workOrderPerson} (${workOrderStatus})`);
      }

      return steps.join('\n');
    },

    /** 获取会审数量 */
    getReviewCount(row) {
      if (!row.list || row.list.length === 0) return '0/0';
      const totalReviews = row.list.length;
      const passedReviews = row.list.filter(item => item.state === 1).length;
      return `${passedReviews}/${totalReviews}`;
    },

    /** 获取会审人员信息 */
    getReviewPersons(row) {
      if (!row.list || row.list.length === 0) return '';

      // 获取所有会审人员名称
      const persons = row.list.map(item => item.fieldName).filter(name => name);

      if (persons.length === 0) return '';
      if (persons.length === 1) return persons[0];

      // 如果有多个人员，显示前两个，其余用...表示
      if (persons.length <= 2) return persons.join(',');
      return persons.slice(0, 2).join(',') + '...';
    },

    /** 按部门分组会审状态 */
    getReviewStatusByField(list) {
      if (!list || list.length === 0) return {};

      const grouped = {};

      list.forEach(item => {
        const field = item.field;
        if (!grouped[field]) {
          grouped[field] = {
            total: 0,
            passed: 0,
            rejected: 0,
            pending: 0
          };
        }

        grouped[field].total++;

        switch (item.state) {
          case 0:
            grouped[field].pending++;
            break;
          case 1:
            grouped[field].passed++;
            break;
          case 2:
            grouped[field].rejected++;
            break;
        }
      });

      return grouped;
    },

    /** 生成会审详细提示信息 */
    getReviewDetailTooltip(list) {
      if (!list || list.length === 0) return '暂无会审信息';

      const grouped = this.getReviewStatusByField(list);
      const details = [];

      Object.keys(grouped).forEach(field => {
        const group = grouped[field];
        const departmentName = this.TriageList[field];

        // 获取该部门的所有人员详情
        const departmentItems = list.filter(item => item.field === field);
        const personDetails = departmentItems.map(item => {
          let statusText = '';
          switch (item.state) {
            case 0:
              statusText = '待审核';
              break;
            case 1:
              statusText = '已审核';
              break;
            case 2:
              statusText = '已驳回';
              break;
          }
          return `${item.fieldName}: ${statusText}`;
        }).join('<br>');

        details.push(`<div style="margin-bottom: 8px;"><strong>${departmentName}</strong><br>${personDetails}</div>`);
      });

      return details.join('');
    },

    /** 获取指定部门的人员列表 */
    getDepartmentPersons(list, field) {
      if (!list || list.length === 0) return [];
      // 确保field是数字类型进行比较
      const fieldNum = Number(field);
      return list.filter(item => Number(item.field) === fieldNum);
    },

    /** 根据部门动态计算最大显示人数 */
    getMaxDisplayCount(field) {
      // 根据部门类型和屏幕宽度调整显示数量
      const isWideScreen = window.innerWidth > 1200;
      const baseConfig = {
        2: isWideScreen ? 5 : 4,  // 采购 - 通常人员较多
        3: isWideScreen ? 4 : 3,  // 品质
        4: isWideScreen ? 4 : 3,  // 生产
        5: isWideScreen ? 4 : 3,  // 工程
        6: isWideScreen ? 5 : 4,  // 研发 - 通常人员较多
        7: isWideScreen ? 4 : 3,  // 仓库
        8: isWideScreen ? 5 : 4,  // 市场 - 通常人员较多
        10: isWideScreen ? 5 : 4  // PMC - 通常人员较多
      };
      return baseConfig[field] || (isWideScreen ? 4 : 3);
    },

    /** 获取人员状态样式类 */
    getPersonStatusClass(state) {
      switch (state) {
        case 0:
          return 'person-pending';
        case 1:
          return 'person-passed';
        case 2:
          return 'person-rejected';
        default:
          return '';
      }
    },
    /** 会审阶段样式类 */
    getReviewStepClass(row) {
      if (!row.list || row.list.length === 0) return 'step-pending';
      const totalReviews = row.list.length;
      const passedReviews = row.list.filter(item => item.state === 1).length;
      const rejectedReviews = row.list.filter(item => item.state === 2).length;

      if (rejectedReviews > 0) return 'step-rejected';
      if (passedReviews === totalReviews) return 'step-completed';
      if (passedReviews > 0) return 'step-active';
      return 'step-pending';
    },

    /** 会审阶段图标 */
    getReviewStepIcon(row) {
      if (!row.list || row.list.length === 0) return 'el-icon-user';
      const totalReviews = row.list.length;
      const passedReviews = row.list.filter(item => item.state === 1).length;
      const rejectedReviews = row.list.filter(item => item.state === 2).length;

      if (rejectedReviews > 0) return 'el-icon-close';
      if (passedReviews === totalReviews) return 'el-icon-check';
      if (passedReviews > 0) return 'el-icon-loading';
      return 'el-icon-user';
    },

    /** 初审阶段样式类 */
    getFirstStepClass(row) {
      if (!row.firstPerson) return 'step-disabled';
      if (row.firstState === 1) return 'step-completed';
      if (row.firstState === 2) return 'step-rejected';
      // 检查前置条件：所有会审通过，且当前可以进行初审
      if (this.isAllReviewsPassed(row) && row.firstState === 0) return 'step-active';
      return 'step-pending';
    },

    /** 初审阶段图标 */
    getFirstStepIcon(row) {
      if (!row.firstPerson) return 'el-icon-time';
      if (row.firstState === 1) return 'el-icon-check';
      if (row.firstState === 2) return 'el-icon-close';
      // 检查前置条件：所有会审通过，且当前可以进行初审
      if (this.isAllReviewsPassed(row) && row.firstPerson && row.firstState === 0) return 'el-icon-loading';
      return 'el-icon-time';
    },

    /** 终审阶段样式类 */
    getSecondStepClass(row) {
      if (!row.secondPerson || row.firstState !== 1) return 'step-disabled';
      if (row.secondState === 1) return 'step-completed';
      if (row.secondState === 2) return 'step-rejected';
      // 检查前置条件：初审通过，且当前可以进行终审
      if (row.firstState === 1 && row.secondState === 0) return 'step-active';
      return 'step-pending';
    },

    /** 终审阶段图标 */
    getSecondStepIcon(row) {
      if (!row.secondPerson || row.firstState !== 1) return 'el-icon-time';
      if (row.secondState === 1) return 'el-icon-check';
      if (row.secondState === 2) return 'el-icon-close';
      // 检查前置条件：初审通过，且当前可以进行终审
      if (row.firstState === 1 && row.secondPerson && row.secondState === 0) return 'el-icon-loading';
      return 'el-icon-time';
    },

    /** 系统变更阶段样式类 */
    getSystemStepClass(row) {
      // 如果没有系统变更人员，跳过此环节，显示为已完成状态
      if (!row.systemPerson) {
        if (row.secondState === 1) return 'step-completed';
        return 'step-disabled';
      }
      
      if (row.secondState !== 1) return 'step-disabled';
      if (row.systemState === 1) return 'step-completed';
      if (row.systemState === 2) return 'step-rejected';
      // 检查前置条件：终审通过，且当前可以进行系统变更
      if (row.secondState === 1 && row.systemState === 0) return 'step-active';
      return 'step-pending';
    },

    /** 系统变更阶段图标 */
    getSystemStepIcon(row) {
      // 如果没有系统变更人员，跳过此环节，显示为已完成图标
      if (!row.systemPerson) {
        if (row.secondState === 1) return 'el-icon-check';
        return 'el-icon-setting';
      }
      
      if (row.secondState !== 1) return 'el-icon-setting';
      if (row.systemState === 1) return 'el-icon-check';
      if (row.systemState === 2) return 'el-icon-close';
      // 检查前置条件：终审通过，且当前可以进行系统变更
      if (row.secondState === 1 && row.systemPerson && row.systemState === 0) return 'el-icon-loading';
      return 'el-icon-setting';
    },

    /** 订单变更阶段样式类 */
    getOrderStepClass(row) {
      if (row.orderChangeState === undefined) return 'step-disabled';
      if (row.orderChangeState === 1) return 'step-completed';
      if (row.orderChangeState === 2) return 'step-rejected';
      
      // 检查前置条件：如果没有系统变更人员，基于终审状态；否则基于系统变更状态
      const prerequisitePassed = !row.systemPerson ? row.secondState === 1 : row.systemState === 1;
      if (prerequisitePassed && row.orderChangeState === 0) return 'step-active';
      return 'step-pending';
    },

    /** 订单变更阶段图标 */
    getOrderStepIcon(row) {
      if (row.orderChangeState === undefined) return 'el-icon-document';
      if (row.orderChangeState === 1) return 'el-icon-check';
      if (row.orderChangeState === 2) return 'el-icon-close';
      
      // 检查前置条件：如果没有系统变更人员，基于终审状态；否则基于系统变更状态
      const prerequisitePassed = !row.systemPerson ? row.secondState === 1 : row.systemState === 1;
      if (prerequisitePassed && row.orderChangeState === 0) return 'el-icon-loading';
      return 'el-icon-document';
    },

    /** 工单变更阶段样式类 */
    getWorkOrderStepClass(row) {
      if (row.workOrderChangeState === undefined) return 'step-disabled';
      if (row.workOrderChangeState === 1) return 'step-completed';
      if (row.workOrderChangeState === 2) return 'step-rejected';
      // 检查前置条件：订单变更通过，且当前可以进行工单变更
      if (row.orderChangeState === 1 && row.workOrderChangeState === 0) return 'step-active';
      return 'step-pending';
    },

    /** 工单变更阶段图标 */
    getWorkOrderStepIcon(row) {
      if (row.workOrderChangeState === undefined) return 'el-icon-tickets';
      if (row.workOrderChangeState === 1) return 'el-icon-check';
      if (row.workOrderChangeState === 2) return 'el-icon-close';
      // 检查前置条件：订单变更通过，且当前可以进行工单变更
      if (row.orderChangeState === 1 && row.workOrderChangeState === 0) return 'el-icon-loading';
      return 'el-icon-tickets';
    },

    /** 获取工单变更状态文本 */
    getWorkOrderStatusText(state) {
      switch (state) {
        case 0: return '待变更';
        case 1: return '已变更';
        case 2: return '已驳回';
        default: return '未开始';
      }
    },

    /** 获取订单变更状态文本 */
    getOrderStatusText(state) {
      switch (state) {
        case 0: return '待变更';
        case 1: return '已变更';
        case 2: return '已驳回';
        default: return '未开始';
      }
    },

    /** 获取系统变更状态文本 */
    getSystemStatusText(state) {
      switch (state) {
        case 0: return '待变更';
        case 1: return '已变更';
        case 2: return '已驳回';
        default: return '未开始';
      }
    },

    /** 获取初审状态文本 */
    getFirstStatusText(state) {
      switch (state) {
        case 0: return '待审核';
        case 1: return '已通过';
        case 2: return '已驳回';
        default: return '未开始';
      }
    },

    /** 获取终审状态文本 */
    getSecondStatusText(state) {
      switch (state) {
        case 0: return '待审核';
        case 1: return '已通过';
        case 2: return '已驳回';
        default: return '未开始';
      }
    },

    /** 查询订单BOM变更通知列表 */
    getList() {
      this.loading = true;
      getBomOrderChangeList(this.queryParams).then(response => {
        if (response.code === 200 && response.data) {
          this.bomChangeList = response.data.list || [];
          this.total = response.data.total || 0;
        } else {
          this.bomChangeList = [];
          this.total = 0;
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.p = 1;
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      // 重置额外的表单字段
      this.queryParams.customer = null;
      this.queryParams.configModel = null;
      // 清空客户数据和配置型号选项
      this.customerData.data = [];
      this.computerOptions = [];
      this.handleQuery();
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.$refs.bomChangeForm.openDialog();
    },

    /** 修改按钮操作 */
    async handleUpdate(row) {
      const id = row.id || this.ids
      // 请求详情
      const res = await getBomOrderChangeDetail(id)
      if (res && res.code === 200 && res.data) {
        this.$refs.bomChangeForm.openDialog(res.data)
      } else {
        this.$modal.msgError('获取详情失败')
      }
    },

    /** 查看按钮操作 */
    handleView(row) {
      this.$refs.detailView.openDialog(row.id);
    },


    getCheckedLabels(changeCause) {
      // 如果传入的是字符串，先解析JSON
      let arr = [];
      if (typeof changeCause === 'string') {
        try {
          const parsed = JSON.parse(changeCause);

          // 检查是否为新格式（数组结构）
          if (Array.isArray(parsed)) {
            arr = parsed;
          }
          // 兼容旧格式 {categories: [], changeType: ''}
          else if (parsed.categories && Array.isArray(parsed.categories)) {
            arr = this.convertOldFormatToNew(parsed);
          }
        } catch (error) {
          console.warn('解析changeCause失败:', error);
          return '';
        }
      } else if (Array.isArray(changeCause)) {
        arr = changeCause;
      } else {
        return '';
      }

      if (!Array.isArray(arr)) return '';

      let result = [];
      arr.forEach(item => {
        if (item.check) {
          // 有二级（单选逻辑）
          if (Array.isArray(item.list) && item.list.length) {
            const sub = item.list.filter(sub => sub.check).map(sub => sub.label);
            if (sub.length) {
              result.push(item.label + '（' + sub.join('、') + '）');
            } else {
              result.push(item.label);
            }
          } else {
            result.push(item.label);
          }
        }
      });

      console.log("🚀 ~ file: index.vue:254 ~ result:", result);
      return result.join('，');
    },

    /** 转换旧格式到新格式 - 兼容处理 */
    convertOldFormatToNew(oldData) {
      const newFormat = [
        {
          label: '订单暂停',
          id: 1,
          check: oldData.categories.includes('订单暂停'),
          list: []
        },
        {
          label: '订单取消',
          id: 2,
          check: oldData.categories.includes('订单取消'),
          list: []
        },
        {
          label: '订单变更',
          id: 3,
          check: oldData.categories.includes('订单变更'),
          list: [
            { value: 'MATERIAL_CHANGE', label: '物料变更', check: oldData.changeType === 'MATERIAL_CHANGE' },
            { value: 'QTY_INCREASE', label: '数量增加', check: oldData.changeType === 'QTY_INCREASE' },
            { value: 'QTY_DECREASE', label: '数量减少', check: oldData.changeType === 'QTY_DECREASE' },
            { value: 'SOFTWARE_CHANGE', label: '软件变更', check: oldData.changeType === 'SOFTWARE_CHANGE' }
          ]
        }
      ];

      return newFormat;
    },

    /** 测试解析方法 - 开发调试用 */
    testParseChangeCause() {
      // 测试新格式
      const newFormat = JSON.stringify([
        {
          label: '订单暂停',
          id: 1,
          check: true,
          list: []
        },
        {
          label: '订单变更',
          id: 3,
          check: true,
          list: [
            { value: 'MATERIAL_CHANGE', label: '物料变更', check: true },
            { value: 'QTY_INCREASE', label: '数量增加', check: false }
          ]
        }
      ]);

      // 测试旧格式
      const oldFormat = JSON.stringify({
        categories: ['订单暂停', '订单变更'],
        changeType: 'MATERIAL_CHANGE'
      });

      console.log('新格式解析结果:', this.getCheckedLabels(newFormat));
      console.log('旧格式解析结果:', this.getCheckedLabels(oldFormat));

      return {
        newResult: this.getCheckedLabels(newFormat),
        oldResult: this.getCheckedLabels(oldFormat)
      };
    },
    /** 启用/禁用按钮操作 */
    handleDelete(row) {
      const action = row.status === 0 ? '删除' : '删除';
      this.$modal.confirm(`是否确认${action}该订单BOM变更通知？`).then(() => {
        const data = [{
          id: row.id,
          status: row.status === 0 ? 1 : 0,
          why: `${action}操作`
        }];
        return authBomOrderChange(data);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(`${action}成功`);
      }).catch(() => { });
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download('bom/order/export', {
        ...this.queryParams
      }, `bomOrderChange_${new Date().getTime()}.xlsx`)
    },

    /** 获取变更状态类型 */
    getChangeStatusType(status) {
      const statusMap = {
        0: 'info',    // 待审核
        1: 'success', // 通过
        2: 'danger'   // 驳回
      };
      return statusMap[status] || 'info';
    },

    /** 获取变更状态文本 */
    getChangeStatusText(status) {
      const statusMap = {
        0: '待审核',
        1: '通过',
        2: '驳回'
      };
      return statusMap[status] || '待审核';
    },

    /** 获取状态类型 */
    getStatusType(status) {
      const statusMap = {
        0: 'success', // 启用
        1: 'info'     // 禁用
      };
      return statusMap[status] || 'success';
    },

    /** 获取状态文本 */
    getStatusText(status) {
      const statusMap = {
        0: '启用',
        1: '禁用'
      };
      return statusMap[status] || '启用';
    },

    /** 计算表格高度 */
    tableHeight() {
      return window.innerHeight - 280;
    },

    /** 查询部门下拉树结构 */
    getTreeselect() {
      listDept().then((res) => {
        this.deptOptions = res.data;
      });
    },

    // 获取审核人员字典列表
    getCheckPeopleList() {
      dictUserList().then((res) => {
        // 对数据进行去重处理，避免重复键值问题
        const uniqueUsers = [];
        const userNameSet = new Set();

        res.data.forEach(user => {
          if (!userNameSet.has(user.userName)) {
            userNameSet.add(user.userName);
            uniqueUsers.push(user);
          }
        });

        this.pmDictListOptions = uniqueUsers;
      });
    },

    // 获取人员列表
    getTotalPeopleData() {
      const requestList = [
        this.getPeopleList(1),
        this.getPeopleList(2),
        this.getPeopleList(3),
        this.getPeopleList(4),
        this.getPeopleList(5),
        this.getPeopleList(6),
        this.getPeopleList(7),
        this.getPeopleList(8),
        this.getPeopleList(9),
        this.getPeopleList(10),
        this.getPeopleList(11),
        this.getPeopleList(12), // 订单变更人员
        this.getPeopleList(13), // 工单变更人员
      ];
      Promise.all(requestList).then((res) => {
        const [
          firstAuditorData,
          buyerData,
          QAData,
          productData,
          engineerData,
          researchData,
          warehouseData,
          marketerData,
          finalJudgmentData,
          pmcData,
          systemChangeData,
          orderChangeData,
          workOrderChangeData,
        ] = res;

        this.peopleManageForm = {
          firstAuditorData,
          buyerData,
          QAData,
          productData,
          engineerData,
          researchData,
          warehouseData,
          marketerData,
          finalJudgmentData,
          pmcData,
          systemChangeData,
          orderChangeData,
          workOrderChangeData,
        };
      });
    },

    getPeopleList(type) {
      return new Promise((resolve) => {
        try {
          BomPersonList({ type, p: 1, l: 50 }).then((res) => {
            const { list } = res.data;
            // 对人员数据进行去重处理
            const uniquePersonnel = [...new Set(list.map((item) => item.personnel))];
            this.peopleManageObject[type] = list
            console.log(this.peopleManageObject)
            resolve(uniquePersonnel);
          });
        } catch (error) {
          console.error(error);
        }
      });
    },

    // BOM变更人员管理
    handleAddPeople() {
      this.isPeopleManageVisible = true;
      this.resetPeopleForm();
      this.getCheckPeopleList(); // 刷新人员数据，确保去重
      this.getTotalPeopleData(); // 获取已配置的人员数据
    },

    resetPeopleForm() {
      this.peopleManageForm = {
        firstAuditorData: [],
        buyerData: [],
        QAData: [],
        productData: [],
        engineerData: [],
        researchData: [],
        warehouseData: [],
        marketerData: [],
        pmcData: [],
        finalJudgmentData: [],
        systemChangeData: [],
        orderChangeData: [],
        workOrderChangeData: []
      };
      this.resetForm("peopleForm");
    },

    // BOM变更审核人员管理
    submitPeopleForm() {
      this.$refs["peopleForm"].validate((valid) => {
        if (valid) {
          const {
            firstAuditorData,
            buyerData,
            QAData,
            productData,
            engineerData,
            researchData,
            warehouseData,
            marketerData,
            pmcData,
            finalJudgmentData,
            systemChangeData,
            orderChangeData,
            workOrderChangeData
          } = this.peopleManageForm;

          const setPeopleList = (data, type) => {
            return data.map((personnel) => {
              return {
                type,
                personnel,
              };
            });
          };

          const list = [
            ...setPeopleList(firstAuditorData, 1),
            ...setPeopleList(buyerData, 2),
            ...setPeopleList(QAData, 3),
            ...setPeopleList(productData, 4),
            ...setPeopleList(engineerData, 5),
            ...setPeopleList(researchData, 6),
            ...setPeopleList(warehouseData, 7),
            ...setPeopleList(marketerData, 8),
            ...setPeopleList(finalJudgmentData, 9),
            ...setPeopleList(pmcData, 10),
            ...setPeopleList(systemChangeData, 11),
            ...setPeopleList(orderChangeData, 12),
            ...setPeopleList(workOrderChangeData, 13),
          ];

          personBomEdit(list).then((res) => {
            console.log(res);
            if (res.data) {
              this.msgSuccess("操作成功");
              this.isPeopleManageVisible = false;
            }
          });
        }
      });
    },

    // 审核操作
    handleAuthFlag(row, isAuthFlag, field = null) {
      this.resetAuthForm();

      this.isAuthAlterData = Object.assign({}, row);
      this.isAuthFlag = isAuthFlag;
      this.authDialogVisible = true;

      // 如果是会审，需要设置field信息
      if (isAuthFlag === 2 && field) {
        this.isAuthAlterData.field = field;
        this.isAuthAlterData.fieldName = this.nickName;
        this.isAuthAlterData.bomChangeId = row.bomChangeId;
        this.isAuthAlterData.id = row.id;

      }

      if (isAuthFlag === 1) {
        this.authForm = {
          state: row.firstState || 1,
          remark: row.remark,
          result: row.result,
        };
      }

      if (isAuthFlag === 2) {
        // 从 row 或 list 中查找当前用户对应的审核记录
        let existingReview = null;
        if (row && row.list && Array.isArray(row.list)) {
          existingReview = row.list.find(item =>
            item.fieldName === this.nickName && item.field === field
          );
        }

        this.authForm = {
          state: existingReview ? existingReview.state || 1 : 1,
          remark: existingReview ? existingReview.remark || '' : '',
          result: existingReview ? existingReview.result || '' : '',
          isCorrelation: existingReview ? existingReview.isCorrelation || '是' : '是', // 默认值：是
          isComplete: existingReview ? existingReview.isComplete || '是' : '是',     // 默认值：是
          // 部门特定字段 - 从现有记录中获取
          programme: existingReview ? existingReview.programme || '' : '',
          treatment: existingReview ? existingReview.treatment || '' : '',
          annexUrl: existingReview ? existingReview.annexUrl || '' : ''
        };
      }

      if (isAuthFlag === 3) {
        this.authForm = {
          state: row.secondState || 1,
          remark: row.finalRemark,
          result: row.finalResult,
        };
      }

      if (isAuthFlag === 4) {
        this.authForm = {
          state: row.thirdState || 1,
          remark: row.thirdRemark,
          result: row.thirdResult,
        };
      }

      if (isAuthFlag === 5) {
        this.authForm = {
          state: row.systemState || 1,
          remark: row.systemRemark,
          result: row.systemResult,
          // 系统变更专用字段
          systemPerson: row.systemPerson || '',
          beforeBomCode: row.beforeBomCode || '',
          afterBomCode: row.afterBomCode || '',
          changeContent: row.changeContent || '',
        };
      }

      if (isAuthFlag === 7) {
        this.authForm = {
          state: row.orderChangeState || 1,
          remark: row.orderChangeRemark,
          result: row.orderChangeResult,
          // 订单变更专用字段
          orderChangePerson: row.orderChangePerson || '',
          orderChangeState: row.orderChangeState || '',
          orderChangeResult: row.orderChangeResult || '',
        };
      }

      if (isAuthFlag === 6) {
        this.authForm = {
          state: row.workOrderChangeState || 1,
          remark: row.workOrderChangeRemark,
          result: row.workOrderChangeResult,
          // 工单变更专用字段
          workOrderChangePerson: '',
          workOrderChangeStatus: row.workOrderChangeStatus || '',
          workOrderChangeResult: row.workOrderChangeResult || '',
        };
      }
    },

    // 撤销审核
    handleResetCheck(row, flag, field = null) {
      this.$confirm("确定要撤销审核吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 撤销初审
          if (flag === 1) {
            const data = {
              id: row.id,
              remark: row.remark,
              result: row.result,
              state: 0,
            };

            bomOrderFirstState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }

          // 撤销会审
          if (flag === 2) {
            const data = {
              field: field,
              fieldName: this.nickName,
              id: row.id,
              bomChangeId: row.bomChangeId,
              state: 0,
            };

            getBomOrderFieldState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }

          // 撤销终审
          if (flag === 3) {
            const data = {
              id: row.id,
              remark: row.finalRemark,
              result: row.finalResult,
              state: 0,
            };

            bomOrderSecondState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }



          // 撤销系统审核
          if (flag === 5) {
            const data = {
              id: row.id,
              remark: row.systemRemark,
              result: row.systemResult,
              state: 0,
            };

            bomOrderSystemState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }
        })
        .catch(() => { });
    },

    resetAuthForm() {
      this.authForm = {
        state: 1,
        remark: '',
        result: '',
        isCorrelation: '是', // 默认值：是
        isComplete: '是',    // 默认值：是
        // 系统变更专用字段
        systemPerson: '',
        beforeBomCode: '',
        afterBomCode: '',
        changeContent: '',
        // 订单变更专用字段
        orderChangePerson: '',
        orderChangeState: '',
        orderChangeResult: '',
        // 工单变更专用字段
        workOrderChangePerson: '',
        workOrderChangeStatus: '',
        workOrderChangeResult: '',
        // 部门特定方案字段
        programme: '',
        treatment: '',
        // 附件字段
        annexUrl: ''
      };
      this.resetForm("authForm");
    },

    // 审核提交
    submitAuthForm() {
      this.$refs["authForm"].validate((valid) => {
        if (valid) {
          // 转换中文值为数字值
          const convertedForm = {
            ...this.authForm,
            isCorrelation: this.authForm.isCorrelation === '是' ? 0 : this.authForm.isCorrelation === '否' ? 1 : this.authForm.isCorrelation,
            isComplete: this.authForm.isComplete === '是' ? 0 : this.authForm.isComplete === '否' ? 1 : this.authForm.isComplete,
            // 处理订单变更和工单变更的状态值
            orderChangeState: this.authForm.orderChangeState || '',
            workOrderChangeStatus: this.authForm.workOrderChangeStatus || ''
          };

          // 初审
          if (this.isAuthFlag === 1) {
            const data = {
              id: this.isAuthAlterData.id,
              ...convertedForm,
            };
            bomOrderFirstState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }

          // 会审
          if (this.isAuthFlag === 2) {
            console.log(this.isAuthAlterData, 1111)
            console.log(convertedForm, 1231)
            const data = {
              field: this.isAuthAlterData.field,
              fieldName: this.isAuthAlterData.fieldName,
              id: this.isAuthAlterData.id,
              bomChangeId: this.isAuthAlterData.bomChangeId,
              ...convertedForm,
            };

            getBomOrderFieldState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }
          // 终审
          if (this.isAuthFlag === 3) {
            const data = {
              id: this.isAuthAlterData.id,
              ...convertedForm,
            };

            bomOrderSecondState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }



          // 系统变更审核
          if (this.isAuthFlag === 5) {
            const data = {
              id: this.isAuthAlterData.id,
              ...convertedForm,
            };

            bomOrderSystemState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }

          // 订单变更审核
          if (this.isAuthFlag === 7) {
            const data = {
              id: this.isAuthAlterData.id,
              ...convertedForm,
            };

            bomOrderChangeState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }

          // 工单变更审核
          if (this.isAuthFlag === 6) {
            const data = {
              id: this.isAuthAlterData.id,
              ...convertedForm,
            };

            bomOrderWorkState(data).then((res) => {
              if (res.data) {
                this.msgSuccess("操作成功");
                this.getList();
                this.authDialogVisible = false;
              }
            });
          }
        }
      });
    },

    handleResetErrTip(state) {
      this.clearValidateItem("authForm", state === 1 ? "remark" : "result");
    },


  }
};
</script>

<style lang="scss" scoped>
.app-container {
  .search-form {
    background: #fff;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .operation-btns {
      margin-bottom: 18px;
    }
  }
}

// 紧凑审核进度样式
.compact-audit-progress {
  .progress-flow {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 4px;
    padding: 4px 0;
    cursor: help;

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 40px;
      position: relative;
      min-height: 50px;

      .step-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        margin-bottom: 2px;
        transition: all 0.3s ease;
        flex-shrink: 0;

        i {
          color: #fff;
        }
      }

      .step-label {
        font-size: 9px;
        color: #666;
        text-align: center;
        line-height: 1;
        margin-bottom: 1px;
        height: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .step-count {
        font-size: 8px;
        color: #999;
        background: #f5f5f5;
        padding: 1px 3px;
        border-radius: 2px;
        line-height: 1;
        height: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        box-sizing: border-box;
      }

      .step-person {
        font-size: 8px;
        color: #409eff;
        background: #ecf5ff;
        padding: 1px 3px;
        border-radius: 2px;
        line-height: 1;
        max-width: 40px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        height: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        box-sizing: border-box;
      }

      .step-status {
        font-size: 8px;
        color: #666;
        background: #f0f0f0;
        padding: 1px 3px;
        border-radius: 2px;
        line-height: 1;
        height: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        box-sizing: border-box;
      }

      // 连接线
      &:not(:last-child)::after {
        content: '';
        position: absolute;
        top: 10px;
        right: -8px;
        width: 12px;
        height: 1px;
        background: #e4e7ed;
        z-index: 0;
      }

      // 状态样式
      &.step-completed {
        .step-icon {
          background: #67c23a;
          box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
        }

        &:not(:last-child)::after {
          background: #67c23a;
        }
      }

      &.step-active {
        .step-icon {
          background: #e6a23c;
          box-shadow: 0 0 0 2px rgba(230, 162, 60, 0.2);
          animation: pulse 1.5s infinite;
        }

        .step-label {
          color: #e6a23c;
          font-weight: 500;
        }
      }

      &.step-rejected {
        .step-icon {
          background: #f56c6c;
          box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
        }

        .step-label {
          color: #f56c6c;
        }
      }

      &.step-pending {
        .step-icon {
          background: #c0c4cc;
          box-shadow: 0 0 0 2px rgba(192, 196, 204, 0.2);
        }

        .step-label {
          color: #c0c4cc;
        }
      }

      &.step-disabled {
        .step-icon {
          background: #c0c4cc;
          color: #fff;

          i {
            color: #fff;
          }
        }

        .step-label {
          color: #c0c4cc;
        }
      }
    }
  }
}

// 脉冲动画
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 2px rgba(230, 162, 60, 0.2);
  }

  50% {
    box-shadow: 0 0 0 4px rgba(230, 162, 60, 0.4);
  }

  100% {
    box-shadow: 0 0 0 2px rgba(230, 162, 60, 0.2);
  }
}

// 紧凑会审状态样式
.compact-review-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;

  .review-group {
    padding: 3px 6px;
    background: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #e9ecef;
    margin-bottom: 2px;

    .review-row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 24px;

      .department-name {
        font-size: 11px;
        color: #495057;
        font-weight: 500;
        flex-shrink: 0;
        min-width: 35px;
        margin-right: 4px;
      }

      .person-list {
        display: flex;
        align-items: center;
        gap: 2px;
        flex: 1;
        min-width: 0;
        flex-wrap: wrap;

        .person-item {
          font-size: 10px;
          padding: 1px 4px;
          border-radius: 2px;
          background: #fff;
          border: 1px solid #ddd;
          color: #666;
          white-space: nowrap;
          min-width: 25px;
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 0 1 auto;
          text-align: center;

          &.person-pending {
            border-color: #e6a23c;
            color: #e6a23c;
            background: #fdf6ec;
          }

          &.person-passed {
            border-color: #67c23a;
            color: #67c23a;
            background: #f0f9ff;
          }

          &.person-rejected {
            border-color: #f56c6c;
            color: #f56c6c;
            background: #fef0f0;
          }
        }

        .person-more {
          font-size: 10px;
          color: #999;
          font-style: italic;
          padding: 1px 2px;
          background: #f5f5f5;
          border-radius: 2px;
          border: 1px solid #e0e0e0;
          flex-shrink: 0;
        }
      }

      .el-tag {
        margin: 0;
        font-size: 10px;
        padding: 0 3px;
        height: 16px;
        line-height: 14px;
        flex-shrink: 0;
        min-width: 28px;
        text-align: center;
      }
    }
  }
}

// 会审提示框样式
:global(.review-tooltip) {
  max-width: 300px;

  .el-tooltip__popper {
    background: #fff;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .el-tooltip__content {
      color: #606266;
      font-size: 12px;
      line-height: 1.4;
    }
  }
}

// 旧版审核进度样式（保留兼容性）
.audit-progress {
  .progress-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;
    cursor: help;

    .el-tag {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 12px;

      i {
        margin-right: 2px;
      }
    }
  }
}

// 订单信息列表样式
.order-info-list {
  text-align: left;
  
  .order-info-item {
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .order-info-row {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 2px;
      font-size: 12px;
      
      .info-label {
        color: #666;
        font-size: 11px;
        min-width: 50px;
        flex-shrink: 0;
      }
      
      .info-value {
        color: #333;
        font-weight: 500;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    .order-divider {
      height: 1px;
      background: #e8e8e8;
      margin: 6px 0;
    }
  }
  
  .no-data {
    color: #999;
    font-style: italic;
    font-size: 12px;
  }
}

// 操作按钮样式
.el-table {
  .el-button {
    margin: 2px;

    &.el-button--mini {
      padding: 5px 8px;
      font-size: 11px;

      i {
        margin-right: 2px;
      }
    }
  }

  // 操作列按钮换行显示
  .el-table__cell {
    .cell {
      line-height: 1.4;

      .el-button {
        margin: 1px 2px;
        vertical-align: middle;
      }
    }
  }
}
</style>