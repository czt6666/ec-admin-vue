import {default as UnitConversion} from "../../utils/unitConversion";

const anno = {
  state: {
    fileList: [
      {
        paintColor: "0 0 0",
        paintWidth: 50,
        annos: [],
        fileName: "",
        hideAnnoArray: []
      }
    ],
    activeFile: 0,
    save: false
  },
  mutations: {
    SET_PAINT_WIDTH(state, value) {
      state.fileList[state.activeFile].paintWidth = value;
    },
    SET_PAINT_COLOR(state, value) {
      state.fileList[state.activeFile].paintColor = value;
    },
    INIT_NEW_PAGE_ANNO(state, {annos, fileName}) {
      let index = state.fileList.findIndex(file => file.fileName === fileName);
      if (index <= 0) {
        if (!state.save) {
          state.fileList = [];
        }
        state.fileList.push({
          fileName: fileName,
          annos: annos,
          paintColor: "0 0 0",
          paintWidth: 50,
          hideAnnoArray: []
        });
        state.activeFile = state.fileList.length - 1;
      } else {
        state.activeFile = index;
      }
    },
    ADD_ANNO(state, anno) {
      let annos = state.fileList[state.activeFile].annos[anno.nPageNum - 1];
      if (anno.annoInfo[4].strVal === "Hand") {
        anno.paintWidth = (state.fileList[state.activeFile].paintWidth / 100) * 2.646;
        anno.paintColor = state.fileList[state.activeFile].paintColor;
      }
      anno.delete = false;
      anno.move = false;
      anno.reply = false;
      anno.hide = false;
      annos.push(anno);
    },
    DELETE_ANNO(state, {page, id}) {
      let annos = state.fileList[state.activeFile].annos[page];
      const delAnno = annos.find(anno => anno.id === id);
      delAnno.delete = true;
      if (delAnno.state === 2) {
        delAnno.state = -1;
      } else if (delAnno.state === 0) {
        delAnno.state = 2;
      }
    },
    MOVE_ANNO(state, {page, id}) {
      let annos = state.fileList[state.activeFile].annos[page];
      const moveAnno = annos.find(anno => anno.id === id);
      moveAnno.move = true;
    },
    REPLY_ANNO(state, {page, id}) {
      let annos = state.fileList[state.activeFile].annos[page];
      const replyAnno = annos.find(anno => anno.id === id);
      replyAnno.reply = true;
    },
    HIDE_ANNO(state, {page, id, value}) {
      let annos = state.fileList[state.activeFile].annos[page];
      const hideAnno = annos.find(anno => anno.id === id);
      hideAnno.hide = value;
      const hideAnnoArray = state.fileList[state.activeFile].hideAnnoArray;
      if (hideAnnoArray.includes(hideAnno)) {
        const index = hideAnnoArray.indexOf(hideAnno);
        hideAnnoArray.splice(index, 1);
      } else {
        hideAnnoArray.push(hideAnno);
      }
    },
    CLEAR_HIDE_ANNO_ARRAY(state) {
      state.fileList[state.activeFile].hideAnnoArray = [];
    },
    ANNO_SAVE(state, anno) {
      let annos = state.fileList[state.activeFile].annos[anno.nPageNum - 1];
      const index = annos.findIndex(old => old.id === anno.id);
      annos[index] = anno;
    }
  },
  actions: {},
  getters: {
    // 获取签批画笔宽度
    annoPaintWidth: state => {
      let paintWidth = state.fileList[state.activeFile].paintWidth;
      return UnitConversion.mmConversionPx((paintWidth / 100) * 2.646);
    },
    // 获取签批画笔颜色
    annoPaintColor: state =>
      state.fileList[state.activeFile].paintColor,
    // 获取指定页面的所有注释，page：页面，mode：0-all;1-no delete;2-only delete;3-hide;
    annoIndexPageByType: state => (page, mode) => {
      let annos = state.fileList[state.activeFile].annos[page];
      if (annos === undefined) {
        return [];
      } else {
        if (mode === 0) {
          return annos;
        } else if (mode === 1) {
          return annos.filter(anno => anno.delete === undefined || anno.delete === false);
        } else if (mode === 2) {
          return annos.filter(anno => anno.delete === true);
        } else if (mode === 3) {
          return annos.filter(anno => anno.hide === true);
        }
      }
    },
    // 获取指定页面的指定id的注释
    annoIndexPageById: state => (page, id) => {
      let annos = state.fileList[state.activeFile].annos[page];
      if (annos === undefined || annos === null) {
        return null;
      } else {
        return annos.find(anno => anno.id = id);
      }
    },
    // 获取显示的所有注释
    annoFileShow: state => {
      let annos = state.fileList[state.activeFile].annos;
      return annos.map(page =>
        page.filter(anno => anno.delete === undefined || anno.delete === false)
      );
    },
    // 获取所有注释
    annoFileAll: state => state.fileList[state.activeFile].annos,
    // 获取注释是否有改动
    annoIsChange: state => {
      const annosList = state.fileList[state.activeFile].annos;
      let result = {
        save: false,
        delete: false
      }
      if (annosList !== null && annosList !== undefined && annosList.length !== 0) {
        for (let i = 0; i < annosList.length; i++) {
          for (let j = 0; j < annosList[i].length; j++) {
            // 注释新增或改动，可以保存
            if (annosList[i][j].state === 2) {
              result.save = true;
            }
            // 注释可以删除
            if (annosList[i][j].delete === false) {
              result.delete = true;
            }
          }
        }
      }
      return result;
    },
    hideAnnoArray: state => {
      return state.fileList[state.activeFile].hideAnnoArray;
    }
  }
};

export default anno;
