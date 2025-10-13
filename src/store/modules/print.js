const print = {
  state: {
    isPrint: false, // 打印状态
    fileId: "", // 要打印的文件uuid
    printForm: {
      mask: true,  // 掩膜
      stamp: true,  // 签章
      template: true,  // 模板
      annotation: true,  // 注释
      watermark: true,  // 水印
      dpi: 96,  // 默认是高清打印 96=一般 144=标清 300=高清 600=超清
      range: [] , // 默认先打印全部页面
      printType:"1", //1=默认打印 2=所见即所得
      taoPrints: []
    },
  },
  mutations: {
    CHANGE_IS_PRINT(state, status) {
      state.isPrint = status;
    },
    SET_PRINT_FILE_NAME(state, name) {
      state.fileId = name;
    },
    SET_PRINT_Type(state, type) {
      state.printForm.printType = type;
    },
    SET_PRINT_DPI(state, dpi) {
      state.printForm.dpi = dpi;
    },
    SET_PRINT_TAO(state, value) {
      state.printForm.taoPrints.push(value);
    },
    REMOVE_PRINT_TAO(state, id) {
      state.printForm.taoPrints = state.printForm.taoPrints.filter(tao => tao.id !== id);
    }
  },
  getters:{
    printType : state => state.printForm.printType,
    printDpi: state => state.printForm.dpi,
    taoPrints: state => {
      return state.printForm.taoPrints.filter(tao => {
        return tao.type === 1;
      }).map(tao => {
        return {
          box: tao.box,
          pageNum: tao.pageNum
        }
      });
    },
    taoShows: state => {
      return state.printForm.taoPrints.filter(tao => {
        return tao.type === 2;
      }).map(tao => {
        return {
          box: tao.box,
          pageNum: tao.pageNum
        }
      });
    }
  }
};

export default print;
