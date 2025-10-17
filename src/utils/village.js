import service from '@/utils/api' //

export function fetchVillagePage(params) {
  // params: { page, pageSize }
  return service({
    url: '/bistu/ecadmin/village/page',
    method: 'get',
    params
  });
}
