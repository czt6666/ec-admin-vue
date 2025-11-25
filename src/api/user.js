// src/api/user.js
import request from '@/utils/request'

// 获取所有用户下拉选项
export const listUserOptions = () =>
  request({
    url: '/admin/ecadmin/user/options',
    method: 'get'
  })
