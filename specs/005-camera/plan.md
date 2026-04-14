# 005-Camera 相机控制模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 技术上下文

### 1.1 模块定位

相机控制模块是 Three Editor by AI 的交互核心，负责所有相机相关的操作，包括控制器管理、状态捕获、预设视角、漫游路径和飞行控制。

### 1.2 技术约束

- 必须兼容 Three.js r182+ 的控制器 API
- 必须支持 Vue 3 Composition API 响应式状态
- 必须实现控制器热切换无闪烁
- 必须支持键盘事件与 InputManager 集成

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 相机动画 | 自定义缓动函数 | 轻量、可控、无额外依赖 |
| 状态序列化 | JSON 格式 | 便于存储和传输 |
| 控制器切换 | 销毁重建模式 | 简单可靠，避免状态污染 |
| 飞行控制 | 自定义 FlyControls | 满足项目特定需求，集成 InputManager |

---

## 2. useControls 技术设计

### 2.1 状态结构

```javascript
// 响应式状态
const currentControlType = ref('orbit');  // 当前控制器类型
const isLocked = ref(false);              // 控制器锁定状态
const controlsInstance = ref(null);       // 当前控制器实例
```

### 2.2 控制器切换实现

```javascript
async function switchControls(type) {
  if (isLocked.value) return;
  
  isLocked.value = true;
  
  try {
    // 1. 捕获当前相机状态
    const cameraState = captureCameraState();
    
    // 2. 销毁旧控制器
    if (controlsInstance.value) {
      controlsInstance.value.dispose();
      controlsInstance.value = null;
    }
    
    // 3. 创建新控制器
    const viewer = useThreeViewer();
    controlsInstance.value = createController(type, viewer.camera, viewer.renderer.domElement);
    
    // 4. 恢复相机状态
    restoreCameraState(cameraState);
    
    // 5. 强制同步（setTimeout 确保渲染帧完成）
    setTimeout(() => {
      controlsInstance.value.update();
      isLocked.value = false;
    }, 0);
    
    currentControlType.value = type;
    
    // 6. 触发事件
    viewer.emitter.emit('controls-changed', { type });
    
  } catch (error) {
    console.error('控制器切换失败:', error);
    isLocked.value = false;
    throw error;
  }
}
```

### 2.3 控制器工厂

```javascript
function createController(type, camera, domElement) {
  switch (type) {
    case 'orbit':
      return new OrbitControls(camera, domElement);
    case 'map':
      return new MapControls(camera, domElement);
    case 'fly':
      return new FlyControls(camera, domElement);
    default:
      throw new Error(`未知的控制器类型: ${type}`);
  }
}
```

### 2.4 配置驱动实例化

```javascript
// 从 editorConfig 读取默认配置
function initControlsFromConfig() {
  const config = useEditorConfig();
  const defaultType = config.controls?.defaultType || 'orbit';
  
  switchControls(defaultType);
  
  // 应用控制器特定配置
  if (config.controls?.orbit) {
    applyOrbitConfig(config.controls.orbit);
  }
  if (config.controls?.fly) {
    applyFlyConfig(config.controls.fly);
  }
}
```

---

## 3. useCameraPosState 技术设计

### 3.1 状态捕获实现

```javascript
function captureCameraState() {
  const viewer = useThreeViewer();
  const { camera, controls } = viewer;
  
  return {
    position: camera.position.clone(),
    rotation: camera.rotation.clone(),
    quaternion: camera.quaternion.clone(),
    sphericalCoords: getSphericalCoords(camera.position, controls.target),
    target: controls.target.clone()
  };
}

function getSphericalCoords(position, target) {
  const offset = new THREE.Vector3().subVectors(position, target);
  const spherical = new THREE.Spherical().setFromVector3(offset);
  
  return {
    radius: spherical.radius,
    phi: spherical.phi,      // 极角
    theta: spherical.theta   // 方位角
  };
}
```

### 3.2 瞬时跳转实现

```javascript
function zoomToPos(position, target) {
  const viewer = useThreeViewer();
  const { camera, controls } = viewer;
  
  // 设置相机位置
  camera.position.set(position.x, position.y, position.z);
  
  // 更新控制器目标
  if (controls.target) {
    controls.target.set(target.x, target.y, target.z);
  }
  
  // 强制更新
  camera.lookAt(target.x, target.y, target.z);
  controls.update();
}
```

