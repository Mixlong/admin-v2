<template>
  <el-dialog :visible="visible" @update:visible="handleVisibleChange" :title="dialogTitle" width="1400px"
    :close-on-click-modal="false" :close-on-press-escape="false" class="add-scheduling-dialog"
    :before-close="handleBeforeClose" center top="0px">
    <div class="dialog-content" style="max-height: calc(80vh - 120px); overflow-y: auto; padding: 20px 20px 0;">

      <!-- 基础信息 -->
      <fieldset class="info-fieldset">
        <legend>
          <i class="el-icon-info"></i>
          基础信息
        </legend>
        <div class="fieldset-content">
          <el-form :model="form" :rules="rules" ref="form" label-width="100px" size="small">
            <!-- 第一行：基本信息 -->
            <div class="form-row">
              <div class="form-group">
                <el-form-item label="订单号" prop="orderNumber">
                  <el-input v-model="form.orderNumber" placeholder="请输入订单号" :disabled="isEdit" class="form-input" />
                </el-form-item>
              </div>
              <div class="form-group">
                <el-form-item label="工单号" prop="workOrderNumber">
                  <el-input v-model="form.workOrderNumber" placeholder="请输入工单号" class="form-input" />
                </el-form-item>
              </div>
              <div class="form-group">
                <el-form-item label="工单数量" prop="totalQuantity">
                  <el-input-number v-model="form.totalQuantity" :min="1" :max="999999" :step="1" :precision="0"
                    controls-position="right" placeholder="请输入工单数量" class="form-input-number" />
                </el-form-item>
              </div>
            </div>

            <!-- 第二行：时间范围和状态 -->
            <div class="form-row">
              <div class="form-group date-range-group">
                <el-form-item label="排产时间" prop="dateRange" class="date-range-item">
                  <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                    end-placeholder="结束日期" value-format="yyyy-MM-dd" @change="handleDateRangeChange"
                    class="form-input date-range-picker" />
                </el-form-item>
              </div>
              <div class="form-group">
                <el-form-item label="排产状态" prop="status">
                  <el-select v-model="form.status" placeholder="请选择状态" class="form-input">
                    <el-option label="未开始" :value="0" />
                    <el-option label="进行中" :value="1" />
                    <el-option label="已完成" :value="2" />
                    <el-option label="已暂停" :value="3" />
                    <el-option label="已取消" :value="4" />
                  </el-select>
                </el-form-item>
              </div>
            </div>
          </el-form>
        </div>
      </fieldset>

      <!-- 每日排产计划 -->
      <fieldset class="plan-fieldset">
        <legend>
          <i class="el-icon-date"></i>
          每日排产计划
        </legend>
        <div class="fieldset-content">
          <!-- 产能配置区域 -->
          <div class="capacity-config">
            <div class="capacity-input-group">
              <label class="capacity-label">每日产能：</label>
              <el-input-number v-model="dailyCapacity" :min="1" :max="form.totalQuantity" :step="1" :precision="0"
                controls-position="right" size="small" placeholder="输入产能" @change="handleCapacityChange"
                class="capacity-input" />
              <span class="capacity-unit">件/天</span>
              <el-button type="primary" size="small" @click="autoAllocateByCapacity"
                :disabled="!dailyCapacity || form.dailyPlan.length === 0" class="auto-allocate-btn">
                自动分配
              </el-button>
            </div>

            <!-- 统计信息 -->
            <div class="statistics-panel">
              <div class="stat-item">
                <span class="stat-label">总数量</span>
                <span class="stat-value primary">{{ form.totalQuantity || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">已分配</span>
                <span class="stat-value">{{ allocatedQuantity }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">剩余</span>
                <span class="stat-value" :class="getRemainStatus()">
                  {{ remaining }}
                  <el-tooltip content="总分配数量不能超过工单数量" placement="top" v-if="remaining < 0">
                    <i class="el-icon-warning stat-warning"></i>
                  </el-tooltip>
                </span>
              </div>
            </div>
          </div>

          <!-- 日历视图切换 -->
          <div class="view-tabs">
            <el-radio-group v-model="viewMode" size="small" @change="handleViewModeChange">
              <el-radio-button label="table">表格视图</el-radio-button>
              <el-radio-button label="calendar">日历视图</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 表格视图 -->
          <div v-show="viewMode === 'table'" class="table-view">
            <el-table :data="form.dailyPlan" border style="width: 100%" max-height="300" :summary-method="getSummaries"
              show-summary>
              <el-table-column label="序号" type="index" width="60" align="center" />
              <el-table-column label="日期" prop="date" width="200" align="center">
                <template slot-scope="scope">
                  <el-date-picker v-model="scope.row.date" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"
                    size="small" style="width: 100%" @change="handleTableDateChange(scope.$index)" />
                </template>
              </el-table-column>
              <el-table-column label="星期" width="80" align="center">
                <template slot-scope="scope">
                  <span :class="getWeekdayClass(scope.row.date)">
                    {{ getWeekdayText(scope.row.date) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="计划数量" prop="quantity" width="150" align="center">
                <template slot-scope="scope">
                  <el-input-number v-model="scope.row.quantity" :min="0" :max="getMaxQuantityForRow(scope.$index)"
                    :step="1" :precision="0" size="small" style="width: 100%"
                    @change="handleQuantityChange(scope.$index)" />
                </template>
              </el-table-column>
              <el-table-column label="备注" prop="remark" align="center">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.remark" placeholder="请输入备注" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template slot-scope="scope">
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeDailyPlan(scope.$index)"
                    v-if="form.dailyPlan.length > 1">
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="table-actions">
              <el-button size="small" type="primary" plain icon="el-icon-plus" @click="addDailyPlan">
                添加日期
              </el-button>
            </div>
          </div>

          <!-- 日历视图 -->
          <div v-show="viewMode === 'calendar'" class="calendar-view">
            <div class="calendar-tips">
              <el-alert title="排班提示" type="info" description="默认不安排周日排班，如有特殊需要可点击周日日期手动添加。点击任意日期可编辑排产计划。" show-icon
                :closable="false">
              </el-alert>
            </div>
            <el-calendar v-model="calendarDate" class="schedule-calendar">
              <template slot="dateCell" slot-scope="{date, data}">
                <div class="calendar-cell" :class="getCalendarCellClass(data.day)"
                  @click="handleCalendarCellClick(date, data)">
                  <div class="date-header">
                    <span class="date-num">{{ data.day.split('-')[2] }}</span>
                    <span class="weekday" :class="getWeekdayClass(data.day)">
                      {{ getWeekdayText(data.day) }}
                    </span>
                  </div>
                  <div class="schedule-info" v-if="getScheduleByDate(data.day)">
                    <div class="quantity">{{ getScheduleByDate(data.day).quantity || 0 }}件</div>
                    <div class="remark" v-if="getScheduleByDate(data.day).remark">
                      {{ getScheduleByDate(data.day).remark }}
                    </div>
                  </div>
                  <div class="no-schedule" v-else-if="isInScheduleRange(data.day) && !isSunday(data.day)">
                    <span class="add-hint">点击添加</span>
                  </div>
                </div>
              </template>
            </el-calendar>
          </div>
        </div>
      </fieldset>

      <!-- 订单信息 -->
      <fieldset class="order-fieldset">
        <legend>
          <i class="el-icon-s-order"></i>
          订单信息
        </legend>
        <div class="fieldset-content">
          <el-table :data="form.orderDetails" border style="width: 100%" max-height="250">
            <el-table-column label="序号" type="index" width="60" align="center" />
            <el-table-column label="客户" prop="customer" width="120" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.customer" placeholder="客户名称" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="UB编号或型号" prop="orderNumber" width="150" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.orderNumber" placeholder="UB编号或型号" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="产品编号" prop="productModel" width="120" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.productModel" placeholder="产品编号" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="EMS提供量" prop="emsOrder" width="120" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.emsOrder" placeholder="EMS提供量" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="quantity" width="100" align="center">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.quantity" :min="0" :step="1" :precision="0" size="small"
                  style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="客户订单日期" prop="deliveryDate" width="150" align="center">
              <template slot-scope="scope">
                <el-date-picker v-model="scope.row.deliveryDate" type="date" placeholder="选择日期"
                  value-format="yyyy-MM-dd" size="small" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="三级编号" prop="thirdLevelNumber" width="120" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.thirdLevelNumber" placeholder="三级编号" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="检验日期" prop="inspectionDate" width="150" align="center">
              <template slot-scope="scope">
                <el-date-picker v-model="scope.row.inspectionDate" type="date" placeholder="选择日期"
                  value-format="yyyy-MM-dd" size="small" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="订单数" prop="orderCount" width="100" align="center">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.orderCount" :min="0" :step="1" :precision="0" size="small"
                  style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeOrderDetail(scope.$index)"
                  v-if="form.orderDetails.length > 1">
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="table-actions">
            <el-button size="small" type="primary" plain icon="el-icon-plus" @click="addOrderDetail">
              添加订单信息
            </el-button>
          </div>
        </div>
      </fieldset>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <div class="footer-content">
        <div class="footer-buttons">
          <el-button @click="handleCancel" size="medium">
            取 消
          </el-button>
          <el-button type="primary" @click="handleSave" :loading="saving" size="medium">
            {{ saving ? '保存中...' : '确 定' }}
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'AddSchedulingDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        id: null,
        orderNumber: '',
        workOrderNumber: '',
        totalQuantity: null,
        status: 0,
        dailyPlan: [],
        orderDetails: [
          {
            customer: '',
            orderNumber: '',
            productModel: '',
            emsOrder: '',
            quantity: null,
            deliveryDate: '',
            thirdLevelNumber: '',
            inspectionDate: '',
            orderCount: null
          }
        ]
      },
      // 时间范围
      dateRange: [],
      // 每日产能
      dailyCapacity: null,
      // 视图模式
      viewMode: 'table',
      // 日历日期
      calendarDate: new Date(),
      rules: {
        orderNumber: [
          { required: true, message: '请输入订单号', trigger: 'blur' }
        ],
        workOrderNumber: [
          { required: true, message: '请输入工单号', trigger: 'blur' }
        ],
        totalQuantity: [
          { required: true, message: '请输入工单数量', trigger: 'blur' }
        ],
        dateRange: [
          { required: true, message: '请选择排产时间范围', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择排产状态', trigger: 'change' }
        ]
      },
      saving: false
    }
  },
  computed: {
    dialogTitle() {
      return this.editData ? '编辑排产' : '新增排产'
    },
    isEdit() {
      return !!this.editData
    },
    allocatedQuantity() {
      return this.form.dailyPlan.reduce((sum, item) => sum + (item.quantity || 0), 0)
    },
    remaining() {
      return (this.form.totalQuantity || 0) - this.allocatedQuantity
    }
  },
  watch: {
    visible: {
      handler(newVal) {
        if (newVal) {
          this.initializeForm()
        }
      },
      immediate: true
    },
    editData: {
      handler(newVal) {
        if (this.visible && newVal) {
          this.loadEditData(newVal)
        }
      },
      deep: true,
      immediate: true
    },
    // 监听时间范围变化，自动生成排产计划
    dateRange: {
      handler(newVal) {
        if (newVal && newVal.length === 2) {
          this.form.onlineDate = newVal[0]
          this.form.completionDate = newVal[1]
          this.autoGeneratePlan()
        }
      },
      deep: true
    }
  },
  methods: {
    handleVisibleChange(val) {
      this.$emit('update:visible', val)
    },

    handleBeforeClose(done) {
      this.$confirm('确定要关闭吗？未保存的数据将丢失', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        done()
      }).catch(() => { })
    },

    initializeForm() {
      if (this.editData) {
        this.loadEditData(this.editData)
      } else {
        this.resetForm()
      }
    },

    resetForm() {
      this.form = {
        id: null,
        orderNumber: '',
        workOrderNumber: '',
        totalQuantity: null,
        status: 0,
        dailyPlan: [],
        orderDetails: [
          {
            customer: '',
            orderNumber: '',
            productModel: '',
            emsOrder: '',
            quantity: null,
            deliveryDate: '',
            thirdLevelNumber: '',
            inspectionDate: '',
            orderCount: null
          }
        ]
      }
      this.dateRange = []
      this.dailyCapacity = null
      this.viewMode = 'table'
      this.calendarDate = new Date()
    },

    loadEditData(data) {
      this.form = JSON.parse(JSON.stringify(data))

      // 设置时间范围
      if (this.form.onlineDate && this.form.completionDate) {
        this.dateRange = [this.form.onlineDate, this.form.completionDate]
      }

      // 确保数组结构
      if (!this.form.dailyPlan || this.form.dailyPlan.length === 0) {
        this.form.dailyPlan = []
      }
      if (!this.form.orderDetails || this.form.orderDetails.length === 0) {
        this.form.orderDetails = [{
          customer: '',
          orderNumber: '',
          productModel: '',
          emsOrder: '',
          quantity: null,
          deliveryDate: '',
          thirdLevelNumber: '',
          inspectionDate: '',
          orderCount: null
        }]
      }
      // 从现有数据中推算每日产能
      this.calculateDailyCapacity()
    },

    // 处理时间范围变化
    handleDateRangeChange(dates) {
      if (dates && dates.length === 2) {
        this.form.onlineDate = dates[0]
        this.form.completionDate = dates[1]
        this.autoGeneratePlan()
      }
    },

    // 自动生成排产计划（排除周日）
    autoGeneratePlan() {
      if (!this.form.onlineDate || !this.form.completionDate) {
        return
      }

      const startDate = new Date(this.form.onlineDate)
      const endDate = new Date(this.form.completionDate)
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1

      if (totalDays <= 0) {
        this.$message.error('完成时间不能早于上线日期')
        return
      }

      // 生成日期列表，排除周日（除非原本就有周日的排产计划）
      const existingSundayPlans = this.form.dailyPlan.filter(plan => this.isSunday(plan.date))
      this.form.dailyPlan = []

      for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)
        const dateStr = currentDate.toISOString().split('T')[0]

        // 检查是否是周日
        if (currentDate.getDay() === 0) {
          // 如果原本就有这个周日的计划，保留它
          const existingPlan = existingSundayPlans.find(plan => plan.date === dateStr)
          if (existingPlan) {
            this.form.dailyPlan.push(existingPlan)
          }
          // 否则跳过周日
          continue
        }

        this.form.dailyPlan.push({
          date: dateStr,
          quantity: null,
          remark: ''
        })
      }
    },

    // 处理产能变化（手动触发时不自动分配）
    handleCapacityChange() {
      // 手动修改产能时不自动分配，只提示用户点击自动分配按钮
    },

    // 自动分配按产能
    autoAllocateByCapacity() {
      if (!this.dailyCapacity || this.form.dailyPlan.length === 0) return

      // 根据每日产能自动分配数量
      this.form.dailyPlan.forEach(plan => {
        plan.quantity = this.dailyCapacity
      })

      // 如果总数超过工单数量，需要调整
      this.adjustPlanQuantities()
      this.$message.success('已按每日产能自动分配')
    },

    // 调整计划数量以符合工单总数
    adjustPlanQuantities() {
      if (!this.form.totalQuantity || this.form.dailyPlan.length === 0) return

      const totalAllocated = this.allocatedQuantity
      if (totalAllocated <= this.form.totalQuantity) return

      // 如果超过总数，从后往前减少
      let excess = totalAllocated - this.form.totalQuantity
      for (let i = this.form.dailyPlan.length - 1; i >= 0 && excess > 0; i--) {
        const plan = this.form.dailyPlan[i]
        const reduction = Math.min(plan.quantity, excess)
        plan.quantity -= reduction
        excess -= reduction
      }
    },

    // 获取单行最大数量
    getMaxQuantityForRow(index) {
      const currentQuantity = this.form.dailyPlan[index]?.quantity || 0
      const otherQuantity = this.allocatedQuantity - currentQuantity
      return (this.form.totalQuantity || 0) - otherQuantity
    },

    // 处理数量变化
    handleQuantityChange(index) {
      // 实时验证总数量
      this.$nextTick(() => {
        if (this.remaining < 0) {
          this.$message.warning('总分配数量不能超过工单数量')
        }
      })
    },

    // 计算每日产能（用于编辑时）
    calculateDailyCapacity() {
      if (this.form.dailyPlan && this.form.dailyPlan.length > 0) {
        const quantities = this.form.dailyPlan.map(p => p.quantity || 0).filter(q => q > 0)
        if (quantities.length > 0) {
          this.dailyCapacity = Math.round(quantities.reduce((sum, q) => sum + q, 0) / quantities.length)
        }
      }
    },

    // 获取剩余数量状态样式类
    getRemainStatus() {
      if (this.remaining === 0) return 'success'
      if (this.remaining < 0) return 'danger'
      return 'warning'
    },

    addDailyPlan() {
      this.form.dailyPlan.push({
        date: '',
        quantity: null,
        remark: ''
      })
    },

    removeDailyPlan(index) {
      this.form.dailyPlan.splice(index, 1)
    },

    addOrderDetail() {
      this.form.orderDetails.push({
        customer: '',
        orderNumber: '',
        productModel: '',
        emsOrder: '',
        quantity: null,
        deliveryDate: '',
        thirdLevelNumber: '',
        inspectionDate: '',
        orderCount: null
      })
    },

    removeOrderDetail(index) {
      this.form.orderDetails.splice(index, 1)
    },

    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        if (column.property === 'quantity') {
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
            sums[index] = ''
          }
        } else {
          sums[index] = ''
        }
      })
      return sums
    },

    async handleSave() {
      try {
        const valid = await this.$refs.form.validate()
        if (!valid) return

        // 验证每日计划总数
        if (this.remaining < 0) {
          this.$message.error('每日计划数量总和不能超过工单数量')
          return
        }

        if (this.remaining > 0) {
          this.$message.warning(`还有 ${this.remaining} 个未分配，建议完成分配后再保存`)
        }

        this.saving = true

        // 这里调用API保存数据
        // if (this.isEdit) {
        //   await updateScheduling(this.form)
        // } else {
        //   await addScheduling(this.form)
        // }

        // 模拟保存
        await new Promise(resolve => setTimeout(resolve, 1000))

        this.$message.success('保存成功')
        this.$emit('save')
      } catch (error) {
        console.error('保存失败:', error)
        this.$message.error('保存失败，请重试')
      } finally {
        this.saving = false
      }
    },

    handleCancel() {
      this.$emit('update:visible', false)
    },

    // 视图模式切换
    handleViewModeChange(mode) {
      this.viewMode = mode
      if (mode === 'calendar' && this.form.dailyPlan.length > 0) {
        // 设置日历显示的月份为排产计划的第一天
        const firstDate = this.form.dailyPlan[0].date
        if (firstDate) {
          this.calendarDate = new Date(firstDate)
        }
      }
    },

    // 根据日期获取排产计划
    getScheduleByDate(date) {
      return this.form.dailyPlan.find(plan => plan.date === date)
    },

    // 日历单元格点击事件
    handleCalendarCellClick(date, data) {
      const dateStr = data.day
      const existingSchedule = this.getScheduleByDate(dateStr)

      if (existingSchedule) {
        // 编辑现有排产计划
        this.$prompt('请输入计划数量', '编辑排产计划', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: existingSchedule.quantity || '',
          inputType: 'number'
        }).then(({ value }) => {
          const quantity = parseInt(value)
          if (quantity >= 0) {
            existingSchedule.quantity = quantity
            this.handleQuantityChange(this.form.dailyPlan.indexOf(existingSchedule))
          }
        }).catch(() => { })
      } else {
        // 检查日期是否在排产范围内
        if (this.form.onlineDate && this.form.completionDate) {
          const clickDate = new Date(dateStr)
          const startDate = new Date(this.form.onlineDate)
          const endDate = new Date(this.form.completionDate)

          if (clickDate >= startDate && clickDate <= endDate) {
            // 如果是周日，给出特别提示
            const promptTitle = this.isSunday(dateStr) ? '添加周日排产计划（特殊安排）' : '添加排产计划'
            const promptMessage = this.isSunday(dateStr) ? '周日通常不安排排产，请确认是否需要特殊安排：' : '请输入计划数量：'

            this.$prompt(promptMessage, promptTitle, {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputType: 'number'
            }).then(({ value }) => {
              const quantity = parseInt(value)
              if (quantity > 0) {
                this.form.dailyPlan.push({
                  date: dateStr,
                  quantity: quantity,
                  remark: this.isSunday(dateStr) ? '周日特殊安排' : ''
                })
                // 按日期排序
                this.form.dailyPlan.sort((a, b) => new Date(a.date) - new Date(b.date))
              }
            }).catch(() => { })
          } else {
            this.$message.warning('请选择排产时间范围内的日期')
          }
        } else {
          this.$message.warning('请先选择排产时间范围')
        }
      }
    },

    // 表格日期变化处理
    handleTableDateChange(index) {
      // 检查是否是周日
      const date = this.form.dailyPlan[index].date
      if (this.isSunday(date)) {
        this.$message.warning('选择了周日，通常不安排排产，如有特殊需要请在备注中说明')
        if (!this.form.dailyPlan[index].remark) {
          this.form.dailyPlan[index].remark = '周日特殊安排'
        }
      }
    },

    // 判断是否是周日
    isSunday(dateStr) {
      if (!dateStr) return false
      const date = new Date(dateStr)
      return date.getDay() === 0
    },

    // 获取星期文本
    getWeekdayText(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const weekdays = ['日', '一', '二', '三', '四', '五', '六']
      return weekdays[date.getDay()]
    },

    // 获取星期样式类
    getWeekdayClass(dateStr) {
      if (!dateStr) return ''
      return {
        'weekend': this.isSunday(dateStr),
        'weekday': !this.isSunday(dateStr)
      }
    },

    // 获取日历单元格样式类
    getCalendarCellClass(dateStr) {
      const classes = []

      if (this.isSunday(dateStr)) {
        classes.push('sunday-cell')
      }

      if (this.getScheduleByDate(dateStr)) {
        classes.push('has-schedule')
      }

      if (this.isInScheduleRange(dateStr)) {
        classes.push('in-range')
      }

      return classes.join(' ')
    },

    // 判断日期是否在排产范围内
    isInScheduleRange(dateStr) {
      if (!this.form.onlineDate || !this.form.completionDate || !dateStr) return false
      const date = new Date(dateStr)
      const startDate = new Date(this.form.onlineDate)
      const endDate = new Date(this.form.completionDate)
      return date >= startDate && date <= endDate
    }
  }
}
</script>

