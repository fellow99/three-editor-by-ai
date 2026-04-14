# 003-Transform 对象变换模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 技术上下文

### 1.1 模块定位

对象变换模块基于 Vue 3 Composition API 和 Three.js TransformControls 实现，提供完整的对象变换、撤销/重做、吸附对齐功能。

### 1.2 技术约束

- 必须使用 Three.js r182+ 的 TransformControls
- 必须基于 Vue 3 Composition API 实现响应式状态
- 必须与 useObjectManager、useObjectSelection 协同工作
- 必须支持多选批量变换

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 状态管理 | Vue 3 reactive/ref | 响应式更新，与 UI 组件无缝集成 |
| 变换控制 | TransformControls | Three.js 官方控件，功能完整 |
| 历史栈 | 数组实现 | 简单高效，支持 O(1) 栈操作 |
| 事件通信 | mitt 事件总线 | 与项目整体架构一致 |

---

## 2. useTransform 技术设计

### 2.1 模块结构

```javascript
// src/composables/useTransform.js
import { reactive, ref } from 'vue';
import { useObjectManager } from './useObjectManager.js';
import { useObjectSelection } from './useObjectSelection.js';

const MAX_HISTORY = 50;

export function useTransform() {
  // 历史栈
  const undoStack = reactive([]);
  const redoStack = reactive([]);
  
  // 吸附配置
  const snapConfig = reactive({
    gridEnabled: false,
    gridSize: 1.0,
    rotationEnabled: false,
    rotationStep: Math.PI / 12,  // 15度
    scaleEnabled: false,
    scaleStep: 0.1
  });
  
  // 轴约束
  const axisLock = reactive({
    x: false,
    y: false,
    z: false
  });
  
  // 坐标空间
  const coordinateSpace = ref('world');  // 'world' | 'local'
  
  // 变换前状态缓存
  let beforeState = null;
  
  // ... 方法实现
}
```

### 2.2 撤销/重做实现

#### 2.2.1 状态捕获

```javascript
function captureObjectState(objects) {
  return objects.map(obj => ({
    uuid: obj.uuid,
    position: {
      x: obj.position.x,
      y: obj.position.y,
      z: obj.position.z
    },
    rotation: {
      x: obj.rotation.x,
      y: obj.rotation.y,
      z: obj.rotation.z,
      order: obj.rotation.order
    },
    scale: {
      x: obj.scale.x,
      y: obj.scale.y,
      z: obj.scale.z
    }
  }));
}
```

#### 2.2.2 变换开始

```javascript
function startTransform() {
  const selection = useObjectSelection();
  const selectedObjects = selection.getSelectedObjects();
  
  if (selectedObjects.length === 0) return;
  
  // 捕获变换前状态
  beforeState = captureObjectState(selectedObjects);
  
  // 触发事件
  selection.emitter.emit('transform-start', { objects: selectedObjects });
}
```

#### 2.2.3 变换结束

```javascript
function endTransform() {
  if (!beforeState) return;
  
  const selection = useObjectSelection();
  const selectedObjects = selection.getSelectedObjects();
  const afterState = captureObjectState(selectedObjects);
  
  // 检查是否有实际变化
  const hasChanges = beforeState.some((before, index) => {
    const after = afterState[index];
    return (
      before.position.x !== after.position.x ||
      before.position.y !== after.position.y ||
      before.position.z !== after.position.z ||
      before.rotation.x !== after.rotation.x ||
      before.rotation.y !== after.rotation.y ||
      before.rotation.z !== after.rotation.z ||
      before.scale.x !== after.scale.x ||
      before.scale.y !== after.scale.y ||
      before.scale.z !== after.scale.z
    );
  });
  
  if (!hasChanges) {
    beforeState = null;
    return;
  }
  
  // 生成操作记录
  const record = {
    objects: beforeState.map((before, index) => ({
      uuid: before.uuid,
      before,
      after: afterState[index]
    })),
    timestamp: Date.now()
  };
  
  // 推入撤销栈
  undoStack.push(record);
  
  // 限制历史栈大小
  if (undoStack.length > MAX_HISTORY) {
    undoStack.shift();
  }
  
  // 清空重做栈
  redoStack.length = 0;
  
  beforeState = null;
  
  // 触发事件
  selection.emitter.emit('transform-end', { objects: selectedObjects });
}
```

#### 2.2.4 撤销操作

