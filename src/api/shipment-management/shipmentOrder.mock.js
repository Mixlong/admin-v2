/**
 * 未出货订单管理 Mock 数据
 * 基于 Excel 文件：副本【迪太生产】未出货订单明细表.xlsx
 * 注意：这是临时的 mock 数据文件，后续对接真实接口后可直接删除此文件
 */

// 模拟数据存储 - 基于 Excel 实际数据
let mockData = [
  {
    id: 1,
    customerName: '安乃达',
    u8Available: true,
    u8OrderNo: 'SO2025090066',
    bomCode: '61400359-B-00001',
    etreeBomBefore: '',
    etreeBomAfter: '',
    etreeBomAudited: true,
    configModel: 'L303C5',
    keyModel: 'K30',
    customerOrderNo: '2509120008',
    etreeOrderNo: 'E树SO250900051',
    orderDate: '2025-09-09',
    orderQuantity: 110,
    shippedQuantity: 110,
    unshippedQuantity: 0,
    deliveryPlan: '2025-10-27',
    pmcDeliveryDate: '2025-10-27',
    softwareStatus: '',
    deliveryChangeLog: '10/20：原交期10/18，延期至10/27（按屏交期）',
    customerMaterial: '/',
    customerMaterialArrival: '',
    qrCodeFilmStatus: '',
    nylonShellStatus: '',
    productionStatus: '',
    productionVersion: '',
    productionVersionApp: '',
    productionVersionUi: '',
    specialRemark: '',
    orderDays: 56,
    orderSigned: false,
    createTime: '2025-09-09 10:00:00',
    updateTime: '2025-11-08 14:30:00'
  },
  {
    id: 2,
    customerName: '安乃达',
    u8Available: true,
    u8OrderNo: 'SO2025090066',
    bomCode: '61400359-B-00001',
    etreeBomBefore: '',
    etreeBomAfter: '',
    etreeBomAudited: true,
    configModel: 'L303C5',
    keyModel: 'K30',
    customerOrderNo: '2509120008修补件',
    etreeOrderNo: 'E树SO250900051',
    orderDate: '2025-09-09',
    orderQuantity: 1,
    shippedQuantity: 1,
    unshippedQuantity: 0,
    deliveryPlan: '2025-10-27',
    pmcDeliveryDate: '2025-10-27',
    softwareStatus: '',
    deliveryChangeLog: '10/20：原交期10/18，延期至10/27（按屏交期）',
    customerMaterial: '/',
    customerMaterialArrival: '',
    qrCodeFilmStatus: '',
    nylonShellStatus: '',
    productionStatus: '',
    productionVersion: '',
    productionVersionApp: '',
    productionVersionUi: '',
    specialRemark: '',
    orderDays: 56,
    orderSigned: false,
    createTime: '2025-09-09 10:00:00',
    updateTime: '2025-11-08 14:30:00'
  },
  {
    id: 3,
    customerName: '鑫堡',
    u8Available: true,
    u8OrderNo: 'SO2025040081',
    bomCode: '61400181-B-00005',
    etreeBomBefore: '',
    etreeBomAfter: '',
    etreeBomAudited: true,
    configModel: 'L182EXB2-A',
    keyModel: '',
    customerOrderNo: 'WSB25040777',
    etreeOrderNo: 'E树SO250400054',
    orderDate: '2025-04-01',
    orderQuantity: 200,
    shippedQuantity: 200,
    unshippedQuantity: 0,
    deliveryPlan: '2025-06-03',
    pmcDeliveryDate: '2025-06-03',
    softwareStatus: '',
    deliveryChangeLog: '5/16调整【提前】：原交期6/10 修改为6/3',
    customerMaterial: '',
    customerMaterialArrival: '',
    qrCodeFilmStatus: '',
    nylonShellStatus: '',
    productionStatus: '已出货',
    productionVersion: '',
    productionVersionApp: '',
    productionVersionUi: '',
    specialRemark: '',
    orderDays: 221,
    orderSigned: false,
    createTime: '2025-04-01 09:00:00',
    updateTime: '2025-06-03 16:00:00'
  },
  {
    id: 4,
    customerName: '鸿霖',
    u8Available: true,
    u8OrderNo: 'SO2025030059',
    bomCode: '61400125-D',
    etreeBomBefore: '',
    etreeBomAfter: '',
    etreeBomAudited: true,
    configModel: 'Citra-Share-18',
    keyModel: '',
    customerOrderNo: 'H421-2503130033',
    etreeOrderNo: 'E树SO250300042',
    orderDate: '2025-03-13',
    orderQuantity: 3200,
    shippedQuantity: 0,
    unshippedQuantity: 3200,
    deliveryPlan: '2025-05-06',
    pmcDeliveryDate: '2025-05-06',
    softwareStatus: '',
    deliveryChangeLog: '4/21调整【延后】：原交期4/23 修改为5/6\n3/31调整【延后】：原交期4/14，延期至4/23',
    customerMaterial: '/',
    customerMaterialArrival: '',
    qrCodeFilmStatus: '',
    nylonShellStatus: '',
    productionStatus: '',
    productionVersion: '',
    productionVersionApp: '',
    productionVersionUi: '',
    specialRemark: '',
    orderDays: 240,
    orderSigned: false,
    createTime: '2025-03-13 14:20:00',
    updateTime: '2025-05-06 10:00:00'
  },
  {
    id: 5,
    customerName: '嘉宏',
    u8Available: true,
    u8OrderNo: 'SO2025020030',
    bomCode: '61400186-B-00002',
    etreeBomBefore: '',
    etreeBomAfter: '',
    etreeBomAudited: true,
    configModel: 'BC280SJH21',
    keyModel: '',
    customerOrderNo: 'JH2502250015',
    etreeOrderNo: 'E树SO250200025',
    orderDate: '2025-02-25',
    orderQuantity: 500,
    shippedQuantity: 0,
    unshippedQuantity: 500,
    deliveryPlan: '2025-04-15',
    pmcDeliveryDate: '2025-04-15',
    softwareStatus: '',
    deliveryChangeLog: '',
    customerMaterial: '',
    customerMaterialArrival: '',
    qrCodeFilmStatus: '已导入',
    nylonShellStatus: '',
    productionStatus: '生产中',
    productionVersion: '',
    productionVersionApp: '',
    productionVersionUi: '',
    specialRemark: '嘉宏修补件订单',
    orderDays: 256,
    orderSigned: true,
    createTime: '2025-02-25 11:30:00',
    updateTime: '2025-11-08 09:00:00'
  }
]

