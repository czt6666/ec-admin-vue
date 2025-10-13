import router from "./index";
import store from "../store";
import NProgress from "nprogress"; // Progress 进度条
import "nprogress/nprogress.css"; // Progress 进度条样式
import { getToken } from "@/utils/auth"; // 验权
//登录白名单
const whiteList4Login = [
  "/login",
  "/404",
  "/sysmonitor",
];

//白名单,不需要登录的路由
const whiteList4NoLogin = [
  "/404",
  "/",
  "/admin",
  "/config",
  "sysmonitor",
];
router.beforeEach((to, from, next) => {
  NProgress.start();
  //配置文件autoOpenPage属性为login为带登录策略，viewer为无登录策略
  if (window.webofdConfig.IS_LOGIN) {
    store.commit('SET_STATEOBJATTRIBUTE', {
      key: 'titleComp.xUser',
      value: true
    })
    // debugger
    /** 2023/12/27-ts-add: 设置服务模式*/
    store.commit("SET_SERVICEMODEL", "login")
    const loginPermissionMap = new Map()
    loginPermissionMap.set("viewer:view", ["isOpenFile", "isFit", "isTypeSetting",
      "isCursor", "isRotate", "isFullscrean", "isBackground", "isPages", "isTabName", "isUserOrxReader", "isTitle", "isTopMenu", "isThumbnail", "isLeftBar"])
    loginPermissionMap.set("viewer:download", ["isDownload"])
      .set("viewer:watermark", ["isWaterMark"]).set("viewer:search", ["isSearch"])
      .set("viewer:zoom", ["isZoom"]).set("viewer:print", ["isPrint"])
      .set("viewer:tags", ["isTags"]).set("viewer:metadata", ["isMetaData"])
      .set("viewer:outline", ["isOutLine"]).set("viewer:multidoc", ["isMultiDoc"])
      .set("viewer:bookmaker", ["isBookMark"]).set("viewer:signature", ["isSignature"])
      .set("viewer:attachment", ["isAttachment"]).set("edit:sign", ["isSign"])
      .set("edit:watermark", []).set("edit:tags", [])
      .set("edit:metedata", ["isAddMetaData"]).set("edit:signature", ["isAnnos"])
    store.commit("SET_LOGINPERMISSIONMAP", loginPermissionMap)
    if (getToken()) {
      //如果已经登录
      if (to.path === "/login") {
        next({ path: "/" });

        NProgress.done(); // 结束Progress
      } else if (!store.getters.userId) {
        //已经登录但是store内没有userId,说明可能是重新刷新的页面,因此重新获取用户信息
        store.dispatch("GetInfo").then(() => {
          next({ ...to });
        });
      } else {
        next();
        /** 2024/3/5-ts-add: 用于解决地址栏刷新遗留上一个文档名称的bug（比较丑陋）*/
        if (from.name === null && to.name === "view-detail" && /\/webOFDviewer\/.*.ofd/.test(to.path)) {
          next('/webOFDviewer')
        }
      }
    } else if (whiteList4Login.indexOf(to.path) !== -1) {
      //如果前往的路径是白名单内的,就可以直接前往
      next()
    } else {
      //如果路径不是白名单内的,而且又没有登录,就跳转登录页面
      store.commit("RESET_USER");
      next('/login');
      NProgress.done(); // 结束Progress
    }

  } else {
    /** 2023/12/27-ts-add: 设置服务模式*/
    store.commit("SET_SERVICEMODEL", "nologin")
    if (store.getters.addRouters.length === 0) {
      store.dispatch('GenerateNoLoginRoutes').then(() => {
        next({...to});
      });
    } else if (whiteList4NoLogin.indexOf(to.path) !== -1 || to.path.includes("/webOFDviewer/")) {
      if (from.name === null && to.name === "view-detail" && /\/webOFDviewer\/.*.ofd/.test(to.path)) {
        next(' ')
      }
      //如果前往的路径是白名单内的,就可以直接前往
      next();
    } else {
      /** 2023/12/29-ts-update: 不在白名单的跳转404*/
      //如果路径不是白名单内的,跳转404
      next('/404');
      NProgress.done(); // 结束Progress
    }
  }
});
router.afterEach(() => {
  NProgress.done(); // 结束Progress
});
