import request from '@/utils/request';

// 新增历史问题
export function addHistoryIssue(data) {
  return request({
    url: '/issues/save',
    method: 'post',
    data: data
  });
}

// 根据computerId获取历史问题列表
export function getHistoryIssuesListByComputerId(query) {
  return request({
    url: '/issues/'+query,
    method: 'get',
  });
}

// 处理历史问题（确认处理完成）
export function handleHistoryIssue(data) {
  return request({
    url: '/issues/process',
    method: 'put',
    data: data
  });
} 