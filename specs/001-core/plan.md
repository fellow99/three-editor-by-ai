# 001-Core 核心引擎模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 技术上下文

### 1.1 模块定位

核心引擎模块是 Three Editor by AI 的基础，负责 Three.js 场景的创建、管理、渲染和对象生命周期管理。

### 1.2 技术约束

- 必须使用 Three.js r182+
- 必须支持 Vue 3 Composition API（reactive、watch）
- 必须实现事件驱动架构（mitt）
- 必须支持场景序列化/反序列化
- 运行时对象（_mixer 等）直接挂载到主对象，不进入 userData

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 事件总线 | mitt | 轻量级（200 字节）、简洁 API |
| ID 生成 | uuid v7 | 最新标准、时间有序 |
| 几何体创建 | 工具函数封装 | 代码复用、统一参数 |
| 响应式状态 | Vue reactive | 与 Vue 3 生态无缝集成 |
| 射线检测 | 父级链遍历 | 准确定位顶层管理对象 |

---

## 2. ThreeViewer 技术设计

### 2.1 类结构

```javascript
class ThreeViewer {
  // 核心属性
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  controls: OrbitControls | MapControls | FlyControls
  composer: EffectComposer
  
  // 状态
  state: {
    isInitialized: boolean
    isRendering: boolean
    frameCount: number
    fps: number
  }
  
  // 事件
  emitter: mitt.Emitter
  
  // 后处理
  passes: Array<{name: string, pass: Pass, enabled: boolean}>
  
  // 渲染循环
  renderLoopObj: number | null
  lastTime: number
  lastFpsTime: number
}
```

### 2.2 初始化流程

```
1. 创建 THREE.Scene
   ↓
2. 创建 THREE.PerspectiveCamera
   - FOV: 75
   - Aspect: container.width / container.height
   - Near: 0.1, Far: 1000
   ↓
3. 创建 THREE.WebGLRenderer
   - Antialias: true
   - Alpha: true
   - PixelRatio: window.devicePixelRatio
   ↓
4. 创建 OrbitControls（默认）
   ↓
5. 创建 EffectComposer
   - 添加 RenderPass
   - 添加 UnrealBloomPass（可选）
   - 添加 FXAAShaderPass（可选）
   ↓
6. 启动渲染循环
   - requestAnimationFrame
   - 更新 FPS 统计
   - 驱动动画更新
```

### 2.3 渲染循环实现

```javascript
animate() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - this.lastTime) / 1000;
  this.lastTime = currentTime;
  
  // 触发 before-render 事件
  this.emitter.emit('before-render', { deltaTime });
  
  // 更新 FPS
  this.frameCount++;
  if (currentTime - this.lastFpsTime >= 1000) {
    this.state.fps = this.frameCount;
    this.frameCount = 0;
    this.lastFpsTime = currentTime;
  }
  
  // 更新所有 AnimationMixer
  this.scene.traverse((obj) => {
    if (obj._mixer) {
      obj._mixer.update(deltaTime);
    }
  });
  
  // 更新控制器
  if (this.controls && this.controls.update) {
    this.controls.update();
  }
  
  // 渲染
  if (this.composer) {
    this.composer.render();
  } else {
    this.renderer.render(this.scene, this.camera);
  }
  
  // 继续循环
  if (this.state.isRendering) {
    this.renderLoopObj = requestAnimationFrame(() => this.animate());
  }
}
```

### 2.4 控制器切换实现

```javascript
switchControls(type) {
  // 1. 移除旧控制器
  if (this.controls) {
    this.controls.dispose();
    this.controls = null;
  }
  
  // 2. 创建新控制器
  switch (type) {
    case 'orbit':
      this.controls = new OrbitControls(
        this.camera,
        this.renderer.domElement
      );
      break;
    case 'map':
      this.controls = new MapControls(
        this.camera,
        this.renderer.domElement
      );
      break;
    case 'fly':
      this.controls = new FlyControls(
        this.camera,
        this.renderer.domElement
      );
      break;
  }
  
  // 3. 配置控制器
  this.controls.enableDamping = true;
  this.controls.dampingFactor = 0.05;
  
  // 4. 触发事件
  this.emitter.emit('controls-changed', { type });
}
```

### 2.5 场景加载与导出

