// src/api/homestay.js
import request from '@/utils/request'

// 分页查询民宿列表（支持模糊查询）
export function getHomestayList(params) {
  return request({
    url: '/admin/ecadmin/village-homestay/page',
    method: 'get',
    params
  })
}

// 根据ID查询民宿详情
export function getHomestayById(id) {
  return request({
    url: `/admin/ecadmin/village-homestay/${id}`,
    method: 'get'
  })
}

// 新增民宿
export function addHomestay(data) {
  return request({
    url: '/admin/ecadmin/village-homestay',
    method: 'post',
    data
  })
}

// 更新民宿
export function updateHomestay(data) {
  return request({
    url: '/admin/ecadmin/village-homestay',
    method: 'put',
    data
  })
}

// 删除民宿
export function deleteHomestay(id) {
  return request({
    url: `/admin/ecadmin/village-homestay/${id}`,
    method: 'delete'
  })
}

// 根据乡村ID查询民宿列表
export function getHomestayByVillageId(villageId) {
  return request({
    url: `/admin/ecadmin/village-homestay/village/${villageId}`,
    method: 'get'
  })
}
