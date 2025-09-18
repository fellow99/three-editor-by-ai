/**
 * 场景管理 Composable
 * 提供场景相关的响应式状态和操作方法
 */

/**
 * 场景管理 Composable
 * 提供场景相关的响应式状态和操作方法
 * 新增：Y轴锁定功能，axesLockState用于记录Y轴锁定状态及锁定值
 */

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { useSceneManager } from '../core/SceneManager.js';
import { useObjectManager } from '../core/ObjectManager.js';
import { useInputManager } from '../core/InputManager.js';

const sceneManager = useSceneManager();
const objectManager = useObjectManager();
const inputManager = useInputManager();

import { axesLockState, setAxesLockState } from './useAxesLockState.js';

// 响应式状态
const isInitialized = ref(false);
const isRendering = computed(() => sceneManager.state.isRendering);
const fps = computed(() => sceneManager.state.fps);
const frameCount = computed(() => sceneManager.state.frameCount);

// 场景配置
const sceneConfig = reactive({
  backgroundColor: '#222222',
  fogEnabled: false,
  fogColor: '#222222',
  fogNear: 1000,
  fogFar: 10000,
  shadowsEnabled: true,
  toneMappingEnabled: true,
  exposure: 1.0
});

// 相机状态
const cameraState = reactive({
  position: { x: 5, y: 5, z: 5 },
  target: { x: 0, y: 0, z: 0 },
  fov: 75,
  near: 0.1,
  far: 1000
});

/**
 * 初始化场景
 * @param {HTMLElement} container DOM容器
 */
function initScene(container) {
  if (!container) return;
  
  try {
    sceneManager.setContainer(container);
    inputManager.setElement(sceneManager.renderer.domElement);
    
    // 应用初始配置
    applySceneConfig();
    applyCameraConfig();
    
    isInitialized.value = true;
  } catch (error) {
    console.error('初始化场景失败:', error);
  }
}

/**
 * 开始渲染
 */
function startRender() {
  sceneManager.startRender();
}

/**
 * 停止渲染
 */
function stopRender() {
  sceneManager.stopRender();
}

/**
 * 应用场景配置
 */
function applySceneConfig() {
  if (!sceneManager.scene) return;
  
  // 设置背景色
  sceneManager.setBackground(new THREE.Color(sceneConfig.backgroundColor));
  
  // 设置雾效
  if (sceneConfig.fogEnabled) {
    sceneManager.scene.fog = new THREE.Fog(
      sceneConfig.fogColor,
      sceneConfig.fogNear,
      sceneConfig.fogFar
    );
  } else {
    sceneManager.scene.fog = null;
  }
  
  // 设置渲染器属性
  if (sceneManager.renderer) {
    sceneManager.renderer.shadowMap.enabled = sceneConfig.shadowsEnabled;
    sceneManager.renderer.toneMappingExposure = sceneConfig.exposure;
  }
}

/**
 * 应用相机配置
 * 设置相机位置和目标点，并同步OrbitControls的target
 */
function applyCameraConfig() {
  if (!sceneManager.camera) return;
  
  // 设置相机位置
  sceneManager.camera.position.set(
    cameraState.position.x,
    cameraState.position.y,
    cameraState.position.z
  );
  
  // 设置相机目标
  sceneManager.camera.lookAt(
    cameraState.target.x,
    cameraState.target.y,
    cameraState.target.z
  );

  // 设置OrbitControls的target为新的位置对象
  if (sceneManager.controls) {
    const newTarget = new THREE.Vector3(
      cameraState.target.x,
      cameraState.target.y,
      cameraState.target.z
    );
    sceneManager.controls.target.copy(newTarget);
    sceneManager.controls.update();
  }
  
  // 设置相机参数
  sceneManager.camera.fov = cameraState.fov;
  sceneManager.camera.near = cameraState.near;
  sceneManager.camera.far = cameraState.far;
  sceneManager.camera.updateProjectionMatrix();
}

/**
 * 更新场景配置
 * @param {object} config 配置对象
 */
function updateSceneConfig(config) {
  Object.assign(sceneConfig, config);
  applySceneConfig();
}

/**
 * 更新相机配置
 * @param {object} config 配置对象
 */
function updateCameraConfig(config) {
  Object.assign(cameraState, config);
  applyCameraConfig();
  
  // 如果有控制器，同时更新目标位置
  if (sceneManager.controls && config.target) {
    sceneManager.controls.target.set(
      config.target.x,
      config.target.y,
      config.target.z
    );
    sceneManager.controls.update();
  }
}

/**
 * 添加对象到场景
 * @param {THREE.Object3D} object 3D对象
 */
function addObjectToScene(object) {
  sceneManager.addObject(object);
}

/**
 * 从场景移除对象
 * @param {string|THREE.Object3D} objectOrId 对象或ID
 */
