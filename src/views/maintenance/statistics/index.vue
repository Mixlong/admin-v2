<template>
  <div class="maintenance-statistics-container app-container">

    <!-- 主体区域 - 统计图表 -->
    <div class="main-section">
      <div class="charts-section">
        <!-- 线号统计图 -->
        <el-row :gutter="20" class="chart-row">
          <el-col :span="24">
            <div class="chart-card chart-card-large">
              <div class="chart-header">
                <div class="chart-controls">
                  <el-date-picker
                    v-model="chartParams.productionLine.yearMonth"
                    type="month"
                    placeholder="选择年月"
                    format="yyyy年MM月"
                    value-format="yyyy-MM"
                    size="mini"
                    style="width: 150px"
                    @change="handleProductionLineYearMonthChange"
                  />
                  <select-loadMore
                    v-model="chartParams.productionLine.category"
                    :data="categoryData.data"
                    :page="categoryData.page"
                    :hasMore="categoryData.more"
                    dictLabel="name"
                    dictValue="id"
                    :request="getCategoryList"
                    placeholder="请选择品类"
                    size="mini"
                    style="width: 140px"
                    @change="updateProductionLineChart"
                  />
                  <el-select
                    v-model="chartParams.productionLine.productionLine"
                    placeholder="请选择线号"
                    style="width: 140px"
                    size="mini"
                    clearable
                    filterable
                    @change="updateProductionLineChart"
                  >
                    <el-option
                      v-for="item in productionLineOptions"
                      :key="item.dictValue"
                      :label="item.dictLabel"
                      :value="item.dictLabel"
                    />
                  </el-select>
                  <el-select
                    v-model="chartParams.productionLine.defectReasons"
                    multiple
                    placeholder="请选择不良原因"
                    style="width: 200px"
                    size="small"
                    clearable
                    filterable
                    collapse-tags
                    @change="updateProductionLineChart"
                  >
                    <el-option
                      v-for="item in defectReasonOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </div>
              </div>
              <div ref="productionLineChart" class="chart-container-large"></div>
            </div>
          </el-col>
        </el-row>
        
        <!-- 产品类型统计图 -->
        <el-row :gutter="20" class="chart-row">
          <el-col :span="24">
            <div class="chart-card chart-card-large">
              <div class="chart-header">
                <div class="chart-controls">
                  <el-date-picker
                    v-model="chartParams.productType.yearMonth"
                    type="month"
                    placeholder="选择年月"
                    format="yyyy年MM月"
                    value-format="yyyy-MM"
                    size="mini"
                    style="width: 150px"
                    @change="handleProductTypeYearMonthChange"
                  />
                  <select-loadMore
                    v-model="chartParams.productType.category"
                    :data="categoryData.data"
                    :page="categoryData.page"
                    :hasMore="categoryData.more"
                    dictLabel="name"
                    dictValue="id"
                    :request="getCategoryList"
                    placeholder="请选择品类"
                    size="mini"
                    style="width: 140px"
                    @change="updateProductTypeChart"
                  />
                  <el-select
                    v-model="chartParams.productType.productType"
                    placeholder="请选择产品类型"
                    style="width: 140px"
                    size="mini"
                    clearable
                    filterable
                    @change="updateProductTypeChart"
                  >
                    <el-option
                      v-for="item in productTypeOptions"
                      :key="item.dictValue"
                      :label="item.dictLabel"
                      :value="item.dictCode"
                    />
                  </el-select>
                  <el-select
                    v-model="chartParams.productType.defectReasons"
                    multiple
                    collapse-tags
                    placeholder="请选择不良原因"
                    style="width: 200px"
                    size="small"
                    clearable
                    filterable
                    @change="updateProductTypeChart"
                  >
                    <el-option
                      v-for="item in defectReasonOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </div>
              </div>
              <div ref="productTypeChart" class="chart-container-large"></div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getRepairDefectReport, getRepairReasonsList } from '@/api/maintenance/statistics'
import { afterCategoryList } from '@/api/third/sale'
import { getDicts } from '@/api/system/dict/data'

