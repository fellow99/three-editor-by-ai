/**
 * 对象选择与变换控制管理组合式函数
 * 提供对象选择、TransformControls、选中对象辅助显示等功能
 */

import { ref, reactive, computed, watch } from 'vue';
import * as THREE from 'three';
import { DirectionalLightHelper, PointLightHelper, SpotLightHelper, HemisphereLightHelper, CameraHelper, BoxHelper } from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { FlyControls } from '../controls/FlyControls.js';
import { useAxesLockState } from './useAxesLockState.js';
import { useThreeViewer, getObjectById, getObjectsByIds } from './useThreeViewer.js';
import { useControls, getControlsLocked } from './useControls.js';
import { useInputManager } from './useInputManager.js';

const inputManager = useInputManager();
const axesLockState = useAxesLockState();

// 选中的对象ID列表
const selectedIdsRef = ref([]);

// TransformControls及辅助对象相关
/** @type {TransformControls|null} */
let transformControls = null;
/** @type {THREE.Object3D|null} */
let transformHelper = null;
/** @type {THREE.Object3D|null} */
let currentTransformObject = null;
/**
 * 当前选中对象的辅助对象集合
 * key为对象id，value为helper实例
 */
let currentHelpers = {};
/** @type {object|null} */
let transform = null; // 外部传入响应式transform对象
/** @type {object|null} */
let scene = null; // 外部传入Three.js场景对象
/** @type {object|null} */
let camera = null; // 外部传入Three.js相机对象
/** @type {object|null} */
let renderer = null; // 外部传入Three.js渲染器对象
/** @type {object|null} */
let controls = null; // OrbitControls实例

let multiSelectBoxRef = ref(null);
let multiSelectBoxHelper = null;

/**
 * 初始化TransformControls及辅助对象
 * @param {object} options { scene, camera, renderer, controls, objectSelection, transform }
 */
function initTransformControls(options = {}) {
  scene = options.scene;
  camera = options.camera;
  renderer = options.renderer;
  controls = options.controls;
  transform = options.transform;

  if (!scene || !camera || !renderer) return;
  if (transformControls) {
    scene.remove(transformControls);
    transformControls.dispose?.();
    transformControls = null;
  }
  transformControls = new TransformControls(camera, renderer.domElement);

  // 监听变换事件，同步属性
  transformControls.addEventListener('objectChange', () => {
    // 变换时动态更新BoxHelper
    Object.values(currentHelpers).forEach(helper => {
      if (helper instanceof BoxHelper) {
        helper.update();
      }
    });
    
    if (currentTransformObject.type === 'AxesHelper' && controls) {
      // 移动视点
      let pos = currentTransformObject.position;
      controls.target.copy(pos);

    } else if (currentTransformObject) {
      // Y轴锁定：仅translate模式且锁定时生效
      if (
        transformControls.mode === 'translate' &&
        axesLockState.locked
      ) {
        currentTransformObject.position.y = axesLockState.yValue;
      }
      setObjectTransform(
        currentTransformObject.uuid,
        {
          position: [
            currentTransformObject.position.x,
            currentTransformObject.position.y,
            currentTransformObject.position.z
          ],
          rotation: [
            currentTransformObject.rotation.x,
            currentTransformObject.rotation.y,
            currentTransformObject.rotation.z
          ],
          scale: [
            currentTransformObject.scale.x,
            currentTransformObject.scale.y,
            currentTransformObject.scale.z
          ]
        }
      );
    }
  });

  // 拖拽时禁用当前控制器（OrbitControls、MapControls、FlyControls）
  // 拖拽时禁用当前控制器（OrbitControls、MapControls、FlyControls）
  transformControls.addEventListener('dragging-changed', (event) => {
    // 拖拽开始/结束时，记录变换历史
    try {
      // 动态引入 useTransform，避免循环依赖
      import('../composables/useTransform.js').then(mod => {
        const transform = mod.default ? mod.default() : mod.useTransform();
        if (event.value) {
          // 拖拽开始
          transform.startTransform();
        } else {
          // 拖拽结束
          transform.endTransform();
        }
      });
    } catch (e) {
      // ignore
    }
    if (controls) {
      // 判断控制器类型，禁用对应控制器（instanceof判断，兼容混淆环境）
      if (
        controls instanceof OrbitControls ||
        controls instanceof MapControls ||
        controls instanceof FlyControls
      ) {
        controls.enabled = !event.value;
        // 拖拽结束后，主动重置控制器状态
        if (!event.value && typeof controls.state !== 'undefined') {
          controls.state = -1; // _STATE.NONE
        }
        // 拖拽结束时，若镜头锁定则保持controls.enabled=false
        if (!event.value) {
          let controlsRef = useControls();
          let controls = controlsRef.value;
          if(controls && getControlsLocked()) {
            controls.enabled = false;
          }
        }
      }
    }
  });

  // 禁止TransformControls事件冒泡到OrbitControls等
  transformControls.addEventListener('mouseDown', (event) => {
    event.stopPropagation?.();
  });

  // 添加辅助对象到场景
  transformHelper = transformControls.getHelper ? transformControls.getHelper() : null;
  if (transformHelper) {
    scene.add(transformHelper);
  }

  // 监听transformMode变化
  if (transform && transform.transformMode) {
    watch(() => transform.transformMode.value, (mode) => {
      if (transformControls) {
        transformControls.setMode(mode);
        if (currentTransformObject) {
          transformControls.attach(currentTransformObject);
          transformControls.visible = true;
        }
      }
    }, { immediate: true });
  }

  // 监听选中对象变化
  watch(selectedIdsRef, (ids) => {
    let objs = getObjectsByIds(ids);
    if (objs.length === 1) {
      currentTransformObject = objs[0];
      // 检查transformHelper是否已挂载到场景，若未挂载则重新添加
      if (transformHelper && scene && !scene.children.includes(transformHelper)) {
        scene.add(transformHelper);
      }
      // 锁定状态下不绑定transformControls
      if (currentTransformObject.userData && currentTransformObject.userData.locked) {
        transformControls.detach();
        transformControls.visible = false;
      } else {
        transformControls.attach(currentTransformObject);
        transformControls.visible = true;
      }
    } else {
      transformControls.detach();
      transformControls.visible = false;
    }
    // 多选时也要为每个选中对象生成helper
    updateSelectedHelpers();
  }, { deep: true, immediate: true });
}

