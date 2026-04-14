# Three Editor by AI - 整体技术方案

**生成日期**: 2026-04-14  
**项目版本**: 0.1.0

---

## 1. 技术上下文

### 1.1 项目背景

Three Editor by AI 是一个基于 Web 的 3D 场景编辑器，目标是提供零安装的 3D 内容创作工具。用户可以在浏览器中完成场景搭建、模型加载、材质编辑、动画配置、场景序列化等完整工作流。

### 1.2 技术约束

- 必须在浏览器中运行
- 支持主流现代浏览器（Chrome、Firefox、Edge、Safari）
- 性能要求：60 FPS（简单场景），30+ FPS（复杂场景）
- 内存使用稳定，无泄漏
- 纯 JavaScript + JSDoc，不使用 TypeScript
- 单页应用（SPA），不使用 Vue Router

### 1.3 技术决策

已完成的重大技术决策：

| 决策 | 选择 | 理由 |
|------|------|------|
| 前端框架 | Vue 3.5.17 | Composition API、响应式系统成熟 |
| 3D 引擎 | Three.js 0.182.0 | 最流行的 Web 3D 库，生态完善 |
| 构建工具 | Vite 7.0.4 | 极速 HMR，原生 ESM 支持 |
| UI 组件库 | Element Plus 2.10.5 | 主流 Vue 3 组件库，组件丰富 |
| 状态管理 | Composables + mitt | 轻量级，适合项目规模，避免 Pinia 开销 |
| 样式方案 | Sass 1.90.0 | 成熟稳定，嵌套语法清晰 |
| 事件总线 | mitt 3.0.1 | 200 bytes，极简 API，模块解耦 |
| 后端服务 | Express (vfs-server.js) | 轻量 Node.js 服务，VFS 文件读写 |

---

## 2. 架构设计

### 2.1 分层架构

