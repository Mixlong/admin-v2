import request from '@/utils/request';

//  获取月份
export function reportMonthList(params) {
    return request({
        url: '/work/report/month',
        method: 'get',
        params
    });
}

// 获取每月的周
export function reportWeekList(params) {
    return request({
        url: '/work/report/week',
        method: 'get',
        params
    });
}

// 获取每周时间
export function reportDayList(params) {
    return request({
        url: '/work/report/day',
        method: 'get',
        params
    });
}

// 获取报告内容
export function reportContent(params) {
    return request({
        url: '/work/report',
        method: 'get',
        params
    });
}

// 上传报告
export function uploadReportContent(data) {
    return request({
        url: '/work/report',
        method: 'post',
        data
    });
}

// 修改报告
export function resetReportContent(data) {
    return request({
        url: '/work/report/edit',
        method: 'put',
        data
    });
}

// 获取部门
export function reportDepartment() {
    return request({
        url: '/work/report/department',
        method: 'get'
    });
}

