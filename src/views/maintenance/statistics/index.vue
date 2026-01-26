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
                  <el-select
                    v-model="chartParams.productionLine.productType"
                    placeholder="请选择产品类型"
                    style="width: 140px"
                    size="mini"
                    clearable
                    filterable
                    @change="handleProductionLineProductTypeChange"
                  >
                    <el-option
                      v-for="(item, index) in productTypeOptions"
                      :key="item.dictCode || `product-type-${index}`"
                      :label="item.dictLabel"
                      :value="item.dictCode"
                    />
                  </el-select>
                  <select-loadMore
                    v-model="chartParams.productionLine.category"
                    :data="productionLineCategoryData.data"
                    :page="productionLineCategoryData.page"
                    :hasMore="productionLineCategoryData.more"
                    dictLabel="name"
                    dictValue="id"
                    :request="getProductionLineCategoryList"
                    placeholder="请选择品类"
                    size="mini"
                    style="width: 140px"
                    @change="handleProductionLineCategoryChange"
                  />
                  <el-select
                    v-model="chartParams.productionLine.defectReasons"
                    multiple
                    placeholder="请选择不良原因"
                    style="width: 200px"
                    size="mini"
                    clearable
                    filterable
                    collapse-tags
                    @change="updateProductionLineChart"
                  >
                    <el-option
                      v-for="item in productionLineDefectReasonOptions"
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
                  <el-select
                    v-model="chartParams.productType.productType"
                    placeholder="请选择产品类型"
                    style="width: 140px"
                    size="mini"
                    clearable
                    filterable
                    @change="handleProductTypeProductTypeChange"
                  >
                    <el-option
                      v-for="(item, index) in productTypeOptions"
                      :key="item.dictCode || `product-type-2-${index}`"
                      :label="item.dictLabel"
                      :value="item.dictCode"
                    />
                  </el-select>
                  <select-loadMore
                    v-model="chartParams.productType.category"
                    :data="productTypeCategoryData.data"
                    :page="productTypeCategoryData.page"
                    :hasMore="productTypeCategoryData.more"
                    dictLabel="name"
                    dictValue="id"
                    :request="getProductTypeCategoryList"
                    placeholder="请选择品类"
                    size="mini"
                    style="width: 140px"
                    @change="handleProductTypeCategoryChange"
                  />
                  <el-select
                    v-model="chartParams.productType.defectReasons"
                    multiple
                    collapse-tags
                    placeholder="请选择不良原因"
                    style="width: 200px"
                    size="mini"
                    clearable
                    filterable
                    @change="updateProductTypeChart"
                  >
                    <el-option
                      v-for="item in productTypeDefectReasonOptions"
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
import { listCategory } from '@/api/third/category'
import { getDicts } from '@/api/system/dict/data'

