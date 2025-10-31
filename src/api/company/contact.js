import request from '@/utils/request'

/**
 * 分页查询公司联系信息列表
 * @param {Object} params - 查询参数
 * @param {Number} params.p - 页码
 * @param {Number} params.l - 每页大小
 * @param {String} params.companyName - 公司名称
 * @param {String} params.email - 邮箱
 * @param {String} params.contactPerson - 联系人
 * @param {String} params.productType - 生产产品
 */
export function getCompanyContactList(params) {
  return request({
    url: '/company/contact/list',
    method: 'get',
    params
  })
}

/**
 * 新增公司联系信息
 * @param {Object} data - 公司联系信息对象
 */
export function addCompanyContact(data) {
  return request({
    url: '/company/contact/add',
    method: 'post',
    data
  })
}

/**
 * 修改公司联系信息
 * @param {Object} data - 公司联系信息对象
 */
export function updateCompanyContact(data) {
  return request({
    url: '/company/contact/update',
    method: 'put',
    data
  })
}

/**
 * 批量删除公司联系信息
 * @param {Array} ids - 主键ID列表
 */
export function deleteCompanyContact(ids) {
  return request({
    url: '/company/contact/delete',
    method: 'delete',
    data: ids
  })
}
