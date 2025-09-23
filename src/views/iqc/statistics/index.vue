<template>
  <div class="iqc-statistics-container app-container">
    <!-- 头部区域 - 统一查询表单 -->
    <div class="header-section">
    <div class="unified-search-section">
        <div class="search-content">
          <!-- 左侧搜索表单 -->
          <div class="search-left">
      <el-form inline label-width="60px" class="unified-search-form">
        <el-form-item label="供应商">
                <select-loadMore
                  v-model="searchForm.supplierName"
                  :data="supplierData.data"
                  :page="supplierData.page"
                  :hasMore="supplierData.more"
                  dictLabel="supplierName"
                  dictValue="supplierName"
                  style="width: 140px"
                  :request="getSupplierList"
                  placeholder="请选择供应商"
                  size="mini"
                >
                </select-loadMore>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

        </div>
      </div>
    </div>

    <!-- 主体区域 - 统计图表 -->
    <div class="main-section">
    <div class="charts-section">
        <!-- 第一行：品类统计图 + 供应商统计图 -->
        <el-row :gutter="20" class="chart-row">
          <el-col :span="24">
            <div class="chart-card chart-card-medium">
              <div class="chart-header">
                <h3></h3>
                <el-date-picker
                  v-model="chartMonths.supplier"
                  type="month"
                  placeholder="选择年月"
                  format="yyyy年MM月"
                  value-format="yyyy-MM"
                  size="small"
                  style="width: 150px"
                  :picker-options="getMonthPickerOptions()"
                  @change="handleSupplierMonthChange"
                />
              </div>
              <div ref="supplierChart" class="chart-container-medium"></div>
          </div>
        </el-col>
        </el-row>
        
        <!-- 第二行：每月统计图 + 每日统计图 -->
        <el-row :gutter="20" class="chart-row">
        <el-col :span="12">
            <div class="chart-card chart-card-medium">
            <div class="chart-header">
                <h3></h3>
                <el-date-picker
                  v-model="chartYears.monthly"
                  type="year"
                  placeholder="选择年份"
                  format="yyyy年"
                  value-format="yyyy"
                  size="small"
                  style="width: 120px"
                  @change="handleMonthlyYearChange"
                />
              </div>
              <div ref="monthlyChart" class="chart-container-medium"></div>
            </div>
          </el-col>
          
          <el-col :span="12">
            <div class="chart-card chart-card-medium">
              <div class="chart-header">
                <h3></h3>
                <el-date-picker
                  v-model="chartMonths.daily"
                  type="month"
                  placeholder="选择年月"
                  format="yyyy年MM月"
                  value-format="yyyy-MM"
                  size="small"
                  style="width: 150px"
                  :picker-options="getMonthPickerOptions()"
                  @change="handleDailyMonthChange"
                />
            </div>
              <div ref="dailyChart" class="chart-container-medium"></div>
          </div>
        </el-col>
      </el-row>
    </div>
    </div>

  </div>
</template>