export default {
  name: 'MaintenanceStatistics',
  data() {
    return {
      // 品类数据
      categoryData: {
        data: [],
        page: 1,
        more: true,
      },
      loading: false,
      // 统一查询表单
      searchForm: {},
      // 不良原因字典选项
      defectReasonOptions: [],
      // 线别字典选项
      productionLineOptions: [],
      // 产品类型字典选项
      productTypeOptions: [],
      // 各图表独立的查询参数
      chartParams: {
        productionLine: {
          year: new Date().getFullYear().toString(),
          month: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'),
          yearMonth: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'),
          category: '',
          productionLine: '',
          defectReasons: []
        },
        productType: {
          year: new Date().getFullYear().toString(),
          month: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'),
          yearMonth: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'),
          category: '',
          productType: '',
          defectReasons: []
        }
      },
      // 图表实例
      productTypeChart: null,
      productionLineChart: null
    }
  },
  mounted() {
    this.initCharts()
    this.loadOptionsAndSetDefaults()
  },
  beforeDestroy() {
    this.disposeCharts()
  },
  methods: {
    // 获取品类列表
    getCategoryList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        afterCategoryList({
          p: page,
          key: keyword
        }).then((res) => {
          if (res.code === 200 && res.data) {
            const { list, total, pageNum, pageSize } = res.data
            if (more) {
              this.categoryData.data = [...this.categoryData.data, ...list]
            } else {
              this.categoryData.data = list || []
            }
            this.categoryData.more = pageNum * pageSize < total
            this.categoryData.page = pageNum
          } else {
            this.categoryData.data = []
            this.categoryData.more = false
          }
          resolve()
        }).catch((error) => {
          console.error('获取品类数据失败:', error)
          this.categoryData.data = []
          this.categoryData.more = false
          resolve()
        })
      })
    },

    // 加载选项并设置默认值
    async loadOptionsAndSetDefaults() {
      try {
        // 加载字典数据
        await Promise.all([
          this.loadProductionLineOptions(),
          this.loadProductTypeOptions(),
          this.loadDefectReasonOptions(),
          this.loadCategoryOptions()
        ])
        
        // 设置默认选中第一项
        this.setDefaultSelections()
        
        // 自动执行查询
        this.fetchData()
      } catch (error) {
        console.error('加载选项数据失败:', error)
        // 即使加载失败，也执行一次查询
        this.fetchData()
      }
    },
    
    // 设置默认选中项
    setDefaultSelections() {
      console.log('开始设置默认选中项...')
      console.log('线别选项数量:', this.productionLineOptions.length)
      console.log('产品类型选项数量:', this.productTypeOptions.length)
      console.log('不良原因选项数量:', this.defectReasonOptions.length)

      // 线号统计图：默认选中第一条线号（使用dictLabel）
      if (this.productionLineOptions.length > 0) {
        this.chartParams.productionLine.productionLine = this.productionLineOptions[0].dictLabel
        console.log('线号统计默认选中线号:', this.chartParams.productionLine.productionLine)
      }

      // 产品类型统计图：默认选中第一个产品类型（使用dictLabel）
      if (this.productTypeOptions.length > 0) {
        this.chartParams.productType.productType = this.productTypeOptions[0].dictLabel
        console.log('产品类型统计默认选中类型:', this.chartParams.productType.productType)
      }

      // 两个图表都默认不选中任何不良原因
      this.chartParams.productionLine.defectReasons = []
      this.chartParams.productType.defectReasons = []
      console.log('默认选中的不良原因数量: 0 (不默认选择)')

      console.log('最终的图表参数设置:')
      console.log('线号统计参数:', this.chartParams.productionLine)
      console.log('产品类型统计参数:', this.chartParams.productType)
    },

    // 加载不良原因选项
    async loadDefectReasonOptions() {
      try {
        const res = await getRepairReasonsList()
        if (res.code === 200 && res.data && Array.isArray(res.data)) {
          this.defectReasonOptions = res.data // 直接使用字符串数组
          console.log('加载不良原因选项:', this.defectReasonOptions.length, '条')
        } else {
          this.defectReasonOptions = []
        }
      } catch (error) {
        console.error('获取不良原因列表失败:', error)
        this.defectReasonOptions = []
      }
    },

    // 加载线别字典选项
    async loadProductionLineOptions() {
      try {
        const res = await getDicts('sop_line')
        if (res.code === 200 && res.data) {
          this.productionLineOptions = res.data.filter(item => item.status === '0') // 只显示启用的字典项
          console.log('加载线别选项:', this.productionLineOptions.length, '条')
        }
      } catch (error) {
        console.error('获取线别字典失败:', error)
        this.productionLineOptions = []
      }
    },

    // 加载产品类型字典选项
    async loadProductTypeOptions() {
      try {
        const res = await getDicts('product_type')
        if (res.code === 200 && res.data) {
          this.productTypeOptions = res.data.filter(item => item.status === '0') // 只显示启用的字典项
          console.log('加载产品类型选项:', this.productTypeOptions.length, '条')
        }
      } catch (error) {
        console.error('获取产品类型字典失败:', error)
        this.productTypeOptions = []
      }
    },

    // 加载品类选项
    async loadCategoryOptions() {
      try {
        await this.loadCategoryData(1)
      } catch (error) {
        console.error('获取品类数据失败:', error)
      }
    },

    // 初始化图表
    initCharts() {
      this.productionLineChart = echarts.init(this.$refs.productionLineChart)
      this.productTypeChart = echarts.init(this.$refs.productTypeChart)
      
      // 监听窗口大小变化
      window.addEventListener('resize', this.handleResize)
    },
    
    // 销毁图表
    disposeCharts() {
      if (this.defectReasonChart) this.defectReasonChart.dispose()
      if (this.categoryChart) this.categoryChart.dispose()
      if (this.productTypeChart) this.productTypeChart.dispose()
      if (this.productionLineChart) this.productionLineChart.dispose()
      if (this.monthlyTrendChart) this.monthlyTrendChart.dispose()
      if (this.dailyTrendChart) this.dailyTrendChart.dispose()
      
      window.removeEventListener('resize', this.handleResize)
    },
    
    // 处理窗口大小变化
    handleResize() {
      if (this.defectReasonChart) this.defectReasonChart.resize()
      if (this.categoryChart) this.categoryChart.resize()
      if (this.productTypeChart) this.productTypeChart.resize()
      if (this.productionLineChart) this.productionLineChart.resize()
      if (this.monthlyTrendChart) this.monthlyTrendChart.resize()
      if (this.dailyTrendChart) this.dailyTrendChart.resize()
    },
    

    // 搜索处理
    handleSearch() {
      this.fetchData()
    },
    
    // 重置处理
    handleReset() {
      // 重置所有图表参数到默认值
      const currentYear = new Date().getFullYear().toString()
      const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0')

      this.chartParams = {
        productionLine: {
          year: currentYear,
          month: currentMonth,
          yearMonth: currentMonth,
          category: '',
          productionLine: '',
          defectReasons: [] // 重置时也不默认选择任何不良原因
        },
        productType: {
          year: currentYear,
          month: currentMonth,
          yearMonth: currentMonth,
          category: '',
          productType: '',
          defectReasons: [] // 重置时也不默认选择任何不良原因
        }
      }

      // 重新设置默认选中项
      this.setDefaultSelections()

      // 刷新数据
      this.fetchData()
    },

    // 获取数据 - 初始加载时分别查询两个图表
    async fetchData() {
      this.loading = true
      try {
        // 并行查询两个图表的数据
        console.log('开始查询维修统计数据...')
        await this.processAndUpdateCharts()
      } catch (error) {
        console.error('获取维修统计数据失败:', error)
        this.$message.error('获取统计数据失败')
        this.updateChartsWithEmptyData()
      } finally {
        this.loading = false
      }
    },
    
    // 处理并更新所有图表 - 初始加载时同时查询两个图表
    async processAndUpdateCharts() {
      console.log('开始并行查询两个图表数据...')
      console.log('产品类型图表参数:', this.chartParams.productType)
      console.log('线号图表参数:', this.chartParams.productionLine)

      try {
        // 异步并行查询两个图表的数据
        const [productTypeData, productionLineData] = await Promise.all([
          this.fetchSingleChartData('productType'),
          this.fetchSingleChartData('productionLine')
        ])

        console.log('产品类型数据:', productTypeData)
        console.log('线号数据:', productionLineData)

        // 渲染图表
        this.renderProductTypeChart(productTypeData)
        this.renderProductionLineChart(productionLineData)
      } catch (error) {
        console.error('查询图表数据失败:', error)
        // 如果查询失败，使用测试数据
        this.updateChartsWithTestData()
      }
    },
    
    // 处理线号图表年月变化
    handleProductionLineYearMonthChange(value) {
      if (value) {
        const year = value.split('-')[0]
        this.chartParams.productionLine.year = year
        this.chartParams.productionLine.month = value
        this.chartParams.productionLine.yearMonth = value
      }
      this.updateProductionLineChart()
    },

    // 处理产品类型图表年月变化
    handleProductTypeYearMonthChange(value) {
      if (value) {
        const year = value.split('-')[0]
        this.chartParams.productType.year = year
        this.chartParams.productType.month = value
        this.chartParams.productType.yearMonth = value
      }
      this.updateProductTypeChart()
    },

    // 各图表独立更新方法
    async updateProductTypeChart() {
      const data = await this.fetchSingleChartData('productType')
      this.renderProductTypeChart(data)
    },

    async updateProductionLineChart() {
      const data = await this.fetchSingleChartData('productionLine')
      this.renderProductionLineChart(data)
    },
    
    // 获取单个图表数据
    async fetchSingleChartData(chartType) {
      try {
        // 根据图表类型使用对应的年份参数
        const chartParam = this.chartParams[chartType]
        let params = {
          year: chartParam.year || new Date().getFullYear().toString()
        }

        // 根据图表类型设置特定参数
        switch (chartType) {
          case 'productType':
            // 产品类型统计：查询特定的产品类型数据
            params.month = chartParam.month
            params.category = chartParam.category || ''
            params.productType = chartParam.productType || '' // 必须传递产品类型参数
            params.productionLine = '' // 不传线号，查询所有线号的该产品类型数据
            break
          case 'productionLine':
            // 线号统计：查询特定线号的数据
            params.month = chartParam.month
            params.category = chartParam.category || ''
            params.productionLine = chartParam.productionLine || '' // 必须传递线号参数
            params.productType = '' // 不传产品类型，查询该线号的所有产品类型数据
            break
        }

        console.log(`${chartType}查询参数:`, params)
        console.log(`${chartType}不良原因:`, chartParam.defectReasons || [])

        const response = await getRepairDefectReport(params, chartParam.defectReasons || [])

        if (response.code === 200 && response.data) {
          console.log(`${chartType}API返回数据:`, response.data)
          return this.extractDataFromResponse(response.data)
        } else {
          console.log(`${chartType}暂无数据:`, response.msg)
          return []
        }
      } catch (error) {
        console.error(`获取${chartType}图表数据失败:`, error)
        return []
      }
    },
    
    // 从响应数据中提取特定类型的数据
    extractDataFromResponse(data) {
      // 根据API返回的数据格式进行解析
      // 数据格式：{ defectReasons: [], defectCounts: [], defectPercentages: [] }
      const result = []

      if (data.defectReasons && data.defectCounts && Array.isArray(data.defectReasons) && Array.isArray(data.defectCounts)) {
        // 将不良原因和对应的数量组合成图表数据
        for (let i = 0; i < data.defectReasons.length && i < data.defectCounts.length; i++) {
          const name = data.defectReasons[i]
          const value = data.defectCounts[i]

          if (name && value !== undefined) {
            result.push({
              name: String(name),
              value: Number(value),
              percentage: data.defectPercentages && data.defectPercentages[i] ? data.defectPercentages[i] : ''
            })
          }
        }
      }

      return result
    },
    
    // 提取趋势数据
    extractTrendData(data, type) {
      const dates = []
      const values = []
      
      Object.keys(data).forEach(key => {
        const items = data[key]
        if (Array.isArray(items)) {
          items.forEach(item => {
            let date = ''
            let value = 0
            
            if (type === 'monthly') {
              date = item.month || item.date || key
              value = item.count || item.defectCount || 1
            } else if (type === 'daily') {
              date = item.day || item.date || key
              value = item.count || item.defectCount || 1
            }
            
            if (date) {
              const existingIndex = dates.indexOf(date)
              if (existingIndex !== -1) {
                values[existingIndex] += value
              } else {
                dates.push(date)
                values.push(value)
              }
            }
          })
        }
      })
      
      return { dates, values }
    },
    
    // 更新空数据图表
    updateChartsWithEmptyData() {
      this.renderProductTypeChart([])
      this.renderProductionLineChart([])
    },
    
    // 更新测试数据图表
    updateChartsWithTestData() {
      // 产品类型测试数据
      const productTypeData = [
        { name: '主板', value: 18, percentage: '40.00%' },
        { name: '屏幕', value: 15, percentage: '33.33%' },
        { name: '电池', value: 7, percentage: '15.56%' },
        { name: '外壳', value: 5, percentage: '11.11%' }
      ]

      // 线号测试数据
      const productionLineData = [
        { name: '线号001', value: 16, percentage: '35.56%' },
        { name: '线号002', value: 14, percentage: '31.11%' },
        { name: '线号003', value: 10, percentage: '22.22%' },
        { name: '线号004', value: 5, percentage: '11.11%' }
      ]

      this.renderProductTypeChart(productTypeData)
      this.renderProductionLineChart(productionLineData)
    },
    
    
    
    // 渲染产品类型图表（折线图）
    renderProductTypeChart(data) {
      const names = data.map(item => item.name)
      const values = data.map(item => item.value)
      const percentages = data.map(item => parseFloat(item.percentage) || 0)

      const option = {
        title: {
          text: '产品类型维修统计',
          left: 'center',
          top: '10%'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: function(params) {
            let result = params[0].axisValueLabel + '<br/>'
            params.forEach(param => {
              result += param.marker + param.seriesName + ': ' + param.value
              if (param.seriesName === '不良数量') {
                result += ' 次'
              } else {
                result += '%'
              }
              result += '<br/>'
            })
            return result
          }
        },
        legend: {
          data: ['不良数量', '累计百分比'],
          top: '15%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '30%',
          containLabel: true
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 100,
            bottom: '5%',
            height: 20,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23.1h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '100%',
            handleStyle: {
              color: '#5470c6'
            },
            textStyle: {
              color: '#333'
            },
            borderColor: '#ddd'
          },
          {
            type: 'inside',
            xAxisIndex: [0],
            start: 0,
            end: 100
          }
        ],
        xAxis: {
          type: 'category',
          data: names,
          axisLabel: {
            rotate: 0
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '不良数量',
            position: 'left',
            axisLabel: {
              formatter: '{value} 次'
            }
          },
          {
            type: 'value',
            name: '累计比例(%)',
            position: 'right',
            axisLabel: {
              formatter: '{value}%'
            }
          }
        ],
        series: [
          {
            name: '不良数量',
            type: 'bar',
            yAxisIndex: 0,
            data: values,
            itemStyle: {
              color: '#91cc75'
            }
          },
          {
            name: '累计百分比',
            type: 'line',
            yAxisIndex: 1,
            data: percentages,
            itemStyle: {
              color: '#5470c6'
            },
            lineStyle: {
              color: '#5470c6',
              width: 2
            },
            symbol: 'circle',
            symbolSize: 6,
            smooth: true
          }
        ]
      }

      this.productTypeChart.setOption(option)
    },
    
    // 渲染线号图表（折线图）
    renderProductionLineChart(data) {
      const names = data.map(item => item.name)
      const values = data.map(item => item.value)
      const percentages = data.map(item => parseFloat(item.percentage) || 0)

      const option = {
        title: {
          text: '线号维修统计',
          left: 'center',
          top: '10%'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: function(params) {
            let result = params[0].axisValueLabel + '<br/>'
            params.forEach(param => {
              result += param.marker + param.seriesName + ': ' + param.value
              if (param.seriesName === '不良数量') {
                result += ' 次'
              } else {
                result += '%'
              }
              result += '<br/>'
            })
            return result
          }
        },
        legend: {
          data: ['不良数量', '累计比例'],
          top: '15%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '30%',
          containLabel: true
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 100,
            bottom: '5%',
            height: 20,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23.1h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '100%',
            handleStyle: {
              color: '#5470c6'
            },
            textStyle: {
              color: '#333'
            },
            borderColor: '#ddd'
          },
          {
            type: 'inside',
            xAxisIndex: [0],
            start: 0,
            end: 100
          }
        ],
        xAxis: {
          type: 'category',
          data: names,
          axisLabel: {
            rotate: 0
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '不良数量',
            position: 'left',
            axisLabel: {
              formatter: '{value} 次'
            }
          },
          {
            type: 'value',
            name: '累计比例(%)',
            position: 'right',
            axisLabel: {
              formatter: '{value}%'
            }
          }
        ],
        series: [
          {
            name: '不良数量',
            type: 'bar',
            yAxisIndex: 0,
            data: values,
            itemStyle: {
              color: '#fac858'
            }
          },
          {
            name: '累计百分比',
            type: 'line',
        yAxisIndex: 1,
            data: percentages,
            itemStyle: {
              color: '#ee6666'
            },
            lineStyle: {
              color: '#ee6666',
              width: 2
            },
            symbol: 'circle',
            symbolSize: 6,
            smooth: true
          }
        ]
      }

      this.productionLineChart.setOption(option)
    },
    
  }
}
</script>