```javascript
async loadScene(json) {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    
    // 验证数据结构
    if (!data.objects || !Array.isArray(data.objects)) {
      throw new Error('Invalid scene format: missing objects array');
    }
    
    // 清空场景
    this.clearScene();
    
    // 恢复背景
    if (data.scene && data.scene.background) {
      this.scene.background = new THREE.Color(data.scene.background);
    }
    
    // 恢复对象
    for (const objData of data.objects) {
      const obj = await this.importObject(objData);
      if (obj) {
        this.scene.add(obj);
        this.emitter.emit('add-object', { object: obj });
      }
    }
    
    // 触发事件
    this.emitter.emit('scene-loaded', { scene: this.scene });
  } catch (error) {
    console.error('场景加载失败:', error);
    throw error;
  }
}

exportScene() {
  const objects = [];
  
  this.scene.traverse((obj) => {
    if (obj.type === 'Mesh' || obj.type === 'Light' || obj.type === 'Group') {
      const objData = {
        uuid: obj.uuid,
        type: obj.type,
        name: obj.name,
        
        // 几何体
        geometry: obj.geometry ? {
          type: obj.geometry.type,
          parameters: obj.geometry.parameters
        } : null,
        
        // 材质
        material: obj.material ? this.exportMaterial(obj.material) : null,
        
        // 变换
        transform: {
          position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
          rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z, order: obj.rotation.order },
          scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z }
        },
        
        // userData（过滤运行时对象）
        userData: this.filterUserData(obj.userData)
      };
      
      objects.push(objData);
    }
  });
  
  return {
    version: '1.0',
    metadata: {
      createdAt: new Date().toISOString(),
      objectCount: objects.length
    },
    scene: {
      background: this.scene.background?.getHex() || null
    },
    objects
  };
}

filterUserData(userData) {
  const filtered = {};
  for (const key in userData) {
    // 排除运行时对象（以 _ 开头的属性）
    if (key.startsWith('_') || 
        typeof userData[key] === 'function' ||
        userData[key] instanceof THREE.Object3D) {
      continue;
    }
    filtered[key] = userData[key];
  }
  return filtered;
}
```

### 2.6 3D Tiles 加载

```javascript
async add3DTiles(url) {
  const { TilesRenderer } = await import('3d-tiles-renderer');
  
  const tilesRenderer = new TilesRenderer(url);
  tilesRenderer.setCamera(this.camera);
  tilesRenderer.setResolutionFromRenderer(this.renderer.domElement, this.renderer);
  
  this.scene.add(tilesRenderer.group);
  
  // 在渲染循环中更新
  const originalAnimate = this.animate.bind(this);
  this.animate = () => {
    tilesRenderer.update();
    originalAnimate();
  };
}
```

### 2.7 Vue 响应式集成

```javascript
import { reactive, watch } from 'vue';

class ThreeViewer {
  constructor(options = {}) {
    this.editorConfig = reactive({
      enableBloom: false,
      enableFXAA: false,
      bloomStrength: 1.5,
      bloomRadius: 0.4,
      bloomThreshold: 0.85
    });
    
    // 监听配置变化
    watch(
      () => this.editorConfig.enableBloom,
      (enabled) => this.setPassEnabled('bloom', enabled)
    );
    
    watch(
      () => this.editorConfig.bloomStrength,
      (strength) => this.setBloomParams({ strength })
    );
  }
}
```

---

## 3. ObjectManager 技术设计

### 3.1 类结构

```javascript
class ObjectManager {
  // 状态
  objects: reactive Map<string, THREE.Object3D>
  selectedObjects: reactive Set<string>
  clipboard: THREE.Object3D[] | null
  
  // 缓存
  materialCache: Map<string, THREE.Material>
  defaultMaterial: THREE.MeshStandardMaterial
  
  // 事件
  emitter: mitt.Emitter
}
```

### 3.2 几何体创建工厂

```javascript
import { v7 as uuidv7 } from 'uuid';
import {
  createBoxGeometry,
  createSphereGeometry,
  createCylinderGeometry,
  // ... 其他几何体工具函数
} from '../utils/geometryUtils.js';

createPrimitive(type, options = {}) {
  let geometry;
  let object;
  
  // 使用工具函数创建几何体
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
    // ... 其他几何体类型
    default:
      throw new Error(`Unknown primitive type: ${type}`);
  }
  
  // 创建 Mesh
  const material = options.material || this.defaultMaterial.clone();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.uuid = uuidv7();
  
  // 设置 userData
  mesh.userData = {
    type: 'primitive',
    primitiveType: type,
    ...options.userData
  };
  
  return mesh;
}
```

