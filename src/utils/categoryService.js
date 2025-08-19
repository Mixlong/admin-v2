/**
 * 品类数据管理服务
 * 统一管理品类和型号数据，避免重复请求
 */
import { categoryComputerDict } from '@/api/third/fileConfig'
import { getCategoryThirdList } from '@/api/smartScreen'

class CategoryService {
  constructor() {
    this.categoryData = null
    this.computerData = null
    this.loading = false
    this.loadPromise = null
    this.lastUpdateTime = null
    this.cacheTimeout = 5 * 60 * 1000 // 5分钟缓存
  }

  /**
   * 获取品类和型号数据
   * @returns {Promise<{categories: Array, computers: Array}>}
   */
  async getCategoryData() {
    // 如果正在加载，返回同一个Promise
    if (this.loading && this.loadPromise) {
      return this.loadPromise
    }

    // 检查缓存是否有效
    if (this.isCacheValid()) {
      return {
        categories: this.categoryData || [],
        computers: this.computerData || []
      }
    }

    // 开始加载数据
    this.loading = true
    this.loadPromise = this.loadCategoryData()

    try {
      const result = await this.loadPromise
      this.loading = false
      this.loadPromise = null
      return result
    } catch (error) {
      this.loading = false
      this.loadPromise = null
      throw error
    }
  }

  /**
   * 加载品类数据（新旧接口并行）
   */
  async loadCategoryData() {
    try {
      // 并行调用新旧两个接口
      const [newCategoryResponse, oldCategoryResponse] = await Promise.allSettled([
        getCategoryThirdList(),
        categoryComputerDict()
      ])

      const categories = []
      const computers = []
      const categoryMap = new Map()
      const computerMap = new Map()

      // 处理新接口数据（品类列表）
      if (newCategoryResponse.status === 'fulfilled' && 
          newCategoryResponse.value.code === 200 && 
          Array.isArray(newCategoryResponse.value.data)) {
        
        newCategoryResponse.value.data.forEach(category => {
          const categoryItem = {
            id: category.id,
            name: category.name,
            desc: category.desc,
            status: category.status,
            createTime: category.createTime,
            updateTime: category.updateTime,
            productType: category.productType
          }
          categories.push(categoryItem)
          categoryMap.set(category.id, categoryItem)
        })
      }

      // 处理旧接口数据（品类+型号）
      if (oldCategoryResponse.status === 'fulfilled' && 
          oldCategoryResponse.value.code === 200 && 
          Array.isArray(oldCategoryResponse.value.data)) {
        
        oldCategoryResponse.value.data.forEach(category => {
          // 如果新接口没有这个品类，从旧接口补充
          if (!categoryMap.has(category.id)) {
            const categoryItem = {
              id: category.id,
              name: category.name,
              desc: category.desc || '',
              status: category.status || 0,
              createTime: category.createTime || '',
              updateTime: category.updateTime || '',
              productType: category.productType || 1
            }
            categories.push(categoryItem)
            categoryMap.set(category.id, categoryItem)
          }

          // 处理型号数据
          if (category.computerList && Array.isArray(category.computerList)) {
            category.computerList.forEach(computer => {
              const computerItem = {
                id: computer.id,
                model: computer.model,
                name: computer.name,
                categoryId: category.id,
                categoryName: category.name
              }
              computers.push(computerItem)
              computerMap.set(computer.model, computerItem)
            })
          }
        })
      }

      // 缓存数据
      this.categoryData = categories
      this.computerData = computers
      this.lastUpdateTime = Date.now()

      return {
        categories: this.categoryData,
        computers: this.computerData
      }

    } catch (error) {
      console.error('加载品类数据失败:', error)
      
      // 降级处理：仅使用旧接口
      try {
        const response = await categoryComputerDict()
        if (response.code === 200 && Array.isArray(response.data)) {
          const categories = []
          const computers = []

          response.data.forEach(category => {
            categories.push({
              id: category.id,
              name: category.name,
              desc: category.desc || '',
              status: category.status || 0,
              createTime: category.createTime || '',
              updateTime: category.updateTime || '',
              productType: category.productType || 1
            })

            if (category.computerList && Array.isArray(category.computerList)) {
              category.computerList.forEach(computer => {
                computers.push({
                  id: computer.id,
                  model: computer.model,
                  name: computer.name,
                  categoryId: category.id,
                  categoryName: category.name
                })
              })
            }
          })

          this.categoryData = categories
          this.computerData = computers
          this.lastUpdateTime = Date.now()

          return {
            categories: this.categoryData,
            computers: this.computerData
          }
        }
      } catch (fallbackError) {
        console.error('降级获取品类数据也失败:', fallbackError)
        throw fallbackError
      }

      throw error
    }
  }

  /**
   * 检查缓存是否有效
   */
  isCacheValid() {
    if (!this.categoryData || !this.lastUpdateTime) {
      return false
    }
    return (Date.now() - this.lastUpdateTime) < this.cacheTimeout
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.categoryData = null
    this.computerData = null
    this.lastUpdateTime = null
  }

  /**
   * 根据品类名称获取对应的型号列表
   * @param {string} categoryName 品类名称
   * @returns {Array} 型号列表
   */
  getComputersByCategory(categoryName) {
    if (!this.computerData) {
      return []
    }
    return this.computerData.filter(computer => computer.categoryName === categoryName)
  }

  /**
   * 根据品类ID获取品类信息
   * @param {string} categoryId 品类ID
   * @returns {Object|null} 品类信息
   */
  getCategoryById(categoryId) {
    if (!this.categoryData) {
      return null
    }
    return this.categoryData.find(category => category.id === categoryId) || null
  }

  /**
   * 根据型号ID获取型号信息
   * @param {string} model 型号ID
   * @returns {Object|null} 型号信息
   */
  getComputerByModel(model) {
    if (!this.computerData) {
      return null
    }
    return this.computerData.find(computer => computer.model === model) || null
  }

  /**
   * 获取格式化的下拉选项数据
   * @returns {Promise<{categoryOptions: Array, computerOptions: Array}>}
   */
  async getFormattedOptions() {
    const { categories, computers } = await this.getCategoryData()
    
    const categoryOptions = categories.map(category => ({
      label: category.name,
      value: category.name,
      id: category.id
    }))

    const computerOptions = computers.map(computer => ({
      label: computer.name,
      value: computer.name,
      model: computer.model,
      categoryName: computer.categoryName,
      categoryId: computer.categoryId
    }))

    return {
      categoryOptions,
      computerOptions
    }
  }
}

// 创建单例实例
const categoryService = new CategoryService()

export default categoryService