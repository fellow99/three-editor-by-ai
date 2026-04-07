# Three Editor by AI - 对外接口模型

**生成日期**: 2026-04-07  
**项目版本**: 0.1.0

---

## 概述

本文档定义项目对外的所有接口，包括 REST API、内部公共 API、事件接口等。

---

## REST API

### API 基础信息

**VFS Server**:
- 基础 URL: `http://localhost:3001` (开发环境)
- 协议：HTTP/1.1
- 数据格式：JSON
- 认证：无（当前）

### API 列表

详见 [API.md](./API.md)

---

## 内部公共 API

### ThreeViewer API

**类**: `ThreeViewer`  
**文件**: `src/core/ThreeViewer.js`

#### 公共方法

```typescript
interface ThreeViewer {
  // 初始化
  init(container: HTMLElement): void
  
  // 渲染
  render(): void
  
  // 场景管理
  loadScene(json: object): Promise<void>
  exportScene(): object
  addObject(object: THREE.Object3D): void
  removeObject(object: THREE.Object3D): void
  
  // 对象查找
  findObjectsByUserData(key: string, value: any): THREE.Object3D[]
  getObjectByUuid(uuid: string): THREE.Object3D | null
  
  // 动画
  driveAnimations(): void
  
  // 事件
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  emit(event: string, data?: any): void
}
```

#### 事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `scene-loaded` | 场景加载完成 | `{ scene: Scene }` |
| `object-added` | 对象添加 | `{ object: Object3D }` |
| `object-removed` | 对象移除 | `{ object: Object3D }` |

---

### ObjectManager API

**类**: `ObjectManager`  
**文件**: `src/core/ObjectManager.js`

#### 公共方法

```typescript
interface ObjectManager {
  // 对象创建
  createPrimitive(type: string, options: object): THREE.Object3D
  loadModel(url: string): Promise<THREE.Group>
  
  // 对象管理
  add(object: THREE.Object3D): void
  remove(object: THREE.Object3D): void
  
  // 对象查询
  getIntersectedObjects(raycaster: THREE.Raycaster): THREE.Object3D[]
  getIntersectedFirstObject(raycaster: THREE.Raycaster): THREE.Object3D | null
  getUnlockedObjects(): THREE.Object3D[]
  
  // 对象导出
  exportObject(object: THREE.Object3D): object
  importObject(json: object): THREE.Object3D
  
  // 事件
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  emit(event: string, data?: any): void
}
```

#### 事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `object-added` | 对象添加 | `{ object: Object3D }` |
| `object-removed` | 对象移除 | `{ object: Object3D }` |
| `object-transform-updated` | 变换更新 | `{ object: Object3D }` |

---

### AssetLoader API

**类**: `AssetLoader`  
**文件**: `src/core/AssetLoader.js`

#### 公共方法

```typescript
interface AssetLoader {
  // GLTF 加载
  loadGLTF(
    url: string,
    onProgress?: (progress: number) => void
  ): Promise<THREE.Group>
  
  // OBJ 加载
  loadOBJ(
    url: string,
    onProgress?: (progress: number) => void
  ): Promise<THREE.Group>
  
  // 纹理加载
  loadTexture(
    url: string,
    onProgress?: (progress: number) => void
  ): Promise<THREE.Texture>
  
  // 事件
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  emit(event: string, data?: any): void
}
```

#### 事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `load-progress` | 加载进度 | `{ url, progress }` |
| `load-complete` | 加载完成 | `{ url, object }` |
| `load-error` | 加载错误 | `{ url, error }` |

---

### InputManager API

**类**: `InputManager`  
**文件**: `src/core/InputManager.js`

#### 公共方法

```typescript
interface InputManager {
  // 初始化
  init(): void
  dispose(): void
  
  // 按键状态
  isKeyPressed(key: string): boolean
  
  // 快捷键
  registerShortcut(
    keys: string[],
    callback: () => void
  ): void
  
  // 事件
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  emit(event: string, data?: any): void
}
```

#### 事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `key-pressed` | 按键按下 | `{ key: string }` |
| `key-released` | 按键释放 | `{ key: string }` |
| `mouse-click` | 鼠标点击 | `{ x, y, button }` |

---

## Composables API

### useThreeViewer

**文件**: `src/composables/useThreeViewer.js`

```typescript
function useThreeViewer(): {
  scene: Ref<THREE.Scene>
  camera: Ref<THREE.Camera>
  renderer: Ref<THREE.WebGLRenderer>
  init: (container: HTMLElement) => void
  loadScene: (json: object) => Promise<void>
  exportScene: () => object
  addObject: (object: THREE.Object3D) => void
  removeObject: (object: THREE.Object3D) => void
}
```

---

### useObjectSelection

**文件**: `src/composables/useObjectSelection.js`

