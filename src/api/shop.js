import request from '@/utils/request'

/**
 * 获取店铺列表
 */
export function getShopList(params) {
  return request({
    url: '/admin/ecadmin/shop/list',
    method: 'get',
    params
  })
}

/**
 * 获取店铺详情
 */
export function getShopById(id) {
  return request({
    url: `/admin/ecadmin/shop/${id}`,
    method: 'get'
  })
}

/**
 * 新增店铺
 */
export function createShop(data) {
  return request({
    url: '/admin/ecadmin/shop/add',
    method: 'post',
    data
  })
}

/**
 * 更新店铺
 */
export function updateShop(data) {
  return request({
    url: '/admin/ecadmin/shop/update',
    method: 'post',
    data
  })
}

/**
 * 删除店铺
 */
export function deleteShop(id) {
  return request({
    url: `/admin/ecadmin/shop/${id}`,
    method: 'delete'
  })
}

/**
 * 获取店铺下拉选项列表
 * @param {Number} userId - 用户ID
 * @param {String} roleIds - 角色ID列表（逗号分隔）
 */
export const listShopOptions = (userId, roleIds) =>
  request({
    url: '/admin/ecadmin/shop/options',
    method: 'get',
    params: {
      userId,
      roleIds
    }
  })
