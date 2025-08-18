import { shallowMount, createLocalVue } from '@vue/test-utils'
import ElementUI from 'element-ui'
import Vuex from 'vuex'
import ProductionAlerts from '@/views/production-management/alerts/index.vue'
import AlertForm from '@/views/production-management/alerts/components/AlertForm.vue'
import ProcessDialog from '@/views/production-management/alerts/components/ProcessDialog.vue'
import VerifyDialog from '@/views/production-management/alerts/components/VerifyDialog.vue'
import * as alertsApi from '@/api/production-management/alerts'

// 创建本地Vue实例
const localVue = createLocalVue()
localVue.use(ElementUI)
localVue.use(Vuex)

// Mock API
jest.mock('@/api/production-management/alerts')

describe('生产报警管理组件测试', () => {
  let wrapper
  let store
  let mockStore

  beforeEach(() => {
    // 创建mock store
    mockStore = {
      getters: {
        name: 'testUser',
        roles: ['admin']
      }
    }
    
    store = new Vuex.Store(mockStore)

    // Mock API响应
    alertsApi.getProductionAlertsList.mockResolvedValue({
      code: 200,
      data: {
        list: [
          {
            id: '1',
            workOrderNo: 'WO202401001',
            categoryName: '电子产品',
            computerName: 'Model-A001',
            problemDesc: '设备故障',
            processType: 1,
            reporter: '张三',
            responsible: '李四',
            processName: '',
            createdTime: '2024-01-15 10:00:00'
          }
        ],
        total: 1
      }
    })

    wrapper = shallowMount(ProductionAlerts, {
      localVue,
      store,
      stubs: {
        'el-table': true,
        'el-pagination': true,
        'el-form': true,
        'el-button': true
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
    jest.clearAllMocks()
  })

  describe('主组件测试', () => {
    test('组件正确渲染', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm.$options.name).toBe('ProductionAlerts')
    })

    test('初始化数据正确', () => {
      expect(wrapper.vm.tableData).toEqual([])
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.pagination).toEqual({
        current: 1,
        size: 20,
        total: 0
      })
    })

    test('获取数据功能', async () => {
      await wrapper.vm.fetchData()
      
      expect(alertsApi.getProductionAlertsList).toHaveBeenCalled()
      expect(wrapper.vm.tableData).toHaveLength(1)
      expect(wrapper.vm.pagination.total).toBe(1)
    })

    test('搜索功能', async () => {
      wrapper.vm.searchForm.workOrderNo = 'WO202401001'
      await wrapper.vm.handleSearch()
      
      expect(alertsApi.getProductionAlertsList).toHaveBeenCalledWith(
        expect.objectContaining({
          workOrderNo: 'WO202401001'
        })
      )
    })

    test('重置搜索功能', () => {
      wrapper.vm.searchForm.workOrderNo = 'test'
      wrapper.vm.handleReset()
      
      expect(wrapper.vm.searchForm.workOrderNo).toBe('')
      expect(wrapper.vm.pagination.current).toBe(1)
    })

    test('分页功能', async () => {
      await wrapper.vm.handleCurrentChange(2)
      expect(wrapper.vm.pagination.current).toBe(2)
      
      await wrapper.vm.handleSizeChange(50)
      expect(wrapper.vm.pagination.size).toBe(50)
      expect(wrapper.vm.pagination.current).toBe(1) // 应该重置到第一页
    })

    test('状态标签显示', () => {
      expect(wrapper.vm.getProcessTypeLabel(1)).toBe('待处理')
      expect(wrapper.vm.getProcessTypeLabel(2)).toBe('处理中')
      expect(wrapper.vm.getProcessTypeLabel(4)).toBe('已验证')
    })

    test('状态颜色映射', () => {
      expect(wrapper.vm.getProcessTypeColor(1)).toBe('warning')
      expect(wrapper.vm.getProcessTypeColor(2)).toBe('primary')
      expect(wrapper.vm.getProcessTypeColor(4)).toBe('success')
    })

    test('权限检查', () => {
      const row = { processType: 1 }
      expect(wrapper.vm.canProcess(row)).toBe(true)
      
      const verifyRow = { processType: 3 }
      expect(wrapper.vm.canVerify(verifyRow)).toBe(true)
    })
  })

  describe('错误处理测试', () => {
    test('API错误处理', async () => {
      const errorResponse = { code: 500, msg: '服务器错误' }
      alertsApi.getProductionAlertsList.mockResolvedValue(errorResponse)
      
      const spy = jest.spyOn(wrapper.vm, 'handleApiError')
      await wrapper.vm.fetchData()
      
      expect(spy).toHaveBeenCalledWith(errorResponse, '获取数据失败')
    })

    test('网络错误处理', async () => {
      const networkError = new Error('Network Error')
      alertsApi.getProductionAlertsList.mockRejectedValue(networkError)
      
      const spy = jest.spyOn(wrapper.vm, 'handleNetworkError')
      await wrapper.vm.fetchData()
      
      expect(spy).toHaveBeenCalledWith(networkError, '获取报警数据失败')
    })
  })

  describe('用户交互测试', () => {
    test('新增报警', () => {
      wrapper.vm.handleAdd()
      expect(wrapper.vm.currentEditData).toBeNull()
      expect(wrapper.vm.alertFormVisible).toBe(true)
    })

    test('编辑报警', () => {
      const testData = { id: '1', workOrderNo: 'WO001' }
      wrapper.vm.handleEdit(testData)
      expect(wrapper.vm.currentEditData).toEqual(testData)
      expect(wrapper.vm.alertFormVisible).toBe(true)
    })

    test('查看详情', () => {
      const testData = { id: '1', workOrderNo: 'WO001' }
      wrapper.vm.handleView(testData)
      expect(wrapper.vm.currentDetailData).toEqual(testData)
      expect(wrapper.vm.detailDialogVisible).toBe(true)
    })

    test('处理报警', () => {
      const testData = { id: '1', processType: 1 }
      wrapper.vm.handleProcess(testData)
      expect(wrapper.vm.currentProcessData).toEqual(testData)
      expect(wrapper.vm.processDialogVisible).toBe(true)
    })

    test('验证报警', () => {
      const testData = { id: '1', processType: 3 }
      wrapper.vm.handleVerify(testData)
      expect(wrapper.vm.currentVerifyData).toEqual(testData)
      expect(wrapper.vm.verifyDialogVisible).toBe(true)
    })
  })
})