### 3.3 灯光创建

```javascript
createPrimitive(type, options = {}) {
  let light;
  
  switch (type) {
    case 'ambient':
      light = new THREE.AmbientLight(
        options.color || 0xffffff,
        options.intensity || 0.5
      );
      break;
    case 'directional':
      light = new THREE.DirectionalLight(
        options.color || 0xffffff,
        options.intensity || 1
      );
      if (options.position) {
        light.position.set(options.position.x, options.position.y, options.position.z);
      }
      break;
    case 'point':
      light = new THREE.PointLight(
        options.color || 0xffffff,
        options.intensity || 1,
        options.distance || 0,
        options.decay || 1
      );
      break;
    case 'spot':
      light = new THREE.SpotLight(
        options.color || 0xffffff,
        options.intensity || 1,
        options.distance || 0,
        options.angle || Math.PI / 3,
        options.penumbra || 0,
        options.decay || 1
      );
      break;
    case 'hemisphere':
      light = new THREE.HemisphereLight(
        options.skyColor || 0xffffbb,
        options.groundColor || 0x080820,
        options.intensity || 1
      );
      break;
    case 'rectArea':
      light = new THREE.RectAreaLight(
        options.color || 0xffffff,
        options.intensity || 1,
        options.width || 10,
        options.height || 10
      );
      break;
  }
  
  if (light) {
    light.uuid = uuidv7();
    light.userData = { type: 'light', lightType: type, ...options.userData };
  }
  
  return light;
}
```

### 3.4 对象添加与移除

```javascript
addObject(obj) {
  // 触发 before-add-object 事件
  this.emitter.emit('before-add-object', { object: obj });
  
  // 添加到场景
  this.scene.add(obj);
  
  // 注册到管理器
  this.objects.set(obj.uuid, obj);
  
  // 触发事件
  this.emitter.emit('add-object', { object: obj });
}

removeObject(obj) {
  // 从管理器移除
  this.objects.delete(obj.uuid);
  
  // 从选择中移除
  this.selectedObjects.delete(obj.uuid);
  
  // 从场景移除
  this.scene.remove(obj);
  
  // 触发事件
  this.emitter.emit('remove-object', { object: obj });
}
```

### 3.5 选择系统

```javascript
selectObject(uuid) {
  const obj = this.objects.get(uuid);
  if (!obj || obj.userData.locked) return;
  
  this.selectedObjects.add(uuid);
  this.emitter.emit('selection-changed', {
    selected: Array.from(this.selectedObjects)
  });
}

deselectObject(uuid) {
  this.selectedObjects.delete(uuid);
  this.emitter.emit('selection-changed', {
    selected: Array.from(this.selectedObjects)
  });
}

clearSelection() {
  this.selectedObjects.clear();
  this.emitter.emit('selection-changed', {
    selected: []
  });
}
```

### 3.6 射线检测优化

```javascript
getIntersectedObjects(raycaster) {
  // 1. 获取所有未锁定对象
  const objects = this.getUnlockedObjects();
  
  // 2. 执行射线检测
  const intersects = raycaster.intersectObjects(objects, true);
  
  // 3. 过滤重复对象（只返回顶层管理对象）
  const uniqueObjects = [];
  const seen = new Set();
  
  for (const intersect of intersects) {
    let obj = intersect.object;
    
    // 向上查找，直到找到被管理器追踪的顶层对象
    while (obj.parent && !this.objects.has(obj.uuid)) {
      obj = obj.parent;
    }
    
    // 跳过锁定对象
    if (obj.userData.locked) continue;
    
    if (!seen.has(obj.uuid)) {
      seen.add(obj.uuid);
      uniqueObjects.push(obj);
    }
  }
  
  return uniqueObjects;
}

getIntersectedFirstObject(raycaster) {
  const objects = this.getIntersectedObjects(raycaster);
  return objects.length > 0 ? objects[0] : null;
}

getUnlockedObjects() {
  const objects = [];
  this.objects.forEach((obj) => {
    if (obj.userData.locked !== true) {
      objects.push(obj);
    }
  });
  return objects;
}
```

### 3.7 复制粘贴

