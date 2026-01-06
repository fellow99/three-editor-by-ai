/**
 * Three.js 视图管理组合式函数
 */
import { watch, shallowRef } from 'vue';
import * as THREE from 'three';
import ThreeViewer from '../core/ThreeViewer.js';
import { useEditorConfig } from '../composables/useEditorConfig.js';
import { useCameraPosState } from '../composables/useCameraPosState.js';
import { useObjectManager } from '../composables/useObjectManager.js';
import { useObjectSelection } from '../composables/useObjectSelection.js';
import { useAssetsManager } from '../composables/useAssetsManager.js';
import { useInputManager } from '../composables/useInputManager.js';
import { axesLockState } from '../composables/useAxesLockState.js';
import { useGridHelper, useAxesHelper } from './useHelpers.js';
import { switchControls, setControlsLocked } from '@/composables/useControls.js';
import vfsService from '@/services/vfs-service';


let viewerRef = shallowRef(null);


/**
 * 清空视图
 */
export function clearViewer() {
    let viewer = viewerRef.value;
    if(!viewer) return;
    throw new Error('Not implemented yet');
}

/**
 * 加载场景数据，根据json结构重建场景
 * @param {object} json 场景数据
 * 新增功能：加载灯光和对象后，会将json中的userData完整恢复到Three.js对象的userData属性，包括自定义属性、动画索引等。
 * 这样可确保场景序列化与反序列化时所有对象的自定义数据都能正确还原。
 */
export async function loadScene(json) {
    let viewer = viewerRef.value;
    if(!viewer) return;
    throw new Error('Not implemented yet');
}

/**
 * 导出当前场景数据为JSON对象
 * @returns {object} 场景数据JSON对象
 */
export function exportScene() {
    let viewer = viewerRef.value;
    if(!viewer) return;
    throw new Error('Not implemented yet');
}

/**
 * 添加3DTiles模型
 * @param {Object} opt 3DTiles参数
 * @returns {THREE.Object3D} 新添加的3DTiles对象
 */
export async function add3DTiles(opt) {
    let viewer = viewerRef.value;
    if(!viewer) return;
    throw new Error('Not implemented yet');
}

/**
 * 添加灯光
 * @param {Object} opt 灯光参数
 * @returns {THREE.Object3D} 新添加的灯光对象
 */
export async function addLight(opt) {
    let viewer = viewerRef.value;
    if(!viewer) return;
    throw new Error('Not implemented yet');
}

/**
 * 添加3D模型
 * @param {Object} opt 3D模型参数
 * @returns {THREE.Object3D} 新添加的3D模型对象
 */
export async function add3DModel(opt) {
    let viewer = viewerRef.value;
    if(!viewer) return;

    let assetsManager = useAssetsManager();

    const fileInfo = opt.userData.fileInfo;
    const cached = assetsManager.getCachedModel(fileInfo.name);
    let modelInfo;
    if (cached) {
        // 如果模型已缓存，直接使用缓存
        modelInfo = cached;
    } else {
        // 使用url加载模型
        if(!fileInfo.url) {
        const vfs = vfsService.getVfs(fileInfo.drive);
        let url = vfs.url(fileInfo.path + '/' + fileInfo.name);
        fileInfo.url = url;
        }

        // 加载模型
        modelInfo = await assetsManager.loadModel(fileInfo);
    }
    const addOptions = {
        name: opt.name,
        position: opt.position,
        rotation: opt.rotation,
        scale: opt.scale,
        userData: opt.userData,
        material: opt.material // 支持材质参数
    };
    let model = await assetsManager.getModelClone(modelInfo.id, addOptions);
    
    addObject(model);
}

/**
 * 添加基础几何体
 * @param {Object} opt 几何体参数
 * @returns {THREE.Object3D} 新添加的几何体对象
 */
export async function addPrimitive(opt) {
    let viewer = viewerRef.value;
    if(!viewer) return;

    const objectManager = useObjectManager();
    let obj = objectManager.createPrimitive(opt.type, opt);

    addObject(obj);
}

/**
 * 添加任意对象到场景中
 * @param {THREE.Object3D} object 需要添加的对象
 * @returns {THREE.Object3D} 新添加的对象
 */
export function addObject(object) {
    let viewer = viewerRef.value;
    if(!viewer || !object) return;
    
    viewer.addObject(object);

    return object;
}

