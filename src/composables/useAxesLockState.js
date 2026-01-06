/**
 * Y轴锁定状态组合式函数
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

export function useAxesLockState() {
  return axesLockState;
}

/**
 * 设置Y轴锁定状态
 * @param {boolean} locked 是否锁定
 * @param {number} yValue 锁定的Y值
 */
export function setAxesLockState(locked, yValue = 0) {
  axesLockState.locked = locked;
  axesLockState.yValue = yValue;
}
