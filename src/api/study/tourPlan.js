import request from '@/utils/request'

// 获取研学方案列表
export function fetchList(params) {
  return request({
    url: '/study/tour/plan/page',
    method: 'get',
    params
  })
}

// 上架研学方案（仅管理员）
export function publishTourPlan(id) {
  return request({
    url: `/study/tour/plan/${id}/publish`,
    method: 'post'
  })
}

// 下架研学方案（仅管理员）
export function unpublishTourPlan(id) {
  return request({
    url: `/study/tour/plan/${id}/unpublish`,
    method: 'post'
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

// 获取方案的图片列表
export function getImages(planId) {
  return request({
    url: '/study/tour/plan/images/' + planId,
    method: 'get'
  })
}

// 保存研学方案图片
export function saveImages(planId, images) {
  return request({
    url: '/study/tour/plan/' + planId + '/images',
    method: 'post',
    data: {
      images
    }
  })
}