```javascript
function undo() {
  if (undoStack.length === 0) return false;
  
  const record = undoStack.pop();
  const objectManager = useObjectManager();
  
  // 恢复变换前状态
  record.objects.forEach(objRecord => {
    const obj = objectManager.getObjectByUuid(objRecord.uuid);
    if (!obj) return;
    
    obj.position.set(
      objRecord.before.position.x,
      objRecord.before.position.y,
      objRecord.before.position.z
    );
    obj.rotation.set(
      objRecord.before.rotation.x,
      objRecord.before.rotation.y,
      objRecord.before.rotation.z
    );
    obj.scale.set(
      objRecord.before.scale.x,
      objRecord.before.scale.y,
      objRecord.before.scale.z
    );
    
    // 触发变换更新事件
    objectManager.emitter.emit('object-transform-updated', { object: obj });
  });
  
  // 推入重做栈
  redoStack.push(record);
  
  // 触发事件
  objectManager.emitter.emit('transform-undo', { record });
  
  return true;
}
```

#### 2.2.5 重做操作

```javascript
function redo() {
  if (redoStack.length === 0) return false;
  
  const record = redoStack.pop();
  const objectManager = useObjectManager();
  
  // 恢复变换后状态
  record.objects.forEach(objRecord => {
    const obj = objectManager.getObjectByUuid(objRecord.uuid);
    if (!obj) return;
    
    obj.position.set(
      objRecord.after.position.x,
      objRecord.after.position.y,
      objRecord.after.position.z
    );
    obj.rotation.set(
      objRecord.after.rotation.x,
      objRecord.after.rotation.y,
      objRecord.after.rotation.z
    );
    obj.scale.set(
      objRecord.after.scale.x,
      objRecord.after.scale.y,
      objRecord.after.scale.z
    );
    
    objectManager.emitter.emit('object-transform-updated', { object: obj });
  });
  
  // 推回撤销栈
  undoStack.push(record);
  
  objectManager.emitter.emit('transform-redo', { record });
  
  return true;
}
```

---

### 2.3 吸附算法实现

#### 2.3.1 网格吸附

```javascript
function snapToGrid(value) {
  if (!snapConfig.gridEnabled) return value;
  return Math.round(value / snapConfig.gridSize) * snapConfig.gridSize;
}

function applySnapToPosition(position) {
  return {
    x: snapToGrid(position.x),
    y: snapToGrid(position.y),
    z: snapToGrid(position.z)
  };
}
```

#### 2.3.2 旋转吸附

```javascript
function snapToRotation(value) {
  if (!snapConfig.rotationEnabled) return value;
  return Math.round(value / snapConfig.rotationStep) * snapConfig.rotationStep;
}

function applySnapToRotation(rotation) {
  return {
    x: snapToRotation(rotation.x),
    y: snapToRotation(rotation.y),
    z: snapToRotation(rotation.z)
  };
}
```

#### 2.3.3 缩放吸附

```javascript
function snapToScale(value) {
  if (!snapConfig.scaleEnabled) return value;
  return Math.round(value / snapConfig.scaleStep) * snapConfig.scaleStep;
}

function applySnapToScale(scale) {
  return {
    x: snapToScale(scale.x),
    y: snapToScale(scale.y),
    z: snapToScale(scale.z)
  };
}
```

---

### 2.4 轴约束实现

```javascript
function applyAxisLock(position, rotation, scale) {
  const axesState = useAxesLockState();
  
  // 位置锁定
  if (axisLock.x) position.x = 0;  // 相对增量为0
  if (axisLock.y) position.y = 0;
  if (axisLock.z) position.z = 0;
  
  // Y 轴专用锁定（固定绝对值）
  if (axesState.locked) {
    position.y = axesState.yValue - originalY;  // 恢复到锁定值
  }
  
  // 旋转锁定
  if (axisLock.x) rotation.x = 0;
  if (axisLock.y) rotation.y = 0;
  if (axisLock.z) rotation.z = 0;
  
  // 缩放锁定
  if (axisLock.x) scale.x = 1;  // 相对缩放为1（无变化）
  if (axisLock.y) scale.y = 1;
  if (axisLock.z) scale.z = 1;
  
  return { position, rotation, scale };
}
```

---

## 3. useObjectSelection 技术设计

### 3.1 模块结构

```javascript
// src/composables/useObjectSelection.js
import { ref, reactive } from 'vue';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { BoxHelper } from 'three';
import { useAxesLockState } from './useAxesLockState.js';
import { useThreeViewer } from './useThreeViewer.js';
import { useControls } from './useControls.js';
import { useInputManager } from './useInputManager.js';

export function useObjectSelection() {
  // 选中对象集合
  const selectedObjects = reactive(new Set());
  
  // 辅助显示对象
  const currentHelpers = reactive(new Map());
  
  // 临时材质存储
  const selectionStore = reactive({});
  
  // TransformControls 实例
  let transformControls = null;
  
  // 变换模式
  const transformMode = ref('translate');  // 'translate' | 'rotate' | 'scale'
  
  // ... 方法实现
}
```

