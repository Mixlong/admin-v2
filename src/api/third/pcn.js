import request from '@/utils/request';

/**
 * 分页查询PCN产品变更通知列表
 */
export function listPcnNotice(query) {
  return request({
    url: '/third/pcn/notice/list',
    method: 'get',
    params: query,
  });
}

/**
 * 获取PCN产品变更通知详情
 */
export function getPcnNoticeInfo(id) {
  return request({
    url: `/third/pcn/notice/info/${id}`,
    method: 'get',
  });
}

/**
 * 新增PCN产品变更通知
 */
export function addPcnNotice(data) {
  return request({
    url: '/third/pcn/notice',
    method: 'post',
    data: data,
  });
}

/**
 * 修改PCN产品变更通知
 */
export function editPcnNotice(data) {
  return request({
    url: '/third/pcn/notice',
    method: 'put',
    data: data,
  });
}

/**
 * 删除PCN产品变更通知
 */
export function deletePcnNotice(id) {
  return request({
    url: `/third/pcn/notice/${id}`,
    method: 'delete',
  });
}

