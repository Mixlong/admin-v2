import * as alertsApi from '@/api/production-management/alerts'
import request from '@/utils/request'

// Mock request utility
jest.mock('@/utils/request')

describe('生产报警API测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基础CRUD操作', () => {
    test('获取报警列表', async () => {
      const mockResponse = {
        code: 200,
        data: {
          list: [{ id: '1', workOrderNo: 'WO001' }],
          total: 1
        }
      }
      request.mockResolvedValue(mockResponse)

      const params = { p: 1, l: 20 }
      const result = await alertsApi.getProductionAlertsList(params)

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts/list',
        method: 'get',
        params: { p: 1, l: 20 }
      })
      expect(result).toEqual(mockResponse)
    })

    test('获取报警详情', async () => {
      const mockResponse = {
        code: 200,
        data: { id: '1', workOrderNo: 'WO001' }
      }
      request.mockResolvedValue(mockResponse)

      const result = await alertsApi.getProductionAlertById('1')

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts/1',
        method: 'get'
      })
      expect(result).toEqual(mockResponse)
    })

    test('创建报警', async () => {
      const mockResponse = { code: 200, data: { id: '1' } }
      request.mockResolvedValue(mockResponse)

      const alertData = {
        workOrderNo: 'WO001',
        categoryName: 'electronics',
        problemDesc: '设备故障'
      }

      const result = await alertsApi.createProductionAlert(alertData)

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts',
        method: 'post',
        data: expect.objectContaining(alertData)
      })
      expect(result).toEqual(mockResponse)
    })

    test('更新报警', async () => {
      const mockResponse = { code: 200, data: true }
      request.mockResolvedValue(mockResponse)

      const alertData = { id: '1', problemDesc: '更新的问题描述' }
      const result = await alertsApi.updateProductionAlert(alertData)

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts',
        method: 'put',
        data: alertData
      })
      expect(result).toEqual(mockResponse)
    })

    test('删除报警', async () => {
      const mockResponse = { code: 200, data: true }
      request.mockResolvedValue(mockResponse)

      const result = await alertsApi.deleteProductionAlert('1')

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts/1',
        method: 'delete'
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('批量操作', () => {
    test('批量删除报警', async () => {
      const mockResponse = { code: 200, data: true }
      request.mockResolvedValue(mockResponse)

      const ids = '1,2,3'
      const result = await alertsApi.batchDeleteProductionAlerts(ids)

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts/batch',
        method: 'delete',
        data: ids
      })
      expect(result).toEqual(mockResponse)
    })

    test('批量逻辑删除报警', async () => {
      const mockResponse = { code: 200, data: true }
      request.mockResolvedValue(mockResponse)

      const ids = '1,2,3'
      const result = await alertsApi.batchLogicDeleteProductionAlerts(ids)

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts/logicDelete/batch',
        method: 'put',
        data: ids
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('处理流程操作', () => {
    test('开始处理报警', async () => {
      const mockResponse = { code: 200, data: true }
      request.mockResolvedValue(mockResponse)

      const result = await alertsApi.startProcessAlert('1', 'processor')

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts/startProcess',
        method: 'put',
        data: { id: '1', processName: 'processor' }
      })
      expect(result).toEqual(mockResponse)
    })

    test('完成处理报警', async () => {
      const mockResponse = { code: 200, data: true }
      request.mockResolvedValue(mockResponse)

      const result = await alertsApi.completeProcessAlert('1')

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts/completeProcess',
        method: 'put',
        data: '1'
      })
      expect(result).toEqual(mockResponse)
    })

    test('验证处理结果', async () => {
      const mockResponse = { code: 200, data: true }
      request.mockResolvedValue(mockResponse)

      const result = await alertsApi.verifyProcessResult('1', 1)

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts/verifyProcess',
        method: 'put',
        data: { id: '1', type: 1 }
      })
      expect(result).toEqual(mockResponse)
    })

    test('更新处理状态', async () => {
      const mockResponse = { code: 200, data: true }
      request.mockResolvedValue(mockResponse)

      const result = await alertsApi.updateProcessType('1', 2)

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts/processType',
        method: 'put',
        data: { id: '1', processType: 2 }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('查询操作', () => {
    test('根据处理人查询', async () => {
      const mockResponse = {
        code: 200,
        data: [{ id: '1', processName: 'processor' }]
      }
      request.mockResolvedValue(mockResponse)

      const result = await alertsApi.getAlertsByProcessName('processor')

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts/processName/processor',
        method: 'get'
      })
      expect(result).toEqual(mockResponse)
    })

    test('根据处理状态查询', async () => {
      const mockResponse = {
        code: 200,
        data: [{ id: '1', processType: 1 }]
      }
      request.mockResolvedValue(mockResponse)

      const result = await alertsApi.getAlertsByProcessType(1)

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts/processType/1',
        method: 'get'
      })
      expect(result).toEqual(mockResponse)
    })

    test('根据工单号查询', async () => {
      const mockResponse = {
        code: 200,
        data: [{ id: '1', workOrderNo: 'WO001' }]
      }
      request.mockResolvedValue(mockResponse)

      const result = await alertsApi.getAlertsByWorkOrder('WO001')

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts/workOrder/WO001',
        method: 'get'
      })
      expect(result).toEqual(mockResponse)
    })

    test('获取大屏报警数据', async () => {
      const mockResponse = {
        code: 200,
        data: [{ id: '1', processType: 1 }]
      }
      request.mockResolvedValue(mockResponse)

      const result = await alertsApi.getLargeScreenAlerts()

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts/large/Screen',
        method: 'get'
      })
      expect(result).toEqual(mockResponse)
    })

    test('获取实时处理时长', async () => {
      const mockResponse = {
        code: 200,
        data: '2小时30分钟'
      }
      request.mockResolvedValue(mockResponse)

      const result = await alertsApi.getProcessDuration('1')

      expect(request).toHaveBeenCalledWith({
        url: '/production/alerts/duration/1',
        method: 'get'
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('错误处理', () => {
    test('API调用失败时的错误处理', async () => {
      const error = new Error('Network Error')
      request.mockRejectedValue(error)

      await expect(alertsApi.getProductionAlertsList({}))
        .rejects.toThrow('Network Error')
    })

    test('创建报警时缺少必要字段', async () => {
      const invalidData = { workOrderNo: '' }
      
      await expect(alertsApi.createProductionAlert(invalidData))
        .rejects.toThrow('Required fields are missing')
    })

    test('获取详情时ID为空', async () => {
      await expect(alertsApi.getProductionAlertById(''))
        .rejects.toThrow('Alert ID is required')
    })
  })

  describe('常量和枚举', () => {
    test('处理状态常量', () => {
      expect(alertsApi.PROCESS_STATUS.NO_PROCESSING).toBe(0)
      expect(alertsApi.PROCESS_STATUS.PENDING).toBe(1)
      expect(alertsApi.PROCESS_STATUS.IN_PROGRESS).toBe(2)
      expect(alertsApi.PROCESS_STATUS.PROCESSED_AWAITING).toBe(3)
      expect(alertsApi.PROCESS_STATUS.VERIFIED).toBe(4)
    })

    test('处理状态标签', () => {
      expect(alertsApi.PROCESS_STATUS_LABELS[0]).toBe('无需处理')
      expect(alertsApi.PROCESS_STATUS_LABELS[1]).toBe('待处理')
      expect(alertsApi.PROCESS_STATUS_LABELS[2]).toBe('处理中')
      expect(alertsApi.PROCESS_STATUS_LABELS[3]).toBe('已处理待验证')
      expect(alertsApi.PROCESS_STATUS_LABELS[4]).toBe('已验证')
    })

    test('验证类型常量', () => {
      expect(alertsApi.VERIFY_TYPE.COMPLETE).toBe(1)
      expect(alertsApi.VERIFY_TYPE.REJECT).toBe(2)
    })
  })
})