```
┌─────────────────────────────────────────────────────────┐
│                  UI Layer (Vue Components)               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Editor    │  │   Dialogs   │  │  Property   │     │
│  │   Panels    │  │             │  │   Panels    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│              Logic Layer (Composables / Hooks)           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ useThree-   │  │ useObject-  │  │  useTrans-  │     │
│  │ Viewer      │  │ Selection   │  │  form       │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│              Engine Layer (Core Managers)                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ ThreeViewer │  │  Object     │  │   Input     │     │
│  │             │  │  Manager    │  │  Manager    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│  ┌─────────────┐                                        │
│  │   Asset     │                                        │
│  │   Loader    │                                        │
│  └─────────────┘                                        │
├─────────────────────────────────────────────────────────┤
│              Service Layer (External APIs)               │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │   VFS       │  │   Static    │                       │
│  │   Server    │  │   Drive     │                       │
│  └─────────────┘  └─────────────┘                       │
├─────────────────────────────────────────────────────────┤
│              Utilities Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Math      │  │  Geometry   │  │    File     │     │
│  │   Utils     │  │   Utils     │  │    Utils    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

详见：[ARCHITECTURE.md](./ARCHITECTURE.md)

### 2.2 模块划分

| 模块 | 职责 | 关键文件 |
|------|------|----------|
| 场景管理 | Three.js 场景、渲染、后处理、动画驱动 | `src/core/ThreeViewer.js`, `src/composables/useThreeViewer.js` |
| 对象管理 | 对象创建、选择、变换、锁定、射线检测 | `src/core/ObjectManager.js`, `src/composables/useObjectSelection.js` |
| 输入处理 | 鼠标、键盘、拖拽、滚轮统一处理 | `src/core/InputManager.js`, `src/composables/useInputManager.js` |
| 资源管理 | 资源加载、缓存、预览、批量队列 | `src/core/AssetLoader.js`, `src/composables/useAssetsManager.js` |
| 材质系统 | 材质创建、编辑、纹理 URL 重映射、颜色归一化 | `src/composables/useMaterial.js` |
| 相机控制 | Orbit/Map/Fly 控制器热切换、预设视角 | `src/composables/useControls.js`, `src/composables/useCameraPosState.js` |
| 飞行控制 | 自定义键盘/鼠标三维飞行控制器 | `src/controls/FlyControls.js` |
| 变换系统 | 撤销/重做、吸附、轴约束 | `src/composables/useTransform.js` |
| 编辑器配置 | localStorage 持久化配置 | `src/composables/useEditorConfig.js` |
| VFS | 虚拟文件系统客户端与服务端 | `src/services/vfs-service.js`, `src/services/vfs-server-api.js`, `src/services/static-drive-api.js`, `script/vfs-server.js` |
| 后处理 | EffectComposer、Bloom、FXAA 等 Pass 管理 | `src/core/ThreeViewer.js`（内置） |
| 工具函数 | 数学、几何、文件处理 | `src/utils/mathUtils.js`, `src/utils/geometryUtils.js`, `src/utils/fileUtils.js` |

---

## 3. 数据设计

### 3.1 核心实体

- **Scene**: Three.js 场景容器，包含所有对象、灯光、相机
- **SceneObject**: 场景中的对象（Mesh、Group、Light、Camera、Sprite 等），通过 UUID 标识
- **Material**: 材质对象（MeshStandardMaterial、MeshPhongMaterial 等），支持纹理绑定
- **Texture**: 纹理资源，支持 URL 缓存与重映射
- **Light**: 灯光对象（DirectionalLight、PointLight、SpotLight、HemisphereLight、AmbientLight）
- **Camera**: 相机对象（PerspectiveCamera），支持预设位置
- **Animation**: 动画剪辑（AnimationClip），通过 AnimationMixer 驱动

详见：[overall-data-model.md](./overall-data-model.md)

### 3.2 序列化策略

**原则**:
- userData 完整序列化，包含自定义属性、动画索引（`userData.animationIndex`）
- 运行时对象不序列化（`_mixer`、`_activeAction` 等直接挂在主对象上，不进入 userData）
- 动画状态可恢复（通过 `animationIndex` 重建）
- 仅保留可序列化字段（如 `animationIndex`），运行时对象排除

**格式**: JSON

**序列化流程**:
```javascript
// ThreeViewer.js - exportScene()
exportScene() {
  const objects = [];
  this.scene.traverse((obj) => {
    if (obj.isMesh || obj.isLight || obj.isCamera || obj.isGroup) {
      objects.push({
        uuid: obj.uuid,
        type: obj.type,
        geometry: obj.geometry ? obj.geometry.toJSON() : null,
        material: obj.material ? obj.material.toJSON() : null,
        transform: {
          position: obj.position.toArray(),
          rotation: obj.rotation.toArray(),
          scale: obj.scale.toArray()
        },
        userData: obj.userData,
        animationIndex: obj.userData?.animationIndex
      });
    }
  });
  return JSON.stringify({ objects, sceneMeta: this.getSceneMeta() });
}
```

**反序列化流程**:
```javascript
// ThreeViewer.js - loadScene(json)
loadScene(json) {
  const data = JSON.parse(json);
  data.objects.forEach((objData) => {
    const obj = this.reconstructObject(objData);
    // 恢复 userData（含 animationIndex）
    obj.userData = { ...objData.userData };
    // 运行时对象不恢复，由 ThreeViewer 重新初始化
    this.scene.add(obj);
  });
  this.emitter.emit('scene-loaded', data);
}
```

---

## 4. 接口设计

### 4.1 内部接口

**Core Managers**:

| 管理器 | 文件 | 核心 API |
|--------|------|----------|
| ThreeViewer | `src/core/ThreeViewer.js` | `init()`, `render()`, `loadScene()`, `exportScene()`, `addObject()`, `removeObject()`, `clearScene()`, `switchControls()`, `updateAllMixers()`, `add3DTiles()`, `findObjectsByUserData()` |
| ObjectManager | `src/core/ObjectManager.js` | `createPrimitive()`, `addObject()`, `removeObject()`, `getIntersectedObjects()`, `getIntersectedFirstObject()`, `getUnlockedObjects()`, `exportObject()`, `importObject()`, `copyObjects()`, `pasteObjects()` |
| InputManager | `src/core/InputManager.js` | `init()`, `dispose()`, `isKeyPressed()`, `registerShortcut()` |
| AssetLoader | `src/core/AssetLoader.js` | `loadGLTF()`, `loadOBJ()`, `loadFBX()`, `loadTexture()`, `load3DTiles()` |

**事件总线** (mitt):

| 事件名称 | 来源 | 数据 | 说明 |
|----------|------|------|------|
| `scene-loaded` | ThreeViewer | scene data | 场景加载完成 |
| `object-added` | ThreeViewer / ObjectManager | object | 对象添加到场景 |
| `object-removed` | ThreeViewer / ObjectManager | object | 对象从场景移除 |
| `object-transform-updated` | ObjectManager | object | 对象变换更新 |
| `selection-changed` | useObjectSelection | selectedObjects | 选中对象变化 |
| `controls-switched` | useControls | controlsType | 控制器切换 |
| `camera-position-changed` | useCameraPosState | position | 相机位置变化 |
| `load-progress` | AssetLoader | { url, progress } | 资源加载进度 |
| `load-complete` | AssetLoader | { url, asset } | 资源加载完成 |
| `load-error` | AssetLoader | { url, error } | 资源加载错误 |

**事件命名规范**: `entity-action`（如 `object-added`、`scene-loaded`）

**监听器清理**: 组件卸载时调用 `emitter.off()` 移除监听器

### 4.2 外部接口

**虚拟文件系统 API** (Express 后端 `script/vfs-server.js`):

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/list/:drive/*` | GET | 获取目录内容 |
| `/file/:drive/*` | GET | 获取文件（二进制/文本） |
| `/save/:drive/*` | POST | 保存文件 |
| `/exists/:drive/*` | GET | 检查文件/目录是否存在 |

