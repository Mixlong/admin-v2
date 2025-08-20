/**
 * 生产报警管理 API
 */
import request from '@/utils/request'

// API错误处理包装器
const handleApiCall = (apiCall) => {
    return apiCall.catch(error => {
        console.error('Production Alerts API Error:', error)
        throw error
    })
}

// 分页查询生产报警信息
export function getProductionAlertsList(params) {
    return handleApiCall(request({
        url: '/production/alerts/list',
        method: 'get',
        params: {
            p: params.p || 1,
            l: params.l || 20,
            ...params
        }
    }))
}

// 获取生产报警信息详情
export function getProductionAlertById(id) {
    if (!id) {
        return Promise.reject(new Error('Alert ID is required'))
    }
    return handleApiCall(request({
        url: `/production/alerts/${id}`,
        method: 'get'
    }))
}

// 创建生产报警信息
export function createProductionAlert(data) {
    if (!data || !data.workOrderNo || !data.categoryName || !data.computerName || !data.problemDesc) {
        return Promise.reject(new Error('Required fields are missing'))
    }
    return handleApiCall(request({
        url: '/production/alerts',
        method: 'post',
        data: {
            ...data,
            createdTime: new Date().toISOString()
        }
    }))
}

// 更新生产报警信息
export function updateProductionAlert(data) {
    return request({
        url: '/production/alerts',
        method: 'put',
        data
    })
}

// 删除生产报警信息
export function deleteProductionAlert(id) {
    return request({
        url: `/production/alerts/${id}`,
        method: 'delete'
    })
}

// 批量删除生产报警信息
export function batchDeleteProductionAlerts(ids) {
    return request({
        url: '/production/alerts/logicDelete/batch',
        method: 'put',
        params: {
            ids: ids
        }
    })
}

// 批量逻辑删除生产报警信息
export function batchLogicDeleteProductionAlerts(ids) {
    return request({
        url: '/production/alerts/logicDelete/batch',
        method: 'put',
        data: ids
    })
}

// 逻辑删除生产报警信息
export function logicDeleteProductionAlert(id) {
    return request({
        url: `/production/alerts/logicDelete/${id}`,
        method: 'put',
        data: id
    })
}

// 开始处理报警
export function startProcessAlert(id, processName) {
    return request({
        url: '/production/alerts/startProcess',
        method: 'put',
        params: {
            id
        }
    })
}

// 完成处理报警
export function completeProcessAlert(id) {
    return request({
        url: '/production/alerts/completeProcess',
        method: 'put',
        params: {
            id
        }
    })
}

// 更新处理状态
export function updateProcessType(id, processType) {
    return request({
        url: '/production/alerts/processType',
        method: 'put',
        data: {
            id,
            processType
        }
    })
}

// 验证处理结果
export function verifyProcessResult(id, type) {
    return request({
        url: '/production/alerts/verifyProcess',
        method: 'put',
        params: {
            id,
            type // 1.验证完成 2.验证不通过重新处理
        }
    })
}

// 获取实时处理时长
export function getProcessDuration(id) {
    return request({
        url: `/production/alerts/duration/${id}`,
        method: 'get'
    })
}

// 根据处理人查询生产报警信息
export function getAlertsByProcessName(processName) {
    return request({
        url: `/production/alerts/processName/${processName}`,
        method: 'get'
    })
}

// 根据处理状态查询生产报警信息
export function getAlertsByProcessType(processType) {
    return request({
        url: `/production/alerts/processType/${processType}`,
        method: 'get'
    })
}

// 根据工单号查询生产报警信息
export function getAlertsByWorkOrder(workOrderNo) {
    return request({
        url: `/production/alerts/workOrder/${workOrderNo}`,
        method: 'get'
    })
}

// 生产大屏报警消息列表（只展示待处理跟处理中的数据）
export function getLargeScreenAlerts() {
    return request({
        url: '/production/alerts/large/screen',
        method: 'get'
    })
}

// 处理状态枚举
export const PROCESS_STATUS = {
    NO_PROCESSING: 0,      // 无需处理
    PENDING: 1,            // 待处理
    IN_PROGRESS: 2,        // 处理中
    PROCESSED_AWAITING: 3, // 已处理待验证
    VERIFIED: 4            // 已完成
}

// 处理状态标签映射
export const PROCESS_STATUS_LABELS = {
    [PROCESS_STATUS.NO_PROCESSING]: '无需处理',
    [PROCESS_STATUS.PENDING]: '待处理',
    [PROCESS_STATUS.IN_PROGRESS]: '处理中',
    [PROCESS_STATUS.PROCESSED_AWAITING]: '已处理待验证',
    [PROCESS_STATUS.VERIFIED]: '已完成'
}

// 验证类型枚举
export const VERIFY_TYPE = {
    COMPLETE: 1,    // 验证完成
    REJECT: 2       // 验证不通过重新处理
}

// 获取当日生产计划工单号列表（用于工单号自动完成）
export function getTodayOrderCodes() {
    return handleApiCall(request({
        url: '/production/alerts/production/plan/today/orderCode',
        method: 'get'
    }))
}