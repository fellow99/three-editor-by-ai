/**
 * 场景管理器
 * 负责Three.js场景的创建、管理和渲染，并统一驱动对象动画（如GLTF动画）。
 * 动画机制：遍历场景对象，若对象有mixer（AnimationMixer实例），则在渲染循环中调用mixer.update(delta)。
 * 新语法：为每个有动画的对象挂载mixer到object.userData._mixer，动画选择由userData.animationIndex控制。
 * 新增功能：支持镜头锁定（controlsLocked），锁定时controls.enabled=false，避免与TransformControls拖拽冲突。
 */

import * as THREE from 'three';
/**
 * 新增功能：切换controls后自动同步TransformControls，确保拖拽时镜头不会跟随移动。
 * 新语法：在switchControls方法末尾调用useObjectSelection.js的initTransformControls，传入最新controls实例。
 */
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { FlyControls } from '../controls/FlyControls.js';
import { useEditorConfig } from '../composables/useEditorConfig.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { reactive, watch } from 'vue';

import { useObjectManager } from './ObjectManager.js';
import { useObjectSelection } from '../composables/useObjectSelection.js';
import vfsService from '../services/vfs-service.js';
import { useAssets } from '../composables/useAssets.js';
import { axesLockState } from '../composables/useAxesLockState.js';

/**
 * @class SceneManager
 * Three.js场景、渲染器、相机、控制器、后处理等统一管理类
 */
class SceneManager {
  /**
   * Three.js场景管理器，支持OrbitControls和FlyControls切换
   */
  constructor() {
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.controls = null; // 控制器实例（OrbitControls/MapControls/FlyControls）
    this.container = null;
    this.animationId = null;

    // 镜头锁定状态
    this.controlsLocked = false;

    // 动画相关
    this.mixers = []; // 所有AnimationMixer实例

    // 后处理
    this.composer = null;
    this.passes = [];

    // 响应式状态
    this.state = reactive({
      isInitialized: false,
      isRendering: false,
      frameCount: 0,
      fps: 0
    });
    
    // 性能监控
    this.lastTime = 0;
    this.frameCount = 0;
    this.lastRenderTime = performance.now();

    // 事件监听器
    this.resizeHandler = this.handleResize.bind(this);
    
    this.init();

    // 实时监听编辑器配置变化，动态更新辅助线和控制器参数
    const { editorConfig } = useEditorConfig();
    watch(
      editorConfig,
      (cfg) => {
        // 控制器类型切换
        this.switchControls(cfg.controlsType);

        // 网格辅助线重建
        if (this.gridHelper && this.scene) {
          this.scene.remove(this.gridHelper);
          this.gridHelper.geometry.dispose();
          if (Array.isArray(this.gridHelper.material)) {
            this.gridHelper.material.forEach(m => m.dispose && m.dispose());
          } else if (this.gridHelper.material) {
            this.gridHelper.material.dispose && this.gridHelper.material.dispose();
          }
          this.gridHelper = null;
        }
        if (this.scene) {
          this.gridHelper = new THREE.GridHelper(
            cfg.gridSize,
            cfg.gridDivisions,
            new THREE.Color(cfg.gridColorCenterLine),
            new THREE.Color(cfg.gridColorGrid)
          );
          this.gridHelper.name = 'grid_helper';
          this.scene.add(this.gridHelper);
        }
        // 坐标轴辅助线重建
        if (this.axesHelper && this.scene) {
          this.scene.remove(this.axesHelper);
          this.axesHelper.geometry.dispose && this.axesHelper.geometry.dispose();
          this.axesHelper = null;
        }
        if (this.scene) {
          this.axesHelper = new THREE.AxesHelper(cfg.axesSize);
          this.axesHelper.name = 'axes_helper';
          this.scene.add(this.axesHelper);
        }
        // 控制器参数
        if (this.controls) {
          this.controls.rotateSpeed = cfg.rotateSpeed;
          this.controls.zoomSpeed = cfg.zoomSpeed;
          this.controls.panSpeed = cfg.panSpeed;
        }
        // 切换配置后同步锁定状态
        this.setControlsLocked(this.controlsLocked);
      },
      { deep: true }
    );

    // 新增：监听Y轴锁定状态，动态调整gridHelper位置和颜色
    watch(
      axesLockState,
      (state) => {
        if (!this.gridHelper) return;
        if (state.locked) {
          // 锁定时，设置y轴位置和颜色为黄色
          this.gridHelper.position.y = state.yValue;
          // 线条全部变为黄色
          const yellow = new THREE.Color(0xffff00);
          if (this.gridHelper.material) {
            this.gridHelper.material._originalColor = this.gridHelper.material.color ? this.gridHelper.material.color.clone() : null;
            this.gridHelper.material.color && this.gridHelper.material.color.copy(yellow);
          }
        } else {
          // 解锁时，恢复y=0和原色
          this.gridHelper.position.y = 0;
          const { editorConfig } = useEditorConfig();
          const centerColor = new THREE.Color(editorConfig.gridColorCenterLine);
          const gridColor = new THREE.Color(editorConfig.gridColorGrid);
          if (this.gridHelper.material && this.gridHelper.material._originalColor) {
            this.gridHelper.material.color.copy(this.gridHelper.material._originalColor);
            delete this.gridHelper.material._originalColor;
          }
        }
      },
      { deep: true, immediate: true }
    );
  }

