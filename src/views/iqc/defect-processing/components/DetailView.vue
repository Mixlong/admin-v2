<template>
  <div class="order-detail-dialog" :class="{ 'panel-open': progressPanelVisible }">
    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      width="60%"
      top="0vh"
      custom-class="modern-dialog"
      @close="handleClose"
    >

      <div v-loading="loading" class="modal-body" element-loading-text="加载中...">
        <!-- 基础信息 -->
        <fieldset class="form-fieldset">
          <legend>基本信息</legend>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">日期</span>
              <span class="info-value" :class="{ empty: !detailData.createTime }">{{ formatDate(detailData.createTime) || '2025-09-02' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">机型</span>
              <span class="info-value" :class="{ empty: !detailData.categoryName }">{{ detailData.categoryName || 'BN135' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">物料编码</span>
              <span class="info-value" :class="{ empty: !detailData.invCode }">{{ detailData.invCode || '70240464-1' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">物料名称</span>
              <span class="info-value" :class="{ empty: !detailData.invName }">{{ detailData.invName || '下壳' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">供应商</span>
              <span class="info-value" :class="{ empty: !detailData.invDefine }">{{ detailData.invDefine || '铭记鑫' }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">规格1</span>
              <span class="info-value" :class="{ empty: !detailData.englishName }">{{ detailData.englishName || 'L403XFN-下壳' }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">规格2</span>
              <span class="info-value" :class="{ empty: !detailData.invStd }">{{ detailData.invStd || '1、L403XFN-下壳; 2、材质: PC5420P; 3、表面处理: 原色注塑黑色，表面细纹; 4、尺寸: 85.62*65.15*31.79，套啤M3*6盲孔铜螺母2PCS; 5、符合ROHS，REACH要求' }}</span>
            </div>
          </div>
        </fieldset>

        <!-- 检测数据 -->
        <fieldset class="form-fieldset">
          <legend>检测数据</legend>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">到料数量</span>
              <span class="info-value">{{ detailData.arrivalQuantity || '100' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">抽检数量</span>
              <span class="info-value">{{ detailData.samplingQuantity || '60' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">不良数量</span>
              <span class="info-value">{{ detailData.defectiveQuantity || '30' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">不良率</span>
              <span class="info-value">{{ detailData.defectiveRate || '50.00%' }}</span>
            </div>
          </div>
        </fieldset>

        <!-- 详细信息 -->
        <fieldset v-if="detailData.testInfo || detailData.defectiveDesc" class="form-fieldset">
          <legend>详细信息</legend>
          <div class="detail-content">
            <div v-if="detailData.testInfo" class="detail-section">
              <div class="detail-label">测量数据：</div>
              <div class="detail-value measurement-data" v-html="detailData.testInfo"></div>
            </div>
            <div v-if="detailData.defectiveDesc" class="detail-section">
              <div class="detail-label">不良描述：</div>
              <div class="detail-value defective-desc" v-html="detailData.defectiveDesc"></div>
            </div>
          </div>
        </fieldset>

          <!-- 展示不良率 -->

        <!-- 审核进度触发按钮 -->
        <fieldset class="form-fieldset">
          <legend>审核进度</legend>
          <div class="progress-trigger" @click="toggleProgressPanel">
            <div class="progress-summary">
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
                  v-if="detailData.handlerPerson"
                  class="status-badge"
                  :class="{
                    success: detailData.handlerState === 1,
                    error: detailData.handlerState === 2,
                    info: detailData.handlerState === 0 || !detailData.handlerState
                  }"
                >确认人{{ getStateText(detailData.handlerState) }}</span>
              </div>
              <div class="progress-summary-header">
                <button class="progress-expand-btn">
                  <svg class="expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </fieldset>

        <!-- 涉及领域 -->
        <fieldset v-if="detailData.list && detailData.list.length > 0" class="form-fieldset">
          <legend>变更涉及领域</legend>

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
        </fieldset>

        <!-- 审核详情 -->
        <fieldset class="form-fieldset">
          <legend>审核详情</legend>

          <div class="tabs">
            <button v-if="detailData.handlerPerson" class="tab" :class="{ active: activeTab === 'handler' }" @click="activeTab = 'handler'">确认人审核</button>
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


          <div v-if="activeTab === 'handler'" class="tab-content active">
            <div v-if="detailData.handlerPerson" class="audit-info">
              <div class="audit-header">
                <span class="field-person">{{ detailData.handlerPerson }}</span>
                <span
                  class="status-badge"
                  :class="{
                    success: detailData.handlerState === 1,
                    error: detailData.handlerState === 2,
                    info: detailData.handlerState === 0 || !detailData.handlerState
                  }"
                >{{ getStateText(detailData.handlerState) }}</span>
              </div>
              <div v-if="detailData.handlerRemark" class="info-item">
                <span class="info-label">处理意见</span>
                <span class="info-value" :class="{ 'reject-text': detailData.handlerState === 2 }">
                  {{ detailData.handlerRemark }}
                </span>
              </div>
            </div>
            <div v-else class="empty-state">暂无数据</div>
          </div>
          </fieldset>
        <!-- 附件 -->
        <fieldset v-if="detailData.file" class="form-fieldset">
          <legend>附件</legend>
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
        </fieldset>

        <!-- 操作记录 -->
        <fieldset class="form-fieldset">
          <legend>操作记录</legend>
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
            <br/>
            <div class="info-item">
              <span class="info-label">修改人</span>
              <span class="info-value" :class="{ empty: !detailData.updateBy }">{{ detailData.updateBy || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">修改时间</span>
              <span class="info-value" :class="{ empty: !detailData.updateTime }">{{ detailData.updateTime || '-'
              }}</span>
            </div>
          </div>
        </fieldset>
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
            <div v-if="detailData.handlerPerson" class="timeline-item" :class="getTimelineClass(detailData.handlerState)">
              <div
                class="timeline-dot"
                :class="{
                  success: detailData.handlerState === 1,
                  error: detailData.handlerState === 2,
                  active: detailData.handlerState === 1
                }"
              />
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-title">确认人审核</span>
                  <span
                    class="status-badge small"
                    :class="{
                      success: detailData.handlerState === 1,
                      error: detailData.handlerState === 2,
                      info: detailData.handlerState === 0 || !detailData.handlerState
                    }"
                  >{{ getStateText(detailData.handlerState) }}</span>
                </div>
                <div v-if="detailData.handlerPerson" class="timeline-info">{{ detailData.handlerPerson }}</div>
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
import { getDefectHandlerNoticeInfo } from '@/api/iqc/defectProcessing'

export default {
  name: 'DetailView',
  data() {
    return {
      dialogVisible: false,
      detailData: {},
      loading: false,
      activeTab: 'first',
      dialogTitle: '详情',
      progressPanelVisible: false, // 审核进度面板显示状态
      fieldMap: {
        2: '采购',
        3: '品质',
        4: '生产',
        5: '工程',
        6: '研发',
        7: '仓库',
        8: '市场',
        10: 'PMC'
      }
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
  methods: {
    // 打开详情弹窗 - 这是关键方法，需要暴露给父组件
    async openDialog(id) {
      this.dialogVisible = true
      this.progressPanelVisible = false
      this.loading = true
      this.detailData = {}
      this.activeTab = 'handler'

      try {
        const response = await getDefectHandlerNoticeInfo(id)
        this.detailData = response.data || {}

        // 设置标题
        if (this.detailData.processCode) {
          this.dialogTitle = `订单变更详情 - ${this.detailData.processCode}`
        }
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

    // 获取检验结果标签类型
    getResultTagType(result) {
      const tagTypeMap = {
        'PASS': 'success',
        'OK': 'success',
        'NG': 'danger',
        'FAIL': 'danger',
        'PENDING': 'warning'
      }
      return tagTypeMap[result] || 'info'
    },

    // 获取会审人员
    getReviewPersons() {
      if (!this.detailData.list || this.detailData.list.length === 0) {
        return ''
      }

      const persons = this.detailData.list.map(item => item.fieldName).filter(Boolean)
      return persons.length > 0 ? persons.join('、') : ''
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

    // 格式化日期
    formatDate(date) {
      if (!date) return ''

      try {
        const dateObj = new Date(date)
        if (isNaN(dateObj.getTime())) return ''

        const year = dateObj.getFullYear()
        const month = String(dateObj.getMonth() + 1).padStart(2, '0')
        const day = String(dateObj.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
      } catch (error) {
        return ''
      }
    },

    // 从完整路径中提取文件名
    extractFileName(filePath) {
      if (!filePath) return 'download'
      const parts = filePath.split('/')
      return parts[parts.length - 1] || 'download'
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
  padding:20px;
  background: #ffffff;
  color: #1a1a1a;
  line-height: 1.6;
  transition: margin-right 0.3s ease-out;
  .form-fieldset{
    margin-bottom: 15px;
    padding:15px 25px;
  }
  .form-fieldset{
    border-radius: 5px;
  }
  legend{
    padding:0 15px; 
    background: #ffff;
    
    }
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
  grid-template-columns: repeat(4, 1fr);
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
  .progress-summary{
    display: flex;
    align-items: center;
  }
}

.progress-summary-header {
display: flex;
  align-items: center;
  justify-content: space-between;

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
  flex:1;
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

// 详细信息区域样式
.detail-content {
  padding: 20px;
  background: #fafbfc;
  border-radius: 8px;
}

.detail-section {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.detail-value {
  font-size: 14px;
  line-height: 1.6;
  color: #111827;

  &.measurement-data {
    background: #e8f4fd;
    border: 1px solid #bee3f8;
    border-radius: 6px;
    padding: 12px;
    font-family: 'Consolas', 'Monaco', monospace;
  }

  &.defective-desc {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    padding: 12px;
  }

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

  .detail-content {
    padding: 16px;
  }
}
</style>
