# 001-Core 核心引擎模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 模块概述

### 1.1 模块定位

核心引擎模块是 Three Editor by AI 的心脏，负责 Three.js 场景的创建、管理、渲染和所有 3D 对象的生命周期管理。

### 1.2 模块职责

- **ThreeViewer**: Three.js 场景、渲染器、相机、控制器、后处理的统一管理
- **ObjectManager**: 3D 对象的创建、管理、选择、复制粘贴与射线检测
- **InputManager**: 鼠标、键盘、拖拽、滚轮输入事件的统一处理
- **AssetLoader**: 3D 模型和纹理资源的加载、缓存与批处理

### 1.3 核心价值

- 统一的 Three.js 封装，提供简洁的 API
- 事件驱动的模块间通信（mitt）
- 完整的场景序列化和反序列化支持
- 高性能渲染和动画驱动
- Vue 3 响应式集成

---

## 2. ThreeViewer 规格

### 2.1 组件概述

**类名**: `ThreeViewer`  
**文件**: `src/core/ThreeViewer.js`  
**大小**: 790 行  
**职责**: Three.js 场景、渲染器、相机、控制器、后处理的统一管理

### 2.2 核心属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `scene` | THREE.Scene | Three.js 场景对象 |
| `renderer` | THREE.WebGLRenderer | WebGL 渲染器 |
| `camera` | THREE.PerspectiveCamera | 透视相机 |
| `controls` | OrbitControls \| MapControls \| FlyControls | 相机控制器 |
| `composer` | EffectComposer | 后处理合成器 |
| `emitter` | mitt.Emitter | 事件总线 |

### 2.3 核心功能

#### 2.3.1 场景初始化

**功能描述**: 创建 Three.js 场景、渲染器、相机、控制器和后处理系统

**输入**:
- `container`: HTMLElement - 渲染容器

**输出**:
- 初始化的 Three.js 环境

**处理流程**:
1. 创建 THREE.Scene 场景
2. 创建 THREE.PerspectiveCamera 相机（FOV 75, near 0.1, far 1000）
3. 创建 THREE.WebGLRenderer 渲染器（antialias, alpha, devicePixelRatio）
4. 初始化 OrbitControls（默认控制器）
5. 初始化 EffectComposer（RenderPass + 可选 Bloom + 可选 FXAA）
6. 将渲染器 DOM 添加到容器
7. 启动渲染循环

**代码示例**:
```javascript
const viewer = new ThreeViewer(options);
viewer.init(document.getElementById('container'));
```

---

#### 2.3.2 渲染循环

**功能描述**: 持续渲染场景，驱动动画更新

**机制**:
- 使用 `requestAnimationFrame` 实现流畅渲染
- 每帧计算 delta time
- 遍历场景对象，更新所有 `_mixer` 动画
- 计算并更新 FPS 统计
- 支持按需渲染（静态场景优化）

**动画驱动逻辑**:
```javascript
// 遍历场景对象，更新动画
this.scene.traverse((obj) => {
  if (obj._mixer) {
    obj._mixer.update(deltaTime);
  }
});
```

---

#### 2.3.3 相机控制

**支持的控制器**:
1. **OrbitControls** - 环绕观察（默认）
2. **MapControls** - 地图控制（平移 + 缩放）
3. **FlyControls** - 飞行控制（第一人称）

**切换方法**:
```javascript
viewer.switchControls('orbit');   // 轨道控制
viewer.switchControls('map');     // 地图控制
viewer.switchControls('fly');     // 飞行控制
```

**热切换机制**:
- 销毁旧控制器（dispose）
- 创建新控制器并绑定到相机和渲染器
- 保持相机当前位置不变

---

#### 2.3.4 场景加载与导出

**加载场景**:
```javascript
await viewer.loadScene(jsonData);
```

**导出场景**:
```javascript
const sceneData = viewer.exportScene();
```

**序列化内容**:
- ✅ 所有 3D 对象（Mesh、Group、Light 等）
- ✅ 几何体数据和参数
- ✅ 材质数据和纹理引用
- ✅ 变换（位置、旋转、缩放）
- ✅ userData（自定义属性）
- ✅ 动画索引
- ❌ 运行时对象（_mixer、_activeAction 等）

---

#### 2.3.5 对象管理

**添加对象**:
```javascript
viewer.addObject(object);
```

**移除对象**:
```javascript
viewer.removeObject(object);
```

**清空场景**:
```javascript
viewer.clearScene();
```

**按 userData 查找**:
```javascript
// 支持多层 key，如 "foo.bar.baz"
const objects = viewer.findObjectsByUserData('animationIndex', 0);
```

**添加 3D Tiles**:
```javascript
await viewer.add3DTiles(url);
```

