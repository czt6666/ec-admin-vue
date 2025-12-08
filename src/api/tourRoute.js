import request from '@/utils/request'

const baseUrl = '/admin/ecadmin/tour/route'

export function listTourRoute(params) {
  return request({
    url: baseUrl + '/list',
    method: 'get',
    params
  })
}

export function getTourRoute(id) {
  return request({
    url: baseUrl + '/' + id,
    method: 'get'
  })
}

export function createTourRoute(data) {
  return request({
    url: baseUrl + '/create',
    method: 'post',
    data
  })
}

export function updateTourRoute(data) {
  return request({
    url: baseUrl + '/update',
    method: 'post',
    data
  })
}

export function deleteTourRoute(id) {
  return request({
    url: baseUrl + '/delete/' + id,
    method: 'delete'
  })
}