```javascript
copyObjects(uuids) {
  this.clipboard = [];
  
  for (const uuid of uuids) {
    const obj = this.objects.get(uuid);
    if (obj) {
      const clone = this.deepCloneObject(obj);
      this.clipboard.push(clone);
    }
  }
}

pasteObjects() {
  if (!this.clipboard) return [];
  
  const pasted = [];
  
  for (const original of this.clipboard) {
    const clone = this.deepCloneObject(original);
    this.addObject(clone);
    pasted.push(clone);
  }
  
  return pasted;
}

deepCloneObject(obj) {
  const clone = obj.clone();
  
  // 重新生成 UUID
  clone.uuid = uuidv7();
  
  // 递归处理子对象
  clone.traverse((child) => {
    child.uuid = uuidv7();
  });
  
  // 克隆材质
  if (clone.material) {
    if (Array.isArray(clone.material)) {
      clone.material = clone.material.map(m => m.clone());
    } else {
      clone.material = clone.material.clone();
    }
  }
  
  // 克隆几何体
  if (clone.geometry) {
    clone.geometry = clone.geometry.clone();
  }
  
  return clone;
}
```

---

## 4. 序列化技术实现

### 4.1 导出对象

```javascript
exportObject(object) {
  const data = {
    uuid: object.uuid,
    type: object.type,
    name: object.name,
    
    // 几何体
    geometry: object.geometry ? {
      type: object.geometry.type,
      parameters: this.extractGeometryParameters(object.geometry)
    } : null,
    
    // 材质
    material: object.material ? this.exportMaterial(object.material) : null,
    
    // 变换
    transform: {
      position: { x: object.position.x, y: object.position.y, z: object.position.z },
      rotation: { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z, order: object.rotation.order },
      scale: { x: object.scale.x, y: object.scale.y, z: object.scale.z }
    },
    
    // userData（过滤运行时对象）
    userData: this.filterUserData(object.userData)
  };
  
  // 动画索引
  if (object.userData.animationIndex !== undefined) {
    data.animationIndex = object.userData.animationIndex;
  }
  
  return data;
}

extractGeometryParameters(geometry) {
  if (!geometry.parameters) return null;
  
  const params = {};
  for (const key in geometry.parameters) {
    const value = geometry.parameters[key];
    if (value instanceof THREE.Color) {
      params[key] = value.getHex();
    } else if (value instanceof THREE.Vector3) {
      params[key] = { x: value.x, y: value.y, z: value.z };
    } else {
      params[key] = value;
    }
  }
  return params;
}
```

### 4.2 导入对象

```javascript
async importObject(objData) {
  let object;
  
  // 根据类型创建对象
  if (objData.type === 'Mesh') {
    const geometry = this.createGeometry(objData.geometry);
    const material = await this.loadMaterial(objData.material);
    object = new THREE.Mesh(geometry, material);
  } else if (objData.type === 'DirectionalLight') {
    object = new THREE.DirectionalLight(
      objData.material?.color || 0xffffff,
      objData.material?.intensity || 1
    );
  } else if (objData.type === 'Group') {
    object = new THREE.Group();
  }
  
  if (!object) return null;
  
  // 恢复 UUID
  object.uuid = objData.uuid;
  
  // 恢复变换
  if (objData.transform) {
    object.position.set(
      objData.transform.position.x,
      objData.transform.position.y,
      objData.transform.position.z
    );
    object.rotation.set(
      objData.transform.rotation.x,
      objData.transform.rotation.y,
      objData.transform.rotation.z
    );
    object.rotation.order = objData.transform.rotation.order || 'XYZ';
    object.scale.set(
      objData.transform.scale.x,
      objData.transform.scale.y,
      objData.transform.scale.z
    );
  }
  
  // 恢复 userData
  object.userData = { ...objData.userData };
  
  // 恢复动画
  if (objData.animations && objData.userData.animationIndex !== undefined) {
    this.restoreAnimation(object, objData.animations);
  }
  
  return object;
}
```

---

## 5. 后处理技术实现

### 5.1 EffectComposer 配置