详见：[API.md](./API.md)

---

## 5. 关键技术实现

### 5.1 场景渲染

**实现**:
```javascript
// src/core/ThreeViewer.js
class ThreeViewer {
  constructor() {
    this.emitter = mitt();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;       // EffectComposer
    this.controls = null;
    this.animationMixers = [];  // 所有 AnimationMixer
  }

  async init(container) {
    // 场景
    this.scene = new THREE.Scene();

    // 相机
    this.camera = new THREE.PerspectiveCamera(
      60, container.clientWidth / container.clientHeight, 0.1, 10000
    );

    // 渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 后处理
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // 控制器（默认 OrbitControls）
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // 响应式容器尺寸
    this.watchContainerSize(container);

    // 启动渲染循环
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    // 驱动所有动画 mixer
    this.updateAllMixers();
    // 渲染（使用后处理）
    this.composer.render();
  }

  updateAllMixers(delta = this.clock.getDelta()) {
    for (const mixer of this.animationMixers) {
      mixer.update(delta);
    }
  }
}
```

**优化**:
- `devicePixelRatio` 上限为 2，避免高分屏过度渲染
- PCFSoftShadowMap 平衡质量与性能
- 后处理链路通过 EffectComposer 统一管理
- Vue 响应式 + watch 监听容器尺寸变化自动调整

### 5.2 对象管理与选择

