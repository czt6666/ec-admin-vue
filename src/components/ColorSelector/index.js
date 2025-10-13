import ColorSelector from "./src/ColorSelector.vue";

const install = function (Vue) {
	Vue.component(ColorSelector.name, ColorSelector);
}

if (window && window.Vue) {
	install(window.Vue)
}

export default install;