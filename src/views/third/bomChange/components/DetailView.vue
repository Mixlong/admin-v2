<template>
  <div class="post-form">
    <el-dialog :close-on-click-modal="false" :visible.sync="dialogVisible" title="BOM变更详情" top="5vh" width="90%"
      custom-class="detail-dialog">
      <div class="detail-container" v-loading="loading" element-loading-text="加载详情中...">
        <!-- 基础信息 -->
        <div class="detail-section">
          <div class="post-form model-wrap">
            <div class="model-wrap-style">
              <div class="title" style="padding-left: 3px">
                <div><i class="el-icon-document mr10 margin-left-xs"></i>基础信息</div>
              </div>
            </div>
            <div class="model-content">
              <el-row class="margin-bottom-xs">
                <el-col :span="8">
                  流程编号：
                  <span class="gray">{{ detailData.processCode || '-' }}</span>
                </el-col>
                <el-col :span="8">
                  客户：
                  <span class="gray">{{ detailData.customer || '-' }}</span>
                </el-col>
                <el-col :span="8">
                  客户单号：
                  <span class="gray">{{ detailData.customerNo || '-' }}</span>
                </el-col>
              </el-row>
              <el-row class="margin-bottom-xs">
                <el-col :span="8">
                  U8单号：
                  <span class="gray">{{ detailData.uuNo || '-' }}</span>
                </el-col>
                <el-col :span="8">
                  E树单号：
                  <span class="gray">{{ detailData.treeNo || '-' }}</span>
                </el-col>
                <el-col :span="8">
                  订单BOM编码：
                  <span class="gray">{{ detailData.orderBom || '-' }}</span>
                </el-col>
              </el-row>
              <el-row class="margin-bottom-xs">
                <el-col :span="8">
                  配置型号：
                  <span class="gray">{{ detailData.configModel || '-' }}</span>
                </el-col>
                <el-col :span="8">
                  订单数量：
                  <span class="gray">{{ detailData.orderNum || '-' }}</span>
                </el-col>
                <el-col :span="8">
                  申请部门：
                  <span class="gray">{{ detailData.dept || '-' }}</span>
                </el-col>
              </el-row>
              <el-row class="margin-bottom-xs">
                <el-col :span="8">
                  申请人员：
                  <span class="gray">{{ detailData.deptPerson || '-' }}</span>
                </el-col>
                <el-col :span="8">
                  原下单日期：
                  <span class="gray">{{ detailData.originalOrderTime || '-' }}</span>
                </el-col>
                <el-col :span="8">
                  原计划交期：
                  <span class="gray">{{ detailData.originalPlanTime || '-' }}</span>
                </el-col>
              </el-row>
              <el-row class="margin-bottom-xs">
                <el-col :span="8">
                  客户通知变更时间：
                  <span class="gray">{{ detailData.customerNoticeTime || '-' }}</span>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  变更说明：
                  <span class="gray">{{ detailData.changeInfo || '-' }}</span>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>

        <!-- 变更分类 -->
        <div class="detail-section">
          <div class="post-form model-wrap">
            <div class="model-wrap-style">
              <div class="title" style="padding-left: 3px">
                <div><i class="el-icon-edit mr10 margin-left-xs"></i>变更分类</div>
              </div>
            </div>
            <div class="model-content">
              <el-row class="margin-bottom-xs">
                <el-col :span="12">
                  变更类型：
                  <span class="gray">{{ getChangeTypeText(detailData.changeCause) }}</span>
                </el-col>
                <el-col :span="12">
                  变更子类型：
                  <span class="gray">{{ getChangeSubTypeText(detailData.changeCause) }}</span>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>

        <!-- BOM编码变更信息 -->
        <div class="detail-section" v-if="detailData.beforeOrderBom || detailData.afterOrderBom">
          <div class="post-form model-wrap">
            <div class="model-wrap-style">
              <div class="title" style="padding-left: 3px">
                <div><i class="el-icon-s-order mr10 margin-left-xs"></i>BOM编码变更信息</div>
              </div>
            </div>
            <div class="model-content">
              <el-row class="margin-bottom-xs">
                <el-col :span="12">
                  变更前BOM编码：
                  <span class="gray">{{ detailData.beforeOrderBom || '-' }}</span>
                </el-col>
                <el-col :span="12">
                  变更后BOM编码：
                  <span class="gray">{{ detailData.afterOrderBom || '-' }}</span>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>

        <!-- 审核进度 -->
        <div class="detail-section">
          <div class="post-form model-wrap">
            <div class="model-wrap-style">
              <div class="title" style="padding-left: 3px">
                <div><i class="el-icon-s-promotion mr10 margin-left-xs"></i>审核进度</div>
              </div>
            </div>
            <div class="model-content">
              <div class="progress-container">
                <div class="progress-steps">
                  <!-- 会审 -->
                  <div class="progress-step">
                    <div class="step-icon" :class="getProgressStepClass('review')">
                      <i class="el-icon-user"></i>
                    </div>
                    <div class="step-content">
                      <div class="step-title">会审</div>
                      <div class="step-status" :class="getReviewStatusClass()">{{ getReviewStatusText() }}</div>
                      <div class="step-person" v-if="getReviewPersons()">{{ getReviewPersons() }}</div>
                    </div>
                  </div>

                  <!-- 初审 -->
                  <div class="progress-step">
                    <div class="step-icon" :class="getProgressStepClass('first')">
                      <i class="el-icon-circle-check"></i>
                    </div>
                    <div class="step-content">
                      <div class="step-title">初审</div>
                      <div class="step-status" :class="getStateClass(detailData.firstState)">{{
                        getStateText(detailData.firstState) }}</div>
                      <div class="step-person" v-if="detailData.firstPerson">{{ detailData.firstPerson }}</div>
                    </div>
                  </div>

                  <!-- 终审 -->
                  <div class="progress-step">
                    <div class="step-icon" :class="getProgressStepClass('second')">
                      <i class="el-icon-circle-check"></i>
                    </div>
                    <div class="step-content">
                      <div class="step-title">终审</div>
                      <div class="step-status" :class="getStateClass(detailData.secondState)">{{
                        getStateText(detailData.secondState) }}</div>
                      <div class="step-person" v-if="detailData.secondPerson">{{ detailData.secondPerson }}</div>
                    </div>
                  </div>

                  <!-- 系统变更 -->
                  <div class="progress-step">
                    <div class="step-icon" :class="getProgressStepClass('system')">
                      <i class="el-icon-setting"></i>
                    </div>
                    <div class="step-content">
                      <div class="step-title">系统变更</div>
                      <div class="step-status" :class="getChangeStateClass(detailData.systemState)">{{
                        getChangeStateText(detailData.systemState) }}</div>
                      <div class="step-person" v-if="detailData.systemPerson">{{ detailData.systemPerson }}</div>
                    </div>
                  </div>

                  <!-- 订单变更 -->
                  <div class="progress-step">
                    <div class="step-icon" :class="getProgressStepClass('order')">
                      <i class="el-icon-s-order"></i>
                    </div>
                    <div class="step-content">
                      <div class="step-title">订单变更</div>
                      <div class="step-status" :class="getChangeStateClass(detailData.orderChangeState)">{{
                        getChangeStateText(detailData.orderChangeState) }}</div>
                      <div class="step-person" v-if="detailData.orderChangePerson">{{ detailData.orderChangePerson }}
                      </div>
                    </div>
                  </div>

                  <!-- 工单变更 -->
                  <div class="progress-step">
                    <div class="step-icon" :class="getProgressStepClass('work')">
                      <i class="el-icon-s-cooperation"></i>
                    </div>
                    <div class="step-content">
                      <div class="step-title">工单变更</div>
                      <div class="step-status" :class="getChangeStateClass(detailData.workOrderChangeState)">{{
                        getChangeStateText(detailData.workOrderChangeState) }}</div>
                      <div class="step-person" v-if="detailData.workOrderChangePerson">{{
                        detailData.workOrderChangePerson }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 变更涉及领域 -->
        <div class="detail-section" v-if="detailData.list && detailData.list.length > 0">
          <div class="post-form model-wrap">
            <div class="model-wrap-style">
              <div class="title" style="padding-left: 3px">
                <div><i class="el-icon-user mr10 margin-left-xs"></i>变更涉及领域</div>
              </div>
            </div>
            <div class="model-content">
              <div v-for="group in groupedFields" :key="group.field" class="field-group">
                <h4 class="field-title">{{ getFieldName(group.field) }}</h4>
                <div class="field-items">
                  <div v-for="item in group.items" :key="item.id" class="field-item">
                    <el-row class="margin-bottom-xs">
                      <el-col :span="6">
                        涉及人员：
                        <span class="gray">{{ item.fieldName || '-' }}</span>
                      </el-col>
                      <el-col :span="6">
                        处理方案：
                        <span class="gray">{{ item.treatment || '-' }}</span>
                      </el-col>
                      <el-col :span="6">
                        相关性：
                        <span :class="item.isCorrelation === 0 ? 'status-passed' : 'status-rejected'">{{
                          item.isCorrelation === 0 ? '是' : '否' }}</span>
                      </el-col>
                      <el-col :span="6">
                        完成情况：
                        <span :class="item.isComplete === 0 ? 'status-completed' : 'status-pending'">{{ item.isComplete
                          === 0 ? '已完成' : '未完成' }}</span>
                      </el-col>
                    </el-row>
                    <el-row class="margin-bottom-xs">
                      <el-col :span="6">
                        审核状态：
                        <span :class="getStateClass(item.state)">{{ getStateText(item.state) }}</span>
                      </el-col>
                      <el-col :span="6">
                        方案或文件：
                        <span class="gray">{{ item.programme || '-' }}</span>
                      </el-col>
                      <el-col :span="6">
                        备注：
                        <span class="gray">{{ item.remark || '-' }}</span>
                      </el-col>
                      <el-col :span="6">
                        拒绝原因：
                        <span v-if="item.result && item.state === 2" class="reject-reason-highlight">
                          <i class="el-icon-warning"></i>
                          {{ item.result }}
                        </span>
                        <span v-else class="gray">{{ item.result || '-' }}</span>
                      </el-col>
                    </el-row>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <!-- 审核详情 -->
        <div class="detail-section">
          <div class="post-form model-wrap">
            <div class="model-wrap-style">
              <div class="title" style="padding-left: 3px">
                <div><i class="el-icon-chat-line-square mr10 margin-left-xs"></i>审核详情</div>
              </div>
            </div>
            <div class="model-content">
              <!-- 初审详情 -->
              <div class="audit-detail">
                <h4>初审详情</h4>
                <el-row class="margin-bottom-xs">
                  <el-col :span="8">
                    审核人员：
                    <span class="gray">{{ detailData.firstPerson || '-' }}</span>
                  </el-col>
                  <el-col :span="8">
                    审核状态：
                    <span :class="getStateClass(detailData.firstState)">{{ getStateText(detailData.firstState) }}</span>
                  </el-col>
                  <el-col :span="8">
                    审核备注：
                    <span class="gray">{{ detailData.firstRemark || '-' }}</span>
                  </el-col>
                </el-row>
                <el-row class="margin-bottom-xs" v-if="detailData.firstResult">
                  <el-col :span="24">
                    <div class="reject-reason-section">
                      <i class="el-icon-warning-outline"></i>
                      <span class="reject-label">拒绝原因：</span>
                      <span class="reject-reason-text">{{ detailData.firstResult }}</span>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <!-- 终审详情 -->
              <div class="audit-detail">
                <h4>终审详情</h4>
                <el-row class="margin-bottom-xs">
                  <el-col :span="8">
                    审核人员：
                    <span class="gray">{{ detailData.secondPerson || '-' }}</span>
                  </el-col>
                  <el-col :span="8">
                    审核状态：
                    <span :class="getStateClass(detailData.secondState)">{{ getStateText(detailData.secondState)
                      }}</span>
                  </el-col>
                  <el-col :span="8">
                    审核备注：
                    <span class="gray">{{ detailData.secondRemark || '-' }}</span>
                  </el-col>
                </el-row>
                <el-row class="margin-bottom-xs" v-if="detailData.secondResult">
                  <el-col :span="24">
                    <div class="reject-reason-section">
                      <i class="el-icon-warning-outline"></i>
                      <span class="reject-label">拒绝原因：</span>
                      <span class="reject-reason-text">{{ detailData.secondResult }}</span>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <!-- 系统变更详情 -->
              <div class="audit-detail">
                <h4>系统变更</h4>
                <el-row class="margin-bottom-xs">
                  <el-col :span="8">
                    变更人员：
                    <span class="gray">{{ detailData.systemPerson || '-' }}</span>
                  </el-col>
                  <el-col :span="8">
                    变更状态：
                    <span :class="getChangeStateClass(detailData.systemState)">{{
                      getChangeStateText(detailData.systemState) }}</span>
                  </el-col>
         
                </el-row>
                <el-row class="margin-bottom-xs">
                  <el-col :span="8">
                    变更前BOM编码：
                    <span class="gray">{{ detailData.beforeOrderBom || '-' }}</span>
                  </el-col>
                  <el-col :span="8">
                    变更后BOM编码：
                    <span class="gray">{{ detailData.afterOrderBom || '-' }}</span>
                  </el-col>
                  <el-col :span="8">
                    变更内容：
                    <span class="gray">{{ detailData.systemChangResult || '-' }}</span>
                  </el-col>
                </el-row>
                <!-- 变更结果 -->
                <el-row class="margin-bottom-xs" v-if="detailData.systemResult">
                  <el-col :span="24">
                    <div v-if="detailData.systemState === 2" class="reject-reason-section">
                      <i class="el-icon-warning-outline"></i>
                      <span class="reject-label">变更结果：</span>
                      <span class="reject-reason-text">{{ detailData.systemResult }}</span>
                    </div>
                    <div v-else>
                      变更结果：
                      <span class="gray">{{ detailData.systemResult }}</span>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <!-- 订单变更详情 -->
              <div class="audit-detail">
                <h4>订单变更</h4>
                <el-row class="margin-bottom-xs">
                  <el-col :span="8">
                    变更人员：
                    <span class="gray">{{ detailData.orderChangePerson || '-' }}</span>
                  </el-col>
                  <el-col :span="8">
                    变更状态：
                    <span :class="getChangeStateClass(detailData.orderChangeState)">{{
                      getChangeStateText(detailData.orderChangeState) }}</span>
                  </el-col>
                </el-row>
                <el-row class="margin-bottom-xs" v-if="detailData.orderChangeResult">
                  <el-col :span="24">
                    <div v-if="detailData.orderChangeState === 2" class="reject-reason-section">
                      <i class="el-icon-warning-outline"></i>
                      <span class="reject-label">变更结果：</span>
                      <span class="reject-reason-text">{{ detailData.orderChangeResult }}</span>
                    </div>
                    <div v-else>
                      变更结果：
                      <span class="gray">{{ detailData.orderChangeResult }}</span>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <!-- 工单变更详情 -->
              <div class="audit-detail">
                <h4>工单变更</h4>
                <el-row class="margin-bottom-xs">
                  <el-col :span="8">
                    变更人员：
                    <span class="gray">{{ detailData.workOrderChangePerson || '-' }}</span>
                  </el-col>
                  <el-col :span="8">
                    变更状态：
                    <span :class="getChangeStateClass(detailData.workOrderChangeState)">{{
                      getChangeStateText(detailData.workOrderChangeState) }}</span>
                  </el-col>
                </el-row>
                <el-row class="margin-bottom-xs" v-if="detailData.workOrderChangeResult">
                  <el-col :span="24">
                    <div v-if="detailData.workOrderChangeState === 2" class="reject-reason-section">
                      <i class="el-icon-warning-outline"></i>
                      <span class="reject-label">变更结果：</span>
                      <span class="reject-reason-text">{{ detailData.workOrderChangeResult }}</span>
                    </div>
                    <div v-else>
                      变更结果：
                      <span class="gray">{{ detailData.workOrderChangeResult }}</span>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </div>

        <!-- 附件 -->
        <div class="detail-section" v-if="detailData.file">
          <div class="post-form model-wrap">
            <div class="model-wrap-style">
              <div class="title" style="padding-left: 3px">
                <div><i class="el-icon-paperclip mr10 margin-left-xs"></i>附件</div>
              </div>
            </div>
            <div class="model-content">
              <div class="attachment-list">
                <div class="attachment-item" v-for="(item, index) in detailData.file.split(',')">
                  <i class="el-icon-paperclip"></i>
                  <span class="attachment-name">{{ item }}</span>
                  <el-button type="text" size="small" @click="zipFile(item)">
                    <i class="el-icon-download"></i>
                    下载
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 创建/修改信息 -->
        <div class="detail-section">
          <div class="post-form model-wrap">
            <div class="model-wrap-style">
              <div class="title" style="padding-left: 3px">
                <div><i class="el-icon-time mr10 margin-left-xs"></i>创建/修改信息</div>
              </div>
            </div>
            <div class="model-content">
              <el-row class="margin-bottom-xs">
                <el-col :span="12">
                  创建人：
                  <span class="gray">{{ detailData.createBy || '-' }}</span>
                </el-col>
                <el-col :span="12">
                  创建时间：
                  <span class="gray">{{ detailData.createTime || '-' }}</span>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  修改人：
                  <span class="gray">{{ detailData.updateBy || '-' }}</span>
                </el-col>
                <el-col :span="12">
                  修改时间：
                  <span class="gray">{{ detailData.updaeTime || '-' }}</span>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getBomOrderChangeDetail } from '@/api/third/bomChange'