**实现**:
```javascript
// src/core/ObjectManager.js
class ObjectManager {
  constructor() {
    this.emitter = mitt();
    this.objects = new Map();       // UUID -> Object 响应式 Map
    this.selectedObjects = new Set(); // 选中对象 Set
  }

  createPrimitive(type, options = {}) {
    // 12 种几何体 + 5 种灯光 + camera/group/text/sprite
    let object;
    switch (type) {
      case 'box':
        object = new THREE.Mesh(
          new THREE.BoxGeometry(options.width || 1, options.height || 1, options.depth || 1),
          new THREE.MeshStandardMaterial({ color: options.color || 0x888888 })
        );
        break;
      // ... 其他类型
    }
    object.userData = { type, ...options };
    return object; // 不自动添加，需外部调用 addObject()
  }

  addObject(object) {
    this.objects.set(object.uuid, object);
    this.scene.add(object);
    this.emitter.emit('object-added', object);
  }

  getIntersectedFirstObject(raycaster) {
    // 射线检测，仅返回未锁定对象
    const unlocked = this.getUnlockedObjects();
    const intersects = raycaster.intersectObjects(unlocked, true);
    if (intersects.length > 0) {
      // 沿父链查找，返回第一个未锁定的祖先
      return this.findUnlockedAncestor(intersects[0].object);
    }
    return null;
  }

  getUnlockedObjects() {
    return Array.from(this.objects.values()).filter(
      (obj) => obj.userData?.locked !== true
    );
  }
}
```

**useObjectSelection.js 关键逻辑**:
```javascript
// src/composables/useObjectSelection.js
const transformControls = new TransformControls(
  threeViewer.camera,
  threeViewer.renderer.domElement
);

// 拖拽时禁用 OrbitControls
transformControls.addEventListener('dragging-changed', (event) => {
  orbitControls.enabled = !event.value;
});

// 拖拽开始/结束联动撤销/重做
transformControls.addEventListener('objectChange', () => {
  useTransform.startTransform();
});

// 多选支持：每个选中对象对应一个 helper
const selectionStore = reactive({}); // id -> 临时材质信息
```

**特性**:
- 单选/多选支持
- TransformControls 与 OrbitControls 互斥
- 锁定对象不可选择、不可射线检测
- 射线检测沿父链查找未锁定祖先
- 材质归一化（选中时高亮，取消时恢复）

### 5.3 资源加载与缓存

**实现**:
```javascript
// src/core/AssetLoader.js
class AssetLoader {
  constructor() {
    this.emitter = mitt();
    this.urlCache = new Map(); // URL -> loaded asset
    this.dracoLoader = new DRACOLoader();
    this.ktx2Loader = new KTX2Loader();
  }

  async loadGLTF(url, onProgress) {
    // URL 缓存检查
    if (this.urlCache.has(url)) {
      return this.urlCache.get(url);
    }

    const loader = new GLTFLoader();
    loader.setDRACOLoader(this.dracoLoader);
    loader.setKTX2Loader(this.ktx2Loader);
    loader.setMeshoptDecoder(MeshoptDecoder);

    const gltf = await new Promise((resolve, reject) => {
      loader.load(url, resolve, onProgress, reject);
    });

    // 自动缩放和居中
    this.autoScaleAndCenter(gltf.scene);

    // 缓存
    this.urlCache.set(url, gltf);
    this.emitter.emit('load-complete', { url, asset: gltf });
    return gltf;
  }

  autoScaleAndCenter(group) {
    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 10) {
      const scale = 5 / maxDim;
      group.scale.setScalar(scale);
    }
    group.position.sub(center.multiplyScalar(group.scale.x));
  }
}
```

**useAssetsManager.js 关键逻辑**:
```javascript
// src/composables/useAssetsManager.js
const assetLibrary = reactive({}); // filename -> asset info

async function loadModel(url) {
  const filename = getFilename(url);
  // 检查缓存（同名同大小）
  const cached = assetLibrary[filename];
  if (cached && cached.size === getFileSize(url)) {
    return cached.asset;
  }

  // 加载新资源
  const asset = await assetLoader.loadGLTF(url);
  assetLibrary[filename] = {
    asset,
    size: getFileSize(url),
    preview: generatePreview(asset, 256, 256) // 256x256 预览
  };
  return asset;
}

// 批量加载队列
const loadQueue = [];
async function processQueue() {
  while (loadQueue.length > 0) {
    const item = loadQueue.shift();
    await loadModel(item.url);
  }
}
```