function removeObjectFromScene(objectOrId) {
  let object;
  
  if (typeof objectOrId === 'string') {
    object = objectManager.getObject(objectOrId);
  } else {
    object = objectOrId;
  }
  
  if (object) {
    // 先从Three.js场景中移除对象
    sceneManager.removeObject(object);
    
    // 再从对象管理器中移除
    objectManager.removeObject(objectOrId);
  }
}

/**
 * 清空场景
 */
function clearScene() {
  objectManager.clear();
  sceneManager.clearScene();
}

/**
 * 创建基础几何体
 * @param {string} type 几何体类型
 * @param {object} options 选项
 * @returns {THREE.Mesh} 创建的网格对象
 */
function createPrimitive(type, options = {}) {
  const mesh = objectManager.createPrimitive(type, options);
  sceneManager.addObject(mesh);
  return mesh;
}

/**
 * 获取场景统计信息
 * @returns {object} 统计信息
 */
function getSceneStats() {
  const objects = objectManager.getAllObjects();
  
  let vertices = 0;
  let triangles = 0;
  let materials = new Set();
  let textures = new Set();
  
  objects.forEach(object => {
    object.traverse(child => {
      if (child.geometry) {
        const positionAttribute = child.geometry.getAttribute('position');
        if (positionAttribute) {
          vertices += positionAttribute.count;
        }
        
        const index = child.geometry.getIndex();
        if (index) {
          triangles += index.count / 3;
        } else if (positionAttribute) {
          triangles += positionAttribute.count / 3;
        }
      }
      
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => materials.add(mat));
        } else {
          materials.add(child.material);
        }
      }
    });
  });
  
  // 统计纹理
  materials.forEach(material => {
    Object.values(material).forEach(value => {
      if (value && value.isTexture) {
        textures.add(value);
      }
    });
  });
  
  return {
    objects: objects.length,
    vertices,
    triangles,
    materials: materials.size,
    textures: textures.size,
    fps: fps.value,
    frameCount: frameCount.value
  };
}

/**
 * 导出场景数据
 * @returns {object} 场景数据
 */
function exportScene() {
  const sceneData = sceneManager.exportScene();
  const objectData = objectManager.exportObjects();
  
  return {
    ...sceneData,
    ...objectData,
    config: { ...sceneConfig },
    camera: { ...cameraState },
    exportedAt: new Date().toISOString()
  };
}

/**
 * 重置场景到默认状态
 */
function resetScene() {
  clearScene();
  
  // 重置配置
  Object.assign(sceneConfig, {
    backgroundColor: '#222222',
    fogEnabled: true,
    fogColor: '#222222',
    fogNear: 1000,
    fogFar: 10000,
    shadowsEnabled: true,
    toneMappingEnabled: true,
    exposure: 1.0
  });
  
  Object.assign(cameraState, {
    position: { x: 5, y: 5, z: 5 },
    target: { x: 0, y: 0, z: 0 },
    fov: 75,
    near: 0.1,
    far: 1000
  });

  // 新增：重置相机对象
  if (sceneManager.createCamera) {
    sceneManager.createCamera();
  }  
  
  applySceneConfig();
  applyCameraConfig();

  // 设置默认灯光
  sceneManager.setupLights();
}

/**
 * 聚焦到对象
 * 计算对象包围盒中心点，设置OrbitControls target为该位置对象
 * @param {string|THREE.Object3D} objectOrId 对象或ID
 */
function focusOnObject(objectOrId) {
  let object;
  
  if (typeof objectOrId === 'string') {
    object = objectManager.getObject(objectOrId);
  } else {
    object = objectOrId;
  }
  
  if (!object || !sceneManager.camera) return;
  
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

  cameraState.position.x = newPosition.x;
  cameraState.position.y = newPosition.y;
  cameraState.position.z = newPosition.z;
  cameraState.target.x = center.x;
  cameraState.target.y = center.y;
  cameraState.target.z = center.z;
  
  applyCameraConfig();
}

export function useScene() {
  return {
    // 状态
    isInitialized,
    isRendering,
    fps,
    frameCount,
    sceneConfig,
    cameraState,
    axesLockState, // 新增：Y轴锁定状态

    // 方法
    initScene,
    startRender,
    stopRender,
    applySceneConfig,
    applyCameraConfig,
    updateSceneConfig,
    updateCameraConfig,
    addObjectToScene,
    removeObjectFromScene,
    clearScene,
    createPrimitive,
    add3DTiles: sceneManager.add3DTiles.bind(sceneManager), // 新增：创建3DTiles模型
    getSceneStats,
    exportScene,
    resetScene,
    focusOnObject,
    setAxesLockState, // 新增：设置Y轴锁定状态

    // 管理器实例
    sceneManager,
    objectManager,
    inputManager
  };
}