### 3.2 TransformControls 集成

#### 3.2.1 初始化

```javascript
function initTransformControls(renderer, camera) {
  transformControls = new TransformControls(camera, renderer.domElement);
  
  // 拖拽开始时禁用 OrbitControls
  transformControls.addEventListener('dragging-changed', (event) => {
    const controls = useControls();
    controls.orbitControls.enabled = !event.value;
  });
  
  // 拖拽开始
  transformControls.addEventListener('mouseDown', () => {
    const transform = useTransform();
    transform.startTransform();
  });
  
  // 拖拽结束
  transformControls.addEventListener('mouseUp', () => {
    const transform = useTransform();
    transform.endTransform();
  });
  
  // 变换过程中应用吸附
  transformControls.addEventListener('change', () => {
    applySnapAndLock();
  });
  
  return transformControls;
}
```

#### 3.2.2 附加对象

```javascript
function attachToObject(object) {
  if (!transformControls) return;
  
  // 分离当前对象
  transformControls.detach();
  
  // 附加新对象
  transformControls.attach(object);
  
  // 设置变换模式
  transformControls.setMode(transformMode.value);
  
  // 设置坐标空间
  transformControls.setSpace(coordinateSpace.value);
}
```

#### 3.2.3 多选处理

```javascript
function attachToMultipleObjects() {
  if (selectedObjects.size === 0) {
    transformControls.detach();
    return;
  }
  
  // 选择第一个对象作为主控对象
  const primaryObject = Array.from(selectedObjects)[0];
  attachToObject(primaryObject);
  
  // 为其他对象创建辅助显示
  selectedObjects.forEach(obj => {
    if (obj !== primaryObject) {
      createHelper(obj);
    }
  });
}
```

---

### 3.3 辅助显示管理

#### 3.3.1 类型专属辅助

```javascript
function createHelper(object) {
  let helper;
  
  switch (object.type) {
    case 'DirectionalLight':
    case 'PointLight':
    case 'SpotLight':
      // 灯光辅助
      helper = new THREE.DirectionalLightHelper(object, 1);
      break;
      
    case 'PerspectiveCamera':
    case 'OrthographicCamera':
      // 相机辅助
      helper = new THREE.CameraHelper(object);
      break;
      
    default:
      // 默认包围盒
      helper = new BoxHelper(object, 0xffff00);
      break;
  }
  
  if (helper) {
    currentHelpers.set(object.uuid, helper);
    useThreeViewer().scene.add(helper);
  }
}
```

#### 3.3.2 清理辅助

```javascript
function disposeHelpers() {
  currentHelpers.forEach((helper, uuid) => {
    helper.dispose();
    useThreeViewer().scene.remove(helper);
  });
  currentHelpers.clear();
}
```

---

### 3.4 选择管理

#### 3.4.1 选择对象

```javascript
function selectObject(object) {
  // 检查是否锁定
  if (object.userData.locked === true) return;
  
  // 清除之前的选择
  deselectAll();
  
  // 添加新选择
  selectedObjects.add(object);
  
  // 高亮材质
  highlightObject(object, true);
  
  // 附加 TransformControls
  attachToObject(object);
  
  // 创建辅助显示
  createHelper(object);
}
```

#### 3.4.2 多选切换

```javascript
function toggleSelect(object) {
  if (object.userData.locked === true) return;
  
  if (selectedObjects.has(object)) {
    deselectObject(object);
  } else {
    selectedObjects.add(object);
    highlightObject(object, true);
    selectionStore[object.id] = object.material;
  }
  
  // 更新 TransformControls
  attachToMultipleObjects();
}
```

#### 3.4.3 高亮处理

```javascript
function highlightObject(object, highlight) {
  if (highlight) {
    // 保存原始材质
    selectionStore[object.id] = object.material;
    
    // 应用高亮材质
    object.material = object.material.clone();
    object.material.emissive = new THREE.Color(0x333333);
  } else {
    // 恢复原始材质
    if (selectionStore[object.id]) {
      object.material.dispose();
      object.material = selectionStore[object.id];
      delete selectionStore[object.id];
    }
  }
}
```

---

## 4. useAxesLockState 技术设计

### 4.1 模块实现

