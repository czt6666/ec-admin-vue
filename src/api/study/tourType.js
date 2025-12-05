import request from '@/utils/request'

// 获取研学类型列表
export function fetchList(params) {
  return request({
    url: '/study/tour/type/list',
    method: 'get',
    params
  })
}

// 创建研学类型
export function createTourType(data) {
  return request({
    url: '/study/tour/type/create',
    method: 'post',
    data
  })
}

// 更新研学类型
export function updateTourType(data) {
  return request({
    url: '/study/tour/type/update',
    method: 'post',
    data
  })
}

// 删除研学类型
export function deleteTourType(id) {
  return request({
    url: `/study/tour/type/delete/${id}`,
    method: 'delete'
  })
}

// 更新研学类型状态
export function updateStatus(data) {
  return request({
    url: '/study/tour/type/status/update',
    method: 'post',
    data
  })
}