/**
 * 移除TransformControls及相关helper
 */
function disposeTransformControls() {
  if (transformControls && scene) {
    scene.remove(transformControls);
    if (transformHelper) scene.remove(transformHelper);
    transformControls.dispose?.();
    transformControls = null;
  }
  if (currentHelper && scene) {
    scene.remove(currentHelper);
    if (currentHelper.dispose) currentHelper.dispose();
    currentHelper = null;
  }
}

/**
 * 为每个选中对象动态更新helper
 */
function updateSelectedHelpers() {
  clearCurrentHelpers();

  let objects = getSelectedObjects();
  
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if (!viewer) return;

  let { scene } = viewer;
  if (!scene || !objects) return;

  if(!Array.isArray(objects)) objects = [objects];

  objects.forEach(selected => {
    let helper = null;
    if (selected.isDirectionalLight) {
      helper = new DirectionalLightHelper(selected, 5, 0xffaa00);
    } else if (selected.isPointLight) {
      helper = new PointLightHelper(selected, 2, 0x00aaff);
    } else if (selected.isSpotLight) {
      helper = new SpotLightHelper(selected, 2, 0xaaff00);
    } else if (selected.isHemisphereLight) {
      helper = new HemisphereLightHelper(selected, 2);
    } else if (selected.isCamera) {
      helper = new CameraHelper(selected);
    } else if (selected.type && selected.type.indexOf('Helper') !== -1) {
      // 已经是Helper类型，则不再添加
      helper = null;
    } else {
      helper = new BoxHelper(selected, 0xffff00);
    }
    if (helper) {
      scene.add(helper);
      currentHelpers[selected.uuid] = helper;
    }
  });
}

/**
 * 清除所有当前helper
 */
function clearCurrentHelpers() {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if (!viewer) return;

  let { scene } = viewer;
  Object.values(currentHelpers).forEach(helper => {
    scene.remove(helper);
    if (helper.dispose) helper.dispose();
  });
  currentHelpers = {};
  
  // 更新/清除多选盒
  updateMultiSelectBox();
}

