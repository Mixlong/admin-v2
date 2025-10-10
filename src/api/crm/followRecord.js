import request from '@/utils/request'

/**
 * 跟进记录管理API
 */

// 新增跟进记录
export function addFollowRecord(data) {
  return request({
    url: '/third/follow/record',
    method: 'post',
    data
  })
}

// 修改跟进记录
export function updateFollowRecord(data) {
  return request({
    url: '/third/follow/record',
    method: 'put',
    data
  })
}

// 根据联系人ID获取跟进记录列表
export function getFollowRecordsByContactId(contactId) {
  return request({
    url: `/third/follow/record/contact/${contactId}`,
    method: 'get'
  })
}

// 根据客户ID获取跟进记录列表
export function getFollowRecordsByCustomerId(customerId) {
  return request({
    url: `/third/follow/record/customer/${customerId}`,
    method: 'get'
  })
}

// 获取跟进记录详情
export function getFollowRecordDetail(id) {
  return request({
    url: `/third/follow/record/info/${id}`,
    method: 'get'
  })
}

// 分页查询跟进记录列表
export function getFollowRecordList(params) {
  return request({
    url: '/third/follow/record/list',
    method: 'get',
    params: {
      p: params.pageNum || 1,
      l: params.pageSize || 10,
      customerId: params.customerId,
      contactId: params.contactId,
      followMethod: params.followMethod,
      follower: params.follower
    }
  })
}

// 删除跟进记录
export function deleteFollowRecord(ids) {
  return request({
    url: `/third/follow/record/${ids}`,
    method: 'delete'
  })
}
