import request from '@/utils/request'

// 分页查询研学活动
export function fetchList(query) {
  return request({
    url: '/study/activity/page',
    method: 'get',
    params: query
  })
}

// 新增研学活动
export function createActivity(data) {
  return request({
    url: '/study/activity',
    method: 'post',
    data
  })
}

// 更新研学活动
export function updateActivity(data) {
  return request({
    url: '/study/activity',
    method: 'put',
    data
  })
}

// 删除研学活动
export function deleteActivity(id) {
  return request({
    url: `/study/activity/${id}`,
    method: 'delete'
  })
}

// 获取研学活动详情
export function getActivity(id) {
  return request({
    url: `/study/activity/${id}`,
    method: 'get'
  })
}

// 获取所有启用的研学活动
export function fetchAllEnabled() {
  return request({
    url: '/study/activity/list',
    method: 'get'
  })
}