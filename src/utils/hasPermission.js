import store from '../store'

export function hasPermission(permission) {
  permission = permission.trim()
  // let myPermissions = store.getters.dcsPermissions.concat(store.getters.webofdPermissions);
  // 权限列表
  // let myPermissions
  // if ("nologin" === store.getters.serviceModel){
  //   myPermissions = store.getters.topMenuPers.concat(store.getters.topTitlePers).concat(store.getters.leftBarPers).concat(store.getters.mobilePers);
  // }else {
  //   myPermissions = store.getters.mappedPermissionList
  // }
  // return myPermissions.indexOf(permission) > -1;
  if (store.getters.topMenuConfig[permission] && store.getters.topMenuConfig[permission].isActive) {
    return true;
  } else if (store.getters.topTitleConfig[permission] && store.getters.topTitleConfig[permission].isActive) {
    return true;
  } else if (store.getters.leftBarConfig[permission] && store.getters.leftBarConfig[permission].isActive) {
    return true;
  } else if (store.getters.mobileConfig[permission] && store.getters.mobileConfig[permission].isActive) {
    return true;
  } else if (store.getters.userPermission.indexOf(permission) > -1){
    return true;
  } else {
    return false;
  }
  /*if (
    store.getters.topMenuPers[permission] ||
    store.getters.topTitlePers[permission] ||
    store.getters.leftBarPers[permission] ||
    store.getters.mobilePers[permission]
  ) {
    return true;
  }*/
}