/**
 * 移除指定对象（递归查找）
 * @param {THREE.Object3D|string} objectOrId 对象或对象ID
 */
export function removeObject(objectOrId) {
    if(!objectOrId) return;
    const viewer = viewerRef.value;
    let uuid;
    if(typeof objectOrId === 'string') {
        uuid = objectOrId;
    } else if(objectOrId.isObject3D) {
        uuid = objectOrId.uuid;
    }
    viewer.scene.traverse((obj) => {
        if (obj.uuid === uuid) {
            if (obj.parent) {
                obj.parent.remove(obj);
            }
        }
    });
}

/**
 * 移除场景中的对象（只从lights/models/tilesModels/labels中移除）
 * @param {THREE.Object3D|string} objectOrId 对象或对象ID
 */
export function removeObjectFromScene(objectOrId) {
    if(!objectOrId) return;
    
    const eventBus = useEventBus();
    const viewer = viewerRef.value;
    let uuid;
    if(typeof objectOrId === 'string') {
        uuid = objectOrId;
    } else if(objectOrId.isObject3D) {
        uuid = objectOrId.uuid;
    }

    // 从viewer中移除
    let light = viewer.lights.find(obj => obj.uuid === uuid);
    if(light) {
        viewer.removeLight(light, true);
        /**
         * @event remove-light 场景中移除灯光对象时触发
         * @param {THREE.Object3D} object 被移除的灯光对象
         */
        eventBus.emit('remove-light', light);
    }

    let model = viewer.models.find(obj => obj.uuid === uuid);
    if(model) {
        viewer.remove3DModel(model, true);
        /**
         * @event remove-model 场景中移除3D模型对象时触发
         * @param {THREE.Object3D} object 被移除的3D模型对象
         */
        eventBus.emit('remove-model', model);
    } 

    let tileset = viewer.tilesModels.find(obj => obj.uuid === uuid);
    if(tileset) {
        viewer.remove3DTiles(tileset, true);
        /**
         * @event remove-3dtiles 场景中移除3DTiles对象时触发
         * @param {THREE.Object3D} object 被移除的3DTiles对象
         */
        eventBus.emit('remove-3dtiles', tileset);
    }

    let label = viewer.labels.find(obj => obj.uuid === uuid);
    if(label) {
        viewer.removeLabel(label, true);
        /**
         * @event remove-label 场景中移除标签对象时触发
         * @param {THREE.Object3D} object 被移除的标签对象
         */
        eventBus.emit('remove-label', label);
    }

    let primitive = viewer.primitives.find(obj => obj.uuid === uuid);
    if(primitive) {
        viewer.primitiveGroup.remove(primitive, true);
        /**
         * @event remove-primitive 场景中移除基础图元对象时触发
         * @param {THREE.Object3D} object 被移除的基础图元对象
         */
        eventBus.emit('remove-primitive', primitive);
    }
}

/**
 * 根据userData中的指定key（支持多层，如xxx.yyy）查找匹配value的对象
 * @param {string} key 多层key，使用点号分隔，如"foo.bar.baz"
 * @param {any} value 目标值
 * @returns {THREE.Object3D[]} 匹配的对象数组
 * 新语法：递归读取userData嵌套属性，支持多层key
 */
export function findModelsByUserData(key, value) {
    const viewer = viewerRef.value;

    // 解析多层key
    const keys = key.split('.');
    // 获取所有场景对象
    const objects = viewer.models;
    // 递归读取嵌套userData属性
    function getNested(obj, keysArr) {
      let cur = obj;
      for (let k of keysArr) {
        if (cur == null || typeof cur !== 'object') return undefined;
        cur = cur[k];
      }
      return cur;
    }
    // 筛选匹配对象
    return objects.filter(obj => {
      const userData = obj.userData || {};
      const val = getNested(userData, keys);
      return val === value;
    });
}

/**
 * 根据ID查找对象
 * @param {string} id 对象ID
 * @returns {THREE.Object3D} 匹配的对象
 */
export function getObjectById(id) {
    if(!id) return;
    const viewer = viewerRef.value;
    return viewer.scene.getObjectByProperty('uuid', id);
}

/**
 * 根据ID数组查找对象数组
 * @param {string[]} ids 对象ID数组
 * @returns {THREE.Object3D[]} 匹配的对象数组
 */
