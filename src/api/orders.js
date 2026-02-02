import request from '@/utils/request'

export function getOrderList(params) {
  return request({
    url: '/restaurant/orders/list',
    method: 'get',
    params
  })
}

export function getOrderDetail(orderId) {
  return request({
    url: `/restaurant/orders/detail/${orderId}`,
    method: 'get'
  })
}

export function updateOrderStatus(data) {
  return request({
    url: '/restaurant/orders/update-status',
    method: 'post',
    data
  })
}

export function getOrderStatistics(params) {
  return request({
    url: '/orders/statistics',
    method: 'get',
    params
  })
}

export function createOrder(data) {
  return request({
    url: '/orders/create',
    method: 'post',
    data
  })
}