<script>
import * as echarts from 'echarts'
import {  getDailyReport, getMonthlyReport, getSupplierReport, getSupplierList } from '@/api/iqc/statistics'
import { afterCategoryList } from '@/api/third/sale'
export default {
  name: 'IQCStatistics',
  data() {
    return {
            // 品类数据
            categoryData: {
        data: [],
        page: 1,
        more: true,
      },
      // 供应商数据
      supplierData: {
        data: [],
        page: 1,
        more: true,
      },
      loading: false,
      // 统一查询表单
      searchForm: {
        category: '',
        supplierName: ''
      },
      // 各图表独立的月份选择
      chartMonths: {
        category: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'),
        supplier: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'),
        daily: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0')
      },
      // 各图表独立的年份选择
      chartYears: {
        monthly: new Date().getFullYear().toString()
      },
      categoryOptions: [],
      summaryData: {
        categoryCount: 0,
        supplierCount: 0,
        totalDefects: 0,
        defectRate: '0%'
      },
      chartType: 'category',
      trendType: 'daily',
      tableData: [],
      categoryTableData: [],
      supplierTableData: [],
      pagination: {
        current: 1,
        size: 20,
        total: 0
      },
      supplierChart: null,
      monthlyChart: null,
      dailyChart: null
    }
  },
  computed: {
    // 判断趋势图表是否为空状态（保留以兼容原有功能）
    isChartEmpty() {
      if (this.trendType === 'daily' && !this.searchForm.month) {
        return true
      }
      if (this.trendType === 'monthly' && !this.searchForm.year) {
        return true
      }
      return false
    }
  },
  mounted() {
    this.initCharts()
    this.loadOptionsAndSetDefaults()
  },
  beforeDestroy() {
 
    if (this.supplierChart) {
      this.supplierChart.dispose()
    }
    if (this.monthlyChart) {
      this.monthlyChart.dispose()
    }
    if (this.dailyChart) {
      this.dailyChart.dispose()
    }
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
    
    // 获取供应商列表
    getSupplierList({ page = 1, more = false, keyword = "" } = {}) {
      return new Promise((resolve) => {
        const params = {
          p: page,
          l: 10
        }
        if (keyword) {
          params.supplierName = keyword
        }
        
        getSupplierList(params).then((res) => {
          if (res.code === 200 && res.data) {
            const { list, total } = res.data
            const pageSize = 10
            let newList=[];
            if(list.length){
              newList=  list.map((item)=>{
                return {
                  supplierName:item
                }
              })
            }
            if (more) {
              this.supplierData.data = [...this.supplierData.data, ...newList]
            } else {
              this.supplierData.data = newList || []
            }
            this.supplierData.more = page * pageSize < total
            this.supplierData.page = page
          } else {
            this.supplierData.data = []
            this.supplierData.more = false
          }
          resolve()
        }).catch((error) => {
          console.error('获取供应商数据失败:', error)
          this.supplierData.data = []
          this.supplierData.more = false
          resolve()
        })
      })
    },
    // 加载下拉选项
    loadOptions() {
      this.loadCategoryOptions()
    },

    // 加载选项并设置默认值
    async loadOptionsAndSetDefaults() {
      try {
        // 加载品类数据
        await this.loadCategoryOptions()
        
        // 设置默认选择
        this.setDefaultSelections()
        
        // 自动执行查询
        this.fetchData()
      } catch (error) {
        console.error('加载选项数据失败:', error)
        // 即使加载失败，也执行一次查询
        this.fetchData()
      }
    },

    // 设置默认选择
    setDefaultSelections() {
      console.log('开始设置默认选择，当前选项数量:', {
        categoryCount: this.categoryOptions.length,
        supplierCount: this.supplierOptions.length
      })
      
      // // 默认选择第一个品类
      // if (this.categoryOptions.length > 0) {
      //   this.searchForm.category = this.categoryOptions[0].name
      //   console.log('设置默认品类:', this.categoryOptions[0].name)
      // } else {
      //   console.warn('品类选项为空，无法设置默认值')
      // }
      
      // // 默认选择第一个供应商
      // if (this.supplierOptions.length > 0) {
      //   this.searchForm.supplierName = this.supplierOptions[0].dictLabel
      //   console.log('设置默认供应商:', this.supplierOptions[0].dictLabel)
      // } else {
      //   console.warn('供应商选项为空，无法设置默认值')
      // }
      
      console.log('设置默认选择完成:', {
        category: this.searchForm.category,
        supplier: this.searchForm.supplierName
      })
    },

    // 加载品类选项
    async loadCategoryOptions() {
      try {
        const res = await afterCategoryList({ p: 1, l: 100 })
        if (res.code === 200 && res.data) {
          this.categoryOptions = res.data.list || []
          console.log('加载品类选项:', this.categoryOptions.length, '条')
        }
      } catch (error) {
        console.error('获取品类数据失败:', error)
        this.categoryOptions = []
      }
    },


    // 初始化图表
    initCharts() {
      this.supplierChart = echarts.init(this.$refs.supplierChart)
      this.monthlyChart = echarts.init(this.$refs.monthlyChart)
      this.dailyChart = echarts.init(this.$refs.dailyChart)
      
      // 监听窗口大小变化
      window.addEventListener('resize', this.handleResize)
    },
    
    // 处理窗口大小变化
    handleResize() {
 
      if (this.supplierChart) {
        this.supplierChart.resize()
      }
      if (this.monthlyChart) {
        this.monthlyChart.resize()
      }
      if (this.dailyChart) {
        this.dailyChart.resize()
      }
    },
    
    // 获取数据
    async fetchData() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchSupplierData(),
          this.fetchMonthlyData(),
          this.fetchDailyData()
        ])
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },


    
    // 搜索处理
    handleSearch() {
      this.pagination.current = 1
      this.fetchData()
    },
    

    // 获取月份选择器的限制选项 (保留一个通用方法，但现在每个图表独立控制时间)
    getMonthPickerOptions() {
      // 现在每个图表都有独立的时间选择，不需要统一限制
      // 如果需要特定限制，可以在各个图表的处理方法中单独实现
      return {}
    },

    // 重置搜索表单
    handleReset() {
      console.log('开始重置表单')

      // 重置搜索表单字段
      this.searchForm.category = ''
      this.searchForm.supplierName = ''

      console.log('基本字段重置完成，当前表单状态:', { ...this.searchForm })

      // 重置分页并重新获取数据
      this.pagination.current = 1
      this.fetchData()
    },

    // 获取所有数据
    fetchData() {
      this.fetchSupplierData()
      this.fetchMonthlyData()
      this.fetchDailyData()
    },

 
    
    // 获取供应商数据
    async fetchSupplierData() {
      try {
        const params = {
          year: this.searchForm.year,
          month: this.chartMonths.supplier, // 使用独立的月份选择
        }
        
        // 添加筛选参数
        if (this.searchForm.category) {
          params.category = this.searchForm.category
        }
        if (this.searchForm.supplierName) {
          params.supplierName = this.searchForm.supplierName
        }

        const response = await getSupplierReport(params)

        if (response.code === 200 && response.data) {
          const chartData = this.processSupplierChartData(response.data)
          this.updateSupplierChart(chartData)
          this.summaryData.supplierCount = chartData.length

          // 同时处理供应商表格数据
          this.supplierTableData = this.processSupplierTableData(response.data)
        } else {
          this.$message.warning(response.msg || '暂无供应商数据')
          this.updateSupplierChart([])
          this.summaryData.supplierCount = 0
          this.supplierTableData = []
        }
      } catch (error) {
        console.error('获取供应商统计数据失败:', error)
        this.updateSupplierChart([])
        this.summaryData.supplierCount = 0
        this.supplierTableData = []
      }
    },
    
    // 获取每月数据
    async fetchMonthlyData() {
      try {
        const params = {
          year: this.chartYears.monthly // 使用独立的年份选择
        }

        // 添加筛选参数
        if (this.searchForm.category) {
          params.category = this.searchForm.category
        }
        if (this.searchForm.supplierName) {
          params.supplierName = this.searchForm.supplierName
        }

        const response = await getMonthlyReport(params)
        
        if (response.code === 200 && response.data) {
          const monthlyData = this.processMonthlyData(response.data)
          this.updateMonthlyChart(monthlyData)
        } else {
          this.$message.warning(response.msg || '暂无每月数据')
          this.updateMonthlyChart({ dates: [], defectCounts: [], totalCounts: [], defectRates: [] })
        }
      } catch (error) {
        console.error('获取每月数据失败:', error)
        this.updateMonthlyChart({ dates: [], defectCounts: [], totalCounts: [], defectRates: [] })
      }
    },
    
    // 获取每日数据
    async fetchDailyData() {
      if (!this.chartMonths.daily) {
        this.updateDailyChart({ dates: [], defectCounts: [], totalCounts: [], defectRates: [] })
        return
      }
      
      try {
        const params = {
          month: this.chartMonths.daily // 使用独立的月份选择
        }
        
        // 添加筛选参数
        if (this.searchForm.category) {
          params.category = this.searchForm.category
        }
        if (this.searchForm.supplierName) {
          params.supplierName = this.searchForm.supplierName
        }
        
        const response = await getDailyReport(params)
        
        if (response.code === 200 && response.data) {
          const dailyData = this.processDailyData(response.data)
          this.updateDailyChart(dailyData)
        } else {
          this.$message.warning(response.msg || '暂无每日数据')
          this.updateDailyChart({ dates: [], defectCounts: [], totalCounts: [], defectRates: [] })
        }
      } catch (error) {
        console.error('获取每日数据失败:', error)
        this.updateDailyChart({ dates: [], defectCounts: [], totalCounts: [], defectRates: [] })
      }
    },
    
    
    // 获取趋势数据（保留原方法以兼容）
    async fetchTrendData() {
      try {
        const params = {
          year: this.searchForm.year,
          month: this.searchForm.month,
          category: this.searchForm.category,
          supplierName: this.searchForm.supplierName
        }
        
        let response
        if (this.trendType === 'daily') {
          // 每日报表需要月份参数(yyyy-MM格式)
          if (!params.month) {
            this.$message.warning('查看每日趋势需要选择月份')
            this.updateTrendChart({ dates: [], defectCounts: [], totalCounts: [], defectRates: [] })
            return
          }
          // 确保月份格式为yyyy-MM
          const dailyParams = {
            ...params,
            month: params.month // 已经是yyyy-MM格式
          }
          response = await getDailyReport(dailyParams)
        } else {
          // 每月报表需要年份参数
          if (!params.year) {
            this.$message.warning('查看每月趋势需要选择年份')
            this.updateTrendChart({ dates: [], defectCounts: [], totalCounts: [], defectRates: [] })
            return
          }
          response = await getMonthlyReport(params)
        }
        
        if (response.code === 200 && response.data) {
          const trendData = this.processTrendData(response.data)
          this.updateTrendChart(trendData)
        } else {
          this.$message.warning(response.msg || '暂无趋势数据')
          this.updateTrendChart({ dates: [], defectCounts: [], totalCounts: [], defectRates: [] })
        }
      } catch (error) {
        console.error('获取趋势数据失败:', error)
        this.updateTrendChart({ dates: [], defectCounts: [], totalCounts: [], defectRates: [] })
      }
    },
    
    // 处理品类图表数据
    processCategoryChartData(data) {
      if (!Array.isArray(data)) return []
      return data.map(item => ({
        name: item.categoryName || item.category || item.name,
        value: item.defectCount || item.count || item.value || 0,
        rate: item.defectRate || item.rate || 0
      }))
    },

    // 处理供应商图表数据
    processSupplierChartData(data) {
      if (!Array.isArray(data)) return []
      return data.map(item => ({
        name: item.supplierName || item.supplier || item.name,
        value: item.defectCount || item.count || item.value || 0,
        rate: item.defectRate || item.rate || 0
      }))
    },

    // 处理图表数据（保留通用方法）
    processChartData(data) {
      if (!Array.isArray(data)) return []
      return data.map(item => ({
        name: item.categoryName || item.category || item.supplierName || item.name,
        value: item.defectCount || item.count || item.value || 0,
        rate: item.defectRate || item.rate || 0
      }))
    },
    
    // 处理每月数据
    processMonthlyData(data) {
      if (!data || typeof data !== 'object') {
        return {
          dates: [],
          defectCounts: [],
          totalCounts: [],
          defectRates: []
        }
      }
      
      if (data.months && Array.isArray(data.months)) {
        const year = this.chartYears.monthly || new Date().getFullYear()
        const dates = data.months.map(month => `${year}-${month.toString().padStart(2, '0')}`)
        
        // 处理不良率数据，转换为数值
        const defectRates = (data.defectRates || []).map(rate => {
          if (typeof rate === 'string') {
            return parseFloat(rate.replace('%', '')) || 0
          }
          return rate || 0
        })
        
        return {
          dates: dates,
          defectCounts: data.defectCounts || [],
          totalCounts: data.totalCounts || [],
          defectRates: defectRates
        }
      }
      
      return {
        dates: [],
        defectCounts: [],
        totalCounts: [],
        defectRates: []
      }
    },
    
    // 处理每日数据
    processDailyData(data) {
      if (!data || typeof data !== 'object') {
        return {
          dates: [],
          defectCounts: [],
          totalCounts: [],
          defectRates: []
        }
      }
      
      if (data.days && Array.isArray(data.days)) {
        const year = this.searchForm.year || new Date().getFullYear()
        const month = this.chartMonths.daily || `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
        const monthPart = month.split('-')[1]
        
        const dates = data.days.map(day => `${year}-${monthPart}-${day.toString().padStart(2, '0')}`)
        
        // 处理不良率数据，转换为数值
        const defectRates = (data.defectRates || []).map(rate => {
          if (typeof rate === 'string') {
            return parseFloat(rate.replace('%', '')) || 0
          }
          return rate || 0
        })
        
        return {
          dates: dates,
          defectCounts: data.defectCounts || [],
          totalCounts: data.totalCounts || [],
          defectRates: defectRates
        }
      }
      
      return {
        dates: [],
        defectCounts: [],
        totalCounts: [],
        defectRates: []
      }
    },
    
    
    // 处理趋势数据（保留原方法）
    processTrendData(data) {
      if (!data || typeof data !== 'object') {
        return {
          dates: [],
          defectCounts: [],
          totalCounts: [],
          defectRates: [],
          passRates: []
        }
      }
      
      // 处理每日报表数据格式
      if (data.days && Array.isArray(data.days)) {
        const year = this.searchForm.year || new Date().getFullYear()
        const month = this.searchForm.month || `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
        const monthPart = month.split('-')[1]
        
        const dates = data.days.map(day => `${year}-${monthPart}-${day.toString().padStart(2, '0')}`)
        
        // 计算合格率数据
        const defectRates = (data.defectRates || []).map(rate => parseFloat(rate.replace('%', '')))
        const passRates = defectRates.map(rate => 100 - rate)
        
        return {
          dates: dates,
          defectCounts: data.defectCounts || [],
          totalCounts: data.totalCounts || [],
          defectRates: defectRates,
          passRates: passRates
        }
      }
      
      // 处理每月报表数据格式 - 新API格式
      if (data.months && Array.isArray(data.months)) {
        const year = this.searchForm.year || new Date().getFullYear()
        
        // 生成月份标签
        const dates = data.months.map(month => `${year}-${month.toString().padStart(2, '0')}`)
        
        // 重新计算不良率和合格率，基于实际的不良批次和总数量
        const defectCounts = data.defectCounts || []
        const totalCounts = data.totalCounts || []
        
        const defectRates = []
        const passRates = []
        
        for (let i = 0; i < defectCounts.length; i++) {
          const defectCount = defectCounts[i] || 0
          const totalCount = totalCounts[i] || 0
          
          if (totalCount > 0) {
            // 有总数量时，计算实际的不良率和合格率
            const defectRate = (defectCount / totalCount) * 100
            const passRate = ((totalCount - defectCount) / totalCount) * 100
            
            defectRates.push(parseFloat(defectRate.toFixed(2)))
            passRates.push(parseFloat(passRate.toFixed(2)))
          } else {
            // 总数量为0时，不良率和合格率都为0
            defectRates.push(0)
            passRates.push(0)
          }
        }
        
        return {
          dates: dates,
          defectCounts: data.defectCounts || [],
          totalCounts: data.totalCounts || [],
          defectRates: defectRates,
          passRates: passRates
        }
      }
      
      // 兼容旧格式 - 处理每月报表数据格式 (MapOfstringAndListOfobject)
      const dates = []
      const defectCounts = []
      const totalCounts = []
      const defectRates = []
      
      // 遍历data对象的所有key
      Object.keys(data).forEach(key => {
        const items = data[key]
        if (Array.isArray(items)) {
          items.forEach(item => {
            // 根据API响应格式处理数据
            dates.push(item.month || item.date || key)
            defectCounts.push(item.defectCount || item.defects || 0)
            totalCounts.push(item.totalCount || item.total || 0)
            
            // 计算不良率
            const defectCount = item.defectCount || item.defects || 0
            const totalCount = item.totalCount || item.total || 0
            const defectRate = totalCount > 0 ? ((defectCount / totalCount) * 100) : 0
            defectRates.push(parseFloat(defectRate.toFixed(2)))
          })
        }
      })
      
      // 计算合格率数据（100% - 不良率）
      const passRates = defectRates.map(rate => 100 - rate)
      
      return { 
        dates, 
        defectCounts,
        totalCounts,
        defectRates,
        passRates
      }
    },
    
    
    // 处理品类表格数据
    processCategoryTableData(data) {
      if (!Array.isArray(data)) return []
      return data.map(item => ({
        category: item.categoryName || item.category || item.name,
        totalCount: item.totalCount || item.total || 0,
        defectCount: item.defectCount || item.defects || 0,
        defectRate: item.defectRate || (item.defectCount && item.totalCount ?
          ((item.defectCount / item.totalCount) * 100).toFixed(2) : 0),
        updateTime: item.updateTime || item.lastUpdate || new Date()
      }))
    },

    // 处理供应商表格数据
    processSupplierTableData(data) {
      if (!Array.isArray(data)) return []
      return data.map(item => ({
        supplierName: item.supplierName || item.supplier || item.name,
        totalCount: item.totalCount || item.total || 0,
        defectCount: item.defectCount || item.defects || 0,
        defectRate: item.defectRate || (item.defectCount && item.totalCount ?
          ((item.defectCount / item.totalCount) * 100).toFixed(2) : 0),
        updateTime: item.updateTime || item.lastUpdate || new Date()
      }))
    },

    // 处理表格数据（保留通用方法）
    processTableData(data) {
      if (!Array.isArray(data)) return []
      return data.map(item => ({
        category: item.category || item.categoryName || '--',
        supplierName: item.supplierName || item.supplier || '--',
        totalCount: item.totalCount || item.total || 0,
        defectCount: item.defectCount || item.defects || 0,
        defectRate: item.defectRate || (item.defectCount && item.totalCount ? 
          ((item.defectCount / item.totalCount) * 100).toFixed(2) : 0),
        updateTime: item.updateTime || item.lastUpdate || new Date()
      }))
    },
    
    // 更新品类图表（改为柱状图）
    updateCategoryChart(data) {
      const names = data.map(item => item.name)
      const values = data.map(item => item.value)

      const option = {
        title: {
          text: '品类不良统计',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            let tooltip = params[0].axisValueLabel + '<br/>'
            params.forEach(param => {
              tooltip += param.marker + param.seriesName + ': ' + param.value + '批次<br/>'
            })
            return tooltip
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 100,
            bottom: '0%'
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
        yAxis: {
          type: 'value',
          name: '不良批次'
        },
        series: [{
          name: '不良批次',
          type: 'bar',
          data: values,
          itemStyle: {
            color: '#f56c6c'
          },
          emphasis: {
            itemStyle: {
              color: '#e73c3c'
            }
          }
        }]
      }
      
    },
    
    // 更新供应商图表（柱状图）
    updateSupplierChart(data) {
      const names = data.map(item => item.name)
      const values = data.map(item => item.value)

      const option = {
        title: {
          text: '供应商不良统计',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 100,
            bottom: '0%'
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
        yAxis: {
          type: 'value',
          name: '不良批次'
        },
        series: [{
          name: '不良批次',
          type: 'bar',
          data: values,
          itemStyle: {
            color: '#91cc75'
          },
          emphasis: {
            itemStyle: {
              color: '#73a373'
            }
          }
        }]
      }
      
      this.supplierChart.setOption(option)
    },
    
    // 更新每月柱状图表
    updateMonthlyChart(data) {
      const option = {
        title: {
          text: '每月柱状统计',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: function(params) {
            let tooltip = params[0].axisValueLabel + '<br/>'
            params.forEach(param => {
              if (param.seriesName === '不良率') {
                tooltip += param.marker + param.seriesName + ': ' + param.value + '%<br/>'
              } else {
                tooltip += param.marker + param.seriesName + ': ' + param.value + '<br/>'
              }
            })
            return tooltip
          }
        },
        legend: {
          data: ['不良批次', '总数量', '不良率'],
          top: '30px'
        },
        grid: {
          top: '80px',
          left: '60px',
          right: '60px',
          bottom: '70px'
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 100,
            bottom: '0px'
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
          data: data.dates.map(date => {
            const parts = date.split('-')
            return parts.length >= 2 ? parts[1] + '月' : date
          }),
          axisLabel: {
            rotate: 0
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '数量',
            position: 'left',
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '不良率(%)',
            position: 'right',
            axisLabel: {
              formatter: '{value}%'
            },
            max: 100
          }
        ],
        series: [
          {
            name: '不良批次',
            type: 'bar',
            yAxisIndex: 0,
            data: data.defectCounts || [],
            itemStyle: {
              color: '#f56c6c'
            }
          },
          {
            name: '总数量',
            type: 'bar',
            yAxisIndex: 0,
            data: data.totalCounts || [],
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '不良率',
            type: 'line',
            yAxisIndex: 1,
            data: data.defectRates || [],
            smooth: true,
            itemStyle: {
              color: '#67c23a'
            },
            lineStyle: {
              color: '#67c23a',
              width: 2
            }
          }
        ]
      }
      
      this.monthlyChart.setOption(option)
    },
    
    // 更新每日柱状图表
    updateDailyChart(data) {
      const option = {
        title: {
          text: '每日柱状统计',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: function(params) {
            let tooltip = params[0].axisValueLabel + '<br/>'
            params.forEach(param => {
              if (param.seriesName === '不良率') {
                tooltip += param.marker + param.seriesName + ': ' + param.value + '%<br/>'
              } else {
                tooltip += param.marker + param.seriesName + ': ' + param.value + '<br/>'
              }
            })
            return tooltip
          }
        },
        legend: {
          data: ['不良批次', '总数量', '不良率'],
          top: '30px'
        },
        grid: {
          top: '80px',
          left: '60px',
          right: '60px',
          bottom: '70px'
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 100,
            bottom: '0px'
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
          data: data.dates.map(date => {
            const parts = date.split('-')
            return parts.length >= 3 ? parts[2] + '日' : date
          }),
          axisLabel: {
            rotate: 0
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '数量',
            position: 'left',
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '不良率(%)',
            position: 'right',
            axisLabel: {
              formatter: '{value}%'
            },
            max: 100
          }
        ],
        series: [
          {
            name: '不良批次',
            type: 'bar',
            yAxisIndex: 0,
            data: data.defectCounts || [],
            itemStyle: {
              color: '#f56c6c'
            }
          },
          {
            name: '总数量',
            type: 'bar',
            yAxisIndex: 0,
            data: data.totalCounts || [],
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '不良率',
            type: 'line',
            yAxisIndex: 1,
            data: data.defectRates || [],
            smooth: true,
            itemStyle: {
              color: '#67c23a'
            },
            lineStyle: {
              color: '#67c23a',
              width: 2
            }
          }
        ]
      }
      
      this.dailyChart.setOption(option)
    },
    
    
    // 更新趋势图表（保留原方法以兼容）
    updateTrendChart(data) {
      const option = {
        title: {
          text: this.trendType === 'daily' ? '每日不良趋势' : '每月不良趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            let tooltip = params[0].axisValueLabel + '<br/>'
            params.forEach(param => {
              if (param.seriesName === '合格率') {
                tooltip += param.marker + param.seriesName + ': ' + param.value + '%<br/>'
              } else {
                tooltip += param.marker + param.seriesName + ': ' + param.value + '<br/>'
              }
            })
            return tooltip
          }
        },
        legend: {
          data: ['不良批次', '总数量', '合格率'],
          top: '30px'
        },
        grid: {
          top: '80px',
          left: '60px',
          right: '60px',
          bottom: '60px'
        },
        xAxis: {
          type: 'category',
          data: data.dates,
          axisLabel: {
            rotate: 0,
            formatter: (value) => {
              // 根据趋势类型显示不同格式
              if (this.trendType === 'daily') {
                // 每日趋势显示日期
                const parts = value.split('-')
                return parts.length >= 3 ? parts[2] + '日' : value
              } else {
                // 每月趋势显示月份
                const parts = value.split('-')
                return parts.length >= 2 ? parts[1] + '月' : value
              }
            }
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '数量',
            position: 'left',
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '合格率(%)',
            position: 'right',
            axisLabel: {
              formatter: '{value}%'
            }
          }
        ],
        series: [
          {
            name: '不良批次',
            type: 'line',
            yAxisIndex: 0,
            data: data.defectCounts || data.values || [],
            smooth: true,
            itemStyle: {
              color: '#f56c6c'
            },
            lineStyle: {
              color: '#f56c6c'
            }
          },
          {
            name: '总数量',
            type: 'line',
            yAxisIndex: 0,
            data: data.totalCounts || [],
            smooth: true,
            itemStyle: {
              color: '#409EFF'
            },
            lineStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '合格率',
            type: 'line',
            yAxisIndex: 1,
            data: data.passRates || [],
            smooth: true,
            itemStyle: {
              color: '#67c23a'
            },
            lineStyle: {
              color: '#67c23a'
            }
          }
        ]
      }
      
      this.trendChart.setOption(option)
    },
    
    
    // 切换趋势类型
    switchTrend(type) {
      this.trendType = type
      this.fetchTrendData()
    },
    
    
    // 搜索
    handleSearch() {
      this.pagination.current = 1
      this.fetchData()
    },
    
    // 重置（另一个重置方法，保持一致）
    handleReset() {
      // 重置搜索表单字段
      this.searchForm = {
        category: '',
        supplierName: ''
      }

      // 重置分页并重新获取数据
      this.pagination.current = 1
      this.fetchData()
    },
    
    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.size = val
      this.fetchTableData()
    },
    
    // 当前页改变
    handleCurrentChange(val) {
      this.pagination.current = val
      this.fetchTableData()
    },
    
    // 获取不良率样式
    getDefectRateClass(rate) {
      if (rate > 5) return 'high-rate'
      if (rate > 3) return 'medium-rate'
      return 'low-rate'
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return '--'
      return new Date(date).toLocaleString('zh-CN')
    },
    
    // 查看详情
    viewDetail(row) {
      this.$message.info(`查看 ${row.category} - ${row.supplierName} 的详细信息`)
    },
    
    // 导出数据
    exportData() {
      this.$message.success('数据导出功能开发中...')
    },
    
 

    // 供应商图表月份变化处理
    handleSupplierMonthChange() {
      console.log('供应商图表月份变化:', this.chartMonths.supplier)
      // 验证月份是否在当前年份范围内
      if (this.validateMonthInCurrentYear(this.chartMonths.supplier)) {
        this.fetchSupplierData() // 这会同时更新图表和表格数据
      }
    },

    // 每月图表年份变化处理
    handleMonthlyYearChange() {
      console.log('每月图表年份变化:', this.chartYears.monthly)
      this.fetchMonthlyData()
    },

    // 每日图表月份变化处理
    handleDailyMonthChange() {
      console.log('每日图表月份变化:', this.chartMonths.daily)
      // 验证月份是否在当前年份范围内
      if (this.validateMonthInCurrentYear(this.chartMonths.daily)) {
        this.fetchDailyData()
      }
    },
    
    // 验证月份是否有效（简化版本，因为现在每个图表独立控制时间）
    validateMonthInCurrentYear(monthValue) {
      // 现在每个图表都有独立的时间选择，无需统一验证
      // 如果需要特定验证，可以在各个图表的处理方法中单独实现
      return monthValue || new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0')
    }
  }
}
</script>