export default {
  name: 'MaintenanceStatistics',
  data() {
    return {
      // 线号统计图 - 品类数据
      productionLineCategoryData: {
        data: [],
        page: 1,
        more: true,
      },
      // 产品类型统计图 - 品类数据
      productTypeCategoryData: {
        data: [],
        page: 1,
        more: true,
      },
      loading: false,
      // 统一查询表单
      searchForm: {},
      // 线号统计图 - 不良原因选项
      productionLineDefectReasonOptions: [],
      // 产品类型统计图 - 不良原因选项
      productTypeDefectReasonOptions: [],
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
          productType: '',
          category: '',
          productionLine: '',
          defectReasons: []
        },
        productType: {
          year: new Date().getFullYear().toString(),
          month: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'),
          yearMonth: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'),
          productType: '',
          category: '',
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
    // 线号统计图 - 获取品类列表（根据产品类型筛选）
    getProductionLineCategoryList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        const params = {
          p: page,
          key: keyword
        }
        // 如果选择了产品类型，添加过滤参数
        if (this.chartParams.productionLine.productType) {
          params.productType = this.chartParams.productionLine.productType
        }
        
        listCategory(params).then((res) => {
          if (res.code === 200 && res.data) {
            const { list, total, pageNum, pageSize } = res.data
            if (more) {
              this.productionLineCategoryData.data = [...this.productionLineCategoryData.data, ...list]
            } else {
              this.productionLineCategoryData.data = list || []
            }
            this.productionLineCategoryData.more = pageNum * pageSize < total
            this.productionLineCategoryData.page = pageNum
          } else {
            this.productionLineCategoryData.data = []
            this.productionLineCategoryData.more = false
          }
          resolve()
        }).catch((error) => {
          console.error('获取品类数据失败:', error)
          this.productionLineCategoryData.data = []
          this.productionLineCategoryData.more = false
          resolve()
        })
      })
    },
    
    // 产品类型统计图 - 获取品类列表（根据产品类型筛选）
    getProductTypeCategoryList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        const params = {
          p: page,
          key: keyword
        }
        // 如果选择了产品类型，添加过滤参数
        if (this.chartParams.productType.productType) {
          params.productType = this.chartParams.productType.productType
        }
        
        listCategory(params).then((res) => {
          if (res.code === 200 && res.data) {
            const { list, total, pageNum, pageSize } = res.data
            if (more) {
              this.productTypeCategoryData.data = [...this.productTypeCategoryData.data, ...list]
            } else {
              this.productTypeCategoryData.data = list || []
            }
            this.productTypeCategoryData.more = pageNum * pageSize < total
            this.productTypeCategoryData.page = pageNum
          } else {
            this.productTypeCategoryData.data = []
            this.productTypeCategoryData.more = false
          }
          resolve()
        }).catch((error) => {
          console.error('获取品类数据失败:', error)
          this.productTypeCategoryData.data = []
          this.productTypeCategoryData.more = false
          resolve()
        })
      })
    },
    
    // 加载选项并设置默认值
    async loadOptionsAndSetDefaults() {
      try {
        // 加载字典数据
        await Promise.all([
          this.loadProductTypeOptions()
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
      console.log('产品类型选项数量:', this.productTypeOptions.length)

      // 不默认选中任何产品类型，让用户手动选择
      this.chartParams.productionLine.productType = ''
      this.chartParams.productType.productType = ''
      
      // 两个图表都默认不选中任何品类和不良原因
      this.chartParams.productionLine.category = ''
      this.chartParams.productType.category = ''
      this.chartParams.productionLine.defectReasons = []
      this.chartParams.productType.defectReasons = []
      
      console.log('默认不选中任何筛选项，等待用户手动选择')
      console.log('最终的图表参数设置:')
      console.log('线号统计参数:', this.chartParams.productionLine)
      console.log('产品类型统计参数:', this.chartParams.productType)
    },

    // 加载产品类型字典选项
    async loadProductTypeOptions() {
      try {
        const res = await getDicts('product_type')
        if (res.code === 200 && res.data) {
          this.productTypeOptions = res.data.filter(item => item.status === '0') // 只显示启用的字典项
          console.log('加载产品类型选项:', this.productTypeOptions.length, '条')
          console.log('产品类型选项详情:', JSON.stringify(this.productTypeOptions, null, 2))
        }
      } catch (error) {
        console.error('获取产品类型字典失败:', error)
        this.productTypeOptions = []
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
    
    // 线号统计图 - 产品类型变化处理（联动品类和不良原因）
    async handleProductionLineProductTypeChange(value) {
      console.log('线号统计图-产品类型变化:', value)
      // 清空品类和不良原因选择
      this.chartParams.productionLine.category = ''
      this.chartParams.productionLine.defectReasons = []
      this.productionLineCategoryData.data = []
      this.productionLineDefectReasonOptions = []
      
      if (value) {
        // 重新加载品类数据（根据产品类型筛选）
        await this.getProductionLineCategoryList({ page: 1, more: false, keyword: '' })
      }
      
      // 更新图表
      this.updateProductionLineChart()
    },
    
    // 线号统计图 - 品类变化处理（联动不良原因）
    async handleProductionLineCategoryChange(value) {
      console.log('线号统计图-品类变化:', value)
      // 清空不良原因选择
      this.chartParams.productionLine.defectReasons = []
      this.productionLineDefectReasonOptions = []
      
      if (value) {
        // 重新加载不良原因数据（根据品类筛选）
        await this.loadProductionLineDefectReasons(value)
      }
      
      // 更新图表
      this.updateProductionLineChart()
    },
    
    // 产品类型统计图 - 产品类型变化处理（联动品类和不良原因）
    async handleProductTypeProductTypeChange(value) {
      console.log('产品类型统计图-产品类型变化:', value)
      // 清空品类和不良原因选择
      this.chartParams.productType.category = ''
      this.chartParams.productType.defectReasons = []
      this.productTypeCategoryData.data = []
      this.productTypeDefectReasonOptions = []
      
      if (value) {
        // 重新加载品类数据（根据产品类型筛选）
        await this.getProductTypeCategoryList({ page: 1, more: false, keyword: '' })
      }
      
      // 更新图表
      this.updateProductTypeChart()
    },
    
    // 产品类型统计图 - 品类变化处理（联动不良原因）
    async handleProductTypeCategoryChange(value) {
      console.log('产品类型统计图-品类变化:', value)
      // 清空不良原因选择
      this.chartParams.productType.defectReasons = []
      this.productTypeDefectReasonOptions = []
      
      if (value) {
        // 重新加载不良原因数据（根据品类筛选）
        await this.loadProductTypeDefectReasons(value)
      }
      
      // 更新图表
      this.updateProductTypeChart()
    },
    
    // 线号统计图 - 加载不良原因选项（根据品类筛选）
    async loadProductionLineDefectReasons(categoryId) {
      try {
        const params = {}
        if (categoryId) {
          params.categoryId = categoryId
        }
        
        const res = await getRepairReasonsList(params)
        if (res.code === 200 && res.data && Array.isArray(res.data)) {
          this.productionLineDefectReasonOptions = res.data
          console.log('线号统计图-加载不良原因选项:', this.productionLineDefectReasonOptions.length, '条')
        } else {
          this.productionLineDefectReasonOptions = []
        }
      } catch (error) {
        console.error('线号统计图-获取不良原因列表失败:', error)
        this.productionLineDefectReasonOptions = []
      }
    },
    
    // 产品类型统计图 - 加载不良原因选项（根据品类筛选）
    async loadProductTypeDefectReasons(categoryId) {
      try {
        const params = {}
        if (categoryId) {
          params.categoryId = categoryId
        }
        
        const res = await getRepairReasonsList(params)
        if (res.code === 200 && res.data && Array.isArray(res.data)) {
          this.productTypeDefectReasonOptions = res.data
          console.log('产品类型统计图-加载不良原因选项:', this.productTypeDefectReasonOptions.length, '条')
        } else {
          this.productTypeDefectReasonOptions = []
        }
      } catch (error) {
        console.error('产品类型统计图-获取不良原因列表失败:', error)
        this.productTypeDefectReasonOptions = []
      }
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
      // 数据格式：{ defectReasons: [], defectCounts: [], defectPercentages: [], cumulativePercentages: [] }
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
              percentage: data.defectPercentages && data.defectPercentages[i] ? data.defectPercentages[i] : '',
              cumulativePercentage: data.cumulativePercentages && data.cumulativePercentages[i] ?
                parseFloat(data.cumulativePercentages[i]) : 0
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
      // 产品类型测试数据（帕累托图格式）
      const productTypeData = [
        { name: '主板', value: 18, percentage: '40.00%', cumulativePercentage: 40.00 },
        { name: '屏幕', value: 15, percentage: '33.33%', cumulativePercentage: 73.33 },
        { name: '电池', value: 7, percentage: '15.56%', cumulativePercentage: 88.89 },
        { name: '外壳', value: 5, percentage: '11.11%', cumulativePercentage: 100.00 }
      ]

      // 线号测试数据（帕累托图格式）
      const productionLineData = [
        { name: '线号001', value: 16, percentage: '35.56%', cumulativePercentage: 35.56 },
        { name: '线号002', value: 14, percentage: '31.11%', cumulativePercentage: 66.67 },
        { name: '线号003', value: 10, percentage: '22.22%', cumulativePercentage: 88.89 },
        { name: '线号004', value: 5, percentage: '11.11%', cumulativePercentage: 100.00 }
      ]

      this.renderProductTypeChart(productTypeData)
      this.renderProductionLineChart(productionLineData)
    },
    
    
    
    // 渲染产品类型图表（帕累托图）
    renderProductTypeChart(data) {
      const names = data.map(item => item.name)
      const values = data.map(item => item.value)
      const cumulativePercentages = data.map(item => item.cumulativePercentage || 0)

      // 计算合适的显示区间（根据数据量动态调整）
      const dataLength = names.length
      const defaultEndPercent = dataLength > 20 ? Math.min(100, (20 / dataLength) * 100) : 100

      const option = {
        title: {
          text: '产品类型维修统计',
          left: 'center',
          top: '0',
          textStyle: {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#333'
          }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#eee',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          },
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          },
          formatter: function(params) {
            let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValueLabel}</div>`
            params.forEach(param => {
              const color = param.color
              if (param.seriesName === '不良数量') {
                result += `<div style="display:flex;align-items:center;margin-bottom:3px;">
                  <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>
                  <span style="flex:1;">${param.seriesName}</span>
                  <span style="font-weight:bold;margin-left:15px;">${param.value} 次</span>
                </div>`
              } else if (param.seriesName === '累计百分比') {
                result += `<div style="display:flex;align-items:center;">
                  <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>
                  <span style="flex:1;">${param.seriesName}</span>
                  <span style="font-weight:bold;margin-left:15px;">${param.value.toFixed(2)}%</span>
                </div>`
              }
            })
            return result
          }
        },
        legend: {
          data: ['不良数量', '累计百分比'],
          top: '25px',
          itemGap: 20,
          itemWidth: 15,
          itemHeight: 10,
          textStyle: {
             fontSize: 11
          }
        },
        grid: {
          left: '4%',
          right: '4%',
          bottom: '40px',
          top: '60px',
          containLabel: true
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: defaultEndPercent,
            bottom: '5px',
            height: 18,
            borderColor: 'transparent',
            backgroundColor: '#f5f7fa',
            fillerColor: 'rgba(64, 158, 255, 0.2)',
            handleSize: '100%',
            handleStyle: {
              color: '#409eff',
              shadowBlur: 3,
              shadowColor: 'rgba(0, 0, 0, 0.6)',
              shadowOffsetX: 2,
              shadowOffsetY: 2
            },
            textStyle: {
              color: '#909399'
            },
            brushSelect: false
          },
          {
            type: 'inside',
            xAxisIndex: [0],
            start: 0,
            end: defaultEndPercent,
            zoomOnMouseWheel: false,
            moveOnMouseMove: true,
            moveOnMouseWheel: true
          }
        ],
        xAxis: {
          type: 'category',
          data: names,
          axisLine: {
            show: true,
            lineStyle: {
              color: '#333'
            }
          },
          axisTick: {
            show: true,
            alignWithLabel: true
          },
          axisLabel: {
            rotate: 45,
            interval: 0,
            color: '#333',
            fontSize: 10,
            margin: 10,
            formatter: function(value) {
              // 如果标签超过15个字符，进行截断并添加省略号
              if (value.length > 15) {
                return value.substring(0, 15) + '...'
              }
              return value
            }
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '不良数量（次）',
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#333'
              }
            },
            axisTick: {
              show: true
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#e8e8e8',
                type: 'dashed'
              }
            },
            axisLabel: {
              formatter: '{value}',
              color: '#333'
            },
            nameTextStyle: {
              color: '#333',
              fontSize: 12
            }
          },
          {
            type: 'value',
            name: '累计百分比（%）',
            position: 'right',
            min: 0,
            max: 100,
            axisLine: {
              show: true,
              lineStyle: {
                color: '#333'
              }
            },
            axisTick: {
              show: true
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              formatter: '{value}%',
              color: '#333'
            },
            nameTextStyle: {
              color: '#333',
              fontSize: 12
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
              color: '#4472C4',
              borderRadius: [4, 4, 0, 0]
            },
            barMaxWidth: 60,
            label: {
              show: false
            }
          },
          {
            name: '累计百分比',
            type: 'line',
            yAxisIndex: 1,
            data: cumulativePercentages,
            itemStyle: {
              color: '#27AE60'
            },
            lineStyle: {
              color: '#27AE60',
              width: 3
            },
            symbol: 'circle',
            symbolSize: 8,
            smooth: false,
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%',
              fontSize: 9,
              color: '#27AE60'
            }
          }
        ]
      }

      this.productTypeChart.setOption(option)
    },
    
    // 渲染线号图表（帕累托图）
    renderProductionLineChart(data) {
      const names = data.map(item => item.name)
      const values = data.map(item => item.value)
      const cumulativePercentages = data.map(item => item.cumulativePercentage || 0)

      // 计算合适的显示区间（根据数据量动态调整）
      const dataLength = names.length
      const defaultEndPercent = dataLength > 20 ? Math.min(100, (20 / dataLength) * 100) : 100

      const option = {
        title: {
          text: '线号维修统计',
          left: 'center',
          top: '0',
          textStyle: {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#333'
          }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#eee',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          },
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          },
          formatter: function(params) {
            let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValueLabel}</div>`
            params.forEach(param => {
              const color = param.color
              if (param.seriesName === '不良数量') {
                result += `<div style="display:flex;align-items:center;margin-bottom:3px;">
                  <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>
                  <span style="flex:1;">${param.seriesName}</span>
                  <span style="font-weight:bold;margin-left:15px;">${param.value} 次</span>
                </div>`
              } else if (param.seriesName === '累计百分比') {
                result += `<div style="display:flex;align-items:center;">
                  <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>
                  <span style="flex:1;">${param.seriesName}</span>
                  <span style="font-weight:bold;margin-left:15px;">${param.value.toFixed(2)}%</span>
                </div>`
              }
            })
            return result
          }
        },
        legend: {
          data: ['不良数量', '累计百分比'],
          top: '25px',
          itemGap: 20,
          itemWidth: 15,
          itemHeight: 10,
          textStyle: {
             fontSize: 11
          }
        },
        grid: {
          left: '4%',
          right: '4%',
          bottom: '40px',
          top: '60px',
          containLabel: true
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: defaultEndPercent,
            bottom: '5px',
            height: 18,
            borderColor: 'transparent',
            backgroundColor: '#f5f7fa',
            fillerColor: 'rgba(64, 158, 255, 0.2)',
            handleSize: '100%',
            handleStyle: {
              color: '#409eff',
              shadowBlur: 3,
              shadowColor: 'rgba(0, 0, 0, 0.6)',
              shadowOffsetX: 2,
              shadowOffsetY: 2
            },
            textStyle: {
              color: '#909399'
            },
            brushSelect: false
          },
          {
            type: 'inside',
            xAxisIndex: [0],
            start: 0,
            end: defaultEndPercent,
            zoomOnMouseWheel: false,
            moveOnMouseMove: true,
            moveOnMouseWheel: true
          }
        ],
        xAxis: {
          type: 'category',
          data: names,
          axisLine: {
            show: true,
            lineStyle: {
              color: '#333'
            }
          },
          axisTick: {
            show: true,
            alignWithLabel: true
          },
          axisLabel: {
            rotate: 45,
            interval: 0,
            color: '#333',
            fontSize: 10,
            margin: 10,
            formatter: function(value) {
              // 如果标签超过15个字符，进行截断并添加省略号
              if (value.length > 15) {
                return value.substring(0, 15) + '...'
              }
              return value
            }
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '不良数量（次）',
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#333'
              }
            },
            axisTick: {
              show: true
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#e8e8e8',
                type: 'dashed'
              }
            },
            axisLabel: {
              formatter: '{value}',
              color: '#333'
            },
            nameTextStyle: {
              color: '#333',
              fontSize: 12
            }
          },
          {
            type: 'value',
            name: '累计百分比（%）',
            position: 'right',
            min: 0,
            max: 100,
            axisLine: {
              show: true,
              lineStyle: {
                color: '#333'
              }
            },
            axisTick: {
              show: true
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              formatter: '{value}%',
              color: '#333'
            },
            nameTextStyle: {
              color: '#333',
              fontSize: 12
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
              color: '#4472C4',
              borderRadius: [4, 4, 0, 0]
            },
            barMaxWidth: 60,
            label: {
              show: false
            }
          },
          {
            name: '累计百分比',
            type: 'line',
            yAxisIndex: 1,
            data: cumulativePercentages,
            itemStyle: {
              color: '#27AE60'
            },
            lineStyle: {
              color: '#27AE60',
              width: 3
            },
            symbol: 'circle',
            symbolSize: 8,
            smooth: false,
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%',
              fontSize: 9,
              color: '#27AE60'
            }
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
  box-sizing: border-box;
  box-sizing: border-box;
  /* 使用 100vh 可能会导致双滚动条，通常 app-container 已经有 padding 或 height 管理 */
  height: 100%; 
  min-height: 100vh; /* 确保至少有一屏高度 */
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 允许垂直滚动，如果不限高 */
  overflow-x: hidden;
}

/* 头部区域样式 */
.header-section {
  margin-bottom: 15px;
  flex-shrink: 0;
}

/* 主体区域样式 */
.main-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
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
  gap: 10px;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.maintenance-statistics-container .chart-row {
  display: flex;
  flex: 1;
  /* 确保行有最小高度 */
  min-height: 480px; 
  margin-bottom: 20px;
}

.maintenance-statistics-container .chart-row:last-child {
  margin-bottom: 0;
}

/* Override Element UI default styles */
.maintenance-statistics-container .el-row {
  display: flex !important;
  flex: 1;
  /* 移除 min-height: 0，避免过度收缩 */
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* 关键修复：隐藏 ElRow 的伪元素，防止 Flex 布局错乱 */
.maintenance-statistics-container .el-row::before,
.maintenance-statistics-container .el-row::after {
  display: none !important;
}

.maintenance-statistics-container .el-col {
  display: flex !important;
  flex-direction: column;
  flex: 1;
  /* 确保列能撑开 */
  height: 100%; 
}

.maintenance-statistics-container .chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 0;
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

.maintenance-statistics-container .chart-container-medium {
  width: 100%;
  height: 300px;
}

.maintenance-statistics-container .chart-card-medium {
  display: flex;
  flex-direction: column;
  min-height: 400px;
}


.maintenance-statistics-container .chart-card-large {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 480px; /* 强制最小高度，防止压扁 */
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
  padding: 80px 10px 10px 10px; /* 顶部留出更多空间给头部控件 */
}

.maintenance-statistics-container .chart-container-large {
  flex: 1;
  /* min-height: 200px; - flex shrinking might be too aggressive */
  height: 480px; /* Explicit height to force display */
  padding: 65px 0px 5px 0px;
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
