import request from '@/utils/request'

// 获取养老驿站类型列表
export function getList(params) {
  return request({
    url: '/elderly/subject/type/list',
    method: 'get',
    params
  })
}

// 创建养老驿站类型
export function createSubjectType(data) {
  return request({
    url: '/elderly/subject/type/create',
    method: 'post',
    data
  })
}

// 更新养老驿站类型
export function updateSubjectType(data) {
  return request({
    url: '/elderly/subject/type/update',
    method: 'post',
    data
  })
}

// 删除养老驿站类型
export function deleteSubjectType(id) {
  return request({
    url: `/elderly/subject/type/delete/${id}`,
    method: 'delete'
  })
}

// 更新养老驿站类型状态
export function updateStatus(data) {
  return request({
    url: '/elderly/subject/type/status/update',
    method: 'post',
    data
  })
}