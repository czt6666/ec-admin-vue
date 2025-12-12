import request from '@/utils/request'

export function getDataSources() {
  return request({
    url: '/data-sources',
    method: 'get'
  })
}

export function getDataSourceById(id) {
  return request({
    url: `/data-sources/${id}`,
    method: 'get'
  })
}

export function createDataSource(data) {
  return request({
    url: '/data-sources',
    method: 'post',
    data
  })
}

export function updateDataSource(id, data) {
  return request({
    url: `/data-sources/${id}`,
    method: 'put',
    data
  })
}

export function deleteDataSource(id) {
  return request({
    url: `/data-sources/${id}`,
    method: 'delete'
  })
}

export function updateDataSourceStatus(id, status) {
  return request({
    url: `/data-sources/${id}/status`,
    method: 'put',
    data: { status }
  })
}

export function updateDataSourceFrequency(id, frequency) {
  return request({
    url: `/data-sources/${id}/frequency`,
    method: 'put',
    data: { frequency }
  })
}

export function syncAllDataSources() {
  return request({
    url: '/data-sources/sync-all',
    method: 'post'
  })
}

export function syncDataSource(id) {
  return request({
    url: `/data-sources/${id}/sync`,
    method: 'post'
  })
}

export function getDataSourceStats() {
  return request({
    url: '/data-sources/stats',
    method: 'get'
  })
}