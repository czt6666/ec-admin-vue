import request from '@/utils/shop_api'

/**
 * 获取菜品分类列表
 */
export function getDishCategoryList(params) {
  return request({
    url: '/restaurant/dishCategory/list',
    method: 'get',
    params
  })
}

/**
 * 新增菜品分类
 */
export function createDishCategory(data) {
  return request({
    url: '/restaurant/dishCategory/add',
    method: 'post',
    data
  })
}

/**
 * 更新菜品分类
 */
export function updateDishCategory(data) {
  return request({
    url: '/restaurant/dishCategory/update',
    method: 'post',
    data
  })
}

/**
 * 删除菜品分类
 */
export function deleteDishCategory(id) {
  return request({
    url: `/restaurant/dishCategory/delete`,
    method: 'post',
    data: { id }
  })
}

/**
 * 更新菜品分类排序
 */
export function updateDishCategorySort(data) {
  return request({
    url: '/restaurant/dishCategory/updateSort',
    method: 'post',
    data
  })
}

/**
 * 上传图片
 */
export function uploadImage(file) {
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