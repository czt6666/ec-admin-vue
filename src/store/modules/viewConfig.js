import { default as api } from "../../utils/api";
import {deepAssign, deepClone} from "../../utils/UseableTool";

const defaultWebOFDConfig = {
  topTitleConfig: {
    isTitle: {
      isActive: true,
      description: "顶部标题栏"
    }, //顶部标题栏
    isTabName: {
      isActive: true,
      description: "文档名称"
    }, //标题栏-文档名称
    isTabSwitch: {
      isActive: false,
      description: "标签页切换"
    }, //标签页切换
    isUserOrxReader: {
      isActive: true,
      description: "用户头像"
    }, //用户头像及下拉菜单
    isHelpDoc: {
      isActive: true,
      description: "帮助文档"
    },
    isShareFile: {
      isActive: true,
      description: "分享文档"
    }, //分享文档
    isMetaData: {
      isActive: true,
      description: "文档属性"
    }, //文档属性
    isAddMetaData: {
      isActive: true,
      description: "编辑元数据"
    }, //是否可编辑元数据
    isHtmlConversion: {
      isActive: false,
      description: "HTML转换"
    },
    isProcessor: {
      isActive: true,
      description: "文档操作"
    },  // 文档操作
    isOcr: {
      isActive: true,
      description: "内容提取"
    }
  },
  topMenuConfig: {
    isTopMenu: {
      isActive: true,
      description: "顶部菜单栏"
    }, // 顶部菜单栏
    isOpenFile: {
      isActive: true,
      description: "打开文件"
    }, // 打开文件
    isDownload: {
      isActive: true,
      description: "下载文件"
    }, // 下载文件
    isSign: {
      isActive: true,
      description: "签章"
    }, // 签章
    isFit: {
      isActive: true,
      description: "适应页面"
    }, // 适应页面
    isTypeSetting: {
      isActive: true,
      description: "阅读模式"
    }, // 阅读模式
    isCursor: {
      isActive: true,
      description: "鼠标状态"
    }, // 鼠标状态
    isSearch: {
      isActive: true,
      description: "搜索"
    }, // 搜索
    isZoom: {
      isActive: true,
      description: "放缩"
    }, // 放缩
    isRotate: {
      isActive: true,
      description: "旋转"
    }, // 旋转
    isAnnos: {
      isActive: true,
      description: "批注"
    }, // 批注
    isFullscrean: {
      isActive: true,
      description: "全屏"
    }, // 全屏
    isBackground: {
      isActive: false,
      description: "背景"
    }, // 背景
    isPrint: {
      isActive: true,
      description: "打印"
    }, // 打印
    isPages: {
      isActive: true,
      description: "翻页"
    }, // 翻页
    xReader: {
      isActive: false,
      description: "插件"
    },  // 插件
    printMask: {
      isActive: true,
      description: "打印掩膜"
    },  // 打印掩膜
    pageMask: {
      isActive: true,
      description: "页面掩膜"
    }, // 页面掩膜
  },
  leftBarConfig: {
    isLeftBar: {
      isActive: true,
      description: "左侧导航栏"
    }, //左侧整栏
    isOpenRencentFile: {
      isActive: false,
      description: "最近打开"
    }, //最近打开
    //"isSearch",//搜索，同topMenu一起管理，leftBar里面的永远不会放开，仅提示作用
    isOutLine: {
      isActive: true,
      description: "大纲"
    }, //大纲
    isThumbnail: {
      isActive: true,
      description: "缩略图"
    }, //缩略图
    isTags: {
      isActive: true,
      description: "语义树"
    }, //语义树
    isTagEdit: {
      isActive: false,
      description: "编辑语义树"
    },//语义树编辑
    //"isSign",//签章，同topMenu一起管理，leftBar里面的永远不会放开，仅提示作用
    isMultiDoc: {
      isActive: true,
      description: "多文档"
    }, //多文档
    isLayer: {
      isActive: true,
      description: "图层"
    }, //图层
    isBookMark: {
      isActive: true,
      description: "书签"
    }, //书签
    isSignature: {
      isActive: true,
      description: "注释"
    }, // 注释
    isAttachment: {
      isActive: true,
      description: "附件"
    }, //附件
    isWaterMark: {
      isActive: true,
      description: "水印"
    }, //水印

  },
  mobileConfig: {
    isMobile: {
      isActive: true,
      description: "移动端"
    },
    mDownload: {
      isActive: true,
      description: "下载"
    }, //下载
    mRotate: {
      isActive: false,
      description: "旋转"
    }, //旋转
    mTypeSetting: {
      isActive: false,
      description: "阅读模式"
    }, //阅读模式
    mFit: {
      isActive: false,
      description: "适应页面"
    }, //适应页面
    mZoom: {
      isActive: true,
      description: "放缩"
    }, //放缩
    mPages: {
      isActive: true,
      description: "页码"
    } //页码
  }
}

