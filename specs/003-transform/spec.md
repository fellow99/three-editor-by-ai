# 003-Transform 对象变换模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07  
**最后更新**: 2026-04-07

---

## 1. 模块概述

### 1.1 模块定位

对象变换模块负责 3D 对象的移动、旋转、缩放操作，提供完整的变换控制系统，包括撤销/重做历史记录和 Y 轴锁定功能。

### 1.2 模块职责

- **变换操作**: 移动、旋转、缩放
- **变换控制器**: TransformControls 集成
- **对象选择**: 单选、多选、辅助显示
- **历史记录**: 撤销/重做系统
- **Y 轴锁定**: 限制 Y 轴变换
- **批量操作**: 多对象同时变换

### 1.3 核心价值

- 直观的变换交互
- 精确的数值控制
- 完整的撤销/重做
- 灵活的轴锁定

---

## 2. useTransform 组合式函数

### 2.1 组件概述

**函数名**: `useTransform`  
**文件**: `src/composables/useTransform.js`  
**大小**: 约 600 行  
**职责**: 变换操作管理，撤销/重做历史记录

### 2.2 核心状态

```javascript
const transformMode = ref('translate'); // 'translate' | 'rotate' | 'scale'
const isTransforming = ref(false);
const history = ref([]);
const historyIndex = ref(-1);
const maxHistoryLength = 50;
const yAxisLocked = ref(false);
```

---

### 2.3 核心功能

#### 2.3.1 变换模式切换

**设置变换模式**:
```javascript
function setTransformMode(mode) {
  if (!['translate', 'rotate', 'scale'].includes(mode)) {
    throw new Error('Invalid transform mode');
  }
  transformMode.value = mode;
  transformControls.setMode(mode);
}
```

**变换模式说明**:

| 模式 | 用途 | 快捷键 |
|------|------|--------|
| translate | 移动对象 | W |
| rotate | 旋转对象 | E |
| scale | 缩放对象 | R |

---

#### 2.3.2 变换开始/结束

**开始变换**:
```javascript
function startTransform() {
  if (isTransforming.value) return;
  
  isTransforming.value = true;
  
  // 记录变换前状态（用于撤销）
  const beforeState = selectedObjects.value.map(obj => ({
    uuid: obj.uuid,
    position: obj.position.clone(),
    rotation: obj.rotation.clone(),
    scale: obj.scale.clone()
  }));
  
  historyState.before = beforeState;
}
```

**结束变换**:
```javascript
function endTransform() {
  if (!isTransforming.value) return;
  
  isTransforming.value = false;
  
  // 记录变换后状态
  const afterState = selectedObjects.value.map(obj => ({
    uuid: obj.uuid,
    position: obj.position.clone(),
    rotation: obj.rotation.clone(),
    scale: obj.scale.clone()
  }));
  
  // 添加到历史记录
  addToHistory({
    before: historyState.before,
    after: afterState,
    timestamp: Date.now()
  });
  
  // 分发事件
  objectManager.emit('object-transform-updated', {
    objects: selectedObjects.value
  });
}
```

---

#### 2.3.3 撤销/重做系统

**撤销**:
```javascript
function undo() {
  if (historyIndex.value < 0) return;
  
  const state = history.value[historyIndex.value];
  
  // 恢复到变换前状态
  state.before.forEach(item => {
    const obj = scene.getObjectByUuid(item.uuid);
    if (obj) {
      obj.position.copy(item.position);
      obj.rotation.copy(item.rotation);
      obj.scale.copy(item.scale);
    }
  });
  
  historyIndex.value--;
}
```

**重做**:
```javascript
function redo() {
  if (historyIndex.value >= history.value.length - 1) return;
  
  historyIndex.value++;
  const state = history.value[historyIndex.value];
  
  // 恢复到变换后状态
  state.after.forEach(item => {
    const obj = scene.getObjectByUuid(item.uuid);
    if (obj) {
      obj.position.copy(item.position);
      obj.rotation.copy(item.rotation);
      obj.scale.copy(item.scale);
    }
  });
}
```

**添加到历史记录**:
```javascript
function addToHistory(transform) {
  // 如果当前不是历史记录末尾，删除后面的记录
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1);
  }
  
  // 添加新记录
  history.value.push(transform);
  historyIndex.value++;
  
  // 限制历史记录长度
  if (history.value.length > maxHistoryLength) {
    history.value.shift();
    historyIndex.value--;
  }
}
```

---

#### 2.3.4 Y 轴锁定

**启用 Y 轴锁定**:
```javascript
function lockYAxis(lock) {
  yAxisLocked.value = lock;
  transformControls.setYAxisLock(lock);
}
```

**Y 轴锁定效果**:
- 移动模式：仅允许 XZ 平面移动
- 旋转模式：仅允许 XZ 轴旋转
- 缩放模式：仅允许 XZ 轴缩放

**使用场景**:
- 建筑建模（保持楼层高度）
- 地形编辑（保持海拔）
- 角色放置（保持站立）

---

## 3. useObjectSelection 组合式函数