---

#### 2.3.6 后处理系统

**EffectComposer 集成**:
- 支持多 Pass 链路
- 统一 API 动态管理 Pass
- 支持 Bloom、FXAA 等效果

**添加 Pass**:
```javascript
viewer.addPass(bloomPass);
viewer.addPass(fxaaPass);
```

**启用/禁用**:
```javascript
viewer.setPassEnabled('bloom', true);
viewer.setPassEnabled('fxaa', false);
```

---

#### 2.3.7 Vue 响应式集成

- 使用 `reactive()` 管理 editorConfig
- 使用 `watch()` 监听配置变化并自动应用
- 与 Vue 3 Composition API 无缝集成

---

### 2.4 API 接口

#### 公共方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init(container)` | container: HTMLElement | void | 初始化场景 |
| `render()` | - | void | 单帧渲染 |
| `loadScene(json)` | json: Object | Promise<void> | 加载场景 |
| `exportScene()` | - | Object | 导出场景 |
| `addObject(obj)` | obj: THREE.Object3D | void | 添加对象 |
| `removeObject(obj)` | obj: THREE.Object3D | void | 移除对象 |
| `clearScene()` | - | void | 清空场景 |
| `findObjectsByUserData(key, value)` | key: string, value: any | THREE.Object3D[] | 按 userData 查找 |
| `switchControls(type)` | type: string | void | 切换控制器 |
| `add3DTiles(url)` | url: string | Promise<void> | 加载 3D Tiles |
| `addPass(pass)` | pass: Pass | void | 添加后处理 Pass |
| `setPassEnabled(name, enabled)` | name: string, enabled: boolean | void | 启用/禁用 Pass |

---

### 2.5 事件系统

#### 触发的事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `before-render` | 每帧渲染前 | `{ deltaTime: number }` |
| `before-add-object` | 对象添加前 | `{ object: THREE.Object3D }` |
| `add-object` | 对象添加后 | `{ object: THREE.Object3D }` |
| `remove-object` | 对象移除后 | `{ object: THREE.Object3D }` |
| `scene-loaded` | 场景加载完成 | `{ scene: THREE.Scene }` |

#### 监听的事件

| 事件名 | 来源 | 响应动作 |
|--------|------|----------|
| `object-transform-updated` | ObjectManager | 标记需要重新渲染 |
| `editor-config-changed` | Vue Composable | 应用配置变更 |

---

### 2.6 性能指标

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| 空场景 FPS | 60 | 60 |
| 1000 对象 FPS | > 30 | 待测试 |
| 渲染启动时间 | < 100ms | 待测试 |
| 场景加载时间（10MB） | < 2s | 待测试 |

---

## 3. ObjectManager 规格

### 3.1 组件概述

**类名**: `ObjectManager`  
**文件**: `src/core/ObjectManager.js`  
**大小**: 752 行  
**职责**: 3D 对象的创建、管理、选择、复制粘贴与射线检测

### 3.2 核心状态

| 状态 | 类型 | 说明 |
|------|------|------|
| `objects` | reactive Map<UUID, Object3D> | 所有管理的对象 |
| `selectedObjects` | reactive Set<UUID> | 当前选中的对象 UUID |
| `clipboard` | Object3D[] \| null | 剪贴板中的对象 |

### 3.3 核心功能

#### 3.3.1 几何体创建

**支持的几何体类型**（12 种）:
- Box（立方体）
- Sphere（球体）
- Cylinder（圆柱体）
- Cone（圆锥体）
- Plane（平面）
- Circle（圆形）
- Ring（圆环）
- Torus（圆环体）
- Tube（管状体）
- Dodecahedron（十二面体）
- Icosahedron（二十面体）
- Octahedron（八面体）
- Tetrahedron（四面体）

**支持的灯光类型**（6 种）:
- AmbientLight（环境光）
- DirectionalLight（平行光）
- PointLight（点光源）
- SpotLight（聚光灯）
- HemisphereLight（半球光）
- RectAreaLight（矩形面光源）

**其他类型**:
- Camera（相机）
- Group（组）
- Text（文本）
- Sprite（精灵）

**创建方法**:
```javascript
const box = objectManager.createPrimitive('box', {
  width: 1,
  height: 2,
  depth: 1
});
```

**设计原则**:
- `createPrimitive()` 只负责创建对象
- 不调用 `addObject()` 自动添加
- 需在外部显式调用 `addObject()` 完成注册

---

#### 3.3.2 材质规范化

- 创建几何体时自动确保使用 `MeshStandardMaterial`
- 提供默认材质配置
- 支持自定义材质覆盖

---

#### 3.3.3 选择系统

