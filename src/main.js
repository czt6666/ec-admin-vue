import "babel-polyfill";
import es6promise from "es6-promise";
es6promise.polyfill();

import Vue from "vue";
import "normalize.css/normalize.css"; // A modern alternative to CSS resets
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import locale from "element-ui/lib/locale/lang/zh-CN";
import App from "./App";
import router from "./router";
import store from "./store";
import "@/icons"; // icon
import "@/router/routerConfig"; // 权限
import { default as api } from "./utils/api";
import directives from "@/directives";
import "./utils/rem";
import 'whatwg-fetch';
import Contextmenu from "@/plugin/contextmenu";
import ColorSelector from "./components/ColorSelector";
import 'default-passive-events'

import { hasPermission } from "./utils/hasPermission";

//引入eChart组件并挂载
import * as echarts from "echarts";
Vue.prototype.$echarts = echarts
Vue.use(ElementUI, { locale });
Vue.prototype.api = api;
//全局的常量
Vue.prototype.hasPerm = hasPermission;
Vue.use(directives);
Vue.use(Contextmenu);
Vue.use(ColorSelector)
//禁止element-ui的messageBox提示框的时候点击其他区域关闭 hyj-240716-add
ElementUI.MessageBox.setDefaults({ closeOnClickModal: false })
//禁止element-ui的Dialog弹窗的时候点击其他区域关闭 hyj-240716-add
ElementUI.Dialog.props.closeOnClickModal.default = false

//生产环境时自动设置为 false 以阻止 vue 在启动时生成生产提示。
Vue.config.productionTip = process.env.NODE_ENV !== "production";
new Vue({
  el: "#app",
  router,
  store,
  template: "<App/>",
  components: { App },
  beforeCreate() {
    Vue.prototype.$bus = this;
  }
});
