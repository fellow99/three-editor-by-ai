# 001-Core 核心引擎模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07  
**最后更新**: 2026-04-07

---

## 1. 模块概述

### 1.1 模块定位

核心引擎模块是 Three Editor by AI 的心脏，负责 Three.js 场景的创建、管理、渲染和所有 3D 对象的生命周期管理。

### 1.2 模块职责

- **ThreeViewer**: Three.js 场景、渲染器、相机、控制器的统一管理
- **ObjectManager**: 3D 对象的创建、管理、变换操作
- **InputManager**: 键盘、鼠标输入处理
- **AssetLoader**: 3D 资源和纹理加载

### 1.3 核心价值

- 统一的 Three.js 封装，提供简洁的 API
- 事件驱动的模块间通信
- 完整的场景序列化和反序列化支持
- 高性能渲染和动画驱动

---

## 2. ThreeViewer 规格

### 2.1 组件概述

**类名**: `ThreeViewer`  
**文件**: `src/core/ThreeViewer.js`  
**大小**: 790 行  
**职责**: Three.js 场景、渲染器、相机、控制器、后处理的统一管理

### 2.2 核心功能

#### 2.2.1 场景初始化

**功能描述**: 创建 Three.js 场景、渲染器、相机

**输入**:
- `container`: HTMLElement - 渲染容器

**输出**:
- 初始化的 Three.js 环境

**处理流程**:
1. 创建 THREE.Scene 场景
2. 创建 THREE.PerspectiveCamera 相机
3. 创建 THREE.WebGLRenderer 渲染器
4. 设置渲染器尺寸和像素比
5. 将渲染器 DOM 添加到容器
6. 初始化轨道控制器
7. 初始化后处理合成器
8. 启动渲染循环

**代码示例**:
```javascript
const viewer = new ThreeViewer(options);
viewer.init(document.getElementById('container'));
```

---

#### 2.2.2 渲染循环

**功能描述**: 持续渲染场景，驱动动画更新

**机制**:
- 使用 `requestAnimationFrame` 实现流畅渲染
- 每帧更新所有 AnimationMixer
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

#### 2.2.3 相机控制

**支持的控制器**:
1. **OrbitControls** - 环绕观察（默认）
2. **MapControls** - 地图控制（平移 + 缩放）
3. **FlyControls** - 飞行控制（第一人称）

**切换方法**:
```javascript
viewer.setControls('orbit');   // 轨道控制
viewer.setControls('map');     // 地图控制
viewer.setControls('fly');     // 飞行控制
```

**预设视角**:
- 顶部、底部、前、后、左、右
- 等轴测视图
- 自定义视角保存

---

#### 2.2.4 场景加载与导出

**加载场景**:
```javascript
await viewer.loadScene(jsonData);
```

**导出场景**:
```javascript
const sceneData = viewer.exportScene();
```

**序列化内容**:
- ✅ 所有 3D 对象（Mesh、Group 等）
- ✅ 几何体数据和参数
- ✅ 材质数据和纹理引用
- ✅ 变换（位置、旋转、缩放）
- ✅ userData（自定义属性）
- ✅ 动画索引
- ❌ 运行时对象（_mixer、_activeAction 等）

---

#### 2.2.5 对象查找

**按 userData 查找**:
```javascript
// 支持多层 key，如 "foo.bar.baz"
const objects = viewer.findObjectsByUserData('animationIndex', 0);
```

**获取所有对象**:
```javascript
const allObjects = viewer.getObjects();
```

**按 UUID 查找**:
```javascript
const object = viewer.getObjectByUuid('uuid-string');
```

---

#### 2.2.6 后处理系统

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

### 2.3 API 接口

