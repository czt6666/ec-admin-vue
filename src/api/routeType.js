import request from '@/utils/request'

const baseUrl = '/admin/ecadmin/route/type'

export function listRouteType(params) {
  return request({
    url: baseUrl + '/list',
    method: 'get',
    params
  })
}

export function createRouteType(data) {
  return request({
    url: baseUrl + '/create',
    method: 'post',
    data
  })
}

export function updateRouteType(data) {
  return request({
    url: baseUrl + '/update',
    method: 'post',
    data
  })
}

export function deleteRouteType(id) {
  return request({
    url: baseUrl + '/delete/' + id,
    method: 'delete'
  })
}

