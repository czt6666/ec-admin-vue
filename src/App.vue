<template>
  <div id="app">
    <keep-alive :include="caches">
      <router-view v-if="load" class="noNeedPrint"></router-view>
    </keep-alive>
    <print-content v-if="!isMobile"></print-content>
  </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import { mapState } from "vuex";
import PrintContent from "./components/PrintContent";
export default {
  name: "app",
  components: {
    PrintContent
  },
  data() {
    return {
      load: false
    }
  },
  created() {
    // 欢迎页
    console.log(
      "%c 欢迎使用 %c 后台管理系统V1.0 %c",
      'background: #0c1f44; padding: 1px; border-radius: 3px 0 0 3px; color: #fff; font-size: 20px;',
      'background: #1e80ff; padding: 1px; border-radius: 0 3px 3px 0; color: #fff; font-size: 20px;',
      'background: transparent'
    );
    // new DevicePixelRatio().init();
    this.$store.dispatch("GetViewConfig").then(() => {
      this.load = true;
    }).catch(() => {
      this.load = true;
      console.log("使用默认配置")
    });
  },
  computed: {
    ...mapState("cache", ["caches"]),
    // ...mapState(["isRenderTab"])
    ...mapGetters(["isMobile"])
  },
  methods: {
    ...mapActions("cache", ["addCache", "removeCache"]),
    // 收集缓存（通过监听）
    collectCaches() {
      // 收集当前路由相关的缓存
      this.$route.matched.forEach(routeMatch => {
        const instance = routeMatch.components.default;
        const componentName = instance.name;

        if (process.env.NODE_ENV === "development") {
          this.checkRouteComponentName(componentName, instance.__file);
        }

        // 配置了meta.keepAlive的路由组件添加到缓存
        if (routeMatch.meta.keepAlive) {
          if (!componentName) {
            console.warn(`${routeMatch.path} 路由的组件名称name为空`);
            return;
          }
          this.addCache(componentName);
        } else {
          this.removeCache(componentName);
        }
      });
    },
    // 检测路由组件名称是否重复（组件重名会缓存到不该缓存的组件，而且不容易排查问题，所以开发环境时检测重名）
    checkRouteComponentName(name, file) {
      if (!this.cmpNames) this.cmpNames = {};
      if (this.cmpNames[name]) {
        if (this.cmpNames[name] !== file) {
          console.warn(
            `${file} 与${this.cmpNames[name]} 组件名称重复： ${name}`
          );
        }
      } else {
        this.cmpNames[name] = file;
      }
    }
  },
  watch: {
    "$route.path": {
      immediate: true,
      handler() {
        // this.collectCaches();
      }
    }
  }
};
</script>

<style lang="scss">
@import "~normalize.css/normalize.css"; // normalize.css 样式格式化
@import "./styles/index.scss"; // 全局自定义的css样式
</style>