  /**
   * 加载场景数据，根据json结构重建场景
   * @param {object} json 场景数据
   * 新增功能：加载灯光和对象后，会将json中的userData完整恢复到Three.js对象的userData属性，包括自定义属性、动画索引等。
   * 这样可确保场景序列化与反序列化时所有对象的自定义数据都能正确还原。
   */
  async loadScene(json) {
    const { loadModel, addModelToScene, getCachedModel } = useAssets();
    await this.clearScene();

    const objectManager = useObjectManager();

    if (json.camera && this.camera) {
      if (json.camera.position && typeof json.camera.position.x === 'number') {
        this.camera.position.set(
          json.camera.position.x,
          json.camera.position.y,
          json.camera.position.z
        );
      }
      if (json.camera.target && this.controls && this.controls.target) {
        this.controls.target.set(
          json.camera.target.x,
          json.camera.target.y,
          json.camera.target.z
        );
        this.controls.update && this.controls.update();
      }
      if (typeof json.camera.fov === 'number') this.camera.fov = json.camera.fov;
      if (typeof json.camera.near === 'number') this.camera.near = json.camera.near;
      if (typeof json.camera.far === 'number') this.camera.far = json.camera.far;
      this.camera.updateProjectionMatrix();
    }

    if (json.background && this.scene) {
      if (typeof json.background === 'number') {
        this.scene.background = new THREE.Color(json.background);
      }
    }

    if (Array.isArray(json.lights)) {
      json.lights.forEach(lightData => {
        const lightObj = objectManager.createPrimitive?.(lightData.type, {
          color: lightData.color,
          intensity: lightData.intensity,
          position: lightData.position
        });
        if (lightObj && lightData.userData) {
          lightObj.userData = { ...lightData.userData };
        }
        if (lightObj) {
          this.addObject(lightObj);
        }
      });
    }

    if (Array.isArray(json.objects)) {
      for (const objData of json.objects) {
        if (objData.userData && objData.userData.fileInfo) {
          try {
            const fileInfo = objData.userData.fileInfo;
            const cached = getCachedModel(fileInfo.name);
            let modelInfo;
            if (cached) {
              // 如果模型已缓存，直接使用缓存
              modelInfo = cached;
            } else {
              // 否则加载模型文件
              let blob;
              if (fileInfo.url) {
                // 如果有url，直接fetch
                const response = await fetch(fileInfo.url);
                blob = await response.blob();
              } else {
                // 否则从vfs加载
                const vfs = vfsService.getVfs(fileInfo.drive);
                blob = await vfs.blob(fileInfo.path + '/' + fileInfo.name);
              }
              // 构造File对象以兼容loadModel接口
              const file = new File([blob], fileInfo.name, { type: blob.type });
              file.fileInfo = fileInfo;

              // 加载模型
              modelInfo = await loadModel(file);
            }
            const addOptions = {
              name: objData.name,
              position: objData.position,
              rotation: objData.rotation,
              scale: objData.scale,
              userData: objData.userData
            };
            await addModelToScene(modelInfo.id, addOptions);
          } catch (e) {
            console.error('加载模型文件失败', e);
          }
        } else if (objData.type === 'primitive' && objData.primitiveType) {
          objectManager.createPrimitive?.(objData.primitiveType, {
            name: objData.name,
            position: objData.position,
            rotation: objData.rotation,
            scale: objData.scale,
            userData: objData.userData
          });
        } else {
          objectManager.createPrimitive?.(objData.type, {
            name: objData.name,
            position: objData.position,
            rotation: objData.rotation,
            scale: objData.scale,
            userData: objData.userData
          });
        }
      }
    }
  }

