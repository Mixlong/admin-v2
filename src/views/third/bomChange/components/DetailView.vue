<template>
  <div class="order-detail-dialog" :class="{ 'panel-open': progressPanelVisible }">
    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      width="80%"
      top="0vh"
      custom-class="modern-dialog"
      @close="handleClose"
    >
      <div v-loading="loading" class="modal-body" element-loading-text="加载中...">
        <!-- 基础信息 -->
        <section class="section">
          <h3 class="section-title">
            <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            基础信息
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">流程编号</span>
              <span class="info-value" :class="{ empty: !detailData.processCode }">{{ detailData.processCode || '-'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">客户</span>
              <span class="info-value" :class="{ empty: !detailData.customer }">{{ detailData.customer || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">客户单号</span>
              <span class="info-value" :class="{ empty: !detailData.customerNo }">{{ detailData.customerNo || '-'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">U8单号</span>
              <span class="info-value" :class="{ empty: !detailData.uuNo }">{{ detailData.uuNo || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">E树单号</span>
              <span class="info-value" :class="{ empty: !detailData.treeNo }">{{ detailData.treeNo || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">订单BOM编码</span>
              <span class="info-value" :class="{ empty: !detailData.orderBom }">{{ detailData.orderBom || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">配置型号</span>
              <span class="info-value" :class="{ empty: !detailData.configModel }">{{ detailData.configModel || '-'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">订单数量</span>
              <span class="info-value" :class="{ empty: !detailData.orderNum }">{{ detailData.orderNum || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">申请部门</span>
              <span class="info-value" :class="{ empty: !getDeptName(detailData.dept) }">{{ getDeptName(detailData.dept) || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">申请人员</span>
              <span class="info-value" :class="{ empty: !getUserName(detailData.deptPerson) }">{{ getUserName(detailData.deptPerson) || '-'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">原下单日期</span>
              <span class="info-value" :class="{ empty: !detailData.originalOrderTime }">{{ detailData.originalOrderTime
                || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">原计划交期</span>
              <span class="info-value" :class="{ empty: !detailData.originalPlanTime }">{{ detailData.originalPlanTime
                || '-' }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">变更说明</span>
              <span class="info-value" :class="{ empty: !detailData.changeInfo }">{{ detailData.changeInfo || '-'
              }}</span>
            </div>
          </div>
        </section>

        <!-- 变更分类 -->
        <section v-if="detailData.changeCause" class="section">
          <h3 class="section-title">
            <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            变更分类
          </h3>
          <div class="card">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">变更类型</span>
                <span class="info-value">{{ getChangeTypeText(detailData.changeCause) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">变更子类型</span>
                <span class="info-value">{{ getChangeSubTypeText(detailData.changeCause) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- BOM变更对比 -->
        <section v-if="detailData.beforeOrderBom || detailData.afterOrderBom" class="section">
          <h3 class="section-title">
            <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            BOM编码变更
          </h3>
          <div class="bom-comparison card">
            <div class="bom-item before">
              <span class="info-label">变更前</span>
              <span class="info-value">{{ detailData.beforeOrderBom || '-' }}</span>
            </div>
            <div class="arrow-icon">→</div>
            <div class="bom-item after">
              <span class="info-label">变更后</span>
              <span class="info-value">{{ detailData.afterOrderBom || '-' }}</span>
            </div>
          </div>
        </section>

        <!-- 审核进度触发按钮 -->
        <section class="section">
          <div class="progress-trigger" @click="toggleProgressPanel">
            <div class="progress-summary">
              <div class="progress-summary-header">
                <!-- <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg> -->
                <span class="progress-title">审核进度</span>
                <button class="progress-expand-btn">
                  <svg class="expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div class="progress-overview">
                <span
                  class="status-badge"
                  :class="{
                    success: isAllReviewsPassed(),
                    warning: getReviewStatusText().includes('中'),
                    error: getReviewStatusText().includes('驳回'),
                    info: getReviewStatusText() === '无会审'
                  }"
                >{{ getReviewStatusText() }}</span>
                <span class="divider">•</span>
                <span
                  class="status-badge"
                  :class="{
                    success: detailData.firstState === 1,
                    error: detailData.firstState === 2,
                    info: detailData.firstState === 0 || !detailData.firstState
                  }"
                >初审{{ getStateText(detailData.firstState) }}</span>
                <span class="divider">•</span>
                <span
                  class="status-badge"
                  :class="{
                    success: detailData.secondState === 1,
                    error: detailData.secondState === 2,
                    info: detailData.secondState === 0 || !detailData.secondState
                  }"
                >终审{{ getStateText(detailData.secondState) }}</span>
                <span class="divider">•</span>
                <span
                  class="status-badge"
                  :class="{
                    success: detailData.systemState === 1,
                    error: detailData.systemState === 2,
                    warning: detailData.systemState === 0,
                    info: !detailData.systemState
                  }"
                >系统{{ getChangeStateText(detailData.systemState) }}</span>
                <span class="divider">•</span>
                <span
                  class="status-badge"
                  :class="{
                    success: detailData.orderChangeState === 1,
                    error: detailData.orderChangeState === 2,
                    warning: detailData.orderChangeState === 0,
                    info: !detailData.orderChangeState
                  }"
                >订单{{ getChangeStateText(detailData.orderChangeState) }}</span>
                <span class="divider">•</span>
                <span
                  class="status-badge"
                  :class="{
                    success: detailData.workOrderChangeState === 1,
                    error: detailData.workOrderChangeState === 2,
                    warning: detailData.workOrderChangeState === 0,
                    info: !detailData.workOrderChangeState
                  }"
                >工单{{ getChangeStateText(detailData.workOrderChangeState) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 涉及领域 -->
        <section v-if="detailData.list && detailData.list.length > 0" class="section">
          <h3 class="section-title">
            <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            变更涉及领域
          </h3>

          <div v-for="group in groupedFields" :key="group.field" class="field-group">
            <div class="field-header">{{ getFieldName(group.field) }}</div>
            <div class="field-items">
              <div v-for="item in group.items" :key="item.id" class="field-item">
                <div class="field-item-header">
                  <span class="field-person">{{ item.fieldName || '-' }}</span>
                  <div class="field-badges">
                    <span class="status-badge" :class="{ success: item.isCorrelation === 0 }">
                      {{ item.isCorrelation === 0 ? '相关' : '不相关' }}
                    </span>
                    <span
                      class="status-badge"
                      :class="{
                        success: item.isComplete === 0,
                        warning: item.isComplete !== 0
                      }"
                    >
                      {{ item.isComplete === 0 ? '已完成' : '未完成' }}
                    </span>
                    <span
                      class="status-badge"
                      :class="{
                        success: item.state === 1,
                        error: item.state === 2,
                        info: item.state === 0 || !item.state
                      }"
                    >
                      {{ getStateText(item.state) }}
                    </span>
                  </div>
                </div>

                <div
                  v-if="item.programme || item.treatment || item.remark || (item.result && item.state === 2) || (item.annexUrl && item.annexUrl.trim())"
                  class="field-content"
                >
                  <div v-if="item.programme" class="info-item">
                    <span class="info-label">{{ getFieldLabel(item.field) }}</span>
                    <div class="info-value rich-text" v-html="item.programme" />
                  </div>

                  <div v-if="item.treatment && item.field === 8" class="info-item">
                    <span class="info-label">在库物料处理方案</span>
                    <div class="info-value rich-text" v-html="item.treatment" />
                  </div>

                  <div v-if="item.remark" class="info-item">
                    <span class="info-label">备注</span>
                    <span class="info-value">{{ item.remark }}</span>
                  </div>

                  <div v-if="item.result && item.state === 2" class="info-item">
                    <span class="info-label">拒绝原因</span>
                    <span class="info-value reject-text">{{ item.result }}</span>
                  </div>

                  <div v-if="item.annexUrl && item.annexUrl.trim()" class="info-item">
                    <span class="info-label">附件</span>
                    <div class="attachment-list">
                      <div
                        v-for="(file, idx) in parseAnnexFiles(item.annexUrl)"
                        :key="idx"
                        class="attachment-item"
                        @click="zipFile(file.name)"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                        {{ file.name }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 审核详情 -->
        <section class="section">
          <h3 class="section-title">
            <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            审核详情
          </h3>

          <div class="tabs">
            <button class="tab" :class="{ active: activeTab === 'first' }" @click="activeTab = 'first'">初审详情</button>
            <button class="tab" :class="{ active: activeTab === 'second' }" @click="activeTab = 'second'">终审详情</button>
            <button class="tab" :class="{ active: activeTab === 'system' }" @click="activeTab = 'system'">系统变更</button>
            <button class="tab" :class="{ active: activeTab === 'order' }" @click="activeTab = 'order'">订单变更</button>
            <button class="tab" :class="{ active: activeTab === 'work' }" @click="activeTab = 'work'">工单变更</button>
          </div>

          <div v-if="activeTab === 'first'" class="tab-content active">
            <div v-if="detailData.firstPerson" class="audit-info">
              <div class="audit-header">
                <span class="field-person">{{ detailData.firstPerson }}</span>
                <span
                  class="status-badge"
                  :class="{
                    success: detailData.firstState === 1,
                    error: detailData.firstState === 2,
                    info: detailData.firstState === 0 || !detailData.firstState
                  }"
                >{{ getStateText(detailData.firstState) }}</span>
              </div>
              <div v-if="detailData.firstRemark" class="info-item">
                <span class="info-label">审核备注</span>
                <span class="info-value">{{ detailData.firstRemark }}</span>
              </div>
              <div v-if="detailData.firstResult" class="info-item">
                <span class="info-label">拒绝原因</span>
                <span class="info-value reject-text">{{ detailData.firstResult }}</span>
              </div>
            </div>
            <div v-else class="empty-state">暂无数据</div>
          </div>

          <div v-if="activeTab === 'second'" class="tab-content active">
            <div v-if="detailData.secondPerson" class="audit-info">
              <div class="audit-header">
                <span class="field-person">{{ detailData.secondPerson }}</span>
                <span
                  class="status-badge"
                  :class="{
                    success: detailData.secondState === 1,
                    error: detailData.secondState === 2,
                    info: detailData.secondState === 0 || !detailData.secondState
                  }"
                >{{ getStateText(detailData.secondState) }}</span>
              </div>
              <div v-if="detailData.secondRemark" class="info-item">
                <span class="info-label">审核备注</span>
                <span class="info-value">{{ detailData.secondRemark }}</span>
              </div>
              <div v-if="detailData.secondResult" class="info-item">
                <span class="info-label">拒绝原因</span>
                <span class="info-value reject-text">{{ detailData.secondResult }}</span>
              </div>
            </div>
            <div v-else class="empty-state">暂无数据</div>
          </div>

          <div v-if="activeTab === 'system'" class="tab-content active">
            <div v-if="detailData.systemPerson" class="audit-info">
              <div class="audit-header">
                <span class="field-person">{{ detailData.systemPerson }}</span>
                <span
                  class="status-badge"
                  :class="{
                    success: detailData.systemState === 1,
                    error: detailData.systemState === 2,
                    warning: detailData.systemState === 0,
                    info: !detailData.systemState
                  }"
                >{{ getChangeStateText(detailData.systemState) }}</span>
              </div>
              <div v-if="detailData.systemChangResult" class="info-item">
                <span class="info-label">变更内容</span>
                <span class="info-value">{{ detailData.systemChangResult }}</span>
              </div>
              <div v-if="detailData.systemResult" class="info-item">
                <span class="info-label">变更结果</span>
                <span class="info-value" :class="{ 'reject-text': detailData.systemState === 2 }">
                  {{ detailData.systemResult }}
                </span>
              </div>
            </div>
            <div v-else class="empty-state">暂无数据</div>
          </div>

          <div v-if="activeTab === 'order'" class="tab-content active">
            <div v-if="detailData.orderChangePerson" class="audit-info">
              <div class="audit-header">
                <span class="field-person">{{ detailData.orderChangePerson }}</span>
                <span
                  class="status-badge"
                  :class="{
                    success: detailData.orderChangeState === 1,
                    error: detailData.orderChangeState === 2,
                    warning: detailData.orderChangeState === 0,
                    info: !detailData.orderChangeState
                  }"
                >{{ getChangeStateText(detailData.orderChangeState) }}</span>
              </div>
              <div v-if="detailData.orderChangeResult" class="info-item">
                <span class="info-label">变更结果</span>
                <span class="info-value" :class="{ 'reject-text': detailData.orderChangeState === 2 }">
                  {{ detailData.orderChangeResult }}
                </span>
              </div>
            </div>
            <div v-else class="empty-state">暂无数据</div>
          </div>

          <div v-if="activeTab === 'work'" class="tab-content active">
            <div v-if="detailData.workOrderChangePerson" class="audit-info">
              <div class="audit-header">
                <span class="field-person">{{ detailData.workOrderChangePerson }}</span>
                <span
                  class="status-badge"
                  :class="{
                    success: detailData.workOrderChangeState === 1,
                    error: detailData.workOrderChangeState === 2,
                    warning: detailData.workOrderChangeState === 0,
                    info: !detailData.workOrderChangeState
                  }"
                >{{ getChangeStateText(detailData.workOrderChangeState) }}</span>
              </div>
              <div v-if="detailData.workOrderChangeResult" class="info-item">
                <span class="info-label">变更结果</span>
                <span class="info-value" :class="{ 'reject-text': detailData.workOrderChangeState === 2 }">
                  {{ detailData.workOrderChangeResult }}
                </span>
              </div>
            </div>
            <div v-else class="empty-state">暂无数据</div>
          </div>
        </section>

        <!-- 附件 -->
        <section v-if="detailData.file" class="section">
          <h3 class="section-title">
            <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            附件
          </h3>
          <div class="attachment-list">
            <div
              v-for="(item, index) in detailData.file.split(',')"
              :key="index"
              class="attachment-item"
              @click="zipFile(item)"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              {{ item }}
            </div>
          </div>
        </section>

        <!-- 操作记录 -->
        <section class="section">
          <h3 class="section-title">
            <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            操作记录
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">创建人</span>
              <span class="info-value" :class="{ empty: !detailData.createBy }">{{ detailData.createBy || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间</span>
              <span class="info-value" :class="{ empty: !detailData.createTime }">{{ detailData.createTime || '-'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">修改人</span>
              <span class="info-value" :class="{ empty: !detailData.updateBy }">{{ detailData.updateBy || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">修改时间</span>
              <span class="info-value" :class="{ empty: !detailData.updaeTime }">{{ detailData.updaeTime || '-'
              }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- 悬浮审核进度侧边栏 -->
      <div v-show="progressPanelVisible" class="progress-panel">
        <div class="progress-panel-header">
          <h4 class="panel-title">
            <svg class="panel-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            审核进度详情
          </h4>
          <button class="panel-close-btn" @click="closeProgressPanel">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 5L5 15M5 5l10 10" />
            </svg>
          </button>
        </div>

        <div class="progress-panel-body">
          <div class="progress-timeline vertical">
            <div class="timeline-item" :class="getTimelineClass('review')">
              <div
                class="timeline-dot"
                :class="{
                  active: isAllReviewsPassed(),
                  success: isAllReviewsPassed(),
                  error: getReviewStatusText().includes('驳回')
                }"
              />
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-title">会审</span>
                  <span
                    class="status-badge small"
                    :class="{
                      success: isAllReviewsPassed(),
                      warning: getReviewStatusText().includes('中'),
                      error: getReviewStatusText().includes('驳回'),
                      info: getReviewStatusText() === '无会审'
                    }"
                  >{{ getReviewStatusText() }}</span>
                </div>
                <div v-if="getReviewPersons()" class="timeline-info">{{ getReviewPersons() }}</div>
              </div>
            </div>

            <div class="timeline-item" :class="getTimelineClass(detailData.firstState)">
              <div
                class="timeline-dot"
                :class="{
                  success: detailData.firstState === 1,
                  error: detailData.firstState === 2,
                  active: detailData.firstState === 1
                }"
              />
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-title">初审</span>
                  <span
                    class="status-badge small"
                    :class="{
                      success: detailData.firstState === 1,
                      error: detailData.firstState === 2,
                      info: detailData.firstState === 0 || !detailData.firstState
                    }"
                  >{{ getStateText(detailData.firstState) }}</span>
                </div>
                <div v-if="detailData.firstPerson" class="timeline-info">{{ detailData.firstPerson }}</div>
              </div>
            </div>

            <div class="timeline-item" :class="getTimelineClass(detailData.secondState)">
              <div
                class="timeline-dot"
                :class="{
                  success: detailData.secondState === 1,
                  error: detailData.secondState === 2,
                  active: detailData.secondState === 1
                }"
              />
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-title">终审</span>
                  <span
                    class="status-badge small"
                    :class="{
                      success: detailData.secondState === 1,
                      error: detailData.secondState === 2,
                      info: detailData.secondState === 0 || !detailData.secondState
                    }"
                  >{{ getStateText(detailData.secondState) }}</span>
                </div>
                <div v-if="detailData.secondPerson" class="timeline-info">{{ detailData.secondPerson }}</div>
              </div>
            </div>

            <div class="timeline-item" :class="getTimelineClass(detailData.systemState)">
              <div
                class="timeline-dot"
                :class="{
                  success: detailData.systemState === 1,
                  error: detailData.systemState === 2,
                  active: detailData.systemState === 1
                }"
              />
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-title">系统变更</span>
                  <span
                    class="status-badge small"
                    :class="{
                      success: detailData.systemState === 1,
                      error: detailData.systemState === 2,
                      warning: detailData.systemState === 0,
                      info: !detailData.systemState
                    }"
                  >{{ getChangeStateText(detailData.systemState) }}</span>
                </div>
                <div v-if="detailData.systemPerson" class="timeline-info">{{ detailData.systemPerson }}</div>
              </div>
            </div>

            <div class="timeline-item" :class="getTimelineClass(detailData.orderChangeState)">
              <div
                class="timeline-dot"
                :class="{
                  success: detailData.orderChangeState === 1,
                  error: detailData.orderChangeState === 2,
                  active: detailData.orderChangeState === 1
                }"
              />
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-title">订单变更</span>
                  <span
                    class="status-badge small"
                    :class="{
                      success: detailData.orderChangeState === 1,
                      error: detailData.orderChangeState === 2,
                      warning: detailData.orderChangeState === 0,
                      info: !detailData.orderChangeState
                    }"
                  >{{ getChangeStateText(detailData.orderChangeState) }}</span>
                </div>
                <div v-if="detailData.orderChangePerson" class="timeline-info">{{ detailData.orderChangePerson }}</div>
              </div>
            </div>

            <div class="timeline-item" :class="getTimelineClass(detailData.workOrderChangeState)">
              <div
                class="timeline-dot"
                :class="{
                  success: detailData.workOrderChangeState === 1,
                  error: detailData.workOrderChangeState === 2,
                  active: detailData.workOrderChangeState === 1
                }"
              />
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-title">工单变更</span>
                  <span
                    class="status-badge small"
                    :class="{
                      success: detailData.workOrderChangeState === 1,
                      error: detailData.workOrderChangeState === 2,
                      warning: detailData.workOrderChangeState === 0,
                      info: !detailData.workOrderChangeState
                    }"
                  >{{ getChangeStateText(detailData.workOrderChangeState) }}</span>
                </div>
                <div v-if="detailData.workOrderChangePerson" class="timeline-info">{{ detailData.workOrderChangePerson
                }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getBomOrderChangeDetail } from '@/api/third/bomChange'
import { listDept } from '@/api/system/dept'
import { listUser } from '@/api/system/user'

export default {
  name: 'DetailView',
  data() {
    return {
      dialogVisible: false,
      detailData: {},
      loading: false,
      activeTab: 'first',
      dialogTitle: '订单变更详情',
      progressPanelVisible: true, // 审核进度面板显示状态
      fieldMap: {
        2: '采购',
        3: '品质',
        4: '生产',
        5: '工程',
        6: '研发',
        7: '仓库',
        8: '市场',
        10: 'PMC',
        11: '系统变更',
        12: '订单变更',
        13: '工单变更'
      },
      // 部门列表数据缓存
      deptList: [],
      // 用户列表数据缓存
      userList: [],
      // 部门映射 - ID到名称的映射
      deptMap: {},
      // 人员映射 - ID到名称的映射
      userMap: {}
    }
  },
  computed: {
    groupedFields() {
      if (!this.detailData.list) return []

      const groups = {}
      this.detailData.list.forEach(item => {
        if (!groups[item.field]) {
          groups[item.field] = {
            field: item.field,
            items: []
          }
        }
        groups[item.field].items.push(item)
      })

      return Object.values(groups)
    }
  },
  created() {
    // 组件创建时预加载部门和用户数据
    this.loadDeptList()
    this.loadUserList()
  },
  methods: {
    // 打开详情弹窗 - 这是关键方法，需要暴露给父组件
    async openDialog(id) {
      this.dialogVisible = true
      this.progressPanelVisible = true
      this.loading = true
      this.detailData = {}
      this.activeTab = 'first'

      try {
        const response = await getBomOrderChangeDetail(id)
        this.detailData = response.data || {}

        // 设置标题
        if (this.detailData.processCode) {
          this.dialogTitle = `订单变更详情 - ${this.detailData.processCode}`
        }

        // 数据已在 created 中预加载，这里不需要额外处理
      } catch (error) {
        console.error('获取详情失败:', error)
        this.$message.error('获取详情失败')
      } finally {
        this.loading = false
      }
    },

    // 关闭弹窗
    handleClose() {
      this.dialogVisible = false
      this.detailData = {}
      this.activeTab = 'first'
      this.progressPanelVisible = false // 关闭悬浮面板
    },

    // 切换审核进度面板显示状态
    toggleProgressPanel() {
      this.progressPanelVisible = !this.progressPanelVisible
    },

    // 关闭审核进度面板
    closeProgressPanel() {
      this.progressPanelVisible = false
    },

    // 获取领域名称
    getFieldName(field) {
      return this.fieldMap[field] || '未知领域'
    },

    // 获取字段标签
    getFieldLabel(field) {
      const labelMap = {
        10: '在制产品处理方案',
        2: '在途物料处理方案',
        6: '涉及更新的文件',
        8: '在库成品处理方案'
      }
      return labelMap[field] || '方案'
    },

    // 获取状态文本
    getStateText(state) {
      const stateMap = {
        0: '待审核',
        1: '通过',
        2: '驳回'
      }
      return stateMap[state] || '未知'
    },

    // 获取变更状态文本
    getChangeStateText(state) {
      const stateMap = {
        0: '待变更',
        1: '已变更',
        2: '变更失败'
      }
      return stateMap[state] || '未知'
    },

    // 获取状态标签类型
    getStateTagType(state) {
      const typeMap = {
        0: 'info',
        1: 'success',
        2: 'danger'
      }
      return typeMap[state] || 'info'
    },

    // 获取变更状态标签类型
    getChangeStateTagType(state) {
      const typeMap = {
        0: 'warning',
        1: 'success',
        2: 'danger'
      }
      return typeMap[state] || 'info'
    },

    // 获取时间线样式类
    getTimelineClass(state) {
      if (state === 'review') {
        return this.isAllReviewsPassed() ? 'completed' : 'pending'
      }
      return state === 1 ? 'completed' : state === 2 ? 'rejected' : 'pending'
    },

    // 检查所有会审是否通过
    isAllReviewsPassed() {
      if (!this.detailData.list || this.detailData.list.length === 0) {
        return false
      }
      return this.detailData.list.every(item => item.state === 1)
    },

    // 获取会审状态文本
    getReviewStatusText() {
      if (!this.detailData.list || this.detailData.list.length === 0) {
        return '无会审'
      }

      const total = this.detailData.list.length
      const passed = this.detailData.list.filter(item => item.state === 1).length
      const rejected = this.detailData.list.filter(item => item.state === 2).length

      if (rejected > 0) return '会审驳回'
      if (passed === total) return '会审通过'
      return `会审中(${passed}/${total})`
    },

    // 获取会审标签类型
    getReviewTagType() {
      if (!this.detailData.list || this.detailData.list.length === 0) {
        return 'info'
      }

      const rejected = this.detailData.list.some(item => item.state === 2)
      const allPassed = this.detailData.list.every(item => item.state === 1)

      if (rejected) return 'danger'
      if (allPassed) return 'success'
      return 'warning'
    },

    // 获取会审人员
    getReviewPersons() {
      if (!this.detailData.list || this.detailData.list.length === 0) {
        return ''
      }

      const persons = this.detailData.list.map(item => item.fieldName).filter(Boolean)
      return persons.length > 0 ? persons.join('、') : ''
    },

    // 获取变更类型文本
    getChangeTypeText(changeCause) {
      if (!changeCause) return '-'
      try {
        const data = JSON.parse(changeCause)
        if (Array.isArray(data)) {
          const checkedItems = data.filter(item => item.check)
          return checkedItems.map(item => item.label).join('、') || '-'
        }
      } catch (e) {
        return changeCause
      }
      return '-'
    },

    // 获取变更子类型文本
    getChangeSubTypeText(changeCause) {
      if (!changeCause) return '-'
      try {
        const data = JSON.parse(changeCause)
        if (Array.isArray(data)) {
          const subTypes = []
          data.forEach(item => {
            if (item.check && item.list) {
              const checkedSubs = item.list.filter(sub => sub.check)
              subTypes.push(...checkedSubs.map(sub => sub.label))
            }
          })
          return subTypes.join('、') || '-'
        }
      } catch (e) {
        return '-'
      }
      return '-'
    },

    // 解析附件
    parseAnnexFiles(annexUrl) {
      if (!annexUrl || !annexUrl.trim()) return []

      try {
        const files = JSON.parse(annexUrl)
        if (Array.isArray(files)) {
          return files.map(file => ({
            name: file.name || file.fileName || file,
            url: file.url || file.filePath || file
          }))
        }
      } catch (e) {
        return annexUrl.split(',').map(fileName => ({
          name: fileName.trim(),
          url: fileName.trim()
        })).filter(file => file.name)
      }

      return []
    },

    // 下载文件
    // zipFile(fileName) {
    //   if (!fileName) {
    //     this.$message.warning('文件名不能为空');
    //     return;
    //   }

    //   // 如果文件名包含完整路径，直接下载
    //   if (fileName.startsWith('http') || fileName.startsWith('/')) {
    //     this.$download.zip(fileName, this.extractFileName(fileName));
    //   } else {
    //     // 否则构建下载路径（根据项目实际API路径调整）
    //     const downloadUrl = `/system/file/download/${fileName}`;
    //     this.$download.zip(downloadUrl, fileName);
    //   }
    // },

    // 从完整路径中提取文件名
    extractFileName(filePath) {
      if (!filePath) return 'download'
      const parts = filePath.split('/')
      return parts[parts.length - 1] || 'download'
    },

    // 获取部门名称
    getDeptName(deptId) {
      if (!deptId) return ''
      
      // 如果已经有映射，直接返回
      if (this.deptMap[deptId]) {
        return this.deptMap[deptId]
      }
      
      // 如果没有映射且不是数字ID，可能已经是中文名称，直接返回
      if (isNaN(deptId)) {
        return deptId
      }
      
      // 异步加载部门信息
      this.loadDeptInfo(deptId)
      
      // 暂时返回ID，等加载完成后会自动更新
      return deptId
    },

    // 获取用户名称
    getUserName(userId) {
      if (!userId) return ''
      
      // 如果已经有映射，直接返回
      if (this.userMap[userId]) {
        return this.userMap[userId]
      }
      
      // 如果没有映射且不是数字ID，可能已经是中文名称，直接返回
      if (isNaN(userId)) {
        return userId
      }
      
      // 异步加载用户信息
      this.loadUserInfo(userId)
      
      // 暂时返回ID，等加载完成后会自动更新
      return userId
    },

    // 加载部门列表
    async loadDeptList() {
      try {
        const response = await listDept()
        if (response.code === 200 && response.data) {
          this.deptList = response.data
          // 构建部门映射
          response.data.forEach(dept => {
            this.$set(this.deptMap, dept.deptId, dept.deptName)
          })
          console.log('部门列表加载完成:', this.deptMap)
        }
      } catch (error) {
        console.error('获取部门列表失败:', error)
      }
    },

    // 加载用户列表
    async loadUserList() {
      try {
        const response = await listUser({ p: 1, l: 999 })
        if (response.code === 200 && response.rows) {
          this.userList = response.rows
          // 构建用户映射，优先使用 nickName
          response.rows.forEach(user => {
            const userName = user.nickName || user.realName || user.userName
            this.$set(this.userMap, user.userId, userName)
          })
          console.log('用户列表加载完成:', Object.keys(this.userMap).length, '个用户')
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
      }
    },

    // 获取部门名称
    getDeptName(deptId) {
      if (!deptId) return ''
      
      // 如果已经有映射，直接返回
      if (this.deptMap[deptId]) {
        return this.deptMap[deptId]
      }
      
      // 如果不是数字ID，可能已经是中文名称，直接返回
      if (isNaN(deptId)) {
        return deptId
      }
      
      // 如果没有加载过列表，触发加载
      if (this.deptList.length === 0) {
        this.loadDeptList()
      }
      
      // 暂时返回ID，等加载完成后会自动更新
      return deptId
    },

    // 获取用户名称
    getUserName(userId) {
      if (!userId) return ''
      
      // 如果已经有映射，直接返回
      if (this.userMap[userId]) {
        return this.userMap[userId]
      }
      
      // 如果不是数字ID，可能已经是中文名称，直接返回
      if (isNaN(userId)) {
        return userId
      }
      
      // 如果没有加载过列表，触发加载
      if (this.userList.length === 0) {
        this.loadUserList()
      }
      
      // 暂时返回ID，等加载完成后会自动更新
      return userId
    }
  }
}
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}

.order-detail-dialog {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;

  ::v-deep .modern-dialog {
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    position: relative;

    .el-dialog__header {
      padding: 24px 32px;
      border-bottom: 1px solid #e5e7eb;

      .el-dialog__title {
        font-size: 20px;
        font-weight: 600;
        color: #111827;
      }
    }

    .el-dialog__body {
      padding: 0;
      max-height: calc(90vh - 250px);
      overflow: auto;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #f3f4f6;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;

        &:hover {
          background: #9ca3af;
        }
      }
    }

    .el-dialog__footer {
      padding: 20px 32px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
    }
  }
}

.modal-body {
  padding: 32px;
  background: #ffffff;
  color: #1a1a1a;
  line-height: 1.6;
  transition: margin-right 0.3s ease-out;
}

.order-detail-dialog.panel-open .modal-body {
  margin-right: 370px;
}

// 现代化区块样式
.section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  .section-icon {
    width: 16px;
    height: 16px;
    opacity: 0.6;
  }
}

// 信息网格
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.full-width {
    grid-column: 1 / -1;
  }
}

.info-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #111827;
  font-weight: 500;

  &.empty {
    color: #d1d5db;
  }

  &.reject-text {
    color: #ef4444;
  }
}

.card {
  background: #fafbfc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}

// BOM对比
.bom-comparison {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;

  .bom-item {
    flex: 1;
    max-width: 300px;
    text-align: center;

    .info-label {
      margin-bottom: 8px;
    }

    .info-value {
      display: block;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 6px;
      font-family: 'Consolas', 'Monaco', monospace;
    }

    &.after .info-value {
      background: #e8f4fd;
      color: #1890ff;
      font-weight: 500;
    }
  }

  .arrow-icon {
    font-size: 20px;
    color: #9ca3af;
  }
}

// 时间线进度样式（横向布局）
.progress-timeline {
  padding: 20px;

  .timeline-item {
    display: flex;
    align-items: flex-start;
    position: relative;
    padding-bottom: 24px;

    &:last-child {
      padding-bottom: 0;

      &::before {
        display: none;
      }
    }

    &::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 30px;
      bottom: 0;
      width: 1px;
      background: #e8e8e8;
    }

    &.completed {
      .timeline-dot {
        background: #52c41a;
        border-color: #52c41a;
      }
    }

    &.rejected {
      .timeline-dot {
        background: #ff4d4f;
        border-color: #ff4d4f;
      }
    }

    &.pending {
      .timeline-dot {
        background: #fff;
        border-color: #d9d9d9;
      }
    }
  }

  .timeline-dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid #d9d9d9;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    flex-shrink: 0;
    z-index: 1;
    position: relative;

    &.active {
      border-color: #3b82f6;
      background: #3b82f6;
    }

    &.success {
      border-color: #10b981;
      background: #10b981;
    }

    &.error {
      border-color: #ef4444;
      background: #ef4444;
    }

    &::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
  }

  .timeline-content {
    flex: 1;

    .timeline-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 4px;

      .timeline-title {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }
    }

    .timeline-info {
      font-size: 12px;
      color: #999;
    }
  }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  gap: 4px;

  &.success {
    background: #d1fae5;
    color: #065f46;
  }

  &.warning {
    background: #fed7aa;
    color: #92400e;
  }

  &.error {
    background: #fee2e2;
    color: #991b1b;
  }

  &.info {
    background: #dbeafe;
    color: #1e40af;
  }
}

// 领域分组样式
.field-group {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
}

.field-header {
  background: #f9fafb;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.field-items {
  padding: 16px;
}

.field-item {
  padding: 16px;
  background: white;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 1px solid #e5e7eb;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

.field-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.field-person {
  font-weight: 600;
  color: #111827;
}

.field-badges {
  display: flex;
  gap: 8px;
}

.field-content {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.rich-text {
  background: #fafbfc;
  border-radius: 4px;
  padding: 8px 12px;
  line-height: 1.6;

  ::v-deep p {
    margin: 0 0 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ::v-deep ul,
  ::v-deep ol {
    padding-left: 20px;
    margin: 8px 0;
  }
}

// 标签页样式
.tabs {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.tab {
  padding: 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;

  &:hover {
    color: #111827;
  }

  &.active {
    color: #3b82f6;

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: #3b82f6;
    }
  }
}

.tab-content {
  display: none;

  &.active {
    display: block;
  }
}

.audit-info {
  background: #fafbfc;
  border-radius: 8px;
  padding: 20px;
}

.audit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 14px;
}

// 附件列表
.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

// 审核进度触发按钮样式
.progress-trigger {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.progress-summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  .progress-title {
    font-size: 14px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .progress-expand-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
    color: #9ca3af;

    &:hover {
      background: #e5e7eb;
      color: #6b7280;
    }

    .expand-icon {
      width: 16px;
      height: 16px;
    }
  }
}

.progress-overview {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .divider {
    color: #d1d5db;
    font-size: 12px;
  }
}

// 悬浮面板样式
.progress-panel {
  position: absolute;
  top: 70px;
  right: 20px;
  bottom: 20px;
  width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 10;
  animation: slideInRight 0.3s ease-out;

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }

    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
}

.progress-panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;

  .panel-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;

    .panel-icon {
      width: 20px;
      height: 20px;
      color: #6b7280;
    }
  }

  .panel-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    color: #6b7280;
    transition: all 0.2s;

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }
  }
}

.progress-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 2px;

    &:hover {
      background: #9ca3af;
    }
  }
}

// 垂直时间线样式
.progress-timeline.vertical {
  .timeline-item {
    padding-bottom: 20px;

    &:last-child {
      padding-bottom: 0;

      &::before {
        display: none;
      }
    }

    &::before {
      background: #e8e8e8;
    }
  }

  .timeline-content {
    .timeline-header {
      gap: 8px;
      margin-bottom: 6px;

      .timeline-title {
        font-size: 13px;
        font-weight: 600;
        color: #374151;
      }
    }

    .timeline-info {
      font-size: 11px;
      color: #6b7280;
      margin-left: 0;
    }
  }
}

// 小尺寸状态徽章
.status-badge.small {
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.2;
}

// 响应式设计
@media (max-width: 768px) {
  .modal-body {
    padding: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .bom-comparison {
    flex-direction: column;

    .arrow-icon {
      transform: rotate(90deg);
    }
  }

  .tabs {
    overflow-x: auto;
  }

  .progress-panel {
    width: calc(100vw - 40px);
    max-width: 400px;
  }

  .progress-overview {
    font-size: 12px;
  }
}
</style>
