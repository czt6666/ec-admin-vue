// 驿站管理 API



import request from '@/utils/request'



const baseUrl = '/admin/ecadmin/station'



// 分页查询驿站列表

export function listStation(params) {

  return request({

    url: baseUrl + '/page',

    method: 'get',

    params

  })

}



// 根据ID查询驿站详情

export function getStation(id) {

  return request({

    url: baseUrl + '/' + id,

    method: 'get'

  })

}



// 新增驿站

export function createStation(data) {

  return request({

    url: baseUrl + '/add',

    method: 'post',

    data

  })

}



// 更新驿站

export function updateStation(data) {

  return request({

    url: baseUrl + '/update',

    method: 'put',

    data

  })

}



// 删除驿站

export function deleteStation(id) {

  return request({

    url: baseUrl + '/deleted/' + id,

    method: 'delete'

  })

}



// 上传文件

export function uploadFile(file) {

  const formData = new FormData()

  formData.append('file', file)

  return request({

    url: '/api/file/upload',

    method: 'post',

    data: formData,

    headers: {

      'Content-Type': 'multipart/form-data'

    }

  })

}



// 导入驿站信息

export function importStation(file) {

  const formData = new FormData()

  formData.append('file', file)

  return request({

    url: baseUrl + '/import',

    method: 'post',

    data: formData,

    headers: {

      'Content-Type': 'multipart/form-data'

    }

  })

}



// 导出驿站信息

export function exportStation() {

  return request({

    url: baseUrl + '/export',

    method: 'get',

    responseType: 'blob',

    // 确保正确处理 blob 响应

    transformResponse: [(data) => {

      // 如果已经是 Blob，直接返回

      if (data instanceof Blob) {

        return data

      }

      return data

    }]

  })

}

// 上架驿站（仅管理员）
export function publishStation(id) {
  return request({
    url: `${baseUrl}/${id}/publish`,
    method: 'post'
  })
}

// 下架驿站（仅管理员）
export function unpublishStation(id) {
  return request({
    url: `${baseUrl}/${id}/unpublish`,
    method: 'post'
  })
}


