**优化**:
- URL 缓存避免重复网络请求
- 文件名 + 大小双重校验确保缓存一致性
- 自动缩放/居中，避免模型过大或过小
- 256x256 预览图生成
- 批量加载队列控制并发

### 5.4 输入管理

**实现**:
```javascript
// src/core/InputManager.js
class InputManager {
  constructor() {
    this.emitter = mitt();
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, normalizedX: 0, normalizedY: 0 };
    this.dragThreshold = 3; // 3px 拖拽阈值
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
  }

  init(canvas) {
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('wheel', this.onWheel.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  onMouseDown(e) {
    this.dragStart = { x: e.clientX, y: e.clientY };
    this.isDragging = false;
    this.emitter.emit('mouse-down', this.normalizeCoords(e));
  }

  onMouseMove(e) {
    const dx = e.clientX - this.dragStart.x;
    const dy = e.clientY - this.dragStart.y;
    if (!this.isDragging && Math.sqrt(dx * dx + dy * dy) > this.dragThreshold) {
      this.isDragging = true;
      this.emitter.emit('drag-start', this.normalizeCoords(e));
    }
    if (this.isDragging) {
      this.emitter.emit('drag-move', this.normalizeCoords(e));
    }
    this.mouse = this.normalizeCoords(e);
  }

  normalizeCoords(e) {
    return {
      x: e.clientX,
      y: e.clientY,
      normalizedX: (e.clientX / window.innerWidth) * 2 - 1,
      normalizedY: -(e.clientY / window.innerHeight) * 2 + 1
    };
  }
}
```

**特性**:
- 鼠标/键盘/拖拽/滚轮统一处理
- 坐标归一化（NDC 坐标）
- 3px 拖拽阈值，避免误触
- 10 个 mitt 事件分发

### 5.5 变换与撤销/重做

**实现**:
```javascript
// src/composables/useTransform.js
const MAX_HISTORY = 50;
const history = ref([]);
const historyIndex = ref(-1);

function startTransform() {
  // 记录变换前状态
  const snapshot = captureSnapshot(selectedObjects.value);
  history.value = history.value.slice(0, historyIndex.value + 1);
  history.value.push({ before: snapshot });
  historyIndex.value = history.value.length - 1;
}

function endTransform() {
  // 记录变换后状态
  const snapshot = captureSnapshot(selectedObjects.value);
  if (history.value[historyIndex.value]) {
    history.value[historyIndex.value].after = snapshot;
  }
  // 裁剪超出最大长度的历史
  if (history.value.length > MAX_HISTORY) {
    history.value = history.value.slice(-MAX_HISTORY);
    historyIndex.value = history.value.length - 1;
  }
}

function undo() {
  if (historyIndex.value < 0) return;
  const entry = history.value[historyIndex.value];
  restoreSnapshot(entry.before);
  historyIndex.value--;
}

function redo() {
  if (historyIndex.value >= history.value.length - 1) return;
  historyIndex.value++;
  const entry = history.value[historyIndex.value];
  restoreSnapshot(entry.after);
}
```

**特性**:
- 最大 50 条历史记录
- 变换前/后快照对比
- 支持吸附（snap）
- 轴约束（X/Y/Z 锁定）

### 5.6 飞行控制器

**实现**:
```javascript
// src/controls/FlyControls.js
class FlyControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.movementSpeed = 1.0;
    this.rollSpeed = 0.005;
    this.dragToLook = true;
    this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0 };
  }

  update(delta) {
    const actualMoveSpeed = this.movementSpeed * delta;
    // WASD/QE/方向键/空格/R 键处理
    if (this.moveState.forward) this.camera.translateZ(-actualMoveSpeed);
    if (this.moveState.back) this.camera.translateZ(actualMoveSpeed);
    if (this.moveState.up) this.camera.position.y += actualMoveSpeed;
    if (this.moveState.down) this.camera.position.y -= actualMoveSpeed;
    // ... 鼠标拖拽旋转、滚轮缩放
  }
}
```