function getSelectedObjects() {
  let ids = selectedIdsRef.value;
  return getObjectsByIds(ids);
}

/**
 * 选择单个对象
 * @param {string|THREE.Object3D} objectOrId 对象或ID
 * @param {boolean} addToSelection 是否添加到现有选择
 */
function selectObject(objectOrId, addToSelection = false) {
  if (!addToSelection) {
    clearSelection();
  }
  if(!objectOrId) return;

  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if (!viewer) return;

  let id;
  if(objectOrId.isObject3D) {
    id = objectOrId.uuid;
  } else {
    id = objectOrId;
  }
  let object = getObjectById(id);
  if (!object) return;
  if(selectedIdsRef.value.includes(id)) return;

  // 添加到选择集中
  selectedIdsRef.value.push(id);
}

/**
 * 取消选择对象
 * 保证镜头锁定状态优先，主动同步SceneManager的controlsLocked到controls.enabled
 * @param {string|THREE.Object3D} objectOrId 对象或ID
 */
function deselectObject(objectOrId) {
  if(!objectOrId) return;

  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if (!viewer) return;

  let id;
  if(objectOrId.isObject3D) {
    id = objectOrId.uuid;
  } else {
    id = objectOrId;
  }
  let object = getObjectById(id);
  if (!object) return;
  
  // 从选择集中移除
  if(selectedIdsRef.value.includes(id)) {
    selectedIdsRef.value = selectedIdsRef.value.filter(selectedId => selectedId !== id);
  }
  
  // 同步controls.enabled状态
  let controlsRef = useControls();
  let controls = controlsRef.value;
  if(controls && getControlsLocked()) {
    controls.enabled = false;
  }
}

/**
 * 清空选择
 * 保证镜头锁定状态优先，主动同步SceneManager的controlsLocked到controls.enabled
 */
function clearSelection() {
  selectedIdsRef.value = [];

  // 同步controls.enabled状态
  let controlsRef = useControls();
  let controls = controlsRef.value;
  if(controls && getControlsLocked()) {
    controls.enabled = false;
  }
}

/**
 * 切换对象选择状态
 * @param {string|THREE.Object3D} objectOrId 对象或ID
 */
function toggleSelection(objectOrId) {
  if(!objectOrId) return;

  let id;
  if(objectOrId.isObject3D) {
    id = objectOrId.uuid;
  } else {
    id = objectOrId;
  }

  if(selectedIdsRef.value.includes(id)) {
    deselectObject(id);
  } else {
    selectObject(id, true);
  }
}

/**
 * 高效获取射线第一个相交未锁定对象
 * 只返回第一个命中的顶级未锁定对象，适用于对象数量极大时的高性能选择
 * @param {THREE.Raycaster} raycaster 射线投射器
 * @returns {THREE.Object3D|null} 第一个相交未锁定对象或null
 */
function getIntersectedFirstObject(camera) {
  const viewerRef = useThreeViewer();
  const viewer = viewerRef.value;
  if(!viewer) return null;
  
  // 合并模型和标签进行射线检测
  const objects = viewer.scene.children;

  // 射线检测 
  const raycaster = inputManager.getRaycaster(camera);
  const intersects = raycaster.intersectObjects(objects, true);
  if (intersects.length === 0) return null;

  // 找到顶级管理的对象
  let targetObject = intersects[0].object;
  while (targetObject.parent && !objects.find(obj => obj.uuid === targetObject.uuid)) {
    targetObject = targetObject.parent;
  }
  return objects.find(obj => obj.uuid === targetObject.uuid) || null;
}

/**
 * 处理鼠标点击选择
 * @param {object} event 鼠标事件数据
 * @param {THREE.Camera} camera 相机
 */
function handleClickSelection(event, camera) {
  const targetObject = getIntersectedFirstObject(camera);
  if (targetObject) {
    if (targetObject.userData && targetObject.userData.locked) {
      // 如果对象被锁定，则不允许选中
      return;
    }
    if(targetObject.type && targetObject.type.indexOf('Helper') !== -1) {
      // 如果点击的是Helper类型对象，则不允许选中
      return;
    }
    const addToSelection = event.modifiers?.ctrl || event.modifiers?.shift;
    if (addToSelection) {
      toggleSelection(targetObject);
    } else {
      selectObject(targetObject, false);
    }
    return;
  }
  // 点击空白区域，清空选择
  if (!event.modifiers?.ctrl && !event.modifiers?.shift) {
    clearSelection();
  }
}

