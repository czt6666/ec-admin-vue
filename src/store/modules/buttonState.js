const buttonState = {

  state: {
    //注：true是可用，false是置灰
    //左侧功能栏
    isBarShow: {
      // openRecentFile: true,//最近打开
      outline: false,//大纲
      thumbnail: false,//缩略图
      tags: false,//语义树
      xSign: false,
      xEdit: false,
      layer: false,
      bookmark: false,
      annotations: false, // 注释
      search: false,
      watermark: false,
      attachment: false,//附件
      multiDoc: false,//多文档
      textExtraction: false,  // 文本提取
    },

    // 10.07-ts-add: 获取左侧功能栏打开区域是否显示的状态
    isLeftBarInfoShow: false,

    //注：true是可用，flase是置灰
    // 顶部菜单栏
    topMenuComp: {
      xVisible: false, //全局可视
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
      xPrintMask: false, //打印掩膜
      xPageMask: false, // 页面掩膜
      xScreenShot: false, // 截图
    },

    // 顶部标题栏
    titleComp: {
      xVisible: false,//全局可视
      xSwitch: true,//但多标签页切换
      xFileAttribute: false,//文档属性
      xShare: false,//分享
      xUser: true,//用户及其下拉菜单
      xTitle: true,//标题栏
      xProcessor: true, // 文档处理
      xOcr: true, // 内容提取
      xHelpDoc: true, // 帮助文档
    },

    filePermission: {
      edit: true,       // 编辑-所有编辑功能，为false时注释、导出、签名、水印皆为false
      anno: true,       //  |----注释-注释添加、删除、注释回复信息框
      export: true,     //  |----导出-保存、下载、注释导出、语义树导出、附件下载
      sign: true,       //  |----签名-签章
      watermark: true,  //  |----水印-暂无编辑
      screen: true,     // 截屏
      print: true,      // 打印
      printCopies: -1,  // 打印份数
      startDate: "",    // 有效期开始日期
      endDate: ""       // 有效期结束日期
    }
  },


  mutations: {
    // 10.12-ts-add: 修改state中的对象的单个属性值，例如isBarShow中的outline
    // key为待修改的属性的名称 例如： "isBarShow.outline"
    SET_STATEOBJATTRIBUTE: (state, { key, value }) => {
      if (-1 !== key.indexOf(".")) {
        let attributeNameList = key.split(".")
        state[attributeNameList[0]][attributeNameList[1]] = value
      } else {
        state[key] = value
      }
    },

    //设置顶部功能栏状态
    SET_TOPMENUCOMP: (state, value) => {
      for (const valueKey in value) {
        if (state.topMenuComp[valueKey] !== undefined) {
          state.topMenuComp[valueKey] = value[valueKey];
        }
      }
    },

    //设置顶部标题栏状态
    SET_TITLECOMP: (state, value) => {
      for (const valueKey in value) {
        if (state.titleComp[valueKey] !== undefined) {
          state.titleComp[valueKey] = value[valueKey];
        }
      }
    },

    //设置左侧功能栏状态
    SET_ISBARSHOW: (state, value) => {
      state.isBarShow = value;
    },

    // 10.07-ts-add:设置左侧功能栏打开区域的状态
    SET_ISLEFTBARINFOSHOW: (state, value) => {
      state.isLeftBarInfoShow = value;
    },

    SET_FILEPERMISSION: (state, value) => {
      if (!value.edit) {
        value.anno = false;
        value.export = false;
        value.sign = false;
        value.watermark = false;
      }
      state.filePermission = value;
    }


  },
  actions: {

  }
};

export default buttonState;