```javascript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

initPostProcessing() {
  // 创建合成器
  this.composer = new EffectComposer(this.renderer);
  
  // 1. 渲染 Pass（必须）
  const renderPass = new RenderPass(this.scene, this.camera);
  this.composer.addPass(renderPass);
  
  // 2. Bloom Pass
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(
      this.renderer.domElement.clientWidth,
      this.renderer.domElement.clientHeight
    ),
    1.5,  // strength
    0.4,  // radius
    0.85  // threshold
  );
  bloomPass.enabled = false;
  this.composer.addPass(bloomPass);
  this.passes.push({ name: 'bloom', pass: bloomPass, enabled: false });
  
  // 3. FXAA Pass
  const fxaaPass = new ShaderPass(FXAAShader);
  fxaaPass.material.uniforms['resolution'].value.set(
    1 / this.renderer.domElement.clientWidth,
    1 / this.renderer.domElement.clientHeight
  );
  fxaaPass.enabled = false;
  this.composer.addPass(fxaaPass);
  this.passes.push({ name: 'fxaa', pass: fxaaPass, enabled: false });
}

addPass(pass) {
  if (this.composer) {
    this.composer.addPass(pass);
  }
}

setPassEnabled(name, enabled) {
  const pass = this.passes.find(p => p.name === name);
  if (pass) {
    pass.pass.enabled = enabled;
    pass.enabled = enabled;
  }
}

setBloomParams(params) {
  const bloomPass = this.passes.find(p => p.name === 'bloom')?.pass;
  if (bloomPass instanceof UnrealBloomPass) {
    if (params.strength !== undefined) {
      bloomPass.strength = params.strength;
    }
    if (params.radius !== undefined) {
      bloomPass.radius = params.radius;
    }
    if (params.threshold !== undefined) {
      bloomPass.threshold = params.threshold;
    }
  }
}
```

---

## 6. InputManager 技术实现

### 6.1 类结构

```javascript
class InputManager {
  // 状态
  mousePosition: { x: number, y: number }
  normalizedPosition: { x: number, y: number }
  isDragging: boolean
  dragStart: { x: number, y: number }
  keys: Set<string>
  
  // 配置
  dragThreshold: number = 3  // 3px 拖拽阈值
  
  // 事件
  emitter: mitt.Emitter
}
```

### 6.2 鼠标事件处理

```javascript
init(container) {
  this.container = container;
  
  // 鼠标事件
  container.addEventListener('mousedown', this.onMouseDown.bind(this));
  container.addEventListener('mousemove', this.onMouseMove.bind(this));
  container.addEventListener('mouseup', this.onMouseUp.bind(this));
  container.addEventListener('click', this.onClick.bind(this));
  container.addEventListener('dblclick', this.onDblClick.bind(this));
  container.addEventListener('wheel', this.onWheel.bind(this));
  
  // 键盘事件（文档级）
  document.addEventListener('keydown', this.onKeyDown.bind(this));
  document.addEventListener('keyup', this.onKeyUp.bind(this));
}

onMouseDown(event) {
  this.mouseDownPosition = { x: event.clientX, y: event.clientY };
  this.isDragging = false;
  
  this.emitter.emit('mouse-down', {
    x: event.clientX,
    y: event.clientY,
    button: event.button
  });
}

onMouseMove(event) {
  const rect = this.container.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // 归一化坐标 (-1 到 1)
  const normalizedX = (x / rect.width) * 2 - 1;
  const normalizedY = -(y / rect.height) * 2 + 1;
  
  this.mousePosition = { x, y };
  this.normalizedPosition = { x: normalizedX, y: normalizedY };
  
  // 拖拽检测
  if (this.mouseDownPosition) {
    const dx = event.clientX - this.mouseDownPosition.x;
    const dy = event.clientY - this.mouseDownPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (!this.isDragging && distance > this.dragThreshold) {
      this.isDragging = true;
      this.emitter.emit('drag-start', {
        x: this.mouseDownPosition.x,
        y: this.mouseDownPosition.y,
        normalizedX: (this.mouseDownPosition.x / rect.width) * 2 - 1,
        normalizedY: -(this.mouseDownPosition.y / rect.height) * 2 + 1
      });
    }
    
    if (this.isDragging) {
      this.emitter.emit('drag', {
        x: event.clientX,
        y: event.clientY,
        dx,
        dy,
        normalizedX,
        normalizedY
      });
    }
  }
  
  this.emitter.emit('mouse-move', { x, y, normalizedX, normalizedY });
}

onMouseUp(event) {
  if (this.isDragging) {
    this.isDragging = false;
    this.emitter.emit('drag-end', {
      x: event.clientX,
      y: event.clientY,
      normalizedX: (event.clientX / this.container.getBoundingClientRect().width) * 2 - 1,
      normalizedY: -(event.clientY / this.container.getBoundingClientRect().height) * 2 + 1
    });
  }
  
  this.mouseDownPosition = null;
  
  this.emitter.emit('mouse-up', {
    x: event.clientX,
    y: event.clientY,
    button: event.button
  });
}
```

