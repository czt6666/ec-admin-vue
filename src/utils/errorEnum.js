import store from '../store'
import { setLeftBarShowState, setTitleCompShowState, setTopMenuShowState, setIsBarShowAttribute } from "./stateManageUtil";
/**
 * 返回错误信息封装
 * hyj-0914-add
 * @param {*} errorCode
 * @param callback
 */
export function errorEnum(errorCode, callback) {

  //文件过期
  //10.08-ts-update: 修改if判断条件原判断条件 errorcode为 undefined时也能通过
  if (errorCode === '20012' || errorCode === '80001' || errorCode === '80002' || errorCode === '80006' || errorCode === 'expired') {
    reloadFile()
  }

  // 执行回调
  callback && callback();

  /**
   * @责任人：hyj
   * @方法名：reloadFile
   * @方法描述：当文件已过期后对按钮状态的处理
   * @入参：
   * @返回值：
   * @修改时间：2023.9.14
   * @修改类型（新增、删除、修改等）：修改
   * @修改描述：新增函数
   * */
  function reloadFile() {
    // 顶部功能栏
    setTopMenuShowState(false)
    // 侧边栏
    setLeftBarShowState(false)
    // 顶部标题栏
    setTitleCompShowState(false)
    //设置文档过期标识为true
    store.commit('SET_EXPEREDFILE', true);
  }
}