export default {
  name: 'DetailView',
  data() {
    return {
      dialogVisible: false,
      detailData: {},
      loading: false,
      // 领域映射
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
      }
    }
  },
  computed: {
    // 解析变更分类
    parsedChangeCause() {
      if (!this.detailData.changeCause) return null;
      try {
        const data = JSON.parse(this.detailData.changeCause);
        return Array.isArray(data) ? data.filter(item => item.check) : null;
      } catch (e) {
        return null;
      }
    },

    // 按领域分组
    groupedFields() {
      if (!this.detailData.list) return [];

      const groups = {};
      this.detailData.list.forEach(item => {
        if (!groups[item.field]) {
          groups[item.field] = {
            field: item.field,
            items: []
          };
        }
        groups[item.field].items.push(item);
      });

      return Object.values(groups);
    }
  },
  methods: {
    // 打开详情弹窗
    async openDialog(data) {
      console.log("🚀 ~ openDialog ~ data:", data)
      this.dialogVisible = true;
      this.loading = true;
      this.detailData = {}; // 清空上次数据

      // 如果传入的是ID，则调用接口获取详情
      try {
        const response = await getBomOrderChangeDetail(data);
        this.detailData = response.data || {};
      } catch (error) {
        console.error('获取详情失败:', error);
        this.$message.error('获取详情失败');
        this.detailData = {};
      } finally {
        this.loading = false;
      }
    },

    // 获取分类标签类型
    getCategoryTagType(id) {
      const typeMap = {
        1: 'warning',  // 订单暂停
        2: 'danger',   // 订单取消
        3: 'primary'   // 订单变更
      };
      return typeMap[id] || 'info';
    },

    // 获取分类图标
    getCategoryIcon(id) {
      const iconMap = {
        1: 'el-icon-video-pause',  // 订单暂停
        2: 'el-icon-close',        // 订单取消
        3: 'el-icon-edit'          // 订单变更
      };
      return iconMap[id] || 'el-icon-document';
    },

    // 获取领域名称
    getFieldName(field) {
      return this.fieldMap[field] || '未知领域';
    },

    // 获取领域标签类型
    getFieldTagType(field) {
      const typeMap = {
        2: 'primary',   // 采购
        3: 'success',   // 品质
        4: 'warning',   // 生产
        5: 'info',      // 工程
        6: 'danger',    // 研发
        7: 'primary',   // 仓库
        8: 'success'    // 市场
      };
      return typeMap[field] || 'info';
    },

    // 获取领域图标
    getFieldIcon(field) {
      const iconMap = {
        2: 'el-icon-shopping-cart-2', // 采购
        3: 'el-icon-medal',           // 品质
        4: 'el-icon-s-cooperation',   // 生产
        5: 'el-icon-setting',         // 工程
        6: 'el-icon-cpu',             // 研发
        7: 'el-icon-box',             // 仓库
        8: 'el-icon-s-marketing'      // 市场
      };
      return iconMap[field] || 'el-icon-user';
    },

    // 获取状态文本
    getStateText(state) {
      const stateMap = {
        0: '待审核',
        1: '通过',
        2: '驳回'
      };
      return stateMap[state] || '未知状态';
    },

    // 获取变更状态文本
    getChangeStateText(state) {
      const stateMap = {
        0: '待变更',
        1: '已变更'
      };
      return stateMap[state] || '未知状态';
    },

    // 获取状态标签类型
    getStateTagType(state) {
      const typeMap = {
        0: 'info',     // 待审核
        1: 'success',  // 通过
        2: 'danger'    // 驳回
      };
      return typeMap[state] || 'info';
    },

    // 获取进度步骤样式类
    getProgressStepClass(type) {
      switch (type) {
        case 'review':
          return this.isAllReviewsPassed() ? 'step-completed' : 'step-pending';
        case 'first':
          return this.detailData.firstState === 1 ? 'step-completed' :
            this.detailData.firstState === 2 ? 'step-rejected' : 'step-pending';
        case 'second':
          return this.detailData.secondState === 1 ? 'step-completed' :
            this.detailData.secondState === 2 ? 'step-rejected' : 'step-pending';
        case 'system':
          return this.detailData.systemState === 1 ? 'step-completed' : 'step-pending';
        case 'order':
          return this.detailData.orderChangeState === 1 ? 'step-completed' : 'step-pending';
        case 'work':
          return this.detailData.workOrderChangeState === 1 ? 'step-completed' : 'step-pending';
        default:
          return 'step-pending';
      }
    },

    // 检查所有会审是否通过
    isAllReviewsPassed() {
      if (!this.detailData.list || this.detailData.list.length === 0) {
        return false;
      }
      return this.detailData.list.every(item => item.state === 1);
    },

    // 获取会审状态文本
    getReviewStatusText() {
      if (!this.detailData.list || this.detailData.list.length === 0) {
        return '无会审项';
      }

      const total = this.detailData.list.length;
      const passed = this.detailData.list.filter(item => item.state === 1).length;
      const rejected = this.detailData.list.filter(item => item.state === 2).length;

      if (rejected > 0) {
        return '会审驳回';
      } else if (passed === total) {
        return '会审通过';
      } else {
        return `会审中(${passed}/${total})`;
      }
    },

    // 获取会审人员
    getReviewPersons() {
      if (!this.detailData.list || this.detailData.list.length === 0) {
        return '';
      }

      const persons = this.detailData.list.map(item => item.fieldName).filter(Boolean);
      return persons.length > 0 ? persons.join('、') : '';
    },

    // 获取会审状态样式类
    getReviewStatusClass() {
      if (!this.detailData.list || this.detailData.list.length === 0) {
        return 'status-pending';
      }

      const rejected = this.detailData.list.filter(item => item.state === 2).length;
      const total = this.detailData.list.length;
      const passed = this.detailData.list.filter(item => item.state === 1).length;

      if (rejected > 0) {
        return 'status-rejected';
      } else if (passed === total) {
        return 'status-passed';
      } else {
        return 'status-pending';
      }
    },

    // 解析附件
    parseFiles(fileStr) {
      if (!fileStr) return [];

      try {
        // 如果是JSON格式
        const files = JSON.parse(fileStr);
        return Array.isArray(files) ? files : [files];
      } catch (e) {
        // 如果是简单字符串，按逗号分割
        return fileStr.split(',').map(name => ({ name: name.trim() }));
      }
    },

    // 获取变更类型文本
    getChangeTypeText(changeCause) {
      if (!changeCause) return '-';
      try {
        const data = JSON.parse(changeCause);
        if (Array.isArray(data)) {
          const checkedItems = data.filter(item => item.check);
          return checkedItems.map(item => item.label).join('、') || '-';
        }
      } catch (e) {
        return changeCause;
      }
      return '-';
    },

    // 获取变更子类型文本
    getChangeSubTypeText(changeCause) {
      if (!changeCause) return '-';
      try {
        const data = JSON.parse(changeCause);
        if (Array.isArray(data)) {
          const subTypes = [];
          data.forEach(item => {
            if (item.check && item.list) {
              const checkedSubs = item.list.filter(sub => sub.check);
              subTypes.push(...checkedSubs.map(sub => sub.label));
            }
          });
          return subTypes.join('、') || '-';
        }
      } catch (e) {
        return '-';
      }
      return '-';
    },

    // 获取审核状态样式类
    getStateClass(state) {
      switch (state) {
        case 1:
          return 'status-passed'; // 通过
        case 2:
          return 'status-rejected'; // 拒绝
        case 0:
        default:
          return 'status-pending'; // 待审核
      }
    },

    // 获取变更状态样式类
    getChangeStateClass(state) {
      switch (state) {
        case 1:
          return 'status-completed'; // 已完成
        case 2:
          return 'status-rejected'; // 拒绝/失败
        case 0:
        default:
          return 'status-pending'; // 未完成/待处理
      }
    }
  }
}
</script>