**选择对象**:
```javascript
objectManager.selectObject(uuid);
```

**取消选择**:
```javascript
objectManager.deselectObject(uuid);
```

**清空选择**:
```javascript
objectManager.clearSelection();
```

**选择状态**:
- 使用 reactive Set 管理选中 UUID
- 选择变化时触发 `selection-changed` 事件

---

#### 3.3.4 复制粘贴

- 深度克隆对象（含几何体、材质、userData）
- 重新生成 UUID 避免冲突
- 保持变换属性不变

---

#### 3.3.5 锁定系统

- `userData.locked = true` 防止对象被选择和变换
- 射线检测自动跳过锁定对象
- `getUnlockedObjects()` 返回所有未锁定对象

---

#### 3.3.6 射线检测

**获取所有相交对象**:
```javascript
const intersected = objectManager.getIntersectedObjects(raycaster);
```

**获取第一个相交对象**:
```javascript
const first = objectManager.getIntersectedFirstObject(raycaster);
```

**检测逻辑**:
- 遍历父级链，找到顶层被管理的对象
- 仅返回未锁定的对象
- 过滤重复对象

---

#### 3.3.7 对象导出

- 仅序列化可序列化字段
- 运行时对象（_mixer 等）被排除
- 保持 userData 完整性（不含运行时属性）

---

### 3.4 API 接口

#### 公共方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `createPrimitive(type, options)` | type: string, options: Object | THREE.Object3D | 创建几何体/灯光等 |
| `addObject(obj)` | obj: THREE.Object3D | void | 添加对象到管理器 |
| `removeObject(obj)` | obj: THREE.Object3D | void | 从管理器移除对象 |
| `selectObject(uuid)` | uuid: string | void | 选择对象 |
| `deselectObject(uuid)` | uuid: string | void | 取消选择对象 |
| `clearSelection()` | - | void | 清空选择 |
| `getIntersectedObjects(raycaster)` | raycaster: THREE.Raycaster | THREE.Object3D[] | 获取相交对象 |
| `getIntersectedFirstObject(raycaster)` | raycaster: THREE.Raycaster | THREE.Object3D | 获取第一个相交对象 |
| `getUnlockedObjects()` | - | THREE.Object3D[] | 获取未锁定对象 |
| `exportObject(object)` | object: THREE.Object3D | Object | 导出对象数据 |
| `importObject(json)` | json: Object | THREE.Object3D | 导入对象数据 |

---

### 3.5 事件系统

#### 触发的事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `add-object` | 对象添加 | `{ object: THREE.Object3D }` |
| `remove-object` | 对象移除 | `{ object: THREE.Object3D }` |
| `clear-objects` | 清空所有对象 | `{}` |
| `object-transform-updated` | 变换更新 | `{ object: THREE.Object3D }` |
| `selection-changed` | 选择变化 | `{ selected: string[] }` |

---

## 4. InputManager 规格

### 4.1 组件概述

**类名**: `InputManager`  
**文件**: `src/core/InputManager.js`  
**大小**: 381 行  
**职责**: 鼠标、键盘、拖拽、滚轮输入事件的统一处理

### 4.2 核心功能

#### 4.2.1 鼠标事件

- 点击（click）
- 双击（dblclick）
- 按下（mouse-down）
- 抬起（mouse-up）
- 移动（mouse-move）

#### 4.2.2 拖拽检测

- 3px 拖拽阈值（区分点击和拖拽）
- 拖拽开始（drag-start）
- 拖拽中（drag）
- 拖拽结束（drag-end）

#### 4.2.3 键盘事件

- 按键按下（keydown）
- 按键抬起（keyup）
- 文档级监听器

#### 4.2.4 滚轮事件

- 滚轮滚动（wheel）
- 归一化坐标输出

#### 4.2.5 坐标归一化

- 输出范围: -1 到 1
- 用于射线检测

---

### 4.3 事件系统

#### 触发的事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `click` | 鼠标点击 | `{ x, y, normalizedX, normalizedY }` |
| `dblclick` | 鼠标双击 | `{ x, y, normalizedX, normalizedY }` |
| `drag-start` | 拖拽开始 | `{ x, y, normalizedX, normalizedY }` |
| `drag` | 拖拽中 | `{ x, y, dx, dy, normalizedX, normalizedY }` |
| `drag-end` | 拖拽结束 | `{ x, y, normalizedX, normalizedY }` |
| `mouse-move` | 鼠标移动 | `{ x, y, normalizedX, normalizedY }` |
| `mouse-down` | 鼠标按下 | `{ x, y, button }` |
| `mouse-up` | 鼠标抬起 | `{ x, y, button }` |
| `keydown` | 按键按下 | `{ key, code, modifiers }` |
| `keyup` | 按键抬起 | `{ key, code, modifiers }` |
| `wheel` | 滚轮滚动 | `{ deltaX, deltaY, deltaZ }` |

