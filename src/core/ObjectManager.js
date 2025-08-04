/**
 * 对象管理器
 * 负责3D对象的创建、管理和操作
 */

import * as THREE from 'three';
import { reactive } from 'vue';
// 简单的UUID生成器
function generateId() {
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
import { createBoxGeometry, createSphereGeometry, createCylinderGeometry } from '../utils/geometryUtils.js';

class ObjectManager {
  constructor() {
    // 响应式状态
    this.state = reactive({
      objects: new Map(),
      selectedObjects: new Set(),
      clipboard: null
    });
    
    // 材质缓存
    this.materialCache = new Map();
    
    // 默认材质
    this.defaultMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.4,
      metalness: 0.1
    });
  }
  
  /**
   * 创建基础几何体对象
   * @param {string} type 几何体类型
   * @param {object} options 选项参数
   * @returns {THREE.Mesh} 创建的网格对象
   */
  createPrimitive(type, options = {}) {
    let geometry;
    
    switch (type) {
      case 'box':
        geometry = createBoxGeometry(
          options.width || 1,
          options.height || 1,
          options.depth || 1
        );
        break;
      case 'sphere':
        geometry = createSphereGeometry(
          options.radius || 0.5,
          options.widthSegments || 32,
          options.heightSegments || 16
        );
        break;
      case 'cylinder':
        geometry = createCylinderGeometry(
          options.radiusTop || 0.5,
          options.radiusBottom || 0.5,
          options.height || 1,
          options.radialSegments || 32
        );
        break;
      default:
        geometry = createBoxGeometry();
    }
    
    const material = options.material || this.defaultMaterial.clone();
    const mesh = new THREE.Mesh(geometry, material);
    
    // 设置基本属性
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      id: generateId(),
      type: 'primitive',
      primitiveType: type,
      createdAt: new Date().toISOString()
    };
    
    if (options.name) {
      mesh.name = options.name;
    } else {
      mesh.name = `${type}_${Date.now()}`;
    }
    
    // 设置位置、旋转、缩放
    if (options.position) {
      mesh.position.set(...options.position);
    }
    if (options.rotation) {
      mesh.rotation.set(...options.rotation);
    }
    if (options.scale) {
      mesh.scale.set(...options.scale);
    }
    
    this.addObject(mesh);
    return mesh;
  }
  
  /**
   * 添加对象到管理器
   * @param {THREE.Object3D} object 3D对象
   */
  addObject(object) {
    if (!object.userData.id) {
      object.userData.id = generateId();
    }
    
    this.state.objects.set(object.userData.id, object);
  }
  
  /**
   * 移除对象
   * @param {string|THREE.Object3D} objectOrId 对象或ID
   */
  removeObject(objectOrId) {
    let object, id;
    
    if (typeof objectOrId === 'string') {
      id = objectOrId;
      object = this.state.objects.get(id);
    } else {
      object = objectOrId;
      id = object.userData.id;
    }
    
    if (!object) return;
    
    // 从选择集合中移除
    this.state.selectedObjects.delete(id);
    
    // 从对象映射中移除
    this.state.objects.delete(id);
    
    // 清理资源
    this.disposeObject(object);
  }
  
  /**
   * 清理对象资源
   * @param {THREE.Object3D} object 3D对象
   */
  disposeObject(object) {
    object.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }
      
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
  
  /**
   * 获取对象
   * @param {string} id 对象ID
   * @returns {THREE.Object3D|null} 对象
   */
  getObject(id) {
    return this.state.objects.get(id) || null;
  }
  
  /**
   * 获取所有对象
   * @returns {THREE.Object3D[]} 对象数组
   */
  getAllObjects() {
    return Array.from(this.state.objects.values());
  }
  
  /**
   * 选择对象
   * @param {string|string[]} objectIds 对象ID或ID数组
   * @param {boolean} addToSelection 是否添加到现有选择
   */
  selectObjects(objectIds, addToSelection = false) {
    if (!addToSelection) {
      this.state.selectedObjects.clear();
    }
    
    const ids = Array.isArray(objectIds) ? objectIds : [objectIds];
    ids.forEach(id => {
      if (this.state.objects.has(id)) {
        this.state.selectedObjects.add(id);
      }
    });
  }
  
  /**
   * 取消选择对象
   * @param {string|string[]} objectIds 对象ID或ID数组
   */
  deselectObjects(objectIds) {
    const ids = Array.isArray(objectIds) ? objectIds : [objectIds];
    ids.forEach(id => this.state.selectedObjects.delete(id));
  }
  
  /**
   * 清空选择
   */
  clearSelection() {
    this.state.selectedObjects.clear();
  }
  
  /**
   * 获取选中的对象
   * @returns {THREE.Object3D[]} 选中的对象数组
   */
  getSelectedObjects() {
    return Array.from(this.state.selectedObjects)
      .map(id => this.state.objects.get(id))
      .filter(Boolean);
  }
  
  /**
   * 复制对象
   * @param {string|string[]} objectIds 对象ID或ID数组
   */
  copyObjects(objectIds) {
    const ids = Array.isArray(objectIds) ? objectIds : [objectIds];
    const objects = ids.map(id => this.state.objects.get(id)).filter(Boolean);
    
    this.state.clipboard = objects.map(obj => obj.clone());
  }
  
  /**
   * 粘贴对象
   * @param {THREE.Vector3} position 粘贴位置
   * @returns {THREE.Object3D[]} 粘贴的对象
   */
  pasteObjects(position = new THREE.Vector3()) {
    if (!this.state.clipboard || this.state.clipboard.length === 0) {
      return [];
    }
    
    const pastedObjects = [];
    
    this.state.clipboard.forEach((clipboardObj, index) => {
      const clone = clipboardObj.clone();
      
      // 重新生成ID
      clone.userData.id = generateId();
      clone.name = `${clone.name}_copy`;
      
      // 设置位置偏移
      clone.position.copy(position);
      clone.position.x += index * 1.1;
      
      this.addObject(clone);
      pastedObjects.push(clone);
    });
    
    return pastedObjects;
  }
  
  /**
   * 删除选中的对象
   */
  deleteSelected() {
    const selectedIds = Array.from(this.state.selectedObjects);
    selectedIds.forEach(id => this.removeObject(id));
  }
  
  /**
   * 复制选中的对象
   */
  duplicateSelected() {
    const selectedIds = Array.from(this.state.selectedObjects);
    this.copyObjects(selectedIds);
    
    const duplicated = this.pasteObjects(new THREE.Vector3(1, 0, 0));
    const duplicatedIds = duplicated.map(obj => obj.userData.id);
    this.selectObjects(duplicatedIds);
    
    return duplicated;
  }
  
  /**
   * 设置对象变换
   * @param {string} objectId 对象ID
   * @param {object} transform 变换参数
   */
  setObjectTransform(objectId, transform) {
    const object = this.getObject(objectId);
    if (!object) return;
    
    if (transform.position) {
      object.position.set(...transform.position);
    }
    if (transform.rotation) {
      object.rotation.set(...transform.rotation);
    }
    if (transform.scale) {
      object.scale.set(...transform.scale);
    }
  }
  
  /**
   * 获取对象变换
   * @param {string} objectId 对象ID
   * @returns {object|null} 变换数据
   */
  getObjectTransform(objectId) {
    const object = this.getObject(objectId);
    if (!object) return null;
    
    return {
      position: object.position.toArray(),
      rotation: object.rotation.toArray(),
      scale: object.scale.toArray()
    };
  }
  
  /**
   * 设置对象材质
   * @param {string} objectId 对象ID
   * @param {THREE.Material|object} material 材质或材质参数
   */
  setObjectMaterial(objectId, material) {
    const object = this.getObject(objectId);
    if (!object || !object.material) return;
    
    if (material instanceof THREE.Material) {
      object.material = material;
    } else {
      // 更新材质属性
      Object.assign(object.material, material);
      object.material.needsUpdate = true;
    }
  }
  
  /**
   * 创建材质
   * @param {object} options 材质选项
   * @returns {THREE.Material} 材质
   */
  createMaterial(options = {}) {
    const materialType = options.type || 'MeshStandardMaterial';
    
    switch (materialType) {
      case 'MeshBasicMaterial':
        return new THREE.MeshBasicMaterial(options);
      case 'MeshLambertMaterial':
        return new THREE.MeshLambertMaterial(options);
      case 'MeshPhongMaterial':
        return new THREE.MeshPhongMaterial(options);
      case 'MeshStandardMaterial':
      default:
        return new THREE.MeshStandardMaterial(options);
    }
  }
  
  /**
   * 根据射线查找对象
   * @param {THREE.Raycaster} raycaster 射线投射器
   * @returns {THREE.Object3D[]} 相交的对象
   */
  getIntersectedObjects(raycaster) {
    const objects = this.getAllObjects();
    const intersects = raycaster.intersectObjects(objects, true);
    
    return intersects.map(intersect => {
      // 找到顶级管理的对象
      let targetObject = intersect.object;
      while (targetObject.parent && !this.state.objects.has(targetObject.userData.id)) {
        targetObject = targetObject.parent;
      }
      return targetObject;
    }).filter(obj => this.state.objects.has(obj.userData.id));
  }
  
  /**
   * 清空所有对象
   */
  clear() {
    this.getAllObjects().forEach(object => {
      this.disposeObject(object);
    });
    
    this.state.objects.clear();
    this.state.selectedObjects.clear();
    this.state.clipboard = null;
  }
  
  /**
   * 导出对象数据
   * @param {string[]} objectIds 对象ID数组，为空则导出所有对象
   * @returns {object} 对象数据
   */
  exportObjects(objectIds = []) {
    const objects = objectIds.length > 0 
      ? objectIds.map(id => this.getObject(id)).filter(Boolean)
      : this.getAllObjects();
    
    return {
      objects: objects.map(obj => ({
        id: obj.userData.id,
        name: obj.name,
        type: obj.userData.type,
        position: obj.position.toArray(),
        rotation: obj.rotation.toArray(),
        scale: obj.scale.toArray(),
        userData: obj.userData
      })),
      timestamp: new Date().toISOString()
    };
  }
}

// 单例模式
let instance = null;

export function useObjectManager() {
  if (!instance) {
    instance = new ObjectManager();
  }
  return instance;
}

export default ObjectManager;