### 6.3 键盘事件处理

```javascript
onKeyDown(event) {
  this.keys.add(event.code);
  
  this.emitter.emit('keydown', {
    key: event.key,
    code: event.code,
    modifiers: {
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey
    }
  });
}

onKeyUp(event) {
  this.keys.delete(event.code);
  
  this.emitter.emit('keyup', {
    key: event.key,
    code: event.code,
    modifiers: {
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey
    }
  });
}

isKeyPressed(code) {
  return this.keys.has(code);
}
```

---

## 7. AssetLoader 技术实现

### 7.1 类结构

```javascript
class AssetLoader {
  // 加载器
  gltfLoader: GLTFLoader
  objLoader: OBJLoader
  fbxLoader: FBXLoader
  textureLoader: TextureLoader
  
  // 缓存
  cache: Map<string, any>  // URL -> 加载结果
  
  // 管理器
  loadingManager: THREE.LoadingManager
  
  // 事件
  emitter: mitt.Emitter
}
```

### 7.2 GLTF 加载器初始化

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

initLoaders() {
  // LoadingManager
  this.loadingManager = new THREE.LoadingManager();
  this.loadingManager.onProgress = (url, loaded, total) => {
    this.emitter.emit('loading-progress', { url, loaded, total, progress: loaded / total });
  };
  
  // GLTFLoader with Draco + KTX2 + Meshopt
  this.gltfLoader = new GLTFLoader(this.loadingManager);
  
  // Draco
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  this.gltfLoader.setDRACOLoader(dracoLoader);
  
  // KTX2
  const ktx2Loader = new KTX2Loader(this.loadingManager);
  ktx2Loader.setTranscoderPath('/basis/');
  this.gltfLoader.setKTX2Loader(ktx2Loader);
  
  // Meshopt
  this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  
  // OBJLoader
  this.objLoader = new OBJLoader(this.loadingManager);
  
  // FBXLoader
  this.fbxLoader = new FBXLoader(this.loadingManager);
  
  // TextureLoader
  this.textureLoader = new THREE.TextureLoader(this.loadingManager);
}
```

### 7.3 缓存与加载

```javascript
async load(input, options = {}) {
  let url;
  
  // 多态输入处理
  if (input instanceof File) {
    url = URL.createObjectURL(input);
  } else if (typeof input === 'string' && input.startsWith('data:')) {
    url = input;
  } else {
    url = input;
  }
  
  // 检查缓存
  if (this.cache.has(url)) {
    return this.cache.get(url);
  }
  
  // 触发加载开始事件
  this.emitter.emit('loading-start', { url, type: this.detectType(url) });
  
  try {
    let result;
    const type = this.detectType(url);
    
    switch (type) {
      case 'gltf':
      case 'glb':
        result = await this.loadGLTF(url);
        break;
      case 'obj':
        result = await this.loadOBJ(url);
        break;
      case 'fbx':
        result = await this.loadFBX(url);
        break;
      case 'texture':
        result = await this.loadTexture(url);
        break;
      default:
        throw new Error(`Unsupported file type: ${type}`);
    }
    
    // 缓存结果
    this.cache.set(url, result);
    
    // 后处理
    if (result.scene || result.isObject3D) {
      this.autoScaleAndCenter(result.scene || result);
    }
    
    // 触发加载完成事件
    this.emitter.emit('loading-complete', { url, object: result });
    
    return result;
  } catch (error) {
    this.emitter.emit('loading-error', { url, error });
    throw error;
  }
}

detectType(url) {
  const ext = url.split('.').pop().toLowerCase().split('?')[0];
  if (['gltf', 'glb'].includes(ext)) return ext;
  if (ext === 'obj') return 'obj';
  if (ext === 'fbx') return 'fbx';
  if (['jpg', 'jpeg', 'png', 'ktx2', 'webp'].includes(ext)) return 'texture';
  return 'unknown';
}

loadGLTF(url) {
  return new Promise((resolve, reject) => {
    this.gltfLoader.load(url, resolve, undefined, reject);
  });
}

loadOBJ(url) {
  return new Promise((resolve, reject) => {
    this.objLoader.load(url, resolve, undefined, reject);
  });
}

loadFBX(url) {
  return new Promise((resolve, reject) => {
    this.fbxLoader.load(url, resolve, undefined, reject);
  });
}