const viewConfig = {
  state: {
    permission: {
      dcsPermissions: [],
      //webofd配置---控制是否可视
      //todo: 权限细分，例如水印、语义树、注释等添加编辑权限，补全登录模式下角色及用户修改权限
      webofdPermissions: {
        topMenuPers: [
          "isTopMenu",//顶部菜单栏
          "isOpenFile",//打开文件
          "isDownload",//下载文件
          "isSign",//签章
          "isFit",//适应页面
          "isTypeSetting",//阅读模式
          "isCursor",//鼠标状态
          "isSearch",//搜索
          "isZoom",//放缩
          "isRotate",//旋转
          "isAnnos",//批注
          "isFullscrean",//全屏
          // "isBackground",//背景
          "isPrint",//打印
          "isPages",//翻页
        ],

        topTitlePers: [
          "isTitle",//顶部标题栏
          "isTabName",//标题栏-文档名称
          // "isTabSwitch",//标签页切换
          "isUserOrxReader",//用户头像及下拉菜单
          // "isShareFile",//分享文档
          "isMetaData",//文档属性
          "isAddMetaData",//是否可编辑元数据
        ],

        leftBarPers: [
          "isLeftBar",//左侧整栏
          "isOpenRencentFile",//最近打开
          //"isSearch",//搜索，同topMenu一起管理，leftBar里面的永远不会放开，仅提示作用
          "isOutLine",//大纲
          "isThumbnail",//缩略图
          "isTags",//语义树
          //"isSign",//签章，同topMenu一起管理，leftBar里面的永远不会放开，仅提示作用
          "isMultiDoc",//多文档
          "isLayer",//图层
          "isBookMark",//书签
          "isSignature",// 注释
          "isAttachment",//附件
          "isWaterMark",//水印
        ],

        mobilePers: [
          "mDownload",//下载
          // "mRotate",//旋转
          // "mTypeSetting",//阅读模式
          // "mFit",//适应页面
          "mZoom",//放缩
          "mPages",//页码

        ]
      },
      webofdConfig: {
        topTitleConfig: deepClone(defaultWebOFDConfig.topTitleConfig),
        topMenuConfig: deepClone(defaultWebOFDConfig.topMenuConfig),
        leftBarConfig: deepClone(defaultWebOFDConfig.leftBarConfig),
        mobileConfig: deepClone(defaultWebOFDConfig.mobileConfig)
      },

    },
    flagForDcs: false,
    /** 2023/12/27-ts-add: 标识当前服务模式：login:登录模式 nologin: 非登录模式*/
    serviceModel: undefined,
    /** 2023/12/28-ts-add: 数据库权限与前端配置映射map*/
    loginPermissionMap: undefined,
    /** 2023/12/28-ts-add: 映射好的权限列表*/
    mappedPermissionList: undefined
  },
  mutations: {
    //dcs权限赋值
    SET_DCSPERMISSIONS: (state, value) => {
      state.permission.dcsPermissions = value;
    },

    SET_FLAGFORDCS: (state, value) => {
      state.flagForDcs = value;
    },

    /** 2023/12/27-ts-add: 标识当前服务模式：login:登录模式 nologin: 非登录模式*/
    SET_SERVICEMODEL: (state, value) => {
      state.serviceModel = value
    },

    SET_LOGINPERMISSIONMAP: (state, value) => {
      state.loginPermissionMap = value
    },

    SET_MAPPEDPERMISSIONLIST: (state, value) => {
      state.mappedPermissionList = value
    },

    SET_WEBOFD_CONFIG: (state, {configName, key, value}) => {
      state.permission.webofdConfig[configName][key].isActive = value;
    },
  },
  actions: {
    // 获取dcs权限控制
    GetDcsPermissions({ commit }) {
      return new Promise((resolve, reject) => {
        api({
          url: "/viewer/getDcsPermission",
          method: "post",
          data: window.templateParams
        })
          .then(data => {
            resolve(data);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    // 获取默认配置
    GetViewConfig({state}) {
      return new Promise((resolve, reject) => {
        api({
          url: "/file/getConfig",
          method: 'post'
        }).then(res => {
          const config = JSON.parse(res);
          deepAssign(state.permission.webofdConfig, config);
          resolve();
        }).catch(err => {
          reject();
        });
      });
    },
    // 重置配置
    RESET_WEBOFD_CONFIG({state}) {
      return new Promise(resolve => {
        for (const webofdConfigKey in state.permission.webofdConfig) {
          state.permission.webofdConfig[webofdConfigKey] = deepClone(defaultWebOFDConfig[webofdConfigKey]);
        }
        resolve();
      });
    }
  }
};

export default viewConfig;
