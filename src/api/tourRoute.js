import request from '@/utils/request'

/**
 * 分页查询旅游线路列表
 */
export function listTourRoute(params) {
  return request({
    url: '/admin/ecadmin/tour/route/list',
    method: 'get',
    params
  })
}

/**
 * 根据ID查询旅游线路详情
 */
export function getTourRoute(id) {
  return request({
    url: `/admin/ecadmin/tour/route/${id}`,
    method: 'get'
  })
}

/**
 * 创建旅游线路
 */
export function createTourRoute(data) {
  return request({
    url: '/admin/ecadmin/tour/route/create',
    method: 'post',
    data
  })
}

/**
 * 更新旅游线路
 */
export function updateTourRoute(data) {
  return request({
    url: '/admin/ecadmin/tour/route/update',
    method: 'post',
    data
  })
}

/**
 * 删除旅游线路
 */
export function deleteTourRoute(id) {
  return request({
    url: `/admin/ecadmin/tour/route/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 上架旅游线路（仅管理员）
 */
export function publishTourRoute(id) {
  return request({
    url: `/admin/ecadmin/tour/route/${id}/publish`,
    method: 'post'
  })
}

/**
 * 下架旅游线路（仅管理员）
 */
export function unpublishTourRoute(id) {
  return request({
    url: `/admin/ecadmin/tour/route/${id}/unpublish`,
    method: 'post'
  })
}

