
const getters = {
  sidebar: state => state.app.sidebar,
  visitedViews: state => state.app.visitedViews,

  nickname: state => state.user.nickname,
  userId: state => state.user.userId,
  roleIds: state => state.user.roleIds,
  menus: state => state.user.menus,
  permissions: state => state.user.permissions,

  permission_routers: state => state.permission.routers,
  admin_routers: state => state.permission.andminManagementRouters,
  addRouters: state => state.permission.addRouters,

  //左侧功能栏
  isBarShow: state => state.buttonState.isBarShow,
  //顶部菜单栏各项功能
  topMenuComp: state => state.buttonState.topMenuComp,
  //顶部标题栏
  titleComp: state => state.buttonState.titleComp,
  // 文档权限
  filePermission: state => state.buttonState.filePermission,

  //文档过期标识
  expiredFile: state => state.errorState.expiredFile,

  // 10.07-ts-add:设置左侧功能栏打开区域的状态
  isLeftBarInfoShow: state => state.buttonState.isLeftBarInfoShow,

  /**********---权限部分--Start---**********************************************/
  //dcs的权限
  dcsPermissions: state => state.viewConfig.permission.dcsPermissions,
  // 是否dcs模式打开
  flagForDcs: state => state.viewConfig.flagForDcs,

  // webofd的配置
  webofdConfig: state => state.viewConfig.permission.webofdConfig,
  topMenuConfig: state => state.viewConfig.permission.webofdConfig.topMenuConfig,
  topTitleConfig: state => state.viewConfig.permission.webofdConfig.topTitleConfig,
  leftBarConfig: state => state.viewConfig.permission.webofdConfig.leftBarConfig,
  mobileConfig: state => state.viewConfig.permission.webofdConfig.mobileConfig,


  /** 2023/12/27-ts-add: 登录的用户权限*/
  userPermission: state => state.user.permissions,
  serviceModel: state => state.viewConfig.serviceModel,
  loginPermissionMap: state => state.viewConfig.loginPermissionMap,
  mappedPermissionList: state => state.viewConfig.mappedPermissionList,
  /**********---权限部分--end---**********************************************/


  /**********---文件部分--Start---*******/
  // fileType: state => state.fileState.fileType,
  // fileId: state => state.fileId,

  /**********---文件部分--End---*******/


  // Print Module *************
  // 是否正在打印状态
  isPrint: state => state.print.isPrint,
  // 要打印的文件名UUID
  printFileId: state => state.print.fileId,
  // **********
  isMobile() {
    return !!window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
  },
};
export default getters;
