/**
 * 输入管理组合式函数
 */
import InputManager from '../core/InputManager.js';

// 单例模式
let instance = null;

export function useInputManager() {
  if (!instance) {
    instance = new InputManager();
  }
  return instance;
}