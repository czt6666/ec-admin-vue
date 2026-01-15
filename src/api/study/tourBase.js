import request from '@/utils/request'

// 获取研学基地列表（分页）
export function fetchList(params) {
  return request({
    url: '/study/tour/base/page',
    method: 'get',
    params
  })
}

// 获取所有研学基地（用于下拉选择）
export function list() {
  return request({
    url: '/study/tour/base/list',
    method: 'get'
  })
}

// 创建研学基地
export function createTourBase(data) {
  return request({
    url: '/study/tour/base/create',
    method: 'post',
    data
  })
}

// 更新研学基地
export function updateTourBase(data) {
  return request({
    url: '/study/tour/base/update',
    method: 'put',
    data
  })
}

// 删除研学基地
export function deleteTourBase(id) {
  return request({
    url: `/study/tour/base/delete/${id}`,
    method: 'delete'
  })
}

// 获取所有研学类型（用于下拉选择）
export function fetchTourTypes() {
  return request({
    url: '/study/tour/type/all',
    method: 'get'
  })
}

// 获取基地关联的研学类型
export function getAssociatedTypes(baseId) {
  return request({
    url: `/study/tour/base/getAssociatedTypes/${baseId}`,
    method: 'get'
  })
}

// 保存基地与研学类型的关联关系
export function saveBaseTypes(baseId, typeIds) {
  return request({
    url: '/study/tour/base/saveBaseTypes',
    method: 'post',
    params: {
      baseId
    },
    data: typeIds
  })
}

// 上架研学基地（仅管理员）
export function publishStudyBase(id) {
  return request({
    url: `/study/tour/base/${id}/publish`,
    method: 'post'
  })
}

// 下架研学基地（仅管理员）
export function unpublishStudyBase(id) {
  return request({
    url: `/study/tour/base/${id}/unpublish`,
    method: 'post'
  })
}