### 3.1 组件概述

**函数名**: `useObjectSelection`  
**文件**: `src/composables/useObjectSelection.js`  
**大小**: 约 700 行  
**职责**: 对象选择、TransformControls 管理、选中对象辅助显示

### 3.2 核心状态

```javascript
const selectedObjects = ref([]);
const currentHelpers = ref([]);
const selectionStore = reactive({}); // 临时材质信息
const transformControls = ref(null);
```

---

### 3.3 核心功能

#### 3.3.1 对象选择

**选择单个对象**:
```javascript
function selectObject(object) {
  // 清除之前的选择
  deselectAll();
  
  // 添加新选择
  selectedObjects.value.push(object);
  
  // 创建辅助对象
  const helper = createSelectionHelper(object);
  currentHelpers.value.push(helper);
  
  // 附加 TransformControls
  attachTransformControls(object);
  
  // 存储临时材质信息
  selectionStore[object.id] = {
    originalMaterial: object.material.clone()
  };
  
  // 高亮显示
  highlightObject(object);
}
```

**多选支持**:
```javascript
function toggleSelectObject(object) {
  const index = selectedObjects.value.findIndex(
    obj => obj.uuid === object.uuid
  );
  
  if (index >= 0) {
    // 取消选择
    deselectObject(object);
  } else {
    // 添加选择
    selectedObjects.value.push(object);
    const helper = createSelectionHelper(object);
    currentHelpers.value.push(helper);
    selectionStore[object.id] = {
      originalMaterial: object.material.clone()
    };
    highlightObject(object);
  }
}
```

**取消选择**:
```javascript
function deselectObject(object) {
  const index = selectedObjects.value.findIndex(
    obj => obj.uuid === object.uuid
  );
  
  if (index < 0) return;
  
  // 移除选择
  selectedObjects.value.splice(index, 1);
  
  // 移除辅助对象
  const helper = currentHelpers.value[index];
  if (helper) {
    scene.remove(helper);
    currentHelpers.value.splice(index, 1);
  }
  
  // 恢复原始材质
  const store = selectionStore[object.id];
  if (store && store.originalMaterial) {
    object.material.dispose();
    object.material = store.originalMaterial;
    delete selectionStore[object.id];
  }
}
```

**取消所有选择**:
```javascript
function deselectAll() {
  // 复制数组避免遍历时修改
  const objects = [...selectedObjects.value];
  objects.forEach(obj => deselectObject(obj));
}
```

---

#### 3.3.2 TransformControls 集成

**初始化**:
```javascript
function initTransformControls(camera, renderer) {
  transformControls.value = new TransformControls(
    camera,
    renderer.domElement
  );
  
  // 拖拽开始时禁用 OrbitControls
  transformControls.value.addEventListener('dragging-changed', (event) => {
    orbitControls.enabled = !event.value;
  });
  
  // 变换开始
  transformControls.value.addEventListener('mouseDown', () => {
    startTransform();
  });
  
  // 变换结束
  transformControls.value.addEventListener('mouseUp', () => {
    endTransform();
  });
  
  scene.add(transformControls.value);
}
```

**附加到对象**:
```javascript
function attachTransformControls(object) {
  if (!transformControls.value) return;
  transformControls.value.attach(object);
}
```

**分离**:
```javascript
function detachTransformControls() {
  if (!transformControls.value) return;
  transformControls.value.detach();
}
```

---

#### 3.3.3 选中对象辅助显示

**创建辅助对象**:
```javascript
function createSelectionHelper(object) {
  // 创建包围盒辅助线
  const box = new THREE.Box3().setFromObject(object);
  const helper = new THREE.Box3Helper(box, 0xffff00);
  scene.add(helper);
  return helper;
}
```

**高亮显示**:
```javascript
function highlightObject(object) {
  if (Array.isArray(object.material)) {
    object.material.forEach(mat => {
      mat.emissive = new THREE.Color(0x333333);
    });
  } else {
    object.material.emissive = new THREE.Color(0x333333);
  }
}
```

**恢复原始材质**:
```javascript
function restoreObjectMaterial(object) {
  const store = selectionStore[object.id];
  if (!store) return;
  
  if (Array.isArray(object.material)) {
    object.material.forEach((mat, i) => {
      if (store.originalMaterials && store.originalMaterials[i]) {
        mat.emissive = store.originalMaterials[i].emissive;
      }
    });
  } else {
    object.material.emissive = store.originalMaterial.emissive;
  }
}
```

---

#### 3.3.4 射线检测选择

**鼠标点击选择**:
```javascript
function handleMouseClick(event) {
  // 转换鼠标坐标
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // 创建射线
  raycaster.setFromCamera(mouse, camera);
  
  // 获取相交对象（仅未锁定）
  const intersects = objectManager.getIntersectedObjects(raycaster);
  
  if (intersects.length > 0) {
    // 选择第一个相交对象
    const object = intersects[0].object;
    
    if (event.shiftKey) {
      // 多选
      toggleSelectObject(object);
    } else {
      // 单选
      selectObject(object);
    }
  } else {
    // 点击空白处取消选择
    deselectAll();
  }
}
```

