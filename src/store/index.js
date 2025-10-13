import Vue from "vue";
import Vuex from "vuex";
import app from "./modules/app";
import user from "./modules/user";
import permission from "./modules/permission";
import getters from "./getters";
import cacheModule from "./cache";
import anno from "./modules/anno";
import viewConfig from "./modules/viewConfig";
import print from "./modules/print";
import buttonState from "./modules/buttonState";
import errorState from "./modules/errorState";
import fileState from "./modules/fileState";
import sign from "./modules/sign";
Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    cache: cacheModule,
    anno,
    print,
    viewConfig,
    buttonState,
    errorState,
    fileState,
    sign
  },
  getters

});

export default store;