describe('报警表单组件测试', () => {
  let wrapper
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        name: 'testUser'
      }
    })

    wrapper = shallowMount(AlertForm, {
      localVue,
      store,
      propsData: {
        visible: true,
        editData: null,
        categoryOptions: [{ label: '电子产品', value: 'electronics' }],
        computerOptions: [{ label: 'Model-A', value: 'model-a' }],
        departmentOptions: [{ label: '生产部', value: 'production' }],
        userOptions: [{ label: '张三', value: 'zhangsan' }]
      },
      stubs: {
        'el-dialog': true,
        'el-form': true,
        'el-form-item': true,
        'el-input': true,
        'el-select': true,
        'el-button': true
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  test('表单组件正确渲染', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.vm.$options.name).toBe('AlertForm')
  })

  test('新增模式', () => {
    expect(wrapper.vm.isEdit).toBe(false)
    expect(wrapper.vm.formData.processType).toBe(1) // 默认待处理
  })

  test('编辑模式', async () => {
    const editData = {
      id: '1',
      workOrderNo: 'WO001',
      categoryName: 'electronics',
      processType: 2
    }
    
    await wrapper.setProps({ editData })
    expect(wrapper.vm.isEdit).toBe(true)
  })

  test('表单验证', () => {
    expect(wrapper.vm.formRules.workOrderNo).toBeDefined()
    expect(wrapper.vm.formRules.categoryName).toBeDefined()
    expect(wrapper.vm.formRules.problemDesc).toBeDefined()
  })

  test('工单号验证', async () => {
    const validator = wrapper.vm.validateWorkOrderNo
    const mockCallback = jest.fn()
    
    // 测试空值
    await validator({}, '', mockCallback)
    expect(mockCallback).toHaveBeenCalledWith()
    
    // 测试格式错误
    await validator({}, 'invalid', mockCallback)
    expect(mockCallback).toHaveBeenCalledWith(expect.any(Error))
    
    // 测试正确格式
    await validator({}, 'WO202401001', mockCallback)
    expect(mockCallback).toHaveBeenCalledWith()
  })
})

describe('处理对话框组件测试', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ProcessDialog, {
      localVue,
      propsData: {
        visible: true,
        alertData: {
          id: '1',
          workOrderNo: 'WO001',
          processType: 1,
          categoryName: '电子产品',
          problemDesc: '设备故障'
        },
        userOptions: [{ label: '张三', value: 'zhangsan' }]
      },
      stubs: {
        'el-dialog': true,
        'el-card': true,
        'el-steps': true,
        'el-form': true,
        'el-button': true
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  test('处理对话框正确渲染', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.vm.$options.name).toBe('ProcessDialog')
  })

  test('对话框标题根据状态变化', () => {
    expect(wrapper.vm.dialogTitle).toBe('开始处理报警')
    
    wrapper.setProps({
      alertData: { ...wrapper.vm.alertData, processType: 2 }
    })
    expect(wrapper.vm.dialogTitle).toBe('处理报警中')
  })

  test('步骤状态计算', () => {
    expect(wrapper.vm.currentStep).toBe(0) // processType 1 对应步骤 0
    
    expect(wrapper.vm.getStepStatus(1)).toBe('process')
    expect(wrapper.vm.getStepStatus(2)).toBe('wait')
  })

  test('状态转换验证', () => {
    expect(wrapper.vm.validateStateTransition(1, 2)).toBe(true)
    expect(wrapper.vm.validateStateTransition(1, 4)).toBe(false) // 不允许直接从待处理到已验证
  })
})

