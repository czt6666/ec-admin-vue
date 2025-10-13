const fileState = {
  state: {
    fileType: 0, // 0-ofd, 1-pdf
    fileShowName: undefined, // 文件展示名 100%
    fileId: undefined, // 文件UUID
    fileIsChange: false,//文档是否被修改
    pageCount: 0,  // 页数
    currentPage: -1, // 当前页，从0开始，0，1，2，3，4，5
    zoomScale: 1.0,      //缩放比为1
    pageLayout: 0,      // 打开默认单页连续的状态  0-单连，1-双连，2-单页，3-双页
    rotateTimes: 0,       //旋转角度调为0
    cursorSwitch: 1,  //光标形状，手型=0、箭头=1，默认箭头，-1=其他状态

    inputSearchValue: "",//搜索关键字
    currentSearchData: {},//当前搜索值的box信息等
    tagTreeHighLightRegion:[],
    tabItemDataList: [],

    fileInfo: {},
    pageDataList: [
      {
        pageUrl: [],
        pageSize: {
          width: 794,
          height: 1123,
          rotate: 0,
          load: false,
        },
        pageNumber: 0,
        loadFlag: 0,
      }
    ],
    systemState: {},

    fileImage: [],//图片数组
    fileImageFlag: [],//图片加载标识

    ie11Flag: false, //ie11浏览器标识
    browserFlag: 0, //浏览器标识 0-edge/chrome，1-ie11，2-旧版firefox

    mobileProportion: 1.0,
    dpr: 1.0,

    esealIsChange: false, // 是否是盖章改变文档
    esealData: [], // 签章数据
    signVerify: {
      isFailed: false,//当前章验章是否失败
      currentVerifyData: null//当前验章的章的数据（id，位置信息）
    },//验章数据

    fullScreen: false,  // 全屏
    pageDrawState: {    // 页面绘制状态，激活状态互斥或都不激活
      annoFlag: 0,      // 批注，值大于0时为各类注释的绘制状态
      tagsFlag: false,  // 语义树
      screenShotFlag: false,  // 截图
    }
  },
  mutations: {
    FILE_STATE_INIT: (state, value = null) => {
      if (value !== null && value !== undefined && typeof value !== "object") {
        state.fileType = value.fileType;
        state.fileShowName = value.fileShowName;
        state.pageCount = value.pageCount;
      } else {
        state.fileType = 0;
        state.fileShowName = undefined;
        state.fileId = undefined;
        state.fileIsChange = false;
        state.esealIsChange = false;
        state.pageCount = 0;
        state.currentPage = -1;
        state.zoomScale = 1.0;
        state.pageLayout = 0;
        state.rotateTimes = 0;
        state.cursorSwitch = 1;
        state.inputSearchValue = "";
        state.currentSearchData = {};
        state.tabItemDataList = [];
        state.fileImage = [];
        state.fileImageFlag = [];
        state.ie11Flag = false;
        state.browserFlag = 0;
        state.pageDrawState = {
          annoFlag: 0,
          tagsFlag: false,
          screenShotFlag: false,
        };
        state.pageDataList = [];
      }
    },
    PUSH_TABITEMDATA: (state, value) => {
      state.tabItemDataList.push(value)
    },
    DELETE_TABITEMDATABYID: (state, fileId) => {
      let deleteIndex =
        state.tabItemDataList.findIndex((listValue) => listValue.fileId === fileId)
      deleteIndex !== -1 ? state.tabItemDataList.splice(deleteIndex, 1) : "do nothing"
    },
    SET_FILE_ID: (state, value) => {
      state.fileId = value
    },
    SET_FILE_SHOW_NAME: (state, value) => {
      state.fileShowName = value
    },
    SET_FILETYPE: (state, value) => {
      state.fileType = value
    },
    SET_FILE_IS_CHANGE: (state, value) => {
      state.fileIsChange = value
    },
    SET_CURRENT_PAGE: (state, value) => {
      state.currentPage = value
    },
    SET_ZOOM_SCALE: (state, value) => {
      state.zoomScale = value
    },
    INIT_PAGE_DATA: (state, pageCount) => {
      state.pageCount = pageCount;
      for (let i = 0; i < pageCount; i++) {
        const pageData = {
          pageUrl: [],
          pageSize: {
            width: 794,
            height: 1123,
            rotate: 0,
            load: false,
          },
          pageNumber: 0,
          loadFlag: 0,
        }
        state.pageDataList.push(pageData);
      }
    },
    SET_PAGE_INDEX_SIZE_DATA: (state, {index, pageSize}) => {
      // 将传入的尺寸属性复制到对象中存储，并修改load属性
      Object.assign(state.pageDataList[index].pageSize, pageSize);
      state.pageDataList[index].pageSize.load = true;
    },
    SET_PAGE_INDEX_URL_DATA: (state, {index, path}) => {
      state.pageDataList[index].pageNumber = index;
      state.pageDataList[index].pageUrl.push(path);
      state.pageDataList[index].loadFlag = 1;
    },
    SET_PAGE_COUNT: (state, value) => {
      state.pageCount = value
    },
    SET_PAGE_LAYOUT: (state, value) => {
      state.pageLayout = value
    },
    SET_ROTATE_TIMES: (state, value) => {
      state.rotateTimes = value
    },

    SET_CURRENT_SEARCH_DATA: (state, value) => {
      state.currentSearchData = value
    },

    SET_FILE_IMAGE: (state, value) => {
      state.fileImage = value
    },

    SET_FILE_IMAGE_FLAG: (state, value) => {
      state.fileImageFlag = value
    },

    SET_FILE_IMAGE_DATA: (state, {index, imgPath}) => {
      state.fileImage[index] = imgPath;
      state.fileImageFlag[index] = 1;
    },

    SET_FILE_IMAGE_FLAG_INDEX: (state, value) => {
      state.fileImageFlag[value] = -1;
    },

    SET_FILE_IMAGE_FLAG_RELOAD_INDEX: (state, value) => {
      state.fileImageFlag[value] = 0;
    },

    SET_FILE_IMAGE_FLAG_ERROR_INDEX: (state, value) => {
      state.fileImageFlag[value] = -2;
    },

    SET_IE11FLAG: (state, value) => {
      state.ie11Flag = value
    },

    SET_BROWSER_FLAG: (state, value) => {
      state.browserFlag = value
    },

    SET_MOBILE_PROPORTION: (state, value) => {
      state.mobileProportion = value;
    },

    SET_DPR: (state, value) => {
      if (value > 2) {
        value = 2;
      }
      state.dpr = value;
    },

    SET_E_SEAL_IS_CHANGE: (state, value) => {
      state.esealIsChange = value
    },

    SET_E_SEAL_DATA: (state, value) => {
      state.esealData = value
    },

    SET_SIGNVERIFY: (state, { isFailed, currentVerifyData }) => {
      state.signVerify.isFailed = isFailed,
        state.signVerify.currentVerifyData = currentVerifyData
    },

    SET_FULLSCREEN: (state, value) => {
      state.fullScreen = value;
    },

    SET_TAGTREEHIGHLIGHREGION:(state,value) => {
      state.tagTreeHighLightRegion = value;
    },

    // 可能传参为{cursorSwitch: 0或1}、{annoFlag: 大于0}、{tagsFlag: true}、{screenShotFlag: true}
    SET_CURSOR_TYPE(state, value) {
      if (value && value instanceof Object) {
        const pageDrawState = {
          annoFlag: 0,
          tagsFlag: false,
          screenShotFlag: false
        }
        if (value.cursorSwitch !== undefined) {
          state.cursorSwitch = value.cursorSwitch;
        } else {
          for (const valueKey in value) {
            if (pageDrawState[valueKey] !== undefined) {
              pageDrawState[valueKey] = value[valueKey];
              break;
            }
          }
          state.cursorSwitch = -1;
        }
        state.pageDrawState = pageDrawState;
      }
    }
  },
  getters: {
    fileType: state => state.fileType,
    fileShowName: state => state.fileShowName,
    fileId: state => state.fileId,
    fileIsChange: state => state.fileIsChange,
    pageCount: state => state.pageCount,
    zoomScale: state => state.zoomScale,
    pageLayout: state => state.pageLayout,
    rotateTimes: state => state.rotateTimes,
    pageRotateTimes: state => (index) => {
      return state.rotateTimes + state.pageDataList[index].pageSize.rotate;
    },
    // 页面方向：true-纵向（0、180、-180），false-横向（90、270、-90、-270）
    pageDirection: state => {
      return state.rotateTimes === 0 || state.rotateTimes === 2 || state.rotateTimes === -2;
    },
    pageDirectionIndex: state => (index) => {
      const rotate = state.rotateTimes + state.pageDataList[index].pageSize.rotate;
      return rotate % 2 === 0;
    },
    currentPage: state => state.currentPage,

    cursorSwitch: state => state.cursorSwitch,
    inputSearchValue: state => state.inputSearchValue,
    currentSearchData: state => state.currentSearchData,
    tagTreeHighLightRegion: state => state.tagTreeHighLightRegion,
    fileImage: state => state.fileImage,
    fileImageFlag: state => state.fileImageFlag,

    ie11Flag: state => state.ie11Flag,
    browserFlag: state => state.browserFlag,
    mobileProportion: state => state.mobileProportion,
    dpr: state => state.dpr,

    esealIsChange: state => state.esealIsChange,
    esealData: state => state.esealData,
    signVerify: state => state.signVerify,
    fullScreen: state => state.fullScreen,
    annoFlag: state => state.pageDrawState.annoFlag,
    tagsFlag: state => state.pageDrawState.tagsFlag,
    screenShotFlag: state => state.pageDrawState.screenShotFlag,
    pageSize: (state) => {
      return state.pageDataList.map(page => {
        return page.pageSize;
      });
    },
  }
};
export default fileState;
