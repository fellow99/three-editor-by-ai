# 003-Transform 对象变换模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 技术上下文

### 1.1 模块定位

对象变换模块负责所有 3D 对象的移动、旋转、缩放操作，以及撤销/重做历史记录管理。

### 1.2 技术约束

- 必须使用 TransformControls
- 必须实现完整的撤销/重做
- 必须支持 Y 轴锁定
- 必须支持多选变换

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 历史记录 | 状态快照 | 简单可靠 |
| 最大历史数 | 50 | 平衡内存和功能 |
| 辅助显示 | Box3Helper | 轻量直观 |

---

## 2. 撤销/重做实现

### 2.1 历史记录数据结构

```javascript
interface HistoryItem {
  before: TransformedState[];  // 变换前状态
  after: TransformedState[];   // 变换后状态
  timestamp: number;            // 时间戳
  type: 'transform' | 'add' | 'remove' | 'duplicate';
}

interface TransformedState {
  uuid: string;        // 对象 UUID
  position: { x, y, z };
  rotation: { x, y, z, order };
  scale: { x, y, z };
}
```

### 2.2 历史记录管理

```javascript
const history = ref([]);
const historyIndex = ref(-1);
const maxHistoryLength = 50;

function addToHistory(transform) {
  // 如果当前不是历史记录末尾，删除后面的记录
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1);
  }
  
  // 添加新记录
  history.value.push({
    ...transform,
    timestamp: Date.now()
  });
  historyIndex.value++;
  
  // 限制历史记录长度
  if (history.value.length > maxHistoryLength) {
    history.value.shift();
    historyIndex.value--;
  }
  
  // 触发事件
  emitter.emit('history-changed', {
    canUndo: historyIndex.value >= 0,
    canRedo: historyIndex.value < history.value.length - 1
  });
}

function clearHistory() {
  history.value = [];
  historyIndex.value = -1;
  emitter.emit('history-changed', {
    canUndo: false,
    canRedo: false
  });
}
```

### 2.3 撤销实现

```javascript
function undo() {
  if (historyIndex.value < 0) {
    console.warn('没有可撤销的操作');
    return false;
  }
  
  const state = history.value[historyIndex.value];
  
  // 恢复到变换前状态
  state.before.forEach(item => {
    const obj = scene.getObjectByUuid(item.uuid);
    if (obj) {
      // 保存当前状态用于下一次重做
      obj.position.copy(item.position);
      obj.rotation.copy(item.rotation);
      obj.scale.copy(item.scale);
    }
  });
  
  historyIndex.value--;
  
  // 触发事件
  emitter.emit('undo-performed', { state });
  emitter.emit('history-changed', {
    canUndo: historyIndex.value >= 0,
    canRedo: historyIndex.value < history.value.length - 1
  });
  
  return true;
}
```

### 2.4 重做实现

```javascript
function redo() {
  if (historyIndex.value >= history.value.length - 1) {
    console.warn('没有可重做的操作');
    return false;
  }
  
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
  
  // 触发事件
  emitter.emit('redo-performed', { state });
  emitter.emit('history-changed', {
    canUndo: historyIndex.value >= 0,
    canRedo: historyIndex.value < history.value.length - 1
  });
  
  return true;
}
```

---

## 3. TransformControls 集成

### 3.1 初始化

```javascript
function initTransformControls(camera, renderer) {
  const controls = new TransformControls(camera, renderer.domElement);
  
  // 拖拽开始时禁用 OrbitControls
  controls.addEventListener('dragging-changed', (event) => {
    if (orbitControls) {
      orbitControls.enabled = !event.value;
    }
  });
  
  // 变换开始 - 记录撤销点
  controls.addEventListener('mouseDown', () => {
    startTransform();
  });
  
  // 变换结束 - 记录到历史
  controls.addEventListener('mouseUp', () => {
    endTransform();
  });
  
  // 变换中 - 实时更新
  controls.addEventListener('change', () => {
    onTransformChange();
  });
  
  scene.add(controls);
  return controls;
}
```

