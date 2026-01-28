import request from '@/utils/request'
import { getToken } from '@/utils/auth'

/**
 * 获取当前用户信息（管理后台用户）
 * 通过user-context-test接口获取当前登录用户信息
 */
export function getCurrentUser() {
  return request({
    url: '/admin/ecadmin/user-context-test/current-user',
    method: 'get'
  }).then(res => {
    const data = res && (res.code === 200 || res.code === '200') ? res.data : res

    if (!data || !data.userId) {
      return {
        code: 200,
        data: {
          userId: null,
          id: null,
          roleIds: []
        }
      }
    }

    const userId = data.userId

    // 判断是否为管理员：userId === 10011
    // 注意：如果需要通过 roleIds 判断，需要后端返回 roleIds
    return {
      code: 200,
      data: {
        userId: userId,
        id: userId,
        roleIds: data.roleIds || [] // 如果后端返回了roleIds则使用，否则为空数组
      }
    }
  }).catch(() => {
    // 如果接口调用失败，返回空数据
    return {
      code: 200,
      data: {
        userId: null,
        id: null,
        roleIds: []
      }
    }
  })
}

// 获取所有用户下拉选项
export const listUserOptions = (permissionCode) =>
  request({
    url: '/admin/ecadmin/user/options',
    method: 'get',
    params: permissionCode ? { permissionCode } : {}
  })