---

## 5. AssetLoader 规格

### 5.1 组件概述

**类名**: `AssetLoader`  
**文件**: `src/core/AssetLoader.js`  
**大小**: 460 行  
**职责**: 3D 模型和纹理资源的加载、缓存与批处理

### 5.2 核心功能

#### 5.2.1 加载器支持

| 加载器 | 支持格式 | 特性 |
|--------|----------|------|
| GLTFLoader | .gltf, .glb | Draco 压缩、KTX2 纹理、Meshopt 压缩 |
| OBJLoader | .obj | Wavefront OBJ 格式 |
| FBXLoader | .fbx | Autodesk FBX 格式 |
| TextureLoader | .jpg, .png, .ktx2 | 纹理加载 |

#### 5.2.2 缓存机制

- URL 键值缓存（避免重复加载）
- 缓存命中时直接返回已有资源
- 缓存大小可配置

#### 5.2.3 LoadingManager 集成

- 统一加载进度跟踪
- 多资源并行加载
- 加载完成回调

#### 5.2.4 后处理

- 自动缩放模型到合适尺寸
- 自动居中模型
- 保持原始比例

#### 5.2.5 多态输入

- 支持 File 对象
- 支持 URL 字符串
- 支持数据字符串（base64 等）

#### 5.2.6 批量加载

- 支持同时加载多个资源
- 返回 Promise 数组
- 统一错误处理

---

### 5.3 事件系统

#### 触发的事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `loading-start` | 加载开始 | `{ url, type }` |
| `loading-progress` | 加载进度 | `{ url, progress, loaded, total }` |
| `loading-complete` | 加载完成 | `{ url, object }` |
| `loading-error` | 加载错误 | `{ url, error }` |

---

## 6. 依赖关系

### 6.1 内部依赖

```
ThreeViewer → ObjectManager
ThreeViewer → AssetLoader
ThreeViewer → InputManager
ObjectManager → geometryUtils
AssetLoader → fileUtils
```

### 6.2 外部依赖

| 依赖 | 用途 |
|------|------|
| three | Three.js 核心库 |
| mitt | 事件总线 |
| uuid | 唯一 ID 生成 |
| 3d-tiles-renderer | 3D Tiles 加载 |
| stats-gl | 性能监控 |

---

## 7. 使用示例

### 7.1 完整初始化流程

```javascript
import ThreeViewer from './core/ThreeViewer.js';
import ObjectManager from './core/ObjectManager.js';
import InputManager from './core/InputManager.js';
import AssetLoader from './core/AssetLoader.js';

// 1. 创建管理器实例
const objectManager = new ObjectManager();
const inputManager = new InputManager();
const assetLoader = new AssetLoader();

// 2. 创建 ThreeViewer
const viewer = new ThreeViewer({
  objectManager,
  inputManager,
  assetLoader
});

// 3. 初始化
viewer.init(document.getElementById('container'));

// 4. 创建几何体
const box = objectManager.createPrimitive('box', {
  width: 1,
  height: 2,
  depth: 1
});
objectManager.addObject(box);

// 5. 加载模型
const gltf = await assetLoader.load('/models/Horse.glb');
objectManager.addObject(gltf.scene);

// 6. 监听事件
objectManager.emitter.on('add-object', ({ object }) => {
  console.log('对象已添加:', object);
});
```

### 7.2 场景保存与加载

```javascript
// 导出场景
const sceneData = viewer.exportScene();
localStorage.setItem('my-scene', JSON.stringify(sceneData));

// 加载场景
const savedData = JSON.parse(localStorage.getItem('my-scene'));
await viewer.loadScene(savedData);
```

---

## 8. 测试要点

### 8.1 单元测试

- [ ] ThreeViewer 初始化
- [ ] 场景加载与导出
- [ ] 几何体创建（所有类型）
- [ ] 对象添加与移除
- [ ] 射线检测（锁定/未锁定）
- [ ] 事件触发与监听
- [ ] 控制器切换
- [ ] 后处理 Pass 管理

### 8.2 集成测试

- [ ] 完整场景加载与恢复
- [ ] 动画播放驱动
- [ ] 后处理效果链路
- [ ] 复制粘贴流程
- [ ] 选择系统联动

### 8.3 性能测试

- [ ] 1000 对象场景 FPS
- [ ] 内存泄漏检测
- [ ] 长时间运行稳定性
- [ ] 大模型加载性能

---

## 相关文档

- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)
- [API 清单](../API.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始模块规格文档 |