### 3.3 平滑过渡动画算法

```javascript
function flyToPos(position, target, options = {}) {
  const viewer = useThreeViewer();
  const { camera, controls } = viewer;
  
  const {
    duration = 800,           // 动画时长（毫秒）
    easing = easeInOutCubic   // 缓动函数
  } = options;
  
  // 起始状态
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  
  // 目标状态
  const endPos = new THREE.Vector3(position.x, position.y, position.z);
  const endTarget = new THREE.Vector3(target.x, target.y, target.z);
  
  // 中断现有动画
  if (currentAnimation) {
    currentAnimation.cancel();
  }
  
  // 创建动画
  const startTime = performance.now();
  currentAnimation = {
    cancel: () => { isCancelled = true; },
    isCancelled: false
  };
  let isCancelled = false;
  
  function animate(currentTime) {
    if (isCancelled) return;
    
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    
    // 插值相机位置
    camera.position.lerpVectors(startPos, endPos, easedProgress);
    
    // 插值目标点
    controls.target.lerpVectors(startTarget, endTarget, easedProgress);
    controls.update();
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      currentAnimation = null;
    }
  }
  
  requestAnimationFrame(animate);
}

// 缓动函数
function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```

### 3.4 预设位置加载

```javascript
import DEFAULT_CAMERA_POS from '@/constants/DEFAULT_CAMERA_POS.json';

function loadPresetPosition(name) {
  const preset = DEFAULT_CAMERA_POS[name];
  if (!preset) {
    console.warn(`预设视角不存在: ${name}`);
    return;
  }
  
  flyToPos(preset.position, preset.target);
}

// DEFAULT_CAMERA_POS.json 格式
/*
{
  "top": {
    "position": { "x": 0, "y": 20, "z": 0 },
    "target": { "x": 0, "y": 0, "z": 0 }
  },
  "front": {
    "position": { "x": 0, "y": 0, "z": 20 },
    "target": { "x": 0, "y": 0, "z": 0 }
  },
  "isometric": {
    "position": { "x": 15, "y": 15, "z": 15 },
    "target": { "x": 0, "y": 0, "z": 0 }
  }
}
*/
```

### 3.5 自定义位置序列化

```javascript
const customPositions = ref({});

function saveCustomPosition(name) {
  const state = captureCameraState();
  customPositions.value[name] = {
    position: state.position,
    target: state.target,
    timestamp: Date.now()
  };
  
  // 持久化到 localStorage
  localStorage.setItem('customCameraPositions', JSON.stringify(customPositions.value));
}

function restoreCustomPosition(name) {
  const saved = customPositions.value[name];
  if (!saved) {
    console.warn(`自定义位置不存在: ${name}`);
    return;
  }
  
  flyToPos(saved.position, saved.target);
}

// 初始化时加载
function loadCustomPositions() {
  const saved = localStorage.getItem('customCameraPositions');
  if (saved) {
    customPositions.value = JSON.parse(saved);
  }
}
```

---

## 4. useNavigationsState 技术设计

### 4.1 数据结构

```javascript
// 漫游路径数据结构
const navigations = ref({
  // 路径名称 -> 视点列表
  'default': [
    {
      name: '入口视角',
      state: {
        position: { x, y, z },
        rotation: { x, y, z },
        target: { x, y, z }
      },
      timestamp: 1234567890
    }
  ]
});

const currentNavigation = ref('default');
```

### 4.2 视点保存实现

```javascript
function saveNavigation(name) {
  const cameraState = useCameraPosState().captureCameraState();
  
  const navigation = {
    name,
    state: {
      position: cameraState.position,
      rotation: cameraState.rotation,
      target: cameraState.target
    },
    timestamp: Date.now()
  };
  
  const path = navigations.value[currentNavigation.value];
  path.push(navigation);
  
  // 触发事件
  const viewer = useThreeViewer();
  viewer.emitter.emit('navigation-saved', { name, state: navigation.state });
}
```

### 4.3 视点恢复实现

```javascript
function restoreNavigation(name) {
  const path = navigations.value[currentNavigation.value];
  const navigation = path.find(n => n.name === name);
  
  if (!navigation) {
    console.warn(`漫游视点不存在: ${name}`);
    return;
  }
  
  const { flyToPos } = useCameraPosState();
  flyToPos(navigation.state.position, navigation.state.target);
  
  // 触发事件
  const viewer = useThreeViewer();
  viewer.emitter.emit('navigation-restored', { name });
}
```