**特性**:
- WASD 前后左右移动
- Q/E 上下移动
- 空格键与 R 键均可向上飞行
- 鼠标拖拽旋转视角
- 滚轮调整飞行速度
- 参考 three/examples/jsm/controls/OrbitControls.js 和 FlyControls.js 实现

### 5.7 材质管理

**实现**:
```javascript
// src/composables/useMaterial.js
function normalizeColor(color) {
  if (color instanceof THREE.Color) return color;
  if (typeof color === 'string') return new THREE.Color(color);
  if (typeof color === 'number') return new THREE.Color(color);
  return new THREE.Color(0x888888);
}

function remapTextureUrl(material, oldUrl, newUrl) {
  // 纹理 URL 重映射
  if (material.map) {
    material.map.image.src = newUrl;
    material.map.needsUpdate = true;
  }
}
```

**特性**:
- 材质状态管理
- 纹理 URL 重映射
- 颜色归一化（支持 string/number/Color 对象）

### 5.8 相机位置状态

**实现**:
```javascript
// src/composables/useCameraPosState.js
const cameraPosition = reactive({ x: 0, y: 0, z: 0 });
const cameraRotation = reactive({ x: 0, y: 0, z: 0 });

async function flyToPos(targetPos, duration = 1000) {
  // 平滑飞行到目标位置
  const startPos = camera.position.clone();
  const startTime = Date.now();
  return new Promise((resolve) => {
    function animate() {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(t);
      camera.position.lerpVectors(startPos, targetPos, eased);
      if (t < 1) requestAnimationFrame(animate);
      else resolve();
    }
    animate();
  });
}
```

**特性**:
- 相机位置/旋转响应式状态
- `zoomToPos` 缩放到目标
- `flyToPos` 平滑飞行（缓动函数）

### 5.9 场景序列化

**实现**:
```javascript
// src/core/ThreeViewer.js
exportScene() {
  const objects = [];
  this.scene.traverse((obj) => {
    if (obj.isMesh || obj.isLight || obj.isCamera || obj.isGroup) {
      objects.push({
        uuid: obj.uuid,
        type: obj.type,
        geometry: obj.geometry ? obj.geometry.toJSON() : null,
        material: obj.material ? obj.material.toJSON() : null,
        transform: {
          position: obj.position.toArray(),
          rotation: obj.rotation.toArray(),
          scale: obj.scale.toArray()
        },
        userData: obj.userData,
        animationIndex: obj.userData?.animationIndex
      });
    }
  });
  return JSON.stringify({ objects, sceneMeta: this.getSceneMeta() });
}
```

**注意**:
- 运行时对象（`_mixer`、`_activeAction`）不序列化
- userData 完整序列化
- 动画索引（`animationIndex`）记录在 userData 中
- 导入时通过 `animationIndex` 恢复动画状态

---

## 6. 性能优化

### 6.1 已实现优化

| 优化 | 效果 | 实现位置 |
|------|------|----------|
| URL 缓存 | 减少重复网络请求 | `src/core/AssetLoader.js` |
| 文件名+大小缓存校验 | 避免缓存失效 | `src/composables/useAssetsManager.js` |
| 事件解耦 | 减少模块间直接依赖 | mitt 事件总线（所有 Core Manager） |
| 拖拽时禁用 OrbitControls | 避免相机跟随抖动 | `src/composables/useObjectSelection.js` |
| devicePixelRatio 上限 | 避免高分屏过度渲染 | `src/core/ThreeViewer.js` |
| 自动缩放/居中 | 避免模型尺寸异常 | `src/core/AssetLoader.js` |
| 3px 拖拽阈值 | 避免误触 | `src/core/InputManager.js` |
| 撤销历史上限 50 | 控制内存占用 | `src/composables/useTransform.js` |
| 射线检测仅未锁定对象 | 减少检测开销 | `src/core/ObjectManager.js` |
| 材质归一化 | 统一材质处理流程 | `src/composables/useMaterial.js` |
| 批量加载队列 | 控制并发加载 | `src/composables/useAssetsManager.js` |
| 后处理 EffectComposer | 统一 Pass 管理 | `src/core/ThreeViewer.js` |

