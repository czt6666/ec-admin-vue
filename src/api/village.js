// src/api/village.js
import service from '@/utils/village_api'

// 分页查询村庄，仅 page、pageSize
export function fetchVillagePage(params) {
  // params: { page, pageSize }
  return service({
    url: '/admin/ecadmin/village/page',
    method: 'get',
    params
  });

}
// 获取所有村庄列表（不分页）
export function getVillageList() {
  return service({
    url: '/admin/ecadmin/village/list',
    method: 'get'

  })
}
// 新增村庄
export function addVillage(data) {
  return service({
    url: '/admin/ecadmin/village/add',
    method: 'post',
    data
  });
}
// src/api/village.js 中添加
// 修改村庄
export function updateVillage(data) {
  return service({
    url: '/admin/ecadmin/village/update',
    method: 'put',
    data
  });
}

// 根据ID查询村庄详情
export function getVillageById(id) {
  return service({
    url: `/admin/ecadmin/village/${id}`,
    method: 'get'
  });
}
// 删除村庄
export function deleteVillage(id) {
  return service({
    url: `/admin/ecadmin/village/${id}`,
    method: 'delete'
  });
}
// 导入村庄信息
export function importVillages(formData) {
  return service({
    url: '/admin/ecadmin/village/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
// 导出村庄信息
export function exportVillages() {
  return service({
    url: '/admin/ecadmin/village/export',
    method: 'get',
    responseType: 'blob'
  });
}

// 检查删除约束
export function checkDeleteConstraints(id) {
  return service({
    url: `/admin/ecadmin/village/check-delete/${id}`,
    method: 'get'
  });
}
// 强制删除村庄
export function forceDeleteVillage(id) {
  return service({
    url: `/admin/ecadmin/village/force/${id}`,
    method: 'delete'
  });
}