---

## 5. FlyControls 技术设计

### 5.1 类结构

```javascript
class FlyControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    // 配置参数
    this.movementSpeed = 1.0;
    this.rollSpeed = 0.005;
    this.dragToLook = true;
    this.autoForward = false;
    
    // 内部状态
    this.moveState = {
      forward: 0,
      backward: 0,
      left: 0,
      right: 0,
      up: 0,
      down: 0
    };
    
    this.rotationState = {
      pitch: 0,  // 俯仰
      yaw: 0,    // 偏航
      roll: 0    // 滚动
    };
    
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };
    
    // 绑定 InputManager
    this.inputManager = useInputManager();
    this._bindEvents();
  }
}
```

### 5.2 键盘事件处理

```javascript
_bindEvents() {
  // 键盘按下
  this.inputManager.on('keydown', (event) => {
    const code = event.code;
    
    switch (code) {
      case 'KeyW': this.moveState.forward = 1; break;
      case 'KeyS': this.moveState.backward = 1; break;
      case 'KeyA': this.moveState.left = 1; break;
      case 'KeyD': this.moveState.right = 1; break;
      case 'KeyQ': this.moveState.down = 1; break;
      case 'KeyE': this.moveState.up = 1; break;
      case 'Space': this.moveState.up = 1; break;
      case 'KeyR': this.moveState.up = 1; break;
      case 'ArrowUp': this.rotationState.pitch = 1; break;
      case 'ArrowDown': this.rotationState.pitch = -1; break;
      case 'ArrowLeft': this.rotationState.yaw = 1; break;
      case 'ArrowRight': this.rotationState.yaw = -1; break;
    }
  });
  
  // 键盘释放
  this.inputManager.on('keyup', (event) => {
    const code = event.code;
    
    switch (code) {
      case 'KeyW': this.moveState.forward = 0; break;
      case 'KeyS': this.moveState.backward = 0; break;
      case 'KeyA': this.moveState.left = 0; break;
      case 'KeyD': this.moveState.right = 0; break;
      case 'KeyQ': this.moveState.down = 0; break;
      case 'KeyE': this.moveState.up = 0; break;
      case 'Space': this.moveState.up = 0; break;
      case 'KeyR': this.moveState.up = 0; break;
      case 'ArrowUp': this.rotationState.pitch = 0; break;
      case 'ArrowDown': this.rotationState.pitch = 0; break;
      case 'ArrowLeft': this.rotationState.yaw = 0; break;
      case 'ArrowRight': this.rotationState.yaw = 0; break;
    }
  });
  
  // 鼠标拖拽
  this.domElement.addEventListener('mousedown', (e) => {
    if (this.dragToLook) {
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    }
  });
  
  this.domElement.addEventListener('mousemove', (e) => {
    if (this.isDragging) {
      const deltaX = e.clientX - this.lastMouse.x;
      const deltaY = e.clientY - this.lastMouse.y;
      
      this.rotationState.yaw -= deltaX * this.rollSpeed;
      this.rotationState.pitch -= deltaY * this.rollSpeed;
      
      this.lastMouse = { x: e.clientX, y: e.clientY };
    }
  });
  
  this.domElement.addEventListener('mouseup', () => {
    this.isDragging = false;
  });
}
```

### 5.3 更新循环

```javascript
update(deltaTime) {
  if (!deltaTime) return;
  
  // 1. 应用旋转
  this._applyRotation(deltaTime);
  
  // 2. 应用移动
  this._applyMovement(deltaTime);
}

_applyRotation(deltaTime) {
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  euler.setFromQuaternion(this.camera.quaternion);
  
  // 俯仰旋转（限制范围）
  euler.x += this.rotationState.pitch * deltaTime * 2;
  euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
  
  // 偏航旋转
  euler.y += this.rotationState.yaw * deltaTime * 2;
  
  // 滚动旋转
  euler.z += this.rotationState.roll * deltaTime;
  
  this.camera.quaternion.setFromEuler(euler);
}

_applyMovement(deltaTime) {
  const speed = this.movementSpeed * deltaTime;
  
  // 计算移动方向
  const forward = new THREE.Vector3();
  this.camera.getWorldDirection(forward);
  forward.y = 0;  // 水平移动
  forward.normalize();
  
  const right = new THREE.Vector3();
  right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
  
  const up = new THREE.Vector3(0, 1, 0);
  
  // 合成移动向量
  const moveVector = new THREE.Vector3();
  
  moveVector.addScaledVector(forward, (this.moveState.forward - this.moveState.backward) * speed);
  moveVector.addScaledVector(right, (this.moveState.right - this.moveState.left) * speed);
  moveVector.addScaledVector(up, (this.moveState.up - this.moveState.down) * speed);
  
  // 应用移动
  this.camera.position.add(moveVector);
}
```