### 6.2 计划优化

| 优化 | 优先级 | 预计效果 |
|------|--------|----------|
| 实例化渲染（InstancedMesh） | P1 | 减少绘制调用，提升大量相同对象场景性能 |
| LOD 系统 | P2 | 根据距离切换模型精度，减少顶点数 |
| 纹理压缩（KTX2/Basis） | P2 | 减少纹理内存使用 |
| Web Worker 加载 | P3 | 避免主线程阻塞 |
| 按需渲染（静态场景） | P1 | 静态场景不重复渲染，降低 GPU 负载 |
| 几何体合并 | P2 | 减少 draw call |
| 视锥体裁剪优化 | P2 | 减少不可见对象渲染 |

---

## 7. 测试策略

### 7.1 手动测试清单

**核心功能**:
- [ ] 场景创建/加载/保存
- [ ] 12 种几何体创建
- [ ] 5 种灯光创建
- [ ] GLTF/OBJ/FBX 模型加载
- [ ] 纹理加载与应用
- [ ] 对象变换（移动/旋转/缩放）
- [ ] Y 轴锁定变换
- [ ] 多选与辅助显示
- [ ] 材质编辑（参数动态配置）
- [ ] 纹理 URL 重映射
- [ ] 相机控制（Orbit/Map/Fly 切换）
- [ ] FlyControls 键盘/鼠标操作
- [ ] 动画选择与播放
- [ ] 撤销/重做（50 条历史）
- [ ] 对象锁定/解锁
- [ ] 复制/粘贴（深克隆）
- [ ] 场景序列化/反序列化
- [ ] 后处理效果（Bloom/FXAA）
- [ ] 3DTiles 加载
- [ ] VFS 文件浏览/拖拽加载
- [ ] 资源浏览器预览（256x256）
- [ ] 底部状态栏视点显示
- [ ] 立方体视角控件

**边缘场景**:
- [ ] 大场景加载（1000+ 对象）
- [ ] 复杂模型加载（高面数）
- [ ] 快速连续操作
- [ ] 长时间使用（内存泄漏检查）
- [ ] 网络断开时资源加载
- [ ] 无效文件拖拽处理
- [ ] 高分屏渲染（devicePixelRatio > 2）

### 7.2 自动化测试（未来）

**单元测试** (Vitest):
- 工具函数测试（`src/utils/`）
- Composables 逻辑测试（纯逻辑部分）
- 序列化/反序列化测试
- 颜色归一化测试
- 坐标归一化测试

**E2E 测试** (Playwright):
- 场景创建到保存完整流程
- 模型加载到变换完整流程
- 材质编辑完整流程
- 撤销/重做完整流程
- 跨浏览器测试

---

## 8. 部署方案

### 8.1 开发环境

```bash
# 1. 启动 VFS Server
cd script
node vfs-server.js 3001

# 2. 启动前端
npm run dev
```

**开发服务器**:
- Vite 开发服务器：`http://localhost:5173`
- VFS Server: `http://localhost:3001`

**静态资源路径** (vite-plugin-static-copy):
- `/draco/` - Draco 解码器（用于压缩 GLTF）
- `/basis/` - Basis/KTX2 纹理解码器
- `/meshopt/` - Meshopt 解码器

### 8.2 生产构建

```bash
# 1. 构建前端
npm run build

# 2. 部署前端
# dist/three-editor-by-ai/ 目录内容部署到 Nginx/Apache

# 3. 部署 VFS Server（可选独立部署）
pm2 start script/vfs-server.js --name vfs-server
```

### 8.3 环境配置

