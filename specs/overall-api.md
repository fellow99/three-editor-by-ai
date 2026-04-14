# Three Editor by AI - 对外接口模型

**生成日期**: 2026-04-14  
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

#### GET /api/list/:drive

列出指定 drive 下的文件目录结构。

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| drive | string | 是 | 驱动器名称（如 vfs、static） |

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| path | string | 否 | 子目录路径，默认为根目录 |

**响应**:

```json
{
  "code": 0,
  "data": {
    "path": "/some/path",
    "files": [
      { "name": "file.glb", "type": "file", "size": 1024 }
    ],
    "folders": [
      { "name": "subdir", "type": "folder" }
    ]
  }
}
```

---

#### GET /file/:drive/*

获取指定文件内容。

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| drive | string | 是 | 驱动器名称 |
| * | string | 是 | 文件路径（通配符匹配剩余路径） |

**响应**: 文件二进制流或文本内容。

---

#### GET /exists/:drive/*

检查指定路径的文件或目录是否存在。

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| drive | string | 是 | 驱动器名称 |
| * | string | 是 | 文件或目录路径 |

**响应**:

```json
{
  "code": 0,
  "data": {
    "exists": true,
    "isFile": true,
    "isDirectory": false
  }
}
```

---

#### POST /save/:drive/*

保存文本内容到指定路径。

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| drive | string | 是 | 驱动器名称 |
| * | string | 是 | 文件保存路径 |

**请求体**:

```json
{
  "content": "文件文本内容"
}
```

**响应**:

```json
{
  "code": 0,
  "data": {
    "success": true,
    "path": "/saved/path/file.txt"
  }
}
```

---

#### POST /save-base64/:drive/*

保存 Base64 编码的内容到指定路径。

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| drive | string | 是 | 驱动器名称 |
| * | string | 是 | 文件保存路径 |

**请求体**:

```json
{
  "base64": "base64编码的字符串"
}
```

**响应**:

```json
{
  "code": 0,
  "data": {
    "success": true,
    "path": "/saved/path/file.bin"
  }
}
```

---

#### POST /upload/:drive/*

上传文件到指定路径。

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| drive | string | 是 | 驱动器名称 |
| * | string | 是 | 文件保存路径 |

**请求体**: `multipart/form-data`，包含 `file` 字段。

**响应**:

```json
{
  "code": 0,
  "data": {
    "success": true,
    "path": "/saved/path/uploaded.glb",
    "size": 2048576
  }
}
```

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
  addObject(obj: THREE.Object3D): void
  removeObject(obj: THREE.Object3D): void
  clearScene(): void

  // 控制器
  switchControls(type: string): void

  // 动画
  updateAllMixers(delta: number): void

  // 3DTiles
  add3DTiles(url: string): void

  // 对象查找
  findObjectsByUserData(key: string, value: any): THREE.Object3D[]
  getObjectByUuid(uuid: string): THREE.Object3D | null

  // 事件
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  emit(event: string, data?: any): void
}
```

#### 事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `before-render` | 每帧渲染前 | 无 |
| `before-add-object` | 对象添加前 | `{ object: THREE.Object3D }` |
| `add-object` | 对象添加后 | `{ object: THREE.Object3D }` |
| `remove-object` | 对象移除后 | `{ object: THREE.Object3D }` |
| `scene-loaded` | 场景加载完成 | `{ scene: THREE.Scene }` |

---

### ObjectManager API

**类**: `ObjectManager`  
**文件**: `src/core/ObjectManager.js`

#### 公共方法

```typescript
interface ObjectManager {
  // 对象创建
  createPrimitive(type: string, options?: object): THREE.Object3D

  // 对象管理
  addObject(obj: THREE.Object3D): void
  removeObject(uuid: string): void

  // 对象查询
  getObject(uuid: string): THREE.Object3D | null
  getAllObjects(): Map<string, THREE.Object3D>
  getUnlockedObjects(): THREE.Object3D[]
  getIntersectedObjects(raycaster: THREE.Raycaster): THREE.Object3D[]
  getIntersectedFirstObject(raycaster: THREE.Raycaster): THREE.Object3D | null

