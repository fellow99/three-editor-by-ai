# Three Editor by AI - 架构设计

**生成日期**: 2026-04-07  
**项目版本**: 0.1.0

---

## 架构概述

本项目采用**分层架构**和**模块化设计**，基于 Vue 3 Composition API 实现关注点分离。整体架构遵循"UI - 逻辑 - 引擎 - 服务"四层分离原则。

---

## 架构分层

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

---

## 核心模块

### 1. UI Layer (用户界面层)

**职责**: 用户界面展示和交互处理

**主要组件**:

#### Editor.vue - 主编辑器
- 集成所有子组件
- 协调各模块工作
- 处理全局事件

#### 编辑器面板组件 (components/editor/)
- `Toolbar.vue` - 工具栏
- `PropertyPanel.vue` - 属性面板
- `Inspector.vue` - 对象检查器
- `AssetBrowser.vue` - 资源浏览器
- `ResourcePanel.vue` - 资源面板
- `VfsFileBrowser.vue` - VFS 文件浏览器
- `EditorFooter.vue` - 底部状态栏

#### 属性编辑组件 (components/property/)
- `TransformPropertyPane.vue` - 变换属性
- `MaterialPropertyPane.vue` - 材质属性
- `AnimationPropertyPane.vue` - 动画属性
- `UserDataPropertyPane.vue` - userData 属性
- 各种几何体和灯光的专属属性面板

#### 对话框组件 (components/dialog/)
- `EditorConfigDialog.vue` - 编辑器配置
- `VfsFileChooserDialog.vue` - 文件选择
- `VfsFileSaverDialog.vue` - 文件保存
- `VfsMaterialChooserDialog.vue` - 材质选择

#### 场景组件 (components/scene/)
- `SceneViewer.vue` - 3D 场景视图
- `ViewportControls.vue` - 视图控制
- `CubeViewportControls.vue` - 立方体视角
- `InteractionHints.vue` - 操作提示

---

### 2. Logic Layer (逻辑层 / Composables)

**职责**: 业务逻辑封装和状态管理

**设计原则**:
- 每个 composable 函数封装单一业务领域
- 使用 Vue 3 响应式 API 管理状态
- 提供清晰的输入输出接口

#### 核心 Composables

| 函数 | 职责 | 关键功能 |
|------|------|----------|
| `useThreeViewer` | Three.js 场景管理 | 场景初始化、渲染循环、相机控制 |
| `useObjectSelection` | 对象选择与变换 | 选择管理、TransformControls、辅助显示 |
| `useTransform` | 变换操作 | 移动/旋转/缩放、撤销重做、Y 轴锁定 |
| `useAssetsManager` | 资源管理 | 资源加载、缓存、资源库管理 |
| `useMaterial` | 材质管理 | 材质创建、编辑、材质库 |
| `useControls` | 控制器管理 | Orbit/Map/Fly 控制器切换 |
| `useCameraPosState` | 相机位置状态 | 预设视角、相机位置管理 |
| `useInspectorHandler` | 检查器处理 | 对象信息检查 |
| `useEditorConfig` | 编辑器配置 | 配置状态管理 |
| `useEventBus` | 事件总线 | 全局事件分发 |
| `useInputManager` | 输入管理 | 键盘/鼠标输入处理 |
| `useHelpers` | 辅助对象 | 辅助线、辅助面等 |
| `useStats` | 性能统计 | FPS、内存等统计 |
| `useAxesLockState` | Y 轴锁定 | 变换轴锁定状态 |
| `useNavigationsState` | 漫游列表 | 漫游路径管理 |

**状态流向**:
```
Component → Composable → Core Manager → Three.js
     ↑           ↑            ↑
     └───────────┴────────────┘
         Event Bus (mitt)
```

---

### 3. Engine Layer (引擎层 / Core)

**职责**: Three.js 核心逻辑封装

#### ThreeViewer.js - 场景管理器
**职责**: Three.js 场景、相机、渲染器管理

**核心功能**:
- 场景初始化和配置
- 渲染循环管理
- 相机控制和预设
- 场景序列化/反序列化
- 对象查找和过滤
- 动画系统驱动

**关键方法**:
```javascript
class ThreeViewer {
  init(container)           // 初始化
  render()                  // 渲染循环
  loadScene(json)           // 加载场景
  exportScene()             // 导出场景
  findObjectsByUserData()   // 按 userData 查找
  driveAnimations()         // 驱动所有动画
}
```

**事件**:
- `scene-loaded` - 场景加载完成
- `object-added` - 对象添加
- `object-removed` - 对象移除

