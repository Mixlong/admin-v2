import request from '@/utils/request';

export function saleList(query) {
    return request({
        url: '/sale/list',
        method: 'get',
        params: query,
    });
}

export function saleDetail(query) {
    return request({
        url: '/sale/detail/' + query,
        method: 'get',
        params: query,
    });
}

export function saleAuth(query) {
    return request({
        url: '/sale/auth/',
        method: 'put',
        data: query,
    });
}

// export function saleUpdate(query) {
//     return request({
//         url: '/sale',
//         method: 'put',
//         data: query,
//     });
// }

export function saleAdd(query) {
    return request({
        url: '/sale',
        method: 'post',
        data: query,
    });
}

export function saleState(query) {
    return request({
        url: '/sale/state',
        method: 'put',
        data: query,
    });
}


// 售后支持
export function afterList(params) {
    return request({
        url: '/after/list',
        method: 'get',
        params
    });
}

// 新增
export function saleSave(data) {
    return request({
        url: '/after/save',
        method: 'post',
        data
    });
}

// 修改
export function saleUpdate(data) {
    return request({
        url: '/after/update',
        method: 'put',
        data
    });
}

// 删除
export function saleDelete(data) {
    return request({
        url: '/after/delete',
        method: 'delete',
        data
    })
}

// 详情
export function afterInfo(detailId) {
    return request({
        url: `/after/info/${detailId}`,
        method: 'get'
    });
}

// 处理
export function afterHandle(data) {
    return request({
        url: '/after/handle',
        method: 'put',
        data
    });
}

export function saleExport(params) {
    return request({
        url: '/after/export',
        method: 'get',
        params
    });
}

// 处理进展
export function afterHandleDetail(afterSaleId) {
    return request({
        url: `/after/handle/detail/${afterSaleId}`,
        method: 'get'
    });
}

// 统计表 --- 当前状态
export function afterStatusList() {
    return request({
        url: "/after/status/list",
        method: "get"
    })
}
// 统计表 --- 不良分布
export function afterBadList() {
    return request({
        url: "/after/bad/list",
        method: "get"
    })
}
// 统计表 --- TOP问题排行
export function afterTopList() {
    return request({
        url: "/after/top/list",
        method: "get"
    })
}

export function afterSearch(params) {
    return request({
        url: "/after/search",
        method: "get",
        params
    })
}


// 品类 （可根据客户id查询）
export function afterCategoryList(params) {
    return request({
        url: "/after/category/list",
        method: "get",
        params
    })
}

// 售后图表查询 
export function afterResultList(params) {
    return request({
        url: '/after/result/list',
        method: 'get',
        params
    });
}

// 批量物流信息输入
export function afterLogistics(data) {
    return request({
        url: '/after/logistics',
        method: 'put',
        data
    });
}