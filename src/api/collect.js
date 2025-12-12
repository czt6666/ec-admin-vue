import request from '@/utils/request'

// 热点榜（按收藏数，默认近7天）
export function listCollectHotspot(params) {
  return request({
    url: '/admin/ecadmin/collect/hotspot',
    method: 'get',
    params
  })
}

// 单体热度（收藏数）
export function getCollectCount(targetType, targetId) {
  return request({
    url: '/admin/ecadmin/collect/count',
    method: 'get',
    params: { targetType, targetId }
  })
}

// 个人收藏列表（可选）
export function listCollect(params) {
  return request({
    url: '/admin/ecadmin/collect/list',
    method: 'get',
    params
  })
}

// 新增收藏
export function createCollect(data) {
  return request({
    url: '/admin/ecadmin/collect/create',
    method: 'post',
    data
  })
}

// 取消收藏
export function deleteCollect(params) {
  return request({
    url: '/admin/ecadmin/collect/delete',
    method: 'delete',
    params
  })
}