### 3.2 变换开始/结束

```javascript
let historyState = {
  before: null,
  objects: []
};

function startTransform() {
  if (isTransforming.value) return;
  
  isTransforming.value = true;
  
  // 记录变换前状态
  historyState.before = selectedObjects.value.map(obj => ({
    uuid: obj.uuid,
    position: obj.position.clone(),
    rotation: obj.rotation.clone(),
    scale: obj.scale.clone()
  }));
  historyState.objects = [...selectedObjects.value];
  
  // 触发事件
  emitter.emit('transform-started', {
    objects: selectedObjects.value
  });
}

function endTransform() {
  if (!isTransforming.value) return;
  
  isTransforming.value = false;
  
  // 记录变换后状态
  const after = historyState.objects.map(obj => ({
    uuid: obj.uuid,
    position: obj.position.clone(),
    rotation: obj.rotation.clone(),
    scale: obj.scale.clone()
  }));
  
  // 检查是否有实际变化
  const hasChanged = after.some((item, i) => {
    const before = historyState.before[i];
    return !item.position.equals(before.position) ||
           !item.rotation.equals(before.rotation) ||
           !item.scale.equals(before.scale);
  });
  
  if (hasChanged) {
    // 添加到历史记录
    addToHistory({
      before: historyState.before,
      after,
      type: 'transform'
    });
  }
  
  // 触发事件
  emitter.emit('transform-ended', {
    objects: historyState.objects
  });
  
  // 重置状态
  historyState = { before: null, objects: [] };
}
```

---

## 4. Y 轴锁定实现

### 4.1 锁定状态管理

```javascript
const yAxisLocked = ref(false);

function lockYAxis(lock) {
  yAxisLocked.value = lock;
  
  if (transformControls.value) {
    transformControls.value.setYAxisLock(lock);
  }
  
  emitter.emit('y-axis-lock-changed', { locked: lock });
}
```

### 4.2 TransformControls Y 轴锁定

```javascript
// TransformControls 扩展
class TransformControlsYLock extends TransformControls {
  setYAxisLock(locked) {
    this.yAxisLock = locked;
    
    if (locked) {
      // 禁用 Y 轴变换
      this.showY = false;
      
      // 根据模式锁定相应轴
      switch (this.getMode()) {
        case 'translate':
          this.translationSnap = null;
          break;
        case 'rotate':
          this.rotationSnap = null;
          break;
        case 'scale':
          this.scaleSnap = null;
          break;
      }
    } else {
      this.showY = true;
    }
  }
}
```

---

## 5. 多选变换

### 5.1 多选状态管理

```javascript
const selectedObjects = ref([]);

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
    createSelectionHelper(object);
  }
}

function deselectAll() {
  const objects = [...selectedObjects.value];
  objects.forEach(obj => deselectObject(obj));
}
```

### 5.2 多选变换

```javascript
function attachTransformControls(object) {
  if (!transformControls.value) return;
  
  if (selectedObjects.value.length === 1) {
    // 单选 - 附加到对象
    transformControls.value.attach(object);
  } else if (selectedObjects.value.length > 1) {
    // 多选 - 创建临时组
    const group = new THREE.Group();
    
    // 计算包围盒中心
    const box = new THREE.Box3();
    selectedObjects.value.forEach(obj => {
      box.expandByObject(obj);
    });
    
    const center = box.getCenter(new THREE.Vector3());
    group.position.copy(center);
    scene.add(group);
    
    // 附加到组
    transformControls.value.attach(group);
    
    // 记录组与对象的关系
    multiSelectGroup = {
      group,
      objects: [...selectedObjects.value]
    };
  }
}

function onTransformChange() {
  if (multiSelectGroup) {
    // 多选变换 - 同步到所有对象
    const { group, objects } = multiSelectGroup;
    
    objects.forEach(obj => {
      // 应用相对变换
      // ... 变换逻辑
    });
  }
}
```

---

## 6. 辅助显示

### 6.1 选择辅助