**开发环境**:
- 前端：`http://localhost:5173`
- VFS Server: `http://localhost:3001`
- CORS: 允许 localhost 跨域

**生产环境**:
- 前端：`https://your-domain.com/three-editor-by-ai/`
- VFS Server: `https://your-domain.com/api/vfs/`
- CORS: 配置允许域名
- HTTPS: 强制启用

### 8.4 Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location /three-editor-by-ai/ {
        alias /var/www/three-editor-by-ai/;
        try_files $uri $uri/ /three-editor-by-ai/index.html;
    }

    # VFS API 代理
    location /api/vfs/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 9. 监控与日志

### 9.1 性能监控

**已实现**:
- FPS 显示（stats-gl）
- 内存使用显示

**计划**:
- 性能数据上报
- 错误追踪（Sentry）
- 用户行为分析

### 9.2 错误处理

**前端**:
```javascript
// 资源加载错误处理
try {
  await assetLoader.loadGLTF(url);
} catch (error) {
  console.error('模型加载失败:', error);
  ElMessage.error('模型加载失败：' + error.message);
}
```

**后端** (vfs-server.js):
```javascript
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 1,
    msg: '服务器内部错误'
  });
});
```

### 9.3 日志策略

- 前端：`console.error` 记录关键错误，`console.warn` 记录警告
- 后端：Express 中间件记录请求日志
- 生产环境：建议接入日志聚合服务

---

## 10. 安全考虑

### 10.1 前端安全

- 用户输入验证（文件名、路径、URL）
- XSS 防护（Vue 自动转义）
- CSRF 防护（同源策略）
- 拖拽文件类型白名单校验

### 10.2 后端安全

- CORS 配置（限制允许的来源）
- 文件上传限制（大小、类型）
- 路径遍历防护（防止 `../` 攻击）
- 速率限制（未来）

### 10.3 数据安全

- 用户文件隔离（通过 drive 参数）
- 敏感信息不存储
- 传输加密（HTTPS）
- VFS 元数据（`.folder.json`）只读生成

---

## 11. 技术债务

### 当前债务

| 债务 | 影响 | 优先级 | 预计解决时间 |
|------|------|--------|--------------|
| 无 TypeScript | 中 | P1 | 2-3 周 |
| 无自动化测试 | 中 | P1 | 1-2 周 |
| 无 ESLint 配置 | 低 | P2 | 1 天 |
| 文档不完整 | 中 | P1 | 持续进行 |
| JSDoc 覆盖率低 | 低 | P2 | 持续进行 |

### 还债计划

1. **阶段 1**: 添加 ESLint + Prettier 配置
2. **阶段 2**: 编写核心功能测试（工具函数、序列化）
3. **阶段 3**: 补充 JSDoc 注释（Core Managers、Composables）
4. **阶段 4**: 逐步迁移到 TypeScript（从 utils 开始）
5. **阶段 5**: 完善文档（模块级文档、API 文档）

---

## 12. 未来规划

### 短期（1-3 个月）

- [ ] 完善现有功能稳定性
- [ ] 添加自动化测试（Vitest + Playwright）
- [ ] 性能优化（实例化渲染、按需渲染）
- [ ] 文档完善（模块文档、API 文档）
- [ ] ESLint + Prettier 配置

### 中期（3-6 个月）

- [ ] TypeScript 迁移（渐进式）
- [ ] 协作编辑功能
- [ ] 插件系统
- [ ] 移动端优化
- [ ] LOD 系统

### 长期（6-12 个月）

- [ ] VR/AR 支持
- [ ] AI 辅助建模
- [ ] 云同步
- [ ] 资源市场
- [ ] 多用户权限管理

---

## 相关文档

- [整体规格](./overall-spec.md)
- [数据模型](./overall-data-model.md)
- [架构设计](./ARCHITECTURE.md)
- [技术选型](./TECH.md)
- [API 清单](./API.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始技术方案（基于 specs） |
