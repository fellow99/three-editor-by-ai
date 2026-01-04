import ObjectManager from '../core/ObjectManager.js';

// 单例模式
let instance = null;

export function useObjectManager() {
  if (!instance) {
    instance = new ObjectManager();
  }
  return instance;
}