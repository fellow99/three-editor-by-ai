/**
 * 场景管理器
 * 负责Three.js场景的创建、管理和渲染，并统一驱动对象动画（如GLTF动画）。
 * 动画机制：遍历场景对象，若对象有mixer（AnimationMixer实例），则在渲染循环中调用mixer.update(delta)。
 * 新语法：为每个有动画的对象挂载mixer到object.userData._mixer，动画选择由userData.animationIndex控制。
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
/**
 * 引入FlyControls用于飞行模式控制（本地自定义版本）
 */
import { FlyControls } from '../controls/FlyControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { reactive, watch } from 'vue';

import { useObjectManager } from './ObjectManager.js';
import vfsService from '../services/vfs-service.js';
import { useAssets } from '../composables/useAssets.js';

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
    this.controls = null; // OrbitControls实例
    this.flyControls = null; // FlyControls实例
    this.isFlyControlEnabled = false; // 是否启用FlyControls
    this.container = null;
    this.animationId = null;

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
  }

  /**
   * 加载场景数据，根据json结构重建场景
   * @param {object} json 场景数据
   */
  async loadScene(json) {
    // 1. 清空场景
    await this.clearScene();

    // 2. 恢复相机参数
    if (json.camera && this.camera) {
      if (Array.isArray(json.camera.position)) {
        this.camera.position.fromArray(json.camera.position);
      }
      if (Array.isArray(json.camera.rotation)) {
        this.camera.rotation.fromArray(json.camera.rotation);
      }
      if (typeof json.camera.fov === 'number') this.camera.fov = json.camera.fov;
      if (typeof json.camera.near === 'number') this.camera.near = json.camera.near;
      if (typeof json.camera.far === 'number') this.camera.far = json.camera.far;
      this.camera.updateProjectionMatrix();
    }

    // 3. 恢复背景
    if (json.background && this.scene) {
      if (typeof json.background === 'number') {
        this.scene.background = new THREE.Color(json.background);
      }
      // 其他类型背景可扩展
    }

    // 4. 恢复灯光
    if (Array.isArray(json.lights)) {
      const objectManager = useObjectManager();
      json.lights.forEach(lightData => {
        objectManager.createPrimitive?.(lightData.type, {
          color: lightData.color,
          intensity: lightData.intensity,
          position: lightData.position
        });
      });
    }

    // 5. 恢复对象
    if (Array.isArray(json.objects)) {
      const objectManager = useObjectManager();
      for (const objData of json.objects) {
        // userData.fileInfo 走异步模型加载
        if (objData.userData && objData.userData.fileInfo) {
          // 复用SceneViewer.vue onDrop的核心逻辑
          try {
            const { loadModel, addModelToScene, getCachedModel } = useAssets();
            const fileInfo = objData.userData.fileInfo;
            const vfs = vfsService.getVfs(fileInfo.drive);
            const blob = await vfs.blob(fileInfo.path + '/' + fileInfo.name);
            const file = new File([blob], fileInfo.name, { type: blob.type });
            file.fileInfo = fileInfo;
            // 优先判断缓存
            const cached = getCachedModel(file.name, blob.size);
            let modelInfo;
            if (cached) {
              modelInfo = cached;
            } else {
              modelInfo = await loadModel(file);
            }
            // 动画索引恢复
            const addOptions = {
              name: objData.name,
              position: objData.position,
              rotation: objData.rotation,
              scale: objData.scale
            };
            const addedObj = await addModelToScene(modelInfo.id, addOptions);
            if (addedObj && objData.userData && typeof objData.userData.animationIndex === 'number') {
              addedObj.userData.animationIndex = objData.userData.animationIndex;
            }
          } catch (e) {
            console.error('加载模型文件失败', e);
          }
        } else if (objData.userData && objData.userData.type === 'primitive' && objData.userData.primitiveType) {
          // 普通primitive对象
          const primitiveObj = objectManager.createPrimitive?.(objData.userData.primitiveType, {
            name: objData.name,
            position: objData.position,
            rotation: objData.rotation,
            scale: objData.scale
          });
          // 动画索引恢复
          if (primitiveObj && objData.userData && typeof objData.userData.animationIndex === 'number') {
            primitiveObj.userData.animationIndex = objData.userData.animationIndex;
          }
        } else {
          // 普通primitive对象
          const primitiveObj2 = objectManager.createPrimitive?.(objData.type, {
            name: objData.name,
            position: objData.position,
            rotation: objData.rotation,
            scale: objData.scale
          });
          // 动画索引恢复
          if (primitiveObj2 && objData.userData && typeof objData.userData.animationIndex === 'number') {
            primitiveObj2.userData.animationIndex = objData.userData.animationIndex;
          }
        }
      }
    }
  }
  
  /**
   * 初始化场景
   */
  init() {
    this.createScene();
    this.createRenderer();
    this.createCamera();

    // 设置默认灯光
    this.setupLights();
    
    // 添加网格地面
    this.setupGrid();

    // 初始化后处理
    this.initComposer();

    this.state.isInitialized = true;
  }
  
  /**
   * 创建场景
   */
  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);
    this.scene.fog = new THREE.Fog(0x222222, 1000, 10000);
  }
  
  /**
   * 创建渲染器
   */
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

  /**
   * 初始化后处理
   */
  initComposer() {
    if (this.renderer && this.scene && this.camera) {
      this.composer = new EffectComposer(this.renderer);
      const renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);
      this.passes = [renderPass];
    }
  }

  /**
   * 添加后处理Pass
   * @param {Pass} pass
   * @param {number} index
   */
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

  /**
   * 移除后处理Pass
   * @param {Pass} pass
   */
  removePass(pass) {
    if (!this.composer) return;
    const idx = this.composer.passes.indexOf(pass);
    if (idx > -1) {
      this.composer.passes.splice(idx, 1);
      this.passes.splice(idx, 1);
    }
  }

  /**
   * 修改指定Pass参数
   * @param {Pass} pass
   * @param {object} params
   */
  setPassParams(pass, params) {
    if (!pass || !params) return;
    Object.entries(params).forEach(([key, value]) => {
      if (key in pass) {
        pass[key] = value;
      }
    });
  }
  
  /**
   * 创建相机
   */
  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75, // fov
      800 / 600, // aspect
      0.1, // near
      1000 // far
    );
    
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
  }
  
  /**
   * 设置光照
   */
  async setupLights() {
      const { useObjectManager } = await import('./ObjectManager.js');
      const objectManager = useObjectManager();
      
      // 环境光
      objectManager.createPrimitive?.('AmbientLight', {
        color: 0x404040,
        intensity: 10
      });

      // 方向光
      objectManager.createPrimitive?.('DirectionalLight', {
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
  }
  
  /**
   * 设置网格地面
   */
  setupGrid() {
    // 只创建一次
    if (!this.gridHelper) {
      this.gridHelper = new THREE.GridHelper(1000, 1000, 0x666666, 0x333333);
      this.gridHelper.name = 'grid_helper';
      this.scene.add(this.gridHelper);
    }
    // 添加坐标轴
    if (!this.axesHelper) {
      this.axesHelper = new THREE.AxesHelper(5);
      this.axesHelper.name = 'axes_helper';
      this.scene.add(this.axesHelper);
    }
  }

  /**
   * 控制网格和坐标轴显示/隐藏
   * @param {boolean} visible
   */
  setGridVisible(visible) {
    if (this.gridHelper) {
      this.gridHelper.visible = visible;
    }
    if (this.axesHelper) {
      this.axesHelper.visible = visible;
    }
  }
  
  /**
   * 设置容器
   * @param {HTMLElement} container DOM容器
   */
  setContainer(container) {
    this.container = container;
    if (container && this.renderer) {
      container.appendChild(this.renderer.domElement);
      this.setupControls();
      this.setupFlyControls();
      this.handleResize();
      window.addEventListener('resize', this.resizeHandler);
    }
  }
  
  /**
   * 设置OrbitControls
   */
  setupControls() {
    if (!this.camera || !this.renderer) return;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // 配置控制器
    this.controls.enableDamping = false; // 禁用惯性移动
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 500;
    this.controls.maxPolarAngle = Math.PI;
    // 设置控制器速度
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.0;
    this.controls.panSpeed = 1.0;
    // 设置目标点
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  /**
   * 设置FlyControls
   * 仅初始化一次，默认不启用
   */
  setupFlyControls() {
    if (!this.camera || !this.renderer) return;
    this.flyControls = new FlyControls(this.camera, this.renderer.domElement);
    // FlyControls参数可根据需要调整
    this.flyControls.movementSpeed = 2;
    this.flyControls.rollSpeed = Math.PI / 36;
    this.flyControls.autoForward = false;
    this.flyControls.dragToLook = true;
    this.flyControls.enabled = false;
  }

  /**
   * 启用或禁用FlyControls
   * @param {boolean} enabled 是否启用飞行控制
   */
  setFlyControlEnabled(enabled) {
    this.isFlyControlEnabled = enabled;
    if (this.flyControls) this.flyControls.enabled = enabled;
    if (this.controls) {
      this.controls.enabled = !enabled;
      // 从FlyControls切换回OrbitControls时，同步相机位置和target
      if (!enabled) {
        // 设置OrbitControls的target为相机前方一定距离
        const camera = this.camera;
        const controls = this.controls;
        if (camera && controls) {
          // 取相机朝向
          const dir = new THREE.Vector3();
          camera.getWorldDirection(dir);
          // target设为相机位置+朝向向量*10（可根据实际场景调整距离）
          controls.target.copy(camera.position).add(dir.multiplyScalar(10));
          controls.update();
        }
      }
    }
  }
  
  /**
   * 更新控制器配置
   * @param {object} config 控制器配置
   */
  updateControlsConfig(config) {
    if (!this.controls) return;
    
    Object.entries(config).forEach(([key, value]) => {
      if (this.controls.hasOwnProperty(key)) {
        this.controls[key] = value;
      }
    });
    
    this.controls.update();
  }
  
  /**
   * 处理窗口大小变化
   */
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
  
  /**
   * 开始渲染循环
   */
  startRender() {
    if (this.state.isRendering) return;
    
    this.state.isRendering = true;
    this.lastTime = performance.now();
    this.animate();
  }
  
  /**
   * 停止渲染循环
   */
  stopRender() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.state.isRendering = false;
  }
  
  /**
   * 动画循环
   * 新增：统一驱动所有对象动画
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    // 计算FPS
    const currentTime = performance.now();
    this.frameCount++;
    if (currentTime - this.lastTime >= 1000) {
      this.state.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    // 计算delta
    const now = performance.now();
    const delta = (now - this.lastRenderTime) / 1000;
    this.lastRenderTime = now;
    // 动画驱动
    this.updateAllMixers(delta);
    this.render();
    this.state.frameCount++;
  }

  /**
   * 统一驱动所有对象动画
   * @param {number} delta 秒
   */
  updateAllMixers(delta) {
    this.mixers = [];
    this.scene.traverse(obj => {
      if (obj.animations && Array.isArray(obj.animations) && obj.animations.length > 0) {
        // 若未挂载mixer则自动挂载
        if (!obj.userData._mixer) {
          obj.userData._mixer = new THREE.AnimationMixer(obj);
        }
        this.mixers.push(obj.userData._mixer);
        // 动画切换
        const idx = typeof obj.userData.animationIndex === 'number' ? obj.userData.animationIndex : -1;
        if (idx >= 0 && obj.animations[idx]) {
          // 若当前action未激活则激活
          if (!obj.userData._activeAction || obj.userData._activeAction._clip !== obj.animations[idx]) {
            if (obj.userData._activeAction) {
              obj.userData._activeAction.stop();
            }
            obj.userData._activeAction = obj.userData._mixer.clipAction(obj.animations[idx]);
            obj.userData._activeAction.reset().play();
          }
        } else {
          // 无动画或无效索引，停止所有action
          if (obj.userData._activeAction) {
            obj.userData._activeAction.stop();
            obj.userData._activeAction = null;
          }
        }
      }
    });
    // 统一update
    this.mixers.forEach(mixer => mixer.update(delta));
  }

  /**
   * 渲染场景
   * 根据控制器类型更新
   */
  render() {
    // 更新控制器
    if (this.isFlyControlEnabled && this.flyControls) {
      // 动态调整速度：根据相机到视点距离
      let target = this.flyControls.target ? this.flyControls.target : (this.controls ? this.controls.target : new THREE.Vector3(0, 0, 0));
      let camPos = this.camera ? this.camera.position : new THREE.Vector3(0, 0, 0);
      let distance = camPos.distanceTo(target);
      // 距离越远速度越快，越近越慢（限制最小最大值）
      this.flyControls.movementSpeed = Math.max(0.5, Math.min(20, distance * 0.6));
      this.flyControls.rollSpeed = Math.max(Math.PI / 36, Math.min(Math.PI / 6, distance * 0.04));
      this.flyControls.update(0.1);

      // --------- 实时同步FlyControls.target到OrbitControls.target ---------
      // 若OrbitControls存在，实时同步target
      if (this.controls && this.flyControls.target) {
        // 必须用copy，不能直接赋值引用
        this.controls.target.copy(this.flyControls.target);
        this.controls.update();
      }
      // -------------------------------------------------------------

      // axesHelper位置与FlyControls.target同步
      if (this.axesHelper && this.flyControls.target && this.camera) {
        this.axesHelper.position.copy(this.flyControls.target);
        const scale = distance / 50;
        this.axesHelper.scale.setScalar(scale > 0 ? scale : 0.01);
      }
    } else if (this.controls) {
      this.controls.update();
      // 坐标轴位置与大小同步到OrbitControls的target
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
  
  /**
   * 添加对象到场景
   * @param {THREE.Object3D} object 3D对象
   */
  addObject(object) {
    this.scene.add(object);
  }
  
  /**
   * 从场景移除对象
   * @param {THREE.Object3D} object 3D对象
   */
  removeObject(object) {
    let idx = this.scene.children.findIndex(child => child === object || child.uuid === object.uuid);
    if (idx > -1) {
      this.scene.remove(object);
      
      let idx2 = this.scene.children.findIndex(child => child === object || child.uuid === object.uuid);
      // 如果常规移除失败，尝试强制移除
      if (idx2 > -1) {
          this.scene.children.splice(idx2, 1);
      }
    }
  }
  
  /**
   * 清空场景，但保留网格辅助线和坐标轴辅助线
   */
  clearScene() {
    // 仅移除非 gridHelper/axesHelper 的对象
    const reservedNames = ['grid_helper', 'axes_helper'];
    for (let i = this.scene.children.length - 1; i >= 0; i--) {
      const child = this.scene.children[i];
      if (!reservedNames.includes(child.name)) {
        this.scene.remove(child);
        // 清理几何体和材质
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

    // 添加网格地面
    this.setupGrid();

    // 同步清理 ObjectManager 中的对象
      const objectManager = useObjectManager();
      objectManager.clear();
  }
  
  /**
   * 设置场景背景
   * @param {THREE.Color|THREE.Texture} background 背景
   */
  setBackground(background) {
    this.scene.background = background;
  }
  
  /**
   * 获取场景对象列表
   * @returns {THREE.Object3D[]} 对象列表
   */
  getObjects() {
    return this.scene.children.filter(child => 
      !(child instanceof THREE.Light) && 
      !(child instanceof THREE.Camera)
    );
  }
  
  /**
   * 根据名称查找对象
   * @param {string} name 对象名称
   * @returns {THREE.Object3D|null} 找到的对象
   */
  findObjectByName(name) {
    return this.scene.getObjectByName(name);
  }
  
  /**
   * 导出场景数据
   * @returns {object} 场景数据
   */
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
  
  /**
   * 销毁场景管理器
   */
  dispose() {
    this.stopRender();
    
    if (this.container && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    
    // 清理控制器
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

// 单例模式
let instance = null;

export function useSceneManager() {
  if (!instance) {
    instance = new SceneManager();
  }
  return instance;
}

export default SceneManager;