<style scoped>
.maintenance-statistics-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 头部区域样式 */
.header-section {
  flex-shrink: 0;
  margin-bottom: 15px;
  overflow: visible;
}

/* 主体区域样式 */
.main-section {
  display: flex;
  flex-direction: column;
}

.maintenance-statistics-container .search-section {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.maintenance-statistics-container .charts-section {
  display: flex;
  gap: 20px;
  flex-direction: column;
}

.maintenance-statistics-container .chart-row {
  display: flex;
  min-height: 400px;
}

.maintenance-statistics-container .chart-row:last-child {
  margin-bottom: 0;
}

.maintenance-statistics-container .chart-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.maintenance-statistics-container .chart-card h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

/* Element UI 列样式优化 */
.maintenance-statistics-container .el-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.maintenance-statistics-container .chart-container-medium {
  width: 100%;
  flex: 1;
}

.maintenance-statistics-container .chart-card-medium {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.maintenance-statistics-container .chart-card-large {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 500px;
}

/* 图表头部样式 */
.maintenance-statistics-container .chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  padding: 15px 20px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  min-height: 60px;
}

.maintenance-statistics-container .chart-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.maintenance-statistics-container .chart-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  max-width: none;
}

.maintenance-statistics-container .chart-card-medium h3 {
  margin: 0 0 15px 0;
  flex-shrink: 0;
}

.maintenance-statistics-container .chart-container-medium {
  flex: 1;
  min-height: 300px;
  padding: 80px 10px 10px 10px; /* 顶部留出更多空间给头部控件 */
}

.maintenance-statistics-container .chart-container-large {
  flex: 1;
  min-height: 400px;
  padding: 60px 10px 10px 10px; /* 顶部留出空间给头部控件 */
}

/* 统一查询表单样式 */
.maintenance-statistics-container .search-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.maintenance-statistics-container .search-left {
  flex: 1;
}

.maintenance-statistics-container .search-right {
  flex-shrink: 0;
  margin-left: 20px;
}

.maintenance-statistics-container .unified-search-form {
  margin: 0;
}

.maintenance-statistics-container .unified-search-section {
  background: #fff;
}
</style>
