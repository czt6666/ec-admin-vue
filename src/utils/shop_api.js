// src/utils/request.js
import axios from 'axios'
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth'
import store from '@/store'

// 如需签名，保留；没有则可删除
import { signData } from '@/utils/EncryptionUtil'

// 解析 baseURL：优先 window.webofdConfig.BASE_URL，其次 VUE_APP_BASE_API，最后回退到 '/api'
function resolveBaseURL() {
  try {
    if (window && window.webofdConfig && window.webofdConfig.BASE_URL) {
      return window.webofdConfig.BASE_URL
    }
  } catch (e) {}
  if (process && process.env && process.env.VUE_APP_BASE_API) {
    return process.env.VUE_APP_BASE_API
  }
  return '/api'
}

const service = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 180000,
})

service.expiredTime = new Date()
service.isShowErrorMsg = true

// 请求拦截
service.interceptors.request.use(
  (config) => {
    const token = getToken && getToken()
    if (token) {
      // 后端如果要求其他头名，可在此调整
      config.headers.token = token
    }
    
    // 添加用户ID请求头（仅在能获取到时添加）
    const userId = store.getters.userId;
    if (userId) {
      config.headers['X-User-Id'] = userId;
      console.log('Added X-User-Id header to request:', userId);
    } else {
      console.log('Skipped adding X-User-Id header - userId not available');
    }

    // 按需对特定路径进行签名（示例：/tags/getInfo）
    if (config.url && config.url.indexOf('/tags/getInfo') !== -1) {
      try {
        const body = config.method === 'get' ? JSON.stringify(config.params || {}) : JSON.stringify(config.data || {})
        config.headers.Signature = signData ? signData(body) : ''
      } catch (e) {
        // 签名失败不阻断请求
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截
service.interceptors.response.use(
  (response) => {
    service.expiredTime = new Date()
    const res = response && response.data !== undefined ? response.data : response

    // 兼容后端返回风格：code 为 200/'200'/1/'1' 视为成功
    if (res && (res.code === 200 || res.code === '200' || res.code === 1 || res.code === '1')) {
      return res
    }

    // 未登录/登录过期
    if (res && (res.code === 20011 || res.code === '20011')) {
      Message({
        showClose: true,
        message: res.msg || '未登录或登录已过期',
        type: 'error',
        duration: 800,
        onClose: () => {
          if (store && store.dispatch) {
            store.dispatch('FedLogOut').finally(() => {
              location.reload()
            })
          } else {
            location.reload()
          }
        },
      })
      return Promise.reject(res || '未登录')
    }

    // 文件过期（如有此语义）
    if (res && (res.code === 20012 || res.code === '20012')) {
      Message({
        message: res.msg || '文件已过期',
        type: 'error',
        duration: 1500,
      })
      // 如需联动隐藏 UI/置标记，可在此提交 store 或调用你们的 UI 控制方法
      try {
        if (store && store.commit) {
          store.commit('SET_FILE_IS_CHANGE', false)
          store.commit('SET_EXPEREDFILE', true)
        }
      } catch (e) {}
      return Promise.reject(res || '文件已过期')
    }

    // 其他业务错误
    if (service.isShowErrorMsg) {
      Message({
        message: (res && res.msg) || '请求失败',
        type: 'error',
        duration: 3000,
      })
    } else {
      service.isShowErrorMsg = true
    }
    return Promise.reject(res || 'error')
  },
  (error) => {
    // 统一网络/超时/状态码错误处理
    const errMsg = (error && error.message) || ''
    const resp = error && error.response

    if (errMsg && errMsg.includes('timeout')) {
      Message({
        message: '请求超时，请稍后再试',
        type: 'warning',
        duration: 3000,
      })
      return Promise.reject(error)
    }

    if (errMsg && errMsg.includes('webofd request cancel')) {
      // 自定义取消标记，直接透传
      return Promise.reject(error)
    }

    if (resp) {
      const status = resp.status
      const data = resp.data || {}
      const msg = data.msg || data.message

      if (status === 404) {
        Message({
          message: `资源不存在（404）：${(resp.config && resp.config.url) || ''}`,
          type: 'error',
          duration: 3000,
        })
      } else if (status === 401) {
        Message({
          message: msg || '未授权或登录过期（401）',
          type: 'error',
          duration: 2000,
          onClose: () => {
            if (store && store.dispatch) {
              store.dispatch('FedLogOut').finally(() => location.reload())
            } else {
              location.reload()
            }
          },
        })
      } else if (status >= 500) {
        Message({
          message: msg || `服务器错误（${status}）`,
          type: 'error',
          duration: 3000,
        })
      } else {
        Message({
          message: msg || `请求失败（${status}）`,
          type: 'error',
          duration: 3000,
        })
      }
      return Promise.reject(error)
    }

    Message({
      message: '网络连接失败, 请检查网络连接',
      type: 'error',
      duration: 3000,
    })
    return Promise.reject(error)
  }
)

export default service
