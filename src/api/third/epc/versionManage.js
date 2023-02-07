
import request from '@/utils/request'

export function listFileConfig(params) {
  return request({
    url: '/project/management/list',
    method: 'get',
    params
  })
}

export function fileVersionList(params) {
  return request({
    url: '/project/management/category/version',
    method: 'get',
    params
  })
}


export function authFileConfig(data) {
  return request({
    url: '/project/management/config/auth',
    method: 'put',
    data: data
  })
}

export function addFileConfig(data) {
  return request({
    url: '/file/config',
    method: 'post',
    data
  })
}

export function editFileConfig(data) {
  return request({
    url: '/project/management/update',
    method: 'put',
    data
  })
}

// 获取文件配置字典
export function computerDictList(params) {
  return request({
    url: '/file/config/dirt',
    method: 'get',
    params
  })
}

// 开发生产数据列表
export function productList(params) {
  return request({
    url: '/production/list',
    method: 'get',
    params
  })
}

// 老化测试
export function agingList(params) {
  return request({
    url: '/production/aging',
    method: 'get',
    params
  })
}

// 配置工位报告
export function confList(params) {
  return request({
    url: '/production/confstation',
    method: 'get',
    params
  })
}

// fct测试报告
export function fctList(params) {
  return request({
    url: '/production/fct',
    method: 'get',
    params
  })
}

// 获取fqc测试报告
export function fqcList(params) {
  return request({
    url: '/production/fqc',
    method: 'get',
    params
  })
}

// oqc测试报告
export function oqcList(params) {
  return request({
    url: '/production/oqc',
    method: 'get',
    params
  })
}

// 半成品测试报告
export function undoneList(params) {
  return request({
    url: '/production/undone',
    method: 'get',
    params
  })
}

// 防水测试报告
export function waterProofList(params) {
  return request({
    url: '/production/waterproof',
    method: 'get',
    params
  })
}

// 撤回
export function fileCancel(data) {
  return request({
    url: '/project/management/config/cancel',
    method: 'put',
    data
  })
}

// 版本号
export function computerNameList({ name, categoryId }) {
  return request({
    url: `/version/manage/name/${name}`,
    method: 'get',
    params: {
      categoryId
    }
  })
}

// 批量重审
export function resetFileConfig(data) {
  return request({
    url: '/project/management/config/reset',
    method: 'put',
    data
  })
}



