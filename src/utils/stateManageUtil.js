import store from '../store'
import {doesSupportGrayscale} from "./UseableTool";

/**
 * 修改侧边栏是否可见
 * 10.12-ts-add
 * @param isShow 是否显示 true/false
 */
export function setLeftBarShowState(isShow) {
  let isBarShow
  if (!isShow) {
    isBarShow = {
      openRecentFile: true,
      outline: false,
      thumbnail: false,
      tags: false,
      xSign: false,
      layer: false,
      bookmark: false,
      annotations: false,
      search: false,
      watermark: false,
      attachment: false,//附件
      multiDoc: false,//多文档
      textExtraction: false
    }
    // 10.07-ts-add:设置左侧功能栏打开区域的状态
    store.commit('SET_ISLEFTBARINFOSHOW', false);
  } else {
    isBarShow = {
      openRecentFile: true,
      outline: true,
      thumbnail: true,
      tags: true,
      xSign: true,
      layer: true,
      bookmark: true,
      annotations: true,
      search: true,
      watermark: true,
      attachment: true,//附件
      multiDoc: true,//多文档
      textExtraction: true
    }
  }
  store.commit('SET_ISBARSHOW', isBarShow);
  if (!doesSupportGrayscale()) {
    for (let key in isBarShow) {
      if (isBarShow.hasOwnProperty(key)) {
        setLeftBarOpacity(key, isShow)
      }
    }
  }
}

/**
 * 修改store中isBarShow对象中各属性的值
 * 10.12-ts-add
 * @param attributeName
 * @param value
 */
export function setIsBarShowAttribute(attributeName, value) {
  // 输入合规性检测，要求输入的属性名为字符串
  if (typeof (attributeName) == "string" && attributeName.constructor === String
    && Object.prototype.toString.call(attributeName) === "[object String]") {
    // 调用commit修改isbarshow中对应属性的值 key：isbarshow中要修改的属性名称
    // value: 修改的值
    store.commit({
      type: "SET_STATEOBJATTRIBUTE",
      key: "isBarShow." + attributeName,
      value: value
    })
    if (!doesSupportGrayscale()) {
      setLeftBarOpacity(attributeName, value)
    }
  } else {
    throw new Error("attributeName参数要求为String类型，但传入为" + typeof (attributeName) + "类型！")
  }
}

/**
 * 修改顶部功能栏是否可用
 * 10.12-ts-add
 * @param isShow 是否显示 true/false
 */
export function setTopMenuShowState(isShow) {
  let topMenuComp = {};
  if (!isShow) {
    topMenuComp = {
      xOpen: true,//打开文件
      xDownload: false,//下载
      xSign: false,//签章
      xfit: false,//适应页面
      xTypeSetting: false,//阅读模式
      xCursor: false,//鼠标状态
      xSearch: false,//搜索
      xZoom: false,//缩放
      xRotate: false,//旋转
      xAnnos: false,//批注
      xFullscrean: false,//全屏
      xBackground: false,//背景
      xPrint: false,//打印
      xPages: false,//翻页
      xPrintMask: false,//打印掩膜
      xPageMask: false,//页面掩膜
      xScreenShot: false, // 截图
    }
  } else {
    topMenuComp = {
      xOpen: true,//打开文件
      xDownload: true,//下载
      xSign: true,//签章
      xfit: true,//适应页面
      xTypeSetting: true,//阅读模式
      xCursor: true,//鼠标状态
      xSearch: true,//搜索
      xZoom: true,//缩放
      xRotate: true,//旋转
      xAnnos: true,//批注
      xFullscrean: true,//全屏
      xBackground: true,//背景
      xPrint: true,//打印
      xPages: true,//翻页
      xPrintMask: true,//打印掩膜
      xPageMask: true,//页面掩膜
      xScreenShot: true, // 截图
    }
  }
  store.commit('SET_TOPMENUCOMP', topMenuComp)
  if (!doesSupportGrayscale()) {
    setTopMenuOpacity("edit_btn", isShow)
  }
}

/**
 * 修改store中TopMenu对象中各属性的值
 * 10.12-ts-add
 * @param attributeName
 * @param value
 */
export function setTopMenuAttribute(attributeName, value) {
  // 输入合规性检测，要求输入的属性名为字符串
  if (typeof (attributeName) === "string" && attributeName.constructor === String
    && Object.prototype.toString.call(attributeName) === "[object String]") {
    // 调用commit修改topMenuComp中对应属性的值 key：topMenuComp中要修改的属性名称
    // value: 修改的值
    store.commit({
      type: "SET_STATEOBJATTRIBUTE",
      key: "topMenuComp." + attributeName,
      value: value
    })
  } else {
    throw new Error("attributeName参数要求为String类型，但传入为" + typeof (attributeName) + "类型！")
  }
}

/**
 * 修改顶部标题栏是否可见
 * 10.12-ts-add
 * @param isShow 是否显示 true/false
 */
export function setTitleCompShowState(isShow) {
  let titleComp = {};
  if (!isShow) {
    titleComp = {
      xSwitch: false,//但多标签页切换
      xShare: false,//分享
      xFileAttribute: false,//文档属性
      // xUser: false,//用户及其下拉菜单
      // xTitle: false,//标题栏
      // xOcr: false,
    }
  } else {
    titleComp = {
      xSwitch: true,//但多标签页切换
      xShare: true,//分享
      xFileAttribute: true,//文档属性
      // xUser: true,//用户及其下拉菜单
      // xTitle: true,//标题栏
      // xOcr: true,
    }
  }
  store.commit('SET_TITLECOMP', titleComp);
}

/**
 * 修改store中isBarShow对象中各属性的值
 * 10.12-ts-add
 * @param attributeName
 * @param value
 */
export function setTitleCompAttribute(attributeName, value) {
  // 输入合规性检测，要求输入的属性名为字符串
  if (typeof (attributeName) == "string" && attributeName.constructor === String
    && Object.prototype.toString.call(attributeName) === "[object String]") {
    // 调用commit修改titleComp中对应属性的值 key：titleComp中要修改的属性名称
    // value: 修改的值
    store.commit({
      type: "SET_STATEOBJATTRIBUTE",
      key: "titleComp." + attributeName,
      value: value
    })
  } else {
    throw new Error("attributeName参数要求为String类型，但传入为" + typeof (attributeName) + "类型！")
  }
}

/**
 * hyj-1122-add 设置按钮透明度，即是否置灰，true为可用，false置灰
 * @param {string} el 按钮名称
 * @param {boolean} isShow 是否置灰
 */
function setLeftBarOpacity(el, isShow) {
  // debugger
  var id = document.getElementById(el);
  if (id === undefined || id === null) {
    return;
  }
  if (isShow) {
    id.style.opacity = 1;
  } else {
    id.style.opacity = 0.3
  }
}

/**
 * hyj-1122-add 设置按钮透明度，即是否置灰，true为可用，false置灰
 * @param {string} className 属性名称
 * @param {boolean} value 是否置灰
 */
function setTopMenuOpacity(className, value) {
  let elements = document.getElementsByClassName(className);
  if (value) {
    for (let i = 0; i < elements.length; i++) {
      let element = elements[i];
      element.style.opacity = 1;
    }
  } else {
    for (let i = 0; i < elements.length; i++) {
      let element = elements[i];
      element.style.opacity = 0.5;
    }
  }

}

export function leftBarShowOpened(isShow) {
  // 10.07-ts-add:设置左侧功能栏打开区域的状态
  store.commit('SET_ISLEFTBARINFOSHOW', isShow);
}