<style lang="scss" scoped>
.add-scheduling-dialog {

  // Fieldset 样式设计 - Element UI 原生风格
  fieldset {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    margin-bottom: 20px;
    padding: 0;
    background: #ffffff;

    legend {
      padding: 0 10px;
      margin-left: 10px;
      font-size: 14px;
      font-weight: 500;
      color: #606266;
      background: #ffffff;

      i {
        margin-right: 5px;
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .fieldset-content {
    padding: 20px;
  }

  // 表单行布局
  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-group {
    min-width: 0;

    &.date-range-group {
      grid-column: span 2;
    }
  }

  .form-input,
  .form-input-number {
    width: 100%;
  }

  .date-range-picker {
    width: 100%;
  }

  // 产能配置区域 - Element UI 原生风格
  .capacity-config {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fafafa;
    padding: 16px;
    border-radius: 4px;
    margin-bottom: 16px;
    border: 1px solid #ebeef5;

    .capacity-input-group {
      display: flex;
      align-items: center;
      gap: 10px;

      .capacity-label {
        font-size: 14px;
        font-weight: 500;
        color: #495057;
        white-space: nowrap;
      }

      .capacity-input {
        width: 120px;
      }

      .capacity-unit {
        font-size: 13px;
        color: #6c757d;
        white-space: nowrap;
      }

      .auto-allocate-btn {
        margin-left: 10px;
      }
    }
  }

  // 统计面板
  .statistics-panel {
    display: flex;
    gap: 24px;

    .stat-item {
      text-align: center;

      .stat-label {
        display: block;
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }

      .stat-value {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 500;
        color: #606266;

        &.primary {
          color: #409eff;
        }

        &.success {
          color: #67c23a;
        }

        &.warning {
          color: #e6a23c;
        }

        &.danger {
          color: #f56c6c;
        }

        .stat-warning {
          margin-left: 4px;
          color: #f56c6c;
          cursor: pointer;
        }
      }
    }
  }

  // 视图切换
  .view-tabs {
    margin-bottom: 20px;
    text-align: center;
  }

  // 表格操作按钮
  .table-actions {
    margin-top: 16px;
    text-align: left;
  }

  // 星期样式
  .weekend {
    color: #f56c6c !important;
    font-weight: 600;
  }

  .weekday {
    color: #606266;
  }

  // 日历视图样式
  .calendar-view {
    .calendar-tips {
      margin-bottom: 16px;
    }

    .schedule-calendar {
      border: 1px solid #e4e7ed;
      border-radius: 6px;

      :deep(.el-calendar-table) {
        .el-calendar-day {
          padding: 0;
          height: 90px;
        }
      }
    }

    .calendar-cell {
      width: 100%;
      height: 100%;
      padding: 6px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.3s;
      position: relative;

      &:hover {
        background-color: #f5f7fa;
      }

      &.sunday-cell {
        background-color: #fef0f0;

        &:hover {
          background-color: #fde2e2;
        }
      }

      &.has-schedule {
        background-color: #f0f9ff;
        border: 1px solid #bfdbfe;

        &:hover {
          background-color: #dbeafe;
        }
      }

      &.in-range {
        border: 1px dashed #d1d5db;
      }

      .date-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;

        .date-num {
          font-size: 16px;
          font-weight: 600;
          color: #606266;
        }

        .weekday {
          font-size: 12px;
          font-weight: 500;

          &.weekend {
            background: #fef2f2;
            color: #f56c6c;
            padding: 2px 4px;
            border-radius: 2px;
          }
        }
      }

      .schedule-info {
        .quantity {
          font-size: 12px;
          color: #409eff;
          font-weight: 600;
          background: #ecf5ff;
          padding: 2px 6px;
          border-radius: 3px;
          margin-bottom: 2px;
          display: inline-block;
        }

        .remark {
          font-size: 10px;
          color: #909399;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .no-schedule {
        .add-hint {
          font-size: 11px;
          color: #c0c4cc;
          font-style: italic;
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
        }
      }
    }
  }

  // 底部按钮区域
  .footer-content {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 16px 0;

    .footer-buttons {
      display: flex;
      gap: 12px;
    }
  }

  // 旧样式（兼容性保留）
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

  .daily-plan-header {
    .info-text {
      font-size: 14px;
      color: #606266;
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .capacity-config {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;

      .capacity-input-group {
        justify-content: center;
      }

      .statistics-panel {
        justify-content: space-around;
      }
    }

    .section-content {
      padding: 20px 16px;
    }
  }
}

// 使用 Element UI 原生样式，移除自定义深度样式
</style>