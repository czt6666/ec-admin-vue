import request from '@/utils/request'

/**
 * 分页查询公司列表
 */
export function listTourCompany(params) {
  return request({
    url: '/admin/ecadmin/tour/company/list',
    method: 'get',
    params
  })
}

/**
 * 根据ID查询公司详情
 */
export function getTourCompany(id) {
  return request({
    url: `/admin/ecadmin/tour/company/${id}`,
    method: 'get'
  })
}

/**
 * 创建公司
 */
export function createTourCompany(data) {
  return request({
    url: '/admin/ecadmin/tour/company/create',
    method: 'post',
    data
  })
}

/**
 * 更新公司
 */
export function updateTourCompany(data) {
  return request({
    url: '/admin/ecadmin/tour/company/update',
    method: 'post',
    data
  })
}

/**
 * 删除公司
 */
export function deleteTourCompany(id) {
  return request({
    url: `/admin/ecadmin/tour/company/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 上架旅游公司（仅管理员）
 */
export function publishTourCompany(id) {
  return request({
    url: `/admin/ecadmin/tour/company/${id}/publish`,
    method: 'post'
  })
}

/**
 * 下架旅游公司（仅管理员）
 */
export function unpublishTourCompany(id) {
  return request({
    url: `/admin/ecadmin/tour/company/${id}/unpublish`,
    method: 'post'
  })
}

