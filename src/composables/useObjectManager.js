/**
 * 对象管理组合式函数
 */
import ObjectManager from '../core/ObjectManager.js';
import {zoomToPos, flyToPos} from './useCameraPosState.js';

// 单例模式
let objectManager = null;

export function useObjectManager() {
  if (!objectManager) {
    objectManager = new ObjectManager();
  }
  return objectManager;
}



/**
 * 聚焦到对象
 * 计算对象包围盒中心点，设置OrbitControls target为该位置对象
 * @param {string|THREE.Object3D} objectOrId 对象或ID
 */
export function focusOnObject(objectOrId) {
  let object;
  
  if (typeof objectOrId === 'string') {
    object = objectManager.getObject(objectOrId);
  } else {
    object = objectOrId;
  }
  
  if (!object) return;
  
  // 计算对象包围盒
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  
  // 计算合适的相机距离
  const maxSize = Math.max(size.x, size.y, size.z);
  const distance = maxSize / (2 * Math.tan(Math.PI * cameraState.fov / 360));
  
  // 设置相机位置
  const direction = new THREE.Vector3(1, 1, 1).normalize();
  const newPosition = center.clone().add(direction.multiplyScalar(distance * 2.0));

  let pos = {
    position: [newPosition.x, newPosition.y, newPosition.z],
    target: [center.x, center.y, center.z]
  };

  flyToPos(pos);
}