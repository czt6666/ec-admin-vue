import {removeToken, setToken} from '@/utils/auth'
import {default as api} from '../../utils/api'
import store from '../../store'
import router from '../../router'

const user = {
  state: {
    nickname: "",
    userId: "",
    roleIds: [],
    menus: [],
    permissions: [],
  },
  mutations: {
    SET_USER: (state, userInfo) => {
      state.nickname = userInfo.nickname;
      state.userId = userInfo.userId;
      state.roleIds = userInfo.roleIds;
      state.menus = userInfo.menuList;
      state.permissions = userInfo.permissionList;
    },
    RESET_USER: (state) => {
      state.nickname = "";
      state.userId = "";
      state.roleIds = [];
      state.menus = [];
      state.permissions = [];
    }
  },
  actions: {
    // 登录
    Login({commit, state}, loginForm) {
      return new Promise((resolve, reject) => {
        api({
          url: "login/auth",
          method: "post",
          data: loginForm
        }).then(data => {
          //localstorage中保存token
          setToken(data.token);
          resolve(data);
          store.commit('SET_STATEOBJATTRIBUTE',{
            key: 'titleComp.xUser',
            value: true
          })
          Document.getElementById("userButtonImage").style.opacity=1.0

        }).catch(err => {
          reject(err)
        })
      })
    },
    // 获取用户信息
    GetInfo({commit, state}) {
      return new Promise((resolve, reject) => {
        api({
          url: '/login/getInfo',
          method: 'post'
        }).then(data => {
          //储存用户信息
          commit('SET_USER', data);
          /** 2023/12/28-ts-add: 后端权限与前端配置映射*/
          let permissonMap = []
          let mappingMap = store.getters.loginPermissionMap
          let userPermissionList = store.getters.userPermission
          for (let item of userPermissionList){
            if (mappingMap.has(item)){
              permissonMap.push.apply(permissonMap,mappingMap.get(item))
            }
          }
          commit('SET_MAPPEDPERMISSIONLIST',permissonMap)
          //生成路由
          store.dispatch('GenerateRoutes', data).then(() => {
            //生成该用户的新路由json操作完毕之后,调用vue-router的动态新增路由方法,将新路由添加
            router.addRoutes(store.getters.addRouters);
          })
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 登出
    LogOut({commit}) {
      return new Promise((resolve) => {
        api({
          url: "login/logout",
          method: "post"
        }).then(data => {
          commit('RESET_USER')
          removeToken()
          resolve(data);
        }).catch(() => {
          commit('RESET_USER')
          removeToken()
        })
      })
    },
    // 前端登出,不用调后端清除token的接口
    FedLogOut({commit}) {
      return new Promise(resolve => {
        commit('RESET_USER')
        removeToken()
        resolve()
      })
    }
  }
}
export default user
