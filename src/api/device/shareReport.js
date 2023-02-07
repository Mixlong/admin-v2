import request from '@/utils/request';

// 组织人员
export function reportStructure() {
    return request({
        url: '/work/report/structure',
        method: 'get'
    });
}

// 共享报告
export function reportShare(params) {
    return request({
        url: '/work/report/share',
        method: 'get',
        params
    });
}

