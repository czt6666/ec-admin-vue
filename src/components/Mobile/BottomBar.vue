<!--
<template>
  <div class="botContainer" id="footer">
    &lt;!&ndash; 左侧展示左旋、单页等 &ndash;&gt;
    <ul class="bot_func bot_left">
      <li>
        <a @click.prevent="openFlag && download()" v-permission="'mDownload'">
          <svg-icon icon-class="exit" class-name="iconClass"></svg-icon>
        </a>
      </li>
      &lt;!&ndash; 左旋 &ndash;&gt;
      <li>
        <a @click.prevent="openFlag && lRotate()" v-permission="'mRotate'">
          <svg-icon icon-class="lRotate" class-name="iconClass"></svg-icon>
        </a>
      </li>
      &lt;!&ndash; 单页 &ndash;&gt;
      <li>
        <a @click.prevent="openFlag && singlePage()" v-permission="'mTypeSetting'">
          <svg-icon icon-class="singlepage" class-name="iconClass"></svg-icon>
        </a>
      </li>
      &lt;!&ndash; 单连 &ndash;&gt;
      <li>

        <a @click.prevent="openFlag && singlePageCon()" v-permission="'mTypeSetting'">
          <svg-icon icon-class="singlepagecon" class-name="iconClass"></svg-icon>
        </a>
      </li>
      &lt;!&ndash; 适宽 &ndash;&gt;
      <li>
        <a @click.prevent="openFlag && fitWidth()" v-permission="'mFit'">
          <svg-icon icon-class="fitwidth" class-name="iconClass"></svg-icon>
        </a>
      </li>
      &lt;!&ndash; 缩小 &ndash;&gt;
      <li>
        <a @click.prevent="openFlag && zoomOut()" v-permission="'mZoom'" id="zoomOut">
          <svg-icon icon-class="zoomout" class-name="iconClass"></svg-icon>
        </a>
      </li>
    </ul>
    &lt;!&ndash; 中间展示页数区域 &ndash;&gt;
    <div class="page_area">
      <span class="alignIconByCenterLine" @click="openFlag && prevPage()" v-permission="'mPages'">
        <svg-icon icon-class="page_pre" class-name="pageIcon"></svg-icon>
      </span>
      <label v-permission="'mPages'">
        <input class="bot_curPage" v-model.number="curPage" size="mini"
          @keydown.enter="openFlag && pageChange(curPage)" />
        <span class="bot_totalPage">&nbsp;/ {{ pageCount }}</span>
      </label>
      <span class="alignIconByCenterLine" @click="openFlag && nextPage()" v-permission="'mPages'">
        <svg-icon icon-class="page_next" class-name="pageIcon"></svg-icon>
      </span>
    </div>
    &lt;!&ndash; 右侧展示右旋、双页等 &ndash;&gt;
    <ul class="bot_func bot_right">
      &lt;!&ndash; 右旋 &ndash;&gt;
      <li>
        <a @click.prevent="openFlag && rRotate()" v-permission="'mRotate'">
          <svg-icon icon-class="rRotate" class-name="iconClass"></svg-icon>
        </a>
      </li>
      &lt;!&ndash; 双页 &ndash;&gt;
      <li>
        <a @click.prevent="openFlag && doublePages()" v-permission="'mTypeSetting'">
          <svg-icon icon-class="twopages" class-name="iconClass"></svg-icon>
        </a>
      </li>
      &lt;!&ndash; 双连 &ndash;&gt;
      <li>
        <a @click.prevent="openFlag && doublePagesCon()" v-permission="'mTypeSetting'">
          <svg-icon icon-class="twopagescon" class-name="iconClass"></svg-icon>
        </a>
      </li>
      &lt;!&ndash; 适高 &ndash;&gt;
      <li>
        <a @click.prevent="openFlag && fitHeight()" v-permission="'mFit'">
          <svg-icon icon-class="fitheight" class-name="iconClass"></svg-icon>
        </a>
      </li>
      &lt;!&ndash; 放大 &ndash;&gt;
      <li>
        <a @click.prevent="openFlag && zoomIn()" v-permission="'mZoom'" id="zoomIn">
          <svg-icon icon-class="zoomin" class-name="iconClass"></svg-icon>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "BottomBar",
  props: {
    tabIndex: Object,  // 传入的tab相关信息
    /* 下载功能 */
    download: Function, //下载
    /* 翻页功能 */
    prevPage: Function,  // 上一页
    nextPage: Function,  // 下一页
    pageChange: Function,  // 根据输入的页号跳转
    /* 旋转功能 */
    lRotate: Function,  // 左旋
    rRotate: Function,  // 右旋
    /* 阅读模式 */
    singlePage: Function,  // 单页
    doublePages: Function,  // 双页
    singlePageCon: Function,  // 单连
    doublePagesCon: Function,  // 双连
    /* 适宽适高 */
    fitWidth: Function,  // 适宽
    fitHeight: Function,  // 适高
    /* 缩放 */
    zoomIn: Function,  // 缩小
    zoomOut: Function,  // 放大

  },
  data() {
    return {
      curPage: 1,  // 输入框中的当前页
    }
  },
  computed: {
    ...mapGetters(["currentPage"]),
    // 是否打开文件的flag，若未打开则为假值
    openFlag() {
      return this.tabIndex.imageFlag ? this.tabIndex.imageFlag.length : 0
    },
    // 总页数
    pageCount() {
      if (this.openFlag) {
        return this.tabIndex.count
      }
      return 0
    }
  },
  watch: {
    // 实际页号与输入框显内示的页号同步
    currentPage: function (newPage) {
      this.curPage = newPage + 1
    },

  },

  mounted() {
    const topBar = document.getElementById("footer");
    topBar.addEventListener("touchstart", (e) => {
      e.preventDefault();
    }, {passive: false});
  },
  methods: {
  },
}
</script>