  // 选择管理
  selectObject(uuid: string): void
  deselectObject(uuid: string): void
  clearSelection(): void
  getSelectedObjects(): THREE.Object3D[]

  // 剪贴板操作
  copySelected(): void
  paste(): THREE.Object3D[]
  deleteSelected(): void

  // 事件
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  emit(event: string, data?: any): void
}
```

#### 事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `add-object` | 对象添加 | `{ object: THREE.Object3D }` |
| `remove-object` | 对象移除 | `{ uuid: string }` |
| `clear-objects` | 场景清空 | 无 |
| `object-transform-updated` | 变换更新 | `{ object: THREE.Object3D }` |
| `selection-changed` | 选择变化 | `{ selected: THREE.Object3D[] }` |

---

### InputManager API

**类**: `InputManager`  
**文件**: `src/core/InputManager.js`

#### 公共方法

```typescript
interface InputManager {
  // 初始化
  init(domElement: HTMLElement): void
  dispose(): void

  // 坐标获取
  getNormalizedCoords(): { x: number; y: number }

  // 事件
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  emit(event: string, data?: any): void
}
```

#### 事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `click` | 鼠标点击 | `{ event: MouseEvent; normalizedCoords: { x: number; y: number } }` |
| `dblclick` | 鼠标双击 | `{ event: MouseEvent }` |
| `drag-start` | 拖拽开始 | `{ event: MouseEvent }` |
| `drag` | 拖拽中 | `{ event: MouseEvent }` |
| `drag-end` | 拖拽结束 | `{ event: MouseEvent }` |
| `mouse-move` | 鼠标移动 | `{ event: MouseEvent }` |
| `mouse-down` | 鼠标按下 | `{ event: MouseEvent }` |
| `mouse-up` | 鼠标释放 | `{ event: MouseEvent }` |
| `keydown` | 按键按下 | `{ key: string; event: KeyboardEvent }` |
| `keyup` | 按键释放 | `{ key: string; event: KeyboardEvent }` |
| `wheel` | 滚轮滚动 | `{ delta: number; event: WheelEvent }` |

---

### AssetLoader API

**类**: `AssetLoader`  
**文件**: `src/core/AssetLoader.js`

#### 公共方法

```typescript
interface AssetLoader {
  // GLTF 加载
  loadGLTF(url: string): Promise<THREE.Group>

  // OBJ 加载
  loadOBJ(url: string): Promise<THREE.Group>

  // FBX 加载
  loadFBX(url: string): Promise<THREE.Group>

  // 纹理加载
  loadTexture(url: string): Promise<THREE.Texture>

  // 文件加载
  loadFromFile(file: File): Promise<THREE.Object3D>

  // 批量加载
  loadBatch(urls: string[]): Promise<THREE.Object3D[]>