### 5.4 销毁方法

```javascript
dispose() {
  // 移除所有事件监听器
  this.inputManager.off('keydown');
  this.inputManager.off('keyup');
  
  this.domElement.removeEventListener('mousedown', this._onMouseDown);
  this.domElement.removeEventListener('mousemove', this._onMouseMove);
  this.domElement.removeEventListener('mouseup', this._onMouseUp);
}
```

---

## 6. UI 组件技术设计

### 6.1 ViewportControls.vue

```vue
<template>
  <div class="viewport-controls">
    <!-- 预设视角按钮 -->
    <div class="preset-buttons">
      <el-button
        v-for="preset in presets"
        :key="preset.name"
        size="small"
        @click="loadPreset(preset.name)"
      >
        {{ preset.label }}
      </el-button>
    </div>
    
    <!-- 控制器切换 -->
    <div class="control-switcher">
      <span>控制器:</span>
      <el-select v-model="currentType" @change="switchControls">
        <el-option label="Orbit" value="orbit" />
        <el-option label="Map" value="map" />
        <el-option label="Fly" value="fly" />
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { useControls } from '@/composables/useControls.js';
import { useCameraPosState } from '@/composables/useCameraPosState.js';

const { switchControls, currentControlType } = useControls();
const { loadPresetPosition } = useCameraPosState();

const currentType = currentControlType;

const presets = [
  { name: 'top', label: '顶' },
  { name: 'front', label: '前' },
  { name: 'right', label: '右' },
  { name: 'left', label: '左' },
  { name: 'back', label: '后' },
  { name: 'bottom', label: '底' }
];

function loadPreset(name) {
  loadPresetPosition(name);
}
</script>
```

### 6.2 CubeViewportControls.vue

```vue
<template>
  <div ref="container" class="cube-viewport"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ViewportGizmo } from 'three-viewport-gizmo';
import { useThreeViewer } from '@/composables/useThreeViewer.js';

const container = ref(null);
let gizmo = null;

onMounted(() => {
  const viewer = useThreeViewer();
  
  gizmo = new ViewportGizmo(viewer.camera, viewer.renderer, {
    container: container.value,
    placement: 'top-right',
    size: 120
  });
  
  gizmo.update();
});

onUnmounted(() => {
  if (gizmo) {
    gizmo.dispose();
  }
});
</script>
```

### 6.3 InteractionHints.vue

```vue
<template>
  <div class="interaction-hints">
    <div class="hint-title">
      {{ currentModeLabel }}
    </div>
    <div class="hint-divider"></div>
    <div class="hint-content">
      <div v-for="(hint, index) in currentHints" :key="index">
        {{ hint }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useControls } from '@/composables/useControls.js';

const { currentControlType } = useControls();

const hintsMap = {
  orbit: [
    '左键拖拽 - 旋转视角',
    '右键拖拽 - 平移',
    '滚轮 - 缩放'
  ],
  map: [
    '左键拖拽 - 平移',
    '右键拖拽 - 旋转',
    '滚轮 - 缩放'
  ],
  fly: [
    'WASD - 前后左右移动',
    'Q/E - 下降/上升',
    'Space/R - 上升',
    '方向键 - 旋转视角',
    '鼠标拖拽 - 环顾'
  ]
};

const currentModeLabel = computed(() => {
  const labels = { orbit: '轨道控制模式', map: '地图控制模式', fly: '飞行控制模式' };
  return labels[currentControlType.value] || '';
});

const currentHints = computed(() => {
  return hintsMap[currentControlType.value] || [];
});
</script>
```

---

## 7. 状态序列化格式

### 7.1 相机状态 JSON 格式

```json
{
  "position": { "x": 10.5, "y": 8.2, "z": 12.0 },
  "rotation": { "x": -0.3, "y": 0.5, "z": 0 },
  "quaternion": { "x": 0.1, "y": 0.2, "z": 0.05, "w": 0.97 },
  "sphericalCoords": { "radius": 18.5, "phi": 1.2, "theta": 0.8 },
  "target": { "x": 0, "y": 0, "z": 0 }
}
```

