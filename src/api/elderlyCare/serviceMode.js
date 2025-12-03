import request from '@/utils/request'

// 获取养老模式列表
export function getList(params) {
  return request({
    url: '/elderly/service/mode/list',
    method: 'get',
    params
  })
}

// 创建养老模式
export function createServiceMode(data) {
  return request({
    url: '/elderly/service/mode/create',
    method: 'post',
    data
  })
}

// 更新养老模式
export function updateServiceMode(data) {
  return request({
    url: '/elderly/service/mode/update',
    method: 'post',
    data
  })
}

// 删除养老模式
export function deleteServiceMode(id) {
  return request({
    url: `/elderly/service/mode/delete/${id}`,
    method: 'delete'
  })
}

// 更新养老模式状态
export function updateStatus(data) {
  return request({
    url: '/elderly/service/mode/status/update',
    method: 'post',
    data
  })
}