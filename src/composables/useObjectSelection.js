/**
 * 对象选择管理 Composable
 * 提供对象选择相关的响应式状态和操作方法
 */

import { ref, reactive, computed, watch } from 'vue';
import * as THREE from 'three';
import { useObjectManager } from '../core/ObjectManager.js';
import { useInputManager } from '../core/InputManager.js';

export function useObjectSelection() {
  const objectManager = useObjectManager();
  const inputManager = useInputManager();
  
  // 响应式状态
  const selectedObjects = computed(() => 
    Array.from(objectManager.state.selectedObjects)
      .map(id => objectManager.getObject(id))
      .filter(Boolean)
  );
  
  const selectedObjectIds = computed(() => 
    Array.from(objectManager.state.selectedObjects)
  );
  
  const hasSelection = computed(() => 
    objectManager.state.selectedObjects.size > 0
  );
  
  const selectionCount = computed(() => 
    objectManager.state.selectedObjects.size
  );
  
  // 选择模式
  const selectionMode = ref('single'); // 'single', 'multiple', 'box'
  
  // 框选状态
  const boxSelection = reactive({
    isActive: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0
  });
  
  // 选择配置
  const selectionConfig = reactive({
    highlightSelected: true,
    highlightColor: 0x00ff00,
    showBoundingBox: true,
    enableHover: true,
    hoverColor: 0xffff00
  });
  
  // 悬停状态
  const hoveredObject = ref(null);
  
  /**
   * 选择单个对象
   * @param {string|THREE.Object3D} objectOrId 对象或ID
   * @param {boolean} addToSelection 是否添加到现有选择
   */
  function selectObject(objectOrId, addToSelection = false) {
    let id;
    
    if (typeof objectOrId === 'string') {
      id = objectOrId;
    } else {
      id = objectOrId.userData.id;
    }
    
    if (!id) return;
    
    if (selectionMode.value === 'single' && !addToSelection) {
      objectManager.selectObjects(id);
    } else {
      objectManager.selectObjects(id, addToSelection);
    }
    
    updateSelectionHighlights();
  }
  
  /**
   * 选择多个对象
   * @param {string[]|THREE.Object3D[]} objects 对象数组
   * @param {boolean} addToSelection 是否添加到现有选择
   */
  function selectObjects(objects, addToSelection = false) {
    const ids = objects.map(obj => 
      typeof obj === 'string' ? obj : obj.userData.id
    ).filter(Boolean);
    
    objectManager.selectObjects(ids, addToSelection);
    updateSelectionHighlights();
  }
  
  /**
   * 取消选择对象
   * @param {string|THREE.Object3D} objectOrId 对象或ID
   */
  function deselectObject(objectOrId) {
    let id;
    
    if (typeof objectOrId === 'string') {
      id = objectOrId;
    } else {
      id = objectOrId.userData.id;
    }
    
    if (!id) return;
    
    objectManager.deselectObjects(id);
    updateSelectionHighlights();
  }
  
  /**
   * 清空选择
   */
  function clearSelection() {
    objectManager.clearSelection();
    updateSelectionHighlights();
  }
  
  /**
   * 切换对象选择状态
   * @param {string|THREE.Object3D} objectOrId 对象或ID
   */
  function toggleSelection(objectOrId) {
    let id;
    
    if (typeof objectOrId === 'string') {
      id = objectOrId;
    } else {
      id = objectOrId.userData.id;
    }
    
    if (!id) return;
    
    if (objectManager.state.selectedObjects.has(id)) {
      deselectObject(id);
    } else {
      selectObject(id, selectionMode.value === 'multiple');
    }
  }
  
  /**
   * 全选对象
   */
  function selectAll() {
    const allObjects = objectManager.getAllObjects();
    const allIds = allObjects.map(obj => obj.userData.id).filter(Boolean);
    objectManager.selectObjects(allIds);
    updateSelectionHighlights();
  }
  
  /**
   * 反选对象
   */
  function invertSelection() {
    const allObjects = objectManager.getAllObjects();
    const selectedIds = Array.from(objectManager.state.selectedObjects);
    
    const invertedIds = allObjects
      .map(obj => obj.userData.id)
      .filter(id => id && !selectedIds.includes(id));
    
    objectManager.selectObjects(invertedIds);
    updateSelectionHighlights();
  }
  
  /**
   * 根据类型选择对象
   * @param {string} type 对象类型
   */
  function selectByType(type) {
    const objects = objectManager.getAllObjects()
      .filter(obj => obj.userData.type === type || obj.userData.primitiveType === type);
    
    const ids = objects.map(obj => obj.userData.id).filter(Boolean);
    objectManager.selectObjects(ids);
    updateSelectionHighlights();
  }
  
  /**
   * 根据名称选择对象
   * @param {string} name 对象名称
   * @param {boolean} exactMatch 是否精确匹配
   */
  function selectByName(name, exactMatch = false) {
    const objects = objectManager.getAllObjects()
      .filter(obj => {
        if (exactMatch) {
          return obj.name === name;
        } else {
          return obj.name.toLowerCase().includes(name.toLowerCase());
        }
      });
    
    const ids = objects.map(obj => obj.userData.id).filter(Boolean);
    objectManager.selectObjects(ids);
    updateSelectionHighlights();
  }
  
  /**
   * 处理鼠标点击选择
   * @param {object} event 鼠标事件数据
   * @param {THREE.Camera} camera 相机
   */
  function handleClickSelection(event, camera) {
    if (!camera) return;
    
    const raycaster = inputManager.getRaycaster(camera);
    const intersectedObjects = objectManager.getIntersectedObjects(raycaster);
    
    if (intersectedObjects.length > 0) {
      const targetObject = intersectedObjects[0];
      const addToSelection = event.modifiers?.ctrl || event.modifiers?.shift;
      
      if (addToSelection && selectionMode.value === 'multiple') {
        toggleSelection(targetObject);
      } else {
        selectObject(targetObject, false);
      }
    } else {
      // 点击空白区域，清空选择
      if (!event.modifiers?.ctrl && !event.modifiers?.shift) {
        clearSelection();
      }
    }
  }
  
  /**
   * 处理鼠标悬停
   * @param {object} event 鼠标事件数据
   * @param {THREE.Camera} camera 相机
   */
  function handleHover(event, camera) {
    if (!selectionConfig.enableHover || !camera) return;
    
    const raycaster = inputManager.getRaycaster(camera);
    const intersectedObjects = objectManager.getIntersectedObjects(raycaster);
    
    const newHoveredObject = intersectedObjects.length > 0 ? intersectedObjects[0] : null;
    
    if (hoveredObject.value !== newHoveredObject) {
      // 清除之前的悬停高亮
      if (hoveredObject.value) {
        removeHoverHighlight(hoveredObject.value);
      }
      
      hoveredObject.value = newHoveredObject;
      
      // 添加新的悬停高亮
      if (hoveredObject.value) {
        addHoverHighlight(hoveredObject.value);
      }
    }
  }
  
  /**
   * 开始框选
   * @param {number} x 起始X坐标
   * @param {number} y 起始Y坐标
   */
  function startBoxSelection(x, y) {
    if (selectionMode.value !== 'box') return;
    
    boxSelection.isActive = true;
    boxSelection.startX = x;
    boxSelection.startY = y;
    boxSelection.endX = x;
    boxSelection.endY = y;
  }
  
  /**
   * 更新框选
   * @param {number} x 当前X坐标
   * @param {number} y 当前Y坐标
   */
  function updateBoxSelection(x, y) {
    if (!boxSelection.isActive) return;
    
    boxSelection.endX = x;
    boxSelection.endY = y;
  }
  
  /**
   * 结束框选
   * @param {THREE.Camera} camera 相机
   * @param {HTMLElement} element 渲染元素
   */
  function endBoxSelection(camera, element) {
    if (!boxSelection.isActive || !camera || !element) return;
    
    const rect = element.getBoundingClientRect();
    const selectedIds = [];
    
    // 计算框选区域
    const minX = Math.min(boxSelection.startX, boxSelection.endX);
    const maxX = Math.max(boxSelection.startX, boxSelection.endX);
    const minY = Math.min(boxSelection.startY, boxSelection.endY);
    const maxY = Math.max(boxSelection.startY, boxSelection.endY);
    
    // 检查每个对象是否在框选区域内
    objectManager.getAllObjects().forEach(object => {
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      
      // 将世界坐标转换为屏幕坐标
      const screenPos = center.clone().project(camera);
      const x = (screenPos.x + 1) / 2 * rect.width;
      const y = -(screenPos.y - 1) / 2 * rect.height;
      
      if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
        selectedIds.push(object.userData.id);
      }
    });
    
    if (selectedIds.length > 0) {
      objectManager.selectObjects(selectedIds);
      updateSelectionHighlights();
    }
    
    boxSelection.isActive = false;
  }
  
  /**
   * 更新选择高亮
   */
  function updateSelectionHighlights() {
    if (!selectionConfig.highlightSelected) return;
    
    // 移除所有高亮
    objectManager.getAllObjects().forEach(object => {
      removeSelectionHighlight(object);
    });
    
    // 为选中的对象添加高亮
    selectedObjects.value.forEach(object => {
      addSelectionHighlight(object);
    });
  }
  
  /**
   * 添加选择高亮
   * @param {THREE.Object3D} object 对象
   */
  function addSelectionHighlight(object) {
    object.traverse(child => {
      if (child.isMesh && child.material) {
        // 保存原始材质
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material;
        }
        // 创建高亮材质并记录
        if (!child.userData.selectionMaterial) {
          const highlightMaterial = child.material.clone();
          highlightMaterial.emissive = new THREE.Color(selectionConfig.highlightColor);
          highlightMaterial.emissiveIntensity = 0.3;
          child.userData.selectionMaterial = highlightMaterial;
        }
        child.material = child.userData.selectionMaterial;
      }
    });
  }
  
  /**
   * 移除选择高亮
   * @param {THREE.Object3D} object 对象
   */
  function removeSelectionHighlight(object) {
    object.traverse(child => {
      if (child.isMesh) {
        if (child.userData.originalMaterial) {
          child.material = child.userData.originalMaterial;
          delete child.userData.originalMaterial;
        }
        if (child.userData.selectionMaterial) {
          delete child.userData.selectionMaterial;
        }
      }
    });
  }
  
  /**
   * 添加悬停高亮
   * @param {THREE.Object3D} object 对象
   */
  function addHoverHighlight(object) {
    object.traverse(child => {
      if (child.isMesh && child.material) {
        // 保存原始材质
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material;
        }
        // 创建悬停材质并记录
        if (!child.userData.hoverMaterial) {
          const hoverMaterial = child.material.clone();
          hoverMaterial.emissive = new THREE.Color(selectionConfig.hoverColor);
          hoverMaterial.emissiveIntensity = 0.2;
          child.userData.hoverMaterial = hoverMaterial;
        }
        child.material = child.userData.hoverMaterial;
      }
    });
  }
  
  /**
   * 移除悬停高亮
   * @param {THREE.Object3D} object 对象
   */
  function removeHoverHighlight(object) {
    object.traverse(child => {
      if (child.isMesh) {
        // 如果对象被选中，恢复 selectionMaterial
        if (child.userData.selectionMaterial) {
          child.material = child.userData.selectionMaterial;
        } else if (child.userData.originalMaterial) {
          child.material = child.userData.originalMaterial;
        }
        if (child.userData.hoverMaterial) {
          delete child.userData.hoverMaterial;
        }
      }
    });
  }
  
  /**
   * 获取选择边界框
   * @returns {THREE.Box3|null} 边界框
   */
  function getSelectionBounds() {
    if (selectedObjects.value.length === 0) return null;
    
    const box = new THREE.Box3();
    
    selectedObjects.value.forEach(object => {
      const objectBox = new THREE.Box3().setFromObject(object);
      box.union(objectBox);
    });
    
    return box;
  }
  
  /**
   * 获取选择中心点
   * @returns {THREE.Vector3|null} 中心点
   */
  function getSelectionCenter() {
    const bounds = getSelectionBounds();
    return bounds ? bounds.getCenter(new THREE.Vector3()) : null;
  }
  
  // 监听选择变化
  watch(selectedObjects, (newSelection, oldSelection) => {
    // 可以在这里触发选择变化事件
  });
  
  return {
    // 状态
    selectedObjects,
    selectedObjectIds,
    hasSelection,
    selectionCount,
    selectionMode,
    boxSelection,
    selectionConfig,
    hoveredObject,
    
    // 方法
    selectObject,
    selectObjects,
    deselectObject,
    clearSelection,
    toggleSelection,
    selectAll,
    invertSelection,
    selectByType,
    selectByName,
    handleClickSelection,
    handleHover,
    startBoxSelection,
    updateBoxSelection,
    endBoxSelection,
    updateSelectionHighlights,
    getSelectionBounds,
    getSelectionCenter
  };
}