<style scoped>
.iqc-statistics-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 头部区域样式 */
.header-section {
  flex-shrink: 0;
  margin-bottom: 15px; /* 减少间距 */
  overflow: visible; /* 允许下拉框正常显示 */
}

/* 主体区域样式 - 允许内容超出屏幕并滚动 */
.main-section {
  display: flex;
  flex-direction: column;
}

.iqc-statistics-container .search-section {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.iqc-statistics-container .statistics-cards {
  margin-bottom: 20px;
}

.iqc-statistics-container .stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.iqc-statistics-container .stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.iqc-statistics-container .stat-icon i {
  font-size: 24px;
  color: #fff;
}

.iqc-statistics-container .stat-icon.category-icon {
  background: #5470c6;
}

.iqc-statistics-container .stat-icon.supplier-icon {
  background: #91cc75;
}

.iqc-statistics-container .stat-icon.defect-icon {
  background: #fac858;
}

.iqc-statistics-container .stat-icon.rate-icon {
  background: #ee6666;
}

.iqc-statistics-container .stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.iqc-statistics-container .stat-label {
  font-size: 14px;
  color: #909399;
}

.iqc-statistics-container .charts-section {
  display: flex;
  gap: 20px;
  flex-direction: column;
}

.iqc-statistics-container .chart-row {
  
  display: flex;
  min-height: 400px; /* 设置最小高度 */
}

.iqc-statistics-container .chart-row:last-child {
  margin-bottom: 0;
}

.iqc-statistics-container .chart-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 0; /* 移除padding，让子元素控制间距 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.iqc-statistics-container .chart-card h3 {
  margin: 0 0 15px 0; /* 减少下边距 */
  color: #303133;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px; /* 减少下padding */
}