```javascript
// src/composables/useAxesLockState.js
import { reactive } from 'vue';

const state = reactive({
  locked: false,
  yValue: 0
});

export function useAxesLockState() {
  function lock(yValue) {
    state.locked = true;
    state.yValue = yValue;
  }
  
  function unlock() {
    state.locked = false;
    state.yValue = 0;
  }
  
  return {
    state,
    lock,
    unlock
  };
}
```

---

## 5. TransformPropertyPane 技术设计

### 5.1 组件结构

```vue
<!-- src/components/property/TransformPropertyPane.vue -->
<template>
  <div class="transform-property-pane">
    <!-- 位置 -->
    <div class="property-group">
      <h4>位置</h4>
      <div class="axis-inputs">
        <el-input-number v-model="position.x" :precision="3" :step="0.1" @change="onPositionChange" />
        <el-input-number v-model="position.y" :precision="3" :step="0.1" @change="onPositionChange" />
        <el-input-number v-model="position.z" :precision="3" :step="0.1" @change="onPositionChange" />
      </div>
    </div>
    
    <!-- 旋转 -->
    <div class="property-group">
      <h4>旋转</h4>
      <div class="axis-inputs">
        <el-input-number v-model="rotation.x" :precision="3" :step="0.1" @change="onRotationChange" />
        <el-input-number v-model="rotation.y" :precision="3" :step="0.1" @change="onRotationChange" />
        <el-input-number v-model="rotation.z" :precision="3" :step="0.1" @change="onRotationChange" />
      </div>
    </div>
    
    <!-- 缩放 -->
    <div class="property-group">
      <h4>缩放</h4>
      <div class="axis-inputs">
        <el-input-number v-model="scale.x" :precision="3" :step="0.1" @change="onScaleChange" />
        <el-input-number v-model="scale.y" :precision="3" :step="0.1" @change="onScaleChange" />
        <el-input-number v-model="scale.z" :precision="3" :step="0.1" @change="onScaleChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useObjectSelection } from '@/composables/useObjectSelection.js';

const position = ref({ x: 0, y: 0, z: 0 });
const rotation = ref({ x: 0, y: 0, z: 0 });
const scale = ref({ x: 1, y: 1, z: 1 });

const selection = useObjectSelection();

function updateFromSelected() {
  const objects = selection.getSelectedObjects();
  if (objects.length === 0) return;
  
  const obj = Array.from(objects)[0];
  position.value = { x: obj.position.x, y: obj.position.y, z: obj.position.z };
  rotation.value = { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z };
  scale.value = { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z };
}

function onPositionChange() {
  const objects = selection.getSelectedObjects();
  objects.forEach(obj => {
    obj.position.set(position.value.x, position.value.y, position.value.z);
  });
}

function onRotationChange() {
  const objects = selection.getSelectedObjects();
  objects.forEach(obj => {
    obj.rotation.set(rotation.value.x, rotation.value.y, rotation.value.z);
  });
}

function onScaleChange() {
  const objects = selection.getSelectedObjects();
  objects.forEach(obj => {
    obj.scale.set(scale.value.x, scale.value.y, scale.value.z);
  });
}

// 监听选择变化
onMounted(() => {
  selection.emitter.on('selection-changed', updateFromSelected);
  selection.emitter.on('transform-end', updateFromSelected);
});

onUnmounted(() => {
  selection.emitter.off('selection-changed', updateFromSelected);
  selection.emitter.off('transform-end', updateFromSelected);
});
</script>
```

---

## 6. 多选变换处理

### 6.1 批量状态捕获

```javascript
function captureBatchState(objects) {
  return objects.map(obj => ({
    uuid: obj.uuid,
    position: obj.position.clone(),
    rotation: {
      x: obj.rotation.x,
      y: obj.rotation.y,
      z: obj.rotation.z,
      order: obj.rotation.order
    },
    scale: obj.scale.clone()
  }));
}
```

### 6.2 批量状态恢复

```javascript
function restoreBatchState(stateArray) {
  const objectManager = useObjectManager();
  
  stateArray.forEach(record => {
    const obj = objectManager.getObjectByUuid(record.uuid);
    if (!obj) return;
    
    obj.position.copy(record.position);
    obj.rotation.set(record.rotation.x, record.rotation.y, record.rotation.z);
    obj.scale.copy(record.scale);
    
    objectManager.emitter.emit('object-transform-updated', { object: obj });
  });
}
```

---

## 7. 性能优化

### 7.1 历史栈优化

```javascript
// 使用固定大小数组避免内存增长
function pushToUndoStack(record) {
  if (undoStack.length >= MAX_HISTORY) {
    undoStack.shift();  // 移除最旧记录
  }
  undoStack.push(record);
}
```

