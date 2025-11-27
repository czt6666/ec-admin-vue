import request from '@/utils/request'
import shopRequest from '@/utils/shop_api'
// 列表 + 分页
export const listRestaurant = params =>
  request({
    url: '/admin/ecadmin/restaurant/list',
    method: 'get',
    params
  })

// 详情
export const getRestaurant = id =>
  request({
    url: `/admin/ecadmin/restaurant/${id}`,
    method: 'get'
  })

// 新增
export const createRestaurant = data =>
  request({
    url: '/admin/ecadmin/restaurant/add',
    method: 'post',
    data
  })

// 编辑
export const updateRestaurant = data =>
  request({
    url: '/admin/ecadmin/restaurant/update',
    method: 'post', // 若后台用 PUT 就改成 put
    data
  })

// 删除
export const deleteRestaurant = id =>
  request({
    url: `/admin/ecadmin/restaurant/${id}`,
    method: 'delete'
  })

// 查询某用户的所有饭馆名称
export const listRestaurantNamesByUser = userId =>
  request({
    url: `/admin/ecadmin/restaurant/user/${userId}/names`,
    method: 'get'
  })

/**
 * 获取菜品分类列表
 */
export function getDishCategoryList(params) {
  return shopRequest({
    url: '/restaurant/dishCategory/list',
    method: 'get',
    params
  })
}

/**
 * 获取菜品列表
 */
export function getDishList(params) {
  return shopRequest({
    url: '/restaurant/dish/list',
    method: 'get',
    params
  })
}

/**
 * 获取菜品详情
 */
export function getDishDetail(id, params) {
  return shopRequest({
    url: `/restaurant/dish/${id}`,
    method: 'get',
    params
  })
}

/**
 * 新增菜品
 */
export function createDish(data) {
  return shopRequest({
    url: '/restaurant/dish/add',
    method: 'post',
    data
  })
}

/**
 * 更新菜品
 */
export function updateDish(data) {
  return shopRequest({
    url: '/restaurant/dish/update',
    method: 'post',
    data
  })
}

/**
 * 删除菜品
 */
export function deleteDish(data) {
  return shopRequest({
    url: '/restaurant/dish/delete',
    method: 'post',
    data
  })
}

/**
 * 更新菜品排序
 */
export function updateDishSort(data) {
  return shopRequest({
    url: '/restaurant/dish/updateSort',
    method: 'post',
    data
  })
}