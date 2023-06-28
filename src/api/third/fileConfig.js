import request from '@/utils/request'

export function listFileConfig(query) {
  return request({
    url: '/file/config/list',
    method: 'get',
    params: query
  })
}

export function listFactoryFileConfig(query) {
  return request({
    url: '/file/config/factory/list',
    method: 'get',
    params: query
  })
}


export function listModelDict(query) {
  return request({
    url: '/computer/dict/list',
    method: 'get',
    params: query
  })
}

export function categoryComputerDict() {
  return request({
    url: '/file/category/computer',
    method: 'get'
  })
}

export function detailFileConfig(query) {
  return request({
    url: '/file/config/' + query,
    method: 'get',
  })
}

export function authFileConfig(data) {
  return request({
    url: '/file/config/auth',
    method: 'put',
    data: data
  })
}

export function addFileConfig(data) {
  return request({
    url: '/file/config',
    method: 'post',
    data: data
  })
}

export function editFileConfig(data) {
  return request({
    url: '/file/config',
    method: 'put',
    data: data
  })
}


export function computerDictList(data) {
  return request({
    url: '/file/config/dirt',
    method: 'get',
    params: data
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
    url: 'file/config/cancel',
    method: 'put',
    data
  })
}

// 批量重审
export function resetFileConfig(data) {
  return request({
    url: '/file/config/reset',
    method: 'put',
    data: data
  })
}

// 批量同步
export function resetBatchSync(data) {
  return request({
    url: '/file/sync/config',
    method: 'put',
    data
  })
}


// 仪表型号
export function computerNameList({ name, categoryId }) {
  return request({
    url: `computer/name/${name}`,
    method: 'get',
    params: {
      categoryId
    }
  })
}

// 仪表型号名称
export function categoryNameList({ name, categoryName }) {
  return request({
    url: `computer/category/name/${name}`,
    method: 'get',
    params: {
      categoryName
    }
  })
}


// 送样软件数据管理

export function sampleSoftList(params) {
  return request({
    url: "/sample/soft/config/list",
    method: "get",
    params
  })
}

// 撤回
export function sampleFileCancel(data) {
  return request({
    url: '/sample/soft/config/cancel',
    method: 'put',
    data
  })
}

// 批量重审
export function sampleResetFileConfig(data) {
  return request({
    url: '/sample/soft/config/reset',
    method: 'put',
    data
  })
}

export function sampleAuthFileConfig(data) {
  return request({
    url: '/sample/soft/config/auth',
    method: 'put',
    data
  })
}

export function sampleSofteConfig(data) {
  return request({
    url: '/sample/soft/config',
    method: 'put',
    data
  })
}