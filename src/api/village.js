// src/api/village.js
import service from '@/utils/api'

// 分页查询村庄，仅 page、pageSize
export function fetchVillagePage(params) {
  // params: { page, pageSize }
  return service({
    url: '/bistu/ecadmin/village/page',
    method: 'get',
    params
  });

}
// 新增村庄
export function addVillage(data) {
  return service({
    url: '/bistu/ecadmin/village/add',
    method: 'post',
    data
  });
}
// src/api/village.js 中添加
// 修改村庄
export function updateVillage(data) {
  return service({
    url: '/bistu/ecadmin/village/update',
    method: 'put',
    data
  });
}

// 根据ID查询村庄详情
export function getVillageById(id) {
  return service({
    url: `/bistu/ecadmin/village/${id}`,
    method: 'get'
  });
}
// 删除村庄
export function deleteVillage(id) {
  return service({
    url: `/bistu/ecadmin/village/${id}`,
    method: 'delete'
  });
}