<style scoped>
.detail-container {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section .model-wrap {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.model-wrap-style {
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.model-wrap-style .title {
  padding: 12px 16px;
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.model-wrap-style .title i {
  margin-right: 8px;
  color: #409eff;
}

.model-content {
  padding: 20px;
}

.margin-bottom-xs {
  margin-bottom: 16px;
}

.gray {
  color: #606266;
}

.section-content {
  padding: 16px;
}

.info-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.info-item label {
  font-weight: 600;
  color: #606266;
  min-width: 120px;
  margin-right: 8px;
}

.info-item span {
  color: #303133;
  flex: 1;
}

.change-category {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-left: 8px;
}

.field-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.field-header {
  background: #fafafa;
  padding: 8px 12px;
  border-bottom: 1px solid #e4e7ed;
}

.field-items {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-item .el-card {
  border-radius: 6px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.person-name {
  font-weight: 600;
  color: #303133;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-row {
  display: flex;
  align-items: flex-start;
}

.item-row label {
  font-weight: 600;
  color: #606266;
  min-width: 80px;
  margin-right: 8px;
}

.item-row span {
  color: #303133;
  flex: 1;
}

.reject-reason {
  color: #f56c6c !important;
}

.reject-reason-highlight {
  color: #f56c6c !important;
  font-weight: 600;
  background: #fef0f0;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #fbc4c4;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.reject-reason-highlight i {
  font-size: 14px;
}

.reject-reason-section {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.reject-reason-section i {
  color: #f56c6c;
  font-size: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}

.reject-label {
  color: #f56c6c;
  font-weight: 600;
  flex-shrink: 0;
}

.reject-reason-text {
  color: #f56c6c;
  font-weight: 500;
  line-height: 1.5;
  word-break: break-word;
}

/* 状态样式 */
.status-passed {
  color: #67c23a !important;
  font-weight: 600;
  background: #f0f9ff;
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid #b3e19d;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-passed::before {
  content: '✓';
  font-weight: bold;
  font-size: 12px;
}

.status-completed {
  color: #409eff !important;
  font-weight: 600;
  background: #ecf5ff;
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid #b3d8ff;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-completed::before {
  content: '✓';
  font-weight: bold;
  font-size: 12px;
}

.status-rejected {
  color: #f56c6c !important;
  font-weight: 600;
  background: #fef0f0;
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid #fbc4c4;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-rejected::before {
  content: '✗';
  font-weight: bold;
  font-size: 12px;
}

.status-pending {
  color: #e6a23c !important;
  font-weight: 600;
  background: #fdf6ec;
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid #f5dab1;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-pending::before {
  content: '⏳';
  font-size: 12px;
}

.progress-container {
  padding: 16px 0;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #e4e7ed;
  z-index: 1;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  z-index: 2;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e4e7ed;
  color: #909399;
  margin-bottom: 8px;
  font-size: 16px;
}

.step-icon.step-completed {
  background: #67c23a;
  color: white;
}

.step-icon.step-rejected {
  background: #f56c6c;
  color: white;
}

.step-icon.step-pending {
  background: #409eff;
  color: white;
}

.step-content {
  text-align: center;
  min-width: 80px;
}

.step-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  font-size: 12px;
}

.step-status {
  color: #606266;
  font-size: 12px;
  margin-bottom: 2px;
}

.step-person {
  color: #909399;
  font-size: 11px;
}

.audit-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.audit-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
}

.audit-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.audit-person {
  color: #606266;
  font-size: 13px;
}

.audit-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.audit-remark,
.audit-result {
  display: flex;
  align-items: flex-start;
}

.audit-remark label,
.audit-result label {
  font-weight: 600;
  color: #606266;
  min-width: 80px;
  margin-right: 8px;
}

.audit-remark span,
.audit-result span {
  color: #303133;
  flex: 1;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.attachment-item i {
  color: #409eff;
}

.file-name,
.attachment-name {
  flex: 1;
  color: #303133;
}

.no-data {
  color: #909399;
  font-style: italic;
}

.audit-detail {
  margin-bottom: 20px;
  border:1px solid #e4e7ed;
  border-radius: 8px;;
  padding:20px;
  
}

.audit-detail h4 {
  margin: 0 0 12px 0;
  padding: 10px 0 10px 16px;
  border-bottom: 1px solid #e4e7ed;
  border-left: 4px solid #409EFF;
  background: #f5f7fa;
  color: #2d8cf0;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  line-height: 1.4;
}

.field-title {
  margin: 0 0 12px 0;
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.field-item {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.field-item:last-child {
  border-bottom: none;
}

.dialog-footer {
  text-align: center;
  padding: 16px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .progress-steps {
    flex-direction: column;
    gap: 16px;
  }

  .progress-steps::before {
    display: none;
  }

  .progress-step {
    flex-direction: row;
    justify-content: flex-start;
    text-align: left;
  }

  .step-icon {
    margin-right: 12px;
    margin-bottom: 0;
  }

  .step-content {
    text-align: left;
  }
}
</style>