import permission from "./mPermission";
import mloading from "./pageLoading/mloading"
import pRetry from "./pageRetry/pRetry";
import clickoutside from "./clickoutside";

export default {
  install(Vue) {
    Vue.directive("permission", permission);
    Vue.directive("mloading", mloading);
    Vue.directive("pRetry", pRetry);
    Vue.directive("clickoutside", clickoutside);
  }
};