/**
 * 获取选择边界框
 * @returns {THREE.Box3|null} 边界框
 */
function getSelectionBounds() {
  let objs = getSelectedObjects();
  if (objs.length === 0) return null;
  
  const box = new THREE.Box3();
  
  objs.forEach(object => {
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

/**
 * 设置对象变换
 * @param {string} objectId 对象ID
 * @param {object} transform 变换参数
 */
function setObjectTransform(objectId, transform) {
  const object = getObjectById(objectId);
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
  // 变换后分发事件，通知属性面板刷新
  window.dispatchEvent(new CustomEvent('object-transform-updated', { detail: { objectId } }));
}

/**
 * 获取对象变换
 * @param {string} objectId 对象ID
 * @returns {object|null} 变换数据
 */
function getObjectTransform(objectId) {
  const object = getObject(objectId);
  if (!object) return null;
  
  return {
    position: object.position.toArray(),
    rotation: object.rotation.toArray(),
    scale: object.scale.toArray()
  };
}



/**
 * 选择对象
 * @param {string|string[]} objectIds 对象ID或ID数组
 * @param {boolean} addToSelection 是否添加到现有选择
 */
function selectObjects(objectIds, addToSelection = false) {
  if (!addToSelection) {
    selectedIdsRef.value = [];
  }
  
  objectIds && objectIds.forEach(id => {
    selectedObject(id, true);
  });
}

function updateMultiSelectBox() {
  if (multiSelectBoxHelper) {
    multiSelectBoxHelper.object.dispose();
    scene.remove(multiSelectBoxHelper);
    multiSelectBoxHelper.dispose();
    multiSelectBoxHelper = null;
  }

  // 先清除旧的多选盒
  if(multiSelectBoxRef.value) {
    multiSelectBoxRef.value.geometry.dispose();
    multiSelectBoxRef.value = null;
  }

  let ids = selectedIdsRef.value;
  if(!ids || ids.length < 2) return;
  const bounds = getSelectionBounds();
  if (!bounds) return;

  let multiSelectBox = new THREE.Mesh(new THREE.BoxGeometry(
    bounds.max.x - bounds.min.x,
    bounds.max.y - bounds.min.y,
    bounds.max.z - bounds.min.z
  ));
  // 取最小坐标作为位置基准
  multiSelectBox.geometry.translate(
    (bounds.max.x - bounds.min.x) / 2,
    (bounds.max.y - bounds.min.y) / 2,
    (bounds.max.z - bounds.min.z) / 2
  );
  multiSelectBox.position.copy((bounds.min));
  multiSelectBoxRef.value = multiSelectBox;

  multiSelectBoxHelper = new BoxHelper();
  multiSelectBoxHelper.setFromObject(multiSelectBox);
  multiSelectBoxHelper.position.copy(bounds.getCenter(new THREE.Vector3()));
  scene.add(multiSelectBoxHelper);

  return multiSelectBox;
}

/**
 * useObjectSelection
 * 3D对象选择与变换控制管理的组合式函数，提供响应式选择状态、TransformControls与辅助对象管理
 * @returns {object} 选择相关状态与方法
 */
export function useObjectSelection() {
  return {
    // 状态
    selectedIdsRef,
    multiSelectBoxRef,

    // TransformControls相关
    initTransformControls,
    disposeTransformControls,
    updateSelectedHelpers,
    get transformControls() { return transformControls; },
    get currentTransformObject() { return currentTransformObject; },
    get currentHelpers() { return currentHelpers; },

    // 方法
    getSelectedObjects,
    selectObject,
    selectObjects,
    deselectObject,
    clearSelection,
    toggleSelection,
    handleClickSelection,
    getSelectionBounds,
    getSelectionCenter,

    setObjectTransform,
    getObjectTransform,

    updateMultiSelectBox
    
  };
}