describe('验证对话框组件测试', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(VerifyDialog, {
      localVue,
      propsData: {
        visible: true,
        alertData: {
          id: '1',
          workOrderNo: 'WO001',
          processType: 3,
          processName: '张三',
          processDuration: '2小时'
        },
        userOptions: [{ label: '李四', value: 'lisi' }]
      },
      stubs: {
        'el-dialog': true,
        'el-card': true,
        'el-form': true,
        'el-radio-group': true,
        'el-rate': true,
        'el-button': true
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  test('验证对话框正确渲染', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.vm.$options.name).toBe('VerifyDialog')
  })

  test('验证人信息', () => {
    expect(wrapper.vm.verifierInfo).toBeDefined()
  })

  test('提交条件检查', () => {
    // 默认情况下不能提交（缺少必要信息）
    expect(wrapper.vm.canSubmit).toBe(false)
    
    // 设置必要信息
    wrapper.vm.verifyForm.verifyNote = '验证说明'
    wrapper.vm.verifyForm.checkItems = ['problem_solved']
    expect(wrapper.vm.canSubmit).toBe(true)
  })

  test('验证结果变化处理', () => {
    wrapper.vm.handleResultChange(2) // 不通过
    expect(wrapper.vm.verifyForm.rating).toBe(0)
    expect(wrapper.vm.verifyForm.checkItems).toEqual([])
    
    wrapper.vm.handleResultChange(1) // 通过
    expect(wrapper.vm.verifyForm.rejectReason).toBe('')
  })
})

describe('工具函数测试', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ProductionAlerts, {
      localVue,
      store: new Vuex.Store({
        getters: { name: 'test', roles: [] }
      })
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  test('时间格式化', () => {
    const testDate = '2024-01-15T10:30:00.000Z'
    const formatted = wrapper.vm.formatDateTime(testDate)
    expect(formatted).toMatch(/2024/)
  })

  test('时长解析', () => {
    expect(wrapper.vm.parseDurationToHours('2小时30分钟')).toBe(2)
    expect(wrapper.vm.parseDurationToHours('1天4小时')).toBe(28)
    expect(wrapper.vm.parseDurationToHours('')).toBe(0)
  })

  test('优先级计算', () => {
    const highPriorityAlert = {
      processType: 1,
      createdTime: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() // 25小时前
    }
    expect(wrapper.vm.getPriorityLabel(highPriorityAlert)).toBe('高')
    
    const lowPriorityAlert = {
      processType: 1,
      createdTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2小时前
    }
    expect(wrapper.vm.getPriorityLabel(lowPriorityAlert)).toBe('低')
  })

  test('CSV导出格式化', () => {
    const testData = [
      { 工单号: 'WO001', 问题描述: '测试问题,包含逗号' },
      { 工单号: 'WO002', 问题描述: '正常问题' }
    ]
    
    const csv = wrapper.vm.convertToCSV(testData)
    expect(csv).toContain('工单号,问题描述')
    expect(csv).toContain('"测试问题,包含逗号"') // 包含逗号的值应该被引号包围
  })

  test('状态分布统计', () => {
    wrapper.vm.tableData = [
      { processType: 1 },
      { processType: 1 },
      { processType: 2 },
      { processType: 4 }
    ]
    
    const distribution = wrapper.vm.getStatusDistribution()
    expect(distribution['待处理']).toBe(2)
    expect(distribution['处理中']).toBe(1)
    expect(distribution['已验证']).toBe(1)
  })
})

describe('缓存和性能测试', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ProductionAlerts, {
      localVue,
      store: new Vuex.Store({
        getters: { name: 'test', roles: [] }
      })
    })
  })

  afterEach(() => {
    wrapper.destroy()
    // 清理localStorage和sessionStorage
    localStorage.clear()
    sessionStorage.clear()
  })

  test('用户偏好保存和加载', () => {
    wrapper.vm.saveUserPreference('pageSize', 50)
    wrapper.vm.loadUserPreferences()
    expect(wrapper.vm.pagination.size).toBe(50)
  })

  test('数据缓存', () => {
    const testData = { list: [{ id: '1' }], total: 1 }
    wrapper.vm.cacheData('test', testData)
    
    const cached = wrapper.vm.getCachedData('test')
    expect(cached).toEqual(testData)
  })

  test('缓存过期', (done) => {
    const testData = { test: 'data' }
    wrapper.vm.cacheData('expire_test', testData, 100) // 100ms过期
    
    setTimeout(() => {
      const cached = wrapper.vm.getCachedData('expire_test')
      expect(cached).toBeNull()
      done()
    }, 150)
  })

  test('最佳分页大小计算', () => {
    // Mock window.innerHeight
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000
    })
    
    const optimalSize = wrapper.vm.getOptimalPageSize()
    expect(optimalSize).toBeGreaterThanOrEqual(10)
    expect(optimalSize).toBeLessThanOrEqual(50)
  })
})