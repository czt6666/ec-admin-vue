import request from '@/utils/cart_api'

// 加入购物车
export function addCart(data) {
  return request({
    url: '/admin/ecadmin/cart/add',
    method: 'post',
    data
  })
}

// 查询购物车
export function listCart(params) {
  return request({
    url: '/admin/ecadmin/cart/list',
    method: 'get',
    params
  })
}

// 删除购物车项
export function deleteCartItem(userId, skuId) {
  return request({
    url: `/admin/ecadmin/cart/${skuId}`,
    method: 'delete',
    params: { userId }
  })
}
// src/api/cart.js
export function pageCart(params) {
  // params: { userId, page, pageSize }
  return request({
    url: '/admin/ecadmin/cart/page',
    method: 'get',
    params
  })
}
