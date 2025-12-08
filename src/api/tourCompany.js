import request from '@/utils/request'

const baseUrl = '/admin/ecadmin/tour/company'
const uploadUrl = '/api/file/upload'

export function listTourCompany(params) {
  return request({
    url: baseUrl + '/list',
    method: 'get',
    params
  })
}

export function getTourCompany(id) {
  return request({
    url: baseUrl + '/' + id,
    method: 'get'
  })
}

export function createTourCompany(data) {
  return request({
    url: baseUrl + '/create',
    method: 'post',
    data
  })
}

export function updateTourCompany(data) {
  return request({
    url: baseUrl + '/update',
    method: 'post',
    data
  })
}

export function deleteTourCompany(id) {
  return request({
    url: baseUrl + '/delete/' + id,
    method: 'delete'
  })
}

// 上传文件（图片）
export function uploadCompanyFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: uploadUrl,
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

