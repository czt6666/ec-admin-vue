<template>
  <div class="topContainer" id="header">
    <div v-if="!annoState" style="display: flex; justify-content: end; width: 100%">
      <!-- 标题 -->
      <div class="optBtns" style="justify-content: flex-start; padding-left: 10px">
        <div class="optBtn optItem" :class="[downloadDisable ? 'optBtnDisable' : '']" @click="downloadFile">
          <img :src="btnImages.downloadFile" alt="" />
        </div>
        <div class="optBtn optItem" :class="[fitDisable ? 'optBtnDisable' : '']" @click="setPageFit">
          <img :src="btnImages.fitReset" alt="" />
        </div>
      </div>
      <div class="titleBox" style="flex: 1">
        <span class="top_title">{{ filename }}</span>
      </div>
      <div class="optBtns" style="justify-content: flex-end; padding-right: 10px">
        <div class="optBtn optItem" :class="[annoDisabled ? 'optBtnDisable' : '']" @click="setAnnoState(true)">
          <img :src="btnImages.annoHand" alt=""/>
        </div>
        <div class="optBtn optItem" :class="[annoDisabled ? 'optBtnDisable' : '']" @click="addStamp">
          <img :src="btnImages.annoStamp" alt=""/>
        </div>
      </div>
    </div>
    <div v-else style="display: flex; justify-content: space-between; width: 100%">
      <!-- 标题 -->
      <div class="titleBox" style="width: 20%; margin-left: 10px;">
        <span class="top_title">签批模式<i class="el-icon-arrow-right"></i></span>
      </div>
      <div class="optBtns">
        <div class="optBtn optItem" style="padding: 0">
          <ColorSelector
            class="colorSelector"
            v-model="annoColor"
            :predefine="predefine"
            :styles="'width: 345px'"
            funFormatter="rgbValue"
            :colorChange="colorChange"/>
        </div>
        <div class="optBtn optItem" @click="setAnnoState(false)">
          <img :src="btnImages.close" alt="" />
        </div>
      </div>
    </div>

    <div v-if="fileShowName !== undefined" class="page-sus" id="pageSus">
      <span style="color: white; font-size: 15px">{{ currentPage + 1 }}/{{ pageCount }}</span>
    </div>

  </div>
</template>

<script>
import {mapGetters} from "vuex";
import imageMap from "../../utils/imageMap";
import ImageMap from "../../utils/imageMap";

export default {
  name: "TopBar",
  data() {
    return {
      btnImages: imageMap,
      scrollTimeout: null,
      annoState: false,
      // annoColor: '#00ff00',
      annoColor: '#000000',
      predefine: ["#000000", "#74777b", "#03adee", "#0471c3", "#08b057", "#f6070a", "#db6d13", "#f5bc0a", "#f5f90a", "#8fcc56"],
    }
  },
  computed: {
    ...mapGetters(['fileShowName', 'currentPage', 'pageCount', 'filePermission', 'annoPaintColor']),
    filename() {
      return this.fileShowName ? this.fileShowName : "永中 webOFD";
    },
    annoDisabled() {
      return !this.$store.getters.topMenuComp.xAnnos || !this.filePermission.anno;
    },
    downloadDisable() {
      return !this.$store.getters.topMenuComp.xDownload
    },
    fitDisable() {
      return !this.$store.getters.topMenuComp.xfit;
    }
  },
  mounted() {
    const topBar = document.getElementById("header");
    topBar.addEventListener("touchstart", (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, {passive: false});

    document.getElementById("main").addEventListener("scroll", (e) => {
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      document.getElementById("pageSus").style.opacity = '1';
      this.scrollTimeout = setTimeout(() => {
        document.getElementById("pageSus").style.opacity = '0';
      }, 3000)
    });

    this.annoColor = `rgb(${this.annoPaintColor.replace(/\s+/g, ", ")})`;
  },
  methods: {
    useTopMenuSupport(type, param) {
      this.$bus.$emit("topMenuSupport", type, param);
    },
    setAnnoState(state) {
      if (state) {
        // this.useTopMenuSupport(3, 7);
        this.useTopMenuSupport(3, 114);
      } else {
        this.$store.commit("SET_CURSOR_TYPE", {cursorSwitch: 1});
      }
      this.annoState = state;
    },
    downloadFile() {
      if (!this.downloadDisable) {
        this.useTopMenuSupport(1);
      }
    },
    setPageFit() {
      if (!this.fitDisable) {
        this.useTopMenuSupport(2, 0);
      }
    },
    colorChange(val) {
      this.$store.commit("SET_PAINT_COLOR", val);
    },
    addStamp() {
      this.$bus.$emit("DrawSignatureCanvas", this.currentPage,ImageMap.stampTest)
    }
  }
}
</script>

<style lang="scss" scoped>
// 布局
.topContainer {
  display: flex;
  justify-content: flex-end;
  height: 5vh;
  background-color: #f6f7f8;
  border-bottom: 1px solid #ebebeb;
  user-select: none;

  .titleBox {
    display: flex;
    justify-content: center;
    align-items: center;
    //width: 50%;

    // 顶部标题文字
    .top_title {
      text-align: center;
      font-size: 3.73vw;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .optBtns {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;

    .optBtn {
      aspect-ratio: 1 / 1;
      max-height: 80%;
      height: 30px;
      //width: 30px;
      border: none;
      background-color: #f6f7f8;
      padding: 5px;
      box-shadow: 1px 0 1px 0 #bdbdbd, 0 1px 1px #bdbdbd, -1px 0px 1px #fdf4e4, 0px -1px 1px #fdf4e4;
      user-select: none;
      border-radius: 5px;
      display: flex;
    }

    .optBtn:active {
      box-shadow: inset 1px 0 1px 0 #bdbdbd, inset 0 1px 1px #bdbdbd, inset -1px 0px 1px #fdf4e4, inset 0px -1px 1px #fdf4e4;
    }

    .optItem + .optItem {
      margin-left: 5px;
    }

    .optBtnDisable {
      filter: grayscale(1);
      pointer-events: none;
    }

    input {
      border: none;
      height: 100%;
      background: transparent;
    }
  }

}

.colorPicker {
  width: inherit;
  height: inherit;

  > /deep/ .el-color-picker__trigger {
    width: inherit;
    height: inherit;
    border: none;
    cursor: default;

    > .el-icon-arrow-down:before{
      content: '';
    }
  }
}

.page-sus {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  width: 60px;
  height: 30px;
  border-radius: 15px;
  background-color: #00000088;
  z-index: 999;
  bottom: 10%;
  left: 50%;
  transform: translate(-50%, 50%);
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

@media screen and (orientation: landscape) {
  .topContainer {
    height: 6vw;

    .titleBox .top_title {
      font-size: 3.73vh
    }

  }
}
</style>