<style lang="scss" scoped>
/* 整个布局容器 */
.botContainer {
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 5vh;
  background-color: #f5f5f5;
  box-shadow: 0px -4px 10px rgba(0, 0, 0, 0.1);

  /* 底部功能区 */
  .bot_func {
    margin: 0;
    padding: 0;
    flex: 1;
    display: flex;
    justify-content: space-around;
    align-items: center;

    li {
      flex: 1;
      height: 100%;
      list-style: none;

      a {
        display: flex;
        justify-content: center;
        align-items: center;
        // 继承中线对齐样式
        //@extend .alignIconByCenterLine;
        width: 100%;
        height: 100%;
      }
    }

    // 功能区的图标样式
    .iconClass {
      width: 18px;
      height: 18px;
    }
  }

  /* 中心页面区域 */
  .page_area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;

    //margin-left: 10px;
    // 当前页的输入框
    .bot_curPage {
      width: 9.33vw;
      height: 3.75vh;
      font-size: 3.73vw;
      text-align: center;
      border: 1px solid #ccc;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    }

    // 总页数
    .bot_totalPage {
      font-size: 3.73vw;
    }

    // 翻页的按钮样式
    .pageIcon {
      width: 6.4vw;
      height: 6.4vw;
      //width: 24px;
      //height: 24px;
    }
  }

  /* 功能区左侧 */
  .bot_left {}

  /* 功能区右侧 */
  .bot_right {
    flex-direction: row-reverse;
  }
}

// 将图标根据中线对齐
.alignIconByCenterLine {
  // 解决svg图标中线对齐
  display: inline-flex;
  align-items: center;
}

// 横屏适配
@media screen and (orientation: landscape) {
  .botContainer {
    height: 5.25vw;

    .page_area {
      justify-content: space-around;

      .bot_curPage {
        width: 3.75vw;
        height: 3.75vw;
        font-size: 3.73vh;
      }

      .bot_totalPage {
        font-size: 3.73vh;
      }

      .iconClass {
        width: 6.4vh;
        height: 6.4vh;
      }
    }

    .bot_right span {
      font-size: 3.2vh;
    }
  }
}
</style>
-->
