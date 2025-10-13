<template>
  <!-- 2023.7.26 lyh add: 待打印的内容（不显示） -->
  <!-- 2023.9.4 lyh update: 当前DCS版本直接打印 -->
  <div id="printMe">
    <!-- img打印转出来的图像模糊 -->
    <!--  待打印的内容（不显示）  -->
    <div :class="'print-container_' + browserFlag" v-show="isPrint">
      <img v-if="loading" class="printImg" :src="img" v-for="(img,indexK) in images" :id="'printI_'+indexK"
           :key="indexK"
           @error="handleImgErrorLoad" @load="handleImgLoaded" alt=""/>
    </div>
    <el-dialog v-if="loading" class="non-printable" :title="loadTitle" :visible.sync="loading"
               :close-on-click-modal="false"
               :close-on-press-escape="false" :show-close="false" width="20%" top="35vh" center :modal="false">
      <!--   进度条   -->
      <el-progress v-if="printPercent !== 100" :text-inside="true" :stroke-width="26"
                   :percentage="printPercent"></el-progress>
      <div id="loaded"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelPrint">取 消 打 印</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import axios from "axios";

export default {
  name: "PrintContent",
  data() {
    return {
      // 要打印的图片数组
      images: [],
      // 打印表单
      printForm: {
        fileId: '',  // 要打印文件名uuid
        mask: true,  // 掩膜
        stamp: true,  // 签章
        template: true,  // 模板
        annotation: true,  // 注释
        watermark: true,  // 水印
        dpi: 300,  // 默认是高清打印
        range: []  // 默认先打印全部页面
      },
      loaded: 0,  // 图片加载成功的数目
      errors: 0,  // 图片加载失败的数目
      connect: null,
      loading: false,
      printPercent: 0,
      loadPage: 0,
      apiSource: null,  // 用于取消请求
      loadTitle: "打印数据加载中...",
      index: 0,
      test: []
    };
  },
  computed: {
    ...mapGetters(['isPrint', 'printFileId', "pageCount", "printType", "printDpi", 'taoPrints', 'taoShows',
      'hideAnnoArray', "browserFlag", 'dpr'])
  },
  watch: {
    isPrint: function (newVal, oldVal) {
      // debugger
      if (newVal) {
        this.startPrint()
      }
    }
  },
  methods: {

    /**
     * @责任人：lyh
     * @方法名：startPrint
     * @方法描述：打印
     * @入参：
     * @返回值：
     * @修改时间：2023.9.4
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：封装函数
     * */
    async startPrint() {
      if (!this.isPrint) {
        return
      }
      // 如果本次要打印的文档和上一次要打印的文档一样则无需再发送请求
      // 条件： 1. uuid与上次打印的一样 2. 要打印的图片数组长度得有
      // 3. 无加载失败的图片（实际上在浏览器第一次请求获取到图片后就先将图片渲染缓存下来了，就算在第1次请求时获取到了图片，然后在服务端本地将图片删了，再次调用依然会有图片，不过刷新后再次请求可能就没了，所以这样设置也是可以的）
      // if (this.printFileId === this.printForm.fileId && this.images.length > 0) {
      //   if (this.loaded === this.images.length && !this.errors) {
      //   } else {
      //     this.loadTitle = "打印机连接中...";
      //     this.loading = true;
      //     this.$nextTick(() => {
      //       // 服务式loading特效
      //       const loaded = this.$loading({
      //         target: document.getElementById("loaded"),
      //         lock: true,
      //         text: '',
      //       })
      //     })
      //   }
      //   return;
      // }

      // this.connectSocket();
      this.connectSse();
      // 反之重新请求后再打印
      this.printForm.fileId = this.printFileId
      this.printForm.dpr = this.dpr;
      this.printForm.dpi = this.printDpi;
      /** 2024/3/28-ts-add: printType*/
      this.printForm.printType = this.printType;
      this.printForm.taoPrints = this.printType === "1" ? this.taoPrints : this.taoShows;
      this.printForm.range = Array(this.pageCount).fill(0).map((_, index) => index + 1);
      this.images = [];
      // 开启load弹窗
      this.loading = true;
      this.apiSource = axios.CancelToken.source();

      if (this.printForm.printType === "2") {
        // 获取隐藏的注释id，避免所见即所得时打印出来隐藏的注释
        let hideAnno = [];
        hideAnno = this.hideAnnoArray.map(anno => {
          return {
            annoId: anno.annoInfo[0].nameId,
            nPageNum: anno.nPageNum,
            hide: anno.hide
          }
        });
        this.printForm.hideAnno = hideAnno;
        this.$store.commit("CLEAR_HIDE_ANNO_ARRAY");
      }

      this.api({
        url: '/print/printCommon',
        method: 'POST',
        data: this.printForm,
        cancelToken: this.apiSource.token,
        timeout: Infinity
      }).then(data => {
        this.apiSource = null;
        this.loadTitle = "打印机连接中...";
        this.errors = 0
        // this.loaded = 0
        // setTimeout(function() {
        //   this.images.push(...data.imgPathList)
        //
        // }, 3000);
        // this.images.push(...data.imgPathList)

        // 将images中的数据全部删除后再添加新的数据
        // this.images.splice(0, this.images.length)
        // this.$store.commit('CHANGE_IS_PRINT', false)

      }).catch(error => {
        if (axios.isCancel(error)) {
          console.log("请求被取消了", error);
        }
        this.cancelPrint()
      })
    },

    /**
     * @责任人：lyh
     * @方法名：handleImgErrorLoad
     * @方法描述：图片加载失败时调用
     * @入参：
     * @返回值：
     * @修改时间：2023.9.4
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：封装函数
     * */
    handleImgErrorLoad() {
      this.errors++
    },

    /**
     * @责任人：lyh
     * @方法名：handleImgLoaded
     * @方法描述：图片加载成功时调用
     * @入参：
     * @返回值：
     * @修改时间：2023.9.4
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：封装函数
     * */
    handleImgLoaded(event) {
      let id = "printI_" + this.loaded
      const img = event.target;
      // 获取图片的宽高
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      // 根据图片宽高比动态设置样式
      if (width > height) {
        // 图片更宽，可能需要限制宽度
        img.style.width = '100%';
      } else {
        // 图片更高，可能需要限制高度
        img.style.height = '100%';
      }
      this.loaded++;

      // 如果全部加载完成则调用打印接口
      // if (this.isPrint && this.loaded === this.images.length  && !this.errors) {
      if (this.isPrint && this.loaded === this.images.length && this.loaded === this.pageCount && !this.errors) {
        // if (this.isPrint  && this.images.length===this.pageCount && !this.errors) {
        this.printCommon();
      }
    },

    /**
     * @责任人：lyh
     * @方法名：printCommon
     * @方法描述：直接调用浏览器打印接口
     * @入参：
     * @返回值：
     * @修改时间：2023.9.4
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：封装函数
     * */
    printCommon() {
      // this.loading = false;
      window.print();
      // this.$store.commit('CHANGE_IS_PRINT', false);
      this.printForm.fileId = "";
      // this.webSocket.close();
      this.cancelPrint()

    },

    // onbeforePrint(){   //先获取div的高度，当高度小于800px时，需要设置距离顶部的值，大于800则已经铺满整个A4纸，不用设置
    //   let style = document.createElement('style');
    //   let mapHeight = $("#printImg").height();
    //   let marginTop = "0mm";
    //   console.log(mapHeight)
    //   if(mapHeight < 1123){
    //     var temp = 1123 - parseInt(mapHeight);
    //     marginTop = (temp/8).toFixed(2)+"mm";
    //   }
    //   style.innerHTML = "@page{margin-top:"+marginTop+"}";
    //   window.document.head.appendChild(style);
    // },

    /**
     * @责任人：zxh
     * @方法名：connectSocket
     * @方法描述：连接websocket
     * @入参：无
     * @返回值：无
     * @修改时间：2024.3.5
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：封装函数
     * */
    connectSocket() {
      // 根据网络协议自动选择webSocket连接协议
      let protocol = location.protocol === 'https:' ? 'wss' : 'ws';
      this.connect = new WebSocket(`${protocol}://${window.webofdConfig.LONG_CONNECT_URL}/webSocket/${this.printFileId}`);

      this.connect.onopen = () => {
        console.log("websocket连接成功");
        this.printPercent = 0;
        this.loadPage = 0;
        this.loaded = 0
      }
      this.connect.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.loadPage += data.size;
        if (this.loadPage > this.pageCount) {
          this.loadPage = this.pageCount;
        }
        if (typeof data.curImg !== "undefined") {
          for (const curImgItem of data.curImg) {
            this.images.push(curImgItem + "?" + Date.now().toString());
          }
        }
        // this.images.push(data.curImg+"?"+Date.now().toString());
        this.printPercent = Number((this.loadPage / this.pageCount * 100).toFixed(1));

      }
      this.connect.onclose = () => {
        // if (tmpImgList.length === this.pageCount) {
        //   this.images = [...tmpImgList];
        // }
        console.log("websocket断开连接");
      }
    },

    connectSse() {
      this.connect = new EventSource(`${location.protocol}//${window.webofdConfig.LONG_CONNECT_URL}/print/createSse?fileId=${this.printFileId}`);

      this.connect.onopen = (event) => {
        // console.log("sse连接成功");
        this.printPercent = 0;
        this.loadPage = 0;
        this.loaded = 0;
      }

      this.connect.onmessage = (event) => {
        if (event.lastEventId !== 'print') {
          return;
        }
        const data = JSON.parse(event.data);
        this.loadPage += data.size;
        if (this.loadPage > this.pageCount) {
          this.loadPage = this.pageCount;
        }
        if (typeof data.curImg !== "undefined") {
          for (const curImgItem of data.curImg) {
            this.images.push(curImgItem + "?" + Date.now().toString());
          }
        }
        // this.images.push(data.curImg+"?"+Date.now().toString());
        this.printPercent = Number((this.loadPage / this.pageCount * 100).toFixed(1));
      }

      this.connect.onerror = (event) => {
        this.connect && this.connect.close();
        this.connect = null;
        // console.log("sse断开连接");
      }
    },

    /**
     * @责任人：zxh
     * @方法名：cancelPrint
     * @方法描述：取消打印
     * @入参：无
     * @返回值：无
     * @修改时间：2024.3.5
     * @修改类型（新增、删除、修改等）：新增
     * @修改描述：封装函数
     * */
    cancelPrint() {
      this.loading = false;
      // 取消上次请求
      if (this.apiSource !== null) {
        this.apiSource.cancel("webofd request cancel")
      }
      this.$store.commit('CHANGE_IS_PRINT', false)
      this.connect && this.connect.close();
      this.connect = null;
    }
  }
};
</script>

<style lang="scss" scoped>

/* 基础样式 */
.print-container_0 {
  width: 794px;
  //width: 100%;
  height: 1123px;
  //height: auto;
  //overflow: hidden; /* 隐藏滚动条 */
  position: relative; /* 为居中图片设置相对定位 */
}

// 解决firefox打印会在打印进度条加载时，打印预览页面就已经出现了
.print-container_2 {
  position: relative; /* 为居中图片设置相对定位 */

}

.printImg {
  max-width: 100%;
  //max-height: 100%;
  margin: auto;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  object-fit: contain; /* 保持宽高比 */
  //transform: translate(-50%, -50%); /* 居中定位 */
}

/* 打印时的样式 */
@media print {
  .print-container {
    //border: 1px solid #000; /* 打印时显示边框，方便查看边界 */

  }
  .printImg {
    position: static; /* 打印时不使用绝对定位 */
    transform: none; /* 取消居中定位的变换 */
    //transform: translate(-50%, -50%); /* 居中定位 */
    //page-break-after: avoid ; /* 打印时每页后添加分页符 */

  }
  /deep/ .v-model {
    display: none !important;
  }
  .non-printable {
    display: none !important;
  }
}
</style>