  // 事件
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  emit(event: string, data?: any): void
}
```

#### 事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `loading-start` | 加载开始 | `{ url: string }` |
| `loading-progress` | 加载进度 | `{ url: string; loaded: number; total: number }` |
| `loading-complete` | 加载完成 | `{ url: string; object: THREE.Object3D }` |
| `loading-error` | 加载错误 | `{ url: string; error: Error }` |

---

## Composables API

### useThreeViewer

**文件**: `src/composables/useThreeViewer.js`

```typescript
function useThreeViewer(): {
  viewer: Ref<THREE.WebGLRenderer | null>
  init: (container: HTMLElement) => void
  dispose: () => void
}
```

---

### useObjectSelection

**文件**: `src/composables/useObjectSelection.js`

```typescript
function useObjectSelection(): {
  selectedObjects: Ref<THREE.Object3D[]>
  selectObject: (uuid: string) => void
  deselectObject: (uuid: string) => void
  clearSelection: () => void
}
```

---

### useTransform

**文件**: `src/composables/useTransform.js`

```typescript
function useTransform(): {
  undo: () => void
  redo: () => void
  canUndo: Ref<boolean>
  canRedo: Ref<boolean>
  startTransform: () => void
  endTransform: () => void
  snapSettings: Ref<{
    translate: number
    rotate: number
    scale: number
  }>
}
```

---

### useAssetsManager

**文件**: `src/composables/useAssetsManager.js`

```typescript
function useAssetsManager(): {
  assets: Reactive<Record<string, any>>
  loadModel: (url: string) => Promise<THREE.Group>
  loadTexture: (url: string) => Promise<THREE.Texture>
  getPreview: (url: string) => string | null
  clearCache: () => void
}
```

---

### useMaterial

**文件**: `src/composables/useMaterial.js`

```typescript
function useMaterial(): {
  updateMaterial: (material: THREE.Material, params: object) => void
  getMaterialState: () => Record<string, any>
  resetMaterial: () => void
}
```

---

### useCameraPosState

**文件**: `src/composables/useCameraPosState.js`

```typescript
function useCameraPosState(): {
  cameraState: Ref<{
    position: THREE.Vector3
    target: THREE.Vector3
    rotation: THREE.Euler
  }>
  zoomToPos: (pos: object) => void
  flyToPos: (pos: object) => void
  savePosition: (name: string) => void
  restorePosition: (name: string) => void
}
```

---

### useControls

**文件**: `src/composables/useControls.js`

```typescript
function useControls(): {
  currentType: Ref<string>
  switchControls: (type: string) => void
  lockControls: () => void
  unlockControls: () => void
}
```

---

### useEditorConfig

**文件**: `src/composables/useEditorConfig.js`

```typescript
function useEditorConfig(): {
  config: Ref<Record<string, any>>
  updateConfig: (key: string, value: any) => void
  resetConfig: () => void
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

  listFiles(path: string): Promise<object>
  getFile(path: string): Promise<string | Blob>
  exists(path: string): Promise<boolean>
  saveFile(path: string, content: string): Promise<boolean>
  saveBase64(path: string, base64: string): Promise<boolean>
  uploadFile(path: string, file: File): Promise<boolean>
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

  listFiles(path: string): Promise<object>
  getFileUrl(path: string): string
  exists(path: string): Promise<boolean>
}
```

---

### VfsService

**类**: `VfsService`  
**文件**: `src/services/vfs-service.js`

```typescript
class VfsService {
  // 统一 VFS 接口，内部封装 VfsServerApi 和 StaticDriveApi

  listFiles(drive: string, path: string): Promise<object>
  getFile(drive: string, path: string): Promise<string | Blob>
  exists(drive: string, path: string): Promise<boolean>
  saveFile(drive: string, path: string, content: string): Promise<boolean>
  saveBase64(drive: string, path: string, base64: string): Promise<boolean>
  uploadFile(drive: string, path: string, file: File): Promise<boolean>
}
```

---

## 事件总线接口

### mitt 事件定义

**类型定义**:

```typescript
interface Events {
  // ThreeViewer 事件
  'before-render': void
  'before-add-object': { object: THREE.Object3D }
  'add-object': { object: THREE.Object3D }
  'remove-object': { object: THREE.Object3D }
  'scene-loaded': { scene: THREE.Scene }

  // ObjectManager 事件
  'add-object': { object: THREE.Object3D }
  'remove-object': { uuid: string }
  'clear-objects': void
  'object-transform-updated': { object: THREE.Object3D }
  'selection-changed': { selected: THREE.Object3D[] }

  // InputManager 事件
  'click': { event: MouseEvent; normalizedCoords: { x: number; y: number } }
  'dblclick': { event: MouseEvent }
  'drag-start': { event: MouseEvent }
  'drag': { event: MouseEvent }
  'drag-end': { event: MouseEvent }
  'mouse-move': { event: MouseEvent }
  'mouse-down': { event: MouseEvent }
  'mouse-up': { event: MouseEvent }
  'keydown': { key: string; event: KeyboardEvent }
  'keyup': { key: string; event: KeyboardEvent }
  'wheel': { delta: number; event: WheelEvent }

  // AssetLoader 事件
  'loading-start': { url: string }
  'loading-progress': { url: string; loaded: number; total: number }
  'loading-complete': { url: string; object: THREE.Object3D }
  'loading-error': { url: string; error: Error }
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
| 1.0 | 2026-04-14 | 初始接口文档 |