loadTexture(url) {
  return new Promise((resolve, reject) => {
    this.textureLoader.load(url, resolve, undefined, reject);
  });
}
```

### 7.4 自动缩放与居中

```javascript
autoScaleAndCenter(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  
  // 居中
  object.position.x += (object.position.x - center.x);
  object.position.y += (object.position.y - center.y);
  object.position.z += (object.position.z - center.z);
  
  // 缩放（最大边不超过 10 单位）
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 10) {
    const scale = 10 / maxDim;
    object.scale.multiplyScalar(scale);
  }
}
```

### 7.5 批量加载

```javascript
async loadBatch(urls, options = {}) {
  const results = [];
  const errors = [];
  
  const promises = urls.map(async (url) => {
    try {
      const result = await this.load(url, options);
      results.push({ url, result });
    } catch (error) {
      errors.push({ url, error });
    }
  });
  
  await Promise.allSettled(promises);
  
  return { results, errors };
}
```

---

## 8. 性能优化

### 8.1 按需渲染

```javascript
// 标记需要重新渲染
needsRender() {
  if (!this.pendingRender) {
    this.pendingRender = true;
    requestAnimationFrame(() => {
      this.pendingRender = false;
      // 执行单帧渲染
    });
  }
}

// 静态场景优化
setStaticMode(isStatic) {
  if (isStatic) {
    this.state.isRendering = false;
    if (this.renderLoopObj) {
      cancelAnimationFrame(this.renderLoopObj);
      this.renderLoopObj = null;
    }
  } else {
    this.state.isRendering = true;
    this.animate();
  }
}
```

### 8.2 内存管理

```javascript
clearScene() {
  // 遍历并清理所有对象
  this.scene.traverse((obj) => {
    // 清理几何体
    if (obj.geometry) {
      obj.geometry.dispose();
    }
    
    // 清理材质
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
    
    // 清理纹理
    for (const key in obj) {
      const prop = obj[key];
      if (prop && prop.isTexture) {
        prop.dispose();
      }
    }
  });
  
  // 清空场景
  while (this.scene.children.length > 0) {
    this.scene.remove(this.scene.children[0]);
  }
  
  // 清空管理器
  this.objects.clear();
  this.selectedObjects.clear();
  
  // 触发事件
  this.emitter.emit('clear-objects', {});
}
```

### 8.3 材质缓存

```javascript
getMaterial(key) {
  if (this.materialCache.has(key)) {
    return this.materialCache.get(key);
  }
  return null;
}

cacheMaterial(key, material) {
  this.materialCache.set(key, material);
}
```

---

## 9. 错误处理

### 9.1 加载错误

```javascript
async loadScene(json) {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    
    if (!data.objects || !Array.isArray(data.objects)) {
      throw new Error('Invalid scene format: missing objects array');
    }
    
    // ... 加载逻辑
    
  } catch (error) {
    console.error('场景加载失败:', error);
    this.emitter.emit('scene-load-error', { error });
    throw error;
  }
}
```

### 9.2 序列化错误

```javascript
exportMaterial(material) {
  try {
    return {
      type: material.type,
      uuid: material.uuid,
      color: material.color?.getHex(),
      roughness: material.roughness,
      metalness: material.metalness
    };
  } catch (error) {
    console.warn('材质导出失败:', material.uuid, error);
    return null;
  }
}
```

### 9.3 几何体创建错误

```javascript
createPrimitive(type, options = {}) {
  if (!this.supportedTypes.includes(type)) {
    console.error(`不支持的几何体类型: ${type}`);
    return null;
  }
  
  try {
    // ... 创建逻辑
  } catch (error) {
    console.error(`创建 ${type} 失败:`, error);
    return null;
  }
}
```

---

## 10. 测试策略

### 10.1 单元测试

```javascript
describe('ThreeViewer', () => {
  test('初始化场景', () => {
    const viewer = new ThreeViewer();
    viewer.init(container);
    expect(viewer.scene).toBeDefined();
    expect(viewer.camera).toBeDefined();
    expect(viewer.renderer).toBeDefined();
  });
  
  test('场景序列化', () => {
    const viewer = new ThreeViewer();
    viewer.init(container);
    
    const box = objectManager.createPrimitive('box');
    viewer.addObject(box);
    
    const json = viewer.exportScene();
    expect(json.objects).toHaveLength(1);
    expect(json.objects[0].type).toBe('Mesh');
  });
  
  test('控制器切换', () => {
    const viewer = new ThreeViewer();
    viewer.init(container);
    
    viewer.switchControls('map');
    expect(viewer.controls).toBeInstanceOf(MapControls);
    
    viewer.switchControls('fly');
    expect(viewer.controls).toBeInstanceOf(FlyControls);
  });
});