### 7.2 状态对比优化

```javascript
// 使用阈值避免浮点误差导致的误判
const EPSILON = 0.0001;

function isTransformChanged(before, after) {
  return (
    Math.abs(before.position.x - after.position.x) > EPSILON ||
    Math.abs(before.position.y - after.position.y) > EPSILON ||
    Math.abs(before.position.z - after.position.z) > EPSILON ||
    Math.abs(before.rotation.x - after.rotation.x) > EPSILON ||
    Math.abs(before.rotation.y - after.rotation.y) > EPSILON ||
    Math.abs(before.rotation.z - after.rotation.z) > EPSILON ||
    Math.abs(before.scale.x - after.scale.x) > EPSILON ||
    Math.abs(before.scale.y - after.scale.y) > EPSILON ||
    Math.abs(before.scale.z - after.scale.z) > EPSILON
  );
}
```

---

## 8. 错误处理

### 8.1 空选择保护

```javascript
function startTransform() {
  const selectedObjects = useObjectSelection().getSelectedObjects();
  
  if (selectedObjects.length === 0) {
    console.warn('No objects selected for transform');
    return;
  }
  
  beforeState = captureObjectState(selectedObjects);
}
```

### 8.2 对象不存在处理

```javascript
function undo() {
  const record = undoStack.pop();
  
  record.objects.forEach(objRecord => {
    const obj = objectManager.getObjectByUuid(objRecord.uuid);
    if (!obj) {
      console.warn(`Object not found for undo: ${objRecord.uuid}`);
      return;
    }
    // ... 恢复状态
  });
}
```

---

## 9. 测试策略

### 9.1 单元测试

```javascript
describe('useTransform', () => {
  test('undo/redo 基本流程', () => {
    const transform = useTransform();
    
    // 模拟变换
    transform.startTransform();
    // ... 修改对象
    transform.endTransform();
    
    // 撤销
    expect(transform.canUndo()).toBe(true);
    transform.undo();
    expect(transform.canUndo()).toBe(false);
    
    // 重做
    expect(transform.canRedo()).toBe(true);
    transform.redo();
    expect(transform.canRedo()).toBe(false);
  });
  
  test('历史栈容量限制', () => {
    const transform = useTransform();
    
    // 执行超过 MAX_HISTORY 次变换
    for (let i = 0; i < 60; i++) {
      transform.startTransform();
      transform.endTransform();
    }
    
    expect(transform.undoStack.length).toBe(50);
  });
  
  test('网格吸附计算', () => {
    const transform = useTransform();
    transform.setSnapGrid(0.5);
    
    expect(snapToGrid(0.3)).toBe(0.5);
    expect(snapToGrid(0.7)).toBe(0.5);
    expect(snapToGrid(1.2)).toBe(1.0);
  });
});
```

### 9.2 集成测试

```javascript
describe('TransformControls 集成', () => {
  test('拖拽时 OrbitControls 禁用', async () => {
    const selection = useObjectSelection();
    const controls = useControls();
    
    // 模拟拖拽开始
    transformControls.dispatchEvent({ type: 'dragging-changed', value: true });
    expect(controls.orbitControls.enabled).toBe(false);
    
    // 模拟拖拽结束
    transformControls.dispatchEvent({ type: 'dragging-changed', value: false });
    expect(controls.orbitControls.enabled).toBe(true);
  });
  
  test('多选变换同步', () => {
    const transform = useTransform();
    const selection = useObjectSelection();
    
    // 选择多个对象
    selection.selectObject(obj1);
    selection.toggleSelect(obj2);
    
    // 变换
    transform.startTransform();
    // ... 拖拽
    transform.endTransform();
    
    // 验证两个对象都被记录
    const record = transform.undoStack[transform.undoStack.length - 1];
    expect(record.objects).toHaveLength(2);
  });
});
```

---

## 10. 依赖关系

### 10.1 NPM 依赖

```json
{
  "dependencies": {
    "three": "^0.182.0",
    "vue": "^3.5.17"
  }
}
```

### 10.2 内部依赖

```
useTransform → useObjectManager
useTransform → useObjectSelection
useObjectSelection → useAxesLockState
useObjectSelection → useThreeViewer
useObjectSelection → useControls
useObjectSelection → useInputManager
TransformPropertyPane → useObjectSelection
TransformPropertyPane → useTransform
```

---

## 相关文档

- [模块规格](./spec.md)
- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)
- [001-Core 核心引擎模块](../001-core/plan.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始技术方案 |
