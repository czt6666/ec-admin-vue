import axios from 'axios'
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth'
import store from '../store'
import {
  setIsBarShowAttribute,
  setLeftBarShowState,
  setTitleCompShowState,
  setTopMenuShowState
} from "./stateManageUtil";

import {decrypt, encrypt, signData} from "./EncryptionUtil";

const signPath = ["/tags/getInfo"] //验签黑名单，数组内请求路径为需要验签的请求

// 创建axios实例
const service = axios.create({
  baseURL: window.webofdConfig.BASE_URL, // api的base_url
  timeout: 180000                  // 请求超时时间
})

service.expiredTime = new Date();
service.isShowErrorMsg = true;

// request拦截器
service.interceptors.request.use(config => {
  let token = getToken();
  if (token) {
    config.headers.token = token;
  }
  //请求签名
  if (config.url.indexOf("/tags/getInfo") !== -1) {
    // 将签名信息及公钥放入请求头
    config.headers.Signature = signData(JSON.stringify(config.data))
  }
  return config
}, error => {
  // Do something with request error
  console.error(error) // for debug
  Promise.reject(error)
})
// respone拦截器
service.interceptors.response.use(
  response => {
    service.expiredTime = new Date();
    const res = response.data;
    if (res.code === '200') {
      return res.info;
    } else if (res.code === "20011") {
      Message({
        showClose: true,
        message: res.msg,
        type: 'error',
        duration: 500,
        onClose: () => {
          store.dispatch('FedLogOut').then(() => {
            location.reload()// 为了重新实例化vue-router对象 避免bug
          })
        }
      });
      return Promise.reject("未登录")
    } else if (res.code==="20012"){
      console.log("文件过期")
      Message({
        message: res.msg,
        type: 'error',
        duration: 1.5 * 1000
      })
      setTopMenuShowState(false)
      // 侧边栏
      setLeftBarShowState(false)
      // 顶部标题栏
      setTitleCompShowState(false)
      store.commit('SET_FILE_IS_CHANGE', false);
      //设置文档过期标识为true
      store.commit('SET_EXPEREDFILE', true);
    } else {
      // 设置请求失败是否自动进行message展示
      if (service.isShowErrorMsg) {
        Message({
          message: res.msg,
          type: 'error',
          duration: 3 * 1000
        })
      } else {
        service.isShowErrorMsg = true;
      }
      return Promise.reject(res)
    }
  },
  error => {
    console.error('err' + error)// for debug
    //请求超时封装
    if (error.message.includes('timeout')) {
      Message({
        message: "请求超时，请稍后再试",
        type: 'warning',
        duration: 1000 * 3
      })
      return Promise.reject(error);
    } else if (error.message.includes("webofd request cancel")) {
      return Promise.reject(error)
    } else {
      Message({
        message: '网络连接失败, 请检查网络连接',
        type: 'error',
        duration: 3 * 1000
      })
      return Promise.reject(error)
    }
  }
)
export default service

