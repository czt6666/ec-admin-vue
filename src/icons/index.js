import Vue from 'vue'
import SvgIcon from '@/components/SvgIcon'// svg组件

// register globally
Vue.component('svg-icon', SvgIcon)

const requireAll = requireContext => requireContext.keys().map(requireContext)

// svg根目录环境
// 2023.9.21 lyh update: 修改第二个参数支持搜索子目录
const req = require.context('./svg', true, /\.svg$/)

requireAll(req)