#### 公共方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init(container)` | container: HTMLElement | void | 初始化场景 |
| `render()` | - | void | 单帧渲染 |
| `loadScene(json)` | json: Object | Promise<void> | 加载场景 |
| `exportScene()` | - | Object | 导出场景 |
| `addObject(obj)` | obj: THREE.Object3D | void | 添加对象 |
| `removeObject(obj)` | obj: THREE.Object3D | void | 移除对象 |
| `getObjects()` | - | THREE.Object3D[] | 获取所有对象 |
| `getObjectByUuid(uuid)` | uuid: string | THREE.Object3D | 按 UUID 查找 |
| `findObjectsByUserData(key, value)` | key: string, value: any | THREE.Object3D[] | 按 userData 查找 |
| `setControls(type)` | type: string | void | 切换控制器 |
| `driveAnimations()` | - | void | 驱动所有动画 |
| `addPass(pass)` | pass: Pass | void | 添加后处理 Pass |
| `setPassEnabled(name, enabled)` | name: string, enabled: boolean | void | 启用/禁用 Pass |

---

### 2.4 事件系统

#### 触发的事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `scene-loaded` | 场景加载完成 | `{ scene: THREE.Scene }` |
| `object-added` | 对象添加 | `{ object: THREE.Object3D }` |
| `object-removed` | 对象移除 | `{ object: THREE.Object3D }` |
| `controls-changed` | 控制器切换 | `{ type: string }` |
| `render-started` | 渲染开始 | `{ timestamp: number }` |

#### 监听的事件

| 事件名 | 来源 | 响应动作 |
|--------|------|----------|
| `object-transform-updated` | ObjectManager | 标记需要重新渲染 |
| `scene-save-requested` | UI 组件 | 触发现场景导出 |

---

### 2.5 性能优化

#### 已实现优化

1. **按需渲染**
   - 静态场景不重复渲染
   - 仅在变换、加载时触发渲染

2. **动画优化**
   - 仅更新有动画的对象
   - 使用 delta time 确保帧率独立

3. **内存管理**
   - 及时清理不需要的对象
   - 避免重复创建渲染器

#### 性能指标

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| 空场景 FPS | 60 | 60 |
| 1000 对象 FPS | > 30 | 待测试 |
| 渲染启动时间 | < 100ms | 待测试 |

---

## 3. ObjectManager 规格

### 3.1 组件概述

**类名**: `ObjectManager`  
**文件**: `src/core/ObjectManager.js`  
**大小**: 752 行  
**职责**: 3D 对象的创建、管理、变换、选择与批量操作

### 3.2 核心功能

#### 3.2.1 几何体创建

**支持的几何体类型**:
- Box（立方体）
- Sphere（球体）
- Cylinder（圆柱体）
- Cone（圆锥体）
- Plane（平面）
- Torus（圆环）
- TorusKnot（圆环结）
- Dodecahedron（十二面体）
- Icosahedron（二十面体）
- Octahedron（八面体）
- Tetrahedron（四面体）
- Ring（圆环）
- Tube（管状体）
- Circle（圆形）

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

#### 3.2.2 对象管理

**添加对象**:
```javascript
objectManager.add(object);
```

**移除对象**:
```javascript
objectManager.remove(object);
```

**对象锁定**:
```javascript
// 锁定对象（防止误操作）
object.userData.locked = true;

// 获取未锁定对象
const unlocked = objectManager.getUnlockedObjects();
```

**射线检测**:
```javascript
// 获取所有相交对象（仅未锁定）
const intersected = objectManager.getIntersectedObjects(raycaster);

// 获取第一个相交对象（仅未锁定）
const first = objectManager.getIntersectedFirstObject(raycaster);
```

---

#### 3.2.3 对象导出与导入

**导出对象**:
```javascript
const jsonData = objectManager.exportObject(object);
```

**导入对象**:
```javascript
const object = objectManager.importObject(jsonData);
```

**序列化字段**:
- ✅ uuid
- ✅ 类型（Mesh、Light 等）
- ✅ 几何体数据
- ✅ 材质数据
- ✅ 变换（position、rotation、scale）
- ✅ userData（不含运行时对象）
- ❌ _mixer、_activeAction 等运行时对象

---

#### 3.2.4 材质管理

**默认材质**:
```javascript
this.defaultMaterial = new THREE.MeshStandardMaterial({
  color: 0x888888,
  roughness: 0.4,
  metalness: 0.1
});
```

