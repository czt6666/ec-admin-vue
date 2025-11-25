import request from '@/utils/request'

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