```typescript
function useObjectSelection(): {
  selectedObjects: Ref<THREE.Object3D[]>
  currentHelpers: Ref<THREE.Object3D[]>
  selectObject: (object: THREE.Object3D) => void
  deselectObject: (object: THREE.Object3D) => void
  deselectAll: () => void
  attachTransformControls: (object: THREE.Object3D) => void
  detachTransformControls: () => void
}
```

---

### useTransform

**文件**: `src/composables/useTransform.js`

```typescript
function useTransform(): {
  transformMode: Ref<string>
  isTransforming: Ref<boolean>
  setTransformMode: (mode: string) => void
  startTransform: () => void
  endTransform: () => void
  undo: () => void
  redo: () => void
}
```

---

### useAssetsManager

**文件**: `src/composables/useAssetsManager.js`

```typescript
function useAssetsManager(): {
  assetLibrary: Reactive<Record<string, any>>
  loadModel: (url: string) => Promise<THREE.Group>
  loadTexture: (url: string) => Promise<THREE.Texture>
  clearCache: () => void
}
```

---

### useMaterial

**文件**: `src/composables/useMaterial.js`

```typescript
function useMaterial(): {
  materialLibrary: Reactive<Record<string, THREE.Material>>
  createMaterial: (type: string, params: object) => THREE.Material
  updateMaterial: (material: THREE.Material, params: object) => void
  cloneMaterial: (material: THREE.Material) => THREE.Material
}
```

---

### useControls

**文件**: `src/composables/useControls.js`

```typescript
function useControls(): {
  currentControls: Ref<string>
  setControls: (type: string) => void
  enable: () => void
  disable: () => void
  update: () => void
}
```

---

## VFS Client API

### VfsServerApi

**类**: `VfsServerApi`  
**文件**: `src/services/vfs-server-api.js`

```typescript
class VfsServerApi {
  constructor(opt: {
    drive: string
    baseURL: string
    root: string
  })
  
  list(path: string): Promise<object>
  url(path: string): string
  content(path: string): Promise<string>
  json(path: string): Promise<object>
  blob(path: string): Promise<Blob>
  exists(path: string): Promise<boolean>
  save(path: string, text: string): Promise<boolean>
}
```

---

### StaticDriveApi

**类**: `StaticDriveApi`  
**文件**: `src/services/static-drive-api.js`

```typescript
class StaticDriveApi {
  constructor(opt: {
    drive: string
    baseURL: string
    root: string
  })
  
  list(path: string): Promise<object>
  url(path: string): string
  content(path: string): Promise<string>
  json(path: string): Promise<object>
  blob(path: string): Promise<Blob>
  exists(path: string): Promise<boolean>
}
```

---

## 事件总线接口

### mitt 事件定义

**类型定义**:

```typescript
interface Events {
  // ThreeViewer 事件
  'scene-loaded': { scene: THREE.Scene }
  'object-added': { object: THREE.Object3D }
  'object-removed': { object: THREE.Object3D }
  
  // ObjectManager 事件
  'object-transform-updated': { object: THREE.Object3D }
  
  // AssetLoader 事件
  'load-progress': { url: string; progress: number }
  'load-complete': { url: string; object: THREE.Object3D }
  'load-error': { url: string; error: Error }
  
  // InputManager 事件
  'key-pressed': { key: string }
  'key-released': { key: string }
  'mouse-click': { x: number; y: number; button: number }
}
```

**使用示例**:

```javascript
// 订阅事件
const threeViewer = useThreeViewer();
threeViewer.emitter.on('object-added', ({ object }) => {
  console.log('对象已添加:', object);
});

// 触发事件
threeViewer.emitter.emit('object-added', { object });

// 取消订阅
threeViewer.emitter.off('object-added', callback);
```

---

## 错误处理

### 错误格式

**REST API 错误**:
```json
{
  "code": 1,
  "msg": "错误描述",
  "error": "详细错误信息（仅开发环境）"
}
```

**前端错误**:
```javascript
try {
  // 操作
} catch (error) {
  // 日志记录
  console.error('操作失败:', error);
  
  // 用户提示
  ElMessage.error('操作失败：' + error.message);
  
  // 事件上报（未来）
  emitter.emit('error', { error, context: 'loadModel' });
}
```

---

## 版本兼容性

### API 版本策略

- REST API: URL 中不包含版本号（当前为 v1）
- 破坏性变更时升级主版本号
- 向后兼容的变更升级次版本号

### 序列化版本

```json
{
  "version": "1.0",
  "metadata": { ... }
}
```

- 主版本变更：格式不兼容
- 次版本变更：向后兼容

---

## 相关文档

- [API 清单](./API.md)
- [数据模型](./overall-data-model.md)
- [架构设计](./ARCHITECTURE.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-07 | 初始接口文档 |