.iqc-statistics-container .chart-container {
  height: 300px;
}

.iqc-statistics-container .chart-container-large {
  width: 100%;
  height: 50vh; /* 每个图表占视口高度的50% */
}

.iqc-statistics-container .chart-card-large {
  height: calc(50vh + 60px); /* 图表高度 + 标题和内边距 */
}

/* Element UI 列样式优化 */
.iqc-statistics-container .el-col {
  display: flex;
  flex-direction: column;
  min-height: 0; /* 防止子元素撑开父级高度 */
}

.iqc-statistics-container .chart-container-medium {
  width: 100%;
  flex: 1; /* 继承父级剩余高度 */
}

.iqc-statistics-container .chart-card-medium {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 400px; /* 设置最小高度 */
}

/* 图表头部样式 */
.iqc-statistics-container .chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-shrink: 0;
  position: absolute;
  top:0;
  left: 0;
  width: 100%;
  z-index:1;
  padding:10px 20px;
}

.iqc-statistics-container .chart-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.iqc-statistics-container .chart-card-medium h3 {
  margin: 0 0 15px 0; /* 减少下边距 */
  flex-shrink: 0;
}

.iqc-statistics-container .chart-container-medium {
 
  flex: 1;
  min-height: 300px; /* 调整最小高度，为头部预留空间 */
  padding: 10px; /* 添加内边距 */
}

 