describe('ObjectManager', () => {
  test('创建几何体', () => {
    const om = new ObjectManager();
    const box = om.createPrimitive('box', { width: 2, height: 3, depth: 4 });
    expect(box).toBeDefined();
    expect(box.type).toBe('Mesh');
  });
  
  test('射线检测（锁定对象）', () => {
    const om = new ObjectManager();
    const box = om.createPrimitive('box');
    box.userData.locked = true;
    om.addObject(box);
    
    const raycaster = new THREE.Raycaster();
    const results = om.getIntersectedObjects(raycaster);
    expect(results).not.toContain(box);
  });
  
  test('选择系统', () => {
    const om = new ObjectManager();
    const box = om.createPrimitive('box');
    om.addObject(box);
    
    om.selectObject(box.uuid);
    expect(om.selectedObjects.has(box.uuid)).toBe(true);
    
    om.deselectObject(box.uuid);
    expect(om.selectedObjects.has(box.uuid)).toBe(false);
  });
});

describe('InputManager', () => {
  test('拖拽检测', () => {
    const im = new InputManager();
    im.init(container);
    
    // 模拟鼠标移动小于 3px
    // 验证不触发 drag-start
    
    // 模拟鼠标移动大于 3px
    // 验证触发 drag-start
  });
  
  test('坐标归一化', () => {
    const im = new InputManager();
    im.init(container);
    
    // 模拟点击容器中心
    // 验证 normalizedX ≈ 0, normalizedY ≈ 0
  });
});

describe('AssetLoader', () => {
  test('缓存机制', async () => {
    const loader = new AssetLoader();
    loader.initLoaders();
    
    const result1 = await loader.load('/models/test.glb');
    const result2 = await loader.load('/models/test.glb');
    
    expect(result1).toBe(result2);
  });
  
  test('自动缩放', () => {
    const loader = new AssetLoader();
    const largeObject = createLargeObject(100);
    
    loader.autoScaleAndCenter(largeObject);
    
    const box = new THREE.Box3().setFromObject(largeObject);
    const size = box.getSize(new THREE.Vector3());
    expect(Math.max(size.x, size.y, size.z)).toBeLessThanOrEqual(10);
  });
});
```

### 10.2 集成测试

```javascript
describe('Core Integration', () => {
  test('完整场景流程', async () => {
    const viewer = new ThreeViewer();
    viewer.init(container);
    
    // 创建场景
    const box = objectManager.createPrimitive('box');
    viewer.addObject(box);
    
    // 导出
    const exported = viewer.exportScene();
    
    // 清空
    viewer.clearScene();
    
    // 导入
    await viewer.loadScene(exported);
    
    // 验证
    expect(viewer.getObjects()).toHaveLength(1);
  });
  
  test('事件链路', () => {
    const viewer = new ThreeViewer();
    viewer.init(container);
    
    let addCount = 0;
    viewer.emitter.on('add-object', () => addCount++);
    
    const box = objectManager.createPrimitive('box');
    viewer.addObject(box);
    
    expect(addCount).toBe(1);
  });
});
```

---

## 11. 依赖关系

### 11.1 NPM 依赖

```json
{
  "dependencies": {
    "three": "^0.182.0",
    "mitt": "^3.0.1",
    "uuid": "^13.0.0",
    "3d-tiles-renderer": "^0.4.16",
    "stats-gl": "^2.0.0"
  }
}
```

### 11.2 内部依赖

```
ThreeViewer → ObjectManager
ThreeViewer → AssetLoader
ThreeViewer → InputManager
ObjectManager → geometryUtils
AssetLoader → fileUtils
```

### 11.3 文件路径

```
src/core/
├── ThreeViewer.js      # 场景管理器（790 行）
├── ObjectManager.js    # 对象管理器（752 行）
├── InputManager.js     # 输入管理器（381 行）
└── AssetLoader.js      # 资源加载器（460 行）

src/utils/
├── geometryUtils.js    # 几何体工具
└── fileUtils.js        # 文件处理工具

src/controls/
└── FlyControls.js      # 飞行控制器
```

---

## 相关文档

- [模块规格](./spec.md)
- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始技术方案 |
