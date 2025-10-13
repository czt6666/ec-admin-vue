// 组件导入 ********
import TopBar from "./TopBar";
import BottomBar from "./BottomBar";

export {
  TopBar,
  BottomBar,
}

// 工具类 *******
/**
 * 比较两个浮点数是否相等
 * 误差小于某个值时认为无误差
 * @param left
 * @param right
 * @returns {boolean}
 */
export function compareFloat(left, right) {
  return Math.abs(left - right) < Number.EPSILON * Math.pow(2, 2);
}