export function getObjectsByIds(ids) {
    if(!ids || ids.length === 0) return [];
    const objects = [];
    ids.forEach(id => {
        const obj = getObjectById(id);
        if(obj) objects.push(obj);
    });
    return objects;
}

function initThreeViewer(threeViewer) {
  if (threeViewer) return threeViewer;

  const { editorConfig } = useEditorConfig();

  // 新增：监听Y轴锁定状态，动态调整gridHelper位置和颜色
  watch(
    axesLockState,
    (state) => {
      let viewer = viewerRef.value;
      if(!viewer) return;

      let gridHelper = viewer.gridHelper;
      if (!gridHelper) return;

      if (state.locked) {
        // 锁定时，设置y轴位置和颜色为黄色
        gridHelper.position.y = state.yValue;
        // 线条全部变为黄色
        const yellow = new THREE.Color(0xffff00);
        if (this.gridHelper.material) {
          gridHelper.material._originalColor = gridHelper.material.color ? gridHelper.material.color.clone() : null;
          gridHelper.material.color && gridHelper.material.color.copy(yellow);
        }
      } else {
        // 解锁时，恢复y=0和原色
        gridHelper.position.y = 0;
        const { editorConfig } = useEditorConfig();
        const centerColor = new THREE.Color(editorConfig.gridColorCenterLine);
        const gridColor = new THREE.Color(editorConfig.gridColorGrid);
        if (gridHelper.material && gridHelper.material._originalColor) {
          gridHelper.material.color.copy(gridHelper.material._originalColor);
          delete gridHelper.material._originalColor;
        }
      }
    },
    { deep: true, immediate: true }
  );
  

  watch(
      editorConfig,
      (cfg) => {
          let viewer = viewerRef.value;
          if(!viewer) return;

          const gridHelperRef = useGridHelper();
          const axesHelperRef = useAxesHelper();
          let gridHelper = gridHelperRef.value;
          let axesHelper = axesHelperRef.value;
      
          let { scene, camera, renderer } = viewer;

          // 切换控制器
          let controls = switchControls(cfg.controlsType);
          // 控制器参数
          if (controls) {
              controls.rotateSpeed = cfg.rotateSpeed;
              controls.zoomSpeed = cfg.zoomSpeed;
              controls.panSpeed = cfg.panSpeed;
          }
          // 切换配置后同步锁定状态
          setControlsLocked();

          // 初始化变换控件
          const { initTransformControls } = useObjectSelection();
          initTransformControls({
              scene: scene,
              camera: camera,
              renderer: renderer,
              controls: controls
          });
          
          // 网格辅助线重建
          if (gridHelper) {
              scene.remove(gridHelper);
              gridHelper.geometry.dispose();
              if (Array.isArray(gridHelper.material)) {
                  gridHelper.material.forEach(m => m.dispose && m.dispose());
              } else if (gridHelper.material) {
                  gridHelper.material.dispose && gridHelper.material.dispose();
              }
              gridHelper = null;
          }
          gridHelper = new THREE.GridHelper(
              cfg.gridSize,
              cfg.gridDivisions,
              new THREE.Color(cfg.gridColorCenterLine),
              new THREE.Color(cfg.gridColorGrid)
          );
          gridHelper.name = 'grid_helper';
          scene.add(gridHelper);
          gridHelperRef.value = gridHelper;

          // 坐标轴辅助线重建
          if (axesHelper) {
              scene.remove(axesHelper);
              axesHelper.geometry.dispose && axesHelper.geometry.dispose();
              axesHelper = null;
          }
          axesHelper = new THREE.AxesHelper(cfg.axesSize);
          axesHelper.name = 'axes_helper';
          scene.add(axesHelper);
          axesHelperRef.value = axesHelper;
      },
      { deep: true, immediate: true }
  );
}

export function useThreeViewer() {
  if(!viewerRef.value) {
    const objectManager = useObjectManager();
    const objectSelection = useObjectSelection();
    const assetsManager = useAssetsManager();
    const inputManager = useInputManager();
    const options = {
      objectManager,
      objectSelection,
      assetsManager,
      inputManager
    };
    const threeViewer = new ThreeViewer(options);
    initThreeViewer(threeViewer);
    viewerRef.value = threeViewer;
  }
  return viewerRef;
}