---

#### ObjectManager.js - 对象管理器
**职责**: 场景对象的生命周期管理

**核心功能**:
- 对象创建（几何体、灯光、模型）
- 对象添加/移除
- 对象变换
- 对象锁定/解锁
- 射线检测
- 动画状态管理

**关键方法**:
```javascript
class ObjectManager {
  createPrimitive(type, options)  // 创建几何体
  add(object)                      // 添加对象
  remove(object)                   // 移除对象
  getIntersectedObjects()          // 获取相交对象
  getUnlockedObjects()             // 获取未锁定对象
  exportObject(object)             // 导出对象
  importObject(json)               // 导入对象
}
```

**事件**:
- `object-added` - 对象添加
- `object-removed` - 对象移除
- `object-transform-updated` - 变换更新

---

#### InputManager.js - 输入管理器
**职责**: 用户输入处理（键盘、鼠标）

**核心功能**:
- 键盘事件监听
- 鼠标事件监听
- 快捷键处理
- 输入状态管理

**关键方法**:
```javascript
class InputManager {
  init()                  // 初始化
  dispose()               // 清理
  isKeyPressed(key)       // 检查按键状态
  registerShortcut()      // 注册快捷键
}
```

---

#### AssetLoader.js - 资源加载器
**职责**: 3D 资源和纹理加载

**核心功能**:
- GLTF/GLB 加载（支持 Draco 压缩）
- OBJ 加载
- FBX 加载
- 纹理加载（支持 KTX2）
- 加载进度管理
- 错误处理

**关键方法**:
```javascript
class AssetLoader {
  loadGLTF(url, onProgress)      // 加载 GLTF
  loadTexture(url, onProgress)   // 加载纹理
  loadOBJ(url, onProgress)       // 加载 OBJ
  loadFBX(url, onProgress)       // 加载 FBX
}
```

**事件**:
- `load-progress` - 加载进度
- `load-complete` - 加载完成
- `load-error` - 加载错误

---

### 4. Service Layer (服务层)

**职责**: 外部 API 封装和数据访问

#### VfsServerApi - 虚拟文件系统 API
**封装**: `src/services/vfs-server-api.js`

**功能**:
- 目录浏览
- 文件读写
- 文件上传
- 存在性检查

**API**:
```javascript
class VfsServerApi {
  list(path)           // 获取目录内容
  url(path)            // 获取文件 URL
  content(path)        // 获取文本内容
  json(path)           // 获取 JSON 内容
  blob(path)           // 获取 Blob 内容
  exists(path)         // 检查是否存在
  save(path, text)     // 保存文件
}
```

---

#### StaticDriveApi - 静态文件系统 API
**封装**: `src/services/static-drive-api.js`

**功能**:
- 静态资源访问
- 只读文件浏览
- 元数据读取

**API**:
```javascript
class StaticDriveApi {
  list(path)           // 获取目录元数据
  url(path)            // 获取文件 URL
  content(path)        // 获取文本内容
  json(path)           // 获取 JSON 内容
  blob(path)           // 获取 Blob 内容
  exists(path)         // 检查是否存在
}
```

---

### 5. Utilities Layer (工具层)

**职责**: 通用工具函数

#### mathUtils.js - 数学工具
- 向量运算
- 矩阵运算
- 四元数运算
- 数值格式化

#### geometryUtils.js - 几何工具
- 几何体创建
- 几何体转换
- 边界计算

#### fileUtils.js - 文件工具
- 文件类型判断
- 文件名处理
- 路径处理

---

## 数据流

### 对象添加流程

```
用户拖拽文件
    ↓
AssetBrowser.vue (检测拖拽)
    ↓
useAssetsManager.loadModel()
    ↓
AssetLoader.loadGLTF()
    ↓
ThreeViewer.scene.add()
    ↓
ObjectManager.add()
    ↓
分发 'object-added' 事件
    ↓
useObjectSelection 监听并更新
    ↓
Inspector 更新对象列表
```

### 对象变换流程

```
用户拖拽 TransformControls
    ↓
useObjectSelection (检测交互)
    ↓
TransformControls 更新对象 transform
    ↓
ObjectManager 分发 'object-transform-updated'
    ↓
useTransform.startTransform() (记录撤销点)
    ↓
useTransform.endTransform() (记录新状态)
    ↓
撤销/重做栈更新
```

### 场景保存流程

```
用户点击保存
    ↓
VfsFileSaverDialog 打开
    ↓
用户选择保存路径
    ↓
ThreeViewer.exportScene()
    ↓
ObjectManager 序列化所有对象
    ↓
VfsServerApi.save() 保存到 VFS
```