.iqc-statistics-container .table-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.iqc-statistics-container .table-header h3 {
  margin: 0;
  color: #303133;
}

.iqc-statistics-container .pagination {
  padding: 20px;
  text-align: right;
}

.iqc-statistics-container .high-rate {
  color: #f56c6c;
  font-weight: bold;
}

.iqc-statistics-container .medium-rate {
  color: #e6a23c;
  font-weight: bold;
}

.iqc-statistics-container .low-rate {
  color: #67c23a;
  font-weight: bold;
}

/* 统一查询表单样式 */
/* 搜索区域布局 */

.iqc-statistics-container .search-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.iqc-statistics-container .search-left {
  flex: 1;
}

.iqc-statistics-container .search-right {
  flex-shrink: 0;
  margin-left: 20px;
}

.iqc-statistics-container .unified-search-form,
.iqc-statistics-container .month-form {
  margin: 0;
}

.iqc-statistics-container .month-form .el-form-item {
  margin-bottom: 0;
}

/* 表格区域样式 */
.iqc-statistics-container .table-section {
  border-radius: 8px;
  margin-top: 20px;
}

.iqc-statistics-container .table-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.iqc-statistics-container .table-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}


.iqc-statistics-container .pagination {
  padding: 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
}

/* 表格容器样式 */
.iqc-statistics-container .table-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.iqc-statistics-container .table-container:last-child {
  margin-bottom: 0;
}
</style>