  init() {
    this.createScene();
    this.createRenderer();
    this.createCamera();
    this.setupLights();
    this.setupGrid();
    this.initComposer();
    this.state.isInitialized = true;
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);
    this.scene.fog = new THREE.Fog(0x222222, 1000, 10000);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(800, 600);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
  }

  initComposer() {
    if (this.renderer && this.scene && this.camera) {
      this.composer = new EffectComposer(this.renderer);
      const renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);
      this.passes = [renderPass];
    }
  }

  addPass(pass, index) {
    if (!this.composer) return;
    if (typeof index === 'number' && index >= 0 && index < this.composer.passes.length) {
      this.composer.passes.splice(index, 0, pass);
      this.composer.addPass(pass);
      this.passes.splice(index, 0, pass);
    } else {
      this.composer.addPass(pass);
      this.passes.push(pass);
    }
  }

  removePass(pass) {
    if (!this.composer) return;
    const idx = this.composer.passes.indexOf(pass);
    if (idx > -1) {
      this.composer.passes.splice(idx, 1);
      this.passes.splice(idx, 1);
    }
  }

  setPassParams(pass, params) {
    if (!pass || !params) return;
    Object.entries(params).forEach(([key, value]) => {
      if (key in pass) {
        pass[key] = value;
      }
    });
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      800 / 600,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
  }

  async setupLights() {
    const { useObjectManager } = await import('./ObjectManager.js');
    const objectManager = useObjectManager();
    const ambient = objectManager.createPrimitive?.('AmbientLight', {
      color: 0x404040,
      intensity: 10
    });
    if (ambient) this.addObject(ambient);

    const directional = objectManager.createPrimitive?.('DirectionalLight', {
      color: 0xffffff,
      intensity: 1,
      position: [50, 50, 50],
      castShadow: true,
      shadowMapSize: { width: 2048, height: 2048 },
      shadowCameraNear: 0.5,
      shadowCameraFar: 500,
      shadowCameraLeft: -50,
      shadowCameraRight: 50,
      shadowCameraTop: 50,
      shadowCameraBottom: -50
    });
    if (directional) this.addObject(directional);
  }

  setupGrid() {
    const { editorConfig } = useEditorConfig();
    if (!this.gridHelper) {
      this.gridHelper = new THREE.GridHelper(
        editorConfig.gridSize,
        editorConfig.gridDivisions,
        new THREE.Color(editorConfig.gridColorCenterLine),
        new THREE.Color(editorConfig.gridColorGrid)
      );
      this.gridHelper.name = 'grid_helper';
      this.scene.add(this.gridHelper);
    }
    if (!this.axesHelper) {
      this.axesHelper = new THREE.AxesHelper(editorConfig.axesSize);
      this.axesHelper.name = 'axes_helper';
      this.scene.add(this.axesHelper);
    }
  }

  setGridVisible(visible) {
    if (this.gridHelper) {
      this.gridHelper.visible = visible;
    }
    if (this.axesHelper) {
      this.axesHelper.visible = visible;
    }
  }

  setContainer(container) {
    this.container = container;
    if (container && this.renderer) {
      container.appendChild(this.renderer.domElement);
      this.setupControls();
      this.handleResize();
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  switchControls(type) {
    let lastTarget = null;
    if (this.controls && this.controls.target) {
      lastTarget = this.controls.target.clone();
    }
    if (this.controls) {
      this.controls.dispose && this.controls.dispose();
      this.controls = null;
    }
    if (!this.camera || !this.renderer) return;
    if (type === 'OrbitControls') {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = false;
      this.controls.dampingFactor = 0.05;
      this.controls.screenSpacePanning = false;
      this.controls.minDistance = 1;
      this.controls.maxDistance = 500;
      this.controls.maxPolarAngle = Math.PI;
    } else if (type === 'MapControls') {
      this.controls = new MapControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = false;
      this.controls.dampingFactor = 0.05;
      this.controls.screenSpacePanning = true;
      this.controls.minDistance = 1;
      this.controls.maxDistance = 500;
      this.controls.maxPolarAngle = Math.PI;
    } else if (type === 'FlyControls') {
      this.controls = new FlyControls(this.camera, this.renderer.domElement);
      this.controls.movementSpeed = 2;
      this.controls.rollSpeed = Math.PI / 36;
      this.controls.autoForward = false;
      this.controls.dragToLook = true;
    }
    if (this.controls) {
      this.controls.rotateSpeed = 1.0;
      this.controls.zoomSpeed = 1.0;
      this.controls.panSpeed = 1.0;
      if (this.controls.target && lastTarget) {
        this.controls.target.copy(lastTarget);
      } else if (this.controls.target) {
        this.controls.target.set(0, 0, 0);
      }
      this.controls.update && this.controls.update();
      const { initTransformControls } = useObjectSelection();
      initTransformControls({
        scene: this.scene,
        camera: this.camera,
        renderer: this.renderer,
        controls: this.controls
      });
      this.setControlsLocked(this.controlsLocked);
    }
  }

  setupControls() {
    const { editorConfig } = useEditorConfig();
    this.switchControls(editorConfig.controlsType);
  }

  setControlsLocked(locked) {
    this.controlsLocked = !!locked;
    if (this.controls) {
      this.controls.enabled = !this.controlsLocked;
    }
    // 强制同步controls.enabled，防止被其它逻辑覆盖
    if (this.controls) {
      setTimeout(() => {
        this.controls.enabled = !this.controlsLocked;
      }, 0);
    }
  }

  getControlsLocked() {
    return !!this.controlsLocked;
  }

  updateControlsConfig(config) {
    if (!this.controls) return;
    Object.entries(config).forEach(([key, value]) => {
      if (this.controls.hasOwnProperty(key)) {
        this.controls[key] = value;
      }
    });
    this.controls.update();
  }

  handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  startRender() {
    if (this.state.isRendering) return;
    this.state.isRendering = true;
    this.lastTime = performance.now();
    this.animate();
  }

  stopRender() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.state.isRendering = false;
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    const currentTime = performance.now();
    this.frameCount++;
    if (currentTime - this.lastTime >= 1000) {
      this.state.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    const now = performance.now();
    const delta = (now - this.lastRenderTime) / 1000;
    this.lastRenderTime = now;
    this.updateAllMixers(delta);
    this.render();
    this.state.frameCount++;
  }

  updateAllMixers(delta) {
    this.mixers = [];
    this.scene.traverse(obj => {
      if (obj.animations && Array.isArray(obj.animations) && obj.animations.length > 0) {
        if (!obj._mixer) {
          obj._mixer = new THREE.AnimationMixer(obj);
        }
        this.mixers.push(obj._mixer);
        const idx = typeof obj.userData.animationIndex === 'number' ? obj.userData.animationIndex : -1;
        if (idx >= 0 && obj.animations[idx]) {
          if (!obj._activeAction || obj._activeAction._clip !== obj.animations[idx]) {
            if (obj._activeAction) {
              obj._activeAction.stop();
            }
            obj._activeAction = obj._mixer.clipAction(obj.animations[idx]);
            obj._activeAction.reset().play();
          }
        } else {
          if (obj._activeAction) {
            obj._activeAction.stop();
            obj._activeAction = null;
          }
        }
      }
    });
    this.mixers.forEach(mixer => mixer.update(delta));
  }

  render() {
    if (this.controls) {
      this.controls.update();
      if (this.axesHelper && this.controls && this.controls.target && this.camera) {
        this.axesHelper.position.copy(this.controls.target);
        const distance = this.camera.position.distanceTo(this.controls.target);
        const scale = distance / 50;
        this.axesHelper.scale.setScalar(scale > 0 ? scale : 0.01);
      }
    }
    if (this.composer) {
      this.composer.render();
    } else if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  addObject(object) {
    this.scene.add(object);
    let objectManager = useObjectManager();
    objectManager.addObject(object);
  }

  removeObject(object) {
    let idx = this.scene.children.findIndex(child => child === object || child.uuid === object.uuid);
    if (idx > -1) {
      this.scene.remove(object);
      let idx2 = this.scene.children.findIndex(child => child === object || child.uuid === object.uuid);
      if (idx2 > -1) {
        this.scene.children.splice(idx2, 1);
      }
    }
  }

  clearScene() {
    const reservedNames = ['grid_helper', 'axes_helper'];
    for (let i = this.scene.children.length - 1; i >= 0; i--) {
      const child = this.scene.children[i];
      if (!reservedNames.includes(child.name)) {
        this.scene.remove(child);
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
      }
    }
    this.setupGrid();
    const objectManager = useObjectManager();
    objectManager.clear();
  }

  setBackground(background) {
    this.scene.background = background;
  }

  getObjects() {
    return this.scene.children.filter(child => 
      !(child instanceof THREE.Light) && 
      !(child instanceof THREE.Camera)
    );
  }

  findObjectByName(name) {
    return this.scene.getObjectByName(name);
  }

  exportScene() {
    const sceneData = {
      objects: [],
      lights: [],
      camera: {
        position: this.camera.position.toArray(),
        rotation: this.camera.rotation.toArray(),
        fov: this.camera.fov,
        near: this.camera.near,
        far: this.camera.far
      },
      background: this.scene.background instanceof THREE.Color ? 
        this.scene.background.getHex() : null
    };
    this.scene.children.forEach(child => {
      if (child instanceof THREE.Light) {
        sceneData.lights.push({
          type: child.type,
          position: child.position.toArray(),
          color: child.color.getHex(),
          intensity: child.intensity
        });
      } else if (!(child instanceof THREE.Camera)) {
        sceneData.objects.push({
          name: child.name,
          type: child.type,
          position: child.position.toArray(),
          rotation: child.rotation.toArray(),
          scale: child.scale.toArray()
        });
      }
    });
    return sceneData;
  }

  dispose() {
    this.stopRender();
    if (this.container && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
    this.clearScene();
    if (this.composer) {
      this.composer = null;
      this.passes = [];
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

let instance = null;

export function useSceneManager() {
  if (!instance) {
    instance = new SceneManager();
  }
  return instance;
}

export default SceneManager;
