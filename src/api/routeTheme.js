import request from '@/utils/request'

const baseUrl = '/admin/ecadmin/route/theme'

export function listRouteTheme(params) {
  return request({
    url: baseUrl + '/list',
    method: 'get',
    params
  })
}

export function createRouteTheme(data) {
  return request({
    url: baseUrl + '/create',
    method: 'post',
    data
  })
}

export function updateRouteTheme(data) {
  return request({
    url: baseUrl + '/update',
    method: 'post',
    data
  })
}

export function deleteRouteTheme(id) {
  return request({
    url: baseUrl + '/delete/' + id,
    method: 'delete'
  })
}

