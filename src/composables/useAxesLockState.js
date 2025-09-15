/**
 * Y轴锁定状态管理
 * 提供axesLockState响应式变量及setAxesLockState方法
 * 可被useScene、SceneManager、useObjectSelection等模块安全引用，避免循环依赖
 */
import { reactive } from 'vue';

/**
 * axesLockState.locked: 是否锁定
 * axesLockState.yValue: 锁定的Y值
 */
export const axesLockState = reactive({
  locked: false,
  yValue: 0
});

/**
 * 设置Y轴锁定状态
 * @param {boolean} locked 是否锁定
 * @param {number} yValue 锁定的Y值
 */
export function setAxesLockState(locked, yValue = 0) {
  axesLockState.locked = locked;
  axesLockState.yValue = yValue;
}
