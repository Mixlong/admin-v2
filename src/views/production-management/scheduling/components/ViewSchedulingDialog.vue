<template>
  <el-dialog :visible="visible" @update:visible="handleVisibleChange" title="查看排产详情" width="1200px"
    :close-on-click-modal="false" class="view-scheduling-dialog" center top=" 0px">
    <div class="dialog-content" style="max-height: calc(80vh - 120px); overflow-y: auto; padding: 20px 20px 0;">

      <!-- 基础信息 -->
      <div class="module-container">
        <el-divider content-position="left" class="module-divider">
          <span style="font-weight: 600; color: #409EFF;">
            <i class="el-icon-info" style="margin-right: 5px;"></i>
            基础信息
          </span>
        </el-divider>
        <div class="module-content">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="订单号">
              {{ data.orderNumber || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="工单号">
              {{ data.workOrderNumber || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="工单数量">
              {{ data.totalQuantity || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="上线日期">
              {{ data.onlineDate || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="完成时间">
              {{ data.completionDate || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="排产状态">
              <el-tag :type="getStatusType(data.status)">
                {{ getStatusText(data.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建人">
              {{ data.createBy || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ data.createTime || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ data.updateTime || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <!-- 每日计划 -->
      <div class="module-container" style="margin-top: 30px;" v-if="data.dailyPlan && data.dailyPlan.length">
        <el-divider content-position="left" class="module-divider">
          <span style="font-weight: 600; color: #409EFF;">
            <i class="el-icon-date" style="margin-right: 5px;"></i>
            每日计划
          </span>
        </el-divider>
        <div class="module-content">
          <div class="daily-plan-summary" style="margin-bottom: 20px;">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="summary-item">
                  <span class="label">总数量:</span>
                  <span class="value">{{ data.totalQuantity || 0 }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-item">
                  <span class="label">计划数量:</span>
                  <span class="value">{{ plannedQuantity }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-item">
                  <span class="label">计划天数:</span>
                  <span class="value">{{ data.dailyPlan.length }}天</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <el-table :data="data.dailyPlan" border style="width: 100%" max-height="300" :summary-method="getSummaries"
            show-summary>
            <el-table-column label="序号" type="index" width="80" align="center" />
            <el-table-column label="日期" prop="date" width="150" align="center" />
            <el-table-column label="计划数量" prop="quantity" width="120" align="center">
              <template slot-scope="scope">
                <span style="font-weight: 600; color: #409EFF;">{{ scope.row.quantity || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="完成数量" prop="completedQuantity" width="120" align="center">
              <template slot-scope="scope">
                <span style="font-weight: 600; color: #67C23A;">{{ scope.row.completedQuantity || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="完成率" width="120" align="center">
              <template slot-scope="scope">
                <el-progress :percentage="getCompletionRate(scope.row)" :status="getProgressStatus(scope.row)"
                  :stroke-width="8" />
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" align="center">
              <template slot-scope="scope">
                {{ scope.row.remark || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="module-container" style="margin-top: 30px;" v-if="data.orderDetails && data.orderDetails.length">
        <el-divider content-position="left" class="module-divider">
          <span style="font-weight: 600; color: #409EFF;">
            <i class="el-icon-s-order" style="margin-right: 5px;"></i>
            订单信息
          </span>
        </el-divider>
        <div class="module-content">
          <el-table :data="data.orderDetails" border style="width: 100%" max-height="250">
            <el-table-column label="序号" type="index" width="60" align="center" />
            <el-table-column label="客户" prop="customer" width="120" align="center">
              <template slot-scope="scope">
                {{ scope.row.customer || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="UB编号或型号" prop="orderNumber" width="150" align="center">
              <template slot-scope="scope">
                {{ scope.row.orderNumber || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="产品编号" prop="productModel" width="120" align="center">
              <template slot-scope="scope">
                {{ scope.row.productModel || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="EMS提供量" prop="emsOrder" width="120" align="center">
              <template slot-scope="scope">
                {{ scope.row.emsOrder || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="quantity" width="100" align="center">
              <template slot-scope="scope">
                {{ scope.row.quantity || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="客户订单日期" prop="deliveryDate" width="130" align="center">
              <template slot-scope="scope">
                {{ scope.row.deliveryDate || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="三级编号" prop="thirdLevelNumber" width="120" align="center">
              <template slot-scope="scope">
                {{ scope.row.thirdLevelNumber || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="检验日期" prop="inspectionDate" width="130" align="center">
              <template slot-scope="scope">
                {{ scope.row.inspectionDate || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="订单数" prop="orderCount" width="100" align="center">
              <template slot-scope="scope">
                {{ scope.row.orderCount || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 操作记录 -->
      <div class="module-container" style="margin-top: 30px;" v-if="data.operationLogs && data.operationLogs.length">
        <el-divider content-position="left" class="module-divider">
          <span style="font-weight: 600; color: #409EFF;">
            <i class="el-icon-document" style="margin-right: 5px;"></i>
            操作记录
          </span>
        </el-divider>
        <div class="module-content">
          <el-timeline>
            <el-timeline-item v-for="(log, index) in data.operationLogs" :key="index" :timestamp="log.createTime"
              placement="top">
              <el-card>
                <h4>{{ log.operation }}</h4>
                <p>{{ log.description }}</p>
                <p style="color: #999; font-size: 12px;">操作人: {{ log.operator }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <div class="footer-content">
        <div class="footer-buttons">
          <el-button @click="handleClose" size="medium">
            关 闭
          </el-button>
          <el-button type="primary" @click="handleEdit" size="medium">
            编 辑
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ViewSchedulingDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    plannedQuantity() {
      if (!this.data.dailyPlan || !this.data.dailyPlan.length) return 0
      return this.data.dailyPlan.reduce((sum, item) => sum + (item.quantity || 0), 0)
    }
  },
  methods: {
    handleVisibleChange(val) {
      this.$emit('update:visible', val)
    },

    handleClose() {
      this.$emit('update:visible', false)
    },

    handleEdit() {
      this.$emit('edit', this.data)
      this.$emit('update:visible', false)
    },

    getStatusType(status) {
      const statusMap = {
        0: 'info',     // 未开始
        1: 'warning',  // 进行中
        2: 'success',  // 已完成
        3: 'danger',   // 已暂停
        4: 'danger'    // 已取消
      }
      return statusMap[status] || 'info'
    },

    getStatusText(status) {
      const statusMap = {
        0: '未开始',
        1: '进行中',
        2: '已完成',
        3: '已暂停',
        4: '已取消'
      }
      return statusMap[status] || '未知'
    },

    getCompletionRate(row) {
      const planned = row.quantity || 0
      const completed = row.completedQuantity || 0
      if (planned === 0) return 0
      return Math.round((completed / planned) * 100)
    },

    getProgressStatus(row) {
      const rate = this.getCompletionRate(row)
      if (rate === 0) return null
      if (rate < 50) return 'exception'
      if (rate < 100) return null
      return 'success'
    },

    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        if (column.property === 'quantity' || column.property === 'completedQuantity') {
          const values = data.map(item => Number(item[column.property]))
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            }, 0)
          } else {
            sums[index] = '0'
          }
        } else {
          sums[index] = ''
        }
      })
      return sums
    }
  }
}
</script>

<style lang="scss" scoped>
.view-scheduling-dialog {
  .module-container {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    margin-bottom: 20px;
    position: relative;
    background: #ffffff;
  }

  .module-divider {
    margin: 0;
    position: relative;
    top: -2px;
    background: #ffffff;
    z-index: 1;

    .el-divider__text {
      background-color: #ffffff;
      padding: 0 20px;
    }
  }

  .module-content {
    padding: 40px 20px 20px 20px;
    margin-top: -12px;
  }

  .daily-plan-summary {
    .summary-item {
      display: flex;
      align-items: center;
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;

      .label {
        color: #606266;
        font-size: 14px;
        margin-right: 8px;
      }

      .value {
        font-weight: 600;
        font-size: 16px;
        color: #409EFF;
      }
    }
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .footer-buttons {
      display: flex;
      gap: 10px;
    }
  }
}
</style>