### 7.2 漫游路径 JSON 格式

```json
{
  "pathName": "default",
  "navigations": [
    {
      "name": "入口视角",
      "state": {
        "position": { "x": 10, "y": 5, "z": 10 },
        "rotation": { "x": -0.4, "y": 0.6, "z": 0 },
        "target": { "x": 0, "y": 0, "z": 0 }
      },
      "timestamp": 1713081600000
    }
  ]
}
```

---

## 8. 性能优化

### 8.1 动画优化

```javascript
// 使用 requestAnimationFrame 而非 setInterval
// 确保动画与渲染帧同步

// 动画中断机制
function cancelCurrentAnimation() {
  if (currentAnimation) {
    currentAnimation.cancel();
    currentAnimation = null;
  }
}
```

### 8.2 控制器切换优化

```javascript
// 使用 setTimeout 延迟同步，避免状态竞争
function forceSyncControls() {
  setTimeout(() => {
    if (controlsInstance.value) {
      controlsInstance.value.update();
    }
    isLocked.value = false;
  }, 0);
}
```

### 8.3 内存管理

```javascript
// 控制器销毁时清理所有资源
function disposeController() {
  if (controlsInstance.value) {
    controlsInstance.value.dispose();
    controlsInstance.value = null;
  }
}
```

---

## 9. 错误处理

### 9.1 控制器切换错误

```javascript
async function switchControls(type) {
  try {
    // ... 切换逻辑
  } catch (error) {
    console.error(`控制器切换到 ${type} 失败:`, error);
    
    // 回退到默认控制器
    if (currentControlType.value !== 'orbit') {
      await switchControls('orbit');
    }
    
    throw error;
  }
}
```

### 9.2 预设位置不存在

```javascript
function loadPresetPosition(name) {
  const preset = DEFAULT_CAMERA_POS[name];
  if (!preset) {
    console.warn(`预设视角 "${name}" 不存在，使用默认视角`);
    loadPresetPosition('isometric');
    return;
  }
  // ...
}
```

---

## 10. 测试策略

### 10.1 单元测试

```javascript
describe('useCameraPosState', () => {
  test('捕获相机状态', () => {
    const { captureCameraState } = useCameraPosState();
    const state = captureCameraState();
    
    expect(state.position).toBeDefined();
    expect(state.target).toBeDefined();
    expect(state.quaternion).toBeDefined();
  });
  
  test('加载预设位置', () => {
    const { loadPresetPosition } = useCameraPosState();
    
    loadPresetPosition('top');
    // 验证相机位置已更新
  });
});

describe('FlyControls', () => {
  test('键盘移动', () => {
    const controls = new FlyControls(camera, domElement);
    
    // 模拟 W 键按下
    controls.inputManager.emit('keydown', { code: 'KeyW' });
    controls.update(0.016);
    
    // 验证相机位置变化
    expect(camera.position.z).toBeLessThan(0);
  });
});
```

### 10.2 集成测试

```javascript
describe('Camera Integration', () => {
  test('控制器热切换', async () => {
    const { switchControls, currentControlType } = useControls();
    
    await switchControls('fly');
    expect(currentControlType.value).toBe('fly');
    
    await switchControls('orbit');
    expect(currentControlType.value).toBe('orbit');
  });
  
  test('平滑过渡动画', async () => {
    const { flyToPos } = useCameraPosState();
    const startPos = camera.position.clone();
    
    flyToPos({ x: 10, y: 10, z: 10 }, { x: 0, y: 0, z: 0 });
    
    // 等待动画完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    expect(camera.position.distanceTo(new THREE.Vector3(10, 10, 10))).toBeLessThan(0.1);
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
    "three-viewport-gizmo": "^1.0.0"
  }
}
```

### 11.2 内部依赖

```
useControls → useThreeViewer, useEditorConfig
useCameraPosState → useThreeViewer, useControls
useNavigationsState → useCameraPosState
FlyControls → InputManager
ViewportControls → useControls, useCameraPosState
CubeViewportControls → useThreeViewer
InteractionHints → useControls
```

---

## 相关文档

- [模块规格](./spec.md)
- [架构设计](../ARCHITECTURE.md)
- [核心引擎模块](../001-core/plan.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始技术方案 |