```javascript
function createSelectionHelper(object) {
  // 创建包围盒
  const box = new THREE.Box3().setFromObject(object);
  
  // 创建辅助线
  const helper = new THREE.Box3Helper(box, 0xffff00);
  scene.add(helper);
  
  // 存储辅助对象
  currentHelpers.value.push({
    object,
    helper,
    type: 'selection'
  });
  
  return helper;
}

function removeSelectionHelpers() {
  currentHelpers.value.forEach(item => {
    scene.remove(item.helper);
    item.helper.dispose();
  });
  currentHelpers.value = [];
}
```

### 6.2 高亮显示

```javascript
const selectionStore = reactive({});

function highlightObject(object) {
  // 存储原始材质
  selectionStore[object.id] = {
    originalMaterial: object.material.clone()
  };
  
  // 应用高亮
  if (Array.isArray(object.material)) {
    object.material.forEach(mat => {
      mat.emissive = new THREE.Color(0x333333);
    });
  } else {
    object.material.emissive = new THREE.Color(0x333333);
  }
}

function restoreObjectMaterial(object) {
  const store = selectionStore[object.id];
  if (!store) return;
  
  // 恢复原始材质
  object.material.dispose();
  object.material = store.originalMaterial;
  
  delete selectionStore[object.id];
}
```

---

## 7. 快捷键绑定

```javascript
function setupShortcuts() {
  const { registerShortcut } = useInputManager();
  
  // 变换模式切换
  registerShortcut(['KeyW'], () => {
    setTransformMode('translate');
  });
  
  registerShortcut(['KeyE'], () => {
    setTransformMode('rotate');
  });
  
  registerShortcut(['KeyR'], () => {
    setTransformMode('scale');
  });
  
  // 撤销/重做
  registerShortcut(['Control', 'KeyZ'], () => {
    undo();
  });
  
  registerShortcut(['Control', 'KeyY'], () => {
    redo();
  });
  
  // Y 轴锁定
  registerShortcut(['KeyL'], () => {
    lockYAxis(!yAxisLocked.value);
  });
  
  // 取消选择
  registerShortcut(['Escape'], () => {
    deselectAll();
  });
}
```

---

## 8. 性能优化

### 8.1 历史记录优化

```javascript
// 合并连续的变换操作
let lastTransformTime = 0;
const MERGE_THRESHOLD = 100; // ms

function addToHistory(transform) {
  const now = Date.now();
  
  // 如果距离上次变换时间很短，合并记录
  if (now - lastTransformTime < MERGE_THRESHOLD) {
    const lastItem = history.value[historyIndex.value];
    if (lastItem && lastItem.type === 'transform') {
      // 合并到上一条记录
      lastItem.after = transform.after;
      lastItem.timestamp = now;
      lastTransformTime = now;
      return;
    }
  }
  
  // 添加新记录
  // ... 正常逻辑
  
  lastTransformTime = now;
}
```

### 8.2 辅助对象优化

```javascript
// 辅助对象池
const helperPool = [];

function getHelper() {
  if (helperPool.length > 0) {
    return helperPool.pop();
  }
  return new THREE.Box3Helper(new THREE.Box3(), 0xffff00);
}

function releaseHelper(helper) {
  helper.visible = false;
  helperPool.push(helper);
}
```

---

## 9. 错误处理

```javascript
function undo() {
  try {
    if (historyIndex.value < 0) {
      throw new Error('没有可撤销的操作');
    }
    
    // ... 撤销逻辑
    
  } catch (error) {
    console.error('撤销失败:', error);
    emitter.emit('transform-error', {
      type: 'undo',
      error
    });
    throw error;
  }
}

function attachTransformControls(object) {
  if (!object) {
    throw new Error('无效的对象');
  }
  
  if (!object.parent) {
    throw new Error('对象不在场景中');
  }
  
  // ... 附加逻辑
}
```

---

## 相关文档

- [模块规格](./spec.md)
- [核心引擎模块](../001-core/plan.md)

---

**版本**: 1.0 | **日期**: 2026-04-07