**材质缓存**:
```javascript
this.materialCache = new Map();
```

---

### 3.3 API 接口

#### 公共方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `createPrimitive(type, options)` | type: string, options: Object | THREE.Object3D | 创建几何体 |
| `add(object)` | object: THREE.Object3D | void | 添加对象 |
| `remove(object)` | object: THREE.Object3D | void | 移除对象 |
| `getObjects()` | - | THREE.Object3D[] | 获取所有对象 |
| `getUnlockedObjects()` | - | THREE.Object3D[] | 获取未锁定对象 |
| `getIntersectedObjects(raycaster)` | raycaster: THREE.Raycaster | THREE.Object3D[] | 获取相交对象 |
| `getIntersectedFirstObject(raycaster)` | raycaster: THREE.Raycaster | THREE.Object3D | 获取第一个相交对象 |
| `exportObject(object)` | object: THREE.Object3D | Object | 导出对象 |
| `importObject(json)` | json: Object | THREE.Object3D | 导入对象 |

---

### 3.4 事件系统

#### 触发的事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `object-added` | 对象添加 | `{ object: THREE.Object3D }` |
| `object-removed` | 对象移除 | `{ object: THREE.Object3D }` |
| `object-transform-updated` | 变换更新 | `{ object: THREE.Object3D }` |

---

## 4. InputManager 规格

### 4.1 组件概述

**类名**: `InputManager`  
**文件**: `src/core/InputManager.js`  
**大小**: 约 300 行  
**职责**: 键盘、鼠标输入处理，快捷键管理

### 4.2 核心功能

#### 4.2.1 键盘输入

**按键状态跟踪**:
```javascript
const isPressed = inputManager.isKeyPressed('KeyW');
```

**快捷键注册**:
```javascript
inputManager.registerShortcut(['Control', 'KeyS'], () => {
  // 保存场景
});
```

#### 4.2.2 鼠标输入

**鼠标事件监听**:
- click - 点击
- dblclick - 双击
- contextmenu - 右键菜单
- wheel - 滚轮

---

## 5. AssetLoader 规格

### 5.1 组件概述

**类名**: `AssetLoader`  
**文件**: `src/core/AssetLoader.js`  
**大小**: 约 400 行  
**职责**: 3D 资源和纹理加载

### 5.2 核心功能

#### 5.2.1 GLTF 加载

**支持格式**:
- .gltf
- .glb
- Draco 压缩
- KTX2 纹理
- Meshopt 压缩

**加载方法**:
```javascript
const gltf = await assetLoader.loadGLTF(url, (progress) => {
  console.log(`Loading: ${progress}%`);
});
```

#### 5.2.2 OBJ 加载

```javascript
const obj = await assetLoader.loadOBJ(url);
```

#### 5.2.3 纹理加载

**支持格式**:
- JPG
- PNG
- KTX2（压缩）

```javascript
const texture = await assetLoader.loadTexture(url);
```

---

### 5.3 事件系统

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `load-progress` | 加载进度 | `{ url, progress }` |
| `load-complete` | 加载完成 | `{ url, object }` |
| `load-error` | 加载错误 | `{ url, error }` |

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
objectManager.add(box);

// 5. 加载模型
const gltf = await assetLoader.loadGLTF('/models/Horse.glb');
objectManager.add(gltf.scene);

// 6. 监听事件
objectManager.on('object-added', ({ object }) => {
  console.log('对象已添加:', object);
});
```

---

## 8. 测试要点

### 8.1 单元测试

- [ ] ThreeViewer 初始化
- [ ] 场景加载与导出
- [ ] 几何体创建
- [ ] 对象添加与移除
- [ ] 射线检测
- [ ] 事件触发

### 8.2 集成测试

- [ ] 完整场景加载
- [ ] 动画播放
- [ ] 后处理效果
- [ ] 控制器切换

### 8.3 性能测试

- [ ] 1000 对象场景 FPS
- [ ] 内存泄漏检测
- [ ] 长时间运行稳定性

---

## 相关文档

- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)
- [API 清单](../API.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-07 | 初始模块规格文档 |
