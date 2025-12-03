import request from '@/utils/request'

// 获取研学方案列表
export function fetchList(params) {
  return request({
    url: '/study/tour/plan/page',
    method: 'get',
    params
  })
}

// 创建研学方案
export function createTourPlan(data) {
  return request({
    url: '/study/tour/plan/create',
    method: 'post',
    data
  })
}

// 更新研学方案
export function updateTourPlan(data) {
  return request({
    url: '/study/tour/plan/update',
    method: 'put',
    data
  })
}

// 删除研学方案
export function deleteTourPlan(id) {
  return request({
    url: '/study/tour/plan/delete/' + id,
    method: 'delete'
  })
}

// 获取所有启用的研学方案（用于下拉选择）
export function fetchAllEnabled() {
  return request({
    url: '/study/tour/plan/list',
    method: 'get'
  })
}