/**
 * 日期格式化工具函数
 */

/**
 * 格式化日期时间
 * @param {Date} date 日期对象
 * @param {String} format 格式化字符串，如 'yyyy-MM-dd hh:mm:ss'
 * @returns {String} 格式化后的日期时间字符串
 */
export function formatDate(date, format) {
  if (!date) {
    return ''
  }
  
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  }
  
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  
  return format
}

/**
 * 解析日期时间字符串
 * @param {String} dateString 日期时间字符串
 * @returns {Date} 日期对象
 */
export function parseDate(dateString) {
  if (!dateString) {
    return null
  }
  return new Date(dateString)
}

/**
 * 获取当前日期时间字符串
 * @param {String} format 格式化字符串，默认为 'yyyy-MM-dd hh:mm:ss'
 * @returns {String} 当前日期时间字符串
 */
export function getCurrentDateTime(format = 'yyyy-MM-dd hh:mm:ss') {
  return formatDate(new Date(), format)
}

export default {
  formatDate,
  parseDate,
  getCurrentDateTime
}