// 自增ID
let nextId = 6

// 模拟延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 获取未出货订单列表
 */
export async function getShipmentOrderList(params) {
  await delay()
  
  const { 
    pageNum = 1, 
    pageSize = 10, 
    customerName, 
    configModel, 
    customerOrderNo,
    u8OrderNo,
    bomCode,
    startDate, 
    endDate 
  } = params
  
  // 过滤数据
  let filteredData = [...mockData]
  
  if (customerName) {
    filteredData = filteredData.filter(item => item.customerName && item.customerName.includes(customerName))
  }
  
  if (configModel) {
    filteredData = filteredData.filter(item => item.configModel && item.configModel.includes(configModel))
  }
  
  if (customerOrderNo) {
    filteredData = filteredData.filter(item => item.customerOrderNo && item.customerOrderNo.includes(customerOrderNo))
  }
  
  if (u8OrderNo) {
    filteredData = filteredData.filter(item => item.u8OrderNo && item.u8OrderNo.includes(u8OrderNo))
  }
  
  if (bomCode) {
    filteredData = filteredData.filter(item => item.bomCode && item.bomCode.includes(bomCode))
  }
  
  if (startDate && endDate) {
    filteredData = filteredData.filter(item => {
      return item.orderDate >= startDate && item.orderDate <= endDate
    })
  }
  
  // 分页
  const total = filteredData.length
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  const list = filteredData.slice(start, end)
  
  return {
    code: 200,
    msg: '操作成功',
    data: {
      list,
      total,
      pageNum,
      pageSize
    }
  }
}

/**
 * 获取出货订单详情
 */
export async function getShipmentOrderById(id) {
  await delay()
  
  const item = mockData.find(item => item.id === id)
  
  if (item) {
    return {
      code: 200,
      msg: '操作成功',
      data: item
    }
  }
  
  return {
    code: 404,
    msg: '订单不存在'
  }
}

/**
 * 新增出货订单
 */
export async function addShipmentOrder(data) {
  await delay()
  
  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  
  const newItem = {
    ...data,
    id: nextId++,
    createTime: timeStr,
    updateTime: timeStr
  }
  
  mockData.unshift(newItem)
  
  return {
    code: 200,
    msg: '新增成功',
    data: newItem
  }
}

/**
 * 编辑出货订单
 */
export async function updateShipmentOrder(data) {
  await delay()
  
  const index = mockData.findIndex(item => item.id === data.id)
  
  if (index === -1) {
    return {
      code: 404,
      msg: '订单不存在'
    }
  }
  
  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  
  mockData[index] = {
    ...mockData[index],
    ...data,
    updateTime: timeStr
  }
  
  return {
    code: 200,
    msg: '编辑成功',
    data: mockData[index]
  }
}

/**
 * 删除出货订单
 */
export async function deleteShipmentOrder(ids) {
  await delay()
  
  const idArray = Array.isArray(ids) ? ids : [ids]
  
  mockData = mockData.filter(item => !idArray.includes(item.id))
  
  return {
    code: 200,
    msg: '删除成功'
  }
}

/**
 * 批量删除出货订单
 */
export async function batchDeleteShipmentOrder(ids) {
  return deleteShipmentOrder(ids)
}

/**
 * 获取客户列表（字典）- 基于 Excel 实际客户
 */
export async function getCustomerDict() {
  await delay(100)
  
  return {
    code: 200,
    msg: '操作成功',
    data: [
      { dictCode: '1', dictLabel: '安乃达' },
      { dictCode: '2', dictLabel: '鑫堡' },
      { dictCode: '3', dictLabel: '鸿霖' },
      { dictCode: '4', dictLabel: '嘉宏' },
      { dictCode: '5', dictLabel: 'LIME' },
      { dictCode: '6', dictLabel: '喜德盛' },
      { dictCode: '7', dictLabel: '银三环' },
      { dictCode: '8', dictLabel: '乐骑' },
      { dictCode: '9', dictLabel: '乔博' }
    ]
  }
}

/**
 * 获取订单状态字典
 */
export async function getOrderStatusDict() {
  await delay(100)
  
  return {
    code: 200,
    msg: '操作成功',
    data: [
      { dictCode: '1', dictLabel: '待出货' },
      { dictCode: '2', dictLabel: '部分出货' },
      { dictCode: '3', dictLabel: '已出货' },
      { dictCode: '4', dictLabel: '已取消' }
    ]
  }
}

/**
 * 导出出货订单
 */
export async function exportShipmentOrder(params) {
  await delay()
  
  // Mock 导出功能，实际项目中可以返回真实的 Blob 数据
  console.log('导出参数：', params)
  
  return new Blob(['Mock Excel Data'], { type: 'application/vnd.ms-excel' })
}