---

### 3.4 API 接口

#### useTransform 公共方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setTransformMode(mode)` | mode: string | void | 设置变换模式 |
| `startTransform()` | - | void | 开始变换 |
| `endTransform()` | - | void | 结束变换 |
| `undo()` | - | void | 撤销 |
| `redo()` | - | void | 重做 |
| `lockYAxis(lock)` | lock: boolean | void | Y 轴锁定 |
| `clearHistory()` | - | void | 清空历史 |

#### useObjectSelection 公共方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `selectObject(object)` | object: Object3D | void | 选择对象 |
| `deselectObject(object)` | object: Object3D | void | 取消选择 |
| `deselectAll()` | - | void | 取消所有选择 |
| `toggleSelectObject(object)` | object: Object3D | void | 切换选择 |
| `attachTransformControls(object)` | object: Object3D | void | 附加控制器 |
| `detachTransformControls()` | - | void | 分离控制器 |
| `getSelectedObjects()` | - | Object3D[] | 获取选中对象 |

---

### 3.5 事件系统

#### 触发的事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `selection-changed` | 选择变化 | `{ objects: Object3D[] }` |
| `transform-started` | 变换开始 | `{ objects: Object3D[] }` |
| `transform-ended` | 变换结束 | `{ objects: Object3D[] }` |
| `transform-updated` | 变换更新 | `{ object: Object3D }` |
| `undo-performed` | 撤销执行 | `{ state: HistoryState }` |
| `redo-performed` | 重做执行 | `{ state: HistoryState }` |

---

## 4. 撤销/重做数据结构

### 4.1 历史记录项

```javascript
interface HistoryItem {
  before: TransformedState[];  // 变换前状态
  after: TransformedState[];   // 变换后状态
  timestamp: number;            // 时间戳
  type: 'transform' | 'add' | 'remove'; // 操作类型
}

interface TransformedState {
  uuid: string;        // 对象 UUID
  position: Vector3;   // 位置
  rotation: Euler;     // 旋转
  scale: Vector3;      // 缩放
}
```

### 4.2 历史记录管理

**最大历史记录数**: 50  
**内存优化**: 超出限制时自动删除最早记录  
**性能考虑**: 仅存储变换数据，不存储完整对象

---

## 5. 性能优化

### 5.1 已实现优化

1. **辅助对象复用**
   - 避免重复创建/销毁
   - 缓存辅助对象实例

2. **材质克隆优化**
   - 仅克隆必要属性
   - 及时释放不需要的材质

3. **历史记录限制**
   - 限制最大历史记录数（50）
   - 自动清理过期记录

### 5.2 性能指标

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| 撤销响应时间 | < 50ms | 待测试 |
| 辅助对象数量 | < 100 | 待测试 |
| 历史记录内存 | < 10MB | 待测试 |

---

## 6. 使用示例

### 6.1 基本变换操作

```javascript
import { useTransform } from './composables/useTransform.js';
import { useObjectSelection } from './composables/useObjectSelection.js';

const { setTransformMode, undo, redo, lockYAxis } = useTransform();
const { selectObject, deselectAll } = useObjectSelection();

// 切换到移动模式
setTransformMode('translate');

// 选择对象
selectObject(mesh);

// 启用 Y 轴锁定
lockYAxis(true);

// 用户拖拽变换...

// 撤销
undo();

// 重做
redo();
```

### 6.2 多选变换

```javascript
const { toggleSelectObject } = useObjectSelection();

// 多选对象
toggleSelectObject(mesh1);
toggleSelectObject(mesh2);
toggleSelectObject(mesh3);

// 所有选中对象将同时变换
```

### 6.3 快捷键绑定

```javascript
import { useInputManager } from './composables/useInputManager.js';

const { registerShortcut } = useInputManager();
const { undo, redo, setTransformMode } = useTransform();

// 注册快捷键
registerShortcut(['Control', 'KeyZ'], () => undo());
registerShortcut(['Control', 'KeyY'], () => redo());
registerShortcut(['KeyW'], () => setTransformMode('translate'));
registerShortcut(['KeyE'], () => setTransformMode('rotate'));
registerShortcut(['KeyR'], () => setTransformMode('scale'));
```

---

## 7. 测试要点

### 7.1 单元测试

- [ ] 变换模式切换
- [ ] 对象选择/取消选择
- [ ] 多选功能
- [ ] 撤销功能
- [ ] 重做功能
- [ ] Y 轴锁定
- [ ] TransformControls 附加/分离

### 7.2 集成测试

- [ ] 完整变换流程
- [ ] 撤销/重做链
- [ ] 多选变换
- [ ] 射线检测选择

### 7.3 性能测试

- [ ] 大量对象选择
- [ ] 长历史记录链
- [ ] 内存泄漏检测

---

## 相关文档

- [架构设计](../ARCHITECTURE.md)
- [核心引擎模块](../001-core/spec.md)
- [数据模型](../overall-data-model.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-07 | 初始模块规格文档 |