---

## 事件系统

### mitt 事件总线集成

**核心管理器事件**:

```javascript
// ThreeViewer.js
this.emitter = mitt();
this.emitter.on('scene-loaded', callback);
this.emitter.emit('scene-loaded', data);

// ObjectManager.js
this.emitter = mitt();
this.emitter.on('object-added', callback);
this.emitter.emit('object-added', object);

// InputManager.js
this.emitter = mitt();
this.emitter.on('key-pressed', callback);
this.emitter.emit('key-pressed', key);
```

**Composables 事件订阅**:

```javascript
// useObjectSelection.js
const threeViewer = useThreeViewer();
threeViewer.emitter.on('object-added', (object) => {
  // 处理对象添加
});
```

---

## 状态管理

### 响应式状态

**使用 Vue 3 Composition API**:

```javascript
// useObjectSelection.js
const selectedObjects = ref([]);
const currentHelpers = ref([]);
const selectionStore = reactive({});

// useTransform.js
const isTransforming = ref(false);
const transformMode = ref('translate');
const history = ref([]);
```

### 状态持久化

**序列化设计**:
- 场景对象：ThreeViewer.exportScene()
- userData: 完整序列化到 JSON
- 运行时对象：不序列化（如 _mixer, _activeAction）
- 动画索引：userData.animationIndex

---

## 模块依赖关系

```
┌────────────────────────────────────────────┐
│              Editor.vue                    │
│                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Compo-   │  │ Compo-   │  │ Compo-   │ │
│  │ nents    │  │ nents    │  │ nents    │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │             │        │
│  ┌────┴─────────────┴─────────────┴────┐  │
│  │         Composables Layer            │  │
│  └────┬─────────────┬─────────────┬────┘  │
│       │             │             │        │
│  ┌────┴─────────────┴─────────────┴────┐  │
│  │          Core Managers               │  │
│  └────┬─────────────┬─────────────┬────┘  │
│       │             │             │        │
│  ┌────┴─────────────┴─────────────┴────┐  │
│  │           Services                   │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

---

## 关键设计决策

### 1. Composition API vs Options API

**决策**: 使用 Composition API

**理由**:
- 更好的逻辑复用（composables）
- 更清晰的代码组织（按功能而非选项）
- 更好的 TypeScript 支持
- 更灵活的响应式状态管理

---

### 2. 状态管理方案

**决策**: 使用轻量级 composables + mitt，不使用 Pinia/Vuex

**理由**:
- 项目规模适中
- composables 提供足够的状态隔离
- mitt 用于跨模块事件解耦
- 避免引入重型状态管理库

---

### 3. 事件驱动架构

**决策**: 核心管理器集成 mitt 事件总线

**理由**:
- 模块间松耦合
- 易于扩展新监听器
- 避免循环依赖
- 清晰的事件流

---

### 4. 拖拽优先交互

**决策**: 所有资源添加统一为拖拽交互

**理由**:
- 更直观的用户体验
- 减少 UI 复杂度（移除点击添加）
- 统一的交互模式
- 符合现代应用交互习惯

---

### 5. 序列化设计

**决策**: userData 完整序列化，运行时对象分离

**理由**:
- userData 包含自定义属性，需持久化
- 运行时对象（_mixer 等）不序列化，避免污染
- 清晰的序列化边界
- 提升序列化/反序列化效率

---

## 性能考虑

### 渲染优化
- 使用 requestAnimationFrame
- 按需渲染（静态场景不重复渲染）
- TransformControls 拖拽时禁用 OrbitControls

### 内存优化
- 资源加载缓存机制
- 几何体/材质复用
- 及时清理不需要的对象

### 代码组织
- 模块化设计，职责清晰
- composables 提供逻辑复用
- 事件解耦，减少直接依赖

---

## 扩展性

### 新功能添加

1. **新 UI 组件**: 在 `components/` 下创建，通过 props/emits 与父组件通信
2. **新业务逻辑**: 创建新的 composable 函数，在 `composables/` 下管理
3. **新 Three.js 功能**: 在相应 Core Manager 中扩展方法
4. **新资源类型**: 在 AssetLoader 中添加加载器

### 插件化可能

当前架构支持以下扩展点：
- 后处理 Pass 动态添加
- 自定义几何体类型
- 自定义材质类型
- 自定义属性面板

---

## 相关文档

- [技术选型](./TECH.md)
- [API 清单](./API.md)
- [目录结构](./STRUCTURE.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-07 | 初始架构文档 |
