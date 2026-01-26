import request from '@/utils/request';

// 获取视觉检测版本列表
export function getVisionVersionList(params) {
    return request({
        url: '/vision/version/manage/list',
        method: 'get',
        params
    });
}
