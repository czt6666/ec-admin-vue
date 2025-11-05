// src/utils/request.js
import axios from 'axios'
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth'

// 基础地址优先取窗口配置，其次取环境变量
const BASE_URL =
  (window.webofdConfig && window.webofdConfig.BASE_URL) ||
  process.env.VUE_APP_BASE_API ||
  '/'

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 180000
})

// 是否自动弹错误消息（可在单次请求中关闭：config.showErrorMsg = false）
service.defaults.showErrorMsg = true

// 请求拦截：携带 token
service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.token = token
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截：统一处理 code 与异常
service.interceptors.response.use(
  response => {
    const res = response.data

    // 统一成功码：200 / '200' / 1 / '1'
    if (res && (res.code === 200 || res.code === '200' || res.code === 1 || res.code === '1')) {
      return res
    }

    // 未登录/登录失效（如有需要可在这里增加跳转登录逻辑）
    if (res && (res.code === 20011 || res.code === '20011')) {
      Message.error(res.msg || '未登录或登录已过期')
      return Promise.reject(res)
    }

    // 其他业务错误
    if (service.defaults.showErrorMsg !== false) {
      Message({
        message: (res && res.msg) || '请求失败',
        type: 'error',
        duration: 3000
      })
    }
    // 仅对当前请求关闭自动报错，不影响其它请求
    service.defaults.showErrorMsg = true
    return Promise.reject(res || new Error('请求失败'))
  },
  error => {
    const msg = error && error.message ? error.message : '网络错误'
    if (msg.includes('timeout')) {
      Message.warning('请求超时，请稍后再试')
    } else {
      Message.error('网络连接失败，请检查网络')
    }
    return Promise.reject(error)
  }
)

export default service
